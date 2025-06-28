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
    // currentLabel = 'call',
    additionalPhoneNumbers = [],
}) => {
    const [formData, setFormData] = useState({
        phoneNumber: '',
        label: '' as 'whatsapp' | 'call' | '',
        emailAddress: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [phoneError, setPhoneError] = useState('')

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

        // Clear error when user makes changes
        if (error) setError(null)
    }

    // const formatPhoneNumber = (number: string): string => {
    //     const cleanNumber = number.replace(/[^\d+]/g, '')
    //     if (cleanNumber.length === 10 && /^\d{10}$/.test(cleanNumber)) {
    //         return `+91 ${cleanNumber}`
    //     }
    //     if (cleanNumber.startsWith('+')) {
    //         const countryCodeMatch = cleanNumber.match(/^\+(\d{1,3})/)
    //         if (countryCodeMatch) {
    //             const countryCode = countryCodeMatch[1]
    //             const rest = cleanNumber.substring(countryCode.length + 1)
    //             return `+${countryCode} ${rest}`
    //         }
    //     }
    //     return cleanNumber
    // }

    const validateForm = (): boolean => {
        const number = formData.phoneNumber.trim()
        const email = formData.emailAddress.trim()

        // ✅ Check that at least one is present
        if (!number && !email) {
            setError('Please provide at least a phone number or an email address')
            return false
        }

        if (number && number.length !== 10) {
            setError('Phone number must be exactly 10 digits')
            return false
        }

        const formattedNumber = `+91${number}`

        if (currentPhoneNumber === formattedNumber) {
            setError('This phone number is already the main number for this lead')
            return false
        }

        const phoneExists = additionalPhoneNumbers.some((phone) => phone.number === formattedNumber)
        if (phoneExists) {
            setError('This phone number already exists for this lead')
            return false
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                setError('Please enter a valid email address')
                return false
            }
        }

        if (!leadId) {
            setError('Lead ID is required')
            return false
        }

        return true
    }

    const handleSave = async () => {
        setError(null)

        if (!validateForm()) return

        setIsLoading(true)

        try {
            const number = formData.phoneNumber.trim()
            const email = formData.emailAddress.trim()
            const hasPhone = number.length === 10
            const hasEmail = email !== ''

            const updateData: any = {
                lastModified: getUnixDateTime(),
            }

            // ✅ Add email only if present
            if (hasEmail) {
                updateData.emailAddress = email
            }

            // ✅ Add phone only if 10-digit valid number
            if (hasPhone) {
                const formattedPhoneNumber = `+91${number}`

                const newPhoneEntry = {
                    number: formattedPhoneNumber,
                    label: formData.label,
                    addedAt: getUnixDateTime(),
                }

                if (additionalPhoneNumbers.length > 0 || currentPhoneNumber) {
                    updateData.phoneNumbers = [...additionalPhoneNumbers, newPhoneEntry]
                } else {
                    updateData.phoneNumber = formattedPhoneNumber
                    updateData.label = formData.label
                }
            }

            console.log('Updating lead with data:', updateData)

            await Promise.all([leadService.update(leadId, updateData), userService.update(userId, updateData)])

            toast.success('Details added successfully!')
            handleDiscard()
            if (onDetailsAdded) onDetailsAdded()
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
            phoneNumber: '',
            label: '',
            emailAddress: '',
        })
        setPhoneError('')
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
                                <div className='relative'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Phone No.</label>
                                    <div className='relative'>
                                        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 h-8 leading-8 flex items-center pointer-events-none'>
                                            +91
                                        </span>
                                        <input
                                            type='tel'
                                            inputMode='numeric'
                                            pattern='[0-9]*'
                                            value={formData.phoneNumber}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/\D/g, '')
                                                if (numericValue.length > 10) {
                                                    setPhoneError('Phone number cannot exceed 10 digits')
                                                } else {
                                                    setPhoneError('')
                                                    handleInputChange('phoneNumber', numericValue)
                                                }
                                            }}
                                            onBlur={() => {
                                                const length = formData.phoneNumber.length
                                                if (length > 0 && length !== 10) {
                                                    setPhoneError('Phone number must be exactly 10 digits')
                                                } else {
                                                    setPhoneError('')
                                                }
                                            }}
                                            placeholder='Enter Phone No.'
                                            className={`w-full pl-12 h-8 text-sm leading-8 ${
                                                phoneError ? 'border-red-500' : 'border-gray-300'
                                            } border rounded-sm focus:outline-none focus:border-black`}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                    {phoneError && <p className='text-red-500 text-xs mt-1'>{phoneError}</p>}
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
                                        triggerClassName={`relative w-full h-8 px-3 py-2.5 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                            formData.label ? '[&>span]:text-black' : ''
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
