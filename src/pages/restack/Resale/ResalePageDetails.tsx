import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import Dropdown from '../../../components/design-elements/Dropdown'
import NumberInput from '../../../components/design-elements/StateBaseNumberField'
import DateInput from '../../../components/design-elements/DateInputUnixTimestamps'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'
import editic from '/icons/acn/edit.svg'

import type { RestackResaleProperty } from '../../../data_types/restack/restack-resale'
import {
    get99AcresResaleDataById,
    getACNResaleDataById,
    getHousingResaleDataById,
    getMagicBricksResaleDataById,
    getMyGateResaleDataById,
    update99AcresResaleDataById,
    updateACNResaleDataById,
    updateHousingResaleDataById,
    updateMagicBricksResaleDataById,
    updateMyGateResaleDataById,
} from '../../../services/restack/resaleService'
import { FlexibleTable } from '../../../components/design-elements/FlexibleTable'

// Property type options
const propertyTypes = [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Plotted', value: 'Plotted' },
]

const subTypes = [
    { label: 'Flat', value: 'Flat' },
    { label: 'Villa', value: 'Villa' },
    { label: 'Plot', value: 'Plot' },
    { label: 'House', value: 'House' },
    { label: 'Office', value: 'Office' },
]

const configurations = [
    { label: '1 BHK', value: '1 BHK' },
    { label: '2 BHK', value: '2 BHK' },
    { label: '3 BHK', value: '3 BHK' },
    { label: '4 BHK', value: '4 BHK' },
    { label: '5 BHK', value: '5 BHK' },
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
const ImageGallery = ({ images }: { images?: any[] }) => {
    const [selectedImage, setSelectedImage] = useState(0)
    const [, setImageError] = useState<{ [key: string]: boolean }>({})

    const handleImageError = (imageId: string) => {
        setImageError((prev) => ({ ...prev, [imageId]: true }))
    }

    // const handleImageLoad = (imageId: string) => {
    //     setImageError((prev) => ({ ...prev, [imageId]: false }))
    // }

    if (!images || images.length === 0) {
        return (
            <div className='mb-6'>
                <div className='w-full h-96 bg-gray-200 rounded flex items-center justify-center'>
                    <span className='text-gray-500'>No images available</span>
                </div>
            </div>
        )
    }

    // const currentImage = images[selectedImage] || images[0]

    return (
        <div className='mb-6'>
            {/* Thumbnail Grid - Show all images in two rows */}
            <div className='grid grid-cols-5 gap-3 mb-4'>
                {/* First row - show first 5 images */}
                {images.slice(0, 5).map((image, index) => (
                    <div
                        key={image.id || index}
                        className={`cursor-pointer rounded overflow-hidden border-2 aspect-[4/3] ${
                            selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedImage(index)}
                    >
                        <img
                            src={image.url || image}
                            alt={image.alt || `Property image ${index + 1}`}
                            className='w-full h-full object-cover'
                            onError={() => handleImageError(image.id || index.toString())}
                        />
                    </div>
                ))}
            </div>

            {/* Second row if more than 5 images */}
            {images.length > 5 && (
                <div className='grid grid-cols-5 gap-3 mb-4'>
                    {images.slice(5, 9).map((image, index) => (
                        <div
                            key={image.id || index + 5}
                            className={`cursor-pointer rounded overflow-hidden border-2 aspect-[4/3] ${
                                selectedImage === index + 5 ? 'border-blue-500' : 'border-gray-200'
                            }`}
                            onClick={() => setSelectedImage(index + 5)}
                        >
                            <img
                                src={image.url || image}
                                alt={image.alt || `Property image ${index + 6}`}
                                className='w-full h-full object-cover'
                                onError={() => handleImageError(image.id || (index + 5).toString())}
                            />
                        </div>
                    ))}
                    {/* Show +X more overlay if there are more than 9 images */}
                    {images.length > 9 && (
                        <div className='relative cursor-pointer rounded overflow-hidden border-2 border-gray-200 aspect-[4/3]'>
                            <img
                                src={images[9].url || images[9]}
                                alt={images[9].alt || 'Property image 10'}
                                className='w-full h-full object-cover'
                                onError={() => handleImageError(images[9].id || '9')}
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
    const { type, id } = useParams()

    const [propertyDetails, setPropertyDetails] = useState<RestackResaleProperty | null>(null)
    const [originalDetails, setOriginalDetails] = useState<RestackResaleProperty | null>(null)
    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false)
    const [isEditingLocation, setIsEditingLocation] = useState(false)
    const [isEditingInventory, setIsEditingInventory] = useState(false)
    const [isEditingAmenities, setIsEditingAmenities] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                setLoading(true)
                let data: RestackResaleProperty[] = []

                switch (type) {
                    case '99acres': {
                        const result99 = await get99AcresResaleDataById(String(id))
                        data = result99 ? (Array.isArray(result99) ? result99 : [result99]) : []
                        break
                    }
                    case 'magicbricks': {
                        const resultMagicBricks = await getMagicBricksResaleDataById(String(id))
                        data = resultMagicBricks
                            ? Array.isArray(resultMagicBricks)
                                ? resultMagicBricks
                                : [resultMagicBricks]
                            : []
                        break
                    }
                    case 'ACN': {
                        const resultACN = await getACNResaleDataById(String(id))
                        data = resultACN ? (Array.isArray(resultACN) ? resultACN : [resultACN]) : []
                        break
                    }
                    case 'myGate': {
                        const resultmyGate = await getMyGateResaleDataById(String(id))
                        data = resultmyGate ? (Array.isArray(resultmyGate) ? resultmyGate : [resultmyGate]) : []
                        break
                    }
                    case 'Housing': {
                        const resultHousing = await getHousingResaleDataById(String(id))
                        data = resultHousing ? (Array.isArray(resultHousing) ? resultHousing : [resultHousing]) : []
                        break
                    }
                    default:
                        console.error('Invalid resale type:', type)
                        return
                }

                if (!data || data.length === 0) {
                    console.error(`No data found for ${type} with id:`, id)
                    return
                }

                setPropertyDetails(data[0])
                setOriginalDetails(data[0])
            } catch (error) {
                console.error('Error fetching property data:', error)
                setPropertyDetails(null)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [type, id])

    // Handle field updates with types
    const updateField = (field: string, value: string | number | null) => {
        setPropertyDetails((prev) => {
            if (!prev) return null
            const keys = field.split('.')
            const updatedDetails = { ...prev }

            if (keys.length === 1) {
                ;(updatedDetails as any)[keys[0]] = value
            } else if (keys.length === 2) {
                const [section, key] = keys
                if ((updatedDetails as any)[section]) {
                    ;(updatedDetails as any)[section] = {
                        ...(updatedDetails as any)[section],
                        [key]: value,
                    }
                } else {
                    ;(updatedDetails as any)[key] = value
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
        originalData: RestackResaleProperty | null,
    ) => {
        setter(false)
        setPropertyDetails(originalData)
    }

    // Generic handle save for sections
    const handleSaveSection = async (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(false)
        setOriginalDetails(propertyDetails)
        switch (type) {
            case '99acres':
                await update99AcresResaleDataById(String(id), originalDetails as RestackResaleProperty)
                break

            case 'magicbricks':
                await updateMagicBricksResaleDataById(String(id), originalDetails as RestackResaleProperty)
                break
            case 'ACN':
                await updateACNResaleDataById(String(id), originalDetails as RestackResaleProperty)
                break
            case 'myGate':
                await updateMyGateResaleDataById(String(id), originalDetails as RestackResaleProperty)
                break
            case 'Housing':
                await updateHousingResaleDataById(String(id), originalDetails as RestackResaleProperty)
                break

            default:
                console.error('Invalid resale type:', type)
                return
        }
    }

    // Helper for rendering info rows
    const renderField = (
        label: string,
        value: string | number | null,
        fieldKey: string,
        options?: { label: string; value: string }[],
        fieldType: 'text' | 'date' | 'number' = 'text',
        isEditing: boolean = false,
    ) => {
        if (isEditing) {
            if (options) {
                return (
                    <div>
                        <label className='text-sm text-black block mb-1'>{label}</label>
                        <Dropdown
                            options={options}
                            onSelect={(selectedValue) => updateField(fieldKey, selectedValue)}
                            defaultValue={value as string}
                            placeholder={`Select ${label}`}
                            className='relative w-full'
                            triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                            menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                            optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                        />
                    </div>
                )
            } else if (fieldType === 'date') {
                return (
                    <DateInput
                        label={label}
                        placeholder='Select date'
                        value={value as number | null}
                        onChange={(timestamp) => updateField(fieldKey, timestamp)}
                        minDate={new Date().toISOString().split('T')[0]}
                        fullWidth
                    />
                )
            } else if (fieldType === 'number') {
                return (
                    <NumberInput
                        label={label}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        value={value as number}
                        onChange={(numValue) => updateField(fieldKey, numValue ?? 0)}
                        numberType='decimal'
                        min={0}
                        fullWidth
                    />
                )
            } else {
                return (
                    <div>
                        <label className='text-sm text-black block mb-1'>{label}</label>
                        <StateBaseTextField
                            value={value?.toString() ?? ''}
                            onChange={(e) => updateField(fieldKey, e.target.value)}
                            className='w-full text-sm'
                        />
                    </div>
                )
            }
        } else {
            let displayValue = value?.toString() ?? ''
            if (fieldType === 'date' && typeof value === 'number') {
                displayValue = formatUnixDate(value) ?? ''
            }

            return (
                <div className=' border-b border-gray-200 pb-2 mb-4'>
                    <label className='text-sm text-gray-600 block mb-1'>{label}</label>
                    <div className='text-sm text-black font-medium'>{displayValue}</div>
                </div>
            )
        }
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
                    <div className='mb-6 p-4  rounded-lg'>
                        <div className='flex items-center justify-between gap-2 mb-2'>
                            <span className='bg-green-100 text-green-800 text-xs px-2 py-1 rounded'>
                                {propertyDetails.status}
                            </span>
                            <span className='text-sm text-gray-600 border-1 rounded-[20px] border-[#0069D0] px-2 py-1'>
                                Listed by {propertyDetails.postedBy}
                            </span>
                        </div>
                        <div className='flex items-center justify-between mb-2'>
                            <h2 className='text-xl font-semibold text-black'>{propertyDetails.projectName}</h2>
                            <span className='text-lg font-semibold text-black'>{propertyDetails.price}</span>
                        </div>
                        <div className='text-sm text-gray-500 mt-1'>
                            <button onClick={() => navigate(`/restack/resale/${type}`)} className='hover:text-gray-700'>
                                Resale
                            </button>
                            <span className='mx-2'>/</span>
                            <span className='text-black font-medium'>{propertyDetails.propertyId}</span>
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
                                <button className='h-9 w-9' onClick={() => handleEditSection(setIsEditingBasicInfo)}>
                                    <img src={editic} alt='edit' className='w-6 h-6 mr-2' />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className='p-4 grid grid-cols-2 gap-4'>
                        {renderField(
                            'Property ID',
                            propertyDetails.propertyId || '',
                            'propertyId',
                            undefined,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Project Name',
                            propertyDetails.projectName || '',
                            'projectName',
                            undefined,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Property Type',
                            propertyDetails.propertyType || '',
                            'propertyType',
                            propertyTypes,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Sub Type',
                            propertyDetails.subType || '',
                            'subType',
                            subTypes,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Configuration',
                            propertyDetails.configuration || '',
                            'configuration',
                            configurations,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Price',
                            propertyDetails.price?.toString() || '',
                            'price',
                            undefined,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Price per sq ft',
                            propertyDetails.pricePerSqft?.toString() || '',
                            'pricePerSqft',
                            undefined,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'RERA ID',
                            propertyDetails.reraId || '',
                            'reraId',
                            undefined,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Project Size',
                            propertyDetails.projectSize || '',
                            'projectSize',
                            undefined,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Super Built-up Area',
                            propertyDetails.superBuiltUpArea?.toString() || '',
                            'superBuiltUpArea',
                            undefined,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Carpet Area',
                            propertyDetails.carpetArea || '',
                            'carpetArea',
                            undefined,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Total Units',
                            propertyDetails.totalUnits?.toString() || '',
                            'totalUnits',
                            undefined,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Developer',
                            propertyDetails.developerName || '',
                            'developerName',
                            undefined,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Possession',
                            propertyDetails.handoverDate?.toString() || '',
                            'handoverDate',
                            statusOptions,
                            'text',
                            isEditingBasicInfo,
                        )}
                        {renderField(
                            'Age of Property',
                            propertyDetails.ageOfProperty || '',
                            'ageOfProperty',
                            undefined,
                            'text',
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
                                <button
                                    className='h-9 px-4 cursor-pointer '
                                    onClick={() => handleEditSection(setIsEditingLocation)}
                                >
                                    <img src={editic} alt='edit' className='w-6 h-6 mr-2' />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className='p-4 grid grid-cols-2 gap-4'>
                        {renderField(
                            'Project Address',
                            propertyDetails.address || '',
                            'projectAddress',
                            undefined,
                            'text',
                            isEditingLocation,
                        )}
                        {renderField('Area', propertyDetails.area || '', 'area', undefined, 'text', isEditingLocation)}
                        {renderField(
                            'Micromarket',
                            propertyDetails.micromarket || '',
                            'micromarket',
                            undefined,
                            'text',
                            isEditingLocation,
                        )}
                        {renderField(
                            'Launch Date',
                            propertyDetails.launchDate?.toString() || '',
                            'launchDate',
                            undefined,
                            'date',
                            isEditingLocation,
                        )}
                        {renderField(
                            'Handover Date',
                            propertyDetails.handoverDate?.toString() || '',
                            'handoverDate',
                            undefined,
                            'date',
                            isEditingLocation,
                        )}
                        {renderField('Map Link', 'View on Map', 'maplink', undefined, 'text', isEditingLocation)}
                        {renderField(
                            'Coordinates',
                            `${propertyDetails.lat}, ${propertyDetails.long}`,
                            'coordinates',
                            undefined,
                            'text',
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
                                <button
                                    className='h-9 px-4 cursor-pointer '
                                    onClick={() => handleEditSection(setIsEditingInventory)}
                                >
                                    <img src={editic} alt='edit' className='w-6 h-6 mr-2' />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className='p-4 grid grid-cols-2 gap-4'>
                        {renderField(
                            'Availability',
                            propertyDetails.inventoryDetails?.availability || '',
                            'inventoryDetails.availability',
                            undefined,
                            'text',
                            isEditingInventory,
                        )}
                        {renderField(
                            'Floor Number',
                            propertyDetails.inventoryDetails?.floorNumber?.toString() || '',
                            'inventoryDetails.floorNumber',
                            undefined,
                            'text',
                            isEditingInventory,
                        )}
                        {renderField(
                            'Facing',
                            propertyDetails.inventoryDetails?.facing || '',
                            'inventoryDetails.facing',
                            facingOptions,
                            'text',
                            isEditingInventory,
                        )}
                        {renderField(
                            'Furnishing',
                            propertyDetails.extraDetails?.furnishing || '',
                            'extraDetails.furnishing',
                            furnishingOptions,
                            'text',
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
                                <button
                                    className='h-9 px-4 cursor-pointer '
                                    onClick={() => handleEditSection(setIsEditingAmenities)}
                                >
                                    <img src={editic} alt='edit' className='w-6 h-6 mr-2' />
                                </button>
                            )}
                        </div>
                    </div>
                    {isEditingAmenities ? (
                        <div>
                            <textarea
                                value={propertyDetails?.amenities?.join(', ')}
                                onChange={(e) =>
                                    setPropertyDetails((prev) =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  amenities: e.target.value.split(',').map((s) => s.trim()),
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
                            {propertyDetails?.amenities?.map((amenity: string, index: number) => (
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
                    <div className='p-4 grid grid-cols-2 gap-4'>
                        {renderField(
                            'Configuration',
                            propertyDetails.aboutProject?.configuration || propertyDetails.configuration || '',
                            'aboutProject.configuration',
                            undefined,
                            'text',
                            false,
                        )}
                        {renderField(
                            'Towers and Units',
                            propertyDetails.aboutProject?.towersandunits || `${propertyDetails.totalUnits} units` || '',
                            'aboutProject.towersandunits',
                            undefined,
                            'text',
                            false,
                        )}
                    </div>
                    <div className='p-4'>
                        <div className='border-t border-solid border-t-[#d4dbe2] py-4'>
                            <p className='text-[#5c738a] text-sm font-normal leading-normal mb-2'>Description</p>
                            <p className='text-[#101418] text-sm font-normal leading-normal'>
                                {propertyDetails.aboutProject?.description || 'No description available'}
                            </p>
                        </div>
                    </div>

                    {/* Extra Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Extra Details</h2>
                    <div className='p-4'>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-solid border-t-[#d4dbe2] py-4'>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-[#101418]'>
                                    {propertyDetails.extraDetails?.baths || 'N/A'}
                                </div>
                                <div className='text-sm text-[#5c738a]'>Baths</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-[#101418]'>
                                    {propertyDetails.extraDetails?.balconies || 'N/A'}
                                </div>
                                <div className='text-sm text-[#5c738a]'>Balconies</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-[#101418]'>
                                    {propertyDetails.extraDetails?.furnishing || 'N/A'}
                                </div>
                                <div className='text-sm text-[#5c738a]'>Furnishing</div>
                            </div>
                        </div>
                    </div>
                    <div className='p-4'>
                        <FlexibleTable
                            data={propertyDetails.priceHistory || []}
                            columns={[
                                { key: 'date', header: 'Date' },
                                { key: 'price', header: 'Price' },
                            ]}
                            className='mt-4'
                        />
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export { ResaleDetailsPage }
