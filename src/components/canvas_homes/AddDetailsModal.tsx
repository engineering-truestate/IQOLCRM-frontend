import React, { useState } from 'react'
import Dropdown from '../design-elements/Dropdown'
import { leadService } from '../../services/canvas_homes/leadService' // Adjust path as needed

interface AddDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    onDetailsAdded?: () => void
    userId?: string
    leadId?: string // The lead to update
    currentPhoneNumber?: string
    currentLabel?: 'whatsapp' | 'call'
    additionalPhoneNumbers?: Array<{
        number: string
        label: 'whatsapp' | 'call'
        addedAt?: number
    }>
}

const AddDetailsModal: React.FC<AddDetailsModalProps> = ({
    isOpen,
    onClose,
    onDetailsAdded,
    leadId,
    currentPhoneNumber = '',
    currentLabel = 'call',
    additionalPhoneNumbers = [],
}) => {
    const [formData, setFormData] = useState({
        phoneNumber: '',
        label: 'whatsapp' as 'whatsapp' | 'call',
        emailAddress: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Label options for phone numbers
    const labelOptions = [
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Call', value: 'call' },
    ]

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const validateForm = (): boolean => {
        if (!formData.phoneNumber.trim()) {
            setError('Phone Number is required')
            return false
        }

        // Basic phone number validation - removed unnecessary escapes
        const phoneRegex = /^\+?[\d\s\-()]{10,15}$/
        if (!phoneRegex.test(formData.phoneNumber.trim())) {
            setError('Please enter a valid phone number')
            return false
        }

        // Check if phone number already exists (current or additional)
        const newNumber = formData.phoneNumber.trim()
        if (currentPhoneNumber === newNumber) {
            setError('This phone number is already the main number for this lead')
            return false
        }

        const phoneExists = additionalPhoneNumbers.some((phone) => phone.number === newNumber)
        if (phoneExists) {
            setError('This phone number already exists for this lead')
            return false
        }

        // Email validation if provided
        if (formData.emailAddress.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(formData.emailAddress.trim())) {
                setError('Please enter a valid email address')
                return false
            }
        }

        return true
    }

    const handleSave = async () => {
        setError(null)

        if (!validateForm()) {
            return
        }

        if (!leadId) {
            setError('Lead ID is required')
            return
        }

        setIsLoading(true)

        try {
            // Prepare the new phone number entry
            const newPhoneEntry = {
                number: formData.phoneNumber.trim(),
                label: formData.label,
                addedAt: Date.now(),
            }

            // Prepare update data
            const updateData: any = {
                lastModified: Date.now(),
            }

            // Add email if provided
            if (formData.emailAddress.trim()) {
                updateData.emailAddress = formData.emailAddress.trim()
            }

            // Handle phone numbers
            if (additionalPhoneNumbers.length > 0) {
                // Already have additional numbers, add to the array
                updateData.phoneNumbers = [...additionalPhoneNumbers, newPhoneEntry]
            } else if (currentPhoneNumber) {
                // Have a main number but no additional ones, create the array
                const mainPhoneEntry = {
                    number: currentPhoneNumber,
                    label: currentLabel,
                    addedAt: Date.now() - 1000, // Slightly earlier timestamp
                }
                updateData.phoneNumbers = [mainPhoneEntry, newPhoneEntry]
            } else {
                // No phone numbers at all, set as main number
                updateData.phoneNumber = formData.phoneNumber.trim()
                updateData.label = formData.label
            }

            console.log('Updating lead with data:', updateData)

            // Update lead using the service
            await leadService.update(leadId, updateData)

            console.log('Lead updated successfully')

            // Show success message
            alert('Details added successfully!')

            // Reset form and close modal
            handleDiscard()

            // Call the callback to refresh the lead data
            if (onDetailsAdded) {
                onDetailsAdded()
            }
        } catch (error) {
            console.error('Error updating lead:', error)
            setError('Failed to add details. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        setFormData({
            phoneNumber: '',
            label: 'whatsapp',
            emailAddress: '',
        })
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
                    <div className='flex items-center justify-between p-6 pb-4'>
                        <h2 className='text-lg font-semibold text-black'>Add Details</h2>
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
                            {/* Phone Number Input */}
                            <div>
                                <label className='block text-sm font-medium mb-2 text-gray-700'>
                                    Phone No. <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='tel'
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    placeholder='+91'
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Label Dropdown */}
                            <div>
                                <label className='block text-sm font-medium mb-2 text-gray-700'>
                                    Label <span className='text-red-500'>*</span>
                                </label>
                                <Dropdown
                                    options={labelOptions}
                                    onSelect={(value) => handleInputChange('label', value as 'whatsapp' | 'call')}
                                    defaultValue={formData.label}
                                    placeholder='Select'
                                    className='w-full'
                                    triggerClassName='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white flex items-center justify-between text-left'
                                    menuClassName='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer'
                                />
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className='block text-sm font-medium mb-2 text-gray-700'>Email Id</label>
                                <input
                                    type='email'
                                    value={formData.emailAddress}
                                    onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                                    placeholder='Enter email address'
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Additional Phone Numbers Display */}
                            {additionalPhoneNumbers.length > 0 && (
                                <div>
                                    <label className='block text-sm font-medium mb-2 text-gray-700'>
                                        Additional Phone Numbers
                                    </label>
                                    <div className='space-y-2'>
                                        {additionalPhoneNumbers.map((phone, index) => (
                                            <div
                                                key={index}
                                                className='flex items-center justify-between p-2 bg-gray-50 rounded border'
                                            >
                                                <span className='text-sm'>{phone.number}</span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${
                                                        phone.label === 'whatsapp'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}
                                                >
                                                    {phone.label === 'whatsapp' ? 'WhatsApp' : 'Call'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                            onClick={handleSave}
                            disabled={isLoading}
                            className='px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
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

export default AddDetailsModal
