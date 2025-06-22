import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import DateInput from '../../../components/design-elements/DateInputUnixTimestamps'
import NumberInput from '../../../components/design-elements/StateBaseNumberField'
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
import { clearCurrentProperty, updatePrimaryProperty } from '../../../store/actions/restack/primaryProperties'
import type { RootState } from '../../../store/reducers'
import { fetchPrimaryPropertyById } from '../../../store/actions/restack/primaryProperties'
import type { AppDispatch } from '../../../store'
import Breadcrumb from '../../../components/acn/Breadcrumb'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'
import { toast } from 'react-toastify'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'

// Utility function to safely convert amenities from Firestore format to array
const convertAmenitiesToArray = (amenities: any): string[] => {
    if (Array.isArray(amenities)) {
        return amenities
    } else if (amenities && typeof amenities === 'object') {
        // Convert object with numeric keys back to array
        const keys = Object.keys(amenities).sort((a, b) => Number(a) - Number(b))
        return keys.map((key) => amenities[key]).filter((item) => item !== undefined && item !== null)
    }
    return []
}

// Utility function to safely convert any array field from Firestore format
const convertArrayField = (field: any): any[] => {
    if (Array.isArray(field)) {
        return field
    } else if (field && typeof field === 'object') {
        // Convert object with numeric keys back to array
        const keys = Object.keys(field).sort((a, b) => Number(a) - Number(b))
        return keys.map((key) => field[key]).filter((item) => item !== undefined && item !== null)
    }
    return []
}

// Options for dropdowns
const projectTypes = [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Mixed-Use', value: 'Mixed-Use' },
    { label: 'plotted', value: 'plotted' },
]

const projectSubTypes = [
    { label: 'Apartments', value: 'apartments' },
    { label: 'Villa', value: 'villa' },
    { label: 'Flat', value: 'flat' },
    { label: 'Plot', value: 'plot' },
    { label: 'Commercial', value: 'commercial' },
]

const projectStatuses = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Completed', value: 'completed' },
    { label: 'On Hold', value: 'on-hold' },
]

const reraStatuses = [
    { label: 'Approved', value: 'Approved' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Not Required', value: 'Not Required' },
]

const developerTiers = [
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
    { label: 'D', value: 'D' },
]

const areaUnits = [
    { label: 'Square Meters', value: 'sqMtr' },
    { label: 'Square Feet', value: 'sqft' },
    { label: 'Acres', value: 'acres' },
    { label: 'Hectares', value: 'hectares' },
]

const amenitiesOptions = [
    { label: 'Swimming Pool', value: 'Swimming Pool' },
    { label: 'Gym', value: 'Gym' },
    { label: 'Playground', value: 'Playground' },
    { label: 'Clubhouse', value: 'Clubhouse' },
    { label: 'Security', value: 'Security' },
    { label: 'Parking', value: 'Parking' },
    { label: 'Garden', value: 'Garden' },
    { label: 'Elevator', value: 'Elevator' },
    { label: 'Power Backup', value: 'Power Backup' },
    { label: 'Water Supply', value: 'Water Supply' },
    { label: 'Waste Management', value: 'Waste Management' },
    { label: 'CCTV Surveillance', value: 'CCTV Surveillance' },
    { label: 'Fire Safety', value: 'Fire Safety' },
    { label: 'Kids Play Area', value: 'Kids Play Area' },
    { label: 'Senior Citizen Area', value: 'Senior Citizen Area' },
    { label: 'Jogging Track', value: 'Jogging Track' },
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
    const { id } = useParams()
    const dispatch = useDispatch<AppDispatch>()
    const { currentProperty, loading, error } = useSelector((state: RootState) => state.primaryProperties)

    // Main state management
    const [projectDetails, setProjectDetails] = useState<PrimaryProperty | null>(null)
    const [originalDetails, setOriginalDetails] = useState<PrimaryProperty | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editingRowId, setEditingRowId] = useState<number | null>(null)
    const [isAddingRow, setIsAddingRow] = useState(false)

    // States for managing sections
    const [isAddingDevelopment, setIsAddingDevelopment] = useState(false)
    const [isAddingTower, setIsAddingTower] = useState(false)
    const [isAddingClubhouse, setIsAddingClubhouse] = useState(false)
    const [newDevelopment, setNewDevelopment] = useState<Partial<DevelopmentDetail>>({})
    const [newTower, setNewTower] = useState<Partial<TowerDetail>>({})
    const [newClubhouse, setNewClubhouse] = useState<Partial<ClubhouseDetail>>({})
    const [newAmenity, setNewAmenity] = useState('')
    const [selectedAmenity, setSelectedAmenity] = useState('')

    // Tower selection for floor plans and unit details
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

    useEffect(() => {
        if (currentProperty) {
            // Convert Firestore data format to arrays
            const convertedProperty = {
                ...currentProperty,
                amenities: convertAmenitiesToArray(currentProperty.amenities),
                waterSource: convertArrayField(currentProperty.waterSource),
                developmentDetails: convertArrayField(currentProperty.developmentDetails),
                towerDetails: convertArrayField(currentProperty.towerDetails),
                apartments: convertArrayField(currentProperty.apartments),
                villas: convertArrayField(currentProperty.villas),
                plots: convertArrayField(currentProperty.plots),
                clubhouseDetails: convertArrayField(currentProperty.clubhouseDetails),
                typologyAndUnitPlan: convertArrayField(currentProperty.typologyAndUnitPlan),
                brochureURL: convertArrayField(currentProperty.brochureURL),
                costSheetURL: convertArrayField(currentProperty.costSheetURL),
            }

            setProjectDetails(convertedProperty)
            setOriginalDetails(convertedProperty)
        }
    }, [currentProperty])

    const updateField = (field: string, value: string | number | null) => {
        if (projectDetails) {
            setProjectDetails((prev) => (prev ? { ...prev, [field]: value } : null))
        }
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
        setProjectDetails(originalDetails)
        setIsEditing(false)
        setEditingRowId(null)
        setIsAddingRow(false)
        setIsAddingDevelopment(false)
        setIsAddingTower(false)
        setIsAddingClubhouse(false)
        setNewDevelopment({})
        setNewTower({})
        setNewClubhouse({})
        setNewAmenity('')
        setSelectedAmenity('')
        setSelectedTowerForFloorPlan(null)
        setSelectedTowerForUnitDetails(null)
    }

    const handleSave = async () => {
        if (projectDetails && id) {
            try {
                const updates: Partial<PrimaryProperty> = {}

                if (originalDetails) {
                    Object.keys(projectDetails).forEach((key) => {
                        const typedKey = key as keyof PrimaryProperty
                        if (
                            typedKey === 'developmentDetails' ||
                            typedKey === 'towerDetails' ||
                            typedKey === 'apartments' ||
                            typedKey === 'villas' ||
                            typedKey === 'plots' ||
                            typedKey === 'clubhouseDetails' ||
                            typedKey === 'amenities' ||
                            typedKey === 'waterSource' ||
                            typedKey === 'typologyAndUnitPlan' ||
                            typedKey === 'brochureURL' ||
                            typedKey === 'costSheetURL'
                        ) {
                            // Deep comparison for nested objects and arrays
                            if (!deepCompare(projectDetails[typedKey], originalDetails[typedKey])) {
                                ;(updates as any)[typedKey] = projectDetails[typedKey]
                            }
                        } else if (
                            JSON.stringify(projectDetails[typedKey]) !== JSON.stringify(originalDetails[typedKey])
                        ) {
                            // Simple comparison for other properties
                            ;(updates as any)[typedKey] = projectDetails[typedKey]
                        }
                    })
                }

                // Dispatch the updatePrimaryProperty action
                await dispatch(
                    updatePrimaryProperty({
                        projectId: id,
                        updates: updates,
                    }),
                )

                setOriginalDetails(projectDetails)
                setIsEditing(false)
                setEditingRowId(null)
                setIsAddingRow(false)
                setIsAddingDevelopment(false)
                setIsAddingTower(false)
                setIsAddingClubhouse(false)
                setNewDevelopment({})
                setNewTower({})
                setNewClubhouse({})
                setNewAmenity('')
                setSelectedAmenity('')
                toast.success('Project details saved successfully')
            } catch (error) {
                toast.error('Error saving project details:' + (error as Error).message)
            }
        }
    }

    // Deep comparison function
    function deepCompare(obj1: any, obj2: any): boolean {
        if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
            return obj1 === obj2
        }

        const keys1 = Object.keys(obj1)
        const keys2 = Object.keys(obj2)

        if (keys1.length !== keys2.length) {
            return false
        }

        for (const key of keys1) {
            if (!deepCompare(obj1[key], obj2[key])) {
                return false
            }
        }

        return true
    }

    // Development details management
    const handleAddDevelopment = () => {
        if (newDevelopment.typeOfInventory && newDevelopment.numberOfInventory) {
            const development: DevelopmentDetail = {
                typeOfInventory: newDevelopment.typeOfInventory,
                numberOfInventory: newDevelopment.numberOfInventory,
                carpetAreaSqMtr: newDevelopment.carpetAreaSqMtr || 0,
                balconyVerandahSqMtr: newDevelopment.balconyVerandahSqMtr || 0,
                openTerraceSqMtr: newDevelopment.openTerraceSqMtr || 0,
            }

            setProjectDetails((prev) =>
                prev
                    ? {
                          ...prev,
                          developmentDetails: [...(prev.developmentDetails || []), development],
                      }
                    : null,
            )

            setNewDevelopment({})
            setIsAddingDevelopment(false)
        }
    }

    const handleDeleteDevelopment = (index: number) => {
        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      developmentDetails: (prev.developmentDetails || []).filter((_, i) => i !== index),
                  }
                : null,
        )
    }

    const handleEditDevelopment = (index: number, field: string, value: string) => {
        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      developmentDetails: (prev.developmentDetails || []).map((dev, i) =>
                          i === index ? { ...dev, [field]: value } : dev,
                      ),
                  }
                : null,
        )
    }

    // Tower details management
    const handleAddTower = () => {
        if (newTower.towerName && newTower.typeOfTower) {
            const tower: TowerDetail = {
                id: Date.now().toString(),
                towerName: newTower.towerName,
                typeOfTower: newTower.typeOfTower,
                floors: newTower.floors || 0,
                units: newTower.units || 0,
                stilts: newTower.stilts || 0,
                slabs: newTower.slabs || 0,
                basements: newTower.basements || 0,
                totalParking: newTower.totalParking || 0,
                towerHeightInMeters: newTower.towerHeightInMeters || 0,
                floorplan: { floorNo: '', noOfUnits: '' },
                floorPlanDetails: [],
                unitDetails: [],
            }

            setProjectDetails((prev) =>
                prev
                    ? {
                          ...prev,
                          towerDetails: [...(prev.towerDetails || []), tower],
                      }
                    : null,
            )

            setNewTower({})
            setIsAddingTower(false)
        }
    }

    const handleDeleteTower = (towerId: string) => {
        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      towerDetails: (prev.towerDetails || []).filter((tower) => tower.id !== towerId),
                  }
                : null,
        )
    }

    const handleEditTower = (towerId: string, field: string, value: string) => {
        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      towerDetails: (prev.towerDetails || []).map((tower) =>
                          tower.id === towerId ? { ...tower, [field]: value } : tower,
                      ),
                  }
                : null,
        )
    }

    // Clubhouse details management
    const handleAddClubhouse = () => {
        if (newClubhouse.name && newClubhouse.sizeSqft) {
            const clubhouse: ClubhouseDetail = {
                id: Date.now().toString(),
                name: newClubhouse.name,
                sizeSqft: newClubhouse.sizeSqft.toString(),
                floor: newClubhouse.floor || '',
            }

            setProjectDetails((prev) =>
                prev
                    ? {
                          ...prev,
                          clubhouseDetails: [...(prev.clubhouseDetails || []), clubhouse],
                      }
                    : null,
            )

            setNewClubhouse({})
            setIsAddingClubhouse(false)
        }
    }

    const handleDeleteClubhouse = (clubhouseId: string) => {
        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      clubhouseDetails: (prev.clubhouseDetails || []).filter((club) => club.id !== clubhouseId),
                  }
                : null,
        )
    }

    const handleEditClubhouse = (clubhouseId: string, field: string, value: string) => {
        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      clubhouseDetails: (prev.clubhouseDetails || []).map((club) =>
                          club.id === clubhouseId ? { ...club, [field]: value } : club,
                      ),
                  }
                : null,
        )
    }

    // Amenities management
    const handleAddAmenityFromDropdown = () => {
        if (selectedAmenity && projectDetails) {
            const currentAmenities = projectDetails.amenities || []
            if (!currentAmenities.includes(selectedAmenity)) {
                setProjectDetails((prev) =>
                    prev
                        ? {
                              ...prev,
                              amenities: [...currentAmenities, selectedAmenity],
                          }
                        : null,
                )
            }
            setSelectedAmenity('')
        }
    }

    const handleAddCustomAmenity = () => {
        if (newAmenity.trim() && projectDetails) {
            const currentAmenities = projectDetails.amenities || []
            if (!currentAmenities.includes(newAmenity.trim())) {
                setProjectDetails((prev) =>
                    prev
                        ? {
                              ...prev,
                              amenities: [...currentAmenities, newAmenity.trim()],
                          }
                        : null,
                )
            }
            setNewAmenity('')
        }
    }

    const handleRemoveAmenity = (amenityToRemove: string) => {
        setProjectDetails((prev) =>
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
                        onChange={(numValue: number | null, stringValue: string) => {
                            updateField(fieldKey, numValue ?? 0)
                        }}
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
            }

            return (
                <div className='border-b border-[#D4DBE2] gap-1 pb-2 mb-4 flex flex-col justify-between'>
                    <label className='text-sm text-gray-600 block mb-1'>{label} </label>
                    <div className='text-sm text-black font-medium'>{displayValue}</div>
                </div>
            )
        }
    }

    const getDevelopmentColumns = () => [
        {
            key: 'typeOfInventory',
            header: 'Type of Inventory',
            render: (value: any, row: any) => {
                const index =
                    projectDetails?.developmentDetails?.findIndex(
                        (dev, i) =>
                            dev.typeOfInventory === row.typeOfInventory &&
                            dev.numberOfInventory === row.numberOfInventory,
                    ) ?? -1
                return isEditing && editingRowId === index ? (
                    <StateBaseTextField
                        value={value}
                        onChange={(e) => handleEditDevelopment(index, 'typeOfInventory', e.target.value)}
                        className='w-full text-sm'
                    />
                ) : (
                    <span>{value}</span>
                )
            },
        },
        {
            key: 'numberOfInventory',
            header: 'Number of Inventory',
            render: (value: any, row: any) => {
                const index =
                    projectDetails?.developmentDetails?.findIndex(
                        (dev, i) =>
                            dev.typeOfInventory === row.typeOfInventory &&
                            dev.numberOfInventory === row.numberOfInventory,
                    ) ?? -1
                return isEditing && editingRowId === index ? (
                    <NumberInput
                        label=''
                        placeholder='Enter number'
                        value={value}
                        onChange={(numValue: number | null) => {
                            handleEditDevelopment(index, 'numberOfInventory', (numValue || 0).toString())
                        }}
                        numberType='integer'
                        min={0}
                        fullWidth
                    />
                ) : (
                    <span>{value}</span>
                )
            },
        },
        {
            key: 'carpetAreaSqMtr',
            header: 'Carpet Area (Sq Mtr)',
            render: (value: any, row: any) => {
                const index =
                    projectDetails?.developmentDetails?.findIndex(
                        (dev, i) =>
                            dev.typeOfInventory === row.typeOfInventory &&
                            dev.numberOfInventory === row.numberOfInventory,
                    ) ?? -1
                return isEditing && editingRowId === index ? (
                    <NumberInput
                        label=''
                        placeholder='Enter area'
                        value={value}
                        onChange={(numValue: number | null) => {
                            handleEditDevelopment(index, 'carpetAreaSqMtr', (numValue || 0).toString())
                        }}
                        numberType='decimal'
                        min={0}
                        fullWidth
                    />
                ) : (
                    <span>{value}</span>
                )
            },
        },
        {
            key: 'balconyVerandahSqMtr',
            header: 'Balcony/Verandah (Sq Mtr)',
            render: (value: any, row: any) => {
                const index =
                    projectDetails?.developmentDetails?.findIndex(
                        (dev, i) =>
                            dev.typeOfInventory === row.typeOfInventory &&
                            dev.numberOfInventory === row.numberOfInventory,
                    ) ?? -1
                return isEditing && editingRowId === index ? (
                    <NumberInput
                        label=''
                        placeholder='Enter area'
                        value={value || 0}
                        onChange={(numValue: number | null) => {
                            handleEditDevelopment(index, 'balconyVerandahSqMtr', (numValue || 0).toString())
                        }}
                        numberType='decimal'
                        min={0}
                        fullWidth
                    />
                ) : (
                    <span>{value || 0}</span>
                )
            },
        },
        {
            key: 'openTerraceSqMtr',
            header: 'Open Terrace (Sq Mtr)',
            render: (value: any, row: any) => {
                const index =
                    projectDetails?.developmentDetails?.findIndex(
                        (dev, i) =>
                            dev.typeOfInventory === row.typeOfInventory &&
                            dev.numberOfInventory === row.numberOfInventory,
                    ) ?? -1
                return isEditing && editingRowId === index ? (
                    <NumberInput
                        label=''
                        placeholder='Enter area'
                        value={value || 0}
                        onChange={(numValue: number | null) => {
                            handleEditDevelopment(index, 'openTerraceSqMtr', (numValue || 0).toString())
                        }}
                        numberType='decimal'
                        min={0}
                        fullWidth
                    />
                ) : (
                    <span>{value || 0}</span>
                )
            },
        },
        ...(isEditing
            ? [
                  {
                      key: 'actions',
                      header: 'Actions',
                      render: (value: any, row: any) => {
                          const index =
                              projectDetails?.developmentDetails?.findIndex(
                                  (dev, i) =>
                                      dev.typeOfInventory === row.typeOfInventory &&
                                      dev.numberOfInventory === row.numberOfInventory,
                              ) ?? -1
                          return (
                              <div className='flex gap-2'>
                                  {editingRowId === index ? (
                                      <>
                                          <Button
                                              bgColor='bg-green-600'
                                              textColor='text-white'
                                              className='px-2 py-1 h-6 text-xs'
                                              onClick={() => setEditingRowId(null)}
                                          >
                                              ✓
                                          </Button>
                                          <Button
                                              bgColor='bg-gray-400'
                                              textColor='text-white'
                                              className='px-2 py-1 h-6 text-xs'
                                              onClick={() => setEditingRowId(null)}
                                          >
                                              ✕
                                          </Button>
                                      </>
                                  ) : (
                                      <>
                                          <Button
                                              bgColor='bg-blue-600'
                                              textColor='text-white'
                                              className='px-2 py-1 h-6 text-xs'
                                              onClick={() => setEditingRowId(index)}
                                          >
                                              Edit
                                          </Button>
                                          <Button
                                              bgColor='bg-red-600'
                                              textColor='text-white'
                                              className='px-2 py-1 h-6 text-xs'
                                              onClick={() => handleDeleteDevelopment(index)}
                                          >
                                              Delete
                                          </Button>
                                      </>
                                  )}
                              </div>
                          )
                      },
                  },
              ]
            : []),
    ]

    const getTowerColumns = (): TableColumn[] => [
        {
            key: 'towerName',
            header: 'Tower Name',
            render: (value: any, row: any) =>
                isEditing && editingRowId === row.id ? (
                    <StateBaseTextField
                        value={value}
                        onChange={(e) => handleEditTower(row.id, 'towerName', e.target.value)}
                        className='w-full text-sm'
                    />
                ) : (
                    <span className='text-sm font-medium'>{value}</span>
                ),
        },
        {
            key: 'typeOfTower',
            header: 'Type of Tower',
            render: (value: any, row: any) =>
                isEditing && editingRowId === row.id ? (
                    <StateBaseTextField
                        value={value}
                        onChange={(e) => handleEditTower(row.id, 'typeOfTower', e.target.value)}
                        className='w-full text-sm'
                    />
                ) : (
                    <span className='text-sm font-medium'>{value}</span>
                ),
        },
        {
            key: 'floors',
            header: 'Floors',
            render: (value: any, row: any) =>
                isEditing && editingRowId === row.id ? (
                    <StateBaseTextField
                        type='number'
                        value={value}
                        onChange={(e) => handleEditTower(row.id, 'floors', e.target.value)}
                        className='w-full text-sm'
                    />
                ) : (
                    <span className='text-sm font-medium'>{value}</span>
                ),
        },
        {
            key: 'units',
            header: 'Units',
            render: (value: any, row: any) =>
                isEditing && editingRowId === row.id ? (
                    <StateBaseTextField
                        type='number'
                        value={value}
                        onChange={(e) => handleEditTower(row.id, 'units', e.target.value)}
                        className='w-full text-sm'
                    />
                ) : (
                    <span className='text-sm font-medium'>{value}</span>
                ),
        },
        {
            key: 'totalParking',
            header: 'Total Parking',
            render: (value: any, row: any) =>
                isEditing && editingRowId === row.id ? (
                    <StateBaseTextField
                        type='number'
                        value={value}
                        onChange={(e) => handleEditTower(row.id, 'totalParking', e.target.value)}
                        className='w-full text-sm'
                    />
                ) : (
                    <span className='text-sm font-medium'>{value}</span>
                ),
        },
        {
            key: 'towerHeightInMeters',
            header: 'Height (m)',
            render: (value: any, row: any) =>
                isEditing && editingRowId === row.id ? (
                    <StateBaseTextField
                        type='number'
                        value={value}
                        onChange={(e) => handleEditTower(row.id, 'towerHeightInMeters', e.target.value)}
                        className='w-full text-sm'
                    />
                ) : (
                    <span className='text-sm font-medium'>{value}</span>
                ),
        },
        {
            key: 'floorPlanAndUnits',
            header: 'Floor Plan / Units',
            render: (_: unknown, row: any) => (
                <div className='flex gap-2'>
                    <Button
                        className='rounded-md bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600'
                        onClick={() => {
                            setSelectedTowerForFloorPlan(row)
                            setSelectedTowerForUnitDetails(null)
                        }}
                    >
                        Floor Plan
                    </Button>
                    <Button
                        className='rounded-md bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600'
                        onClick={() => {
                            setSelectedTowerForUnitDetails(row)
                            setSelectedTowerForFloorPlan(null)
                        }}
                    >
                        Units
                    </Button>
                </div>
            ),
        },
        ...(isEditing
            ? [
                  {
                      key: 'actions',
                      header: 'Actions',
                      render: (value: any, row: any) => (
                          <div className='flex gap-2'>
                              {editingRowId === row.id ? (
                                  <>
                                      <Button
                                          bgColor='bg-green-600'
                                          textColor='text-white'
                                          className='px-2 py-1 h-6 text-xs'
                                          onClick={() => setEditingRowId(null)}
                                      >
                                          ✓
                                      </Button>
                                      <Button
                                          bgColor='bg-gray-400'
                                          textColor='text-white'
                                          className='px-2 py-1 h-6 text-xs'
                                          onClick={() => setEditingRowId(null)}
                                      >
                                          ✕
                                      </Button>
                                  </>
                              ) : (
                                  <>
                                      <Button
                                          bgColor='bg-blue-600'
                                          textColor='text-white'
                                          className='px-2 py-1 h-6 text-xs'
                                          onClick={() => setEditingRowId(row.id)}
                                      >
                                          Edit
                                      </Button>
                                      <Button
                                          bgColor='bg-red-600'
                                          textColor='text-white'
                                          className='px-2 py-1 h-6 text-xs'
                                          onClick={() => handleDeleteTower(row.id)}
                                      >
                                          Delete
                                      </Button>
                                  </>
                              )}
                          </div>
                      ),
                  },
              ]
            : []),
    ]

    const getClubhouseColumns = (): TableColumn[] => [
        {
            key: 'name',
            header: 'Name',
            render: (value: any, row: any) =>
                isEditing && editingRowId === row.id ? (
                    <StateBaseTextField
                        value={value}
                        onChange={(e) => handleEditClubhouse(row.id, 'name', e.target.value)}
                        className='w-full text-sm'
                    />
                ) : (
                    <span className='text-sm font-medium'>{value}</span>
                ),
        },
        {
            key: 'sizeSqft',
            header: 'Size (Sq Ft)',
            render: (value: any, row: any) =>
                isEditing && editingRowId === row.id ? (
                    <NumberInput
                        label=''
                        placeholder='Enter size'
                        value={parseFloat(value || '0')}
                        onChange={(numValue: number | null) => {
                            handleEditClubhouse(row.id, 'sizeSqft', (numValue || 0).toString())
                        }}
                        numberType='decimal'
                        min={0}
                        fullWidth
                    />
                ) : (
                    <span className='text-sm font-medium'>{value}</span>
                ),
        },
        {
            key: 'floor',
            header: 'Floor',
            render: (value: any, row: any) =>
                isEditing && editingRowId === row.id ? (
                    <StateBaseTextField
                        value={value}
                        onChange={(e) => handleEditClubhouse(row.id, 'floor', e.target.value)}
                        className='w-full text-sm'
                    />
                ) : (
                    <span className='text-sm font-medium'>{value}</span>
                ),
        },
        ...(isEditing
            ? [
                  {
                      key: 'actions',
                      header: 'Actions',
                      render: (value: any, row: any) => (
                          <div className='flex gap-2'>
                              {editingRowId === row.id ? (
                                  <>
                                      <Button
                                          bgColor='bg-green-600'
                                          textColor='text-white'
                                          className='px-2 py-1 h-6 text-xs'
                                          onClick={() => setEditingRowId(null)}
                                      >
                                          ✓
                                      </Button>
                                      <Button
                                          bgColor='bg-gray-400'
                                          textColor='text-white'
                                          className='px-2 py-1 h-6 text-xs'
                                          onClick={() => setEditingRowId(null)}
                                      >
                                          ✕
                                      </Button>
                                  </>
                              ) : (
                                  <>
                                      <Button
                                          bgColor='bg-blue-600'
                                          textColor='text-white'
                                          className='px-2 py-1 h-6 text-xs'
                                          onClick={() => setEditingRowId(row.id)}
                                      >
                                          Edit
                                      </Button>
                                      <Button
                                          bgColor='bg-red-600'
                                          textColor='text-white'
                                          className='px-2 py-1 h-6 text-xs'
                                          onClick={() => handleDeleteClubhouse(row.id)}
                                      >
                                          Delete
                                      </Button>
                                  </>
                              )}
                          </div>
                      ),
                  },
              ]
            : []),
    ]

    const getFloorPlanColumns = (): TableColumn[] => [
        {
            key: 'floorNo',
            header: 'Floor No',
            render: (value: any) => <span className='text-sm font-medium'>{value}</span>,
        },
        {
            key: 'noOfUnits',
            header: 'No of Units',
            render: (value: any) => <span className='text-sm font-medium'>{value}</span>,
        },
    ]

    const getUnitDetailsColumns = (): TableColumn[] => [
        {
            key: 'slNo',
            header: 'Sl No',
            render: (value: any) => <span className='text-sm font-medium'>{value}</span>,
        },
        {
            key: 'floorNo',
            header: 'Floor No',
            render: (value: any) => <span className='text-sm font-medium'>{value}</span>,
        },
        {
            key: 'unitNo',
            header: 'Unit No',
            render: (value: any) => <span className='text-sm font-medium'>{value}</span>,
        },
        {
            key: 'unitType',
            header: 'Unit Type',
            render: (value: any) => <span className='text-sm font-medium'>{value}</span>,
        },
        {
            key: 'carpetArea',
            header: 'Carpet Area',
            render: (value: any) => <span className='text-sm font-medium'>{value}</span>,
        },
        {
            key: 'exclusiveArea',
            header: 'Exclusive Area',
            render: (value: any) => <span className='text-sm font-medium'>{value}</span>,
        },
        {
            key: 'associationArea',
            header: 'Association Area',
            render: (value: any) => <span className='text-sm font-medium'>{value}</span>,
        },
        {
            key: 'uds',
            header: 'UDS',
            render: (value: any) => <span className='text-sm font-medium'>{value}</span>,
        },
        {
            key: 'parking',
            header: 'Parking',
            render: (value: any) => <span className='text-sm font-medium'>{value}</span>,
        },
    ]

    if (loading || !projectDetails) {
        return <Layout loading={true}>Loading project details...</Layout>
    }
    if (error) {
        return (
            <Layout loading={false}>
                <div className='text-red-600 font-bold p-8'>Error: {error}</div>
            </Layout>
        )
    }
    if (!projectDetails) {
        return (
            <Layout loading={false}>
                <div className='text-gray-600 font-bold p-8'>No property data found.</div>
            </Layout>
        )
    }

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='pb-4 pt-[9px] bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Success Message */}
                    {/* {updateSuccess && (
                        <div className='fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50'>
                            {updateSuccess}
                        </div>
                    )}

                    {/* Unsaved Changes Warning */}
                    {/* {hasUnsavedChanges && (
                        <div className='fixed top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-md shadow-lg z-50'>
                            You have unsaved changes
                        </div>
                    )} */}

                    {/* Header */}
                    <div className=''>
                        <div className='flex items-center justify-between px-6'>
                            <Breadcrumb link='/restack/primary' parent='Primary' child={projectDetails?.projectName} />
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
                    <hr className='border-gray-200 w-full' />

                    {/* Project Overview */}
                    <h2 className='text-xl font-bold text-[32px] text-[#111518] px-4 py-4'>
                        {projectDetails?.projectName}
                    </h2>
                    <div className='px-4 pt-5 pb-3 text-[22px] font-bold font-[Inter] text-[#111518]'>
                        Project Overview
                    </div>
                    <div className='p-4 grid grid-cols-2 gap-0'>
                        {renderField(
                            'Project Name (As per Rera)',
                            projectDetails?.projectName,
                            'projectName',
                            undefined,
                            'text',
                        )}
                        {renderField('Project Type', projectDetails?.projectType, 'projectType', projectTypes, 'text')}
                        {renderField(
                            'Project Sub Type',
                            toCapitalizedWords(projectDetails?.projectSubType),
                            'projectSubType',
                            projectSubTypes,
                            'text',
                        )}
                        {renderField(
                            'Project Status',
                            toCapitalizedWords(projectDetails?.projectStatus),
                            'projectStatus',
                            projectStatuses,
                            'text',
                        )}
                    </div>

                    {/* Developer Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Developer Details</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderField(
                            'Promoter Name',
                            projectDetails?.promoterName || '',
                            'developerInfo.promoterName',
                            undefined,
                            'text',
                        )}
                    </div>

                    {/* Project Address */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Project Address</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderField('Project Address', projectDetails?.address, 'address', undefined, 'text')}
                        {renderField('District', projectDetails?.district || '', 'district', undefined, 'text')}
                        {renderField('Latitude', projectDetails?.lat?.toString() || '', 'lat', undefined, 'number')}
                        {renderField('Longitude', projectDetails?.long?.toString() || '', 'long', undefined, 'number')}
                        {renderField(
                            'Pin Code',
                            projectDetails?.pincode?.toString() || '',
                            'pincode',
                            undefined,
                            'number',
                        )}
                        {renderField('Zone', projectDetails?.zone || '', 'zone', undefined, 'text')}
                        {renderField(
                            'North Schedule',
                            projectDetails?.northSchedule || '',
                            'northSchedule',
                            undefined,
                            'text',
                        )}
                        {renderField(
                            'South Schedule',
                            projectDetails?.southSchedule || '',
                            'southSchedule',
                            undefined,
                            'text',
                        )}
                        {renderField(
                            'East Schedule',
                            projectDetails?.eastSchedule || '',
                            'eastSchedule',
                            undefined,
                            'text',
                        )}
                        {renderField(
                            'West Schedule',
                            projectDetails?.westSchedule || '',
                            'westSchedule',
                            undefined,
                            'text',
                        )}
                    </div>

                    {/* Plan Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Plan Details</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderField(
                            'Approving Authority',
                            projectDetails?.approvingAuthority || '',
                            'approvingAuthority',
                            undefined,
                            'text',
                        )}
                        {renderField(
                            'Approved Plan Number',
                            projectDetails?.approvedPlanNumber || '',
                            'approvedPlanNumber',
                            undefined,
                            'text',
                        )}
                        {renderField(
                            'Plan Approval Date',
                            projectDetails?.planApprovalDate || '',
                            'planApprovalDate',
                            undefined,
                            'date',
                        )}
                        {renderField(
                            'RERA Registration Application Status',
                            projectDetails?.reraStatus || '',
                            'reraStatus',
                            reraStatuses,
                            'text',
                        )}
                    </div>

                    {/* Area Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Area Details</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderField(
                            'Total Open Area (Sq Mtr)',
                            projectDetails?.openArea?.toString() || '',
                            'openArea',
                            undefined,
                            'number',
                        )}
                        {renderField(
                            'Total Covered Area (Sq Mtr)',
                            projectDetails?.coveredArea?.toString() || '',
                            'coveredArea',
                            undefined,
                            'number',
                        )}
                        {renderField(
                            'Total Area Of Land (Sq Mtr)',
                            projectDetails?.landArea?.toString() || '',
                            'landArea',
                            undefined,
                            'number',
                        )}
                        {renderField(
                            'Total Built-up Area of all the Floors (Sq Mtr)',
                            projectDetails?.builtUpArea?.toString() || '',
                            'builtUpArea',
                            undefined,
                            'number',
                        )}
                        {renderField(
                            'Total Carpet Area of all the Floors (Sq Mtr)',
                            projectDetails?.carpetArea?.toString() || '',
                            'carpetArea',
                            undefined,
                            'number',
                        )}
                        {renderField(
                            'Total Plinth Area (Sq Mtr)',
                            projectDetails?.plinthArea?.toString() || '',
                            'plinthArea',
                            undefined,
                            'number',
                        )}
                        {renderField(
                            'Area Of Open Parking (Sq Mtr)',
                            projectDetails?.openParkingArea?.toString() || '',
                            'openParkingArea',
                            undefined,
                            'number',
                        )}
                        {renderField(
                            'Area Of Covered Parking (Sq Mtr)',
                            projectDetails?.coveredParkingArea?.toString() || '',
                            'coveredParkingArea',
                            undefined,
                            'number',
                        )}
                        {renderField(
                            'Area of Garage (Sq Mtr)',
                            projectDetails?.garageArea?.toString() || '',
                            'garageArea',
                            undefined,
                            'number',
                        )}
                    </div>

                    {/* Source of Water */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Source of Water</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderField(
                            'Source',
                            convertArrayField(projectDetails?.waterSource).join(', ') || '',
                            'waterSource',
                            undefined,
                            'text',
                        )}
                    </div>

                    {/* Development Details */}
                    <div className='mb-8'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-semibold text-black'>Development Details</h2>
                            {isEditing && (
                                <Button
                                    bgColor='bg-blue-600'
                                    textColor='text-white'
                                    className='px-3 py-1 h-8 text-sm'
                                    onClick={() => setIsAddingDevelopment(true)}
                                >
                                    + Add Development
                                </Button>
                            )}
                        </div>

                        {isAddingDevelopment && (
                            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4'>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Type of Inventory</label>
                                        <StateBaseTextField
                                            value={newDevelopment.typeOfInventory || ''}
                                            onChange={(e) =>
                                                setNewDevelopment((prev) => ({
                                                    ...prev,
                                                    typeOfInventory: e.target.value,
                                                }))
                                            }
                                            className='w-full text-sm'
                                            placeholder='Enter inventory type'
                                        />
                                    </div>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Number of Inventory</label>
                                        <NumberInput
                                            label=''
                                            placeholder='Enter number'
                                            value={newDevelopment.numberOfInventory || 0}
                                            onChange={(numValue: number | null) => {
                                                setNewDevelopment((prev) => ({
                                                    ...prev,
                                                    numberOfInventory: numValue || 0,
                                                }))
                                            }}
                                            numberType='integer'
                                            min={0}
                                            fullWidth
                                        />
                                    </div>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Carpet Area (Sq Mtr)</label>
                                        <NumberInput
                                            label=''
                                            placeholder='Enter area'
                                            value={newDevelopment.carpetAreaSqMtr || 0}
                                            onChange={(numValue: number | null) => {
                                                setNewDevelopment((prev) => ({
                                                    ...prev,
                                                    carpetAreaSqMtr: numValue || 0,
                                                }))
                                            }}
                                            numberType='decimal'
                                            min={0}
                                            fullWidth
                                        />
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>
                                            Balcony/Verandah (Sq Mtr)
                                        </label>
                                        <NumberInput
                                            label=''
                                            placeholder='Enter area'
                                            value={newDevelopment.balconyVerandahSqMtr || 0}
                                            onChange={(numValue: number | null) => {
                                                setNewDevelopment((prev) => ({
                                                    ...prev,
                                                    balconyVerandahSqMtr: numValue || 0,
                                                }))
                                            }}
                                            numberType='decimal'
                                            min={0}
                                            fullWidth
                                        />
                                    </div>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Open Terrace (Sq Mtr)</label>
                                        <NumberInput
                                            label=''
                                            placeholder='Enter area'
                                            value={newDevelopment.openTerraceSqMtr || 0}
                                            onChange={(numValue: number | null) => {
                                                setNewDevelopment((prev) => ({
                                                    ...prev,
                                                    openTerraceSqMtr: numValue || 0,
                                                }))
                                            }}
                                            numberType='decimal'
                                            min={0}
                                            fullWidth
                                        />
                                    </div>
                                </div>
                                <div className='flex gap-2'>
                                    <Button
                                        bgColor='bg-green-600'
                                        textColor='text-white'
                                        className='px-3 py-1 h-8 text-sm'
                                        onClick={handleAddDevelopment}
                                    >
                                        Add Development
                                    </Button>
                                    <Button
                                        bgColor='bg-gray-400'
                                        textColor='text-white'
                                        className='px-3 py-1 h-8 text-sm'
                                        onClick={() => {
                                            setIsAddingDevelopment(false)
                                            setNewDevelopment({})
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                            <FlexibleTable
                                data={projectDetails?.developmentDetails || []}
                                columns={getDevelopmentColumns()}
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

                    {/* Tower Details */}
                    <div className='mb-8'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-semibold text-black'>Tower Details</h2>
                            {isEditing && (
                                <Button
                                    bgColor='bg-blue-600'
                                    textColor='text-white'
                                    className='px-3 py-1 h-8 text-sm'
                                    onClick={() => setIsAddingTower(true)}
                                >
                                    + Add Tower
                                </Button>
                            )}
                        </div>

                        {isAddingTower && (
                            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4'>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Tower Name</label>
                                        <StateBaseTextField
                                            value={newTower.towerName || ''}
                                            onChange={(e) =>
                                                setNewTower((prev) => ({ ...prev, towerName: e.target.value }))
                                            }
                                            className='w-full text-sm'
                                            placeholder='Enter tower name'
                                        />
                                    </div>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Type of Tower</label>
                                        <StateBaseTextField
                                            value={newTower.typeOfTower || ''}
                                            onChange={(e) =>
                                                setNewTower((prev) => ({ ...prev, typeOfTower: e.target.value }))
                                            }
                                            className='w-full text-sm'
                                            placeholder='Enter tower type'
                                        />
                                    </div>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Floors</label>
                                        <NumberInput
                                            label=''
                                            placeholder='Enter number of floors'
                                            value={newTower.floors || 0}
                                            onChange={(numValue: number | null) => {
                                                setNewTower((prev) => ({
                                                    ...prev,
                                                    floors: numValue || 0,
                                                }))
                                            }}
                                            numberType='integer'
                                            min={0}
                                            fullWidth
                                        />
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Units</label>
                                        <NumberInput
                                            label=''
                                            placeholder='Enter number of units'
                                            value={newTower.units || 0}
                                            onChange={(numValue: number | null) => {
                                                setNewTower((prev) => ({
                                                    ...prev,
                                                    units: numValue || 0,
                                                }))
                                            }}
                                            numberType='integer'
                                            min={0}
                                            fullWidth
                                        />
                                    </div>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Total Parking</label>
                                        <NumberInput
                                            label=''
                                            placeholder='Enter parking count'
                                            value={newTower.totalParking || 0}
                                            onChange={(numValue: number | null) => {
                                                setNewTower((prev) => ({
                                                    ...prev,
                                                    totalParking: numValue || 0,
                                                }))
                                            }}
                                            numberType='integer'
                                            min={0}
                                            fullWidth
                                        />
                                    </div>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Height (m)</label>
                                        <NumberInput
                                            label=''
                                            placeholder='Enter height'
                                            value={newTower.towerHeightInMeters || 0}
                                            onChange={(numValue: number | null) => {
                                                setNewTower((prev) => ({
                                                    ...prev,
                                                    towerHeightInMeters: numValue || 0,
                                                }))
                                            }}
                                            numberType='decimal'
                                            min={0}
                                            fullWidth
                                        />
                                    </div>
                                </div>
                                <div className='flex gap-2'>
                                    <Button
                                        bgColor='bg-green-600'
                                        textColor='text-white'
                                        className='px-3 py-1 h-8 text-sm'
                                        onClick={handleAddTower}
                                    >
                                        Add Tower
                                    </Button>
                                    <Button
                                        bgColor='bg-gray-400'
                                        textColor='text-white'
                                        className='px-3 py-1 h-8 text-sm'
                                        onClick={() => {
                                            setIsAddingTower(false)
                                            setNewTower({})
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                            <FlexibleTable
                                data={projectDetails?.towerDetails || []}
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
                        </div>
                    </div>

                    {/* Floor Plan Section (conditionally rendered) */}
                    {selectedTowerForFloorPlan && (
                        <section className='space-y-4'>
                            <h3 className='px-4 pt-4 text-lg font-bold leading-tight tracking-tight'>
                                Floor Plan for {selectedTowerForFloorPlan.towerName}
                            </h3>
                            <div className='overflow-x-auto px-4 py-3'>
                                <FlexibleTable
                                    data={convertArrayField(selectedTowerForFloorPlan.floorPlanDetails)}
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
                                    data={convertArrayField(selectedTowerForUnitDetails.unitDetails)}
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
                            {isEditing ? (
                                <>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 mr-2'
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                                        onClick={handleSave}
                                    >
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <div className='flex flex-row items-center gap-2'>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        leftIcon={<img src={editic} alt='edit' className='w-4 h-4' />}
                                        onClick={handleEdit}
                                        disabled={!isEditing}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='p-4 grid grid-cols-2 gap-x-6'>
                        {renderField(
                            'Price (at the time of launch) (per sqft)',
                            projectDetails?.groundFloor?.findOutTheTypeOfLaunchPerYearWill || '',
                            'groundFloor.findOutTheTypeOfLaunchPerYearWill',
                            undefined,
                            'number',
                        )}
                        {renderField(
                            'Developer Name',
                            projectDetails?.developerInfo?.promoterName || '',
                            'developerInfo.promoterName',
                            undefined,
                            'text',
                        )}
                        {renderField('Images', 'View Images', '', undefined, 'text')}
                        {renderField('Typology & Unit Plan', 'View Units plan', '', undefined, 'text')}
                        {renderField('Master Plan', 'View Master plan', '', undefined, 'text')}
                        {renderField('Brochure', 'Download Brochure (PDF)', '', undefined, 'text')}
                        {renderField('CDP Map', 'CDP map (PDF)', '', undefined, 'text')}
                        {renderField('Cost Sheet', 'Download Cost Sheet (PDF)', '', undefined, 'text')}
                    </div>

                    {/* Amenities */}
                    <div className='flex items-center justify-between px-4 pb-3 pt-5'>
                        <h2 className='text-xl font-semibold text-gray-900'>Amenities</h2>
                        <div className='flex items-center gap-2'>
                            {isEditing ? (
                                <>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 mr-2'
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className='h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                                        onClick={handleSave}
                                    >
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className='h-9 px-4 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    leftIcon={<img src={editic} alt='edit' className='w-4 h-4' />}
                                    onClick={handleEdit}
                                    disabled={!isEditing}
                                >
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>
                    {isEditing ? (
                        <div className='flex flex-wrap gap-3 p-3 pr-4'>
                            <textarea
                                value={newAmenity}
                                onChange={(e) => {
                                    setNewAmenity(e.target.value)
                                }}
                                className='w-full h-auto text-base border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='Enter amenities separated by commas'
                                rows={3}
                            />
                        </div>
                    ) : (
                        <div className='flex flex-wrap gap-3 p-3 pr-4'>
                            {convertArrayField(projectDetails?.amenities).map((amenity: string, index: number) => (
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
                    <div className='mb-8'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-semibold text-black'>Clubhouse Details</h2>
                            {isEditing && (
                                <Button
                                    bgColor='bg-blue-600'
                                    textColor='text-white'
                                    className='px-3 py-1 h-8 text-sm'
                                    onClick={() => setIsAddingClubhouse(true)}
                                >
                                    + Add Clubhouse
                                </Button>
                            )}
                        </div>

                        {isAddingClubhouse && (
                            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4'>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Name</label>
                                        <StateBaseTextField
                                            value={newClubhouse.name || ''}
                                            onChange={(e) =>
                                                setNewClubhouse((prev) => ({ ...prev, name: e.target.value }))
                                            }
                                            className='w-full text-sm'
                                            placeholder='Enter clubhouse name'
                                        />
                                    </div>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Size (Sq Ft)</label>
                                        <NumberInput
                                            label=''
                                            placeholder='Enter size'
                                            value={parseFloat(newClubhouse.sizeSqft || '0')}
                                            onChange={(numValue: number | null) => {
                                                setNewClubhouse((prev) => ({
                                                    ...prev,
                                                    sizeSqft: (numValue || 0).toString(),
                                                }))
                                            }}
                                            numberType='decimal'
                                            min={0}
                                            fullWidth
                                        />
                                    </div>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Floor</label>
                                        <StateBaseTextField
                                            value={newClubhouse.floor || ''}
                                            onChange={(e) =>
                                                setNewClubhouse((prev) => ({ ...prev, floor: e.target.value }))
                                            }
                                            className='w-full text-sm'
                                            placeholder='Enter floor'
                                        />
                                    </div>
                                </div>
                                <div className='flex gap-2'>
                                    <Button
                                        bgColor='bg-green-600'
                                        textColor='text-white'
                                        className='px-3 py-1 h-8 text-sm'
                                        onClick={handleAddClubhouse}
                                    >
                                        Add Clubhouse
                                    </Button>
                                    <Button
                                        bgColor='bg-gray-400'
                                        textColor='text-white'
                                        className='px-3 py-1 h-8 text-sm'
                                        onClick={() => {
                                            setIsAddingClubhouse(false)
                                            setNewClubhouse({})
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                            <FlexibleTable
                                data={projectDetails?.clubhouseDetails || []}
                                columns={getClubhouseColumns()}
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
                                    {projectDetails?.litigation}
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
                                        const url = projectDetails?.litigation || ''
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
