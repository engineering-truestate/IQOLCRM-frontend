import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { fetchKAMOptions, verifyLeadAndCreateAgent } from '../../services/acn/leads/leadsService'
import { addAgentWithVerification } from '../../services/acn/agents/agentThunkService'
import {
    selectKAMOptions,
    selectKAMOptionsLoading,
    selectAgentVerificationLoading,
    selectAgentVerificationError,
} from '../../store/reducers/acn/leadsReducers'
import { selectAgentNotesLoading } from '../../store/reducers/acn/agentsReducer'
import type { AppDispatch, RootState } from '../../store'
import { toast } from 'react-toastify'
import { fetchFirmNames, searchFirmNames, addFirmName } from '../../services/acn/constants/constantService'

interface VerificationModalProps {
    isOpen: boolean
    onClose: () => void
    rowData: {
        leadId?: string
        cpId?: string
        name: string
        phoneNumber?: string
        leadStatus?: string
        agentStatus?: string
        contactStatus: string
        lastTried: number
        lastConnect?: number
        lastConnected?: number
        kamName?: string
        kamId?: string
        source?: string
        verified?: boolean
        communityJoined?: boolean
        onBroadcast?: boolean
        lastModified: number
    } | null
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, rowData }) => {
    const dispatch = useDispatch<AppDispatch>()
    const location = useLocation()

    // Determine context based on URL
    const isLeadsContext = location.pathname.includes('/acn/leads')
    const isAgentsContext = location.pathname.includes('/acn/agents')

    // Redux selectors
    const kamOptions = useSelector(selectKAMOptions)
    const kamOptionsLoading = useSelector(selectKAMOptionsLoading)
    const leadVerificationLoading = useSelector(selectAgentVerificationLoading)
    const leadVerificationError = useSelector(selectAgentVerificationError)
    const agentVerificationLoading = useSelector((state: RootState) => selectAgentNotesLoading(state))

    // Use appropriate loading state based on context
    const verificationLoading = isLeadsContext ? leadVerificationLoading : agentVerificationLoading
    const verificationError = isLeadsContext ? leadVerificationError : null

    const firmNames = useSelector((state: RootState) => state.constants.firmNames.allNames)
    const filteredFirmNames = useSelector((state: RootState) => state.constants.firmNames.filteredNames)
    const firmNamesLoading = useSelector((state: RootState) => state.constants.loading.firmNames)
    const searchingFirms = useSelector((state: RootState) => state.constants.loading.searchingFirms)

    const [showFirmDropdown, setShowFirmDropdown] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        emailAddress: '',
        workAddress: '',
        reraId: '',
        firmName: '',
        firmSize: '',
        kamName: '',
        kamId: '',
    })

    const [selectedAreas, setSelectedAreas] = useState<string[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])

    useEffect(() => {
        if (isOpen && firmNames.length === 0) {
            dispatch(fetchFirmNames())
        }
    }, [isOpen, firmNames.length, dispatch])

    // Load KAM options when modal opens
    useEffect(() => {
        if (isOpen && kamOptions.length === 0) {
            dispatch(fetchKAMOptions())
        }
    }, [isOpen, kamOptions.length, dispatch])

    // Prefill form data when rowData changes
    useEffect(() => {
        //console.log('here2')
        if (isOpen && rowData && isLeadsContext) {
            //console.log('here3')
            setFormData({
                name: rowData.name || '',
                phoneNumber: rowData.phoneNumber || rowData.phoneNumber || '',
                emailAddress: '', // This needs to be filled by user
                workAddress: '', // Not mandatory
                reraId: '',
                firmName: '',
                firmSize: '',
                kamName: rowData.kamName || '',
                kamId: rowData.kamId || '',
            })
            setSelectedAreas([])
            setSelectedCategories([])
        } else if (isOpen && isAgentsContext) {
            // For agents context without rowData (new agent creation)
            //console.log('here')
            setFormData({
                name: '',
                phoneNumber: '',
                emailAddress: '',
                workAddress: '',
                reraId: '',
                firmName: '',
                firmSize: '',
                kamName: '',
                kamId: '',
            })
            setSelectedAreas([])
            setSelectedCategories([])
        }
    }, [isOpen, rowData, isAgentsContext])

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value })

        // Handle firm name search
        if (field === 'firmName') {
            if (value.length > 0) {
                dispatch(searchFirmNames(value))
                setShowFirmDropdown(true)
            } else {
                setShowFirmDropdown(false)
            }
        }

        // Handle KAM selection
        if (field === 'kamName') {
            const selectedKAM = kamOptions.find((kam) => kam.value === value)
            if (selectedKAM) {
                setFormData((prev) => ({
                    ...prev,
                    kamName: value,
                    kamId: selectedKAM.value, // You might need to modify this based on your KAM data structure
                }))
            }
        }
    }

    const handleFirmSelect = (firmName: string) => {
        setFormData({ ...formData, firmName })
        setShowFirmDropdown(false)
    }

    const handleAddNewFirm = async (firmName: string) => {
        try {
            await dispatch(addFirmName(firmName)).unwrap()
            setFormData({ ...formData, firmName })
            setShowFirmDropdown(false)
            toast.success('New firm added successfully!')
        } catch (error) {
            toast.error('Failed to add new firm')
        }
    }

    const handleAreaToggle = (area: string) => {
        setSelectedAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
    }

    const handleCategoryToggle = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
        )
    }

    const handleVerify = async () => {
        // Validation for mandatory fields
        const requiredFields = ['name', 'phoneNumber', 'emailAddress', 'kamName']
        const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData].trim())

        if (missingFields.length > 0) {
            toast.error(`Please fill the following mandatory fields: ${missingFields.join(', ')}`)
            //alert(`Please fill the following mandatory fields: ${missingFields.join(', ')}`)
            return
        }

        try {
            const verificationData = {
                ...formData,
                areaOfOperation: selectedAreas,
                businessCategory: selectedCategories,
            }

            if (isLeadsContext && rowData?.leadId) {
                // For leads - verify and create agent from lead
                await dispatch(
                    verifyLeadAndCreateAgent({
                        leadId: rowData.leadId,
                        verificationData,
                    }),
                ).unwrap()
                toast.success('Lead Verified and Agent created successfully!')
                //alert('Agent verified and created successfully!')
            } else if (isAgentsContext) {
                // For agents - create new agent directly
                await dispatch(
                    addAgentWithVerification({
                        verificationData,
                    }),
                ).unwrap()
                toast.success('Agent created successfully!')
                //alert('Agent created successfully!')
            }

            onClose()
            // Reload page to refresh the data
            window.location.reload()
        } catch (error) {
            console.error('Failed to verify/create agent:', error)
            toast.error('Failed to create agent. Please try again.')
            //alert('Failed to create agent. Please try again.')
        }
    }

    if (!isOpen) return null

    // If on /acn/leads and no rowData, show error message
    if (isLeadsContext && !rowData) {
        return (
            <div className='fixed top-0 right-0 h-full w-[40%] bg-white z-50 shadow-2xl border-l border-gray-200 flex items-center justify-center'>
                <div className='text-center w-full'>
                    <h2 className='text-xl font-semibold text-gray-900 mb-2'>No Lead Selected</h2>
                    <p className='text-gray-600'>Please select a lead to verify agent information.</p>
                    <button
                        onClick={onClose}
                        className='mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    }

    const areas = ['north bangalore', 'south bangalore', 'east bangalore', 'west bangalore', 'pan bangalore']
    const categories = ['resale', 'rental', 'primary']

    // Get display ID and title based on context
    const displayId = isLeadsContext ? rowData?.leadId : 'New Agent'
    const modalTitle = isLeadsContext ? 'Verify Agent Information' : 'Add New Agent'
    const buttonText = isLeadsContext ? 'Verify & Create Agent' : 'Create Agent'

    return (
        <>
            {/* Very light overlay - only covers left 60% */}
            <div className='fixed top-0 left-0 w-[60%] h-full bg-black opacity-50 z-50' onClick={onClose} />

            {/* Modal */}
            <div className='fixed top-0 right-0 h-full w-[40%] bg-white z-50 shadow-2xl border-l border-gray-200'>
                <div className='flex flex-col h-full'>
                    {/* Header */}
                    <div className='p-6 border-b border-gray-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <div className='text-sm text-gray-500 mb-1'>{displayId}</div>
                                <h2 className='text-xl font-semibold text-gray-900'>{modalTitle}</h2>
                            </div>
                            <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded-md'>
                                <svg
                                    className='w-5 h-5 text-gray-400'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M6 18L18 6M6 6l12 12'
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className='flex-1 p-6 overflow-y-auto'>
                        {/* Error Display */}
                        {verificationError && (
                            <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm'>
                                {verificationError}
                            </div>
                        )}

                        {/* Personal Information */}
                        <div className='mb-8'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>
                                Personal Information <span className='text-red-500'>*</span>
                            </h3>
                            <div className='grid grid-cols-2 gap-4 mb-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Name <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type='text'
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder='Enter agent name'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Phone number <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type='tel'
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        placeholder='Enter agent number'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                        required
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Email <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type='email'
                                        value={formData.emailAddress}
                                        onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                                        placeholder='Enter agent email Id'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
                                    <input
                                        type='text'
                                        value={formData.workAddress}
                                        onChange={(e) => handleInputChange('workAddress', e.target.value)}
                                        placeholder='Enter agent address'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Background */}
                        <div className='mb-8'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>Professional Background</h3>

                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>RERA No.</label>
                                <input
                                    type='text'
                                    value={formData.reraId}
                                    onChange={(e) => handleInputChange('reraId', e.target.value)}
                                    placeholder='Enter RERA no.'
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4 mb-4'>
                                <div className='relative'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Firm Name</label>
                                    <div className='relative'>
                                        <div className='flex items-center'>
                                            <svg
                                                className='absolute left-3 w-4 h-4 text-gray-400'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                                />
                                            </svg>
                                            <input
                                                type='text'
                                                value={formData.firmName}
                                                onChange={(e) => handleInputChange('firmName', e.target.value)}
                                                placeholder={firmNamesLoading ? 'Loading firms...' : 'Search firm name'}
                                                className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                                disabled={firmNamesLoading}
                                            />
                                        </div>
                                        {showFirmDropdown && (
                                            <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto'>
                                                {searchingFirms ? (
                                                    <div className='px-3 py-2 text-sm text-gray-500'>Searching...</div>
                                                ) : filteredFirmNames.length > 0 ? (
                                                    filteredFirmNames.map((firm, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleFirmSelect(firm)}
                                                            className='w-full px-3 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none first:rounded-t-lg last:rounded-b-lg'
                                                        >
                                                            {firm}
                                                        </button>
                                                    ))
                                                ) : formData.firmName.trim() ? (
                                                    <button
                                                        onClick={() => handleAddNewFirm(formData.firmName.trim())}
                                                        className='w-full px-3 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none rounded-lg text-blue-600'
                                                    >
                                                        + Add "{formData.firmName.trim()}"
                                                    </button>
                                                ) : (
                                                    <div className='px-3 py-2 text-sm text-gray-500'>
                                                        No firms found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Firm Size</label>
                                    <input
                                        type='number'
                                        value={formData.firmSize}
                                        onChange={(e) => handleInputChange('firmSize', e.target.value)}
                                        placeholder='Enter firm size'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-1 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        KAM <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='relative'>
                                        <select
                                            value={formData.kamName}
                                            onChange={(e) => handleInputChange('kamName', e.target.value)}
                                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm appearance-none bg-white'
                                            required
                                            disabled={kamOptionsLoading}
                                        >
                                            <option value=''>
                                                {kamOptionsLoading ? 'Loading KAMs...' : 'Select KAM'}
                                            </option>
                                            {kamOptions.map((kam) => (
                                                <option key={kam.value} value={kam.value}>
                                                    {kam.value} ({kam.count})
                                                </option>
                                            ))}
                                        </select>
                                        <svg
                                            className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M19 9l-7 7-7-7'
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Area of Operation */}
                        <div className='mb-8'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>Area of Operation</h3>
                            <div className='flex flex-wrap gap-3'>
                                {areas.map((area) => (
                                    <button
                                        key={area}
                                        onClick={() => handleAreaToggle(area)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                                            selectedAreas.includes(area)
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {area}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Business Category */}
                        <div className='mb-8'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>Business Category</h3>
                            <div className='flex flex-wrap gap-3'>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryToggle(category)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                                            selectedCategories.includes(category)
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className='p-6 border-t border-gray-200'>
                        <div className='flex items-center justify-between'>
                            <button
                                onClick={onClose}
                                className='px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
                                disabled={verificationLoading}
                            >
                                Close
                            </button>
                            <button
                                onClick={handleVerify}
                                disabled={verificationLoading}
                                className='px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                            >
                                {verificationLoading ? (
                                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                ) : null}
                                {buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default VerificationModal
