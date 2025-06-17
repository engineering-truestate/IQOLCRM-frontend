'use client'

import React from 'react'
import { Link, useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { setSelectedAgent } from '../../../store/slices/agentDetailsSlice'

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
import algoliaAgentsService from '../../../services/acn/agents/algoliaAgentsService'
import type { AgentSearchFilters } from '../../../services/acn/agents/algoliaAgentsService'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'
import { formatUnixDate, getUnixDateTime } from '../../../components/helper/getUnixDateTime'
import { formatRelativeTime } from '../../../components/helper/formatDate'

const sampleMetrics = [
    { label: 'Total Agents', value: 50 },
    { label: 'Active Agents', value: 45 },
    { label: 'Inactive Agents', value: 5 },
    { label: 'Total Properties', value: 100 },
    { label: 'Total Requirements', value: 75 },
    { label: 'Total Enquiries', value: 125 },
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
                    // if (status.startsWith('RNR')) {
                    //     return 'border-[#FCCE74]'
                    // }
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

const AgentsPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState('')
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [selectedLocation, setSelectedLocation] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
    const [isCallResultModalOpen, setIsCallResultModalOpen] = useState(false)
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState<any | null>(null)
    const [agentsData, setAgentsData] = useState<any[]>([])
    const [totalAgents, setTotalAgents] = useState(0)
    const [loading, setLoading] = useState(false)

    // Items per page
    const ITEMS_PER_PAGE = 50

    // Fetch agents data
    const fetchAgents = async () => {
        try {
            setLoading(true)
            const filters: AgentSearchFilters = {
                status: selectedStatus ? [selectedStatus] : undefined,
                role: selectedRole ? [selectedRole] : undefined,
                location: selectedLocation ? [selectedLocation] : undefined,
            }

            const response = await algoliaAgentsService.searchAgents({
                query: searchValue,
                filters,
                page: currentPage - 1,
                hitsPerPage: ITEMS_PER_PAGE,
            })

            setAgentsData(response.hits)
            setTotalAgents(response.nbHits)
        } catch (error) {
            console.error('Error fetching agents:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch agents when filters change
    useEffect(() => {
        fetchAgents()
    }, [searchValue, selectedRole, selectedStatus, selectedLocation, currentPage])

    // Dropdown options
    const roleOptions = [
        { label: 'All Roles', value: '' },
        { label: 'Agent', value: 'agent' },
        { label: 'Broker', value: 'broker' },
        { label: 'Developer', value: 'developer' },
    ]

    const statusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' },
    ]

    const locationOptions = [
        { label: 'All Locations', value: '' },
        { label: 'Mumbai', value: 'mumbai' },
        { label: 'Delhi', value: 'delhi' },
        { label: 'Bangalore', value: 'bangalore' },
    ]

    const handleAgentClick = (agentId: string, agentData: any) => {
        dispatch(setSelectedAgent(agentData))
        navigate(`/acn/agents/${agentId}`)
    }

    // Table columns configuration
    const columns: TableColumn[] = [
        {
            key: 'name',
            header: 'Agent Name',
            render: (value, row) => (
                <button
                    onClick={() => handleAgentClick(row.objectID, row)}
                    className='whitespace-nowrap text-sm font-semibold w-auto hover:text-blue-600'
                >
                    {value}
                </button>
            ),
        },
        {
            key: 'phoneNumber',
            header: 'Contact Number',
            render: (value) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
            ),
        },
        {
            key: 'cpId',
            header: 'Agent ID',
            render: (value) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
            ),
        },
        {
            key: 'userType',
            header: 'Plan Details',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>{toCapitalizedWords(value)}</span>
            ),
        },
        {
            key: 'inventories',
            header: 'Inventories',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value?.length}</span>,
        },
        {
            key: 'requirements',
            header: 'Requirements',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value?.length}</span>,
        },
        {
            key: 'enquiries',
            header: 'Enquiries',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value?.length}</span>,
        },
        {
            key: 'legalLeads',
            header: 'Legal Leads',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value?.length}</span>,
        },
        {
            key: 'lastSeen',
            header: 'Last Seen',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>{formatUnixDate(value)}</span>
            ),
        },
        {
            key: 'lastConnected',
            header: 'Last Connected',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>{formatRelativeTime(value)}</span>
            ),
        },
        {
            key: 'lastTried',
            header: 'Last Tried',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>{formatRelativeTime(value)}</span>
            ),
        },
        {
            key: 'contactHistory[0].contactResult',
            header: 'Last Connected Status',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'lastEnquiry',
            header: 'Last Enquired',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>{formatUnixDate(value)}</span>
            ),
        },
        {
            key: '',
            header: 'Last Enq Rec',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'agentStatus',
            header: 'Agent Status',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>{toCapitalizedWords(value)}</span>
            ),
        },
        {
            key: 'payStatus',
            header: 'Pay Status',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>{toCapitalizedWords(value)}</span>
            ),
        },
        {
            key: 'kamName',
            header: 'KAM',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>{toCapitalizedWords(value)}</span>
            ),
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
                </div>
            ),
        },
    ]

    return (
        <Layout loading={loading}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-2 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-4'>
                        <div className='flex items-center justify-between mb-2'>
                            <h1 className='text-lg font-semibold text-black'>Agents ({totalAgents})</h1>
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
                            </div>
                        </div>

                        {/* Filters */}
                        <div className='flex items-center gap-2 mb-2'>
                            <button
                                className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md'
                                onClick={() => {
                                    setSelectedRole('')
                                    setSelectedStatus('')
                                    setSelectedLocation('')
                                    setSearchValue('')
                                }}
                            >
                                <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                            </button>
                            <Dropdown
                                options={roleOptions}
                                onSelect={setSelectedRole}
                                defaultValue={selectedRole}
                                placeholder='Role'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />
                            <Dropdown
                                options={statusOptions}
                                onSelect={setSelectedStatus}
                                defaultValue={selectedStatus}
                                placeholder='Status'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />
                            <Dropdown
                                options={locationOptions}
                                onSelect={setSelectedLocation}
                                defaultValue={selectedLocation}
                                placeholder='Location'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />
                        </div>
                    </div>

                    {/* Metrics Cards */}
                    <div className='mb-4'>
                        <MetricsCards metrics={sampleMetrics} />
                    </div>

                    {/* Table */}
                    <div className='h-[65vh] overflow-y-auto'>
                        <FlexibleTable
                            data={agentsData}
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
                    <div className='flex items-center justify-between mt-4'>
                        <div className='text-sm text-gray-500 font-medium'>
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                            {Math.min(currentPage * ITEMS_PER_PAGE, totalAgents)} of {totalAgents} agents
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

                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, Math.ceil(totalAgents / ITEMS_PER_PAGE)),
                                    )
                                }
                                disabled={currentPage >= Math.ceil(totalAgents / ITEMS_PER_PAGE)}
                                className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                                    currentPage >= Math.ceil(totalAgents / ITEMS_PER_PAGE)
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

export default AgentsPage
