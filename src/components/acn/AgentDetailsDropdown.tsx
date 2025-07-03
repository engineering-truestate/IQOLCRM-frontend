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
import ConfirmModal from './ConfirmModal'
import { toast } from 'react-toastify'
import useAuth from '../../hooks/useAuth'

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

    // Handle arrays (for multi-select values)
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : 'N/A'
    }

    // Handle objects/arrays
    if (typeof value === 'object') {
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

    const { platform } = useAuth()
    const acnRole = platform?.acn?.role

    // Check if user can edit KAM (marketing or kamModerator)
    const canEditKam = acnRole === 'marketing' || acnRole === 'kamModerator'

    // Check if user can upgrade plan (only kamModerator)
    const canUpgradePlan = acnRole === 'kamModerator'

    // get loading state from redux
    const [loading, setLoading] = useState(false)
    // State for the main dropdown visibiliy
    const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false)
    // Add confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [upgradeType, setUpgradeType] = useState<'trial' | 'premium'>('premium')

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
        name: agentDetails?.name || '', // Added name field
        phoneNumber: agentDetails?.phoneNumber || '',
        Address: agentDetails?.workAddress || '',
        mail: agentDetails?.emailAddress || '',
        firm: agentDetails?.firmName || '',
        areaOfOperation: (agentDetails as any)?.areaOfOperation || [], // Changed to array for multi-select
        kam: agentDetails?.kamName || '',
        inWhatsappCommunity:
            agentDetails && typeof (agentDetails as IAgent).inWhatsappCommunity === 'boolean'
                ? String((agentDetails as IAgent).inWhatsappCommunity)
                : '',
        inWhatsappBroadcast:
            agentDetails && typeof agentDetails.onBroadcast === 'boolean' ? String(agentDetails.onBroadcast) : '',
    })

    // Area of operation options for multi-select
    const areaOfOperationOptions = [
        { value: 'north bangalore', label: 'North Bangalore' },
        { value: 'south bangalore', label: 'South Bangalore' },
        { value: 'east bangalore', label: 'East Bangalore' },
        { value: 'west bangalore', label: 'West Bangalore' },
        { value: 'pan bangalore', label: 'Pan Bangalore' },
    ]

    // KAM options from Algolia facet
    const [kamOptions, setKamOptions] = useState<{ value: string; label: string }[]>([])
    const [kamLoading, setKamLoading] = useState(false)

    useEffect(() => {
        if (canEditKam) {
            setKamLoading(true)
            getAgentFacetValues('kamName')
                .then((facetValues) => {
                    setKamOptions(facetValues.map((f) => ({ value: f.value, label: f.value })))
                })
                .finally(() => setKamLoading(false))
        }
    }, [canEditKam])

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
            name: agentDetails?.name || '', // Reset name field
            phoneNumber: agentDetails?.phoneNumber || '',
            Address: agentDetails?.workAddress || '',
            mail: agentDetails?.emailAddress || '',
            firm: agentDetails?.firmName || '',
            areaOfOperation: (agentDetails as any)?.areaOfOperation || [], // Reset to array
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
            name: editableUserDetails.name, // Added name field
            phoneNumber: editableUserDetails.phoneNumber,
            workAddress: editableUserDetails.Address,
            emailAddress: editableUserDetails.mail,
            firmName: editableUserDetails.firm,
            areaOfOperation: editableUserDetails.areaOfOperation, // Multi-select array
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

    // Multi-select handler for area of operation
    const handleAreaOfOperationChange = (selectedOptions: any[]) => {
        const selectedValues = selectedOptions.map((option) => option.value)
        setEditableUserDetails((prev) => ({ ...prev, areaOfOperation: selectedValues }))
    }

    // Updated upgrade plan handlers with plan type
    const handleUpgradePlan = (planType: 'trial' | 'premium') => {
        setUpgradeType(planType)
        setShowConfirmModal(true)
    }

    const handleAddCreditsClick = () => {
        // Check if user has permission to add credits
        if (acnRole === 'kamModerator' || acnRole === 'marketing') {
            setIsAddCreditsModalOpen(true)
        } else {
            toast.error(
                'You do not have permission to add credits. Only KAM Moderator and Marketing team can add credits.',
            )
        }
    }

    const confirmUpgrade = async () => {
        setShowConfirmModal(false)
        if (agentDetails?.cpId) {
            try {
                await dispatch(upgradeUserPlan({ cpId: agentDetails.cpId, planType: upgradeType })).unwrap()
                console.log('✅ Plan upgraded successfully')
                toast.success(`Plan upgraded to ${upgradeType} successfully`)
            } catch (error) {
                console.error('❌ Failed to upgrade plan:', error)
                toast.error('Failed to upgrade plan')
            }
        }
    }

    const cancelUpgrade = () => {
        setShowConfirmModal(false)
    }

    // Helper function to determine available upgrade options
    const getUpgradeOptions = () => {
        const userType = agentDetails?.userType
        const trialUsed = (agentDetails as any)?.trialUsed

        if (userType === 'premium') {
            return { showTrial: false, showPremium: false }
        }

        if (userType === 'trial') {
            return { showTrial: false, showPremium: true }
        }

        if (userType === 'basic') {
            if (trialUsed === false) {
                return { showTrial: true, showPremium: true }
            } else {
                return { showTrial: false, showPremium: true }
            }
        }

        return { showTrial: false, showPremium: true }
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
        name: agentDetails?.name ? String(agentDetails.name) : '', // Added name field
        phoneNumber: agentDetails?.phoneNumber ? String(agentDetails.phoneNumber) : '',
        Address: agentDetails?.workAddress ? String(agentDetails.workAddress) : '',
        mail: agentDetails?.emailAddress ? String(agentDetails.emailAddress) : '',
        firm: agentDetails?.firmName ? String(agentDetails.firmName) : '',
        areaOfOperation: (agentDetails as any)?.areaOfOperation || [], // Multi-select array
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

        // Special handling for Plan Details section with upgrade buttons
        if (sectionKey === 'planDetails') {
            const upgradeOptions = getUpgradeOptions()

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

                            {/* Upgrade Buttons - Only show for kamModerator */}
                            {canUpgradePlan && (upgradeOptions.showTrial || upgradeOptions.showPremium) && (
                                <div className='mt-3 pt-2 border-t border-gray-100'>
                                    <div className='flex gap-2'>
                                        {upgradeOptions.showTrial && (
                                            <button
                                                onClick={() => handleUpgradePlan('trial')}
                                                disabled={upgradeLoading}
                                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                                                    upgradeLoading
                                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                                        : 'bg-black text-white hover:bg-gray-800'
                                                }`}
                                            >
                                                {upgradeLoading && upgradeType === 'trial'
                                                    ? 'Upgrading...'
                                                    : 'Upgrade to Trial'}
                                            </button>
                                        )}

                                        {upgradeOptions.showPremium && (
                                            <button
                                                onClick={() => handleUpgradePlan('premium')}
                                                disabled={upgradeLoading}
                                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                                                    upgradeLoading
                                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                                        : 'bg-black text-white hover:bg-gray-800'
                                                }`}
                                            >
                                                {upgradeLoading && upgradeType === 'premium'
                                                    ? 'Upgrading...'
                                                    : 'Upgrade to Premium'}
                                            </button>
                                        )}
                                    </div>

                                    {upgradeError && (
                                        <div className='mt-2 text-xs text-red-600 bg-red-50 p-2 rounded'>
                                            {upgradeError}
                                        </div>
                                    )}
                                </div>
                            )}
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
                                    {/* Name Field - NEW */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>Name</span>
                                        <div className='w-fit'>
                                            <StateBaseTextField
                                                value={String(editableUserDetails.name)}
                                                onChange={(e) => handleUserDetailChange('name', e.target.value)}
                                                status='default'
                                                fullWidth
                                                placeholder='Name'
                                            />
                                        </div>
                                    </div>
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
                                    {/* Area of Operation - Multi-Select Dropdown */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>Area of Operation</span>
                                        <div className='w-full'>
                                            <MultiSelectDropdown
                                                options={areaOfOperationOptions}
                                                selectedValues={editableUserDetails.areaOfOperation}
                                                onChange={handleAreaOfOperationChange}
                                                placeholder='Select Areas'
                                                className='w-full'
                                            />
                                        </div>
                                    </div>

                                    {/* KAM field - conditional rendering based on role */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>KAM</span>
                                        <div className='w-fit'>
                                            {canEditKam ? (
                                                kamLoading ? (
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
                                                )
                                            ) : (
                                                <span className='text-xs text-gray-900 font-medium'>
                                                    {editableUserDetails.kam || 'N/A'}
                                                </span>
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
                    title={`Upgrade Plan to ${upgradeType === 'trial' ? 'Trial' : 'Premium'}`}
                    message={`Are you sure you want to upgrade this agent's plan to ${upgradeType === 'trial' ? 'Trial' : 'Premium'}? This action will update their plan expiry, renewal date, and credits.`}
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
                                onClick={handleAddCreditsClick}
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

// Multi-Select Dropdown Component
interface MultiSelectDropdownProps {
    options: { value: string; label: string }[]
    selectedValues: string[]
    onChange: (selectedOptions: { value: string; label: string }[]) => void
    placeholder?: string
    className?: string
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    options,
    selectedValues,
    onChange,
    placeholder = 'Select options',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))

    const handleOptionToggle = (option: { value: string; label: string }) => {
        const isSelected = selectedValues.includes(option.value)
        let newSelectedValues: string[]

        if (isSelected) {
            newSelectedValues = selectedValues.filter((value) => value !== option.value)
        } else {
            newSelectedValues = [...selectedValues, option.value]
        }

        const selectedOptions = options.filter((opt) => newSelectedValues.includes(opt.value))
        onChange(selectedOptions)
    }

    const handleRemoveOption = (valueToRemove: string) => {
        const newSelectedValues = selectedValues.filter((value) => value !== valueToRemove)
        const selectedOptions = options.filter((opt) => newSelectedValues.includes(opt.value))
        onChange(selectedOptions)
    }

    return (
        <div className={`relative ${className}`}>
            <div
                className='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-h-[32px]'
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className='flex flex-wrap gap-1 flex-1'>
                    {selectedValues.length === 0 ? (
                        <span className='text-gray-500'>{placeholder}</span>
                    ) : (
                        selectedValues.map((value) => {
                            const option = options.find((opt) => opt.value === value)
                            return (
                                <span
                                    key={value}
                                    className='inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full'
                                >
                                    {option?.label}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRemoveOption(value)
                                        }}
                                        className='text-blue-600 hover:text-blue-800'
                                    >
                                        ×
                                    </button>
                                </span>
                            )
                        })
                    )}
                </div>
                <span className='text-gray-400'>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
                <div className='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'>
                    <div className='p-2 border-b border-gray-200'>
                        <input
                            type='text'
                            placeholder='Search options...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                        />
                    </div>
                    <div className='max-h-40 overflow-y-auto'>
                        {filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className='flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100'
                                onClick={() => handleOptionToggle(option)}
                            >
                                <input
                                    type='checkbox'
                                    checked={selectedValues.includes(option.value)}
                                    onChange={() => {}} // Handled by parent onClick
                                    className='mr-2'
                                />
                                <span>{option.label}</span>
                            </div>
                        ))}
                        {filteredOptions.length === 0 && (
                            <div className='px-3 py-2 text-sm text-gray-500'>No options found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
