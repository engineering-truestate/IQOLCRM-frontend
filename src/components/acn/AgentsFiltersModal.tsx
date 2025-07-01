import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import algoliaAgentsService from '../../services/acn/agents/algoliaAgentsService'
import type { AgentSearchFilters } from '../../services/acn/agents/algoliaAgentsService'
import AlgoliaFacetMultiSelect from '../design-elements/AlgoliaFacetMultiSelect'
import Button from '../design-elements/Button'
import { getTodayDateString } from '../helper/formatDate'

// ---------- Types ----------

interface AgentsFiltersModalProps {
    isOpen: boolean
    onClose: () => void
    filters: AgentSearchFilters
    onFiltersChange: (filters: AgentSearchFilters) => void
}

// Helper function to get start of day timestamp
const getStartOfDayTimestamp = (dateString: string): number => {
    const date = new Date(dateString)
    date.setHours(0, 0, 0, 0)
    return Math.floor(date.getTime() / 1000)
}

// Helper function to get end of day timestamp
const getEndOfDayTimestamp = (dateString: string): number => {
    const date = new Date(dateString)
    date.setHours(23, 59, 59, 999)
    return Math.floor(date.getTime() / 1000)
}

// Helper function to convert Unix timestamp to date string
const unixToDateString = (unixTimestamp: number): string => {
    // Handle invalid or zero timestamps
    if (!unixTimestamp || unixTimestamp === 0 || isNaN(unixTimestamp)) {
        return ''
    }

    try {
        const date = new Date(unixTimestamp * 1000)

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return ''
        }

        return date.toISOString().split('T')[0]
    } catch (error) {
        console.error('Error converting timestamp to date string:', error)
        return ''
    }
}

export const AgentsFiltersModal: React.FC<AgentsFiltersModalProps> = ({
    isOpen,
    onClose,
    filters,
    onFiltersChange,
}) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [facets, setFacets] = useState<Record<string, any>>({})
    const [localFilters, setLocalFilters] = useState<AgentSearchFilters>(filters)
    const [dateLimits, setDateLimits] = useState<{
        lastEnquiryDid: { min: number; max: number }
        lastEnquiryReceived: { min: number; max: number }
        lastSeen: { min: number; max: number }
        lastContact: { min: number; max: number }
    }>({
        lastEnquiryDid: { min: 946684800, max: Math.floor(Date.now() / 1000) }, // Start from year 2000
        lastEnquiryReceived: { min: 946684800, max: Math.floor(Date.now() / 1000) },
        lastSeen: { min: 946684800, max: Math.floor(Date.now() / 1000) },
        lastContact: { min: 946684800, max: Math.floor(Date.now() / 1000) },
    })
    const [dateRanges, setDateRanges] = useState<{
        lastEnquiryDid: { start?: string; end?: string }
        lastEnquiryReceived: { start?: string; end?: string }
        lastSeen: { start?: string; end?: string }
        lastContact: { start?: string; end?: string }
    }>({
        lastEnquiryDid: {},
        lastEnquiryReceived: {},
        lastSeen: {},
        lastContact: {},
    })

    // Radio button states for date filters
    const [lastEnquiryDidStatus, setLastEnquiryDidStatus] = useState<'yes' | 'no' | null>(null)
    const [lastEnquiryReceivedStatus, setLastEnquiryReceivedStatus] = useState<'yes' | 'no' | null>(null)
    const [lastSeenStatus, setLastSeenStatus] = useState<'yes' | 'no' | null>(null)
    const [lastContactStatus, setLastContactStatus] = useState<'yes' | 'no' | null>(null)

    // URL parameter helpers
    const getArrayFromParams = (key: string): string[] => {
        const value = searchParams.get(key)
        return value ? value.split(',').filter(Boolean) : []
    }

    const updateUrlParams = (updates: Record<string, string[] | string | undefined>) => {
        const newParams = new URLSearchParams(searchParams)

        Object.entries(updates).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
                newParams.set(key, value.join(','))
            } else if (typeof value === 'string' && value) {
                newParams.set(key, value)
            } else {
                newParams.delete(key)
            }
        })

        const newUrl = `${window.location.pathname}?${newParams.toString()}`
        window.history.pushState({}, '', newUrl)
        setSearchParams(newParams, { replace: true })
    }

    // Initialize local filters from URL when modal opens
    useEffect(() => {
        if (isOpen) {
            const urlFilters: AgentSearchFilters = {
                // Get arrays from URL
                areaOfOperation: getArrayFromParams('modalAreaOfOperation'),
                businessCategory: getArrayFromParams('modalBusinessCategory'),
                payStatus: getArrayFromParams('modalPayStatus'),

                // Get positive date ranges from URL
                lastEnquiryDidFrom: searchParams.get('modalLastEnquiryDidFrom') || undefined,
                lastEnquiryDidTo: searchParams.get('modalLastEnquiryDidTo') || undefined,
                lastEnquiryReceivedFrom: searchParams.get('modalLastEnquiryReceivedFrom') || undefined,
                lastEnquiryReceivedTo: searchParams.get('modalLastEnquiryReceivedTo') || undefined,
                lastSeenFrom: searchParams.get('modalLastSeenFrom') || undefined,
                lastSeenTo: searchParams.get('modalLastSeenTo') || undefined,
                lastContactFrom: searchParams.get('modalLastContactFrom') || undefined,
                lastContactTo: searchParams.get('modalLastContactTo') || undefined,

                // Get negative date ranges from URL
                lastEnquiryDidNotFrom: searchParams.get('modalLastEnquiryDidNotFrom') || undefined,
                lastEnquiryDidNotTo: searchParams.get('modalLastEnquiryDidNotTo') || undefined,
                lastEnquiryReceivedNotFrom: searchParams.get('modalLastEnquiryReceivedNotFrom') || undefined,
                lastEnquiryReceivedNotTo: searchParams.get('modalLastEnquiryReceivedNotTo') || undefined,
                lastSeenNotFrom: searchParams.get('modalLastSeenNotFrom') || undefined,
                lastSeenNotTo: searchParams.get('modalLastSeenNotTo') || undefined,
                lastContactNotFrom: searchParams.get('modalLastContactNotFrom') || undefined,
                lastContactNotTo: searchParams.get('modalLastContactNotTo') || undefined,

                // Get boolean fields from URL
                hasNeverEnquiredDid: searchParams.get('modalHasNeverEnquiredDid') === 'true',
                hasNeverEnquiredReceived: searchParams.get('modalHasNeverEnquiredReceived') === 'true',
                hasNeverBeenSeen: searchParams.get('modalHasNeverBeenSeen') === 'true',
                hasNeverBeenContacted: searchParams.get('modalHasNeverBeenContacted') === 'true',
            }

            setLocalFilters(urlFilters)

            // Set radio button states based on URL
            if (urlFilters.hasNeverEnquiredDid) {
                setLastEnquiryDidStatus('no')
            } else if (urlFilters.lastEnquiryDidFrom || urlFilters.lastEnquiryDidTo) {
                setLastEnquiryDidStatus('yes')
            } else if (urlFilters.lastEnquiryDidNotFrom || urlFilters.lastEnquiryDidNotTo) {
                setLastEnquiryDidStatus('no')
            } else {
                setLastEnquiryDidStatus(null)
            }

            if (urlFilters.hasNeverEnquiredReceived) {
                setLastEnquiryReceivedStatus('no')
            } else if (urlFilters.lastEnquiryReceivedFrom || urlFilters.lastEnquiryReceivedTo) {
                setLastEnquiryReceivedStatus('yes')
            } else if (urlFilters.lastEnquiryReceivedNotFrom || urlFilters.lastEnquiryReceivedNotTo) {
                setLastEnquiryReceivedStatus('no')
            } else {
                setLastEnquiryReceivedStatus(null)
            }

            if (urlFilters.hasNeverBeenSeen) {
                setLastSeenStatus('no')
            } else if (urlFilters.lastSeenFrom || urlFilters.lastSeenTo) {
                setLastSeenStatus('yes')
            } else if (urlFilters.lastSeenNotFrom || urlFilters.lastSeenNotTo) {
                setLastSeenStatus('no')
            } else {
                setLastSeenStatus(null)
            }

            if (urlFilters.hasNeverBeenContacted) {
                setLastContactStatus('no')
            } else if (urlFilters.lastContactFrom || urlFilters.lastContactTo) {
                setLastContactStatus('yes')
            } else if (urlFilters.lastContactNotFrom || urlFilters.lastContactNotTo) {
                setLastContactStatus('no')
            } else {
                setLastContactStatus(null)
            }

            // Convert Unix timestamps back to date strings for display
            setDateRanges({
                lastEnquiryDid: {
                    start:
                        urlFilters.lastEnquiryDidFrom && parseInt(urlFilters.lastEnquiryDidFrom) > 0
                            ? unixToDateString(parseInt(urlFilters.lastEnquiryDidFrom))
                            : urlFilters.lastEnquiryDidNotFrom && parseInt(urlFilters.lastEnquiryDidNotFrom) > 0
                              ? unixToDateString(parseInt(urlFilters.lastEnquiryDidNotFrom))
                              : '',
                    end:
                        urlFilters.lastEnquiryDidTo && parseInt(urlFilters.lastEnquiryDidTo) > 0
                            ? unixToDateString(parseInt(urlFilters.lastEnquiryDidTo))
                            : urlFilters.lastEnquiryDidNotTo && parseInt(urlFilters.lastEnquiryDidNotTo) > 0
                              ? unixToDateString(parseInt(urlFilters.lastEnquiryDidNotTo))
                              : '',
                },
                lastEnquiryReceived: {
                    start:
                        urlFilters.lastEnquiryReceivedFrom && parseInt(urlFilters.lastEnquiryReceivedFrom) > 0
                            ? unixToDateString(parseInt(urlFilters.lastEnquiryReceivedFrom))
                            : urlFilters.lastEnquiryReceivedNotFrom &&
                                parseInt(urlFilters.lastEnquiryReceivedNotFrom) > 0
                              ? unixToDateString(parseInt(urlFilters.lastEnquiryReceivedNotFrom))
                              : '',
                    end:
                        urlFilters.lastEnquiryReceivedTo && parseInt(urlFilters.lastEnquiryReceivedTo) > 0
                            ? unixToDateString(parseInt(urlFilters.lastEnquiryReceivedTo))
                            : urlFilters.lastEnquiryReceivedNotTo && parseInt(urlFilters.lastEnquiryReceivedNotTo) > 0
                              ? unixToDateString(parseInt(urlFilters.lastEnquiryReceivedNotTo))
                              : '',
                },
                lastSeen: {
                    start:
                        urlFilters.lastSeenFrom && parseInt(urlFilters.lastSeenFrom) > 0
                            ? unixToDateString(parseInt(urlFilters.lastSeenFrom))
                            : urlFilters.lastSeenNotFrom && parseInt(urlFilters.lastSeenNotFrom) > 0
                              ? unixToDateString(parseInt(urlFilters.lastSeenNotFrom))
                              : '',
                    end:
                        urlFilters.lastSeenTo && parseInt(urlFilters.lastSeenTo) > 0
                            ? unixToDateString(parseInt(urlFilters.lastSeenTo))
                            : urlFilters.lastSeenNotTo && parseInt(urlFilters.lastSeenNotTo) > 0
                              ? unixToDateString(parseInt(urlFilters.lastSeenNotTo))
                              : '',
                },
                lastContact: {
                    start:
                        urlFilters.lastContactFrom && parseInt(urlFilters.lastContactFrom) > 0
                            ? unixToDateString(parseInt(urlFilters.lastContactFrom))
                            : urlFilters.lastContactNotFrom && parseInt(urlFilters.lastContactNotFrom) > 0
                              ? unixToDateString(parseInt(urlFilters.lastContactNotFrom))
                              : '',
                    end:
                        urlFilters.lastContactTo && parseInt(urlFilters.lastContactTo) > 0
                            ? unixToDateString(parseInt(urlFilters.lastContactTo))
                            : urlFilters.lastContactNotTo && parseInt(urlFilters.lastContactNotTo) > 0
                              ? unixToDateString(parseInt(urlFilters.lastContactNotTo))
                              : '',
                },
            })
        }
    }, [isOpen, searchParams])

    // Fetch facets and date limits when modal opens
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allFacets, limits] = await Promise.all([
                    algoliaAgentsService.getAllAgentFacets(),
                    algoliaAgentsService.getAgentDateLimits(),
                ])
                setFacets(allFacets)
                setDateLimits({
                    lastEnquiryDid: limits.lastEnquiry, // Map to your actual field names
                    lastEnquiryReceived: limits.lastEnquiry,
                    lastSeen: limits.lastSeen,
                    lastContact: limits.lastContact,
                })
            } catch (err) {
                console.error('Failed to fetch agent data:', err)
                setFacets({})
            }
        }

        if (isOpen) {
            fetchData()
        }
    }, [isOpen])

    const handleApply = () => {
        const updatedFilters = { ...localFilters }

        // Helper function to handle date logic for each filter type
        const handleDateFilter = (
            status: 'yes' | 'no' | null,
            dateRange: { start?: string; end?: string },
            limits: { min: number; max: number },
            positiveFromKey: keyof AgentSearchFilters,
            positiveToKey: keyof AgentSearchFilters,
            negativeFromKey: keyof AgentSearchFilters,
            negativeToKey: keyof AgentSearchFilters,
            neverKey: keyof AgentSearchFilters,
        ) => {
            if (status === 'yes') {
                // Clear negative and never filters
                delete updatedFilters[negativeFromKey]
                delete updatedFilters[negativeToKey]
                delete updatedFilters[neverKey]

                // Set positive filters with type assertion
                if (dateRange.start) {
                    const startTimestamp = getStartOfDayTimestamp(dateRange.start)
                    ;(updatedFilters as any)[positiveFromKey] = startTimestamp.toString()
                }
                if (dateRange.end) {
                    const endTimestamp = getEndOfDayTimestamp(dateRange.end)
                    ;(updatedFilters as any)[positiveToKey] = endTimestamp.toString()
                }
            } else if (status === 'no') {
                // Clear positive and never filters
                delete updatedFilters[positiveFromKey]
                delete updatedFilters[positiveToKey]
                delete updatedFilters[neverKey]

                if (dateRange.start || dateRange.end) {
                    // Set negative filters (NOT in range)
                    if (dateRange.start) {
                        const startTimestamp = getStartOfDayTimestamp(dateRange.start)
                        ;(updatedFilters as any)[negativeFromKey] = startTimestamp.toString()
                    }
                    if (dateRange.end) {
                        const endTimestamp = getEndOfDayTimestamp(dateRange.end)
                        ;(updatedFilters as any)[negativeToKey] = endTimestamp.toString()
                    }
                } else {
                    // No date range specified for "No", use never filter
                    ;(updatedFilters as any)[neverKey] = true
                }
            } else {
                // Clear all filters for this type
                delete updatedFilters[positiveFromKey]
                delete updatedFilters[positiveToKey]
                delete updatedFilters[negativeFromKey]
                delete updatedFilters[negativeToKey]
                delete updatedFilters[neverKey]
            }
        }

        // Apply date filter logic for each type
        handleDateFilter(
            lastEnquiryDidStatus,
            dateRanges.lastEnquiryDid,
            dateLimits.lastEnquiryDid,
            'lastEnquiryDidFrom',
            'lastEnquiryDidTo',
            'lastEnquiryDidNotFrom',
            'lastEnquiryDidNotTo',
            'hasNeverEnquiredDid',
        )

        handleDateFilter(
            lastEnquiryReceivedStatus,
            dateRanges.lastEnquiryReceived,
            dateLimits.lastEnquiryReceived,
            'lastEnquiryReceivedFrom',
            'lastEnquiryReceivedTo',
            'lastEnquiryReceivedNotFrom',
            'lastEnquiryReceivedNotTo',
            'hasNeverEnquiredReceived',
        )

        handleDateFilter(
            lastSeenStatus,
            dateRanges.lastSeen,
            dateLimits.lastSeen,
            'lastSeenFrom',
            'lastSeenTo',
            'lastSeenNotFrom',
            'lastSeenNotTo',
            'hasNeverBeenSeen',
        )

        handleDateFilter(
            lastContactStatus,
            dateRanges.lastContact,
            dateLimits.lastContact,
            'lastContactFrom',
            'lastContactTo',
            'lastContactNotFrom',
            'lastContactNotTo',
            'hasNeverBeenContacted',
        )

        // Update URL with all filter fields
        updateUrlParams({
            modalAreaOfOperation: updatedFilters.areaOfOperation,
            modalBusinessCategory: updatedFilters.businessCategory,
            modalPayStatus: updatedFilters.payStatus,
            modalLastEnquiryDidFrom: updatedFilters.lastEnquiryDidFrom,
            modalLastEnquiryDidTo: updatedFilters.lastEnquiryDidTo,
            modalLastEnquiryDidNotFrom: updatedFilters.lastEnquiryDidNotFrom,
            modalLastEnquiryDidNotTo: updatedFilters.lastEnquiryDidNotTo,
            modalLastEnquiryReceivedFrom: updatedFilters.lastEnquiryReceivedFrom,
            modalLastEnquiryReceivedTo: updatedFilters.lastEnquiryReceivedTo,
            modalLastEnquiryReceivedNotFrom: updatedFilters.lastEnquiryReceivedNotFrom,
            modalLastEnquiryReceivedNotTo: updatedFilters.lastEnquiryReceivedNotTo,
            modalLastSeenFrom: updatedFilters.lastSeenFrom,
            modalLastSeenTo: updatedFilters.lastSeenTo,
            modalLastSeenNotFrom: updatedFilters.lastSeenNotFrom,
            modalLastSeenNotTo: updatedFilters.lastSeenNotTo,
            modalLastContactFrom: updatedFilters.lastContactFrom,
            modalLastContactTo: updatedFilters.lastContactTo,
            modalLastContactNotFrom: updatedFilters.lastContactNotFrom,
            modalLastContactNotTo: updatedFilters.lastContactNotTo,
            modalHasNeverEnquiredDid: updatedFilters.hasNeverEnquiredDid ? 'true' : undefined,
            modalHasNeverEnquiredReceived: updatedFilters.hasNeverEnquiredReceived ? 'true' : undefined,
            modalHasNeverBeenSeen: updatedFilters.hasNeverBeenSeen ? 'true' : undefined,
            modalHasNeverBeenContacted: updatedFilters.hasNeverBeenContacted ? 'true' : undefined,
        })

        onFiltersChange(updatedFilters)
        onClose()
    }

    const handleReset = () => {
        setLocalFilters({})
        setDateRanges({
            lastEnquiryDid: {},
            lastEnquiryReceived: {},
            lastSeen: {},
            lastContact: {},
        })
        setLastEnquiryDidStatus(null)
        setLastEnquiryReceivedStatus(null)
        setLastSeenStatus(null)
        setLastContactStatus(null)

        // Clear all modal filters from URL
        updateUrlParams({
            modalAreaOfOperation: undefined,
            modalBusinessCategory: undefined,
            modalPayStatus: undefined,
            modalLastEnquiryDidFrom: undefined,
            modalLastEnquiryDidTo: undefined,
            modalLastEnquiryDidNotFrom: undefined,
            modalLastEnquiryDidNotTo: undefined,
            modalLastEnquiryReceivedFrom: undefined,
            modalLastEnquiryReceivedTo: undefined,
            modalLastEnquiryReceivedNotFrom: undefined,
            modalLastEnquiryReceivedNotTo: undefined,
            modalLastSeenFrom: undefined,
            modalLastSeenTo: undefined,
            modalLastSeenNotFrom: undefined,
            modalLastSeenNotTo: undefined,
            modalLastContactFrom: undefined,
            modalLastContactTo: undefined,
            modalLastContactNotFrom: undefined,
            modalLastContactNotTo: undefined,
            modalHasNeverEnquiredDid: undefined,
            modalHasNeverEnquiredReceived: undefined,
            modalHasNeverBeenSeen: undefined,
            modalHasNeverBeenContacted: undefined,
        })

        onFiltersChange({})
        onClose()
    }

    // Convert facets to options format
    const getFacetOptions = (facetName: string) => {
        return Object.entries(facets[facetName] || {}).map(([value, count]) => ({
            value,
            count: count as number,
        }))
    }

    // Handle date range changes
    const handleDateRangeChange = (
        field: 'lastEnquiryDid' | 'lastEnquiryReceived' | 'lastSeen' | 'lastContact',
        start?: string | null,
        end?: string | null,
    ) => {
        const newDateRanges = {
            ...dateRanges,
            [field]: {
                start: start || undefined,
                end: end || undefined,
            },
        }
        setDateRanges(newDateRanges)
    }

    // Handle area selection
    const handleAreaSelection = (value: string) => {
        const currentValues = localFilters.areaOfOperation || []
        const isSelected = currentValues.includes(value)
        const newValues = isSelected ? currentValues.filter((v) => v !== value) : [...currentValues, value]

        const updatedFilters = { ...localFilters, areaOfOperation: newValues }
        setLocalFilters(updatedFilters)
    }

    // Handle business category selection
    const handleBusinessCategorySelection = (value: string) => {
        const currentValues = localFilters.businessCategory || []
        const isSelected = currentValues.includes(value)
        const newValues = isSelected ? currentValues.filter((v) => v !== value) : [...currentValues, value]

        const updatedFilters = { ...localFilters, businessCategory: newValues }
        setLocalFilters(updatedFilters)
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex'>
            {/* Left overlay (60%) */}
            <div className='w-[60%] h-full bg-black opacity-50' onClick={onClose} role='presentation' />
            {/* Right panel (40%) */}
            <div className='w-[40%] h-full bg-white shadow-lg flex flex-col'>
                {/* Header */}
                <div className='p-2 border-b border-gray-200'>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-xl font-medium text-gray-900'>Filters</h2>
                        <Button onClick={handleReset} className='text-sm border border-gray-300 px-3 py-1 rounded'>
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto p-6 space-y-6'>
                    {/* Pay Status */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <label className='block text-sm font-medium text-gray-700'>Pay Status</label>
                            <AlgoliaFacetMultiSelect
                                options={getFacetOptions('payStatus')}
                                selectedValues={localFilters.payStatus || []}
                                onSelectionChange={(values) => {
                                    const updatedFilters = { ...localFilters, payStatus: values }
                                    setLocalFilters(updatedFilters)
                                }}
                                placeholder='Please Select'
                                label='Pay Status'
                                className='w-full'
                                triggerClassName='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                            />
                        </div>
                    </div>

                    {/* Area */}
                    <div className='space-y-3'>
                        <label className='block text-sm font-medium text-gray-700'>Area</label>
                        <div className='flex flex-wrap gap-2'>
                            {getFacetOptions('areaOfOperation')
                                .slice(0, 6)
                                .map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleAreaSelection(option.value)}
                                        className={`px-3 py-1.5 text-sm border rounded-md transition ${
                                            (localFilters.areaOfOperation || []).includes(option.value)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {option.value}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Work Category */}
                    <div className='space-y-3'>
                        <label className='block text-sm font-medium text-gray-700'>Work Category</label>
                        <div className='flex flex-wrap gap-2'>
                            {getFacetOptions('businessCategory')
                                .slice(0, 3)
                                .map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleBusinessCategorySelection(option.value)}
                                        className={`px-3 py-1.5 text-sm border rounded-md transition ${
                                            (localFilters.businessCategory || []).includes(option.value)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {option.value}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Last Enquiry Did */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
                            <label className='text-sm font-medium text-gray-700'>Last Enquiry Did</label>
                            <div className='flex border border-gray-300 rounded-md overflow-hidden bg-[#F0F0F5]'>
                                <button
                                    onClick={() =>
                                        setLastEnquiryDidStatus(lastEnquiryDidStatus === 'yes' ? null : 'yes')
                                    }
                                    className={`px-3 py-1 text-xs transition ${
                                        lastEnquiryDidStatus === 'yes'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setLastEnquiryDidStatus(lastEnquiryDidStatus === 'no' ? null : 'no')}
                                    className={`px-3 py-1 text-xs border-l border-gray-300 transition ${
                                        lastEnquiryDidStatus === 'no'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                        {/* Show date inputs for BOTH Yes and No */}
                        {(lastEnquiryDidStatus === 'yes' || lastEnquiryDidStatus === 'no') && (
                            <div className='grid grid-cols-2 gap-3'>
                                <input
                                    type='date'
                                    placeholder='DD/MM/YYYY'
                                    value={dateRanges.lastEnquiryDid.start || ''}
                                    onChange={(e) =>
                                        handleDateRangeChange(
                                            'lastEnquiryDid',
                                            e.target.value,
                                            dateRanges.lastEnquiryDid.end,
                                        )
                                    }
                                    className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                                />
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm text-gray-500'>To</span>
                                    <input
                                        type='date'
                                        placeholder='DD/MM/YYYY'
                                        value={dateRanges.lastEnquiryDid.end || ''}
                                        onChange={(e) =>
                                            handleDateRangeChange(
                                                'lastEnquiryDid',
                                                dateRanges.lastEnquiryDid.start,
                                                e.target.value,
                                            )
                                        }
                                        className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                                    />
                                </div>
                            </div>
                        )}
                        {lastEnquiryDidStatus === 'no' && (
                            <p className='text-xs text-gray-500 italic'>
                                Show agents who did NOT enquire within this date range
                            </p>
                        )}
                    </div>

                    {/* Last Enquiry Received */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
                            <label className='text-sm font-medium text-gray-700'>Last Enquiry Received</label>
                            <div className='flex border border-gray-300 rounded-md overflow-hidden bg-[#F0F0F5]'>
                                <button
                                    onClick={() =>
                                        setLastEnquiryReceivedStatus(lastEnquiryReceivedStatus === 'yes' ? null : 'yes')
                                    }
                                    className={`px-3 py-1 text-xs transition ${
                                        lastEnquiryReceivedStatus === 'yes'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() =>
                                        setLastEnquiryReceivedStatus(lastEnquiryReceivedStatus === 'no' ? null : 'no')
                                    }
                                    className={`px-3 py-1 text-xs border-l border-gray-300 transition ${
                                        lastEnquiryReceivedStatus === 'no'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                        {(lastEnquiryReceivedStatus === 'yes' || lastEnquiryReceivedStatus === 'no') && (
                            <div className='grid grid-cols-2 gap-3'>
                                <input
                                    type='date'
                                    placeholder='DD/MM/YYYY'
                                    value={dateRanges.lastEnquiryReceived.start || ''}
                                    onChange={(e) =>
                                        handleDateRangeChange(
                                            'lastEnquiryReceived',
                                            e.target.value,
                                            dateRanges.lastEnquiryReceived.end,
                                        )
                                    }
                                    className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                                />
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm text-gray-500'>To</span>
                                    <input
                                        type='date'
                                        placeholder='DD/MM/YYYY'
                                        value={dateRanges.lastEnquiryReceived.end || ''}
                                        onChange={(e) =>
                                            handleDateRangeChange(
                                                'lastEnquiryReceived',
                                                dateRanges.lastEnquiryReceived.start,
                                                e.target.value,
                                            )
                                        }
                                        className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                                    />
                                </div>
                            </div>
                        )}
                        {lastEnquiryReceivedStatus === 'no' && (
                            <p className='text-xs text-gray-500 italic'>
                                Show agents who did NOT receive enquiries within this date range
                            </p>
                        )}
                    </div>

                    {/* Last Seen */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
                            <label className='text-sm font-medium text-gray-700'>Last Seen</label>
                            <div className='flex border border-gray-300 rounded-md overflow-hidden bg-[#F0F0F5]'>
                                <button
                                    onClick={() => setLastSeenStatus(lastSeenStatus === 'yes' ? null : 'yes')}
                                    className={`px-3 py-1 text-xs transition ${
                                        lastSeenStatus === 'yes'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setLastSeenStatus(lastSeenStatus === 'no' ? null : 'no')}
                                    className={`px-3 py-1 text-xs border-l border-gray-300 transition ${
                                        lastSeenStatus === 'no'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                        {(lastSeenStatus === 'yes' || lastSeenStatus === 'no') && (
                            <div className='grid grid-cols-2 gap-3'>
                                <input
                                    type='date'
                                    placeholder='DD/MM/YYYY'
                                    value={dateRanges.lastSeen.start || ''}
                                    onChange={(e) =>
                                        handleDateRangeChange('lastSeen', e.target.value, dateRanges.lastSeen.end)
                                    }
                                    className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                                />
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm text-gray-500'>To</span>
                                    <input
                                        type='date'
                                        placeholder='DD/MM/YYYY'
                                        value={dateRanges.lastSeen.end || ''}
                                        onChange={(e) =>
                                            handleDateRangeChange('lastSeen', dateRanges.lastSeen.start, e.target.value)
                                        }
                                        className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                                    />
                                </div>
                            </div>
                        )}
                        {lastSeenStatus === 'no' && (
                            <p className='text-xs text-gray-500 italic'>
                                Show agents who were NOT seen within this date range
                            </p>
                        )}
                    </div>

                    {/* Last Connect */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
                            <label className='text-sm font-medium text-gray-700'>Last Connect</label>
                            <div className='flex border border-gray-300 rounded-md overflow-hidden bg-[#F0F0F5]'>
                                <button
                                    onClick={() => setLastContactStatus(lastContactStatus === 'yes' ? null : 'yes')}
                                    className={`px-3 py-1 text-xs transition ${
                                        lastContactStatus === 'yes'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setLastContactStatus(lastContactStatus === 'no' ? null : 'no')}
                                    className={`px-3 py-1 text-xs border-l border-gray-300 transition ${
                                        lastContactStatus === 'no'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                        {(lastContactStatus === 'yes' || lastContactStatus === 'no') && (
                            <div className='grid grid-cols-2 gap-3'>
                                <input
                                    type='date'
                                    placeholder='DD/MM/YYYY'
                                    value={dateRanges.lastContact.start || ''}
                                    onChange={(e) =>
                                        handleDateRangeChange('lastContact', e.target.value, dateRanges.lastContact.end)
                                    }
                                    className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                                />
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm text-gray-500'>To</span>
                                    <input
                                        type='date'
                                        placeholder='DD/MM/YYYY'
                                        value={dateRanges.lastContact.end || ''}
                                        onChange={(e) =>
                                            handleDateRangeChange(
                                                'lastContact',
                                                dateRanges.lastContact.start,
                                                e.target.value,
                                            )
                                        }
                                        className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                                    />
                                </div>
                            </div>
                        )}
                        {lastContactStatus === 'no' && (
                            <p className='text-xs text-gray-500 italic'>
                                Show agents who were NOT contacted within this date range
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className='sticky bottom-0 bg-white border-t border-gray-200 px-6 py-2'>
                    <div className='flex justify-end gap-3'>
                        <Button
                            onClick={onClose}
                            className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition'
                        >
                            Clear
                        </Button>
                        <Button
                            onClick={handleApply}
                            className='px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition'
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
