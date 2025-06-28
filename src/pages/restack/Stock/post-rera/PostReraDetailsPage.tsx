import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { postReraActions } from '../../../../store/actions/restack/postReraActions'
import type { PostReraProperty } from '../../../../store/reducers/restack/postReraTypes'
import type { RootState } from '../../../../store'
import editic from '/icons/acn/edit.svg'

import type { AppDispatch } from '../../../../store'
import Dropdown from '../../../../components/design-elements/Dropdown'
import DateInput from '../../../../components/design-elements/DateInputUnixTimestamps'
import NumberInput from '../../../../components/design-elements/StateBaseNumberField'

import { formatUnixDate } from '../../../../components/helper/getUnixDateTime'
import Button from '../../../../components/design-elements/Button'
import { FlexibleTable, type TableColumn } from '../../../../components/design-elements/FlexibleTable'
import StateBaseTextField from '../../../../components/design-elements/StateBaseTextField'
import Layout from '../../../../layout/Layout'
import { toast } from 'react-toastify'

const projectTypes = [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Mixed', value: 'Mixed' },
]

const projectStatuses = [
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Inactive', value: 'inactive' },
]

const constructionUpdateOptions = [
    { label: 'Ready to Move', value: 'Ready to Move' },
    { label: 'Under Construction', value: 'Under Construction' },
    { label: 'Upcoming', value: 'Upcoming' },
    { label: 'On Hold', value: 'On Hold' },
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

const inventoryTypes = [
    { label: 'Apartment', value: 'Apartment' },
    { label: 'Villa', value: 'Villa' },
    { label: 'Plot', value: 'Plot' },
    { label: 'Office', value: 'Office' },
    { label: 'Shop', value: 'Shop' },
    { label: 'Warehouse', value: 'Warehouse' },
]

interface PhaseDetail {
    id: string
    phaseName: string
    viewDetails: string
    constructionUpdate: string
}

interface DevelopmentDetail {
    id: string
    TypeOfInventory: string
    NumberOfInventory: number
}

const PostReraDetailsPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const dispatch = useDispatch<AppDispatch>()

    const { selectedProperty, loading } = useSelector((state: RootState) => state.postRera)

    const [projectDetails, setProjectDetails] = useState<PostReraProperty | null>(null)
    const [originalDetails, setOriginalDetails] = useState<PostReraProperty | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [, setIsAddingRow] = useState(false)

    // New states for managing sections
    const [isAddingPhase, setIsAddingPhase] = useState(false)
    const [isAddingDevelopment, setIsAddingDevelopment] = useState(false)
    const [newPhase, setNewPhase] = useState<Partial<PhaseDetail>>({})
    const [newDevelopment, setNewDevelopment] = useState<Partial<DevelopmentDetail>>({})
    const [newAmenity, setNewAmenity] = useState('')
    const [selectedAmenity, setSelectedAmenity] = useState('')

    useEffect(() => {
        if (id) {
            console.log('Fetching property with ID:', id)
            dispatch(postReraActions.getPostReraPropertyById(id))
        }
    }, [dispatch, id])

    useEffect(() => {
        if (selectedProperty) {
            console.log('Selected property:', selectedProperty)
            setProjectDetails(selectedProperty)
            setOriginalDetails(selectedProperty)
        }
    }, [selectedProperty])

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
        setIsAddingPhase(false)
        setIsAddingDevelopment(false)
        setNewPhase({})
        setNewDevelopment({})
        setNewAmenity('')
        setSelectedAmenity('')
    }

    const handleSave = async () => {
        if (projectDetails && id) {
            try {
                const updates: Partial<PostReraProperty> = {}

                if (originalDetails) {
                    Object.keys(projectDetails).forEach((key) => {
                        const typedKey = key as keyof PostReraProperty
                        if (
                            typedKey === 'phaseDetails' ||
                            typedKey === 'developmentDetails' ||
                            typedKey === 'projectAmenities'
                        ) {
                            // Deep comparison for nested objects
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

                // Dispatch the updatePostReraProperty action
                await dispatch(
                    postReraActions.updatePostReraProperty({
                        projectId: id,
                        updates: updates,
                    }),
                )

                setOriginalDetails(projectDetails)
                setIsEditing(false)
                setEditingRowId(null)
                setIsAddingRow(false)
                setIsAddingPhase(false)
                setIsAddingDevelopment(false)
                setNewPhase({})
                setNewDevelopment({})
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

    // Phase management functions
    const handleAddPhase = () => {
        if (newPhase.phaseName && newPhase.constructionUpdate) {
            const phase: PhaseDetail = {
                id: Date.now().toString(),
                phaseName: newPhase.phaseName,
                viewDetails: newPhase.viewDetails || '',
                constructionUpdate: newPhase.constructionUpdate,
            }

            setProjectDetails((prev) =>
                prev
                    ? {
                          ...prev,
                          phaseDetails: [...(prev.phaseDetails || []), phase],
                      }
                    : null,
            )

            setNewPhase({})
            setIsAddingPhase(false)
        }
    }

    const handleDeletePhase = (phaseId: string) => {
        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      phaseDetails: (prev.phaseDetails || []).filter((phase: any) => phase.id !== phaseId),
                  }
                : null,
        )
    }

    const handleEditPhase = (phaseId: string, field: string, value: string) => {
        setProjectDetails((prev) =>
            prev
                ? {
                      ...prev,
                      phaseDetails: (prev.phaseDetails || []).map((phase: PhaseDetail) =>
                          phase.id === phaseId ? { ...phase, [field]: value } : phase,
                      ),
                  }
                : null,
        )
    }

    // Development details management
    const handleAddDevelopment = () => {
        if (newDevelopment.TypeOfInventory && newDevelopment.NumberOfInventory) {
            const development: DevelopmentDetail = {
                id: Date.now().toString(),
                TypeOfInventory: newDevelopment.TypeOfInventory,
                NumberOfInventory: newDevelopment.NumberOfInventory,
            }

            setProjectDetails((prev) =>
                prev
                    ? {
                          ...prev,
                          developmentDetails: [
                              ...(Array.isArray(prev.developmentDetails) ? prev.developmentDetails : []),
                              development,
                          ],
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
                      developmentDetails: (Array.isArray(prev.developmentDetails)
                          ? prev.developmentDetails
                          : []
                      ).filter((_, i: number) => i !== index),
                  }
                : null,
        )
    }

    // Amenities management
    const handleAddAmenityFromDropdown = () => {
        if (selectedAmenity && projectDetails) {
            const currentAmenities = projectDetails.projectAmenities || []
            if (!currentAmenities.includes(selectedAmenity)) {
                setProjectDetails((prev) =>
                    prev
                        ? {
                              ...prev,
                              projectAmenities: [...currentAmenities, selectedAmenity],
                          }
                        : null,
                )
            }
            setSelectedAmenity('')
        }
    }

    const handleAddCustomAmenity = () => {
        if (newAmenity.trim() && projectDetails) {
            const currentAmenities = projectDetails.projectAmenities || []
            if (!currentAmenities.includes(newAmenity.trim())) {
                setProjectDetails((prev) =>
                    prev
                        ? {
                              ...prev,
                              projectAmenities: [...currentAmenities, newAmenity.trim()],
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
                      projectAmenities: (prev.projectAmenities || []).filter((amenity) => amenity !== amenityToRemove),
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
                        onChange={(numValue: number | null) => {
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
                <div className='border-b border-[#D4DBE2] pb-2 mb-4 '>
                    <label className='text-sm text-gray-600 block mb-1'>{label}</label>
                    <div className='text-sm text-black font-medium'>{displayValue || '-'}</div>
                </div>
            )
        }
    }

    const getPhaseColumns = (): TableColumn[] => [
        {
            key: 'phaseName',
            header: 'Phase Name',
            render: (value: any, row: any) =>
                isEditing && editingRowId === row.id ? (
                    <StateBaseTextField
                        value={value}
                        onChange={(e) => handleEditPhase(row.id, 'phaseName', e.target.value)}
                        className='w-full text-sm'
                    />
                ) : (
                    <span className='text-sm font-medium'>{value}</span>
                ),
        },
        {
            key: 'viewDetails',
            header: 'View Details',
            render: (value: any, row: any) =>
                isEditing && editingRowId === row.id ? (
                    <StateBaseTextField
                        value={value}
                        onChange={(e) => handleEditPhase(row.id, 'viewDetails', e.target.value)}
                        className='w-full text-sm'
                        placeholder='Enter details URL'
                    />
                ) : (
                    <button
                        onClick={() => navigate(`/restack/primary/${value}`)}
                        className='px-3 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700'
                    >
                        View Details
                    </button>
                ),
        },
        {
            key: 'constructionUpdate',
            header: 'Construction Update',
            render: (value: any, row: any) => {
                if (isEditing && editingRowId === row.id) {
                    return (
                        <Dropdown
                            options={constructionUpdateOptions}
                            onSelect={(selectedValue: string) =>
                                handleEditPhase(row.id, 'constructionUpdate', selectedValue)
                            }
                            defaultValue={value}
                            placeholder='Select status'
                            className='relative w-full'
                            triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                            menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                            optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                        />
                    )
                }
                const bgColor =
                    value === 'Ready to Move' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                return <span className={`px-2 py-1 rounded text-xs font-medium ${bgColor}`}>{value}</span>
            },
        },
        ...(isEditing
            ? [
                  {
                      key: 'actions',
                      header: 'Actions',
                      render: (_: any, row: any) => (
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
                                          onClick={() => handleDeletePhase(row.id)}
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
        <Layout loading={loading}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen'>
                    {/* Header */}
                    <div className='mb-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <div>
                                <h1 className='text-xl font-semibold text-black uppercase'>
                                    {projectDetails?.projectName}
                                </h1>
                                <div className='text-sm text-gray-500 mt-1'>
                                    <button onClick={() => navigate('/restack/stock')} className='hover:text-gray-700'>
                                        Post-rera
                                    </button>
                                    <span className='mx-2'>/</span>
                                    <span className='text-black font-medium'>{projectDetails?.projectName}</span>
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

                        {/* Phase Details Table */}
                        <div className='mb-6 border border-gray-200 rounded-lg overflow-hidden'>
                            <div className='flex items-center justify-between p-4 bg-gray-50 border-b'>
                                <h3 className='text-lg font-semibold text-black'>Phase Details</h3>
                                {isEditing && (
                                    <Button
                                        bgColor='bg-blue-600'
                                        textColor='text-white'
                                        className='px-3 py-1 h-8 text-sm'
                                        onClick={() => setIsAddingPhase(true)}
                                    >
                                        + Add Phase
                                    </Button>
                                )}
                            </div>

                            {isAddingPhase && (
                                <div className='p-4 bg-blue-50 border-b'>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                                        <div>
                                            <label className='text-sm text-black block mb-1'>Phase Name</label>
                                            <StateBaseTextField
                                                value={newPhase.phaseName || ''}
                                                onChange={(e) =>
                                                    setNewPhase((prev) => ({ ...prev, phaseName: e.target.value }))
                                                }
                                                className='w-full text-sm'
                                                placeholder='Enter phase name'
                                            />
                                        </div>
                                        <div>
                                            <label className='text-sm text-black block mb-1'>View Details URL</label>
                                            <StateBaseTextField
                                                value={newPhase.viewDetails || ''}
                                                onChange={(e) =>
                                                    setNewPhase((prev) => ({ ...prev, viewDetails: e.target.value }))
                                                }
                                                className='w-full text-sm'
                                                placeholder='Enter details URL'
                                            />
                                        </div>
                                        <div>
                                            <label className='text-sm text-black block mb-1'>Construction Update</label>
                                            <Dropdown
                                                options={constructionUpdateOptions}
                                                onSelect={(value) =>
                                                    setNewPhase((prev) => ({ ...prev, constructionUpdate: value }))
                                                }
                                                defaultValue={newPhase.constructionUpdate || ''}
                                                placeholder='Select status'
                                                className='relative w-full'
                                                triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                            />
                                        </div>
                                    </div>
                                    <div className='flex gap-2'>
                                        <Button
                                            bgColor='bg-green-600'
                                            textColor='text-white'
                                            className='px-3 py-1 h-8 text-sm'
                                            onClick={handleAddPhase}
                                        >
                                            Add Phase
                                        </Button>
                                        <Button
                                            bgColor='bg-gray-400'
                                            textColor='text-white'
                                            className='px-3 py-1 h-8 text-sm'
                                            onClick={() => {
                                                setIsAddingPhase(false)
                                                setNewPhase({})
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <FlexibleTable
                                data={projectDetails?.phaseDetails || []}
                                columns={getPhaseColumns()}
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

                    {/* Project Overview */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Project Overview</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Project Name', projectDetails?.projectName, 'projectName')}
                                {renderField(
                                    'Project Status',
                                    projectDetails?.projectStatus,
                                    'projectStatus',
                                    projectStatuses,
                                )}
                            </div>
                            <div className='space-y-4'>
                                {renderField('Project Type', projectDetails?.projectType, 'projectType', projectTypes)}
                                {renderField('Developer Details', projectDetails?.developerName, 'developerName')}
                            </div>
                        </div>
                    </div>

                    {/* Project Address */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Project Address</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField('Address', projectDetails?.address, 'address')}
                                {renderField('Latitude', projectDetails?.lat, 'lat')}
                                {renderField('Pin Code', projectDetails?.pincode, 'pincode', undefined, 'number')}
                            </div>
                            <div className='space-y-4'>
                                {renderField('District', projectDetails?.district, 'district')}
                                {renderField('Longitude', projectDetails?.long, 'long')}
                                {renderField('Zone', projectDetails?.zone, 'zone')}
                            </div>
                        </div>
                    </div>

                    {/* Plan Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Plan Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField(
                                    'Approving Authority',
                                    projectDetails?.approvingAuthority,
                                    'approvingAuthority',
                                )}
                                {renderField(
                                    'Plan Approval Date',
                                    projectDetails?.planApprovalDate,
                                    'planApprovalDate',
                                )}
                                {renderField(
                                    'Number of covered parking',
                                    projectDetails?.coveredParking,
                                    'coveredParking',
                                )}
                            </div>
                            <div className='space-y-4'>
                                {renderField(
                                    'Approved Plan Number',
                                    projectDetails?.approvedPlanNumber,
                                    'approvedPlanNumber',
                                )}
                                {renderField('Number of total parking', projectDetails?.totalParking, 'totalParking')}
                            </div>
                        </div>
                    </div>

                    {/* Area Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Area Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                {renderField(
                                    'Total Open Area',
                                    projectDetails?.totalOpenArea,
                                    'totalOpenArea',
                                    undefined,
                                    'number',
                                )}
                                {renderField(
                                    'Total Area of Land',
                                    projectDetails?.totalLandArea,
                                    'totalLandArea',
                                    undefined,
                                    'number',
                                )}
                                {renderField(
                                    'Total Carpet Area',
                                    projectDetails?.totalCarpetArea,
                                    'totalCarpetArea',
                                    undefined,
                                    'number',
                                )}
                                {renderField(
                                    'Area of Covered Parking',
                                    projectDetails?.coveredParkingArea,
                                    'coveredParkingArea',
                                    undefined,
                                    'number',
                                )}
                            </div>
                            <div className='space-y-4'>
                                {renderField(
                                    'Total Covered Area',
                                    projectDetails?.totalCoveredArea,
                                    'totalCoveredArea',
                                    undefined,
                                    'number',
                                )}
                                {renderField(
                                    'Total Built-up Area',
                                    projectDetails?.totalBuiltUpArea,
                                    'totalBuiltUpArea',
                                    undefined,
                                    'number',
                                )}
                                {renderField(
                                    'Area of Open Parking',
                                    projectDetails?.openParkingArea,
                                    'openParkingArea',
                                    undefined,
                                    'number',
                                )}
                                {renderField(
                                    'Area of Garage',
                                    projectDetails?.garageArea,
                                    'garageArea',
                                    undefined,
                                    'number',
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Source of Water */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Source of Water</h2>
                        <div>{renderField('Source', projectDetails?.waterSource?.join(', '), 'waterSource')}</div>
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
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Inventory Type</label>
                                        <Dropdown
                                            options={inventoryTypes}
                                            onSelect={(value) =>
                                                setNewDevelopment((prev) => ({ ...prev, TypeOfInventory: value }))
                                            }
                                            defaultValue={newDevelopment.TypeOfInventory || ''}
                                            placeholder='Select inventory type'
                                            className='relative w-full'
                                            triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                                            menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                            optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                        />
                                    </div>
                                    <div>
                                        <label className='text-sm text-black block mb-1'>Number of Inventory</label>
                                        <NumberInput
                                            label=''
                                            placeholder='Enter number'
                                            value={newDevelopment.NumberOfInventory || 0}
                                            onChange={(numValue: number | null) => {
                                                setNewDevelopment((prev) => ({
                                                    ...prev,
                                                    NumberOfInventory: numValue || 0,
                                                }))
                                            }}
                                            numberType='integer'
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
                            <table className='w-full'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-[#121516]'>
                                            Inventory Type
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-[#121516]'>
                                            No of Inventory
                                        </th>
                                        {isEditing && (
                                            <th className='px-4 py-3 text-left text-sm font-medium text-[#121516]'>
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectDetails.developmentDetails &&
                                        projectDetails.developmentDetails.map((dev, index) => (
                                            <tr key={index} className='border-t'>
                                                <td className='px-4 py-3 text-sm'>{dev.TypeOfInventory}</td>
                                                <td className='px-4 py-3 text-sm text-[#6A7881]'>
                                                    {dev.NumberOfInventory}
                                                </td>
                                                {isEditing && (
                                                    <td className='px-4 py-3 text-sm'>
                                                        <Button
                                                            bgColor='bg-red-600'
                                                            textColor='text-white'
                                                            className='px-2 py-1 h-6 text-xs'
                                                            onClick={() => handleDeleteDevelopment(index)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tower Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Tower Details</h2>
                        <div>
                            {renderField(
                                'Number of towers',
                                projectDetails?.totalTowers,
                                'totalTowers',
                                undefined,
                                'number',
                            )}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className='mb-8'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-semibold text-black'>Amenities</h2>
                        </div>

                        {/* Add Amenities Section - Only shown when editing */}
                        {isEditing && (
                            <div className='mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                    <div>
                                        <label className='text-sm text-black block mb-2'>
                                            Select from predefined amenities
                                        </label>
                                        <div className='flex gap-2'>
                                            <div className='flex-1'>
                                                <Dropdown
                                                    options={amenitiesOptions}
                                                    onSelect={(value) => setSelectedAmenity(value)}
                                                    defaultValue={selectedAmenity}
                                                    placeholder='Select amenity'
                                                    className='relative w-full'
                                                    triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto'
                                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                                />
                                            </div>
                                            <Button
                                                bgColor='bg-blue-600'
                                                textColor='text-white'
                                                className='px-3 py-2 h-10 text-sm'
                                                onClick={handleAddAmenityFromDropdown}
                                                disabled={!selectedAmenity}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className='text-sm text-black block mb-2'>Add custom amenity</label>
                                        <div className='flex gap-2'>
                                            <div className='flex-1'>
                                                <StateBaseTextField
                                                    value={newAmenity}
                                                    onChange={(e) => setNewAmenity(e.target.value)}
                                                    className='w-full text-sm'
                                                    placeholder='Enter custom amenity'
                                                />
                                            </div>
                                            <Button
                                                bgColor='bg-green-600'
                                                textColor='text-white'
                                                className='px-3 py-2 h-10 text-sm'
                                                onClick={handleAddCustomAmenity}
                                                disabled={!newAmenity.trim()}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Display Amenities */}
                        <div className='flex flex-wrap gap-2'>
                            {projectDetails?.projectAmenities?.map((amenity, index) => (
                                <div
                                    key={index}
                                    className='flex items-center gap-2 text-sm text-[#101419] px-3 py-1 rounded-2xl bg-[#E9EDF1]'
                                >
                                    <span>{amenity}</span>
                                    {isEditing && (
                                        <button
                                            onClick={() => handleRemoveAmenity(amenity)}
                                            className='text-red-500 hover:text-red-700 ml-1'
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            {(!projectDetails?.projectAmenities || projectDetails.projectAmenities.length === 0) && (
                                <div className='text-gray-500 text-sm'>No amenities added yet</div>
                            )}
                        </div>
                    </div>

                    {/* Developer Details */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Developer Details</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div>{renderField('Developer Name', projectDetails?.developerName, 'developerName')}</div>
                            <div>
                                {renderField('Legal Name', projectDetails?.developerLegalName, 'developerLegalName')}
                            </div>
                        </div>
                    </div>

                    {/* Ground Data */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Ground Data</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                <div>
                                    <label className='text-sm text-gray-600 block mb-1'>Master Plan</label>
                                    {isEditing ? (
                                        <StateBaseTextField
                                            value={projectDetails?.masterPlanURL}
                                            onChange={(e) => updateField('masterPlanURL', e.target.value)}
                                            className='w-full text-sm'
                                            placeholder='Enter Master Plan URL'
                                        />
                                    ) : (
                                        <a
                                            href={projectDetails?.masterPlanURL}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-sm text-blue-600 hover:text-blue-800 underline'
                                        >
                                            Master Plan
                                        </a>
                                    )}
                                </div>
                                <div>
                                    <label className='text-sm text-gray-600 block mb-1'>CDP Map</label>
                                    {isEditing ? (
                                        <StateBaseTextField
                                            value={projectDetails?.CDPMapURL || ''}
                                            onChange={(e) => updateField('CDPMapURL', e.target.value)}
                                            className='w-full text-sm'
                                            placeholder='Enter CDP Map URL'
                                        />
                                    ) : (
                                        <a
                                            href='#'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-sm text-blue-600 hover:text-blue-800 underline'
                                        >
                                            COP Map (PDF)
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className='space-y-4'>
                                <div>
                                    <label className='text-sm text-gray-600 block mb-1'>Images</label>
                                    <div className='text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer'>
                                        View Images
                                    </div>
                                </div>
                                <div>
                                    <label className='text-sm text-gray-600 block mb-1'>Brochure</label>
                                    {isEditing ? (
                                        <StateBaseTextField
                                            value={projectDetails?.brochure}
                                            onChange={(e) => updateField('brochure', e.target.value)}
                                            className='w-full text-sm'
                                            placeholder='Enter Brochure URL'
                                        />
                                    ) : (
                                        <a
                                            href={projectDetails?.brochure}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-sm text-blue-600 hover:text-blue-800 underline'
                                        >
                                            Download Brochure (PDF)
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-black mb-4'>Documents</h2>
                        <div>
                            <a
                                href={`/restack/stock/post-rera/${id}/documents`}
                                className='bg-black text-white w-25 text-xs font-medium px-3 py-1 rounded transition-colors hover:bg-gray-800'
                            >
                                View Documents
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PostReraDetailsPage
