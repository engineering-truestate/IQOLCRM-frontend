import React, { useState } from 'react'
import Dropdown from '../../components/design-elements/Dropdown'
import { leadService } from '../../services/canvas_homes/leadService' // Adjust path as needed

interface AddLeadModalProps {
    isOpen: boolean
    onClose: () => void
    onLeadAdded?: () => void // Callback to refresh the leads list
}

// Lead interface for type safety
interface Lead {
    leadId: string
    agentId: string
    agentName: string
    name: string
    phoneNumber: string
    propertyName: string
    tag: 'cold' | 'potential' | 'hot' | 'super hot'
    userId: string | null
    source: string
    stage: 'lead registered' | 'initial contacted' | 'site visited' | 'eoi collected' | 'booking confirmed' | null
    taskType: 'lead registration' | 'initial contact' | 'site visit' | 'eoi collection' | 'booking' | null
    scheduledDate: number | null
    leadStatus: 'interested' | 'not interested' | 'booking dropped'
    leadState: 'open' | 'closed' | 'fresh' | 'dropped'
    added: number
    lastModified: number
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onLeadAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        propertyName: '',
        source: '',
        agentName: '',
        agentId: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Sample data for dropdowns with label-value format
    const propertyOptions = [
        { label: 'Select property name', value: '' },
        { label: 'Sunset Villa', value: 'Sunset Villa' },
        { label: 'Ocean View Apartment', value: 'Ocean View Apartment' },
        { label: 'Downtown Condo', value: 'Downtown Condo' },
        { label: 'Garden Heights', value: 'Garden Heights' },
        { label: 'Riverside Towers', value: 'Riverside Towers' },
        { label: 'Sattva Hills', value: 'Sattva Hills' },
        { label: 'Prestige Gardenia', value: 'Prestige Gardenia' },
        { label: 'Brigade Cosmopolis', value: 'Brigade Cosmopolis' },
        { label: 'Sobha City', value: 'Sobha City' },
        { label: 'Embassy Springs', value: 'Embassy Springs' },
        { label: 'Mantri Energia', value: 'Mantri Energia' },
    ]

    const sourceOptions = [
        { label: 'Select Source', value: '' },
        { label: 'Google', value: 'Google' },
        { label: 'LinkedIn', value: 'LinkedIn' },
        { label: 'Meta', value: 'META' },
    ]

    const agentOptions = [
        { label: 'Select Agent', value: '' },
        { label: 'Deepak Goyal', value: 'agent_001|Deepak Goyal' },
        { label: 'Rajan Yadav', value: 'agent_002|Rajan Yadav' },
        { label: 'Deepak Singh Chauhan', value: 'agent_003|Deepak Singh Chauhan' },
        { label: 'Samarth Jangir', value: 'agent_004|Samarth Jangir' },
        { label: 'Rahul Mehta', value: 'agent_123|Rahul Mehta' },
    ]

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
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
    }

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setError('Lead Name is required')
            return false
        }
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
        return true
    }

    const handleSave = async () => {
        setError(null)

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            // Create lead data according to Lead interface
            const leadData: Omit<Lead, 'leadId' | 'added' | 'lastModified'> = {
                agentId: formData.agentId || 'agent_default',
                agentName: formData.agentName || 'Unassigned',
                name: formData.name.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                propertyName: formData.propertyName || 'Not specified',
                tag: 'potential', // Default tag
                userId: null, // You might want to get this from auth context
                source: formData.source,
                stage: null, // Default stage
                taskType: null, // Default task type
                scheduledDate: null, // Default to 7 days from now
                leadStatus: 'interested', // Default status
                leadState: 'fresh', // Default state
            }

            console.log('Creating lead with data:', leadData)

            // Create lead using the service
            const leadId = await leadService.create(leadData)

            console.log('Lead created successfully with ID:', leadId)

            // Call the callback to refresh the leads list
            if (onLeadAdded) {
                onLeadAdded()
            }

            // Show success message
            alert('Lead created successfully!')

            // Reset and close
            handleDiscard()
        } catch (error) {
            console.error('Error creating lead:', error)
            setError('Failed to create lead. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        setFormData({
            name: '',
            phoneNumber: '',
            propertyName: '',
            source: '',
            agentName: '',
            agentId: '',
        })
        setError(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed top-0 left-0 w-[75%] h-full bg-black opacity-50 z-40' onClick={onClose} />

            {/* Modal Container */}
            <div className='fixed top-0 right-0 h-full w-[25%] bg-white z-50 shadow-2xl border-l border-gray-200'>
                <div className='flex flex-col h-full'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6 pb-0'>
                        <h2 className='text-xl font-semibold text-black'>Add Lead</h2>
                        <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded-md' disabled={isLoading}>
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

                    {/* Modal Content */}
                    <div className='flex-1 p-6 overflow-y-auto'>
                        {/* Error Message */}
                        {error && (
                            <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm'>
                                {error}
                            </div>
                        )}

                        <div className='space-y-6'>
                            {/* Lead Name Input */}
                            <div>
                                <label className='block text-sm font-medium mb-2'>
                                    Lead Name <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='text'
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder='Enter lead name'
                                    className='w-full px-4 py-2.5 border font-medium border-gray-300 rounded-lg focus:outline-none focus:border-black text-xs'
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Phone Number Input */}
                            <div>
                                <label className='block text-sm font-medium mb-2'>
                                    Phone No. <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='tel'
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    placeholder='Enter phone no. (e.g., +91 9999999999)'
                                    className='w-full px-4 py-2.5 border font-medium border-gray-300 rounded-lg focus:outline-none focus:border-black text-xs'
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Property Dropdown */}
                            <div>
                                <label className='block text-sm font-medium mb-2'>Property</label>
                                <Dropdown
                                    options={propertyOptions}
                                    onSelect={(value) => handleInputChange('propertyName', value)}
                                    defaultValue={formData.propertyName}
                                    placeholder='Select property name'
                                    className='w-full'
                                    triggerClassName='w-full px-4 py-2.5 border text-gray-500 font-medium text-xs border-gray-300 rounded-lg focus:outline-none focus:border-black appearance-none bg-white flex items-center justify-between text-left'
                                    menuClassName='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto'
                                    optionClassName='w-full px-4 py-2.5 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-sm'
                                />
                            </div>

                            {/* Source and Agent Row */}
                            <div className='grid grid-cols-2 gap-4'>
                                {/* Source Dropdown */}
                                <div>
                                    <label className='block text-sm font-medium mb-2'>Source</label>
                                    <Dropdown
                                        options={sourceOptions}
                                        onSelect={(value) => handleInputChange('source', value)}
                                        defaultValue={formData.source}
                                        placeholder='Select Source'
                                        className='w-full'
                                        triggerClassName='px-4 py-2.5 border border-gray-300 text-gray-500 font-medium rounded-lg focus:outline-none focus:border-black text-xs appearance-none bg-white flex items-center justify-between text-left'
                                        menuClassName='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto'
                                        optionClassName='w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-sm'
                                    />
                                </div>

                                {/* Agent Dropdown */}
                                <div>
                                    <label className='block text-sm font-medium mb-2'>Agent</label>
                                    <Dropdown
                                        options={agentOptions}
                                        onSelect={handleAgentSelect}
                                        defaultValue={
                                            formData.agentId ? `${formData.agentId}|${formData.agentName}` : ''
                                        }
                                        placeholder='Select Agent'
                                        className='w-full'
                                        triggerClassName='px-4 py-2.5 border border-gray-300 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-xs font-medium appearance-none bg-white flex items-center justify-between text-left'
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                        optionClassName='px-3 py-2 w-full text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='p-6'>
                        <div className='flex items-center justify-center gap-6'>
                            <button
                                onClick={handleDiscard}
                                disabled={isLoading}
                                className='px-6 py-2 w-30 text-gray-600 bg-gray-100 rounded-sm hover:text-gray-800 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className='px-6 py-2 w-30 bg-blue-500 text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                            >
                                {isLoading && (
                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                                )}
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddLeadModal
