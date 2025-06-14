import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../../components/design-elements/Dropdown'
import Button from '../../../../components/design-elements/Button'
import StateBaseTextField from '../../../../components/design-elements/StateBaseTextField'
import {
    generateCompleteProjectDetails,
    type CompleteProjectDetails,
    projectTypes,
    projectStages,
    apartmentTypologies,
    villaTypologies,
    plotTypes,
    type ApartmentUnit,
    type VillaUnit,
    type PlotUnit,
    type DevelopmentDetail,
    type TowerDetail,
    type FloorPlanDetail,
    type UnitDetail,
    type ClubhouseDetail,
} from '../../../../pages/dummy_data/restack_primary_details_dummy_data'
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

const PrimaryDetailsPage = () => {
    const navigate = useNavigate()
    const { pId } = useParams()

    const [projectDetails, setProjectDetails] = useState<CompleteProjectDetails | null>(null)
    const [originalDetails, setOriginalDetails] = useState<CompleteProjectDetails | null>(null)
    const [isEditingGroundData, setIsEditingGroundData] = useState(false)
    const [isEditingAmenities, setIsEditingAmenities] = useState(false)
    const [isEditingClubhouse, setIsEditingClubhouse] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'apartment' | 'villa' | 'plot'>('apartment')
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [isAddingRow, setIsAddingRow] = useState(false)
    const [selectedTowerForFloorPlan, setSelectedTowerForFloorPlan] = useState<TowerDetail | null>(null)
    const [selectedTowerForUnitDetails, setSelectedTowerForUnitDetails] = useState<TowerDetail | null>(null)

    // Load project data based on pId
    useEffect(() => {
        const loadProjectDetails = async () => {
            try {
                setIsLoading(true)
                if (pId) {
                    const details = generateCompleteProjectDetails(pId)
                    setProjectDetails(details)
                    setOriginalDetails(details)
                    console.log('Loaded project details:', details)
                }
            } catch (error) {
                console.error('Error loading project details:', error)
                // Set a default project if loading fails
                const defaultProject = generateCompleteProjectDetails('P0001')
                setProjectDetails(defaultProject)
                setOriginalDetails(defaultProject)
            } finally {
                setIsLoading(false)
            }
        }

        loadProjectDetails()
    }, [pId])

    // Handle field updates for main project details
    const updateField = (field: string, value: string) => {
        if (projectDetails) {
            setProjectDetails((prev) => (prev ? { ...prev, [field]: value } : null))
        }
    }

    // Generic handle edit for sections
    const handleEditSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(true)
    }

    // Generic handle cancel for sections
    const handleCancelSection = (
        setter: React.Dispatch<React.SetStateAction<boolean>>,
        originalData: CompleteProjectDetails | null,
    ) => {
        setProjectDetails(originalData)
        setter(false)
        setEditingRowId(null)
        setIsAddingRow(false)
        setSelectedTowerForFloorPlan(null)
        setSelectedTowerForUnitDetails(null)
    }

    // Generic handle save for sections
    const handleSaveSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        if (projectDetails) {
            setOriginalDetails(projectDetails)
            setter(false)
            setEditingRowId(null)
            setIsAddingRow(false)
            console.log('Saving project details:', projectDetails)
        }
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
        if (!projectDetails) return

        let fieldName: keyof CompleteProjectDetails | 'floorPlanDetails' | 'unitDetails'
        let dataRows: any[]

        switch (dataType) {
            case 'apartment':
                fieldName = 'apartmentUnits'
                dataRows = projectDetails[fieldName]
                break
            case 'villa':
                fieldName = 'villaUnits'
                dataRows = projectDetails[fieldName]
                break
            case 'plot':
                fieldName = 'plotUnits'
                dataRows = projectDetails[fieldName]
                break
            case 'developmentDetails':
                fieldName = 'developmentDetails'
                dataRows = projectDetails[fieldName]
                break
            case 'towerDetails':
                fieldName = 'towerDetails'
                dataRows = projectDetails[fieldName]
                break
            case 'clubhouseDetails':
                fieldName = 'clubhouseDetails'
                dataRows = projectDetails[fieldName]
                break
            case 'floorPlan':
                if (!selectedTowerForFloorPlan) return
                fieldName = 'floorPlanDetails'
                dataRows = selectedTowerForFloorPlan.floorPlanDetails
                break
            case 'unitDetails':
                if (!selectedTowerForUnitDetails) return
                fieldName = 'unitDetails'
                dataRows = selectedTowerForUnitDetails.unitDetails
                break
            default:
                return // Should not happen
        }

        const updatedDataRows = dataRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))

        if (dataType === 'floorPlan' && selectedTowerForFloorPlan) {
            const updatedTowerDetails = projectDetails.towerDetails.map((tower) =>
                tower.id === selectedTowerForFloorPlan.id
                    ? { ...tower, floorPlanDetails: updatedDataRows as FloorPlanDetail[] }
                    : tower,
            )
            setProjectDetails((prev) => (prev ? { ...prev, towerDetails: updatedTowerDetails } : null))
        } else if (dataType === 'unitDetails' && selectedTowerForUnitDetails) {
            const updatedTowerDetails = projectDetails.towerDetails.map((tower) =>
                tower.id === selectedTowerForUnitDetails.id
                    ? { ...tower, unitDetails: updatedDataRows as UnitDetail[] }
                    : tower,
            )
            setProjectDetails((prev) => (prev ? { ...prev, towerDetails: updatedTowerDetails } : null))
        } else {
            setProjectDetails((prev) =>
                prev ? { ...prev, [fieldName as keyof CompleteProjectDetails]: updatedDataRows } : null,
            )
        }
    }

    // Handle adding new unit (kept separate for now as it's specific to unit types)
    const addNewUnit = (unitType: 'apartment' | 'villa' | 'plot') => {
        if (!projectDetails) return

        const newId = `${unitType}_${Date.now()}`
        let newUnit: ApartmentUnit | VillaUnit | PlotUnit

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

        const fieldName = `${unitType}Units` as keyof CompleteProjectDetails
        const units = projectDetails[fieldName] as any[]

        setProjectDetails((prev) => (prev ? { ...prev, [fieldName]: [...units, newUnit] } : null))

        setEditingRowId(newId)
        setIsAddingRow(true)
    }

    // Handle delete unit
    const deleteUnit = (unitType: 'apartment' | 'villa' | 'plot', unitId: string) => {
        if (!projectDetails) return

        const fieldName = `${unitType}Units` as keyof CompleteProjectDetails
        const units = projectDetails[fieldName] as any[]
        const updatedUnits = units.filter((unit) => unit.id !== unitId)

        setProjectDetails((prev) => (prev ? { ...prev, [fieldName]: updatedUnits } : null))
    }

    // Handle adding new clubhouse row
    const addClubhouseRow = () => {
        if (!projectDetails) return

        const newRow: ClubhouseDetail = {
            id: `clubhouse_${Date.now()}`,
            name: '',
            sizeSqft: '',
            floor: '',
        }

        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      clubhouseDetails: [...prev.clubhouseDetails, newRow],
                  }
                : null,
        )

        setEditingRowId(newRow.id)
        setIsAddingRow(true)
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
                                onSelect={(optionValue) => updateField(fieldKey, optionValue)}
                                className='w-full'
                                optionClassName='text-base'
                            />
                        ) : type === 'date' ? (
                            <StateBaseTextField
                                type='date'
                                value={value || ''}
                                onChange={(e) => updateField(fieldKey, e.target.value)}
                                className='h-9 text-base'
                            />
                        ) : (
                            <StateBaseTextField
                                value={value || ''}
                                onChange={(e) => updateField(fieldKey, e.target.value)}
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
    ) => {
        if (isSectionEditable && editingRowId === row.id) {
            if (options) {
                return (
                    <Dropdown
                        options={options}
                        defaultValue={value !== null ? value.toString() : ''}
                        onSelect={(optionValue) => updateDataRow(dataType, row.id, field, optionValue)}
                        className='w-full'
                        optionClassName='text-sm'
                    />
                )
            } else {
                return (
                    <StateBaseTextField
                        type={type === 'number' ? 'number' : 'text'}
                        value={value !== null ? value.toString() : ''}
                        onChange={(e) => updateDataRow(dataType, row.id, field, e.target.value)}
                        className='h-9 text-sm'
                    />
                )
            }
        } else {
            if (type === 'image') {
                return <FloorPlanImage imageUrl={value as string} size='small' />
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
            return <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>
        }
    }

    // Column definitions for Development Details
    const getDevelopmentColumns = (): TableColumn[] => [
        {
            key: 'slNo',
            header: 'Sl No.',
            render: (value, row) => renderTableCell(value, row, 'slNo', 'developmentDetails', undefined, 'text'),
        },
        {
            key: 'typeOfInventory',
            header: 'Type of Inventory',
            render: (value, row) =>
                renderTableCell(value, row, 'typeOfInventory', 'developmentDetails', undefined, 'text'),
        },
        {
            key: 'noOfInventory',
            header: 'No. of Inventory',
            render: (value, row) =>
                renderTableCell(value, row, 'noOfInventory', 'developmentDetails', undefined, 'number'),
        },
        {
            key: 'carpetAreaSqMtr',
            header: 'Carpet Area (Sq Mtr)',
            render: (value, row) =>
                renderTableCell(value, row, 'carpetArea', 'developmentDetails', undefined, 'number'),
        },
        {
            key: 'areaOfExclusiveBalconyVerandahSqMtr',
            header: 'Area of exclusive balcony/verandah (Sq Mtr)',
            render: (value, row) =>
                renderTableCell(value, row, 'areaOfAmenitiesSqMtrNos', 'developmentDetails', undefined, 'number'),
        },
        {
            key: 'areaOfExclusiveOpenTerraceSqMtr',
            header: 'Area of exclusive open Terrace (Sq Mtr)',
            render: (value, row) =>
                renderTableCell(value, row, 'areaOfParkingNo', 'developmentDetails', undefined, 'number'),
        },
    ]

    // Column definitions for Tower Details
    const getTowerColumns = (): TableColumn[] => [
        {
            key: 'tower',
            header: 'Tower Name',
            render: (value, row) => renderTableCell(value, row, 'tower', 'towerDetails', undefined, 'text'),
        },
        {
            key: 'type',
            header: 'Type',
            render: (value, row) => renderTableCell(value, row, 'type', 'towerDetails', undefined, 'text'),
        },
        {
            key: 'noOfFloors',
            header: 'No. of Floors',
            render: (value, row) => renderTableCell(value, row, 'noOfFloors', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'totalUnits',
            header: 'Total Units',
            render: (value, row) => renderTableCell(value, row, 'totalUnits', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'stilts',
            header: 'Stilts',
            render: (value, row) => renderTableCell(value, row, 'stilts', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'slabs',
            header: 'Slabs',
            render: (value, row) => renderTableCell(value, row, 'slabs', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'basement',
            header: 'Basement',
            render: (value, row) => renderTableCell(value, row, 'basement', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'parking',
            header: 'Parking',
            render: (value, row) => renderTableCell(value, row, 'parking', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'heightFeet',
            header: 'Height (m)',
            render: (value, row) => renderTableCell(value, row, 'heightFeet', 'towerDetails', undefined, 'number'),
        },
        {
            key: 'floorPlanAndUnits',
            header: 'Floor Plan / Units',
            render: (_, row) => renderTableCell(null, row, '', 'towerDetails', undefined, 'button', 'floorPlan'),
        },
    ]

    // Column definitions for Floor Plan Details (nested table)
    const getFloorPlanColumns = (): TableColumn[] => [
        {
            key: 'floorNo',
            header: 'Floor No',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'noOfUnits',
            header: 'No of Units',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
    ]

    // Column definitions for Unit Details (nested table)
    const getUnitDetailsColumns = (): TableColumn[] => [
        {
            key: 'slNo',
            header: 'Sl No',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'floorNo',
            header: 'Floor No',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'unitNo',
            header: 'Unit No',
            render: (value) => <span className='whitespace-nowrap text-sm font-medium'>{value}</span>,
        },
        {
            key: 'unitType',
            header: 'Unit Type',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'carpetArea',
            header: 'Carpet Area',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'exclusiveArea',
            header: 'Exclusive Area',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'associationArea',
            header: 'Association Area',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'uds',
            header: 'UDS',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'parking',
            header: 'Parking',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
    ]

    // Column definitions for Clubhouse Details
    const getClubhouseColumns = (): TableColumn[] => [
        {
            key: 'name',
            header: 'Name',
            render: (value, row) =>
                renderTableCell(
                    value,
                    row,
                    'name',
                    'clubhouseDetails',
                    undefined,
                    'text',
                    undefined,
                    isEditingClubhouse,
                ),
        },
        {
            key: 'sizeSqft',
            header: 'Size (Sqft)',
            render: (value, row) =>
                renderTableCell(
                    value,
                    row,
                    'sizeSqft',
                    'clubhouseDetails',
                    undefined,
                    'number',
                    undefined,
                    isEditingClubhouse,
                ),
        },
        {
            key: 'floor',
            header: 'Floor',
            render: (value, row) =>
                renderTableCell(
                    value,
                    row,
                    'floor',
                    'clubhouseDetails',
                    undefined,
                    'text',
                    undefined,
                    isEditingClubhouse,
                ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_, row) =>
                isEditingClubhouse ? (
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
                                            setProjectDetails((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          clubhouseDetails: prev.clubhouseDetails.filter(
                                                              (r) => r.id !== row.id,
                                                          ),
                                                      }
                                                    : null,
                                            )
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
                                Edit
                            </button>
                        )}
                    </div>
                ) : null,
        },
    ]

    if (isLoading || !projectDetails) {
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
                            projectDetails.projectOverview.projectNameAsPerRERA,
                            'Project Description',
                            projectDetails.projectOverview.projectDescription,
                            'projectOverview.projectNameAsPerRERA',
                            'projectOverview.projectDescription',
                        )}
                        {renderInfoRow(
                            'Project Type',
                            projectDetails.projectOverview.projectSize,
                            'Project Sub Type',
                            projectDetails.projectOverview.projectSubType,
                            'projectOverview.projectSize',
                            'projectOverview.projectSubType',
                            projectTypes,
                        )}
                        {renderInfoRow(
                            'Project Status',
                            projectDetails.projectOverview.projectStatus,
                            '',
                            '',
                            'projectOverview.projectStatus',
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
                            projectDetails.developerDetails.promoterName,
                            '',
                            '',
                            'developerDetails.promoterName',
                            undefined,
                        )}
                    </div>

                    {/* Project Address */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Project Address</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Project Address',
                            projectDetails.projectAddress.projectAddress,
                            'District',
                            projectDetails.projectAddress.district,
                            'projectAddress.projectAddress',
                            'projectAddress.district',
                        )}
                        {renderInfoRow(
                            'Latitude',
                            projectDetails.projectAddress.latitude,
                            'Longitude',
                            projectDetails.projectAddress.longitude,
                            'projectAddress.latitude',
                            'projectAddress.longitude',
                        )}
                        {renderInfoRow(
                            'Pin Code',
                            projectDetails.projectAddress.pinCode,
                            'Zone',
                            projectDetails.projectAddress.zone,
                            'projectAddress.pinCode',
                            'projectAddress.zone',
                        )}
                        {renderInfoRow(
                            'North Schedule',
                            projectDetails.projectAddress.northBoundary,
                            'South Schedule',
                            projectDetails.projectAddress.southBoundary,
                            'projectAddress.northBoundary',
                            'projectAddress.southBoundary',
                        )}
                        {renderInfoRow(
                            'East Schedule',
                            projectDetails.projectAddress.eastBoundary,
                            'West Schedule',
                            projectDetails.projectAddress.westBoundary,
                            'projectAddress.westBoundary',
                            'projectAddress.eastBoundary',
                        )}
                    </div>

                    {/* Plan Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Plan Details</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Approving Authority',
                            projectDetails.planDetails.sanctioningAuthority,
                            'Approved Plan Number',
                            projectDetails.planDetails.sanctionedPlanNumber,
                            'planDetails.sanctioningAuthority',
                            'planDetails.sanctionedPlanNumber',
                        )}
                        {renderInfoRow(
                            'Plan Approval Date',
                            projectDetails.planDetails.planApprovalDate,
                            'RERA Registration Application Status',
                            'Approved',
                            'planDetails.planApprovalDate',
                            undefined,
                            undefined,
                            undefined,
                            'date',
                            'text',
                        )}
                        {renderInfoRow('Total Number of Inventories/Flats/Villas', '100', 'No. of Open Parking', '20')}
                        {renderInfoRow('No. of Covered Parking', '50', 'No. of Garage', '10')}
                    </div>

                    {/* Area Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Area Details</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Total Open Area (Sq Mtr)',
                            projectDetails.areaDetails.totalOpenAreaSqMtr,
                            'Total Coverd Area (Sq Mtr)',
                            projectDetails.areaDetails.totalClosedAreaSqMtr,
                            'areaDetails.totalOpenAreaSqMtr',
                            'areaDetails.totalClosedAreaSqMtr',
                        )}
                        {renderInfoRow(
                            'Total Area Of Land (Sq Mtr)',
                            projectDetails.areaDetails.totalBuiltUpLandSqMtr,
                            'Total Built-up Area of all the Floors (Sq Mtr)',
                            projectDetails.areaDetails.totalBuiltUpAreaAsOfTheProjectSqMtr,
                            'areaDetails.totalBuiltUpLandSqMtr',
                            'areaDetails.totalBuiltUpAreaAsOfTheProjectSqMtr',
                        )}
                        {renderInfoRow(
                            'Total Carpet Area of all the Floors (Sq Mtr)',
                            projectDetails.areaDetails.totalCarpetAreaSqMtr,
                            'Total Plinth Area (Sq Mtr)',
                            projectDetails.areaDetails.totalConstructedAreaSqMtr,
                            'areaDetails.totalCarpetAreaSqMtr',
                            'areaDetails.totalConstructedAreaSqMtr',
                        )}
                        {renderInfoRow(
                            'Area Of Open Parking (Sq Mtr)',
                            projectDetails.areaDetails.areaOfGarageSqMtr,
                            'Area Of Covered Parking (Sq Mtr)',
                            projectDetails.areaDetails.areaOfCoveredParkingSqMtr,
                            'areaDetails.areaOfGarageSqMtr',
                            'areaDetails.areaOfCoveredParkingSqMtr',
                        )}
                        {renderInfoRow(
                            'Area of Garage (Sq Mtr)',
                            projectDetails.areaDetails.specificDensityPerAcre,
                            '',
                            '',
                            'areaDetails.specificDensityPerAcre',
                        )}
                    </div>

                    {/* Source of Water */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Source of Water</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Source',
                            projectDetails.sourceOfWater.source,
                            '',
                            '',
                            'sourceOfWater.source',
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
                        <FlexibleTable
                            data={projectDetails.developmentDetails}
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
                            <span>
                                {projectDetails.developmentDetails.reduce(
                                    (sum, item) => sum + parseInt(item.noOfInventory),
                                    0,
                                )}
                            </span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'FAR Sanctioned',
                            projectDetails.developmentDetailsExtra.firstInvestment,
                            'Number of Towers',
                            projectDetails.developmentDetailsExtra.numberOfTowers,
                            'developmentDetailsExtra.firstInvestment',
                            'developmentDetailsExtra.numberOfTowers',
                        )}
                    </div>

                    {/* Tower Details Table */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Tower Details</h2>
                    <div className='px-4 py-3'>
                        <FlexibleTable
                            data={projectDetails.towerDetails}
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
                                Floor Plan for {selectedTowerForFloorPlan.tower}
                            </h3>
                            <div className='overflow-x-auto px-4 py-3'>
                                <FlexibleTable
                                    data={selectedTowerForFloorPlan.floorPlanDetails}
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
                                Unit Details for {selectedTowerForUnitDetails.tower}
                            </h3>
                            <div className='overflow-x-auto px-4 py-3'>
                                <FlexibleTable
                                    data={selectedTowerForUnitDetails.unitDetails}
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
                                        onClick={() => handleCancelSection(setIsEditingGroundData, originalDetails)}
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
                            projectDetails.groundFloor.findOutTheTypeOfLaunchPerYearWill,
                            'Developer Name',
                            projectDetails.developerDetails.promoterName,
                            'groundFloor.findOutTheTypeOfLaunchPerYearWill',
                            'developerDetails.promoterName',
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
                            () => navigate(`/restack/primary/${pId}/typology`),
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
                            () => window.open(projectDetails.mapsPlans[0]?.url || '', '_blank'),
                            () => window.open(projectDetails.documents.viewDocument, '_blank'),
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
                            () => window.open(projectDetails.mapsPlans[1]?.url || '', '_blank'),
                            () => window.open(projectDetails.priceDetails.costSheet, '_blank'),
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
                                value={projectDetails.amenities.join(', ')}
                                onChange={(e) =>
                                    setProjectDetails((prev) =>
                                        prev
                                            ? { ...prev, amenities: e.target.value.split(',').map((s) => s.trim()) }
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
                            {projectDetails.amenities.map((amenity, index) => (
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
                                        onClick={() => handleCancelSection(setIsEditingClubhouse, originalDetails)}
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
                            data={projectDetails.clubhouseDetails}
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

                    {/* Litigation Status and Complaints */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>
                        Litigation Status and Complaints
                    </h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Litigation Status',
                            projectDetails.litigationStatusAndComplaints.litigationStatus,
                            'Appeal Revision',
                            projectDetails.litigationStatusAndComplaints.appealRevision,
                            'litigationStatusAndComplaints.litigationStatus',
                            'litigationStatusAndComplaints.appealRevision',
                        )}
                        {renderInfoRow(
                            'Complaints',
                            'View Complaints',
                            'Affidavit Link',
                            'Download Affidavit (PDF)',
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            'text',
                            'link',
                            undefined,
                            () => window.open(projectDetails.litigationStatusAndComplaints.affidavitLink, '_blank'),
                        )}
                    </div>

                    {/* Documents */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Documents</h2>
                    <div className='flex px-4 py-3 justify-start'>
                        <Button
                            className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300'
                            onClick={() => window.open(projectDetails.documents.viewDocument, '_blank')}
                        >
                            <span className='truncate'>View Documents</span>
                        </Button>
                    </div>

                    <h2 className='text-xl font-semibold mb-4'>Documents</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {renderInfoRow(
                            'Sale Deed',
                            projectDetails.documents.saleDeed,
                            'View Document',
                            projectDetails.documents.viewDocument,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            'text',
                            'link',
                        )}
                        {renderInfoRow(
                            'Complaints',
                            'View Complaints',
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            'link',
                            'text',
                            () => navigate(`/restack/primary/${pId}/complaints`),
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PrimaryDetailsPage
