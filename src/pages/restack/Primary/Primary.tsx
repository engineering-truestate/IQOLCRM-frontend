'use client'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import { sampleRERAProjects, generateRERAProjects, type RERAProject } from '../../dummy_data/restack_primary_dummy_data'

const PrimaryPage = () => {
    const [searchValue, setSearchValue] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [paginatedData, setPaginatedData] = useState<RERAProject[]>([])
    const [filteredData, setFilteredData] = useState<RERAProject[]>([])
    const navigate = useNavigate()
    // Items per page
    const ITEMS_PER_PAGE = 50

    // Initialize projects data
    const [projectsData, setProjectsData] = useState<RERAProject[]>(() => {
        // Use sample data that matches the image, then add more generated data
        const additionalProjects = generateRERAProjects(50)
        return [...sampleRERAProjects, ...additionalProjects]
    })

    // Filter data based on search
    useEffect(() => {
        if (searchValue.trim() === '') {
            setFilteredData(projectsData)
        } else {
            const filtered = projectsData.filter(
                (project) =>
                    project.projectName.toLowerCase().includes(searchValue.toLowerCase()) ||
                    project.status.toLowerCase().includes(searchValue.toLowerCase()) ||
                    project.district.toLowerCase().includes(searchValue.toLowerCase()) ||
                    project.projectType.toLowerCase().includes(searchValue.toLowerCase()) ||
                    project.registrationNumber.toLowerCase().includes(searchValue.toLowerCase()),
            )
            setFilteredData(filtered)
        }
        setCurrentPage(1) // Reset to first page when searching
    }, [searchValue, projectsData])

    // Calculate total pages
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

    // Update paginated data when page changes or filtered data changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        setPaginatedData(filteredData.slice(startIndex, endIndex))
    }, [currentPage, filteredData])

    // Status badge component
    const StatusBadge = ({ status }: { status: string }) => {
        const getStatusColor = (status: string) => {
            switch (status.toLowerCase()) {
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
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                {status}
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
            key: 'registrationNumber',
            header: 'Registration Number',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600 font-mono'>{value}</span>,
        },
        {
            key: 'district',
            header: 'District',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: (value) => <StatusBadge status={value} />,
        },
        {
            key: 'projectStartDate',
            header: 'Project Start Date',
            render: (value) => (
                <span className='whitespace-nowrap text-sm text-gray-600'>
                    {new Date(value).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    })}
                </span>
            ),
        },
        {
            key: 'proposedCompletionDate',
            header: 'Proposed Completion Date',
            render: (value) => (
                <span className='whitespace-nowrap text-sm text-gray-600'>
                    {new Date(value).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    })}
                </span>
            ),
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
                    className='text-gray-900 text-sm font-medium transition-colors'
                    onClick={() => navigate(`/restack/primary/${row.id}`)}
                >
                    View Details
                </button>
            ),
        },
    ]

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-2'>
                        <div className='flex items-center justify-between mb-4'>
                            <h1 className='text-xl font-semibold text-gray-900'>Primary</h1>
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
                                    {filteredData.length} projects
                                    {searchValue && ` (filtered from ${projectsData.length} total projects)`}
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
                                            // Show first page, last page, current page, and pages around current page
                                            return (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            )
                                        })
                                        .map((page, index, array) => {
                                            // Add ellipsis between non-consecutive pages
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
