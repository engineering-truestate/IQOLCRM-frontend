import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import editic from '/icons/acn/edit.svg'

import { toast } from 'react-toastify'
import type { AppDispatch } from '../../../store'
import Dropdown from '../../../components/design-elements/Dropdown'
import DateInput from '../../../components/design-elements/DateInputUnixTimestamps'
import NumberInput from '../../../components/design-elements/StateBaseNumberField'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'
import Layout from '../../../layout/Layout'
import Button from '../../../components/design-elements/Button'

const configurationOptions = [
    { label: '1BHK', value: '1BHK' },
    { label: '2BHK', value: '2BHK' },
    { label: '3BHK', value: '3BHK' },
    { label: '4BHK', value: '4BHK' },
    { label: '1BHK Flat', value: '1BHK Flat' },
    { label: '2BHK Flat', value: '2BHK Flat' },
    { label: '3BHK Flat', value: '3BHK Flat' },
    { label: '4BHK Flat', value: '4BHK Flat' },
]

const propertyTypes = [
    { label: 'Apartment', value: 'Apartment' },
    { label: 'Villa', value: 'Villa' },
    { label: 'Plot', value: 'Plot' },
    { label: 'Office', value: 'Office' },
    { label: 'Shop', value: 'Shop' },
    { label: 'Warehouse', value: 'Warehouse' },
]

const furnishingOptions = [
    { label: 'Furnished', value: 'Furnished' },
    { label: 'Semi-Furnished', value: 'Semi-Furnished' },
    { label: 'Unfurnished', value: 'Unfurnished' },
]

const ageOfPropertyOptions = [
    { label: 'New Construction', value: 'New Construction' },
    { label: '1-5 years', value: '1-5 years' },
    { label: '5-10 years', value: '5-10 years' },
    { label: '10+ years', value: '10+ years' },
]

const listingStatusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Rented', value: 'rented' },
]

interface RentalProperty {
    id: string
    projectName: string
    configuration: string
    propertyType: string
    builtUpArea: number
    carpetArea: number
    micromarket: string
    address: string
    price: number
    furnishingStatus: string
    ageOfProperty: string
    postedOn: number
    postedBy: string
    propertyId: string
    url: string
    description: string
    amenities: string[]
    images: string[]
    contactDetails: {
        name: string
        phone: string
        email: string
    }
    listingStatus: string
    deposit: number
    maintenance: number
    availableFrom: number
    preferredTenant: string
    parkingAvailable: boolean
    petsAllowed: boolean
}

// Dummy data for the rental property
const dummyRentalData: RentalProperty = {
    id: 'R87890',
    projectName: 'Sobha Indraprastha',
    configuration: '4BHK Flat',
    propertyType: 'Apartment',
    builtUpArea: 3500,
    carpetArea: 2800,
    micromarket: 'Rajajinagar',
    address: '2400 Rajajinagar, Bangalore',
    price: 85000,
    furnishingStatus: 'Furnished',
    ageOfProperty: '5-10 years',
    postedOn: 1709251200, // March 1, 2024
    postedBy: 'Owner',
    propertyId: 'Sobha',
    url: 'Link',
    description:
        'Sobha Indraprastha is not adobha is a residential project located in the heart of the city, offering a blend of modern living and serene siloom looks surroundings. The project features spacious apartments with contemporary designs and top-notch amenities, ensuring awininioshop atood comfortable and luxurious lifestyle for its residents.',
    amenities: [
        'Swimming Pool',
        'Gym',
        'Playground',
        'Clubhouse',
        'Security',
        'Parking',
        'Garden',
        'Elevator',
        'Power Backup',
        'CCTV Surveillance',
    ],
    images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
    contactDetails: {
        name: 'John Doe',
        phone: '+91 9876543210',
        email: 'john.doe@example.com',
    },
    listingStatus: 'active',
    deposit: 170000,
    maintenance: 5000,
    availableFrom: 1719792000, // July 1, 2024
    preferredTenant: 'Family',
    parkingAvailable: true,
    petsAllowed: false,
}

const RentalDetailsPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const dispatch = useDispatch<AppDispatch>()

    const [propertyDetails, setPropertyDetails] = useState<RentalProperty | null>(null)
    const [originalDetails, setOriginalDetails] = useState<RentalProperty | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Simulate API call with dummy data
        setLoading(true)
        setTimeout(() => {
            setPropertyDetails(dummyRentalData)
            setOriginalDetails(dummyRentalData)
            setLoading(false)
        }, 500)
    }, [id])

    const updateField = (field: string, value: string | number | boolean | null) => {
        if (propertyDetails) {
            setPropertyDetails((prev) => (prev ? { ...prev, [field]: value } : null))
        }
    }

    const updateContactField = (field: string, value: string) => {
        if (propertyDetails) {
            setPropertyDetails((prev) =>
                prev
                    ? {
                          ...prev,
                          contactDetails: {
                              ...prev.contactDetails,
                              [field]: value,
                          },
                      }
                    : null,
            )
        }
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
        setPropertyDetails(originalDetails)
        setIsEditing(false)
    }

    const handleSave = async () => {
        if (propertyDetails && id) {
            try {
                setLoading(true)
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1000))

                setOriginalDetails(propertyDetails)
                setIsEditing(false)
                toast.success('Property details saved successfully')
            } catch (error) {
                toast.error('Error saving property details: ' + (error as Error).message)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleAddAmenity = (amenity: string) => {
        if (propertyDetails && amenity.trim()) {
            const currentAmenities = propertyDetails.amenities || []
            if (!currentAmenities.includes(amenity.trim())) {
                setPropertyDetails((prev) =>
                    prev
                        ? {
                              ...prev,
                              amenities: [...currentAmenities, amenity.trim()],
                          }
                        : null,
                )
            }
        }
    }

    const handleRemoveAmenity = (amenityToRemove: string) => {
        setPropertyDetails((prev) =>
            prev
                ? {
                      ...prev,
                      amenities: (prev.amenities || []).filter((amenity) => amenity !== amenityToRemove),
                  }
                : null,
        )
    }

    const renderField = (
        label: string,
        value: string | number | boolean | null,
        fieldKey: string,
        options?: { label: string; value: string }[],
        fieldType: 'text' | 'date' | 'number' | 'boolean' = 'text',
    ) => {
        if (isEditing) {
            if (options) {
                return (
                    <div>
                        <label className='text-sm text-black block mb-1'>{label}</label>
                        <Dropdown
                            options={options}
                            onSelect={(selectedValue: string) => updateField(fieldKey, selectedValue)}
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
                        onChange={(timestamp: number | null) => {
                            if (timestamp !== null) {
                                updateField(fieldKey, timestamp)
                            }
                        }}
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
                        onChange={(numValue: number | null) => {
                            updateField(fieldKey, numValue ?? 0)
                        }}
                        numberType='decimal'
                        min={0}
                        fullWidth
                    />
                )
            } else if (fieldType === 'boolean') {
                return (
                    <div>
                        <label className='text-sm text-black block mb-1'>{label}</label>
                        <div className='flex items-center space-x-4'>
                            <label className='flex items-center'>
                                <input
                                    type='radio'
                                    name={fieldKey}
                                    checked={value === true}
                                    onChange={() => updateField(fieldKey, true)}
                                    className='mr-2'
                                />
                                Yes
                            </label>
                            <label className='flex items-center'>
                                <input
                                    type='radio'
                                    name={fieldKey}
                                    checked={value === false}
                                    onChange={() => updateField(fieldKey, false)}
                                    className='mr-2'
                                />
                                No
                            </label>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div>
                        <label className='text-sm text-black block mb-1'>{label}</label>
                        <StateBaseTextField
                            value={value?.toString() ?? ''}
                            onChange={(e: any) => updateField(fieldKey, e.target.value)}
                            className='w-full text-sm'
                        />
                    </div>
                )
            }
        } else {
            let displayValue = value?.toString() ?? ''
            if (fieldType === 'date' && typeof value === 'number') {
                displayValue = formatUnixDate(value) ?? ''
            } else if (fieldType === 'boolean') {
                displayValue = value ? 'Yes' : 'No'
            }

            return (
                <div className='border-b border-[#D4DBE2] pb-2 mb-4 flex justify-between'>
                    <label className='text-sm text-gray-600 block mb-1'>{label}</label>
                    <div className='text-sm text-black font-medium'>{displayValue}</div>
                </div>
            )
        }
    }

    if (!propertyDetails) {
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
        <Layout loading={loading}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen'>
                    {/* Header */}
                    <div className='mb-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <div>
                                <h1 className='text-xl font-semibold text-black uppercase'>
                                    {propertyDetails?.projectName}
                                </h1>
                                <div className='text-sm text-gray-500 mt-1'>
                                    <button onClick={() => navigate('/restack/rental')} className='hover:text-gray-700'>
                                        Rental
                                    </button>
                                    <span className='mx-2'>/</span>
                                    <span className='text-black font-medium'>{propertyDetails?.propertyId}</span>
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='px-3 py-1 border-[#0069D0] border-[1px] text-black rounded-[20px] text-sm font-medium'>
                                    Listed by owner
                                </div>
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
                                    <>
                                        <Button
                                            leftIcon={<img src={editic} alt='Edit' className='w-4 h-4' />}
                                            bgColor='bg-[#F3F3F3]'
                                            textColor='text-[#3A3A47]'
                                            className='px-4 h-8 font-semibold'
                                            onClick={handleEdit}
                                        >
                                            Edit Property
                                        </Button>
                                        <Button
                                            leftIcon={<img src={editic} alt='Update Status' className='w-4 h-4' />}
                                            bgColor='bg-black'
                                            textColor='text-white'
                                            className='px-4 h-8 font-semibold'
                                        >
                                            Update Status
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Price Banner */}
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <div className='text-2xl font-bold text-blue-900'>
                                        ₹{propertyDetails?.price?.toLocaleString()}/month
                                    </div>
                                    <div className='text-sm text-blue-700'>
                                        Deposit: ₹{propertyDetails?.deposit?.toLocaleString()} | Maintenance: ₹
                                        {propertyDetails?.maintenance?.toLocaleString()}/month
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <div className='text-lg font-semibold text-gray-900'>
                                        {propertyDetails?.configuration}
                                    </div>
                                    <div className='text-sm text-gray-600'>{propertyDetails?.builtUpArea} sq ft</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Property Overview */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Property Overview</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Project Name', propertyDetails?.projectName, 'projectName')}
                                {renderField(
                                    'Configuration',
                                    propertyDetails?.configuration,
                                    'configuration',
                                    configurationOptions,
                                )}
                                {renderField(
                                    'Property Type',
                                    propertyDetails?.propertyType,
                                    'propertyType',
                                    propertyTypes,
                                )}
                                {renderField(
                                    'Built-up Area',
                                    propertyDetails?.builtUpArea,
                                    'builtUpArea',
                                    undefined,
                                    'number',
                                )}
                            </div>
                            <div className='space-y-4'>
                                {renderField(
                                    'Carpet Area',
                                    propertyDetails?.carpetArea,
                                    'carpetArea',
                                    undefined,
                                    'number',
                                )}
                                {renderField('Micromarket', propertyDetails?.micromarket, 'micromarket')}
                                {renderField('Address', propertyDetails?.address, 'address')}
                                {renderField(
                                    'Furnishing Status',
                                    propertyDetails?.furnishingStatus,
                                    'furnishingStatus',
                                    furnishingOptions,
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rental Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Rental Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Monthly Rent', propertyDetails?.price, 'price', undefined, 'number')}
                                {renderField(
                                    'Security Deposit',
                                    propertyDetails?.deposit,
                                    'deposit',
                                    undefined,
                                    'number',
                                )}
                                {renderField(
                                    'Available From',
                                    propertyDetails?.availableFrom,
                                    'availableFrom',
                                    undefined,
                                    'date',
                                )}
                            </div>
                            <div className='space-y-4'>
                                {renderField(
                                    'Maintenance',
                                    propertyDetails?.maintenance,
                                    'maintenance',
                                    undefined,
                                    'number',
                                )}
                                {renderField('Preferred Tenant', propertyDetails?.preferredTenant, 'preferredTenant')}
                                {renderField(
                                    'Parking Available',
                                    propertyDetails?.parkingAvailable,
                                    'parkingAvailable',
                                    undefined,
                                    'boolean',
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Property Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField(
                                    'Age of Property',
                                    propertyDetails?.ageOfProperty,
                                    'ageOfProperty',
                                    ageOfPropertyOptions,
                                )}
                                {renderField('Posted On', propertyDetails?.postedOn, 'postedOn', undefined, 'date')}
                            </div>
                            <div className='space-y-4'>
                                {renderField('Posted By', propertyDetails?.postedBy, 'postedBy')}
                                {renderField(
                                    'Pets Allowed',
                                    propertyDetails?.petsAllowed,
                                    'petsAllowed',
                                    undefined,
                                    'boolean',
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Contact Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                <div>
                                    <label className='text-sm text-gray-600 block mb-1'>Contact Name</label>
                                    {isEditing ? (
                                        <StateBaseTextField
                                            value={propertyDetails?.contactDetails?.name || ''}
                                            onChange={(e: any) => updateContactField('name', e.target.value)}
                                            className='w-full text-sm'
                                        />
                                    ) : (
                                        <div className='text-sm text-black font-medium border-b border-[#D4DBE2] pb-2'>
                                            {propertyDetails?.contactDetails?.name}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className='text-sm text-gray-600 block mb-1'>Phone</label>
                                    {isEditing ? (
                                        <StateBaseTextField
                                            value={propertyDetails?.contactDetails?.phone || ''}
                                            onChange={(e: any) => updateContactField('phone', e.target.value)}
                                            className='w-full text-sm'
                                        />
                                    ) : (
                                        <div className='text-sm text-black font-medium border-b border-[#D4DBE2] pb-2'>
                                            {propertyDetails?.contactDetails?.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className='space-y-4'>
                                <div>
                                    <label className='text-sm text-gray-600 block mb-1'>Email</label>
                                    {isEditing ? (
                                        <StateBaseTextField
                                            value={propertyDetails?.contactDetails?.email || ''}
                                            onChange={(e: any) => updateContactField('email', e.target.value)}
                                            className='w-full text-sm'
                                        />
                                    ) : (
                                        <div className='text-sm text-black font-medium border-b border-[#D4DBE2] pb-2'>
                                            {propertyDetails?.contactDetails?.email}
                                        </div>
                                    )}
                                </div>
                                {renderField(
                                    'Listing Status',
                                    propertyDetails?.listingStatus,
                                    'listingStatus',
                                    listingStatusOptions,
                                )}
                            </div>
                        </div>
                    </div>

                    {/* About Project */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>About Project</h2>
                        <div>
                            {isEditing ? (
                                <div>
                                    <label className='text-sm text-black block mb-1'>Description</label>
                                    <textarea
                                        value={propertyDetails?.description || ''}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        className='w-full text-sm border border-gray-300 rounded-md p-3 h-32 resize-none'
                                        placeholder='Enter property description'
                                    />
                                </div>
                            ) : (
                                <p className='text-sm text-gray-700 leading-relaxed'>{propertyDetails?.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Amenities</h2>

                        {isEditing && (
                            <div className='mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                                <div className='flex gap-2'>
                                    <StateBaseTextField
                                        placeholder='Add new amenity'
                                        className='flex-1 text-sm'
                                        onKeyPress={(e: any) => {
                                            if (e.key === 'Enter') {
                                                handleAddAmenity(e.target.value)
                                                e.target.value = ''
                                            }
                                        }}
                                    />
                                    <Button
                                        bgColor='bg-blue-600'
                                        textColor='text-white'
                                        className='px-3 py-2 h-10 text-sm'
                                        // onClick={(e: any) => {
                                        //     const input = e.target.parentElement.querySelector('input')
                                        //     if (input) {
                                        //         handleAddAmenity(input.value)
                                        //         input.value = ''
                                        //     }
                                        // }}
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className='flex flex-wrap gap-2'>
                            {propertyDetails?.amenities?.map((amenity, index) => (
                                <div
                                    key={index}
                                    className='flex items-center gap-2 text-sm text-[#101419] px-3 py-1 rounded-2xl bg-[#E9EDF1]'
                                >
                                    <span>{amenity}</span>
                                    {isEditing && (
                                        <button
                                            onClick={() => handleRemoveAmenity(amenity)}
                                            className='text-red-500 hover:text-red-700 ml-1'
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            {(!propertyDetails?.amenities || propertyDetails.amenities.length === 0) && (
                                <div className='text-gray-500 text-sm'>No amenities listed</div>
                            )}
                        </div>
                    </div>

                    {/* Images */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Images</h2>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                            {propertyDetails?.images?.map((image, index) => (
                                <div
                                    key={index}
                                    className='aspect-square bg-gray-200 rounded-lg flex items-center justify-center'
                                >
                                    <span className='text-gray-500 text-sm'>Image {index + 1}</span>
                                </div>
                            ))}
                            {isEditing && (
                                <div className='aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400'>
                                    <span className='text-gray-500 text-sm'>+ Add Image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Property Links */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Links</h2>
                        <div className='space-y-2'>
                            {renderField('Property URL', propertyDetails?.url, 'url')}
                            <div className='text-sm'>
                                <a
                                    href={propertyDetails?.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-blue-600 hover:text-blue-800 underline'
                                >
                                    View Property Listing
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default RentalDetailsPage
