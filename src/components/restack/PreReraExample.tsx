import React, { useEffect } from 'react'
import { usePreRera } from '../../hooks/restack/usePreRera'
import type { PreReraProperty } from '../../store/reducers/restack/preReraTypes'

const PreReraExample: React.FC = () => {
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

    useEffect(() => {
        // Fetch properties when component mounts
        fetchProperties()
    }, [fetchProperties])

    const handlePropertySelect = (property: PreReraProperty) => {
        selectProperty(property)
    }

    const handleFilterByStatus = (status: string) => {
        setFilters({ status })
    }

    const handleClearFilters = () => {
        clearFilters()
    }

    if (loading) {
        return <div className='p-4'>Loading pre-rera properties...</div>
    }

    if (error) {
        return <div className='p-4 text-red-600'>Error: {error}</div>
    }

    return (
        <div className='p-6'>
            <h1 className='text-2xl font-bold mb-4'>Pre-Rera Properties</h1>

            {/* Statistics */}
            <div className='mb-6 grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='bg-blue-100 p-4 rounded'>
                    <h3 className='font-semibold'>Total Properties</h3>
                    <p className='text-2xl'>{propertyStats.total}</p>
                </div>
                <div className='bg-green-100 p-4 rounded'>
                    <h3 className='font-semibold'>Active Properties</h3>
                    <p className='text-2xl'>{propertyStats.active}</p>
                </div>
                <div className='bg-yellow-100 p-4 rounded'>
                    <h3 className='font-semibold'>Residential</h3>
                    <p className='text-2xl'>{propertyStats.residential}</p>
                </div>
                <div className='bg-purple-100 p-4 rounded'>
                    <h3 className='font-semibold'>Commercial</h3>
                    <p className='text-2xl'>{propertyStats.commercial}</p>
                </div>
            </div>

            {/* Filters */}
            <div className='mb-4 flex gap-2'>
                <button
                    onClick={() => handleFilterByStatus('active')}
                    className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                >
                    Show Active
                </button>
                <button
                    onClick={() => handleFilterByStatus('inactive')}
                    className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
                >
                    Show Inactive
                </button>
                <button
                    onClick={handleClearFilters}
                    className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
                >
                    Clear Filters
                </button>
            </div>

            {/* Selected Property */}
            {selectedProperty && (
                <div className='mb-6 p-4 bg-gray-100 rounded'>
                    <h2 className='text-xl font-semibold mb-2'>Selected Property</h2>
                    <p>
                        <strong>Name:</strong> {selectedProperty.projectName}
                    </p>
                    <p>
                        <strong>Developer:</strong> {selectedProperty.developerName}
                    </p>
                    <p>
                        <strong>Location:</strong> {selectedProperty.address}
                    </p>
                    <p>
                        <strong>Status:</strong> {selectedProperty.status}
                    </p>
                    <button
                        onClick={clearSelectedProperty}
                        className='mt-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600'
                    >
                        Clear Selection
                    </button>
                </div>
            )}

            {/* Properties List */}
            {hasProperties ? (
                <div className='grid gap-4'>
                    {properties.map((property) => (
                        <div
                            key={property.projectId}
                            className={`p-4 border rounded cursor-pointer hover:bg-gray-50 ${
                                selectedProperty?.projectId === property.projectId
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200'
                            }`}
                            onClick={() => handlePropertySelect(property)}
                        >
                            <div className='flex justify-between items-start'>
                                <div>
                                    <h3 className='text-lg font-semibold'>{property.projectName}</h3>
                                    <p className='text-gray-600'>{property.developerName}</p>
                                    <p className='text-sm text-gray-500'>{property.address}</p>
                                    <p className='text-sm'>
                                        <span className='font-medium'>Type:</span> {property.projectType} |
                                        <span className='font-medium'> Status:</span> {property.status} |
                                        <span className='font-medium'> Units:</span> {property.totalUnits}
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            property.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {property.status}
                                    </span>
                                    <p className='text-sm text-gray-500 mt-1'>Tier {property.developerTier}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='text-center py-8 text-gray-500'>No pre-rera properties found.</div>
            )}
        </div>
    )
}

export default PreReraExample
