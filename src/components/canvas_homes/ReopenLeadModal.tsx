import React, { useState } from 'react'
import { leadService } from '../../services/canvas_homes/leadService'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { taskService } from '../../services/canvas_homes/taskService'
import { getUnixDateTime } from '../helper/getUnixDateTime'
import { toast } from 'react-toastify'
import useAuth from '../../hooks/useAuth'

interface ReopenLeadModalProps {
    isOpen: boolean
    onClose: () => void
    leadId: string
    enquiryId: string
    onLeadReopen?: () => void
    agentName?: string
}

const ReopenLeadModal: React.FC<ReopenLeadModalProps> = ({
    isOpen,
    onClose,
    leadId,
    onLeadReopen,
    enquiryId,
    agentName = '',
}) => {
    const [reason, setReason] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReason(event.target.value)
        if (error) setError(null)
    }

    const validateForm = (): boolean => {
        if (!reason.trim()) {
            setError('Reason is required')
            return false
        }
        return true
    }

    const handleReopenLead = async () => {
        setError(null)

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            // Get current timestamp for consistency
            const currentTimestamp = getUnixDateTime()

            // Get current enquiry data
            const currentEnquiry = await enquiryService.getById(enquiryId)

            if (!currentEnquiry) {
                throw new Error('Enquiry not found')
            }

            // Get open tasks for this enquiry
            const openTasks = await taskService.getOpenByEnquiryId(enquiryId)

            // Update the current enquiry to 'open'
            const enquiryUpdatePromise = enquiryService.update(enquiryId, {
                state: 'open',
                lastModified: currentTimestamp,
            })

            // Prepare lead update data based on current enquiry
            const leadUpdateData = {
                state: 'open' as 'open' | 'closed' | 'fresh' | 'dropped',
                stage: currentEnquiry.stage,
                leadStatus: currentEnquiry?.leadStatus,
                propertyName: currentEnquiry.propertyName,
                propertyId: currentEnquiry.propertyId,
                rnr: currentEnquiry.rnr,
                rnrCount: currentEnquiry.rnrCount,
                tag: currentEnquiry.tag,
                lastModified: currentTimestamp,
                taskType: null as string | null,
                scheduledDate: null as number | null,
            }

            // If there are open tasks, set the earliest one
            if (openTasks.length > 0) {
                const earliestTask = openTasks[0]
                leadUpdateData.taskType = earliestTask.taskType
                leadUpdateData.scheduledDate = earliestTask.scheduledDate
            }

            const leadUpdatePromise = leadService.update(leadId, leadUpdateData)

            const addActivityPromise = enquiryService.addActivity(enquiryId, {
                activityType: 'lead reopen',
                timestamp: currentTimestamp,
                agentName: user?.displayName || null,
                data: {
                    reason: reason,
                    leadStatus: currentEnquiry.leadStatus,
                    stage: currentEnquiry.stage,
                    tag: currentEnquiry.tag,
                    propertyName: currentEnquiry.propertyName,
                },
            })

            // Run the updates in parallel
            await Promise.all([leadUpdatePromise, enquiryUpdatePromise, addActivityPromise])

            // Show success message after all operations are complete
            toast.success('Lead reopened successfully!')

            // Call the callback to refresh the lead data
            if (onLeadReopen) {
                onLeadReopen()
            }

            // Close the modal after successful operation
            handleDiscard()
        } catch (error) {
            console.error('Error reopening lead:', error)
            setError('Failed to reopen lead. Please try again.')
            toast.error('Failed to reopen lead')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        setReason('')
        setError(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed inset-0 bg-black opacity-50 z-40' onClick={!isLoading ? onClose : undefined} />

            {/* Modal Container */}
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[433px] bg-white z-50 rounded-lg shadow-2xl'>
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6'>
                        <h2 className='text-xl font-semibold text-gray-900'>Reopen Lead</h2>
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
                    <div className='px-6 pt-0'>
                        {/* Error Message */}
                        {error && (
                            <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm'>
                                {error}
                            </div>
                        )}

                        <div className='space-y-6'>
                            {/* Reason Textarea */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Reasons</label>
                                <textarea
                                    value={reason}
                                    onChange={handleInputChange}
                                    placeholder='Write here'
                                    className='w-full px-4 py-2.5 border border-gray-300 rounded-sm focus:outline-none focus:border-blue-500 text-sm resize-none'
                                    disabled={isLoading}
                                    rows={4}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='pb-6 pt-0 mt-5 flex items-center justify-center gap-4'>
                        <button
                            onClick={handleDiscard}
                            disabled={isLoading}
                            className='px-6 py-2 w-30 text-gray-600 bg-gray-200 rounded-sm hover:text-gray-800 hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleReopenLead}
                            disabled={isLoading}
                            className='px-6 py-2 w-30 bg-blue-500 whitespace-nowrap text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                            {isLoading && (
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                            )}
                            {isLoading ? 'Saving...' : 'Reopen Lead'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ReopenLeadModal
