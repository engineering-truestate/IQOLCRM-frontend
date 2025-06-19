import React, { useState, useEffect } from 'react'
import { enquiryService } from '../../../../services/canvas_homes'

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

interface RequirementsProps {
    leadId: string
    enquiryId: string | null
    requirements?: Requirement[]
    onRequirementsUpdate?: () => void
}

const Requirements: React.FC<RequirementsProps> = ({
    enquiryId,
    requirements: existingRequirements = [],
    onRequirementsUpdate,
}) => {
    const [activeRequirement, setActiveRequirement] = useState<string | null>(null)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        expectedBudget: '',
        zone: '',
        microMarket: '',
        propertyType: '',
        typology: '',
        size: '',
        propertyStage: '',
        possessionType: '',
        notes: '',
    })

    const [requirements, setRequirements] = useState<Requirement[]>(existingRequirements)

    // Update local requirements when props change
    useEffect(() => {
        setRequirements(existingRequirements)
        if (existingRequirements.length > 0 && !activeRequirement && !isAddingNew) {
            setActiveRequirement(existingRequirements[0].id)
        }
    }, [existingRequirements])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleAddNew = () => {
        setIsAddingNew(true)
        setActiveRequirement(null)
        setFormData({
            expectedBudget: '',
            zone: '',
            microMarket: '',
            propertyType: '',
            typology: '',
            size: '',
            propertyStage: '',
            possessionType: '',
            notes: '',
        })
    }

    const updateEnquiryRequirements = async (updatedRequirements: Requirement[]) => {
        if (!enquiryId) {
            throw new Error('No enquiry selected')
        }

        try {
            await enquiryService.update(enquiryId, {
                requirements: updatedRequirements,
            })

            if (onRequirementsUpdate) {
                onRequirementsUpdate()
            }
        } catch (error) {
            console.error('Error updating enquiry requirements:', error)
            throw error
        }
    }

    const handleSave = async () => {
        if (!enquiryId) {
            alert('No enquiry selected. Please select an enquiry first.')
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
            let noteContent = ''

            // Add note to enquiry with task type "requirement collected"
            if (formData.notes) {
                noteContent += `${formData.notes}`
            }

            await enquiryService.addNote(enquiryId, {
                agentId: 'system',
                agentName: 'System',
                TaskType: 'requirement collection',
                note: noteContent,
            })

            setRequirements(updatedRequirements)
            setActiveRequirement(newRequirement.id)
            setIsAddingNew(false)
            alert('Requirement saved successfully!')

            // Notify parent to refresh data to show new note
            if (onRequirementsUpdate) {
                onRequirementsUpdate()
            }
        } catch (error) {
            console.error('Error saving requirement:', error)
            alert('Failed to save requirement. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = () => {
        setIsAddingNew(false)
        if (requirements.length > 0) {
            setActiveRequirement(requirements[0].id)
        }
        setFormData({
            expectedBudget: '',
            zone: '',
            microMarket: '',
            propertyType: '',
            typology: '',
            size: '',
            propertyStage: '',
            possessionType: '',
            notes: '',
        })
    }

    const handleRequirementSelect = (reqId: string) => {
        setActiveRequirement(reqId)
        setIsAddingNew(false)
    }

    const handleDelete = async (reqId: string) => {
        if (!enquiryId) {
            alert('No enquiry selected.')
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

            alert('Requirement deleted successfully!')
        } catch (error) {
            console.error('Error deleting requirement:', error)
            alert('Failed to delete requirement. Please try again.')
        }
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

    // Get current requirement for display
    const currentRequirement = requirements.find((req) => req.id === activeRequirement)

    return (
        <div className='bg-white rounded-lg p-6'>
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
                            <button className='py-2 px-1 border-b-2 border-green-500 text-green-600 font-medium text-sm'>
                                New Requirement
                            </button>
                        )}
                        <div className='py-2'>
                            <button
                                onClick={handleAddNew}
                                className='flex items-center py-2 gap-2 bg-gray-200 text-gray-900 px-4 rounded-md text-sm font-medium hover:bg-gray-500'
                                disabled={isAddingNew}
                            >
                                <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
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
                    <div className='grid grid-cols-3 gap-6 mb-6'>
                        {/* Row 1 */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Expected Budget</label>
                            <select
                                value={formData.expectedBudget}
                                onChange={(e) => handleInputChange('expectedBudget', e.target.value)}
                                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                disabled={saving}
                            >
                                <option value=''>Please Select</option>
                                <option value='under-50lac'>0.5 - 0.75 Cr</option>
                                <option value='50lac-80lac'>0.76 - 1 Cr</option>
                                <option value='50lac-80lac'>1.01 - 1.25 Cr</option>
                                <option value='50lac-80lac'>1.26 - 1.5 Cr</option>
                                <option value='50lac-80lac'>1.51 - 1.75 Cr</option>
                                <option value='50lac-80lac'>1.76 - 2 Cr</option>
                                <option value='50lac-80lac'>{'>2 Cr'}</option>
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Zone</label>
                            <select
                                value={formData.zone}
                                onChange={(e) => handleInputChange('zone', e.target.value)}
                                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                disabled={saving}
                            >
                                <option value=''>Please Select</option>
                                <option value='north'>North</option>
                                <option value='south'>South</option>
                                <option value='east'>East</option>
                                <option value='west'>West</option>
                                <option value='central'>Central</option>
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Micro Market</label>
                            <select
                                value={formData.microMarket}
                                onChange={(e) => handleInputChange('microMarket', e.target.value)}
                                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                disabled={saving}
                            >
                                <option value=''>Please Specify</option>
                                <option value='whitefield'>Whitefield</option>
                                <option value='koramangala'>Koramangala</option>
                                <option value='indiranagar'>Indiranagar</option>
                                <option value='hebbal'>Hebbal</option>
                                <option value='electronic-city'>Electronic City</option>
                                <option value='sarjapur'>Sarjapur</option>
                                <option value='marathahalli'>Marathahalli</option>
                                <option value='jp-nagar'>JP Nagar</option>
                                <option value='btm-layout'>BTM Layout</option>
                            </select>
                        </div>

                        {/* Row 2 */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Property Type</label>
                            <select
                                value={formData.propertyType}
                                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                disabled={saving}
                            >
                                <option value=''>Please Select</option>
                                <option value='apartment'>Plot</option>
                                <option value='apartment'>Apartment</option>
                                <option value='villa'>Villa</option>
                                <option value='plot'>Villament</option>
                                <option value='office'>Row House</option>
                                <option value='retail'>Farm House</option>
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Typology</label>
                            <select
                                value={formData.typology}
                                onChange={(e) => handleInputChange('typology', e.target.value)}
                                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                disabled={saving}
                            >
                                <option value=''>Please Select</option>
                                <option value='1bhk'>1 BHK</option>
                                <option value='2bhk'>2 BHK</option>
                                <option value='3bhk'>3 BHK</option>
                                <option value='4bhk'>4 BHK</option>
                                <option value='5bhk'>5+ BHK</option>
                                <option value='villa'>Villa</option>
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Size</label>
                            <input
                                type='text'
                                value={formData.size}
                                onChange={(e) => handleInputChange('size', e.target.value)}
                                placeholder='e.g., 1200-1500 sqft'
                                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                disabled={saving}
                            />
                        </div>

                        {/* Row 3 */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Property Stage</label>
                            <select
                                value={formData.propertyStage}
                                onChange={(e) => handleInputChange('propertyStage', e.target.value)}
                                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                disabled={saving}
                            >
                                <option value=''>Please Select</option>
                                <option value='ready'>Pre Launch</option>
                                <option value='under-construction'>Launch</option>
                                <option value='new-launch'>Under Construction</option>
                                <option value='new-launch'>Ready to Move</option>
                                <option value='new-launch'>Complete</option>
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Possession By</label>
                            <select
                                value={formData.possessionType}
                                onChange={(e) => handleInputChange('possessionType', e.target.value)}
                                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                disabled={saving}
                            >
                                <option value=''>Please Select</option>
                                <option value='immediate'>Immediate</option>
                                <option value='3months'>Within 3 Months</option>
                                <option value='6months'>Within 6 Months</option>
                                <option value='1year'>Within 1 Year</option>
                                <option value='2years'>Within 2 Years</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className='mb-6'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Add Note (Optional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder='Any specific requirements or preferences...'
                            rows={4}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            disabled={saving}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-3'>
                        <button
                            onClick={handleDiscard}
                            disabled={saving}
                            className='px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium disabled:opacity-50'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className='px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
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

                    <div className='grid grid-cols-3 gap-6 mb-6'>
                        {/* Row 1 */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Expected Budget</label>
                            <div className='w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700'>
                                {currentRequirement.expectedBudget || 'Not specified'}
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Zone</label>
                            <div className='w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700'>
                                {currentRequirement.zone || 'Not specified'}
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Micro Market</label>
                            <div className='w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700'>
                                {currentRequirement.microMarket || 'Not specified'}
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Property Type</label>
                            <div className='w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700'>
                                {currentRequirement.propertyType || 'Not specified'}
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Typology</label>
                            <div className='w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700'>
                                {currentRequirement.typology || 'Not specified'}
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Size</label>
                            <div className='w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700'>
                                {currentRequirement.size || 'Not specified'}
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Property Stage</label>
                            <div className='w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700'>
                                {currentRequirement.propertyStage || 'Not specified'}
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Possession Type</label>
                            <div className='w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700'>
                                {currentRequirement.possessionType || 'Not specified'}
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    {currentRequirement.notes && (
                        <div className='mb-6'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Notes</label>
                            <div className='w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700 min-h-[100px]'>
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
        </div>
    )
}

export default Requirements
