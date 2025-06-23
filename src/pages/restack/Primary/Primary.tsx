'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import { fetchPrimaryProperties } from '../../../store/actions/restack/primaryProperties'
import { setFilter } from '../../../store/reducers/restack/primaryProperties'
import type { RootState } from '../../../store'
import type { AppDispatch } from '../../../store'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'
import type { PrimaryProperty } from '../../../data_types/restack/restack-primary'
import { setSortBy } from '../../../store/reducers/restack/primaryProperties'

const PrimaryPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { properties, loading, error, filter, sortBy } = useSelector((state: RootState) => state.primaryProperties)
    const [searchValue, setSearchValue] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const navigate = useNavigate()
    const ITEMS_PER_PAGE = 50

    // SortFilter component
    const SortFilter = () => {
        const [isOpen, setIsOpen] = useState(false)
        const sortOptions = [
            { label: 'Sort', value: '' },
            { label: 'Project Name A-Z', value: 'name_asc' },
            { label: 'Project Name Z-A', value: 'name_desc' },
            { label: 'Status: Active First', value: 'status_asc' },
            { label: 'Status: Completed First', value: 'status_desc' },
            { label: 'Start Date: Newest', value: 'date_desc' },
            { label: 'Start Date: Oldest', value: 'date_asc' },
        ]

        return (
            <div className='relative inline-block'>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                >
                    <span>Sort</span>
                    <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                </button>

                {isOpen && (
                    <div className='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'>
                        {sortOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md text-gray-700`}
                                onClick={() => {
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

    // Fetch properties on component mount
    useEffect(() => {
        dispatch(fetchPrimaryProperties())
    }, [dispatch])

    // Filter data based on search
    useEffect(() => {
        dispatch(setFilter(searchValue))
        setCurrentPage(1)
    }, [searchValue, dispatch])

    // Calculate filtered and paginated data
    const filteredProperties = properties.filter((project: PrimaryProperty) =>
        filter.trim() === ''
            ? true
            : project.projectName?.toLowerCase().includes(filter.toLowerCase()) ||
              project.projectStatus?.toLowerCase().includes(filter.toLowerCase()) ||
              project.district?.toLowerCase().includes(filter.toLowerCase()) ||
              project.projectType?.toLowerCase().includes(filter.toLowerCase()) ||
              project.reraId?.toLowerCase().includes(filter.toLowerCase()),
    )

    const currentPageData = filteredProperties.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)

    // projectStatus badge component
    const StatusBadge = ({ projectStatus }: { projectStatus: string }) => {
        const getStatusColor = (projectStatus: string | undefined) => {
            if (!projectStatus) return 'bg-gray-100 text-gray-800'

            switch (projectStatus.toLowerCase()) {
                case 'active':
                    return 'bg-green-100 text-green-800'
                case 'completed':
                    return 'bg-blue-100 text-blue-800'
                case 'planning':
                    return 'bg-yellow-100 text-yellow-800'
                default:
                    return 'bg-gray-100 text-gray-800'
            }
        }

        return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(projectStatus)}`}>
                {toCapitalizedWords(projectStatus) || 'N/A'}
            </span>
        )
    }

    // Table columns configuration
    const columns: TableColumn[] = [
        {
            key: 'projectName',
            header: 'Project Name',
            render: (value) => <span className='whitespace-nowrap text-sm font-semibold text-gray-900'>{value}</span>,
        },
        {
            key: 'reraID',
            header: 'Registration Number',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600 font-mono'>{value}</span>,
        },
        {
            key: 'district',
            header: 'District',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'projectStatus',
            header: 'Project Status',
            render: (value) => <StatusBadge projectStatus={value} />,
        },
        {
            key: 'projectStartDate',
            header: 'Project Start Date',
            render: (value) => (
                <span className='whitespace-nowrap text-sm text-gray-600'>
                    {/* {new Date(value * 1000).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    })} */}
                    {value}
                </span>
            ),
        },
        {
            key: 'handoverDate',
            header: 'Handover Date',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'projectType',
            header: 'Project Type',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'action',
            header: 'Action',
            render: (_, row) => (
                <button
                    className='text-gray-900 text-sm font-medium transition-colors hover:text-blue-600'
                    onClick={() => {
                        navigate(`/restack/primary/${row.projectId}`)
                    }}
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
                            <h1 className='text-xl font-semibold text-gray-900'>Primary</h1>
                            <div className='flex items-center gap-4'>
                                {/* <SortFilter /> */}
                                {/* <button
                                    className='px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    onClick={() => {
                                        // Add filter functionality here
                                    }}
                                >
                                    Filter
                                </button> */}
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
                    </div>
                    <hr className='border-gray-200 mb-4 w-full' />

                    {/* Table with vertical scrolling */}
                    <div className='bg-white rounded-lg overflow-hidden'>
                        <div className='h-[80vh] overflow-y-auto'>
                            <FlexibleTable
                                data={currentPageData}
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
                                    {filteredProperties.length} projects
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

export default PrimaryPage
