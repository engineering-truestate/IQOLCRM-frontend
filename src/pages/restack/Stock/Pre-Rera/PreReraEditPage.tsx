'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../../../layout/Layout'
import Button from '../../../../components/design-elements/Button'
import StateBaseTextField from '../../../../components/design-elements/StateBaseTextField'
import DateInput from '../../../../components/design-elements/DateInputUnixTimestamps'
import usePreRera from '../../../../hooks/restack/usePreRera'
import type { PreReraProperty } from '../../../../store/reducers/restack/preReraTypes'
import { getStorage, ref, getDownloadURL, deleteObject } from 'firebase/storage'
import { toast } from 'react-toastify'
import Dropdown from '../../../../components/design-elements/Dropdown'

const options = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'mixed-use', label: 'Mixed-use' },
    { value: 'plotted', label: 'Plotted' },
]

const PreReraProjectEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [project, setProject] = useState<PreReraProperty | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setSaving] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [previewFile, setPreviewFile] = useState<string | null>(null)
    const storage = getStorage()
    const maxSizeMB = 10
    const maxFiles = 10

    const { getPropertyById, updateProperty, loading, error } = usePreRera()

    useEffect(() => {
        const fetchProjectById = async () => {
            if (!id) {
                setFetchError('No project ID provided')
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setFetchError(null)

                // Fetch the specific property by ID
                const result = await getPropertyById(id)

                if (result.payload && typeof result.payload === 'object' && 'projectId' in result.payload) {
                    setProject(result.payload as PreReraProperty)
                } else {
                    setFetchError('Property not found')
                }
            } catch (err) {
                console.error('Error fetching project:', err)
                setFetchError(err instanceof Error ? err.message : 'Failed to fetch project')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProjectById()
    }, [id, getPropertyById])

    // Show loading state
    if (isLoading || loading) {
        return (
            <Layout loading={true}>
                <div className='flex items-center justify-center h-64'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                        <p className='text-gray-600'>Loading project for editing...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    // Show error state
    if (fetchError || error || !project) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center h-64'>
                    <div className='text-center'>
                        <h2 className='text-xl font-semibold text-gray-900 mb-2'>Project Not Found</h2>
                        <p className='text-gray-600 mb-4'>
                            {fetchError || error || 'The requested project could not be found.'}
                        </p>
                        <Button bgColor='bg-blue-600' textColor='text-white' onClick={() => navigate('/restack/stock')}>
                            Back to Stock
                        </Button>
                    </div>
                </div>
            </Layout>
        )
    }

    const handleSave = async () => {
        if (!project || !id) return

        try {
            setSaving(true)

            // Update the property using the service
            await updateProperty(id, project)

            // Navigate back to details page
            navigate(`/restack/stock/pre-rera/${id}/details`)
        } catch (err) {
            console.error('Error saving project:', err)
            // You might want to show an error message to the user here
        } finally {
            setSaving(false)
        }
    }

    const updateProject = (field: keyof PreReraProperty, value: any) => {
        setProject((prev) => (prev ? { ...prev, [field]: value } : null))
    }

    const updateTower = (index: number, field: 'name' | 'floors', value: string | number) => {
        if (!project) return
        const newTowers = [...project.TowerDetails]
        newTowers[index] = {
            ...newTowers[index],
            [field]: field === 'floors' ? Number(value) : value,
        }
        setProject({ ...project, TowerDetails: newTowers })
    }

    const addTower = () => {
        if (!project) return
        setProject({
            ...project,
            TowerDetails: [...project.TowerDetails, { name: '', floors: 0 }],
        })
    }

    const removeTower = (index: number) => {
        if (!project) return
        const newTowers = project.TowerDetails.filter((_, i) => i !== index)
        setProject({ ...project, TowerDetails: newTowers })
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

    const updateResourceURL = (
        field: 'brochureURL' | 'masterPlanURL' | 'unitandfloorURL',
        index: number,
        value: string,
    ) => {
        if (!project) return
        const newURLs = [...project[field]]
        newURLs[index] = value
        setProject({ ...project, [field]: newURLs })
    }

    const addResourceURL = (field: 'brochureURL' | 'masterPlanURL' | 'unitandfloorURL') => {
        if (!project) return
        setProject({
            ...project,
            [field]: [...project[field], ''],
        })
    }

    const removeResourceURL = (field: 'brochureURL' | 'masterPlanURL' | 'unitandfloorURL', index: number) => {
        if (!project) return
        const newURLs = project[field].filter((_, i) => i !== index)
        setProject({ ...project, [field]: newURLs })
    }

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragOver(false)
        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            handleFiles(files)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            handleFiles(files)
        }
        e.target.value = ''
    }

    // Validate file type and size
    const validateFile = (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
        const maxSizeBytes = maxSizeMB * 1024 * 1024

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `File type not supported. Please upload images (JPEG, PNG, GIF, WebP) or PDF files.`,
            }
        }

        if (file.size > maxSizeBytes) {
            return {
                valid: false,
                error: `File "${file.name}" is too large. Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB. Maximum allowed: ${maxSizeMB} MB.`,
            }
        }

        return { valid: true }
    }

    // Handle multiple files
    const handleFiles = async (files: File[]) => {
        if (project?.images && project.images.length + files.length > maxFiles) {
            toast.error(
                `Maximum ${maxFiles} files allowed. You can upload ${maxFiles - project.images.length} more files.`,
            )
            return
        }

        setUploading(true)
        const newFiles = []

        for (const file of files) {
            const validation = validateFile(file)
            if (!validation.valid) {
                toast.error(validation.error)
                continue
            }

            try {
                // Upload to Firebase Storage
                const fileName = `${Date.now()}_${file.name}`
                const storageRef = ref(storage, `prereraImages/${project.projectId}/${fileName}`)

                console.log(`Uploading file: ${file.name}`)
                // const uploadResult = await uploadBytes(storageRef, file)

                // Get download URL
                const downloadURL = await getDownloadURL(storageRef)

                newFiles.push(downloadURL)
                console.log(`Successfully uploaded: ${file.name}`)
            } catch (error) {
                console.error(`Error uploading file ${file.name}:`, error)
                toast.error(`Failed to upload ${file.name}. Please try again.`)
            }
        }

        if (newFiles.length > 0) {
            // Call the parent component's handler with all uploaded files
            updateProject('images', [...(project?.images || []), ...newFiles])
            toast.success(`Successfully uploaded ${newFiles.length} file(s)`)
        }

        setUploading(false)
    }

    // Delete file from storage and state
    const handleDeleteFile = async (fileToDelete: string) => {
        try {
            // Extract filename from URL for Firebase deletion
            // Use the full fileToDelete URL as the reference
            const fileRef = ref(storage, fileToDelete)
            await deleteObject(fileRef)

            // Remove from state
            const updatedFiles = project?.images?.filter((file) => file !== fileToDelete) || []
            updateProject('images', updatedFiles)

            toast.success('File deleted successfully')
            console.log(`Successfully deleted: ${fileToDelete}`)
        } catch (error) {
            console.error('Error deleting file:', error)
            toast.error('Failed to delete file. Please try again.')
        }
    }

    // Preview file
    const handlePreview = (file: string) => {
        setPreviewFile(file)
    }

    // Close preview
    const closePreview = () => {
        setPreviewFile(null)
    }

    // Get file type from URL
    const getFileTypeFromUrl = (url: string) => {
        const extension = url.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
            return 'image'
        } else if (extension === 'pdf') {
            return 'pdf'
        }
        return 'unknown'
    }

    // Get file icon based on type
    const getFileIcon = (url: string) => {
        const fileType = getFileTypeFromUrl(url)
        if (fileType === 'image') {
            return '🖼️'
        } else if (fileType === 'pdf') {
            return '📄'
        }
        return '📎'
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
                            <h1 className='text-xl font-semibold text-gray-900'>
                                {project.projectName || 'Untitled Project'}
                            </h1>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Button
                                bgColor='bg-blue-600'
                                textColor='text-white'
                                className='px-6 py-2'
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save'}
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
                                                value={project.sizes || ''}
                                                onChange={(e) => updateProject('sizes', e.target.value)}
                                                className='w-full'
                                                placeholder='e.g., 1200-1800 sq ft'
                                            />
                                        </td>
                                        <td className='px-4 py-3'>
                                            <StateBaseTextField
                                                value={project.projectSize || ''}
                                                onChange={(e) => updateProject('projectSize', e.target.value)}
                                                className='w-full'
                                                placeholder='e.g., 5 Acres'
                                            />
                                        </td>
                                        <td className='px-4 py-3'>
                                            <DateInput
                                                placeholder='Select launch date'
                                                value={project.launchDate || 0}
                                                onSelect={(e) =>
                                                    updateProject(
                                                        'launchDate',
                                                        Math.floor(
                                                            new Date((e.target as HTMLInputElement).value).getTime() /
                                                                1000,
                                                        ),
                                                    )
                                                }
                                                fullWidth
                                            />
                                        </td>
                                        <td className='px-4 py-3'>
                                            <StateBaseTextField
                                                value={project.possessionStarts || ''}
                                                onChange={(e) => updateProject('possessionStarts', e.target.value)}
                                                className='w-full'
                                                placeholder='e.g., 2024'
                                            />
                                        </td>
                                        <td className='px-4 py-3'>
                                            <StateBaseTextField
                                                value={project.configurations || ''}
                                                onChange={(e) => updateProject('configurations', e.target.value)}
                                                className='w-full'
                                                placeholder='e.g., 2, 3 BHK'
                                            />
                                        </td>
                                        <td className='px-4 py-3'>
                                            <StateBaseTextField
                                                value={project.reraId || ''}
                                                onChange={(e) => updateProject('reraId', e.target.value)}
                                                className='w-full'
                                                placeholder='e.g., PRM/KA/R/2021/12/234'
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Basic Project Information */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Project Name</label>
                            <StateBaseTextField
                                value={project.projectName || ''}
                                onChange={(e) => updateProject('projectName', e.target.value)}
                                className='w-full'
                                placeholder='Enter project name'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Project Type</label>
                            <Dropdown
                                options={options}
                                onSelect={(selectedValue) => updateProject('projectType', selectedValue)}
                                defaultValue={project.projectType || ''}
                                placeholder='Select project type'
                                className='relative w-full'
                                triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Total Units</label>
                            <StateBaseTextField
                                value={project.totalUnits?.toString() || ''}
                                onChange={(e) => updateProject('totalUnits', Number(e.target.value) || 0)}
                                className='w-full'
                                placeholder='Enter total units'
                                type='number'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Status</label>
                            <Dropdown
                                options={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'on-hold', label: 'On Hold' },
                                    { value: 'sold-out', label: 'Sold Out' },
                                ]}
                                onSelect={(selectedValue) => updateProject('status', selectedValue)}
                                defaultValue={project.status || ''}
                                placeholder='Select status'
                                className='relative w-full'
                                triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className='mb-6'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Description</label>
                        <textarea
                            value={project.description || ''}
                            onChange={(e) => updateProject('description', e.target.value)}
                            rows={4}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='Enter project description'
                        />
                    </div>

                    {/* PROJECT IMAGES UPLOAD SECTION */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Images</h2>

                        {/* File Upload Area */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className='space-y-4'>
                                <div className='text-4xl'>📁</div>
                                <div>
                                    <p className='text-lg font-medium text-gray-900'>
                                        {uploading ? 'Uploading files...' : 'Drop your files here'}
                                    </p>
                                    <p className='text-sm text-gray-500 mt-1'>or click to browse your files</p>
                                </div>
                                <div className='text-xs text-gray-400'>
                                    <p>Supported formats: JPEG, PNG, GIF, WebP, PDF</p>
                                    <p>
                                        Maximum file size: {maxSizeMB}MB | Maximum files: {maxFiles}
                                    </p>
                                    <p>
                                        Current files: {project?.images?.length || 0}/{maxFiles}
                                    </p>
                                </div>
                                <input
                                    type='file'
                                    multiple
                                    accept='.jpg,.jpeg,.png,.gif,.webp,.pdf'
                                    onChange={handleFileSelect}
                                    className='hidden'
                                    id='file-upload'
                                    disabled={uploading}
                                />
                                <label
                                    htmlFor='file-upload'
                                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
                                        uploading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {uploading ? (
                                        <>
                                            <svg
                                                className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                                                xmlns='http://www.w3.org/2000/svg'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                            >
                                                <circle
                                                    className='opacity-25'
                                                    cx='12'
                                                    cy='12'
                                                    r='10'
                                                    stroke='currentColor'
                                                    strokeWidth='4'
                                                ></circle>
                                                <path
                                                    className='opacity-75'
                                                    fill='currentColor'
                                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                ></path>
                                            </svg>
                                            Uploading...
                                        </>
                                    ) : (
                                        'Choose Files'
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Uploaded Files Display */}
                        {project?.images && project.images.length > 0 && (
                            <div className='mt-6'>
                                <h3 className='text-md font-medium text-gray-900 mb-3'>
                                    Uploaded Images ({project.images.length})
                                </h3>
                                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                                    {project.images.map((imageUrl, index) => (
                                        <div key={index} className='relative group'>
                                            <div className='aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50'>
                                                {getFileTypeFromUrl(imageUrl) === 'image' ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Project image ${index + 1}`}
                                                        className='w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity'
                                                        onClick={() => handlePreview(imageUrl)}
                                                    />
                                                ) : (
                                                    <div className='w-full h-full flex flex-col items-center justify-center text-gray-500'>
                                                        <div className='text-2xl mb-1'>{getFileIcon(imageUrl)}</div>
                                                        <div className='text-xs text-center px-1'>
                                                            {getFileTypeFromUrl(imageUrl).toUpperCase()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action buttons */}
                                            <div className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                                <div className='flex gap-1'>
                                                    {getFileTypeFromUrl(imageUrl) === 'image' && (
                                                        <button
                                                            onClick={() => handlePreview(imageUrl)}
                                                            className='p-1 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-600 hover:text-blue-600'
                                                            title='Preview'
                                                        >
                                                            <svg
                                                                className='w-4 h-4'
                                                                fill='none'
                                                                stroke='currentColor'
                                                                viewBox='0 0 24 24'
                                                            >
                                                                <path
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                    strokeWidth={2}
                                                                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                                                />
                                                                <path
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                    strokeWidth={2}
                                                                    d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteFile(imageUrl)}
                                                        className='p-1 bg-white rounded-full shadow-md hover:bg-red-50 text-gray-600 hover:text-red-600'
                                                        title='Delete'
                                                    >
                                                        <svg
                                                            className='w-4 h-4'
                                                            fill='none'
                                                            stroke='currentColor'
                                                            viewBox='0 0 24 24'
                                                        >
                                                            <path
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                                strokeWidth={2}
                                                                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Image Preview Modal */}
                    {previewFile && (
                        <div
                            className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
                            onClick={closePreview}
                        >
                            <div className='relative max-w-4xl max-h-full p-4'>
                                <img
                                    src={previewFile}
                                    alt='Preview'
                                    className='max-w-full max-h-full object-contain'
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                    onClick={closePreview}
                                    className='absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2'
                                >
                                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M6 18L18 6M6 6l12 12'
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className='grid grid-cols-1 lg:grid-cols-1 gap-8'>
                        {/* Project Location */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Location</h2>
                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
                                    <StateBaseTextField
                                        value={project.address || ''}
                                        onChange={(e) => updateProject('address', e.target.value)}
                                        className='w-full'
                                        placeholder='Enter full address'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>District</label>
                                    <StateBaseTextField
                                        value={project.district || ''}
                                        onChange={(e) => updateProject('district', e.target.value)}
                                        className='w-full'
                                        placeholder='Enter district'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Micromarket</label>
                                    <StateBaseTextField
                                        value={project.micromarket || ''}
                                        onChange={(e) => updateProject('micromarket', e.target.value)}
                                        className='w-full'
                                        placeholder='Enter micromarket'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Zone</label>
                                    <Dropdown
                                        options={[
                                            { value: 'Central', label: 'Central' },
                                            { value: 'North', label: 'North' },
                                            { value: 'South', label: 'South' },
                                            { value: 'East', label: 'East' },
                                            { value: 'West', label: 'West' },
                                        ]}
                                        onSelect={(selectedValue) => updateProject('zone', selectedValue)}
                                        defaultValue={project.zone || ''}
                                        placeholder='Select zone'
                                        className='relative w-full'
                                        triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                        optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                    />
                                </div>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>Latitude</label>
                                        <StateBaseTextField
                                            value={project.lat?.toString() || ''}
                                            onChange={(e) => updateProject('lat', Number(e.target.value) || 0)}
                                            className='w-full'
                                            placeholder='e.g., 12.9716'
                                            type='number'
                                            step='any'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Longitude
                                        </label>
                                        <StateBaseTextField
                                            value={project.long?.toString() || ''}
                                            onChange={(e) => updateProject('long', Number(e.target.value) || 0)}
                                            className='w-full'
                                            placeholder='e.g., 77.5946'
                                            type='number'
                                            step='any'
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
                                    <DateInput
                                        label='Project Start Date'
                                        placeholder='Select start date'
                                        value={project.startDate || 0}
                                        onSelect={(e) =>
                                            updateProject(
                                                'startDate',
                                                Math.floor(
                                                    new Date((e.target as HTMLInputElement).value).getTime() / 1000,
                                                ),
                                            )
                                        }
                                        fullWidth
                                    />
                                </div>
                                <div>
                                    <DateInput
                                        label='Handover Date'
                                        placeholder='Select handover date'
                                        value={project.handoverDate || 0}
                                        onSelect={(e) =>
                                            updateProject(
                                                'handoverDate',
                                                Math.floor(
                                                    new Date((e.target as HTMLInputElement).value).getTime() / 1000,
                                                ),
                                            )
                                        }
                                        fullWidth
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Age of Building (Years)
                                    </label>
                                    <StateBaseTextField
                                        value={project.ageOfBuildinginYears?.toString() || ''}
                                        onChange={(e) =>
                                            updateProject('ageOfBuildinginYears', Number(e.target.value) || 0)
                                        }
                                        className='w-full'
                                        placeholder='Enter age in years'
                                        type='number'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col gap-8 mt-8'>
                        {/* Project Configuration */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Configuration</h2>

                            <div className='bg-gray-50 rounded-lg p-4'>
                                <div className='flex justify-between items-center mb-4'>
                                    <h3 className='font-medium text-gray-700'>Tower Details</h3>
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
                                    {project.TowerDetails &&
                                        project.TowerDetails.map((tower, index) => (
                                            <div key={index} className='grid grid-cols-2 gap-2 items-center'>
                                                <StateBaseTextField
                                                    value={tower.name || ''}
                                                    onChange={(e) => updateTower(index, 'name', e.target.value)}
                                                    placeholder='Tower name'
                                                    className='w-full'
                                                    fullWidth={true}
                                                />
                                                <div className='flex gap-2'>
                                                    <StateBaseTextField
                                                        value={tower.floors?.toString() || ''}
                                                        onChange={(e) => updateTower(index, 'floors', e.target.value)}
                                                        placeholder='Floors'
                                                        className='w-full'
                                                        fullWidth={true}
                                                        type='number'
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

                        {/* Project Resources */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Resources</h2>

                            {/* Brochure URLs */}
                            <div className='mb-6'>
                                <div className='flex justify-between items-center mb-2'>
                                    <label className='block text-sm font-medium text-gray-700'>Brochure URLs</label>
                                    <Button
                                        bgColor='bg-blue-600'
                                        textColor='text-white'
                                        className='px-3 py-1 text-sm'
                                        onClick={() => addResourceURL('brochureURL')}
                                    >
                                        Add URL
                                    </Button>
                                </div>
                                <div className='space-y-2'>
                                    {project.brochureURL &&
                                        project.brochureURL.map((url, index) => (
                                            <div key={index} className='flex gap-2'>
                                                <StateBaseTextField
                                                    value={url || ''}
                                                    onChange={(e) =>
                                                        updateResourceURL('brochureURL', index, e.target.value)
                                                    }
                                                    className='flex-1'
                                                    placeholder='Enter brochure URL'
                                                />
                                                <button
                                                    onClick={() => removeResourceURL('brochureURL', index)}
                                                    className='text-red-500 hover:text-red-700 px-2'
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Master Plan URLs */}
                            <div className='mb-6'>
                                <div className='flex justify-between items-center mb-2'>
                                    <label className='block text-sm font-medium text-gray-700'>Master Plan URLs</label>
                                    <Button
                                        bgColor='bg-blue-600'
                                        textColor='text-white'
                                        className='px-3 py-1 text-sm'
                                        onClick={() => addResourceURL('masterPlanURL')}
                                    >
                                        Add URL
                                    </Button>
                                </div>
                                <div className='space-y-2'>
                                    {project.masterPlanURL &&
                                        project.masterPlanURL.map((url, index) => (
                                            <div key={index} className='flex gap-2'>
                                                <StateBaseTextField
                                                    value={url || ''}
                                                    onChange={(e) =>
                                                        updateResourceURL('masterPlanURL', index, e.target.value)
                                                    }
                                                    className='flex-1'
                                                    placeholder='Enter master plan URL'
                                                />
                                                <button
                                                    onClick={() => removeResourceURL('masterPlanURL', index)}
                                                    className='text-red-500 hover:text-red-700 px-2'
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Unit and Floor Plan URLs */}
                            <div className='mb-6'>
                                <div className='flex justify-between items-center mb-2'>
                                    <label className='block text-sm font-medium text-gray-700'>
                                        Unit and Floor Plan URLs
                                    </label>
                                    <Button
                                        bgColor='bg-blue-600'
                                        textColor='text-white'
                                        className='px-3 py-1 text-sm'
                                        onClick={() => addResourceURL('unitandfloorURL')}
                                    >
                                        Add URL
                                    </Button>
                                </div>
                                <div className='space-y-2'>
                                    {project.unitandfloorURL &&
                                        project.unitandfloorURL.map((url, index) => (
                                            <div key={index} className='flex gap-2'>
                                                <StateBaseTextField
                                                    value={url || ''}
                                                    onChange={(e) =>
                                                        updateResourceURL('unitandfloorURL', index, e.target.value)
                                                    }
                                                    className='flex-1'
                                                    placeholder='Enter unit and floor plan URL'
                                                />
                                                <button
                                                    onClick={() => removeResourceURL('unitandfloorURL', index)}
                                                    className='text-red-500 hover:text-red-700 px-2'
                                                >
                                                    ×
                                                </button>
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
                                        value={project.developerName || ''}
                                        onChange={(e) => updateProject('developerName', e.target.value)}
                                        className='w-full'
                                        placeholder='Enter developer name'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Legal Name</label>
                                    <StateBaseTextField
                                        value={project.developerLegalName || ''}
                                        onChange={(e) => updateProject('developerLegalName', e.target.value)}
                                        className='w-full'
                                        placeholder='Enter legal name'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Developer Tier
                                    </label>
                                    <Dropdown
                                        options={[
                                            { value: 'A', label: 'A' },
                                            { value: 'B', label: 'B' },
                                            { value: 'C', label: 'C' },
                                            { value: 'D', label: 'D' },
                                        ]}
                                        onSelect={(selectedValue) => updateProject('developerTier', selectedValue)}
                                        defaultValue={project.developerTier || ''}
                                        placeholder='Select tier'
                                        className='relative w-full'
                                        triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                        optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Khata Type</label>
                                    <Dropdown
                                        options={[
                                            { value: 'A', label: 'A' },
                                            { value: 'B', label: 'B' },
                                        ]}
                                        onSelect={(selectedValue) => updateProject('khataType', selectedValue)}
                                        defaultValue={project.khataType || ''}
                                        placeholder='Select khata type'
                                        className='relative w-full'
                                        triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                        optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className='mt-8 mb-10'>
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
                            {project.amenities &&
                                project.amenities.map((amenity, index) => (
                                    <div key={index} className='flex gap-2'>
                                        <StateBaseTextField
                                            value={amenity}
                                            onChange={(e) => updateAmenity(index, e.target.value)}
                                            className='flex-1'
                                            fullWidth={true}
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
