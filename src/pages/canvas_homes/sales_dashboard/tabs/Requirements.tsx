import React, { useState } from 'react'

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
    createdDate: string
}

const Requirements: React.FC = () => {
    const [activeRequirement, setActiveRequirement] = useState<string | null>('1')
    const [isAddingNew, setIsAddingNew] = useState(false)
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

    const [requirements, setRequirements] = useState<Requirement[]>([
        {
            id: '1',
            name: 'Primary Requirement',
            expectedBudget: '1cr-2cr',
            zone: 'north',
            microMarket: 'whitefield',
            propertyType: 'Apartment',
            typology: '3BHK',
            size: '1200-1500 sqft',
            propertyStage: 'ready',
            possessionType: 'immediate',
            notes: 'Looking for east-facing unit with good ventilation',
            createdDate: 'May 20, 2023',
        },
        {
            id: '2',
            name: 'Secondary Requirement',
            expectedBudget: '80lac-1cr',
            zone: 'south',
            microMarket: 'koramangala',
            propertyType: 'Apartment',
            typology: '2BHK',
            size: '900-1200 sqft',
            propertyStage: 'under-construction',
            possessionType: '6months',
            notes: 'Alternative option if primary requirement not available',
            createdDate: 'May 22, 2023',
        },
    ])

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

    const handleSave = () => {
        if (isAddingNew) {
            const newRequirement: Requirement = {
                id: Date.now().toString(),
                name: `Requirement ${requirements.length + 1}`,
                ...formData,
                createdDate: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
            }
            setRequirements((prev) => [...prev, newRequirement])
            setActiveRequirement(newRequirement.id)
        } else if (activeRequirement) {
            setRequirements((prev) => prev.map((req) => (req.id === activeRequirement ? { ...req, ...formData } : req)))
        }
        setIsAddingNew(false)
        alert('Requirement saved successfully!')
    }

    const handleDiscard = () => {
        setIsAddingNew(false)
        if (requirements.length > 0) {
            setActiveRequirement('1')
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
        const requirement = requirements.find((req) => req.id === reqId)
        if (requirement) {
            setActiveRequirement(reqId)
            setIsAddingNew(false)
            setFormData({
                expectedBudget: requirement.expectedBudget,
                zone: requirement.zone,
                microMarket: requirement.microMarket,
                propertyType: requirement.propertyType,
                typology: requirement.typology,
                size: requirement.size,
                propertyStage: requirement.propertyStage,
                possessionType: requirement.possessionType,
                notes: requirement.notes,
            })
        }
    }

    const handleEdit = (reqId: string) => {
        handleRequirementSelect(reqId)
    }

    const handleDelete = (reqId: string) => {
        if (requirements.length > 1) {
            setRequirements((prev) => prev.filter((req) => req.id !== reqId))
            if (activeRequirement === reqId) {
                const remainingReqs = requirements.filter((req) => req.id !== reqId)
                setActiveRequirement(remainingReqs[0]?.id || null)
            }
        } else {
            alert('Cannot delete the last requirement')
        }
    }

    // Show form if adding new or if no requirements exist
    const showForm = isAddingNew || requirements.length === 0 || activeRequirement

    if (showForm) {
        return (
            <div className='bg-white rounded-lg p-6'>
                <div className='flex items-center gap-2 mb-6'>
                    <h3 className='font-medium text-gray-900'>
                        {isAddingNew ? 'Add New Requirement' : 'Requirements'}
                    </h3>
                    {!isAddingNew && (
                        <button onClick={handleAddNew} className='text-blue-600 hover:text-blue-800 text-sm'>
                            + Add
                        </button>
                    )}
                </div>

                <div className='grid grid-cols-3 gap-6 mb-6'>
                    {/* Row 1 */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Expected Budget</label>
                        <select
                            value={formData.expectedBudget}
                            onChange={(e) => handleInputChange('expectedBudget', e.target.value)}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            <option value=''>Please Select</option>
                            <option value='under-50lac'>Under 50 Lac</option>
                            <option value='50lac-80lac'>50 Lac - 80 Lac</option>
                            <option value='80lac-1cr'>80 Lac - 1 Cr</option>
                            <option value='1cr-2cr'>1 Cr - 2 Cr</option>
                            <option value='above-2cr'>Above 2 Cr</option>
                        </select>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Zone</label>
                        <select
                            value={formData.zone}
                            onChange={(e) => handleInputChange('zone', e.target.value)}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            <option value=''>Please Select</option>
                            <option value='north'>North Bangalore</option>
                            <option value='south'>South Bangalore</option>
                            <option value='east'>East Bangalore</option>
                            <option value='west'>West Bangalore</option>
                            <option value='central'>Central Bangalore</option>
                        </select>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Micro Market</label>
                        <select
                            value={formData.microMarket}
                            onChange={(e) => handleInputChange('microMarket', e.target.value)}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            <option value=''>Please Specify</option>
                            <option value='whitefield'>Whitefield</option>
                            <option value='koramangala'>Koramangala</option>
                            <option value='indiranagar'>Indiranagar</option>
                            <option value='hebbal'>Hebbal</option>
                            <option value='electronic-city'>Electronic City</option>
                        </select>
                    </div>

                    {/* Row 2 */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Property Type</label>
                        <input
                            type='text'
                            value={formData.propertyType}
                            onChange={(e) => handleInputChange('propertyType', e.target.value)}
                            placeholder='Please Select'
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Typology</label>
                        <select
                            value={formData.typology}
                            onChange={(e) => handleInputChange('typology', e.target.value)}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            <option value=''>Please Select</option>
                            <option value='1bhk'>1 BHK</option>
                            <option value='2bhk'>2 BHK</option>
                            <option value='3bhk'>3 BHK</option>
                            <option value='4bhk'>4 BHK</option>
                            <option value='villa'>Villa</option>
                        </select>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Size</label>
                        <input
                            type='text'
                            value={formData.size}
                            onChange={(e) => handleInputChange('size', e.target.value)}
                            placeholder='Please Specify'
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>

                    {/* Row 3 */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Property Stage</label>
                        <select
                            value={formData.propertyStage}
                            onChange={(e) => handleInputChange('propertyStage', e.target.value)}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            <option value=''>Please Select</option>
                            <option value='ready'>Ready to Move</option>
                            <option value='under-construction'>Under Construction</option>
                            <option value='new-launch'>New Launch</option>
                        </select>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Possession Type</label>
                        <select
                            value={formData.possessionType}
                            onChange={(e) => handleInputChange('possessionType', e.target.value)}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            <option value=''>Please Select</option>
                            <option value='immediate'>Immediate</option>
                            <option value='3months'>Within 3 Months</option>
                            <option value='6months'>Within 6 Months</option>
                            <option value='1year'>Within 1 Year</option>
                        </select>
                    </div>
                </div>

                {/* Notes Section */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Add Note (Optional)</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder='Body...'
                        rows={4}
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3'>
                    <button
                        onClick={handleDiscard}
                        className='px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium'
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        className='px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700'
                    >
                        Save
                    </button>
                </div>
            </div>
        )
    }

    // Requirements List View
    return (
        <div className='bg-white rounded-lg p-6'>
            <div className='flex items-center justify-between mb-6'>
                <h3 className='font-medium text-gray-900'>Requirements</h3>
                <button
                    onClick={handleAddNew}
                    className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700'
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
                    Add Requirement
                </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {requirements.map((requirement) => (
                    <div
                        key={requirement.id}
                        className='border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors'
                    >
                        <div className='flex items-center justify-between mb-3'>
                            <h4 className='font-medium text-gray-900'>{requirement.name}</h4>
                            <div className='flex gap-2'>
                                <button
                                    onClick={() => handleEdit(requirement.id)}
                                    className='text-blue-600 hover:text-blue-800 text-sm'
                                >
                                    Edit
                                </button>
                                {requirements.length > 1 && (
                                    <button
                                        onClick={() => handleDelete(requirement.id)}
                                        className='text-red-600 hover:text-red-800 text-sm'
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className='space-y-2 text-sm'>
                            <div className='flex justify-between'>
                                <span className='text-gray-600'>Budget:</span>
                                <span className='text-gray-900'>{requirement.expectedBudget || 'Not specified'}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-gray-600'>Zone:</span>
                                <span className='text-gray-900'>{requirement.zone || 'Not specified'}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-gray-600'>Type:</span>
                                <span className='text-gray-900'>{requirement.typology || 'Not specified'}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-gray-600'>Size:</span>
                                <span className='text-gray-900'>{requirement.size || 'Not specified'}</span>
                            </div>
                            {requirement.notes && (
                                <div className='mt-2 pt-2 border-t border-gray-100'>
                                    <span className='text-gray-600 text-xs'>Notes:</span>
                                    <p className='text-gray-900 text-xs mt-1'>{requirement.notes}</p>
                                </div>
                            )}
                            <div className='text-xs text-gray-500 mt-2'>Created: {requirement.createdDate}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Requirements
