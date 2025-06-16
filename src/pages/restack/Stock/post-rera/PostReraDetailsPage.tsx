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

const PostReraDetailsPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const dispatch = useDispatch<AppDispatch>()

    const { selectedProperty, loading } = useSelector((state: RootState) => state.postRera)

    const [projectDetails, setProjectDetails] = useState<PostReraProperty | null>(null)
    const [originalDetails, setOriginalDetails] = useState<PostReraProperty | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    //const [activeTab, setActiveTab] = useState<'phases' | 'towers' | 'configurations' | 'documents'>('phases')
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [isAddingRow, setIsAddingRow] = useState(false)

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
    }

    const handleSave = async () => {
        if (projectDetails && id) {
            try {
                const updates: Partial<PostReraProperty> = {}

                if (originalDetails) {
                    Object.keys(projectDetails).forEach((key) => {
                        const typedKey = key as keyof PostReraProperty
                        if (JSON.stringify(projectDetails[typedKey]) !== JSON.stringify(originalDetails[typedKey])) {
                            ;(updates as any)[typedKey] = projectDetails[typedKey]
                        }
                    })
                }

                setOriginalDetails(projectDetails)
                setIsEditing(false)
                setEditingRowId(null)
                setIsAddingRow(false)
                console.log('Project details saved successfully')
            } catch (error) {
                console.error('Error saving project details:', error)
            }
        }
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
                <div>
                    <label className='text-sm text-gray-600 block mb-1'>{label}</label>
                    <div className='text-sm text-black font-medium'>{displayValue}</div>
                </div>
            )
        }
    }

    const getPhaseColumns = (): TableColumn[] => [
        {
            key: 'phaseName',
            header: 'Phase Name',
            render: (value: any) => <span className='text-sm font-medium'>{value}</span>,
        },
        {
            key: 'viewDetails',
            header: 'View Details',
            render: (value: any) => (
                <button className='px-3 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700'>{value}</button>
            ),
        },
        {
            key: 'constructionUpdate',
            header: 'Construction Update',
            render: (value: any) => {
                const bgColor =
                    value === 'Ready to Move' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                return <span className={`px-2 py-1 rounded text-xs font-medium ${bgColor}`}>{value}</span>
            },
        },
    ]

    const getTowerColumns = (): TableColumn[] => [
        {
            key: 'TowerName',
            header: 'Number of towers',
            render: (value: any) => <span className='text-sm'>{value}</span>,
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
                                    <button
                                        onClick={() => navigate('/restack/postrera')}
                                        className='hover:text-gray-700'
                                    >
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
                        <div className='mb-6'>
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
                                {renderField('Developer Details', projectDetails?.developerName, 'developerName')}
                            </div>
                            <div className='space-y-4'>
                                {renderField('Project Type', projectDetails?.projectType, 'projectType', projectTypes)}
                                {renderField('Ongoing', 'Ongoing', 'ongoing')}
                                {renderField('Legal Name', projectDetails?.developerLegalName, 'developerLegalName')}
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
                        <h2 className='text-lg font-semibold text-black mb-4'>Development Details</h2>
                        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                            <table className='w-full'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                            Inventory Type
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                            No of Inventory
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                            Apartments
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                            Villas
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className='border-t'>
                                        <td className='px-4 py-3 text-sm'>
                                            {projectDetails?.developmentDetails?.TypeOfInventory}
                                        </td>
                                        <td className='px-4 py-3 text-sm'>
                                            {projectDetails?.developmentDetails?.NumberOfInventory}
                                        </td>
                                        <td className='px-4 py-3 text-sm'>80</td>
                                        <td className='px-4 py-3 text-sm'>20</td>
                                    </tr>
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
                        <h2 className='text-lg font-semibold text-black mb-4'>Amenities</h2>
                        <div className='grid grid-cols-2 gap-4'>
                            {projectDetails?.projectAmenities?.map((amenity, index) => (
                                <div key={index} className='text-sm text-gray-700'>
                                    {amenity}
                                </div>
                            ))}
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
                                            value={projectDetails?.CDPMapURL}
                                            onChange={(e) => updateField('CDPMapURL', e.target.value)}
                                            className='w-full text-sm'
                                            placeholder='Enter Master Plan URL'
                                        />
                                    ) : (
                                        <a
                                            href={projectDetails?.CDPMapURL}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-sm text-blue-600 hover:text-blue-800 underline'
                                        >
                                            CDP Map (PDF)
                                        </a>
                                    )}
                                </div>
                                <div>
                                    <label className='text-sm text-gray-600 block mb-1'>COP Map</label>
                                    {isEditing ? (
                                        <StateBaseTextField
                                            value=''
                                            onChange={(e) => updateField('copMap', e.target.value)}
                                            className='w-full text-sm'
                                            placeholder='Enter COP Map URL'
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
                            <button className='text-sm text-blue-600 hover:text-blue-800 underline'>
                                View Documents
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PostReraDetailsPage
