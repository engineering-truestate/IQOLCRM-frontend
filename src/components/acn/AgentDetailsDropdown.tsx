import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
    const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(true)

    // State for individual sections
    const [openSections, setOpenSections] = useState({
        userDetails: true,
        planDetails: false,
        resaleDetails: false,
        rentalDetails: false,
        enquiryDetails: false,
        credits: false,
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
                        <ChevronUp className='w-4 h-4 text-gray-500' />
                    ) : (
                        <ChevronDown className='w-4 h-4 text-gray-500' />
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
            <div className='bg-white '>
                <button
                    onClick={toggleMainDropdown}
                    className='w-full px-4 py-4 text-left  transition-colors duration-200'
                >
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                            <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center'>
                                <span className='text-sm font-medium text-gray-600'>
                                    {agentDetails.name
                                        ?.toString()
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('') || 'HR'}
                                </span>
                            </div>
                            <div>
                                <h1 className='font-medium text-gray-900'>{agentDetails.name || 'Agent Name'}</h1>
                                <p className='text-xs text-gray-500'>
                                    {agentDetails.cpId} | {agentDetails.reraId}
                                </p>
                            </div>
                        </div>
                        {isMainDropdownOpen ? (
                            <ChevronUp className='w-4 h-4 text-gray-400' />
                        ) : (
                            <ChevronDown className='w-4 h-4 text-gray-400' />
                        )}
                    </div>
                    <div className='mt-3 flex justify-between text-xs'>
                        <div>
                            <span className='text-gray-500'>Credits:</span>
                            <span className='ml-1 font-medium'>{agentDetails.monthlyCredits || 0}</span>
                        </div>
                        <div>
                            <span className='text-gray-500'>Plan:</span>
                            <span className='ml-1 font-medium text-blue-600 capitalize'>
                                {agentDetails.userType || 'N/A'}
                            </span>
                        </div>
                    </div>
                </button>
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
