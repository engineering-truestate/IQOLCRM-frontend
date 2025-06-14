import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import { generateRequirements, type RequirementData, type Note } from '../../dummy_data/acn_requirements_dummy_data'
import Breadcrumb from '../../../components/acn/Breadcrumb'
import editic from '/icons/acn/edit.svg'
import addcircleic from '/icons/acn/add-circle.svg'
import noteic from '/icons/acn/note.svg'

// Custom status badge component
const StatusBadge = ({ status, type }: { status: string; type: 'requirement' | 'internal' | 'property' }) => {
    const getStatusColors = () => {
        if (type === 'requirement') {
            switch (status) {
                case 'Open':
                    return 'bg-[#E1F6DF] text-black border-[#9DE695]'
                case 'Close':
                    return 'bg-[#FFC8B8] text-black border-[#FF8A65]'
                default:
                    return 'border-gray-600 text-black'
            }
        } else if (type === 'internal') {
            switch (status) {
                case 'Found':
                    return 'bg-[#E1F6DF] text-black border-[#9DE695]'
                case 'Not Found':
                    return 'bg-[#FFC8B8] text-black border-[#FF8A65]'
                case 'Pending':
                    return 'bg-[#F5F5F5] text-black border-[#CCCBCB]'
                default:
                    return 'border-gray-400 text-gray-600 bg-gray-50'
            }
        } else {
            // Property status colors
            switch (status) {
                case 'Available':
                    return 'bg-[#E1F6DF] text-black border-[#9DE695]'
                case 'Sold':
                    return 'bg-[#F5F5F5] text-black border-[#CCCBCB]'
                case 'Hold':
                    return 'bg-[#FFF4E6] text-black border-[#FCCE74]'
                case 'De-Listed':
                    return 'bg-[#FFC8B8] text-black border-[#FF8A65]'
                default:
                    return 'border-gray-400 text-gray-600 bg-gray-50'
            }
        }
    }

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-medium whitespace-nowrap ${getStatusColors()}`}
        >
            {status}
        </span>
    )
}

const RequirementDetailsPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    console.log('RequirementDetailsPage - id:', id)

    const [requirement, setRequirement] = useState<RequirementData | null>(null)
    const [originalRequirement, setOriginalRequirement] = useState<RequirementData | null>(null)
    const [matchingProperties, setMatchingProperties] = useState<any[]>([])
    const [newNote, setNewNote] = useState('')
    const [notes, setNotes] = useState<Note[]>([])
    const [isEditing, setIsEditing] = useState(false)

    // Simple dummy data for the table
    const dummyMatchingProperties = [
        {
            propertyId: 'PROP001',
            propertyName: 'Luxury Villa in Bandra',
            price: '₹8,50,00,000',
            status: 'De-Listed',
        },
        {
            propertyId: 'PROP002',
            propertyName: 'Modern Apartment in Juhu',
            price: '₹12,75,00,000',
            status: 'Available',
        },
        {
            propertyId: 'PROP003',
            propertyName: 'Penthouse in Powai',
            price: '₹15,25,00,000',
            status: 'Hold',
        },
        {
            propertyId: 'PROP004',
            propertyName: 'Independent House in Andheri',
            price: '₹6,85,00,000',
            status: 'Available',
        },
        {
            propertyId: 'PROP005',
            propertyName: 'Studio Apartment in Worli',
            price: '₹4,20,00,000',
            status: 'Sold',
        },
    ]

    // Load requirement data based on ID
    useEffect(() => {
        if (id) {
            const allRequirements = generateRequirements()
            const foundRequirement = allRequirements.find((req) => req.reqId === id)
            if (foundRequirement) {
                setRequirement(foundRequirement)
                setOriginalRequirement(foundRequirement)
                setNotes(foundRequirement.notes)

                // Use dummy matching properties for now
                setMatchingProperties(dummyMatchingProperties)
            }
        }
    }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

    // Status dropdown options
    const statusDropdownOptions: DropdownOption[] = [
        {
            label: 'Open',
            value: 'Open',
            color: '#E1F6DF',
            textColor: '',
        },
        {
            label: 'Close',
            value: 'Close',
            color: '#FFC8B8',
            textColor: '',
        },
    ]

    const internalStatusDropdownOptions: DropdownOption[] = [
        {
            label: 'Found',
            value: 'Found',
            color: '#E1F6DF',
            textColor: '',
        },
        {
            label: 'Not Found',
            value: 'Not Found',
            color: '#FFC8B8',
            textColor: '',
        },
        {
            label: 'Pending',
            value: 'Pending',
            color: '#F5F5F5',
            textColor: '',
        },
    ]

    // Asset type options
    const assetTypeOptions = [
        { label: 'Apartment', value: 'Apartment' },
        { label: 'Villa', value: 'Villa' },
        { label: 'Penthouse', value: 'Penthouse' },
        { label: 'Studio', value: 'Studio' },
        { label: 'Independent House', value: 'Independent House' },
        { label: 'Plot', value: 'Plot' },
        { label: 'Office', value: 'Office' },
        { label: 'Shop', value: 'Shop' },
        { label: 'Warehouse', value: 'Warehouse' },
    ]

    // Handle field updates
    const updateField = (field: string, value: string) => {
        if (requirement) {
            setRequirement((prev) => (prev ? { ...prev, [field]: value } : null))
        }
    }

    // Handle edit mode toggle
    const handleEdit = () => {
        setIsEditing(true)
    }

    // Handle cancel edit
    const handleCancel = () => {
        setRequirement(originalRequirement)
        setIsEditing(false)
    }

    // Handle save changes
    const handleSave = () => {
        if (requirement) {
            const now = new Date()
            const updatedRequirement = {
                ...requirement,
                lastUpdated: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            }
            setRequirement(updatedRequirement)
            setOriginalRequirement(updatedRequirement)
            setIsEditing(false)
            // Here you would typically make an API call to save the changes
            console.log('Saving requirement:', updatedRequirement)
        }
    }

    // Handle adding new note
    const addNote = () => {
        if (newNote.trim() && requirement) {
            const note: Note = {
                id: `note_${requirement.reqId}_${Date.now()}`,
                author: 'Current User',
                content: newNote.trim(),
                timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            }
            setNotes((prev) => [note, ...prev])
            setNewNote('')
        }
    }

    // Matching properties table columns
    const propertyColumns: TableColumn[] = [
        {
            key: 'propertyId',
            header: 'Property Id',
            render: (value) => <span className='whitespace-nowrap text-gray-600 text-sm font-normal'>{value}</span>,
        },
        {
            key: 'propertyName',
            header: 'Property Name',
            render: (value) => <span className='whitespace-nowrap text-sm font-semibold'>{value}</span>,
        },
        {
            key: 'price',
            header: 'Price',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: (value) => (
                <div className='whitespace-nowrap'>
                    <StatusBadge status={value} type='property' />
                </div>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_, row) => (
                <a
                    href={`/properties/${row.propertyId}`}
                    className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors'
                >
                    View
                </a>
            ),
        },
    ]

    // Render field based on edit mode
    const renderField = (
        label: string,
        value: string,
        fieldKey: string,
        options?: { label: string; value: string }[],
    ) => {
        if (isEditing) {
            if (options) {
                return (
                    <div>
                        <label className='text-sm text-gray-500 block mb-1'>{label}</label>
                        <Dropdown
                            options={options}
                            onSelect={(selectedValue) => updateField(fieldKey, selectedValue)}
                            defaultValue={value}
                            placeholder={`Select ${label}`}
                            className='relative w-full'
                            triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full cursor-pointer'
                            menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                            optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                        />
                    </div>
                )
            } else {
                return (
                    <div>
                        <label className='text-sm text-gray-500 block mb-1'>{label}</label>
                        <StateBaseTextField
                            value={value}
                            onChange={(e) => updateField(fieldKey, e.target.value)}
                            className='w-full text-sm'
                        />
                    </div>
                )
            }
        } else {
            return (
                <div>
                    <label className='text-sm text-gray-500 block mb-1'>{label}</label>
                    <div className='text-sm font-semibold'>{value}</div>
                </div>
            )
        }
    }

    if (!requirement) {
        return (
            <Layout loading={true}>
                <div className='py-2 px-6 bg-white min-h-screen'>
                    <div className='flex items-center justify-center h-64'>
                        <div className='text-gray-500'>Loading requirement details...</div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-2 px-6 bg-white min-h-screen'>
                    {/* Breadcrumb */}
                    <div className='mb-4'>
                        <Breadcrumb link='/acn/requirements' parent='Requirements' child={requirement.reqId} />

                        {/* Header */}
                        <div className='flex items-center justify-between mb-4'>
                            <h1 className='text-lg font-semibold text-black'>Requirement Details</h1>
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
                                            bgColor='bg-blue-600'
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
                                        Edit Requirement
                                    </Button>
                                )}
                            </div>
                        </div>
                        <hr className='border-gray-200 mb-6' />
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        {/* Left Section - Requirement Details */}
                        <div className='lg:col-span-2 space-y-6'>
                            {/* Basic Info Grid */}
                            <div className='grid grid-cols-2 gap-6'>
                                <div className='space-y-4'>
                                    {renderField('Location', requirement.location, 'location')}
                                    {renderField('Asset Type', requirement.assetType, 'assetType', assetTypeOptions)}
                                    {renderField('Budget', requirement.budget, 'budget')}
                                    {renderField('Size', requirement.size, 'size')}
                                    {renderField('Bedrooms', requirement.bedrooms, 'bedrooms')}
                                    {renderField('Bathrooms', requirement.bathrooms, 'bathrooms')}
                                    {renderField('Parking', requirement.parking, 'parking')}
                                </div>

                                <div className='space-y-4'>
                                    {/* Fixed fields - not editable */}
                                    <div>
                                        <label className='text-sm text-gray-500 block mb-1'>Requirement ID</label>
                                        <div className='text-sm font-semibold'>{requirement.reqId}</div>
                                    </div>
                                    <div>
                                        <label className='text-sm text-gray-500 block mb-1'>Creation Date</label>
                                        <div className='text-sm font-semibold'>{requirement.creationDate}</div>
                                    </div>
                                    {isEditing ? (
                                        <>
                                            <div>
                                                <label className='text-sm text-gray-500 block mb-1'>Status</label>
                                                <Dropdown
                                                    options={statusDropdownOptions.map((opt) => ({
                                                        label: opt.label,
                                                        value: opt.value,
                                                        color: opt.color,
                                                        textColor: opt.textColor,
                                                    }))}
                                                    onSelect={(value) => updateField('status', value)}
                                                    defaultValue={requirement.status}
                                                    placeholder='Select Status'
                                                    className='relative w-full'
                                                    triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full cursor-pointer'
                                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                                />
                                            </div>
                                            <div>
                                                <label className='text-sm text-gray-500 block mb-1'>
                                                    Internal Status
                                                </label>
                                                <Dropdown
                                                    options={internalStatusDropdownOptions.map((opt) => ({
                                                        label: opt.label,
                                                        value: opt.value,
                                                        color: opt.color,
                                                        textColor: opt.textColor,
                                                    }))}
                                                    onSelect={(value) => updateField('intStatus', value)}
                                                    defaultValue={requirement.intStatus}
                                                    placeholder='Select Status'
                                                    className='relative w-full'
                                                    triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full cursor-pointer'
                                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className='text-sm text-gray-500 block mb-1'>Status</label>
                                                <div className='text-sm font-semibold'>{requirement.status}</div>
                                            </div>
                                            <div>
                                                <label className='text-sm text-gray-500 block mb-1'>
                                                    Internal Status
                                                </label>
                                                <div className='text-sm font-semibold'>{requirement.intStatus}</div>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label className='text-sm text-gray-500 block mb-1'>Last Modified</label>
                                        <div className='text-sm font-semibold'>{requirement.lastUpdated} 10:00 AM</div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div>
                                <label className='text-sm text-gray-500 block mb-1'>Details</label>
                                {isEditing ? (
                                    <textarea
                                        value={requirement.details}
                                        onChange={(e) => updateField('details', e.target.value)}
                                        className='w-full p-3 border border-gray-300 rounded-md text-sm leading-relaxed resize-vertical min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    />
                                ) : (
                                    <div className='text-sm font-semibold leading-relaxed'>{requirement.details}</div>
                                )}
                            </div>

                            {/* Matching Properties Section */}
                            <div>
                                <div className='flex items-center justify-between mb-4'>
                                    <h2 className='text-lg font-semibold text-black'>Matching Properties</h2>
                                    <Button
                                        leftIcon={<img src={addcircleic} alt='Add Property' className='w-4 h-4' />}
                                        bgColor='bg-[#F3F3F3]'
                                        textColor='text-[#3A3A47]'
                                        className='px-4 h-8 font-semibold'
                                        onClick={() => navigate(`/acn/requirements/${requirement.reqId}/properties`)}
                                        disabled={isEditing}
                                    >
                                        Add Property
                                    </Button>
                                </div>

                                {matchingProperties.length > 0 ? (
                                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                                        <FlexibleTable
                                            data={matchingProperties}
                                            columns={propertyColumns}
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
                                ) : (
                                    <div className='bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center'>
                                        <div className='text-gray-500 text-sm'>No matching properties found</div>
                                        <div className='text-gray-400 text-xs mt-1'>
                                            Click "Add Property" to start matching properties
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Section - Agent Info & Status Updates */}
                        <div className='space-y-6'>
                            {/* Agent Info */}
                            <div className='bg-gray-50 rounded-lg p-4'>
                                <div className='flex items-center gap-3 mb-2'>
                                    <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold'>
                                        HR
                                    </div>
                                    <div>
                                        <div className='text-sm font-semibold'>{requirement.agentName}</div>
                                        <div className='text-xs text-gray-500'>CPA001 | {requirement.agentNumber}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Update Requirement Status - only show when not editing */}
                            {!isEditing && (
                                <div>
                                    <h3 className='text-sm font-semibold text-black mb-3'>Update Requirement Status</h3>
                                    <div className='space-y-3'>
                                        <div>
                                            <label className='text-sm text-gray-700 block mb-1'>Status</label>
                                            <Dropdown
                                                options={statusDropdownOptions.map((opt) => ({
                                                    label: opt.label,
                                                    value: opt.value,
                                                    color: opt.color,
                                                    textColor: opt.textColor,
                                                }))}
                                                onSelect={(value) => updateField('status', value)}
                                                defaultValue={requirement.status}
                                                placeholder='Select Status'
                                                className='relative w-full'
                                                triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full cursor-pointer'
                                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                            />
                                        </div>
                                        <div>
                                            <label className='text-sm text-gray-700 block mb-1'>Internal Status</label>
                                            <Dropdown
                                                options={internalStatusDropdownOptions.map((opt) => ({
                                                    label: opt.label,
                                                    value: opt.value,
                                                    color: opt.color,
                                                    textColor: opt.textColor,
                                                }))}
                                                onSelect={(value) => updateField('intStatus', value)}
                                                defaultValue={requirement.intStatus}
                                                placeholder='Select Status'
                                                className='relative w-full'
                                                triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full cursor-pointer'
                                                menuClassName='absolute z-50 mt-1 w-full border border-gray-300 rounded-md shadow-lg'
                                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Internal Notes */}
                            <div>
                                <h3 className='text-sm font-semibold text-black mb-3'>Internal Notes</h3>
                                <div className='space-y-3'>
                                    <div className='flex gap-2'>
                                        <StateBaseTextField
                                            placeholder='Add a note...'
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            className='flex-1 text-sm'
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    addNote()
                                                }
                                            }}
                                            disabled={isEditing}
                                        />
                                        <Button
                                            leftIcon={<img src={noteic} alt='Add Note' className='w-4 h-4' />}
                                            bgColor='bg-[#F3F3F3]'
                                            textColor='text-[#3A3A47]'
                                            className='px-4 h-8 font-semibold'
                                            onClick={addNote}
                                            disabled={!newNote.trim() || isEditing}
                                        >
                                            Add Note
                                        </Button>
                                    </div>

                                    {/* Previous Notes */}
                                    <div>
                                        <h4 className='text-sm font-medium text-gray-700 mb-2'>Previous Notes</h4>
                                        <div className='max-h-90 overflow-y-auto space-y-3'>
                                            {notes.length > 0 ? (
                                                notes.map((note) => (
                                                    <div
                                                        key={note.id}
                                                        className='bg-gray-50 rounded-lg p-3 border border-gray-200'
                                                    >
                                                        <div className='flex items-center justify-between mb-1'>
                                                            <span className='text-xs font-medium text-gray-700'>
                                                                {note.author}
                                                            </span>
                                                            <span className='text-xs text-gray-500'>
                                                                on {note.timestamp}
                                                            </span>
                                                        </div>
                                                        <div className='text-sm text-gray-600 leading-relaxed'>
                                                            {note.content}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className='text-center py-4 text-gray-400 text-sm'>
                                                    No notes yet
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default RequirementDetailsPage
