import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'

import { getPreLaunchPropertyById, updatePreLaunchProperty } from '../../../store/actions/restack/preLaunchActions'
import type { Property } from '../../../store/reducers/restack/preLaunchtypes'
import type { AppDispatch, RootState } from '../../../store'
import {
    projectTypes,
    projectStages,
    apartmentTypologies,
    villaTypologies,
    plotTypes,
} from '../../dummy_data/restack_prelaunch_details_dummy_data'
import editic from '/icons/acn/edit.svg'
import addcircleic from '/icons/acn/add-circle.svg'
import NumberInput from '../../../components/design-elements/StateBaseNumberField'
import DateInput from '../../../components/design-elements/DateInputUnixTimestamps'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'

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

const PreLaunchDetailsPage = () => {
    const navigate = useNavigate()
    const { pId } = useParams()
    const dispatch = useDispatch<AppDispatch>()

    // Redux state
    const { properties, selectedProperty, loading, error } = useSelector((state: RootState) => state.preLaunch)

    const [projectDetails, setProjectDetails] = useState<Property | null>(null)
    const [originalDetails, setOriginalDetails] = useState<Property | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState<'apartment' | 'villa' | 'plot'>('apartment')
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [isAddingRow, setIsAddingRow] = useState(false)

    // Load project data based on pId
    useEffect(() => {
        if (pId) {
            // First try to find in existing properties
            const existingProperty = properties.find((prop: any) => prop.projectId === pId)
            if (existingProperty) {
                setProjectDetails(existingProperty)
                setOriginalDetails(existingProperty)
            } else {
                // If not found, fetch from API
                dispatch(getPreLaunchPropertyById(pId))
            }
        }
    }, [pId, properties, dispatch])

    // Update local state when selectedProperty changes (from Redux)
    useEffect(() => {
        if (selectedProperty && selectedProperty.projectId === pId) {
            setProjectDetails(selectedProperty)
            setOriginalDetails(selectedProperty)
        }
    }, [selectedProperty, pId])

    // Handle field updates with proper type handling
    const updateField = (field: string, value: string | number | null) => {
        if (projectDetails) {
            setProjectDetails((prev) => (prev ? { ...prev, [field]: value } : null))
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
    const handleSave = async () => {
        if (projectDetails && pId) {
            try {
                // Create updates object with only changed fields
                const updates: Partial<Property> = {}

                // Compare with original and only include changed fields
                if (originalDetails) {
                    Object.keys(projectDetails).forEach((key) => {
                        const typedKey = key as keyof Property
                        if (projectDetails[typedKey] !== originalDetails[typedKey]) {
                            ;(updates as any)[typedKey] = projectDetails[typedKey]
                        }
                    })
                }

                // Dispatch update action
                const result = await dispatch(
                    updatePreLaunchProperty({
                        projectId: pId,
                        updates,
                    }),
                )

                if (result.meta.requestStatus === 'fulfilled') {
                    setOriginalDetails(projectDetails)
                    setIsEditing(false)
                    setEditingRowId(null)
                    setIsAddingRow(false)
                    console.log('Project details saved successfully')
                }
            } catch (error) {
                console.error('Error saving project details:', error)
            }
        }
    }

    // Handle unit updates
    const updateUnit = (
        unitType: 'apartment' | 'villa' | 'plot',
        unitId: string,
        field: string,
        value: string | number,
    ) => {
        if (!projectDetails) return

        const updatedConfigurations = { ...projectDetails.configurations }

        if (unitType === 'apartment') {
            updatedConfigurations.apartments = updatedConfigurations.apartments.map((unit) =>
                (unit as any).id === unitId ? { ...unit, [field]: value } : unit,
            )
        } else if (unitType === 'villa') {
            updatedConfigurations.villas = updatedConfigurations.villas.map((unit) =>
                (unit as any).id === unitId ? { ...unit, [field]: value } : unit,
            )
        } else if (unitType === 'plot') {
            updatedConfigurations.plots = updatedConfigurations.plots.map((unit) =>
                (unit as any).id === unitId ? { ...unit, [field]: value } : unit,
            )
        }

        setProjectDetails((prev) => (prev ? { ...prev, configurations: updatedConfigurations } : null))
    }

    // Handle adding new unit
    const addNewUnit = (unitType: 'apartment' | 'villa' | 'plot') => {
        if (!projectDetails) return

        const newId = `${unitType}_${Date.now()}`
        const updatedConfigurations = { ...projectDetails.configurations }
        let newUnit: any

        switch (unitType) {
            case 'apartment':
                newUnit = {
                    id: newId,
                    Configuration: '',
                    apartmentType: '',
                    sbua: 0,
                    carpetArea: 0,
                    pricePerSqft: 0,
                    totalPrice: 0,
                    floorPlan: '',
                }
                updatedConfigurations.apartments = [...updatedConfigurations.apartments, newUnit]
                break
            case 'villa':
                newUnit = {
                    id: newId,
                    Configuration: '',
                    VillaType: '',
                    plotSize: 0,
                    builtUpArea: 0,
                    carpetArea: 0,
                    pricePerSqft: 0,
                    totalPrice: 0,
                    uds: 0,
                    numberOfFloors: 0,
                }
                updatedConfigurations.villas = [...updatedConfigurations.villas, newUnit]
                break
            case 'plot':
                newUnit = {
                    id: newId,
                    plotType: '',
                    plotArea: 0,
                    pricePerSqft: 0,
                    totalPrice: 0,
                }
                updatedConfigurations.plots = [...updatedConfigurations.plots, newUnit]
                break
        }

        setProjectDetails((prev) => (prev ? { ...prev, configurations: updatedConfigurations } : null))

        setEditingRowId(newId)
        setIsAddingRow(true)
    }

    // Handle delete unit
    const deleteUnit = (unitType: 'apartment' | 'villa' | 'plot', unitId: string) => {
        if (!projectDetails) return

        const updatedConfigurations = { ...projectDetails.configurations }

        if (unitType === 'apartment') {
            updatedConfigurations.apartments = updatedConfigurations.apartments.filter(
                (unit: any) => unit.id !== unitId,
            )
        } else if (unitType === 'villa') {
            updatedConfigurations.villas = updatedConfigurations.villas.filter((unit: any) => unit.id !== unitId)
        } else if (unitType === 'plot') {
            updatedConfigurations.plots = updatedConfigurations.plots.filter((unit: any) => unit.id !== unitId)
        }

        setProjectDetails((prev) => (prev ? { ...prev, configurations: updatedConfigurations } : null))
    }

    // Update maps/plans
    const updateMapPlan = (mapType: string, value: string) => {
        if (!projectDetails) return

        const updatedDocuments = { ...projectDetails.documents }

        switch (mapType) {
            case 'masterPlan':
                updatedDocuments.masterPlan = value
                break
            case 'projectLayoutPlan':
                updatedDocuments.projectLayoutPlan = value
                break
            case 'brochure':
                updatedDocuments.brochure = value
                break
        }

        setProjectDetails((prev) => (prev ? { ...prev, documents: updatedDocuments } : null))
    }

    // Render field based on edit mode with proper type handling
    const renderField = (
        label: string,
        value: string | number | null,
        fieldKey: string,
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
                <div>
                    <label className='text-sm text-gray-600 block mb-1'>{label}</label>
                    <div className='text-sm text-black font-medium'>{displayValue}</div>
                </div>
            )
        }
    }

    // Render table cell based on edit mode
    const renderTableCell = (
        value: string | number,
        unitId: string,
        field: string,
        unitType: 'apartment' | 'villa' | 'plot',
        options?: { label: string; value: string }[],
        fieldType: 'text' | 'number' = 'text',
    ) => {
        const isEditingThisRow = editingRowId === unitId

        if (isEditingThisRow) {
            if (field === 'floorPlan') {
                return (
                    <div className='flex items-center gap-2'>
                        <FloorPlanImage imageUrl={value as string} />
                        <StateBaseTextField
                            value={value as string}
                            onChange={(e) => updateUnit(unitType, unitId, field, e.target.value)}
                            className='flex-1 text-xs'
                            placeholder='Image URL'
                        />
                    </div>
                )
            } else if (options) {
                return (
                    <Dropdown
                        options={options}
                        onSelect={(selectedValue) => updateUnit(unitType, unitId, field, selectedValue)}
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
                        onChange={(numValue) => updateUnit(unitType, unitId, field, numValue ?? 0)}
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
                        onChange={(e) => updateUnit(unitType, unitId, field, e.target.value)}
                        className='w-full text-xs'
                    />
                )
            }
        } else {
            if (field === 'floorPlan') {
                return <FloorPlanImage imageUrl={value as string} />
            }
            return <span className='text-sm'>{value}</span>
        }
    }

    // Generate table columns for each unit type
    const getApartmentColumns = (): TableColumn[] => [
        {
            key: 'aptType',
            header: 'Apt Type',
            render: (value, row) => renderTableCell(value, row.id, 'aptType', 'apartment'),
        },
        {
            key: 'typology',
            header: 'Typology',
            render: (value, row) => renderTableCell(value, row.id, 'typology', 'apartment', apartmentTypologies),
        },
        {
            key: 'superBuiltUpArea',
            header: 'Super built-up area',
            render: (value, row) =>
                renderTableCell(value, row.id, 'superBuiltUpArea', 'apartment', undefined, 'number'),
        },
        {
            key: 'carpetArea',
            header: 'Carpet area',
            render: (value, row) => renderTableCell(value, row.id, 'carpetArea', 'apartment', undefined, 'number'),
        },
        {
            key: 'pricePerSqft',
            header: 'Price / sqft',
            render: (value, row) => renderTableCell(value, row.id, 'pricePerSqft', 'apartment', undefined, 'number'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price (PLC & FRC Extra)',
            render: (value, row) => renderTableCell(value, row.id, 'totalPrice', 'apartment', undefined, 'number'),
        },
        {
            key: 'floorPlan',
            header: 'Floor plan',
            render: (value, row) => renderTableCell(value, row.id, 'floorPlan', 'apartment'),
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
                                        deleteUnit('apartment', row.id)
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

    const getVillaColumns = (): TableColumn[] => [
        {
            key: 'villaType',
            header: 'Villa Type',
            render: (value, row) => renderTableCell(value, row.id, 'villaType', 'villa'),
        },
        {
            key: 'typology',
            header: 'Typology',
            render: (value, row) => renderTableCell(value, row.id, 'typology', 'villa', villaTypologies),
        },
        {
            key: 'plotSize',
            header: 'Plot Size',
            render: (value, row) => renderTableCell(value, row.id, 'plotSize', 'villa', undefined, 'number'),
        },
        {
            key: 'builtUpArea',
            header: 'Built-up Area',
            render: (value, row) => renderTableCell(value, row.id, 'builtUpArea', 'villa', undefined, 'number'),
        },
        {
            key: 'carpetArea',
            header: 'Carpet Area',
            render: (value, row) => renderTableCell(value, row.id, 'carpetArea', 'villa', undefined, 'number'),
        },
        {
            key: 'pricePerSqft',
            header: 'Price / sqft',
            render: (value, row) => renderTableCell(value, row.id, 'pricePerSqft', 'villa', undefined, 'number'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (value, row) => renderTableCell(value, row.id, 'totalPrice', 'villa', undefined, 'number'),
        },
        {
            key: 'uds',
            header: 'UDS',
            render: (value, row) => renderTableCell(value, row.id, 'uds', 'villa', undefined, 'number'),
        },
        {
            key: 'noOfFloors',
            header: 'No. of Floors',
            render: (value, row) => renderTableCell(value, row.id, 'noOfFloors', 'villa', undefined, 'number'),
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
                                        deleteUnit('villa', row.id)
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

    const getPlotColumns = (): TableColumn[] => [
        {
            key: 'plotType',
            header: 'Plot Type',
            render: (value, row) => renderTableCell(value, row.id, 'plotType', 'plot', plotTypes),
        },
        {
            key: 'plotArea',
            header: 'Plot Area(sq ft)',
            render: (value, row) => renderTableCell(value, row.id, 'plotArea', 'plot', undefined, 'number'),
        },
        {
            key: 'pricePerSqft',
            header: 'Price / sqft',
            render: (value, row) => renderTableCell(value, row.id, 'pricePerSqft', 'plot', undefined, 'number'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (value, row) => renderTableCell(value, row.id, 'totalPrice', 'plot', undefined, 'number'),
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
                                        deleteUnit('plot', row.id)
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
                            className='text-gray-600 hover:text-gray-800 text-xs font-medium text-center'
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

    if (loading || !projectDetails) {
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

    if (error) {
        return (
            <Layout loading={false}>
                <div className='py-2 px-6 bg-white min-h-screen'>
                    <div className='flex items-center justify-center h-64'>
                        <div className='text-center'>
                            <div className='text-red-600 mb-2'>Error loading project details</div>
                            <div className='text-gray-500 text-sm'>{error}</div>
                            <Button
                                bgColor='bg-blue-600'
                                textColor='text-white'
                                className='mt-4 px-4 py-2'
                                onClick={() => navigate('/restack/prelaunch')}
                            >
                                Back to Pre-Launch
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
                                <h1 className='text-xl font-semibold text-black'>{projectDetails.projectName}</h1>
                                <div className='text-sm text-gray-500 mt-1'>
                                    <button
                                        onClick={() => navigate('/restack/prelaunch')}
                                        className='hover:text-gray-700'
                                    >
                                        Pre-Launch
                                    </button>
                                    <span className='mx-2'>/</span>
                                    <span className='text-black font-medium'>{projectDetails.projectId}</span>
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

                    {/* Project Overview */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Project Overview</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Project Name', projectDetails.projectName, 'projectName')}
                                {renderField('Stage', projectDetails.stage, 'stage', projectStages)}
                                {renderField(
                                    'Project Size',
                                    projectDetails.projectSize,
                                    'projectSize',
                                    undefined,
                                    'number',
                                )}
                                {renderField(
                                    'Project Start Date',
                                    projectDetails.projectStartDate,
                                    'projectStartDate',
                                    undefined,
                                    'date',
                                )}
                            </div>
                            <div className='space-y-4'>
                                {renderField('Project Type', projectDetails.projectType, 'projectType', projectTypes)}
                                {renderField('Developer / Promoter', projectDetails.developerName, 'developerName')}
                                {renderField(
                                    'Price (per sqft)',
                                    projectDetails.pricePerSqft,
                                    'pricePerSqft',
                                    undefined,
                                    'number',
                                )}
                                {renderField(
                                    'Proposed Completion Date',
                                    projectDetails.handoverDate,
                                    'handoverDate',
                                    undefined,
                                    'date',
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Location</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Address', projectDetails.address, 'address')}
                                {renderField('Latitude', projectDetails.lat, 'lat', undefined, 'number')}
                            </div>
                            <div className='space-y-4'>
                                {renderField('Google Map', projectDetails.mapLink, 'mapLink')}
                                {renderField('Longitude', projectDetails.long, 'long', undefined, 'number')}
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Key Metrics</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField(
                                    'Total Units',
                                    projectDetails.totalUnits,
                                    'totalUnits',
                                    undefined,
                                    'number',
                                )}
                                {renderField(
                                    'No. of Floors',
                                    projectDetails.numberOfFloors,
                                    'numberOfFloors',
                                    undefined,
                                    'number',
                                )}
                                {renderField(
                                    'Car Parking (total)',
                                    projectDetails.totalParking,
                                    'totalParking',
                                    undefined,
                                    'number',
                                )}
                            </div>
                            <div className='space-y-4'>
                                {renderField(
                                    'EOI Amount (₹)',
                                    projectDetails.eoiAmount,
                                    'eoiAmount',
                                    undefined,
                                    'number',
                                )}
                                {renderField(
                                    'No. of Towers',
                                    projectDetails.numberOfTowers,
                                    'numberOfTowers',
                                    undefined,
                                    'number',
                                )}
                                {renderField('Open Space', projectDetails.openArea, 'openArea')}
                            </div>
                        </div>
                    </div>

                    {/* Typology and Unit Details */}
                    <div className='mb-8'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-semibold text-black'>Typology and Unit Details</h2>
                            <Button
                                leftIcon={<img src={addcircleic} alt='Add' className='w-4 h-4' />}
                                bgColor='bg-[#F3F3F3]'
                                textColor='text-[#3A3A47]'
                                className='px-4 h-8 font-semibold'
                                onClick={() => addNewUnit(activeTab)}
                                disabled={editingRowId !== null}
                            >
                                Add
                            </Button>
                        </div>

                        {/* Tabs */}
                        <div className='flex border-b border-gray-200 mb-4'>
                            <button
                                className={`px-6 py-2 text-sm font-medium border-b-2 ${
                                    activeTab === 'apartment'
                                        ? 'border-gray-600 text-gray-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                                onClick={() => setActiveTab('apartment')}
                            >
                                Apartment
                            </button>
                            <button
                                className={`px-6 py-2 text-sm font-medium border-b-2 ${
                                    activeTab === 'villa'
                                        ? 'border-gray-600 text-gray-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                                onClick={() => setActiveTab('villa')}
                            >
                                Villa
                            </button>
                            <button
                                className={`px-6 py-2 text-sm font-medium border-b-2 ${
                                    activeTab === 'plot'
                                        ? 'border-gray-600 text-gray-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                                onClick={() => setActiveTab('plot')}
                            >
                                Plot
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                            {activeTab === 'apartment' && (
                                <FlexibleTable
                                    data={projectDetails.configurations.apartments}
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
                            )}
                            {activeTab === 'villa' && (
                                <FlexibleTable
                                    data={projectDetails.configurations.villas}
                                    columns={getVillaColumns()}
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
                            )}
                            {activeTab === 'plot' && (
                                <FlexibleTable
                                    data={projectDetails.configurations.plots}
                                    columns={getPlotColumns()}
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
                            )}
                        </div>
                    </div>

                    {/* Maps & Plans */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Maps & Plans</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div>
                                <label className='text-sm text-gray-600 block mb-1'>Master Plan</label>
                                {isEditing ? (
                                    <StateBaseTextField
                                        value={projectDetails.documents.masterPlan}
                                        onChange={(e) => updateMapPlan('masterPlan', e.target.value)}
                                        className='w-full text-sm'
                                        placeholder='Enter Master Plan URL'
                                    />
                                ) : (
                                    <a
                                        href={projectDetails.documents.masterPlan}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-sm text-blue-600 hover:text-blue-800 underline'
                                    >
                                        Master Plan
                                    </a>
                                )}
                            </div>
                            <div>
                                <label className='text-sm text-gray-600 block mb-1'>Project Layout Plan</label>
                                {isEditing ? (
                                    <StateBaseTextField
                                        value={projectDetails.documents.projectLayoutPlan}
                                        onChange={(e) => updateMapPlan('projectLayoutPlan', e.target.value)}
                                        className='w-full text-sm'
                                        placeholder='Enter Project Layout Plan URL'
                                    />
                                ) : (
                                    <a
                                        href={projectDetails.documents.projectLayoutPlan}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-sm text-blue-600 hover:text-blue-800 underline'
                                    >
                                        Project Layout Plan
                                    </a>
                                )}
                            </div>
                            <div>
                                <label className='text-sm text-gray-600 block mb-1'>Brochure</label>
                                {isEditing ? (
                                    <StateBaseTextField
                                        value={projectDetails.documents.brochure}
                                        onChange={(e) => updateMapPlan('brochure', e.target.value)}
                                        className='w-full text-sm'
                                        placeholder='Enter Brochure URL'
                                    />
                                ) : (
                                    <a
                                        href={projectDetails.documents.brochure}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-sm text-blue-600 hover:text-blue-800 underline'
                                    >
                                        Brochure
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PreLaunchDetailsPage
