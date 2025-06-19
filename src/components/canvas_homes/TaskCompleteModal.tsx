import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { useParams } from 'react-router'
import useAuth from '../../hooks/useAuth'
import { toast } from 'react-toastify'
import { getUnixDateTime } from '../helper/getUnixDateTime'
import { useLeadDetails } from '../../hooks/canvas_homes/useLeadDetails'

interface TaskCompleteModalProps {
    isOpen: boolean
    onClose: () => void
    onUpdateLead: (leadId: string, data: any) => Promise<void>
    onUpdateEnquiry: (enquiryId: string, data: any) => Promise<void>
    onTaskStatusUpdate: (taskId: string, data: any) => Promise<void>
    onUpdateTask?: (taskId: string, updates: any) => Promise<void> // Added missing function
    onAddNote: (enquiryId: string, note: any) => Promise<void>
    loading?: boolean
    title?: string
    stage?: string
    state?: string
    leadStatus?: string
    taskType?: string
}

const TaskCompleteModal: React.FC<TaskCompleteModalProps> = ({
    isOpen,
    onClose,
    onUpdateLead,
    onUpdateEnquiry,
    onUpdateTask,
    onAddNote,
    loading = false,
    title,
    stage,
    state,
    leadStatus,
    taskType,
}) => {
    const taskId = useSelector((state: RootState) => state.taskId.taskId || '')
    const enquiryId = useSelector((state: RootState) => state.taskId.enquiryId || '')
    const { user } = useAuth()
    const { leadId } = useParams()
    const { refreshData } = useLeadDetails(leadId)

    const agentId = user?.uid || ''
    const agentName = user?.displayName || ''
    const currentTimestamp = Date.now()

    const [formData, setFormData] = useState({
        tag: 'Cold',
        note: '',
        status: 'Complete',
        state,
        leadStatus,
        stage,
        leadId,
        enquiryId,
        taskId,
        agentId,
        agentName,
        timestamp: currentTimestamp,
    })

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
        try {
            const currentTimestamp = Date.now()

            if (enquiryId && leadId && taskId) {
                // Update Enquiry
                const enqData = {
                    state,
                    stage,
                    leadStatus,
                    tag: formData.tag.toLowerCase(),
                    lastModified: currentTimestamp,
                }
                await onUpdateEnquiry(enquiryId, enqData)

                // Add note if provided
                if (formData.note) {
                    const newNote = {
                        note: formData.note,
                        timestamp: getUnixDateTime(),
                        agentName,
                        agentId,
                        taskType,
                    }
                    await onAddNote(enquiryId, newNote)
                }

                // Update Lead
                const leadData = {
                    state,
                    stage,
                    leadStatus,
                    tag: formData.tag.toLowerCase(),
                    lastModified: currentTimestamp,
                }
                await onUpdateLead(leadId, leadData)

                // Update Task
                await onUpdateTask(taskId, {
                    status: 'complete',
                    completionDate: currentTimestamp,
                })
                onClose()

                setFormData((prev) => ({
                    ...prev,
                    note: '',
                    tag: 'Cold',
                    timestamp: Date.now(),
                }))
            } else {
                toast.error('Required IDs are missing')
            }
        } catch (error: any) {
            console.error('Error updating task', error)
            toast.error(error.message || 'Failed to update task')
        }
    }

    const handleDiscard = () => {
        if (loading) return
        onClose()
    }

    const handleModalClick = (e: React.MouseEvent) => {
        if (loading) return
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
                    <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className={`text-gray-400 hover:text-gray-600 text-xl font-bold w-6 h-6 flex items-center justify-center ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className='p-4 space-y-4'>
                    {loading && (
                        <div className='bg-blue-50 border border-blue-200 p-3 rounded-md'>
                            <div className='flex items-center gap-2 text-blue-700'>
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                                <span className='text-sm font-medium'>Saving</span>
                            </div>
                        </div>
                    )}

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
                                className='w-full px-2 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            >
                                {tagOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Add Note (Optional)</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => handleInputChange('note', e.target.value)}
                            placeholder='Add your notes here...'
                            rows={4}
                            disabled={loading}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className='flex justify-end gap-3 p-4 border-t border-gray-200'>
                    <button
                        onClick={handleDiscard}
                        disabled={loading}
                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2'
                    >
                        {loading && <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>}
                        {loading ? 'Saving' : 'Close Success'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TaskCompleteModal
