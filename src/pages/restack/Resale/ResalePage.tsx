'use client'

import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import type { RestackResaleProperty } from '../../../data_types/restack/restack-resale.d'
import {
    get99AcresResaleData,
    getACNResaleData,
    getHousingResaleData,
    getMagicBricksResaleData,
    getMyGateResaleData,
} from '../../../services/restack/resaleService'
import Dropdown from '../../../components/design-elements/Dropdown'
import Breadcrumb from '../../../components/acn/Breadcrumb'
import CustomPagination from '../../../components/design-elements/CustomPagination'

const ResalePage = () => {
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
    const ITEMS_PER_PAGE = 50

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
                case 'ACN':
                    data = await getACNResaleData()
                    break
                case 'myGate':
                    data = await getMyGateResaleData()
                    break
                case 'Housing':
                    data = await getHousingResaleData()
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
                    property.developerName.toLowerCase().includes(searchValue.toLowerCase()),
            )
        }

        if (listedByFilter !== 'All') {
            filtered = filtered.filter((property) => property.postedBy === listedByFilter)
        }

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
            key: 'developerName',
            header: 'Developer',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-800'>{value}</span>,
        },
        {
            key: 'action',
            header: 'View Details',
            render: (_, row) => (
                <button
                    className='bg-black text-white text-xs font-medium px-3 py-1 rounded transition-colors hover:bg-gray-800'
                    onClick={() => navigate(`/restack/resale/${resaleType}/${row.propertyId}/details`)}
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
                        <div className='flex items-center justify-between mb-2'>
                            <div>
                                <h1 className='text-xl font-semibold text-gray-900'>
                                    {type} Properties ({properties.length})
                                </h1>
                                <Breadcrumb link={'/restack/resale'} parent={'Resale'} child={type as string} />
                            </div>
                            <div className='flex items-center gap-4'>
                                <Dropdown
                                    defaultValue=''
                                    placeholder='Select Status'
                                    options={[
                                        { label: 'All', value: 'All' },
                                        { label: 'Ready to Move', value: 'ready to move' },
                                    ]}
                                    onSelect={(value: string) => handleFilterClick(value as 'Owner' | 'Broker')}
                                    triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    menuClassName='absolute z-50 mt-1 top-7 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                    optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                                />
                                <Dropdown
                                    defaultValue=''
                                    placeholder='Listed by'
                                    options={[
                                        { label: 'All', value: 'All' },
                                        { label: 'Listed by Owner', value: 'Owner' },
                                        { label: 'Listed by Broker', value: 'Broker' },
                                    ]}
                                    onSelect={(value: string) => handleFilterClick(value as 'Owner' | 'Broker')}
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

                        <div className='flex items-center justify-center flex-shrink-0'>
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(value) => setCurrentPage(value)}
                            />
                        </div>
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
