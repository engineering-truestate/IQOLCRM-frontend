import { useState } from 'react'
import phoneIcon from '/icons/acn/phone1.svg'
import chevronUp from '/icons/acn/chevron-up.svg'
import chevronDown from '/icons/acn/chevron-down.svg'
import calendarIcon from '/icons/acn/calendar.svg'
import walletAdd from '/icons/acn/wallet-add.svg'
import editButton from '/icons/acn/editButton.svg'
import StateBaseTextField from '../design-elements/StateBaseTextField'
import Dropdown from '../design-elements/Dropdown'

interface AgentDetails {
    [key: string]: string | number | boolean | null | undefined
}

interface DropdownProps {
    label: string
    agentDetails: AgentDetails | null
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

export default function AgentDetailsDropdown({ agentDetails }: DropdownProps) {
    // State for the main dropdown visibility
    const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false)

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
        preferredArea: '',
        kam: agentDetails?.kamName || '',
        inWhatsappCommunity:
            agentDetails && typeof agentDetails.inWhatsappCommunity === 'boolean'
                ? String(agentDetails.inWhatsappCommunity)
                : '',
        inWhatsappBroadcast:
            agentDetails && typeof agentDetails.onBroadcast === 'boolean' ? String(agentDetails.onBroadcast) : '',
    })

    // Placeholder dropdown options
    const preferredAreaOptions = ['Area 1', 'Area 2', 'Area 3']
    const kamOptions = ['KAM 1', 'KAM 2', 'KAM 3']
    const yesNoOptions = [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
    ]

    // Redux state
    // const something = useSelector((state: RootState) => state.agentDetails)
    // console.log(something, 'page')

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
            preferredArea: '',
            kam: agentDetails?.kamName || '',
            inWhatsappCommunity:
                agentDetails && typeof agentDetails.inWhatsappCommunity === 'boolean'
                    ? String(agentDetails.inWhatsappCommunity)
                    : '',
            inWhatsappBroadcast:
                agentDetails && typeof agentDetails.onBroadcast === 'boolean' ? String(agentDetails.onBroadcast) : '',
        })
    }
    const handleSaveUserDetails = () => {
        // TODO: Hook up to API or Redux if needed
        setIsEditingUserDetails(false)
    }
    const handleUserDetailChange = (field: string, value: any) => {
        setEditableUserDetails((prev) => ({ ...prev, [field]: value }))
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
        preferredArea: '',
        kam: agentDetails?.kamName ? String(agentDetails.kamName) : '',
        inWhatsappCommunity: '',
        inWhatsappBroadcast:
            agentDetails && typeof agentDetails.onBroadcast === 'boolean' ? String(agentDetails.onBroadcast) : '',
    }

    const planDetailsFields = {
        Plan: agentDetails.userType,
        Expiry: agentDetails.planExpiry,
    }

    const resaleDetailsFields = {
        inventory: agentDetails.noOfinventories,
        Requirement: agentDetails.noOfrequirements,
        EnquiriesDid: agentDetails.noOfEnquiries,
        EnquiriesReceived: '',
    }

    const rentalDetailsFields = {
        inventory: agentDetails.noOfinventories,
        Requirement: agentDetails.noOfrequirements,
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
                                                <span className='text-xs text-gray-900 font-medium truncate'>
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
                                        <div className='w-[50%]'>
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
                                        <div className='w-[50%]'>
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
                                        <div className='w-[50%]'>
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
                                        <div className='w-full'>
                                            <StateBaseTextField
                                                value={String(editableUserDetails.firm)}
                                                onChange={(e) => handleUserDetailChange('firm', e.target.value)}
                                                status='default'
                                                fullWidth
                                                placeholder='Firm'
                                            />
                                        </div>
                                    </div>
                                    {/* preferredArea dropdown */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>Preferred Area</span>
                                        <div className='w-fit'>
                                            <Dropdown
                                                options={preferredAreaOptions.map((area) => ({
                                                    value: area,
                                                    label: area,
                                                }))}
                                                value={String(editableUserDetails.preferredArea)}
                                                onSelect={(value) => handleUserDetailChange('preferredArea', value)}
                                                placeholder='Preferred Area'
                                            />
                                        </div>
                                    </div>
                                    {/* kam dropdown */}
                                    <div className='flex justify-between items-center py-1.5'>
                                        <span className='text-xs text-gray-600'>KAM</span>
                                        <div className='w-fit'>
                                            <Dropdown
                                                options={kamOptions.map((kam) => ({ value: kam, label: kam }))}
                                                value={String(editableUserDetails.kam)}
                                                onSelect={(value) => handleUserDetailChange('kam', value)}
                                                placeholder='KAM'
                                            />
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
                        // <img src={phoneIcon} alt="Phone Icon" className="w-6 h-6" />
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
                                {agentDetails.cpId} | {agentDetails.reraId}
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
                                {agentDetails.userType || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Action Icons */}
                    <div className='flex items-center gap-2'>
                        <button className='bg-gray-100 p-1.5 rounded'>
                            <img src={phoneIcon} alt='Phone Icon' className='w-6 h-6' />
                        </button>
                        <button className='bg-gray-100 p-1.5 rounded'>
                            <img src={calendarIcon} alt='Calendar Icon' className='w-6 h-6' />
                        </button>
                        <button className='bg-gray-100 p-1.5 rounded'>
                            <img src={walletAdd} alt='Wallet Add Icon' className='w-6 h-6' />
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
