'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../../components/design-elements/FlexibleTable'

import StateBaseTextField from '../../../../components/design-elements/StateBaseTextField'
import usePreRera from '../../../../hooks/restack/usePreRera'
import { formatUnixDate } from '../../../../components/helper/getUnixDateTime'
import type { PreReraProperty } from '../../../../store/reducers/restack/preReraTypes'

const PreReraPage = () => {
    const [searchValue, setSearchValue] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const navigate = useNavigate()

    const { properties, loading, fetchProperties } = usePreRera()

    const ITEMS_PER_PAGE = 50

    const [filteredProperties, setFilteredProperties] = useState<PreReraProperty[]>([])
    const [paginatedProperties, setPaginatedProperties] = useState<PreReraProperty[]>([])

    useEffect(() => {
        fetchProperties()
    }, [fetchProperties])

    useEffect(() => {
        const filtered = properties.filter(
            (project) =>
                project.projectName.toLowerCase().includes(searchValue.toLowerCase()) ||
                project.projectType.toLowerCase().includes(searchValue.toLowerCase()),
        )
        setFilteredProperties(filtered)
        setCurrentPage(1)
    }, [searchValue, properties])

    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const slicedProperties = filteredProperties.slice(startIndex, endIndex)
        setPaginatedProperties(slicedProperties)
    }, [currentPage, filteredProperties])

    const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)

    const columns: TableColumn[] = [
        {
            key: 'projectName',
            header: 'Project Name',
            render: (value, row) => (
                <span
                    className='whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer'
                    onClick={() => navigate(`/restack/stock/pre-rera/${row.projectId}/details`)}
                >
                    {value}
                </span>
            ),
        },
        {
            key: 'startDate',
            header: 'Project Start Date',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{formatUnixDate(value)}</span>,
        },
        {
            key: 'handoverDate',
            header: 'Project Completion Date',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{formatUnixDate(value)}</span>,
        },
        {
            key: 'projectType',
            header: 'Project Type',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'ageOfBuildinginYears',
            header: 'Age of the Building',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
    ]

    return (
        <Layout loading={loading}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-2'>
                        <div className='flex items-center justify-between mb-4'>
                            <h1 className='text-xl font-semibold text-gray-900'>Stock</h1>
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
                                {/* <Button
                                    bgColor='bg-gray-200'
                                    textColor='text-gray-600'
                                    className='px-6 h-8 font-medium transition-colors'
                                    onClick={handleAddProject}
                                >
                                    Add
                                </Button> */}
                            </div>
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
                            <h3 className='mt-2 text-sm font-medium text-gray-900'>No stock projects found</h3>
                            <p className='mt-1 text-sm text-gray-500'>
                                {searchValue
                                    ? 'Try adjusting your search criteria.'
                                    : 'Get started by adding a new stock project.'}
                            </p>
                            {/* {!searchValue && (
                                <div className='mt-6'>
                                    <Button
                                        bgColor='bg-blue-600'
                                        textColor='text-white'
                                        className='px-4 py-2 font-medium transition-colors hover:bg-blue-700'
                                        onClick={handleAddProject}
                                    >
                                        Add Stock Project
                                    </Button>
                                </div>
                            )} */}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default PreReraPage
