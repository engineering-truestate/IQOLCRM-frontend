import React, { useState, useEffect } from 'react'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { leadService } from '../../services/canvas_homes/leadService'
import { taskService } from '../../services/canvas_homes/taskService'
import Dropdown from '../design-elements/Dropdown' // Updated path to match other components

interface ChangeAgentModalProps {
    isOpen: boolean
    onClose: () => void
    leadId: string
    enquiryId: string
    onDetailsAdded?: () => void // Renamed from onEnquiryAdded to match parent component
}

const ChangeAgentModal: React.FC<ChangeAgentModalProps> = ({ isOpen, onClose, leadId, enquiryId, onDetailsAdded }) => {
    const [formData, setFormData] = useState({
        agentId: '',
        agentName: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentAgentId, setCurrentAgentId] = useState<string | null>(null)

    // Agent options with IDs
    const agentOptions = [
        { label: 'Select Agent', value: '' },
        { label: 'Deepak Goyal', value: 'agent001|Deepak Goyal' },
        { label: 'Rajan Yadav', value: 'agent002|Rajan Yadav' },
        { label: 'Deepak Singh Chauhan', value: 'agent003|Deepak Singh Chauhan' },
        { label: 'Samarth Jangir', value: 'agent004|Samarth Jangir' },
        { label: 'Rahul Mehta', value: 'agent005|Rahul Mehta' },
    ]

    // Fetch current agent when modal opens
    useEffect(() => {
        if (isOpen && enquiryId) {
            const fetchCurrentAgent = async () => {
                try {
                    const enquiry = await enquiryService.getById(enquiryId)
                    if (enquiry && enquiry.agentId) {
                        setCurrentAgentId(enquiry.agentId)
                    }
                } catch (error) {
                    console.error('Error fetching current agent:', error)
                }
            }

            fetchCurrentAgent()
        }
    }, [isOpen, enquiryId])

    const handleAgentSelect = (value: string) => {
        if (value) {
            const [agentId, agentName] = value.split('|')
            setFormData({
                agentId,
                agentName,
            })
        } else {
            setFormData({
                agentId: '',
                agentName: '',
            })
        }

        // Clear error when user makes changes
        if (error) setError(null)
    }

    const validateForm = (): boolean => {
        if (!formData.agentId || !formData.agentName) {
            setError('Agent is required')
            return false
        }

        if (formData.agentId === currentAgentId) {
            setError('Please select a different agent')
            return false
        }

        if (!enquiryId) {
            setError('Enquiry ID is required')
            return false
        }

        if (!leadId) {
            setError('Lead ID is required')
            return false
        }

        return true
    }

    const handleSave = async () => {
        setError(null)

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            // Get current enquiry data to preserve existing fields
            const currentEnquiry = await enquiryService.getById(enquiryId)

            if (!currentEnquiry) {
                throw new Error('Enquiry not found')
            }

            // Create new agent history entry
            const newAgentHistoryEntry = {
                timestamp: Date.now(),
                agentId: formData.agentId,
                agentName: formData.agentName,
                lastStage: currentEnquiry?.stage || 'assigned',
                assignedAt: Date.now(),
            }

            // Prepare updated agent history
            const updatedAgentHistory = [...(currentEnquiry?.agentHistory || []), newAgentHistoryEntry]

            // Update enquiry with new agent and agent history
            const enquiryUpdateData = {
                agentId: formData.agentId,
                agentName: formData.agentName,
                agentHistory: updatedAgentHistory,
                lastModified: Date.now(),
            }
            await enquiryService.addActivity(enquiryId, {
                activityType: 'Property Change',
                timestamp: currentTimestamp,
                agentName: agentName,
                data: {
                    propertyAdded: formData.propertyName,
                    propertyChanged: previousPropertyName,
                    leadStatus: 'Property Changed',
                    reason: formData.reason,
                    note: formData.note || '',
                },
            })

            await enquiryService.update(enquiryId, enquiryUpdateData)
            console.log('Enquiry updated with new agent')

            // Update lead with new agent information
            const leadUpdateData = {
                agentId: formData.agentId,
                agentName: formData.agentName,
                lastModified: Date.now(),
            }

            await leadService.update(leadId, leadUpdateData)

            // After updating enquiry and lead
            try {
                const allTasks = await taskService.getByEnquiryId(enquiryId) // You may need to use getByEnquiryId(enquiryId) if relevant
                const openTasks = allTasks.filter((task) => task.status === 'open')

                const updatePromises = openTasks.map((task) => {
                    return taskService.update(task.taskId, {
                        agentId: formData.agentId,
                        agentName: formData.agentName,
                        lastModified: Date.now(),
                    })
                })

                await Promise.all(updatePromises)
                console.log('All open tasks updated with new agent')
            } catch (taskError) {
                console.error('Error updating open tasks with new agent info:', taskError)
            }

            // Call the callback to refresh the data
            if (onDetailsAdded) {
                onDetailsAdded()
            }

            // Show success message
            alert('Agent changed successfully!')

            // Reset form and close modal
            handleDiscard()
        } catch (error) {
            console.error('Error changing agent:', error)
            setError('Failed to change agent. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        setFormData({
            agentId: '',
            agentName: '',
        })
        setError(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed inset-0 bg-black opacity-50 z-40' onClick={onClose} />

            {/* Modal Container */}
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white z-50 rounded-lg shadow-lg'>
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6 pb-4 border-b border-gray-100'>
                        <h2 className='text-lg font-semibold text-black'>Change Agent</h2>
                        <button
                            onClick={onClose}
                            className='p-1 hover:bg-gray-100 rounded-md'
                            disabled={isLoading}
                            aria-label='Close'
                        >
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
                    <div className='p-6 space-y-4'>
                        {/* Error Message */}
                        {error && (
                            <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm'>
                                {error}
                            </div>
                        )}

                        {/* Agent Name */}
                        <div>
                            <label htmlFor='agent' className='block text-sm font-medium mb-2 text-gray-700'>
                                Agent Name <span className='text-red-500'>*</span>
                            </label>
                            <Dropdown
                                id='agent'
                                options={agentOptions}
                                onSelect={handleAgentSelect}
                                defaultValue={formData.agentId ? `${formData.agentId}|${formData.agentName}` : ''}
                                placeholder='Select Agent'
                                className='w-full'
                                triggerClassName='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white flex items-center justify-between text-left'
                                menuClassName='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer'
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Modal Footer - Centered Buttons */}
                    <div className='flex items-center justify-center gap-4 p-6 pt-4 border-t border-gray-100'>
                        <button
                            onClick={handleDiscard}
                            disabled={isLoading}
                            className='px-5 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className='px-5 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[80px]'
                        >
                            {isLoading && (
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                            )}
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChangeAgentModal
