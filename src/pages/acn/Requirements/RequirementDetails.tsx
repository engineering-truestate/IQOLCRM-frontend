// RequirementDetailsPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../../store/index'
import {
    fetchRequirementById,
    updateRequirement,
    updateRequirementStatus,
    addNoteToRequirement,
    removeNoteFromRequirement,
} from '../../../services/acn/requirements/requirementsService'
import { clearCurrentRequirement, clearError } from '../../../store/reducers/acn/requirementsReducers'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn, type DropdownOption } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import { type IRequirement } from '../../../store/reducers/acn/requirementsTypes'
import { fetchPropertiesByIds } from '../../../services/acn/properties/propertiesService'
import { clearProperties } from '../../../store/reducers/acn/propertiesReducers'
import Breadcrumb from '../../../components/acn/Breadcrumb'
import editic from '/icons/acn/edit.svg'
import addcircleic from '/icons/acn/add-circle.svg'
import noteic from '/icons/acn/note.svg'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'
import { formatUnixDate, formatUnixDateTime } from '../../../components/helper/formatDate'
import { getUnixDateTime } from '../../../components/helper/getUnixDateTime'
import type { IInventory } from '../../../store/reducers/acn/propertiesTypes'
import useAuth from '../../../hooks/useAuth'
import tickic from '/icons/acn/tick-circle.svg'
import crossic from '/icons/acn/close-circle.svg'

// Note interface for local notes
interface Note {
    id: string
    author: string
    content: string
    timestamp: number
}

// Custom status badge component
const StatusBadge = ({ status, type }: { status: string; type: 'requirement' | 'internal' | 'property' }) => {
    const getStatusColors = () => {
        if (type === 'requirement') {
            switch (status.toLowerCase()) {
                case 'open':
                    return 'bg-[#E1F6DF] text-black border-[#9DE695]'
                case 'close':
                    return 'bg-[#FFC8B8] text-black border-[#FF8A65]'
                default:
                    return 'border-gray-600 text-black'
            }
        } else if (type === 'internal') {
            switch (status.toLowerCase()) {
                case 'found':
                    return 'bg-[#E1F6DF] text-black border-[#9DE695]'
                case 'not found':
                    return 'bg-[#FFC8B8] text-black border-[#FF8A65]'
                case 'pending':
                    return 'bg-[#F5F5F5] text-black border-[#CCCBCB]'
                default:
                    return 'border-gray-400 text-gray-600 bg-gray-50'
            }
        } else {
            // Property status colors
            switch (status.toLowerCase()) {
                case 'available':
                    return 'bg-[#E1F6DF] text-black border-[#9DE695]'
                case 'sold':
                    return 'bg-[#F5F5F5] text-black border-[#CCCBCB]'
                case 'hold':
                    return 'bg-[#FFF4E6] text-black border-[#FCCE74]'
                case 'de-listed':
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
    const dispatch = useDispatch<AppDispatch>()

    console.log('🔄 RequirementDetailsPage mounted with ID:', id)

    const { properties: matchingPropertiesData, loading: loadingProperties } = useSelector(
        (state: RootState) => state.properties,
    )

    // Redux state
    const {
        currentRequirement: requirement,
        loading,
        updating,
        error,
    } = useSelector((state: RootState) => state.requirements)

    // Local state for editing and UI
    const [localRequirement, setLocalRequirement] = useState<IRequirement | null>(null)
    const [originalRequirement, setOriginalRequirement] = useState<IRequirement | null>(null)
    const [matchingProperties, setMatchingProperties] = useState<any[]>([])
    const [newNote, setNewNote] = useState('')
    const [notes, setNotes] = useState<Note[]>([])
    const [isEditing, setIsEditing] = useState(false)

    // Add state for editable ranges
    const [budgetRange, setBudgetRange] = useState({ from: '', to: '' })
    const [sizeRange, setSizeRange] = useState({ from: '', to: '' })
    const [isMarketPrice, setIsMarketPrice] = useState(false)

    const { user } = useAuth()

    // Helper functions for formatting ranges
    const formatBudgetForInput = (budget: { from: number; to: number }) => {
        return {
            from: budget.from.toString(), // Convert to Cr for input
            to: budget.to.toString(),
        }
    }

    const formatSizeForInput = (size: { from: number; to: number }) => {
        return {
            from: size.from.toString(),
            to: size.to.toString(),
        }
    }

    // Load requirement data based on ID from URL
    useEffect(() => {
        console.log('🔄 Component mounted, requirement ID from URL:', id)

        if (id) {
            console.log('📡 Dispatching fetchRequirementById for ID:', id)
            dispatch(fetchRequirementById(id))
        }

        // Cleanup on unmount
        return () => {
            console.log('🧹 Component unmounting, clearing current requirement')
            dispatch(clearCurrentRequirement())
        }
    }, [id, dispatch])

    // Update local state when requirement changes from Redux
    useEffect(() => {
        const loadRequirementData = async () => {
            if (requirement) {
                console.log('📋 Requirement loaded from Redux, updating local state:', requirement.requirementId)
                setLocalRequirement(requirement)
                setOriginalRequirement(requirement)

                // Initialize range states
                if (requirement.budget) {
                    setBudgetRange(formatBudgetForInput(requirement.budget))
                }
                if (requirement.size) {
                    setSizeRange(formatSizeForInput(requirement.size))
                }

                // Check if market value is set
                setIsMarketPrice(!!requirement.marketValue && requirement.marketValue.toLowerCase().includes('market'))

                // Initialize notes
                setNotes([])

                // Fetch real matching properties from Firebase
                if (requirement.matchingProperties && requirement.matchingProperties.length > 0) {
                    console.log('🏠 Loading matching properties from Firebase:', requirement.matchingProperties)
                    const properties = await dispatch(fetchPropertiesByIds(requirement.matchingProperties)).unwrap()
                    setMatchingProperties(properties)
                } else {
                    console.log('ℹ️ No matching properties found')
                    setMatchingProperties([])
                    dispatch(clearProperties())
                }
            }
        }

        loadRequirementData()
    }, [requirement, dispatch])

    // Handle error display
    useEffect(() => {
        if (error) {
            console.error('❌ Requirement error:', error)
        }
    }, [error])

    const formatCurrency = (amount: number | undefined | null) => {
        if (!amount) return '₹0'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    useEffect(() => {
        if (matchingPropertiesData && matchingPropertiesData.length > 0) {
            console.log('🏠 Properties loaded from Redux:', matchingPropertiesData.length)

            // Transform Firebase data to table format
            const transformedProperties = matchingPropertiesData.map((property: IInventory) => ({
                id: property.propertyId, // Fix: Add id field for actions
                propertyId: property.propertyId,
                propertyName: property.propertyName || property.area || 'Unknown Property',
                price: formatCurrency(property.totalAskPrice),
                status: property.status || 'Unknown',
                assetType: property.assetType || 'Unknown',
                micromarket: property.micromarket || 'Unknown',
                sbua: property.sbua || 0,
                facing: property.facing || 'Unknown',
            }))

            setMatchingProperties(transformedProperties)
        } else if (!loadingProperties) {
            setMatchingProperties([])
        }
    }, [matchingPropertiesData, loadingProperties])

    // Status dropdown options
    const statusDropdownOptions: DropdownOption[] = [
        {
            label: 'Open',
            value: 'open',
            color: '#E1F6DF',
            textColor: '#0A0B0A',
        },
        {
            label: 'Close',
            value: 'close',
            color: '#FFC8B8',
            textColor: '#0A0B0A',
        },
    ]

    const internalStatusDropdownOptions: DropdownOption[] = [
        {
            label: 'Found',
            value: 'found',
            color: '#E1F6DF',
            textColor: '#0A0B0A',
        },
        {
            label: 'Not Found',
            value: 'not found',
            color: '#FFC8B8',
            textColor: '#0A0B0A',
        },
        {
            label: 'Pending',
            value: 'pending',
            color: '#F5F5F5',
            textColor: '#0A0B0A',
        },
    ]

    // Asset type options
    const assetTypeOptions = [
        { label: 'Apartment', value: 'apartment' },
        { label: 'Villa', value: 'villa' },
        { label: 'Plot', value: 'plot' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Warehouse', value: 'warehouse' },
        { label: 'Office', value: 'office' },
    ]

    // Configuration options - Updated to match your interface
    const configurationOptions = [
        { label: '1 BHK', value: '1bhk' },
        { label: '2 BHK', value: '2bhk' },
        { label: '3 BHK', value: '3bhk' },
        { label: '4 BHK', value: '4bhk' },
        { label: '5 BHK', value: '5bhk' },
    ]

    // Handle field updates (local only)
    const updateField = (field: keyof IRequirement, value: any) => {
        if (localRequirement) {
            console.log('📝 Updating local field:', field, 'with value:', value)
            setLocalRequirement((prev) => (prev ? { ...prev, [field]: value } : null))
        }
    }

    // Handle edit mode toggle
    const handleEdit = () => {
        console.log('✏️ Entering edit mode')
        setIsEditing(true)
    }

    // Handle cancel edit
    const handleCancel = () => {
        console.log('❌ Canceling edit, reverting to original')
        setLocalRequirement(originalRequirement)

        // Reset range states
        if (originalRequirement?.budget) {
            setBudgetRange(formatBudgetForInput(originalRequirement.budget))
        }
        if (originalRequirement?.size) {
            setSizeRange(formatSizeForInput(originalRequirement.size))
        }

        // Reset market price state
        setIsMarketPrice(
            !!originalRequirement?.marketValue && originalRequirement.marketValue.toLowerCase().includes('market'),
        )

        setIsEditing(false)
    }

    // Handle save changes
    const handleSave = async () => {
        if (localRequirement && originalRequirement) {
            console.log('💾 Saving changes to Firebase...')

            // Find what changed by comparing local vs original
            const changes: Record<string, any> = {}

            // Compare each field
            const fieldsToCheck: (keyof IRequirement)[] = [
                'location',
                'assetType',
                'configuration',
                'micromarket',
                'bedrooms',
                'bathrooms',
                'parking',
                'propertyName',
                'extraDetails',
                'requirementStatus',
                'internalStatus',
            ]

            fieldsToCheck.forEach((field) => {
                if (localRequirement[field] !== originalRequirement[field]) {
                    changes[field] = localRequirement[field]
                }
            })

            // Handle market value
            const newMarketValue = isMarketPrice ? 'As per market price' : ''
            if (newMarketValue !== (originalRequirement.marketValue || '')) {
                changes.marketValue = newMarketValue
            }

            // Check budget range changes
            if (!isMarketPrice && budgetRange.from && budgetRange.to) {
                const newBudget = {
                    from: parseFloat(budgetRange.from) * 10000000, // Convert Cr to actual value
                    to: parseFloat(budgetRange.to) * 10000000,
                }

                if (
                    !originalRequirement.budget ||
                    newBudget.from !== originalRequirement.budget.from ||
                    newBudget.to !== originalRequirement.budget.to
                ) {
                    changes.budget = newBudget
                }
            } else if (isMarketPrice) {
                // Clear budget if market price is selected
                changes.budget = { from: 0, to: 0 }
            }

            // Check size range changes
            if (sizeRange.from && sizeRange.to) {
                const newSize = {
                    from: parseFloat(sizeRange.from),
                    to: parseFloat(sizeRange.to),
                }

                if (
                    !originalRequirement.size ||
                    newSize.from !== originalRequirement.size.from ||
                    newSize.to !== originalRequirement.size.to
                ) {
                    changes.size = newSize
                }
            }

            if (Object.keys(changes).length > 0) {
                console.log('📝 Changes detected:', changes)

                try {
                    // Dispatch the update thunk
                    await dispatch(
                        updateRequirement({
                            id: localRequirement.requirementId,
                            updates: changes as Partial<IRequirement>,
                        }),
                    ).unwrap()

                    console.log('✅ Requirement saved successfully to Firebase')
                    setIsEditing(false)
                } catch (error) {
                    console.error('❌ Failed to save requirement:', error)
                }
            } else {
                console.log('ℹ️ No changes to save')
                setIsEditing(false)
            }
        }
    }

    console.log('🔄 User:', user)

    // Handle adding new note
    const addNote = () => {
        if (newNote.trim() && localRequirement) {
            console.log('📝 Adding new note:', newNote)
            const newNoteObj = {
                id: `note_${Date.now()}`,
                author: user?.displayName || 'Unknown',
                email: user?.email || 'Unknown',
                content: newNote.trim(),
                timestamp: getUnixDateTime(),
            }

            // Create a new array with the new note
            const updatedNotes = [...(localRequirement.notes || []), newNoteObj]

            // Update local state with new notes array
            setLocalRequirement((prev) =>
                prev
                    ? {
                          ...prev,
                          notes: updatedNotes,
                      }
                    : null,
            )

            dispatch(
                addNoteToRequirement({
                    requirementId: localRequirement.requirementId,
                    note: newNoteObj,
                }),
            )
            setNewNote('')
        }
    }

    // Handle removing a note
    const removeNote = (noteId: string) => {
        if (localRequirement) {
            console.log('🗑️ Removing note:', noteId)
            dispatch(
                removeNoteFromRequirement({
                    requirementId: localRequirement.requirementId,
                    noteId,
                }),
            )
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
                <div onClick={() => navigate(`/acn/properties/${row.id}/details`)}>
                    <span className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors cursor-pointer'>
                        View
                    </span>
                </div>
            ),
        },
    ]

    // Helper function to format budget range
    const formatBudgetRange = (budget: { from: number; to: number }) => {
        return `₹${(budget.from / 10000000).toFixed(1)}Cr - ₹${(budget.to / 10000000).toFixed(1)}Cr`
    }

    // Helper function to format size range
    const formatSizeRange = (size: { from: number; to: number }) => {
        return `${size.from} - ${size.to} sqft`
    }

    // Render budget range field
    const renderBudgetRange = () => {
        if (isEditing) {
            return (
                <div>
                    <label className='text-sm text-gray-500 block mb-1'>Budget Range (Cr)</label>
                    <div className='space-y-2'>
                        <div className='flex gap-2 items-center'>
                            <StateBaseTextField
                                value={budgetRange.from}
                                onChange={(e) => setBudgetRange((prev) => ({ ...prev, from: e.target.value }))}
                                placeholder='From'
                                type='number'
                                step='0.1'
                                className='flex-1 text-sm'
                                disabled={isMarketPrice}
                            />
                            <span className='text-gray-500 text-sm'>to</span>
                            <StateBaseTextField
                                value={budgetRange.to}
                                onChange={(e) => setBudgetRange((prev) => ({ ...prev, to: e.target.value }))}
                                placeholder='To'
                                type='number'
                                step='0.1'
                                className='flex-1 text-sm'
                                disabled={isMarketPrice}
                            />
                        </div>
                        <div className='flex items-center'>
                            <input
                                type='checkbox'
                                id='marketPrice'
                                checked={isMarketPrice}
                                onChange={(e) => setIsMarketPrice(e.target.checked)}
                                className='mr-2'
                            />
                            <label htmlFor='marketPrice' className='text-sm text-gray-600'>
                                As per Market Price
                            </label>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div>
                    <label className='text-sm text-gray-500 block mb-1'>Budget Range</label>
                    <div className='text-sm font-semibold'>
                        {localRequirement?.marketValue && localRequirement.marketValue.toLowerCase().includes('market')
                            ? 'As per Market Price'
                            : localRequirement?.budget
                              ? formatBudgetRange(localRequirement.budget)
                              : 'N/A'}
                    </div>
                </div>
            )
        }
    }

    // Render size range field
    const renderSizeRange = () => {
        if (isEditing) {
            return (
                <div>
                    <label className='text-sm text-gray-500 block mb-1'>Size Range (sqft)</label>
                    <div className='flex gap-2 items-center'>
                        <StateBaseTextField
                            value={sizeRange.from}
                            onChange={(e) => setSizeRange((prev) => ({ ...prev, from: e.target.value }))}
                            placeholder='From'
                            type='number'
                            className='flex-1 text-sm'
                        />
                        <span className='text-gray-500 text-sm'>to</span>
                        <StateBaseTextField
                            value={sizeRange.to}
                            onChange={(e) => setSizeRange((prev) => ({ ...prev, to: e.target.value }))}
                            placeholder='To'
                            type='number'
                            className='flex-1 text-sm'
                        />
                    </div>
                </div>
            )
        } else {
            return (
                <div>
                    <label className='text-sm text-gray-500 block mb-1'>Size Range</label>
                    <div className='text-sm font-semibold'>
                        {localRequirement?.size ? formatSizeRange(localRequirement.size) : 'N/A'}
                    </div>
                </div>
            )
        }
    }

    // Enhanced render field function with proper default value handling
    const renderField = (
        label: string,
        value: string,
        fieldKey: keyof IRequirement,
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
                            defaultValue={value || ''} // Ensure we have a fallback
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
                            value={value || ''} // Ensure we have a fallback
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
                    <div className='text-sm font-semibold'>{value || 'N/A'}</div>
                </div>
            )
        }
    }

    // Update the status update handlers
    const handleStatusUpdate = (status: string, type: 'requirement' | 'internal') => {
        if (localRequirement) {
            // Dispatch the thunk to update Firebase
            dispatch(
                updateRequirementStatus({
                    id: localRequirement.requirementId,
                    status,
                    type,
                }),
            ).then((result) => {
                if (result.meta.requestStatus === 'fulfilled' && 'payload' in result) {
                    const payload = result.payload as { updates: IRequirement }
                    // Update local state with the latest data from Firebase
                    setLocalRequirement(payload.updates)
                    setOriginalRequirement(payload.updates)
                }
            })
        }
    }

    // Show loading state
    if (loading) {
        console.log('⏳ Showing loading state')
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

    // Show error state
    if (error) {
        console.log('❌ Showing error state:', error)
        return (
            <Layout loading={false}>
                <div className='py-2 px-6 bg-white min-h-screen'>
                    <div className='flex flex-col items-center justify-center h-64 space-y-4'>
                        <div className='text-red-500 text-center'>
                            <div className='text-lg font-semibold'>Error Loading Requirement</div>
                            <div className='text-sm mt-1'>{error}</div>
                        </div>
                        <div className='flex gap-2'>
                            <button
                                onClick={() => {
                                    dispatch(clearError())
                                    if (id) dispatch(fetchRequirementById(id))
                                }}
                                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => navigate('/acn/requirements')}
                                className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
                            >
                                Back to Requirements
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    // Show not found state
    if (!localRequirement && !loading) {
        console.log('❌ Requirement not found')
        return (
            <Layout loading={false}>
                <div className='py-2 px-6 bg-white min-h-screen'>
                    <div className='flex flex-col items-center justify-center h-64 space-y-4'>
                        <div className='text-gray-500 text-center'>
                            <div className='text-lg font-semibold'>Requirement Not Found</div>
                            <div className='text-sm mt-1'>The requirement with ID "{id}" could not be found.</div>
                        </div>
                        <button
                            onClick={() => navigate('/acn/requirements')}
                            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                        >
                            Back to Requirements
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    console.log('✅ Rendering requirement details page for:', localRequirement?.requirementId)

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-2 px-6 bg-white min-h-screen'>
                    {/* Breadcrumb */}
                    <div className='mb-4'>
                        <div className='text-sm text-gray-500 mb-2'>
                            <a href='/acn/requirements' className='hover:text-gray-700'>
                                Requirements
                            </a>
                            <span className='mx-2'>/</span>
                            <span className='text-black font-medium'>{localRequirement?.requirementId}</span>
                        </div>

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
                                            disabled={updating}
                                        >
                                            ✕ Cancel
                                        </Button>
                                        <Button
                                            bgColor={updating ? 'bg-blue-400' : 'bg-blue-600'}
                                            textColor='text-white'
                                            className='px-4 h-8 font-semibold'
                                            onClick={handleSave}
                                            disabled={updating}
                                        >
                                            {updating ? '⏳ Saving...' : '✓ Save'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        leftIcon={<img src={editic} alt='Edit' className='w-4 h-4' />}
                                        bgColor='bg-[#F3F3F3]'
                                        textColor='text-[#3A3A47]'
                                        className='px-4 h-8 font-semibold'
                                        onClick={handleEdit}
                                        disabled={updating}
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
                                    {renderField(
                                        'Project Name',
                                        toCapitalizedWords(localRequirement?.propertyName) || '',
                                        'propertyName',
                                    )}
                                    {renderField(
                                        'Asset Type',
                                        localRequirement?.assetType || '',
                                        'assetType',
                                        assetTypeOptions,
                                    )}
                                    {renderField(
                                        'Configuration',
                                        localRequirement?.configuration || '',
                                        'configuration',
                                        configurationOptions,
                                    )}
                                    {renderField(
                                        'Micromarket',
                                        toCapitalizedWords(localRequirement?.micromarket) || '',
                                        'micromarket',
                                    )}
                                    {renderField('Bedrooms', localRequirement?.bedrooms || '', 'bedrooms')}
                                    {renderField('Bathrooms', localRequirement?.bathrooms || '', 'bathrooms')}
                                    {renderField('Parking', localRequirement?.parking || '', 'parking')}
                                </div>

                                <div className='space-y-4'>
                                    {/* Fixed fields - not editable */}
                                    <div>
                                        <label className='text-sm text-gray-500 block mb-1'>Requirement ID</label>
                                        <div className='text-sm font-semibold'>{localRequirement?.requirementId}</div>
                                    </div>
                                    <div>
                                        <label className='text-sm text-gray-500 block mb-1'>CP ID</label>
                                        <div className='text-sm font-semibold'>{localRequirement?.cpId}</div>
                                    </div>
                                    <div>
                                        <label className='text-sm text-gray-500 block mb-1'>Creation Date</label>
                                        <div className='text-sm font-semibold'>
                                            {localRequirement?.added ? formatUnixDate(localRequirement.added) : 'N/A'}
                                        </div>
                                    </div>

                                    {/* Editable range fields */}
                                    {renderBudgetRange()}
                                    {renderSizeRange()}

                                    {isEditing ? (
                                        <>
                                            <div>
                                                <label className='text-sm text-gray-500 block mb-1'>Status</label>
                                                <Dropdown
                                                    options={statusDropdownOptions}
                                                    onSelect={(value) => handleStatusUpdate(value, 'requirement')}
                                                    defaultValue={localRequirement?.requirementStatus || ''}
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
                                                    options={internalStatusDropdownOptions}
                                                    onSelect={(value) => handleStatusUpdate(value, 'internal')}
                                                    defaultValue={localRequirement?.internalStatus || ''}
                                                    placeholder='Select Status'
                                                    className='relative w-full'
                                                    triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full cursor-pointer'
                                                    menuClassName='absolute z-50 mt-1 w-full border border-gray-300 rounded-md shadow-lg'
                                                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className='text-sm text-gray-500 block mb-1'>Status</label>
                                                <StatusBadge
                                                    status={
                                                        toCapitalizedWords(localRequirement?.requirementStatus) || ''
                                                    }
                                                    type='requirement'
                                                />
                                            </div>
                                            <div>
                                                <label className='text-sm text-gray-500 block mb-1'>
                                                    Internal Status
                                                </label>
                                                <StatusBadge
                                                    status={toCapitalizedWords(localRequirement?.internalStatus) || ''}
                                                    type='internal'
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label className='text-sm text-gray-500 block mb-1'>Last Modified</label>
                                        <div className='text-sm font-semibold'>
                                            {localRequirement?.lastModified
                                                ? formatUnixDate(localRequirement.lastModified)
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div>
                                <label className='text-sm text-gray-500 block mb-1'>Extra Details</label>
                                {isEditing ? (
                                    <textarea
                                        value={localRequirement?.extraDetails || ''}
                                        onChange={(e) => updateField('extraDetails', e.target.value)}
                                        className='w-full p-3 border border-gray-300 rounded-md text-sm leading-relaxed resize-vertical min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        placeholder='Enter additional details about the requirement...'
                                    />
                                ) : (
                                    <div className='text-sm font-semibold leading-relaxed'>
                                        {localRequirement?.extraDetails || 'No additional details provided'}
                                    </div>
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
                                        onClick={() =>
                                            navigate(`/acn/requirements/${localRequirement?.requirementId}/properties`)
                                        }
                                        disabled={isEditing || updating}
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
                                        {localRequirement?.name
                                            ? localRequirement.name.substring(0, 2).toUpperCase()
                                            : 'AG'}
                                    </div>
                                    <div>
                                        <div className='text-sm font-semibold'>
                                            {localRequirement?.name || 'Agent Name'}
                                        </div>
                                        <div className='text-xs text-gray-500'>
                                            {localRequirement?.cpId} | {localRequirement?.agentPhone || 'Contact Info'}
                                        </div>
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
                                                options={statusDropdownOptions}
                                                onSelect={(value) => handleStatusUpdate(value, 'requirement')}
                                                defaultValue={localRequirement?.requirementStatus || ''}
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
                                                options={internalStatusDropdownOptions}
                                                onSelect={(value) => handleStatusUpdate(value, 'internal')}
                                                defaultValue={localRequirement?.internalStatus || ''}
                                                placeholder='Select Status'
                                                className='relative w-full'
                                                triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full cursor-pointer'
                                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
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
                                            disabled={isEditing || updating}
                                        />
                                        <Button
                                            leftIcon={<img src={noteic} alt='Add Note' className='w-4 h-4' />}
                                            bgColor='bg-[#F3F3F3]'
                                            textColor='text-[#3A3A47]'
                                            className='px-4 h-8 font-semibold'
                                            onClick={addNote}
                                            disabled={!newNote.trim() || isEditing || updating}
                                        >
                                            Add Note
                                        </Button>
                                    </div>

                                    {/* Previous Notes */}
                                    <div>
                                        <h4 className='text-sm font-medium text-gray-700 mb-2'>Previous Notes</h4>
                                        <div className='max-h-90 overflow-y-auto space-y-3'>
                                            {localRequirement?.notes && localRequirement.notes.length > 0 ? (
                                                [...localRequirement.notes]
                                                    .sort((a, b) => b.timestamp - a.timestamp)
                                                    .map((note: Note) => (
                                                        <div
                                                            key={note.id}
                                                            className='bg-gray-50 rounded-lg p-3 border border-gray-200'
                                                        >
                                                            <div className='flex items-center justify-between mb-1'>
                                                                <span className='text-xs font-medium text-gray-700'>
                                                                    {note.author}
                                                                </span>
                                                                <span className='text-xs text-gray-500'>
                                                                    on {formatUnixDateTime(note.timestamp)}
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
