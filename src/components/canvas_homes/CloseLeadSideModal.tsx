import React, { useState } from 'react'
import { leadService } from '../../services/canvas_homes/leadService' // Adjust path as needed
import { enquiryService } from '../../services/canvas_homes/enquiryService' // Adjust path as needed

interface CloseLeadSideModalProps {
    isOpen: boolean
    onClose: () => void
    leadId: string // The lead to update
    enquiryId: string
    onLeadClosed?: () => void // Callback to refresh the lead data or perform actions post closure
}

const CloseLeadSideModal: React.FC<CloseLeadSideModalProps> = ({
    isOpen,
    onClose,
    leadId,
    onLeadClosed,
    enquiryId,
}) => {
    const [reason, setReason] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setReason(event.target.value)
    }

    const validateForm = (): boolean => {
        if (!reason.trim()) {
            setError('Reason is required')
            return false
        }
        return true
    }

    const handleCloseLead = async () => {
        setError(null)

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            // Update the lead status to 'closed' with the provided reason
            await leadService.update(leadId, {
                state: 'closed',
                lastModified: Date.now(),
            })
            await enquiryService.update(enquiryId, {
                state: 'closed',
                lastModified: Date.now(),
            })

            // Show success message
            alert('Lead closed successfully!')

            // Call the callback to refresh the lead data or perform actions after closure
            if (onLeadClosed) {
                onLeadClosed()
            }

            // Close the modal after successful operation
            onClose()
        } catch (error) {
            console.error('Error closing lead:', error)
            setError('Failed to close lead. Please try again.')
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
            <div className='fixed inset-0 bg-black opacity-66 z-40' onClick={onClose} />

            {/* Modal Container */}
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white z-50 rounded-lg shadow-2xl'>
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6 pb-3'>
                        <h2 className='text-lg font-semibold text-black'>Close Lead</h2>
                        <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded-md' disabled={isLoading}>
                            <svg
                                width='16'
                                height='16'
                                viewBox='0 0 20 20'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M15 5L5 15M5 5L15 15'
                                    stroke='#6B7280'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className='p-6'>
                        {/* Error Message */}
                        {error && (
                            <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm'>
                                {error}
                            </div>
                        )}

                        <div className='space-y-4'>
                            {/* Reason Input */}
                            <div>
                                <label className='block text-sm font-medium mb-2 text-gray-700'>
                                    Reason <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='text'
                                    value={reason}
                                    onChange={handleInputChange}
                                    placeholder='Enter reason for closing'
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='flex items-center justify-end gap-3 p-6 pt-4'>
                        <button
                            onClick={handleDiscard}
                            disabled={isLoading}
                            className='px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleCloseLead}
                            disabled={isLoading}
                            className='px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                        >
                            {isLoading && (
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                            )}
                            {isLoading ? 'Saving...' : 'Close Lead'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CloseLeadSideModal
