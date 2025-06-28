import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createRequirement } from '../../services/acn/requirements/requirementsService'
import { fetchAgentByPhone } from '../../services/acn/agents/agentThunkService'
import {
    fetchMicromarkets,
    fetchBuilderNames,
    addBuilderName,
    searchBuilderNames,
} from '../../services/acn/constants/constantService'
import { clearFilteredBuilderNames } from '../../store/reducers/acn/constantReducer'
import { type AppDispatch, type RootState } from '../../store'
import { toast } from 'react-toastify'
import useAuth from '../../hooks/useAuth'

interface AddRequirementModalProps {
    isOpen: boolean
    onClose: () => void
    cpId: string
}

export const AddRequirementModal: React.FC<AddRequirementModalProps> = ({ isOpen, onClose, cpId }) => {
    const dispatch = useDispatch<AppDispatch>()
    const { loading, error } = useSelector((state: RootState) => state.requirements)
    const { loading: agentLoading } = useSelector((state: RootState) => state.agents)
    const {
        micromarkets,
        builderNames,
        loading: constantsLoading,
        error: constantsError,
    } = useSelector((state: RootState) => state.constants)

    const [errorMessage, setErrorMessage] = useState('')
    const [agentPhone, setAgentPhone] = useState('')
    const [agentId, setAgentId] = useState('')
    const [name, setName] = useState('')
    const [projectName, setProjectName] = useState('')
    const [requirementDetails, setRequirementDetails] = useState('')
    const [assetType, setAssetType] = useState('')
    const [configuration, setConfiguration] = useState('')
    const [area, setArea] = useState('')
    const [budgetFrom, setBudgetFrom] = useState('')
    const [budgetTo, setBudgetTo] = useState('')
    const [asMarketPrice, setAsMarketPrice] = useState(false)
    // user details
    const { platform, user } = useAuth()
    const kamId = platform?.acn?.kamId || 'INT003'
    const kamName = user?.displayName || ''
    const kamPhoneNumber = user?.phoneNumber || ''

    // Micromarket fields
    const [micromarket, setMicromarket] = useState('')
    const [showMicromarketDropdown, setShowMicromarketDropdown] = useState(false)
    const [filteredMicromarkets, setFilteredMicromarkets] = useState<Array<{ name: string; zone: string }>>([])

    // Builder name fields
    const [builderName, setBuilderName] = useState('')
    const [showBuilderDropdown, setShowBuilderDropdown] = useState(false)

    // Load constants when modal opens
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchMicromarkets())
            dispatch(fetchBuilderNames())
        }
    }, [isOpen, dispatch])

    // Initialize filtered micromarkets when micromarkets are loaded
    useEffect(() => {
        if (micromarkets.length > 0) {
            setFilteredMicromarkets(micromarkets)
        }
    }, [micromarkets])

    // Micromarket functions
    const handleMicromarketChange = (value: string) => {
        setMicromarket(value)
        if (value.trim()) {
            const filtered = micromarkets.filter((mm) => mm.name.toLowerCase().includes(value.toLowerCase()))
            setFilteredMicromarkets(filtered)
            setShowMicromarketDropdown(filtered.length > 0)
        } else {
            setFilteredMicromarkets(micromarkets)
            setShowMicromarketDropdown(micromarkets.length > 0)
        }
    }

    const selectMicromarket = (selectedName: string) => {
        setMicromarket(selectedName)
        setShowMicromarketDropdown(false)
        setFilteredMicromarkets([])
    }

    // Builder name functions
    const handleBuilderNameChange = (value: string) => {
        setBuilderName(value)
        if (value.trim()) {
            dispatch(searchBuilderNames(value))
            setShowBuilderDropdown(true)
        } else {
            setShowBuilderDropdown(false)
            dispatch(clearFilteredBuilderNames())
        }
    }

    const selectBuilderName = (selectedName: string) => {
        setBuilderName(selectedName)
        setShowBuilderDropdown(false)
    }

    const resetForm = () => {
        setAgentPhone('')
        setAgentId('')
        setName('')
        setProjectName('')
        setRequirementDetails('')
        setAssetType('')
        setConfiguration('')
        setArea('')
        setBudgetFrom('')
        setBudgetTo('')
        setAsMarketPrice(false)
        setMicromarket('')
        setShowMicromarketDropdown(false)
        setFilteredMicromarkets([])
        setBuilderName('')
        setShowBuilderDropdown(false)
        setErrorMessage('')
        dispatch(clearFilteredBuilderNames())
    }

    const handleSubmit = async () => {
        const from = parseFloat(budgetFrom)
        const to = parseFloat(budgetTo)
        const froml = from * 100000
        const tol = to * 100000

        // Validation
        if (!asMarketPrice && !isNaN(froml) && !isNaN(tol) && froml >= tol) {
            setErrorMessage('Budget "From" must be less than "To"')
            return
        }

        if (!projectName || !assetType || (!asMarketPrice && (!budgetFrom || !budgetTo))) {
            setErrorMessage('Please fill all required fields marked with *')
            return
        }

        setBudgetFrom(froml.toString())
        setBudgetTo(tol.toString())

        setErrorMessage('')

        try {
            // Check if builder name is new and needs to be added
            if (builderName && !builderNames.allNames.includes(builderName)) {
                await dispatch(addBuilderName(builderName)).unwrap()
            }

            const requirementData = {
                agentPhone,
                //agentId: agentId || cpId, // Use cpId as fallback if agentId is empty
                name: name,
                projectName,
                requirementDetails,
                assetType,
                configuration: assetType === 'plot' ? '' : configuration,
                area,
                budgetFrom: asMarketPrice ? '' : budgetFrom,
                budgetTo: asMarketPrice ? '' : budgetTo,
                asMarketPrice,
                micromarket,
                builderName,
                cpId: agentId || cpId,
                kamId: kamId,
                kamName: kamName,
                kamPhoneNumber: kamPhoneNumber,
            }

            await dispatch(createRequirement(requirementData)).unwrap()
            toast.success('Requirement successfully added!')

            // Success - reset form and close modal
            resetForm()
            onClose()
        } catch (error: any) {
            toast.error('Failed to create requirement')
            setErrorMessage(error || 'Failed to create requirement')
        }
    }

    const fetchAgent = async () => {
        if (!agentPhone.trim()) {
            setErrorMessage('Please enter a phone number')
            return
        }

        setErrorMessage('')

        try {
            const agentData = await dispatch(fetchAgentByPhone(agentPhone.trim())).unwrap()

            // Fill the agent details in the form
            setAgentId(agentData.cpId)
            setName(agentData.name) // Fixed: use agentName instead of name

            console.log('✅ Agent details filled:', agentData)
        } catch (error: any) {
            setErrorMessage(error || 'Failed to fetch agent details')
            // Clear agent fields if fetch fails
            setAgentId('')
            setName('')
        }
    }

    if (!isOpen) return null

    return (
        <>
            <div className='fixed top-0 left-0 w-[70%] h-full bg-black opacity-50 z-40' onClick={onClose} />

            <div className='fixed right-0 top-0 h-full w-[30%] bg-white z-50 shadow-lg flex flex-col'>
                {/* Header */}
                <div className='p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0'>
                    <h2 className='text-xl font-semibold text-gray-900'>Requirement Form</h2>
                    <button onClick={onClose} className='bg-gray-100 p-2 rounded-3xl cursor-pointer'>
                        <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                            />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className='overflow-y-auto p-4 flex-1 space-y-4'>
                    {/* Agent Phone Section */}
                    <div>
                        <label className='block text-sm py-2 text-gray-600'>Agent phone no.</label>
                        <div className='flex gap-2'>
                            <input
                                type='text'
                                value={agentPhone}
                                onChange={(e) => setAgentPhone(e.target.value)}
                                placeholder='Type here'
                                className='flex-1 p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                            />
                            <button
                                onClick={fetchAgent}
                                disabled={agentLoading}
                                className='px-4 py-2 bg-black text-white rounded text-sm hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {agentLoading ? 'Fetching...' : 'Fetch Agent'}
                            </button>
                        </div>
                    </div>

                    {/* Agent Details */}
                    <div className='flex gap-2'>
                        <div className='flex-1'>
                            <input
                                type='text'
                                value={agentId}
                                onChange={(e) => setAgentId(e.target.value)}
                                placeholder='Agent ID'
                                className='w-full p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400 bg-gray-100'
                                readOnly
                            />
                        </div>
                        <div className='flex-1'>
                            <input
                                type='text'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder='Agent name'
                                className='w-full p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400 bg-gray-100'
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Project Name */}
                    <div>
                        <label className='block text-sm py-2 text-gray-600'>
                            Project Name / Location <span className='text-red-500'>*</span>
                        </label>
                        <input
                            type='text'
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder='Type here'
                            className='w-full p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                        />
                    </div>

                    {/* Micromarket with Autocomplete */}
                    <div className='relative'>
                        <label className='block text-sm py-2 text-gray-600'>Micromarket</label>
                        <input
                            type='text'
                            value={micromarket}
                            onChange={(e) => handleMicromarketChange(e.target.value)}
                            placeholder='Type micromarket name'
                            className='w-full p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                            onFocus={() => {
                                if (micromarket.trim()) {
                                    setShowMicromarketDropdown(true)
                                } else if (micromarkets.length > 0) {
                                    setFilteredMicromarkets(micromarkets)
                                    setShowMicromarketDropdown(true)
                                }
                            }}
                            onBlur={() => {
                                // Delay hiding dropdown to allow click on options
                                setTimeout(() => setShowMicromarketDropdown(false), 150)
                            }}
                        />

                        {/* Micromarket Dropdown */}
                        {showMicromarketDropdown && filteredMicromarkets.length > 0 && (
                            <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto'>
                                {filteredMicromarkets.map((mm, index) => (
                                    <div
                                        key={index}
                                        className='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                                        onMouseDown={(e) => {
                                            // Prevent blur event from firing
                                            e.preventDefault()
                                            selectMicromarket(mm.name)
                                        }}
                                    >
                                        {mm.name}
                                        <span className='ml-2 text-xs text-gray-500'>({mm.zone})</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {constantsLoading.micromarkets && (
                            <div className='text-xs text-gray-500 mt-1'>Loading micromarkets...</div>
                        )}
                    </div>

                    {/* Builder Name with Autocomplete */}
                    <div className='relative'>
                        <label className='block text-sm py-2 text-gray-600'>Builder Name</label>
                        <input
                            type='text'
                            value={builderName}
                            onChange={(e) => handleBuilderNameChange(e.target.value)}
                            placeholder='Type builder name'
                            className='w-full p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                            onFocus={() => {
                                if (builderName.trim()) {
                                    setShowBuilderDropdown(true)
                                } else if (builderNames.allNames.length > 0) {
                                    setShowBuilderDropdown(true)
                                }
                            }}
                            onBlur={() => {
                                // Delay hiding dropdown to allow click on options
                                setTimeout(() => setShowBuilderDropdown(false), 150)
                            }}
                        />

                        {/* Builder Dropdown */}
                        {showBuilderDropdown && builderNames.filteredNames.length > 0 && (
                            <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto'>
                                {builderNames.filteredNames.map((builderNameItem, index) => (
                                    <div
                                        key={index}
                                        className='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                                        onMouseDown={(e) => {
                                            // Prevent blur event from firing
                                            e.preventDefault()
                                            selectBuilderName(builderNameItem)
                                        }}
                                    >
                                        {builderNameItem}
                                        {builderNames.userAdded.includes(builderNameItem) && (
                                            <span className='ml-2 text-xs text-blue-500'>(User Added)</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {constantsLoading.builderNames && (
                            <div className='text-xs text-gray-500 mt-1'>Loading builder names...</div>
                        )}
                    </div>

                    {/* Requirement Details */}
                    <div>
                        <label className='block text-sm py-2 text-gray-600'>Requirement Details</label>
                        <textarea
                            value={requirementDetails}
                            onChange={(e) => setRequirementDetails(e.target.value)}
                            placeholder='Enter the details'
                            className='w-full h-20 p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400 resize-none'
                        />
                    </div>

                    {/* Asset Type */}
                    <div>
                        <label className='block text-sm py-2 text-gray-600'>
                            Asset Type <span className='text-red-500'>*</span>
                        </label>
                        <select
                            value={assetType}
                            onChange={(e) => setAssetType(e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded text-[14px] text-black'
                        >
                            <option value='' disabled>
                                Select Asset Type
                            </option>
                            <option value='apartment'>Apartment</option>
                            <option value='villa'>Villa</option>
                            <option value='plot'>Plot</option>
                            <option value='commercial'>Commercial</option>
                            <option value='warehouse'>Warehouse</option>
                            <option value='office'>Office</option>
                        </select>
                    </div>

                    {/* Configuration and Area */}
                    <div className='flex gap-4'>
                        <div className='flex-1'>
                            <label className='block text-sm py-2 text-gray-600'>
                                Configuration <span className='text-red-500'>*</span>
                            </label>
                            <select
                                value={configuration}
                                onChange={(e) => setConfiguration(e.target.value)}
                                disabled={assetType === 'plot'}
                                className={`w-full p-2 border border-gray-300 rounded text-[14px] text-black ${
                                    assetType === 'plot' ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                            >
                                <option value='' disabled>
                                    Select Configuration
                                </option>
                                <option value='1bhk'>1 BHK</option>
                                <option value='2bhk'>2 BHK</option>
                                <option value='3bhk'>3 BHK</option>
                                <option value='4bhk'>4 BHK</option>
                                <option value='5bhk'>5 BHK</option>
                            </select>
                        </div>
                        <div className='flex-1'>
                            <label className='block text-sm py-2 text-gray-600'>Area (Sqft)</label>
                            <input
                                type='number'
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                placeholder='0000'
                                className='w-full p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                            />
                        </div>
                    </div>

                    {/* Budget */}
                    <div>
                        <label className='block text-sm py-2 text-gray-600'>
                            Budget (Lakhs) <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex gap-2 mb-2'>
                            <input
                                type='number'
                                value={budgetFrom}
                                onChange={(e) => setBudgetFrom(e.target.value)}
                                placeholder='From'
                                disabled={asMarketPrice}
                                className={`flex-1 p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400 ${
                                    asMarketPrice ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                            />
                            <span className='flex items-center text-gray-500'>To</span>
                            <input
                                type='number'
                                value={budgetTo}
                                onChange={(e) => setBudgetTo(e.target.value)}
                                placeholder='To'
                                disabled={asMarketPrice}
                                className={`flex-1 p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400 ${
                                    asMarketPrice ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                            />
                        </div>
                        <div className='flex items-center'>
                            <input
                                type='checkbox'
                                id='asMarketPrice'
                                checked={asMarketPrice}
                                onChange={(e) => setAsMarketPrice(e.target.checked)}
                                className='mr-2'
                            />
                            <label htmlFor='asMarketPrice' className='text-sm text-gray-600'>
                                As per Market Price
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='p-4 border-t border-gray-200 flex flex-col gap-3 flex-shrink-0'>
                    {(errorMessage || error || constantsError.micromarkets || constantsError.builderNames) && (
                        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm'>
                            {errorMessage || error || constantsError.micromarkets || constantsError.builderNames}
                        </div>
                    )}
                    <div className='flex justify-end gap-3'>
                        <button
                            onClick={resetForm}
                            disabled={loading}
                            className='px-4 py-2 rounded-lg bg-gray-100 text-gray-700 cursor-pointer disabled:opacity-50 hover:bg-gray-200'
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || constantsLoading.addingBuilder}
                            className='px-4 py-2 bg-black text-white rounded-lg cursor-pointer disabled:opacity-50 hover:bg-teal-800'
                        >
                            {loading || constantsLoading.addingBuilder ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
