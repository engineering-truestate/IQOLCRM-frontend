import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { useParams } from 'react-router'
import { enquiryService } from '../../services/canvas_homes'
import { leadService } from '../../services/canvas_homes'
import { taskService } from '../../services/canvas_homes'
import useAuth from '../../hooks/useAuth'
import { toast } from 'react-toastify'
import { getUnixDateTime } from '../helper/getUnixDateTime'
import { useLeadDetails } from '../../hooks/canvas_homes/useLeadDetails'

interface CloseLeadModalProps {
    isOpen: boolean
    onClose: () => void
    onCloseLead: (formData: any) => Promise<void>
    loading?: boolean
    taskState?: string | null
    taskType: string
}

const CloseLeadModal: React.FC<CloseLeadModalProps> = ({
    isOpen,
    onClose,
    onCloseLead,
    loading = false,
    taskState,
    taskType,
}) => {
    const taskIds: string = useSelector((state: RootState) => state.taskId.taskId || '')
    const enquiryId: string = useSelector((state: RootState) => state.taskId.enquiryId || '')
    const { user } = useAuth()
    const { leadId } = useParams()
    const { refreshData } = useLeadDetails(leadId)

    const agentId = user?.uid || ''
    const agentName = user?.displayName || ''
    const currentTimestamp = Date.now()

    const [formData, setFormData] = useState({
        reason: '',
        tag: 'Cold',
        note: '',
        status: 'Complete',
        state: 'dropped',
        leadStatus: '',
        stage: '',
        leadId: leadId,
        enquiryId: enquiryId,
        taskId: taskIds,
        agentId: agentId,
        agentName: agentName,
        timestamp: currentTimestamp,
    })

    // Set lead status based on taskState when modal opens
    useEffect(() => {
        if (isOpen && taskState) {
            let leadStatus = ''
            let stage = ''

            // Determine appropriate lead status based on task state
            switch (taskState) {
                case 'connected':
                    leadStatus = 'not interested'
                    stage = 'initial connected'
                    break
                case 'not connected':
                    leadStatus = 'not connected'
                    stage = 'lead registered'
                    break
                case 'site visited':
                    leadStatus = 'visit unsuccessful'
                    stage = 'site visited'
                    break
                case 'site not visited':
                    leadStatus = 'visit dropped'
                    stage = 'initial contacted'
                    break
                case 'eoi not collected':
                    leadStatus = 'eoi dropped'
                    stage = 'site visited'
                    break
                case 'booking unsuccessful':
                    leadStatus = 'booking dropped'
                    stage = 'eoi collected'
                    break
                default:
                    leadStatus = 'dropped'
            }

            setFormData((prev) => ({
                ...prev,
                leadStatus,
                stage,
                timestamp: Date.now(),
            }))
        }
    }, [isOpen, taskState, leadId, enquiryId, taskIds, agentId, agentName])

    const reasonOptions = [
        { value: '', label: 'Select reason' },
        { value: 'incorrect contact details', label: 'Incorrect Contact Details' },
        { value: 'no response after multiple follow ups', label: 'No Response After Multiple Follow-Ups' },
        { value: 'not interested', label: 'Not Interested' },
        { value: 'property not suitable', label: 'Property Not Suitable' },
        { value: 'visit dropped', label: 'Visit Dropped' },
        { value: 'eoi dropped', label: 'EOI Dropped' },
        { value: 'booking dropped', label: 'Booking Dropped' },
        { value: 'other', label: 'Other' },
    ]

    const tagOptions = [
        { value: 'Cold', label: 'Cold' },
        { value: 'Hot', label: 'Hot' },
        { value: 'Super Hot', label: 'Super Hot' },
        { value: 'Potential', label: 'Potential' },
    ]

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async () => {
        if (!formData.reason || !formData.tag) {
            toast.error('Please fill in all required fields.')
            return
        }

        try {
            const currentTimestamp = Date.now()

            if (enquiryId && leadId && taskIds) {
                // Update enquiry
                const enqData = {
                    state: 'dropped',
                    stage: formData.stage,
                    leadStatus: formData.leadStatus,
                    tag: formData.tag.toLowerCase(),
                    lastModified: currentTimestamp,
                }
                await enquiryService.update(enquiryId, enqData)

                // Add note to enquiry if provided
                if (formData.note) {
                    const newNote = {
                        note: formData.note,
                        timestamp: getUnixDateTime(),
                        agentName: agentName,
                        agentId: agentId,
                        taskType: taskType,
                    }
                    await enquiryService.addNote(enquiryId, newNote)
                }

                // Update lead
                const leadData = {
                    state: 'dropped',
                    stage: formData.stage,
                    leadStatus: formData.leadStatus,
                    tag: formData.tag.toLowerCase(),
                    lastModified: currentTimestamp,
                }
                await leadService.update(leadId, leadData)

                // Update task
                await taskService.update(taskIds, {
                    status: 'complete',
                    completionDate: currentTimestamp,
                })

                toast.success('Lead closed successfully')
                refreshData()
            } else {
                toast.error('Required IDs are missing')
            }

            onCloseLead(formData)
            onClose()

            // Reset form
            setFormData({
                reason: '',
                status: 'Complete',
                leadStatus: '',
                tag: 'Cold',
                state: 'dropped',
                note: '',
                stage: '',
                leadId: leadId,
                enquiryId: enquiryId,
                taskId: taskIds,
                agentId: agentId,
                agentName: agentName,
                timestamp: currentTimestamp,
            })
        } catch (error: any) {
            console.error('Error closing lead:', error)
            toast.error(error.message || 'Failed to close lead')
        }
    }

    const handleDiscard = () => {
        if (loading) return // Prevent closing while loading

        setFormData({
            reason: '',
            status: 'Complete',
            leadStatus: '',
            tag: 'Cold',
            state: 'dropped',
            note: '',
            stage: '',
            leadId: leadId,
            enquiryId: enquiryId,
            taskId: taskIds,
            agentId: agentId,
            agentName: agentName,
            timestamp: currentTimestamp,
        })
        onClose()
    }

    const handleModalClick = (e: React.MouseEvent) => {
        if (loading) return // Prevent closing while loading
        onClose()
    }

    if (!isOpen) return null

    return (
        <div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
            onClick={handleModalClick}
        >
            <div className='bg-white rounded-lg shadow-xl w-full max-w-md mx-4' onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-gray-200'>
                    <h2 className='text-lg font-semibold text-gray-900'>Close Lead</h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className={`text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold w-6 h-6 flex items-center justify-center ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className='p-4 space-y-4'>
                    {/* Loading indicator */}
                    {loading && (
                        <div className='bg-blue-50 border border-blue-200 p-3 rounded-md'>
                            <div className='flex items-center gap-2 text-blue-700'>
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                                <span className='text-sm font-medium'>Closing lead...</span>
                            </div>
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Reason</label>
                        <select
                            value={formData.reason}
                            onChange={(e) => handleInputChange('reason', e.target.value)}
                            disabled={loading}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {reasonOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Task Status, Lead Status, Tag Row */}
                    <div className='grid grid-cols-3 gap-3'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Task Status</label>
                            <input
                                type='text'
                                value='Complete'
                                disabled
                                className='w-full px-2 py-2 border border-gray-300 rounded-md text-xs bg-gray-100 text-gray-500'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Lead Status</label>
                            <input
                                type='text'
                                value={formData.leadStatus}
                                disabled
                                className='w-full px-2 py-2 border border-gray-300 rounded-md text-xs bg-gray-100 text-gray-500'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Tag</label>
                            <select
                                value={formData.tag}
                                onChange={(e) => handleInputChange('tag', e.target.value)}
                                disabled={loading}
                                className={`w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {tagOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Add Note */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Add Note (Optional)</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => handleInputChange('note', e.target.value)}
                            placeholder='Add your notes here...'
                            rows={4}
                            disabled={loading}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className='flex justify-end gap-3 p-4 border-t border-gray-200'>
                    <button
                        onClick={handleDiscard}
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.reason}
                        className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2 ${
                            loading || !formData.reason ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading && <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>}
                        {loading ? 'Closing...' : 'Close Lead'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CloseLeadModal
