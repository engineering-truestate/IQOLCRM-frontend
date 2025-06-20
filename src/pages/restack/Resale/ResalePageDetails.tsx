import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Layout from '../../../layout/Layout'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import Dropdown from '../../../components/design-elements/Dropdown'
import NumberInput from '../../../components/design-elements/StateBaseNumberField'
import DateInput from '../../../components/design-elements/DateInputUnixTimestamps'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'
import editic from '/icons/acn/edit.svg'
import type { ResaleData } from '../../../store/actionTypes/restack/resaleActionTypes'
import type { RestackResaleProperty } from '../../../data_types/restack/restack-resale'
import { get99AcresResaleDataById, getMagicBricksResaleDataById } from '../../../services/restack/resaleService'

const ResaleDetailsPage = () => {
    const navigate = useNavigate()
    const { type, id } = useParams()
    const dispatch = useDispatch()

    const [propertyDetails, setPropertyDetails] = useState<RestackResaleProperty | null>(null)
    const [originalDetails, setOriginalDetails] = useState<ResaleData | null>(null)
    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false)
    const [isEditingLocation, setIsEditingLocation] = useState(false)
    const [isEditingInventory, setIsEditingInventory] = useState(false)
    const [isEditingAmenities, setIsEditingAmenities] = useState(false)
    // const resaleData = useSelector((state: any) => state.resale.data)
    // const loading = useSelector((state: any) => state.resale.loading)
    // const error = useSelector((state: any) => state.resale.error)

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
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
                    default:
                        console.error('Invalid resale type:', type)
                        return
                }

                if (!data || data.length === 0) {
                    console.error(`No data found for ${type} with id:`, id)
                    return
                }

                setPropertyDetails(data[0])
            } catch (error) {
                console.error('Error fetching property data:', error)
                setPropertyDetails(null)
            }
        }

        fetchData()
    }, [type, id])

    // Load property data based on id
    // useEffect(() => {
    //     if (id) {
    //         dispatch(fetchResaleDataRequest(id) as any);
    //     }
    // }, [id, dispatch]);

    // useEffect(() => {
    //     if (resaleData) {
    //         setPropertyDetails(resaleData);
    //         setOriginalDetails(resaleData);
    //     }
    // }, [resaleData]);

    // Handle field updates with types
    const updateField = (field: string, value: string | number | null) => {
        setPropertyDetails((prev) => {
            if (!prev) return null
            const keys = field.split('.')
            const updatedDetails = { ...prev }

            if (keys.length === 2) {
                const [section, key] = keys
                ;(updatedDetails as any)[key] = value
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
        originalData: ResaleData | null,
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
                    {fieldKey ? (
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
                    className={`{classNameOverride && classNameOverride.includes('col-span-2') ? classNameOverride : ''}`}
                >
                    {renderField(label1, value1, fieldKey1, options1, type1, onClick1)}
                </div>
                {!classNameOverride?.includes('col-span-2') && (
                    <div className={'pl-2'}>{renderField(label2, value2, fieldKey2, options2, type2, onClick2)}</div>
                )}
            </>
        )
    }

    // if (loading) {
    //     return <Layout loading={true}>Loading property details...</Layout>;
    // }

    // if (error) {
    //     return <Layout loading={false}>Error: {error}</Layout>;
    // }

    if (!propertyDetails) {
        return <Layout loading={false}>Property details not found.</Layout>
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
                            <span className='text-lg font-semibold text-black'>{propertyDetails.price}</span>
                        </div>
                        <h2 className='text-xl font-semibold text-black'>{propertyDetails.projectName}</h2>
                        <div className='text-sm text-gray-500 mt-1'>
                            <button onClick={() => navigate('/restack/resale')} className='hover:text-gray-700'>
                                Resale
                            </button>
                            <span className='mx-2'>/</span>
                            <span className='text-black font-medium'>{propertyDetails.propertyId}</span>
                        </div>
                    </div>

                    {/* Property Images */}
                    {/* <ImageGallery images={propertyDetails.images} /> */}

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
                            propertyDetails.projectName,
                            'Property Type',
                            propertyDetails.propertyType,
                            'projectName',
                            'propertyType',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                        )}
                        {renderInfoRow(
                            'Sub Type',
                            propertyDetails.subType,
                            'Configuration',
                            propertyDetails.configuration,
                            'subType',
                            'configuration',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                        )}
                        {renderInfoRow(
                            'Price',
                            propertyDetails.price,
                            'Price per sq ft',
                            propertyDetails.pricePerSqft?.toString(),
                            'price',
                            'pricePerSqft',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                        )}
                        {renderInfoRow(
                            'RERA ID',
                            propertyDetails.reraId,
                            'Project Size',
                            propertyDetails.projectSize,
                            'reraId',
                            'projectSize',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                        )}
                        {renderInfoRow(
                            'Super Built-up Area',
                            propertyDetails.superBuiltUpArea?.toString(),
                            'Carpet Area',
                            propertyDetails.carpetArea,
                            'superBuiltUpArea',
                            'carpetArea',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                        )}
                        {renderInfoRow(
                            'Total Units',
                            propertyDetails.totalUnits?.toString(),
                            'Developer',
                            propertyDetails.developer,
                            'totalUnits',
                            'developer',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                        )}
                        {renderInfoRow(
                            'Possession',
                            propertyDetails.handoverDate,
                            'Age of Property',
                            propertyDetails.ageOfProperty,
                            'handoverDate',
                            'ageOfProperty',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
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
                            propertyDetails.projectAddress,
                            'Area',
                            propertyDetails.area,
                            'projectAddress',
                            'area',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            'col-span-2 pr-[50%]',
                        )}
                        {renderInfoRow(
                            'Micromarket',
                            propertyDetails.micromarket,
                            'Launch Date',
                            propertyDetails.launchDate,
                            'micromarket',
                            'launchDate',
                            undefined,
                            undefined,
                            'text',
                            'date',
                            undefined,
                            undefined,
                            undefined,
                        )}
                        {renderInfoRow(
                            'Handover Date',
                            propertyDetails.handoverDate,
                            'Map Link',
                            'View on Map',
                            'handoverDate',
                            undefined,
                            undefined,
                            undefined,
                            'date',
                            'link',
                            undefined,
                            () => window.open(propertyDetails.maplink, '_blank'),
                        )}
                        {renderInfoRow(
                            'Coordinates',
                            `${propertyDetails.lat}, ${propertyDetails.long}`,
                            '',
                            '',
                            'coordinates',
                            undefined,
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            'col-span-2 pr-[50%]',
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
                            propertyDetails.inventoryDetails?.availability,
                            'Floor Number',
                            propertyDetails.inventoryDetails?.floorNumber?.toString(),
                            'inventoryDetails.availability',
                            'inventoryDetails.floorNumber',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                        )}
                        {renderInfoRow(
                            'Facing',
                            propertyDetails.inventoryDetails?.facing,
                            'Furnishing',
                            propertyDetails.extraDetails?.furnishing,
                            'inventoryDetails.facing',
                            'extraDetails.furnishing',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
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
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Configuration',
                            propertyDetails.aboutProject?.configuration,
                            'Towers and Units',
                            propertyDetails.aboutProject?.towersandunits,
                            'aboutProject.configuration',
                            'aboutProject.towersandunits',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                        )}
                    </div>
                    <div className='p-4'>
                        <div className='border-t border-solid border-t-[#d4dbe2] py-4'>
                            <p className='text-[#5c738a] text-sm font-normal leading-normal mb-2'>Description</p>
                            <p className='text-[#101418] text-sm font-normal leading-normal'>
                                {propertyDetails.aboutProject?.description}
                            </p>
                        </div>
                    </div>

                    {/* Extra Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Property Features</h2>
                    <div className='p-4'>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-solid border-t-[#d4dbe2] py-4'>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-[#101418]'>
                                    {propertyDetails.extraDetails?.baths}
                                </div>
                                <div className='text-sm text-[#5c738a]'>Baths</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-[#101418]'>
                                    {propertyDetails.extraDetails?.balconies}
                                </div>
                                <div className='text-sm text-[#5c738a]'>Balconies</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-lg font-semibold text-[#101418]'>
                                    {propertyDetails.extraDetails?.furnishing}
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

export { ResaleDetailsPage }
