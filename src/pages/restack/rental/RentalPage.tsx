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
import Button from '../../../components/design-elements/Button'
import resetic from '/icons/acn/rotate-left.svg'

const RentalPage = () => {
    const [searchValue, setSearchValue] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedListedBy, setSelectedListedBy] = useState('all')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [selectedAssetType, setSelectedAssetType] = useState('all')
    const navigate = useNavigate()
    const dispatch = useDispatch<any>()

    const properties: RentalProperty[] = rentalPropertiesDummyData
    const loading = false
    const error = null

    const ITEMS_PER_PAGE = 20

    const [filteredProperties, setFilteredProperties] = useState<RentalProperty[]>([])
    const [paginatedProperties, setPaginatedProperties] = useState<RentalProperty[]>([])

    useEffect(() => {
        //dispatch(fetchPostReraProperties(undefined))
    }, [dispatch])

    useEffect(() => {
        const filtered = properties.filter((project) => {
            const matchesSearch =
                project.projectName.toLowerCase().includes(searchValue.toLowerCase()) ||
                project.projectName.toLowerCase().includes(searchValue.toLowerCase()) ||
                project.propertyType.toLowerCase().includes(searchValue.toLowerCase())

            const matchesStatus = selectedStatus === 'all' || project.listingStatus === selectedStatus
            const matchesAssetType =
                selectedAssetType === 'all' || project.propertyType.toLowerCase() === selectedAssetType.toLowerCase()
            const matchesListedBy = selectedListedBy === 'all' || project.listedBy === selectedListedBy

            return matchesSearch && matchesStatus && matchesAssetType && matchesListedBy
        })

        setFilteredProperties(filtered)
        setCurrentPage(1)
    }, [searchValue, properties, selectedStatus, selectedAssetType, selectedListedBy])

    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const slicedProperties = filteredProperties.slice(startIndex, endIndex)
        setPaginatedProperties(slicedProperties)
    }, [currentPage, filteredProperties])

    const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)

    const uniqueListedBy = ['all', ...Array.from(new Set(properties.map((p) => p.listedBy)))]
    // Get unique values for filters
    const uniqueStatuses = ['all', ...Array.from(new Set(properties.map((p) => p.listingStatus || 'apartment')))]
    const uniqueAssetTypes = ['all', ...Array.from(new Set(properties.map((p) => p.propertyType)))]

    const columns: TableColumn[] = [
        {
            key: 'projectName',
            header: 'Project Name',
            render: (value: string, row: RentalProperty) => (
                <span
                    className='whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600'
                    onClick={() => navigate(`/restack/rental/${row.propertyId}/details`)}
                >
                    {value}
                </span>
            ),
        },
        {
            key: 'propertyId',
            header: 'Project ID',
            render: (value: string) => <span className='whitespace-nowrap text-sm text-blue-600'>{value}</span>,
        },
        {
            key: 'propertyType',
            header: 'Asset Type',
            render: (value: string) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
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
                <span className='whitespace-nowrap text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded'>
                    {value || 'apartment'}
                </span>
            ),
        },
        // {
        //     key: 'listedBy',
        //     header: 'Listed By',
        //     render: (value: string) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        // },
        {
            key: 'actions',
            header: 'View Details',
            render: (value: any, row: RentalProperty) => (
                <button
                    onClick={() => navigate(`/restack/rental/${row.propertyId}/details`)}
                    className='bg-black text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-800 transition-colors'
                >
                    View Details
                </button>
            ),
        },
    ]

    return (
        <Layout loading={loading}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-6 px-6 bg-gray-50 min-h-screen'>
                    {/* Header */}
                    <div className='mb-6'>
                        <div className='flex gap-6 mb-4'>
                            {/* Search Bar */}
                            <div className='flex mb-4  w-1/2'>
                                <div className='w-full'>
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
                                        className='h-10 w-full'
                                    />
                                </div>
                            </div>

                            {/* Filter Tabs */}

                            <Button
                                className='h-10'
                                onClick={() => setSelectedListedBy('Owner')}
                                textColor='text-[#0A0B0A]'
                                bgColor='bg-[#F3F3F3]'
                                borderColor='[#0A0B0A]'
                            >
                                Listed by Owner
                            </Button>
                            <Button
                                className='h-10'
                                textColor='text-[#0A0B0A]'
                                bgColor='bg-[#F3F3F3]'
                                borderColor='[#0A0B0A]'
                                onClick={() => setSelectedListedBy('Broker')}
                            >
                                Listed by Broker
                            </Button>

                            {selectedListedBy != 'all' && (
                                <button
                                    className='p-1 text-[#0A0B0A] h-10 cursor-pointer bg-[#F3F3F3] rounded-[8px] border border-[#0A0B0A]'
                                    onClick={() => {
                                        setSelectedListedBy('all')
                                        setSelectedStatus('all')
                                        setSelectedAssetType('all')
                                        setSearchValue('')
                                    }}
                                    title='Reset Filters'
                                >
                                    <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                        <div className='max-h-[70vh] overflow-y-auto'>
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
                                maxHeight='70vh'
                                className='rounded-lg'
                                stickyHeader={true}
                            />
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className='flex items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50'>
                                <div className='text-sm text-gray-500 font-medium'>
                                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredProperties.length)} of{' '}
                                    {filteredProperties.length} projects
                                    {searchValue && ` (filtered from ${properties.length} total projects)`}
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
                </div>
            </div>
        </Layout>
    )
}

export default RentalPage
