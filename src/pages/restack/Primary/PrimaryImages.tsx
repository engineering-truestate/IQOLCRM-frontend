import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../../store'
import { useDispatch } from 'react-redux'
import { fetchPrimaryPropertyById, updatePrimaryProperty } from '../../../store/actions/restack/primaryProperties'
import { clearCurrentProperty } from '../../../store/reducers/acn/propertiesReducers'
import PDFUploadComponent from '../../../components/restack/PDFUploadComponent'
import Button from '../../../components/design-elements/Button'
import editic from '/icons/acn/edit.svg'
import type { PrimaryProperty } from '../../../data_types/restack/restack-primary'

const PrimaryImages: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const [images, setImages] = useState<string[]>([])
    const [projectName, setProjectName] = useState<string>('')
    const [isEditing, setIsEditing] = useState(false)
    const [originalImages, setOriginalImages] = useState<string[]>([])
    const [projectDetails, setProjectDetails] = useState<PrimaryProperty>()

    const { currentProperty, loading } = useSelector((state: RootState) => state.primaryProperties)

    useEffect(() => {
        if (id) {
            dispatch(fetchPrimaryPropertyById(id))
        }
        return () => {
            dispatch(clearCurrentProperty())
        }
    }, [id, dispatch])

    useEffect(() => {
        setProjectDetails(currentProperty || undefined)
        setImages(currentProperty?.images || [])
        setOriginalImages(currentProperty?.images || [])
        setProjectName(currentProperty?.projectName || '')
    }, [currentProperty])

    const handleNavigateToMain = () => {
        navigate('/restack/primary')
    }

    const handleNavigateToProjectDetails = () => {
        navigate(`/restack/primary/${id}`)
    }

    // Only allow editing images in edit mode
    const updateImages = (_field: string, files: any[]) => {
        if (isEditing) setImages(files)
    }

    const handleEdit = () => setIsEditing(true)
    const handleCancel = () => {
        setImages(originalImages)
        setIsEditing(false)
    }
    const handleSave = async () => {
        if (id && projectDetails) {
            const updates: Partial<PrimaryProperty> = {}

            Object.keys(projectDetails).forEach((key) => {
                const typedKey = key as keyof PrimaryProperty
                if (typedKey === 'images') {
                    ;(updates as any)[typedKey] = images
                }
            })

            updatePrimaryProperty({
                projectId: id,
                updates: updates,
            })
            setOriginalImages(images)
            setIsEditing(false)
        }
    }

    return (
        <Layout loading={loading}>
            <div className='pt-6 px-4 sm:px-6 lg:px-8'>
                {/* Breadcrumb Navigation */}
                <div className='flex items-center space-x-2 text-sm text-gray-500 mb-4'>
                    <button
                        onClick={handleNavigateToMain}
                        className='hover:text-gray-700 transition-colors cursor-pointer'
                    >
                        Primary
                    </button>
                    <span>/</span>
                    <button
                        onClick={handleNavigateToProjectDetails}
                        className='font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer'
                    >
                        {projectName}
                    </button>
                    <span>/</span>
                    <span className='font-medium text-gray-700'>Images</span>
                </div>

                {/* Page Title and Edit/Save/Cancel */}
                <div className='flex items-center justify-between mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900'>{projectName} Images</h1>
                    {!isEditing ? (
                        <Button
                            leftIcon={<img src={editic} alt='Edit' className='w-4 h-4' />}
                            bgColor='bg-[#F3F3F3]'
                            textColor='text-[#3A3A47]'
                            className='px-4 h-8 font-semibold'
                            onClick={handleEdit}
                        >
                            Edit
                        </Button>
                    ) : (
                        <div className='space-x-2'>
                            <Button
                                bgColor='bg-gray-600'
                                textColor='text-white'
                                className='px-4 h-8 font-semibold'
                                onClick={handleSave}
                            >
                                ✓ Save
                            </Button>
                            <Button
                                bgColor='bg-gray-200'
                                textColor='text-gray-700'
                                className='px-4 h-8 font-semibold'
                                onClick={handleCancel}
                            >
                                ✕ Cancel
                            </Button>
                        </div>
                    )}
                </div>

                {/* Image Upload/Edit */}
                <PDFUploadComponent
                    files={images || []}
                    onFilesChange={(files) => updateImages('images', files)}
                    maxFiles={5}
                    maxSizeMB={10}
                    storagePath={`restack/Primary/${currentProperty?.projectId}/images`}
                    title='Images'
                    isEdit={isEditing}
                />

                {/* Image Preview Grid */}
                <div className='mt-8 grid grid-cols-2 md:grid-cols-4 gap-4'>
                    {images && images.length > 0 ? (
                        images.map((img, idx) => (
                            <div key={idx} className='border rounded shadow-sm p-2 bg-white'>
                                {/* If images are URLs, use <img>. If objects, adjust accordingly */}
                                <img
                                    src={img}
                                    alt={`Project Image ${idx + 1}`}
                                    className='w-full h-32 object-cover rounded'
                                />
                            </div>
                        ))
                    ) : (
                        <span className='text-gray-500 col-span-full'>No images uploaded.</span>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default PrimaryImages
