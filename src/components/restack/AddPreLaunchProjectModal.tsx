import React, { useState, useEffect } from 'react'
import StateBaseTextField from '../design-elements/StateBaseTextField'
import Button from '../design-elements/Button'
import Dropdown from '../design-elements/Dropdown'
import NumberInput from '../design-elements/StateBaseNumberField'
import DateInput from '../design-elements/DateInputUnixTimestamps'

export interface PreLaunchFormData {
    projectName: string
    projectType: string
    stage: string
    developerName: string
    projectSize: number
    pricePerSqft: number
    tentativeStartDate: number
    proposedCompletionDate: number
    address: string
    map: string
    latitude: number
    longitude: number
    totalUnits: number
    totalFloors: number
    numberOfTowers: number
    carParking: number
    openSpace: number
}

interface PreLaunchModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: PreLaunchFormData) => void
}

const stages = ['Pre Launch', 'EC']
const projectTypes = ['Apartment', 'Villa', 'Plot']

const PreLaunchModal: React.FC<PreLaunchModalProps> = ({ isOpen, onClose, onSave }) => {
    const empty: PreLaunchFormData = {
        projectName: '',
        projectType: '',
        stage: 'Pre Launch',
        developerName: '',
        projectSize: 0,
        pricePerSqft: 0,
        tentativeStartDate: 0,
        proposedCompletionDate: 0,
        address: '',
        map: '',
        latitude: 0,
        longitude: 0,
        totalUnits: 0,
        totalFloors: 0,
        numberOfTowers: 0,
        carParking: 0,
        openSpace: 0,
    }

    const [form, setForm] = useState<PreLaunchFormData>(empty)

    // Reset form whenever we open
    useEffect(() => {
        if (isOpen) setForm(empty)
    }, [isOpen])

    const handleField = <K extends keyof PreLaunchFormData>(key: K, value: PreLaunchFormData[K]) =>
        setForm((f) => ({ ...f, [key]: value }))

    const handleSave = () => {
        onSave(form)
    }

    const handleClear = () => {
        setForm(empty)
    }

    if (!isOpen) return null

    return (
        <div className='fixed top-0 right-0 h-screen w-2/5 bg-white shadow-xl overflow-y-auto z-50'>
            <div className='p-6'>
                {/* Header */}
                <div className='flex justify-between items-center mb-6'>
                    <h2 className='text-lg font-semibold'>Add Pre-Launch Project</h2>
                    <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
                        ✕
                    </button>
                </div>

                {/* Form Grid */}
                <div className='grid grid-cols-2 gap-4'>
                    {/* Project Name */}
                    <div>
                        {/* <label className='block text-sm font-medium mb-1'>Project Name</label> */}
                        <StateBaseTextField
                            placeholder='Enter'
                            value={form.projectName}
                            onChange={(e) => handleField('projectName', e.target.value)}
                            label='Project Name'
                            required={true}
                        />
                    </div>

                    {/* Project Type */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Project Type</label>
                        <Dropdown
                            options={projectTypes.map((pt) => ({ label: pt, value: pt }))}
                            defaultValue={form.projectType}
                            onSelect={(value) => handleField('projectType', value.toLocaleLowerCase())}
                            triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            menuClassName='absolute z-50 mt-1 top-7 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                            optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                        />
                    </div>

                    {/* Stage */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Stage</label>

                        <Dropdown
                            options={stages.map((pt) => ({ label: pt, value: pt }))}
                            defaultValue={form.stage}
                            onSelect={(value) => handleField('stage', value)}
                            triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            menuClassName='absolute z-50 mt-1 top-7 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                            optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                        />
                    </div>

                    {/* Developer/Promoter */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Developer/Promoter Name</label>
                        <StateBaseTextField
                            placeholder='Type'
                            value={form.developerName}
                            onChange={(e) => handleField('developerName', e.target.value)}
                        />
                    </div>

                    {/* Project Size (acres) */}

                    <NumberInput
                        label='Project Size (acres)'
                        placeholder='Enter Project Size in acres'
                        value={form.projectSize}
                        onChange={(value) => handleField('projectSize', value ?? 0)}
                        numberType='integer'
                        fullWidth
                    />

                    {/* Price (per sqft) */}
                    <NumberInput
                        label='Price (per sqft)'
                        placeholder='Enter Price  in per sqft'
                        value={form.pricePerSqft}
                        onChange={(value) => handleField('pricePerSqft', value ?? 0)}
                        numberType='integer'
                        fullWidth
                    />

                    {/* Tentative Start Date */}
                    <DateInput
                        label='Tentative Start Date'
                        placeholder='Select start date'
                        value={form.tentativeStartDate}
                        onChange={(timestamp) => handleField('tentativeStartDate', timestamp ?? 0)}
                        // minDate={new Date().toISOString().split('T')[0]} // Today's date as minimum
                        fullWidth
                    />

                    {/* Proposed Completion Date */}
                    <DateInput
                        label='Proposed Completion Date'
                        placeholder='Select completion date'
                        value={form.proposedCompletionDate}
                        onChange={(timestamp) => handleField('proposedCompletionDate', timestamp ?? 0)}
                        fullWidth
                    />

                    {/* Address */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Address</label>
                        <StateBaseTextField
                            placeholder='Enter'
                            value={form.address}
                            onChange={(e) => handleField('address', e.target.value)}
                        />
                    </div>

                    {/* Map */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Map</label>
                        <StateBaseTextField
                            placeholder='Enter'
                            value={form.map}
                            onChange={(e) => handleField('map', e.target.value)}
                        />
                    </div>

                    {/* Latitude */}
                    <NumberInput
                        label='Latitude'
                        placeholder='Enter latitude'
                        value={form.latitude}
                        onChange={(value) => handleField('latitude', value ?? 0)}
                        numberType='decimal'
                        decimalPlaces={6}
                        min={-90}
                        max={90}
                        step={0.000001}
                        allowNegative={true}
                        fullWidth
                    />

                    {/* Longitude */}
                    <NumberInput
                        label='Longitude'
                        placeholder='Enter longitude'
                        value={form.longitude}
                        onChange={(value) => handleField('longitude', value ?? 0)}
                        numberType='decimal'
                        decimalPlaces={6}
                        min={-180}
                        max={180}
                        step={0.000001}
                        allowNegative={true}
                        fullWidth
                    />

                    {/* Total Units */}

                    <NumberInput
                        label='Total Units'
                        placeholder='Enter number of units'
                        value={form.totalUnits}
                        onChange={(value) => handleField('totalUnits', value ?? 0)}
                        numberType='integer'
                        min={1}
                        max={1000}
                        step={1}
                        showControls={true}
                        fullWidth
                    />

                    <NumberInput
                        label='Total No. of Floors'
                        placeholder='Enter number of floors'
                        value={form.totalFloors}
                        onChange={(value) => handleField('totalFloors', value ?? 0)}
                        numberType='integer'
                        min={1}
                        max={200}
                        step={1}
                        showControls={true}
                        fullWidth
                    />

                    {/* No. of Towers */}
                    <NumberInput
                        label='No. of Towers'
                        placeholder='Enter number of towers'
                        value={form.numberOfTowers}
                        onChange={(value) => handleField('numberOfTowers', value ?? 0)}
                        numberType='integer'
                        min={1}
                        max={50}
                        step={1}
                        showControls={true}
                        fullWidth
                    />

                    {/* Car Parking */}
                    <NumberInput
                        label='Car Parking'
                        placeholder='Enter parking spaces'
                        value={form.carParking}
                        onChange={(value) => handleField('carParking', value ?? 0)}
                        numberType='integer'
                        min={0}
                        max={10000}
                        step={1}
                        showControls={true}
                        fullWidth
                    />

                    {/* Open Space */}
                    <NumberInput
                        label='Open Space'
                        placeholder='Enter open space area'
                        value={form.openSpace}
                        onChange={(value) => handleField('openSpace', value ?? 0)}
                        numberType='decimal'
                        decimalPlaces={2}
                        min={0}
                        step={0.1}
                        fullWidth
                    />
                </div>

                {/* Footer */}
                <div className='mt-8 flex justify-end gap-3'>
                    <Button bgColor='bg-gray-200' textColor='text-gray-700' onClick={handleClear}>
                        Clear
                    </Button>
                    <Button bgColor='bg-blue-600' textColor='text-white' onClick={handleSave}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default PreLaunchModal
