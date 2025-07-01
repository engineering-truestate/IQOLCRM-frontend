'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Layout from '../../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../../components/design-elements/FlexibleTable'
import StateBaseTextField from '../../../../components/design-elements/StateBaseTextField'
import { formatUnixDate } from '../../../../components/helper/getUnixDateTime'
import { fetchPostReraProperties } from '../../../../store/actions/restack/postReraActions'
import type { PostReraProperty } from '../../../../store/reducers/restack/postReraTypes'
import type { RootState } from '../../../../store'
import Dropdown from '../../../../components/design-elements/Dropdown'
import { setFilters } from '../../../../store/actions/restack/postReraActions'
import CustomPagination from '../../../../components/design-elements/CustomPagination'

const PostReraPage = () => {
    const [searchValue, setSearchValue] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const navigate = useNavigate()
    const dispatch = useDispatch<any>()

    const { properties, loading, error, filters } = useSelector((state: RootState) => state.postRera)

    const ITEMS_PER_PAGE = 50

    const [filteredProperties, setFilteredProperties] = useState<PostReraProperty[]>([])
    const [paginatedProperties, setPaginatedProperties] = useState<PostReraProperty[]>([])

    useEffect(() => {
        dispatch(fetchPostReraProperties(filters))
    }, [dispatch, filters])

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
                    onClick={() => navigate(`/restack/stock/post-rera/${row.projectId}/details`)}
                >
                    {value}
                </span>
            ),
        },
        {
            key: 'projectStartDate',
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
        {
            key: 'stockType',
            header: 'Action',
            fixed: true,
            fixedPosition: 'right',
            render: (_, row) => (
                <button
                    className='bg-black text-white w-25 text-xs font-medium px-3 py-1 rounded transition-colors hover:bg-gray-800'
                    onClick={() => {
                        navigate(`/restack/stock/${row.projectId}/details`)
                    }}
                >
                    View Details
                </button>
            ),
        },
    ]

    // const [, setShowModal] = useState(false)

    // const handleAddProject = () => {
    //     setShowModal(true)
    // }

    return (
        <Layout loading={loading}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-2'>
                        <div className='flex items-center justify-between mb-4'>
                            <h1 className='text-xl font-semibold text-gray-900'>
                                {filters?.stockType
                                    ? filters.stockType.charAt(0).toUpperCase() +
                                      filters.stockType.slice(1).replace('-', ' ')
                                    : 'Stock'}{' '}
                                ({properties.length})
                            </h1>
                            <div className='flex items-center gap-4'>
                                <Dropdown
                                    defaultValue=''
                                    placeholder='Select Stock Type'
                                    options={[
                                        { label: 'All', value: '' },
                                        { label: 'Pre-Rera', value: 'pre-rera' },
                                        { label: 'Post-Rera', value: 'post-rera' },
                                    ]}
                                    onSelect={(value) => dispatch(setFilters({ stockType: value }))}
                                    triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    menuClassName='absolute z-50 mt-1 top-7 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                    optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                                />
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
                        <div className='max-h-[80vh] overflow-y-auto'>
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

                        <div className='flex items-center justify-center flex-shrink-0'>
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(value) => setCurrentPage(value)}
                            />
                        </div>
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
                            {!searchValue && error && (
                                <div className='mt-6'>
                                    <p className='text-red-500'>{error}</p>
                                </div>
                            )}
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

export default PostReraPage
