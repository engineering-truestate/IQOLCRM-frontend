import { useState, useEffect } from 'react'
import phoneIcon from '/icons/acn/phone1.svg'
import chevronUp from '/icons/acn/chevron-up.svg'
import chevronDown from '/icons/acn/chevron-down.svg'
import calendarIcon from '/icons/acn/calendar.svg'
import walletAdd from '/icons/acn/wallet-add.svg'
import editButton from '/icons/acn/editButton.svg'
import StateBaseTextField from '../design-elements/StateBaseTextField'
import Dropdown from '../design-elements/Dropdown'
import { updateAgentDetailsThunk, upgradeUserPlan } from '../../services/acn/agents/agentThunkService'
import type { IAgent } from '../../data_types/acn/types'
import { useDispatch } from 'react-redux'
import type { AppDispatch, RootState } from '../../store'
import { toCapitalizedWords } from '../helper/toCapitalize'
import { getAgentFacetValues } from '../../services/acn/agents/algoliaAgentsService'
import { useSelector } from 'react-redux'
import ConfirmModal from './ConfirmModal' // Add this import
import { toast } from 'react-toastify'

interface DropdownProps {
    setIsNotesModalOpen: (open: boolean) => void
    setIsCallModalOpen: (open: boolean) => void
    setIsAddCreditsModalOpen: (open: boolean) => void
}

// Helper function to format field names for display
const formatFieldName = (key: string): string => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim()
}

// Helper function to format values for display
const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A'

    // Handle timestamps (convert to readable date)
    if (typeof value === 'number' && value > 1000000000 && value < 9999999999) {
        return new Date(value * 1000).toLocaleDateString()
    }

    // Handle objects/arrays
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return `${value.length} items`
        }
        return '[Object]'
    }

    // Handle booleans
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No'
    }

    return String(value)
}

export default function AgentDetailsDropdown({
    setIsNotesModalOpen,
    setIsCallModalOpen,
    setIsAddCreditsModalOpen,
}: DropdownProps) {
    const dispatch = useDispatch<AppDispatch>()
    const agentDetails = useSelector((state: RootState) => state.agents.agentDetails)
    const upgradeLoading = useSelector((state: RootState) => state.agents.upgradeLoading)
    const upgradeError = useSelector((state: RootState) => state.agents.upgradeError)

    console.log(agentDetails, 'page')

    // get loading state from redux
    const [loading, setLoading] = useState(false)
    // State for the main dropdown visibiliy
    const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false)
    // Add confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    //const [showSuccessAlert, setShowSuccessAlert] = useState(false)

    // State for individual sections
    const [openSections, setOpenSections] = useState({
        userDetails: true,
        planDetails: true,
        resaleDetails: true,
        rentalDetails: true,
        enquiryDetails: true,
        credits: true,
    })

    // State for edit mode and editable user details
    const [isEditingUserDetails, setIsEditingUserDetails] = useState(false)
    const [editableUserDetails, setEditableUserDetails] = useState({
        phoneNumber: agentDetails?.phoneNumber || '',
        Address: agentDetails?.workAddress || '',
        mail: agentDetails?.emailAddress || '',
        firm: agentDetails?.firmName || '',
        areaOfOperation: '',
        kam: agentDetails?.kamName || '',
        inWhatsappCommunity:
            agentDetails && typeof (agentDetails as IAgent).inWhatsappCommunity === 'boolean'
                ? String((agentDetails as IAgent).inWhatsappCommunity)
                : '',
        inWhatsappBroadcast:
            agentDetails && typeof agentDetails.onBroadcast === 'boolean' ? String(agentDetails.onBroadcast) : '',
    })

    // Placeholder dropdown options
    const areaOfOperationOptions = [
        'North Bangalore',
        'South Bangalore',
        'East Bangalore',
        'West Bangalore',
        'Pan Bangalore',
    ]
    // KAM options from Algolia facet
    const [kamOptions, setKamOptions] = useState<{ value: string; label: string }[]>([])
    const [kamLoading, setKamLoading] = useState(false)

    useEffect(() => {
        setKamLoading(true)
        getAgentFacetValues('kamName')
            .then((facetValues) => {
                setKamOptions(facetValues.map((f) => ({ value: f.value, label: f.value })))
            })
            .finally(() => setKamLoading(false))
    }, [])

    const yesNoOptions = [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
    ]

    const toggleMainDropdown = () => {
        setIsMainDropdownOpen(!isMainDropdownOpen)
    }

    const toggleSection = (section: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section as keyof typeof prev],
        }))
    }

    const handleEditUserDetails = () => setIsEditingUserDetails(true)
    const handleCancelEditUserDetails = () => {
        setIsEditingUserDetails(false)
        setEditableUserDetails({
            phoneNumber: agentDetails?.phoneNumber || '',
            Address: agentDetails?.workAddress || '',
            mail: agentDetails?.emailAddress || '',
            firm: agentDetails?.firmName || '',
            areaOfOperation: '',
            kam: agentDetails?.kamName || '',
            inWhatsappCommunity:
                agentDetails && typeof (agentDetails as any).inWhatsappCommunity === 'boolean'
                    ? String((agentDetails as any).inWhatsappCommunity)
                    : '',
            inWhatsappBroadcast:
                agentDetails && typeof agentDetails.onBroadcast === 'boolean' ? String(agentDetails.onBroadcast) : '',
        })
    }

    const handleSaveUserDetails = async () => {
        // Convert to string 'true'/'false' for inWhatsappCommunity and inWhatsappBroadcast
        const updatedDetails = {
            ...agentDetails,
            phoneNumber: editableUserDetails.phoneNumber,
            workAddress: editableUserDetails.Address,
            emailAddress: editableUserDetails.mail,
            firmName: editableUserDetails.firm,
            areaOfOperation: editableUserDetails.areaOfOperation,
            kamName: editableUserDetails.kam,
            inWhatsappCommunity: editableUserDetails.inWhatsappCommunity === 'true',
            onBroadcast: editableUserDetails.inWhatsappBroadcast,
        }
        console.log(updatedDetails, 'updatedDetails')
        setLoading(true)
        await dispatch(
            updateAgentDetailsThunk({
                cpId: agentDetails?.cpId as string,
                agentDetails: updatedDetails as unknown as IAgent,
            }),
        )
        setLoading(false)
        console.log('updatedDetails')
        setIsEditingUserDetails(false)
    }

    const handleUserDetailChange = (field: string, value: any) => {
        setEditableUserDetails((prev) => ({ ...prev, [field]: value }))
    }

    // Updated upgrade plan handler with confirmation
    const handleUpgradePlan = () => {
        setShowConfirmModal(true)
    }

    const confirmUpgrade = async () => {
        setShowConfirmModal(false)
        if (agentDetails?.cpId) {
            try {
                await dispatch(upgradeUserPlan({ cpId: agentDetails.cpId })).unwrap()
                console.log('✅ Plan upgraded successfully')
                toast.success('Plan upgraded successfully')
            } catch (error) {
                console.error('❌ Failed to upgrade plan:', error)
                toast.error('Failed to upgrade plan')
            }
        }
    }

    const cancelUpgrade = () => {
        setShowConfirmModal(false)
    }

    if (!agentDetails) {
        return (
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                <div className='animate-pulse'>
                    <div className='h-4 bg-gray-200 rounded w-1/4 mb-2'></div>
                    <div className='h-3 bg-gray-100 rounded w-full mb-1'></div>
                    <div className='h-3 bg-gray-100 rounded w-3/4'></div>
                </div>
            </div>
        )
    }

    const userDetailsFields = {
        phoneNumber: agentDetails?.phoneNumber ? String(agentDetails.phoneNumber) : '',
        Address: agentDetails?.workAddress ? String(agentDetails.workAddress) : '',
        mail: agentDetails?.emailAddress ? String(agentDetails.emailAddress) : '',
        firm: agentDetails?.firmName ? String(agentDetails.firmName) : '',
        areaOfOperation: (agentDetails as any)?.areaOfOperation ? String((agentDetails as any).areaOfOperation) : '',
        kam: agentDetails?.kamName ? String(agentDetails.kamName) : '',
        inWhatsappCommunity: (agentDetails as any)?.inWhatsappCommunity
            ? String((agentDetails as any).inWhatsappCommunity)
            : (agentDetails as any)?.inWhatsappCommunity,
        inWhatsappBroadcast: agentDetails?.onBroadcast ? String(agentDetails.onBroadcast) : agentDetails?.onBroadcast,
    }

    const planDetailsFields = {
        Plan: agentDetails.userType,
        Expiry: agentDetails.planExpiry,
    }

    const resaleDetailsFields = {
        inventory: agentDetails.noOfInventories,
        Requirement: agentDetails.noOfRequirements,
        EnquiriesDid: agentDetails.noOfEnquiries,
        EnquiriesReceived: '',
    }

    const rentalDetailsFields = {
        inventory: agentDetails.noOfInventories,
        Requirement: agentDetails.noOfRequirements,
        EnquiriesDid: agentDetails.noOfEnquiries,
        EnquiriesReceived: '',
    }

    const enquiryDetailsFields = {
        enquiryToday: '',
        enquiryThisWeek: '',
        enquiryThisMonth: '',
    }

    const creditsFields = {
        monthly: agentDetails.monthlyCredits,
        purchased: '',
    }

    const renderSection = (title: string, fields: any, sectionKey: string) => {
        const isOpen = openSections[sectionKey as keyof typeof openSections]

        // Special handling for Plan Details section with upgrade button
        if (sectionKey === 'planDetails') {
            return (
                <div className='border-b-1 border-[#D3D4DD] overflow-y-auto'>
                    <button
                        onClick={() => toggleSection(sectionKey)}
                        className='w-full px-4 py-3 transition-colors duration-200 flex justify-between items-center text-left cursor-pointer'
                    >
                        <span className='font-medium text-gray-900 text-sm'>{title}</span>
                        {isOpen ? (
                            <img src={chevronUp} alt='Chevron Up' className='w-4 h-4 text-gray-500' />
                        ) : (
                            <img src={chevronDown} alt='Chevron Down' className='w-4 h-4 text-gray-500' />
                        )}
                    </button>

                    {isOpen && (
                        <div className='px-4 py-2 bg-white'>
                            {Object.entries(fields).map(([key, value]) =>
                                value !== undefined && value !== null ? (
                                    <div key={key} className='flex justify-between items-center py-1.5 first:mt-[-5%]'>
                                        <span className='text-xs text-gray-600'>{formatFieldName(key)}</span>
                                        <div className='w-[50%]'>
                                            <span className='text-xs text-gray-900 font-medium truncate'>
                                                {formatValue(value)}
                                            </span>
                                        </div>
                                    </div>
                                ) : null,
                            )}

                            {/* Upgrade Button */}
                            <div className='mt-3 pt-2 border-t border-gray-100'>
                                <button
                                    onClick={handleUpgradePlan}
                                    disabled={upgradeLoading || agentDetails.userType === 'premium'}
                                    className={`w-full px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                                        agentDetails.userType === 'premium'
                                            ? 'bg-black text-white cursor-not-allowed'
                                            : upgradeLoading
                                              ? 'bg-black text-white cursor-not-allowed'
                                              : 'bg-black text-white'
                                    }`}
                                >
                                    {agentDetails.userType === 'premium'
                                        ? 'Premium Plan Active'
                                        : upgradeLoading
                                          ? 'Upgrading...'
                                          : 'Upgrade to Premium'}
                                </button>

                                {upgradeError && (
                                    <div className='mt-2 text-xs text-red-600 bg-red-50 p-2 rounded'>
                                        {upgradeError}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )
        }

        // Special handling for User Details section
        if (sectionKey === 'userDetails') {
            return (
                <div className='border-b-1 border-[#D3D4DD] overflow-y-auto'>
                    <div className='w-full px-4 py-3 flex gap-2 items-center'>
                        <span className='font-medium text-gray-900 text-sm'>{title}</span>
                        {!isEditingUserDetails ? (
                            <button onClick={handleEditUserDetails}>
                                <img src={editButton} alt='Edit' className='w-4 h-4 cursor-pointer' />
                            </button>
                        ) : null}
                    </div>
                    {isOpen && (
                        <div className='px-4 py-2 bg-white'>
                            {!isEditingUserDetails ? (
                                Object.entries(fields).map(([key, value]) =>
                                    value !== undefined && value !== null ? (
                                        <div
                                            key={key}
                                            className='flex justify-between items-center py-1.5 first:mt-[-5%]'
                                        >
                                            <span className='text-xs text-gray-600'>{formatFieldName(key)}</span>
                                            <div className='w-[50%]'>
                                                <span className='text-xs text-gray-900 font-medium'>
                                                    {(key === 'inWhatsappCommunity' || key === 'inWhatsappBroadcast') &&
                                                    (value === 'true' || value === true)
                                                        ? 'Yes'
                                                        : (key === 'inWhatsappCommunity' ||
                                                                key === 'inWhatsappBroadcast') &&
                                                            (value === 'false' || value === false)
                                                          ? 'No'
                                                          : formatValue(value)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : null,
                                )
                            ) : loading ? (
                                <div className='flex justify-between items-center py-1.5'>
                                    <span className='text-xs text-gray-600'>Loading...</span>
                                </div>
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        handleSaveUserDetails()
                                    }}
                                >
                                    {/* phoneNumber */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>Phone Number</span>
                                        <div className='w-fit'>
                                            <StateBaseTextField
                                                value={String(editableUserDetails.phoneNumber)}
                                                onChange={(e) => handleUserDetailChange('phoneNumber', e.target.value)}
                                                status='default'
                                                fullWidth
                                                placeholder='Phone Number'
                                            />
                                        </div>
                                    </div>
                                    {/* Address */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>Address</span>
                                        <div className='w-fit'>
                                            <StateBaseTextField
                                                value={String(editableUserDetails.Address)}
                                                onChange={(e) => handleUserDetailChange('Address', e.target.value)}
                                                status='default'
                                                fullWidth
                                                placeholder='Address'
                                            />
                                        </div>
                                    </div>
                                    {/* mail */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>Mail</span>
                                        <div className='w-fit'>
                                            <StateBaseTextField
                                                value={String(editableUserDetails.mail)}
                                                onChange={(e) => handleUserDetailChange('mail', e.target.value)}
                                                status='default'
                                                fullWidth
                                                placeholder='Mail'
                                            />
                                        </div>
                                    </div>
                                    {/* firm */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>Firm</span>
                                        <div className='w-fit'>
                                            <StateBaseTextField
                                                value={String(editableUserDetails.firm)}
                                                onChange={(e) => handleUserDetailChange('firm', e.target.value)}
                                                status='default'
                                                fullWidth
                                                placeholder='Firm'
                                            />
                                        </div>
                                    </div>
                                    {/* areaOfOperation dropdown */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>Area of Operation</span>
                                        <div className='w-fit'>
                                            <Dropdown
                                                options={areaOfOperationOptions.map((area) => ({
                                                    value: area,
                                                    label: area,
                                                }))}
                                                value={String(editableUserDetails.areaOfOperation)}
                                                onSelect={(value) => handleUserDetailChange('areaOfOperation', value)}
                                                placeholder='Area of Operation'
                                                triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                                menuClassName='absolute w-full top-8 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                                optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                                            />
                                        </div>
                                    </div>
                                    {/* kam dropdown */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>KAM</span>
                                        <div className='w-fit'>
                                            {kamLoading ? (
                                                <span className='text-xs text-gray-400'>Loading...</span>
                                            ) : (
                                                <Dropdown
                                                    options={kamOptions}
                                                    value={String(editableUserDetails.kam)}
                                                    onSelect={(value) => handleUserDetailChange('kam', value)}
                                                    placeholder='KAM'
                                                    triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                                    menuClassName='absolute w-full top-8 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                                    optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                                                />
                                            )}
                                        </div>
                                    </div>
                                    {/* inWhatsappCommunity dropdown */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>In Whatsapp Community</span>
                                        <div className='w-fit'>
                                            <Dropdown
                                                options={yesNoOptions}
                                                value={String(editableUserDetails.inWhatsappCommunity)}
                                                onSelect={(value) =>
                                                    handleUserDetailChange('inWhatsappCommunity', value)
                                                }
                                                placeholder='In Whatsapp Community'
                                                triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                                menuClassName='absolute w-full top-8 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                                optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                                            />
                                        </div>
                                    </div>
                                    {/* inWhatsappBroadcast dropdown */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>In Whatsapp Broadcast</span>
                                        <div className='w-fit'>
                                            <Dropdown
                                                options={yesNoOptions}
                                                value={String(editableUserDetails.inWhatsappBroadcast)}
                                                onSelect={(value) =>
                                                    handleUserDetailChange('inWhatsappBroadcast', value)
                                                }
                                                placeholder='In Whatsapp Broadcast'
                                                triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                                menuClassName='absolute w-full top-8 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                                optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                                            />
                                        </div>
                                    </div>
                                    {/* Save/Cancel buttons */}
                                    <div className='flex gap-2 mt-2'>
                                        <button
                                            type='submit'
                                            className='bg-blue-600 text-white text-xs px-3 py-1 rounded'
                                        >
                                            Save
                                        </button>
                                        <button
                                            type='button'
                                            className='bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded'
                                            onClick={handleCancelEditUserDetails}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            )
        }

        return (
            <div className='border-b-1 border-[#D3D4DD] overflow-y-auto'>
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className='w-full px-4 py-3  transition-colors duration-200 flex justify-between items-center text-left cursor-pointer'
                >
                    <span className='font-medium text-gray-900 text-sm'>{title}</span>
                    {isOpen ? (
                        <img src={chevronUp} alt='Chevron Up' className='w-4 h-4 text-gray-500' />
                    ) : (
                        <img src={chevronDown} alt='Chevron Down' className='w-4 h-4 text-gray-500' />
                    )}
                </button>

                {isOpen && (
                    <div className='px-4 py-2 bg-white'>
                        {Object.entries(fields).map(([key, value]) =>
                            value !== undefined && value !== null ? (
                                <div key={key} className='flex justify-between items-center py-1.5 first:mt-[-5%]'>
                                    <span className='text-xs text-gray-600'>{formatFieldName(key)}</span>
                                    <div className='w-[50%]'>
                                        <span className='text-xs text-gray-900 font-medium truncate'>
                                            {(key === 'inWhatsappCommunity' || key === 'inWhatsappBroadcast') &&
                                            (value === 'true' || value === true)
                                                ? 'Yes'
                                                : (key === 'inWhatsappCommunity' || key === 'inWhatsappBroadcast') &&
                                                    (value === 'false' || value === false)
                                                  ? 'No'
                                                  : formatValue(value)}
                                        </span>
                                    </div>
                                </div>
                            ) : null,
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className=' mx-auto bg-gray-50 overflow-y-auto'>
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <ConfirmModal
                    title='Upgrade Plan'
                    message="Are you sure you want to upgrade this agent's plan to Premium? This action will update their plan expiry, renewal date, and credits."
                    onConfirm={confirmUpgrade}
                    onCancel={cancelUpgrade}
                />
            )}

            {/* Loading Modal */}
            {upgradeLoading && (
                <ConfirmModal
                    title='Upgrading Plan'
                    message=''
                    onConfirm={() => {}}
                    onCancel={() => {}}
                    generatingEnquiry={true}
                />
            )}

            {/* Header - Now clickable */}
            <div className='bg-white px-4 py-4 w-full'>
                <div className='flex items-center justify-between cursor-pointer' onClick={toggleMainDropdown}>
                    {/* Left: Avatar + Name + ID */}
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center'>
                            <span className='text-sm font-medium text-gray-600'>
                                {agentDetails.name
                                    ?.toString()
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('') || 'HR'}
                            </span>
                        </div>
                        <div className='flex flex-col'>
                            <span className='font-semibold text-gray-900 text-sm'>
                                {agentDetails.name || 'Agent Name'}
                            </span>
                            <span className='text-xs text-gray-500'>
                                {agentDetails.cpId} | {agentDetails.phoneNumber}
                            </span>
                        </div>
                    </div>

                    {/* Right: Chevron */}
                    <button onClick={toggleMainDropdown}>
                        {isMainDropdownOpen ? (
                            <img src={chevronUp} alt='Chevron Up' className='w-4 h-4 text-gray-500' />
                        ) : (
                            <img src={chevronDown} alt='Chevron Down' className='w-4 h-4 text-gray-500' />
                        )}
                    </button>
                </div>

                {/* Bottom Row: Credits / Plan / Icons */}
                <div className=' flex items-center justify-between text-xs'>
                    {/* Credits + Plan */}
                    <div className='flex gap-4'>
                        <div className='text-gray-600'>
                            <span className='text-gray-500'>Credits: </span>
                            <span className='font-semibold text-black'>{agentDetails.monthlyCredits || 0}</span>
                        </div>
                        <div className='text-gray-600'>
                            <span className='text-gray-500'>Plan: </span>
                            <span className='font-semibold text-black capitalize'>
                                {toCapitalizedWords(agentDetails.userType as string) || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Action Icons */}
                    <div className='flex items-center gap-2'>
                        <button className='bg-gray-100 p-1.5 rounded cursor-pointer'>
                            <img
                                src={phoneIcon}
                                alt='Phone Icon'
                                onClick={() => setIsCallModalOpen(true)}
                                className='w-6 h-6'
                            />
                        </button>
                        <button className='bg-gray-100 p-1.5 rounded cursor-pointer'>
                            <img
                                src={calendarIcon}
                                alt='Calendar Icon'
                                onClick={() => setIsNotesModalOpen(true)}
                                className='w-6 h-6'
                            />
                        </button>
                        <button className='bg-gray-100 p-1.5 rounded cursor-pointer'>
                            <img
                                src={walletAdd}
                                alt='Wallet Add Icon'
                                onClick={() => setIsAddCreditsModalOpen(true)}
                                className='w-6 h-6'
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sections - Now conditionally rendered based on main dropdown state */}
            {isMainDropdownOpen && (
                <div className='bg-white border-y border-gray-200 overflow-hidden'>
                    {renderSection('User Details', userDetailsFields, 'userDetails')}
                    {renderSection('Plan Details', planDetailsFields, 'planDetails')}
                    {renderSection('Resale Details', resaleDetailsFields, 'resaleDetails')}
                    {renderSection('Rental Details', rentalDetailsFields, 'rentalDetails')}
                    {renderSection('Enquiry Details', enquiryDetailsFields, 'enquiryDetails')}
                    {renderSection('Credits', creditsFields, 'credits')}
                </div>
            )}
        </div>
    )
}
