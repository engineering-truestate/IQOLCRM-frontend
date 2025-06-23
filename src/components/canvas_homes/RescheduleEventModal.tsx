import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'
import { getUnixDateTime, getUnixDateTimeCustom } from '../helper/getUnixDateTime'
import useAuth from '../../hooks/useAuth'
import type { AppDispatch } from '../../store'
import { clearTaskId } from '../../store/reducers/canvas-homes/taskIdReducer'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { leadService } from '../../services/canvas_homes/leadService'
import { taskService } from '../../services/canvas_homes/taskService'
import { UseLeadDetails } from '../../hooks/canvas_homes/UseLeadDetails'

interface RootState {
    taskId: {
        taskId: string
        enquiryId: string
    }
}

interface RescheduleEventModalProps {
    isOpen: boolean
    onClose: () => void
    taskType: string
    taskState?: string
}

const RescheduleEventModal: React.FC<RescheduleEventModalProps> = ({ isOpen, onClose, taskType, taskState = '' }) => {
    // State management
    const [formData, setFormData] = useState({
        reason: '',
        eventName: '',
        datetime: '',
        leadStatus: '',
        note: '',
    })
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Redux and route params
    const { taskId, enquiryId } = useSelector((state: RootState) => state.taskId)
    const { leadId } = useParams()
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useAuth()
    const { refreshData, setSelectedEnquiryId, leadData, loadLeadData } = UseLeadDetails(leadId || '')

    // Set selected enquiry ID when component mounts
    React.useEffect(() => {
        if (enquiryId) {
            setSelectedEnquiryId(enquiryId)
        }
    }, [enquiryId, setSelectedEnquiryId])

    // Agent details from auth
    const agentId = user?.uid || ''
    const agentName = user?.displayName || ''

    // Determine leadStatus based on taskType and taskState
    const getLeadStatus = () => {
        if (taskType === 'site visit' && taskState === 'not visited') {
            return formData.eventName === 'visit scheduled' ? 'interested' : 'follow up'
        } else if (taskType === 'initial contact' && taskState === 'connected') {
            return 'follow up'
        } else if (taskType === 'initial contact' && taskState === 'not connected') {
            return 'follow up'
        } else if (taskType === 'eoi collection' && taskState === 'eoi not collected') {
            return formData.eventName === 'visit scheduled' ? 'interested' : 'follow up'
        }
        return 'follow up'
    }

    // Get stage based on task type and state
    const getStage = () => {
        if (taskType === 'initial contact' && taskState === 'connected') {
            return 'initial contacted'
        } else if (taskType === 'initial contact' && taskState === 'not connected') {
            return 'lead registered'
        }
        return null
    }

    // Options
    const reasonOptions = [
        { value: '', label: 'Select reason' },
        { value: 'rnr', label: 'Ring No Response' },
        { value: 'client requested callback later', label: 'Client Requested Callback Later' },
        { value: 'needs time for family discussion', label: 'Needs Time for Family Discussion' },
        { value: 'client missed site visit', label: 'Client Missed Site Visit' },
        { value: 'eoi not collected', label: 'EOI Not Collected' },
        { value: 'other', label: 'Others' },
    ]

    const eventNameOptions = [
        { value: '', label: 'Select Event Name' },
        { value: 'visit scheduled', label: 'Site Visit' },
        { value: 'call scheduled', label: 'Schedule call' },
    ]

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setFormData({
                reason: '',
                eventName: '',
                datetime: '',
                leadStatus: '',
                note: '',
            })
            setError(null)
        }
    }, [isOpen])

    // Update leadStatus when eventName changes
    useEffect(() => {
        if (formData.eventName) {
            const newLeadStatus = getLeadStatus()
            setFormData((prev) => ({
                ...prev,
                leadStatus: newLeadStatus,
            }))
        }
    }, [formData.eventName, taskType, taskState])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async () => {
        // Validation
        if (!formData.reason || !formData.eventName || !formData.datetime) {
            setError('Please fill in all required fields')
            return
        }

        if (!taskId) {
            setError('Task ID is missing')
            return
        }

        if (!enquiryId) {
            setError('Enquiry ID is missing')
            return
        }

        if (!leadId) {
            setError('Lead ID is missing')
            return
        }

        try {
            setIsSaving(true)
            setError(null)

            const currentTimestamp = getUnixDateTime()
            const scheduledTimestamp = getUnixDateTimeCustom(formData.datetime)
            const leadStatus = getLeadStatus()
            const stage = getStage()

            // 1. Update task details
            await taskService.update(taskId, {
                eventName: formData.eventName,
                lastModified: currentTimestamp,
                scheduledDate: scheduledTimestamp,
            })

            // 2. Update enquiry with new status
            await enquiryService.update(enquiryId, {
                leadStatus: leadStatus,
                lastModified: currentTimestamp,
                ...(stage && { stage: stage }),
            })

            // 3. Add Task Execution activity for rescheduling
            await enquiryService.addActivity(enquiryId, {
                activityType: 'Task Execution',
                timestamp: currentTimestamp,
                agentName: agentName,
                data: {
                    taskType: taskType,
                    leadStatus: leadStatus,
                    tag: leadData.tag,
                    reason: formData.reason,
                    note: formData.note.trim() || '',
                },
            })

            // 4. Add note if provided
            if (formData.note.trim()) {
                await enquiryService.addNote(enquiryId, {
                    timestamp: currentTimestamp,
                    agentId,
                    agentName,
                    note: `Event rescheduled - ${formData.note.trim()}`,
                    taskType: taskType,
                })
            }

            // 5. Update lead with new status
            const leadUpdateData = {
                leadStatus: leadStatus,
                lastModified: currentTimestamp,
                scheduledDate: scheduledTimestamp,
                ...(stage && { stage: stage }),
            }

            await leadService.update(leadId, leadUpdateData)

            // 6. Refresh data and clean up
            await refreshData()
            dispatch(clearTaskId())

            toast.success('Event rescheduled successfully!')
            onClose()
        } catch (err) {
            console.error('Error rescheduling event:', err)
            toast.error('Error rescheduling event: ' + (err instanceof Error ? err.message : String(err)))
            setError('Failed to reschedule. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDiscard = () => {
        setFormData({
            reason: '',
            eventName: '',
            datetime: '',
            leadStatus: '',
            note: '',
        })
        onClose()
    }

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div
            className='fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center'
            onClick={handleOverlayClick}
        >
            <div
                className='w-full max-w-lg bg-white z-50 rounded-lg shadow-xl mx-4'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6 pb-4'>
                        <h2 className='text-xl font-semibold text-black'>Reschedule Event</h2>
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className='p-1 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
                            aria-label='Close'
                        >
                            <svg
                                width='20'
                                height='20'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='text-gray-500'
                            >
                                <line x1='18' y1='6' x2='6' y2='18'></line>
                                <line x1='6' y1='6' x2='18' y2='18'></line>
                            </svg>
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className='px-6 pb-6 space-y-6'>
                        {/* Loading indicator */}
                        {isSaving && (
                            <div className='bg-blue-50 border border-blue-200 p-3 rounded-md'>
                                <div className='flex items-center gap-2 text-blue-700'>
                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                                    <span className='text-sm font-medium'>Rescheduling event...</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className='p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm'>
                                {error}
                            </div>
                        )}

                        {/* Reason */}
                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Reason</label>
                            <div className='relative'>
                                <select
                                    value={formData.reason}
                                    onChange={(e) => handleInputChange('reason', e.target.value)}
                                    disabled={isSaving}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {reasonOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <div className='absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'>
                                    <svg
                                        className='w-4 h-4 text-gray-400'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth='2'
                                            d='M19 9l-7 7-7-7'
                                        ></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Three column grid */}
                        <div className='grid grid-cols-3 gap-4'>
                            {/* Event Name */}
                            <div>
                                <label className='block text-sm font-medium mb-2 text-gray-700'>Event Name</label>
                                <div className='relative'>
                                    <select
                                        value={formData.eventName}
                                        onChange={(e) => handleInputChange('eventName', e.target.value)}
                                        disabled={isSaving}
                                        className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {eventNameOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className='absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'>
                                        <svg
                                            className='w-3 h-3 text-gray-400'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M19 9l-7 7-7-7'
                                            ></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Date and Time (Combined) */}
                            <div>
                                <label className='block text-sm font-medium mb-2 text-gray-700'>Date and Time</label>
                                <input
                                    type='datetime-local'
                                    value={formData.datetime}
                                    onChange={(e) => handleInputChange('datetime', e.target.value)}
                                    disabled={isSaving}
                                    className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs disabled:opacity-50 disabled:cursor-not-allowed'
                                />
                            </div>

                            {/* Lead Status (Visible but disabled) */}
                            <div>
                                <label className='block text-sm font-medium mb-2 text-gray-700'>Lead Status</label>
                                <div className='relative'>
                                    <div className='w-full px-3 py-3 border border-gray-300 rounded-lg text-xs bg-white opacity-70 cursor-not-allowed flex items-center justify-between'>
                                        {formData.leadStatus
                                            ? formData.leadStatus.charAt(0).toUpperCase() + formData.leadStatus.slice(1)
                                            : 'status'}
                                        <svg
                                            className='w-3 h-3 text-gray-400 ml-2'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M19 9l-7 7-7-7'
                                            ></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add Note */}
                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Add Note (Optional)</label>
                            <textarea
                                value={formData.note}
                                onChange={(e) => handleInputChange('note', e.target.value)}
                                placeholder='Add your notes here...'
                                rows={4}
                                disabled={isSaving}
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed'
                            />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='flex items-center justify-center gap-4 p-6 pt-4'>
                        <button
                            onClick={handleDiscard}
                            disabled={isSaving}
                            className='px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className='px-6 py-3 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]'
                        >
                            {isSaving ? (
                                <>
                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                'Reschedule Event'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RescheduleEventModal
