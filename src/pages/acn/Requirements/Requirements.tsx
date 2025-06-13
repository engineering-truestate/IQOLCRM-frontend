'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import { generateRequirements, type RequirementData } from '../../dummy_data/acn_requirements_dummy_data'
import resetic from '/icons/acn/rotate-left.svg'
import leadaddic from '/icons/acn/user-add.svg'

const RequirementsPage = () => {
    const [searchValue, setSearchValue] = useState('')
    const [activeTab, setActiveTab] = useState('resale')
    const [selectedRequirementStatus, setSelectedRequirementStatus] = useState('')
    const [selectedAssetType, setSelectedAssetType] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [paginatedData, setPaginatedData] = useState<RequirementData[]>([])
    const [filteredData, setFilteredData] = useState<RequirementData[]>([])
    const navigate = useNavigate()

    // Items per page
    const ITEMS_PER_PAGE = 50

    // Use imported data generation function
    const [requirementsData, setRequirementsData] = useState<RequirementData[]>(generateRequirements())

    // Filter data based on active tab
    useEffect(() => {
        const filtered = requirementsData.filter((item) => item.type === activeTab)
        setFilteredData(filtered)
        setCurrentPage(1) // Reset to first page when tab changes
    }, [activeTab, requirementsData])

    // Calculate total pages based on filtered data
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

    // Update paginated data when page changes or filtered data changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        setPaginatedData(filteredData.slice(startIndex, endIndex))
    }, [currentPage, filteredData])

    // Helper function to update a specific row's data
    const updateRowData = (rowId: string, field: keyof RequirementData, value: string) => {
        setRequirementsData((prevData) =>
            prevData.map((row) => (row.reqId === rowId ? { ...row, [field]: value } : row)),
        )
    }

    const requirementStatusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Open', value: 'open' },
        { label: 'Close', value: 'close' },
    ]

    const assetTypeOptions = [
        { label: 'All Types', value: '' },
        { label: 'Apartment', value: 'apartment' },
        { label: 'Villa', value: 'villa' },
        { label: 'Townhouse', value: 'townhouse' },
        { label: 'Studio', value: 'studio' },
        { label: 'Penthouse', value: 'penthouse' },
    ]

    // Enhanced status dropdown options with colors
    const statusDropdownOptions: DropdownOption[] = [
        {
            label: 'Open',
            value: 'Open',
            color: '#E1F6DF', // Light green background
            textColor: '#065F46', // Dark green text
        },
        {
            label: 'Close',
            value: 'Close',
            color: '#FEECED', // Light red background
            textColor: '#991B1B', // Dark red text
        },
    ]

    const internalStatusDropdownOptions: DropdownOption[] = [
        {
            label: 'Found',
            value: 'Found',
            color: '#E1F6DF', // Light green background
            textColor: '#065F46', // Dark green text
        },
        {
            label: 'Not Found',
            value: 'Not Found',
            color: '#FEECED', // Light red background
            textColor: '#991B1B', // Dark red text
        },
        {
            label: 'Pending',
            value: 'Pending',
            color: '#F5F5F5', // Light gray background
            textColor: '#374151', // Dark gray text
        },
    ]

    // Table columns configuration with all fields and fixed actions column
    const columns: TableColumn[] = [
        {
            key: 'reqId',
            header: 'Req ID',
            render: (value, row) => (
                <span
                    onClick={() => navigate(`/acn/requirements/${row.reqId}/details`)}
                    className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'
                >
                    {value}
                </span>
            ),
        },
        {
            key: 'projectName',
            header: 'Project Name/Location',
            render: (value, row) => (
                <div className='relative group'>
                    <span
                        onClick={() => navigate(`/acn/requirements/${row.reqId}/details`)}
                        className='block max-w-70 truncate text-black hover:text-blue-800 text-sm font-semibold cursor-pointer transition-colors'
                        title={value}
                    >
                        {value}
                    </span>
                    {/* Tooltip */}
                    <div className='absolute left-0 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal max-w-xs break-words'>
                        {value}
                    </div>
                </div>
            ),
        },
        {
            key: 'assetType',
            header: 'Asset type',
            render: (value) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
            ),
        },
        {
            key: 'budget',
            header: 'Budget',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            dropdown: {
                options: statusDropdownOptions,
                placeholder: 'Select Status',
                onChange: (value, row) => {
                    updateRowData(row.reqId, 'status', value)
                    console.log('Requirement status changed:', value, row)
                },
            },
        },
        {
            key: 'intStatus',
            header: 'Int. Status',
            dropdown: {
                options: internalStatusDropdownOptions,
                placeholder: 'Select Status',
                onChange: (value, row) => {
                    updateRowData(row.reqId, 'intStatus', value)
                    console.log('Internal status changed:', value, row)
                },
            },
        },
        {
            key: 'lastUpdated',
            header: 'Last Updated',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'agentName',
            header: 'Agent Name',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'agentNumber',
            header: 'Agent Number',
            render: (value) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            fixed: true,
            fixedPosition: 'right',
            render: (_, row) => (
                <div className='flex items-center gap-1 whitespace-nowrap w-auto'>
                    <span onClick={() => navigate(`/acn/requirements/${row.reqId}/details`)}>
                        <Button
                            bgColor='bg-[#F3F3F3]'
                            textColor='text-[#3A3A47]'
                            className='px-4 h-8 font-semibold'
                            // you can omit onClick since <a> handles navigation
                        >
                            View Details
                        </Button>
                    </span>
                </div>
            ),
        },
    ]

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-2 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-4'>
                        <div className='flex items-center justify-between mb-2'>
                            <h1 className='text-lg font-semibold text-black'>Requirement</h1>
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
                                <Button
                                    leftIcon={<img src={leadaddic} alt='Add Requirement Icon' className='w-5 h-5' />}
                                    bgColor='bg-[#F3F3F3]'
                                    textColor='text-[#3A3A47]'
                                    className='px-4 h-8 font-semibold'
                                    onClick={() => {}}
                                >
                                    Add Requirement
                                </Button>
                            </div>
                        </div>
                        <hr className='border-gray-200 mb-4' />
                        {/* Tab Switches and Filters */}
                        <div className='flex items-center gap-4 mb-2'>
                            {/* Tab Switches for Resale/Rental */}
                            <div className='flex items-center bg-gray-100 rounded-md p-1 h-8'>
                                <button
                                    onClick={() => setActiveTab('resale')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'resale'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Resale
                                </button>
                                <button
                                    onClick={() => setActiveTab('rental')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'rental'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Rental
                                </button>
                            </div>

                            {/* Other Filters */}
                            <div className='flex items-center gap-2 h-8'>
                                <button className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md'>
                                    <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                                </button>

                                <Dropdown
                                    options={requirementStatusOptions}
                                    onSelect={setSelectedRequirementStatus}
                                    defaultValue={selectedRequirementStatus}
                                    placeholder='Requirement Status'
                                    className='relative inline-block'
                                    triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer'
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                />

                                <Dropdown
                                    options={assetTypeOptions}
                                    onSelect={setSelectedAssetType}
                                    defaultValue={selectedAssetType}
                                    placeholder='Asset Type'
                                    className='relative inline-block'
                                    triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table with fixed actions column and vertical scrolling */}
                    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                        <div className='h-[75vh] overflow-y-auto'>
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
                                maxHeight='75vh'
                                className='rounded-lg'
                                stickyHeader={true}
                            />
                        </div>

                        {/* Pagination */}
                        <div className='flex items-center justify-between py-4 px-6 border-t border-gray-200'>
                            <div className='text-sm text-gray-500 font-medium'>
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                                {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length}{' '}
                                requirements
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
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default RequirementsPage
