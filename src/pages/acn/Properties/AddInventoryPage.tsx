'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../../store/index'
import {
    fetchPropertyById,
    addProperty,
    updateProperty,
    getNextPropertyId,
} from '../../../services/acn/properties/propertiesService'
import { clearCurrentProperty, clearError } from '../../../store/reducers/acn/propertiesReducers'
import Layout from '../../../layout/Layout'
import Button from '../../../components/design-elements/Button'
import FormFieldRenderer from './AddInventoryRenderer'
import { formConfigs, type PropertyType } from './add-inventory_config'
import { type IInventory } from '../../../store/reducers/acn/propertiesTypes'

// Asset type options
const assetTypes: { label: string; value: PropertyType; icon: string }[] = [
    { label: 'flats/apartments', value: 'apartments', icon: '🏢' },
    { label: 'Villa', value: 'villa', icon: '🏡' },
    { label: 'Plot', value: 'plot', icon: '🏞️' },
    { label: 'Row House', value: 'rowhouse', icon: '🏘️' },
    { label: 'Villament', value: 'villament', icon: '🏠' },
    { label: 'Independent Building', value: 'independent', icon: '🏛️' },
]

// Helper function to format Unix timestamp to readable date
const formatUnixTimestamp = (timestamp: number | null | undefined): string => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toISOString().split('T')[0] // Returns YYYY-MM-DD format
}

// Helper function to map property data to form fields
const mapPropertyToFormData = (property: IInventory): Record<string, any> => {
    return {
        // Basic Information

        communityType: 'gated',
        projectName: property.nameOfTheProperty || property.area,
        sbua: property.sbua?.toString() || '',
        carpetArea: property.carpet?.toString() || '',
        floorNo: property.floorNo || '',
        doorFacing: property.facing?.toLowerCase() || '',
        unitNo: property.propertyId,
        furnishing: '',

        // Property type specific
        bedrooms: property.unitType?.includes('BHK') ? property.unitType.charAt(0) : '',
        apartmentType: 'simplex',

        // Pricing
        totalAskPrice: property.totalAskPrice?.toString() || '',
        handoverDate: formatUnixTimestamp(property.handoverDate),
        readyToMove: false,

        // Additional details
        balconyFacing: 'outside',
        ageOfBuilding: property.buildingAge?.toString() || '',
        insideOutsideFacing: 'outside',
        ups: '',
        carPark: '',
        cornerUnit: false,
        ocReceived: property.ocReceived || false,
        tenanted: property.tenanted || false,
        rentalIncome: '',
        exclusive: false,

        // Legal documents
        buildingKhata: property.buildingKhata || 'a_khata',
        landKhata: property.landKhata || 'a_khata',
        eKhata: false,
        biappaApprovedKhata: false,
        bdaApprovedKhata: false,

        // Files and notes
        fileUpload: property.photo || [],
        extraDetails: property.extraDetails || '',

        // Location
        micromarket: property.micromarket || '',
        area: property.area || '',
        mapLocation: property.mapLocation || '',

        // Additional IInventory fields
        unitType: property.unitType || '',
        subType: property.subType || '',
        plotSize: property.plotSize?.toString() || '',
        askPricePerSqft: property.askPricePerSqft?.toString() || '',
        status: property.status || 'Available',
        builder_name: property.builder_name || '',
        driveLink: property.driveLink || '',
        video: property.video || [],
        document: property.document || [],
    }
}

// Helper function to map form data to IInventory
const mapFormDataToProperty = (formData: Record<string, any>, assetType: PropertyType): Partial<IInventory> => {
    return {
        nameOfTheProperty: formData.projectName || '',
        area: formData.area || formData.projectName || '',
        micromarket: formData.micromarket || '',
        mapLocation: formData.mapLocation || '',
        assetType: assetType,
        unitType: formData.unitType || (formData.bedrooms ? `${formData.bedrooms} BHK` : ''),
        subType: formData.subType || '',
        sbua: formData.sbua ? parseInt(formData.sbua) : 0,
        carpet: formData.carpetArea ? parseInt(formData.carpetArea) : null,
        plotSize: formData.plotSize ? parseInt(formData.plotSize) : null,
        buildingAge: formData.ageOfBuilding ? parseInt(formData.ageOfBuilding) : null,
        floorNo: formData.floorNo || '',
        facing: formData.doorFacing || '',
        tenanted: Boolean(formData.tenanted),
        totalAskPrice: formData.totalAskPrice ? parseInt(formData.totalAskPrice) : 0,
        askPricePerSqft: formData.askPricePerSqft ? parseInt(formData.askPricePerSqft) : 0,
        status: formData.status || 'Available',
        currentStatus: formData.status || 'Available',
        builder_name: formData.builder_name || null,
        handoverDate: formData.handoverDate ? new Date(formData.handoverDate).getTime() : null,
        buildingKhata: formData.buildingKhata || null,
        landKhata: formData.landKhata || null,
        ocReceived: Boolean(formData.ocReceived),
        photo: Array.isArray(formData.fileUpload) ? formData.fileUpload : [],
        video: Array.isArray(formData.video) ? formData.video : [],
        document: Array.isArray(formData.document) ? formData.document : [],
        driveLink: formData.driveLink || '',
        extraDetails: formData.extraDetails || '',
        cpId: 'CURRENT_USER_ID', // Replace with actual user ID
        cpCode: 'CURRENT_USER_CODE', // Replace with actual user code
        _geoloc: { lat: 0, lng: 0 }, // Default coordinates
    }
}

// Helper function to determine property type from asset type
const getPropertyTypeFromAssetType = (assetType: string): PropertyType => {
    if (assetType.includes('BHK') || assetType.toLowerCase().includes('apartment')) {
        return 'apartments'
    } else if (assetType.toLowerCase().includes('villa')) {
        return 'villa'
    } else if (assetType.toLowerCase().includes('plot')) {
        return 'plot'
    } else if (assetType.toLowerCase().includes('row')) {
        return 'rowhouse'
    } else if (assetType.toLowerCase().includes('villament')) {
        return 'villament'
    } else {
        return 'independent'
    }
}

const AddEditInventoryPage = () => {
    const navigate = useNavigate()
    const { pId } = useParams<{ pId: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const isEditMode = Boolean(pId)

    // Redux state
    const { currentProperty: property, loading, error } = useSelector((state: RootState) => state.properties)

    const [selectedAssetType, setSelectedAssetType] = useState<PropertyType>('apartments')
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [successMessage, setSuccessMessage] = useState('')
    const [nextPropertyId, setNextPropertyId] = useState<string>('')
    const [loadingNextId, setLoadingNextId] = useState(false)
    const [agentIdInput, setAgentIdInput] = useState('')
    const [fetchedAgentId, setFetchedAgentId] = useState<string | null>(null)

    // Load property data if in edit mode or get next property ID for new properties
    useEffect(() => {
        if (isEditMode && pId) {
            console.log('🔄 Loading property for edit:', pId)
            dispatch(fetchPropertyById(pId))
        } else {
            // Get next property ID for new properties
            setLoadingNextId(true)
            dispatch(getNextPropertyId())
                .unwrap()
                .then((nextId) => {
                    console.log('📋 Next property ID received:', nextId)
                    setNextPropertyId(nextId)
                })
                .catch((error) => {
                    console.error('❌ Error getting next property ID:', error)
                    setNextPropertyId('AP5270') // Fallback
                })
                .finally(() => {
                    setLoadingNextId(false)
                })
        }

        // Cleanup on unmount
        return () => {
            console.log('🧹 Clearing current property on unmount')
            dispatch(clearCurrentProperty())
        }
    }, [isEditMode, pId, dispatch])

    // Update form data when property is loaded
    useEffect(() => {
        if (property && isEditMode) {
            console.log('📋 Property loaded, updating form data:', property)

            // Determine property type from asset type
            const propertyType = getPropertyTypeFromAssetType(property.assetType)
            setSelectedAssetType(propertyType)

            // Map property data to form fields
            const mappedData = mapPropertyToFormData(property)
            setFormData(mappedData)
        }
    }, [property, isEditMode])

    const handleFieldChange = (fieldId: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }))

        // Clear error when user starts typing
        if (errors[fieldId]) {
            setErrors((prev) => ({
                ...prev,
                [fieldId]: '',
            }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        const config = formConfigs[selectedAssetType]

        config.forEach((section) => {
            section.fields.forEach((field) => {
                if (field.required && !formData[field.id]) {
                    newErrors[field.id] = `${field.label} is required`
                }
            })
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (validateForm()) {
            try {
                const propertyData = mapFormDataToProperty(formData, selectedAssetType)

                if (isEditMode && property) {
                    console.log('📝 Updating property:', property.id, propertyData)
                    const updatedProperty = await dispatch(
                        updateProperty({
                            id: property.id,
                            updates: propertyData,
                        }),
                    ).unwrap()

                    console.log('✅ Property updated successfully')
                    setSuccessMessage('Property updated successfully!')

                    // Navigate to the updated property's details page using propertyId
                    setTimeout(() => {
                        navigate(`/acn/properties/${property.propertyId}/details`)
                    }, 1500)
                } else {
                    console.log('➕ Creating new property:', propertyData)
                    const newProperty = await dispatch(addProperty(propertyData)).unwrap()

                    console.log('✅ Property created successfully:', newProperty)
                    setSuccessMessage('Property created successfully!')

                    // Navigate to the new property's details page using propertyId
                    setTimeout(() => {
                        navigate(`/acn/properties/${newProperty.propertyId}/details`)
                    }, 1500)
                }
            } catch (error) {
                console.error('❌ Error saving property:', error)
            }
        }
    }

    const handleFetchAgentId = () => {
        // Simulate fetching agent id
        setFetchedAgentId('101')
    }

    const currentConfig = formConfigs[selectedAssetType]

    // Loading state
    if (loading && isEditMode && !property) {
        return (
            <Layout loading={true}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-lg'>Loading property data...</div>
                </div>
            </Layout>
        )
    }

    // Error state
    if (error && isEditMode) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-center'>
                        <div className='text-lg text-red-600 mb-4'>Error loading property</div>
                        <div className='text-sm text-gray-600 mb-4'>{error}</div>
                        <div className='flex gap-2 justify-center'>
                            <button
                                onClick={() => {
                                    dispatch(clearError())
                                    if (pId) dispatch(fetchPropertyById(pId))
                                }}
                                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => navigate('/acn/properties')}
                                className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
                            >
                                Back to Properties
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout loading={false}>
            <div className='flex'>
                {/* Sticky Left Sidebar */}
                <div className='w-64 sticky top-0 h-screen overflow-y-auto border-r p-4'>
                    <h2 className='text-lg font-medium text-gray-900 mb-4'>Asset Type</h2>
                    <div className='flex flex-col gap-4'>
                        {assetTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setSelectedAssetType(type.value)}
                                disabled={isEditMode}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left flex items-center gap-x-3 ${
                                    selectedAssetType === type.value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                } ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className='text-2xl'>{type.icon}</div>
                                <div className='text-sm font-medium'>{type.label}</div>
                            </button>
                        ))}
                    </div>
                    {isEditMode && (
                        <p className='text-sm text-gray-500 mt-4'>Asset type cannot be changed in edit mode</p>
                    )}
                </div>

                {/* Right Content Area */}
                <div className='flex-1 pl-6 overflow-y-auto'>
                    {/* Your scrollable content/form goes here */}
                    <div className='w-full overflow-hidden font-sans'>
                        <div className='py-6 px-6 bg-white min-h-screen'>
                            {/* Header */}
                            <div className='mb-6'>
                                <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
                                    {isEditMode ? 'Edit Inventory' : 'Add Inventory'}
                                </h1>

                                {isEditMode && property && (
                                    <p className='text-gray-600 mb-6'>
                                        Editing: {property.nameOfTheProperty || property.area} ({property.propertyId})
                                    </p>
                                )}

                                {!isEditMode && (
                                    <div className='mb-6'>
                                        {loadingNextId ? (
                                            <p className='text-gray-600'>
                                                <span className='inline-flex items-center gap-2'>
                                                    <svg
                                                        className='animate-spin h-4 w-4'
                                                        fill='none'
                                                        viewBox='0 0 24 24'
                                                    >
                                                        <circle
                                                            className='opacity-25'
                                                            cx='12'
                                                            cy='12'
                                                            r='10'
                                                            stroke='currentColor'
                                                            strokeWidth='4'
                                                        ></circle>
                                                        <path
                                                            className='opacity-75'
                                                            fill='currentColor'
                                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                        ></path>
                                                    </svg>
                                                    Loading next property ID...
                                                </span>
                                            </p>
                                        ) : nextPropertyId ? (
                                            <p className='text-gray-600'>
                                                Next Property ID:{' '}
                                                <span className='font-semibold text-blue-600'>{nextPropertyId}</span>
                                            </p>
                                        ) : (
                                            <p className='text-gray-600'>
                                                Next Property ID:{' '}
                                                <span className='font-semibold text-gray-400'>Loading...</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Add this block for text field and fetch button */}
                                <div className='flex gap-2 mb-6 items-center'>
                                    <input
                                        type='text'
                                        placeholder='Agent Number'
                                        className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        value={agentIdInput}
                                        onChange={(e) => setAgentIdInput(e.target.value)}
                                    />
                                    <button
                                        className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'
                                        onClick={() => setFetchedAgentId('101 | Name')}
                                        type='button'
                                    >
                                        Fetch
                                    </button>
                                    {fetchedAgentId && (
                                        <span className='ml-4 text-green-700 font-semibold'>{fetchedAgentId}</span>
                                    )}
                                </div>
                                {/* End of added block */}

                                {/* Success/Error Messages */}
                                {successMessage && (
                                    <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
                                        <div className='flex items-center gap-2'>
                                            <svg
                                                className='w-5 h-5 text-green-600'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M5 13l4 4L19 7'
                                                />
                                            </svg>
                                            <div className='text-sm text-green-700'>{successMessage}</div>
                                        </div>
                                        <div className='text-xs text-green-600 mt-1'>
                                            Redirecting to property details...
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                                        <div className='text-sm text-red-700'>{error}</div>
                                    </div>
                                )}
                            </div>

                            {/* Form Sections */}
                            <div className='space-y-4'>
                                {currentConfig.map((section, sectionIndex) => (
                                    <div key={sectionIndex} className='bg-white '>
                                        {/* <h3 className='text-lg font-semibold text-gray-900 mb-6'>{section.title}</h3> */}
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                            {section.fields.map((field) => (
                                                <FormFieldRenderer
                                                    key={field.id}
                                                    field={field}
                                                    value={formData[field.id]}
                                                    onChange={(value) => handleFieldChange(field.id, value)}
                                                    error={errors[field.id]}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className='flex justify-end gap-4 mt-8 pt-6 '>
                                {/* Save as Draft */}
                                <Button
                                    bgColor='bg-gray-200'
                                    textColor='text-gray-700'
                                    className='px-1 py-1 border border-gray-300 hover:bg-gray-100 text-base font-medium'
                                    // onClick={handleSaveAsDraft}
                                    disabled={loading}
                                >
                                    Save as Draft
                                </Button>
                                <Button
                                    bgColor={loading ? 'bg-gray-400' : successMessage ? 'bg-green-600' : 'bg-gray-900'}
                                    textColor='text-white'
                                    className='px-4 py-2 hover:bg-gray-800 text-base font-medium'
                                    onClick={handleSubmit}
                                    disabled={loading || successMessage !== ''}
                                >
                                    {loading ? (
                                        <div className='flex items-center gap-2'>
                                            <svg className='animate-spin h-4 w-4' fill='none' viewBox='0 0 24 24'>
                                                <circle
                                                    className='opacity-25'
                                                    cx='12'
                                                    cy='12'
                                                    r='10'
                                                    stroke='currentColor'
                                                    strokeWidth='4'
                                                ></circle>
                                                <path
                                                    className='opacity-75'
                                                    fill='currentColor'
                                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                ></path>
                                            </svg>
                                            {isEditMode ? 'Updating...' : 'Creating...'}
                                        </div>
                                    ) : successMessage ? (
                                        <div className='flex items-center gap-2'>
                                            <svg
                                                className='w-4 h-4'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M5 13l4 4L19 7'
                                                />
                                            </svg>
                                            {isEditMode ? 'Updated!' : 'Created!'}
                                        </div>
                                    ) : isEditMode ? (
                                        'Update Property'
                                    ) : (
                                        'Submit'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AddEditInventoryPage
