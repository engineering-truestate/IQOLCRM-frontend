import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { useParams } from 'react-router'
import useAuth from '../../hooks/useAuth'
import { toast } from 'react-toastify'
import { getUnixDateTime } from '../helper/getUnixDateTime'
import { useLeadDetails } from '../../hooks/canvas_homes/useLeadDetails'
import { taskService } from '../../services/canvas_homes/taskService'
import { leadService } from '../../services/canvas_homes/leadService'
import { enquiryService } from '../../services/canvas_homes/enquiryService'

interface TaskCompleteModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    stage?: string
    state?: string
    leadStatus?: string
    taskType?: string
}

const TaskCompleteModal: React.FC<TaskCompleteModalProps> = ({
    isOpen,
    onClose,
    title = 'Task Complete',
    stage,
    state = 'open',
    leadStatus = 'Interested',
    taskType,
}) => {
    const taskId = useSelector((state: RootState) => state.taskId.taskId || '')
    const enquiryId = useSelector((state: RootState) => state.taskId.enquiryId || '')
    const { user } = useAuth()
    const { leadId } = useParams()
    const { refreshData, setSelectedEnquiryId, leadData } = useLeadDetails(leadId || '')

    // Set selected enquiry ID when component mounts
    React.useEffect(() => {
        if (enquiryId) {
            setSelectedEnquiryId(enquiryId)
        }
    }, [enquiryId, setSelectedEnquiryId])

    const agentId = user?.uid || ''
    const agentName = user?.displayName || ''

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        tag: 'Cold',
        note: '',
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
        if (!enquiryId || !leadId || !taskId) {
            toast.error('Required IDs are missing')
            return
        }

        setIsLoading(true)

        try {
            const currentTimestamp = getUnixDateTime()

            // Update enquiry using service
            await enquiryService.update(enquiryId, {
                state: state,
                stage: stage,
                leadStatus: leadStatus,
                tag: formData.tag.toLowerCase(),
                lastModified: currentTimestamp,
            })

            // Add Task Execution activity to enquiry
            await enquiryService.addActivity(enquiryId, {
                activityType: 'Task Execution',
                timestamp: currentTimestamp,
                agentName: agentName,
                data: {
                    taskType: taskType || 'Task',
                    leadStatus: leadStatus,
                    tag:
                        leadData.tag?.toLowerCase() !== formData.tag?.toLowerCase()
                            ? [leadData.tag?.toLowerCase(), formData.tag?.toLowerCase()]
                            : [formData.tag?.toLowerCase()],
                    note: formData.note.trim() || '',
                },
            })

            // Add note to enquiry if provided
            if (formData.note.trim()) {
                await enquiryService.addNote(enquiryId, {
                    note: formData.note.trim(),
                    timestamp: currentTimestamp,
                    agentName,
                    agentId,
                    taskType: taskType || 'Task',
                })
            }

            // Update lead using service
            await leadService.update(leadId, {
                state: state,
                stage: stage,
                leadStatus: leadStatus,
                tag: formData.tag.toLowerCase(),
                lastModified: currentTimestamp,
            })

            // Update task using service
            await taskService.update(taskId, {
                status: 'complete',
                completionDate: currentTimestamp,
            })

            // Refresh data after all operations complete
            await refreshData()

            toast.success('Task completed successfully!')
            onClose()

            // Reset form
            setFormData({
                tag: 'Cold',
                note: '',
            })
        } catch (error: any) {
            console.error('Error completing task:', error)
            toast.error(error.message || 'Failed to complete task')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        if (isLoading) return

        setFormData({
            tag: 'Cold',
            note: '',
        })
        onClose()
    }

    const handleModalClick = (e: React.MouseEvent) => {
        if (isLoading) return
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
                        disabled={isLoading}
                        className={`text-gray-400 hover:text-gray-600 text-xl font-bold w-6 h-6 flex items-center justify-center transition-colors ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className='p-4 space-y-4'>
                    {/* Loading indicator */}
                    {isLoading && (
                        <div className='bg-blue-50 border border-blue-200 p-3 rounded-md'>
                            <div className='flex items-center gap-2 text-blue-700'>
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                                <span className='text-sm font-medium'>Completing task...</span>
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
                                value={leadStatus}
                                disabled
                                className='w-full px-2 py-2 border border-gray-300 rounded-md text-xs bg-gray-100 text-gray-500'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Tag</label>
                            <select
                                value={formData.tag}
                                onChange={(e) => handleInputChange('tag', e.target.value)}
                                disabled={isLoading}
                                className='w-full px-2 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
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
                            disabled={isLoading}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className='flex justify-end gap-3 p-4 border-t border-gray-200'>
                    <button
                        onClick={handleDiscard}
                        disabled={isLoading}
                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                    >
                        {isLoading && <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>}
                        {isLoading ? 'Completing...' : 'Complete Task'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TaskCompleteModal
