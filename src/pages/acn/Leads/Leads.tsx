'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createSelector } from '@reduxjs/toolkit'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import StatusBadge from '../../../components/design-elements/StatusBadge'
import NotesModal from '../../../components/acn/NotesModal'
import CallResultModal from '../../../components/acn/CallModal'
import VerificationModal from '../../../components/acn/VerificationModal'
import AddLeadModal from '../../../components/acn/AddLeadModal'
import MetricsCards from '../../../components/design-elements/MetricCards'
import leadSearchService, { type ILead, type SearchFilters } from '../../../services/acn/leads/algoliaLeadsService'
import { updateLeadStatus, updateLeadKAM, updateLeadBooleanField } from '../../../services/acn/leads/leadsService'
import {
    selectAllLeads,
    selectLeadsLoading,
    selectLeadsError,
    setLeads as setReduxLeads,
} from '../../../store/reducers/acn/leadsReducers'
import type { RootState, AppDispatch } from '../../../store/index'
import { useSearchParams } from 'react-router-dom'
import CustomPagination from '../../../components/design-elements/CustomPagination'

// Import icons
import phoneic from '/icons/acn/phone.svg'
import notesic from '/icons/acn/notes.svg'
import verifyic from '/icons/acn/verify.svg'
import resetic from '/icons/acn/rotate-left.svg'
import leadaddic from '/icons/acn/user-add.svg'
import facebookic from '/icons/acn/facebook.svg'
import whatsappic from '/icons/acn/whatsapp.svg'
import instagramic from '/icons/acn/insta.svg'
import referic from '/icons/acn/referral.svg'
import organicic from '/icons/acn/organic.svg'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'

// Define filter state interface
interface FilterState {
    kamName: string[]
    sort: string
    connectStatus: string[]
    source: string[]
    leadStatus: string[]
    page: number
    query: string
}

// Constants
const ALL_LEAD_STATUS_OPTIONS = [
    { value: 'interested', count: 0 },
    { value: 'not interested', count: 0 },
    { value: 'not contact yet', count: 0 },
]

const ALL_CONTACT_STATUS_OPTIONS = [
    { value: 'connected', count: 0 },
    { value: 'not contact', count: 0 },
    { value: 'rnr-1', count: 0 },
    { value: 'rnr-2', count: 0 },
    { value: 'rnr-3', count: 0 },
    { value: 'rnr-4', count: 0 },
    { value: 'rnr-5', count: 0 },
    { value: 'rnr-6', count: 0 },
]

const ALL_SOURCE_OPTIONS = [
    { value: 'whatsApp', count: 0 },
    { value: 'instagram', count: 0 },
    { value: 'facebook', count: 0 },
    { value: 'referral', count: 0 },
    { value: 'direct', count: 0 },
    { value: 'meta', count: 0 },
]

const ITEMS_PER_PAGE = 50

// Memoized selectors
const selectLeadsState = (state: RootState) => state.leads
const selectFilteredLeads = createSelector([selectLeadsState], (leadsState) => Object.values(leadsState.leads))

// Lead Source component
const LeadSourceCell = React.memo(({ source }: { source: string }) => {
    const getSourceIcon = () => {
        switch (source) {
            case 'whatsApp':
                return <img src={whatsappic} alt='WhatsApp' className='w-5 h-5 text-gray-600 flex-shrink-0' />
            case 'instagram':
                return <img src={instagramic} alt='Instagram' className='w-5 h-5 text-gray-600 flex-shrink-0' />
            case 'facebook':
                return <img src={facebookic} alt='Facebook' className='w-5 h-5 text-gray-600 flex-shrink-0' />
            case 'referral':
                return <img src={referic} alt='Referral' className='w-5 h-5 text-gray-600 flex-shrink-0' />
            case 'direct':
                return <img src={organicic} alt='Direct' className='w-5 h-5 text-gray-600 flex-shrink-0' />
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
})

// Multi-select dropdown component
const MultiSelectDropdown = React.memo(
    ({
        allOptions,
        selectedValues,
        onSelectionChange,
        placeholder,
        label,
        facets = {},
    }: {
        allOptions: Array<{ value: string; count: number }>
        selectedValues: string[]
        onSelectionChange: (values: string[]) => void
        placeholder: string
        label: string
        facets?: Record<string, number>
    }) => {
        const [isOpen, setIsOpen] = useState(false)
        const dropdownRef = useRef<HTMLDivElement>(null)

        const updateFilter = useCallback(
            (value: string) => {
                if (selectedValues.includes(value)) {
                    onSelectionChange(selectedValues.filter((v) => v !== value))
                } else {
                    onSelectionChange([...selectedValues, value])
                }
            },
            [selectedValues, onSelectionChange],
        )

        const getFacetCount = useCallback(
            (value: string) => {
                const option = allOptions.find((opt) => opt.value === value)
                if (option && option.count > 0) {
                    return option.count
                }
                return facets[value] || 0
            },
            [allOptions, facets],
        )

        const getDisplayText = useMemo(() => {
            if (selectedValues.length === 0) return placeholder
            if (selectedValues.length === 1) return selectedValues[0]
            return `${selectedValues.length} selected`
        }, [selectedValues, placeholder])

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }

            document.addEventListener('mousedown', handleClickOutside)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }, [])

        return (
            <div className='relative inline-block' ref={dropdownRef}>
                <button
                    className={`flex items-center justify-between px-3 py-1 border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer ${
                        selectedValues.length > 0
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-100 text-black'
                    }`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className='truncate'>{getDisplayText}</span>
                    <svg
                        className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                </button>

                {isOpen && (
                    <div className='absolute z-50 mt-1 min-w-fit w-full bg-white border border-gray-300 rounded-md shadow-lg whitespace-nowrap'>
                        <div className='px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b sticky top-0'>
                            {label}
                        </div>
                        <div className='px-3 py-2 border-b bg-gray-50 flex gap-2'>
                            <button
                                className='text-xs text-blue-600 hover:text-blue-800 font-medium'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onSelectionChange(allOptions.map((opt) => opt.value))
                                }}
                            >
                                Select All
                            </button>
                            <span className='text-xs text-gray-400'>|</span>
                            <button
                                className='text-xs text-red-600 hover:text-red-800 font-medium'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onSelectionChange([])
                                }}
                            >
                                Clear All
                            </button>
                        </div>

                        {allOptions.map((facet) => {
                            const currentCount = getFacetCount(facet.value)
                            const isSelected = selectedValues.includes(facet.value)
                            return (
                                <div
                                    key={facet.value}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 last:rounded-b-md ${
                                        isSelected ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => updateFilter(facet.value)}
                                >
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <input
                                                type='checkbox'
                                                checked={isSelected}
                                                onChange={() => {}}
                                                className='rounded text-blue-600'
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span
                                                className={isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}
                                            >
                                                {facet.value}
                                            </span>
                                        </div>
                                        <span className='text-xs text-gray-500'>({currentCount})</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    },
)

const LeadsPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const [searchParams] = useSearchParams()

    // Redux selectors
    const reduxLeads = useSelector(selectFilteredLeads)
    const reduxLoading = useSelector((state: RootState) => selectLeadsLoading(state))
    const reduxError = useSelector((state: RootState) => selectLeadsError(state))

    // Filter state with proper typing
    const [filterState, setFilterState] = useState<FilterState>(() => ({
        kamName: [],
        sort: '',
        connectStatus: [],
        source: [],
        leadStatus: [],
        page: 1,
        query: '',
    }))

    // Load initial URL params only once on mount
    useEffect(() => {
        const urlParams = {
            query: searchParams.get('query') || '',
            leadStatus: searchParams.get('leadStatus')?.split(',').filter(Boolean) || [],
            connectStatus: searchParams.get('connectStatus')?.split(',').filter(Boolean) || [],
            source: searchParams.get('source')?.split(',').filter(Boolean) || [],
            sort: searchParams.get('sort') || '',
            page: parseInt(searchParams.get('page') || '1', 10),
            kamName: searchParams.get('kamName')?.split(',').filter(Boolean) || [],
        }
        console.log(urlParams.sort)
        setFilterState({
            kamName: urlParams.kamName,
            sort: urlParams.sort,
            connectStatus: urlParams.connectStatus,
            source: urlParams.source,
            leadStatus: urlParams.leadStatus,
            page: urlParams.page,
            query: urlParams.query,
        })
    }, []) // Only run once on mount

    // **KEY FIX: Function to update URL without page reload**
    const updateURLSilently = useCallback((newFilterState: FilterState) => {
        const newParams = new URLSearchParams()

        if (newFilterState.query) newParams.set('query', newFilterState.query)
        if (newFilterState.leadStatus.length > 0) newParams.set('leadStatus', newFilterState.leadStatus.join(','))
        if (newFilterState.connectStatus.length > 0)
            newParams.set('connectStatus', newFilterState.connectStatus.join(','))
        if (newFilterState.source.length > 0) newParams.set('source', newFilterState.source.join(','))
        if (newFilterState.sort) newParams.set('sort', newFilterState.sort)
        if (newFilterState.page > 1) newParams.set('page', newFilterState.page.toString())
        if (newFilterState.kamName.length > 0) newParams.set('kamName', newFilterState.kamName.join(','))

        const newUrl = `${window.location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`

        // **This is the key - use replaceState to update URL without navigation**
        window.history.replaceState(null, '', newUrl)
    }, [])

    // **Updated filter handlers - Update both state and URL**
    const handleLeadStatusChange = useCallback(
        (statuses: string[]) => {
            const newState = { ...filterState, leadStatus: statuses, page: 1 }
            setFilterState(newState)
            updateURLSilently(newState)
        },
        [filterState, updateURLSilently],
    )

    const handleConnectStatusChange = useCallback(
        (statuses: string[]) => {
            const newState = { ...filterState, connectStatus: statuses, page: 1 }
            setFilterState(newState)
            updateURLSilently(newState)
        },
        [filterState, updateURLSilently],
    )

    const handleSourceChange = useCallback(
        (sources: string[]) => {
            const newState = { ...filterState, source: sources, page: 1 }
            setFilterState(newState)
            updateURLSilently(newState)
        },
        [filterState, updateURLSilently],
    )

    const handleKAMChange = useCallback(
        (kams: string[]) => {
            const newState = { ...filterState, kamName: kams, page: 1 }
            setFilterState(newState)
            updateURLSilently(newState)
        },
        [filterState, updateURLSilently],
    )

    const handleSortChange = useCallback(
        (sort: string) => {
            const newState = { ...filterState, sort: sort || '', page: 1 }
            setFilterState(newState)
            updateURLSilently(newState)
        },
        [filterState, updateURLSilently],
    )

    const handlePageChange = useCallback(
        (page: number) => {
            const newState = { ...filterState, page }
            setFilterState(newState)
            updateURLSilently(newState)
        },
        [filterState, updateURLSilently],
    )

    const resetFilters = useCallback(() => {
        const newState = {
            kamName: [],
            sort: '',
            connectStatus: [],
            source: [],
            leadStatus: [],
            page: 1,
            query: '',
        }
        setFilterState(newState)
        updateURLSilently(newState)
    }, [updateURLSilently])

    // Local state
    const [leads, setLeads] = useState<ILead[]>([])
    const [totalLeads, setTotalLeads] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})
    const [kamOptions, setKamOptions] = useState<Array<{ value: string; count: number }>>([])

    // Modal states
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
    const [isCallResultModalOpen, setIsCallResultModalOpen] = useState(false)
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState<ILead | null>(null)

    // Mounted ref
    const mounted = useRef(true)
    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
        }
    }, [])

    // Optimistic update functions
    const handleUpdateLeadStatus = useCallback(
        async (leadId: string, status: string) => {
            try {
                setLeads((prevLeads) =>
                    prevLeads.map((lead) =>
                        lead.leadId === leadId
                            ? { ...lead, leadStatus: status as any, lastModified: Date.now() }
                            : lead,
                    ),
                )
                await dispatch(updateLeadStatus({ leadId, status })).unwrap()
            } catch (error) {
                console.error('Failed to update lead status:', error)
                searchLeads()
            }
        },
        [dispatch],
    )

    const handleUpdateKAM = useCallback(
        async (leadId: string, kamName: string) => {
            try {
                setLeads((prevLeads) =>
                    prevLeads.map((lead) =>
                        lead.leadId === leadId ? { ...lead, kamName, lastModified: Date.now() } : lead,
                    ),
                )
                await dispatch(updateLeadKAM({ leadId, kamName })).unwrap()
            } catch (error) {
                console.error('Failed to update KAM:', error)
                searchLeads()
            }
        },
        [dispatch],
    )

    const handleUpdateBooleanField = useCallback(
        async (leadId: string, field: keyof ILead, value: boolean) => {
            try {
                setLeads((prevLeads) =>
                    prevLeads.map((lead) =>
                        lead.leadId === leadId ? { ...lead, [field]: value, lastModified: Date.now() } : lead,
                    ),
                )
                await dispatch(updateLeadBooleanField({ leadId, field, value })).unwrap()
            } catch (error) {
                console.error('Failed to update boolean field:', error)
                searchLeads()
            }
        },
        [dispatch],
    )

    // Optimized search function
    const searchLeads = useCallback(async () => {
        if (!mounted.current) return

        setLoading(true)
        setError(null)

        try {
            const response = await leadSearchService.searchLeads(
                filterState.query || '',
                {
                    leadStatus: filterState.leadStatus,
                    contactStatus: filterState.connectStatus,
                    source: filterState.source,
                    kamName: filterState.kamName,
                },
                Math.max(0, filterState.page - 1),
                ITEMS_PER_PAGE,
                filterState.sort || undefined,
            )

            if (!mounted.current) return

            setLeads(response.hits || [])
            setTotalLeads(response.nbHits || 0)
            setFacets(response.facets || {})

            try {
                dispatch(setReduxLeads(response.hits))
            } catch (err) {
                console.warn('Failed to update Redux store:', err)
            }
        } catch (err) {
            console.error('Search error:', err)
            if (mounted.current) {
                setError(err instanceof Error ? err.message : 'Search failed')
                setLeads([])
                setTotalLeads(0)
                setFacets({})
            }
        } finally {
            if (mounted.current) {
                setLoading(false)
            }
        }
    }, [filterState, dispatch])

    // Load KAM options
    useEffect(() => {
        const loadKamOptions = async () => {
            try {
                const kamFacets = await leadSearchService.getFacetValues('kamName')
                setKamOptions(kamFacets)
            } catch (error) {
                console.error('Error loading KAM options:', error)
            }
        }
        loadKamOptions()
    }, [])

    // Debounced search with proper cleanup
    const debouncedSearchRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        // Clear previous timeout
        if (debouncedSearchRef.current) {
            clearTimeout(debouncedSearchRef.current)
        }

        // Set new timeout for search
        if (filterState.query) {
            debouncedSearchRef.current = setTimeout(() => {
                searchLeads()
            }, 300)
        } else {
            searchLeads()
        }

        // Cleanup
        return () => {
            if (debouncedSearchRef.current) {
                clearTimeout(debouncedSearchRef.current)
            }
        }
    }, [filterState, searchLeads])

    // **Updated search input handler**
    const handleSearchValueChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newState = { ...filterState, query: e.target.value, page: 1 }
            setFilterState(newState)
            updateURLSilently(newState)
        },
        [filterState, updateURLSilently],
    )

    // Memoized calculations
    const metrics = useMemo(() => {
        const totalLeadsCount = totalLeads
        const notContactedCount = leads.filter((lead) => lead.leadStatus === 'not contact yet').length
        const interestedCount = leads.filter((lead) => lead.leadStatus === 'interested').length
        const verifiedCount = leads.filter((lead) => lead.verified).length
        const connectedCount = leads.filter((lead) => lead.contactStatus === 'connected').length
        const rnrCount = leads.filter((lead) => lead.contactStatus && lead.contactStatus.startsWith('rnr')).length

        return [
            { label: 'Total Leads', value: totalLeadsCount },
            { label: 'Not Contacted', value: notContactedCount },
            { label: 'Total Interested', value: interestedCount },
            { label: 'Total Verified', value: verifiedCount },
            { label: 'Calls', value: connectedCount },
            { label: 'Connects', value: connectedCount },
            { label: 'RNR', value: rnrCount },
        ]
    }, [totalLeads, leads])

    const totalPages = useMemo(() => Math.ceil(totalLeads / ITEMS_PER_PAGE), [totalLeads])

    const mergeOptionsWithFacets = useCallback(
        (staticOptions: Array<{ value: string; count: number }>, facetName: string) => {
            const facetData = facets[facetName] || {}
            return staticOptions.map((option) => ({
                ...option,
                count: facetData[option.value] || 0,
            }))
        },
        [facets],
    )

    // Static options
    const sortOptions = useMemo(
        () => [
            { label: 'Newest First', value: 'added_desc' },
            { label: 'Oldest First', value: 'added_asc' },
            { label: 'Name A-Z', value: 'name_asc' },
            { label: 'Name Z-A', value: 'name_desc' },
            { label: 'Last Connect', value: 'lastConnect_desc' },
        ],
        [],
    )

    const leadStatusDropdownOptions: DropdownOption[] = useMemo(
        () => [
            {
                label: 'Interested',
                value: 'interested',
                color: '#E1F6DF',
                textColor: '#065F46',
            },
            {
                label: 'Not Interested',
                value: 'not interested',
                color: '#D3D4DD',
                textColor: '#374151',
            },
            {
                label: 'No Contact Yet',
                value: 'not contact yet',
                color: '#FEECED',
                textColor: '#991B1B',
            },
        ],
        [],
    )

    const kamAssignedOptions: DropdownOption[] = useMemo(
        () => [
            ...Object.keys(facets.kamName || {}).map((kam) => ({
                label: kam,
                value: kam,
                color: '#F3F3F3',
            })),
        ],
        [facets.kamName],
    )

    // Table columns
    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'leadId',
                header: 'Lead ID',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                ),
            },
            {
                key: 'name',
                header: 'Lead Name',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-semibold w-auto'>{toCapitalizedWords(value)}</span>
                ),
            },
            {
                key: 'phonenumber',
                header: 'Contact Number',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                ),
            },
            {
                key: 'lastTried',
                header: 'Last Tried',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>
                        {value ? formatUnixDate(value) : 'Never'}
                    </span>
                ),
            },
            {
                key: 'lastConnect',
                header: 'Last Connect',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>
                        {value ? formatUnixDate(value) : 'Never'}
                    </span>
                ),
            },
            {
                key: 'leadStatus',
                header: 'Lead Status',
                dropdown: {
                    options: leadStatusDropdownOptions,
                    placeholder: 'Select Status',
                    onChange: (value, row) => {
                        handleUpdateLeadStatus(row.leadId, value)
                    },
                },
            },
            {
                key: 'contactStatus',
                header: 'Connect Status',
                render: (value) => (
                    <div className='whitespace-nowrap w-auto'>
                        <StatusBadge status={value} type='connect' />
                    </div>
                ),
            },
            {
                key: 'kamName',
                header: 'KAM Assigned',
                dropdown: {
                    options: kamAssignedOptions,
                    placeholder: 'Select KAM',
                    onChange: (value, row) => {
                        handleUpdateKAM(row.leadId, value)
                    },
                },
            },
            {
                key: 'source',
                header: 'Lead Source',
                render: (value) => (
                    <div className='whitespace-nowrap w-auto'>
                        <LeadSourceCell source={value} />
                    </div>
                ),
            },
            {
                key: 'communityJoined',
                header: 'Joined Community',
                render: (value, row) => (
                    <input
                        type='checkbox'
                        checked={value === true}
                        onChange={(e) => {
                            handleUpdateBooleanField(row.leadId, 'communityJoined', e.target.checked)
                        }}
                        className='rounded text-blue-600'
                    />
                ),
            },
            {
                key: 'onBroadcast',
                header: 'On Broadcast',
                render: (value, row) => (
                    <input
                        type='checkbox'
                        checked={value === true}
                        onChange={(e) => {
                            handleUpdateBooleanField(row.leadId, 'onBroadcast', e.target.checked)
                        }}
                        className='rounded text-blue-600'
                    />
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
        ],
        [
            leadStatusDropdownOptions,
            kamAssignedOptions,
            handleUpdateLeadStatus,
            handleUpdateKAM,
            handleUpdateBooleanField,
        ],
    )

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden h-screen font-sans flex flex-col'>
                <div
                    className='flex flex-col gap-4 pt-2 bg-white flex-1 overflow-hidden'
                    style={{ width: 'calc(100vw)', maxWidth: '100%' }}
                >
                    {/* Header */}
                    <div className='flex-shrink-0'>
                        <div className='flex items-center justify-between mb-2 px-6'>
                            <h1 className='text-lg font-semibold text-black'>Leads ({totalLeads})</h1>
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
                                        value={filterState.query}
                                        onChange={handleSearchValueChange}
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

                        {/* Metrics */}
                        <MetricsCards metrics={metrics} className='mb-2 px-6' />

                        {/* Filters */}
                        <div className='flex items-center gap-2 mb-2 flex-wrap px-6'>
                            <button
                                className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md'
                                onClick={resetFilters}
                            >
                                <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                            </button>

                            <MultiSelectDropdown
                                allOptions={kamOptions}
                                selectedValues={filterState.kamName}
                                onSelectionChange={handleKAMChange}
                                placeholder='KAM'
                                label='Select KAMs'
                                facets={facets.kamName || {}}
                            />

                            <Dropdown
                                options={sortOptions}
                                onSelect={handleSortChange}
                                defaultValue={filterState.sort}
                                placeholder='Sort'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1  bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />

                            <MultiSelectDropdown
                                allOptions={mergeOptionsWithFacets(ALL_CONTACT_STATUS_OPTIONS, 'contactStatus')}
                                selectedValues={filterState.connectStatus}
                                onSelectionChange={handleConnectStatusChange}
                                placeholder='Connect Status'
                                label='Select Connect Status'
                                facets={facets.contactStatus || {}}
                            />

                            <MultiSelectDropdown
                                allOptions={mergeOptionsWithFacets(ALL_LEAD_STATUS_OPTIONS, 'leadStatus')}
                                selectedValues={filterState.leadStatus}
                                onSelectionChange={handleLeadStatusChange}
                                placeholder='Lead Status'
                                label='Select Lead Status'
                                facets={facets.leadStatus || {}}
                            />

                            <MultiSelectDropdown
                                allOptions={mergeOptionsWithFacets(ALL_SOURCE_OPTIONS, 'source')}
                                selectedValues={filterState.source}
                                onSelectionChange={handleSourceChange}
                                placeholder='Source'
                                label='Select Sources'
                                facets={facets.source || {}}
                            />
                        </div>

                        {/* Error Display */}
                        {(error || reduxError) && (
                            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>
                                Error: {error || reduxError}
                            </div>
                        )}
                    </div>

                    {/* Table Container */}
                    <div className='flex-1 flex flex-col gap-[29px] overflow-hidden'>
                        <div className='bg-white rounded-lg overflow-hidden flex-1 pl-6'>
                            <div className='h-full overflow-hidden'>
                                <FlexibleTable
                                    data={leads}
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
                        </div>

                        {/* Pagination */}
                        <div className='flex items-center justify-between px-6 border-t border-[#E3E3E3] flex-shrink-0'>
                            <CustomPagination
                                currentPage={filterState.page}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
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

                    <AddLeadModal isOpen={isAddLeadModalOpen} onClose={() => setIsAddLeadModalOpen(false)} />
                </div>
            </div>
        </Layout>
    )
}

export default LeadsPage
