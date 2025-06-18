import React, { useState } from 'react'
import phoneIcon from '/icons/acn/phone1.svg'
import chevronUp from '/icons/acn/chevron-up.svg'
import chevronDown from '/icons/acn/chevron-down.svg'
import calendarIcon from '/icons/acn/calendar.svg'
import walletAdd from '/icons/acn/wallet-add.svg'

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

    const toggleMainDropdown = () => {
        setIsMainDropdownOpen(!isMainDropdownOpen)
    }

    const toggleSection = (section: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section as keyof typeof prev],
        }))
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
        phoneNumber: agentDetails.phoneNumber,
        Address: agentDetails.workAddress,
        mail: agentDetails.emailAddress,
        firm: agentDetails.firmName,
        preferredArea: '',
        kam: agentDetails.kamName,
        inWhatsappCommunity: '',
        inWhatsappBroadcast: agentDetails.onBroadcast,
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

        return (
            <div className='border-b border-gray-200 last:border-b-0 max-h-[calc(100vh-80px)] overflow-y-auto'>
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className='w-full px-4 py-3  transition-colors duration-200 flex justify-between items-center text-left'
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
                                            {formatValue(value)}
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
        <div className=' mx-auto bg-gray-50 max-h-[calc(100vh-80px)] overflow-y-auto'>
            {/* Header - Now clickable */}
            <div className='bg-white px-4 py-4 w-full'>
                <div className='flex items-center justify-between'>
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
