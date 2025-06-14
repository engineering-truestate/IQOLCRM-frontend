'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'

import { generateRequirements, type RequirementData } from '../../dummy_data/acn_requirements_dummy_data'
import resetic from '/icons/acn/rotate-left.svg'
import type { AppDispatch, RootState } from '../../../store/index'
import type { IInventory } from '../../../store/reducers/acn/propertiesTypes'
import { addPropertiesToRequirement } from '../../../services/acn/requirements/requirementsService'

// Import our Algolia service
import algoliaService, {
    type SearchFilters,
    type AlgoliaSearchResponse,
    type FacetValue,
} from '../../../services/acn/properties/algoliaPropertiesService'

const PropertiesSelectionPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    // Redux state (for fallback data)
    const { isLoadingMore } = useSelector((state: RootState) => state.properties)
    const dispatch = useDispatch<AppDispatch>()

    const { addingProperties, error } = useSelector((state: RootState) => state.requirements)

    // Algolia search state
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<AlgoliaSearchResponse | null>(null)
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [useAlgoliaData] = useState(false)

    // Filter state
    const [filters, setFilters] = useState<SearchFilters>({})
    // Separate original facets (all available options) from search result facets
    const [originalFacets, setOriginalFacets] = useState<Record<string, FacetValue[]>>({})
    const [searchResultFacets, setSearchResultFacets] = useState<Record<string, FacetValue[]>>({})
    const [sortBy, setSortBy] = useState<string>('')

    // UI state
    const [activeTab, setActiveTab] = useState('resale')
    const [currentPage, setCurrentPage] = useState(0) // Algolia uses 0-based indexing
    const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())
    const [_, setRequirement] = useState<RequirementData | null>(null)

    // Constants
    const ITEMS_PER_PAGE = 50

    // Initialize facets on component mount
    useEffect(() => {
        const initializeFacets = async () => {
            try {
                const facets = await algoliaService.getAllFacets()
                setOriginalFacets(facets)
            } catch (error) {
                console.error('Failed to load facets:', error)
            }
        }

        initializeFacets()
    }, [])

    // Load initial data
    useEffect(() => {
        // Load requirement data
        if (id) {
            const allRequirements = generateRequirements()
            const foundRequirement = allRequirements.find((req) => req.reqId === id)
            if (foundRequirement) {
                setRequirement(foundRequirement)
                setSelectedProperties(new Set(foundRequirement.matchedPropertyIds))
            }
        }

        // Perform initial search to load data
        performSearch('', {}, 0, '')
    }, [id])

    // Perform Algolia search
    const performSearch = useCallback(
        async (query: string, searchFilters: SearchFilters, page: number, sort: string) => {
            setSearchLoading(true)
            setSearchError(null)

            try {
                const response = await algoliaService.searchProperties({
                    query: query.trim(),
                    filters: searchFilters,
                    page,
                    hitsPerPage: ITEMS_PER_PAGE,
                    sortBy: sort || undefined,
                })

                setSearchResults(response)

                // Update search result facets (for counts) but keep original facets for filter options
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
                setSearchError(error instanceof Error ? error.message : 'Search failed')
                // On error, clear results instead of falling back to Redux
                setSearchResults(null)
                setSearchResultFacets({})
            } finally {
                setSearchLoading(false)
            }
        },
        [],
    )

    // Trigger search when query, filters, or sort changes
    useEffect(() => {
        // Always perform search (even with empty query/filters to get all data)
        setCurrentPage(0)
        performSearch(searchQuery, filters, 0, sortBy)
    }, [searchQuery, filters, sortBy, performSearch])

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
        performSearch(searchQuery, filters, newPage, sortBy)
    }

    // Update filter utility function
    const updateFilter = (filterType: keyof SearchFilters, value: string | null) => {
        setFilters((prev) => {
            const newFilters = { ...prev }

            if (value === null || value === '') {
                delete newFilters[filterType]
            } else {
                if (filterType === 'priceRange') {
                    return prev // Handle price range separately if needed
                } else {
                    // For array filters (status, kam, assetType, micromarket) - Multiselect
                    const currentValues = (newFilters[filterType] as string[]) || []
                    if (currentValues.includes(value)) {
                        // Remove value
                        newFilters[filterType] = currentValues.filter((v) => v !== value) as any
                        if ((newFilters[filterType] as string[]).length === 0) {
                            delete newFilters[filterType]
                        }
                    } else {
                        // Add value (multiselect - add to existing array)
                        newFilters[filterType] = [...currentValues, value] as any
                    }
                }
            }

            return newFilters
        })
    }

    // Clear all filters
    const clearAllFilters = () => {
        setFilters({})
        setSortBy('')
        setSearchQuery('')
        setCurrentPage(0)
        // Will trigger useEffect to perform search with empty filters
    }

    // Get current data to display (always from Algolia)
    const getCurrentData = (): IInventory[] => {
        return searchResults?.hits || []
    }

    const currentData = getCurrentData()
    const totalItems = searchResults?.nbHits || 0
    const totalPages = searchResults?.nbPages || 0

    // Helper function to get facet count for a specific value
    const getFacetCount = (facetName: string, value: string): number => {
        // Use search result facets if available, otherwise use original facet counts
        const facetsToUse = searchResults ? searchResultFacets : originalFacets
        const facetValues = facetsToUse[facetName] || []
        const facetItem = facetValues.find((item) => item.value === value)
        return facetItem ? facetItem.count : 0
    }

    // Filter Dropdown Components (Updated to use original facets for options and multiselect)
    const StatusFilter = () => {
        const statusFacets = originalFacets.status || []
        const selectedStatuses = filters.status || []
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
                                updateFilter('status', null)
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
                                        updateFilter('status', facet.value)
                                    }}
                                >
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <input
                                                type='checkbox'
                                                checked={isSelected}
                                                onChange={() => {}} // Handled by parent click
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
                                            ({searchResults ? currentCount : facet.count})
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
        const kamFacets = originalFacets.kam || []
        const selectedKAMs = filters.kam || []
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
            if (selectedKAMs.length === 0) return 'KAM'
            if (selectedKAMs.length === 1) return selectedKAMs[0]
            return `KAM (${selectedKAMs.length})`
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
                                updateFilter('kam', null)
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
                            const currentCount = getFacetCount('kam', facet.value)
                            const isSelected = selectedKAMs.includes(facet.value)
                            return (
                                <div
                                    key={facet.value}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 last:rounded-b-md ${
                                        isSelected ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => {
                                        updateFilter('kam', facet.value)
                                    }}
                                >
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <input
                                                type='checkbox'
                                                checked={isSelected}
                                                onChange={() => {}} // Handled by parent click
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
                                            ({searchResults ? currentCount : facet.count})
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
        const selectedAssetTypes = filters.assetType || []
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
                                updateFilter('assetType', null)
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
                                        updateFilter('assetType', facet.value)
                                    }}
                                >
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <input
                                                type='checkbox'
                                                checked={isSelected}
                                                onChange={() => {}} // Handled by parent click
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
                                            ({searchResults ? currentCount : facet.count})
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

        const currentSort = sortOptions.find((option) => option.value === sortBy)

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
                    <div className='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'>
                        {sortOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md ${
                                    option.value === sortBy ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                                onClick={() => {
                                    setSortBy(option.value)
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

    // Property selection handlers
    const togglePropertySelection = (propertyId: string) => {
        setSelectedProperties((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(propertyId)) {
                newSet.delete(propertyId)
            } else {
                newSet.add(propertyId)
            }
            return newSet
        })
    }

    const toggleSelectAll = () => {
        if (selectedProperties.size === currentData.length) {
            setSelectedProperties((prev) => {
                const newSet = new Set(prev)
                currentData.forEach((item) => newSet.delete(item.propertyId || item.id))
                return newSet
            })
        } else {
            setSelectedProperties((prev) => {
                const newSet = new Set(prev)
                currentData.forEach((item) => newSet.add(item.propertyId || item.id))
                return newSet
            })
        }
    }

    const saveSelectedProperties = async () => {
        if (!id) {
            console.error('❌ No requirement ID found in URL')
            return
        }

        const selectedPropertyIds = Array.from(selectedProperties)

        if (selectedPropertyIds.length === 0) {
            console.log('ℹ️ No properties selected')
            return
        }

        console.log('💾 Saving selected properties:', selectedPropertyIds)
        console.log('📋 For requirement ID:', id)

        try {
            // Dispatch the thunk to add properties to requirement
            await dispatch(
                addPropertiesToRequirement({
                    requirementId: id,
                    propertyIds: selectedPropertyIds,
                }),
            ).unwrap()

            console.log('✅ Properties successfully added to requirement')

            // Show success message (you can add a toast notification here)

            // Navigate back to requirement details page
            navigate(`/acn/requirements/${id}/details`)
        } catch (error) {
            console.error('❌ Failed to save selected properties:', error)
            // Show error message (you can add a toast notification here)
        }
    }

    const updateRowData = (propertyId: string, field: keyof IInventory, value: string) => {
        console.log('Update property:', propertyId, field, value)
    }

    // Utility functions
    const formatCurrency = (amount: number | undefined | null) => {
        if (!amount) return '₹0'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (date: any) => {
        if (!date) return '-'
        let dateObj: Date

        if (date?.toDate) {
            dateObj = date.toDate()
        } else if (typeof date === 'string') {
            dateObj = new Date(date)
        } else if (date instanceof Date) {
            dateObj = date
        } else {
            return '-'
        }

        return dateObj.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const statusDropdownOptions: DropdownOption[] = [
        { label: 'Available', value: 'Available', color: '#E1F6DF', textColor: '#065F46' },
        { label: 'Sold', value: 'Sold', color: '#F5F5F5', textColor: '#374151' },
        { label: 'Hold', value: 'Hold', color: '#FFF4E6', textColor: '#92400E' },
        { label: 'De-Listed', value: 'De-Listed', color: '#FFC8B8', textColor: '#991B1B' },
    ]

    // Table columns
    const columns: TableColumn[] = [
        {
            key: 'checkbox',
            header: '',
            render: (_, row) => (
                <input
                    type='checkbox'
                    checked={selectedProperties.has(row.propertyId || row.id || row.objectID)}
                    onChange={() => togglePropertySelection(row.propertyId || row.id || row.objectID)}
                    className='rounded'
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
            key: 'nameOfTheProperty',
            header: 'Property Name',
            render: (value) => (
                <div className='max-w-[180px] truncate text-sm font-semibold' title={value || ''}>
                    {value || '-'}
                </div>
            ),
        },
        {
            key: 'assetType',
            header: 'Asset Type',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value || '-'}</span>,
        },
        {
            key: 'totalAskPrice',
            header: 'Price',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{formatCurrency(value)}</span>,
        },
        {
            key: 'sbua',
            header: 'SBUA',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal'>{value ? `${value} sq ft` : '-'}</span>
            ),
        },
        {
            key: 'plotSize',
            header: 'Plot Size',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal'>{value ? `${value} sq ft` : '-'}</span>
            ),
        },
        {
            key: 'facing',
            header: 'Facing',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value || '-'}</span>,
        },
        {
            key: 'enquiries',
            header: 'Enquiries',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value || '0'}</span>,
        },
        {
            key: 'micromarket',
            header: 'Micromarket',
            render: (value) => (
                <div className='max-w-[120px] truncate text-sm font-normal' title={value || ''}>
                    {value || '-'}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            dropdown: {
                options: statusDropdownOptions,
                placeholder: 'Select Status',
                onChange: (value, row) => {
                    updateRowData(row.propertyId || row.id || row.objectID, 'status', value)
                },
            },
        },
        {
            key: 'lastCheck',
            header: 'Last check',
            render: (value, row) => (
                <span className='whitespace-nowrap text-sm font-normal'>
                    {formatDate(value || row.dateOfInventoryAdded)}
                </span>
            ),
        },
        {
            key: 'cpCode',
            header: 'Agent Name',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value || '-'}</span>,
        },
    ]

    // Loading and error states
    if (searchLoading && !searchResults) {
        return (
            <Layout loading={true}>
                <div className='flex items-center justify-center h-64'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                        <p className='text-gray-600'>Loading properties...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (searchError && !searchResults) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center h-64'>
                    <div className='text-center'>
                        <p className='text-red-600 mb-4'>Error loading properties: {searchError}</p>
                        <Button
                            bgColor='bg-blue-600'
                            textColor='text-white'
                            onClick={() => performSearch(searchQuery, filters, currentPage, sortBy)}
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-2 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Breadcrumb */}
                    <div className='mb-4'>
                        <div className='flex justify-between'>
                            <div className='text-sm text-gray-500 mb-4'>
                                <a href='/acn/requirements' className='hover:text-gray-700'>
                                    Requirements
                                </a>
                                <span className='mx-2'>/</span>
                                <a href={`/acn/requirements/${id}/details`} className='hover:text-gray-700'>
                                    {id}
                                </a>
                                <span className='mx-2'>/</span>
                                <span className='text-black font-medium'>Properties</span>
                            </div>

                            {/* Header */}
                            <div className='flex items-center justify-between mb-2'>
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
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className='h-8'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className='border-gray-200 mb-4' />

                        {/* Tab Switches and Filters */}
                        <div className='flex items-center gap-4 mb-2'>
                            {/* Tab Switches */}
                            <div className='flex items-center bg-gray-100 rounded-md p-1'>
                                <button
                                    onClick={() => setActiveTab('resale')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'resale'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Resale
                                </button>
                                <button
                                    onClick={() => setActiveTab('rental')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'rental'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Rental
                                </button>
                            </div>

                            {/* Filters */}
                            <div className='flex items-center gap-2'>
                                <button
                                    className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md hover:bg-gray-200'
                                    onClick={clearAllFilters}
                                    title='Reset Filters'
                                >
                                    <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                                </button>

                                <StatusFilter />
                                <KAMFilter />
                                <AssetTypeFilter />

                                <SortFilter />

                                <Button
                                    bgColor='bg-[#F3F3F3]'
                                    textColor='text-[#3A3A47]'
                                    className='px-3 h-8 font-medium text-sm'
                                    onClick={() => {}}
                                >
                                    🔍 Filter
                                </Button>
                            </div>
                        </div>

                        {/* Data Summary */}
                        <div className='flex items-center gap-4 text-sm text-gray-600 mb-2'>
                            <span>
                                Total: {totalItems} properties
                                {useAlgoliaData && <span className='text-blue-600 ml-2'>(Algolia results)</span>}
                                {searchError && (
                                    <span className='text-red-600 ml-2'>(Search failed, showing local data)</span>
                                )}
                            </span>
                            {searchLoading && <span className='text-blue-600'>Searching...</span>}
                            {isLoadingMore && !useAlgoliaData && <span className='text-blue-600'>Loading more...</span>}
                        </div>
                    </div>

                    {/* Save Button */}
                    {selectedProperties.size > 0 && (
                        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between'>
                            <div className='text-sm text-blue-700'>
                                {selectedProperties.size} propert{selectedProperties.size === 1 ? 'y' : 'ies'} selected
                            </div>
                            <Button
                                bgColor={addingProperties ? 'bg-blue-400' : 'bg-blue-600'}
                                textColor='text-white'
                                className='px-4 h-8 font-medium'
                                onClick={saveSelectedProperties}
                                disabled={addingProperties}
                            >
                                {addingProperties ? '⏳ Saving...' : '💾 Save Selected Properties'}
                            </Button>
                        </div>
                    )}

                    {/* Show error if API call fails */}
                    {error && (
                        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                            <div className='text-sm text-red-700'>Error: {error}</div>
                        </div>
                    )}

                    {/* Table */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                        {/* Select All Controls */}
                        <div className='px-6 py-3 border-b border-gray-200 bg-gray-50'>
                            <div className='flex items-center gap-3'>
                                <button
                                    onClick={toggleSelectAll}
                                    className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium'
                                >
                                    <input
                                        type='checkbox'
                                        checked={
                                            currentData.length > 0 &&
                                            currentData.every((item) =>
                                                selectedProperties.has(item.propertyId || item.id),
                                            )
                                        }
                                        onChange={toggleSelectAll}
                                        className='rounded'
                                    />
                                    {currentData.length > 0 &&
                                    currentData.every((item) => selectedProperties.has(item.propertyId || item.id))
                                        ? 'Deselect All'
                                        : 'Select All'}{' '}
                                    ({currentData.length} on this page)
                                </button>
                            </div>
                        </div>

                        <div className='h-[70vh] overflow-y-auto'>
                            <FlexibleTable
                                data={currentData}
                                columns={columns}
                                hoverable={true}
                                borders={{
                                    table: false,
                                    header: true,
                                    rows: true,
                                    cells: false,
                                    outer: false,
                                }}
                                maxHeight='70vh'
                                className='rounded-lg'
                                stickyHeader={true}
                            />
                        </div>

                        {/* Pagination */}
                        <div className='flex items-center justify-between py-4 px-6 border-t border-gray-200'>
                            <div className='text-sm text-gray-500 font-medium'>
                                Showing {currentPage * ITEMS_PER_PAGE + 1} to{' '}
                                {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalItems)} of {totalItems} properties
                            </div>

                            <div className='flex items-center gap-2'>
                                <button
                                    onClick={() => handlePageChange(Math.max(currentPage - 1, 0))}
                                    disabled={currentPage === 0}
                                    className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                                        currentPage === 0
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

                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let page
                                    if (totalPages <= 7) {
                                        page = i
                                    } else if (currentPage < 3) {
                                        page = i
                                    } else if (currentPage > totalPages - 4) {
                                        page = totalPages - 7 + i
                                    } else {
                                        page = currentPage - 3 + i
                                    }

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-semibold transition-colors ${
                                                currentPage === page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {page + 1}
                                        </button>
                                    )
                                })}

                                <button
                                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages - 1))}
                                    disabled={currentPage === totalPages - 1}
                                    className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                                        currentPage === totalPages - 1
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
                </div>
            </div>
        </Layout>
    )
}

export default PropertiesSelectionPage
