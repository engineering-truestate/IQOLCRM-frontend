import React, { useState } from 'react'
import Dropdown from './Dropdown'
import CloseLeadModal from '../CloseLeadModal'
import RescheduleEventModal from '../RescheduleEventModal'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { enquiryService } from '../../../services/canvas_homes'

interface RootState {
    taskId: {
        taskId: string
        enquiryId: string
    }
}

interface BookingAmountTaskProps {
    taskId: string
    updateTaskState: (taskId: string, field: string, value: any) => void
    getTaskState: (taskId: string, field: string) => any
    setActiveTab?: (tab: string) => void
    onTaskStatusUpdate?: (taskId: string, status: string, result?: string) => Promise<void>
    onUpdateEnquiry?: (data: any) => Promise<void>
    onUpdateLead?: (data: any) => Promise<void>
    onAddNote?: (data: any) => Promise<void>
    onUpdateTask?: (taskId: string, data: any) => Promise<void>
    agentId?: string
    agentName?: string
}

const BookingAmountTask: React.FC<BookingAmountTaskProps> = ({
    taskId,
    updateTaskState,
    getTaskState,
    setActiveTab,
    onTaskStatusUpdate,
    onUpdateEnquiry,
    onUpdateLead,
    onAddNote,
    onUpdateTask,
    agentId,
    agentName,
}) => {
    // Modal state
    const [isCloseLeadModalOpen, setIsCloseLeadModalOpen] = useState(false)
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
    const [isChangePropertyModalOpen, setIsChangePropertyModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Redux and router hooks
    const enquiryId = useSelector((state: RootState) => state.taskId.enquiryId)
    const { leadId } = useParams()
    const bookingStatus = getTaskState(taskId, 'bookingStatus') || 'unsuccessful'
    const isUnsuccessful = bookingStatus === 'unsuccessful'
    // Task state
    /**
     * Handle successful booking
     */
    const handleSuccessfulClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsLoading(true)

        try {
            // 1. Update the task status
            if (onTaskStatusUpdate) {
                await onTaskStatusUpdate(taskId, 'complete')
            }

            if (onUpdateTask) {
                await onUpdateTask(taskId, {
                    taskResult: 'booking_successful',
                    status: 'complete',
                    lastModified: Date.now(),
                    completionDate: Date.now(),
                })
            }

            // 2. Update enquiry with new status, stage, and tag
            const enquiryUpdateData = {
                status: 'closed',
                stage: 'booking confirmed',
                tag: null,
                lastModified: Date.now(),
            }

            if (onUpdateEnquiry) {
                await onUpdateEnquiry(enquiryUpdateData)
            } else if (enquiryId) {
                await enquiryService.update(enquiryId, enquiryUpdateData)
                console.log('Enquiry updated with booking confirmed')
            }

            // 3. Update lead with new status, stage, and tag
            const leadUpdateData = {
                leadStatus: 'closed',
                leadState: 'closed',
                stage: 'booking confirmed',
                tag: null,
                lastModified: Date.now(),
            }

            if (onUpdateLead) {
                await onUpdateLead(leadUpdateData)
            }

            // 4. Show success message
            alert('Booking successful! Lead has been closed.')
        } catch (error) {
            console.error('Error updating booking successful:', error)
            alert('Failed to update booking status. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Options for "Not Connected" dropdown
    const notConnectedOptions = [
        { label: 'Reschedule Task', value: 'reschedule_task' },
        { label: 'Close Lead', value: 'close_lead' },
    ]

    /**
     * Handle "Not Connected" dropdown selection
     */
    const handleNotConnectedAction = (value: string) => {
        switch (value) {
            case 'reschedule_task':
                setIsRescheduleModalOpen(true)
                break
            case 'close_lead':
                setIsCloseLeadModalOpen(true)
                break
        }
    }

    /**
     * Handle actions when booking is unsuccessful
     */
    const handleUnsuccessfulAction = (action: string) => {
        switch (action) {
            case 'change_property':
                setIsChangePropertyModalOpen(true)
                break
            case 'collect_requirement':
                if (setActiveTab) {
                    setActiveTab('Requirements')
                }
                break
            case 'close_lead':
                setIsCloseLeadModalOpen(true)
                break
        }
    }

    /**
     * Close lead with the provided form data
     */
    const handleCloseLead = async (formData: any) => {
        setIsLoading(true)

        try {
            // Update task with booking unsuccessful result and reason
            if (onTaskStatusUpdate) {
                await onTaskStatusUpdate(taskId, 'complete', 'booking_unsuccessful')
            }

            if (onUpdateTask) {
                await onUpdateTask(taskId, {
                    taskResult: 'booking_unsuccessful',
                    status: 'complete',
                    taskReason: formData.reason,
                    lastModified: Date.now(),
                })
            }

            // Update enquiry status and tag
            if (onUpdateEnquiry) {
                await onUpdateEnquiry({
                    status: formData.leadStatus,
                    tag: formData.tag.toLowerCase(),
                    stage: 'closed',
                })
            }

            // Update lead status, state, and tag
            if (onUpdateLead) {
                await onUpdateLead({
                    leadStatus: 'closed',
                    leadState: 'closed',
                    tag: formData.tag.toLowerCase(),
                    lastModified: Date.now(),
                })
            }

            // Add note with booking task type
            if (onAddNote && formData.note?.trim()) {
                await onAddNote({
                    agentId: agentId || 'system',
                    agentName: agentName || 'System',
                    TaskType: 'booking',
                    note: formData.note,
                })
            }

            console.log('Lead closed successfully with data:', formData)
            alert('Lead closed successfully!')
        } catch (error) {
            console.error('Error closing lead:', error)
            alert('Failed to close lead. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Reschedule task with the provided form data
     */
    const handleReschedule = async (formData: any) => {
        setIsLoading(true)

        try {
            // Create reschedule history entry
            const rescheduleEntry = {
                timestamp: Date.now(),
                reason: formData.reason,
                eventName: formData.eventName,
                originalDate: new Date().toISOString(),
                newDate: formData.date,
                newTime: formData.time,
                agentId: agentId || 'system',
                agentName: agentName || 'System',
            }

            // Update task with reschedule information
            if (onUpdateTask) {
                await onUpdateTask(taskId, {
                    rescheduleHistory: rescheduleEntry,
                    scheduledDate: new Date(`${formData.date}T${formData.time}`).getTime(),
                    lastModified: Date.now(),
                })
            }

            console.log('Task rescheduled with data:', formData)
            alert('Task rescheduled successfully!')
        } catch (error) {
            console.error('Error rescheduling task:', error)
            alert('Failed to reschedule task. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Change property with the provided form data
     */
    const handleChangeProperty = async (formData: any) => {
        setIsLoading(true)

        try {
            console.log('Changing property with data:', formData)
            // Implement property change logic here
            alert('Property changed successfully!')
        } catch (error) {
            console.error('Error changing property:', error)
            alert('Failed to change property. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className='space-y-4'>
                {/* Action buttons */}
                <div className='flex gap-3'>
                    {/* Successful button */}
                    <button
                        onClick={handleSuccessfulClick}
                        disabled={isLoading}
                        className={`flex items-center h-8 w-33.5 justify-center p-2 border border-gray-300 rounded-sm bg-[#40A42B] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer transition-opacity ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                        }`}
                    >
                        {isLoading ? (
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                        ) : (
                            'Successful'
                        )}
                    </button>

                    {/* Not connected dropdown */}
                    <div className='relative'>
                        <Dropdown
                            options={notConnectedOptions}
                            onSelect={handleNotConnectedAction}
                            disabled={isLoading}
                            triggerClassName={`flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#F02532] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer transition-opacity ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                            }`}
                            placeholder='Not Connected'
                            menuClassName='absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto min-w-[150px]'
                            optionClassName='py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                        />

                        {/* Unsuccessful booking options */}
                        {isUnsuccessful && !isLoading && (
                            <div className='absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[150px]'>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleUnsuccessfulAction('change_property')
                                    }}
                                    className='py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-200'
                                >
                                    Change Property
                                </div>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleUnsuccessfulAction('collect_requirement')
                                    }}
                                    className='py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-200'
                                >
                                    Collect Requirement
                                </div>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleUnsuccessfulAction('close_lead')
                                    }}
                                    className='py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                                >
                                    Close Lead
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading indicator */}
                {isLoading && (
                    <div className='flex items-center gap-2 text-sm text-blue-600'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                        <span>Processing...</span>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CloseLeadModal
                isOpen={isCloseLeadModalOpen}
                onClose={() => !isLoading && setIsCloseLeadModalOpen(false)}
                onCloseLead={handleCloseLead}
                loading={isLoading}
            />

            <RescheduleEventModal
                isOpen={isRescheduleModalOpen}
                onClose={() => !isLoading && setIsRescheduleModalOpen(false)}
                onReschedule={handleReschedule}
                loading={isLoading}
            />
        </>
    )
}

export default BookingAmountTask
