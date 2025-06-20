import React, { useState, useEffect } from 'react'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { leadService } from '../../services/canvas_homes/leadService'
import Dropdown from '../design-elements/Dropdown' // Updated path to match AddDetailsModal
import type { Enquiry } from '../../services/canvas_homes/types'

interface AddEnquiryModalProps {
    isOpen: boolean
    onClose: () => void
    leadId: string
    stage: string
    onEnquiryAdded?: () => void
    agentName: string
}

const AddEnquiryModal: React.FC<AddEnquiryModalProps> = ({
    agentName,
    isOpen,
    onClose,
    leadId,
    onEnquiryAdded,
    stage,
}) => {
    // Format current date and time for datetime-local input
    const getCurrentDateTimeString = (): string => {
        const now = new Date()
        // Format: YYYY-MM-DDThh:mm
        return now.toISOString().slice(0, 16)
    }

    const [formData, setFormData] = useState({
        propertyId: '',
        propertyName: '',
        agentId: '',
        agentName: '',
        enquiryDate: getCurrentDateTimeString(),
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Property options with IDs
    const properties = [
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

    // Agent options with IDs
    const agents = [
        { label: 'Select Agent', value: '' },
        { label: 'Deepak Goyal', value: 'agent001|Deepak Goyal' },
        { label: 'Rajan Yadav', value: 'agent002|Rajan Yadav' },
        { label: 'Deepak Singh Chauhan', value: 'agent003|Deepak Singh Chauhan' },
        { label: 'Samarth Jangir', value: 'agent004|Samarth Jangir' },
        { label: 'Rahul Mehta', value: 'agent005|Rahul Mehta' },
    ]

    // Set current date and time when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData((prev) => ({
                ...prev,
                enquiryDate: getCurrentDateTimeString(),
            }))
        }
    }, [isOpen])

    const handleInputChange = (field: keyof typeof formData, value: string) => {
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
        if (!formData.propertyId || !formData.propertyName) {
            setError('Property is required')
            return false
        }

        if (!formData.agentId || !formData.agentName) {
            setError('Agent is required')
            return false
        }

        // Enquiry date validation not needed as it's now auto-filled and disabled

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
            // Get timestamp for current time
            const currentTimestamp = Date.now()

            // Convert enquiryDate string to timestamp
            const enquiryDateTimestamp = new Date(formData.enquiryDate).getTime()

            // Prepare the new enquiry data
            const enquiryData: Omit<Enquiry, 'enquiryId'> = {
                leadId: leadId,
                agentId: formData.agentId,
                propertyId: formData.propertyId,
                propertyName: formData.propertyName,
                source: 'Manual',
                leadStatus: 'interested', // Default status
                stage: null,
                agentHistory: [
                    {
                        agentId: formData.agentId,
                        agentName: formData.agentName,
                        timestamp: Date.now(),
                        lastStage: stage,
                    },
                ],
                activityHistory: [
                    {
                        activityType: 'New Enquiry',
                        timestamp: currentTimestamp,
                        agentName: agentName,
                        data: {
                            propertyAdded: formData.propertyName,
                            leadStatus: null,
                            tag: null,
                        },
                    },
                ],
                notes: [],
                state: 'open',
                tag: null,
                documents: [],
                requirements: [],
                added: enquiryDateTimestamp,
                lastModified: currentTimestamp,
            }

            // Create the enquiry using the service
            const enquiryId = await enquiryService.create(enquiryData)
            const updateData: any = {
                propertyName: formData.propertyName,
                agentId: formData.agentId,
                agentName: formData.agentName,
                stage: null,
                Status: null,
                tag: null,
                state: 'open',
                lastModified: Date.now(),
            }

            await leadService.update(leadId, updateData)
            console.log('Enquiry added successfully with ID:', enquiryId)

            // Refresh Algolia data

            // Call the callback to refresh the lead data or perform actions after enquiry creation
            if (onEnquiryAdded) {
                onEnquiryAdded()
            }

            // Show success message
            alert('Enquiry added successfully!')

            // Close the modal after successful operation
            handleDiscard()
        } catch (error) {
            console.error('Error adding enquiry:', error)
            setError('Failed to add enquiry. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        setFormData({
            propertyId: '',
            propertyName: '',
            agentId: '',
            agentName: '',
            enquiryDate: getCurrentDateTimeString(),
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
                    <div className='flex items-center justify-between p-6 pb-3 pb-4'>
                        <h2 className='text-lg font-semibold text-black'>Add Enquiry</h2>
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
                    <div className='p-6 pt-0 space-y-4'>
                        {/* Error Message */}
                        {error && (
                            <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm'>
                                {error}
                            </div>
                        )}

                        {/* Property Name */}
                        <div>
                            <label htmlFor='property' className='block text-sm font-medium mb-2 text-gray-700'>
                                Property Name <span className='text-red-500'>*</span>
                            </label>
                            <Dropdown
                                id='property'
                                options={properties}
                                onSelect={handlePropertySelect}
                                defaultValue={
                                    formData.propertyId ? `${formData.propertyId}|${formData.propertyName}` : ''
                                }
                                placeholder='Select Property'
                                className='w-full'
                                triggerClassName='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white flex items-center justify-between text-left'
                                menuClassName='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer'
                                disabled={isLoading}
                            />
                        </div>

                        {/* Agent Name */}
                        <div>
                            <label htmlFor='agent' className='block text-sm font-medium mb-2 text-gray-700'>
                                Agent Name <span className='text-red-500'>*</span>
                            </label>
                            <Dropdown
                                id='agent'
                                options={agents}
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

                        {/* Enquiry Date - Disabled and auto-filled with current date/time */}
                        <div>
                            <label htmlFor='enquiryDate' className='block text-sm font-medium mb-2 text-gray-700'>
                                Enquiry Date & Time (Current)
                            </label>
                            <input
                                id='enquiryDate'
                                type='datetime-local'
                                value={formData.enquiryDate}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed'
                                disabled={true} // Always disabled
                                readOnly={true} // Add readOnly for additional security
                            />
                            <p className='mt-1 text-xs text-gray-500'>Automatically set to current date and time</p>
                        </div>
                    </div>

                    {/* Modal Footer - Centered Buttons */}
                    <div className='flex items-center justify-center gap-4 p-6 pt-4'>
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

export default AddEnquiryModal
