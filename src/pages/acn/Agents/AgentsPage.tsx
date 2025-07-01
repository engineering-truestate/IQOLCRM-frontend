'use client'

import React from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '../../../store'
import { setSelectedAgent } from '../../../store/slices/agentDetailsSlice'
import {
    updateAgentStatusThunk,
    updateAgentPayStatusThunk,
    updateAgentKAM,
} from '../../../services/acn/agents/agentThunkService'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
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
import MetricsCards from '../../../components/design-elements/MetricCards'
import algoliaAgentsService from '../../../services/acn/agents/algoliaAgentsService'
import type { AgentSearchFilters } from '../../../services/acn/agents/algoliaAgentsService'
import { getTodayAgentFacets, getAllAgentFacets } from '../../../services/acn/agents/algoliaAgentsService'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'
import { formatUnixDateShort } from '../../../components/helper/getUnixDateTime'
import { formatRelativeTime } from '../../../components/helper/formatDate'
import searchnormalic from '/icons/acn/search-normal.svg'
import userTick from '/icons/acn/user-tick.svg'
import AlgoliaFacetMultiSelect from '../../../components/design-elements/AlgoliaFacetMultiSelect'
import Dropdown from '../../../components/design-elements/Dropdown'
import { agentSortOptions } from '../../../services/acn/agents/algoliaAgentsService'
import Button from '../../../components/design-elements/Button'
import filter from '/icons/acn/filter.svg'
import { AgentsFiltersModal } from '../../../components/acn/AgentsFiltersModal'
import useAuth from '../../../hooks/useAuth'
import { prefetchKamNameMappings } from '../../../services/acn/qc/qcService'

// Status dropdown options with colors
const agentStatusOptions = [
    { label: 'Interested', value: 'interested', color: '#E1F6DF', textColor: '#000000' },
    { label: 'Not Interested', value: 'not interested', color: '#D3D4DD', textColor: '#000000' },
    { label: 'Not Contacted Yet', value: 'not contact yet', color: '#FEECED', textColor: '#000000' },
]

const payStatusOptions = [
    { label: 'Paid', value: 'paid', color: '#E1F6DF', textColor: '#000000' },
    { label: 'Paid By Team', value: 'paid via team', color: '#E1F6DF', textColor: '#000000' },
    { label: 'Will Pay', value: 'will pay', color: '#FEECED', textColor: '#000000' },
    { label: 'Will Not', value: 'will not pay', color: '#FEECED', textColor: '#000000' },
    { label: 'Will Pay Via Team', value: 'will pay via team', color: '#FEECED', textColor: '#000000' },
    { label: 'Maybe', value: 'maybe', color: '#FADA7A', textColor: '#000000' },
]

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
    allFacets: Record<string, any>
    resetAllFilters: () => void
    handleSortChange: (value: string) => void
    sortBy: string
    setIsAgentsFiltersModalOpen: (open: boolean) => void
}

const FiltersBar: React.FC<FiltersBarProps> = ({
    handleSortChange,
    sortBy = 'cp_desc',
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
    allFacets,
    resetAllFilters,
    setIsAgentsFiltersModalOpen,
}) => {
    // Helper to convert options to AlgoliaFacetMultiSelect format using allFacets
    const toFacetOptions = (opts: { label: string; value: string }[], facetName: string) => {
        return opts
            .filter((o) => o.value !== '')
            .map((o) => ({
                value: o.value,
                count: allFacets[facetName]?.[o.value] || 0,
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
                options={toFacetOptions(planOptions, 'userType')}
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
                    count: allFacets[`inventoryStatus.${o.value.toLowerCase()}`]?.true || 0,
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

// Custom hook for URL-based filter management
// Custom hook for URL-based filter management - FIXED VERSION
const useAgentFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    // Get current filter values from URL - these are stable
    const selectedKam = useMemo(() => {
        const value = searchParams.get('kam')
        return value ? value.split(',').filter(Boolean) : []
    }, [searchParams])

    const selectedPlan = useMemo(() => {
        const value = searchParams.get('plan')
        return value ? value.split(',').filter(Boolean) : []
    }, [searchParams])

    const selectedStatus = useMemo(() => {
        const value = searchParams.get('status')
        return value ? value.split(',').filter(Boolean) : []
    }, [searchParams])

    const selectedLocation = useMemo(() => {
        const value = searchParams.get('location')
        return value ? value.split(',').filter(Boolean) : []
    }, [searchParams])

    const selectedAppInstalled = useMemo(() => {
        const value = searchParams.get('appInstalled')
        return value ? value.split(',').filter(Boolean) : []
    }, [searchParams])

    const selectedInventoryStatuses = useMemo(() => {
        const value = searchParams.get('inventoryStatus')
        return value ? value.split(',').filter(Boolean) : []
    }, [searchParams])

    // Simple update function that doesn't cause loops
    const updateSingleFilter = useCallback(
        (key: string, values: string[]) => {
            const newParams = new URLSearchParams(searchParams)

            if (values.length > 0) {
                newParams.set(key, values.join(','))
            } else {
                newParams.delete(key)
            }

            const newUrl = `${window.location.pathname}?${newParams.toString()}`
            window.history.pushState({}, '', newUrl)
            setSearchParams(newParams, { replace: true })
        },
        [searchParams, setSearchParams],
    )

    // Individual setters - NO DEPENDENCIES ON OTHER FILTERS
    const setSelectedKam = useCallback(
        (values: string[]) => {
            updateSingleFilter('kam', values)
        },
        [updateSingleFilter],
    )

    const setSelectedPlan = useCallback(
        (values: string[]) => {
            updateSingleFilter('plan', values)
        },
        [updateSingleFilter],
    )

    const setSelectedStatus = useCallback(
        (values: string[]) => {
            updateSingleFilter('status', values)
        },
        [updateSingleFilter],
    )

    const setSelectedLocation = useCallback(
        (values: string[]) => {
            updateSingleFilter('location', values)
        },
        [updateSingleFilter],
    )

    const setSelectedAppInstalled = useCallback(
        (values: string[]) => {
            updateSingleFilter('appInstalled', values)
        },
        [updateSingleFilter],
    )

    const setSelectedInventoryStatuses = useCallback(
        (values: string[]) => {
            updateSingleFilter('inventoryStatus', values)
        },
        [updateSingleFilter],
    )

    const resetAllFilters = useCallback(() => {
        const newParams = new URLSearchParams()
        const newUrl = `${window.location.pathname}`
        window.history.pushState({}, '', newUrl)
        setSearchParams(newParams, { replace: true })
    }, [setSearchParams])

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
    const [searchParams, setSearchParams] = useSearchParams()
    const searchValue = searchParams.get('search') || ''

    const [metricsData, setMetricsData] = useState({
        totalAgents: 0,
        appInstalled: 0,
        calls: 0,
        connects: 0,
        rnr: 0,
        enquiry: 0,
        agentsEnquired: 0,
    })

    const { kamNameMappings } = useSelector((state: any) => state.qc)
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

    // Static filter options that don't change based on current filters
    const [allFacets, setAllFacets] = useState<Record<string, any>>({})
    const [staticKamOptions, setStaticKamOptions] = useState<{ label: string; value: string }[]>([])
    const [staticPlanOptions, setStaticPlanOptions] = useState<{ label: string; value: string }[]>([])
    const [staticStatusOptions, setStaticStatusOptions] = useState<{ label: string; value: string }[]>([])
    const [staticLocationOptions, setStaticLocationOptions] = useState<{ label: string; value: string }[]>([])
    const [staticAppInstalledOptions, setStaticAppInstalledOptions] = useState<{ label: string; value: string }[]>([])
    const [staticInventoryStatusOptions] = useState<{ label: string; value: string }[]>([
        { label: 'Available', value: 'available' },
        { label: 'Hold', value: 'hold' },
        { label: 'Sold', value: 'sold' },
        { label: 'De-listed', value: 'delisted' },
    ])

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

    interface TodayFacetsType {
        agentStatus?: Record<string, number>
        contactStatus?: Record<string, number>
        noOfEnquiries?: Record<string, number>
        [key: string]: any
    }

    const { platform } = useAuth()
    const acnRole = platform?.acn?.role

    // Initialize static filter options once from all facets
    useEffect(() => {
        const fetchAllFacets = async () => {
            try {
                const allFacetsData = await getAllAgentFacets()
                setAllFacets(allFacetsData)

                // Set static options that won't change based on current filters
                setStaticKamOptions([
                    { label: 'All Roles', value: '' },
                    ...Object.entries(allFacetsData.kamName || {}).map(([value, _]) => ({
                        label: value,
                        value: value,
                    })),
                ])
                setStaticPlanOptions([
                    { label: 'All Plans', value: '' },
                    ...Object.entries(allFacetsData.userType || {}).map(([value, _]) => ({
                        label: value,
                        value: value,
                    })),
                ])
                setStaticStatusOptions([
                    { label: 'All Status', value: '' },
                    ...Object.entries(allFacetsData.agentStatus || {}).map(([value, _]) => ({
                        label: value,
                        value: value,
                    })),
                ])
                setStaticLocationOptions([
                    { label: 'All Locations', value: '' },
                    ...Object.entries(allFacetsData.areaOfOperation || {}).map(([value, _]) => ({
                        label: value,
                        value: value,
                    })),
                ])
                setStaticAppInstalledOptions([
                    { label: 'All', value: '' },
                    ...Object.entries(allFacetsData.appInstalled || {}).map(([value, _]) => ({
                        label: value === 'true' ? 'Yes' : 'No',
                        value: value,
                    })),
                ])
            } catch (error) {
                console.error('Error fetching all facets:', error)
            }
        }

        fetchAllFacets()
    }, [])

    const [todayFacets, setTodayFacets] = useState<TodayFacetsType>({})

    // Sort state and handler for Algolia sort
    const sortBy = searchParams.get('sort') || 'cp_desc'
    const handleSortChange = (value: string) => {
        const newParams = new URLSearchParams(searchParams)
        if (value === 'recent') {
            newParams.delete('sort')
        } else {
            newParams.set('sort', value)
        }
        const newUrl = `${window.location.pathname}?${newParams.toString()}`
        window.history.pushState({}, '', newUrl)
        setCurrentPage(1)
        setSearchParams(newParams, { replace: true })
    }

    // Handle search input changes
    const setSearchValue = (value: string) => {
        const newParams = new URLSearchParams(searchParams)
        if (value) {
            newParams.set('search', value)
        } else {
            newParams.delete('search')
        }
        const newUrl = `${window.location.pathname}?${newParams.toString()}`
        window.history.pushState({}, '', newUrl)
        // Force re-render of searchParams
        setSearchParams(newParams, { replace: true })
    }

    useEffect(() => {
        const fetchFacets = async () => {
            try {
                // Get today's filtered facets (for metrics)
                const todayFacetsData = await getTodayAgentFacets()
                setTodayFacets(todayFacetsData)
            } catch (error) {
                console.error('Error fetching facets:', error)
            }
        }

        fetchFacets()
    }, [])

    const metrics = useMemo(() => {
        return [
            { label: 'Total Agents', value: metricsData.totalAgents },
            { label: 'Interested', value: allFacets.agentStatus?.['interested'] || 0 },
            { label: 'Calls', value: metricsData.calls },
            { label: 'Connects', value: metricsData.connects },
            { label: 'RNR', value: metricsData.rnr },
            { label: 'Enquiry', value: metricsData.enquiry },
            { label: 'Agents Enquired', value: metricsData.agentsEnquired },
            { label: 'App Installed', value: metricsData.appInstalled },
        ]
    }, [metricsData, todayFacets])

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

            // Combine all filters - USE ARRAYS, NOT SINGLE VALUES
            const filters: AgentSearchFilters = {
                agentStatus: selectedStatus.length > 0 ? selectedStatus : undefined,
                kamName: selectedKam.length > 0 ? selectedKam : undefined,
                userType: selectedPlan.length > 0 ? selectedPlan : undefined,
                areaOfOperation: selectedLocation.length > 0 ? selectedLocation : undefined,
                inventoryStatus: Object.keys(inventoryStatusFilter).length > 0 ? inventoryStatusFilter : undefined,
                appInstalled: selectedAppInstalled.length > 0 ? selectedAppInstalled : undefined,
                ...modalFilters,
            }

            // Fetch both agents and metrics
            const [agentsResponse, metricsResponse] = await Promise.all([
                algoliaAgentsService.searchAgents({
                    query: searchValue,
                    filters,
                    page: currentPage - 1,
                    hitsPerPage: ITEMS_PER_PAGE,
                    sortBy: sortBy || undefined,
                }),
                algoliaAgentsService.getAgentMetrics(filters),
            ])

            setAgentsData(agentsResponse.hits)
            setTotalAgents(agentsResponse.nbHits)
            setMetricsData(metricsResponse)

            if (agentsResponse.facets) {
                setFacets(agentsResponse.facets)
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
    }, [fetchAgents])

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

    // Create a comprehensive mapping from kamId to kamName
    const kamIdToNameMap = useMemo(() => {
        const map = new Map<string, string>()

        // Add prefetched mappings first (highest priority)
        Object.entries(kamNameMappings).forEach(([kamId, kamName]) => {
            if (kamId && kamId !== 'N/A' && kamName && kamName !== 'N/A') {
                map.set(kamId, kamName as string)
            }
        })

        // Add mappings from current agents data (lowest priority)
        agentsData.forEach((agent) => {
            if (agent.kamId && agent.kamId !== 'N/A' && agent.kamName && agent.kamName !== 'N/A') {
                map.set(agent.kamId, agent.kamName)
            }
        })

        return map
    }, [kamNameMappings, agentsData])

    useEffect(() => {
        dispatch(prefetchKamNameMappings() as any)
    }, [dispatch])

    // Generate KAM options from facets with kamName labels but kamId values
    const kamAssignedOptions: DropdownOption[] = useMemo(() => {
        const options: DropdownOption[] = []

        // Use facets.kamId instead of facets.kamName if available
        const kamFacets = facets.kamId || facets.kamName || {}

        Object.keys(kamFacets).forEach((facetKey) => {
            // Check if facetKey is in format "kamId:kamName" or just "kamId"
            let kamId: string
            let kamName: string

            if (facetKey.includes(':')) {
                // Split combined "kamId:kamName" format
                ;[kamId, kamName] = facetKey.split(':')
            } else {
                // Use as is and lookup kamName
                kamId = facetKey
                kamName = kamIdToNameMap.get(kamId) || kamId
            }

            options.push({
                label: kamName, // Display kamName
                value: kamId, // Use pure kamId as value
                color: '#F3F3F3',
                textColor: '#000000',
            })
        })

        return options
    }, [facets.kamId, facets.kamName, kamIdToNameMap])

    // Helper function to update agent KAM
    const updateAgentKAMHandler = async (agentId: string, kamId: string) => {
        try {
            // Get kamName from the mapping
            const kamName = kamIdToNameMap.get(kamId) || kamId

            // Update local state optimistically
            setAgentsData((prevData) =>
                prevData.map((agent) => (agent.objectID === agentId ? { ...agent, kamId, kamName } : agent)),
            )

            // Update in Firebase using thunk with role check
            await dispatch(
                updateAgentKAM({
                    cpId: agentId,
                    kamId: kamId,
                    kamName: kamName,
                    userRole: acnRole,
                }),
            ).unwrap()

            console.log('✅ Agent KAM updated successfully')
        } catch (error) {
            console.error('❌ Failed to update agent KAM:', error)
            // Revert local state on error
            setAgentsData((prevData) =>
                prevData.map((agent) =>
                    agent.objectID === agentId ? { ...agent, kamId: agent.kamId, kamName: agent.kamName } : agent,
                ),
            )
        }
    }

    // Table columns configuration
    const columns: TableColumn[] = useMemo(
        () => [
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
                key: 'noOfInventories',
                header: 'Inventories',
                render: (value) => <StatusBadge status={value} type='agent' />,
            },
            {
                key: 'noOfRequirements',
                header: 'Requirements',
                render: (value) => <StatusBadge status={value} type='agent' />,
            },
            {
                key: 'noOfEnquiries',
                header: 'Enquiries',
                render: (value) => <StatusBadge status={value} type='agent' />,
            },
            {
                key: 'noOfLegalLeads',
                header: 'Legal Leads',
                render: (value) => <StatusBadge status={value} type='agent' />,
            },
            {
                key: 'lastSeen',
                header: 'Last Seen',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>{formatUnixDateShort(value)}</span>
                ),
            },
            {
                key: 'lastConnected',
                header: 'Last Connected',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>
                        {value ? formatRelativeTime(value) : 'Never'}
                    </span>
                ),
            },
            {
                key: 'lastTried',
                header: 'Last Tried',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>
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
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>{formatUnixDateShort(value)}</span>
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
                key: 'kamId',
                header: 'KAM',
                ...(acnRole === 'marketing' || acnRole === 'kamModerator'
                    ? {
                          dropdown: {
                              options: kamAssignedOptions.map((option) => ({
                                  label: option.label,
                                  value: option.value,
                                  color: option.color,
                                  textColor: option.textColor,
                              })),
                              placeholder: 'Select KAM',
                              onChange: (kamId, row) => updateAgentKAMHandler(row.objectID, kamId),
                          },
                      }
                    : {
                          render: (value, row) => (
                              <span className='whitespace-nowrap text-sm font-normal w-auto'>
                                  {toCapitalizedWords(row.kamName || value || 'N/A')}
                              </span>
                          ),
                      }),
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
        ],
        [kamAssignedOptions, updateAgentKAMHandler, acnRole, updateAgentStatus, kamIdToNameMap, agentsData],
    )

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
                            <h1 className='text-lg font-semibold text-black'>Agents</h1>
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
                            kamOptions={staticKamOptions}
                            planOptions={staticPlanOptions}
                            statusOptions={staticStatusOptions}
                            locationOptions={staticLocationOptions}
                            appInstalledOptions={staticAppInstalledOptions}
                            inventoryStatusOptions={staticInventoryStatusOptions}
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
                            allFacets={allFacets}
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
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(totalAgents / ITEMS_PER_PAGE)}
                                onPageChange={setCurrentPage}
                                className=''
                            />
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
