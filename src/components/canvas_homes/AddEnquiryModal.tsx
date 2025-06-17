import React, { useState } from 'react'
import { enquiryService } from '../../services/canvas_homes/enquiryService' // Adjust path as needed
import Dropdown from './tasks/Dropdown'

interface AddEnquiryModalProps {
    isOpen: boolean
    onClose: () => void
    leadId: string // The lead ID to associate with the enquiry
    onEnquiryAdded?: () => void // Callback to refresh the lead data or perform actions post enquiry creation
    properties: Array<{ label: string; value: string }> // Properties for dropdown
    agents: Array<{ label: string; value: string }> // Agents for dropdown
}

const AddEnquiryModal: React.FC<AddEnquiryModalProps> = ({
    isOpen,
    onClose,
    leadId,
    onEnquiryAdded,
    properties,
    agents,
}) => {
    const [formData, setFormData] = useState({
        propertyName: '',
        agentName: '',
        enquiryDate: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const validateForm = (): boolean => {
        if (!formData.propertyName.trim()) {
            setError('Property Name is required')
            return false
        }

        if (!formData.agentName.trim()) {
            setError('Agent Name is required')
            return false
        }

        if (!formData.enquiryDate.trim()) {
            setError('Enquiry Date is required')
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
            // Automatically generate the enquiry ID as enq_{timestamp}
            const enquiryId = `enq_${Date.now()}`

            // Prepare the new enquiry data
            const enquiryData = {
                enquiryId: enquiryId,
                leadId: leadId,
                agentId: formData.agentName, // Assuming the agent ID matches the name value for now
                propertyName: formData.propertyName.trim(),
                added: Date.now(),
                lastModified: Date.now(),
            }

            // Create the enquiry using the service
            await enquiryService.create(enquiryData)

            // Show success message
            alert('Enquiry added successfully!')

            // Call the callback to refresh the lead data or perform actions after enquiry creation
            if (onEnquiryAdded) {
                onEnquiryAdded()
            }

            // Close the modal after successful operation
            onClose()
        } catch (error) {
            console.error('Error adding enquiry:', error)
            setError('Failed to add enquiry. Please try again.')
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

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed inset-0 bg-black opacity-50 z-40' onClick={onClose} />

            {/* Modal Container */}
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white z-50 rounded-lg shadow-lg'>
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6 pb-4'>
                        <h2 className='text-lg font-semibold text-black'>Add Enquiry</h2>
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

                        {/* Property Name */}
                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Property Name</label>
                            <Dropdown
                                options={properties}
                                onSelect={(value) => handleInputChange('propertyName', value)}
                                defaultValue={formData.propertyName}
                                placeholder='Select Property'
                                className='w-full'
                            />
                        </div>

                        {/* Agent Name */}
                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Agent Name</label>
                            <Dropdown
                                options={agents}
                                onSelect={(value) => handleInputChange('agentName', value)}
                                defaultValue={formData.agentName}
                                placeholder='Select Agent'
                                className='w-full'
                            />
                        </div>

                        {/* Enquiry Date */}
                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Enquiry Date</label>
                            <input
                                type='datetime-local'
                                value={formData.enquiryDate}
                                onChange={(e) => handleInputChange('enquiryDate', e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md'
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
                            className='px-4 py-2 bg-blue-500 text-white rounded-md'
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddEnquiryModal
