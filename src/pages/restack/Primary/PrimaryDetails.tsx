import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import {
    projectTypes,
    projectStages,
    apartmentTypologies,
    villaTypologies,
    plotTypes,
} from '../../../pages/dummy_data/restack_primary_details_dummy_data'
import type {
    PrimaryProperty,
    DevelopmentDetail,
    TowerDetail,
    ApartmentConfig,
    VillaConfig,
    PlotConfig,
    FloorPlan,
    UnitDetail,
    ClubhouseDetail,
    ProjectType,
    ProjectStatus,
    ProjectSubType,
} from '../../../data_types/restack/restack-primary'
import editic from '/icons/acn/edit.svg'
import addcircleic from '/icons/acn/add-circle.svg'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../firebase'
import {
    fetchPreReraPropertyRequest,
    fetchPreReraPropertySuccess,
    fetchPreReraPropertyFailure,
    updateProperty,
    updatePropertyField,
} from '../../../store/reducers/restack/preReraProperties'
import type { RootState } from '../../../store/reducers'
import { fetchPrimaryPropertyById } from '../../../store/actions/restack/primaryProperties'
import { clearCurrentProperty } from '../../../store/reducers/restack/primaryProperties'
import type { AppDispatch } from '../../../store'

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
    const { id } = useParams()
    const dispatch = useDispatch<AppDispatch>()
    const { currentProperty, loading, error } = useSelector((state: RootState) => state.primaryProperties)

    const [isEditingGroundData, setIsEditingGroundData] = useState(false)
    const [isEditingAmenities, setIsEditingAmenities] = useState(false)
    const [isEditingClubhouse, setIsEditingClubhouse] = useState(false)
    const [activeTab, setActiveTab] = useState<'apartment' | 'villa' | 'plot'>('apartment')
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [isAddingRow, setIsAddingRow] = useState(false)
    const [selectedTowerForFloorPlan, setSelectedTowerForFloorPlan] = useState<TowerDetail | null>(null)
    const [selectedTowerForUnitDetails, setSelectedTowerForUnitDetails] = useState<TowerDetail | null>(null)

    useEffect(() => {
        if (id) {
            dispatch(fetchPrimaryPropertyById(id))
        }

        return () => {
            dispatch(clearCurrentProperty())
        }
    }, [id, dispatch])

    // Handle field updates for main project details
    const updateField = (field: string, value: string) => {
        dispatch(updatePropertyField({ field, value }))
    }

    // Generic handle edit for sections
    const handleEditSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(true)
    }

    // Generic handle cancel for sections
    const handleCancelSection = (
        setter: React.Dispatch<React.SetStateAction<boolean>>,
        originalData: PrimaryProperty | null,
    ) => {
        setter(false)
        setEditingRowId(null)
        setIsAddingRow(false)
        setSelectedTowerForFloorPlan(null)
        setSelectedTowerForUnitDetails(null)
    }

    // Generic handle save for sections
    const handleSaveSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(false)
        setEditingRowId(null)
        setIsAddingRow(false)
    }

    // Handle data row updates for all tables
    const updateDataRow = (
        dataType:
            | 'apartment'
            | 'villa'
            | 'plot'
            | 'developmentDetails'
            | 'towerDetails'
            | 'clubhouseDetails'
            | 'floorPlan'
            | 'unitDetails',
        rowId: string,
        field: string,
        value: string,
    ) => {
        if (!currentProperty) return

        let fieldName: keyof PrimaryProperty | 'floorPlanDetails' | 'unitDetails'
        let dataRows: any[] = []

        switch (dataType) {
            case 'apartment':
                fieldName = 'apartmentUnits'
                dataRows = currentProperty[fieldName] || []
                break
            case 'villa':
                fieldName = 'villaUnits'
                dataRows = currentProperty[fieldName] || []
                break
            case 'plot':
                fieldName = 'plotUnits'
                dataRows = currentProperty[fieldName] || []
                break
            case 'developmentDetails':
                fieldName = 'developmentDetails'
                dataRows = currentProperty[fieldName] || []
                break
            case 'towerDetails':
                fieldName = 'towerDetails'
                dataRows = currentProperty[fieldName] || []
                break
            case 'clubhouseDetails':
                fieldName = 'clubhouseDetails'
                dataRows = currentProperty[fieldName] || []
                break
            case 'floorPlan':
                if (!selectedTowerForFloorPlan) return
                fieldName = 'floorPlanDetails'
                dataRows = selectedTowerForFloorPlan.floorPlanDetails || []
                break
            case 'unitDetails':
                if (!selectedTowerForUnitDetails) return
                fieldName = 'unitDetails'
                dataRows = selectedTowerForUnitDetails.unitDetails || []
                break
            default:
                return
        }

        const updatedDataRows = dataRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))

        if (dataType === 'floorPlan' && selectedTowerForFloorPlan) {
            const updatedTowerDetails = (currentProperty.towerDetails || []).map((tower: TowerDetail) =>
                tower.id === selectedTowerForFloorPlan.id ? { ...tower, floorPlanDetails: updatedDataRows } : tower,
            )
            dispatch(updateProperty({ towerDetails: updatedTowerDetails }))
        } else if (dataType === 'unitDetails' && selectedTowerForUnitDetails) {
            const updatedTowerDetails = (currentProperty.towerDetails || []).map((tower: TowerDetail) =>
                tower.id === selectedTowerForUnitDetails.id ? { ...tower, unitDetails: updatedDataRows } : tower,
            )
            dispatch(updateProperty({ towerDetails: updatedTowerDetails }))
        } else {
            dispatch(updateProperty({ [fieldName]: updatedDataRows }))
        }
    }

    // Handle adding new unit
    const addNewUnit = (unitType: 'apartment' | 'villa' | 'plot') => {
        if (!currentProperty) return

        const newId = `${unitType}_${Date.now()}`
        let newUnit: ApartmentConfig | VillaConfig | PlotConfig

        switch (unitType) {
            case 'apartment':
                newUnit = {
                    id: newId,
                    aptType: 'Simplex',
                    typology: 'Studio',
                    superBuiltUpArea: 0,
                    carpetArea: 0,
                    currentPricePerSqft: 0,
                    totalPrice: 0,
                }
                break
            case 'villa':
                newUnit = {
                    id: newId,
                    villaType: 'UDS',
                    typology: '2 BHK',
                    plotSize: 0,
                    builtUpArea: 0,
                    carpetArea: 0,
                    currentPricePerSqft: 0,
                    totalPrice: 0,
                    uds: '',
                    udsPercentage: 0,
                    udsArea: 0,
                    numberOfFloors: 0,
                }
                break
            case 'plot':
                newUnit = {
                    id: newId,
                    plotType: 'ODD PLOT',
                    plotArea: 0,
                    currentPricePerSqft: 0,
                    totalPrice: 0,
                }
                break
            default:
                return
        }

        const fieldName = `${unitType}Units` as keyof PrimaryProperty
        const units = (currentProperty[fieldName] as any[]) || []
        dispatch(updateProperty({ [fieldName]: [...units, newUnit] }))

        setEditingRowId(newId)
        setIsAddingRow(true)
    }

    // Handle delete unit
    const deleteUnit = (unitType: 'apartment' | 'villa' | 'plot', unitId: string) => {
        if (!currentProperty) return

        const fieldName = `${unitType}Units` as keyof PrimaryProperty
        const units = (currentProperty[fieldName] as any[]) || []
        const updatedUnits = units.filter((unit) => unit.id !== unitId)
        dispatch(updateProperty({ [fieldName]: updatedUnits }))
    }

    // Handle adding new clubhouse row
    const addClubhouseRow = () => {
        if (!currentProperty) return

        const newId = `new-clubhouse-${Date.now()}`
        const newRow: ClubhouseDetail = {
            id: newId,
            name: '',
            sizeSqft: '',
            floor: '',
        }

        const currentClubhouseDetails = currentProperty.clubhouseDetails || []
        dispatch(updateProperty({ clubhouseDetails: [...currentClubhouseDetails, newRow] }))

        setEditingRowId(newId)
        setIsAddingRow(true)
    }

    // Handle delete clubhouse row
    const deleteClubhouseRow = (rowId: string) => {
        if (!currentProperty?.clubhouseDetails) return
        dispatch(
            updateProperty({
                clubhouseDetails: currentProperty.clubhouseDetails.filter((r: ClubhouseDetail) => r.id !== rowId),
            }),
        )
    }

    // Helper for rendering info rows (read-only and editable)
    const renderInfoRow = (
        label1: string,
        value1: string | undefined,
        label2: string,
        value2: string | undefined,
        fieldKey1?: string,
        fieldKey2?: string,
        options1?: { label: string; value: string }[],
        options2?: { label: string; value: string }[],
        type1: 'text' | 'date' | 'link' = 'text',
        type2: 'text' | 'date' | 'link' = 'text',
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
            type: 'text' | 'date' | 'link' = 'text',
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

    // Render table cell (for editable and read-only states)
    const renderTableCell = (
        value: string | number | null,
        row: any,
        field: string,
        dataType:
            | 'apartment'
            | 'villa'
            | 'plot'
            | 'developmentDetails'
            | 'towerDetails'
            | 'clubhouseDetails'
            | 'floorPlan'
            | 'unitDetails',
        options?: { label: string; value: string }[],
        type: 'text' | 'number' | 'image' | 'button' = 'text',
        buttonType?: 'floorPlan' | 'unitDetails',
        isSectionEditable: boolean = false,
        isRowEditable: boolean = false,
    ) => {
        const uniqueKey = `${row.id}-${field}`

        if (isSectionEditable && isRowEditable) {
            return (
                <StateBaseTextField
                    key={uniqueKey}
                    id={uniqueKey}
                    name={field}
                    value={value !== null ? String(value) : ''}
                    onChange={(e) => updateDataRow(dataType, row.id, field, e.target.value)}
                    type={type === 'number' ? 'number' : 'text'}
                    className='w-full text-sm font-normal text-gray-700 leading-tight border-b border-gray-300 focus:border-blue-500 focus:outline-none py-1'
                />
            )
        }

        if (isSectionEditable && editingRowId === row.id) {
            if (options) {
                return (
                    <Dropdown
                        options={options}
                        defaultValue={value !== null ? value.toString() : ''}
                        onSelect={(optionValue: string) => updateDataRow(dataType, row.id, field, optionValue)}
                        className='w-full'
                        optionClassName='text-sm'
                    />
                )
            } else {
                return (
                    <StateBaseTextField
                        type={type === 'number' ? 'number' : 'text'}
                        value={value !== null ? value.toString() : ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateDataRow(dataType, row.id, field, e.target.value)
                        }
                        className='h-9 text-sm'
                    />
                )
            }
        } else {
            if (type === 'image') {
                return <FloorPlanImage imageUrl={(value as string) || ''} size='small' />
            } else if (type === 'button' && buttonType) {
                return (
                    <div className='flex gap-2'>
                        <Button
                            className='rounded-md bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600'
                            onClick={() => {
                                setSelectedTowerForFloorPlan(row)
                                setSelectedTowerForUnitDetails(null)
                            }}
                        >
                            View
                        </Button>
                        <Button
                            className='rounded-md bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600'
                            onClick={() => {
                                setSelectedTowerForUnitDetails(row)
                                setSelectedTowerForFloorPlan(null)
                            }}
                        >
                            View
                        </Button>
                    </div>
                )
            }
            return <span className='whitespace-nowrap text-sm text-gray-600'>{value !== null ? value : ''}</span>
        }
    }

    // Column definitions for Development Details
    const getDevelopmentColumns = (): TableColumn[] => [
        {
            key: 'slNo',
            header: 'Sl No.',
            render: (value: any, row: any) =>
                renderTableCell(value || '', row, 'slNo', 'developmentDetails', undefined, 'text'),
        },
        {
            key: 'typeOfInventory',
            header: 'Type of Inventory',
            render: (value: any, row: any) =>
                renderTableCell(value || '', row, 'typeOfInventory', 'developmentDetails', undefined, 'text'),
        },
        {
            key: 'noOfInventory',
            header: 'No. of Inventory',
            render: (value: any, row: any) =>
                renderTableCell(value || 0, row, 'noOfInventory', 'developmentDetails', undefined, 'number'),
        },
        {
            key: 'carpetAreaSqMtr',
            header: 'Carpet Area (Sq Mtr)',
            render: (value: any, row: any) =>
                renderTableCell(value || 0, row, 'carpetArea', 'developmentDetails', undefined, 'number'),
        },
        {
            key: 'areaOfExclusiveBalconyVerandahSqMtr',
            header: 'Area of exclusive balcony/verandah (Sq Mtr)',
            render: (value: any, row: any) =>
                renderTableCell(value || 0, row, 'areaOfAmenitiesSqMtrNos', 'developmentDetails', undefined, 'number'),
        },
        {
            key: 'areaOfExclusiveOpenTerraceSqMtr',
            header: 'Area of exclusive open Terrace (Sq Mtr)',
            render: (value: any, row: any) =>
                renderTableCell(value || 0, row, 'areaOfParkingNo', 'developmentDetails', undefined, 'number'),
        },
    ]

    // Column definitions for Tower Details
    const getTowerColumns = (): TableColumn[] => [
        {
            key: 'tower',
            header: 'Tower Name',
            render: (value: any, row: any) =>
                renderTableCell(value || '', row, 'tower', 'towerDetails', undefined, 'text'),
        },
        {
            key: 'type',
            header: 'Type',
            render: (value: any, row: any) =>
                renderTableCell(value || '', row, 'type', 'towerDetails', undefined, 'text'),
        },
        {
            key: 'noOfFloors',
            header: 'No. of Floors',
            render: (value: any, row: any) =>
                renderTableCell(value || 0, row, 'noOfFloors', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'totalUnits',
            header: 'Total Units',
            render: (value: any, row: any) =>
                renderTableCell(value || 0, row, 'totalUnits', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'stilts',
            header: 'Stilts',
            render: (value: any, row: any) =>
                renderTableCell(value || 0, row, 'stilts', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'slabs',
            header: 'Slabs',
            render: (value: any, row: any) =>
                renderTableCell(value || 0, row, 'slabs', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'basement',
            header: 'Basement',
            render: (value: any, row: any) =>
                renderTableCell(value || 0, row, 'basement', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'parking',
            header: 'Parking',
            render: (value: any, row: any) =>
                renderTableCell(value || 0, row, 'parking', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'heightFeet',
            header: 'Height (m)',
            render: (value: any, row: any) =>
                renderTableCell(value || 0, row, 'heightFeet', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'floorPlanAndUnits',
            header: 'Floor Plan / Units',
            render: (_: unknown, row: any) =>
                renderTableCell(null, row, '', 'towerDetails', undefined, 'button', 'floorPlan'),
        },
    ]

    // Column definitions for Floor Plan Details
    const getFloorPlanColumns = (): TableColumn[] => [
        {
            key: 'floorNo',
            header: 'Floor No',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value || ''}</span>,
        },
        {
            key: 'noOfUnits',
            header: 'No of Units',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value || ''}</span>,
        },
    ]

    // Column definitions for Unit Details
    const getUnitDetailsColumns = (): TableColumn[] => [
        {
            key: 'slNo',
            header: 'Sl No',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value || ''}</span>,
        },
        {
            key: 'floorNo',
            header: 'Floor No',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value || ''}</span>,
        },
        {
            key: 'unitNo',
            header: 'Unit No',
            render: (value: any) => <span className='whitespace-nowrap text-sm font-medium'>{value || ''}</span>,
        },
        {
            key: 'unitType',
            header: 'Unit Type',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value || ''}</span>,
        },
        {
            key: 'carpetArea',
            header: 'Carpet Area',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value || ''}</span>,
        },
        {
            key: 'exclusiveArea',
            header: 'Exclusive Area',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value || ''}</span>,
        },
        {
            key: 'associationArea',
            header: 'Association Area',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value || ''}</span>,
        },
        {
            key: 'uds',
            header: 'UDS',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value || ''}</span>,
        },
        {
            key: 'parking',
            header: 'Parking',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value || ''}</span>,
        },
    ]

    // Column definitions for Clubhouse Details
    const getClubhouseColumns = (): TableColumn[] => [
        {
            key: 'name',
            header: 'Name',
            render: (value: any, row: any) =>
                renderTableCell(
                    value || '',
                    row,
                    'name',
                    'clubhouseDetails',
                    undefined,
                    'text',
                    undefined,
                    isEditingClubhouse,
                    editingRowId === row.id,
                ),
        },
        {
            key: 'sizeSqft',
            header: 'Size (Sqft)',
            render: (value: any, row: any) =>
                renderTableCell(
                    value || 0,
                    row,
                    'sizeSqft',
                    'clubhouseDetails',
                    undefined,
                    'number',
                    undefined,
                    isEditingClubhouse,
                    editingRowId === row.id,
                ),
        },
        {
            key: 'floor',
            header: 'Floor',
            render: (value: any, row: any) =>
                renderTableCell(
                    value || '',
                    row,
                    'floor',
                    'clubhouseDetails',
                    undefined,
                    'text',
                    undefined,
                    isEditingClubhouse,
                    editingRowId === row.id,
                ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_, row) => {
                if (!isEditingClubhouse) return null // Only show actions when the section is in edit mode

                const isThisRowBeingEdited = editingRowId === row.id
                const isAnyRowBeingEdited = editingRowId !== null

                return (
                    <div className='flex gap-1 justify-end'>
                        {isThisRowBeingEdited ? (
                            <>
                                <button
                                    className='text-green-600 hover:text-green-800 text-xs font-medium'
                                    onClick={() => {
                                        setEditingRowId(null)
                                        if (isAddingRow) setIsAddingRow(false) // If we were adding, finish adding
                                    }}
                                >
                                    Save
                                </button>
                                <button
                                    className='text-red-600 hover:text-red-800 text-xs font-medium ml-2'
                                    onClick={() => {
                                        // If this was a newly added row, remove it on cancel
                                        if (isAddingRow && row.id.startsWith('new-clubhouse-')) {
                                            dispatch(
                                                updateProperty({
                                                    clubhouseDetails:
                                                        currentProperty?.clubhouseDetails?.filter(
                                                            (r: ClubhouseDetail) => r.id !== row.id,
                                                        ) || [],
                                                }),
                                            )
                                            setEditingRowId(null)
                                            setIsAddingRow(false)
                                        }
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                className='text-gray-600 hover:text-gray-800 text-xs font-medium'
                                onClick={() => {
                                    setEditingRowId(row.id)
                                    setIsAddingRow(false) // Ensure isAddingRow is false when editing an existing row
                                }}
                                disabled={isAnyRowBeingEdited} // Disable edit if another row is being edited
                            >
                                Edit
                            </button>
                        )}
                        {!isAnyRowBeingEdited && !isThisRowBeingEdited && (
                            <button
                                className='text-red-600 hover:text-red-800 text-xs font-medium ml-2'
                                onClick={() => deleteClubhouseRow(row.id)}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )
            },
        },
    ]

    if (loading || !currentProperty) {
        return <Layout loading={true}>Loading project details...</Layout>
    }

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-2'>
                        <div className='flex items-center justify-between mb-4'>
                            <h1 className='text-xl font-semibold text-gray-900'>Project Details</h1>
                        </div>
                    </div>
                    <hr className='border-gray-200 mb-4 w-full' />

                    {/* Project Overview */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Project Overview</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Project Name (As per Rera)',
                            currentProperty?.projectName,
                            'Project Description',
                            currentProperty?.projectDescription,
                            'projectName',
                            'projectDescription',
                        )}
                        {renderInfoRow(
                            'Project Type',
                            currentProperty?.projectType,
                            'Project Sub Type',
                            currentProperty?.projectSubType,
                            'projectType',
                            'projectSubType',
                            projectTypes,
                        )}
                        {renderInfoRow(
                            'Project Status',
                            currentProperty?.projectStatus,
                            '',
                            '',
                            'projectStatus',
                            undefined,
                            projectStages,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            'col-span-2 pr-[50%]',
                        )}
                    </div>

                    {/* Developer Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Developer Details</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Promoter Name',
                            currentProperty?.promoterName,
                            '',
                            '',
                            'developerInfo.promoterName',
                            undefined,
                        )}
                    </div>

                    {/* Project Address */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Project Address</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Project Address',
                            currentProperty?.address,
                            'District',
                            currentProperty?.district,
                            'address',
                            'district',
                        )}
                        {renderInfoRow(
                            'Latitude',
                            currentProperty?.lat?.toString(),
                            'Longitude',
                            currentProperty?.long?.toString(),
                            'lat',
                            'long',
                        )}
                        {renderInfoRow(
                            'Pin Code',
                            currentProperty?.pincode?.toString(),
                            'Zone',
                            currentProperty?.zone,
                            'pincode',
                            'zone',
                        )}
                        {renderInfoRow(
                            'North Schedule',
                            currentProperty?.northSchedule,
                            'South Schedule',
                            currentProperty?.southSchedule,
                            'northSchedule',
                            'southSchedule',
                        )}
                        {renderInfoRow(
                            'East Schedule',
                            currentProperty?.eastSchedule,
                            'West Schedule',
                            currentProperty?.westSchedule,
                            'eastSchedule',
                            'westSchedule',
                        )}
                    </div>

                    {/* Plan Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Plan Details</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Approving Authority',
                            currentProperty?.approvingAuthority,
                            'Approved Plan Number',
                            currentProperty?.approvedPlanNumber,
                            'approvingAuthority',
                            'approvedPlanNumber',
                        )}
                        {renderInfoRow(
                            'Plan Approval Date',
                            currentProperty?.planApprovalDate,
                            'RERA Registration Application Status',
                            currentProperty?.reraStatus,
                            'planApprovalDate',
                            'reraStatus',
                            undefined,
                            undefined,
                            'date',
                            'text',
                        )}
                        {renderInfoRow(
                            'Total Number of Inventories/Flats/Villas',
                            currentProperty?.totalInventories,
                            'No. of Open Parking',
                            currentProperty?.openParking,
                        )}
                        {renderInfoRow(
                            'No. of Covered Parking',
                            currentProperty?.coveredParking,
                            'No. of Garage',
                            currentProperty?.numberOfGarage,
                        )}
                    </div>

                    {/* Area Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Area Details</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Total Open Area (Sq Mtr)',
                            currentProperty?.openArea?.toString(),
                            'Total Covered Area (Sq Mtr)',
                            currentProperty?.coveredArea?.toString(),
                            'openArea',
                            'coveredArea',
                        )}
                        {renderInfoRow(
                            'Total Area Of Land (Sq Mtr)',
                            currentProperty?.landArea?.toString(),
                            'Total Built-up Area of all the Floors (Sq Mtr)',
                            currentProperty?.builtUpArea?.toString(),
                            'landArea',
                            'builtUpArea',
                        )}
                        {renderInfoRow(
                            'Total Carpet Area of all the Floors (Sq Mtr)',
                            currentProperty?.carpetArea?.toString(),
                            'Total Plinth Area (Sq Mtr)',
                            currentProperty?.plinthArea?.toString(),
                            'carpetArea',
                            'plinthArea',
                        )}
                        {renderInfoRow(
                            'Area Of Open Parking (Sq Mtr)',
                            currentProperty?.openParkingArea?.toString(),
                            'Area Of Covered Parking (Sq Mtr)',
                            currentProperty?.coveredParkingArea?.toString(),
                            'openParkingArea',
                            'coveredParkingArea',
                        )}
                        {renderInfoRow(
                            'Area of Garage (Sq Mtr)',
                            currentProperty?.garageArea?.toString(),
                            '',
                            '',
                            'garageArea',
                        )}
                    </div>

                    {/* Source of Water */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Source of Water</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Source',
                            currentProperty?.waterSource?.join(', '),
                            '',
                            '',
                            'waterSource',
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

                    {/* Development Details Table */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Development Details</h2>
                    <div className='px-4 py-3'>
                        {/* Fix this [] after the data is cleaned according to the new schema*/}
                        <FlexibleTable
                            data={currentProperty?.developmentDetails ? [currentProperty?.developmentDetails] : []}
                            columns={getDevelopmentColumns()}
                            hoverable={true}
                            borders={{
                                table: true,
                                header: true,
                                rows: true,
                                cells: false,
                                outer: true,
                            }}
                        />
                        <div className='flex justify-between items-center px-4 py-2 bg-gray-50 border-t border-[#d4dbe2] font-medium text-sm'>
                            <span>Total</span>
                            <span></span>
                            <span>{currentProperty?.totalInventories}</span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'FAR Sanctioned',
                            currentProperty?.floorAreaRatio?.toString() || '0',
                            'Number of Towers',
                            currentProperty?.totalTowers?.toString() || '0',
                            'floorAreaRatio',
                            'totalTowers',
                        )}
                    </div>

                    {/* Tower Details Table */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Tower Details</h2>
                    <div className='px-4 py-3'>
                        <FlexibleTable
                            data={currentProperty?.towerDetails || []}
                            columns={getTowerColumns()}
                            hoverable={true}
                            borders={{
                                table: true,
                                header: true,
                                rows: true,
                                cells: false,
                                outer: true,
                            }}
                        />
                    </div>

                    {/* Floor Plan Section (conditionally rendered) */}
                    {selectedTowerForFloorPlan && (
                        <section className='space-y-4'>
                            <h3 className='px-4 pt-4 text-lg font-bold leading-tight tracking-tight'>
                                Floor Plan for {selectedTowerForFloorPlan.towerName}
                            </h3>
                            <div className='overflow-x-auto px-4 py-3'>
                                <FlexibleTable
                                    data={selectedTowerForFloorPlan.floorPlanDetails || []}
                                    columns={getFloorPlanColumns()}
                                    hoverable={true}
                                    borders={{
                                        table: true,
                                        header: true,
                                        rows: true,
                                        cells: false,
                                        outer: true,
                                    }}
                                />
                            </div>
                        </section>
                    )}

                    {/* Unit Details Section (conditionally rendered) */}
                    {selectedTowerForUnitDetails && (
                        <section className='space-y-4'>
                            <h3 className='px-4 pt-4 text-lg font-bold leading-tight tracking-tight'>
                                Unit Details for {selectedTowerForUnitDetails.towerName}
                            </h3>
                            <div className='overflow-x-auto px-4 py-3'>
                                <FlexibleTable
                                    data={selectedTowerForUnitDetails.unitDetails || []}
                                    columns={getUnitDetailsColumns()}
                                    hoverable={true}
                                    borders={{
                                        table: true,
                                        header: true,
                                        rows: true,
                                        cells: false,
                                        outer: true,
                                    }}
                                />
                            </div>
                        </section>
                    )}

                    {/* Ground Data (replacing the existing Ground Floor section) */}
                    <div className='flex items-center justify-between px-4 pb-3 pt-5'>
                        <h2 className='text-xl font-semibold text-gray-900'>Ground Data</h2>
                        <div className='flex items-center gap-2'>
                            {isEditingGroundData ? (
                                <>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 mr-2'
                                        onClick={() => handleCancelSection(setIsEditingGroundData, currentProperty)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                                        onClick={() => handleSaveSection(setIsEditingGroundData)}
                                    >
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    onClick={() => handleEditSection(setIsEditingGroundData)}
                                >
                                    <img src={editic} alt='edit' className='w-4 h-4 mr-2' />
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className='p-4 grid grid-cols-2 gap-x-6'>
                        {renderInfoRow(
                            'Price (at the time of launch) (per sqft)',
                            currentProperty?.groundFloor?.findOutTheTypeOfLaunchPerYearWill,
                            'Developer Name',
                            currentProperty?.developerInfo?.promoterName,
                            'groundFloor.findOutTheTypeOfLaunchPerYearWill',
                            'developerInfo.promoterName',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            isEditingGroundData,
                        )}
                        {renderInfoRow(
                            'Images',
                            'View Images',
                            'Typology & Unit Plan',
                            'View Units plan',
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            'text',
                            'link',
                            undefined,
                            () => navigate(`/restack/primary/${id}/typology`),
                            undefined,
                            isEditingGroundData,
                        )}
                        {renderInfoRow(
                            'Master Plan',
                            'View Master plan',
                            'Brochure',
                            'Download Brochure (PDF)',
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            'link',
                            'link',
                            () => window.open(currentProperty?.typologyAndUnitPlan?.[0] || '', '_blank'),
                            () => window.open(currentProperty?.brochureURL?.[0] || '', '_blank'),
                            undefined,
                            isEditingGroundData,
                        )}
                        {renderInfoRow(
                            'CDP Map',
                            'CDP map (PDF)',
                            'Cost Sheet',
                            'Download Cost Sheet (PDF)',
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            'link',
                            'link',
                            () => window.open(currentProperty?.typologyAndUnitPlan?.[1] || '', '_blank'),
                            () => window.open(currentProperty?.costSheetURL?.[0] || '', '_blank'),
                            undefined,
                            isEditingGroundData,
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
                                        onClick={() => handleCancelSection(setIsEditingAmenities, currentProperty)}
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
                                value={currentProperty?.amenities?.join(', ')}
                                onChange={(e) =>
                                    dispatch(
                                        updateProperty({ amenities: e.target.value.split(',').map((s) => s.trim()) }),
                                    )
                                }
                                className='w-full h-auto text-base border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='Enter amenities separated by commas'
                                rows={3}
                            />
                        </div>
                    ) : (
                        <div className='flex flex-wrap gap-3 p-3 pr-4'>
                            {currentProperty?.amenities?.map((amenity: string, index: number) => (
                                <div
                                    key={index}
                                    className='flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#e9edf1] pl-4 pr-4'
                                >
                                    <p className='text-[#101419] text-sm font-medium leading-normal'>{amenity}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Clubhouse Details */}
                    <div className='flex items-center justify-between px-4 pb-3 pt-5'>
                        <h2 className='text-xl font-semibold text-gray-900'>Clubhouse Details</h2>
                        <div className='flex items-center gap-2'>
                            {isEditingClubhouse ? (
                                <>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-green-500 text-white hover:bg-green-600 mr-2'
                                        onClick={addClubhouseRow}
                                    >
                                        <img src={addcircleic} alt='add' className='w-4 h-4 mr-2' />
                                        Add Row
                                    </Button>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 mr-2'
                                        onClick={() => handleCancelSection(setIsEditingClubhouse, currentProperty)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                                        onClick={() => handleSaveSection(setIsEditingClubhouse)}
                                    >
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    onClick={() => handleEditSection(setIsEditingClubhouse)}
                                >
                                    <img src={editic} alt='edit' className='w-4 h-4 mr-2' />
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className='px-4'>
                        <FlexibleTable
                            data={currentProperty?.clubhouseDetails || []}
                            columns={getClubhouseColumns()}
                            hoverable={true}
                            borders={{
                                table: true,
                                header: true,
                                rows: true,
                                cells: false,
                                outer: true,
                            }}
                        />
                    </div>

                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>
                        Litigation Status and Complaints
                    </h2>
                    <div className='p-4 space-y-4'>
                        {/* Litigation Status Row */}
                        <div className='flex items-center border-t border-solid border-t-[#d4dbe2] py-4'>
                            <div className='w-1/4'>
                                <p className='text-[#5c738a] text-sm font-normal leading-normal'>Litigation Status</p>
                            </div>
                            <div className='w-3/4'>
                                <p className='text-[#101418] text-sm font-normal leading-normal'>
                                    {currentProperty?.litigation}
                                </p>
                            </div>
                        </div>

                        {/* Affidavit Link Row */}
                        <div className='flex items-center border-t border-solid border-t-[#d4dbe2] py-4'>
                            <div className='w-1/4'>
                                <p className='text-[#5c738a] text-sm font-normal leading-normal'>Affidavit Link</p>
                            </div>
                            <div className='w-3/4'>
                                <button
                                    onClick={() => {
                                        const url = currentProperty?.litigation || ''
                                        if (url) window.open(url, '_blank')
                                    }}
                                    className='text-blue-600 underline text-sm font-normal leading-normal text-left cursor-pointer hover:text-blue-800'
                                >
                                    Download Affidavit (PDF)
                                </button>
                            </div>
                        </div>

                        {/* Complaints Row */}
                        <div className='flex items-center border-t border-solid border-t-[#d4dbe2] py-4'>
                            <div className='w-1/4'>
                                <p className='text-[#5c738a] text-sm font-normal leading-normal'>Complaints</p>
                            </div>
                            <div className='w-3/4'>
                                <button
                                    onClick={() => {
                                        console.log('Navigating to Complaints for pId:', id)
                                        navigate(`/restack/primary/${id}/complaints`)
                                    }}
                                    className='text-blue-600 underline text-sm font-normal leading-normal text-left cursor-pointer hover:text-blue-800'
                                >
                                    View Complaints
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Documents</h2>
                    <div className='flex px-4 py-3 justify-start'>
                        <Button
                            className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300'
                            onClick={() => {
                                console.log('Navigating to Documents for id:', id)
                                navigate(`/restack/primary/${id}/documents`)
                            }}
                        >
                            <span className='truncate'>View Documents</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PrimaryDetailsPage
