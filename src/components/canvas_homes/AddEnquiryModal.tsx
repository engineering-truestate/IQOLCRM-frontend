import React, { useState, useEffect } from 'react'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { leadService } from '../../services/canvas_homes/leadService'
import Dropdown from '../design-elements/Dropdown'
import { toast } from 'react-toastify'
import type { Enquiry } from '../../services/canvas_homes/types'
import { getUnixDateTime } from '../helper/getUnixDateTime'
import { useDispatch } from 'react-redux'
import type { AppDispatch, RootState } from '../../store'
import { useSelector } from 'react-redux'
import { fetchPreLaunchProperties } from '../../store/actions/restack/preLaunchActions'

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
    const dispatch = useDispatch<AppDispatch>()

    const { properties } = useSelector((state: RootState) => state.preLaunch)
    const [propertyOptions, setPropertyOptions] = useState<{ label: string; value: string }[]>([])

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Reset form data when modal opens
        const loadProperty = async () => {
            if (!properties || properties.length === 0) {
                await dispatch(fetchPreLaunchProperties())
            }
            console.log('Properties loaded:', properties)
            return properties.map((property) => ({
                label: property.projectName,
                value: `${property.projectId}|${property.projectName}`,
            }))
        }
        loadProperty()
    }, [dispatch, properties, isOpen])

    useEffect(() => {
        // Set property options when properties are loaded
        if (properties && properties.length > 0) {
            const options = properties.map((property) => ({
                label: property.projectName,
                value: `${property.projectId}|${property.projectName}`,
            }))
            setPropertyOptions(options)
        }
    }, [properties])

    // Agent options with IDs
    const agents = [
        // { label: 'Select name', value: '' },
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
            const currentTimestamp = getUnixDateTime()

            // Convert enquiryDate string to timestamp
            const enquiryDateTimestamp = new Date(formData.enquiryDate).getTime()

            // Prepare the new enquiry data
            const enquiryData: Omit<Enquiry, 'enquiryId'> = {
                leadId: leadId,
                agentId: formData.agentId,
                propertyId: formData.propertyId,
                propertyName: formData.propertyName,
                source: 'manual',
                leadStatus: null, // Default status
                stage: null,
                agentHistory: [
                    {
                        agentId: formData.agentId,
                        agentName: formData.agentName,
                        timestamp: getUnixDateTime(),
                        lastStage: stage,
                    },
                ],
                activityHistory: [
                    {
                        activityType: 'new enquiry',
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

            // Prepare lead update data
            const updateData: any = {
                propertyName: formData.propertyName,
                agentId: formData.agentId,
                agentName: formData.agentName,
                stage: null,
                leadStatus: null,
                tag: null,
                state: 'open',
                lastModified: getUnixDateTime(),
            }

            // Run both actions in parallel using Promise.all
            const enquiryCreationPromise = enquiryService.create(enquiryData)
            const leadUpdatePromise = leadService.update(leadId, updateData)

            // Wait for both promises to finish
            const [enquiryId] = await Promise.all([enquiryCreationPromise, leadUpdatePromise])

            console.log('Enquiry added successfully with ID:', enquiryId)

            // Call the callback to refresh the lead data or perform actions after enquiry creation
            if (onEnquiryAdded) {
                onEnquiryAdded()
            }

            // Show success message
            toast.success('Enquiry added successfully!')

            // Close the modal after successful operation
            handleDiscard()
        } catch (error) {
            console.error('Error adding enquiry:', error)
            setError('Failed to add enquiry. Please try again.')
            toast.error('Failed to add enquiry')
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

    const getFormattedDateTime = () => {
        const now = new Date()

        const pad = (n: number) => n.toString().padStart(2, '0')

        const day = pad(now.getDate())
        const month = pad(now.getMonth() + 1) // Months are 0-indexed
        const year = now.getFullYear()

        let hours = now.getHours()
        const minutes = pad(now.getMinutes())
        const ampm = hours >= 12 ? 'PM' : 'AM'
        hours = hours % 12
        hours = hours ? hours : 12 // 0 => 12

        return `${day}/${month}/${year} | ${pad(hours)}:${minutes} ${ampm}`
    }

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed inset-0 bg-black opacity-62 z-40' onClick={!isLoading ? onClose : undefined} />

            {/* Modal Container */}
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[433px] bg-white z-50 rounded-lg shadow-2xl'>
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6'>
                        <h2 className='text-xl font-semibold text-gray-900'>Add Enquiry</h2>
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
                            {/* Property Name */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Property Name <span className='text-red-500'>*</span>
                                </label>

                                <Dropdown
                                    options={propertyOptions}
                                    onSelect={handlePropertySelect}
                                    defaultValue={
                                        formData.propertyId ? `${formData.propertyId}|${formData.propertyName}` : ''
                                    }
                                    placeholder='Select Property'
                                    className='w-full relative inline-block'
                                    triggerClassName={`relative w-full h-8 px-3 py-2.5 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                        formData.propertyName ? '[&>span]:text-black' : ''
                                    }`}
                                    menuClassName='absolute z-50 mt-1 max-h-40 overflow-y-auto w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Agent Name and Date/Time side by side */}
                            <div className='grid grid-cols-2 gap-3'>
                                {/* Agent Name */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Agent Name <span className='text-red-500'>*</span>
                                    </label>
                                    <Dropdown
                                        options={agents}
                                        onSelect={handleAgentSelect}
                                        defaultValue={
                                            formData.agentId ? `${formData.agentId}|${formData.agentName}` : ''
                                        }
                                        placeholder='Select Name'
                                        className='w-full relative inline-block'
                                        triggerClassName={`relative w-full h-8 px-3 py-2.5 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                            formData.agentName ? '[&>span]:text-black' : ''
                                        } truncate overflow-hidden whitespace-nowrap max-w-full`}
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                        optionClassName='px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Date and Time */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Date and Time
                                    </label>
                                    <div className='relative'>
                                        <div className='absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none'>
                                            <svg
                                                className='w-4 h-4 text-gray-500'
                                                xmlns='http://www.w3.org/2000/svg'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth='2'
                                                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type='text'
                                            value={getFormattedDateTime()}
                                            className='w-fit pl-8 py-1 border text-gray-500 border-gray-300 rounded-sm bg-gray-50 cursor-not-allowed text-sm'
                                            disabled={true}
                                            readOnly={true}
                                        />
                                    </div>
                                </div>
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

export default AddEnquiryModal
