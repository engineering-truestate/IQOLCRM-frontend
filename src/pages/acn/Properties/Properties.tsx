// PropertiesPage.tsx
'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import CustomPagination from '../../../components/design-elements/CustomPagination'
import ShareInventoryModal from '../../../components/acn/ShareInventoryModal'
import UpdateInventoryStatusModal from '../../../components/acn/UpdateInventoryModal'
import MetricsCards from '../../../components/design-elements/MetricCards'
import resetic from '/icons/acn/rotate-left.svg'
import addinventoryic from '/icons/acn/user-add.svg'
import shareic from '/icons/acn/share.svg'
import editicon from '/icons/acn/write.svg'
import type { IInventory } from '../../../store/reducers/acn/propertiesTypes'
import { PropertiesFiltersModal } from '../../../components/acn/PropertiesFiltersModal'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '../../../store'
import {
    setSearchResults,
    updatePropertyStatusOptimistic,
    updatePropetiesLocal,
} from '../../../store/reducers/acn/propertiesReducers'
import { updatePropertyStatus } from '../../../services/acn/properties/propertiesService'
import type { RootState } from '../../../store'
import checkicon from '/icons/acn/tick.svg'
import crossicon from '/icons/acn/cross.svg'

// Import our Algolia service
import algoliaService, {
    type SearchFilters,
    type FacetValue,
} from '../../../services/acn/properties/algoliaPropertiesService'
import { formatCost } from '../../../components/helper/formatCost'
import filter from '/icons/acn/filter.svg'
import BulkShareModal from '../../../components/acn/BulkShareModal'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'

type PropertyType = 'Resale' | 'Rental'
type PropertyStatus = 'Available' | 'Sold' | 'Hold' | 'De-listed' | 'Pending QC' | 'Rented'

interface StatusOption {
    label: string
    value: string
    color: string
    textColor: string
    slug?: string
}

const PropertiesPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const [searchParams, setSearchParams] = useSearchParams()
    const [activeTab, setActiveTab] = useState<PropertyType>('Resale')
    const properties = useSelector((state: RootState) => state.properties.searchResults)
    const nbHits = useSelector((state: RootState) => state.properties.totalHits)
    const nbPages = useSelector((state: RootState) => state.properties.totalPages)

    const statusConfig = {
        available: {
            slug: 'available',
            label: 'Available',
            value: 'Available',
            color: '#E1F6DF',
            textColor: '#065F46',
        },
        sold: {
            slug: 'sold',
            label: 'Sold',
            value: 'Sold',
            color: '#F5F5F5',
            textColor: '#374151',
        },
        rented: {
            slug: 'rented',
            label: 'Rented',
            value: 'Rented',
            color: '#F5F5F5',
            textColor: '#374151',
        },
        hold: {
            slug: 'hold',
            label: 'Hold',
            value: 'Hold',
            color: '#FFF4E6',
            textColor: '#92400E',
        },
        delisted: {
            slug: 'delisted',
            label: 'De-listed',
            value: 'De-listed',
            color: '#FFC8B8',
            textColor: '#991B1B',
        },
        pendingQc: {
            slug: 'pending-qc',
            label: 'Pending QC',
            value: 'Pending QC',
            color: '#E5E7EB',
            textColor: '#4B5563',
        },
    }

    const getStatusOptions = () => {
        const baseOptions = [
            { label: 'All Status', value: '', slug: 'all' },
            statusConfig.available,
            statusConfig.hold,
            statusConfig.delisted,
            statusConfig.pendingQc,
        ]

        // Add either Sold or Rented based on activeTab
        if (activeTab === 'Resale') {
            baseOptions.splice(1, 0, statusConfig.sold)
        } else {
            baseOptions.splice(1, 0, statusConfig.rented)
        }

        return baseOptions
    }

    // Memoize URL parameters to prevent unnecessary updates
    const urlParams = useMemo(
        () => ({
            query: searchParams.get('query') || '',
            status: searchParams.get('status')?.split(',').filter(Boolean) || [],
            assetType: searchParams.get('assetType')?.split(',').filter(Boolean) || [],
            micromarket: searchParams.get('micromarket')?.split(',').filter(Boolean) || [],
            kamName: searchParams.get('kamName')?.split(',').filter(Boolean) || [],
            unitType: searchParams.get('unitType')?.split(',').filter(Boolean) || [],
            noOfBathrooms: searchParams.get('noOfBathrooms')?.split(',').filter(Boolean) || [],
            noOfBalcony: searchParams.get('noOfBalcony')?.split(',').filter(Boolean) || [],
            facing: searchParams.get('facing')?.split(',').filter(Boolean) || [],
            exactFloor: searchParams.get('exactFloor')?.split(',').filter(Boolean) || [],
            area: searchParams.get('area')?.split(',').filter(Boolean) || [],
            currentStatus: searchParams.get('currentStatus')?.split(',').filter(Boolean) || [],
            landmark: searchParams.get('landmark') || '',
            dateOfStatusLastCheckedFrom: searchParams.get('dateOfStatusLastCheckedFrom') || '',
            dateOfStatusLastCheckedTo: searchParams.get('dateOfStatusLastCheckedTo') || '',
            sort: searchParams.get('sort') || '',
            page: parseInt(searchParams.get('page') || '1', 10),
        }),
        [searchParams],
    )

    // Initialize state from URL parameters
    const [_, setFilterState] = useState(() => ({
        status: urlParams.status || [],
        assetType: urlParams.assetType || [],
        micromarket: urlParams.micromarket || [],
        kamName: urlParams.kamName || [],
        unitType: urlParams.unitType || [],
        noOfBathrooms: urlParams.noOfBathrooms || [],
        noOfBalcony: urlParams.noOfBalcony || [],
        facing: urlParams.facing || [],
        exactFloor: urlParams.exactFloor || [],
        area: urlParams.area || [],
        currentStatus: urlParams.currentStatus || [],
        landmark: urlParams.landmark || '',
        dateOfStatusLastCheckedFrom: urlParams.dateOfStatusLastCheckedFrom || '',
        dateOfStatusLastCheckedTo: urlParams.dateOfStatusLastCheckedTo || '',
        sort: urlParams.sort || '',
        page: urlParams.page || 1,
    }))

    // Effect to sync URL parameters with filter state
    useEffect(() => {
        setFilterState({
            status: urlParams.status || [],
            assetType: urlParams.assetType || [],
            micromarket: urlParams.micromarket || [],
            kamName: urlParams.kamName || [],
            unitType: urlParams.unitType || [],
            noOfBathrooms: urlParams.noOfBathrooms || [],
            noOfBalcony: urlParams.noOfBalcony || [],
            facing: urlParams.facing || [],
            exactFloor: urlParams.exactFloor || [],
            area: urlParams.area || [],
            currentStatus: urlParams.currentStatus || [],
            landmark: urlParams.landmark || '',
            dateOfStatusLastCheckedFrom: urlParams.dateOfStatusLastCheckedFrom || '',
            dateOfStatusLastCheckedTo: urlParams.dateOfStatusLastCheckedTo || '',
            sort: urlParams.sort || '',
            page: urlParams.page || 1,
        })
    }, [urlParams])

    // Filter state
    const [filters, setFilters] = useState<SearchFilters>({})
    const [isModalUpdatingFilters, setIsModalUpdatingFilters] = useState(false)

    // Effect to convert URL parameters to SearchFilters format for Algolia search
    useEffect(() => {
        // Skip conversion if modal is currently updating filters
        if (isModalUpdatingFilters) {
            return
        }

        const searchFilters: SearchFilters = {}

        // Convert URL parameters to SearchFilters format
        if (urlParams.status && urlParams.status.length > 0) {
            searchFilters.status = urlParams.status
        }

        if (urlParams.assetType && urlParams.assetType.length > 0) {
            searchFilters.assetType = urlParams.assetType
        }

        if (urlParams.micromarket && urlParams.micromarket.length > 0) {
            searchFilters.micromarket = urlParams.micromarket
        }

        if (urlParams.kamName && urlParams.kamName.length > 0) {
            searchFilters.kamName = urlParams.kamName
        }

        // Handle range filters from URL (if they exist)
        const totalAskPriceMin = searchParams.get('totalAskPriceMin')
        const totalAskPriceMax = searchParams.get('totalAskPriceMax')
        if (totalAskPriceMin || totalAskPriceMax) {
            searchFilters.totalAskPrice = {
                min: totalAskPriceMin ? parseFloat(totalAskPriceMin) : undefined,
                max: totalAskPriceMax ? parseFloat(totalAskPriceMax) : undefined,
            }
        }

        const askPricePerSqftMin = searchParams.get('askPricePerSqftMin')
        const askPricePerSqftMax = searchParams.get('askPricePerSqftMax')
        if (askPricePerSqftMin || askPricePerSqftMax) {
            searchFilters.askPricePerSqft = {
                min: askPricePerSqftMin ? parseFloat(askPricePerSqftMin) : undefined,
                max: askPricePerSqftMax ? parseFloat(askPricePerSqftMax) : undefined,
            }
        }

        const sbuaMin = searchParams.get('sbuaMin')
        const sbuaMax = searchParams.get('sbuaMax')
        if (sbuaMin || sbuaMax) {
            searchFilters.sbua = {
                min: sbuaMin ? parseFloat(sbuaMin) : undefined,
                max: sbuaMax ? parseFloat(sbuaMax) : undefined,
            }
        }

        const carpetMin = searchParams.get('carpetMin')
        const carpetMax = searchParams.get('carpetMax')
        if (carpetMin || carpetMax) {
            searchFilters.carpet = {
                min: carpetMin ? parseFloat(carpetMin) : undefined,
                max: carpetMax ? parseFloat(carpetMax) : undefined,
            }
        }

        // Handle array filters from URL
        const unitType = searchParams.get('unitType')?.split(',').filter(Boolean)
        if (unitType && unitType.length > 0) {
            searchFilters.unitType = unitType
        }

        const noOfBathrooms = searchParams.get('noOfBathrooms')?.split(',').filter(Boolean)
        if (noOfBathrooms && noOfBathrooms.length > 0) {
            searchFilters.noOfBathrooms = noOfBathrooms
        }

        const noOfBalcony = searchParams.get('noOfBalcony')?.split(',').filter(Boolean)
        if (noOfBalcony && noOfBalcony.length > 0) {
            searchFilters.noOfBalcony = noOfBalcony
        }

        const facing = searchParams.get('facing')?.split(',').filter(Boolean)
        if (facing && facing.length > 0) {
            searchFilters.facing = facing
        }

        const exactFloor = searchParams.get('exactFloor')?.split(',').filter(Boolean)
        if (exactFloor && exactFloor.length > 0) {
            searchFilters.exactFloor = exactFloor
        }

        const area = searchParams.get('area')?.split(',').filter(Boolean)
        if (area && area.length > 0) {
            searchFilters.area = area
        }

        const currentStatus = searchParams.get('currentStatus')?.split(',').filter(Boolean)
        if (currentStatus && currentStatus.length > 0) {
            searchFilters.currentStatus = currentStatus
        }

        // Handle single value filters
        const landmark = searchParams.get('landmark')
        if (landmark) {
            searchFilters.landmark = landmark
        }

        const dateOfStatusLastCheckedFrom = searchParams.get('dateOfStatusLastCheckedFrom')
        if (dateOfStatusLastCheckedFrom) {
            searchFilters.dateOfStatusLastCheckedFrom = dateOfStatusLastCheckedFrom
        }

        const dateOfStatusLastCheckedTo = searchParams.get('dateOfStatusLastCheckedTo')
        if (dateOfStatusLastCheckedTo) {
            searchFilters.dateOfStatusLastCheckedTo = dateOfStatusLastCheckedTo
        }

        // Update the filters state for Algolia search
        setFilters(searchFilters)
    }, [
        urlParams.status,
        urlParams.assetType,
        urlParams.micromarket,
        urlParams.kamName,
        searchParams,
        isModalUpdatingFilters,
    ])

    // Update URL parameters
    const updateURLParams = useCallback(
        (key: string, value: string | string[] | null) => {
            const newParams = new URLSearchParams(searchParams)
            if (value === null || (Array.isArray(value) && value.length === 0)) {
                newParams.delete(key)
            } else if (Array.isArray(value)) {
                newParams.set(key, value.join(','))
            } else {
                newParams.set(key, value)
            }
            if (key !== 'page') {
                newParams.set('page', '1')
            }
            setSearchParams(newParams)
        },
        [searchParams, setSearchParams],
    )

    // Add mounted ref to prevent memory leaks
    const mounted = useRef(true)
    const prevActiveTabRef = useRef(activeTab)

    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
        }
    }, [])

    // Algolia search state
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)

    // Filter state
    const [originalFacets, setOriginalFacets] = useState<Record<string, FacetValue[]>>({})
    const [searchResultFacets, setSearchResultFacets] = useState<Record<string, FacetValue[]>>({})
    const [isAddFilterModalOpen, setIsAddFilterModalOpen] = useState(false)

    // UI state
    // const [currentPage, setCurrentPage] = useState(0)
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState<IInventory | null>(null)
    const [isBulkShareModalOpen, setIsBulkShareModalOpen] = useState(false)

    // Constants
    const ITEMS_PER_PAGE = 50

    // Initialize facets on component mount
    useEffect(() => {
        const initializeFacets = async () => {
            try {
                const facets = await algoliaService.getAllFacets(activeTab)
                setOriginalFacets(facets)
            } catch (error) {
                console.error('Failed to load facets:', error)
            }
        }

        initializeFacets()
    }, [activeTab])

    // Perform Algolia search
    const performSearch = useCallback(
        async (query: string, searchFilters: SearchFilters, page: number, sort: string) => {
            if (!mounted.current) return
            setSearchLoading(true)
            setSearchError(null)

            try {
                const response = await algoliaService.searchProperties({
                    query: query.trim(),
                    filters: searchFilters,
                    page,
                    hitsPerPage: ITEMS_PER_PAGE,
                    sortBy: sort || undefined,
                    propertyType: activeTab,
                })

                if (!mounted.current) return

                dispatch(
                    setSearchResults({
                        ...response,
                        facets: response.facets || {},
                    }),
                )

                // Update search result facets
                if (response.facets) {
                    const updatedSearchFacets: Record<string, FacetValue[]> = {}
                    Object.entries(response.facets).forEach(([facetName, facetValues]) => {
                        updatedSearchFacets[facetName] = Object.entries(facetValues)
                            .map(([value, count]) => ({
                                value,
                                count: count as number,
                            }))
                            .sort((a, b) => b.count - a.count)
                    })
                    setSearchResultFacets(updatedSearchFacets)
                }

                // Track search event
                algoliaService.trackSearchEvent('property_search', {
                    query,
                    filters: searchFilters,
                    resultsCount: response.nbHits,
                    page,
                })
            } catch (error) {
                console.error('Search failed:', error)
                if (mounted.current) {
                    setSearchError(error instanceof Error ? error.message : 'Search failed')
                    dispatch(
                        setSearchResults({
                            hits: [],
                            nbHits: 0,
                            nbPages: 0,
                            page: 0,
                            facets: {},
                            processingTimeMS: 0,
                        }),
                    )
                    setFilters({})
                }
            } finally {
                if (mounted.current) {
                    setSearchLoading(false)
                }
            }
        },
        [activeTab, dispatch],
    )

    // Effect to reset selections when the tab changes
    useEffect(() => {
        setSelectedRows(new Set())
    }, [activeTab])

    // Effect to reset filters when tab changes (Resale vs Rental)
    useEffect(() => {
        // Only reset filters when switching between Resale and Rental tabs
        if (prevActiveTabRef.current !== activeTab) {
            setFilters({})
            setSearchParams({})
            prevActiveTabRef.current = activeTab
        }
    }, [activeTab, setSearchParams])

    // Effect to perform search when parameters change
    useEffect(() => {
        const debouncedSearch = setTimeout(() => {
            performSearch(urlParams.query, filters, Math.max(0, urlParams.page - 1), urlParams.sort)
        }, 300)

        return () => clearTimeout(debouncedSearch)
    }, [urlParams.query, urlParams.page, urlParams.sort, filters, activeTab, performSearch])

    // Update URL handlers
    const handleSearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newParams = new URLSearchParams(searchParams)
        newParams.set('query', e.target.value)
        newParams.set('page', '1') // Reset page when search changes
        setSearchParams(newParams)
    }

    // Event handlers for filters
    const handleStatusChange = useCallback(
        (statuses: string[]) => updateURLParams('status', statuses),
        [updateURLParams],
    )

    const handleAssetTypeChange = useCallback(
        (types: string[]) => updateURLParams('assetType', types),
        [updateURLParams],
    )

    const handleMicromarketChange = useCallback(
        (markets: string[]) => updateURLParams('micromarket', markets),
        [updateURLParams],
    )

    const handleKAMChange = useCallback((kams: string[]) => updateURLParams('kamName', kams), [updateURLParams])

    // const handleUnitTypeChange = useCallback((types: string[]) => updateURLParams('unitType', types), [updateURLParams])

    // const handleBathroomChange = useCallback(
    //     (bathrooms: string[]) => updateURLParams('noOfBathrooms', bathrooms),
    //     [updateURLParams],
    // )

    // const handleBalconyChange = useCallback(
    //     (balconies: string[]) => updateURLParams('noOfBalcony', balconies),
    //     [updateURLParams],
    // )

    // const handleFacingChange = useCallback((facings: string[]) => updateURLParams('facing', facings), [updateURLParams])

    // const handleFloorChange = useCallback(
    //     (floors: string[]) => updateURLParams('exactFloor', floors),
    //     [updateURLParams],
    // )

    // const handleAreaChange = useCallback((areas: string[]) => updateURLParams('area', areas), [updateURLParams])

    // const handleCurrentStatusChange = useCallback(
    //     (statuses: string[]) => updateURLParams('currentStatus', statuses),
    //     [updateURLParams],
    // )

    const handleSortChange = useCallback((sort: string) => updateURLParams('sort', sort || null), [updateURLParams])

    // Handle page change
    const handlePageChange = useCallback(
        (page: number) => updateURLParams('page', (page + 1).toString()),
        [updateURLParams],
    )

    // Reset all filters
    const clearAllFilters = useCallback(() => {
        setSearchParams({})
        setFilters({})
    }, [setSearchParams])

    // Helper function to get status config safely
    const getStatusConfigByValue = (value: string) => {
        const key = Object.keys(statusConfig).find(
            (k) => statusConfig[k as keyof typeof statusConfig].value.toLowerCase() === value.toLowerCase(),
        ) as keyof typeof statusConfig | undefined

        return key ? statusConfig[key] : undefined
    }

    // Convert status config to dropdown options
    const statusDropdownOptions = useMemo(
        () =>
            getStatusOptions()
                .filter((option) => option.label !== 'All Status' && option.label !== 'Pending QC')
                .map((option) => {
                    const config = getStatusConfigByValue(option.value)
                    return {
                        label: option.label,
                        value: option.value,
                        color: config?.color || '#E5E7EB',
                        textColor: config?.textColor || '#4B5563',
                    }
                }) as StatusOption[],
        [],
    ) // getStatusOptions uses activeTab from closure, so no need to include it as dependency

    // Filter Dropdown Components
    const StatusFilter = () => {
        const statusFacets = originalFacets.status || []
        const selectedStatuses = urlParams.status || []
        const [isOpen, setIsOpen] = useState(false)
        const dropdownRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside)
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }, [isOpen])

        const getButtonText = () => {
            if (selectedStatuses.length === 0) return 'Inventory Status'
            if (selectedStatuses.length === 1) return selectedStatuses[0]
            return `Status (${selectedStatuses.length})`
        }

        return (
            <div className='relative inline-block' ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center justify-between px-3 py-1 border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer ${
                        selectedStatuses.length > 0
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-100 text-black'
                    }`}
                >
                    <span>{getButtonText()}</span>
                    <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                </button>

                {isOpen && (
                    <div className='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg min-w-[200px]'>
                        <div
                            className='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md border-b border-gray-200'
                            onClick={() => {
                                handleStatusChange([])
                            }}
                        >
                            <div className='flex items-center gap-2'>
                                <span>Clear All</span>
                                {selectedStatuses.length > 0 && (
                                    <span className='text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded'>
                                        {selectedStatuses.length}
                                    </span>
                                )}
                            </div>
                        </div>
                        {statusFacets.map((facet) => {
                            const currentCount = getFacetCount('status', facet.value)
                            const isSelected = selectedStatuses.includes(facet.value)
                            return (
                                <div
                                    key={facet.value}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 last:rounded-b-md ${
                                        isSelected ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => {
                                        const newStatuses = isSelected
                                            ? selectedStatuses.filter((s) => s !== facet.value)
                                            : [...selectedStatuses, facet.value]
                                        handleStatusChange(newStatuses)
                                    }}
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
                                        <span className='text-xs text-gray-500'>
                                            ({properties ? currentCount : facet.count})
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    const KAMFilter = () => {
        const kamFacets = originalFacets.kamName || []
        const selectedKAMs = urlParams.kamName || []
        const [isOpen, setIsOpen] = useState(false)
        const dropdownRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside)
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }, [isOpen])

        const getButtonText = () => {
            if (selectedKAMs.length === 0) return 'KAM Name'
            if (selectedKAMs.length === 1) return selectedKAMs[0]
            return `KAM Name (${selectedKAMs.length})`
        }

        return (
            <div className='relative inline-block' ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center justify-between px-3 py-1 border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer ${
                        selectedKAMs.length > 0 ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-black'
                    }`}
                >
                    <span>{getButtonText()}</span>
                    <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                </button>

                {isOpen && (
                    <div className='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg min-w-[180px]'>
                        <div
                            className='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md border-b border-gray-200'
                            onClick={() => {
                                handleKAMChange([])
                            }}
                        >
                            <div className='flex items-center gap-2'>
                                <span>Clear All</span>
                                {selectedKAMs.length > 0 && (
                                    <span className='text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded'>
                                        {selectedKAMs.length}
                                    </span>
                                )}
                            </div>
                        </div>
                        {kamFacets.map((facet) => {
                            const currentCount = getFacetCount('kamName', facet.value)
                            const isSelected = selectedKAMs.includes(facet.value)
                            return (
                                <div
                                    key={facet.value}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 last:rounded-b-md ${
                                        isSelected ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => {
                                        const newKAMs = isSelected
                                            ? selectedKAMs.filter((k) => k !== facet.value)
                                            : [...selectedKAMs, facet.value]
                                        handleKAMChange(newKAMs)
                                    }}
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
                                        <span className='text-xs text-gray-500'>
                                            ({properties ? currentCount : facet.count})
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    const AssetTypeFilter = () => {
        const assetTypeFacets = originalFacets.assetType || []
        const selectedAssetTypes = urlParams.assetType || []
        const [isOpen, setIsOpen] = useState(false)
        const dropdownRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside)
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }, [isOpen])

        const getButtonText = () => {
            if (selectedAssetTypes.length === 0) return 'Asset Type'
            if (selectedAssetTypes.length === 1) return selectedAssetTypes[0]
            return `Asset Type (${selectedAssetTypes.length})`
        }

        return (
            <div className='relative inline-block' ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center justify-between px-3 py-1 border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer ${
                        selectedAssetTypes.length > 0
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-100 text-black'
                    }`}
                >
                    <span>{getButtonText()}</span>
                    <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                </button>

                {isOpen && (
                    <div className='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg min-w-[180px]'>
                        <div
                            className='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md border-b border-gray-200'
                            onClick={() => {
                                handleAssetTypeChange([])
                            }}
                        >
                            <div className='flex items-center gap-2'>
                                <span>Clear All</span>
                                {selectedAssetTypes.length > 0 && (
                                    <span className='text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded'>
                                        {selectedAssetTypes.length}
                                    </span>
                                )}
                            </div>
                        </div>
                        {assetTypeFacets.map((facet) => {
                            const currentCount = getFacetCount('assetType', facet.value)
                            const isSelected = selectedAssetTypes.includes(facet.value)
                            return (
                                <div
                                    key={facet.value}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 last:rounded-b-md ${
                                        isSelected ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => {
                                        const newTypes = isSelected
                                            ? selectedAssetTypes.filter((t) => t !== facet.value)
                                            : [...selectedAssetTypes, facet.value]
                                        handleAssetTypeChange(newTypes)
                                    }}
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
                                        <span className='text-xs text-gray-500'>
                                            ({properties ? currentCount : facet.count})
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    const MicromarketFilter = () => {
        const micromarketFacets = originalFacets.micromarket || []
        const selectedMicromarkets = urlParams.micromarket || []
        const [isOpen, setIsOpen] = useState(false)
        const dropdownRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside)
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }, [isOpen])

        const getButtonText = () => {
            if (selectedMicromarkets.length === 0) return 'Micromarket'
            if (selectedMicromarkets.length === 1) return selectedMicromarkets[0]
            return `Micromarket (${selectedMicromarkets.length})`
        }

        return (
            <div className='relative inline-block' ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center justify-between px-3 py-1 border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer ${
                        selectedMicromarkets.length > 0
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-100 text-black'
                    }`}
                >
                    <span>{getButtonText()}</span>
                    <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                </button>

                {isOpen && (
                    <div className='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg min-w-[200px]'>
                        <div
                            className='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md border-b border-gray-200'
                            onClick={() => {
                                handleMicromarketChange([])
                            }}
                        >
                            <div className='flex items-center gap-2'>
                                <span>Clear All</span>
                                {selectedMicromarkets.length > 0 && (
                                    <span className='text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded'>
                                        {selectedMicromarkets.length}
                                    </span>
                                )}
                            </div>
                        </div>
                        {micromarketFacets.map((facet) => {
                            const currentCount = getFacetCount('micromarket', facet.value)
                            const isSelected = selectedMicromarkets.includes(facet.value)
                            return (
                                <div
                                    key={facet.value}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 last:rounded-b-md ${
                                        isSelected ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => {
                                        const newMarkets = isSelected
                                            ? selectedMicromarkets.filter((m) => m !== facet.value)
                                            : [...selectedMicromarkets, facet.value]
                                        handleMicromarketChange(newMarkets)
                                    }}
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
                                        <span className='text-xs text-gray-500'>
                                            ({properties ? currentCount : facet.count})
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    const SortFilter = () => {
        const [isOpen, setIsOpen] = useState(false)
        const sortOptions = [
            { label: 'Sort', value: '' },
            { label: 'Price: Low to High', value: 'price_asc' },
            { label: 'Price: High to Low', value: 'price_desc' },
            { label: 'Recent First', value: 'date_desc' },
        ]

        const currentSort = sortOptions.find((option) => option.value === urlParams.sort)

        return (
            <div className='relative inline-block'>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                >
                    <span>{currentSort?.label || 'Sort'}</span>
                    <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                </button>

                {isOpen && (
                    <div className='absolute z-50 mt-1 w-full min-w-fit inline-block whitespace-nowrap bg-white border border-gray-300 rounded-md shadow-lg'>
                        {sortOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md ${
                                    option.value === urlParams.sort ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                                onClick={() => {
                                    handleSortChange(option.value)
                                    setIsOpen(false)
                                }}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // Table columns
    const getColumns = (): TableColumn[] => {
        const baseColumns: TableColumn[] = [
            {
                key: 'select',
                header: '',
                render: (_, row) => (
                    <input
                        type='checkbox'
                        checked={selectedRows.has(row.propertyId || row.id)}
                        onChange={(e) => handleRowSelect(row.propertyId || row.id, e.target.checked)}
                        className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                    />
                ),
            },
            {
                key: 'propertyId',
                header: 'Property ID',
                render: (value, row) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal'>
                        {value || row.id || row.objectID}
                    </span>
                ),
            },
            {
                key: 'propertyName',
                header: 'Property Name',
                render: (value, row) => (
                    <span
                        className='whitespace-nowrap text-sm font-semibold w-auto cursor-pointer hover:text-blue-600'
                        onClick={() => {
                            navigate(`/acn/properties/${row.propertyId || row.id}/details`)
                        }}
                    >
                        {value || row.area || 'Unknown Property'}
                    </span>
                ),
            },
            {
                key: 'assetType',
                header: 'Asset Type',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto capitalize'>
                        {value}
                    </span>
                ),
            },
        ]

        // Add price column
        baseColumns.push({
            key: activeTab === 'Resale' ? 'totalAskPrice' : 'rentPerMonthInLakhs',
            header: activeTab === 'Resale' ? 'Sale Price' : 'Monthly Rent',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>
                    {value ? formatCost(value) : 'N/A'}
                </span>
            ),
        })

        const remainingColumns: TableColumn[] = [
            {
                key: activeTab === 'Resale' ? 'sbua' : 'SBUA',
                header: 'SBUA',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>
                        {value ? `${value} sq ft` : 'N/A'}
                    </span>
                ),
            },
            {
                key: 'plotSize',
                header: 'Plot Size',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>
                        {value && value !== '–' ? `${value}` : 'N/A'}
                    </span>
                ),
            },
            {
                key: 'facing',
                header: 'Facing',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>{value || 'N/A'}</span>
                ),
            },
            {
                key: 'micromarket',
                header: 'Micromarket',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>{value || 'N/A'}</span>
                ),
            },

            {
                key: 'status',
                header: 'Status',
                dropdown: {
                    options: statusDropdownOptions,
                    placeholder: 'Select Status',
                    onChange: (value, row) => {
                        handleUpdatePropertyStatus(row.propertyId, value)
                    },
                },
            },
            {
                key: 'dateOfStatusLastChecked',
                header: 'Last Check',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>{formatUnixDate(value)}</span>
                ),
            },
            {
                key: 'cpCode',
                header: 'Agent',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>{value || 'N/A'}</span>
                ),
            },
            {
                key: 'photo',
                header: 'Img/Vid',
                render: (value, _) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>
                        {value && value.length > 0 ? (
                            <img src={checkicon} alt='Check Icon' className='w-8 h-8 flex-shrink-0' />
                        ) : (
                            <img src={crossicon} alt='Cross Icon' className='w-8 h-8 flex-shrink-0' />
                        )}
                    </span>
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
                                setSelectedProperty(row)
                                setIsShareModalOpen(true)
                            }}
                            title='Share'
                        >
                            <img src={shareic} alt='Share Icon' className='w-7 h-7 flex-shrink-0' />
                        </button>
                        <button
                            className='h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0'
                            onClick={() => {
                                navigate(`/acn/properties/${row.propertyId || row.id}/edit`)
                            }}
                            title='Edit'
                        >
                            <img src={editicon} alt='Edit Icon' className='w-7 h-7 flex-shrink-0' />
                        </button>
                    </div>
                ),
            },
        ]

        return [...baseColumns, ...remainingColumns]
    }

    // Memoized metrics calculation to prevent unnecessary recalculations
    const metrics = useMemo(() => {
        if (!properties) return []

        const totalProperties = nbHits
        const statusFacets = searchResultFacets.status || []
        const statusCounts = statusFacets.reduce(
            (acc, facet) => {
                acc[facet.value] = facet.count
                return acc
            },
            {} as Record<string, number>,
        )

        if (activeTab === 'Resale') {
            return [
                { label: 'Total Listings', value: totalProperties },
                { label: 'Available', value: statusCounts['Available'] || 0 },
                { label: 'Sold', value: statusCounts['Sold'] || 0 },
                { label: 'Hold', value: statusCounts['Hold'] || 0 },
                { label: 'De-listed', value: statusCounts['De-listed'] || 0 },
            ]
        } else {
            return [
                { label: 'Total Listings', value: totalProperties },
                { label: 'Available', value: statusCounts['Available'] || 0 },
                { label: 'Rented', value: statusCounts['Rented'] || 0 },
                { label: 'Hold', value: statusCounts['Hold'] || 0 },
                { label: 'De-listed', value: statusCounts['De-listed'] || 0 },
            ]
        }
    }, [properties, searchResultFacets, activeTab, nbHits])

    // Handle filter changes from the modal
    const handleFiltersChange = useCallback(
        (newFilters: SearchFilters) => {
            setIsModalUpdatingFilters(true)
            setFilters(newFilters)

            // Update URL parameters for the new filters
            const newParams = new URLSearchParams(searchParams)

            // Update all filters including basic ones
            if (newFilters.status && newFilters.status.length > 0) {
                newParams.set('status', newFilters.status.join(','))
            } else {
                newParams.delete('status')
            }

            if (newFilters.assetType && newFilters.assetType.length > 0) {
                newParams.set('assetType', newFilters.assetType.join(','))
            } else {
                newParams.delete('assetType')
            }

            if (newFilters.micromarket && newFilters.micromarket.length > 0) {
                newParams.set('micromarket', newFilters.micromarket.join(','))
            } else {
                newParams.delete('micromarket')
            }

            if (newFilters.kamName && newFilters.kamName.length > 0) {
                newParams.set('kamName', newFilters.kamName.join(','))
            } else {
                newParams.delete('kamName')
            }

            // Handle range filters
            if (newFilters.totalAskPrice) {
                if (newFilters.totalAskPrice.min !== undefined) {
                    newParams.set('totalAskPriceMin', newFilters.totalAskPrice.min.toString())
                } else {
                    newParams.delete('totalAskPriceMin')
                }
                if (newFilters.totalAskPrice.max !== undefined) {
                    newParams.set('totalAskPriceMax', newFilters.totalAskPrice.max.toString())
                } else {
                    newParams.delete('totalAskPriceMax')
                }
            } else {
                newParams.delete('totalAskPriceMin')
                newParams.delete('totalAskPriceMax')
            }

            if (newFilters.askPricePerSqft) {
                if (newFilters.askPricePerSqft.min !== undefined) {
                    newParams.set('askPricePerSqftMin', newFilters.askPricePerSqft.min.toString())
                } else {
                    newParams.delete('askPricePerSqftMin')
                }
                if (newFilters.askPricePerSqft.max !== undefined) {
                    newParams.set('askPricePerSqftMax', newFilters.askPricePerSqft.max.toString())
                } else {
                    newParams.delete('askPricePerSqftMax')
                }
            } else {
                newParams.delete('askPricePerSqftMin')
                newParams.delete('askPricePerSqftMax')
            }

            if (newFilters.sbua) {
                if (newFilters.sbua.min !== undefined) {
                    newParams.set('sbuaMin', newFilters.sbua.min.toString())
                } else {
                    newParams.delete('sbuaMin')
                }
                if (newFilters.sbua.max !== undefined) {
                    newParams.set('sbuaMax', newFilters.sbua.max.toString())
                } else {
                    newParams.delete('sbuaMax')
                }
            } else {
                newParams.delete('sbuaMin')
                newParams.delete('sbuaMax')
            }

            if (newFilters.carpet) {
                if (newFilters.carpet.min !== undefined) {
                    newParams.set('carpetMin', newFilters.carpet.min.toString())
                } else {
                    newParams.delete('carpetMin')
                }
                if (newFilters.carpet.max !== undefined) {
                    newParams.set('carpetMax', newFilters.carpet.max.toString())
                } else {
                    newParams.delete('carpetMax')
                }
            } else {
                newParams.delete('carpetMin')
                newParams.delete('carpetMax')
            }

            // Handle array filters
            if (newFilters.unitType && newFilters.unitType.length > 0) {
                newParams.set('unitType', newFilters.unitType.join(','))
            } else {
                newParams.delete('unitType')
            }

            if (newFilters.noOfBathrooms && newFilters.noOfBathrooms.length > 0) {
                newParams.set('noOfBathrooms', newFilters.noOfBathrooms.join(','))
            } else {
                newParams.delete('noOfBathrooms')
            }

            if (newFilters.noOfBalcony && newFilters.noOfBalcony.length > 0) {
                newParams.set('noOfBalcony', newFilters.noOfBalcony.join(','))
            } else {
                newParams.delete('noOfBalcony')
            }

            if (newFilters.facing && newFilters.facing.length > 0) {
                newParams.set('facing', newFilters.facing.join(','))
            } else {
                newParams.delete('facing')
            }

            if (newFilters.exactFloor && newFilters.exactFloor.length > 0) {
                newParams.set('exactFloor', newFilters.exactFloor.join(','))
            } else {
                newParams.delete('exactFloor')
            }

            if (newFilters.area && newFilters.area.length > 0) {
                newParams.set('area', newFilters.area.join(','))
            } else {
                newParams.delete('area')
            }

            if (newFilters.currentStatus && newFilters.currentStatus.length > 0) {
                newParams.set('currentStatus', newFilters.currentStatus.join(','))
            } else {
                newParams.delete('currentStatus')
            }

            // Handle single value filters
            if (newFilters.landmark) {
                newParams.set('landmark', newFilters.landmark)
            } else {
                newParams.delete('landmark')
            }

            if (newFilters.dateOfStatusLastCheckedFrom) {
                newParams.set('dateOfStatusLastCheckedFrom', newFilters.dateOfStatusLastCheckedFrom)
            } else {
                newParams.delete('dateOfStatusLastCheckedFrom')
            }

            if (newFilters.dateOfStatusLastCheckedTo) {
                newParams.set('dateOfStatusLastCheckedTo', newFilters.dateOfStatusLastCheckedTo)
            } else {
                newParams.delete('dateOfStatusLastCheckedTo')
            }

            // Reset page when filters change
            newParams.set('page', '1')

            setSearchParams(newParams)

            // Reset the flag after a short delay to allow URL update to complete
            setTimeout(() => {
                setIsModalUpdatingFilters(false)
            }, 100)
        },
        [searchParams, setSearchParams],
    )

    // Handle row selection
    const handleRowSelect = (rowId: string, checked: boolean) => {
        setSelectedRows((prev) => {
            const newSet = new Set(prev)
            if (checked) {
                newSet.add(rowId)
            } else {
                newSet.delete(rowId)
            }
            return newSet
        })
    }

    // Handle bulk status update
    const handleBulkStatusUpdate = (status: PropertyStatus, soldPrice?: string) => {
        const selectedRowIds = Array.from(selectedRows)
        // Convert old status name to new if needed
        const updatedStatus = status === 'De-listed' ? 'De-listed' : status
        console.log('📝 Bulk updating status for:', selectedRowIds, 'to:', updatedStatus, ' ', soldPrice)

        // TODO: Implement actual bulk update API call
        setSelectedRows(new Set())
    }

    // Handle property status update
    const handleUpdatePropertyStatus = useCallback(
        async (propertyId: string, newStatus: string) => {
            console.log('😒 Updating property status:', propertyId, newStatus)
            dispatch(updatePropetiesLocal({ propertyId, updates: { status: newStatus } }))
            // Optimistically update Redux
            dispatch(updatePropertyStatusOptimistic({ propertyId, status: newStatus }))

            try {
                await dispatch(updatePropertyStatus({ propertyId, status: newStatus })).unwrap()
            } catch (error) {
                // Optionally: revert or re-fetch
                performSearch(urlParams.query, filters, 0, urlParams.sort)
            }
        },
        [dispatch, urlParams.query, filters, performSearch],
    )

    // Render from Redux
    const getCurrentData = (): IInventory[] => {
        return properties || []
    }

    const currentData = getCurrentData()
    // const totalItems = nbHits || 0
    const totalPages = nbPages || 0

    // Helper function to get facet count for a specific value
    const getFacetCount = (facetName: string, value: string): number => {
        const facetsToUse = properties ? searchResultFacets : originalFacets
        const facetValues = facetsToUse[facetName] || []
        const facetItem = facetValues.find((item) => item.value === value)
        return facetItem ? facetItem.count : 0
    }

    const handleBulkShare = () => {
        setIsBulkShareModalOpen(true)
    }

    return (
        <Layout>
            <PropertiesFiltersModal
                isOpen={isAddFilterModalOpen}
                onClose={() => setIsAddFilterModalOpen(false)}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                propertyType={activeTab}
            />
            <div className='w-full overflow-hidden font-sans h-screen flex flex-col'>
                <div
                    className='flex flex-col gap-4 pt-2 bg-white flex-1 overflow-hidden'
                    style={{ width: 'calc(100vw)', maxWidth: '100%' }}
                >
                    {/* Header */}
                    <div className='flex-shrink-0'>
                        <div className='flex items-center justify-between mb-2 px-6'>
                            <h1 className='text-lg font-semibold text-black'>Properties ({nbHits || 0})</h1>
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
                                        placeholder='Search properties...'
                                        value={urlParams.query}
                                        onChange={handleSearchValueChange}
                                        className='h-8'
                                    />
                                </div>
                                <Button
                                    leftIcon={<img src={addinventoryic} alt='Add Inventory Icon' className='w-5 h-5' />}
                                    bgColor='bg-[#2D3748]'
                                    textColor='text-white'
                                    className='px-4 h-8 font-semibold'
                                    onClick={() => navigate('/acn/properties/addinv')}
                                >
                                    Add Inventory
                                </Button>
                            </div>
                        </div>
                        <hr className='border-gray-200 mb-4' />

                        {/* Metrics Cards */}
                        <MetricsCards metrics={metrics} className='mb-2 px-6' />

                        {/* Filters */}
                        <div className='flex items-center gap-2 mb-2 px-6'>
                            <button
                                className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md hover:bg-gray-200'
                                onClick={clearAllFilters}
                                title='Reset Filters'
                            >
                                <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                            </button>

                            <div className='flex items-center bg-gray-600 rounded-md p-1'>
                                <button
                                    onClick={() => setActiveTab('Resale')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'Resale'
                                            ? 'bg-white text-black shadow-sm font-bold'
                                            : 'text-white hover:text-black'
                                    }`}
                                >
                                    Resale
                                </button>
                                <button
                                    onClick={() => setActiveTab('Rental')}
                                    className={`px-3 py-1 text-sm rounded transition-colors ${
                                        activeTab === 'Rental'
                                            ? 'bg-white text-black shadow-sm font-bold'
                                            : 'text-white hover:text-black'
                                    }`}
                                >
                                    Rental
                                </button>
                            </div>

                            <StatusFilter />
                            <MicromarketFilter />
                            <AssetTypeFilter />
                            <KAMFilter />
                            <SortFilter />

                            <Button
                                bgColor='bg-[#F0F0F5]'
                                textColor='text-black'
                                leftIcon={<img src={filter} alt='Filter Icon' className='w-5 h-5' />}
                                className='h-7 font-semibold text-sm'
                                // onClick={() => console.log('Filter clicked')}
                                onClick={() => {
                                    setIsAddFilterModalOpen(true)
                                }}
                            >
                                Filter
                            </Button>

                            {selectedRows.size > 0 && (
                                <div className='flex gap-2 ml-auto'>
                                    <Button
                                        bgColor='bg-white'
                                        textColor='text-gray-700'
                                        className='px-4 h-8 text-sm border border-gray-300'
                                        onClick={() => setIsUpdateModalOpen(true)}
                                    >
                                        Update Status ({selectedRows.size})
                                    </Button>
                                    <Button
                                        bgColor='bg-gray-600'
                                        textColor='text-white'
                                        className='px-4 h-8 text-sm'
                                        onClick={handleBulkShare}
                                    >
                                        Share Selected ({selectedRows.size})
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Show search info */}
                        {searchLoading && <div className='mb-2 text-sm text-blue-600 flex-shrink-0'>Searching...</div>}

                        {/* {!searchLoading && totalItems > 0 && (
                            <div className='mb-2 text-sm text-gray-600'>
                                Found {totalItems.toLocaleString()} properties
                                {searchQuery && ` for "${searchQuery}"`}
                            </div>
                        )} */}

                        {searchError && (
                            <div className='mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0'>
                                <div className='text-sm text-red-700'>Error: {searchError}</div>
                                <button
                                    onClick={() => performSearch(urlParams.query, filters, 0, urlParams.sort)}
                                    className='mt-2 text-sm text-red-600 hover:text-red-800 font-medium'
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Table Container - This will take remaining space */}
                    <div className='flex-1 flex flex-col gap-[29px] overflow-hidden'>
                        {/* Table with horizontal scrolling and fixed actions column */}
                        <div className='bg-white rounded-lg overflow-hidden flex-1 pl-6'>
                            <div className='h-full overflow-hidden'>
                                {searchLoading ? (
                                    <div className='flex items-center justify-center h-64'>
                                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                                        <span className='ml-3 text-gray-600'>Loading properties...</span>
                                    </div>
                                ) : searchError ? (
                                    <div className='flex items-center justify-center h-64'>
                                        <div className='text-center'>
                                            <div className='text-red-600 mb-4'>Error: {searchError}</div>
                                            <Button
                                                bgColor='bg-blue-600'
                                                textColor='text-white'
                                                onClick={() =>
                                                    performSearch(urlParams.query, filters, 0, urlParams.sort)
                                                }
                                            >
                                                Retry
                                            </Button>
                                        </div>
                                    </div>
                                ) : properties?.length ? (
                                    <FlexibleTable
                                        data={properties}
                                        columns={getColumns()}
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
                                ) : (
                                    <div className='flex items-center justify-center h-64'>
                                        <div className='text-center'>
                                            <div className='text-gray-500 text-lg font-medium'>No properties found</div>
                                            <div className='text-gray-400 text-sm mt-1'>
                                                Try adjusting your search or filters
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pagination */}
                        {/* {!searchLoading && totalPages > 1 && ( */}
                        <div className='flex items-center justify-center flex-shrink-0'>
                            <CustomPagination
                                currentPage={urlParams.page}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                className=''
                            />
                        </div>
                        {/* )} */}
                    </div>

                    {/* Share Modal */}
                    <ShareInventoryModal
                        isOpen={isShareModalOpen}
                        onClose={() => setIsShareModalOpen(false)}
                        property={selectedProperty}
                    />

                    {/* Update Inventory Status Modal */}
                    <UpdateInventoryStatusModal
                        isOpen={isUpdateModalOpen}
                        onClose={() => setIsUpdateModalOpen(false)}
                        propertyType={activeTab}
                        selectedCount={selectedRows.size}
                        onUpdate={handleBulkStatusUpdate}
                    />

                    <BulkShareModal
                        isOpen={isBulkShareModalOpen}
                        onClose={() => setIsBulkShareModalOpen(false)}
                        properties={currentData.filter((item: any) => selectedRows.has(item.propertyId || item.id))}
                    />
                </div>
            </div>
        </Layout>
    )
}

export default PropertiesPage
