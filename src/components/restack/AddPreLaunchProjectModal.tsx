// src/components/prelaunch/PreLaunchModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import StateBaseTextField from '../design-elements/StateBaseTextField'
import Button from '../design-elements/Button'
import type { ProjectStage } from '../../pages/dummy_data/restack_prelaunch_dummy_data'
import { locations, developers, projectTypes } from '../../pages/dummy_data/restack_prelaunch_dummy_data'
import Dropdown from '../design-elements/Dropdown'
import NumberInput from '../design-elements/StateBaseNumberField'
import DateInput from '../design-elements/DateInputUnixTimestamps'

export interface PreLaunchFormData {
    projectName: string
    projectType: string
    stage: ProjectStage
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
    eoiAmount: number
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

const stages: ProjectStage[] = ['Pre Launch', 'EC']

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
        eoiAmount: 0,
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
                        <label className='block text-sm font-medium mb-1'>Project Name</label>
                        <StateBaseTextField
                            placeholder='Enter'
                            value={form.projectName}
                            onChange={(e) => handleField('projectName', e.target.value)}
                        />
                    </div>

                    {/* Project Type */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Project Type</label>
                        {/* <select
                            className='mt-1 block w-full border border-gray-300 rounded p-2 bg-white'
                            value={form.projectType}
                            onChange={(e) => handleField('projectType', e.target.value)}
                        >
                            <option value=''>Enter</option>
                            {projectTypes.map((pt) => (
                                <option key={pt} value={pt}>
                                    {pt}
                                </option>
                            ))}
                        </select> */}
                        <Dropdown
                            options={projectTypes.map((pt) => ({ label: pt, value: pt }))}
                            defaultValue={form.projectType}
                            onSelect={(value) => handleField('projectType', value)}
                        />
                    </div>

                    {/* Stage */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Stage</label>

                        <Dropdown
                            options={stages.map((pt) => ({ label: pt, value: pt }))}
                            defaultValue={form.stage}
                            onSelect={(value) => handleField('stage', value as ProjectStage)}
                        />
                    </div>

                    {/* Developer/Promoter */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Developer/Promoter</label>
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
                        minDate={new Date().toISOString().split('T')[0]} // Today's date as minimum
                        fullWidth
                    />

                    {/* Proposed Completion Date */}
                    <DateInput
                        label='Proposed Completion Date'
                        placeholder='Select completion date'
                        value={form.proposedCompletionDate}
                        onChange={(timestamp) => handleField('proposedCompletionDate', timestamp ?? 0)}
                        minDate={new Date().toISOString().split('T')[0]} // Today's date as minimum
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

                    {/* EOI Amount (₹)
                    <div>
                        <label className='block text-sm font-medium mb-1'>EOI Amount (₹)</label>
                        <StateBaseTextField
                            placeholder='Enter'
                            value={form.eoiAmount}
                            onChange={(e) => handleField('eoiAmount', e.target.value)}
                        />
                    </div> */}

                    {/* Total No. of Floors */}
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
