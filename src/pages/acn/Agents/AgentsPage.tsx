'use client'

import React from 'react'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../../store'
import { setSelectedAgent } from '../../../store/slices/agentDetailsSlice'
import { updateAgentStatusThunk, updateAgentPayStatusThunk } from '../../../services/acn/agents/agentThunkService'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import StatusBadge from '../../../components/design-elements/StatusBadge'
import CustomPagination from '../../../components/design-elements/CustomPagination'
import NotesModal from '../../../components/acn/NotesModal'
import CallResultModal from '../../../components/acn/CallModal'
import VerificationModal from '../../../components/acn/VerificationModal'
import AddLeadModal from '../../../components/acn/AddLeadModal'
import phoneic from '/icons/acn/phone.svg'
import notesic from '/icons/acn/notes.svg'
import resetic from '/icons/acn/rotate-left.svg'
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
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'
import { formatRelativeTime } from '../../../components/helper/formatDate'
import searchnormalic from '/icons/acn/search-normal.svg'
import userTick from '/icons/acn/user-tick.svg'
import AlgoliaFacetMultiSelect from '../../../components/design-elements/AlgoliaFacetMultiSelect'
import Dropdown from '../../../components/design-elements/Dropdown'
import { agentSortOptions } from '../../../services/acn/agents/algoliaAgentsService'
import Button from '../../../components/design-elements/Button'
import filter from '/icons/acn/filter.svg'
import { AgentsFiltersModal } from '../../../components/acn/AgentsFiltersModal'

// Status dropdown options with colors
const agentStatusOptions = [
    { label: 'Interested', value: 'interested', color: '#E1F6DF', textColor: '#000000' },
    { label: 'Not Interested', value: 'not interested', color: '#D3D4DD', textColor: '#000000' },
    { label: 'Not Contacted Yet', value: 'not contact yet', color: '#FEECED', textColor: '#000000' },
]

const payStatusOptions = [
    { label: 'Paid', value: 'paid', color: '#E1F6DF', textColor: '#000000' },
    { label: 'Paid By Team', value: 'paid by team', color: '#E1F6DF', textColor: '#000000' },
    { label: 'Will Pay', value: 'will pay', color: '#FEECED', textColor: '#000000' },
    { label: 'Will Not', value: 'will not', color: '#FEECED', textColor: '#000000' },
]

// Lead Source component with outlined design and SVG icons
const getSourceIcon = (source: string) => {
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

    return (
        <div className='flex items-center gap-2 whitespace-nowrap'>
            <span className='inline-flex items-center rounded-full border border-gray-300 px-3 py-2 text-xs font-medium bg-white'>
                <span className='flex items-center gap-2'>
                    {getSourceIcon(source)}
                    <span className='text-sm text-black'>{source}</span>
                </span>
            </span>
        </div>
    )
}

// FiltersBar component for all filters
interface FiltersBarProps {
    kamOptions: { label: string; value: string }[]
    planOptions: { label: string; value: string }[]
    statusOptions: { label: string; value: string }[]
    locationOptions: { label: string; value: string }[]
    appInstalledOptions: { label: string; value: string }[]
    inventoryStatusOptions: { label: string; value: string }[]
    selectedKam: string[]
    setSelectedKam: (v: string[]) => void
    selectedPlan: string[]
    setSelectedPlan: (v: string[]) => void
    selectedStatus: string[]
    setSelectedStatus: (v: string[]) => void
    selectedLocation: string[]
    setSelectedLocation: (v: string[]) => void
    selectedAppInstalled: string[]
    setSelectedAppInstalled: (v: string[]) => void
    selectedInventoryStatuses: string[]
    setSelectedInventoryStatuses: (v: string[]) => void
    facets: Record<string, any>
    resetAllFilters: () => void
    handleSortChange: (value: string) => void
    sortBy: string
    setIsAgentsFiltersModalOpen: (open: boolean) => void
}

const FiltersBar: React.FC<FiltersBarProps> = ({
    handleSortChange,
    sortBy = 'recent',
    kamOptions,
    planOptions,
    statusOptions,
    appInstalledOptions,
    inventoryStatusOptions,
    selectedKam,
    setSelectedKam,
    selectedPlan,
    setSelectedPlan,
    selectedStatus,
    setSelectedStatus,
    selectedAppInstalled,
    setSelectedAppInstalled,
    selectedInventoryStatuses,
    setSelectedInventoryStatuses,
    facets,
    resetAllFilters,
    setIsAgentsFiltersModalOpen,
}) => {
    // Helper to convert options to AlgoliaFacetMultiSelect format
    const toFacetOptions = (opts: { label: string; value: string }[], facetName: string) => {
        return opts
            .filter((o) => o.value !== '')
            .map((o) => ({
                value: o.value,
                count: facets[facetName]?.[o.value] || 0,
            }))
    }

    return (
        <div className='flex items-center gap-2'>
            <button
                className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-50'
                onClick={resetAllFilters}
            >
                <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
            </button>

            <AlgoliaFacetMultiSelect
                options={toFacetOptions(kamOptions, 'kamName')}
                selectedValues={selectedKam}
                onSelectionChange={setSelectedKam}
                placeholder='KAM'
                label='KAM'
                className='relative inline-block'
                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
            />
            <Dropdown
                options={agentSortOptions}
                onSelect={handleSortChange}
                defaultValue={sortBy}
                placeholder='Sort'
                className='relative inline-block'
                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
            />
            <AlgoliaFacetMultiSelect
                options={toFacetOptions(planOptions, 'payStatus')}
                selectedValues={selectedPlan}
                onSelectionChange={setSelectedPlan}
                placeholder='Plan'
                label='Plan'
                className='relative inline-block'
                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
            />
            <AlgoliaFacetMultiSelect
                options={toFacetOptions(statusOptions, 'agentStatus')}
                selectedValues={selectedStatus}
                onSelectionChange={setSelectedStatus}
                placeholder='Status'
                label='Status'
                className='relative inline-block'
                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
            />
            <AlgoliaFacetMultiSelect
                options={inventoryStatusOptions.map((o) => ({
                    value: o.value,
                    count: facets[`inventoryStatus.${o.value.toLowerCase()}`]?.true || 0,
                }))}
                selectedValues={selectedInventoryStatuses}
                onSelectionChange={setSelectedInventoryStatuses}
                placeholder='Inventory Status'
                label='Inventory Status'
                className='relative inline-block'
                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer'
                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
            />
            <AlgoliaFacetMultiSelect
                options={toFacetOptions(appInstalledOptions, 'appInstalled')}
                selectedValues={selectedAppInstalled}
                onSelectionChange={setSelectedAppInstalled}
                placeholder='App Installed'
                label='App Installed'
                className='relative inline-block'
                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
            />
            <Button
                bgColor='bg-[#F0F0F5]'
                textColor='text-black'
                leftIcon={<img src={filter} alt='Filter Icon' className='w-5 h-5' />}
                className='h-7 font-semibold text-sm'
                onClick={() => setIsAgentsFiltersModalOpen(true)}
            >
                Filter
            </Button>
        </div>
    )
}

const useAgentFilters = () => {
    const [selectedKam, setSelectedKam] = useState<string[]>([])
    const [selectedPlan, setSelectedPlan] = useState<string[]>([])
    const [selectedStatus, setSelectedStatus] = useState<string[]>([])
    const [selectedLocation, setSelectedLocation] = useState<string[]>([])
    const [selectedAppInstalled, setSelectedAppInstalled] = useState<string[]>([])
    const [selectedInventoryStatuses, setSelectedInventoryStatuses] = useState<string[]>([])
    const resetAllFilters = () => {
        setSelectedKam([])
        setSelectedPlan([])
        setSelectedStatus([])
        setSelectedLocation([])
        setSelectedAppInstalled([])
        setSelectedInventoryStatuses([])
    }
    return {
        selectedKam,
        setSelectedKam,
        selectedPlan,
        setSelectedPlan,
        selectedStatus,
        setSelectedStatus,
        selectedLocation,
        setSelectedLocation,
        selectedAppInstalled,
        setSelectedAppInstalled,
        selectedInventoryStatuses,
        setSelectedInventoryStatuses,
        resetAllFilters,
    }
}

const ITEMS_PER_PAGE = 100

const AgentsPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState('')
    const {
        selectedKam,
        setSelectedKam,
        selectedPlan,
        setSelectedPlan,
        selectedStatus,
        setSelectedStatus,
        selectedLocation,
        setSelectedLocation,
        selectedAppInstalled,
        setSelectedAppInstalled,
        selectedInventoryStatuses,
        setSelectedInventoryStatuses,
        resetAllFilters,
    } = useAgentFilters()
    const [isAgentsFiltersModalOpen, setIsAgentsFiltersModalOpen] = useState(false)
    const [modalFilters, setModalFilters] = useState<AgentSearchFilters>({})
    const [currentPage, setCurrentPage] = useState(1)
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
    const [isCallResultModalOpen, setIsCallResultModalOpen] = useState(false)
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState<any | null>(null)
    const [agentsData, setAgentsData] = useState<any[]>([])
    const [totalAgents, setTotalAgents] = useState(0)
    const [loading, setLoading] = useState(false)
    const [facets, setFacets] = useState<Record<string, any>>({})
    // Sort state and handler for Algolia sort
    const [sortBy, setSortBy] = useState('recent')
    const handleSortChange = (value: string) => {
        setSortBy(value)
        setCurrentPage(1)
    }

    const metrics = useMemo(() => {
        const interestedCount = facets.agentStatus?.['interested'] || 0
        const appInstalledCount = facets.appInstalled?.['true'] || 0
        const contactStatusFacets = facets.contactStatus || {}

        const connectsCount = (contactStatusFacets['connected'] || 0) + (contactStatusFacets['connnected'] || 0)

        const rnrCount = Object.keys(contactStatusFacets).reduce((acc, key) => {
            if (key.startsWith('rnr-')) {
                return acc + (contactStatusFacets[key] || 0)
            }
            return acc
        }, 0)

        // Agents Enquired: sum of all noOfEnquiries facet counts where key > '0'
        let totalEnquiries = 0
        let agentsEnquired = 0
        if (facets.noOfEnquiries) {
            agentsEnquired = Object.entries(facets.noOfEnquiries)
                .filter(([key, _]) => {
                    // key is a string, but we want numeric > 0
                    const num = parseInt(key, 10)
                    totalEnquiries += num
                    return !isNaN(num) && num > 0
                })
                .reduce((acc, [_, count]) => acc + (count as number), 0)
        }

        // Some values are placeholders as the data source is not yet available.
        return [
            { label: 'Total Agents', value: totalAgents },
            { label: 'Interested', value: interestedCount },
            { label: 'Calls', value: 100 },
            { label: 'Connects', value: connectsCount },
            { label: 'RNR', value: rnrCount },
            { label: 'Enquiry', value: totalEnquiries },
            { label: 'Agents Enquired', value: agentsEnquired },
            { label: 'App Installed', value: appInstalledCount },
        ]
    }, [totalAgents, facets])

    // Fetch facets for filters from Algolia
    useEffect(() => {
        const fetchFacets = async () => {
            try {
                const allFacets = await algoliaAgentsService.getAllAgentFacets()
                setFacets(allFacets)
                console.log('Facets', allFacets)
            } catch (err) {
                console.error('Failed to fetch agent facets', err)
            }
        }
        fetchFacets()
    }, [])

    // Fetch agents data
    const fetchAgents = useCallback(async () => {
        try {
            setLoading(true)
            // Convert selectedInventoryStatuses to object format for Algolia
            const inventoryStatusFilter = selectedInventoryStatuses.reduce(
                (acc, status) => {
                    acc[status.toLowerCase()] = true
                    return acc
                },
                {} as Record<string, boolean>,
            )

            // Combine all filters
            const filters: AgentSearchFilters = {
                agentStatus: selectedStatus.length > 0 ? selectedStatus[0] : undefined,
                kamName: selectedKam.length > 0 ? selectedKam[0] : undefined,
                payStatus: selectedPlan.length > 0 ? selectedPlan[0] : undefined,
                areaOfOperation: selectedLocation.length > 0 ? selectedLocation : undefined,
                inventoryStatus: Object.keys(inventoryStatusFilter).length > 0 ? inventoryStatusFilter : undefined,
                appInstalled: selectedAppInstalled.length > 0 ? selectedAppInstalled[0] : undefined,
                ...modalFilters, // Modal filters should override top bar filters if both are set
            }

            const response = await algoliaAgentsService.searchAgents({
                query: searchValue,
                filters,
                page: currentPage - 1,
                hitsPerPage: ITEMS_PER_PAGE,
                sortBy: sortBy || undefined,
            })

            console.log('Agent data sample:', response.hits[0]) // Debug log
            setAgentsData(response.hits)
            setTotalAgents(response.nbHits)
            if (response.facets) {
                setFacets(response.facets)
            }
        } catch (error) {
            console.error('Error fetching agents:', error)
        } finally {
            setLoading(false)
        }
    }, [
        searchValue,
        selectedKam,
        selectedPlan,
        selectedStatus,
        selectedLocation,
        selectedInventoryStatuses,
        selectedAppInstalled,
        currentPage,
        sortBy,
        modalFilters,
    ])

    // Fetch agents when filters change
    useEffect(() => {
        fetchAgents()
    }, [
        searchValue,
        selectedKam,
        selectedPlan,
        selectedStatus,
        selectedLocation,
        selectedInventoryStatuses,
        selectedAppInstalled,
        currentPage,
        sortBy,
        modalFilters,
    ])

    // Dynamic dropdown options from Algolia facets
    const kamOptions = [
        { label: 'All Roles', value: '' },
        ...Object.entries(facets.kamName || {}).map(([value, _]) => ({
            label: value,
            value: value,
        })),
    ]

    const planOptions = [
        { label: 'All Plans', value: '' },
        ...Object.entries(facets.payStatus || {}).map(([value, _]) => ({
            label: value,
            value: value,
        })),
    ]

    const statusOptions = [
        { label: 'All Status', value: '' },
        ...Object.entries(facets.agentStatus || {}).map(([value, _]) => ({
            label: value,
            value: value,
        })),
    ]

    const locationOptions = [
        { label: 'All Locations', value: '' },
        ...Object.entries(facets.areaOfOperation || {}).map(([value, _]) => ({
            label: value,
            value: value,
        })),
    ]

    // App Installed options from facets
    const appInstalledOptions = [
        { label: 'All', value: '' },
        ...Object.entries(facets.appInstalled || {}).map(([value, _]) => ({
            label: value === 'true' ? 'Yes' : 'No',
            value: value,
        })),
    ]

    // Inventory status options from facets
    const inventoryStatusOptions = [
        { label: 'Available', value: 'Available', count: facets['inventoryStatus.available']?.true || 0 },
        { label: 'Hold', value: 'Hold', count: facets['inventoryStatus.hold']?.true || 0 },
        { label: 'Sold', value: 'Sold', count: facets['inventoryStatus.sold']?.true || 0 },
        { label: 'De-listed', value: 'De-listed', count: facets['inventoryStatus.delisted']?.true || 0 },
    ]

    const handleAgentClick = (agentId: string, agentData: any) => {
        dispatch(setSelectedAgent(agentData))
        navigate(`/acn/agents/${agentId}`)
    }

    // Helper function to update agent status
    const updateAgentStatus = async (agentId: string, field: string, value: string) => {
        try {
            // Update local state optimistically
            setAgentsData((prevData) =>
                prevData.map((agent) => (agent.objectID === agentId ? { ...agent, [field]: value } : agent)),
            )

            // Update in Firebase using thunks
            if (field === 'agentStatus') {
                await dispatch(updateAgentStatusThunk({ cpId: agentId, agentStatus: value })).unwrap()
            } else if (field === 'payStatus') {
                await dispatch(updateAgentPayStatusThunk({ cpId: agentId, payStatus: value })).unwrap()
            }

            console.log('✅ Agent status updated successfully')
        } catch (error) {
            console.error('❌ Failed to update agent status:', error)
            // Revert local state on error
            setAgentsData((prevData) =>
                prevData.map((agent) => (agent.objectID === agentId ? { ...agent, [field]: agent[field] } : agent)),
            )
        }
    }

    // Table columns configuration
    const columns: TableColumn[] = [
        {
            key: 'name',
            header: 'Agent Name',
            render: (value, row) => (
                <button
                    onClick={() => handleAgentClick(row.objectID, row)}
                    className='whitespace-nowrap text-sm font-semibold w-auto hover:text-blue-600 cursor-pointer'
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
            key: 'activity',
            header: 'Agent Activity',
            render: (value) => <StatusBadge status={value} type='agent' />,
        },
        {
            key: 'userType',
            header: 'Plan Details',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>{toCapitalizedWords(value)}</span>
            ),
        },
        {
            key: 'noOfinventories',
            header: 'Inventories',
            render: (value) => <StatusBadge status={value} type='agent' />,
        },
        {
            key: 'noOfrequirements',
            header: 'Requirements',
            render: (value) => <StatusBadge status={value} type='agent' />,
        },
        {
            key: 'noOfEnquiries',
            header: 'Enquiries',
            render: (value) => <StatusBadge status={value} type='agent' />,
        },
        {
            key: 'noOfleagalLeads',
            header: 'Legal Leads',
            render: (value) => <StatusBadge status={value} type='agent' />,
        },
        {
            key: 'lastSeen',
            header: 'Last Seen',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>{formatUnixDate(value)}</span>
            ),
        },
        {
            key: 'contactHistory',
            header: 'Last Connected',
            render: (row) => {
                // Handle different possible data structures
                let timestamp = null
                const contactHistory = row.contactHistory
                if (Array.isArray(contactHistory) && contactHistory.length > 0) {
                    // If it's an array of contact history
                    timestamp = contactHistory[0].timestamp
                } else if (contactHistory && typeof contactHistory === 'object') {
                    // If it's a single contact history object
                    timestamp = contactHistory.timestamp
                } else if (row.lastConnected) {
                    // Fallback to lastConnected if available
                    timestamp = row.lastConnected
                }

                return (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>
                        {timestamp ? formatRelativeTime(timestamp) : 'Never'}
                    </span>
                )
            },
        },
        {
            key: 'lastTried',
            header: 'Last Tried',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>
                    {' '}
                    {value ? formatRelativeTime(value) : 'Never'}
                </span>
            ),
        },
        {
            key: 'contactStatus',
            header: 'Last Connected Status',
            render: (value) => {
                return <StatusBadge status={value || 'N/A'} type='connect' />
            },
        },
        {
            key: 'lastEnquiry',
            header: 'Last Enquired',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>{formatUnixDate(value)}</span>
            ),
        },
        {
            key: 'agentStatus',
            header: 'Agent Status',
            dropdown: {
                options: agentStatusOptions.map((option) => ({
                    label: option.label,
                    value: option.value,
                    color: option.color,
                    textColor: option.textColor,
                })),
                placeholder: 'Select Status',
                onChange: (value, row) => updateAgentStatus(row.objectID, 'agentStatus', value),
            },
        },
        {
            key: 'payStatus',
            header: 'Pay Status',
            dropdown: {
                options: payStatusOptions.map((option) => ({
                    label: option.label,
                    value: option.value,
                    color: option.color,
                    textColor: option.textColor,
                })),
                placeholder: 'Select Pay Status',
                onChange: (value, row) => updateAgentStatus(row.objectID, 'payStatus', value),
            },
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
        <Layout>
            <div className='w-full overflow-hidden font-sans h-screen flex flex-col'>
                <div
                    className='flex flex-col gap-4 pt-2 bg-white flex-1 overflow-hidden'
                    style={{ width: 'calc(100vw)', maxWidth: '100%' }}
                >
                    {/* Header */}
                    <div className='flex-shrink-0'>
                        <div className='flex items-center justify-between px-6'>
                            <h1 className='text-lg font-semibold text-black'>Agents {/*({totalAgents})*/}</h1>
                            <div className='flex items-center gap-4'>
                                <div className='flex flex-row w-full gap-[10px] items-center'>
                                    <StateBaseTextField
                                        leftIcon={<img src={searchnormalic} alt='Search Icon' className='w-4 h-4' />}
                                        placeholder='Search name and number'
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className='h-8'
                                    />
                                    <button
                                        className='flex items-center justify-center rounded-sm px-2 py-[5px] cursor-pointer hover:bg-gray-900 bg-[#24252E] gap-2'
                                        onClick={() => {
                                            setIsVerificationModalOpen(true)
                                        }}
                                    >
                                        <img src={userTick} alt='Search Icon' className='w-4 h-4' />
                                        <span className='text-white text-sm font-medium'>Verify Agent</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='border-b-1 border-[#F3F3F3] pt-[6px]'></div>
                    </div>

                    {/* Metrics Cards */}
                    <div className='px-6 flex-shrink-0'>
                        <MetricsCards metrics={metrics} />
                    </div>

                    {/* Filters */}
                    <div className='px-6 flex-shrink-0'>
                        <FiltersBar
                            handleSortChange={handleSortChange}
                            sortBy={sortBy}
                            kamOptions={kamOptions}
                            planOptions={planOptions}
                            statusOptions={statusOptions}
                            locationOptions={locationOptions}
                            appInstalledOptions={appInstalledOptions}
                            inventoryStatusOptions={inventoryStatusOptions}
                            selectedKam={selectedKam}
                            setSelectedKam={setSelectedKam}
                            selectedPlan={selectedPlan}
                            setSelectedPlan={setSelectedPlan}
                            selectedStatus={selectedStatus}
                            setSelectedStatus={setSelectedStatus}
                            selectedLocation={selectedLocation}
                            setSelectedLocation={setSelectedLocation}
                            selectedAppInstalled={selectedAppInstalled}
                            setSelectedAppInstalled={setSelectedAppInstalled}
                            selectedInventoryStatuses={selectedInventoryStatuses}
                            setSelectedInventoryStatuses={setSelectedInventoryStatuses}
                            facets={facets}
                            resetAllFilters={resetAllFilters}
                            setIsAgentsFiltersModalOpen={setIsAgentsFiltersModalOpen}
                        />
                    </div>

                    {/* Table Container - This will take remaining space */}
                    <div className='flex-1 flex flex-col gap-[29px] overflow-hidden'>
                        {loading === true ? (
                            <div className='relative h-full overflow-y-auto'>
                                <div className='absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-60'>
                                    <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                                </div>
                            </div>
                        ) : (
                            <div className='h-full overflow-hidden pl-6'>
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
                                    maxHeight='100%'
                                    className='rounded-lg h-full'
                                    stickyHeader={true}
                                />
                            </div>
                        )}
                        {/* Pagination */}
                        <div className='flex items-center justify-center flex-shrink-0'>
                            {/* {totalAgents > ITEMS_PER_PAGE && ( */}
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(totalAgents / ITEMS_PER_PAGE)}
                                onPageChange={setCurrentPage}
                                className=''
                            />
                            {/* )} */}
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
                    <AgentsFiltersModal
                        isOpen={isAgentsFiltersModalOpen}
                        onClose={() => setIsAgentsFiltersModalOpen(false)}
                        filters={modalFilters}
                        onFiltersChange={(newFilters) => {
                            setModalFilters(newFilters)
                            // Reset page when filters change
                            setCurrentPage(1)
                        }}
                    />

                    <AddLeadModal isOpen={isAddLeadModalOpen} onClose={() => setIsAddLeadModalOpen(false)} />
                </div>
            </div>
        </Layout>
    )
}

export default AgentsPage
