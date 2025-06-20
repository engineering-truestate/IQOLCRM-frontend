'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
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
    const [selectedRequirementStatus] = useState('')
    const [selectedAssetType] = useState('')
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

    // Use imported data generation function
    const [requirementsData, setRequirementsData] = useState<IRequirement[]>([])

    const dispatch = useDispatch<AppDispatch>()

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

            // Update facets for filtering options
            setFacets(
                response.facets
                    ? Object.fromEntries(
                          Object.entries(response.facets).map(([facetName, facetValues]) => [
                              facetName,
                              Object.entries(facetValues).map(([value, count]) => ({
                                  value,
                                  count,
                              })),
                          ]),
                      )
                    : {},
            )
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
    const updateFilter = (filterType: keyof RequirementSearchFilters, value: string | null) => {
        setFilters((prev) => {
            const newFilters = { ...prev }

            if (value === null || value === '') {
                delete newFilters[filterType]
            } else {
                newFilters[filterType] = [value]
            }

            return newFilters
        })
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
                    propertyType: activeTab === 'rental' ? 'Rental' : 'Resale',
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

    const requirementStatusOptions = [
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

    const assetTypeOptions = [
        { label: 'All Types', value: '' },
        { label: 'Apartment', value: 'apartment' },
        { label: 'Villa', value: 'villa' },
        { label: 'Townhouse', value: 'townhouse' },
        { label: 'Studio', value: 'studio' },
        { label: 'Penthouse', value: 'penthouse' },
    ]

    // Enhanced status dropdown options with colors
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
                options: requirementStatusOptions,
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
            key: 'agentCpid',
            header: 'Agent Name',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'agentNumber',
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
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-2 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <AddRequirementModal
                        isOpen={isAddRequirementModalOpen}
                        onClose={() => setIsAddRequirementModalOpen(false)}
                    />
                    <div className='mb-4'>
                        <div className='flex items-center justify-between mb-2'>
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
                        {/* Tab Switches and Filters */}
                        <div className='flex items-center gap-4 mb-2'>
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
                                <button className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md'>
                                    <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                                </button>

                                <Dropdown
                                    options={requirementStatusOptions}
                                    onSelect={(value) => updateFilter('requirementStatus', value)}
                                    defaultValue={selectedRequirementStatus}
                                    placeholder='Requirement Status'
                                    className='relative inline-block'
                                    triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer'
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                />

                                <Dropdown
                                    options={assetTypeOptions}
                                    onSelect={(value) => updateFilter('assetType', value)}
                                    defaultValue={selectedAssetType}
                                    placeholder='Asset Type'
                                    className='relative inline-block'
                                    triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table with fixed actions column and vertical scrolling */}
                    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                        <div className='h-[75vh] overflow-y-auto'>
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
                                    maxHeight='75vh'
                                    className='rounded-lg'
                                    stickyHeader={true}
                                />
                            ) : (
                                <div className='flex items-center justify-center h-64'>
                                    <div className='text-center'>
                                        <div className='text-gray-500 text-lg font-medium'>No requirements found</div>
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
                                    {totalItems.toLocaleString()} requirements
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
                </div>
            </div>
        </Layout>
    )
}

export default RequirementsPage
