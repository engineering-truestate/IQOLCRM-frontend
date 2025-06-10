'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import { generateProperties, type PropertyData } from '../../dummy_data/acn_properties_dummy_data'
import { generateRequirements, type RequirementData } from '../../dummy_data/acn_requirements_dummy_data'
import resetic from '/icons/acn/rotate-left.svg'
// import writeic from '/icons/acn/write.svg'
// import shareic from '/icons/acn/share.svg'

// Custom status badge component
// const StatusBadge = ({ status }: { status: string }) => {
//     const getStatusColors = () => {
//         switch (status) {
//             case 'Available':
//                 return 'bg-[#E1F6DF] text-black border-[#9DE695]'
//             case 'Sold':
//                 return 'bg-[#F5F5F5] text-black border-[#CCCBCB]'
//             case 'Hold':
//                 return 'bg-[#FFF4E6] text-black border-[#FCCE74]'
//             case 'De-Listed':
//                 return 'bg-[#FFC8B8] text-black border-[#FF8A65]'
//             default:
//                 return 'border-gray-400 text-gray-600 bg-gray-50'
//         }
//     }

//     return (
//         <span
//             className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-medium whitespace-nowrap ${getStatusColors()}`}
//         >
//             {status}
//         </span>
//     )
// }

const PropertiesSelectionPage = () => {
    const navigate = useNavigate()
    const { id } = useParams() // requirement ID

    const [searchValue, setSearchValue] = useState('')
    const [activeTab, setActiveTab] = useState('resale')
    const [selectedInventoryStatus, setSelectedInventoryStatus] = useState('')
    const [selectedKAM, setSelectedKAM] = useState('')
    const [selectedSort, setSelectedSort] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [paginatedData, setPaginatedData] = useState<PropertyData[]>([])
    const [filteredData, setFilteredData] = useState<PropertyData[]>([])
    const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())
    const [_, setRequirement] = useState<RequirementData | null>(null)

    // Items per page
    const ITEMS_PER_PAGE = 50

    // Load properties and requirement data
    const [propertiesData, setPropertiesData] = useState<PropertyData[]>([])

    useEffect(() => {
        const properties = generateProperties()
        setPropertiesData(properties)

        // Load requirement data
        if (id) {
            const allRequirements = generateRequirements()
            const foundRequirement = allRequirements.find((req) => req.reqId === id)
            if (foundRequirement) {
                setRequirement(foundRequirement)
                // Pre-select already matched properties
                setSelectedProperties(new Set(foundRequirement.matchedPropertyIds))
            }
        }
    }, [id])

    // Filter data based on active tab (for now, showing all properties)
    useEffect(() => {
        setFilteredData(propertiesData)
        setCurrentPage(1)
    }, [activeTab, propertiesData])

    // Calculate total pages based on filtered data
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

    // Update paginated data when page changes or filtered data changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        setPaginatedData(filteredData.slice(startIndex, endIndex))
    }, [currentPage, filteredData])

    // Handle property selection
    const togglePropertySelection = (propertyId: string) => {
        setSelectedProperties((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(propertyId)) {
                newSet.delete(propertyId)
            } else {
                newSet.add(propertyId)
            }
            return newSet
        })
    }

    // Handle select all
    const toggleSelectAll = () => {
        if (selectedProperties.size === paginatedData.length) {
            // Deselect all current page items
            setSelectedProperties((prev) => {
                const newSet = new Set(prev)
                paginatedData.forEach((item) => newSet.delete(item.propertyId))
                return newSet
            })
        } else {
            // Select all current page items
            setSelectedProperties((prev) => {
                const newSet = new Set(prev)
                paginatedData.forEach((item) => newSet.add(item.propertyId))
                return newSet
            })
        }
    }

    // Handle save selected properties
    const saveSelectedProperties = () => {
        // In a real app, this would make an API call to update the requirement
        console.log('Saving selected properties:', Array.from(selectedProperties))
        navigate(`/acn/requirements/${id}/details`)
    }

    // Helper function to update a specific row's data
    const updateRowData = (propertyId: string, field: keyof PropertyData, value: string) => {
        setPropertiesData((prevData) =>
            prevData.map((row) => (row.propertyId === propertyId ? { ...row, [field]: value } : row)),
        )
    }

    // Dropdown options
    const inventoryStatusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Available', value: 'available' },
        { label: 'Sold', value: 'sold' },
        { label: 'Hold', value: 'hold' },
        { label: 'De-Listed', value: 'de-listed' },
    ]

    const kamOptions = [
        { label: 'All KAMs', value: '' },
        { label: 'Samarth Jangir', value: 'samarth' },
        { label: 'Sophia Bennett', value: 'sophia' },
        { label: 'John Smith', value: 'john' },
    ]

    const sortOptions = [
        { label: 'Sort', value: '' },
        { label: 'Price: Low to High', value: 'price_asc' },
        { label: 'Price: High to Low', value: 'price_desc' },
        { label: 'Recent First', value: 'recent' },
    ]

    // Status dropdown options with colors matching the badges
    const statusDropdownOptions: DropdownOption[] = [
        {
            label: 'Available',
            value: 'Available',
            color: '#E1F6DF', // Light green background
            textColor: '#065F46', // Dark green text
        },
        {
            label: 'Sold',
            value: 'Sold',
            color: '#F5F5F5', // Light gray background
            textColor: '#374151', // Dark gray text
        },
        {
            label: 'Hold',
            value: 'Hold',
            color: '#FFF4E6', // Light yellow background
            textColor: '#92400E', // Dark yellow text
        },
        {
            label: 'De-Listed',
            value: 'De-Listed',
            color: '#FFC8B8', // Light red background
            textColor: '#991B1B', // Dark red text
        },
    ]

    // Table columns configuration
    const columns: TableColumn[] = [
        {
            key: 'checkbox',
            header: '',
            render: (_, row) => (
                <input
                    type='checkbox'
                    checked={selectedProperties.has(row.propertyId)}
                    onChange={() => togglePropertySelection(row.propertyId)}
                    className='rounded'
                />
            ),
        },
        {
            key: 'propertyId',
            header: 'Property ID',
            render: (value) => <span className='whitespace-nowrap text-gray-600 text-sm font-normal'>{value}</span>,
        },
        {
            key: 'propertyName',
            header: 'Property Name',
            render: (value) => (
                <div className='max-w-[180px] truncate text-sm font-semibold' title={value}>
                    {value}
                </div>
            ),
        },
        {
            key: 'assetType',
            header: 'Asset Type',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        {
            key: 'price',
            header: 'Price',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        {
            key: 'sbua',
            header: 'SBUA',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        {
            key: 'plotSize',
            header: 'Plot Size',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        {
            key: 'facing',
            header: 'Facing',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        {
            key: 'enquiries',
            header: 'Enquiries',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        {
            key: 'micromarket',
            header: 'Micromarket',
            render: (value) => (
                <div className='max-w-[120px] truncate text-sm font-normal' title={value}>
                    {value}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            dropdown: {
                options: statusDropdownOptions,
                placeholder: 'Select Status',
                onChange: (value, row) => {
                    updateRowData(row.propertyId, 'status', value)
                    console.log('Property status changed:', value, row)
                },
            },
        },
        {
            key: 'lastCheck',
            header: 'Last check',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        {
            key: 'agentName',
            header: 'Agent Name',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        // {
        //     key: 'actions',
        //     header: 'Actions',
        //     fixed: true,
        //     fixedPosition: 'right',
        //     render: (_, row) => (
        //         <div className='flex items-center gap-1 whitespace-nowrap w-auto'>
        //             <button
        //                 className='h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0'
        //                 onClick={() => {
        //                     //setSelectedRowData(row)
        //                     //setIsCallResultModalOpen(true)
        //                 }}
        //                 title='Call'
        //             >
        //                 <img src={writeic} alt='Phone Icon' className='w-7 h-7 flex-shrink-0' />
        //             </button>
        //             <button
        //                 className='h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0'
        //                 onClick={() => {
        //                     //setSelectedRowData(row)
        //                     //setIsNotesModalOpen(true)
        //                 }}
        //                 title='Notes'
        //             >
        //                 <img src={shareic} alt='Notes Icon' className='w-7 h-7 flex-shrink-0' />
        //             </button>
        //         </div>
        //     ),
        // },
    ]

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-2 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Breadcrumb */}
                    <div className='mb-4'>
                        <div className='text-sm text-gray-500 mb-4'>
                            <a href='/acn/requirements' className='hover:text-gray-700'>
                                Requirements
                            </a>
                            <span className='mx-2'>/</span>
                            <a href={`/acn/requirements/${id}/details`} className='hover:text-gray-700'>
                                {id}
                            </a>
                            <span className='mx-2'>/</span>
                            <span className='text-black font-medium'>Properties</span>
                        </div>

                        {/* Header */}
                        <div className='flex items-center justify-between mb-2'>
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
                            </div>
                        </div>
                        <hr className='border-gray-200 mb-4' />

                        {/* Tab Switches and Filters */}
                        <div className='flex items-center gap-4 mb-2'>
                            {/* Tab Switches for Resale/Rental */}
                            <div className='flex items-center bg-gray-100 rounded-md p-1'>
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
                            <div className='flex items-center gap-2'>
                                <button className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md'>
                                    <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                                </button>

                                <Dropdown
                                    options={inventoryStatusOptions}
                                    onSelect={setSelectedInventoryStatus}
                                    defaultValue={selectedInventoryStatus}
                                    placeholder='Inventory Status'
                                    className='relative inline-block'
                                    triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer'
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                />

                                <Dropdown
                                    options={kamOptions}
                                    onSelect={setSelectedKAM}
                                    defaultValue={selectedKAM}
                                    placeholder='KAM'
                                    className='relative inline-block'
                                    triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                />

                                <Dropdown
                                    options={sortOptions}
                                    onSelect={setSelectedSort}
                                    defaultValue={selectedSort}
                                    placeholder='Sort'
                                    className='relative inline-block'
                                    triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                />

                                <Button
                                    bgColor='bg-[#F3F3F3]'
                                    textColor='text-[#3A3A47]'
                                    className='px-3 h-8 font-medium text-sm'
                                    onClick={() => {}}
                                >
                                    🔍 Filter
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Save Button - Shows when properties are selected */}
                    {selectedProperties.size > 0 && (
                        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between'>
                            <div className='text-sm text-blue-700'>
                                {selectedProperties.size} propert{selectedProperties.size === 1 ? 'y' : 'ies'} selected
                            </div>
                            <Button
                                bgColor='bg-blue-600'
                                textColor='text-white'
                                className='px-4 h-8 font-medium'
                                onClick={saveSelectedProperties}
                            >
                                💾 Save Selected Properties
                            </Button>
                        </div>
                    )}

                    {/* Table with vertical scrolling */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                        {/* Select All Controls */}
                        <div className='px-6 py-3 border-b border-gray-200 bg-gray-50'>
                            <div className='flex items-center gap-3'>
                                <button
                                    onClick={toggleSelectAll}
                                    className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium'
                                >
                                    <input
                                        type='checkbox'
                                        checked={
                                            paginatedData.length > 0 &&
                                            paginatedData.every((item) => selectedProperties.has(item.propertyId))
                                        }
                                        onChange={toggleSelectAll}
                                        className='rounded'
                                    />
                                    {paginatedData.length > 0 &&
                                    paginatedData.every((item) => selectedProperties.has(item.propertyId))
                                        ? 'Deselect All'
                                        : 'Select All'}{' '}
                                    ({paginatedData.length} on this page)
                                </button>
                            </div>
                        </div>

                        <div className='h-[70vh] overflow-y-auto'>
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
                                maxHeight='70vh'
                                className='rounded-lg'
                                stickyHeader={true}
                            />
                        </div>

                        {/* Pagination */}
                        <div className='flex items-center justify-between py-4 px-6 border-t border-gray-200'>
                            <div className='text-sm text-gray-500 font-medium'>
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                                {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length}{' '}
                                properties
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
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PropertiesSelectionPage
