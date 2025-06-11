'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import { fetchPropertiesBatch } from '../../../services/acn/properties/propertiesService'
import { generateRequirements, type RequirementData } from '../../dummy_data/acn_requirements_dummy_data'
import resetic from '/icons/acn/rotate-left.svg'
import type { AppDispatch, RootState } from '../../../store/index'
import type { IInventory } from '../../../store/reducers/types'

const PropertiesSelectionPage = () => {
    const navigate = useNavigate()
    const { id } = useParams() // requirement ID
    const dispatch = useDispatch<AppDispatch>()

    // Redux state
    const {
        properties: propertiesData,
        loading,
        error,
        hasMore,
        isLoadingMore,
    } = useSelector((state: RootState) => state.properties)

    // Local state
    const [searchValue, setSearchValue] = useState('')
    const [activeTab, setActiveTab] = useState('resale')
    const [selectedInventoryStatus, setSelectedInventoryStatus] = useState('')
    const [selectedKAM, setSelectedKAM] = useState('')
    const [selectedSort, setSelectedSort] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [paginatedData, setPaginatedData] = useState<IInventory[]>([])
    const [filteredData, setFilteredData] = useState<IInventory[]>([])
    const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())
    const [_, setRequirement] = useState<RequirementData | null>(null)

    // Items per page
    const ITEMS_PER_PAGE = 50
    const BATCH_SIZE = 100

    // Load properties and requirement data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await dispatch(fetchPropertiesBatch(BATCH_SIZE, false))
            } catch (error) {
                console.error('Failed to load properties:', error)
            }
        }

        loadInitialData()

        // Load requirement data
        if (id) {
            const allRequirements = generateRequirements()
            const foundRequirement = allRequirements.find((req) => req.reqId === id)
            if (foundRequirement) {
                setRequirement(foundRequirement)
                // Pre-select already matched properties
                setSelectedProperties(new Set(foundRequirement.matchedPropertyIds))
            }
        }
    }, [dispatch, id])

    // Filter data based on search and other filters
    useEffect(() => {
        const filtered = [...propertiesData]

        // Apply search filter
        // if (searchValue.trim()) {
        //     const searchLower = searchValue.toLowerCase()
        //     filtered = filtered.filter(
        //         (property) =>
        //             property.propertyId?.toLowerCase().includes(searchLower) ||
        //             property.propertyName?.toLowerCase().includes(searchLower) ||
        //             property.micromarket?.toLowerCase().includes(searchLower) ||
        //             property.agentName?.toLowerCase().includes(searchLower)
        //     )
        // }

        // Apply inventory status filter
        // if (selectedInventoryStatus) {
        //     filtered = filtered.filter(
        //         (property) => property.status?.toLowerCase() === selectedInventoryStatus.toLowerCase()
        //     )
        // }

        // Apply KAM filter
        // if (selectedKAM) {
        //     filtered = filtered.filter(
        //         (property) => property.kam?.toLowerCase().includes(selectedKAM.toLowerCase())
        //     )
        // }

        // Apply sorting
        // if (selectedSort) {
        //     switch (selectedSort) {
        //         case 'price_asc':
        //             filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        //             break
        //         case 'price_desc':
        //             filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        //             break
        //         case 'recent':
        //             filtered.sort((a, b) => {
        //                 const dateA = a.dateOfInventoryAdded ? new Date(a.dateOfInventoryAdded).getTime() : 0
        //                 const dateB = b.dateOfInventoryAdded ? new Date(b.dateOfInventoryAdded).getTime() : 0
        //                 return dateB - dateA
        //             })
        //             break
        //         default:
        //             break
        //     }
        // }

        setFilteredData(filtered)
        setCurrentPage(1)
    }, [propertiesData, searchValue, selectedInventoryStatus, selectedKAM, selectedSort])

    // Calculate total pages based on filtered data
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

    // Update paginated data when page changes or filtered data changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const currentPageData = filteredData.slice(startIndex, endIndex)

        setPaginatedData(currentPageData)

        // Load more data if we're approaching the end and there's more to load
        const remainingItems = filteredData.length - endIndex
        if (remainingItems < ITEMS_PER_PAGE && hasMore && !isLoadingMore) {
            dispatch(fetchPropertiesBatch(BATCH_SIZE, true))
        }
    }, [currentPage, filteredData, hasMore, isLoadingMore, dispatch])

    // Handle property selection
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

    // Handle select all
    const toggleSelectAll = () => {
        if (selectedProperties.size === paginatedData.length) {
            // Deselect all current page items
            setSelectedProperties((prev) => {
                const newSet = new Set(prev)
                paginatedData.forEach((item) => newSet.delete(item.propertyId || item.id))
                return newSet
            })
        } else {
            // Select all current page items
            setSelectedProperties((prev) => {
                const newSet = new Set(prev)
                paginatedData.forEach((item) => newSet.add(item.propertyId || item.id))
                return newSet
            })
        }
    }

    // Handle save selected properties
    const saveSelectedProperties = () => {
        console.log('Saving selected properties:', Array.from(selectedProperties))
        navigate(`/acn/requirements/${id}/details`)
    }

    // Helper function to update a specific row's data
    const updateRowData = (propertyId: string, field: keyof IInventory, value: string) => {
        // You can implement this to update the property in Redux store
        console.log('Update property:', propertyId, field, value)
        // Example: dispatch an action to update the property
    }

    // Format currency
    const formatCurrency = (amount: number | undefined | null) => {
        if (!amount) return '₹0'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    // Format date
    const formatDate = (date: any) => {
        if (!date) return '-'
        let dateObj: Date

        if (date?.toDate) {
            // Firestore Timestamp
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

    // Dropdown options
    const inventoryStatusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Available', value: 'available' },
        { label: 'Sold', value: 'sold' },
        { label: 'Hold', value: 'hold' },
        { label: 'De-Listed', value: 'de-listed' },
    ]

    const kamOptions = [
        { label: 'All KAMs', value: '' },
        { label: 'Samarth Jangir', value: 'samarth' },
        { label: 'Sophia Bennett', value: 'sophia' },
        { label: 'John Smith', value: 'john' },
    ]

    const sortOptions = [
        { label: 'Sort', value: '' },
        { label: 'Price: Low to High', value: 'price_asc' },
        { label: 'Price: High to Low', value: 'price_desc' },
        { label: 'Recent First', value: 'recent' },
    ]

    // Status dropdown options with colors matching the badges
    const statusDropdownOptions: DropdownOption[] = [
        {
            label: 'Available',
            value: 'Available',
            color: '#E1F6DF',
            textColor: '#065F46',
        },
        {
            label: 'Sold',
            value: 'Sold',
            color: '#F5F5F5',
            textColor: '#374151',
        },
        {
            label: 'Hold',
            value: 'Hold',
            color: '#FFF4E6',
            textColor: '#92400E',
        },
        {
            label: 'De-Listed',
            value: 'De-Listed',
            color: '#FFC8B8',
            textColor: '#991B1B',
        },
    ]

    // Table columns configuration
    const columns: TableColumn[] = [
        {
            key: 'checkbox',
            header: '',
            render: (_, row) => (
                <input
                    type='checkbox'
                    checked={selectedProperties.has(row.propertyId || row.id)}
                    onChange={() => togglePropertySelection(row.propertyId || row.id)}
                    className='rounded'
                />
            ),
        },
        {
            key: 'propertyId',
            header: 'Property ID',
            render: (value, row) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal'>{value || row.id}</span>
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
            key: 'price',
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
                    updateRowData(row.propertyId || row.id, 'status', value)
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
            key: 'agentName',
            header: 'Agent Name',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value || '-'}</span>,
        },
    ]

    // Reset filters
    const resetFilters = () => {
        setSearchValue('')
        setSelectedInventoryStatus('')
        setSelectedKAM('')
        setSelectedSort('')
    }

    if (loading && propertiesData.length === 0) {
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

    if (error) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center h-64'>
                    <div className='text-center'>
                        <p className='text-red-600 mb-4'>Error loading properties: {error}</p>
                        <Button
                            bgColor='bg-blue-600'
                            textColor='text-white'
                            onClick={() => dispatch(fetchPropertiesBatch(BATCH_SIZE, false))}
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
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className='h-8'
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className='border-gray-200 mb-4' />

                        {/* Tab Switches and Filters */}
                        <div className='flex items-center gap-4 mb-2'>
                            {/* Tab Switches for Resale/Rental */}
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

                            {/* Other Filters */}
                            <div className='flex items-center gap-2'>
                                <button
                                    className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md hover:bg-gray-200'
                                    onClick={resetFilters}
                                    title='Reset Filters'
                                >
                                    <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                                </button>

                                <Dropdown
                                    options={inventoryStatusOptions}
                                    onSelect={setSelectedInventoryStatus}
                                    defaultValue={selectedInventoryStatus}
                                    placeholder='Inventory Status'
                                    className='relative inline-block'
                                    triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer'
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                />

                                <Dropdown
                                    options={kamOptions}
                                    onSelect={setSelectedKAM}
                                    defaultValue={selectedKAM}
                                    placeholder='KAM'
                                    className='relative inline-block'
                                    triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                />

                                <Dropdown
                                    options={sortOptions}
                                    onSelect={setSelectedSort}
                                    defaultValue={selectedSort}
                                    placeholder='Sort'
                                    className='relative inline-block'
                                    triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                />

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
                            <span>Total: {filteredData.length} properties</span>
                            {isLoadingMore && <span className='text-blue-600'>Loading more...</span>}
                            {!hasMore && propertiesData.length > 0 && (
                                <span className='text-green-600'>All properties loaded</span>
                            )}
                        </div>
                    </div>

                    {/* Save Button - Shows when properties are selected */}
                    {selectedProperties.size > 0 && (
                        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between'>
                            <div className='text-sm text-blue-700'>
                                {selectedProperties.size} propert{selectedProperties.size === 1 ? 'y' : 'ies'} selected
                            </div>
                            <Button
                                bgColor='bg-blue-600'
                                textColor='text-white'
                                className='px-4 h-8 font-medium'
                                onClick={saveSelectedProperties}
                            >
                                💾 Save Selected Properties
                            </Button>
                        </div>
                    )}

                    {/* Table with vertical scrolling */}
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
                                            paginatedData.length > 0 &&
                                            paginatedData.every((item) =>
                                                selectedProperties.has(item.propertyId || item.id),
                                            )
                                        }
                                        onChange={toggleSelectAll}
                                        className='rounded'
                                    />
                                    {paginatedData.length > 0 &&
                                    paginatedData.every((item) => selectedProperties.has(item.propertyId || item.id))
                                        ? 'Deselect All'
                                        : 'Select All'}{' '}
                                    ({paginatedData.length} on this page)
                                </button>
                            </div>
                        </div>

                        <div className='h-[70vh] overflow-y-auto'>
                            <FlexibleTable
                                data={paginatedData}
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
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                                {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length}{' '}
                                properties
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

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((page) => {
                                        return (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        )
                                    })
                                    .map((page, index, array) => {
                                        const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1
                                        const showEllipsisAfter =
                                            index < array.length - 1 && array[index + 1] !== page + 1

                                        return (
                                            <React.Fragment key={page}>
                                                {showEllipsisBefore && (
                                                    <span className='w-8 h-8 flex items-center justify-center text-gray-500'>
                                                        ...
                                                    </span>
                                                )}

                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-8 h-8 rounded flex items-center justify-center text-sm font-semibold transition-colors ${
                                                        currentPage === page
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {page}
                                                </button>

                                                {showEllipsisAfter && (
                                                    <span className='w-8 h-8 flex items-center justify-center text-gray-500'>
                                                        ...
                                                    </span>
                                                )}
                                            </React.Fragment>
                                        )
                                    })}

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                                        currentPage === totalPages
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
