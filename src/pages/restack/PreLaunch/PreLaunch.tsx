'use client'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import PreLaunchModal, { type PreLaunchFormData } from '../../../components/restack/AddPreLaunchProjectModal'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPreLaunchProperties, addPreLaunchProperty } from '../../../store/actions/restack/preLaunchActions'
import type { Property } from '../../../store/reducers/restack/preLaunchtypes'
import type { AppDispatch, RootState } from '../../../store'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'

const PreLaunchPage = () => {
    const [searchValue, setSearchValue] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [paginatedData, setPaginatedData] = useState<Property[]>([])
    const [filteredData, setFilteredData] = useState<Property[]>([])
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    // Redux state
    const { properties, loading, error } = useSelector((state: RootState) => state.preLaunch)

    // Items per page
    const ITEMS_PER_PAGE = 50

    // Fetch data on component mount
    useEffect(() => {
        dispatch(fetchPreLaunchProperties())
    }, [dispatch])

    // Filter data based on search
    useEffect(() => {
        if (searchValue.trim() === '') {
            setFilteredData(properties)
        } else {
            const filtered = properties.filter(
                (project) =>
                    project.projectName.toLowerCase().includes(searchValue.toLowerCase()) ||
                    project.stage.toLowerCase().includes(searchValue.toLowerCase()) ||
                    project.address?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    project.developerName?.toLowerCase().includes(searchValue.toLowerCase()),
            )
            setFilteredData(filtered)
        }
        setCurrentPage(1) // Reset to first page when searching
    }, [searchValue, properties])

    // Calculate total pages
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

    // Update paginated data when page changes or filtered data changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        setPaginatedData(filteredData.slice(startIndex, endIndex))
    }, [currentPage, filteredData])

    // Table columns configuration
    const columns: TableColumn[] = [
        {
            key: 'projectName',
            header: 'Project Name',
            render: (value) => <span className='whitespace-nowrap text-sm font-semibold text-gray-900'>{value}</span>,
        },
        {
            key: 'stage',
            header: 'Stage',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'projectStartDate',
            header: 'Tentative Start Date',
            render: (value) => (
                <span className='whitespace-nowrap text-sm text-gray-600'>{value ? formatUnixDate(value) : 'N/A'}</span>
            ),
        },
        {
            key: 'action',
            header: 'Action',
            render: (_, row) => (
                <button
                    className='text-gray-900 text-sm font-medium transition-colors'
                    onClick={() => navigate(`/restack/prelaunch/${row.projectId}`)}
                >
                    View Details
                </button>
            ),
        },
    ]
    const [showModal, setShowModal] = useState(false)

    const handleAddProject = async (data: PreLaunchFormData) => {
        try {
            // Transform PreLaunchFormData to Property format
            const propertyData: Omit<Property, 'projectId' | 'createdAt' | 'lastUpdated'> = {
                projectName: data.projectName,
                projectType: data.projectType,
                stage: data.stage,
                status: 'Active', // Default status
                developerName: data.developerName,
                projectSize: data.projectSize, // Default values - you may want to add these to the form
                projectSizeUnit: 'sqft',
                pricePerSqft: data.pricePerSqft,
                projectStartDate: data.tentativeStartDate,
                handoverDate: data.proposedCompletionDate, // Default empty
                address: data.address,
                lat: data.latitude, // Default empty
                long: data.latitude, // Default empty
                mapLink: data.map,
                totalUnits: data.totalUnits,
                eoiAmount: 0,
                numberOfFloors: data.totalFloors,
                numberOfTowers: data.numberOfTowers,
                totalParking: data.carParking,
                openParking: 0,
                coveredParking: 0,
                openArea: data.openSpace,
                reraId: '',
                reraStatus: '',
                environmentalClearance: '',
                buildingPermission: '',
                configurations: {
                    apartments: [],
                    villas: [],
                    plots: [],
                },
                amenities: [],
                documents: {
                    villageMaps: [],
                    cdpMaps: [],
                    masterPlan: '',
                    projectLayoutPlan: '',
                    brochure: '',
                },
                areaUnit: 'sqft',
            }

            const result = await dispatch(addPreLaunchProperty(propertyData))
            if (result.meta.requestStatus === 'fulfilled') {
                console.log('Property added successfully:', result.payload)
                // Optionally refresh the data
                dispatch(fetchPreLaunchProperties())
            }
        } catch (error) {
            console.error('Error adding property:', error)
        }
        setShowModal(false)
    }

    return (
        <Layout loading={loading}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-2'>
                        <div className='flex items-center justify-between mb-4'>
                            <h1 className='text-xl font-semibold text-gray-900'>Pre-Launch</h1>
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
                                <Button
                                    bgColor='bg-gray-200'
                                    textColor='text-gray-600'
                                    className='px-6 h-8 font-medium transition-colors'
                                    onClick={() => setShowModal(true)}
                                    // Handle add project action
                                >
                                    Add
                                </Button>
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

                    {/* Error handling */}
                    {error && (
                        <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                            <div className='flex'>
                                <div className='flex-shrink-0'>
                                    <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                                        <path
                                            fillRule='evenodd'
                                            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                                            clipRule='evenodd'
                                        />
                                    </svg>
                                </div>
                                <div className='ml-3'>
                                    <h3 className='text-sm font-medium text-red-800'>Error loading properties</h3>
                                    <div className='mt-2 text-sm text-red-700'>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && properties.length === 0 && (
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
                            <p className='mt-1 text-sm text-gray-500'>
                                Get started by adding a new pre-launch property.
                            </p>
                            <div className='mt-6'>
                                <Button
                                    bgColor='bg-blue-600'
                                    textColor='text-white'
                                    className='px-4 py-2 font-medium transition-colors hover:bg-blue-700'
                                    onClick={() => setShowModal(true)}
                                >
                                    Add Property
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {showModal && (
                <PreLaunchModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleAddProject} />
            )}
        </Layout>
    )
}

export default PreLaunchPage
