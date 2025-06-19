'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { rentalPropertiesDummyData } from '../../dummy_data/restack_rental_dummy_data'
import type { RentalProperty } from '../../../data_types/restack/restack-rental'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Layout from '../../../layout/Layout'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'

const RentalPage = () => {
    const [searchValue, setSearchValue] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedListedBy, setSelectedListedBy] = useState<'All' | 'Owner' | 'Broker'>('All')
    const navigate = useNavigate()
    const dispatch = useDispatch<any>()

    const properties: RentalProperty[] = rentalPropertiesDummyData
    const loading = false

    const ITEMS_PER_PAGE = 15

    const [filteredProperties, setFilteredProperties] = useState<RentalProperty[]>([])
    const [paginatedProperties, setPaginatedProperties] = useState<RentalProperty[]>([])

    useEffect(() => {
        //dispatch(fetchPostReraProperties(undefined))
    }, [dispatch])

    useEffect(() => {
        let filtered = properties

        // Apply search filter
        if (searchValue.trim() !== '') {
            filtered = filtered.filter(
                (property) =>
                    property.projectName.toLowerCase().includes(searchValue.toLowerCase()) ||
                    property.propertyId.toLowerCase().includes(searchValue.toLowerCase()) ||
                    property.propertyType.toLowerCase().includes(searchValue.toLowerCase()) ||
                    property.listingStatus?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    property.listedBy.toLowerCase().includes(searchValue.toLowerCase()),
            )
        }

        // Apply listedBy filter
        if (selectedListedBy !== 'All') {
            filtered = filtered.filter((property) => property.listedBy === selectedListedBy)
        }

        setFilteredProperties(filtered)
        setCurrentPage(1)
    }, [searchValue, properties, selectedListedBy])

    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const slicedProperties = filteredProperties.slice(startIndex, endIndex)
        setPaginatedProperties(slicedProperties)
    }, [currentPage, filteredProperties])

    const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)

    // Handle filter button clicks
    const handleFilterClick = (filterType: 'All' | 'Owner' | 'Broker') => {
        setSelectedListedBy(filterType)
    }

    const columns: TableColumn[] = [
        {
            key: 'projectName',
            header: 'Project Name',
            render: (value: string, row: RentalProperty) => (
                <span className='whitespace-nowrap text-sm font-medium text-gray-900'>{value}</span>
            ),
        },
        {
            key: 'propertyId',
            header: 'Project ID',
            render: (value: string) => <span className='whitespace-nowrap text-sm text-gray-800'>{value}</span>,
        },
        {
            key: 'propertyType',
            header: 'Asset Type',
            render: (value: string) => <span className='whitespace-nowrap text-sm text-gray-800'>{value}</span>,
        },
        {
            key: 'postedOn',
            header: 'Inventory Date',
            render: (value: number) => (
                <span className='whitespace-nowrap text-sm text-gray-600'>{formatUnixDate(value)}</span>
            ),
        },
        {
            key: 'listingStatus',
            header: 'Status',
            render: (value: string) => (
                <span className='whitespace-nowrap text-sm text-gray-800'>{(value || 'apartment').toLowerCase()}</span>
            ),
        },
        {
            key: 'actions',
            header: 'View Details',
            render: (value: any, row: RentalProperty) => (
                <button
                    onClick={() => navigate(`/restack/rental/${row.propertyId}/details`)}
                    className='bg-black text-white text-xs font-medium px-3 py-1 rounded transition-colors hover:bg-gray-800'
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
                            <h1 className='text-xl font-semibold text-gray-900'>Rental / 99 Acres</h1>
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
                                        onChange={(e: any) => setSearchValue(e.target.value)}
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
                                    selectedListedBy === 'Owner'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Listed by Owner
                            </button>
                            <button
                                onClick={() => handleFilterClick('Broker')}
                                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                                    selectedListedBy === 'Broker'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Listed by Broker
                            </button>
                            {(selectedListedBy === 'Owner' || selectedListedBy === 'Broker') && (
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
                                data={paginatedProperties}
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
                                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredProperties.length)} of{' '}
                                    {filteredProperties.length} properties
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
                    {!loading && filteredProperties.length === 0 && (
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

export default RentalPage
