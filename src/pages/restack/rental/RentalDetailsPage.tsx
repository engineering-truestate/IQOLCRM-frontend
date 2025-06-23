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
import type { RestackRentalProperty } from '../../../data_types/restack/restack-rental.d'
import {
    get99AcresRentalDataById,
    getACNRentalDataById,
    getHousingRentalDataById,
    getMagicBricksRentalDataById,
    getMyGateRentalDataById,
    update99AcresRentalDataById,
    updateACNRentalDataById,
    updateHousingRentalDataById,
    updateMagicBricksRentalDataById,
    updateMyGateRentalDataById,
} from '../../../services/restack/rentalService'

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

const RentalDetailsPage = () => {
    const navigate = useNavigate()
    const { type, id } = useParams()
    const dispatch = useDispatch<AppDispatch>()
    const [propertyDetails, setPropertyDetails] = useState<RestackRentalProperty | null>(null)
    const [originalDetails, setOriginalDetails] = useState<RestackRentalProperty | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            setLoading(true)
            try {
                if (id) {
                    let property: RestackRentalProperty | null = null
                    switch (type) {
                        case '99acres':
                            property = (await get99AcresRentalDataById(id)) ?? null
                            break
                        case 'magicbricks':
                            property = (await getMagicBricksRentalDataById(id)) ?? null
                            break
                        case 'ACN':
                            property = (await getACNRentalDataById(id)) ?? null
                            break
                        case 'myGate':
                            property = (await getMyGateRentalDataById(id)) ?? null
                            break
                        case 'Housing':
                            property = (await getHousingRentalDataById(id)) ?? null
                            break
                        default:
                            break
                    }

                    setPropertyDetails(property || null)
                    setOriginalDetails(property || null)
                }
            } catch (error) {
                console.error('Failed to fetch property details:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPropertyDetails()
    }, [id, type])

    const updateField = (field: string, value: string | number | null) => {
        setPropertyDetails((prev) => {
            if (!prev) return null
            // const keys = field.split('.')
            const updatedDetails = { ...prev, [field]: value }

            // if (keys.length === 1) {
            //     ;(updatedDetails as any)[keys[0]] = value
            // } else if (keys.length === 2) {
            //     const [section, key] = keys
            //     if ((updatedDetails as any)[section]) {
            //         ;(updatedDetails as any)[section] = {
            //             ...(updatedDetails as any)[section],
            //             [key]: value,
            //         }
            //     } else {
            //         (updatedDetails as any)[key] = value;
            //     }
            // }
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

                setOriginalDetails(propertyDetails)

                if (id) {
                    switch (type) {
                        case '99acres':
                            await update99AcresRentalDataById(id, originalDetails || propertyDetails)
                            break
                        case 'magicbricks':
                            await updateMagicBricksRentalDataById(id, originalDetails || propertyDetails)
                            break
                        case 'ACN':
                            await updateACNRentalDataById(id, originalDetails || propertyDetails)
                            break
                        case 'myGate':
                            await updateMyGateRentalDataById(id, originalDetails || propertyDetails)
                            break
                        case 'Housing':
                            await updateHousingRentalDataById(id, originalDetails || propertyDetails)
                            break
                        default:
                            break
                    }
                }

                setIsEditing(false)
                toast.success('Property details saved successfully')
            } catch (error) {
                toast.error('Error saving property details: ' + (error as Error).message)
            } finally {
                setLoading(false)
            }
        }
    }

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
                            // minDate={new Date().toISOString().split('T')[0]}
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
            } else {
                return (
                    <div className='mb-6'>
                        <p className='text-sm text-black mb-2'>{label}</p>
                        <StateBaseTextField
                            type='text'
                            placeholder={`Enter ${label.toLowerCase()}`}
                            value={value?.toString() || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(field, e.target.value)}
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
                                    <button
                                        onClick={() => navigate(`/restack/rental/${type}`)}
                                        className='hover:text-gray-700'
                                    >
                                        Rental
                                    </button>
                                    <span className='mx-2'>/</span>
                                    <span className='text-black font-medium'>{propertyDetails.propertyId}</span>
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
                                ₹ {propertyDetails.price.toFixed(2)} Cr.
                            </div>
                        </div>

                        {/* Project Description */}
                        <div className='mb-6'>
                            <p className='text-sm text-gray-700 leading-relaxed'>
                                {propertyDetails.description || 'No description available for this property.'}
                            </p>
                        </div>
                    </div>

                    {/* Property Details Grid */}
                    <div className='mb-8'>
                        <div className='grid grid-cols-2 gap-8 mb-4'>
                            {renderField(
                                'Project Name',
                                propertyDetails.propertyName,
                                'propertyName',
                                undefined,
                                'text',
                            )}
                            <div>
                                {renderField(
                                    'Configuration',
                                    `${propertyDetails.configuration}`,
                                    'configuration',
                                    configurationOptions,
                                    'text',
                                )}
                            </div>

                            <div>
                                {renderField(
                                    'Super Built-up Area',
                                    propertyDetails.superBuiltUpArea,
                                    'superBuiltUpArea',
                                    undefined,
                                    'number',
                                )}
                            </div>
                            <div>
                                {renderField(
                                    'Carpet Area',
                                    propertyDetails.carpetArea,
                                    'carpetArea',
                                    undefined,
                                    'number',
                                )}
                            </div>

                            <div>
                                {renderField('Built-up', propertyDetails.builtup, 'builtup', undefined, 'number')}
                            </div>
                            <div>{renderField('Price (Cr.)', propertyDetails.price, 'price', undefined, 'number')}</div>

                            <div>
                                {renderField(
                                    'Micromarket',
                                    propertyDetails.micromarket,
                                    'micromarket',
                                    undefined,
                                    'text',
                                )}
                            </div>
                            <div>{renderField('Address', propertyDetails.address, 'address', undefined, 'text')}</div>

                            <div>
                                {renderField(
                                    'Furnish Status',
                                    propertyDetails.furnishStatus,
                                    'furnishStatus',
                                    furnishingOptions,
                                    'text',
                                )}
                            </div>
                            <div>
                                {renderField(
                                    'Age of Property',
                                    propertyDetails.ageOfProperty,
                                    'ageOfProperty',
                                    undefined,
                                    'number',
                                )}
                            </div>

                            <div>
                                {renderField('Posted on', propertyDetails.postedOn, 'postedOn', undefined, 'date')}
                            </div>
                            <div>
                                {renderField('Posted by', propertyDetails.postedBy, 'postedBy', undefined, 'text')}
                            </div>

                            <div>
                                {renderField(
                                    'Property ID',
                                    propertyDetails.propertyId,
                                    'propertyId',
                                    undefined,
                                    'text',
                                )}
                            </div>
                            <div>{renderField('URL', propertyDetails.url, 'url', undefined, 'text')}</div>
                        </div>
                    </div>
                    {/* About Project */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>About Project</h2>
                        <div>
                            {isEditing ? (
                                <textarea
                                    value={propertyDetails.aboutProject || ''}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    className='w-full text-sm border border-gray-300 rounded-md p-3 h-32 resize-none'
                                    placeholder='Enter property description'
                                />
                            ) : (
                                <p className='text-sm text-gray-700 leading-relaxed'>
                                    {propertyDetails.aboutProject || ''}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default RentalDetailsPage
