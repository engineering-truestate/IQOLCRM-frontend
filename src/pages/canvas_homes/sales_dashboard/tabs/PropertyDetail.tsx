import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Property } from '../../../../store/reducers/restack/preLaunchtypes'
import type { AppDispatch, RootState } from '../../../../store'
import {
    getPreLaunchPropertyById,
    getPreLaunchPropertyByName,
} from '../../../../store/actions/restack/preLaunchActions'
import { formatUnixDate } from '../../../../components/helper/getUnixDateTime'
import { FlexibleTable, type TableColumn } from '../../../../components/design-elements/FlexibleTable'

// Component Props Interface
interface PropertyDetailProps {
    propertyId?: string
    propertyName?: string
    onPropertyLoad?: (property: Property | null) => void
    onError?: (error: string) => void
    showHeader?: boolean
    className?: string
}

// Floor plan image component
const FloorPlanImage = ({ imageUrl, size = 'small' }: { imageUrl: string; size?: 'small' | 'large' }) => {
    const sizeClasses = size === 'small' ? 'w-10 h-10' : 'w-16 h-16'

    return (
        <div className={`${sizeClasses} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt='Floor Plan'
                    className='w-full h-full object-cover'
                    onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                />
            ) : null}
            <div className={`${imageUrl ? 'hidden' : ''} text-xs text-gray-500 text-center`}>No Image</div>
        </div>
    )
}

const PropertyDetail = ({
    propertyId,
    propertyName,
    onPropertyLoad,
    onError,
    showHeader = true,
    className = '',
}: PropertyDetailProps) => {
    const dispatch = useDispatch<AppDispatch>()

    // Redux state
    const { properties, selectedProperty, loading, error } = useSelector((state: RootState) => state.preLaunch)

    const [projectDetails, setProjectDetails] = useState<Property | null>(null)
    const [activeTab, setActiveTab] = useState<'apartment' | 'villa' | 'plot'>('apartment')

    // Load project data based on propertyId or propertyName
    useEffect(() => {
        const loadProperty = async () => {
            if (propertyName) {
                // Try to find by name in existing properties first
                const existingProperty = properties.find(
                    (prop: any) => prop.projectName?.toLowerCase() === propertyName.toLowerCase(),
                )
                if (existingProperty) {
                    setProjectDetails(existingProperty)
                    onPropertyLoad?.(existingProperty)
                } else {
                    // If not found, fetch from API by name
                    try {
                        await dispatch(getPreLaunchPropertyByName(propertyName))
                    } catch (err) {
                        const errorMessage = err instanceof Error ? err.message : 'Failed to load property by name'
                        onError?.(errorMessage)
                    }
                }
            } else if (propertyId) {
                // First try to find in existing properties
                const existingProperty = properties.find((prop: any) => prop.projectId === propertyId)
                if (existingProperty) {
                    setProjectDetails(existingProperty)
                    onPropertyLoad?.(existingProperty)
                } else {
                    // If not found, fetch from API by ID
                    try {
                        await dispatch(getPreLaunchPropertyById(propertyId))
                    } catch (err) {
                        const errorMessage = err instanceof Error ? err.message : 'Failed to load property by ID'
                        onError?.(errorMessage)
                    }
                }
            }
        }

        loadProperty()
    }, [propertyId, propertyName, properties, dispatch, onPropertyLoad, onError])

    // Update local state when selectedProperty changes (from Redux)
    useEffect(() => {
        if (
            selectedProperty &&
            (selectedProperty.projectId === propertyId ||
                selectedProperty.projectName?.toLowerCase() === propertyName?.toLowerCase())
        ) {
            setProjectDetails(selectedProperty)
            onPropertyLoad?.(selectedProperty)
        }
    }, [selectedProperty, propertyId, propertyName, onPropertyLoad])

    // Render display field
    const renderDisplayField = (
        label: string,
        value: string | number | null,
        fieldType: 'text' | 'date' | 'number' = 'text',
    ) => {
        let displayValue = value?.toString() ?? ''

        if (fieldType === 'date' && typeof value === 'number') {
            displayValue = formatUnixDate(value) ?? ''
        }

        return (
            <div className=' border-b-[2px] border-gray-200 pb-2 mb-4'>
                <label className='text-sm text-gray-600 block mb-1'>{label}</label>
                <div className='text-sm text-black font-medium truncate'>{displayValue || '-'}</div>
            </div>
        )
    }

    // Generate table columns for each unit type
    const getApartmentColumns = (): TableColumn[] => [
        {
            key: 'aptType',
            header: 'Apt Type',
            render: (value) => <span className='text-sm'>{value || '-'}</span>,
        },
        {
            key: 'typology',
            header: 'Typology',
            render: (value) => <span className='text-sm'>{value || '-'}</span>,
        },
        {
            key: 'superBuiltUpArea',
            header: 'Super built-up area',
            render: (value) => <span className='text-sm'>{value || '-'}</span>,
        },
        {
            key: 'carpetArea',
            header: 'Carpet area',
            render: (value) => <span className='text-sm'>{value || '-'}</span>,
        },
        {
            key: 'pricePerSqft',
            header: 'Price / sqft',
            render: (value) => <span className='text-sm'>{value || '-'}</span>,
        },
        {
            key: 'totalPrice',
            header: 'Total Price (PLC & FRC Extra)',
            render: (value) => <span className='text-sm'>{value || '-'}</span>,
        },
        {
            key: 'floorPlan',
            header: 'Floor plan',
            render: (value) => <FloorPlanImage imageUrl={(value as string) || '-'} />,
        },
    ]

    const getVillaColumns = (): TableColumn[] => [
        {
            key: 'villaType',
            header: 'Villa Type',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
        {
            key: 'typology',
            header: 'Typology',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
        {
            key: 'plotSize',
            header: 'Plot Size',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
        {
            key: 'builtUpArea',
            header: 'Built-up Area',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
        {
            key: 'carpetArea',
            header: 'Carpet Area',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
        {
            key: 'pricePerSqft',
            header: 'Price / sqft',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
        {
            key: 'uds',
            header: 'UDS',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
        {
            key: 'noOfFloors',
            header: 'No. of Floors',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
    ]

    const getPlotColumns = (): TableColumn[] => [
        {
            key: 'plotType',
            header: 'Plot Type',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
        {
            key: 'plotArea',
            header: 'Plot Area(sq ft)',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
        {
            key: 'pricePerSqft',
            header: 'Price / sqft',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (value) => <span className='text-sm'>{value}</span>,
        },
    ]
    const getClubhouseColumns = (): TableColumn[] => [
        {
            key: 'name',
            header: 'Name',
            render: (value) => <span className='text-sm font-medium'>{value}</span>,
        },
        {
            key: 'sizeSqft',
            header: 'Size (Sq Ft)',
            render: (value) => <span className='text-sm font-medium'>{value}</span>,
        },
        {
            key: 'floor',
            header: 'Floor',
            render: (value) => <span className='text-sm font-medium'>{value}</span>,
        },
    ]

    if (loading || !projectDetails) {
        return (
            <div className={`w-full  overflow-hidden font-sans ${className}`}>
                <div className='py-4 px-6 bg-white max-h-[85vh]'>
                    <div className='flex items-center justify-center h-64'>
                        <div className='text-gray-500'>Loading project details...</div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`w-full overflow-hidden font-sans ${className}`}>
                <div className='py-4 px-6 bg-white min-h-screen'>
                    <div className='flex items-center justify-center h-64'>
                        <div className='text-center'>
                            <div className='text-red-600 mb-2'>Error loading project details</div>
                            <div className='text-gray-500 text-sm'>{error}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`w-full overflow-hidden font-sans ${className}`}>
            <div className='py-4 px-6 bg-white max-h-[85vh] overflow-y-auto'>
                {/* Header */}
                {showHeader && (
                    <div className='mb-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <div>
                                <h1 className='text-xl font-semibold text-black'>{projectDetails.projectName}</h1>
                            </div>
                        </div>
                    </div>
                )}

                {/* Project Overview */}
                <div className='mb-8'>
                    <h2 className='text-lg font-semibold text-black mb-4'>Project Overview</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-4'>
                            {renderDisplayField('Project Name', projectDetails.projectName)}
                            {renderDisplayField('Stage', projectDetails.stage)}
                            {renderDisplayField('Project Size', projectDetails.projectSize, 'number')}
                            {renderDisplayField('Project Start Date', projectDetails.projectStartDate, 'date')}
                        </div>
                        <div className='space-y-4'>
                            {renderDisplayField('Project Type', projectDetails.projectType)}
                            {renderDisplayField('Developer / Promoter', projectDetails.developerName)}
                            {renderDisplayField('Price (per sqft)', projectDetails.pricePerSqft, 'number')}
                            {renderDisplayField('Proposed Completion Date', projectDetails.handoverDate, 'date')}
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className='mb-8'>
                    <h2 className='text-lg font-semibold text-black mb-4'>Location</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-4'>
                            {renderDisplayField('Address', projectDetails.address)}
                            {renderDisplayField('Latitude', projectDetails.lat, 'number')}
                        </div>
                        <div className='space-y-4'>
                            <div className='space-y-4 border-b-[2px] border-gray-200 pb-2 mb-3'>
                                <label className='text-sm text-gray-600 block mb-1'>Google Map </label>
                                {projectDetails.mapLink ? (
                                    <a
                                        href={projectDetails.mapLink}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-sm text-blue-600 hover:text-blue-800 underline'
                                    >
                                        Google Map Link
                                    </a>
                                ) : (
                                    <span className='text-sm text-gray-400'>No Google Map Link available</span>
                                )}
                            </div>
                            {/* {renderDisplayField('Google Map', projectDetails.mapLink)} */}
                            {renderDisplayField('Longitude', projectDetails.long, 'number')}
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className='mb-8'>
                    <h2 className='text-lg font-semibold text-black mb-4'>Key Metrics</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-4'>
                            {renderDisplayField('Total Units', projectDetails.totalUnits, 'number')}
                            {renderDisplayField('No. of Floors', projectDetails.numberOfFloors, 'number')}
                            {renderDisplayField('Car Parking (total)', projectDetails.totalParking, 'number')}
                        </div>
                        <div className='space-y-4'>
                            {/* {renderDisplayField('EOI Amount (₹)', projectDetails.eoiAmount, 'number')} */}
                            {renderDisplayField('No. of Towers', projectDetails.numberOfTowers, 'number')}
                            {renderDisplayField('Open Space', projectDetails.openArea)}
                        </div>
                    </div>
                </div>

                {/* Typology and Unit Details */}
                <div className='mb-8'>
                    <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-lg font-semibold text-black'>Typology and Unit Details</h2>
                    </div>

                    {/* Tabs */}
                    <div className='flex border-b border-gray-200 mb-4'>
                        <button
                            className={`px-6 py-2 text-sm font-medium border-b-2 ${
                                activeTab === 'apartment'
                                    ? 'border-gray-600 text-gray-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('apartment')}
                        >
                            Apartment
                        </button>
                        <button
                            className={`px-6 py-2 text-sm font-medium border-b-2 ${
                                activeTab === 'villa'
                                    ? 'border-gray-600 text-gray-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('villa')}
                        >
                            Villa
                        </button>
                        <button
                            className={`px-6 py-2 text-sm font-medium border-b-2 ${
                                activeTab === 'plot'
                                    ? 'border-gray-600 text-gray-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('plot')}
                        >
                            Plot
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                        {activeTab === 'apartment' && (
                            <FlexibleTable
                                data={projectDetails.configurations.apartments}
                                columns={getApartmentColumns()}
                                hoverable={true}
                                borders={{
                                    table: false,
                                    header: true,
                                    rows: true,
                                    cells: false,
                                    outer: false,
                                }}
                                className='rounded-lg'
                            />
                        )}
                        {activeTab === 'villa' && (
                            <FlexibleTable
                                data={projectDetails.configurations.villas}
                                columns={getVillaColumns()}
                                hoverable={true}
                                borders={{
                                    table: false,
                                    header: true,
                                    rows: true,
                                    cells: false,
                                    outer: false,
                                }}
                                className='rounded-lg'
                            />
                        )}
                        {activeTab === 'plot' && (
                            <FlexibleTable
                                data={projectDetails.configurations.plots}
                                columns={getPlotColumns()}
                                hoverable={true}
                                borders={{
                                    table: false,
                                    header: true,
                                    rows: true,
                                    cells: false,
                                    outer: false,
                                }}
                                className='rounded-lg'
                            />
                        )}
                    </div>
                </div>
                <div className='mb-8 px-4'>
                    <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-lg font-semibold text-black'>Clubhouse Details</h2>
                    </div>
                    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                        <FlexibleTable
                            data={projectDetails?.clubhouseDetails || []}
                            columns={getClubhouseColumns()}
                            hoverable={true}
                            borders={{
                                table: false,
                                header: true,
                                rows: true,
                                cells: false,
                                outer: false,
                            }}
                            className='rounded-lg'
                        />
                    </div>
                </div>

                {/* Maps & Plans */}
                <div className='mb-8'>
                    <h2 className='text-lg font-semibold text-black mb-4'>Maps & Plans</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='text-sm text-gray-600 block mb-1'>Master Plan</label>
                            {projectDetails.documents.masterPlan ? (
                                <a
                                    href={projectDetails.documents.masterPlan[0]}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-sm text-blue-600 hover:text-blue-800 underline'
                                >
                                    View Master Plan
                                </a>
                            ) : (
                                <span className='text-sm text-gray-400'>No master plan available</span>
                            )}
                        </div>
                        <div>
                            <label className='text-sm text-gray-600 block mb-1'>Project Layout Plan</label>
                            {projectDetails.documents.projectLayoutPlan ? (
                                <a
                                    href={projectDetails.documents.projectLayoutPlan[0]}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-sm text-blue-600 hover:text-blue-800 underline'
                                >
                                    View Project Layout Plan
                                </a>
                            ) : (
                                <span className='text-sm text-gray-400'>No layout plan available</span>
                            )}
                        </div>
                        <div>
                            <label className='text-sm text-gray-600 block mb-1'>Brochure</label>
                            {projectDetails.documents.brochure ? (
                                <a
                                    href={projectDetails.documents.brochure[0]}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-sm text-blue-600 hover:text-blue-800 underline'
                                >
                                    View Brochure
                                </a>
                            ) : (
                                <span className='text-sm text-gray-400'>No brochure available</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PropertyDetail
