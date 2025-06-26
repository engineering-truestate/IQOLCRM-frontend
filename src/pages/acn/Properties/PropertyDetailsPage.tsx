// PropertyDetailsPage.tsx
'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../../store/index'
import {
    fetchPropertyById,
    updatePropertyStatus,
    addNoteToProperty,
} from '../../../services/acn/properties/propertiesService'
import { clearCurrentProperty, clearError } from '../../../store/reducers/acn/propertiesReducers'
import Layout from '../../../layout/Layout'
import Dropdown from '../../../components/design-elements/Dropdown'
import ShareInventoryModal from '../../../components/acn/ShareInventoryModal'
import UpdateInventoryStatusModal from '../../../components/acn/UpdateInventoryModal'
import PriceDropModal from '../../../components/acn/PriceChangeModal'
import { type IInventory } from '../../../store/reducers/acn/propertiesTypes'
import { toast } from 'react-toastify'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import { formatUnixDateTime } from '../../../components/helper/formatDate'
import { formatExactCostToLacsOrCrs } from '../../../components/helper/formatCost'

// Icons
import shareIcon from '/icons/acn/share-1.svg'
import editIcon from '/icons/acn/edit.svg'
import noteIcon from '/icons/acn/note.svg'
import priceic from '/icons/acn/discount-shape.svg'
import useAuth from '../../../hooks/useAuth'
import { getUnixDateTime } from '../../../components/helper/getUnixDateTime'

interface Note {
    id: string
    author: string
    content: string
    timestamp: number
}

const PropertyDetailsPage = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const dispatch = useDispatch<AppDispatch>()

    // Redux state
    const { currentProperty: property, loading, error } = useSelector((state: RootState) => state.properties)
    const { user } = useAuth()

    // Local state
    const [newNote, setNewNote] = useState('')
    const [localProperty, setLocalProperty] = useState<IInventory | null>(null)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isPriceDropModalOpen, setIsPriceDropModalOpen] = useState(false)

    // Update local property when Redux property changes
    useEffect(() => {
        if (property) {
            setLocalProperty(property)
        }
    }, [property])

    // Fetch property data when component mounts
    useEffect(() => {
        if (id) {
            console.log('🔄 Fetching property with ID:', id)
            dispatch(fetchPropertyById(id))
        }

        // Cleanup on unmount
        return () => {
            console.log('🧹 Clearing current property on unmount')
            dispatch(clearCurrentProperty())
        }
    }, [id, dispatch])

    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Handle status change - UPDATED TO INTERCEPT SOLD STATUS
    const handleStatusChange = async (option: string) => {
        if (!property?.propertyId) {
            toast.error('Property ID not found')
            return
        }

        console.log('📝 Status changed to:', option)

        // If status is "Sold", open the modal instead of direct update
        if (option === 'Sold') {
            setIsUpdateModalOpen(true)
            return
        }

        try {
            await dispatch(
                updatePropertyStatus({
                    propertyId: property.propertyId,
                    status: option,
                }),
            ).unwrap()

            // Refetch property details to update the UI
            if (id) {
                dispatch(fetchPropertyById(id))
            }

            toast.success(`Status updated successfully to ${option}`)
        } catch (error: any) {
            console.error('Error updating property status:', error)
            toast.error(error.message || 'Failed to update property status')
        }
    }

    // Handle add note
    const handleAddNote = async () => {
        if (newNote.trim() && localProperty?.propertyId) {
            console.log('📝 Adding new note:', newNote)
            console.log('🔍 User:', user)
            const newNoteObj = {
                id: '',
                author: user?.displayName || 'Unknown User',
                email: user?.email || 'unknown@example.com',
                content: newNote.trim(),
                timestamp: getUnixDateTime(),
            }

            try {
                await dispatch(
                    addNoteToProperty({
                        propertyId: localProperty.propertyId,
                        note: newNoteObj,
                    }),
                ).unwrap()
                console.log('🗑️ Adding new note:', newNoteObj)

                // Refetch property details to update the UI
                if (id) {
                    dispatch(fetchPropertyById(id))
                }

                setNewNote('')
                toast.success('Note added successfully')
            } catch (error: any) {
                console.error('Error adding note:', error)
                toast.error(error.message || 'Failed to add note')
            }
        }
    }

    // Handle modal close and refetch data
    const handleModalClose = () => {
        setIsUpdateModalOpen(false)
        // Refetch property details to update the UI after modal closes
        if (id) {
            dispatch(fetchPropertyById(id))
        }
    }

    // Handle price drop modal close and refetch data
    const handlePriceDropModalClose = () => {
        setIsPriceDropModalOpen(false)
        // Refetch property details to update the UI after modal closes
        if (id) {
            dispatch(fetchPropertyById(id))
        }
    }

    // Status dropdown options
    const getStatusOptions = () => [
        {
            label: 'Available',
            value: 'Available',
            color: '#E1F6DF',
            textColor: '#065F46',
        },
        {
            label: 'Sold',
            value: 'Sold',
            color: '#FEECED',
            textColor: '#991B1B',
        },
        {
            label: 'Hold',
            value: 'Hold',
            color: '#FFF3CD',
            textColor: '#B45309',
        },
        {
            label: 'De-listed',
            value: 'De-listed',
            color: '#F3F4F6',
            textColor: '#374151',
        },
    ]

    // Helper functions
    const formatCurrency = (amount: number | undefined | null) => {
        if (!amount) return '₹0'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A'
        let date: Date

        if (timestamp?.toDate) {
            date = timestamp.toDate()
        } else if (timestamp?.seconds) {
            date = new Date(timestamp.seconds * 1000)
        } else if (typeof timestamp === 'string') {
            date = new Date(timestamp)
        } else if (timestamp instanceof Date) {
            date = timestamp
        } else {
            return 'N/A'
        }

        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    // Get property images (use property photos or fallback to sample images)
    const getPropertyImages = () => {
        if (property?.photo && property.photo.length > 0) {
            return property.photo
        }
        // Fallback sample images
        return [
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&h=600&fit=crop',
        ]
    }

    // Determine property type based on propertyId
    const getPropertyType = () => {
        if (property?.propertyId?.startsWith('RN')) {
            return 'Rental'
        }
        return 'Resale'
    }

    // Loading state
    if (loading) {
        return (
            <Layout loading={true}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-lg'>Loading property details...</div>
                </div>
            </Layout>
        )
    }

    // Error state
    if (error) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-center'>
                        <div className='text-lg text-red-600 mb-4'>Error loading property</div>
                        <div className='text-sm text-gray-600 mb-4'>{error}</div>
                        <div className='flex gap-2 justify-center'>
                            <button
                                onClick={() => {
                                    dispatch(clearError())
                                    if (id) dispatch(fetchPropertyById(id))
                                }}
                                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => navigate('/acn/properties')}
                                className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
                            >
                                Back to Properties
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    // Not found state
    if (!property) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-center'>
                        <div className='text-lg'>Property not found</div>
                        <div className='text-sm text-gray-600 mt-2'>
                            The property with ID "{id}" could not be found.
                        </div>
                        <button
                            onClick={() => navigate('/acn/properties')}
                            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                        >
                            Back to Properties
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    const propertyImages = getPropertyImages()

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans bg-white'>
                <div className='py-6 px-6 min-h-screen'>
                    {/* Breadcrumb */}
                    <div className='mb-4'>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <button onClick={() => navigate('/acn/properties')} className='hover:text-gray-800'>
                                Properties
                            </button>
                            <span>/</span>
                            <span className='text-gray-900'>{property.propertyId}</span>
                        </div>
                    </div>

                    <hr className='border-gray-200 mb-4' />

                    {/* Header Actions */}
                    <div className='flex items-center gap-4 mb-0'>
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className='flex items-center h-8 gap-2 px-2 py-2 text-gray-700 bg-[#F3F3F3] border border-gray-300 rounded-md hover:bg-gray-50'
                        >
                            <img src={shareIcon} alt='Share' className='w-4 h-4' />
                            <span className='text-sm font-medium'>Share</span>
                        </button>
                        <button
                            onClick={() => setIsPriceDropModalOpen(true)}
                            className='flex items-center h-8 gap-2 px-2 py-2 text-gray-700 bg-[#F3F3F3] border border-gray-300 rounded-md hover:bg-gray-50'
                        >
                            <img src={priceic} alt='Share' className='w-4 h-4' />
                            <span className='text-sm font-medium'>Price Change</span>
                        </button>
                        <button
                            onClick={() => navigate(`/acn/properties/${id}/edit`)}
                            className='flex items-center h-8 gap-2 px-2 py-2 text-gray-700 bg-[#F3F3F3] border border-gray-300 rounded-md hover:bg-gray-50'
                        >
                            <img src={editIcon} alt='Edit' className='w-4 h-4' />
                            <span className='text-sm font-medium'>Edit Property</span>
                        </button>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        {/* Main Content */}
                        <div className='lg:col-span-2 space-y-6'>
                            {/* Property Header */}
                            <div className='bg-white rounded-lg py-2'>
                                <div className='flex items-start justify-between mb-4'>
                                    <div>
                                        <h1 className='text-lg font-semibold text-black mb-4'>
                                            {property.propertyName || property.area || 'Unknown Property'}
                                        </h1>
                                        <div className='flex items-center gap-6 text-sm text-gray-600'>
                                            <div className='flex items-center gap-1'>
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
                                                        d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                                                    />
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                                                    />
                                                </svg>
                                                {property.micromarket || 'Unknown'}
                                            </div>
                                            <div className='flex items-center gap-1'>
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
                                                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                                    />
                                                </svg>
                                                {formatDate(property.handoverDate)}
                                            </div>
                                            <div className='flex items-center gap-1'>
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
                                                        d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                                                    />
                                                </svg>
                                                {property.assetType || 'Unknown'}
                                            </div>
                                            <div className='flex items-center gap-1'>
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
                                                        d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z'
                                                    />
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z'
                                                    />
                                                </svg>
                                                {property.unitType || 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <div className='text-lg font-bold text-gray-900 mb-2'>
                                            {formatExactCostToLacsOrCrs(property.totalAskPrice)}
                                        </div>
                                    </div>
                                </div>

                                {/* Property Images */}
                                {/* Image Carousel - 3 pics at a time */}
                                <div className='relative mb-0'>
                                    {/* Main Images Display */}
                                    <div className='relative rounded-lg overflow-hidden bg-gray-200'>
                                        <div className='flex gap-2 h-40'>
                                            {propertyImages
                                                .slice(currentImageIndex, currentImageIndex + 3)
                                                .map((image, index) => (
                                                    <div
                                                        key={currentImageIndex + index}
                                                        className='flex-1 relative rounded-lg overflow-hidden bg-gray-200'
                                                    >
                                                        <img
                                                            src={image || '/placeholder.svg'}
                                                            alt={`Property ${currentImageIndex + index + 1}`}
                                                            className='w-full h-full object-cover'
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement
                                                                target.src =
                                                                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                        </div>

                                        {/* Navigation Arrows */}
                                        {propertyImages.length > 3 && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        setCurrentImageIndex(Math.max(0, currentImageIndex - 3))
                                                    }
                                                    disabled={currentImageIndex === 0}
                                                    className='absolute left-4 top-2/5 transform  bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity disabled:opacity-30'
                                                >
                                                    <svg
                                                        className='w-5 h-5'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        viewBox='0 0 24 24'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            strokeWidth={2}
                                                            d='M15 19l-7-7 7-7'
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setCurrentImageIndex(
                                                            Math.min(propertyImages.length - 3, currentImageIndex + 3),
                                                        )
                                                    }
                                                    disabled={currentImageIndex >= propertyImages.length - 3}
                                                    className='absolute right-4 top-2/5 transform bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity disabled:opacity-30'
                                                >
                                                    <svg
                                                        className='w-5 h-5'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        viewBox='0 0 24 24'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            strokeWidth={2}
                                                            d='M9 5l7 7-7 7'
                                                        />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Property Details */}
                            <div className='bg-white rounded-lg py-2'>
                                <h2 className='text-md font-semibold text-gray-900 mb-2'>Property Details</h2>

                                <div className='grid grid-cols-2 gap-x-8 gap-y-0'>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Property Type</span>
                                        <span className='font-medium capitalize'>{property.assetType || 'N/A'}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Unit Type</span>
                                        <span className='font-medium'>{property.unitType || 'N/A'}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Sub Type</span>
                                        <span className='font-medium'>{property.subType || 'N/A'}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Floor No</span>
                                        <span className='font-medium'>{property.floorNo || 'N/A'}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Total Ask Price</span>
                                        <span className='font-medium'>
                                            {formatExactCostToLacsOrCrs(property.totalAskPrice)}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Ask Price Per Sqft</span>
                                        <span className='font-medium'>{formatCurrency(property.askPricePerSqft)}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>SBUA</span>
                                        <span className='font-medium'>
                                            {property.sbua ? `${property.sbua} sq ft` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Carpet Area</span>
                                        <span className='font-medium'>
                                            {property.carpet ? `${property.carpet} sq ft` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Plot Size</span>
                                        <span className='font-medium'>
                                            {property.plotSize ? `${property.plotSize} sq ft` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Facing</span>
                                        <span className='font-medium'>{property.facing || 'N/A'}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Building Age</span>
                                        <span className='font-medium'>
                                            {property.buildingAge ? `${property.buildingAge} years` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Tenanted</span>
                                        <span className='font-medium'>
                                            {property.tenanted !== null ? (property.tenanted ? 'Yes' : 'No') : 'N/A'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Age of Inventory</span>
                                        <span className='font-medium'>
                                            {property.ageOfInventory ? `${property.ageOfInventory} days` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Building Khata</span>
                                        <span className='font-medium'>{property.buildingKhata || 'N/A'}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Age of Status</span>
                                        <span className='font-medium'>
                                            {property.ageOfStatus ? `${property.ageOfStatus} days` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Land Khata</span>
                                        <span className='font-medium'>{property.landKhata || 'N/A'}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Date Added</span>
                                        <span className='font-medium'>{formatDate(property.dateOfInventoryAdded)}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>OC Received</span>
                                        <span className='font-medium'>
                                            {property.ocReceived !== null
                                                ? property.ocReceived
                                                    ? 'Yes'
                                                    : 'No'
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Extra Details */}
                                {property.extraDetails && (
                                    <div className='mt-2'>
                                        <h3 className='font-medium text-gray-900 mb-3'>Extra Details</h3>
                                        <p className='text-sm text-gray-600 leading-relaxed'>{property.extraDetails}</p>
                                    </div>
                                )}

                                {/* Location Details */}
                                <div className='mt-2'>
                                    <h3 className='font-medium text-gray-900 mb-2'>Location Details</h3>
                                    <div className='grid grid-cols-1 gap-0'>
                                        <div className='flex justify-between py-1 border-b border-gray-100'>
                                            <span className='text-gray-600'>Micromarket</span>
                                            <span className='font-medium'>{property.micromarket || 'N/A'}</span>
                                        </div>
                                        <div className='flex justify-between py-1 border-b border-gray-100'>
                                            <span className='text-gray-600'>Area</span>
                                            <span className='font-medium'>{property.area || 'N/A'}</span>
                                        </div>
                                        <div className='flex justify-between py-1 border-b border-gray-100'>
                                            <span className='text-gray-600'>Map Location</span>
                                            <span className='font-medium'>{property.mapLocation || 'N/A'}</span>
                                        </div>
                                        {property._geoloc && (
                                            <div className='flex justify-between py-1 border-b border-gray-100'>
                                                <span className='text-gray-600'>Coordinates</span>
                                                <span className='font-medium'>
                                                    {property._geoloc.lat}, {property._geoloc.lng}
                                                </span>
                                            </div>
                                        )}
                                        <div className='flex justify-between py-1 border-b border-gray-100'>
                                            <span className='text-gray-600'>Map</span>
                                            <button
                                                onClick={() => {
                                                    if (property._geoloc) {
                                                        window.open(
                                                            `https://maps.google.com/?q=${property._geoloc.lat},${property._geoloc.lng}`,
                                                            '_blank',
                                                        )
                                                    }
                                                }}
                                                className='px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-800'
                                                disabled={!property._geoloc}
                                            >
                                                Open Maps
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Price History Section - Updated to show both price types */}
                                {/* Price History Section - Fixed with proper type guards */}
                                {property.priceHistory && property.priceHistory.length > 0 && (
                                    <div className='bg-white rounded-lg mt-2'>
                                        <h2 className='text-md font-semibold text-gray-900 mb-6'>Price History</h2>
                                        <div className='space-y-4'>
                                            {[...property.priceHistory]
                                                .sort((a, b) => b.timestamp - a.timestamp)
                                                .map((priceEntry, index) => {
                                                    // Determine if it's an increase or decrease based on total ask price
                                                    let changeType = 'change'
                                                    let changeColor = 'text-gray-600'
                                                    let changeIcon = '↔'

                                                    if (
                                                        priceEntry.oldTotalAskPrice !== undefined &&
                                                        priceEntry.newTotalAskPrice !== undefined
                                                    ) {
                                                        if (priceEntry.newTotalAskPrice > priceEntry.oldTotalAskPrice) {
                                                            changeType = 'increase'
                                                            changeColor = 'text-green-600'
                                                            changeIcon = '↗'
                                                        } else if (
                                                            priceEntry.newTotalAskPrice < priceEntry.oldTotalAskPrice
                                                        ) {
                                                            changeType = 'decrease'
                                                            changeColor = 'text-red-600'
                                                            changeIcon = '↘'
                                                        }
                                                    }

                                                    return (
                                                        <div
                                                            key={priceEntry.id || index}
                                                            className='border border-gray-200 rounded-lg p-4'
                                                        >
                                                            <div className='flex items-center justify-between mb-3'>
                                                                <h4
                                                                    className={`text-sm font-semibold flex items-center gap-1 ${changeColor}`}
                                                                >
                                                                    {changeIcon} Price{' '}
                                                                    {changeType.charAt(0).toUpperCase() +
                                                                        changeType.slice(1)}
                                                                </h4>
                                                                <span className='text-xs text-gray-500'>
                                                                    {formatUnixDateTime(priceEntry.timestamp)}
                                                                </span>
                                                            </div>
                                                            <div className='text-sm text-gray-600 mb-3'>
                                                                <span className='font-medium'>Updated by:</span>{' '}
                                                                {priceEntry.kamName || 'Unknown'}
                                                            </div>

                                                            {/* Total Ask Price Changes - Always show with type guard */}
                                                            {priceEntry.oldTotalAskPrice !== undefined &&
                                                                priceEntry.newTotalAskPrice !== undefined && (
                                                                    <div className='text-sm text-gray-700 mb-3'>
                                                                        <span className='font-medium'>
                                                                            Total Ask Price:
                                                                        </span>
                                                                        <div className='flex items-center gap-2 mt-1'>
                                                                            <span
                                                                                className={
                                                                                    changeType === 'decrease'
                                                                                        ? 'text-red-600 line-through'
                                                                                        : 'text-gray-600'
                                                                                }
                                                                            >
                                                                                {formatExactCostToLacsOrCrs(
                                                                                    priceEntry.oldTotalAskPrice,
                                                                                )}
                                                                            </span>
                                                                            <span>→</span>
                                                                            <span
                                                                                className={`font-medium ${changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-green-600' : 'text-gray-600'}`}
                                                                            >
                                                                                {formatExactCostToLacsOrCrs(
                                                                                    priceEntry.newTotalAskPrice,
                                                                                )}
                                                                            </span>
                                                                            <span className='text-xs text-gray-500 ml-2'>
                                                                                (
                                                                                {(
                                                                                    ((priceEntry.newTotalAskPrice -
                                                                                        priceEntry.oldTotalAskPrice) /
                                                                                        priceEntry.oldTotalAskPrice) *
                                                                                    100
                                                                                ).toFixed(1)}
                                                                                %)
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            {/* Price Per Sqft Changes - Always show with type guard */}
                                                            {priceEntry.oldAskPricePerSqft !== undefined &&
                                                                priceEntry.newAskPricePerSqft !== undefined && (
                                                                    <div className='text-sm text-gray-700'>
                                                                        <span className='font-medium'>
                                                                            Price Per Sqft:
                                                                        </span>
                                                                        <div className='flex items-center gap-2 mt-1'>
                                                                            <span
                                                                                className={
                                                                                    changeType === 'decrease'
                                                                                        ? 'text-red-600 line-through'
                                                                                        : 'text-gray-600'
                                                                                }
                                                                            >
                                                                                {formatCurrency(
                                                                                    priceEntry.oldAskPricePerSqft,
                                                                                )}
                                                                                /sqft
                                                                            </span>
                                                                            <span>→</span>
                                                                            <span
                                                                                className={`font-medium ${changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-green-600' : 'text-gray-600'}`}
                                                                            >
                                                                                {formatCurrency(
                                                                                    priceEntry.newAskPricePerSqft,
                                                                                )}
                                                                                /sqft
                                                                            </span>
                                                                            <span className='text-xs text-gray-500 ml-2'>
                                                                                (
                                                                                {(
                                                                                    ((priceEntry.newAskPricePerSqft -
                                                                                        priceEntry.oldAskPricePerSqft) /
                                                                                        priceEntry.oldAskPricePerSqft) *
                                                                                    100
                                                                                ).toFixed(1)}
                                                                                %)
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className='space-y-4'>
                            <div className='flex items-center gap-3 px-6'>
                                <div className='w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium'>
                                    {property.kamName?.substring(0, 2).toUpperCase() || 'AG'}
                                </div>
                                <div>
                                    <div className='font-medium text-gray-900'>{property.kamName || 'NA'}</div>
                                    <div className='text-sm text-gray-600'>{property.kamId || 'NA'}</div>
                                </div>
                            </div>
                            {/* Update Inventory Status */}
                            <div className='bg-white rounded-lg px-6'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Update Inventory Status</h3>

                                <div className='flex justify-between mb-0'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Status</label>
                                </div>
                                <Dropdown
                                    options={getStatusOptions()}
                                    onSelect={handleStatusChange}
                                    defaultValue={property.status}
                                    placeholder='Select Status'
                                    className='mb-2'
                                    triggerClassName='w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                    optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md'
                                />

                                {/* Inventory Performance */}
                                <div className='mb-6'>
                                    <h4 className='font-medium text-gray-900 mb-3'>Inventory Performance</h4>
                                    <div className='space-y-2'>
                                        <div className='flex justify-between'>
                                            <span className='text-gray-600'>Enquiries</span>
                                            <span className='font-medium'>{property.enquiries || 0}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-gray-600'>Age of Inventory</span>
                                            <span className='font-medium'>{property.ageOfInventory || 0} days</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-gray-600'>Age of Status</span>
                                            <span className='font-medium'>{property.ageOfStatus || 0} days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className='bg-white rounded-lg p-6'>
                                <div className='flex items-center justify-between mb-4'>
                                    <h3 className='text-lg font-semibold text-gray-900'>Notes</h3>
                                    <button
                                        onClick={handleAddNote}
                                        disabled={!newNote.trim()}
                                        className={`flex items-center gap-1 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 ${
                                            !newNote.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        <img src={noteIcon} alt='Add Note' className='w-4 h-4' />
                                        Add Note
                                    </button>
                                </div>

                                {/* Add Note Input */}
                                <div className='mb-4'>
                                    <StateBaseTextField
                                        placeholder='Add a note...'
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className='flex-1 text-sm'
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddNote()
                                            }
                                        }}
                                    />
                                </div>

                                {/* Previous Notes */}
                                <div>
                                    <h4 className='font-medium text-gray-900 mb-3'>Previous Notes</h4>
                                    <div className='space-y-4 max-h-80 overflow-y-auto'>
                                        {localProperty?.notes && localProperty.notes.length > 0 ? (
                                            [...localProperty.notes]
                                                .sort((a, b) => b.timestamp - a.timestamp)
                                                .map((note: Note) => (
                                                    <div key={note.id} className='space-y-2'>
                                                        <div className='text-sm text-gray-600'>
                                                            <span className='font-medium text-gray-900'>
                                                                {note.author}
                                                            </span>
                                                            {' on '}
                                                            <span>{formatUnixDateTime(note.timestamp)}</span>
                                                        </div>
                                                        <div className='bg-gray-50 rounded-lg p-4 border border-gray-100'>
                                                            <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words'>
                                                                {note.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className='text-center py-4 text-gray-500'>
                                                No notes yet. Add your first note above.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <ShareInventoryModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                property={property}
            />

            {/* Update Status Modal */}
            <UpdateInventoryStatusModal
                isOpen={isUpdateModalOpen}
                onClose={handleModalClose}
                propertyType={getPropertyType()}
                selectedCount={1}
                propertyId={property.propertyId}
            />

            {/* Price Drop Modal */}
            <PriceDropModal isOpen={isPriceDropModalOpen} onClose={handlePriceDropModalClose} property={property} />
        </Layout>
    )
}

export default PropertyDetailsPage
