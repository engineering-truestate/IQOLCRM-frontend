import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createRequirement } from '../../services/acn/requirements/requirementsService'
import { type AppDispatch, type RootState } from '../../store'
import PlacesSearch from '../design-elements/PlacesSearch'

interface AddRequirementModalProps {
    isOpen: boolean
    onClose: () => void
    cpId: string
}

interface Places {
    name: string
    lat: number
    lng: number
    address: string
    mapLocation: string
}

export const AddRequirementModal: React.FC<AddRequirementModalProps> = ({ isOpen, onClose, cpId }) => {
    const dispatch = useDispatch<AppDispatch>()
    const { loading, error } = useSelector((state: RootState) => state.requirements)

    const [errorMessage, setErrorMessage] = useState('')
    const [selectedPlace, setSelectedPlace] = useState<Places | null>(null)
    const [assetType, setAssetType] = useState('')
    const [superBuiltUpArea, setSuperBuiltUpArea] = useState('')
    const [plotArea, setPlotArea] = useState('')
    const [bedroom, setBedroom] = useState<number | null>(null)
    const [budgetFrom, setBudgetFrom] = useState('')
    const [budgetTo, setBudgetTo] = useState('')
    const [builderCategory, setBuilderCategory] = useState('')
    const [preferredFloor, setPreferredFloor] = useState('')
    const [facing, setFacing] = useState('')
    const [requirementDetails, setRequirementDetails] = useState('')

    const resetForm = () => {
        setSelectedPlace(null)
        setAssetType('')
        setSuperBuiltUpArea('')
        setPlotArea('')
        setBedroom(null)
        setBudgetFrom('')
        setBudgetTo('')
        setBuilderCategory('')
        setPreferredFloor('')
        setFacing('')
        setRequirementDetails('')
        setErrorMessage('')
    }

    const handleSubmit = async () => {
        const from = parseFloat(budgetFrom)
        const to = parseFloat(budgetTo)

        // Validation
        if (!isNaN(from) && !isNaN(to) && from >= to) {
            setErrorMessage('Budget "From" must be less than "To"')
            return
        }

        if (
            !selectedPlace ||
            !assetType ||
            !superBuiltUpArea ||
            !plotArea ||
            bedroom === null ||
            !budgetFrom ||
            !budgetTo ||
            !builderCategory ||
            !preferredFloor ||
            !facing
        ) {
            setErrorMessage('Please fill all required fields marked with *')
            return
        }

        setErrorMessage('')

        try {
            const requirementData = {
                selectedPlace,
                assetType,
                superBuiltUpArea,
                plotArea,
                bedroom,
                budgetFrom,
                budgetTo,
                builderCategory,
                preferredFloor,
                facing,
                requirementDetails,
                cpId,
            }

            await dispatch(createRequirement(requirementData)).unwrap()

            // Success - reset form and close modal
            resetForm()
            onClose()
        } catch (error: any) {
            setErrorMessage(error || 'Failed to create requirement')
        }
    }

    if (!isOpen) return null

    return (
        <>
            <div className='fixed top-0 left-0 w-[70%] h-full bg-black opacity-50 z-40' onClick={onClose} />

            <div className='fixed right-0 top-0 h-full w-[30%] bg-white z-50 shadow-lg flex flex-col'>
                {/* Header */}
                <div className='p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0'>
                    <h2 className='text-xl font-semibold text-gray-900'>Requirements</h2>
                    <button onClick={onClose} className='bg-gray-100 p-2 rounded-3xl cursor-pointer'>
                        <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                            />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className='overflow-y-auto p-4 flex-1 space-y-4'>
                    <PlacesSearch
                        selectedPlace={selectedPlace}
                        setSelectedPlace={setSelectedPlace}
                        placeholder='Search for project name or location...'
                        label='Project Name/Location'
                        required={true}
                    />

                    <div>
                        <label className='block text-sm py-2'>
                            Asset Type <span className='text-red-500'>*</span>
                        </label>
                        <select
                            value={assetType}
                            onChange={(e) => setAssetType(e.target.value)}
                            className='mt-1 w-full p-1 border-2 border-gray-300 rounded-sx rounded text-[14px] text'
                        >
                            <option value='' disabled>
                                Select
                            </option>
                            <option value='apartment'>Apartment</option>
                            <option value='villa'>Villa</option>
                            <option value='plot'>Plot</option>
                            <option value='commercial'>Commercial</option>
                            <option value='warehouse'>Warehouse</option>
                            <option value='office'>Office</option>
                        </select>
                    </div>

                    <div className='flex gap-4'>
                        <div className='flex-1'>
                            <label className='block text-sm py-2'>
                                Super Built-up Area <span className='text-red-500'>*</span>
                            </label>
                            <div className='relative mt-1'>
                                <input
                                    type='number'
                                    value={superBuiltUpArea}
                                    onChange={(e) => setSuperBuiltUpArea(e.target.value)}
                                    placeholder='Type'
                                    className='w-full p-1 border-2 border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                                />
                                <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-sm px-3'>
                                    Sq ft
                                </span>
                            </div>
                        </div>

                        <div className='flex-1'>
                            <label className='block text-sm py-2'>
                                Plot Area <span className='text-red-500'>*</span>
                            </label>
                            <div className='relative mt-1'>
                                <input
                                    type='number'
                                    value={plotArea}
                                    onChange={(e) => setPlotArea(e.target.value)}
                                    placeholder='Type'
                                    className='w-full p-1 border-2 border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                                />
                                <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-sm px-3'>
                                    Sq ft
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm mb-1 py-2'>
                            Bedroom <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex gap-2'>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setBedroom(n)}
                                    className={`w-full p-1 border-2 border-gray-300 rounded-lg text-[14px] text-black placeholder-gray-400 ${
                                        bedroom === n ? 'bg-gray-200 border-gray-900' : 'hover:bg-gray-100'
                                    }`}
                                >
                                    {n} BHK
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm py-2'>
                            Budget (INR) <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex gap-2'>
                            <input
                                type='number'
                                value={budgetFrom}
                                onChange={(e) => setBudgetFrom(e.target.value)}
                                placeholder='From'
                                className='w-full p-1 border-2 border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                            />
                            <input
                                type='number'
                                value={budgetTo}
                                onChange={(e) => setBudgetTo(e.target.value)}
                                placeholder='To'
                                className='w-full p-1 border-2 border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                            />
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm py-2'>
                            Builder Category <span className='text-red-500'>*</span>
                        </label>
                        <select
                            value={builderCategory}
                            onChange={(e) => setBuilderCategory(e.target.value)}
                            className='w-full p-1 border-2 border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                        >
                            <option value='' disabled>
                                Select
                            </option>
                            <option value='A'>A</option>
                            <option value='B'>B</option>
                            <option value='C'>C</option>
                            <option value='D'>D</option>
                        </select>
                    </div>

                    <div>
                        <label className='block text-sm py-2'>
                            Preferred Floor <span className='text-red-500'>*</span>
                        </label>
                        <select
                            value={preferredFloor}
                            onChange={(e) => setPreferredFloor(e.target.value)}
                            className='mt-1 w-full p-1 border-2 border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                        >
                            <option value='' disabled>
                                Select
                            </option>
                            <option value='Ground Floor'>Ground Floor</option>
                            <option value='Lower (1-5)'>Lower (1-5)</option>
                            <option value='Middle (6-10)'>Middle (6-10)</option>
                            <option value='Upper (11-15)'>Upper (11-15)</option>
                            <option value='Top Floor'>Top Floor</option>
                        </select>
                    </div>

                    <div>
                        <label className='block text-sm py-2'>
                            Facing <span className='text-red-500'>*</span>
                        </label>
                        <select
                            value={facing}
                            onChange={(e) => setFacing(e.target.value)}
                            className='mt-1 w-full p-1 border-2 border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                        >
                            <option value='' disabled>
                                Select
                            </option>
                            <option value='East'>East</option>
                            <option value='West'>West</option>
                            <option value='North'>North</option>
                            <option value='South'>South</option>
                        </select>
                    </div>

                    <div>
                        <label className='block text-sm py-2'>Requirement Details (Optional)</label>
                        <textarea
                            value={requirementDetails}
                            onChange={(e) => setRequirementDetails(e.target.value)}
                            className='mt-1 w-full h-40 p-1 border-2 border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                            rows={3}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className='p-4 border-t border-gray-200 flex flex-col gap-3 flex-shrink-0'>
                    {(errorMessage || error) && (
                        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm'>
                            {errorMessage || error}
                        </div>
                    )}
                    <div className='flex justify-end gap-3'>
                        <button
                            onClick={resetForm}
                            disabled={loading}
                            className='px-4 py-2 rounded-lg bg-[#F3F3F3] cursor-pointer disabled:opacity-50'
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className='px-4 py-2 bg-blue-600 text-white rounded-lg bg-gray-800 border cursor-pointer disabled:opacity-50'
                        >
                            {loading ? 'Creating...' : 'Submit Requirement'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
