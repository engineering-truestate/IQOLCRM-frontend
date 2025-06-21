import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import Dropdown from '../../../components/design-elements/Dropdown'
import DateInputUnixTimestamps from '../../../components/design-elements/DateInputUnixTimestamps'
import Button from '../../../components/design-elements/Button'
import NumberInput from '../../../components/design-elements/StateBaseNumberField'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'

// Mock action imports - replace with actual imports
// import { getAuctionById, updateAuction } from '../../../store/actions/auction/auctionActions';
// import type { AuctionData } from '../../../store/reducers/auction/auctionTypes';
// import type { AppDispatch, RootState } from '../../../store';

import editic from '/icons/acn/edit.svg'
import addcircleic from '/icons/acn/add-circle.svg'

// Mock types - replace with actual types
interface UnitDetail {
    id: string
    unitNumber: string
    unitType: string
    unitFloorAreaSqFt: number
    unitPrice: number
    unitBedrooms: number
    unitBathrooms: number
    unitConstructionQuality: string
    unitMoveInType: string
    unitApprovedUse: string
    unitSizeInSqMeter: number
    unitDamagesAndRenovationDue: string
    unitRenovation: string
    unitAllInclusivePrice: number
    unitOwnerVsDealer: string
    unitPropertyTax: string
    unitValue: string
}

interface AuctionData {
    auctionId: string
    projectName: string
    promoterBrandName?: string
    builderRightName: string
    rera: string
    reservePrice: number
    emdPrice?: number
    auctionType: string
    bankType?: string
    auctionStartDate: number
    auctionEndDate: number
    emdSubmissionDate?: number
    isShow: boolean
    isRecommended: boolean
    isVerified: boolean
    unitDetails: UnitDetail[]
    agentName: string
    agentPhone: string
    agentEmail: string
    description: string
    amenities: string[]
    longitude?: number
    latitude?: number
    mapLink?: string
    images: Array<{
        url: string
        caption: string
        isPrimary: boolean
    }>
}

// Dropdown options
const auctionTypeOptions = [
    { value: 'Online Auction', label: 'Online Auction' },
    { value: 'Offline Auction', label: 'Offline Auction' },
]

const bankTypeOptions = [
    { value: 'SBI', label: 'SBI' },
    { value: 'HDFC', label: 'HDFC' },
    { value: 'ICICI', label: 'ICICI' },
    { value: 'Axis', label: 'Axis' },
]

const unitTypeOptions = [
    { value: '1BHK', label: '1BHK' },
    { value: '2BHK', label: '2BHK' },
    { value: '3BHK', label: '3BHK' },
    { value: '4BHK', label: '4BHK' },
]

const furnishingOptions = [
    { value: 'Furnished', label: 'Furnished' },
    { value: 'Unfurnished', label: 'Unfurnished' },
    { value: 'Semi-Furnished', label: 'Semi-Furnished' },
]

const litigationOptions = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
]

const constructionQualityOptions = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Standard', label: 'Standard' },
]

const AuctionDetailsPage = () => {
    const navigate = useNavigate()
    const { auctionId } = useParams()
    // const dispatch = useDispatch<AppDispatch>();

    // Mock Redux state - replace with actual Redux selectors
    // const { auctions, selectedAuction, loading, error } = useSelector((state: RootState) => state.auction);
    const loading = false
    const error = null

    // Mock initial data
    const mockAuctionData: AuctionData = {
        auctionId: 'A123',
        projectName: 'Mahindra Zen apartment phase 2',
        promoterBrandName: '',
        builderRightName: 'Mahindra',
        rera: 'RERA12345',
        reservePrice: 1200000,
        emdPrice: 120000,
        auctionType: 'Online Auction',
        bankType: 'SBI',
        auctionStartDate: new Date('2024-07-01T10:00:00.000Z').getTime(),
        auctionEndDate: new Date('2024-07-05T18:00:00.000Z').getTime(),
        emdSubmissionDate: new Date('2024-06-25T18:00:00.000Z').getTime(),
        isShow: true,
        isRecommended: true,
        isVerified: true,
        unitDetails: [
            {
                id: '1',
                unitNumber: '1201',
                unitType: '2BHK',
                unitFloorAreaSqFt: 1200,
                unitPrice: 750000,
                unitBedrooms: 2,
                unitBathrooms: 2,
                unitConstructionQuality: 'High',
                unitMoveInType: 'Furnished',
                unitApprovedUse: 'Residential',
                unitSizeInSqMeter: 111.48,
                unitDamagesAndRenovationDue: 'None',
                unitRenovation: 'New',
                unitAllInclusivePrice: 800000,
                unitOwnerVsDealer: 'Owner',
                unitPropertyTax: 'Paid',
                unitValue: 'High',
            },
        ],
        agentName: 'John Doe',
        agentPhone: '123-456-7890',
        agentEmail: 'john.doe@example.com',
        description: 'Luxury apartment with modern amenities and great connectivity.',
        amenities: ['Swimming pool', 'Gym', 'Clubhouse'],
        longitude: 77.6413,
        latitude: 12.9716,
        mapLink: 'https://maps.google.com',
        images: [
            {
                url: 'https://example.com/image1.jpg',
                caption: 'Image 1',
                isPrimary: true,
            },
        ],
    }

    const [auctionDetails, setAuctionDetails] = useState<AuctionData | null>(mockAuctionData)
    const [originalDetails, setOriginalDetails] = useState<AuctionData | null>(mockAuctionData)
    const [isEditing, setIsEditing] = useState(false)
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [isAddingRow, setIsAddingRow] = useState(false)

    // Load auction data based on auctionId
    useEffect(() => {
        if (auctionId) {
            // Replace with actual API call
            // dispatch(getAuctionById(auctionId));
        }
    }, [auctionId])

    // Handle field updates
    const updateField = (field: string, value: string | number | boolean | null) => {
        if (auctionDetails) {
            setAuctionDetails((prev) => (prev ? { ...prev, [field]: value } : null))
        }
    }

    // Handle edit mode toggle
    const handleEdit = () => {
        setIsEditing(true)
    }

    // Handle cancel edit
    const handleCancel = () => {
        setAuctionDetails(originalDetails)
        setIsEditing(false)
        setEditingRowId(null)
        setIsAddingRow(false)
    }

    // Handle save changes
    const handleSave = async () => {
        if (auctionDetails && auctionId) {
            try {
                // Create updates object with only changed fields
                const updates: Partial<AuctionData> = {}

                // Compare with original and only include changed fields
                if (originalDetails) {
                    Object.keys(auctionDetails).forEach((key) => {
                        const typedKey = key as keyof AuctionData
                        if (auctionDetails[typedKey] !== originalDetails[typedKey]) {
                            ;(updates as any)[typedKey] = auctionDetails[typedKey]
                        }
                    })
                }

                // Replace with actual API call
                // const result = await dispatch(updateAuction({ auctionId, updates }));

                // if (result.meta.requestStatus === 'fulfilled') {
                setOriginalDetails(auctionDetails)
                setIsEditing(false)
                setEditingRowId(null)
                setIsAddingRow(false)
                console.log('Auction details saved successfully')
                // }
            } catch (error) {
                console.error('Error saving auction details:', error)
            }
        }
    }

    // Handle unit updates
    const updateUnit = (unitId: string, field: string, value: string | number) => {
        if (!auctionDetails) return

        const updatedUnits = auctionDetails.unitDetails.map((unit) =>
            unit.id === unitId ? { ...unit, [field]: value } : unit,
        )

        setAuctionDetails((prev) => (prev ? { ...prev, unitDetails: updatedUnits } : null))
    }

    // Handle adding new unit
    const addNewUnit = () => {
        if (!auctionDetails) return

        const newId = `unit_${Date.now()}`
        const newUnit: UnitDetail = {
            id: newId,
            unitNumber: '',
            unitType: '',
            unitFloorAreaSqFt: 0,
            unitPrice: 0,
            unitBedrooms: 0,
            unitBathrooms: 0,
            unitConstructionQuality: '',
            unitMoveInType: '',
            unitApprovedUse: '',
            unitSizeInSqMeter: 0,
            unitDamagesAndRenovationDue: '',
            unitRenovation: '',
            unitAllInclusivePrice: 0,
            unitOwnerVsDealer: '',
            unitPropertyTax: '',
            unitValue: '',
        }

        setAuctionDetails((prev) => (prev ? { ...prev, unitDetails: [...prev.unitDetails, newUnit] } : null))

        setEditingRowId(newId)
        setIsAddingRow(true)
    }

    // Handle delete unit
    const deleteUnit = (unitId: string) => {
        if (!auctionDetails) return

        const updatedUnits = auctionDetails.unitDetails.filter((unit) => unit.id !== unitId)
        setAuctionDetails((prev) => (prev ? { ...prev, unitDetails: updatedUnits } : null))
    }

    // Render field based on edit mode
    const renderField = (
        label: string,
        value: string | number | boolean | null,
        fieldKey: string,
        options?: { label: string; value: string }[],
        fieldType: 'text' | 'date' | 'number' | 'checkbox' = 'text',
    ) => {
        if (isEditing) {
            if (fieldType === 'checkbox') {
                return (
                    <div className='flex items-center gap-2'>
                        <input
                            type='checkbox'
                            id={fieldKey}
                            checked={value as boolean}
                            onChange={(e) => updateField(fieldKey, e.target.checked)}
                            className='rounded border-gray-300'
                        />
                        <label htmlFor={fieldKey} className='text-sm text-black'>
                            {label}
                        </label>
                    </div>
                )
            } else if (options) {
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
                    <DateInputUnixTimestamps
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
            if (fieldType === 'checkbox') {
                return (
                    <div className='flex justify-between border-b border-gray-200 pb-2 mb-4'>
                        <label className='text-sm text-gray-600 block mb-1'>{label}</label>
                        <div className='text-sm text-black font-medium'>{value ? 'Yes' : 'No'}</div>
                    </div>
                )
            } else {
                let displayValue = value?.toString() ?? ''
                if (fieldType === 'date' && typeof value === 'number') {
                    displayValue = formatUnixDate(value) ?? ''
                }

                return (
                    <div className='flex justify-between border-b border-gray-200 pb-2 mb-4'>
                        <label className='text-sm text-gray-600 block mb-1'>{label}</label>
                        <div className='text-sm text-black font-medium'>{displayValue}</div>
                    </div>
                )
            }
        }
    }

    // Render table cell based on edit mode
    const renderTableCell = (
        value: string | number,
        unitId: string,
        field: string,
        options?: { label: string; value: string }[],
        fieldType: 'text' | 'number' = 'text',
    ) => {
        const isEditingThisRow = editingRowId === unitId

        if (isEditingThisRow) {
            if (options) {
                return (
                    <Dropdown
                        options={options}
                        onSelect={(selectedValue) => updateUnit(unitId, field, selectedValue)}
                        defaultValue={value as string}
                        placeholder='Select'
                        className='relative w-full'
                        triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded text-xs text-black hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 w-full cursor-pointer'
                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg'
                        optionClassName='px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer'
                    />
                )
            } else if (fieldType === 'number') {
                return (
                    <NumberInput
                        value={value as number}
                        onChange={(numValue) => updateUnit(unitId, field, numValue ?? 0)}
                        numberType='decimal'
                        min={0}
                        className='w-full text-xs'
                        placeholder='0'
                    />
                )
            } else {
                return (
                    <StateBaseTextField
                        value={value?.toString() ?? ''}
                        onChange={(e) => updateUnit(unitId, field, e.target.value)}
                        className='w-full text-xs'
                    />
                )
            }
        } else {
            return <span className='text-sm'>{value}</span>
        }
    }

    // Generate table columns for units
    const getUnitColumns = (): TableColumn[] => [
        {
            key: 'unitNumber',
            header: 'Unit Number',
            render: (value, row) => renderTableCell(value, row.id, 'unitNumber'),
        },
        {
            key: 'unitType',
            header: 'Unit Type',
            render: (value, row) => renderTableCell(value, row.id, 'unitType', unitTypeOptions),
        },
        {
            key: 'unitFloorAreaSqFt',
            header: 'Carpet Area (Sq ft)',
            render: (value, row) => renderTableCell(value, row.id, 'unitFloorAreaSqFt', undefined, 'number'),
        },
        {
            key: 'unitBedrooms',
            header: 'Bedrooms',
            render: (value, row) => renderTableCell(value, row.id, 'unitBedrooms', undefined, 'number'),
        },
        {
            key: 'unitBathrooms',
            header: 'Bathrooms',
            render: (value, row) => renderTableCell(value, row.id, 'unitBathrooms', undefined, 'number'),
        },
        {
            key: 'unitMoveInType',
            header: 'Furnished',
            render: (value, row) => renderTableCell(value, row.id, 'unitMoveInType', furnishingOptions),
        },
        {
            key: 'unitConstructionQuality',
            header: 'Construction Quality',
            render: (value, row) =>
                renderTableCell(value, row.id, 'unitConstructionQuality', constructionQualityOptions),
        },
        {
            key: 'unitPrice',
            header: 'Price',
            render: (value, row) => renderTableCell(value, row.id, 'unitPrice', undefined, 'number'),
        },
        {
            key: 'actions',
            header: 'Edit',
            render: (_, row) => (
                <div className='flex gap-1'>
                    {editingRowId === row.id ? (
                        <>
                            <button
                                className='text-green-600 hover:text-green-800 text-xs font-medium'
                                onClick={() => setEditingRowId(null)}
                            >
                                Save
                            </button>
                            <button
                                className='text-red-600 hover:text-red-800 text-xs font-medium ml-2'
                                onClick={() => {
                                    if (isAddingRow) {
                                        deleteUnit(row.id)
                                        setIsAddingRow(false)
                                    }
                                    setEditingRowId(null)
                                }}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            className='text-gray-600 hover:text-gray-800 text-xs font-medium'
                            onClick={() => setEditingRowId(row.id)}
                            disabled={editingRowId !== null}
                        >
                            Action
                        </button>
                    )}
                </div>
            ),
        },
    ]

    if (loading || !auctionDetails) {
        return (
            <Layout loading={true}>
                <div className='py-2 px-6 bg-white min-h-screen'>
                    <div className='flex items-center justify-center h-64'>
                        <div className='text-gray-500'>Loading auction details...</div>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout loading={false}>
                <div className='py-2 px-6 bg-white min-h-screen'>
                    <div className='flex items-center justify-center h-64'>
                        <div className='text-center'>
                            <div className='text-red-600 mb-2'>Error loading auction details</div>
                            <div className='text-gray-500 text-sm'>{error}</div>
                            <Button
                                bgColor='bg-blue-600'
                                textColor='text-white'
                                className='mt-4 px-4 py-2'
                                onClick={() => navigate('/auctions')}
                            >
                                Back to Auctions
                            </Button>
                        </div>
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
                                <h1 className='text-xl font-semibold text-black'>{auctionDetails.projectName}</h1>
                                <div className='text-sm text-gray-500 mt-1'>
                                    <button onClick={() => navigate('/auctions')} className='hover:text-gray-700'>
                                        Auctions
                                    </button>
                                    <span className='mx-2'>/</span>
                                    <span className='text-black font-medium'>{auctionDetails.auctionId}</span>
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
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Project Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Project Name', auctionDetails.projectName, 'projectName')}
                                {renderField(
                                    'Promoter Brand Name',
                                    auctionDetails.promoterBrandName,
                                    'promoterBrandName',
                                )}
                                {renderField('Builder Legal Name', auctionDetails.builderRightName, 'builderRightName')}
                                {renderField('RERA ID', auctionDetails.rera, 'rera')}
                            </div>
                            <div className='space-y-4'>
                                {/* Image upload placeholder */}
                                <div>
                                    <label className='text-sm text-black block mb-1'>Images</label>
                                    <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500'>
                                        Image upload functionality
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Auction Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Auction Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {isEditing ? (
                                    <div className='flex gap-4'>
                                        {renderField('Show', auctionDetails.isShow, 'isShow', undefined, 'checkbox')}
                                        {renderField(
                                            'Recommended',
                                            auctionDetails.isRecommended,
                                            'isRecommended',
                                            undefined,
                                            'checkbox',
                                        )}
                                        {renderField(
                                            'Verified',
                                            auctionDetails.isVerified,
                                            'isVerified',
                                            undefined,
                                            'checkbox',
                                        )}
                                    </div>
                                ) : (
                                    <div className='space-y-4'>
                                        {renderField('Show', auctionDetails.isShow, 'isShow', undefined, 'checkbox')}
                                        {renderField(
                                            'Recommended',
                                            auctionDetails.isRecommended,
                                            'isRecommended',
                                            undefined,
                                            'checkbox',
                                        )}
                                        {renderField(
                                            'Verified',
                                            auctionDetails.isVerified,
                                            'isVerified',
                                            undefined,
                                            'checkbox',
                                        )}
                                    </div>
                                )}
                                {renderField(
                                    'EMD Submission Date',
                                    auctionDetails.emdSubmissionDate,
                                    'emdSubmissionDate',
                                    undefined,
                                    'date',
                                )}
                                {renderField(
                                    'Auction Start Date',
                                    auctionDetails.auctionStartDate,
                                    'auctionStartDate',
                                    undefined,
                                    'date',
                                )}
                                {renderField(
                                    'Auction End Date',
                                    auctionDetails.auctionEndDate,
                                    'auctionEndDate',
                                    undefined,
                                    'date',
                                )}
                            </div>
                            <div className='space-y-4'>
                                {renderField(
                                    'Reserve Price',
                                    auctionDetails.reservePrice,
                                    'reservePrice',
                                    undefined,
                                    'number',
                                )}
                                {renderField('EMD Price', auctionDetails.emdPrice, 'emdPrice', undefined, 'number')}
                                {renderField(
                                    'Auction Type',
                                    auctionDetails.auctionType,
                                    'auctionType',
                                    auctionTypeOptions,
                                )}
                                {renderField('Bank Type', auctionDetails.bankType, 'bankType', bankTypeOptions)}
                            </div>
                        </div>
                    </div>

                    {/* Unit Details */}
                    <div className='mb-8'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-semibold text-black'>Unit Details</h2>
                            <Button
                                leftIcon={<img src={addcircleic} alt='Add' className='w-4 h-4' />}
                                bgColor='bg-[#F3F3F3]'
                                textColor='text-[#3A3A47]'
                                className='px-4 h-8 font-semibold'
                                onClick={addNewUnit}
                                disabled={editingRowId !== null}
                            >
                                Add Unit
                            </Button>
                        </div>

                        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                            <FlexibleTable
                                data={auctionDetails.unitDetails}
                                columns={getUnitColumns()}
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

                    {/* Resolution Agent Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Resolution Agent Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Name', auctionDetails.agentName, 'agentName')}
                                {renderField('Phone Number', auctionDetails.agentPhone, 'agentPhone')}
                            </div>
                            <div className='space-y-4'>
                                {renderField('Email', auctionDetails.agentEmail, 'agentEmail')}
                            </div>
                        </div>
                    </div>

                    {/* About Project */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>About Project</h2>
                        {isEditing ? (
                            <div>
                                <label className='text-sm text-black block mb-1'>Description</label>
                                <textarea
                                    value={auctionDetails.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    className='w-full p-3 border border-gray-300 rounded-md text-sm'
                                    rows={4}
                                    placeholder='Enter project description'
                                />
                            </div>
                        ) : (
                            <p className='text-sm text-gray-700'>{auctionDetails.description}</p>
                        )}
                    </div>

                    {/* Amenities */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Amenities</h2>
                        {isEditing ? (
                            <div>
                                <label className='text-sm text-black block mb-1'>Amenities (comma-separated)</label>
                                <StateBaseTextField
                                    value={auctionDetails.amenities.join(', ')}
                                    onChange={(e) =>
                                        updateField('amenities', e.target.value.split(', ').filter(Boolean))
                                    }
                                    className='w-full text-sm'
                                    placeholder='Swimming pool, Gym, Clubhouse'
                                />
                            </div>
                        ) : (
                            <div className='flex flex-wrap gap-2'>
                                {auctionDetails.amenities.map((amenity, index) => (
                                    <span
                                        key={index}
                                        className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'
                                    >
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Location Analysis */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Location Analysis</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Longitude', auctionDetails.longitude, 'longitude', undefined, 'number')}
                                {renderField('Latitude', auctionDetails.latitude, 'latitude', undefined, 'number')}
                            </div>
                            <div className='space-y-4'>
                                {isEditing ? (
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Map Link</label>
                                        <StateBaseTextField
                                            value={auctionDetails.mapLink || ''}
                                            onChange={(e) => updateField('mapLink', e.target.value)}
                                            className='w-full text-sm'
                                            placeholder='Enter Google Maps link'
                                        />
                                    </div>
                                ) : (
                                    <div className='flex justify-between border-b border-gray-200 pb-2 mb-4'>
                                        <label className='text-sm text-gray-600 block mb-1'>Map Link</label>
                                        {auctionDetails.mapLink ? (
                                            <a
                                                href={auctionDetails.mapLink}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-sm text-blue-600 hover:text-blue-800 underline'
                                            >
                                                View on Map
                                            </a>
                                        ) : (
                                            <span className='text-sm text-gray-400'>No map link</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AuctionDetailsPage
