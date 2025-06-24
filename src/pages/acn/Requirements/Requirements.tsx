'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import AlgoliaFacetMultiSelect from '../../../components/design-elements/AlgoliaFacetMultiSelect'
import MetricCards from '../../../components/design-elements/MetricCards'
import CustomPagination from '../../../components/design-elements/CustomPagination'
import NotesModal from '../../../components/acn/NotesModal'
// import { generateRequirements, type RequirementData } from '../../dummy_data/acn_requirements_dummy_data'
import resetic from '/icons/acn/rotate-left.svg'
import leadaddic from '/icons/acn/user-add.svg'
import { AddRequirementModal } from '../../../components/acn/AddRequirementModal'

import algoliaRequirementsService, {
    type RequirementSearchFilters,
    type AlgoliaRequirementSearchResponse,
    type RequirementFacetValue,
} from '../../../services/acn/requirements/algoliaAcnReqService'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'
import { formatUnixDate } from '../../../components/helper/formatDate'
import { useDispatch } from 'react-redux'
import { updateRequirementStatus } from '../../../services/acn/requirements/requirementsService'
import type { AppDispatch } from '../../../store/index'
import type { IRequirement } from '../../../data_types/acn/types'

const RequirementsPage = () => {
    const [searchValue, setSearchValue] = useState('')
    const [activeTab, setActiveTab] = useState('resale')
    const [currentPage, setCurrentPage] = useState(0)
    const [paginatedData, setPaginatedData] = useState<IRequirement[]>([])
    const [filteredData, setFilteredData] = useState<IRequirement[]>([])
    const [isAddRequirementModalOpen, setIsAddRequirementModalOpen] = useState(false)
    const navigate = useNavigate()

    // Items per page
    const ITEMS_PER_PAGE = 50

    const [searchResults, setSearchResults] = useState<AlgoliaRequirementSearchResponse | null>(null)
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [filters, setFilters] = useState<RequirementSearchFilters>({})

    // Facets for filtering
    const [facets, setFacets] = useState<Record<string, RequirementFacetValue[]>>({})
    const [originalFacets, setOriginalFacets] = useState<Record<string, RequirementFacetValue[]>>({})

    const metrics = useMemo(() => {
        const totalReqs = searchResults?.nbHits || 0
        const reqStatusFacets = facets.requirementStatus || []
        const internalStatusFacets = facets.internalStatus || []

        const reqStatusCounts = reqStatusFacets.reduce(
            (acc, facet) => {
                acc[facet.value.toLowerCase()] = facet.count
                return acc
            },
            {} as Record<string, number>,
        )

        const internalStatusCounts = internalStatusFacets.reduce(
            (acc, facet) => {
                acc[facet.value.toLowerCase()] = facet.count
                return acc
            },
            {} as Record<string, number>,
        )

        return [
            { label: 'Total Req', value: totalReqs },
            { label: 'Open', value: reqStatusCounts['open'] || 0 },
            { label: 'Close', value: reqStatusCounts['close'] || 0 },
            { label: 'Pending', value: internalStatusCounts['pending'] || 0 },
        ]
    }, [searchResults, facets])

    // Use imported data generation function
    const [requirementsData, setRequirementsData] = useState<IRequirement[]>([])

    const dispatch = useDispatch<AppDispatch>()

    // Fetch facets from Algolia when component mounts and when tab changes
    useEffect(() => {
        const fetchFacets = async () => {
            try {
                const allFacets = await algoliaRequirementsService.getAllFacets(
                    activeTab === 'rental' ? 'Rental' : 'Resale',
                )
                setOriginalFacets(allFacets) // Store original facets
                setFacets(allFacets) // Initialize with original facets
            } catch (error) {
                console.error('Failed to fetch facets:', error)
            }
        }

        fetchFacets()
    }, [activeTab])

    // Perform Algolia search
    const performSearch = useCallback(async () => {
        setSearchLoading(true)
        setSearchError(null)

        try {
            const response = await algoliaRequirementsService.searchRequirements({
                query: searchValue,
                filters: filters,
                page: currentPage,
                hitsPerPage: ITEMS_PER_PAGE,
                propertyType: activeTab === 'rental' ? 'Rental' : 'Resale',
            })

            setSearchResults(response)
            setFilteredData(response.hits)

            // Update facets for filtering options (filtered results)
            if (response.facets) {
                const updatedSearchFacets: Record<string, RequirementFacetValue[]> = {}
                Object.entries(response.facets).forEach(([facetName, facetValues]) => {
                    updatedSearchFacets[facetName] = Object.entries(facetValues)
                        .map(([value, count]) => ({
                            value,
                            count: count as number,
                        }))
                        .sort((a, b) => b.count - a.count)
                })
                setFacets(updatedSearchFacets)
            }
        } catch (error) {
            console.error('Search failed:', error)
            setSearchError(error instanceof Error ? error.message : 'Search failed')
        } finally {
            setSearchLoading(false)
        }
    }, [searchValue, filters, currentPage, activeTab, ITEMS_PER_PAGE])

    useEffect(() => {
        performSearch()
    }, [performSearch])

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
        performSearch()
    }

    // Handle tab change
    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setCurrentPage(0) // Reset to first page when changing tabs
        setFilters({}) // Reset filters when changing tabs
    }

    // Calculate total pages from Algolia response
    const totalPages = searchResults?.nbPages || 1
    const totalItems = searchResults?.nbHits || 0

    // Get current data to display
    const getCurrentData = (): IRequirement[] => {
        return searchResults?.hits || []
    }

    const currentData = getCurrentData()

    // Update filters when dropdown selections change
    const updateFilters = (filterType: keyof RequirementSearchFilters, values: string[]) => {
        setFilters((prev) => {
            const newFilters = { ...prev }

            if (values.length === 0) {
                delete newFilters[filterType]
            } else {
                newFilters[filterType] = values
            }

            return newFilters
        })
    }

    // Reset all filters
    const resetFilters = () => {
        setFilters({})
    }

    // Clear individual filter
    const clearFilter = (filterType: keyof RequirementSearchFilters) => {
        setFilters((prev) => {
            const newFilters = { ...prev }
            delete newFilters[filterType]
            return newFilters
        })
    }

    // Check if any filters are active
    const hasActiveFilters = () => {
        return (
            Object.keys(filters).length > 0 &&
            Object.values(filters).some((value) => (Array.isArray(value) ? value.length > 0 : value !== undefined))
        )
    }

    // Update paginated data when page changes or filtered data changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        setPaginatedData(filteredData.slice(startIndex, endIndex))
    }, [currentPage, filteredData])

    // Helper function to update a specific row's data
    const updateRowData = async (rowId: string, field: keyof IRequirement, value: string) => {
        try {
            // Update local state optimistically first for immediate user feedback
            setFilteredData((prevData) =>
                prevData.map((row) => (row.requirementId === rowId ? { ...row, [field]: value } : row)),
            )

            // Also update searchResults for consistency
            setSearchResults((prevResults) => {
                if (!prevResults) return prevResults
                return {
                    ...prevResults,
                    hits: prevResults.hits.map((row) =>
                        row.requirementId === rowId ? { ...row, [field]: value } : row,
                    ),
                }
            })

            // Update Firebase in the background
            const result = await dispatch(
                updateRequirementStatus({
                    id: rowId,
                    status: value,
                    type: field === 'requirementStatus' ? 'requirement' : 'internal',
                }),
            ).unwrap()

            console.log('✅ Status updated successfully:', result)
        } catch (error) {
            console.error('❌ Failed to update status:', error)
            // Revert local state on error
            setFilteredData((prevData) =>
                prevData.map((row) => (row.requirementId === rowId ? { ...row, [field]: row[field] } : row)),
            )

            // Also revert searchResults
            setSearchResults((prevResults) => {
                if (!prevResults) return prevResults
                return {
                    ...prevResults,
                    hits: prevResults.hits.map((row) =>
                        row.requirementId === rowId ? { ...row, [field]: row[field] } : row,
                    ),
                }
            })
        }
    }

    // Helper function to convert facets to dropdown options
    const getFacetOptions = (facetName: string) => {
        const facetOptions = (facets[facetName] || []).map(({ value, count }) => ({
            label: `${value} (${count})`,
            value,
        }))

        // Add "Clear All" option at the beginning
        return [{ label: 'Clear All', value: '' }, ...facetOptions]
    }

    // Helper function to get facet options for AlgoliaFacetMultiSelect
    const getAlgoliaFacetOptions = (facetName: string) => {
        const originalOptions = originalFacets[facetName] || []
        const filteredOptions = facets[facetName] || []

        // Create a map of filtered counts
        const filteredCounts = new Map(filteredOptions.map(({ value, count }) => [value, count]))

        // Merge original and filtered data
        return originalOptions.map(({ value, count: originalCount }) => ({
            value,
            count: filteredCounts.get(value) || 0, // Use filtered count if available, otherwise 0
            originalCount, // Keep original count for reference
            label: `${value} (${filteredCounts.get(value) || 0}/${originalCount})`,
        }))
    }

    // Enhanced status dropdown options with colors for table columns
    const statusDropdownOptions: DropdownOption[] = [
        {
            label: 'Open',
            value: 'open',
            color: '#E1F6DF', // Light green background
            textColor: '#0A0B0A', // Dark green text
        },
        {
            label: 'Close',
            value: 'close',
            color: '#FFECE8', // Light red background
            textColor: '#0A0B0A', // Dark red text
        },
    ]

    const internalStatusDropdownOptions: DropdownOption[] = [
        {
            label: 'Found',
            value: 'found',
            color: '#E1F6DF', // Light green background
            textColor: '#0A0B0A', // Dark green text
        },
        {
            label: 'Not Found',
            value: 'not found',
            color: '#FFEED6', // Light red background
            textColor: '#0A0B0A', // Dark red text
        },
        {
            label: 'Pending',
            value: 'pending',
            color: '#D3D4DD', // Light gray background using Tailwind
            textColor: '#0A0B0A', // Dark gray text
        },
    ]

    // Table columns configuration with all fields and fixed actions column
    const columns: TableColumn[] = [
        {
            key: 'requirementId',
            header: 'Req ID',
            render: (value, row) => (
                <span
                    onClick={() => navigate(`/acn/requirements/${row.requirementId}/details`)}
                    className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'
                >
                    {value}
                </span>
            ),
        },
        {
            key: 'propertyName',
            header: 'Project Name/Location',
            render: (value, row) => (
                <div className='relative group'>
                    <span
                        onClick={() => navigate(`/acn/requirements/${row.requirementId}/details`)}
                        className='block max-w-70 truncate text-black hover:text-blue-800 text-sm font-semibold cursor-pointer transition-colors'
                        title={value}
                    >
                        {value}
                    </span>
                    {/* Tooltip */}
                    <div className='absolute left-0 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal max-w-xs break-words'>
                        {value}
                    </div>
                </div>
            ),
        },
        {
            key: 'assetType',
            header: 'Asset type',
            render: (value) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                    {toCapitalizedWords(value)}
                </span>
            ),
        },
        {
            key: 'budget',
            header: 'Budget',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>
                    {`from ${value.from} to ${value.to}`}
                </span>
            ),
        },
        {
            key: 'requirementStatus',
            header: 'Status',
            dropdown: {
                options: statusDropdownOptions,
                placeholder: 'Select Status',
                onChange: (value, row) => {
                    updateRowData(row.requirementId, 'requirementStatus', value)
                },
            },
        },
        {
            key: 'internalStatus',
            header: 'Int. Status',
            dropdown: {
                options: internalStatusDropdownOptions,
                placeholder: 'Select Status',
                onChange: (value, row) => {
                    updateRowData(row.requirementId, 'internalStatus', value)
                },
            },
        },
        {
            key: 'lastModified',
            header: 'Last Updated',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal w-auto'>{formatUnixDate(value)}</span>
            ),
        },
        {
            key: 'name',
            header: 'Agent Name',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'agentPhone',
            header: 'Agent Number',
            render: (value) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            fixed: true,
            fixedPosition: 'right',
            render: (_, row) => (
                <div className='flex items-center gap-1 whitespace-nowrap w-auto'>
                    <span onClick={() => navigate(`/acn/requirements/${row.requirementId}/details`)}>
                        <Button
                            bgColor='bg-[#F3F3F3]'
                            textColor='text-[#3A3A47]'
                            className='px-4 h-8 font-semibold'
                            // you can omit onClick since <a> handles navigation
                        >
                            View Details
                        </Button>
                    </span>
                </div>
            ),
        },
    ]

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans h-screen flex flex-col'>
                <div
                    className='flex flex-col gap-4 pt-2 bg-white flex-1 overflow-hidden'
                    style={{ width: 'calc(100vw)', maxWidth: '100%' }}
                >
                    {/* Header */}
                    <AddRequirementModal
                        isOpen={isAddRequirementModalOpen}
                        onClose={() => setIsAddRequirementModalOpen(false)}
                    />
                    <div className='flex-shrink-0'>
                        <div className='flex items-center justify-between mb-2 px-6'>
                            <h1 className='text-lg font-semibold text-black'>Requirement</h1>
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
                                        placeholder='Search'
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className='h-8'
                                    />
                                </div>
                                <Button
                                    leftIcon={<img src={leadaddic} alt='Add Requirement Icon' className='w-5 h-5' />}
                                    bgColor='bg-[#F3F3F3]'
                                    textColor='text-[#3A3A47]'
                                    className='px-4 h-8 font-semibold'
                                    onClick={() => {
                                        setIsAddRequirementModalOpen(true)
                                        // console.log(isAddRequirementModalOpen)
                                    }}
                                >
                                    Add Requirement
                                </Button>
                            </div>
                        </div>
                        <hr className='border-gray-200 mb-4' />
                        <MetricCards metrics={metrics} className='mb-4 px-6' />
                        {/* Tab Switches and Filters */}
                        <div className='flex items-center gap-4 mb-2 px-6'>
                            {/* Tab Switches for Resale/Rental */}
                            <div className='flex items-center bg-gray-100 rounded-md p-1 h-8'>
                                <button
                                    onClick={() => handleTabChange('resale')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'resale'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Resale
                                </button>
                                <button
                                    onClick={() => handleTabChange('rental')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'rental'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Rental
                                </button>
                            </div>

                            {/* Other Filters */}
                            <div className='flex items-center gap-2 h-8'>
                                <button
                                    className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md hover:bg-gray-200'
                                    onClick={resetFilters}
                                    title='Reset Filters'
                                >
                                    <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                                </button>

                                <AlgoliaFacetMultiSelect
                                    options={getAlgoliaFacetOptions('requirementStatus')}
                                    selectedValues={filters.requirementStatus || []}
                                    onSelectionChange={(values) => updateFilters('requirementStatus', values)}
                                    placeholder='Requirement Status'
                                    label='Requirement Status'
                                    className='text-sm text-[#696979]'
                                    triggerClassName={`flex items-center justify-between px-3 py-1 border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer ${
                                        filters.requirementStatus && filters.requirementStatus.length > 0
                                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                                            : 'bg-gray-100 text-black hover:bg-gray-50'
                                    }`}
                                />

                                <AlgoliaFacetMultiSelect
                                    options={getAlgoliaFacetOptions('internalStatus')}
                                    selectedValues={filters.internalStatus || []}
                                    onSelectionChange={(values) => updateFilters('internalStatus', values)}
                                    placeholder='Internal Status'
                                    label='Internal Status'
                                    className='text-sm text-[#696979]'
                                    triggerClassName={`flex items-center justify-between px-3 py-1 border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer ${
                                        filters.internalStatus && filters.internalStatus.length > 0
                                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                                            : 'bg-gray-100 text-black hover:bg-gray-50'
                                    }`}
                                />

                                <AlgoliaFacetMultiSelect
                                    options={getAlgoliaFacetOptions('assetType')}
                                    selectedValues={filters.assetType || []}
                                    onSelectionChange={(values) => updateFilters('assetType', values)}
                                    placeholder='Asset Type'
                                    label='Asset Type'
                                    className='text-sm text-[#696979]'
                                    triggerClassName={`flex items-center justify-between px-3 py-1 border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer ${
                                        filters.assetType && filters.assetType.length > 0
                                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                                            : 'bg-gray-100 text-black hover:bg-gray-50'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Search Info */}
                    {searchLoading && (
                        <div className='mb-2 text-sm text-blue-600 flex items-center gap-2 flex-shrink-0'>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                            Searching...
                        </div>
                    )}

                    {!searchLoading && hasActiveFilters() && (
                        <div className='mb-2 text-sm text-gray-600 flex-shrink-0'>
                            Found {totalItems.toLocaleString()} requirements
                            {searchValue && ` for "${searchValue}"`}
                        </div>
                    )}

                    {searchError && (
                        <div className='mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0'>
                            <div className='text-sm text-red-700'>Error: {searchError}</div>
                            <button
                                onClick={() => performSearch()}
                                className='mt-2 text-sm text-red-600 hover:text-red-800 font-medium'
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Table Container - This will take remaining space */}
                    <div className='flex-1 flex flex-col gap-[29px] overflow-hidden'>
                        {/* Table with fixed actions column and vertical scrolling */}
                        <div className='bg-white rounded-lg overflow-hidden flex-1 pl-6'>
                            <div className='h-full overflow-hidden'>
                                {searchLoading ? (
                                    <div className='flex items-center justify-center h-64'>
                                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                                        <span className='ml-3 text-gray-600'>Loading requirements...</span>
                                    </div>
                                ) : currentData.length > 0 ? (
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
                                        maxHeight='100%'
                                        className='rounded-lg h-full'
                                        stickyHeader={true}
                                    />
                                ) : (
                                    <div className='flex items-center justify-center h-64'>
                                        <div className='text-center'>
                                            <div className='text-gray-500 text-lg font-medium'>
                                                No requirements found
                                            </div>
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
                                currentPage={currentPage + 1}
                                totalPages={totalPages}
                                onPageChange={(page) => handlePageChange(page - 1)}
                                className=''
                            />
                        </div>
                        {/* )} */}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default RequirementsPage
