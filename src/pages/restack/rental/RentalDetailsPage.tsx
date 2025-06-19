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

const tenantTypeOptions = [
    { label: 'Family', value: 'Family' },
    { label: 'Bachelor', value: 'Bachelor' },
    { label: 'Company', value: 'Company' },
    { label: 'Any', value: 'Any' },
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
    images: Array<{
        id: string
        url: string
        alt: string
    }>
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
    floorNumber?: string
    totalFloors?: string
}

// Dummy data for the rental property
const dummyRentalData: RentalProperty = {
    id: 'R87890',
    projectName: 'Sobha Indraprastha',
    configuration: '4BHK',
    propertyType: 'Apartment',
    builtUpArea: 3500,
    carpetArea: 2800,
    micromarket: 'Rajajinagar',
    address: '2400',
    price: 85000,
    furnishingStatus: 'Furnished',
    ageOfProperty: '5',
    postedOn: 1709251200, // March 1, 2024
    postedBy: 'Owner',
    propertyId: 'Sobha',
    url: 'Link',
    description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent auctor purus luctus enim egestas, ac scelerisque ante pulvinar. Donec ut rhoncus ex, faucibus lacus velit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent auctor purus luctus enim egestas, ac scelerisque ante pulvinar. Donec ut rhoncus ex, faucibus lacus velit. Suspendisse ac rhoncus nisl, eu tempor urna. Curabitur vel bibendum lorem. Morbi convallis convallis diam sit amet lacinia. Aliquam in rhoncus nunc.',
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
    images: [
        { id: '1', url: 'image1.jpg', alt: 'Property Image 1' },
        { id: '2', url: 'image2.jpg', alt: 'Property Image 2' },
        { id: '3', url: 'image3.jpg', alt: 'Property Image 3' },
    ],
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
    floorNumber: '15',
    totalFloors: '25',
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
        setPropertyDetails((prev) => {
            if (!prev) return null
            const keys = field.split('.')
            const updatedDetails = { ...prev }

            if (keys.length === 2) {
                const [section, key] = keys
                if (section === 'contactDetails') {
                    updatedDetails.contactDetails = {
                        ...updatedDetails.contactDetails,
                        [key]: value,
                    }
                }
            } else {
                ;(updatedDetails as any)[field] = value
            }
            return updatedDetails
        })
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

    // Helper for rendering property detail rows in two-column layout
    const renderPropertyRow = (
        leftLabel: string,
        leftValue: string | number | boolean | undefined,
        rightLabel: string,
        rightValue: string | number | boolean | undefined,
        leftField?: string,
        rightField?: string,
        leftOptions?: { label: string; value: string }[],
        rightOptions?: { label: string; value: string }[],
        leftType: 'text' | 'date' | 'number' | 'boolean' = 'text',
        rightType: 'text' | 'date' | 'number' | 'boolean' = 'text',
    ) => {
        const formatValue = (value: string | number | boolean | undefined, type: string) => {
            if (value === undefined || value === null || value === '') return ''
            if (type === 'date' && typeof value === 'number') {
                return formatUnixDate(value) || ''
            } else if (type === 'boolean') {
                return value ? 'Yes' : 'No'
            } else if (type === 'number' && typeof value === 'number') {
                return value.toLocaleString()
            }
            return value.toString()
        }

        const renderField = (
            label: string,
            value: string | number | boolean | undefined,
            field?: string,
            options?: { label: string; value: string }[],
            type: 'text' | 'date' | 'number' | 'boolean' = 'text',
        ) => {
            if (isEditing && field) {
                if (options) {
                    return (
                        <div className='mb-6'>
                            <p className='text-sm text-black mb-2'>{label}</p>
                            <Dropdown
                                options={options}
                                defaultValue={value?.toString() || ''}
                                onSelect={(selectedValue: string) => updateField(field, selectedValue)}
                                className='w-full'
                                optionClassName='text-base'
                            />
                        </div>
                    )
                } else if (type === 'date') {
                    return (
                        <div className='mb-6'>
                            <DateInput
                                label={label}
                                placeholder='Select date'
                                value={value as number | null}
                                onChange={(timestamp: number | null) => {
                                    if (timestamp !== null) {
                                        updateField(field, timestamp)
                                    }
                                }}
                                minDate={new Date().toISOString().split('T')[0]}
                                fullWidth
                            />
                        </div>
                    )
                } else if (type === 'number') {
                    return (
                        <div className='mb-6'>
                            <p className='text-sm text-black mb-2'>{label}</p>
                            <StateBaseTextField
                                type='number'
                                value={value?.toString() || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    updateField(field, parseFloat(e.target.value) || 0)
                                }
                                className='w-full text-sm'
                            />
                        </div>
                    )
                } else if (type === 'boolean') {
                    return (
                        <div className='mb-6'>
                            <p className='text-sm text-black mb-2'>{label}</p>
                            <div className='flex items-center space-x-4'>
                                <label className='flex items-center'>
                                    <input
                                        type='radio'
                                        name={field}
                                        checked={value === true}
                                        onChange={() => updateField(field, true)}
                                        className='mr-2'
                                    />
                                    Yes
                                </label>
                                <label className='flex items-center'>
                                    <input
                                        type='radio'
                                        name={field}
                                        checked={value === false}
                                        onChange={() => updateField(field, false)}
                                        className='mr-2'
                                    />
                                    No
                                </label>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div className='mb-6'>
                            <p className='text-sm text-black mb-2'>{label}</p>
                            <StateBaseTextField
                                value={value?.toString() || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    updateField(field, e.target.value)
                                }
                                className='w-full text-sm'
                            />
                        </div>
                    )
                }
            } else {
                return (
                    <div className='mb-6'>
                        <p className='text-sm text-gray-600 mb-1'>{label}</p>
                        <p className='text-sm text-black font-medium'>{formatValue(value, type)}</p>
                    </div>
                )
            }
        }

        return (
            <div className='grid grid-cols-2 gap-8 mb-4'>
                <div>{renderField(leftLabel, leftValue, leftField, leftOptions, leftType)}</div>
                <div>{renderField(rightLabel, rightValue, rightField, rightOptions, rightType)}</div>
            </div>
        )
    }

    if (!propertyDetails) {
        return <Layout loading={true}>Loading property details...</Layout>
    }

    return (
        <Layout loading={loading}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen'>
                    {/* Header */}
                    <div className='mb-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <div>
                                <div className='text-sm text-gray-500 mb-1'>
                                    <button onClick={() => navigate('/restack/rental')} className='hover:text-gray-700'>
                                        Rental
                                    </button>
                                    <span className='mx-2'>/</span>
                                    <span className='text-black font-medium'>{propertyDetails.id}</span>
                                </div>
                                <h1 className='text-xl font-semibold text-black'>{propertyDetails.configuration}</h1>
                            </div>
                            <div className='flex gap-2'>
                                <div className='px-3 py-1 border border-blue-600 text-black rounded-full text-sm font-medium'>
                                    Listed by {propertyDetails.postedBy}
                                </div>
                                {isEditing ? (
                                    <>
                                        <Button
                                            bgColor='bg-gray-200'
                                            textColor='text-gray-700'
                                            className='px-4 h-8 font-semibold'
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            bgColor='bg-gray-600'
                                            textColor='text-white'
                                            className='px-4 h-8 font-semibold'
                                            onClick={handleSave}
                                        >
                                            Save
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        leftIcon={<img src={editic} alt='Edit' className='w-4 h-4' />}
                                        bgColor='bg-gray-100'
                                        textColor='text-gray-700'
                                        className='px-4 h-8 font-semibold hover:bg-gray-200'
                                        onClick={handleEdit}
                                    >
                                        Edit Property
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Price Banner */}
                        <div className='text-right mb-6'>
                            <div className='text-2xl font-bold text-black'>
                                ₹ {(propertyDetails.price / 100000).toFixed(2)} Cr.
                            </div>
                        </div>

                        {/* Project Description */}
                        <div className='mb-6'>
                            <p className='text-sm text-gray-700 leading-relaxed'>
                                {propertyDetails.projectName} not a dobhis is a residential project located in the heart
                                of the city, offering a blend of modern living and serene siyooamd kootsa surroundings.
                                The project features spacious apartments with contemporary designs and top-notch
                                amenities, ensuring awininioshop atood comfortable and luxurious lifestyle for its
                                residents.
                            </p>
                        </div>
                    </div>

                    {/* Property Details Grid */}
                    <div className='mb-8'>
                        {renderPropertyRow(
                            'Project Name',
                            propertyDetails.projectName,
                            'Configuration (2beds/3bath)',
                            `${propertyDetails.configuration} Flat`,
                            'projectName',
                            'configuration',
                            undefined,
                            configurationOptions,
                        )}

                        {renderPropertyRow(
                            'Super Built-up Area',
                            'Apartment',
                            'Carpet Area',
                            `${propertyDetails.carpetArea} BHK`,
                            'propertyType',
                            'carpetArea',
                            propertyTypes,
                            undefined,
                            'text',
                            'text',
                        )}

                        {renderPropertyRow(
                            'Built-up',
                            `${(propertyDetails.builtUpArea / 100000).toFixed(1)} cr`,
                            'Price',
                            `${propertyDetails.price}`,
                            'builtUpArea',
                            'price',
                            undefined,
                            undefined,
                            'number',
                            'number',
                        )}

                        {renderPropertyRow(
                            'Micromarket',
                            propertyDetails.micromarket,
                            'Address',
                            propertyDetails.address,
                            'micromarket',
                            'address',
                        )}

                        {renderPropertyRow(
                            'Furnish Status',
                            propertyDetails.furnishingStatus,
                            'Age of Property',
                            propertyDetails.ageOfProperty,
                            'furnishingStatus',
                            'ageOfProperty',
                            furnishingOptions,
                            ageOfPropertyOptions,
                        )}

                        {renderPropertyRow(
                            'Posted on',
                            propertyDetails.postedOn,
                            'Posted by',
                            propertyDetails.postedBy,
                            'postedOn',
                            'postedBy',
                            undefined,
                            undefined,
                            'date',
                            'text',
                        )}

                        {renderPropertyRow(
                            'Property ID',
                            propertyDetails.propertyId,
                            'URL',
                            propertyDetails.url,
                            'propertyId',
                            'url',
                        )}
                    </div>

                    {/* About Project */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>About Project</h2>
                        <div>
                            {isEditing ? (
                                <textarea
                                    value={propertyDetails.description || ''}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    className='w-full text-sm border border-gray-300 rounded-md p-3 h-32 resize-none'
                                    placeholder='Enter property description'
                                />
                            ) : (
                                <p className='text-sm text-gray-700 leading-relaxed'>{propertyDetails.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default RentalDetailsPage
