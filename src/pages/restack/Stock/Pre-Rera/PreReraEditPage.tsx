'use client'

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../../../layout/Layout'
import Button from '../../../../components/design-elements/Button'
import StateBaseTextField from '../../../../components/design-elements/StateBaseTextField'
import { stockData, type StockProject } from '../../../../pages/dummy_data/restack_prerera_dummy_data'

const PreReraProjectEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const originalProject = stockData.find((p) => p.id === id)
    const [project, setProject] = useState<StockProject | null>(originalProject || null)
    const [loading, setLoading] = useState(false)

    if (!project) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center h-64'>
                    <div className='text-center'>
                        <h2 className='text-xl font-semibold text-gray-900 mb-2'>Project Not Found</h2>
                        <p className='text-gray-600 mb-4'>The requested project could not be found.</p>
                        <Button bgColor='bg-blue-600' textColor='text-white' onClick={() => navigate('/restack/stock')}>
                            Back to Stock
                        </Button>
                    </div>
                </div>
            </Layout>
        )
    }

    const handleSave = async () => {
        setLoading(true)
        // Simulate API call
        setTimeout(() => {
            // Update the data in the array (in a real app, this would be an API call)
            const index = stockData.findIndex((p) => p.id === id)
            if (index !== -1) {
                stockData[index] = project
            }
            setLoading(false)
            navigate(`/restack/stock/pre-rera/${id}/details`)
        }, 1000)
    }

    const updateProject = (field: keyof StockProject, value: any) => {
        setProject((prev) => (prev ? { ...prev, [field]: value } : null))
    }

    const updateTower = (index: number, field: 'name' | 'floors', value: string) => {
        if (!project) return
        const newTowers = [...project.towers]
        newTowers[index] = { ...newTowers[index], [field]: value }
        setProject({ ...project, towers: newTowers })
    }

    const addTower = () => {
        if (!project) return
        setProject({
            ...project,
            towers: [...project.towers, { name: '', floors: '' }],
        })
    }

    const removeTower = (index: number) => {
        if (!project) return
        const newTowers = project.towers.filter((_, i) => i !== index)
        setProject({ ...project, towers: newTowers })
    }

    const updateAmenity = (index: number, value: string) => {
        if (!project) return
        const newAmenities = [...project.amenities]
        newAmenities[index] = value
        setProject({ ...project, amenities: newAmenities })
    }

    const addAmenity = () => {
        if (!project) return
        setProject({
            ...project,
            amenities: [...project.amenities, ''],
        })
    }

    const removeAmenity = (index: number) => {
        if (!project) return
        const newAmenities = project.amenities.filter((_, i) => i !== index)
        setProject({ ...project, amenities: newAmenities })
    }

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen'>
                    {/* Header */}
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-4'>
                            <button
                                onClick={() => navigate(`/restack/stock/pre-rera/${id}/details`)}
                                className='flex items-center text-gray-600 hover:text-gray-800'
                            >
                                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M15 19l-7-7 7-7'
                                    />
                                </svg>
                                Back
                            </button>
                            <h1 className='text-xl font-semibold text-gray-900'>{project.projectName}</h1>
                            <span className='text-sm text-gray-500'>Edit</span>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Button
                                bgColor='bg-blue-600'
                                textColor='text-white'
                                className='px-6 py-2'
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>

                    {/* Project Summary Table - Editable */}
                    <div className='bg-white rounded-lg border border-gray-200 mb-6'>
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>Sizes</th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                            Project Size
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                            Launch Date
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                            Possession Starts
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                            Configurations
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                                            RERA ID
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className='border-t border-gray-200'>
                                        <td className='px-4 py-3'>
                                            <StateBaseTextField
                                                value={project.sizes}
                                                onChange={(e) => updateProject('sizes', e.target.value)}
                                                className='w-full'
                                            />
                                        </td>
                                        <td className='px-4 py-3'>
                                            <StateBaseTextField
                                                value={project.projectSize}
                                                onChange={(e) => updateProject('projectSize', e.target.value)}
                                                className='w-full'
                                            />
                                        </td>
                                        <td className='px-4 py-3'>
                                            <StateBaseTextField
                                                value={project.launchDate}
                                                onChange={(e) => updateProject('launchDate', e.target.value)}
                                                className='w-full'
                                            />
                                        </td>
                                        <td className='px-4 py-3'>
                                            <StateBaseTextField
                                                value={project.possessionStarts}
                                                onChange={(e) => updateProject('possessionStarts', e.target.value)}
                                                className='w-full'
                                            />
                                        </td>
                                        <td className='px-4 py-3'>
                                            <StateBaseTextField
                                                value={project.configurations}
                                                onChange={(e) => updateProject('configurations', e.target.value)}
                                                className='w-full'
                                            />
                                        </td>
                                        <td className='px-4 py-3'>
                                            <StateBaseTextField
                                                value={project.reraId}
                                                onChange={(e) => updateProject('reraId', e.target.value)}
                                                className='w-full'
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Description */}
                    <div className='mb-6'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Description</label>
                        <textarea
                            value={project.description}
                            onChange={(e) => updateProject('description', e.target.value)}
                            rows={4}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>

                    {/* Project Images */}
                    <div className='mb-8'>
                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Project Images</h3>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            {project.images.map((image, index) => (
                                <div
                                    key={index}
                                    className='aspect-video bg-gray-200 rounded-lg overflow-hidden relative'
                                >
                                    <div className='w-full h-full flex items-center justify-center text-gray-500'>
                                        Project Image {index + 1}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newImages = project.images.filter((_, i) => i !== index)
                                            updateProject('images', newImages)
                                        }}
                                        className='absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600'
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() =>
                                    updateProject('images', [...project.images, 'https://example.com/new-image.jpg'])
                                }
                                className='aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-gray-400'
                            >
                                + Add Image
                            </button>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                        {/* Project Location */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Location</h2>
                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
                                    <StateBaseTextField
                                        value={project.address}
                                        onChange={(e) => updateProject('address', e.target.value)}
                                        className='w-full'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>District</label>
                                    <StateBaseTextField
                                        value={project.district}
                                        onChange={(e) => updateProject('district', e.target.value)}
                                        className='w-full'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Zone</label>
                                    <StateBaseTextField
                                        value={project.zone}
                                        onChange={(e) => updateProject('zone', e.target.value)}
                                        className='w-full'
                                    />
                                </div>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>Latitude</label>
                                        <StateBaseTextField
                                            value={project.latitude}
                                            onChange={(e) => updateProject('latitude', e.target.value)}
                                            className='w-full'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Longitude
                                        </label>
                                        <StateBaseTextField
                                            value={project.longitude}
                                            onChange={(e) => updateProject('longitude', e.target.value)}
                                            className='w-full'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Timeline */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Timeline</h2>
                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Project Start Date
                                    </label>
                                    <StateBaseTextField
                                        value={project.projectStartDate}
                                        onChange={(e) => updateProject('projectStartDate', e.target.value)}
                                        type='date'
                                        className='w-full'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Handover Date
                                    </label>
                                    <StateBaseTextField
                                        value={project.handoverDate}
                                        onChange={(e) => updateProject('handoverDate', e.target.value)}
                                        className='w-full'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Age of Building
                                    </label>
                                    <StateBaseTextField
                                        value={project.ageOfBuildingYears}
                                        onChange={(e) => updateProject('ageOfBuildingYears', e.target.value)}
                                        className='w-full'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8'>
                        {/* Project Configuration */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Configuration</h2>
                            <div className='space-y-4 mb-6'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Total Units</label>
                                    <StateBaseTextField
                                        value={project.totalUnits}
                                        onChange={(e) => updateProject('totalUnits', e.target.value)}
                                        className='w-full'
                                    />
                                </div>
                            </div>

                            <div className='bg-gray-50 rounded-lg p-4'>
                                <div className='flex justify-between items-center mb-4'>
                                    <h3 className='font-medium text-gray-700'>Towers</h3>
                                    <Button
                                        bgColor='bg-blue-600'
                                        textColor='text-white'
                                        className='px-3 py-1 text-sm'
                                        onClick={addTower}
                                    >
                                        Add Tower
                                    </Button>
                                </div>
                                <div className='space-y-3'>
                                    {project.towers.map((tower, index) => (
                                        <div key={index} className='grid grid-cols-2 gap-2 items-center'>
                                            <StateBaseTextField
                                                value={tower.name}
                                                onChange={(e) => updateTower(index, 'name', e.target.value)}
                                                placeholder='Tower name'
                                                className='w-full'
                                            />
                                            <div className='flex gap-2'>
                                                <StateBaseTextField
                                                    value={tower.floors}
                                                    onChange={(e) => updateTower(index, 'floors', e.target.value)}
                                                    placeholder='Floors'
                                                    className='w-full'
                                                />
                                                <button
                                                    onClick={() => removeTower(index)}
                                                    className='text-red-500 hover:text-red-700 px-2'
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Developer Details */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Developer Details</h2>
                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Developer Name
                                    </label>
                                    <StateBaseTextField
                                        value={project.developerName}
                                        onChange={(e) => updateProject('developerName', e.target.value)}
                                        className='w-full'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Legal Name</label>
                                    <StateBaseTextField
                                        value={project.legalName}
                                        onChange={(e) => updateProject('legalName', e.target.value)}
                                        className='w-full'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Developer Tier
                                    </label>
                                    <select
                                        value={project.developerTier}
                                        onChange={(e) => updateProject('developerTier', e.target.value)}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    >
                                        <option value='Tier 1'>Tier 1</option>
                                        <option value='Tier 2'>Tier 2</option>
                                        <option value='Tier 3'>Tier 3</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Khata Type</label>
                                    <select
                                        value={project.khataType}
                                        onChange={(e) => updateProject('khataType', e.target.value)}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    >
                                        <option value='A'>A</option>
                                        <option value='B'>B</option>
                                        <option value='C'>C</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className='mt-8'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-lg font-semibold text-gray-900'>Amenities</h2>
                            <Button
                                bgColor='bg-blue-600'
                                textColor='text-white'
                                className='px-3 py-1 text-sm'
                                onClick={addAmenity}
                            >
                                Add Amenity
                            </Button>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {project.amenities.map((amenity, index) => (
                                <div key={index} className='flex gap-2'>
                                    <StateBaseTextField
                                        value={amenity}
                                        onChange={(e) => updateAmenity(index, e.target.value)}
                                        className='flex-1'
                                        placeholder='Enter amenity'
                                    />
                                    <button
                                        onClick={() => removeAmenity(index)}
                                        className='text-red-500 hover:text-red-700 px-2'
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PreReraProjectEdit
