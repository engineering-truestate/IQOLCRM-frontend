'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../../../layout/Layout'
import Button from '../../../../components/design-elements/Button'
import usePreRera from '../../../../hooks/restack/usePreRera'
import type { PreReraProperty } from '../../../../store/reducers/restack/preReraTypes'
import { formatUnixDate } from '../../../../components/helper/getUnixDateTime'

const PreReraProjectDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = useState<PreReraProperty | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)

    const { getPropertyById, loading, error } = usePreRera()

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
                        <p className='text-gray-600'>Loading project details...</p>
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

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen'>
                    {/* Header */}
                    <div className='flex items-center gap-8 mb-6'>
                        <div className='flex items-center gap-4'>
                            <button
                                onClick={() => navigate('/restack/stock/pre-rera')}
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
                            <h1 className='text-xl font-semibold text-[#111518]'>{project.projectName}</h1>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Button
                                bgColor='bg-[#F3F3F3]'
                                textColor='text-[#3A3A47]'
                                className='px-4 py-2'
                                onClick={() => navigate(`/restack/stock/pre-rera/${id}/edit`)}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>

                    {/* Project Summary Table */}
                    <div className='bg-white rounded-lg border border-gray-200 mb-6'>
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-[#F3F4F6]'>
                                    <tr>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-[#111518]'>
                                            Sizes
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-[#111518]'>
                                            Project Size
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-[#111518]'>
                                            Launch Date
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-[#111518]'>
                                            Possession Starts
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-[#111518]'>
                                            Configurations
                                        </th>
                                        <th className='px-4 py-3 text-left text-sm font-medium text-[#111518]'>
                                            RERA ID
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className='border-t border-gray-200'>
                                        <td className='px-4 py-3 text-sm text-[#637988]'>{project.sizes || 'N/A'}</td>
                                        <td className='px-4 py-3 text-sm text-[#637988]'>
                                            {project.projectSize || 'N/A'}
                                        </td>
                                        <td className='px-4 py-3 text-sm text-[#637988]'>
                                            {project.launchDate ? formatUnixDate(project.launchDate) : '---'}
                                        </td>
                                        <td className='px-4 py-3 text-sm text-[#637988]'>
                                            {project.possessionStarts || 'N/A'}
                                        </td>
                                        <td className='px-4 py-3 text-sm text-[#637988]'>
                                            {project.configurations || 'N/A'}
                                        </td>
                                        <td className='px-4 py-3 text-sm text-[#637988]'>{project.reraId || 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                        <div className='mb-6'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-2'>Description</h2>
                            <p className='text-gray-700 leading-relaxed'>{project.description}</p>
                        </div>
                    )}

                    {/* Project Images */}
                    {project.images && project.images.length > 0 && (
                        <div className='mb-8'>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4'>
                                {project.images.map((image, index) => (
                                    <img
                                        src={image}
                                        alt='Preview'
                                        className='max-w-full max-h-full object-contain rounded-2xl'
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className='grid grid-cols-1 lg:grid-cols-1 gap-8'>
                        {/* Project Location */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Location</h2>
                            <div className='space-y-3'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Address</span>
                                    <span className='text-[#111518]'>{project.address || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>District</span>
                                    <span className='text-[#111518]'>{project.district || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Micromarket</span>
                                    <span className='text-[#111518]'>{project.micromarket || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Zone</span>
                                    <span className='text-[#111518]'>{project.zone || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Latitude</span>
                                    <span className='text-[#111518]'>{project.lat || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2'>
                                    <span className='text-gray-600'>Longitude</span>
                                    <span className='text-[#111518]'>{project.long || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Timeline */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Timeline</h2>
                            <div className='space-y-3'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Launch Date</span>
                                    <span className='text-gray-900'>
                                        {project.launchDate ? formatUnixDate(project.launchDate) : 'N/A'}
                                    </span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Project Start Date</span>
                                    <span className='text-gray-900'>
                                        {project.startDate ? formatUnixDate(project.startDate) : 'N/A'}
                                    </span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Handover Date</span>
                                    <span className='text-gray-900'>
                                        {project.handoverDate ? formatUnixDate(project.handoverDate) : 'N/A'}
                                    </span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2'>
                                    <span className='text-gray-600'>Age of Building (Years)</span>
                                    <span className='text-gray-900'>{project.ageOfBuildinginYears || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-1 gap-8 mt-8'>
                        {/* Project Configuration */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Configuration</h2>
                            <div className='space-y-3 mb-6'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Project Type</span>
                                    <span className='text-gray-900 capitalize'>{project.projectType || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Project Size</span>
                                    <span className='text-gray-900'>{project.projectSize || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Total Units</span>
                                    <span className='text-gray-900'>{project.totalUnits || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2'>
                                    <span className='text-gray-600'>Status</span>
                                    <span
                                        className={`text-sm px-2 py-1 w-[90px] rounded-full capitalize ${
                                            project.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : project.status === 'completed'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : project.status === 'on-hold'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : project.status === 'sold-out'
                                                      ? 'bg-red-100 text-red-800'
                                                      : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {project.status || '---'}
                                    </span>
                                </div>
                            </div>

                            {project.TowerDetails && project.TowerDetails.length > 0 && (
                                <div className='bg-[#F3F4F6] rounded-lg p-4 border border-[#DCE1E5]'>
                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                                        <div className='font-medium text-gray-700'>Tower</div>
                                        <div className='font-medium text-gray-700'>Floors per Tower</div>
                                        {project.TowerDetails.map((tower, index) => (
                                            <React.Fragment key={index}>
                                                <div className='text-[#111518]'>
                                                    {tower.name || `Tower ${index + 1}`}
                                                </div>
                                                <div className='text-[#111518]'>{tower.floors || 'N/A'}</div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Project Resources */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Resources</h2>
                            <div className='space-y-3'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Brochure</span>
                                    <span className='text-blue-600 cursor-pointer hover:underline'>
                                        {project?.brochureURL?.[0] || 'Not available'}
                                    </span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Master Plan</span>
                                    <span className='text-blue-600 cursor-pointer hover:underline'>
                                        {project?.masterPlanURL?.[0] || 'Not available'}
                                    </span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2'>
                                    <span className='text-gray-600'>Units and Floor Plan</span>
                                    <span className='text-blue-600 cursor-pointer hover:underline'>
                                        {project?.unitandfloorURL?.[0] || 'Not available'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    {project.amenities && project.amenities.length > 0 && (
                        <div className='mt-8'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Amenities</h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {project.amenities.map((amenity, index) => (
                                    <div key={index} className='bg-gray-50 px-4 py-2 rounded-lg'>
                                        <span className='text-gray-800'>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className='grid grid-cols-1 lg:grid-cols-1 gap-8 mt-8'>
                        {/* Developer Details */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Developer Details</h2>
                            <div className='space-y-3'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Developer Name</span>
                                    <span className='text-gray-900'>{project.developerName || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-[#DCE1E5]'>
                                    <span className='text-gray-600'>Legal Name</span>
                                    <span className='text-gray-900'>{project.developerLegalName || 'N/A'}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2'>
                                    <span className='text-gray-600'>Developer Tier</span>
                                    <span
                                        className={`px-2 py-1 w-[30px] rounded text-sm font-medium ${
                                            project.developerTier === 'A'
                                                ? 'bg-green-100 text-green-800'
                                                : project.developerTier === 'B'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : project.developerTier === 'C'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : project.developerTier === 'D'
                                                      ? 'bg-red-100 text-red-800'
                                                      : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {project.developerTier || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Khata Details */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Khata Details</h2>
                            <div className='space-y-3'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2'>
                                    <span className='text-gray-600'>Khata Type</span>
                                    <span
                                        className={`px-2 py-1 w-[30px] rounded text-sm font-medium ${
                                            project.khataType === 'A'
                                                ? 'bg-green-100 text-green-800'
                                                : project.khataType === 'B'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {project.khataType || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PreReraProjectDetails
