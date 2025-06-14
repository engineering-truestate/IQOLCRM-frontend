'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import MetricsCards from '../../../components/design-elements/MetricCards'
import {
    searchInventory,
    getInventoryFacets,
    type InventorySearchParams,
    type InventorySearchResponse,
} from '../../../services/acn/qc/algoliaQcInventoryService'
// Removed dummy data imports
import resetic from '/icons/acn/rotate-left.svg'
import verifyIcon from '/icons/acn/verify.svg'

// Define types locally instead of importing from dummy data
export type QCReviewStatus = 'pending' | 'approved' | 'duplicate' | 'primary' | 'reject'

export interface QCProperty {
    id: string
    projectName: string
    assetType: string
    phoneNumber: string
    agent: string
    sbua: string
    plotSize: string
    price: string
    micromarket: string
    kamReviewed: QCReviewStatus
    dataReviewed: QCReviewStatus
    kam: string
    kamReviewDate?: string
    dataReviewDate?: string
    createdDate: string
    stage?: string
    status?: string
}

type TabType = 'kam' | 'data' | 'notApproved'

const QCDashboardPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('kam')
    const [searchValue, setSearchValue] = useState('')
    const [selectedKAM, setSelectedKAM] = useState('INT004')
    const [selectedSort, setSelectedSort] = useState('')
    const [selectedAssetType, setSelectedAssetType] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(0) // Algolia uses 0-based pagination
    const [qcData, setQcData] = useState<QCProperty[]>([])
    const [loading, setLoading] = useState(false)
    const [totalHits, setTotalHits] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [facets, setFacets] = useState<Record<string, { value: string; count: number }[]>>({})
    const [kamCounts, setKamCounts] = useState({ kam: 0, data: 0, notApproved: 0 })

    const navigate = useNavigate()
    // Items per page
    const ITEMS_PER_PAGE = 50

    // Default KAM ID - you may want to get this from user context or props
    const DEFAULT_KAM_ID = 'INT001' // Replace with actual KAM ID logic

    // Transform Algolia data to QCProperty format
    const transformAlgoliaData = (hits: any[]): QCProperty[] => {
        console.log('hidsst', hits)
        return hits.map((hit, index) => ({
            id: hit.objectID || `QC${index.toString().padStart(4, '0')}`,
            projectName: hit.projectName || hit.project_name || 'N/A',
            assetType: hit.assetType || hit.asset_type || 'N/A',
            phoneNumber: hit.phoneNumber || hit.phone_number || 'N/A',
            agent: hit.agent || hit.agent_name || 'N/A',
            sbua: hit.sbua || hit.built_up_area || 'N/A',
            plotSize: hit.plotSize || hit.plot_size || 'N/A',
            price: hit.price || 'N/A',
            micromarket: hit.micromarket || hit.micro_market || 'N/A',
            kamReviewed: (hit.kamReviewed || hit.kam_reviewed || 'pending') as QCReviewStatus,
            dataReviewed: (hit.dataReviewed || hit.data_reviewed || 'pending') as QCReviewStatus,
            kam: hit.kam || hit.kam_name || 'N/A',
            kamReviewDate: hit.kamReviewDate || hit.kam_review_date,
            dataReviewDate: hit.dataReviewDate || hit.data_review_date,
            createdDate: hit.createdDate || hit.created_date || new Date().toLocaleDateString(),
            stage: hit.stage || 'kam',
            status: hit.status || 'active',
        }))
    }

    // Get stage filters based on active tab
    const getStageFilters = (): string[] => {
        switch (activeTab) {
            case 'kam':
                return ['kam'] // KAM review pending
            case 'data':
                return ['dataTeam'] // KAM approved, data review pending
            case 'notApproved':
                return ['kam', 'dataTeam'] // Not approved statuses
            default:
                return ['kam']
        }
    }

    // Fetch QC data from Algolia only
    const fetchQCData = async () => {
        setLoading(true)
        try {
            const searchParams: InventorySearchParams = {
                query: searchValue,
                filters: {
                    kamId: [selectedKAM],
                    stage: getStageFilters(),
                    assetType: selectedAssetType && selectedAssetType.length > 0 ? selectedAssetType : undefined,
                },
                page: currentPage,
                hitsPerPage: ITEMS_PER_PAGE,
                sortBy: selectedSort,
            }

            const response: InventorySearchResponse = await searchInventory(searchParams)

            const transformedData = transformAlgoliaData(response.hits)
            setQcData(transformedData)
            setTotalHits(response.nbHits)
            setTotalPages(response.nbPages)
        } catch (error) {
            console.error('Error fetching QC data from Algolia:', error)
            // Set empty data on error instead of using dummy data
            setQcData([])
            setTotalHits(0)
            setTotalPages(0)
        } finally {
            setLoading(false)
        }
    }

    // Removed dummy data fallback function

    // Fetch counts for each tab from Algolia only
    const fetchTabCounts = async () => {
        try {
            const [kamResponse, dataResponse, notApprovedResponse] = await Promise.all([
                searchInventory({
                    query: '',
                    filters: {
                        kamId: [DEFAULT_KAM_ID],
                        stage: ['kam'],
                    },
                    hitsPerPage: 0,
                }),
                searchInventory({
                    query: '',
                    filters: {
                        kamId: [DEFAULT_KAM_ID],
                        stage: ['dataTeam'],
                    },
                    hitsPerPage: 0,
                }),
                searchInventory({
                    query: '',
                    filters: {
                        kamId: [DEFAULT_KAM_ID],
                        stage: ['kam', 'dataTeam'],
                        KamStatus: ['rejected'],
                    },
                    hitsPerPage: 0,
                }),
            ])

            setKamCounts({
                kam: kamResponse.nbHits,
                data: dataResponse.nbHits,
                notApproved: notApprovedResponse.nbHits,
            })
        } catch (error) {
            console.error('Error fetching tab counts:', error)
            // Set zero counts on error instead of using dummy data
            setKamCounts({
                kam: 0,
                data: 0,
                notApproved: 0,
            })
        }
    }

    // Fetch facets for dropdown options
    const fetchFacets = async () => {
        try {
            const facetsData = await getInventoryFacets()

            console.log('filete data', facetsData)
            setFacets(facetsData)
        } catch (error) {
            console.error('Error fetching facets:', error)
        }
    }

    // Initial data fetch
    useEffect(() => {
        fetchTabCounts()
        fetchFacets()
    }, [])

    // Immediate data fetch when filters change (no debounce)
    useEffect(() => {
        fetchQCData()
    }, [activeTab, searchValue, selectedKAM, selectedSort, selectedAssetType, currentPage])

    // Reset to first page when changing tabs or filters
    useEffect(() => {
        setCurrentPage(0)
    }, [activeTab, searchValue, selectedKAM, selectedSort, selectedAssetType])

    // Generate dropdown options from facets
    const kamOptions = [
        { label: 'All KAMs', value: '' },
        ...(facets.kamId || []).map((facet) => ({
            label: `${facet.value} (${facet.count})`,
            value: facet.value,
        })),
    ]

    const sortOptions = [
        { label: 'Sort by Date', value: '' },
        { label: 'Newest First', value: 'date_desc' },
        { label: 'Oldest First', value: 'date_asc' },
        { label: 'Price High to Low', value: 'price_desc' },
        { label: 'Price Low to High', value: 'price_asc' },
        { label: 'Recently Updated', value: 'updated_desc' },
    ]

    const assetTypeOptions = [
        { label: 'All Asset Types', value: '' },
        ...(facets.assetType || []).map((facet) => ({
            label: `${facet.value} (${facet.count})`,
            value: facet.value.toLowerCase(),
        })),
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
                            navigate(`/acn/qc/${row.propertyId}/details`)
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
        ...getBaseColumns().slice(0, -2), // Remove micromarket and actions columns temporarily
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

    // Calculate metrics from current data
    const QCMetrics = [
        { label: 'Total Leads', value: totalHits },
        { label: 'Total Properties', value: totalHits },
    ]

    return (
        <Layout loading={loading}>
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
                            <button
                                className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors'
                                onClick={() => {
                                    setSearchValue('')
                                    setSelectedKAM('')
                                    setSelectedSort('')
                                    setSelectedAssetType([])
                                    setCurrentPage(0)
                                }}
                                title='Reset Filters'
                            >
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
                                    Kam Review ({kamCounts.kam})
                                </button>
                                <button
                                    onClick={() => setActiveTab('data')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'data'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Data Review ({kamCounts.data})
                                </button>
                                <button
                                    onClick={() => setActiveTab('notApproved')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'notApproved'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Not Approved ({kamCounts.notApproved})
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
                                onSelect={(value) => setSelectedAssetType([value])}
                                defaultValue={selectedAssetType[0]}
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
                                data={qcData}
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
                                Showing {currentPage * ITEMS_PER_PAGE + 1} to{' '}
                                {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalHits)} of {totalHits} properties
                            </div>

                            <div className='flex items-center gap-2'>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
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

                                {Array.from({ length: totalPages }, (_, i) => i)
                                    .filter((page) => {
                                        return (
                                            page === 0 ||
                                            page === totalPages - 1 ||
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
                                                    {page + 1}
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
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
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

export default QCDashboardPage
