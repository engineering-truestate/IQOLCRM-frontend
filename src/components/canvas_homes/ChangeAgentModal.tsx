import React, { useState } from 'react'
import { enquiryService } from '../../services/canvas_homes/enquiryService' // Adjust path as needed
import { leadService } from '../../services/canvas_homes/leadService' // Adjust path as needed
import Dropdown from './tasks/Dropdown'
import type { enquiry } from '../../services/canvas_homes/types' // Fixed typo: tpyes -> types

interface ChangeAgentModalProps {
    // Fixed interface name to match component name
    isOpen: boolean
    onClose: () => void
    leadId: string
    enquiryId: string
    onEnquiryAdded?: () => void
    properties: Array<{ label: string; value: string }>
    agents: Array<{ label: string; value: string }>
}

const ChangeAgentModal: React.FC<ChangeAgentModalProps> = ({
    isOpen,
    onClose,
    leadId,
    enquiryId, // Now using the enquiryId prop
    onEnquiryAdded,
    agents, // Using agents from props instead of hardcoded array
}) => {
    const [formData, setFormData] = useState({
        propertyName: '',
        agentName: '',
        enquiryDate: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Remove hardcoded agents array since it's passed as props
    // If you want to keep default agents as fallback:
    const defaultAgents = [
        { label: 'Select Agent', value: '', id: '' },
        { label: 'Deepak Goyal', value: 'Deepak Goyal', id: 'agent001' },
        { label: 'Rajan Yadav', value: 'Rajan Yadav', id: 'agent002' },
        { label: 'Deepak Singh Chauhan', value: 'Deepak Singh Chauhan', id: 'agent003' },
        { label: 'Samarth Jangir', value: 'Samarth Jangir', id: 'agent004' },
        { label: 'Rahul Mehta', value: 'Rahul Mehta', id: 'agent005' },
    ]

    const agentOptions = agents && agents.length > 0 ? agents : defaultAgents

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const validateForm = (): boolean => {
        if (!formData.agentName.trim()) {
            setError('Agent Name is required')
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
            // Find the selected agent's ID
            const selectedAgent = agentOptions.find((agent) => agent.value === formData.agentName)
            const agentId = selectedAgent?.value || formData.agentName
            const agentName = selectedAgent?.label || formData.agentName

            // Get current enquiry data to preserve existing agent history
            const currentEnquiry = await enquiryService.getById(enquiryId)

            // Create new agent history entry
            const newAgentHistoryEntry = {
                timestamp: Date.now(),
                agentId: agentId,
                agentName: agentName,
                lastStage: currentEnquiry?.stage || 'assigned',
            }

            // Prepare updated agent history
            const updatedAgentHistory = [...(currentEnquiry?.agentHistory || []), newAgentHistoryEntry]

            // Update enquiry with new agent and agent history
            const enquiryUpdateData = {
                enquiryId: enquiryId,
                agentId: agentId,
                agentName: agentName,
                agentHistory: updatedAgentHistory,
                lastModified: Date.now(),
            }

            await enquiryService.update(enquiryId, enquiryUpdateData)

            // Update lead with new agent information
            const leadUpdateData = {
                leadId: leadId,
                agentId: agentId,
                agentName: agentName,
                lastModified: Date.now(),
            }

            await leadService.update(leadId, leadUpdateData)

            // Show success message
            alert('Agent changed successfully!')

            // Call the callback to refresh the data
            if (onEnquiryAdded) {
                onEnquiryAdded()
            }

            // Close the modal after successful operation
            onClose()
        } catch (error) {
            console.error('Error changing agent:', error)
            setError('Failed to change agent. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        setFormData({
            propertyName: '',
            agentName: '',
            enquiryDate: '',
        })
        setError(null)
        onClose()
    }

    if (!isOpen) return null
    console.log('Hare Krishna', enquiryId)

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed inset-0 bg-black opacity-50 z-40' onClick={onClose} />

            {/* Modal Container */}
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white z-50 rounded-lg shadow-lg'>
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6 pb-4'>
                        <h2 className='text-lg font-semibold text-black'>Change Agent</h2>
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
                    <div className='p-6 space-y-4'>
                        {/* Error Message */}
                        {error && (
                            <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm'>
                                {error}
                            </div>
                        )}

                        {/* Agent Name */}
                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Agent Name</label>
                            <Dropdown
                                options={agentOptions}
                                onSelect={(value) => handleInputChange('agentName', value)}
                                defaultValue={formData.agentName}
                                placeholder='Select Agent'
                                className='w-full'
                            />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='flex items-center justify-end gap-3 p-6 pt-4'>
                        <button
                            onClick={handleDiscard}
                            disabled={isLoading}
                            className='px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-500/90'
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChangeAgentModal // Fixed export name to match component name
