import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getUnixDateTime, getUnixDateTimeCustom } from '../helper/getUnixDateTime'
import useAuth from '../../hooks/useAuth'
import type { AppDispatch } from '../../store'
import { clearTaskId } from '../../store/reducers/canvas-homes/taskIdReducer'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { leadService } from '../../services/canvas_homes/leadService'
import { taskService } from '../../services/canvas_homes/taskService'
import { UseLeadDetails } from '../../hooks/canvas_homes/useLeadDetails'
import Dropdown from '../design-elements/Dropdown'

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
    refreshData?: () => void
}

const RescheduleEventModal: React.FC<RescheduleEventModalProps> = ({
    isOpen,
    onClose,
    taskType,
    taskState = '',
    refreshData,
}) => {
    // State management
    const [formData, setFormData] = useState({
        reason: '',
        eventName: '',
        datetime: '',
        leadStatus: '',
        note: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Redux and route params
    const { taskId, enquiryId } = useSelector((state: RootState) => state.taskId)
    const { leadId } = useParams()
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useAuth()
    const { leadData } = UseLeadDetails(leadId || '')

    // Agent details from auth
    const agentId = user?.uid || ''
    const agentName = user?.displayName || ''

    // Determine leadStatus based on taskType and taskState
    const getLeadStatus = React.useCallback(() => {
        if (taskType === 'site visit' && taskState === 'not visited') {
            return formData.eventName === 'visit scheduled' ? 'interested' : 'follow up'
        } else if (taskType === 'initial contact' && taskState === 'connected') {
            return formData.eventName === 'visit scheduled' ? 'interested' : 'follow up'
        } else if (taskType === 'initial contact' && taskState === 'not connected') {
            return formData.eventName === 'visit scheduled' ? 'interested' : 'follow up'
        } else if (taskType === 'eoi collection' && taskState === 'eoi not collected') {
            return formData.eventName === 'visit scheduled' ? 'interested' : 'follow up'
        }
        return 'follow up'
    }, [taskType, taskState, formData.eventName])

    // Get stage based on task type and state
    const getStage = () => {
        if (taskType === 'initial contact' && taskState === 'connected') {
            return 'initial contacted'
        } else if (taskType === 'initial contact' && taskState === 'not connected') {
            return leadData?.stage
        }
        return null
    }

    // Options
    const reasonOptions = [
        { value: 'rnr', label: 'Ring No Response' },
        { value: 'client requested callback later', label: 'Client Requested Callback Later' },
        { value: 'needs time for family discussion', label: 'Needs Time for Family Discussion' },
        { value: 'client missed site visit', label: 'Client Missed Site Visit' },
        { value: 'eoi not collected', label: 'EOI Not Collected' },
        { value: 'other', label: 'Others' },
    ]

    const eventNameOptions = [
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
    }, [formData.eventName, taskType, taskState, getLeadStatus])

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
            setIsLoading(true)
            setError(null)

            const currentTimestamp = getUnixDateTime()
            const scheduledTimestamp = getUnixDateTimeCustom(formData.datetime)
            const leadStatus = getLeadStatus()
            const stage = getStage()

            // Get open tasks for the enquiry
            const openTasks = await taskService.getOpenByEnquiryId(enquiryId)
            const remainingOpenTasks = openTasks

            // Prepare the data for updating task, enquiry, lead, and adding activities
            const taskUpdateData = {
                eventName: formData.eventName,
                lastModified: currentTimestamp,
                scheduledDate: scheduledTimestamp,
                status: 'open' as 'open' | 'complete',
            }

            const enquiryUpdateData = {
                leadStatus: leadStatus,
                lastModified: currentTimestamp,
                ...(stage && { stage: stage }),
            }

            const taskExecutionActivity = {
                activityType: 'task execution',
                timestamp: currentTimestamp,
                agentName: agentName,
                data: {
                    taskType: taskType,
                    leadStatus: leadStatus,
                    tag: leadData?.tag,
                    reason: formData.reason,
                    note: formData.note.trim() || '',
                },
            }

            // Prepare the note update if provided
            const noteUpdate = formData.note.trim()
                ? enquiryService.addNote(enquiryId, {
                      timestamp: currentTimestamp,
                      agentId,
                      agentName,
                      note: `${formData.note.trim()}`,
                      taskType: taskType,
                  })
                : Promise.resolve()

            // Determine lead update data based on remaining tasks
            let leadUpdateData = {
                leadStatus: leadStatus as
                    | 'interested'
                    | 'follow up'
                    | 'closed'
                    | 'not interested'
                    | 'not connected'
                    | 'visit unsuccessful'
                    | 'visit dropped'
                    | 'eoi dropped'
                    | 'booking dropped'
                    | 'requirement collected'
                    | null
                    | undefined,
                lastModified: currentTimestamp,
                scheduledDate: scheduledTimestamp,
                taskType: taskType,
                ...(stage && { stage: stage }),
            }

            // If there are other open tasks, check if any has an earlier scheduled date
            if (remainingOpenTasks.length > 0) {
                const earliestTask = remainingOpenTasks[0]

                if (earliestTask.added) {
                    // If another task has an earlier date, use its data for the lead
                    leadUpdateData = {
                        leadStatus: leadStatus as any,
                        lastModified: currentTimestamp,
                        taskType: earliestTask.taskType,
                        scheduledDate: earliestTask.scheduledDate,
                        ...(stage && { stage: stage }),
                    }
                }
            }

            // Execute all updates in parallel
            await Promise.all([
                taskService.update(taskId, taskUpdateData),
                enquiryService.update(enquiryId, enquiryUpdateData),
                enquiryService.addActivity(enquiryId, taskExecutionActivity),
                noteUpdate, // Optional note update
                leadService.update(leadId, leadUpdateData),
            ])

            dispatch(clearTaskId())
            if (refreshData) {
                refreshData()
            }

            toast.success('Event rescheduled successfully!')
            onClose()
        } catch (err) {
            console.error('Error rescheduling event:', err)
            toast.error('Error rescheduling event: ' + (err instanceof Error ? err.message : String(err)))
            setError('Failed to reschedule. Please try again.')
        } finally {
            setIsLoading(false)
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

    if (!isOpen) return null

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed inset-0 bg-black opacity-66 z-40' onClick={!isLoading ? onClose : undefined} />

            {/* Modal Container */}
            <div
                className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[589px] bg-white z-50 rounded-2xl shadow-2xl'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between py-6 px-10'>
                        <h2 className='text-xl font-semibold text-gray-900'>Reschedule Event</h2>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className='p-1 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50'
                        >
                            <svg
                                width='20'
                                height='21'
                                viewBox='0 0 20 21'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M10.0013 18.8337C14.5846 18.8337 18.3346 15.0837 18.3346 10.5003C18.3346 5.91699 14.5846 2.16699 10.0013 2.16699C5.41797 2.16699 1.66797 5.91699 1.66797 10.5003C1.66797 15.0837 5.41797 18.8337 10.0013 18.8337Z'
                                    stroke='#515162'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M7.64062 12.8583L12.3573 8.1416'
                                    stroke='#515162'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M12.3573 12.8583L7.64062 8.1416'
                                    stroke='#515162'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className='px-10 pt-0'>
                        <div className='space-y-4'>
                            {/* Error Message */}
                            {error && (
                                <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm'>
                                    {error}
                                </div>
                            )}

                            {/* Reason Field */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Reason<span className='text-red-500'> *</span>
                                </label>
                                <Dropdown
                                    options={reasonOptions}
                                    onSelect={(value) => handleInputChange('reason', value)}
                                    defaultValue={formData.reason}
                                    placeholder='Select Reason'
                                    className='w-full relative inline-block'
                                    triggerClassName={`relative w-full h-8 px-3 py-2.5 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                        formData.reason ? '[&>span]:text-black' : ''
                                    }`}
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Event Name, Date/Time, and Lead Status Row */}
                            <div className='grid grid-cols-3 gap-4'>
                                {/* Event Name */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Event Name<span className='text-red-500'> *</span>
                                    </label>
                                    <Dropdown
                                        options={eventNameOptions}
                                        onSelect={(value) => handleInputChange('eventName', value)}
                                        defaultValue={formData.eventName}
                                        placeholder='Select Event '
                                        className='w-full relative inline-block'
                                        triggerClassName={`relative w-full h-8 px-3 py-2.5 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                            formData.eventName ? '[&>span]:text-black' : ''
                                        }`}
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                        optionClassName='px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Date and Time */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Date and Time<span className='text-red-500'> *</span>
                                    </label>
                                    <input
                                        type='datetime-local'
                                        value={formData.datetime}
                                        onChange={(e) => handleInputChange('datetime', e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
                                        disabled={isLoading}
                                        className='w-full h-8 px-3 py-3 border text-gray-500 border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50'
                                    />
                                </div>

                                {/* Lead Status */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Lead Status</label>
                                    <input
                                        type='text'
                                        value={
                                            formData.leadStatus
                                                ? formData.leadStatus.charAt(0).toUpperCase() +
                                                  formData.leadStatus.slice(1)
                                                : 'Status'
                                        }
                                        disabled
                                        className='w-full px-4 py-1 border text-sm border-gray-300 rounded-sm text-gray-500 bg-gray-50'
                                    />
                                </div>
                            </div>

                            {/* Note Textarea */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Add Note (Optional)
                                </label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => handleInputChange('note', e.target.value)}
                                    rows={4}
                                    disabled={isLoading}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-black focus:ring-0'
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='p-6 mt-4 flex items-center justify-center gap-4'>
                        <button
                            onClick={handleDiscard}
                            disabled={isLoading}
                            className='px-6 py-2 w-30 text-gray-600 bg-gray-200 rounded-sm hover:text-gray-800 hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !formData.reason || !formData.eventName || !formData.datetime}
                            className='px-6 py-2 w-auto bg-blue-500 text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                            {isLoading && (
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                            )}
                            {isLoading ? 'Saving...' : 'Reschedule an event'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RescheduleEventModal
