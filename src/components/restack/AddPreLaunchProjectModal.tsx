// src/components/prelaunch/PreLaunchModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import StateBaseTextField from '../design-elements/StateBaseTextField'
import Button from '../design-elements/Button'
import type { ProjectStage } from '../../pages/dummy_data/restack_prelaunch_dummy_data'
import { locations, developers, projectTypes } from '../../pages/dummy_data/restack_prelaunch_dummy_data'

export interface PreLaunchFormData {
    projectName: string
    stage: ProjectStage
    tentativeStartDate: string
    location: string
    developer: string
    projectType: string
}

interface PreLaunchModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: PreLaunchFormData) => void
}

const stages: ProjectStage[] = ['Pre Launch', 'EC', 'Under Construction', 'Ready to Move', 'Launched']

const PreLaunchModal: React.FC<PreLaunchModalProps> = ({ isOpen, onClose, onSave }) => {
    const empty: PreLaunchFormData = {
        projectName: '',
        stage: 'Pre Launch',
        tentativeStartDate: '',
        location: '',
        developer: '',
        projectType: '',
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
                        <label className='block text-sm font-medium'>Project Name</label>
                        <StateBaseTextField
                            placeholder='Enter'
                            value={form.projectName}
                            onChange={(e) => handleField('projectName', e.target.value)}
                        />
                    </div>

                    {/* Stage */}
                    <div>
                        <label className='block text-sm font-medium'>Stage</label>
                        <select
                            className='mt-1 block w-full border border-gray-300 rounded p-2'
                            value={form.stage}
                            onChange={(e) => handleField('stage', e.target.value as ProjectStage)}
                        >
                            {stages.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tentative Start Date */}
                    <div>
                        <label className='block text-sm font-medium'>Tentative Start Date</label>
                        <StateBaseTextField
                            type='date'
                            value={form.tentativeStartDate}
                            onChange={(e) => handleField('tentativeStartDate', e.target.value)}
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className='block text-sm font-medium'>Location</label>
                        <select
                            className='mt-1 block w-full border border-gray-300 rounded p-2'
                            value={form.location}
                            onChange={(e) => handleField('location', e.target.value)}
                        >
                            <option value=''>Select</option>
                            {locations.map((loc) => (
                                <option key={loc} value={loc}>
                                    {loc}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Developer */}
                    <div>
                        <label className='block text-sm font-medium'>Developer</label>
                        <select
                            className='mt-1 block w-full border border-gray-300 rounded p-2'
                            value={form.developer}
                            onChange={(e) => handleField('developer', e.target.value)}
                        >
                            <option value=''>Select</option>
                            {developers.map((dev) => (
                                <option key={dev} value={dev}>
                                    {dev}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Project Type */}
                    <div>
                        <label className='block text-sm font-medium'>Project Type</label>
                        <select
                            className='mt-1 block w-full border border-gray-300 rounded p-2'
                            value={form.projectType}
                            onChange={(e) => handleField('projectType', e.target.value)}
                        >
                            <option value=''>Select</option>
                            {projectTypes.map((pt) => (
                                <option key={pt} value={pt}>
                                    {pt}
                                </option>
                            ))}
                        </select>
                    </div>
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
