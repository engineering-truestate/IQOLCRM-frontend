'use client'

import { useState, useEffect } from 'react'
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

import Dropdown from '../../../components/design-elements/Dropdown'
import CustomPagination from '../../../components/design-elements/CustomPagination'

const PrimaryPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { properties, loading, filter } = useSelector((state: RootState) => state.primaryProperties)
    const [searchValue, setSearchValue] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const navigate = useNavigate()
    const ITEMS_PER_PAGE = 50

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
                case 'new project launch':
                    return 'bg-green-100 text-green-800'
                case 'ongoing':
                    return 'bg-blue-100 text-blue-800'
                case 'completed':
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
            render: (value) => (
                <span className='block max-w-60 truncate text-sm font-semibold text-gray-900'>{value}</span>
            ),
        },
        {
            key: 'reraId',
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
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
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
            fixed: true,
            fixedPosition: 'right',
            render: (_, row) => (
                <button
                    className='bg-black text-white w-25 text-xs font-medium px-3 py-1 rounded transition-colors hover:bg-gray-800'
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
            <div className='w-full h-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-2'>
                        <div className='flex items-center justify-between mb-4'>
                            <h1 className='text-xl font-semibold text-gray-900'>Primary ({properties.length})</h1>
                            <div className='flex items-center gap-4'>
                                {/* <SortFilter /> */}
                                <Dropdown
                                    options={[
                                        { label: 'All', value: '' },
                                        { label: 'New Project Launch', value: 'New Project Launch' },
                                        { label: 'Ongoing', value: 'Ongoing' },
                                        { label: 'Completed', value: 'Completed' },
                                        // {label:'On-hold',value:'On-hold'}
                                    ]}
                                    placeholder='Select Project Status'
                                    onSelect={(value: string | null) => dispatch(setFilter(value))}
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
                        <div className='flex items-center justify-center flex-shrink-0'>
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(value) => setCurrentPage(value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PrimaryPage
