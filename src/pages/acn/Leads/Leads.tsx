'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import NotesModal from '../../../components/acn/NotesModal'
import CallResultModal from '../../../components/acn/CallModal'
import VerificationModal from '../../../components/acn/VerificationModal'
import AddLeadModal from '../../../components/acn/AddLeadModal'
import { generateLeads, type Lead, type LeadStatus } from '../../dummy_data/acn_leads_dummy_data'
import phoneic from '/icons/acn/phone.svg'
import notesic from '/icons/acn/notes.svg'
import verifyic from '/icons/acn/verify.svg'
import resetic from '/icons/acn/rotate-left.svg'
import leadaddic from '/icons/acn/user-add.svg'
import facebookic from '/icons/acn/facebook.svg'
import classifiedic from '/icons/acn/classified.svg'
import whatsappic from '/icons/acn/whatsapp.svg'
import instagramic from '/icons/acn/insta.svg'
import referic from '/icons/acn/referral.svg'
import organicic from '/icons/acn/organic.svg'
import MetricsCards from '../../../components/design-elements/MetricCards'

const sampleMetrics = [
    { label: 'Total Leads', value: 50 },
    { label: 'Not Contacted', value: 2 },
    { label: 'Total Interested', value: 100 },
    { label: 'Total Verified', value: 350 },
    { label: 'Calls', value: 125 },
    { label: 'Connects', value: 125 },
    { label: 'RNR', value: 10 },
]

// Custom status badge component with outline design
const StatusBadge = ({ status, type }: { status: string; type: 'lead' | 'connect' }) => {
    const getStatusColors = () => {
        if (type === 'lead') {
            switch (status) {
                case 'Interested':
                    return 'bg-[#E1F6DF] text-black'
                case 'Not Interested':
                    return 'text-black'
                case 'No Contact Yet':
                    return 'text-black'
                default:
                    return 'border-gray-600 text-black'
            }
        } else {
            // Connect status colors matching the design
            switch (status) {
                case 'Connected':
                    return 'border-[#9DE695]'
                case 'Not Contact':
                    return 'border-[#CCCBCB]'
                default:
                    // For RNR statuses (RNR-1, RNR-2, etc.)
                    if (status.startsWith('RNR')) {
                        return 'border-[#FCCE74]'
                    }
                    return 'border-gray-400 text-gray-600 bg-gray-50'
            }
        }
    }

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-medium whitespace-nowrap ${getStatusColors()}`}
        >
            {status}
        </span>
    )
}

// Lead Source component with outlined design and SVG icons
const LeadSourceCell = ({ source }: { source: string }) => {
    const getSourceIcon = () => {
        switch (source) {
            case 'WhatsApp':
                return <img src={whatsappic} alt='WhatsApp' className='w-5 h-5 text-gray-600 flex-shrink-0' />
            case 'Instagram':
                return <img src={instagramic} alt='Instagram' className='w-5 h-5 text-gray-600 flex-shrink-0' />
            case 'Facebook':
                return <img src={facebookic} alt='Facebook' className='w-5 h-5 text-gray-600 flex-shrink-0' />
            case 'Classified':
                return <img src={classifiedic} alt='Classified' className='w-5 h-5 text-gray-600 flex-shrink-0' />
            case 'Organic':
                return <img src={organicic} alt='Organic' className='w-5 h-5 text-gray-600 flex-shrink-0' />
            case 'Referral':
                return <img src={referic} alt='Referral' className='w-5 h-5 text-gray-600 flex-shrink-0' />
            default:
                return (
                    <svg className='w-4 h-4 text-gray-600 flex-shrink-0' fill='currentColor' viewBox='0 0 24 24'>
                        <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
                    </svg>
                )
        }
    }

    return (
        <div className='flex items-center gap-2 whitespace-nowrap'>
            <span className='inline-flex items-center rounded-full border border-gray-300 px-3 py-2 text-xs font-medium bg-white'>
                <span className='flex items-center gap-2'>
                    {getSourceIcon()}
                    <span className='text-sm text-black'>{source}</span>
                </span>
            </span>
        </div>
    )
}

const LeadsPage = () => {
    const [searchValue, setSearchValue] = useState('')
    const [selectedKAM, setSelectedKAM] = useState('')
    const [selectedSort, setSelectedSort] = useState('')
    const [selectedConnectStatus, setSelectedConnectStatus] = useState('')
    const [selectedLeadStatus, setSelectedLeadStatus] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
    const [isCallResultModalOpen, setIsCallResultModalOpen] = useState(false)
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState<Lead | null>(null)
    const [paginatedData, setPaginatedData] = useState<Lead[]>([])

    // Items per page
    const ITEMS_PER_PAGE = 50

    // Initialize leads data using the imported function
    const [leadsData, setLeadsData] = useState<Lead[]>(() => generateLeads(200))

    // Calculate total pages
    const totalPages = Math.ceil(leadsData.length / ITEMS_PER_PAGE)

    // Update paginated data when page changes or data changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        setPaginatedData(leadsData.slice(startIndex, endIndex))
    }, [currentPage, leadsData])

    // Helper function to update a specific row's data
    const updateRowData = (rowId: string, field: keyof Lead, value: string) => {
        setLeadsData((prevData) => prevData.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)))
    }

    // Dropdown options
    const kamOptions = [
        { label: 'All KAMs', value: '' },
        { label: 'Samarth', value: 'samarth' },
        { label: 'Priya', value: 'priya' },
        { label: 'Raj', value: 'raj' },
    ]

    const sortOptions = [
        { label: 'Sort by Date', value: '' },
        { label: 'Newest First', value: 'newest' },
        { label: 'Oldest First', value: 'oldest' },
    ]

    const connectStatusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Connected', value: 'connected' },
        { label: 'Not Contact', value: 'not_contact' },
        { label: 'RNR', value: 'rnr' },
    ]

    // Enhanced lead status dropdown options with colors matching the design
    const leadStatusDropdownOptions: DropdownOption[] = [
        {
            label: 'Interested',
            value: 'Interested',
            color: '#E1F6DF', // Light green background
            textColor: '#065F46', // Dark green text
        },
        {
            label: 'Not Interested',
            value: 'Not Interested',
            color: '#D3D4DD', // Light gray background
            textColor: '#374151', // Dark gray text
        },
        {
            label: 'No Contact Yet',
            value: 'No Contact Yet',
            color: '#FEECED', // Light red background
            textColor: '#991B1B', // Dark red text
        },
    ]

    const leadStatusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Interested', value: 'interested' },
        { label: 'Not Interested', value: 'not_interested' },
        { label: 'No Contact Yet', value: 'no_contact' },
    ]

    const kamAssignedOptions: DropdownOption[] = [
        { label: 'Samarth', value: 'Samarth', color: '#F3F3F3' },
        { label: 'Priya', value: 'Priya', color: '#F3F3F3' },
        { label: 'Raj', value: 'Raj', color: '#F3F3F3' },
    ]

    // Table columns configuration with all fields and fixed actions column
    const columns: TableColumn[] = [
        {
            key: 'id',
            header: 'Lead ID',
            render: (value) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
            ),
        },
        {
            key: 'agentName',
            header: 'Lead Name',
            render: (value) => <span className='whitespace-nowrap text-sm font-semibold w-auto'>{value}</span>,
        },
        {
            key: 'contactNumber',
            header: 'Contact Number',
            render: (value) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
            ),
        },
        {
            key: 'lastTried',
            header: 'Last Tried',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'lastConnect',
            header: 'Last Connect',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'leadStatus',
            header: 'Lead Status',
            dropdown: {
                options: leadStatusDropdownOptions,
                placeholder: 'Select Status',
                onChange: (value, row) => {
                    updateRowData(row.id, 'leadStatus', value as LeadStatus)
                    console.log('Lead status changed:', value, row)
                },
            },
        },
        {
            key: 'connectStatus',
            header: 'Connect Status',
            render: (value) => (
                <div className='whitespace-nowrap w-auto'>
                    <StatusBadge status={value} type='connect' />
                </div>
            ),
        },
        {
            key: 'kamAssigned',
            header: 'KAM Assigned',
            dropdown: {
                options: kamAssignedOptions,
                placeholder: 'Select KAM',
                onChange: (value, row) => {
                    updateRowData(row.id, 'kamAssigned', value)
                    console.log('KAM changed:', value, row)
                },
            },
        },
        {
            key: 'leadSource',
            header: 'Lead Source',
            render: (value) => (
                <div className='whitespace-nowrap w-auto'>
                    <LeadSourceCell source={value} />
                </div>
            ),
        },
        {
            key: 'joinedCommunity',
            header: 'Joined Community',
            checkbox: {
                trueValue: 'Yes',
                falseValue: 'No',
                onChange: (checked, row) => {
                    updateRowData(row.id, 'joinedCommunity', checked ? 'Yes' : 'No')
                    console.log('Joined Community changed:', checked, row)
                },
            },
        },
        {
            key: 'onBroadcast',
            header: 'On Broadcast',
            checkbox: {
                trueValue: 'Yes',
                falseValue: 'No',
                onChange: (checked, row) => {
                    updateRowData(row.id, 'onBroadcast', checked ? 'Yes' : 'No')
                    console.log('On Broadcast changed:', checked, row)
                },
            },
        },
        {
            key: 'actions',
            header: 'Actions',
            fixed: true,
            fixedPosition: 'right',
            render: (_, row) => (
                <div className='flex items-center gap-1 whitespace-nowrap w-auto'>
                    <button
                        className='h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0'
                        onClick={() => {
                            setSelectedRowData(row)
                            setIsCallResultModalOpen(true)
                        }}
                        title='Call'
                    >
                        <img src={phoneic} alt='Phone Icon' className='w-7 h-7 flex-shrink-0' />
                    </button>
                    <button
                        className='h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0'
                        onClick={() => {
                            setSelectedRowData(row)
                            setIsNotesModalOpen(true)
                        }}
                        title='Notes'
                    >
                        <img src={notesic} alt='Notes Icon' className='w-7 h-7 flex-shrink-0' />
                    </button>
                    <button
                        className='h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0'
                        onClick={() => {
                            setSelectedRowData(row)
                            setIsVerificationModalOpen(true)
                        }}
                        title='Profile'
                    >
                        <img src={verifyic} alt='Verify Icon' className='w-7 h-7 flex-shrink-0' />
                    </button>
                </div>
            ),
        },
    ]

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-2 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-4'>
                        <div className='flex items-center justify-between mb-2'>
                            <h1 className='text-lg font-semibold text-black'>Leads ({leadsData.length})</h1>
                            <div className='flex items-center gap-4'>
                                <div className='w-80'>
                                    <StateBaseTextField
                                        leftIcon={
                                            <svg
                                                className='w-4 h-4 text-gray-400'
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
                                        }
                                        placeholder='Search name and number'
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className='h-8'
                                    />
                                </div>
                                <Button
                                    leftIcon={<img src={leadaddic} alt='Add Lead Icon' className='w-5 h-5' />}
                                    bgColor='bg-[#F3F3F3]'
                                    textColor='text-[#3A3A47]'
                                    className='px-4 h-8 font-semibold'
                                    onClick={() => setIsAddLeadModalOpen(true)}
                                >
                                    Add Lead
                                </Button>
                            </div>
                        </div>
                        <hr className='border-gray-200 mb-4' />
                        <MetricsCards metrics={sampleMetrics} className='mb-2' />
                        {/* Filters */}
                        <div className='flex items-center gap-2 mb-2'>
                            <button className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md'>
                                <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                            </button>
                            <Dropdown
                                options={kamOptions}
                                onSelect={setSelectedKAM}
                                defaultValue={selectedKAM}
                                placeholder='KAM'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />

                            <Dropdown
                                options={sortOptions}
                                onSelect={setSelectedSort}
                                defaultValue={selectedSort}
                                placeholder='Sort'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />

                            <Dropdown
                                options={connectStatusOptions}
                                onSelect={setSelectedConnectStatus}
                                defaultValue={selectedConnectStatus}
                                placeholder='Connect Status'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />

                            <Dropdown
                                options={leadStatusOptions}
                                onSelect={setSelectedLeadStatus}
                                defaultValue={selectedLeadStatus}
                                placeholder='Lead Status'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />
                        </div>
                    </div>

                    {/* Table with fixed actions column and vertical scrolling */}
                    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                        <div className='h-[65vh] overflow-y-auto'>
                            <FlexibleTable
                                data={paginatedData}
                                columns={columns}
                                hoverable={true}
                                borders={{
                                    table: false,
                                    header: true,
                                    rows: true,
                                    cells: false,
                                    outer: false,
                                }}
                                maxHeight='65vh'
                                className='rounded-lg'
                                stickyHeader={true}
                            />
                        </div>

                        {/* Pagination */}
                        <div className='flex items-center justify-between py-4 px-6 border-t border-gray-200'>
                            <div className='text-sm text-gray-500 font-medium'>
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                                {Math.min(currentPage * ITEMS_PER_PAGE, leadsData.length)} of {leadsData.length} leads
                            </div>

                            <div className='flex items-center gap-2'>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                                        currentPage === 1
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M15 19l-7-7 7-7'
                                        />
                                    </svg>
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((page) => {
                                        // Show first page, last page, current page, and pages around current page
                                        return (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        )
                                    })
                                    .map((page, index, array) => {
                                        // Add ellipsis between non-consecutive pages
                                        const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1
                                        const showEllipsisAfter =
                                            index < array.length - 1 && array[index + 1] !== page + 1

                                        return (
                                            <React.Fragment key={page}>
                                                {showEllipsisBefore && (
                                                    <span className='w-8 h-8 flex items-center justify-center text-gray-500'>
                                                        ...
                                                    </span>
                                                )}

                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-8 h-8 rounded flex items-center justify-center text-sm font-semibold transition-colors ${
                                                        currentPage === page
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {page}
                                                </button>

                                                {showEllipsisAfter && (
                                                    <span className='w-8 h-8 flex items-center justify-center text-gray-500'>
                                                        ...
                                                    </span>
                                                )}
                                            </React.Fragment>
                                        )
                                    })}

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                                        currentPage === totalPages
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M9 5l7 7-7 7'
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Modals */}
                    <NotesModal
                        isOpen={isNotesModalOpen}
                        onClose={() => setIsNotesModalOpen(false)}
                        rowData={selectedRowData}
                    />

                    <CallResultModal
                        isOpen={isCallResultModalOpen}
                        onClose={() => setIsCallResultModalOpen(false)}
                        rowData={selectedRowData}
                    />

                    <VerificationModal
                        isOpen={isVerificationModalOpen}
                        onClose={() => setIsVerificationModalOpen(false)}
                        rowData={selectedRowData}
                    />

                    <AddLeadModal isOpen={isAddLeadModalOpen} onClose={() => setIsAddLeadModalOpen(false)} />
                </div>
            </div>
        </Layout>
    )
}

export default LeadsPage
