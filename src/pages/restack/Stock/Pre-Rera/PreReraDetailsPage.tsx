'use client'

import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../../../layout/Layout'
import Button from '../../../../components/design-elements/Button'
// import { stockData, type StockProject } from '../../../../pages/dummy_data/restack_prerera_dummy_data'
import usePreRera from '../../../../hooks/restack/usePreRera'

const PreReraProjectDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const {
        properties,
        selectedProperty,
        loading,
        error,
        hasProperties,
        propertyStats,
        fetchProperties,
        selectProperty,
        clearSelectedProperty,
        setFilters,
        clearFilters,
    } = usePreRera()
    const project = properties.find((p: any) => String(p.id) === String(id))
    useEffect(() => {
        // Fetch properties when component mounts
        fetchProperties()
    }, [fetchProperties])

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

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen'>
                    {/* Header */}
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-4'>
                            <button
                                onClick={() => navigate('/restack/stock')}
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
                        </div>
                        <div className='flex items-center gap-3'>
                            <Button bgColor='bg-gray-100' textColor='text-gray-700' className='px-4 py-2'>
                                Save
                            </Button>
                            <Button
                                bgColor='bg-blue-600'
                                textColor='text-white'
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
                                        <td className='px-4 py-3 text-sm text-gray-900'>{project.sizes}</td>
                                        <td className='px-4 py-3 text-sm text-gray-900'>{project.projectSize}</td>
                                        <td className='px-4 py-3 text-sm text-gray-900'>{project.launchDate}</td>
                                        <td className='px-4 py-3 text-sm text-gray-900'>{project.possessionStarts}</td>
                                        <td className='px-4 py-3 text-sm text-gray-900'>{project.configurations}</td>
                                        <td className='px-4 py-3 text-sm text-gray-900'>{project.reraId}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Description */}
                    <div className='mb-6'>
                        <p className='text-gray-700 leading-relaxed'>{project.description}</p>
                    </div>

                    {/* Project Images */}
                    {project.images && project.images.length > 0 && (
                        <div className='mb-8'>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                {project.images.map((image, index) => (
                                    <div key={index} className='aspect-video bg-gray-200 rounded-lg overflow-hidden'>
                                        <div className='w-full h-full flex items-center justify-center text-gray-500'>
                                            Project Image {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className='grid grid-cols-1 lg:grid-cols-1 gap-8'>
                        {/* Project Location */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Location</h2>
                            <div className='space-y-3'>
                                <div className=' grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-gray-100'>
                                    <span className='text-gray-600'>Address</span>
                                    <span className='text-gray-900'>{project.address}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-gray-100'>
                                    <span className='text-gray-600'>District</span>
                                    <span className='text-gray-900'>{project.district}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-gray-100'>
                                    <span className='text-gray-600'>Micromarket</span>
                                    <span className='text-gray-900'>{project.micromarket}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-gray-100'>
                                    <span className='text-gray-600'>Zone</span>
                                    <span className='text-gray-900'>{project.zone}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-gray-100'>
                                    <span className='text-gray-600'>Latitude</span>
                                    <span className='text-gray-900'>{project.lat}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2'>
                                    <span className='text-gray-600'>Longitude</span>
                                    <span className='text-gray-900'>{project.long}</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Timeline */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Timeline</h2>
                            <div className='space-y-3'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-gray-100'>
                                    <span className='text-gray-600'>Project Start Date</span>
                                    <span className='text-gray-900'>{project.launchDate}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-gray-100'>
                                    <span className='text-gray-600'>Handover Date</span>
                                    <span className='text-gray-900'>{project.handoverDate}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2'>
                                    <span className='text-gray-600'>Age of Building</span>
                                    <span className='text-gray-900'>{project.ageOfBuildinginYears}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-1 gap-8 mt-8'>
                        {/* Project Configuration */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Configuration</h2>
                            <div className='space-y-3 mb-6'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-gray-100'>
                                    <span className='text-gray-600'>Project Size</span>
                                    <span className='text-gray-900'>{project.projectSize}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2'>
                                    <span className='text-gray-600'>Total Units</span>
                                    <span className='text-gray-900'>{project.totalUnits}</span>
                                </div>
                            </div>

                            <div className='bg-gray-50 rounded-lg p-4'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                                    <div className='font-medium text-gray-700'>Tower</div>
                                    <div className='font-medium text-gray-700'>Floors per Tower</div>
                                    {project.TowerDetails.map((tower, index) => (
                                        <React.Fragment key={index}>
                                            <div className='text-gray-900'>{tower.name}</div>
                                            <div className='text-gray-900'>{tower.floors}</div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Project Resources */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Project Resources</h2>
                            <div className='space-y-3'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-gray-100'>
                                    <span className='text-gray-600'>Brochure</span>
                                    <span className='text-blue-600 cursor-pointer hover:underline'>
                                        {project?.brochureURL?.[0]}
                                    </span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-gray-100'>
                                    <span className='text-gray-600'>Master Plan</span>
                                    <span className='text-blue-600 cursor-pointer hover:underline'>
                                        {project?.masterPlanURL?.[0]}
                                    </span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2'>
                                    <span className='text-gray-600'>Units and Floor plan</span>
                                    <span className='text-blue-600 cursor-pointer hover:underline'>
                                        {project.unitandfloorURL?.[0]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
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

                    <div className='grid grid-cols-1 lg:grid-cols-1 gap-8 mt-8'>
                        {/* Developer Details */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Developer Details</h2>
                            <div className='space-y-3'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-gray-100'>
                                    <span className='text-gray-600'>Developer Name</span>
                                    <span className='text-gray-900'>{project.developerName}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2 border-b border-gray-100'>
                                    <span className='text-gray-600'>Legal Name</span>
                                    <span className='text-gray-900'>{project.developerLegalName}</span>
                                </div>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2'>
                                    <span className='text-gray-600'>Developer Tier</span>
                                    <span className='text-gray-900'>{project.developerTier}</span>
                                </div>
                            </div>
                        </div>

                        {/* Khata Details */}
                        <div className='bg-white'>
                            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Khata Details</h2>
                            <div className='space-y-3'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 py-2'>
                                    <span className='text-gray-600'>Khata Type</span>
                                    <span className='text-gray-900'>{project.khataType}</span>
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
