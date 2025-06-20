// QCPropertyDetailsPage.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../../store/index'
import {
    fetchQCInventoryById,
    updateQCStatusWithRoleCheck,
    addQCInventoryNote,
} from '../../../services/acn/qc/qcService'
import { initializeAuthListener } from '../../../services/user/userRoleService'
import { clearCurrentQCInventory, clearError } from '../../../store/reducers/acn/qcReducer'
import Layout from '../../../layout/Layout'
import Dropdown from '../../../components/design-elements/Dropdown'
import MultiSelectDropdown from '../../../components/design-elements/MultiSelectDropdown'
import { toast } from 'react-toastify'

// Icons
import shareIcon from '/icons/acn/share.svg'
import editIcon from '/icons/acn/edit.svg'
import priceDropIcon from '/icons/acn/share.svg'
import { formatCost } from '../../../components/helper/formatCost'
import { camelCaseToCapitalizedWords } from '../../../components/helper/wordFormatter'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'

// Available fields for rejection reasons
// Available fields for rejection reasons - formatted for your MultiSelectDropdown
export const AVAILABLE_PROPERTY_FIELDS = [
    { label: 'Property Name', value: 'propertyName' },
    { label: 'Address', value: 'address' },
    { label: 'Area', value: 'area' },
    { label: 'Micromarket', value: 'micromarket' },
    { label: 'Map Location', value: 'mapLocation' },
    { label: 'Asset Type', value: 'assetType' },
    { label: 'Unit Type', value: 'unitType' },
    { label: 'Sub Type', value: 'subType' },
    { label: 'Community Type', value: 'communityType' },
    { label: 'SBUA (Super Built-up Area)', value: 'sbua' },
    { label: 'Carpet Area', value: 'carpet' },
    { label: 'Plot Size', value: 'plotSize' },
    { label: 'UDS (Undivided Share)', value: 'uds' },
    { label: 'Structure', value: 'structure' },
    { label: 'Building Age', value: 'buildingAge' },
    { label: 'Floor Number', value: 'floorNo' },
    { label: 'Exact Floor', value: 'exactFloor' },
    { label: 'Facing Direction', value: 'facing' },
    { label: 'Plot Facing', value: 'plotFacing' },
    { label: 'Balcony Facing', value: 'balconyFacing' },
    { label: 'Number of Balconies', value: 'noOfBalconies' },
    { label: 'Number of Bathrooms', value: 'noOfBathrooms' },
    { label: 'Car Parking', value: 'carPark' },
    { label: 'Corner Unit', value: 'cornerUnit' },
    { label: 'Extra Rooms', value: 'extraRoom' },
    { label: 'Furnishing Status', value: 'furnishing' },
    { label: 'Total Ask Price', value: 'totalAskPrice' },
    { label: 'Ask Price Per Sqft', value: 'askPricePerSqft' },
    { label: 'Price History', value: 'priceHistory' },
    { label: 'Rental Income', value: 'rentalIncome' },
    { label: 'Current Status', value: 'currentStatus' },
    { label: 'Exclusive Listing', value: 'exclusive' },
    { label: 'Tenanted Status', value: 'tenanted' },
    { label: 'E-Khata', value: 'eKhata' },
    { label: 'Building Khata', value: 'buildingKhata' },
    { label: 'Land Khata', value: 'landKhata' },
    { label: 'OC Received', value: 'ocReceived' },
    { label: 'BDA Approved', value: 'bdaApproved' },
    { label: 'BIAPPA Approved', value: 'biappaApproved' },
    { label: 'Handover Date', value: 'handoverDate' },
    { label: 'Photos', value: 'photo' },
    { label: 'Videos', value: 'video' },
    { label: 'Documents', value: 'document' },
    { label: 'Drive Link', value: 'driveLink' },
    { label: 'Extra Details', value: 'extraDetails' },
]

interface Note {
    id: string
    author: string
    date: string
    content: string
}

const QCPropertyDetailsPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { id } = useParams()

    // Redux state
    const {
        user: currentUser,
        agentData,
        loading: userLoading,
        authInitialized,
        error: userError,
    } = useSelector((state: RootState) => state.user)

    const {
        currentQCInventory: qcProperty,
        loading: qcLoading,
        error: qcError,
        updateLoading,
        noteLoading,
    } = useSelector((state: RootState) => state.qc)

    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [newNote, setNewNote] = useState('')
    const [comments, setComment] = useState('')
    const [notes] = useState<Note[]>([
        {
            id: '1',
            author: 'Samarth',
            date: '25 May',
            content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        },
        {
            id: '2',
            author: 'Siddharth',
            date: '25 May',
            content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        },
    ])
    const [reviewLoading, setReviewLoading] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState('')

    // New state for rejected fields and original property ID
    const [selectedRejectedFields, setSelectedRejectedFields] = useState<string[]>([])
    const [originalPropertyId, setOriginalPropertyId] = useState('')

    const WORD_LIMIT = 100

    // Calculate word count
    const wordCount = useMemo(() => {
        return newNote
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length
    }, [newNote])

    // Initialize auth listener
    useEffect(() => {
        console.log('🔄 Initializing auth listener')
        dispatch(initializeAuthListener())
    }, [dispatch])

    // Load QC property data when component mounts
    useEffect(() => {
        if (id) {
            console.log('🔄 Loading QC property for details:', id)
            dispatch(fetchQCInventoryById(id))
        }

        return () => {
            dispatch(clearCurrentQCInventory())
        }
    }, [id, dispatch])

    // Initialize rejected fields and original property ID from existing data
    useEffect(() => {
        if (qcProperty?.qcReview) {
            setSelectedRejectedFields(qcProperty.qcReview.rejectedFields || [])
            setOriginalPropertyId(qcProperty.qcReview.originalPropertyId || '')
        }
    }, [qcProperty])

    // Reset additional fields when status changes
    useEffect(() => {
        if (selectedStatus !== 'rejected') {
            setSelectedRejectedFields([])
        }
        if (selectedStatus !== 'duplicate') {
            setOriginalPropertyId('')
        }
    }, [selectedStatus])

    // Helper functions
    const getInitials = (name: string | undefined): string => {
        if (!name || typeof name !== 'string') return 'UN'
        return name.substring(0, 2).toUpperCase()
    }

    const safeDisplay = (value: any, fallback: string = 'N/A'): string => {
        if (value === null || value === undefined || value === '') {
            return fallback
        }
        return String(value)
    }

    const getActiveTab = () => {
        if (!qcProperty || !agentData) return 'kam'

        if (agentData.role === 'kamModerator') {
            if (qcProperty.stage === 'notApproved') {
                return 'kam'
            }
            if (qcProperty.stage === 'data') {
                return 'data'
            }
            return 'kam'
        } else if (agentData.role === 'data') {
            return 'data'
        } else {
            return 'kam'
        }
    }

    const handleStatusChange = async (status: string, comments: string) => {
        console.log('test', status, comments)
        if (!qcProperty || !agentData || !currentUser) {
            toast.error('Missing required data for status update')
            return
        }

        // Validation for rejected status
        if (status === 'rejected' && selectedRejectedFields.length === 0) {
            toast.error('Please select at least one rejected field')
            return
        }

        // Validation for duplicate status
        if (status === 'duplicate' && !originalPropertyId.trim()) {
            toast.error('Please enter the original property ID')
            return
        }

        setReviewLoading(true)
        setSelectedStatus(status)

        try {
            const activeTab = getActiveTab()

            // Prepare additional data for rejected and duplicate statuses
            const additionalData: any = {}
            if (status === 'rejected') {
                additionalData.rejectedFields = selectedRejectedFields
            }
            if (status === 'duplicate') {
                additionalData.originalPropertyId = originalPropertyId.trim()
            }

            await dispatch(
                updateQCStatusWithRoleCheck({
                    property: qcProperty,
                    status,
                    agentData: {
                        role: agentData.role,
                        email: agentData.email || currentUser.email || '',
                        phone: agentData.phone || '',
                        name: agentData.name || currentUser.displayName || '',
                        kamId: agentData.kamId || agentData.id,
                        id: agentData.id,
                    },
                    activeTab,
                    reviewedBy: currentUser.displayName || currentUser.email || 'Unknown User',
                    comments: comments,
                    additionalData, // Pass additional data
                }),
            ).unwrap()

            dispatch(fetchQCInventoryById(qcProperty.propertyId))
            toast.success(`Status updated successfully to ${status}`)

            setTimeout(() => {
                navigate('/acn/qc/dashboard')
            }, 2000)
        } catch (error: any) {
            console.error('❌ Error updating status:', error)
            toast.error(error || 'Failed to update status')
        } finally {
            setReviewLoading(false)
            setSelectedStatus('')
        }
    }

    const handleAddNote = async () => {
        if (!newNote.trim() || !qcProperty || !agentData || !currentUser) return

        try {
            await dispatch(
                addQCInventoryNote({
                    propertyId: qcProperty.propertyId,
                    details: newNote.trim(),
                    kamId: agentData.kamId || agentData.id,
                    kamName: agentData.name || currentUser.displayName || '',
                }),
            ).unwrap()

            setNewNote('')
            toast.success('Note added successfully')
        } catch (error: any) {
            toast.error(error || 'Failed to add note')
            console.error('Add note error:', error)
        }
    }

    const getReviewOptions = () => [
        {
            label: 'Approved',
            value: 'approved',
            color: '#E1F6DF',
            textColor: '#065F46',
        },
        {
            label: 'Rejected',
            value: 'rejected',
            color: '#FEECED',
            textColor: '#991B1B',
        },
        {
            label: 'Duplicate',
            value: 'duplicate',
            color: '#FFF3CD',
            textColor: '#B45309',
        },
        {
            label: 'Primary',
            value: 'primary',
            color: '#E0F2FE',
            textColor: '#0369A1',
        },
        {
            label: 'Pending',
            value: 'pending',
            color: '#F3F3F3',
            textColor: '#000000',
        },
    ]

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'duplicate':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'primary':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'pending':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const canEdit = () => {
        if (!qcProperty || !agentData) return false

        switch (agentData.role) {
            case 'kam':
                return qcProperty.stage === 'kam' || qcProperty.stage === 'notApproved'
            case 'data':
                return qcProperty.stage === 'data' && qcProperty.kamStatus === 'approved'
            case 'kamModerator':
                return true
            default:
                return false
        }
    }

    const getCurrentStatus = () => {
        if (!qcProperty) return 'pending'

        const activeTab = getActiveTab()

        if (qcProperty.stage === 'notApproved') {
            return qcProperty.kamStatus || 'pending'
        }

        if (activeTab === 'data') {
            return qcProperty.qcStatus || qcProperty.dataStatus || 'pending'
        } else {
            return qcProperty.kamStatus || 'pending'
        }
    }

    const getReviewSectionTitle = () => {
        const activeTab = getActiveTab()
        return activeTab === 'data' ? 'Data Review' : 'KAM Review'
    }

    // Carousel navigation functions
    const nextImage = () => {
        if (propertyImages.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length)
        }
    }

    const prevImage = () => {
        if (propertyImages.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length)
        }
    }

    const goToImage = (index: number) => {
        setCurrentImageIndex(index)
    }

    // Loading and error states
    if (!authInitialized || qcLoading || userLoading) {
        return (
            <Layout loading={true}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-lg'>
                        {!authInitialized ? 'Initializing authentication...' : 'Loading QC property details...'}
                    </div>
                </div>
            </Layout>
        )
    }

    if (qcError || userError) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center min-h-screen bg-white'>
                    <div className='text-center'>
                        <div className='text-lg text-red-600 mb-4'>
                            {qcError ? 'Error loading QC property' : 'Authentication error'}
                        </div>
                        <div className='text-sm text-gray-600 mb-4'>{qcError || userError}</div>
                        <div className='flex gap-2 justify-center'>
                            <button
                                onClick={() => {
                                    dispatch(clearError())
                                    if (id) dispatch(fetchQCInventoryById(id))
                                }}
                                className='px-4 py-2 text-white rounded'
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => navigate('/acn/qc/dashboard')}
                                className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
                            >
                                Back to QC Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    if (authInitialized && !currentUser) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-center'>
                        <div className='text-lg text-red-600'>Authentication Required</div>
                        <div className='text-sm text-gray-600 mt-2'>Please log in to access this page.</div>
                        <button
                            onClick={() => navigate('/login')}
                            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!qcProperty) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-center'>
                        <div className='text-lg'>QC property not found</div>
                        <button
                            onClick={() => navigate('/acn/qc/dashboard')}
                            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                        >
                            Back to QC Dashboard
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!agentData) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-center'>
                        <div className='text-lg text-red-600'>Access Denied</div>
                        <div className='text-sm text-gray-600 mt-2'>You are not authorized to access this page.</div>
                        <div className='text-xs text-gray-500 mt-1'>User: {currentUser?.email}</div>
                        <button
                            onClick={() => navigate('/acn/qc/dashboard')}
                            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                        >
                            Back to QC Dashboard
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    const propertyImages =
        qcProperty.photo && qcProperty.photo.length > 0
            ? qcProperty.photo
            : [
                  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
                  'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&h=600&fit=crop',
                  'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&h=600&fit=crop',
              ]

    const isOverLimit = wordCount > WORD_LIMIT

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-6 px-6 min-h-screen'>
                    {/* Breadcrumb */}
                    <div className='mb-4'>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <button onClick={() => navigate('/acn/qc/dashboard')} className='hover:text-gray-800'>
                                QC Dashboard
                            </button>
                            <span>/</span>
                            <span className='text-gray-900'>{safeDisplay(qcProperty.propertyId)}</span>
                        </div>
                    </div>

                    <hr className='border-gray-200 mb-4' />

                    {/* Header Actions */}
                    <div className='flex items-center gap-4 mb-0'>
                        <button
                            className='flex items-center h-8 gap-2 px-2 py-2 text-gray-700 bg-[#F3F3F3] border border-gray-300 rounded-md hover:bg-gray-50'
                            onClick={() => navigate(`/acn/qc/${qcProperty.propertyId}/edit`)}
                        >
                            <img src={editIcon} alt='Edit' className='w-4 h-4' />
                            <span> Edit Property</span>
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
                                            {safeDisplay(qcProperty.propertyName)}
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
                                                {safeDisplay(qcProperty.micromarket)}
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
                                                {safeDisplay(qcProperty.assetType)}
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
                                                {safeDisplay(qcProperty.unitType)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <div className='text-lg font-bold text-gray-900 mb-2'>
                                            {formatCost(qcProperty.totalAskPrice || 0)}
                                        </div>
                                    </div>
                                </div>

                                {/* Image Carousel */}
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
                                        <span className='font-medium capitalize'>
                                            {safeDisplay(qcProperty.assetType, 'Apartment')}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Bedrooms</span>
                                        <span className='font-medium'>
                                            {safeDisplay(qcProperty.unitType?.split(' ')[0] || '3')}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Sub Type</span>
                                        <span className='font-medium capitalize'>
                                            {safeDisplay(qcProperty.subType, 'Simplex')}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Bathrooms</span>
                                        <span className='font-medium'>
                                            {safeDisplay(qcProperty.noOfBathrooms, '3')}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Price</span>
                                        <span className='font-medium'>
                                            {formatCost(qcProperty.totalAskPrice || 15000000)}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Balconies</span>
                                        <span className='font-medium'>
                                            {safeDisplay(qcProperty.noOfBalconies, '3')}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Per Sqft Price</span>
                                        <span className='font-medium'>
                                            {formatCurrency(qcProperty.askPricePerSqft || 1500)} / Sqft
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Floor</span>
                                        <span className='font-medium'>
                                            {safeDisplay(
                                                qcProperty.floorNo
                                                    ? `${qcProperty.floorNo} Floor`
                                                    : 'Lower Floor (1-5)',
                                            )}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Area</span>
                                        <span className='font-medium'>
                                            {safeDisplay(qcProperty.sbua, '5500')} Sqft.
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Facing</span>
                                        <span className='font-medium capitalize'>
                                            {safeDisplay(qcProperty.facing, 'East')}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Possession</span>
                                        <span className='font-medium'>
                                            {safeDisplay(qcProperty.currentStatus, 'Ready to move')}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Furnishing</span>
                                        <span className='font-medium capitalize'>
                                            {safeDisplay(qcProperty.furnishing, 'Fully furnished')}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>KAM Status</span>
                                        <span className='font-medium'>
                                            {safeDisplay(qcProperty.kamStatus, 'Ready to move')}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Data Status</span>
                                        <span className='font-medium'>
                                            {safeDisplay(qcProperty.qcStatus, 'Ready to move')}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Age of Property</span>
                                        <span className='font-medium'>
                                            {safeDisplay(qcProperty.buildingAge, '2')} years
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Parking</span>
                                        <span className='font-medium'>{safeDisplay(qcProperty.carPark, '3')}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Age of Inventory</span>
                                        <span className='font-medium'>
                                            {safeDisplay(
                                                qcProperty.ageOfInventory
                                                    ? `${Math.floor(qcProperty.ageOfInventory / 30)}`
                                                    : '1',
                                            )}{' '}
                                            Month old
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Building Khata</span>
                                        <span className='font-medium'>
                                            {safeDisplay(qcProperty.buildingKhata, '-')}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Age of Status</span>
                                        <span className='font-medium'>
                                            {safeDisplay(
                                                qcProperty.ageOfStatus
                                                    ? `${Math.floor(qcProperty.ageOfStatus / 30)}`
                                                    : '1',
                                            )}{' '}
                                            Month old
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Land Khata</span>
                                        <span className='font-medium'>{safeDisplay(qcProperty.landKhata, '-')}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Date of Inventory Added</span>
                                        <span className='font-medium'>
                                            {qcProperty.dateOfInventoryAdded
                                                ? formatDate(qcProperty.dateOfInventoryAdded)
                                                : 'July 2024'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Tenanted</span>
                                        <span className='font-medium'>{qcProperty.tenanted ? 'Yes' : 'Yes'}</span>
                                    </div>
                                </div>

                                {/* Extra Details */}
                                <div className='mt-2'>
                                    <h3 className='font-medium text-gray-900 mb-3'>Extra Details</h3>
                                    <div className='bg-gray-50 rounded-lg p-4'>
                                        <ul className='space-y-1 text-sm text-gray-700'>
                                            <li>• 2 BHK + 2 T</li>
                                            <li>• 3 Balconies(west)</li>
                                            <li>• 1 closed parking</li>
                                            <li>• Semi furnished</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Location Details */}
                                <div className='mt-2'>
                                    <h3 className='font-medium text-gray-900 mb-2'>Location Details</h3>
                                    <div className='grid grid-cols-1 gap-0'>
                                        <div className='flex justify-between py-1 border-b border-gray-100'>
                                            <span className='text-gray-600'>Micromarket</span>
                                            <span className='font-medium'>
                                                {safeDisplay(qcProperty.micromarket, 'Bannerghatta')}
                                            </span>
                                        </div>
                                        <div className='flex justify-between py-1 border-b border-gray-100'>
                                            <span className='text-gray-600'>Area</span>
                                            <span className='font-medium'>
                                                {safeDisplay(qcProperty.area, 'North Bangalore')}
                                            </span>
                                        </div>
                                        <div className='flex justify-between py-1 border-b border-gray-100'>
                                            <span className='text-gray-600'>Address</span>
                                            <span className='font-medium'>
                                                {safeDisplay(
                                                    qcProperty.address,
                                                    '1579, 27th Main, 2nd sector, HSR Layout, Bangalore',
                                                )}
                                            </span>
                                        </div>
                                        <div className='flex justify-between py-1 border-b border-gray-100'>
                                            <span className='text-gray-600'>Coordinates</span>
                                            <span className='font-medium'>
                                                {qcProperty._geoloc
                                                    ? `${qcProperty._geoloc.lat}, ${qcProperty._geoloc.lng}`
                                                    : '13.2377419420783O3, 77.4484073426958T'}
                                            </span>
                                        </div>
                                        <div className='flex justify-between py-1 border-b border-gray-100'>
                                            <span className='text-gray-600'>Map</span>
                                            <button
                                                className='flex items-center gap-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800'
                                                onClick={() => {
                                                    const lat = qcProperty._geoloc?.lat || 13.2377419420783
                                                    const lng = qcProperty._geoloc?.lng || 77.4484073426958
                                                    window.open(`https://maps.google.com?q=${lat},${lng}`, '_blank')
                                                }}
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
                                                        d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                                                    />
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                                                    />
                                                </svg>
                                                Open Maps
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents Section */}
                                <div className='mt-2'>
                                    <h3 className='font-medium text-gray-900 mb-2'>Documents</h3>
                                    <div className='grid grid-cols-1 gap-3'>
                                        {[
                                            { name: 'Property Registration Document', type: 'PDF' },
                                            { name: 'Building Approval Certificate', type: 'PDF' },
                                        ].map((doc, index) => (
                                            <div
                                                key={index}
                                                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200'
                                            >
                                                <div className='flex items-center gap-3'>
                                                    <div className='w-8 h-8 bg-red-100 rounded flex items-center justify-center'>
                                                        <svg
                                                            className='w-4 h-4 text-red-600'
                                                            fill='currentColor'
                                                            viewBox='0 0 20 20'
                                                        >
                                                            <path
                                                                fillRule='evenodd'
                                                                d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z'
                                                                clipRule='evenodd'
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className='font-medium text-gray-900 text-sm'>
                                                            {doc.name}
                                                        </div>
                                                        <div className='text-xs text-gray-500'>{doc.type}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    className='px-3 py-1 text-sm text-blue-600 hover:text-blue-800'
                                                    onClick={() => toast.info('Document download would start here')}
                                                >
                                                    Download
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Review History */}
                                {(qcProperty.qcReview?.kamReview || qcProperty.qcReview?.dataReview) && (
                                    <div className='mt-2'>
                                        <h3 className='font-medium text-gray-900 mb-2'>Review History</h3>

                                        {/* KAM Review */}
                                        {qcProperty.qcReview?.kamReview && (
                                            <div className='mb-2 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                                                <div className='flex items-center justify-between mb-2'>
                                                    <h4 className='font-medium text-gray-900'>KAM Review</h4>
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getStatusBadgeColor(qcProperty.qcReview.kamReview.status)}`}
                                                    >
                                                        {toCapitalizedWords(qcProperty.qcReview.kamReview.status)}
                                                    </span>
                                                </div>
                                                <div className='text-sm text-gray-600 mb-2'>
                                                    <span className='font-medium'>Reviewed by:</span>{' '}
                                                    {qcProperty.qcReview.kamReview.reviewedBy}
                                                </div>
                                                <div className='text-sm text-gray-600 mb-2'>
                                                    <span className='font-medium'>Date:</span>{' '}
                                                    {formatDate(qcProperty.qcReview.kamReview.reviewDate)}
                                                </div>
                                                {qcProperty.qcReview.kamReview.comments && (
                                                    <div className='text-sm text-gray-700 mb-2'>
                                                        <span className='font-medium'>Comments:</span>{' '}
                                                        {qcProperty.qcReview.kamReview.comments}
                                                    </div>
                                                )}
                                                {qcProperty.qcReview.kamReview.status === 'rejected' &&
                                                    qcProperty.qcReview.rejectedFields && (
                                                        <div className='text-sm text-gray-700'>
                                                            <span className='font-medium'>Rejected Fields:</span>
                                                            <div className='flex flex-wrap gap-1 mt-1'>
                                                                {qcProperty.qcReview.rejectedFields.map(
                                                                    (field, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'
                                                                        >
                                                                            {AVAILABLE_PROPERTY_FIELDS.find(
                                                                                (f) => f.value === field,
                                                                            )?.label || field}
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                {qcProperty.qcReview.kamReview.status === 'duplicate' &&
                                                    qcProperty.qcReview.originalPropertyId && (
                                                        <div className='text-sm text-gray-700'>
                                                            <span className='font-medium'>Original Property ID:</span>{' '}
                                                            {qcProperty.qcReview.originalPropertyId}
                                                        </div>
                                                    )}
                                            </div>
                                        )}

                                        {/* Data Review */}
                                        {qcProperty.qcReview?.dataReview && (
                                            <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                                                <div className='flex items-center justify-between mb-2'>
                                                    <h4 className='font-medium text-gray-900'>Data Review</h4>
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getStatusBadgeColor(qcProperty.qcReview.dataReview.status)}`}
                                                    >
                                                        {toCapitalizedWords(qcProperty.qcReview.dataReview.status)}
                                                    </span>
                                                </div>
                                                <div className='text-sm text-gray-600 mb-2'>
                                                    <span className='font-medium'>Reviewed by:</span>{' '}
                                                    {qcProperty.qcReview.dataReview.reviewedBy}
                                                </div>
                                                <div className='text-sm text-gray-600 mb-2'>
                                                    <span className='font-medium'>Date:</span>{' '}
                                                    {formatDate(qcProperty.qcReview.dataReview.reviewDate)}
                                                </div>
                                                {qcProperty.qcReview.dataReview.comments && (
                                                    <div className='text-sm text-gray-700 mb-2'>
                                                        <span className='font-medium'>Comments:</span>{' '}
                                                        {qcProperty.qcReview.dataReview.comments}
                                                    </div>
                                                )}
                                                {qcProperty.qcReview.dataReview.status === 'rejected' &&
                                                    qcProperty.qcReview.rejectedFields && (
                                                        <div className='text-sm text-gray-700'>
                                                            <span className='font-medium'>Rejected Fields:</span>
                                                            <div className='flex flex-wrap gap-1 mt-1'>
                                                                {qcProperty.qcReview.rejectedFields.map(
                                                                    (field, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'
                                                                        >
                                                                            {AVAILABLE_PROPERTY_FIELDS.find(
                                                                                (f) => f.value === field,
                                                                            )?.label || field}
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                {qcProperty.qcReview.dataReview.status === 'duplicate' &&
                                                    qcProperty.qcReview.originalPropertyId && (
                                                        <div className='text-sm text-gray-700'>
                                                            <span className='font-medium'>Original Property ID:</span>{' '}
                                                            {qcProperty.qcReview.originalPropertyId}
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className='space-y-6'>
                            <div className='flex items-center gap-3 px-6'>
                                <div className='w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium'>
                                    {getInitials(qcProperty.kamName)}
                                </div>
                                <div>
                                    <div className='font-medium text-gray-900'>{safeDisplay(qcProperty.kamName)}</div>
                                    <div className='text-sm text-gray-600'>{safeDisplay(qcProperty.cpId)}</div>
                                </div>
                            </div>

                            {/* Review Section */}
                            <div className='bg-white rounded-lg px-6'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-4'>{getReviewSectionTitle()}</h3>

                                {!canEdit() && (
                                    <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                                        <div className='text-sm text-yellow-800'>
                                            {qcProperty.stage === 'notApproved'
                                                ? agentData.role === 'data'
                                                    ? 'Data team cannot edit properties in notApproved stage. Only KAM and KAM Moderators can update.'
                                                    : 'You cannot edit this property in its current stage'
                                                : agentData.role === 'data' && qcProperty.kamStatus !== 'approved'
                                                  ? 'You can only edit when KAM status is approved'
                                                  : 'You cannot edit this property in its current stage'}
                                        </div>
                                    </div>
                                )}

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Status</label>
                                    <Dropdown
                                        options={getReviewOptions()}
                                        onSelect={(status) => setSelectedStatus(status)}
                                        defaultValue={getCurrentStatus()}
                                        placeholder='Select Status'
                                        className='w-full'
                                        triggerClassName={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            !canEdit() || reviewLoading || updateLoading
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                        }`}
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                        optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md'
                                    />
                                </div>

                                {/* Rejected Fields Multiselect */}
                                {selectedStatus === 'rejected' && (
                                    <div className='mb-4'>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Rejected Fields <span className='text-red-500'>*</span>
                                        </label>
                                        <MultiSelectDropdown
                                            options={AVAILABLE_PROPERTY_FIELDS}
                                            selectedValues={selectedRejectedFields}
                                            onSelectionChange={setSelectedRejectedFields}
                                            placeholder='Select rejected fields...'
                                            className='w-full'
                                            triggerClassName='w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                            optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md'
                                        />
                                        {selectedRejectedFields.length === 0 && (
                                            <p className='text-xs text-red-500 mt-1'>
                                                Please select at least one rejected field
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Original Property ID Input */}
                                {selectedStatus === 'duplicate' && (
                                    <div className='mb-4'>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Original Property ID <span className='text-red-500'>*</span>
                                        </label>
                                        <input
                                            type='text'
                                            value={originalPropertyId}
                                            onChange={(e) => setOriginalPropertyId(e.target.value)}
                                            placeholder='Enter original property ID...'
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                                        />
                                        {!originalPropertyId.trim() && (
                                            <p className='text-xs text-red-500 mt-1'>
                                                Please enter the original property ID
                                            </p>
                                        )}
                                    </div>
                                )}

                                {(reviewLoading || updateLoading) && (
                                    <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                                        <div className='flex items-center gap-2'>
                                            <svg
                                                className='animate-spin h-4 w-4 text-blue-600'
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
                                            <div className='text-sm text-blue-700'>
                                                Updating status to {selectedStatus}...
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className='mb-2'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Reason</label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder='Add a note...'
                                        rows={3}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm'
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={() => {
                                        if (!canEdit()) {
                                            toast.error('You do not have permission to edit this property')
                                            return
                                        }

                                        if (!selectedStatus) {
                                            toast.error('Please select a status before submitting')
                                            return
                                        }

                                        const comment = comments.trim() || ''
                                        handleStatusChange(selectedStatus, comment)
                                    }}
                                    disabled={reviewLoading || updateLoading}
                                    className={`h-8 bg-gray-900 text-white px-4 rounded-md hover:bg-gray-800 transition-colors ${
                                        reviewLoading || updateLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {reviewLoading || updateLoading ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>

                            {/* Notes Section */}
                            <div className='bg-white rounded-lg px-6 py-6'>
                                <div className='flex items-center justify-between mb-4'>
                                    <h3 className='text-lg font-semibold text-gray-900'>Notes</h3>
                                    <button
                                        onClick={handleAddNote}
                                        disabled={noteLoading || !newNote.trim() || isOverLimit}
                                        className={`flex items-center gap-1 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 ${
                                            noteLoading || !newNote.trim() || isOverLimit
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                        }`}
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M12 4v16m8-8H4'
                                            />
                                        </svg>
                                        {noteLoading ? 'Adding...' : 'Add Note'}
                                    </button>
                                </div>

                                <div className='mb-4'>
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder='Add a note...'
                                        rows={4}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none text-sm ${
                                            isOverLimit
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    />
                                    <div className='flex justify-between items-center mt-2'>
                                        <div className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                                            {wordCount}/{WORD_LIMIT} words
                                            {isOverLimit && (
                                                <span className='ml-2 font-medium'>Word limit exceeded!</span>
                                            )}
                                        </div>
                                        {newNote.trim() && (
                                            <div className='text-xs text-gray-400'>Press Enter for new line</div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className='font-semibold text-gray-900 mb-4 text-base'>Previous Notes</h4>
                                    <div className='space-y-4 max-h-80 overflow-y-auto'>
                                        {qcProperty.notes && qcProperty.notes.length > 0
                                            ? qcProperty.notes.map((note, index) => (
                                                  <div key={index} className='space-y-2'>
                                                      <div className='text-sm text-gray-600'>
                                                          <span className='font-medium text-gray-900'>
                                                              {note.kamName}
                                                          </span>
                                                          {' on '}
                                                          <span>{formatDate(note.timestamp)}</span>
                                                      </div>
                                                      <div className='bg-gray-50 rounded-lg p-4 border border-gray-100'>
                                                          <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words'>
                                                              {note.details}
                                                          </p>
                                                      </div>
                                                  </div>
                                              ))
                                            : notes.map((note) => (
                                                  <div key={note.id} className='space-y-2'>
                                                      <div className='text-sm text-gray-600'>
                                                          <span className='font-medium text-gray-900'>
                                                              {note.author}
                                                          </span>
                                                          {' on '}
                                                          <span>{note.date}</span>
                                                      </div>
                                                      <div className='bg-gray-50 rounded-lg p-4 border border-gray-100'>
                                                          <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words'>
                                                              {note.content}
                                                          </p>
                                                      </div>
                                                  </div>
                                              ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default QCPropertyDetailsPage
