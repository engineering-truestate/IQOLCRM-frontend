'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import MetricsCards from '../../../components/design-elements/MetricCards'
import {
    generateQCProperties,
    getKamPendingProperties,
    getDataPendingProperties,
    getNotApprovedProperties,
    type QCProperty,
    type QCReviewStatus,
} from '../../dummy_data/acn_qc_dummy_data'
import resetic from '/icons/acn/rotate-left.svg'
import verifyIcon from '/icons/acn/verify.svg'

type TabType = 'kam' | 'data' | 'notApproved'

const QCMetrics = [
    { label: 'Total Leads', value: 50 },
    { label: 'Total Properties', value: 200 },
]

const QCDashboardPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('kam')
    const [searchValue, setSearchValue] = useState('')
    const [selectedKAM, setSelectedKAM] = useState('')
    const [selectedSort, setSelectedSort] = useState('')
    const [selectedAssetType, setSelectedAssetType] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [paginatedData, setPaginatedData] = useState<QCProperty[]>([])

    const navigate = useNavigate()
    // Items per page
    const ITEMS_PER_PAGE = 50

    // Initialize QC data
    const [allQCData] = useState<QCProperty[]>(() => generateQCProperties(300))

    // Get filtered data based on active tab
    const getFilteredData = (): QCProperty[] => {
        switch (activeTab) {
            case 'kam':
                return getKamPendingProperties(allQCData)
            case 'data':
                return getDataPendingProperties(allQCData)
            case 'notApproved':
                return getNotApprovedProperties(allQCData)
            default:
                return []
        }
    }

    const currentData = getFilteredData()
    const totalPages = Math.ceil(currentData.length / ITEMS_PER_PAGE)

    // Update paginated data when page changes, data changes, or tab changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        setPaginatedData(currentData.slice(startIndex, endIndex))
    }, [currentPage, currentData, activeTab])

    // Reset to first page when changing tabs
    useEffect(() => {
        setCurrentPage(1)
    }, [activeTab])

    // Get counts for each tab
    const kamPendingCount = getKamPendingProperties(allQCData).length
    const dataPendingCount = getDataPendingProperties(allQCData).length

    // Dropdown options
    const kamOptions = [
        { label: 'All KAMs', value: '' },
        { label: 'Samarth', value: 'samarth' },
        { label: 'Priya', value: 'priya' },
        { label: 'Raj', value: 'raj' },
        { label: 'Sneha', value: 'sneha' },
    ]

    const sortOptions = [
        { label: 'Sort by Date', value: '' },
        { label: 'Newest First', value: 'newest' },
        { label: 'Oldest First', value: 'oldest' },
    ]

    const assetTypeOptions = [
        { label: 'All Asset Types', value: '' },
        { label: 'Apartment', value: 'apartment' },
        { label: 'Villa', value: 'villa' },
        { label: 'Plot', value: 'plot' },
        { label: 'Rowhouse', value: 'rowhouse' },
    ]

    // Review status options for dropdowns
    // const getReviewStatusOptions = (isKamReview: boolean): DropdownOption[] => [
    //     {
    //         label: 'Approved',
    //         value: 'approved',
    //         color: '#E1F6DF',
    //         textColor: '#065F46',
    //     },
    //     {
    //         label: 'Duplicate',
    //         value: 'duplicate',
    //         color: '#FFF3CD',
    //         textColor: '#B45309',
    //     },
    //     {
    //         label: 'Primary',
    //         value: 'primary',
    //         color: '#E0F2FE',
    //         textColor: '#0369A1',
    //     },
    //     {
    //         label: 'Reject',
    //         value: 'reject',
    //         color: '#FEECED',
    //         textColor: '#991B1B',
    //     },
    // ]

    // Status badge component
    const StatusBadge = ({ status }: { status: QCReviewStatus }) => {
        const getStatusColors = () => {
            switch (status) {
                case 'approved':
                    return 'bg-green-100 text-green-800 border-green-200'
                case 'duplicate':
                    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
                case 'primary':
                    return 'bg-blue-100 text-blue-800 border-blue-200'
                case 'reject':
                    return 'bg-red-100 text-red-800 border-red-200'
                case 'pending':
                    return 'bg-gray-100 text-gray-800 border-gray-200'
                default:
                    return 'bg-gray-100 text-gray-800 border-gray-200'
            }
        }

        const getDisplayText = () => {
            return status.charAt(0).toUpperCase() + status.slice(1)
        }

        return (
            <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap ${getStatusColors()}`}
            >
                {getDisplayText()}
            </span>
        )
    }

    // Base columns for kam and data tabs
    const getBaseColumns = (): TableColumn[] => [
        {
            key: 'projectName',
            header: 'Project Name/Location',
            render: (value) => <span className='whitespace-nowrap text-sm font-semibold w-auto'>{value}</span>,
        },
        {
            key: 'assetType',
            header: 'Asset type',
            render: (value) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
            ),
        },
        {
            key: 'phoneNumber',
            header: 'Phone Number',
            render: (value) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
            ),
        },
        {
            key: 'agent',
            header: 'Agent',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
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
            key: 'price',
            header: 'Price',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'micromarket',
            header: 'Micromarket',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'actions',
            header: 'Action',
            fixed: true,
            fixedPosition: 'right',
            render: (_, row) => (
                <div className='flex items-center gap-1 whitespace-nowrap w-auto'>
                    <button
                        className='h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0'
                        onClick={() => {
                            navigate(`/acn/qc/${row.id}/details`)
                        }}
                        title='Verify'
                    >
                        <img src={verifyIcon} alt='Verify Icon' className='w-7 h-7 flex-shrink-0' />
                    </button>
                </div>
            ),
        },
    ]

    // Columns for not approved tab (includes review status columns)
    const getNotApprovedColumns = (): TableColumn[] => [
        ...getBaseColumns().slice(0, -1), // Remove actions column temporarily
        {
            key: 'kamReviewed',
            header: 'Kam Review',
            render: (value) => (
                <div className='whitespace-nowrap w-auto'>
                    <StatusBadge status={value as QCReviewStatus} />
                </div>
            ),
        },
        {
            key: 'kam',
            header: 'Kam',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'micromarket',
            header: 'Micromarket',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        // Add actions column back
        getBaseColumns()[getBaseColumns().length - 1],
    ]

    const getColumns = (): TableColumn[] => {
        if (activeTab === 'notApproved') {
            return getNotApprovedColumns()
        }
        return getBaseColumns()
    }

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-2 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-4'>
                        <div className='flex items-center justify-between mb-2'>
                            <h1 className='text-lg font-semibold text-black'>QC Dashboard</h1>
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
                            </div>
                        </div>
                        <hr className='border-gray-200 mb-4' />

                        {/* Metrics Cards */}
                        <MetricsCards metrics={QCMetrics} className='mb-2' />

                        {/* Filters */}
                        <div className='flex items-center gap-2 mb-2'>
                            <button className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md'>
                                <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                            </button>

                            {/* Tab Selection */}
                            <div className='flex items-center bg-gray-100 rounded-md p-1 h-8'>
                                <button
                                    onClick={() => setActiveTab('kam')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'kam'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Kam Review ({kamPendingCount})
                                </button>
                                <button
                                    onClick={() => setActiveTab('data')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'data'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Data Review ({dataPendingCount})
                                </button>
                                <button
                                    onClick={() => setActiveTab('notApproved')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'notApproved'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Not Approved ({getNotApprovedProperties(allQCData).length})
                                </button>
                            </div>

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
                                placeholder='Sort By'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />

                            <Dropdown
                                options={assetTypeOptions}
                                onSelect={setSelectedAssetType}
                                defaultValue={selectedAssetType}
                                placeholder='Asset Type'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />
                        </div>
                    </div>

                    {/* Table */}
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
                                {Math.min(currentPage * ITEMS_PER_PAGE, currentData.length)} of {currentData.length}{' '}
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

export default QCDashboardPage
