import React, { useState, useEffect } from 'react'
import { enquiryService } from '../../../../services/canvas_homes'
import RequirementCollectedModal from '../../../../components/canvas_homes/RquirementCollectionModal'
import { toast } from 'react-toastify'
import { useSelector /*, useDispatch */ } from 'react-redux'
// import type { AppDispatch } from '../../../../store'
// import { clearTaskId } from '../../../../store/reducers/canvas-homes/taskIdReducer'
import Dropdown from '../../../../components/design-elements/Dropdown'
import { toCapitalizedWords } from '../../../../components/helper/toCapitalize'

// Types
interface Requirement {
    id: string
    name: string
    expectedBudget: string
    zone: string
    microMarket: string
    propertyType: string
    typology: string
    size: string
    propertyStage: string
    possessionType: string
    notes: string
    added: string
}

interface RootState {
    taskId: {
        taskState: string
    }
}

interface RequirementsProps {
    leadId: string
    enquiryId: string | null
    requirements?: Requirement[]
    onRequirementsUpdate?: () => void
    refreshData?: () => void
}

// Dropdown options
const BUDGET_OPTIONS = [
    { label: '0.5 - 0.75 Cr', value: '0.5 - 0.75 Cr' },
    { label: '0.76 - 1 Cr', value: '0.76 - 1 Cr' },
    { label: '1.01 - 1.25 Cr', value: '1.01 - 1.25 Cr' },
    { label: '1.26 - 1.5 Cr', value: '1.26 - 1.5 Cr' },
    { label: '1.51 - 1.75 Cr', value: '1.51 - 1.75 Cr' },
    { label: '1.76 - 2 Cr', value: '1.76 - 2 Cr' },
    { label: '>2 Cr', value: '>2 Cr' },
]

const ZONE_OPTIONS = [
    { label: 'North', value: 'north' },
    { label: 'South', value: 'south' },
    { label: 'East', value: 'east' },
    { label: 'West', value: 'west' },
]

const MICRO_MARKET_OPTIONS = [
    { label: 'Whitefield', value: 'whitefield' },
    { label: 'Koramangala', value: 'koramangala' },
    { label: 'Indiranagar', value: 'indiranagar' },
    { label: 'Hebbal', value: 'hebbal' },
    { label: 'Electronic City', value: 'electronic-city' },
    { label: 'Sarjapur', value: 'sarjapur' },
    { label: 'Marathahalli', value: 'marathahalli' },
    { label: 'JP Nagar', value: 'jp-nagar' },
    { label: 'BTM Layout', value: 'btm-layout' },
]

const PROPERTY_TYPE_OPTIONS = [
    { label: 'Plot', value: 'plot' },
    { label: 'Apartment', value: 'apartment' },
    { label: 'Villa', value: 'villa' },
    { label: 'Villament', value: 'villament' },
    { label: 'Row House', value: 'row house' },
    { label: 'Farm House', value: 'farm house' },
]

// const _TYPOLOGY_OPTIONS = [
//     { label: '1 BHK', value: '1 BHK' },
//     { label: '2 BHK', value: '2 BHK' },
//     { label: '3 BHK', value: '3 BHK' },
//     { label: '4 BHK', value: '4 BHK' },
//     { label: '5 BHK', value: '5 BHK' },
//     { label: 'Penthouse', value: 'penthouse' },
// ]

const PROPERTY_STAGE_OPTIONS = [
    { label: 'Pre Launch', value: 'Pre Launch' },
    { label: 'Launch', value: 'Launch' },
    { label: 'Under Construction', value: 'Under Construction' },
    { label: 'Ready to Move', value: 'Ready to Move' },
    { label: 'Complete', value: 'Complete' },
]

// Initial form state
const INITIAL_FORM_DATA = {
    expectedBudget: '',
    zone: '',
    microMarket: '',
    propertyType: '',
    typology: '',
    size: '',
    propertyStage: '',
    possessionType: '',
    notes: '',
}

const Requirements: React.FC<RequirementsProps> = ({
    enquiryId,
    requirements: existingRequirements = [],
    onRequirementsUpdate,
    // refreshData,
}) => {
    // State management
    const [activeRequirement, setActiveRequirement] = useState<string | null>(null)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState(INITIAL_FORM_DATA)
    const [requirements, setRequirements] = useState<Requirement[]>(existingRequirements)
    const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false)

    // const dispatch = useDispatch<AppDispatch>()
    const { taskState } = useSelector((state: RootState) => state.taskId)

    // Update local requirements when props change
    useEffect(() => {
        setRequirements(existingRequirements)
        if (existingRequirements.length > 0 && !activeRequirement && !isAddingNew) {
            setActiveRequirement(existingRequirements[0].id)
        }
    }, [existingRequirements])

    // Handle form input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Initialize new requirement form
    const handleAddNew = () => {
        setIsAddingNew(true)
        setActiveRequirement(null)
        setFormData(INITIAL_FORM_DATA)
    }

    // API call to update enquiry requirements
    const updateEnquiryRequirements = async (updatedRequirements: Requirement[]) => {
        if (!enquiryId) {
            throw new Error('No enquiry selected')
        }

        try {
            await enquiryService.update(enquiryId, {
                requirements: updatedRequirements,
            })

            if (onRequirementsUpdate && taskState == null) {
                onRequirementsUpdate()
            }
        } catch (error) {
            console.error('Error updating enquiry requirements:', error)
            throw error
        }
    }

    // Save new requirement
    const handleSave = async () => {
        if (!enquiryId) {
            toast.error('No enquiry selected. Please select an enquiry first.')
            return
        }

        setSaving(true)
        try {
            const newRequirement: Requirement = {
                id: Date.now().toString(),
                name: `Requirement ${requirements.length + 1}`,
                ...formData,
                added: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
            }

            const updatedRequirements = [...requirements, newRequirement]

            // Update requirements in enquiry
            await updateEnquiryRequirements(updatedRequirements)

            // Create note content for new requirement
            const noteContent = formData.notes || ''

            await enquiryService.addNote(enquiryId, {
                agentId: 'system',
                agentName: 'System',
                TaskType: 'requirement collection',
                note: noteContent,
            })

            setRequirements(updatedRequirements)
            setActiveRequirement(newRequirement.id)
            setIsAddingNew(false)
            toast.success('Requirement saved successfully!')

            // Notify parent to refresh data or show modal
            if (onRequirementsUpdate && taskState == null) {
                onRequirementsUpdate()
            } else {
                setIsRequirementModalOpen(true)
            }
        } catch (error) {
            console.error('Error saving requirement:', error)
            toast.error('Failed to save requirement. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    // Cancel adding new requirement
    const handleDiscard = () => {
        setIsAddingNew(false)
        if (requirements.length > 0) {
            setActiveRequirement(requirements[0].id)
        }
        setFormData(INITIAL_FORM_DATA)
    }

    // Select a requirement to view
    const handleRequirementSelect = (reqId: string) => {
        setActiveRequirement(reqId)
        setIsAddingNew(false)
    }

    // Delete a requirement
    const handleDelete = async (reqId: string) => {
        if (!enquiryId) {
            toast.error('No enquiry selected.')
            return
        }

        const confirmDelete = window.confirm('Are you sure you want to delete this requirement?')
        if (!confirmDelete) return

        try {
            const updatedRequirements = requirements.filter((req) => req.id !== reqId)
            await updateEnquiryRequirements(updatedRequirements)
            setRequirements(updatedRequirements)

            if (activeRequirement === reqId) {
                if (updatedRequirements.length > 0) {
                    setActiveRequirement(updatedRequirements[0].id)
                } else {
                    setActiveRequirement(null)
                }
            }

            toast.success('Requirement deleted successfully!')
        } catch (error) {
            console.error('Error deleting requirement:', error)
            toast.error('Failed to delete requirement. Please try again.')
        }
    }

    // Generate possession year options
    const currentYear = new Date().getFullYear()
    const possessionOptions = [
        ...Array.from({ length: 15 }, (_, i) => {
            const year = (currentYear + i).toString()
            return { label: year, value: year }
        }),
    ]

    // Get current requirement for display
    const currentRequirement = requirements.find((req) => req.id === activeRequirement)

    // Helper function to get dropdown trigger class based on selected value
    const getDropdownTriggerClassName = (fieldValue: string) => {
        const baseClassName =
            'w-full px-3 py-2 w-63.5 bg-white text-gray-500 border rounded-md flex items-center justify-between text-left h-[32px] '
        const borderClass = fieldValue
            ? 'border border-gray-300 text-gray-900 focus:outline-none focus:border-black'
            : 'border border-gray-300 focus:outline-none focus:border-black'
        return `${baseClassName} ${borderClass}`
    }

    // No enquiry selected state
    if (!enquiryId) {
        return (
            <div className='bg-white rounded-lg p-6'>
                <div className='text-center py-12 text-gray-500'>
                    <svg
                        className='w-12 h-12 mx-auto mb-4 text-gray-300'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                        />
                    </svg>
                    <p className='text-lg font-medium text-gray-900 mb-2'>No enquiry selected</p>
                    <p className='text-gray-600'>Please select an enquiry to view and manage requirements</p>
                </div>
            </div>
        )
    }

    // Common styling
    const labelClassName = 'block text-sm font-medium text-gray-900 mb-1.5 text-sm placeholder:text-sm'
    const readOnlyFieldClassName =
        'w-63.5 border border-gray-200 rounded-md px-3 py-2 text-gray-500 bg-gray-50 text-gray-700 h-[32px] flex items-center text-sm'
    const dropdownClassName = 'w-full focus:outline-none focus:border-black rounded-md text-sm'
    const dropdownMenuClassName =
        'absolute z-10 top-full w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[200px] overflow-auto'
    const dropdownOptionClassName = 'px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
    const inputClassName =
        'border border-gray-300 rounded-md px-3 py-2 text-gray-900 w-63.5 h-[32px] focus:outline-none focus:border-black text-sm'

    return (
        <div className='bg-white rounded-lg p-5'>
            {/* Requirement Tabs */}
            {(requirements.length > 0 || isAddingNew) && (
                <div className='border-b border-gray-200 mb-6'>
                    <nav className='flex space-x-8'>
                        {requirements.map((requirement, index) => (
                            <button
                                key={requirement.id}
                                onClick={() => handleRequirementSelect(requirement.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeRequirement === requirement.id && !isAddingNew
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Requirement {index + 1}
                            </button>
                        ))}

                        {isAddingNew && (
                            <button className='py-2 px-1 border-b-2 border-black text-black font-medium text-sm'>
                                Requirement
                            </button>
                        )}
                        <div className='py-2'>
                            <button
                                onClick={handleAddNew}
                                className='flex items-center py-2 gap-2 bg-gray-200 text-gray-900 px-4 rounded-md text-sm w-[78px] h-[28px] font-medium hover:bg-glack'
                                disabled={isAddingNew}
                            >
                                <svg width='8' height='8' viewBox='0 0 16 16' fill='none'>
                                    <path
                                        d='M8 1V15M1 8H15'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                                Add
                            </button>
                        </div>
                    </nav>
                </div>
            )}
            {/* Content Area */}
            {isAddingNew ? (
                // Add New Requirement Form
                <div>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-7 mb-6 w-fit'>
                        {/* Row 1 */}
                        <div>
                            <label className={labelClassName}>
                                Expected Budget<span className='text-red-500'> *</span>
                            </label>
                            <Dropdown
                                options={BUDGET_OPTIONS}
                                onSelect={(value) => handleInputChange('expectedBudget', value)}
                                defaultValue={formData.expectedBudget}
                                placeholder='Please Select'
                                className={dropdownClassName}
                                triggerClassName={getDropdownTriggerClassName(formData.expectedBudget)}
                                menuClassName={dropdownMenuClassName}
                                optionClassName={dropdownOptionClassName}
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className={labelClassName}>Zone</label>
                            <Dropdown
                                options={ZONE_OPTIONS}
                                onSelect={(value) => handleInputChange('zone', value)}
                                defaultValue={formData.zone}
                                placeholder='Please Select'
                                className={dropdownClassName}
                                triggerClassName={getDropdownTriggerClassName(formData.zone)}
                                menuClassName={dropdownMenuClassName}
                                optionClassName={dropdownOptionClassName}
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className={labelClassName}>Micro Market</label>
                            <Dropdown
                                options={MICRO_MARKET_OPTIONS}
                                onSelect={(value) => handleInputChange('microMarket', value)}
                                defaultValue={formData.microMarket}
                                placeholder='Please Select'
                                className={dropdownClassName}
                                triggerClassName={getDropdownTriggerClassName(formData.microMarket)}
                                menuClassName={dropdownMenuClassName}
                                optionClassName={dropdownOptionClassName}
                                disabled={saving}
                            />
                        </div>

                        {/* Row 2 */}
                        <div>
                            <label className={labelClassName}>
                                Property Type<span className='text-red-500'> *</span>
                            </label>
                            <Dropdown
                                options={PROPERTY_TYPE_OPTIONS}
                                onSelect={(value) => handleInputChange('propertyType', value)}
                                defaultValue={formData.propertyType}
                                placeholder='Please Select'
                                className={dropdownClassName}
                                triggerClassName={getDropdownTriggerClassName(formData.propertyType)}
                                menuClassName={dropdownMenuClassName}
                                optionClassName={dropdownOptionClassName}
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className={labelClassName}>Typology</label>
                            <input
                                type='text'
                                value={formData.typology}
                                onChange={(e) => handleInputChange('typology', e.target.value)}
                                placeholder='Select Typology'
                                className={inputClassName}
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className={labelClassName}>Size (Sq ft)</label>
                            <input
                                type='text'
                                value={formData.size}
                                onChange={(e) => handleInputChange('size', e.target.value)}
                                placeholder='e.g., 1200-1500 sqft'
                                className={inputClassName}
                                disabled={saving}
                            />
                        </div>

                        {/* Row 3 */}
                        <div>
                            <label className={labelClassName}>
                                Property Stage<span className='text-red-500'> *</span>
                            </label>
                            <Dropdown
                                options={PROPERTY_STAGE_OPTIONS}
                                onSelect={(value) => handleInputChange('propertyStage', value)}
                                defaultValue={formData.propertyStage}
                                placeholder='Please Select'
                                className={dropdownClassName}
                                triggerClassName={getDropdownTriggerClassName(formData.propertyStage)}
                                menuClassName={dropdownMenuClassName}
                                optionClassName={dropdownOptionClassName}
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className={labelClassName}>Possession By</label>
                            <Dropdown
                                options={possessionOptions}
                                onSelect={(value) => handleInputChange('possessionType', value)}
                                defaultValue={formData.possessionType}
                                placeholder='Select Year'
                                className={dropdownClassName}
                                triggerClassName={getDropdownTriggerClassName(formData.possessionType)}
                                menuClassName={dropdownMenuClassName}
                                optionClassName={dropdownOptionClassName}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className='mb-6'>
                        <label className={labelClassName}>Add Note (Optional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder='Any specific requirements or preferences...'
                            rows={3}
                            className='w-[536px] border border-gray-300 rounded-sm px-3 py-2 w-128 focus:outline-none focus:ring-1 focus:ring-black-500 focus:border-black-500 text-gray-900'
                            disabled={saving}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-3'>
                        <button
                            onClick={handleDiscard}
                            disabled={saving}
                            className='px-6 py-2 w-30 text-gray-600 bg-gray-200 rounded-sm hover:text-gray-800 hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={
                                saving || !formData.expectedBudget || !formData.propertyType || !formData.propertyStage
                            }
                            className='px-6 py-2 w-30 bg-blue-500 text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                            {saving && (
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                            )}
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            ) : currentRequirement ? (
                // Display Selected Requirement (Read-only)
                <div>
                    <div className='flex items-center justify-between mb-6'>
                        <h4 className='text-lg font-medium text-gray-900'>{currentRequirement.name}</h4>
                        <div className='flex gap-2'>
                            <span className='text-sm text-gray-500'>Added: {currentRequirement.added}</span>
                            <button
                                onClick={() => handleDelete(currentRequirement.id)}
                                className='text-red-600 hover:text-red-800 text-sm font-medium'
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-7 md:gap-7 mb-6 w-fit'>
                        {/* Row 1 */}
                        <div>
                            <label className={labelClassName}>Expected Budget</label>
                            <div className={readOnlyFieldClassName}>
                                {currentRequirement.expectedBudget || 'Not specified'}
                            </div>
                        </div>

                        <div>
                            <label className={labelClassName}>Zone</label>
                            <div className={readOnlyFieldClassName}>
                                {toCapitalizedWords(currentRequirement.zone) || 'Not specified'}
                            </div>
                        </div>

                        <div>
                            <label className={labelClassName}>Micro Market</label>
                            <div className={readOnlyFieldClassName}>
                                {toCapitalizedWords(currentRequirement.microMarket) || 'Not specified'}
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div>
                            <label className={labelClassName}>Property Type</label>
                            <div className={readOnlyFieldClassName}>
                                {toCapitalizedWords(currentRequirement.propertyType) || 'Not specified'}
                            </div>
                        </div>

                        <div>
                            <label className={labelClassName}>Typology</label>
                            <div className={readOnlyFieldClassName}>
                                {currentRequirement.typology || 'Not specified'}
                            </div>
                        </div>

                        <div>
                            <label className={labelClassName}>Size</label>
                            <div className={readOnlyFieldClassName}>{currentRequirement.size || 'Not specified'}</div>
                        </div>

                        {/* Row 3 */}
                        <div>
                            <label className={labelClassName}>Property Stage</label>
                            <div className={readOnlyFieldClassName}>
                                {currentRequirement.propertyStage || 'Not specified'}
                            </div>
                        </div>

                        <div>
                            <label className={labelClassName}>Possession Type</label>
                            <div className={readOnlyFieldClassName}>
                                {currentRequirement.possessionType || 'Not specified'}
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    {currentRequirement.notes && (
                        <div className='mb-6'>
                            <label className={labelClassName}>Notes</label>
                            <div className='w-[536px] border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700 min-h-[80px]'>
                                {currentRequirement.notes}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // No requirements state
                <div className='text-center py-12 text-gray-500'>
                    <svg
                        className='w-12 h-12 mx-auto mb-4 text-gray-300'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                        />
                    </svg>
                    <p className='text-lg font-medium text-gray-900 mb-2'>No requirements yet</p>
                    <p className='text-gray-600 mb-4'>Add customer requirements to track their property preferences</p>
                    <button
                        onClick={handleAddNew}
                        className='bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700'
                    >
                        Add First Requirement
                    </button>
                </div>
            )}
            {isRequirementModalOpen && (
                <RequirementCollectedModal
                    isOpen={isRequirementModalOpen}
                    onClose={() => setIsRequirementModalOpen(false)}
                    refreshData={onRequirementsUpdate}
                />
            )}
        </div>
    )
}

export default Requirements
