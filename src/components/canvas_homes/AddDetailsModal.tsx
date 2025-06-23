import React, { useState } from 'react'
import Dropdown from '../design-elements/Dropdown'
import { leadService } from '../../services/canvas_homes/leadService' // Adjust path as needed
import { userService } from '../../services/canvas_homes/userService' // Adjust path as needed
import { toast } from 'react-toastify'
import { getUnixDateTime } from '../helper/getUnixDateTime'

interface AddDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    onDetailsAdded?: () => void
    userId?: string
    leadId?: string // The lead to update
    currentPhoneNumber?: string
    currentLabel?: 'whatsapp' | 'call' | ''
    additionalPhoneNumbers?: Array<{
        number: string
        label: 'whatsapp' | 'call' | ''
        addedAt?: number
    }>
}

const AddDetailsModal: React.FC<AddDetailsModalProps> = ({
    isOpen,
    onClose,
    onDetailsAdded,
    leadId = '',
    userId = '',
    currentPhoneNumber = '',
    currentLabel = 'call',
    additionalPhoneNumbers = [],
}) => {
    const [formData, setFormData] = useState({
        phoneNumber: '+91 ',
        label: 'whatsapp' as 'whatsapp' | 'call' | '',
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
        // For phone number, ensure it's formatted properly while typing
        if (field === 'phoneNumber') {
            // If user deletes everything, reset to +91
            if (!value || value.length === 0) {
                value = '+91'
            }
            // If they delete the +91 prefix, add it back
            else if (!value.startsWith('+')) {
                value = '+91' + value.replace(/[^\d]/g, '')
            }
            // If they have +91 and try to edit it, preserve the +91
            else if (value.startsWith('+') && !value.startsWith('+91')) {
                value = '+91' + value.substring(1).replace(/[^\d]/g, '')
            }
        }

        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        // Clear error when user makes changes
        if (error) setError(null)
    }

    const formatPhoneNumber = (number: string): string => {
        // First, remove any non-digit characters except the plus sign
        const cleanNumber = number.replace(/[^\d+]/g, '')

        // If the number has a +91 prefix followed by 10 digits, format it nicely
        if (cleanNumber.startsWith('+91') && cleanNumber.length >= 13) {
            const digits = cleanNumber.substring(3) // Get digits after +91
            return `+91 ${digits}`
        }

        // If it's just 10 digits without country code, add the +91 prefix
        if (cleanNumber.length === 10 && /^\d{10}$/.test(cleanNumber)) {
            return `+91 ${cleanNumber}`
        }

        // If it starts with + but isn't properly formatted yet
        if (cleanNumber.startsWith('+')) {
            // Find the country code (1-3 digits after +)
            const countryCodeMatch = cleanNumber.match(/^\+(\d{1,3})/)
            if (countryCodeMatch) {
                const countryCode = countryCodeMatch[1]
                const rest = cleanNumber.substring(countryCode.length + 1)
                return `+${countryCode} ${rest}`
            }
        }

        // If all else fails, return the cleaned number
        return cleanNumber
    }

    const validateForm = (): boolean => {
        // Phone number is required and must be more than just "+91"
        if (!formData.phoneNumber.trim() || formData.phoneNumber.trim() === '+91') {
            setError('Phone Number is required')
            return false
        }

        // Basic phone number validation - must be +91 followed by 10 digits
        const phoneRegex = /^\+91\s?\d{10}$/
        if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
            setError('Please enter a valid 10-digit phone number with +91 prefix')
            return false
        }

        // Check if phone number already exists (current or additional)
        const newNumber = formatPhoneNumber(formData.phoneNumber.trim())

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

        // Check if lead ID is provided
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
            // Format phone number consistently
            const formattedPhoneNumber = formatPhoneNumber(formData.phoneNumber.trim())

            // Prepare the new phone number entry
            const newPhoneEntry = {
                number: formattedPhoneNumber,
                label: formData.label,
                addedAt: getUnixDateTime(),
            }

            // Prepare update data
            const updateData: any = {
                lastModified: getUnixDateTime(),
            }

            // Add email if provided
            if (formData.emailAddress.trim()) {
                updateData.emailAddress = formData.emailAddress.trim()
            }

            // Handle phone numbers
            if (additionalPhoneNumbers.length > 0 || currentPhoneNumber) {
                // Already have additional numbers, add to the array
                updateData.phoneNumbers = [...additionalPhoneNumbers, newPhoneEntry]
            } else {
                // No phone numbers at all, set as main number
                updateData.phoneNumber = formattedPhoneNumber
                updateData.label = formData.label
            }

            console.log('Updating lead with data:', updateData)

            // Run both updates in parallel using Promise.all
            const leadUpdatePromise = leadService.update(leadId, updateData)
            const userUpdatePromise = userService.update(userId, updateData)

            // Wait for both updates to finish
            await Promise.all([leadUpdatePromise, userUpdatePromise])

            console.log('Lead updated successfully')

            // Call the callback to refresh the lead data
            if (onDetailsAdded) {
                onDetailsAdded()
            }

            // Show success message
            toast.success('Details added successfully!')

            // Reset form and close modal
            handleDiscard()
        } catch (error) {
            console.error('Error updating lead:', error)
            setError('Failed to add details. Please try again.')
            toast.error('Failed to add details')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        setFormData({
            phoneNumber: '+91',
            label: '',
            emailAddress: '',
        })
        setError(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed inset-0 bg-black opacity-66 z-40' onClick={!isLoading ? onClose : undefined} />

            {/* Modal Container */}
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[433px] bg-white z-50 rounded-lg shadow-2xl'>
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6'>
                        <h2 className='text-xl font-semibold text-gray-900'>Add Details</h2>
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
                            <div className='grid grid-cols-2 gap-3'>
                                {/* Phone Number Input */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Phone No.</label>
                                    <input
                                        type='tel'
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        placeholder=''
                                        className='w-full px-4 py-1 border font-normal text-gray-500 border-gray-300 rounded-sm focus:outline-none focus:border-black text-sm'
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Label Dropdown */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Label</label>
                                    <Dropdown
                                        options={labelOptions}
                                        onSelect={(value) =>
                                            handleInputChange('label', value as 'whatsapp' | 'call' | '')
                                        }
                                        defaultValue={formData.label}
                                        placeholder='Select'
                                        className='w-full relative inline-block'
                                        triggerClassName={`relative w-full h-8 px-3 py-2.5 border border-gray-300 rounded-sm text-sm text-gray-700 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                            formData.label ? '[&>span]:font-medium text-black' : ''
                                        }`}
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                        optionClassName='px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Email id</label>
                                <input
                                    type='email'
                                    value={formData.emailAddress}
                                    onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                                    placeholder='Enter email address'
                                    className='w-full px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:border-black text-sm'
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='p-6 mt-6 flex items-center justify-center gap-4'>
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

export default AddDetailsModal
