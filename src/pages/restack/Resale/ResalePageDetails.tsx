import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import Dropdown from '../../../components/design-elements/Dropdown'
import NumberInput from '../../../components/design-elements/StateBaseNumberField'
import DateInput from '../../../components/design-elements/DateInputUnixTimestamps'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'

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
    const [imageError, setImageError] = useState<{ [key: string]: boolean }>({})

    const handleImageError = (imageId: string) => {
        setImageError((prev) => ({ ...prev, [imageId]: true }))
    }

    const handleImageLoad = (imageId: string) => {
        setImageError((prev) => ({ ...prev, [imageId]: false }))
    }

    if (!images || images.length === 0) {
        return (
            <div className='mb-6'>
                <div className='w-full h-96 bg-gray-200 rounded flex items-center justify-center'>
                    <span className='text-gray-500'>No images available</span>
                </div>
            </div>
        )
    }

    const currentImage = images[selectedImage] || images[0]

    return (
        <div className='mb-6'>
            {/* Thumbnail Grid - Show all images in two rows */}
            <div className='grid grid-cols-5 gap-3 mb-4'>
                {/* First row - show first 5 images */}
                {images.slice(0, 5).map((image, index) => (
                    <div
                        key={image.id}
                        className={`cursor-pointer rounded overflow-hidden border-2 aspect-[4/3] ${
                            selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedImage(index)}
                    >
                        <img
                            src={image.url}
                            alt={image.alt}
                            className='w-full h-full object-cover'
                            onError={() => handleImageError(image.id)}
                        />
                    </div>
                ))}
            </div>

            {/* Second row if more than 5 images */}
            {images.length > 5 && (
                <div className='grid grid-cols-5 gap-3 mb-4'>
                    {images.slice(5, 9).map((image, index) => (
                        <div
                            key={image.id}
                            className={`cursor-pointer rounded overflow-hidden border-2 aspect-[4/3] ${
                                selectedImage === index + 5 ? 'border-blue-500' : 'border-gray-200'
                            }`}
                            onClick={() => setSelectedImage(index + 5)}
                        >
                            <img
                                src={image.url}
                                alt={image.alt}
                                className='w-full h-full object-cover'
                                onError={() => handleImageError(image.id)}
                            />
                        </div>
                    ))}
                    {/* Show +X more overlay if there are more than 9 images */}
                    {images.length > 9 && (
                        <div className='relative cursor-pointer rounded overflow-hidden border-2 border-gray-200 aspect-[4/3]'>
                            <img
                                src={images[9].url}
                                alt={images[9].alt}
                                className='w-full h-full object-cover'
                                onError={() => handleImageError(images[9].id)}
                            />
                            <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                                <span className='text-white text-sm font-medium'>+{images.length - 9}</span>
                            </div>
                        </div>
                    )}
                    {/* Add Image Button */}
                    <div className='flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400 aspect-[4/3]'>
                        <div className='text-center'>
                            <div className='text-gray-400 text-sm mb-1'>✏️</div>
                            <div className='text-gray-400 text-xs'>Add Image</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const ResaleDetailsPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null)
    const [originalDetails, setOriginalDetails] = useState<PropertyDetails | null>(null)
    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false)
    const [isEditingLocation, setIsEditingLocation] = useState(false)
    const [isEditingInventory, setIsEditingInventory] = useState(false)
    const [isEditingAmenities, setIsEditingAmenities] = useState(false)
    const [loading, setLoading] = useState(true)

    // Load property data based on id
    useEffect(() => {
        if (id) {
            setLoading(true)
            try {
                const property = getPropertyById(id) || propertyDetailsData
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
    const updateField = (field: string, value: string | number | null) => {
        setPropertyDetails((prev) => {
            if (!prev) return null
            const keys = field.split('.')
            const updatedDetails = { ...prev }

            if (keys.length === 2) {
                const [section, key] = keys
                if (section === 'basicInfo') {
                    updatedDetails.basicInfo = {
                        ...updatedDetails.basicInfo,
                        [key]: value,
                    }
                } else if (section === 'location') {
                    updatedDetails.location = {
                        ...updatedDetails.location,
                        [key]: value,
                    }
                } else if (section === 'amenitiesAndFeatures') {
                    updatedDetails.amenitiesAndFeatures = {
                        ...updatedDetails.amenitiesAndFeatures,
                        [key]: value,
                    }
                }
            }
            return updatedDetails
        })
    }

    // Generic handle edit for sections
    const handleEditSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(true)
    }

    // Generic handle cancel for sections
    const handleCancelSection = (
        setter: React.Dispatch<React.SetStateAction<boolean>>,
        originalData: PropertyDetails | null,
    ) => {
        setter(false)
        setPropertyDetails(originalData)
    }

    // Generic handle save for sections
    const handleSaveSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(false)
        setOriginalDetails(propertyDetails)
        // Here you would typically make an API call to save the changes
        console.log('Saving property details:', propertyDetails)
    }

    // Helper for rendering info rows (same as primary details)
    const renderInfoRow = (
        label1: string,
        value1: string | undefined,
        label2: string,
        value2: string | undefined,
        fieldKey1?: string,
        fieldKey2?: string,
        options1?: { label: string; value: string }[],
        options2?: { label: string; value: string }[],
        type1: 'text' | 'date' | 'link' | 'number' = 'text',
        type2: 'text' | 'date' | 'link' | 'number' = 'text',
        onClick1?: () => void,
        onClick2?: () => void,
        classNameOverride?: string,
        isSectionEditable: boolean = false,
    ) => {
        const renderField = (
            label: string,
            value: string | undefined,
            fieldKey: string | undefined,
            options?: { label: string; value: string }[],
            type: 'text' | 'date' | 'link' | 'number' = 'text',
            onClick?: () => void,
        ) => {
            const displayValue = value || ''
            return (
                <div
                    className={`flex flex-col gap-1 border-t border-solid border-t-[#d4dbe2] py-4 ${classNameOverride?.includes('pr-') ? '' : 'pr-2'}`}
                >
                    <p className='text-[#5c738a] text-sm font-normal leading-normal'>{label}</p>
                    {isSectionEditable && fieldKey ? (
                        options ? (
                            <Dropdown
                                options={options}
                                defaultValue={value || ''}
                                onSelect={(optionValue: string) => updateField(fieldKey, optionValue)}
                                className='w-full'
                                optionClassName='text-base'
                            />
                        ) : type === 'date' ? (
                            <StateBaseTextField
                                type='date'
                                value={value || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    updateField(fieldKey, e.target.value)
                                }
                                className='h-9 text-base'
                            />
                        ) : type === 'number' ? (
                            <StateBaseTextField
                                type='number'
                                value={value || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    updateField(fieldKey, e.target.value)
                                }
                                className='h-9 text-base'
                            />
                        ) : (
                            <StateBaseTextField
                                value={value || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    updateField(fieldKey, e.target.value)
                                }
                                className='h-9 text-base'
                            />
                        )
                    ) : type === 'link' &&
                      value &&
                      onClick &&
                      (value.startsWith('http') ||
                          (value.startsWith('/') && !onClick.toString().includes('navigate'))) ? (
                        <a
                            href={value}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 underline text-sm font-medium leading-normal'
                            onClick={onClick}
                        >
                            {displayValue}
                        </a>
                    ) : type === 'link' && onClick ? (
                        <button
                            onClick={onClick}
                            className='text-blue-600 underline text-sm font-medium leading-normal text-left cursor-pointer'
                        >
                            {displayValue}
                        </button>
                    ) : (
                        <p className='text-[#101418] text-sm font-normal leading-normal'>{displayValue}</p>
                    )}
                </div>
            )
        }

        return (
            <>
                <div
                    className={`${classNameOverride && classNameOverride.includes('col-span-2') ? classNameOverride : ''}`}
                >
                    {renderField(label1, value1, fieldKey1, options1, type1, onClick1)}
                </div>
                {!classNameOverride?.includes('col-span-2') && (
                    <div className={'pl-2'}>{renderField(label2, value2, fieldKey2, options2, type2, onClick2)}</div>
                )}
            </>
        )
    }

    if (loading || !propertyDetails) {
        return <Layout loading={true}>Loading property details...</Layout>
    }

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-2'>
                        <div className='flex items-center justify-between mb-4'>
                            <h1 className='text-xl font-semibold text-gray-900'>Property Details</h1>
                        </div>
                    </div>
                    <hr className='border-gray-200 mb-4 w-full' />

                    {/* Property Status and Price Header */}
                    <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
                        <div className='flex items-center gap-2 mb-2'>
                            <span className='bg-green-100 text-green-800 text-xs px-2 py-1 rounded'>
                                {propertyDetails.status}
                            </span>
                            <span className='text-lg font-semibold text-black'>{propertyDetails.basicInfo.price}</span>
                        </div>
                        <h2 className='text-xl font-semibold text-black'>{propertyDetails.title}</h2>
                        <div className='text-sm text-gray-500 mt-1'>
                            <button onClick={() => navigate('/restack/resale')} className='hover:text-gray-700'>
                                Resale
                            </button>
                            <span className='mx-2'>/</span>
                            <span className='text-black font-medium'>{propertyDetails.id}</span>
                        </div>
                    </div>

                    {/* Property Images */}
                    <ImageGallery images={propertyDetails.images} />

                    {/* Property Overview */}
                    <div className='flex items-center justify-between px-4 pb-3 pt-5'>
                        <h2 className='text-xl font-semibold text-gray-900'>Property Overview</h2>
                        <div className='flex items-center gap-2'>
                            {isEditingBasicInfo ? (
                                <>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 mr-2'
                                        onClick={() => handleCancelSection(setIsEditingBasicInfo, originalDetails)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                                        onClick={() => handleSaveSection(setIsEditingBasicInfo)}
                                    >
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    onClick={() => handleEditSection(setIsEditingBasicInfo)}
                                >
                                    <img src={editic} alt='edit' className='w-4 h-4 mr-2' />
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Project Name',
                            propertyDetails.basicInfo.projectName,
                            'Property Type',
                            propertyDetails.basicInfo.propertyType,
                            'basicInfo.projectName',
                            'basicInfo.propertyType',
                            undefined,
                            propertyTypes,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            isEditingBasicInfo,
                        )}
                        {renderInfoRow(
                            'Sub Type',
                            propertyDetails.basicInfo.subType,
                            'Configuration',
                            propertyDetails.basicInfo.configuration,
                            'basicInfo.subType',
                            'basicInfo.configuration',
                            subTypes,
                            configurations,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            isEditingBasicInfo,
                        )}
                        {renderInfoRow(
                            'Price',
                            propertyDetails.basicInfo.price,
                            'Price per sq ft',
                            propertyDetails.basicInfo.pricePerSqFt,
                            'basicInfo.price',
                            'basicInfo.pricePerSqFt',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            isEditingBasicInfo,
                        )}
                        {renderInfoRow(
                            'RERA ID',
                            propertyDetails.basicInfo.reraId,
                            'Project Size',
                            propertyDetails.basicInfo.projectSize,
                            'basicInfo.reraId',
                            'basicInfo.projectSize',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            isEditingBasicInfo,
                        )}
                        {renderInfoRow(
                            'Super Built-up Area',
                            propertyDetails.basicInfo.superBuiltUpArea,
                            'Carpet Area',
                            propertyDetails.basicInfo.carpetArea,
                            'basicInfo.superBuiltUpArea',
                            'basicInfo.carpetArea',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            isEditingBasicInfo,
                        )}
                        {renderInfoRow(
                            'Total Units',
                            propertyDetails.basicInfo.totalUnits,
                            'Developer',
                            propertyDetails.basicInfo.developer,
                            'basicInfo.totalUnits',
                            'basicInfo.developer',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            isEditingBasicInfo,
                        )}
                        {renderInfoRow(
                            'Possession',
                            propertyDetails.basicInfo.possession,
                            'Age of Property',
                            propertyDetails.basicInfo.ageOfProperty,
                            'basicInfo.possession',
                            'basicInfo.ageOfProperty',
                            statusOptions,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            isEditingBasicInfo,
                        )}
                    </div>

                    {/* Location and Timeline */}
                    <div className='flex items-center justify-between px-4 pb-3 pt-5'>
                        <h2 className='text-xl font-semibold text-gray-900'>Location and Timeline</h2>
                        <div className='flex items-center gap-2'>
                            {isEditingLocation ? (
                                <>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 mr-2'
                                        onClick={() => handleCancelSection(setIsEditingLocation, originalDetails)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                                        onClick={() => handleSaveSection(setIsEditingLocation)}
                                    >
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    onClick={() => handleEditSection(setIsEditingLocation)}
                                >
                                    <img src={editic} alt='edit' className='w-4 h-4 mr-2' />
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Project Address',
                            propertyDetails.location.projectAddress,
                            'Area',
                            propertyDetails.location.area,
                            'location.projectAddress',
                            'location.area',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            isEditingLocation,
                        )}
                        {renderInfoRow(
                            'Micromarket',
                            propertyDetails.location.micromarket,
                            'Launch Date',
                            propertyDetails.location.launchDate,
                            'location.micromarket',
                            'location.launchDate',
                            undefined,
                            undefined,
                            'text',
                            'date',
                            undefined,
                            undefined,
                            undefined,
                            isEditingLocation,
                        )}
                        {renderInfoRow(
                            'Handover Date',
                            propertyDetails.location.handoverDate,
                            'Map Link',
                            'View on Map',
                            'location.handoverDate',
                            undefined,
                            undefined,
                            undefined,
                            'date',
                            'link',
                            undefined,
                            () => window.open(propertyDetails.location.mapLink, '_blank'),
                            undefined,
                            isEditingLocation,
                        )}
                        {renderInfoRow(
                            'Coordinates',
                            `${propertyDetails.location.coordinates.latitude}, ${propertyDetails.location.coordinates.longitude}`,
                            '',
                            '',
                            'location.coordinates',
                            undefined,
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            'col-span-2 pr-[50%]',
                            isEditingLocation,
                        )}
                    </div>

                    {/* Inventory Details */}
                    <div className='flex items-center justify-between px-4 pb-3 pt-5'>
                        <h2 className='text-xl font-semibold text-gray-900'>Inventory Details</h2>
                        <div className='flex items-center gap-2'>
                            {isEditingInventory ? (
                                <>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 mr-2'
                                        onClick={() => handleCancelSection(setIsEditingInventory, originalDetails)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                                        onClick={() => handleSaveSection(setIsEditingInventory)}
                                    >
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    onClick={() => handleEditSection(setIsEditingInventory)}
                                >
                                    <img src={editic} alt='edit' className='w-4 h-4 mr-2' />
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Availability',
                            propertyDetails.basicInfo.availability,
                            'Floor Number',
                            propertyDetails.basicInfo.floorNumber,
                            'basicInfo.availability',
                            'basicInfo.floorNumber',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            isEditingInventory,
                        )}
                        {renderInfoRow(
                            'Facing',
                            propertyDetails.basicInfo.facing,
                            'Furnishing',
                            propertyDetails.basicInfo.furnishing,
                            'basicInfo.facing',
                            'basicInfo.furnishing',
                            facingOptions,
                            furnishingOptions,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            isEditingInventory,
                        )}
                    </div>

                    {/* Amenities */}
                    <div className='flex items-center justify-between px-4 pb-3 pt-5'>
                        <h2 className='text-xl font-semibold text-gray-900'>Amenities</h2>
                        <div className='flex items-center gap-2'>
                            {isEditingAmenities ? (
                                <>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 mr-2'
                                        onClick={() => handleCancelSection(setIsEditingAmenities, originalDetails)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                                        onClick={() => handleSaveSection(setIsEditingAmenities)}
                                    >
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    onClick={() => handleEditSection(setIsEditingAmenities)}
                                >
                                    <img src={editic} alt='edit' className='w-4 h-4 mr-2' />
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>
                    {isEditingAmenities ? (
                        <div className='flex flex-wrap gap-3 p-3 pr-4'>
                            <textarea
                                value={propertyDetails?.amenitiesAndFeatures?.amenities?.join(', ')}
                                onChange={(e) =>
                                    setPropertyDetails((prev) =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  amenitiesAndFeatures: {
                                                      ...prev.amenitiesAndFeatures,
                                                      amenities: e.target.value.split(',').map((s) => s.trim()),
                                                  },
                                              }
                                            : null,
                                    )
                                }
                                className='w-full h-auto text-base border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='Enter amenities separated by commas'
                                rows={3}
                            />
                        </div>
                    ) : (
                        <div className='flex flex-wrap gap-3 p-3 pr-4'>
                            {propertyDetails?.amenitiesAndFeatures?.amenities?.map((amenity: string, index: number) => (
                                <div
                                    key={index}
                                    className='flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#e9edf1] pl-4 pr-4'
                                >
                                    <p className='text-[#101419] text-sm font-medium leading-normal'>{amenity}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* About Project */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>About Project</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Configuration',
                            '3BHK Flat',
                            'Towers and Units',
                            `${propertyDetails.projectOverview.totalTowers}, ${propertyDetails.basicInfo.totalUnits} units`,
                        )}
                    </div>
                    <div className='p-4'>
                        <div className='border-t border-solid border-t-[#d4dbe2] py-4'>
                            <p className='text-[#5c738a] text-sm font-normal leading-normal mb-2'>Description</p>
                            <p className='text-[#101418] text-sm font-normal leading-normal'>
                                {propertyDetails.description}
                            </p>
                        </div>
                    </div>

                    {/* Extra Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Property Features</h2>
                    <div className='p-4'>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-solid border-t-[#d4dbe2] py-4'>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-[#101418]'>3</div>
                                <div className='text-sm text-[#5c738a]'>Baths</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-[#101418]'>2</div>
                                <div className='text-sm text-[#5c738a]'>Balconies</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-[#101418]'>
                                    {propertyDetails.basicInfo.furnishing}
                                </div>
                                <div className='text-sm text-[#5c738a]'>Furnishing</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default ResaleDetailsPage
