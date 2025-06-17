// PropertiesPage.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import ShareInventoryModal from '../../../components/acn/ShareInventoryModal'
import UpdateInventoryStatusModal from '../../../components/acn/UpdateInventoryModal'
import MetricsCards from '../../../components/design-elements/MetricCards'
import resetic from '/icons/acn/rotate-left.svg'
import addinventoryic from '/icons/acn/user-add.svg'
import shareic from '/icons/acn/share.svg'
import editicon from '/icons/acn/write.svg'
import type { IInventory } from '../../../store/reducers/acn/propertiesTypes'
import { AddFilterModal } from '../../../components/acn/Filters'

// Import our Algolia service
import algoliaService, {
    type SearchFilters,
    type AlgoliaSearchResponse,
    type FacetValue,
} from '../../../services/acn/properties/algoliaPropertiesService'
import { formatCost } from '../../../components/helper/formatCost'

type PropertyType = 'Resale' | 'Rental'
type PropertyStatus = 'Available' | 'Sold' | 'Hold' | 'Delisted' | 'Pending QC' | 'Rented'

const getMetrics = (activeTab: PropertyType, searchResultFacets: Record<string, FacetValue[]>) => {
    const statusFacets = searchResultFacets.status || []
    const statusCounts = statusFacets.reduce(
        (acc, facet) => {
            acc[facet.value] = facet.count
            return acc
        },
        {} as Record<string, number>,
    )

    const totalListings = statusFacets.reduce((sum, facet) => sum + facet.count, 0)

    if (activeTab === 'Resale') {
        return [
            { label: 'Total Listings', value: totalListings },
            { label: 'Available', value: statusCounts['Available'] || 0 },
            { label: 'Sold', value: statusCounts['Sold'] || 0 },
            { label: 'Hold', value: statusCounts['Hold'] || 0 },
            { label: 'Delisted', value: statusCounts['Delisted'] || 0 },
            { label: 'Pending QC', value: statusCounts['Pending QC'] || 0 },
        ]
    } else {
        return [
            { label: 'Total Listings', value: totalListings },
            { label: 'Available', value: statusCounts['Available'] || 0 },
            { label: 'Rented', value: statusCounts['Rented'] || 0 },
            { label: 'Hold', value: statusCounts['Hold'] || 0 },
            { label: 'Delisted', value: statusCounts['Delisted'] || 0 },
            { label: 'Pending QC', value: statusCounts['Pending QC'] || 0 },
        ]
    }
}

const PropertiesPage = () => {
    const navigate = useNavigate()

    // Algolia search state
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<AlgoliaSearchResponse | null>(null)
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)

    // Filter state
    const [filters, setFilters] = useState<SearchFilters>({})
    const [originalFacets, setOriginalFacets] = useState<Record<string, FacetValue[]>>({})
    const [searchResultFacets, setSearchResultFacets] = useState<Record<string, FacetValue[]>>({})
    const [sortBy, setSortBy] = useState<string>('')
    const [isAddFilterModalOpen, setIsAddFilterModalOpen] = useState(false)

    // UI state
    const [activeTab, setActiveTab] = useState<PropertyType>('Resale')
    const [currentPage, setCurrentPage] = useState(0)
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState<IInventory | null>(null)

    // Constants
    const ITEMS_PER_PAGE = 20

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
        // Perform initial search to load data
        performSearch('', {}, 0, '')
    }, [])

    // Perform Algolia search
    const performSearch = useCallback(
        async (query: string, searchFilters: SearchFilters, page: number, sort: string) => {
            setSearchLoading(true)
            setSearchError(null)

            try {
                // Add tab-based filter
                const tabFilters = { ...searchFilters }
                if (activeTab === 'Resale') {
                    tabFilters.assetType = [...(tabFilters.assetType || []), 'apartment', 'villa', 'plot', 'commercial']
                } else {
                    tabFilters.assetType = [...(tabFilters.assetType || []), 'apartment', 'villa', 'commercial']
                }

                const response = await algoliaService.searchProperties({
                    query: query.trim(),
                    filters: tabFilters,
                    page,
                    hitsPerPage: ITEMS_PER_PAGE,
                    sortBy: sort || undefined,
                })
                console.log('😂😂😂', response, 'kudi')

                setSearchResults(response)

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
                    filters: tabFilters,
                    resultsCount: response.nbHits,
                    page,
                })
            } catch (error) {
                console.error('Search failed:', error)
                setSearchError(error instanceof Error ? error.message : 'Search failed')
                setSearchResults(null)
                setSearchResultFacets({})
            } finally {
                setSearchLoading(false)
            }
        },
        [activeTab],
    )

    // Trigger search when query, filters, or sort changes
    useEffect(() => {
        setCurrentPage(0)
        performSearch(searchQuery, filters, 0, sortBy)
    }, [searchQuery, filters, sortBy, performSearch])

    // Search when tab changes
    useEffect(() => {
        console.log('📋 Tab changed to:', activeTab)
        setSelectedRows(new Set())
        performSearch(searchQuery, filters, 0, sortBy)
    }, [activeTab, searchQuery, filters, sortBy, performSearch])

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
    }

    // Get current data to display
    const getCurrentData = (): IInventory[] => {
        return searchResults?.hits || []
    }

    const currentData = getCurrentData()
    const totalItems = searchResults?.nbHits || 0
    const totalPages = searchResults?.nbPages || 0

    // Helper function to get facet count for a specific value
    const getFacetCount = (facetName: string, value: string): number => {
        const facetsToUse = searchResults ? searchResultFacets : originalFacets
        const facetValues = facetsToUse[facetName] || []
        const facetItem = facetValues.find((item) => item.value === value)
        return facetItem ? facetItem.count : 0
    }

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
        console.log('📝 Bulk updating status for:', selectedRowIds, 'to:', status, ' ', soldPrice)

        // TODO: Implement actual bulk update API call
        setSelectedRows(new Set())
    }

    // Filter Dropdown Components
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

    const MicromarketFilter = () => {
        const micromarketFacets = originalFacets.micromarket || []
        const selectedMicromarkets = filters.micromarket || []
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
                                updateFilter('micromarket', null)
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
                                        updateFilter('micromarket', facet.value)
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
        {
            label: activeTab === 'Resale' ? 'Sold' : 'Rented',
            value: activeTab === 'Resale' ? 'Sold' : 'Rented',
            color: '#F5F5F5',
            textColor: '#374151',
        },
        { label: 'Hold', value: 'Hold', color: '#FFF4E6', textColor: '#92400E' },
        { label: 'Delisted', value: 'Delisted', color: '#FFC8B8', textColor: '#991B1B' },
    ]

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
                key: 'nameOfTheProperty',
                header: 'Property Name',
                render: (value, row) => (
                    <span
                        className='whitespace-nowrap text-sm font-semibold w-auto cursor-pointer hover:text-blue-600'
                        onClick={() => navigate(`/acn/properties/${row.propertyId || row.id}/details`)}
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
            key: 'totalAskPrice',
            header: activeTab === 'Resale' ? 'Sale Price' : 'Monthly Rent',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>
                    {value ? formatCost(value) : 'N/A'}
                </span>
            ),
        })

        const remainingColumns: TableColumn[] = [
            {
                key: 'sbua',
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
                        {value ? `${value} sq ft` : 'N/A'}
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
                render: (value) => {
                    const statusOption = statusDropdownOptions.find((opt) => opt.value === value)
                    return (
                        <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap`}
                            style={{
                                backgroundColor: statusOption?.color || '#F3F4F6',
                                color: statusOption?.textColor || '#374151',
                            }}
                        >
                            {value || 'Unknown'}
                        </span>
                    )
                },
            },
            {
                key: 'dateOfStatusLastChecked',
                header: 'Last Check',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>{formatDate(value)}</span>
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
                render: (value, row) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>
                        {(value && value.length > 0) || (row.video && row.video.length > 0) ? '✓' : '✗'}
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
            <AddFilterModal isOpen={isAddFilterModalOpen} onClose={() => setIsAddFilterModalOpen(false)} />
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-2 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-4'>
                        <div className='flex items-center justify-between mb-2'>
                            <h1 className='text-lg font-semibold text-black'>Properties</h1>
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
                        <MetricsCards metrics={getMetrics(activeTab, searchResultFacets)} className='mb-2' />

                        {/* Filters */}
                        <div className='flex items-center gap-2 mb-2'>
                            <button
                                className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md hover:bg-gray-200'
                                onClick={clearAllFilters}
                                title='Reset Filters'
                            >
                                <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                            </button>

                            <div className='flex items-center bg-gray-100 rounded-md p-1 h-8'>
                                <button
                                    onClick={() => setActiveTab('Resale')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'Resale'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Resale
                                </button>
                                <button
                                    onClick={() => setActiveTab('Rental')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'Rental'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
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
                                leftIcon={
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='16'
                                        height='16'
                                        viewBox='0 0 16 16'
                                        fill='none'
                                    >
                                        <path d='M2 4.66797H14' stroke='#3A3A47' stroke-linecap='round' />
                                        <path d='M4 8H12' stroke='#3A3A47' stroke-linecap='round' />
                                        <path d='M6.66602 11.332H9.33268' stroke='#3A3A47' stroke-linecap='round' />
                                    </svg>
                                }
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
                                        onClick={() => console.log('Share selected:', selectedRows)}
                                    >
                                        Share Selected ({selectedRows.size})
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Show search info */}
                        {searchLoading && <div className='mb-2 text-sm text-blue-600'>Searching...</div>}

                        {/* {!searchLoading && totalItems > 0 && (
                            <div className='mb-2 text-sm text-gray-600'>
                                Found {totalItems.toLocaleString()} properties
                                {searchQuery && ` for "${searchQuery}"`}
                            </div>
                        )} */}

                        {searchError && (
                            <div className='mb-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
                                <div className='text-sm text-red-700'>Error: {searchError}</div>
                                <button
                                    onClick={() => performSearch(searchQuery, filters, 0, sortBy)}
                                    className='mt-2 text-sm text-red-600 hover:text-red-800 font-medium'
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Table with horizontal scrolling and fixed actions column */}
                    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                        <div className='h-[65vh] overflow-y-auto'>
                            {searchLoading ? (
                                <div className='flex items-center justify-center h-64'>
                                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                                    <span className='ml-3 text-gray-600'>Loading properties...</span>
                                </div>
                            ) : currentData.length > 0 ? (
                                <FlexibleTable
                                    data={currentData}
                                    columns={getColumns()}
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

                        {/* Pagination */}
                        {!searchLoading && totalPages > 1 && (
                            <div className='flex items-center justify-between py-4 px-6 border-t border-gray-200'>
                                <div className='text-sm text-gray-500 font-medium'>
                                    Showing {currentPage * ITEMS_PER_PAGE + 1} to{' '}
                                    {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalItems)} of{' '}
                                    {totalItems.toLocaleString()} properties
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
                                        let pageNum: number
                                        if (totalPages <= 7) {
                                            pageNum = i
                                        } else if (currentPage < 3) {
                                            pageNum = i
                                        } else if (currentPage > totalPages - 4) {
                                            pageNum = totalPages - 7 + i
                                        } else {
                                            pageNum = currentPage - 3 + i
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-semibold transition-colors ${
                                                    currentPage === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                {pageNum + 1}
                                            </button>
                                        )
                                    })}

                                    <button
                                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages - 1))}
                                        disabled={currentPage >= totalPages - 1}
                                        className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                                            currentPage >= totalPages - 1
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
                        )}
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
                </div>
            </div>
        </Layout>
    )
}

export default PropertiesPage
