'use client'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import ShareInventoryModal from '../../../components/acn/ShareInventoryModal'
import UpdateInventoryStatusModal from '../../../components/acn/UpdateInventoryModal'
import {
    generateProperties,
    type Property,
    type PropertyStatus,
    type PropertyType,
} from '../../dummy_data/acn_properties_inventory_dummy_data'
import MetricsCards from '../../../components/design-elements/MetricCards'
import resetic from '/icons/acn/rotate-left.svg'
import addinventoryic from '/icons/acn/user-add.svg'
import shareic from '/icons/acn/share.svg'
import editicon from '/icons/acn/write.svg'

const getMetrics = (activeTab: PropertyType) => {
    if (activeTab === 'Resale') {
        return [
            { label: 'Total Listings', value: 150 },
            { label: 'Inv Added', value: 100 },
            { label: 'Available', value: 100 },
            { label: 'Sold', value: 50 },
            { label: 'Delisted', value: 50 },
            { label: 'Pending QC', value: 50 },
            { label: 'Hold', value: 50 },
            { label: 'Avg Inv Score', value: 50 },
        ]
    } else {
        return [
            { label: 'Total Listings', value: 120 },
            { label: 'Inv Added', value: 80 },
            { label: 'Available', value: 90 },
            { label: 'Rented', value: 25 },
            { label: 'Delisted', value: 30 },
            { label: 'Pending QC', value: 40 },
            { label: 'Hold', value: 35 },
            { label: 'Avg Inv Score', value: 65 },
        ]
    }
}

const PropertiesPage = () => {
    const [activeTab, setActiveTab] = useState<PropertyType>('Resale')
    const [searchValue, setSearchValue] = useState('')
    const [selectedKAM, setSelectedKAM] = useState('')
    const [selectedSort, setSelectedSort] = useState('')
    const [selectedInventoryStatus, setSelectedInventoryStatus] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
    const [paginatedData, setPaginatedData] = useState<Property[]>([])
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
    const navigate = useNavigate()

    // Items per page
    const ITEMS_PER_PAGE = 50

    // Initialize properties data for both tabs - make them mutable
    const [resaleData, setResaleData] = useState<Property[]>(() => generateProperties(150, 'Resale'))
    const [rentalData, setRentalData] = useState<Property[]>(() => generateProperties(120, 'Rental'))

    // Get current data based on active tab
    const propertiesData = activeTab === 'Resale' ? resaleData : rentalData

    // Calculate total pages
    const totalPages = Math.ceil(propertiesData.length / ITEMS_PER_PAGE)

    // Update paginated data when page changes, data changes, or tab changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        setPaginatedData(propertiesData.slice(startIndex, endIndex))
        // Clear selections when changing tabs
        setSelectedRows(new Set())
    }, [currentPage, propertiesData, activeTab])

    // Reset to first page when changing tabs
    useEffect(() => {
        setCurrentPage(1)
    }, [activeTab])

    // Helper function to update multiple rows' data
    const updateMultipleRowsData = (rowIds: string[], field: keyof Property, value: any) => {
        if (activeTab === 'Resale') {
            setResaleData((prev) => prev.map((item) => (rowIds.includes(item.id) ? { ...item, [field]: value } : item)))
        } else {
            setRentalData((prev) => prev.map((item) => (rowIds.includes(item.id) ? { ...item, [field]: value } : item)))
        }
    }

    // Helper function to update a specific row's data
    const updateRowData = (rowId: string, field: keyof Property, value: any) => {
        if (activeTab === 'Resale') {
            setResaleData((prev) => prev.map((item) => (item.id === rowId ? { ...item, [field]: value } : item)))
        } else {
            setRentalData((prev) => prev.map((item) => (item.id === rowId ? { ...item, [field]: value } : item)))
        }
    }

    // Handle bulk status update from modal
    const handleBulkStatusUpdate = (status: PropertyStatus, soldPrice?: string) => {
        const selectedRowIds = Array.from(selectedRows)

        // Update status for all selected rows
        updateMultipleRowsData(selectedRowIds, 'status', status)

        // Update price if provided and status is Sold
        if (status === 'Sold' && soldPrice) {
            const priceField = activeTab === 'Resale' ? 'salePrice' : 'monthlyRent'
            updateMultipleRowsData(selectedRowIds, priceField, soldPrice)
        }

        // Clear selections after update
        setSelectedRows(new Set())
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

    // Handle select all
    // const handleSelectAll = (checked: boolean) => {
    //     if (checked) {
    //         const allIds = paginatedData.map(row => row.id)
    //         setSelectedRows(new Set(allIds))
    //     } else {
    //         setSelectedRows(new Set())
    //     }
    // }

    // Dropdown options
    const kamOptions = [
        { label: 'All KAMs', value: '' },
        { label: 'Samarth', value: 'samarth' },
        { label: 'Priya', value: 'priya' },
        { label: 'Raj', value: 'raj' },
    ]

    const sortOptions = [
        { label: 'Sort by Date', value: '' },
        { label: 'Newest First', value: 'newest' },
        { label: 'Oldest First', value: 'oldest' },
    ]

    const getInventoryStatusOptions = () => {
        if (activeTab === 'Resale') {
            return [
                { label: 'All Status', value: '' },
                { label: 'Available', value: 'available' },
                { label: 'Sold', value: 'sold' },
                { label: 'Hold', value: 'hold' },
                { label: 'Delisted', value: 'delisted' },
                { label: 'Pending QC', value: 'pending_qc' },
            ]
        } else {
            return [
                { label: 'All Status', value: '' },
                { label: 'Available', value: 'available' },
                { label: 'Rented', value: 'sold' },
                { label: 'Hold', value: 'hold' },
                { label: 'Delisted', value: 'delisted' },
                { label: 'Pending QC', value: 'pending_qc' },
            ]
        }
    }

    const statusDropdownOptions: DropdownOption[] = [
        {
            label: 'Available',
            value: 'Available',
            color: '#E1F6DF',
            textColor: '#065F46',
        },
        {
            label: activeTab === 'Resale' ? 'Sold' : 'Rented',
            value: 'Sold',
            color: '#FEECED',
            textColor: '#991B1B',
        },
        {
            label: 'Hold',
            value: 'Hold',
            color: '#FFF3CD',
            textColor: '#B45309',
        },
        {
            label: 'Delisted',
            value: 'Delisted',
            color: '#F3F4F6',
            textColor: '#374151',
        },
    ]

    // Table columns configuration
    const getColumns = (): TableColumn[] => {
        const baseColumns: TableColumn[] = [
            {
                key: 'select',
                header: '',
                render: (_, row) => (
                    <input
                        type='checkbox'
                        checked={selectedRows.has(row.id)}
                        onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                        className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                    />
                ),
            },
            {
                key: 'propertyId',
                header: 'Property ID',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                ),
            },
            {
                key: 'propertyName',
                header: 'Property Name',
                render: (value, row) => (
                    <span
                        className='whitespace-nowrap text-sm font-semibold w-auto'
                        onClick={() => navigate(`/acn/properties/${row.id}/details`)}
                    >
                        {value}
                    </span>
                ),
            },
            {
                key: 'assetType',
                header: 'Asset Type',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                ),
            },
        ]

        // Add price columns based on tab
        if (activeTab === 'Resale') {
            baseColumns.push({
                key: 'salePrice',
                header: 'Sale Price',
                render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
            })
        } else {
            baseColumns.push({
                key: 'monthlyRent',
                header: 'Monthly Rent',
                render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
            })
            baseColumns.push({
                key: 'securityDeposit',
                header: 'Security Deposit',
                render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
            })
        }

        const remainingColumns: TableColumn[] = [
            {
                key: 'sbua',
                header: 'SBUA',
                render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
            },
            {
                key: 'plotSize',
                header: 'Plot Size',
                render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
            },
            {
                key: 'facing',
                header: 'Facing',
                render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
            },
        ]

        // Add possession/availability based on tab
        if (activeTab === 'Resale') {
            remainingColumns.push({
                key: 'possessionDate',
                header: 'Possession',
                render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
            })
        }

        remainingColumns.push(
            {
                key: 'enquiries',
                header: 'Enquiries',
                render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
            },
            {
                key: 'micromarket',
                header: 'Micromarket',
                render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
            },
            {
                key: 'status',
                header: 'Status',
                dropdown: {
                    options: statusDropdownOptions,
                    placeholder: 'Select Status',
                    onChange: (value, row) => {
                        updateRowData(row.id, 'status', value as PropertyStatus)
                    },
                },
            },
            {
                key: 'lastCheck',
                header: 'Last check',
                render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
            },
            {
                key: 'agentName',
                header: 'Agent Name',
                render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
            },
            {
                key: 'invScore',
                header: 'Inv Score',
                render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
            },
            {
                key: 'imgVid',
                header: 'Img/Vid',
                render: (value) => (
                    <span className='whitespace-nowrap text-sm font-normal w-auto'>{value ? '✓' : '✗'}</span>
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
                                navigate(`/acn/properties/${row.id}/edit`)
                            }}
                            title='Edit'
                        >
                            <img src={editicon} alt='Edit Icon' className='w-7 h-7 flex-shrink-0' />
                        </button>
                    </div>
                ),
            },
        )

        return [...baseColumns, ...remainingColumns]
    }

    return (
        <Layout loading={false}>
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
                                        placeholder='Search'
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
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
                        <MetricsCards metrics={getMetrics(activeTab)} className='mb-2' />

                        {/* Filters */}
                        <div className='flex items-center gap-2 mb-2'>
                            <button className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md'>
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

                            <Dropdown
                                options={getInventoryStatusOptions()}
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

                            <div className='flex gap-2'>
                                <Button
                                    bgColor='bg-white'
                                    textColor='text-gray-700'
                                    className='px-3 py-1 text-sm border border-gray-300'
                                    onClick={() => console.log('Filter clicked')}
                                >
                                    Filter
                                </Button>
                            </div>
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
                    </div>

                    {/* Table with horizontal scrolling and fixed actions column */}
                    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                        <div className='h-[65vh] overflow-y-auto'>
                            <FlexibleTable
                                data={paginatedData}
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
                        </div>

                        {/* Pagination */}
                        <div className='flex items-center justify-between py-4 px-6 border-t border-gray-200'>
                            <div className='text-sm text-gray-500 font-medium'>
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                                {Math.min(currentPage * ITEMS_PER_PAGE, propertiesData.length)} of{' '}
                                {propertiesData.length} properties
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
