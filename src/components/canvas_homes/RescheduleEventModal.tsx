import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'
import { getUnixDateTime, getUnixDateTimeCustom } from '../helper/getUnixDateTime'
import useAuth from '../../hooks/useAuth'
import type { AppDispatch } from '../../store'
import { clearTaskId } from '../../store/reducers/canvas-homes/taskIdReducer'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { leadService } from '../../services/canvas_homes'
import { taskService } from '../../services/canvas_homes'

interface RootState {
    taskId: {
        taskId: string
        enquiryId: string
    }
}

interface Note {
    timestamp: number
    agentId: string
    agentName: string
    note: string
    taskType: string
}

interface RescheduleEventModalProps {
    isOpen: boolean
    onClose: () => void
    taskType: string
    taskData?: any
    enquiryData?: any
    leadData?: any
}

const RescheduleEventModal: React.FC<RescheduleEventModalProps> = ({
    isOpen,
    onClose,
    taskType,
    taskData = {},
    enquiryData = {},
    leadData = {},
}) => {
    // State management
    const [formData, setFormData] = useState({
        reason: '',
        eventName: '',
        date: '',
        time: '',
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

    // Agent details from auth
    const agentId = user?.uid || 'Agent001'
    const agentName = user?.displayName || 'Agent Name'

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

    const leadStatusOptions = [
        { value: '', label: 'Status' },
        { value: 'hot', label: 'Hot' },
        { value: 'warm', label: 'Warm' },
        { value: 'cold', label: 'Cold' },
        { value: 'follow_up', label: 'Follow Up' },
    ]

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setFormData({
                reason: '',
                eventName: '',
                date: '',
                time: '',
                leadStatus: '',
                note: '',
            })
            setError(null)
        }
    }, [isOpen])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async () => {
        // Validation
        if (!formData.reason || !formData.eventName || !formData.date || !formData.time) {
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

            switch (taskType) {
                case 'Site Not Visit':
                    leadData = {
                        ...leadData,
                        leadStatus: formData.eventName === 'Site Visit' ? 'Interested' : 'Follow Up',
                    }
                    break
                case 'Initial Contact - Connected':
                    leadData = {
                        ...leadData,
                        leadStatus: 'Follow Up',
                        stage: 'Initial Contacted',
                    }
                    break
                case 'Initial Contact - Not Connected':
                    leadData = {
                        ...leadData,
                        leadStatus: 'Follow Up',
                        stage: 'Lead Registered',
                    }
                    break
                case 'EOI Not Collected':
                    leadData = {
                        ...leadData,
                        leadStatus: formData.eventName === 'Site Visit' ? 'Interested' : 'Follow Up',
                    }
                    break
                default:
                    break
            }

            // 1. Update task details
            const taskUpdateData = {
                ...taskData,
                eventName: formData.eventName,
                lastModified: getUnixDateTime(),
                scheduledDate: getUnixDateTimeCustom(`${formData.date}T${formData.time}`),
            }
            await taskService.update(taskId, taskUpdateData)
            // 2. Add note if provided
            if (formData.note.trim()) {
                try {
                    const noteData: Note = {
                        timestamp: getUnixDateTime(),
                        agentId,
                        agentName,
                        note: `Event rescheduled - ${formData.note.trim()}`,
                        taskType: taskType,
                    }

                    const currentEnquiry = await enquiryService.getById(enquiryId)
                    const updatedNotes = [...(currentEnquiry?.notes || []), noteData]

                    await enquiryService.update(enquiryId, {
                        ...enquiryData,
                        notes: updatedNotes,
                        leadStatus: leadData.leadStatus,
                        lastModified: getUnixDateTime(),
                    })
                } catch (noteError) {
                    toast.error(
                        'Error adding note: ' + (noteError instanceof Error ? noteError.message : String(noteError)),
                    )
                }
            }

            // 3. Update lead with new status
            const leadUpdateData = {
                ...leadData,
                lastModified: getUnixDateTime(),
            }

            await leadService.update(leadId, leadUpdateData)

            // 5. Show success message and close modal
            dispatch(clearTaskId())
            toast.success('Event rescheduled successfully!')
            onClose()
        } catch (err) {
            toast.error('Error rescheduling event')
            setError('Failed to reschedule. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDiscard = () => {
        setFormData({
            reason: '',
            eventName: '',
            date: '',
            time: '',
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
        <>
            {/* Modal Overlay */}
            <div
                className='fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center'
                onClick={handleOverlayClick}
            >
                {/* Modal Container */}
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
                                className='p-1 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center'
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
                                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white disabled:opacity-50'
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
                                            className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs appearance-none bg-white disabled:opacity-50'
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

                                {/* Date and Time */}
                                <div>
                                    <label className='block text-sm font-medium mb-2 text-gray-700'>
                                        Date and Time
                                    </label>
                                    <div className='space-y-2'>
                                        <input
                                            type='date'
                                            value={formData.date}
                                            onChange={(e) => handleInputChange('date', e.target.value)}
                                            disabled={isSaving}
                                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs disabled:opacity-50'
                                        />
                                        <input
                                            type='time'
                                            value={formData.time}
                                            onChange={(e) => handleInputChange('time', e.target.value)}
                                            disabled={isSaving}
                                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs disabled:opacity-50'
                                        />
                                    </div>
                                </div>

                                {/* Lead Status */}
                                <div>
                                    <label className='block text-sm font-medium mb-2 text-gray-700'>Lead Status</label>
                                    <div className='relative'>
                                        <select
                                            value={formData.leadStatus}
                                            onChange={(e) => handleInputChange('leadStatus', e.target.value)}
                                            disabled={isSaving}
                                            className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs appearance-none bg-white disabled:opacity-50'
                                        >
                                            {leadStatusOptions.map((option) => (
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
                            </div>

                            {/* Add Note */}
                            <div>
                                <label className='block text-sm font-medium mb-2 text-gray-700'>
                                    Add Note (Optional)
                                </label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => handleInputChange('note', e.target.value)}
                                    placeholder='Add your notes here...'
                                    rows={4}
                                    disabled={isSaving}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none disabled:opacity-50'
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
                                    'Reschedule an event'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RescheduleEventModal
