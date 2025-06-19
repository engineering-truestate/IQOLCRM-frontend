'use client'

import React from 'react'
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import type { RestackResaleProperty } from '../../../data_types/restack/restack-resale.d'
import { get99AcresResaleData, getMagicBricksResaleData } from '../../../services/restack/resaleService'

const ResalePage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [paginatedData, setPaginatedData] = useState<RestackResaleProperty[]>([])
    const [filteredData, setFilteredData] = useState<RestackResaleProperty[]>([])
    const [listedByFilter, setListedByFilter] = useState<'All' | 'Owner' | 'Broker'>('All')
    const [loading] = useState(false)

    const { type } = useParams()
    const resaleType = type
    console.log('Resale Type:', resaleType)

    // Items per page
    const ITEMS_PER_PAGE = 15

    const [properties, setProperties] = useState<RestackResaleProperty[]>([])

    useEffect(() => {
        const fetchData = async () => {
            let data: RestackResaleProperty[] = []
            switch (resaleType) {
                case '99acres':
                    data = await get99AcresResaleData()
                    break
                case 'magicbricks':
                    data = await getMagicBricksResaleData()
                    break
                default:
                    console.error('Invalid resale type:', resaleType)
                    return
            }
            setProperties(data)
        }

        fetchData()
    }, [resaleType])

    // Filter data based on search and listedBy filter
    useEffect(() => {
        let filtered = properties

        // Apply search filter
        if (searchValue.trim() !== '') {
            filtered = filtered.filter(
                (property) =>
                    property.projectName.toLowerCase().includes(searchValue.toLowerCase()) ||
                    property.propertyId.toLowerCase().includes(searchValue.toLowerCase()) ||
                    property.propertyType.toLowerCase().includes(searchValue.toLowerCase()) ||
                    property.status.toLowerCase().includes(searchValue.toLowerCase()) ||
                    property.developer.toLowerCase().includes(searchValue.toLowerCase()),
            )
        }

        // Apply listedBy filter (This filter is not applicable to the new schema)
        // if (listedByFilter !== 'All') {
        //     filtered = filtered.filter((property) => property.listedBy === listedByFilter)
        // }

        setFilteredData(filtered)
        setCurrentPage(1) // Reset to first page when filtering
    }, [searchValue, listedByFilter, properties])

    // Calculate total pages
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

    // Update paginated data when page changes or filtered data changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        setPaginatedData(filteredData.slice(startIndex, endIndex))
    }, [currentPage, filteredData])

    // Handle filter button clicks
    const handleFilterClick = (filterType: 'All' | 'Owner' | 'Broker') => {
        setListedByFilter(filterType)
    }

    // Table columns configuration
    const columns: TableColumn[] = [
        {
            key: 'projectName',
            header: 'Project Name',
            render: (value) => <span className='whitespace-nowrap text-sm font-medium text-gray-900'>{value}</span>,
        },
        {
            key: 'propertyId',
            header: 'Property ID',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-800'>{value}</span>,
        },
        {
            key: 'propertyType',
            header: 'Property Type',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-800'>{value}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-800'>{value?.toLowerCase()}</span>,
        },
        {
            key: 'developer',
            header: 'Developer',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-800'>{value}</span>,
        },
        {
            key: 'action',
            header: 'View Details',
            render: (_, row) => (
                <button
                    className='bg-black text-white text-xs font-medium px-3 py-1 rounded transition-colors hover:bg-gray-800'
                    onClick={() => navigate(`/restack/resale/${row.propertyId}/details`)}
                >
                    View Details
                </button>
            ),
        },
    ]

    return (
        <Layout loading={loading}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-2'>
                        <div className='flex items-center justify-between mb-4'>
                            <h1 className='text-xl font-semibold text-gray-900'>Resale /{type}</h1>
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
                                        placeholder='Search here'
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className='h-8'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className='flex items-center gap-3 mb-4'>
                            <button
                                onClick={() => handleFilterClick('Owner')}
                                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                                    listedByFilter === 'Owner'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Listed by Owner
                            </button>
                            <button
                                onClick={() => handleFilterClick('Broker')}
                                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                                    listedByFilter === 'Broker'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Listed by Broker
                            </button>
                            {(listedByFilter === 'Owner' || listedByFilter === 'Broker') && (
                                <button
                                    onClick={() => handleFilterClick('All')}
                                    className='px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors'
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    </div>
                    <hr className='border-gray-200 mb-4 w-full' />

                    {/* Table with vertical scrolling */}
                    <div className='bg-white rounded-lg overflow-hidden'>
                        <div className='h-[80vh] overflow-y-auto'>
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
                                maxHeight='80vh'
                                className='rounded-lg'
                                stickyHeader={true}
                            />
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className='flex items-center justify-between py-4 px-6 border-t border-gray-200'>
                                <div className='text-sm text-gray-500 font-medium'>
                                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of{' '}
                                    {filteredData.length} properties
                                    {searchValue && ` (filtered from ${properties.length} total properties)`}
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
                        )}
                    </div>

                    {/* Empty state */}
                    {!loading && filteredData.length === 0 && (
                        <div className='text-center py-12'>
                            <svg
                                className='mx-auto h-12 w-12 text-gray-400'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                                />
                            </svg>
                            <h3 className='mt-2 text-sm font-medium text-gray-900'>No properties found</h3>
                            <p className='mt-1 text-sm text-gray-500'>Try adjusting your search or filter criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default ResalePage
