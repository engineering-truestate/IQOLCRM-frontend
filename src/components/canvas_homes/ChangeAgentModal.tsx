import React, { useState, useEffect } from 'react'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { leadService } from '../../services/canvas_homes/leadService'
import { taskService } from '../../services/canvas_homes/taskService'
import Dropdown from '../design-elements/Dropdown'
import { getUnixDateTime } from '../helper/getUnixDateTime'
import { toast } from 'react-toastify'
import useAuth from '../../hooks/useAuth'

interface ChangeAgentModalProps {
    isOpen: boolean
    onClose: () => void
    leadId: string
    enquiryId: string
    onAgentChange?: () => void
    agentName?: string
}

const ChangeAgentModal: React.FC<ChangeAgentModalProps> = ({
    agentName = '',
    isOpen,
    onClose,
    leadId,
    enquiryId,
    onAgentChange,
}) => {
    const [formData, setFormData] = useState({
        agentId: '',
        agentName: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentAgentId, setCurrentAgentId] = useState<string | null>(null)
    const { user } = useAuth()

    // Agent options with IDs
    const agentOptions = [
        // { label: 'Select agent name', value: '' },
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
            const currentTimestamp = getUnixDateTime()
            const currentEnquiry = await enquiryService.getById(enquiryId)

            if (!currentEnquiry) {
                throw new Error('Enquiry not found')
            }

            // Create new agent history entry
            const newAgentHistoryEntry = {
                timestamp: getUnixDateTime(),
                agentId: formData.agentId,
                agentName: formData.agentName,
                lastStage: null,
                assignedAt: getUnixDateTime(),
            }

            // Prepare updated agent history
            const updatedAgentHistory = [...(currentEnquiry?.agentHistory || []), newAgentHistoryEntry]

            // Update enquiry with new agent and agent history
            const enquiryUpdateData = {
                agentId: formData.agentId,
                agentName: formData.agentName,
                agentHistory: updatedAgentHistory,
                lastModified: currentTimestamp,
            }

            await enquiryService.addActivity(enquiryId, {
                activityType: 'agent transfer',
                timestamp: currentTimestamp,
                agentName: user?.displayName || '',
                data: {
                    fromAgent: agentName,
                    toAgent: formData.agentName,
                },
            })

            // Run enquiry and lead updates in parallel
            const enquiryUpdatePromise = enquiryService.update(enquiryId, enquiryUpdateData)
            const leadUpdatePromise = leadService.update(leadId, {
                agentId: formData.agentId,
                agentName: formData.agentName,
                lastModified: getUnixDateTime(),
            })

            // Wait for both lead and enquiry updates to complete
            await Promise.all([enquiryUpdatePromise, leadUpdatePromise])
            console.log('Enquiry and lead updated with new agent')

            // After updating enquiry and lead, update tasks
            try {
                const allTasks = await taskService.getByEnquiryId(enquiryId)
                const openTasks = allTasks.filter((task) => task.status === 'open')

                const updatePromises = openTasks.map((task) => {
                    return taskService.update(task.taskId, {
                        agentId: formData.agentId,
                        agentName: formData.agentName,
                        lastModified: getUnixDateTime(),
                    })
                })

                // Wait for all task updates to complete
                await Promise.all(updatePromises)
                console.log('All open tasks updated with new agent')
            } catch (taskError) {
                console.error('Error updating open tasks with new agent info:', taskError)
            }

            // Call the callback to refresh the data
            if (onAgentChange) {
                onAgentChange()
            }

            // Show success message
            toast.success('Agent changed successfully!')

            // Reset form and close modal
            handleDiscard()
        } catch (error) {
            console.error('Error changing agent:', error)
            setError('Failed to change agent. Please try again.')
            toast.error('Failed to change agent')
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
            <div className='fixed inset-0 bg-black opacity-62 z-40' onClick={!isLoading ? onClose : undefined} />

            {/* Modal Container */}
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[433px] bg-white z-50 rounded-lg shadow-2xl'>
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6'>
                        <h2 className='text-xl font-semibold text-gray-900'>Change Agent</h2>
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
                            {/* Agent Name */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Agent Name</label>
                                <Dropdown
                                    options={agentOptions}
                                    onSelect={handleAgentSelect}
                                    defaultValue={formData.agentId ? `${formData.agentId}|${formData.agentName}` : ''}
                                    placeholder='Select Agent Name'
                                    className='w-full relative inline-block'
                                    triggerClassName={`relative w-full h-8 px-3 py-2.5 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none  disabled:opacity-50 ${
                                        formData.agentName ? '[&>span]:text-black' : ''
                                    }`}
                                    menuClassName='absolute z-50 mt-1 max-h-40 overflow-y-auto w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='p-4 mt-10 flex items-center justify-center gap-4'>
                        <button
                            onClick={handleDiscard}
                            disabled={isLoading}
                            className='px-6 py-2 w-30 text-gray-600 bg-gray-200 rounded-sm hover:text-gray-800 hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className='px-6 py-2 w-30 bg-blue-500 text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
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
