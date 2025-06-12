import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import {
    generateProjectDetails,
    type ProjectDetails,
    projectTypes,
    projectStages,
    apartmentTypologies,
    villaTypologies,
    plotTypes,
} from '../../dummy_data/restack_prelaunch_details_dummy_data'
import editic from '/icons/acn/edit.svg'
import addcircleic from '/icons/acn/add-circle.svg'

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

    const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null)
    const [originalDetails, setOriginalDetails] = useState<ProjectDetails | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState<'apartment' | 'villa' | 'plot'>('apartment')
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [isAddingRow, setIsAddingRow] = useState(false)

    // Load project data based on pId
    useEffect(() => {
        if (pId) {
            const details = generateProjectDetails(pId)
            setProjectDetails(details)
            setOriginalDetails(details)
        }
    }, [pId])

    // Handle field updates
    const updateField = (field: string, value: string) => {
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
    const handleSave = () => {
        if (projectDetails) {
            setOriginalDetails(projectDetails)
            setIsEditing(false)
            setEditingRowId(null)
            setIsAddingRow(false)
            console.log('Saving project details:', projectDetails)
        }
    }

    // Handle unit updates
    const updateUnit = (unitType: 'apartment' | 'villa' | 'plot', unitId: string, field: string, value: string) => {
        if (!projectDetails) return

        const fieldName = `${unitType}Units` as keyof ProjectDetails
        const units = projectDetails[fieldName] as any[]
        const updatedUnits = units.map((unit) => (unit.id === unitId ? { ...unit, [field]: value } : unit))

        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      [fieldName]: updatedUnits,
                  }
                : null,
        )
    }

    // Handle adding new unit
    const addNewUnit = (unitType: 'apartment' | 'villa' | 'plot') => {
        if (!projectDetails) return

        const newId = `${unitType}_${Date.now()}`
        let newUnit: any

        switch (unitType) {
            case 'apartment':
                newUnit = {
                    id: newId,
                    aptType: '',
                    typology: '',
                    superBuiltUpArea: '',
                    carpetArea: '',
                    pricePerSqft: '',
                    totalPrice: '',
                    floorPlan: '',
                }
                break
            case 'villa':
                newUnit = {
                    id: newId,
                    villaType: '',
                    typology: '',
                    plotSize: '',
                    builtUpArea: '',
                    carpetArea: '',
                    pricePerSqft: '',
                    totalPrice: '',
                    uds: '',
                    noOfFloors: '',
                    floorPlan: '',
                }
                break
            case 'plot':
                newUnit = {
                    id: newId,
                    plotType: '',
                    plotArea: '',
                    pricePerSqft: '',
                    totalPrice: '',
                }
                break
        }

        const fieldName = `${unitType}Units` as keyof ProjectDetails
        const units = projectDetails[fieldName] as any[]

        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      [fieldName]: [...units, newUnit],
                  }
                : null,
        )

        setEditingRowId(newId)
        setIsAddingRow(true)
    }

    // Handle delete unit
    const deleteUnit = (unitType: 'apartment' | 'villa' | 'plot', unitId: string) => {
        if (!projectDetails) return

        const fieldName = `${unitType}Units` as keyof ProjectDetails
        const units = projectDetails[fieldName] as any[]
        const updatedUnits = units.filter((unit) => unit.id !== unitId)

        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      [fieldName]: updatedUnits,
                  }
                : null,
        )
    }

    // Update maps/plans
    const updateMapPlan = (mapId: string, field: string, value: string) => {
        if (!projectDetails) return

        const updatedMaps = projectDetails.mapsPlans.map((map) => (map.id === mapId ? { ...map, [field]: value } : map))

        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      mapsPlans: updatedMaps,
                  }
                : null,
        )
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
                            onChange={(e) => updateField(fieldKey, e.target.value)}
                            className='w-full text-sm'
                            type={type}
                        />
                    </div>
                )
            }
        } else {
            return (
                <div>
                    <label className='text-sm text-gray-600 block mb-1'>{label}</label>
                    <div className='text-sm text-black font-medium'>{value}</div>
                </div>
            )
        }
    }

    // Render table cell based on edit mode
    const renderTableCell = (
        value: string,
        unitId: string,
        field: string,
        unitType: 'apartment' | 'villa' | 'plot',
        options?: { label: string; value: string }[],
    ) => {
        const isEditingThisRow = editingRowId === unitId

        if (isEditingThisRow) {
            if (field === 'floorPlan') {
                return (
                    <div className='flex items-center gap-2'>
                        <FloorPlanImage imageUrl={value} />
                        <StateBaseTextField
                            value={value}
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
                        defaultValue={value}
                        placeholder='Select'
                        className='relative w-full'
                        triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded text-xs text-black hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 w-full cursor-pointer'
                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg'
                        optionClassName='px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer'
                    />
                )
            } else {
                return (
                    <StateBaseTextField
                        value={value}
                        onChange={(e) => updateUnit(unitType, unitId, field, e.target.value)}
                        className='w-full text-xs'
                    />
                )
            }
        } else {
            if (field === 'floorPlan') {
                return <FloorPlanImage imageUrl={value} />
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
            render: (value, row) => renderTableCell(value, row.id, 'superBuiltUpArea', 'apartment'),
        },
        {
            key: 'carpetArea',
            header: 'Carpet area',
            render: (value, row) => renderTableCell(value, row.id, 'carpetArea', 'apartment'),
        },
        {
            key: 'pricePerSqft',
            header: 'Price / sqft',
            render: (value, row) => renderTableCell(value, row.id, 'pricePerSqft', 'apartment'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price (PLC & FRC Extra)',
            render: (value, row) => renderTableCell(value, row.id, 'totalPrice', 'apartment'),
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
            render: (value, row) => renderTableCell(value, row.id, 'plotSize', 'villa'),
        },
        {
            key: 'builtUpArea',
            header: 'Built-up Area',
            render: (value, row) => renderTableCell(value, row.id, 'builtUpArea', 'villa'),
        },
        {
            key: 'carpetArea',
            header: 'Carpet Area',
            render: (value, row) => renderTableCell(value, row.id, 'carpetArea', 'villa'),
        },
        {
            key: 'pricePerSqft',
            header: 'Price / sqft',
            render: (value, row) => renderTableCell(value, row.id, 'pricePerSqft', 'villa'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (value, row) => renderTableCell(value, row.id, 'totalPrice', 'villa'),
        },
        {
            key: 'uds',
            header: 'UDS',
            render: (value, row) => renderTableCell(value, row.id, 'uds', 'villa'),
        },
        {
            key: 'noOfFloors',
            header: 'No. of Floors',
            render: (value, row) => renderTableCell(value, row.id, 'noOfFloors', 'villa'),
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
            render: (value, row) => renderTableCell(value, row.id, 'plotArea', 'plot'),
        },
        {
            key: 'pricePerSqft',
            header: 'Price / sqft',
            render: (value, row) => renderTableCell(value, row.id, 'pricePerSqft', 'plot'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (value, row) => renderTableCell(value, row.id, 'totalPrice', 'plot'),
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
                                        onClick={() => navigate('/restack/prelaunch')}
                                        className='hover:text-gray-700'
                                    >
                                        Pre-Launch
                                    </button>
                                    <span className='mx-2'>/</span>
                                    <span className='text-black font-medium'>{projectDetails.pId}</span>
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
                                {renderField('Project Size (acres)', projectDetails.projectSize, 'projectSize')}
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
                                {renderField(
                                    'Developer / Promoter',
                                    projectDetails.developerPromoter,
                                    'developerPromoter',
                                )}
                                {renderField('Price (per sqft)', projectDetails.pricePerSqft, 'pricePerSqft')}
                                {renderField(
                                    'Proposed Completion Date',
                                    projectDetails.proposedCompletionDate,
                                    'proposedCompletionDate',
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
                                {renderField('Latitude', projectDetails.latitude, 'latitude')}
                            </div>
                            <div className='space-y-4'>
                                {renderField('Google Map', projectDetails.googleMap, 'googleMap')}
                                {renderField('Longitude', projectDetails.longitude, 'longitude')}
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Key Metrics</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Total Units', projectDetails.totalUnits, 'totalUnits')}
                                {renderField('No. of Floors', projectDetails.noOfFloors, 'noOfFloors')}
                                {renderField('Car Parking (total)', projectDetails.carParking, 'carParking')}
                            </div>
                            <div className='space-y-4'>
                                {renderField('EOI Amount (₹)', projectDetails.eoiAmount, 'eoiAmount')}
                                {renderField('No. of Towers', projectDetails.noOfTowers, 'noOfTowers')}
                                {renderField('Open Space', projectDetails.openSpace, 'openSpace')}
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
                                    data={projectDetails.apartmentUnits}
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
                                    data={projectDetails.villaUnits}
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
                                    data={projectDetails.plotUnits}
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
                            {projectDetails.mapsPlans.map((map) => (
                                <div key={map.id}>
                                    <label className='text-sm text-gray-600 block mb-1'>{map.name}</label>
                                    {isEditing ? (
                                        <StateBaseTextField
                                            value={map.url}
                                            onChange={(e) => updateMapPlan(map.id, 'url', e.target.value)}
                                            className='w-full text-sm'
                                            placeholder={`Enter ${map.name} URL`}
                                        />
                                    ) : (
                                        <a
                                            href={map.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-sm text-blue-600 hover:text-blue-800 underline'
                                        >
                                            {map.name}
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PreLaunchDetailsPage
