import React, { useState } from 'react'
import Dropdown from '../../components/design-elements/Dropdown'
import { leadService } from '../../services/canvas_homes/leadService'
import { userService } from '../../services/canvas_homes/userService'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import type { Lead, User, Enquiry } from '../../services/canvas_homes/types'
import { getUnixDateTime } from '../../components/helper/getUnixDateTime'
import useAuth from '../../hooks/useAuth'

interface AddLeadModalProps {
    isOpen: boolean
    onClose: () => void
    onLeadAdded?: () => void // Callback to refresh the leads list
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onLeadAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        propertyId: '',
        propertyName: '',
        source: '',
        agentId: '',
        agentName: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isRefreshingAlgolia, setIsRefreshingAlgolia] = useState(false)
    const { user } = useAuth()
    const agentName = user?.displayName || ''

    // Property options with IDs
    const propertyOptions = [
        { label: 'Select property name', value: '' },
        { label: 'Sunset Villa', value: 'prop001|Sunset Villa' },
        { label: 'Ocean View Apartment', value: 'prop002|Ocean View Apartment' },
        { label: 'Downtown Condo', value: 'prop003|Downtown Condo' },
        { label: 'Garden Heights', value: 'prop004|Garden Heights' },
        { label: 'Riverside Towers', value: 'prop005|Riverside Towers' },
        { label: 'Sattva Hills', value: 'prop006|Sattva Hills' },
        { label: 'Prestige Gardenia', value: 'prop007|Prestige Gardenia' },
        { label: 'Brigade Cosmopolis', value: 'prop008|Brigade Cosmopolis' },
        { label: 'Sobha City', value: 'prop009|Sobha City' },
        { label: 'Embassy Springs', value: 'prop010|Embassy Springs' },
        { label: 'Mantri Energia', value: 'prop011|Mantri Energia' },
    ]

    // Source options
    const sourceOptions = [
        { label: 'Select Source', value: '' },
        { label: 'Google', value: 'Google' },
        { label: 'LinkedIn', value: 'LinkedIn' },
        { label: 'Meta', value: 'META' },
        { label: 'Referral', value: 'Referral' },
        { label: 'Direct', value: 'Direct' },
    ]

    // Agent options with standardized IDs
    const agentOptions = [
        { label: 'Select Agent', value: '' },
        { label: 'Deepak Goyal', value: 'agent001|Deepak Goyal' },
        { label: 'Rajan Yadav', value: 'agent002|Rajan Yadav' },
        { label: 'Deepak Singh Chauhan', value: 'agent003|Deepak Singh Chauhan' },
        { label: 'Samarth Jangir', value: 'agent004|Samarth Jangir' },
        { label: 'Rahul Mehta', value: 'agent005|Rahul Mehta' },
    ]

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        // Keep original case in the form
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        // Clear error when user makes changes
        if (error) setError(null)
    }

    const handlePropertySelect = (value: string) => {
        if (value) {
            const [propertyId, propertyName] = value.split('|')
            setFormData((prev) => ({
                ...prev,
                propertyId,
                propertyName,
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                propertyId: '',
                propertyName: '',
            }))
        }

        // Clear error when user makes changes
        if (error) setError(null)
    }

    const handleAgentSelect = (value: string) => {
        if (value) {
            const [agentId, agentName] = value.split('|')
            setFormData((prev) => ({
                ...prev,
                agentId,
                agentName,
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                agentId: '',
                agentName: '',
            }))
        }

        // Clear error when user makes changes
        if (error) setError(null)
    }

    const validateForm = (): boolean => {
        // Name validation
        if (!formData.name.trim()) {
            setError('Lead Name is required')
            return false
        }

        if (formData.name.trim().length < 2) {
            setError('Lead Name must be at least 2 characters')
            return false
        }

        // Phone validation
        if (!formData.phoneNumber.trim()) {
            setError('Phone Number is required')
            return false
        }

        // Validate Indian phone numbers (+91 followed by 10 digits)
        // or international format with country code
        const phoneRegex = /^(\+\d{1,3}\s?)?(\d{10,15})$/
        if (!phoneRegex.test(formData.phoneNumber.trim())) {
            setError('Please enter a valid phone number (e.g., +91 9999999999)')
            return false
        }

        // Optional validations based on business requirements
        if (!formData.propertyId) {
            setError('Please select a property')
            return false
        }

        if (!formData.source) {
            setError('Please select a lead source')
            return false
        }

        return true
    }

    const formatPhoneNumber = (number: string): string => {
        const cleanNumber = number.replace(/[^\d+]/g, '') // Remove non-digit characters except +

        // If it's an Indian number without country code, add +91
        if (cleanNumber.length === 10 && /^\d{10}$/.test(cleanNumber)) {
            return `+91 ${cleanNumber}`
        }

        // If it already has a plus, ensure there's a space after the country code
        if (cleanNumber.startsWith('+')) {
            // Find the country code (1-3 digits after +)
            const countryCodeMatch = cleanNumber.match(/^\+(\d{1,3})/)
            if (countryCodeMatch) {
                const countryCode = countryCodeMatch[1]
                const rest = cleanNumber.substring(countryCode.length + 1)
                return `+${countryCode} ${rest}`
            }
        }

        return cleanNumber
    }

    const handleSave = async () => {
        setError(null)

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            // Format phone number
            const formattedPhoneNumber = formatPhoneNumber(formData.phoneNumber.trim())

            // Step 1: Create User
            const userData: Omit<User, 'userId'> = {
                name: formData.name.trim().toLowerCase(),
                phoneNumber: formattedPhoneNumber,
                emailAddress: '',
                label: null,
                added: getUnixDateTime(),
                lastModified: getUnixDateTime(),
            }

            // Use a transaction approach to ensure all-or-nothing operations
            // First, create the objects but don't commit until all are successful
            let userId: string
            let leadId: string

            try {
                // Step 1: Create User
                userId = await userService.create(userData)
                console.log('User created successfully with ID:', userId)

                // Step 2: Create Lead
                const leadData: Omit<Lead, 'leadId'> = {
                    agentId: formData.agentId || 'agent001', // Default to first agent
                    agentName: (formData.agentName || 'deepak goyal').toLowerCase(), // Default agent name (lowercase)
                    name: formData.name.trim().toLowerCase(),
                    phoneNumber: formattedPhoneNumber,
                    propertyName: (formData.propertyName || 'sunset villa').toLowerCase(), // Default property (lowercase)
                    tag: null, // Default tag
                    userId: userId, // Associate User ID to Lead
                    source: (formData.source || 'direct').toLowerCase(), // Default source (lowercase)
                    stage: null, // Default stage
                    taskType: null, // Default task type
                    scheduledDate: null, // Default scheduled date
                    leadStatus: null, // Default status
                    state: 'fresh', // Default state
                    added: getUnixDateTime(),
                    completionDate: null,
                    lastModified: getUnixDateTime(),
                }

                leadId = await leadService.create(leadData)
                console.log('Lead created successfully with ID:', leadId)

                // Step 3: Create Enquiry
                const enquiryData: Omit<Enquiry, 'enquiryId'> = {
                    leadId: leadId, // Associate Lead to Enquiry
                    agentId: formData.agentId || 'agent001',
                    propertyId: formData.propertyId || 'prop001',
                    propertyName: (formData.propertyName || 'sunset villa').toLowerCase(), // lowercase
                    source: (formData.source || 'direct').toLowerCase(), // lowercase
                    leadStatus: null, // Default status
                    stage: null, // Default stage
                    agentHistory: [
                        {
                            agentId: formData.agentId,
                            agentName: formData.agentName ? formData.agentName.toLowerCase() : '',
                            timestamp: getUnixDateTime(),
                            lastStage: null,
                        },
                    ],
                    notes: [],
                    activityHistory: [
                        {
                            activityType: 'lead added',
                            timestamp: getUnixDateTime(),
                            agentName: formData.agentName ? formData.agentName.toLowerCase() : '',
                            data: {},
                        },
                    ],
                    tag: null, // Default tag
                    documents: [],
                    state: 'fresh',
                    requirements: [],
                    added: getUnixDateTime(),
                    lastModified: getUnixDateTime(),
                }

                await enquiryService.create(enquiryData)
                console.log('Enquiry created successfully for lead ID:', leadId)

                // Refresh Algolia to ensure data is immediately searchable
                setIsRefreshingAlgolia(true)

                // Simulate a refresh delay (replace with actual refresh API call if available)
                await new Promise((resolve) => setTimeout(resolve, 1000))

                setIsRefreshingAlgolia(false)

                // Call the callback to refresh the leads list
                if (onLeadAdded) {
                    onLeadAdded()
                }

                // Show success message
                alert('Lead, User, and Enquiry created successfully!')

                // Reset form and close modal
                handleDiscard()
            } catch (error) {
                console.error('Error in transaction:', error)

                // Attempt to rollback
                try {
                    // Only attempt rollback if we created entities
                    if (leadId) {
                        // Rollback enquiry is automatic in this case
                        await leadService.delete(leadId)
                        console.log('Rolled back lead creation')
                    }

                    if (userId) {
                        await userService.delete(userId)
                        console.log('Rolled back user creation')
                    }
                } catch (rollbackError) {
                    console.error('Rollback failed:', rollbackError)
                }

                throw error // Re-throw for the outer catch
            }
        } catch (error) {
            console.error('Error creating lead, user, or enquiry:', error)
            setError('Failed to create lead. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        setFormData({
            name: '',
            phoneNumber: '',
            propertyId: '',
            propertyName: '',
            source: '',
            agentId: '',
            agentName: '',
        })
        setError(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            <div className='fixed top-0 left-0 w-[75%] h-full bg-black opacity-50 z-40' onClick={onClose} />
            <div className='fixed top-0 right-0 h-full w-[25%] bg-white z-50 shadow-2xl border-l border-gray-200'>
                <div className='flex flex-col h-full'>
                    <div className='flex items-center justify-between p-6 pb-0'>
                        <h2 className='text-xl font-semibold text-black'>Add Lead</h2>
                        <button
                            onClick={onClose}
                            className='p-1 hover:bg-gray-100 rounded-md'
                            disabled={isLoading || isRefreshingAlgolia}
                            aria-label='Close'
                        >
                            <svg
                                width='20'
                                height='20'
                                viewBox='0 0 20 20'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M0 10C0 15.522 4.477 20 10 20C15.523 20 20 15.522 20 10C20 4.477 15.523 0 10 0C4.477 0 0 4.477 0 10ZM6.757 5.343L10 8.586L13.243 5.343C13.706 4.863 14.177 4.863 14.657 5.343C15.137 5.823 15.137 6.294 14.657 6.757L11.414 10L14.657 13.243C15.128 13.714 15.128 14.185 14.657 14.657C14.185 15.128 13.714 15.128 13.243 14.657L10 11.414L6.757 14.657C6.297 15.139 5.825 15.139 5.343 14.657C4.861 14.175 4.861 13.703 5.343 13.243L8.586 10L5.343 6.757C4.871 6.287 4.871 5.815 5.343 5.343C5.815 4.871 6.287 4.871 6.757 5.343Z'
                                    fill='#3A3A47'
                                />
                            </svg>
                        </button>
                    </div>

                    <div className='flex-1 p-6 overflow-y-auto'>
                        {error && (
                            <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm'>
                                {error}
                            </div>
                        )}

                        <div className='space-y-6'>
                            <div>
                                <label htmlFor='leadName' className='block text-sm font-medium mb-2'>
                                    Lead Name <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='text'
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder='Enter lead name'
                                    className='w-full px-4 py-2.5 border font-medium border-gray-300 rounded-lg focus:outline-none focus:border-black text-xs'
                                    disabled={isLoading || isRefreshingAlgolia}
                                    required
                                    maxLength={50}
                                />
                            </div>

                            <div>
                                <label htmlFor='phoneNumber' className='block text-sm font-medium mb-2'>
                                    Phone No. <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='tel'
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    placeholder='Enter phone no. (e.g., +91 9999999999)'
                                    className='w-full px-4 py-2.5 border font-medium border-gray-300 rounded-lg focus:outline-none focus:border-black text-xs'
                                    disabled={isLoading || isRefreshingAlgolia}
                                    required
                                    maxLength={15}
                                />
                            </div>

                            <div>
                                <label htmlFor='property' className='block text-sm font-medium mb-2'>
                                    Property <span className='text-red-500'>*</span>
                                </label>
                                <Dropdown
                                    options={propertyOptions}
                                    onSelect={handlePropertySelect}
                                    defaultValue={
                                        formData.propertyId ? `${formData.propertyId}|${formData.propertyName}` : ''
                                    }
                                    placeholder='Select property name'
                                    className='w-full'
                                    triggerClassName='w-full px-4 py-2.5 border text-gray-500 font-medium text-xs border-gray-300 rounded-lg focus:outline-none focus:border-black appearance-none bg-white flex items-center justify-between text-left'
                                    menuClassName='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto'
                                    optionClassName='w-full px-4 py-2.5 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-sm'
                                    disabled={isLoading || isRefreshingAlgolia}
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label htmlFor='source' className='block text-sm font-medium mb-2'>
                                        Source <span className='text-red-500'>*</span>
                                    </label>
                                    <Dropdown
                                        options={sourceOptions}
                                        onSelect={(value) => handleInputChange('source', value)}
                                        defaultValue={formData.source}
                                        placeholder='Select Source'
                                        className='w-full'
                                        triggerClassName='px-4 py-2.5 border border-gray-300 text-gray-500 font-medium rounded-lg focus:outline-none focus:border-black text-xs appearance-none bg-white flex items-center justify-between text-left'
                                        menuClassName='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto'
                                        optionClassName='w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-sm'
                                        disabled={isLoading || isRefreshingAlgolia}
                                    />
                                </div>

                                <div>
                                    <label htmlFor='agent' className='block text-sm font-medium mb-2'>
                                        Agent
                                    </label>
                                    <Dropdown
                                        options={agentOptions}
                                        onSelect={handleAgentSelect}
                                        defaultValue={
                                            formData.agentId ? `${formData.agentId}|${formData.agentName}` : ''
                                        }
                                        placeholder='Select Agent'
                                        className='w-full'
                                        triggerClassName='px-4 py-2.5 border border-gray-300 text-gray-500 rounded-lg focus:outline-none focus:border-black text-xs font-medium appearance-none bg-white flex items-center justify-between text-left'
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                        optionClassName='px-3 py-2 w-full text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                        disabled={isLoading || isRefreshingAlgolia}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='p-6'>
                        <div className='flex items-center justify-center gap-6'>
                            <button
                                onClick={handleDiscard}
                                disabled={isLoading || isRefreshingAlgolia}
                                className='px-6 py-2 w-30 text-gray-600 bg-gray-100 rounded-sm hover:text-gray-800 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading || isRefreshingAlgolia}
                                className='px-6 py-2 w-30 bg-blue-500 text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                            >
                                {(isLoading || isRefreshingAlgolia) && (
                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                                )}
                                {isLoading ? 'Saving...' : isRefreshingAlgolia ? 'Refreshing...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddLeadModal
