import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import Dropdown from '../../../components/design-elements/Dropdown'
import NumberInput from '../../../components/design-elements/StateBaseNumberField'
import DateInput from '../../../components/design-elements/DateInputUnixTimestamps'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime' // Used for formatting dates

// Import the dummy data and types
import {
    propertyDetailsData,
    getPropertyById,
    type PropertyDetails,
    type PropertyImages,
    type BasicPropertyInfo,
    type LocationDetails,
    type AmenitiesAndFeatures,
} from '../../dummy_data/restack_resale_details_dummy_data'
import editic from '/icons/acn/edit.svg'

// Type definitions for section and field names
type PropertySection = 'basicInfo' | 'location' | 'amenitiesAndFeatures'
type FieldName =
    | keyof PropertyDetails['basicInfo']
    | keyof PropertyDetails['location']
    | keyof PropertyDetails['amenitiesAndFeatures']

// Property type options
const propertyTypes = [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Industrial', value: 'Industrial' },
]

const subTypes = [
    { label: 'Apartment', value: 'Apartment' },
    { label: 'Villa', value: 'Villa' },
    { label: 'Plot', value: 'Plot' },
    { label: 'Penthouse', value: 'Penthouse' },
]

const configurations = [
    { label: '1 BHK', value: '1 BHK' },
    { label: '2 BHK', value: '2 BHK' },
    { label: '3 BHK', value: '3 BHK' },
    { label: '4 BHK', value: '4 BHK' },
    { label: '5+ BHK', value: '5+ BHK' },
]

const statusOptions = [
    { label: 'Ready to Move', value: 'Ready to Move' },
    { label: 'Under Construction', value: 'Under Construction' },
    { label: 'Upcoming', value: 'Upcoming' },
]

const furnishingOptions = [
    { label: 'Furnished', value: 'Furnished' },
    { label: 'Semi-Furnished', value: 'Semi-Furnished' },
    { label: 'Unfurnished', value: 'Unfurnished' },
]

const facingOptions = [
    { label: 'North', value: 'North' },
    { label: 'South', value: 'South' },
    { label: 'East', value: 'East' },
    { label: 'West', value: 'West' },
    { label: 'North-East', value: 'North-East' },
    { label: 'North-West', value: 'North-West' },
    { label: 'South-East', value: 'South-East' },
    { label: 'South-West', value: 'South-West' },
]

// Image Gallery Component
const ImageGallery = ({ images }: { images: PropertyImages[] }) => {
    const [selectedImage, setSelectedImage] = useState(0)

    return (
        <div className='mb-6'>
            {/* Main Image Display */}
            <div className='mb-4'>
                <img
                    src={images[selectedImage]?.url || '/api/placeholder/800/400'}
                    alt={images[selectedImage]?.alt || 'Property image'}
                    className='w-full h-80 object-cover rounded-lg'
                />
            </div>

            {/* Thumbnail Grid */}
            <div className='grid grid-cols-6 gap-2'>
                {images.slice(0, 5).map((image, index) => (
                    <div
                        key={image.id}
                        className={`cursor-pointer rounded overflow-hidden border-2 ${
                            selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedImage(index)}
                    >
                        <img src={image.url} alt={image.alt} className='w-full h-16 object-cover' />
                    </div>
                ))}
                {images.length > 5 && (
                    <div className='relative cursor-pointer rounded overflow-hidden border-2 border-gray-200'>
                        <img src={images[5].url} alt={images[5].alt} className='w-full h-16 object-cover' />
                        <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                            <span className='text-white text-xs font-medium'>+{images.length - 5}</span>
                        </div>
                    </div>
                )}
                {/* Add Image Button */}
                <div className='flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400'>
                    <div className='text-center p-2'>
                        <div className='text-gray-400 text-xs'>Add Image</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ResaleDetailsPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null)
    const [originalDetails, setOriginalDetails] = useState<PropertyDetails | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)

    // Load property data based on id
    useEffect(() => {
        if (id) {
            setLoading(true)
            // Simulate fetching data from an API or using the getPropertyById function
            try {
                const property = getPropertyById(id) || propertyDetailsData // Simulate API response
                if (!property) {
                    throw new Error('Property not found')
                }
                setPropertyDetails(property)
                setOriginalDetails(property)
            } catch (error) {
                console.error('Error fetching property details:', error)
            } finally {
                setLoading(false)
            }
        }
    }, [id])

    // Handle field updates with types
    const updateField = (section: PropertySection, field: FieldName, value: string | number | null) => {
        setPropertyDetails((prev) => {
            if (!prev) return null
            const updatedDetails = { ...prev }
            if (section === 'basicInfo') {
                updatedDetails.basicInfo = {
                    ...updatedDetails.basicInfo,
                    [field]: value,
                }
            } else if (section === 'location') {
                updatedDetails.location = {
                    ...updatedDetails.location,
                    [field]: value,
                }
            } else if (section === 'amenitiesAndFeatures') {
                updatedDetails.amenitiesAndFeatures = {
                    ...updatedDetails.amenitiesAndFeatures,
                    [field]: value,
                }
            }
            return updatedDetails
        })
    }

    const updateBasicField = (field: keyof PropertyDetails['basicInfo'], value: string | number | null) => {
        updateField('basicInfo', field, value)
    }

    const updateLocationField = (field: keyof PropertyDetails['location'], value: string | number | null) => {
        updateField('location', field, value)
    }

    // Handle edit mode toggle
    const handleEdit = () => {
        setIsEditing(true)
    }

    // Handle cancel edit
    const handleCancel = () => {
        setPropertyDetails(originalDetails)
        setIsEditing(false)
    }

    // Handle save changes
    const handleSave = async () => {
        if (propertyDetails && id) {
            try {
                // Here you would typically make an API call to save the changes
                console.log('Saving property details:', propertyDetails)
                setOriginalDetails(propertyDetails)
                setIsEditing(false)
                console.log('Property details saved successfully')
            } catch (error) {
                console.error('Error saving property details:', error)
            }
        }
    }

    // Render field based on edit mode
    const renderField = <T extends PropertySection>(
        label: string,
        value: string | number | null,
        updateFunction: (field: keyof PropertyDetails[T], value: string | number | null) => void,
        fieldKey: keyof PropertyDetails[T],
        options?: { label: string; value: string }[],
        fieldType: 'text' | 'date' | 'number' = 'text',
    ) => {
        if (isEditing) {
            if (options) {
                return (
                    <div>
                        <label className='text-sm text-black block mb-1'>{label}</label>
                        <Dropdown
                            options={options}
                            onSelect={(selectedValue) => updateFunction(fieldKey, selectedValue)}
                            defaultValue={value as string}
                            placeholder={`Select ${label}`}
                            className='relative w-full'
                            triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                            menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                            optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                        />
                    </div>
                )
            } else if (fieldType === 'number') {
                return (
                    <NumberInput
                        label={label}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        value={value as number}
                        onChange={(numValue) => updateFunction(fieldKey, numValue ?? 0)}
                        numberType='decimal'
                        min={0}
                        fullWidth
                    />
                )
            } else {
                return (
                    <div className='error'>
                        <label className='text-sm text-black block mb-1'>{label}</label>
                        <StateBaseTextField
                            value={value?.toString() ?? ''}
                            onChange={(e) => updateFunction(fieldKey, e.target.value)}
                            className='w-full text-sm'
                        />
                    </div>
                )
            }
        } else {
            return (
                <div>
                    <label className='text-sm text-gray-600 block mb-1'>{label}</label>
                    <div className='text-sm text-black font-medium'>{value?.toString() ?? ''}</div>
                </div>
            )
        }
    }

    if (loading || !propertyDetails) {
        return (
            <Layout loading={true}>
                <div className='py-2 px-6 bg-white min-h-screen'>
                    <div className='flex items-center justify-center h-64'>
                        <div className='text-gray-500'>Loading property details...</div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen'>
                    {/* Header */}
                    <div className='mb-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <div>
                                <div className='flex items-center gap-2 mb-2'>
                                    <span className='bg-green-100 text-green-800 text-xs px-2 py-1 rounded'>
                                        {propertyDetails.status}
                                    </span>
                                    <span className='text-lg font-semibold text-black'>
                                        {propertyDetails.basicInfo.price}
                                    </span>
                                </div>
                                <h1 className='text-xl font-semibold text-black'>{propertyDetails.title}</h1>
                                <div className='text-sm text-gray-500 mt-1'>
                                    <button onClick={() => navigate('/restack/resale')} className='hover:text-gray-700'>
                                        Resale
                                    </button>
                                    <span className='mx-2'>/</span>
                                    <span className='text-black font-medium'>{propertyDetails.id}</span>
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                {isEditing ? (
                                    <>
                                        <Button
                                            bgColor='bg-gray-200'
                                            textColor='text-gray-700'
                                            className='px-4 h-8 font-semibold'
                                            onClick={handleCancel}
                                        >
                                            ✕ Cancel
                                        </Button>
                                        <Button
                                            bgColor='bg-gray-600'
                                            textColor='text-white'
                                            className='px-4 h-8 font-semibold'
                                            onClick={handleSave}
                                        >
                                            ✓ Save
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        leftIcon={<img src={editic} alt='Edit' className='w-4 h-4' />}
                                        bgColor='bg-[#F3F3F3]'
                                        textColor='text-[#3A3A47]'
                                        className='px-4 h-8 font-semibold'
                                        onClick={handleEdit}
                                    >
                                        Edit Property
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Property Images */}
                    <ImageGallery images={propertyDetails.images} />

                    {/* Property Overview */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Property Overview</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField<'basicInfo'>(
                                    'Project Name',
                                    propertyDetails.basicInfo.projectName,
                                    updateBasicField,
                                    'projectName',
                                )}
                                {renderField<'basicInfo'>(
                                    'Property Type',
                                    propertyDetails.basicInfo.propertyType,
                                    updateBasicField,
                                    'propertyType',
                                    propertyTypes,
                                )}
                                {renderField<'basicInfo'>(
                                    'Sub Type',
                                    propertyDetails.basicInfo.subType,
                                    updateBasicField,
                                    'subType',
                                    subTypes,
                                )}
                                {renderField<'basicInfo'>(
                                    'Configuration',
                                    propertyDetails.basicInfo.configuration,
                                    updateBasicField,
                                    'configuration',
                                    configurations,
                                )}
                                {renderField<'basicInfo'>(
                                    'Price',
                                    propertyDetails.basicInfo.price,
                                    updateBasicField,
                                    'price',
                                )}
                                {renderField<'basicInfo'>(
                                    'Price per sq ft',
                                    propertyDetails.basicInfo.pricePerSqFt,
                                    updateBasicField,
                                    'pricePerSqFt',
                                )}
                                {renderField<'basicInfo'>(
                                    'RERA ID',
                                    propertyDetails.basicInfo.reraId,
                                    updateBasicField,
                                    'reraId',
                                )}
                            </div>
                            <div className='space-y-4'>
                                {renderField<'basicInfo'>(
                                    'Project Size',
                                    propertyDetails.basicInfo.projectSize,
                                    updateBasicField,
                                    'projectSize',
                                )}
                                {renderField<'basicInfo'>(
                                    'Super Built-up Area',
                                    propertyDetails.basicInfo.superBuiltUpArea,
                                    updateBasicField,
                                    'superBuiltUpArea',
                                )}
                                {renderField<'basicInfo'>(
                                    'Carpet Area',
                                    propertyDetails.basicInfo.carpetArea,
                                    updateBasicField,
                                    'carpetArea',
                                )}
                                {renderField<'basicInfo'>(
                                    'Total Units',
                                    propertyDetails.basicInfo.totalUnits,
                                    updateBasicField,
                                    'totalUnits',
                                )}
                                {renderField<'basicInfo'>(
                                    'Developer',
                                    propertyDetails.basicInfo.developer,
                                    updateBasicField,
                                    'developer',
                                )}
                                {renderField<'basicInfo'>(
                                    'Possession',
                                    propertyDetails.basicInfo.possession,
                                    updateBasicField,
                                    'possession',
                                    statusOptions,
                                )}
                                {renderField<'basicInfo'>(
                                    'Age of Property',
                                    propertyDetails.basicInfo.ageOfProperty,
                                    updateBasicField,
                                    'ageOfProperty',
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location and Timeline */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Location and Timeline</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField<'location'>(
                                    'Project Address',
                                    propertyDetails.location.projectAddress,
                                    updateLocationField,
                                    'projectAddress',
                                )}
                                {renderField<'location'>(
                                    'Area',
                                    propertyDetails.location.area,
                                    updateLocationField,
                                    'area',
                                )}
                                {renderField<'basicInfo'>(
                                    'Age of Property',
                                    propertyDetails.basicInfo.ageOfProperty,
                                    updateBasicField,
                                    'ageOfProperty',
                                )}
                                {renderField<'location'>(
                                    'Address',
                                    propertyDetails.location.projectAddress,
                                    updateLocationField,
                                    'projectAddress',
                                )}
                                {renderField<'location'>(
                                    'Launch Date',
                                    propertyDetails.location.launchDate,
                                    updateLocationField,
                                    'launchDate',
                                )}
                            </div>
                            <div className='space-y-4'>
                                {renderField<'location'>(
                                    'Micromarket',
                                    propertyDetails.location.micromarket,
                                    updateLocationField,
                                    'micromarket',
                                )}
                                {renderField<'location'>(
                                    'Coordinates',
                                    `${propertyDetails.location.coordinates.latitude}, ${propertyDetails.location.coordinates.longitude}`,
                                    updateLocationField,
                                    'coordinates',
                                )}
                                {renderField<'basicInfo'>(
                                    'Possession',
                                    propertyDetails.basicInfo.possession,
                                    updateBasicField,
                                    'possession',
                                )}
                                {renderField<'location'>(
                                    'Map Link',
                                    propertyDetails.location.mapLink,
                                    updateLocationField,
                                    'mapLink',
                                )}
                                {renderField<'location'>(
                                    'Handover Date',
                                    propertyDetails.location.handoverDate,
                                    updateLocationField,
                                    'handoverDate',
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Inventory Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Inventory Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField<'basicInfo'>(
                                    'Availability',
                                    propertyDetails.basicInfo.availability,
                                    updateBasicField,
                                    'availability',
                                )}
                                {renderField<'basicInfo'>(
                                    'Overlooking',
                                    propertyDetails.basicInfo.ageOfProperty,
                                    updateBasicField,
                                    'ageOfProperty',
                                )}
                                {renderField<'basicInfo'>(
                                    'Floor Number',
                                    propertyDetails.basicInfo.floorNumber,
                                    updateBasicField,
                                    'floorNumber',
                                )}
                            </div>
                            <div className='space-y-4'>
                                {renderField<'basicInfo'>(
                                    'Facing',
                                    propertyDetails.basicInfo.facing,
                                    updateBasicField,
                                    'facing',
                                    facingOptions,
                                )}
                                {renderField<'basicInfo'>(
                                    'Furnishing',
                                    propertyDetails.basicInfo.furnishing,
                                    updateBasicField,
                                    'furnishing',
                                    furnishingOptions,
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className='mb-8'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-semibold text-black'>Amenities</h2>
                            {isEditing && (
                                <Button bgColor='bg-blue-50' textColor='text-blue-600' className='px-4 h-8 text-sm'>
                                    Edit
                                </Button>
                            )}
                        </div>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                            {propertyDetails.amenitiesAndFeatures.amenities.slice(0, 12).map((amenity, index) => (
                                <div key={index} className='bg-gray-50 px-3 py-2 rounded text-sm text-gray-700'>
                                    {amenity}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* About Project */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>About Project</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                <div>
                                    <label className='text-sm text-gray-600 block mb-1'>Configuration</label>
                                    <div className='text-sm text-black font-medium'>3BHK Flat</div>
                                </div>
                            </div>
                            <div className='space-y-4'>
                                <div>
                                    <label className='text-sm text-gray-600 block mb-1'>Towers and Units</label>
                                    <div className='text-sm text-black font-medium'>
                                        {propertyDetails.projectOverview.totalTowers},{' '}
                                        {propertyDetails.basicInfo.totalUnits} units
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='mt-4'>
                            <p className='text-sm text-gray-700 leading-relaxed'>{propertyDetails.description}</p>
                        </div>
                    </div>

                    {/* Extra Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Extra Details</h2>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-black'>3</div>
                                <div className='text-sm text-gray-600'>Beds</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-black'>3</div>
                                <div className='text-sm text-gray-600'>Baths</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-black'>2</div>
                                <div className='text-sm text-gray-600'>Balconies</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-black'>Semi-Furnished</div>
                                <div className='text-sm text-gray-600'>Furnishing</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default ResaleDetailsPage
