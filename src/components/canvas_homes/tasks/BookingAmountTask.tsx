import React, { useState } from 'react'
import Dropdown from './Dropdown'
import CloseLeadModal from '../CloseLeadModal'
import RescheduleEventModal from '../RescheduleEventModal'
import ChangePropertyModal from '../ChangePropertyModal'

const BookingAmountTask = ({
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
    const [isCloseLeadModalOpen, setIsCloseLeadModalOpen] = useState(false)
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
    const [isChangePropertyModalOpen, setIsChangePropertyModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const bookingStatus = getTaskState(taskId, 'bookingStatus')
    const isUnsuccessful = bookingStatus === 'unsuccessful'

    const handleSuccessfulClick = async (e) => {
        e.stopPropagation()
        setIsLoading(true)

        try {
            // Update local state
            updateTaskState(taskId, 'bookingStatus', 'successful')

            // Update task status to complete with successful result
            if (typeof onTaskStatusUpdate === 'function') {
                await onTaskStatusUpdate(taskId, 'complete', 'booking_successful')
            }

            // Update task result
            if (typeof onUpdateTask === 'function') {
                await onUpdateTask(taskId, {
                    taskResult: 'booking_successful',
                    status: 'complete',
                    lastModified: Date.now(),
                })
            }

            // Update enquiry stage
            if (typeof onUpdateEnquiry === 'function') {
                await onUpdateEnquiry({
                    stage: 'booking_confirmed',
                })
            }

            // Update lead stage
            if (typeof onUpdateLead === 'function') {
                await onUpdateLead({
                    stage: 'booking_confirmed',
                    leadStatus: 'booking_confirmed',
                    lastModified: Date.now(),
                })
            }

            console.log('Booking successful - all updates completed')
        } catch (error) {
            console.error('Error updating booking successful:', error)
            alert('Failed to update booking status. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const notConnectedOptions = [
        { label: 'Reschedule Task', value: 'reschedule_task' },
        { label: 'Close Lead', value: 'close_lead' },
    ]

    const handleNotConnectedAction = (value) => {
        switch (value) {
            case 'reschedule_task':
                setIsRescheduleModalOpen(true)
                break
            case 'close_lead':
                setIsCloseLeadModalOpen(true)
                break
        }
    }

    const handleUnsuccessfulAction = (action) => {
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

    const handleCloseLead = async (formData) => {
        setIsLoading(true)

        try {
            // Update task with booking unsuccessful result and reason
            if (typeof onTaskStatusUpdate === 'function') {
                await onTaskStatusUpdate(taskId, 'complete', 'booking_unsuccessful')
            }

            if (typeof onUpdateTask === 'function') {
                await onUpdateTask(taskId, {
                    taskResult: 'booking_unsuccessful',
                    status: 'complete',
                    taskReason: formData.reason,
                    lastModified: Date.now(),
                })
            }

            // Update enquiry status and tag
            if (typeof onUpdateEnquiry === 'function') {
                await onUpdateEnquiry({
                    status: formData.leadStatus,
                    tag: formData.tag.toLowerCase(),
                    stage: 'closed',
                })
            }

            // Update lead status, state, and tag
            if (typeof onUpdateLead === 'function') {
                await onUpdateLead({
                    leadStatus: 'closed',
                    leadState: 'closed',
                    tag: formData.tag.toLowerCase(),
                    lastModified: Date.now(),
                })
            }

            // Add note with booking task type
            if (typeof onAddNote === 'function' && formData.note.trim()) {
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

    const handleReschedule = async (formData) => {
        setIsLoading(true)

        try {
            // Add reschedule history to task
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

            if (typeof onUpdateTask === 'function') {
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

    const handleChangeProperty = async (formData) => {
        setIsLoading(true)

        try {
            console.log('Changing property with data:', formData)
            // Handle change property logic here
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
                <div className='flex gap-3'>
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

            <ChangePropertyModal
                isOpen={isChangePropertyModalOpen}
                onClose={() => !isLoading && setIsChangePropertyModalOpen(false)}
                onChangeProperty={handleChangeProperty}
                loading={isLoading}
            />
        </>
    )
}

export default BookingAmountTask
