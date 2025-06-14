'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../../../layout/Layout'
import {
    FlexibleTable,
    type TableColumn,
    type DropdownOption,
} from '../../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../../components/design-elements/Dropdown'
import Button from '../../../../components/design-elements/Button'
import StateBaseTextField from '../../../../components/design-elements/StateBaseTextField'
import {
    generateProjectDetails,
    type ProjectDetails,
    type ApartmentUnit,
    type VillaUnit,
    type PlotUnit,
    type MapsPlan,
} from '../../../dummy_data/restack_primary_details_dummy_data.ts'

// Helper data for dropdowns (based on similar files like PreLaunchDetails)
const projectTypes = [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Mixed-Use', value: 'Mixed-Use' },
]

const projectStages = [
    { label: 'Pre Launch', value: 'Pre Launch' },
    { label: 'Active', value: 'Active' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Planning', value: 'Planning' },
]

const apartmentTypologies = [
    { label: '1 BHK', value: '1 BHK' },
    { label: '2 BHK', value: '2 BHK' },
    { label: '3 BHK', value: '3 BHK' },
    { label: '4 BHK', value: '4 BHK' },
    { label: 'Studio', value: 'Studio' },
]

const villaTypologies = [
    { label: 'Type A', value: 'Type A' },
    { label: 'Type B', value: 'Type B' },
    { label: 'Type C', value: 'Type C' },
]

const plotTypes = [
    { label: 'Residential Plot', value: 'Residential Plot' },
    { label: 'Commercial Plot', value: 'Commercial Plot' },
]

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

const PrimaryDetailsPage = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null)
    const [originalDetails, setOriginalDetails] = useState<ProjectDetails | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState<'apartment' | 'villa' | 'plot' | 'tower'>('apartment')
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [isAddingRow, setIsAddingRow] = useState(false)

    // Load project data based on id
    useEffect(() => {
        if (id) {
            const details = generateProjectDetails(id)
            setProjectDetails(details)
            setOriginalDetails(details)
        }
    }, [id])

    // Handle field updates
    const updateField = (field: string, value: string) => {
        if (projectDetails) {
            setProjectDetails((prev: ProjectDetails | null) => (prev ? { ...prev, [field]: value } : null))
        }
    }

    // Handle edit mode toggle
    const handleEdit = () => {
        setIsEditing(true)
    }

    // Handle cancel edit
    const handleCancel = () => {
        setProjectDetails(originalDetails)
        setIsEditing(false)
        setEditingRowId(null)
        setIsAddingRow(false)
    }

    // Handle save changes
    const handleSave = () => {
        if (projectDetails) {
            setOriginalDetails(projectDetails)
            setIsEditing(false)
            setEditingRowId(null)
            setIsAddingRow(false)
            console.log('Saving project details:', projectDetails)
        }
    }

    // Render field based on edit mode
    const renderField = (
        label: string,
        value: string,
        fieldKey: string,
        options?: { label: string; value: string }[],
        type: 'text' | 'date' = 'text',
    ) => {
        if (isEditing) {
            if (options) {
                return (
                    <div>
                        <label className='text-sm text-black block mb-1'>{label}</label>
                        <Dropdown
                            options={options}
                            onSelect={(selectedValue) => updateField(fieldKey, selectedValue)}
                            defaultValue={value}
                            placeholder={`Select ${label}`}
                            className='relative w-full'
                            triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                            menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                            optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                        />
                    </div>
                )
            } else {
                return (
                    <div>
                        <label className='text-sm text-black block mb-1'>{label}</label>
                        <StateBaseTextField
                            value={value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(fieldKey, e.target.value)}
                            className='w-full text-sm'
                            type={type}
                        />
                    </div>
                )
            }
        } else {
            return (
                <div>
                    <label className='text-sm text-gray-600 block'>{label}</label>
                    <p className='text-sm font-medium text-gray-900'>{value}</p>
                </div>
            )
        }
    }

    // Render table cell based on edit mode and unit type
    const renderTableCell = (
        value: string,
        rowId: string,
        fieldKey: string,
        unitType: 'apartment' | 'villa' | 'plot' | 'tower',
        options?: DropdownOption[],
        type: 'text' | 'date' = 'text',
    ) => {
        if (isEditing && editingRowId === rowId) {
            if (options) {
                return (
                    <Dropdown
                        options={options}
                        onSelect={(selectedValue) => updateFieldInUnit(unitType, rowId, fieldKey, selectedValue)}
                        defaultValue={value}
                        placeholder={`Select ${fieldKey}`}
                        className='relative w-full'
                        triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                        optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                    />
                )
            } else if (fieldKey === 'floorPlan' && unitType !== 'plot') {
                return (
                    <StateBaseTextField
                        value={value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateFieldInUnit(unitType, rowId, fieldKey, e.target.value)
                        }
                        className='w-full text-sm'
                        placeholder='Image URL'
                    />
                )
            } else {
                return (
                    <StateBaseTextField
                        value={value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateFieldInUnit(unitType, rowId, fieldKey, e.target.value)
                        }
                        className='w-full text-sm'
                        type={type}
                    />
                )
            }
        } else if (fieldKey === 'floorPlan' && unitType !== 'plot') {
            return <FloorPlanImage imageUrl={value} />
        } else if (fieldKey === 'googleMap') {
            return (
                <a
                    href={value}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-blue-600 hover:text-blue-800 underline'
                >
                    {value}
                </a>
            )
        } else {
            return <span className='whitespace-nowrap text-sm text-gray-900'>{value}</span>
        }
    }

    // Generic function to update fields in nested arrays (units)
    const updateFieldInUnit = (
        unitType: 'apartment' | 'villa' | 'plot' | 'tower',
        unitId: string,
        field: string,
        value: string,
    ) => {
        if (!projectDetails) return

        const fieldName = `${unitType}Units` as keyof ProjectDetails
        const units = (projectDetails[fieldName] || []) as (ApartmentUnit | VillaUnit | PlotUnit)[]

        const updatedUnits = units.map((unit) => (unit.id === unitId ? { ...unit, [field]: value } : unit))

        setProjectDetails((prev: ProjectDetails | null) =>
            prev
                ? {
                      ...prev,
                      [fieldName]: updatedUnits,
                  }
                : null,
        )
    }

    // Generate table columns for each unit type
    const getApartmentColumns = (): TableColumn[] => [
        {
            key: 'aptType',
            header: 'Apt Type',
            render: (value, row) =>
                renderTableCell(
                    value as string,
                    (row as ApartmentUnit).id,
                    'aptType',
                    'apartment',
                    apartmentTypologies,
                ),
        },
        {
            key: 'typology',
            header: 'Typology',
            render: (value, row) =>
                renderTableCell(value as string, (row as ApartmentUnit).id, 'typology', 'apartment'),
        },
        {
            key: 'superBuiltUpArea',
            header: 'Super built-up area',
            render: (value, row) =>
                renderTableCell(value as string, (row as ApartmentUnit).id, 'superBuiltUpArea', 'apartment'),
        },
        {
            key: 'carpetArea',
            header: 'Carpet area',
            render: (value, row) =>
                renderTableCell(value as string, (row as ApartmentUnit).id, 'carpetArea', 'apartment'),
        },
        {
            key: 'pricePerSqft',
            header: 'Price / sqft',
            render: (value, row) =>
                renderTableCell(value as string, (row as ApartmentUnit).id, 'pricePerSqft', 'apartment'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (value, row) =>
                renderTableCell(value as string, (row as ApartmentUnit).id, 'totalPrice', 'apartment'),
        },
        {
            key: 'floorPlan',
            header: 'Floor plan',
            render: (value, row) =>
                renderTableCell(value as string, (row as ApartmentUnit).id, 'floorPlan', 'apartment'),
        },
        {
            key: 'actions',
            header: 'Edit',
            render: (_, row) => (
                <div className='flex gap-1'>
                    {editingRowId === (row as ApartmentUnit).id ? (
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
                                        // deleteUnit('apartment', (row as ApartmentUnit).id) // Need to implement deleteUnit
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
                            onClick={() => setEditingRowId((row as ApartmentUnit).id)}
                            disabled={editingRowId !== null}
                        >
                            Action
                        </button>
                    )}
                </div>
            ),
        },
    ]

    const getVillaColumns = (): TableColumn[] => [
        {
            key: 'villaType',
            header: 'Villa Type',
            render: (value, row) =>
                renderTableCell(value as string, (row as VillaUnit).id, 'villaType', 'villa', villaTypologies),
        },
        {
            key: 'typology',
            header: 'Typology',
            render: (value, row) => renderTableCell(value as string, (row as VillaUnit).id, 'typology', 'villa'),
        },
        {
            key: 'plotSize',
            header: 'Plot Size',
            render: (value, row) => renderTableCell(value as string, (row as VillaUnit).id, 'plotSize', 'villa'),
        },
        {
            key: 'builtUpArea',
            header: 'Built-up Area',
            render: (value, row) => renderTableCell(value as string, (row as VillaUnit).id, 'builtUpArea', 'villa'),
        },
        {
            key: 'carpetArea',
            header: 'Carpet Area',
            render: (value, row) => renderTableCell(value as string, (row as VillaUnit).id, 'carpetArea', 'villa'),
        },
        {
            key: 'pricePerSqft',
            header: 'Price / sqft',
            render: (value, row) => renderTableCell(value as string, (row as VillaUnit).id, 'pricePerSqft', 'villa'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (value, row) => renderTableCell(value as string, (row as VillaUnit).id, 'totalPrice', 'villa'),
        },
        {
            key: 'uds',
            header: 'UDS',
            render: (value, row) => renderTableCell(value as string, (row as VillaUnit).id, 'uds', 'villa'),
        },
        {
            key: 'noOfFloors',
            header: 'No. of Floors',
            render: (value, row) => renderTableCell(value as string, (row as VillaUnit).id, 'noOfFloors', 'villa'),
        },
        {
            key: 'actions',
            header: 'Edit',
            render: (_, row) => (
                <div className='flex gap-1'>
                    {editingRowId === (row as VillaUnit).id ? (
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
                                        // deleteUnit('villa', (row as VillaUnit).id)
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
                            onClick={() => setEditingRowId((row as VillaUnit).id)}
                            disabled={editingRowId !== null}
                        >
                            Action
                        </button>
                    )}
                </div>
            ),
        },
    ]

    const getPlotColumns = (): TableColumn[] => [
        {
            key: 'plotType',
            header: 'Plot Type',
            render: (value, row) =>
                renderTableCell(value as string, (row as PlotUnit).id, 'plotType', 'plot', plotTypes),
        },
        {
            key: 'plotArea',
            header: 'Plot Area(sq ft)',
            render: (value, row) => renderTableCell(value as string, (row as PlotUnit).id, 'plotArea', 'plot'),
        },
        {
            key: 'pricePerSqft',
            header: 'Price / sqft',
            render: (value, row) => renderTableCell(value as string, (row as PlotUnit).id, 'pricePerSqft', 'plot'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (value, row) => renderTableCell(value as string, (row as PlotUnit).id, 'totalPrice', 'plot'),
        },
        {
            key: 'actions',
            header: 'Edit',
            render: (_, row) => (
                <div className='flex gap-1'>
                    {editingRowId === (row as PlotUnit).id ? (
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
                                        // deleteUnit('plot', (row as PlotUnit).id)
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
                            onClick={() => setEditingRowId((row as PlotUnit).id)}
                            disabled={editingRowId !== null}
                        >
                            Action
                        </button>
                    )}
                </div>
            ),
        },
    ]

    const getTowerColumns = (): TableColumn[] => [
        {
            key: 'towerName',
            header: 'Tower Name',
            render: (value, row) => renderTableCell(value as string, (row as any).id, 'towerName', 'tower'),
        },
        {
            key: 'type',
            header: 'Type',
            render: (value, row) => renderTableCell(value as string, (row as any).id, 'type', 'tower'),
        },
        {
            key: 'noOfFloors',
            header: 'No. of Floors',
            render: (value, row) => renderTableCell(value as string, (row as any).id, 'noOfFloors', 'tower'),
        },
        {
            key: 'totalUnits',
            header: 'Total Units',
            render: (value, row) => renderTableCell(value as string, (row as any).id, 'totalUnits', 'tower'),
        },
        {
            key: 'stilts',
            header: 'Stilts',
            render: (value, row) => renderTableCell(value as string, (row as any).id, 'stilts', 'tower'),
        },
        {
            key: 'slabs',
            header: 'Slabs',
            render: (value, row) => renderTableCell(value as string, (row as any).id, 'slabs', 'tower'),
        },
        {
            key: 'basement',
            header: 'Basement',
            render: (value, row) => renderTableCell(value as string, (row as any).id, 'basement', 'tower'),
        },
        {
            key: 'parking',
            header: 'Parking',
            render: (value, row) => renderTableCell(value as string, (row as any).id, 'parking', 'tower'),
        },
        {
            key: 'height',
            header: 'Height (m)',
            render: (value, row) => renderTableCell(value as string, (row as any).id, 'height', 'tower'),
        },
        {
            key: 'floorPlanUnits',
            header: 'Floor Plan / Units',
            render: (value, row) => (
                <div className='flex gap-2'>
                    <Button
                        textColor='text-blue-600'
                        bgColor='bg-transparent'
                        onClick={() => console.log('View Floor Plan for', (row as any).towerName)}
                    >
                        View
                    </Button>
                    <Button
                        textColor='text-blue-600'
                        bgColor='bg-transparent'
                        onClick={() => console.log('View Units for', (row as any).towerName)}
                    >
                        View
                    </Button>
                </div>
            ),
        },
    ]

    if (!projectDetails) {
        return (
            <Layout loading={true}>
                <div className='py-2 px-6 bg-white min-h-screen'>
                    <div className='flex items-center justify-center h-64'>
                        <div className='text-gray-500'>Loading project details...</div>
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
                                <h1 className='text-xl font-semibold text-black'>{projectDetails.projectName}</h1>
                                <div className='text-sm text-gray-500 mt-1'>
                                    <button
                                        onClick={() => navigate('/restack/primary')}
                                        className='hover:text-gray-700'
                                    >
                                        Primary
                                    </button>
                                    <span className='mx-2'>/</span>
                                    <span className='text-black font-medium'>{projectDetails.pId}</span>
                                </div>
                            </div>
                            <div className='flex gap-4'>
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
                                        // leftIcon={<img src={editic} alt='Edit' className='w-4 h-4' />}
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

                    {/* Project Overview */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Project Overview</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Project Name (As per Rera)', projectDetails.projectName, 'projectName')}
                                {renderField('Project Type', projectDetails.projectType, 'projectType', projectTypes)}
                                {renderField('Project Status', projectDetails.stage, 'stage', projectStages)}
                                {renderField(
                                    'Developer / Promoter',
                                    projectDetails.developerPromoter,
                                    'developerPromoter',
                                )}
                                {renderField('Project Size (acres)', projectDetails.projectSize, 'projectSize')}
                                {renderField('Price (per sqft)', projectDetails.pricePerSqft, 'pricePerSqft')}
                                {renderField(
                                    'Project Start Date',
                                    projectDetails.projectStartDate,
                                    'projectStartDate',
                                    undefined,
                                    'date',
                                )}
                                {renderField(
                                    'Proposed Completion Date',
                                    projectDetails.proposedCompletionDate,
                                    'proposedCompletionDate',
                                    undefined,
                                    'date',
                                )}
                            </div>
                            <div className='space-y-4'>
                                {renderField(
                                    'Project Description',
                                    'A residential project in Golden Hills',
                                    'projectDescription',
                                )}
                                {renderField('Project Sub Type', 'Apartments', 'projectSubType')}
                                {renderField('Legal Name', 'Bennett Development Inc.', 'legalName')}
                                {renderField('District', 'Golden Hills', 'district')}
                                {renderField('Pin Code', '650001', 'pinCode')}
                                {renderField('Zone', 'North', 'zone')}
                                {renderField('North Schedule', 'Residential Area', 'northSchedule')}
                                {renderField('South Schedule', 'Commercial Area', 'southSchedule')}
                                {renderField('East Schedule', 'Park', 'eastSchedule')}
                                {renderField('West Schedule', 'School', 'westSchedule')}
                            </div>
                        </div>
                    </div>

                    {/* Plan Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Plan Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Approving Authority', 'City Planning Department', 'approvingAuthority')}
                                {renderField('Plan Approval Date', '2023-01-15', 'planApprovalDate', undefined, 'date')}
                                {renderField(
                                    'Total Number of Inventories/Flats/Villas',
                                    projectDetails.totalUnits,
                                    'totalUnits',
                                )}
                                {renderField('No. of Covered Parking', projectDetails.carParking, 'carParking')}
                            </div>
                            <div className='space-y-4'>
                                {renderField('Approved Plan Number', 'Plan No. 2023-GH-001', 'approvedPlanNumber')}
                                {renderField('RERA Registration Application Status', 'Approved', 'reraStatus')}
                                {renderField('No. of Open Parking', '20', 'noOpenParking')}
                                {renderField('No. of Garage', '10', 'noGarage')}
                            </div>
                        </div>
                    </div>

                    {/* Area Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Area Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Total Open Area (Sq Mtr)', projectDetails.openSpace, 'openSpace')}
                                {renderField('Total Area Of Land (Sq Mtr)', '10000', 'totalAreaLand')}
                                {renderField('Total Carpet Area of all the Floors (Sq Mtr)', '7000', 'totalCarpetArea')}
                                {renderField('Area of Open Parking (Sq Mtr)', '500', 'areaOpenParking')}
                                {renderField('Area of Garage (Sq Mtr)', '200', 'areaGarage')}
                            </div>
                            <div className='space-y-4'>
                                {renderField('Total Covered Area (Sq Mtr)', '5000', 'totalCoveredArea')}
                                {renderField(
                                    'Total Built-up Area of all the Floors (Sq Mtr)',
                                    '8000',
                                    'totalBuiltUpArea',
                                )}
                                {renderField('Total Plinth Area (Sq Mtr)', '6000', 'totalPlinthArea')}
                                {renderField('Area of Covered Parking (Sq Mtr)', '1000', 'areaCoveredParking')}
                                {renderField('Project Density (per acres)', '200', 'projectDensity')}
                            </div>
                        </div>
                    </div>

                    {/* Price Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Price Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Price (per sqft) (INR)', projectDetails.pricePerSqft, 'pricePerSqft')}
                            </div>
                            <div className='space-y-4'>
                                <div>
                                    <label className='text-sm text-gray-600 block'>Cost Sheet</label>
                                    <a href='#' className='text-sm text-blue-600 hover:text-blue-800 underline'>
                                        Download Cost Sheet (PDF)
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Source of Water */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Source of Water</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Source', 'Municipal Supply', 'sourceOfWater')}
                            </div>
                        </div>
                    </div>

                    {/* Development Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Development Details</h2>
                        <FlexibleTable
                            data={projectDetails.apartmentUnits} // Assuming apartment units are for development details
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
                        <div className='text-sm text-gray-500 mt-2'>Total: {projectDetails.totalUnits}</div>
                    </div>

                    {/* Tower Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Tower Details</h2>
                        <FlexibleTable
                            data={projectDetails.mapsPlans.map((map: MapsPlan) => ({
                                id: map.id,
                                towerName: map.name,
                                type: map.type,
                                noOfFloors: 'N/A',
                                totalUnits: 'N/A',
                                stilts: 'N/A',
                                slabs: 'N/A',
                                basement: 'N/A',
                                parking: 'N/A',
                                height: 'N/A',
                                floorPlanUnits: 'N/A',
                            }))} // Placeholder for now, use actual tower data if available
                            columns={getTowerColumns()}
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
                        <div className='text-sm text-gray-500 mt-2'>Number of Towers: {projectDetails.noOfTowers}</div>
                    </div>

                    {/* Ground Data */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Ground Data</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Price (at the time of launch) (per sqft)', '10000 sqft', 'launchPrice')}
                                <div>
                                    <label className='text-sm text-gray-600 block'>Images</label>
                                    <p className='text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800'>
                                        View Images
                                    </p>
                                </div>
                                <div>
                                    <label className='text-sm text-gray-600 block'>Master Plan</label>
                                    <p className='text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800'>
                                        View Master Plan
                                    </p>
                                </div>
                                <div>
                                    <label className='text-sm text-gray-600 block'>CDP Map</label>
                                    <p className='text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800'>
                                        CDP Map (PDF)
                                    </p>
                                </div>
                            </div>
                            <div className='space-y-4'>
                                {renderField('Typology & Unit Plan', 'View Units plan', 'typologyUnitPlan')}
                                <div>
                                    <label className='text-sm text-gray-600 block'>Brochure</label>
                                    <a href='#' className='text-sm text-blue-600 hover:text-blue-800 underline'>
                                        Download Brochure (PDF)
                                    </a>
                                </div>
                                <div>
                                    <label className='text-sm text-gray-600 block'>Cost Sheet</label>
                                    <a href='#' className='text-sm text-blue-600 hover:text-blue-800 underline'>
                                        Download Cost Sheet (PDF)
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Amenities</h2>
                        <div className='flex flex-wrap gap-2'>
                            <span className='px-3 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-700'>
                                Electrification, Water supply and Sanitary Finishing
                            </span>
                            <span className='px-3 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-700'>
                                Painting
                            </span>
                            <span className='px-3 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-700'>
                                Fire prevention and fire fighting fitting and fixture with network
                            </span>
                            <span className='px-3 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-700'>
                                Wardrobe, Showcase, Kitchen cabinet, Puja work
                            </span>
                            <span className='px-3 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-700'>
                                Landscaping & Tree Planting
                            </span>
                            <span className='px-3 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-700'>
                                Rain Water Harvesting
                            </span>
                            <span className='px-3 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-700'>
                                Sewage Treatment Plant
                            </span>
                            <span className='px-3 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-700'>
                                24/7 Security
                            </span>
                            <span className='px-3 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-700'>
                                Power Backup
                            </span>
                        </div>
                    </div>

                    {/* Clubhouse Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Clubhouse Details</h2>
                        <FlexibleTable
                            data={[
                                { name: 'Main Clubhouse', size: '10,000', floor: 'Ground' },
                                { name: 'Sports Club', size: '5,000', floor: 'First Floor' },
                            ]}
                            columns={[
                                {
                                    key: 'name',
                                    header: 'Name',
                                    render: (value) => <span className='text-sm text-gray-900'>{value as string}</span>,
                                },
                                {
                                    key: 'size',
                                    header: 'Size (Sqft)',
                                    render: (value) => <span className='text-sm text-gray-900'>{value as string}</span>,
                                },
                                {
                                    key: 'floor',
                                    header: 'Floor',
                                    render: (value) => <span className='text-sm text-gray-900'>{value as string}</span>,
                                },
                            ]}
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

                    {/* Litigation Status and Complaints */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Litigation Status and Complaints</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Litigation Status', 'Yes', 'litigationStatus')}
                                <div>
                                    <label className='text-sm text-gray-600 block'>Affidavit Link</label>
                                    <a href='#' className='text-sm text-blue-600 hover:text-blue-800 underline'>
                                        Download Affidavit (PDF)
                                    </a>
                                </div>
                            </div>
                            <div className='space-y-4'>
                                <div>
                                    <label className='text-sm text-gray-600 block'>Complaints</label>
                                    <p className='text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800'>
                                        View Complaints
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Documents</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                <div>
                                    <label className='text-sm text-gray-600 block'>Documents</label>
                                    <p className='text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800'>
                                        View Document
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PrimaryDetailsPage
