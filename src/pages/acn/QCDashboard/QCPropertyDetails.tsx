// QCPropertyDetailsPage.tsx - Add proper null checks
'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../../store/index'
import { fetchQCInventoryById, updateQCStatusWithRoleCheck } from '../../../services/acn/qc/qcService'
import { getCurrentUser, monitorAuthState } from '../../../services/user/userRoleService'
import { clearCurrentQCInventory, clearError } from '../../../store/reducers/acn/qcReducer'
import Layout from '../../../layout/Layout'
import Dropdown from '../../../components/design-elements/Dropdown'
import { toast } from 'react-toastify'

// Icons
import shareIcon from '/icons/acn/share.svg'
import editIcon from '/icons/acn/write.svg'
import priceDropIcon from '/icons/acn/share.svg'

interface Note {
    id: string
    author: string
    date: string
    content: string
}

const QCPropertyDetailsPage = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const dispatch = useDispatch<AppDispatch>()

    // Redux state
    const {
        currentQCInventory: qcProperty,
        loading: qcLoading,
        error: qcError,
    } = useSelector((state: RootState) => state.qc)

    const {
        currentUser,
        agentData,
        loading: userLoading,
        authInitialized,
        error: userError,
    } = useSelector((state: RootState) => state.user)

    const [_, setCurrentImageIndex] = useState(0)
    const [newNote, setNewNote] = useState('')
    const [notes, setNotes] = useState<Note[]>([
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

    // Initialize auth state monitoring
    useEffect(() => {
        console.log('🔄 Initializing auth state monitoring')
        dispatch(monitorAuthState())
        dispatch(getCurrentUser())
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

    // Helper function to safely get initials
    const getInitials = (name: string | undefined): string => {
        if (!name || typeof name !== 'string') return 'UN'
        return name.substring(0, 2).toUpperCase()
    }

    // Helper function to safely display text
    const safeDisplay = (value: any, fallback: string = 'N/A'): string => {
        if (value === null || value === undefined || value === '') {
            return fallback
        }
        return String(value)
    }

    // Determine active tab based on property stage and user role
    const getActiveTab = () => {
        if (!qcProperty || !agentData) return 'kam'

        if (agentData.role === 'kamModerator') {
            return qcProperty.stage === 'dataTeam' ? 'dataTeam' : 'kam'
        } else if (agentData.role === 'dataTeam') {
            return 'dataTeam'
        } else {
            return 'kam'
        }
    }

    const handleStatusChange = async (status: string) => {
        if (!qcProperty || !agentData || !currentUser) {
            toast.error('Missing required data for status update')
            return
        }

        setReviewLoading(true)
        setSelectedStatus(status)

        try {
            const activeTab = getActiveTab()

            await dispatch(
                updateQCStatusWithRoleCheck({
                    property: qcProperty,
                    status,
                    agentData,
                    activeTab,
                    reviewedBy: currentUser.displayName || currentUser.email || 'Unknown User',
                }),
            ).unwrap()

            // Refetch the data to get updated status
            dispatch(fetchQCInventoryById(qcProperty.propertyId))

            toast.success(`Status updated successfully to ${status}`)

            // Navigate back to dashboard after successful update
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

    const handleAddNote = () => {
        if (newNote.trim()) {
            const note: Note = {
                id: Date.now().toString(),
                author: currentUser?.displayName || currentUser?.email || 'Current User',
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                content: newNote.trim(),
            }
            setNotes((prev) => [note, ...prev])
            setNewNote('')
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

    // Check if user can edit based on role and property status
    const canEdit = () => {
        if (!qcProperty || !agentData || !qcProperty.qcReview) return false

        const activeTab = getActiveTab()

        switch (agentData.role) {
            case 'kam':
                return qcProperty.stage === 'kam'
            case 'dataTeam':
                return qcProperty.stage === 'dataTeam' && qcProperty.qcReview?.kamReview?.status === 'approved'
            case 'kamModerator':
                if (activeTab === 'kam') {
                    return qcProperty.stage === 'kam'
                } else {
                    return qcProperty.stage === 'dataTeam' && qcProperty.qcReview?.kamReview?.status === 'approved'
                }
            default:
                return false
        }
    }

    // Get current status based on active tab
    const getCurrentStatus = () => {
        if (!qcProperty || !qcProperty.qcReview) return 'pending'

        const activeTab = getActiveTab()

        if (activeTab === 'dataTeam') {
            return qcProperty.qcReview?.dataReview?.status || 'pending'
        } else {
            return qcProperty.qcReview?.kamReview?.status || 'pending'
        }
    }

    // Get review section title
    const getReviewSectionTitle = () => {
        const activeTab = getActiveTab()
        return activeTab === 'dataTeam' ? 'Data Review' : 'KAM Review'
    }

    // Loading state
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

    // Error state
    if (qcError || userError) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center min-h-screen'>
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
                                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
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

    // Not authenticated
    if (!currentUser) {
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

    // Not found state
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

    // No agent data
    if (!agentData) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-center'>
                        <div className='text-lg text-red-600'>Access Denied</div>
                        <div className='text-sm text-gray-600 mt-2'>You are not authorized to access this page.</div>
                        <div className='text-xs text-gray-500 mt-1'>User: {currentUser.email}</div>
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

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans bg-gray-50'>
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

                    {/* User Info Display */}
                    <div className='mb-4'>
                        <div className='flex items-center gap-4 text-sm'>
                            <div className='flex items-center gap-2'>
                                <span className='text-gray-600'>Logged in as:</span>
                                <span className='font-medium text-gray-900'>{safeDisplay(currentUser.email)}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='text-gray-600'>Role:</span>
                                <span
                                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                                        agentData.role === 'kamModerator'
                                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                                            : agentData.role === 'dataTeam'
                                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                                              : 'bg-green-100 text-green-800 border-green-200'
                                    }`}
                                >
                                    {agentData.role}
                                </span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='text-gray-600'>Active Tab:</span>
                                <span className='text-sm font-medium text-gray-900 capitalize'>{getActiveTab()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className='flex items-center gap-4 mb-6'>
                        <button className='flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'>
                            <img src={shareIcon} alt='Share' className='w-4 h-4' />
                            Share
                        </button>
                        <button className='flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'>
                            <img src={editIcon} alt='Edit' className='w-4 h-4' />
                            Edit Property
                        </button>
                        <button className='flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'>
                            <img src={priceDropIcon} alt='Price Drop' className='w-4 h-4' />
                            Price Drop
                        </button>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        {/* Main Content */}
                        <div className='lg:col-span-2 space-y-6'>
                            {/* Property Header */}
                            <div className='bg-white rounded-lg p-6'>
                                <div className='flex items-start justify-between mb-4'>
                                    <div>
                                        <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
                                            {safeDisplay(qcProperty.nameOfTheProperty)}
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
                                        <div className='text-2xl font-bold text-gray-900 mb-2'>
                                            {formatCurrency(qcProperty.totalAskPrice || 0)}
                                        </div>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium'>
                                                {getInitials(qcProperty.kamName)}
                                            </div>
                                            <div>
                                                <div className='font-medium text-gray-900'>
                                                    {safeDisplay(qcProperty.kamName)}
                                                </div>
                                                <div className='text-sm text-gray-600'>
                                                    {safeDisplay(qcProperty.cpCode)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Property Images */}
                                <div className='grid grid-cols-3 gap-4 mb-6'>
                                    {propertyImages.slice(0, 3).map((image, index) => (
                                        <div
                                            key={index}
                                            className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer ${
                                                index === 2 ? 'bg-gray-800' : ''
                                            }`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        >
                                            <img
                                                src={image}
                                                alt={`Property ${index + 1}`}
                                                className='w-full h-full object-cover'
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.src =
                                                        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
                                                }}
                                            />
                                            {index === 2 && propertyImages.length > 3 && (
                                                <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                                                    <button className='flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-md backdrop-blur-sm'>
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
                                                                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                                                            />
                                                        </svg>
                                                        View all photos ({propertyImages.length})
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Property Details */}
                            <div className='bg-white rounded-lg p-6'>
                                <h2 className='text-lg font-semibold text-gray-900 mb-6'>Property Details</h2>

                                <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Asset Type</span>
                                        <span className='font-medium capitalize'>
                                            {safeDisplay(qcProperty.assetType)}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Unit Type</span>
                                        <span className='font-medium'>{safeDisplay(qcProperty.unitType)}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>SBUA</span>
                                        <span className='font-medium'>{safeDisplay(qcProperty.sbua)} sq ft</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Carpet Area</span>
                                        <span className='font-medium'>{safeDisplay(qcProperty.carpet)} sq ft</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Plot Size</span>
                                        <span className='font-medium'>{safeDisplay(qcProperty.plotSize)} sq ft</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Facing</span>
                                        <span className='font-medium capitalize'>{safeDisplay(qcProperty.facing)}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Total Ask Price</span>
                                        <span className='font-medium'>
                                            {formatCurrency(qcProperty.totalAskPrice || 0)}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Ask Price Per Sqft</span>
                                        <span className='font-medium'>
                                            {formatCurrency(qcProperty.askPricePerSqft || 0)}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Handover Date</span>
                                        <span className='font-medium'>
                                            {formatDate(qcProperty.handoverDate || Date.now())}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Stage</span>
                                        <span className='font-medium capitalize'>{safeDisplay(qcProperty.stage)}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>KAM Status</span>
                                        <span
                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeColor(qcProperty.qcReview?.kamReview?.status || 'pending')}`}
                                        >
                                            {qcProperty.qcReview?.kamReview?.status || 'pending'}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Data Status</span>
                                        <span
                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeColor(qcProperty.qcReview?.dataReview?.status || 'pending')}`}
                                        >
                                            {qcProperty.qcReview?.dataReview?.status || 'pending'}
                                        </span>
                                    </div>
                                </div>

                                {qcProperty.extraDetails && (
                                    <div className='mt-6'>
                                        <h3 className='font-medium text-gray-900 mb-3'>Extra Details</h3>
                                        <p className='text-sm text-gray-600 leading-relaxed'>
                                            {qcProperty.extraDetails}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className='space-y-6'>
                            {/* Review Section */}
                            <div className='bg-white rounded-lg p-6'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-4'>{getReviewSectionTitle()}</h3>

                                {!canEdit() && (
                                    <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                                        <div className='text-sm text-yellow-800'>
                                            {agentData.role === 'dataTeam' &&
                                            qcProperty.qcReview?.kamReview?.status !== 'approved'
                                                ? 'You can only edit when KAM status is approved'
                                                : 'You cannot edit this property in its current stage'}
                                        </div>
                                    </div>
                                )}

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Status</label>
                                    <Dropdown
                                        options={getReviewOptions()}
                                        onSelect={handleStatusChange}
                                        defaultValue={getCurrentStatus()}
                                        placeholder='Select Status'
                                        className='w-full'
                                        //disabled={!canEdit() || reviewLoading}
                                        triggerClassName={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            !canEdit() || reviewLoading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                        optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md'
                                    />
                                </div>

                                {reviewLoading && (
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

                                {/* Review History */}
                                <div className='mb-6'>
                                    <h4 className='font-medium text-gray-900 mb-3'>Review History</h4>
                                    <div className='space-y-2'>
                                        {qcProperty.qcReview?.kamReview?.reviewDate && (
                                            <div className='flex justify-between'>
                                                <span className='text-gray-600'>KAM Review Date</span>
                                                <span className='font-medium'>
                                                    {formatDate(qcProperty.qcReview.kamReview.reviewDate)}
                                                </span>
                                            </div>
                                        )}
                                        {qcProperty.qcReview?.dataReview?.reviewDate && (
                                            <div className='flex justify-between'>
                                                <span className='text-gray-600'>Data Review Date</span>
                                                <span className='font-medium'>
                                                    {formatDate(qcProperty.qcReview.dataReview.reviewDate)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* QC History */}
                            <div className='bg-white rounded-lg p-6'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-4'>QC History</h3>
                                <div className='space-y-3 max-h-64 overflow-y-auto'>
                                    {qcProperty.qcHistory && qcProperty.qcHistory.length > 0 ? (
                                        qcProperty.qcHistory.map((item, index) => (
                                            <div key={index} className='border-b border-gray-100 pb-3 last:border-b-0'>
                                                <div className='flex justify-between items-start mb-1'>
                                                    <span className='text-sm font-medium text-gray-900'>
                                                        {safeDisplay(item.action)}
                                                    </span>
                                                    <span className='text-xs text-gray-500'>
                                                        {formatDate(item.date)}
                                                    </span>
                                                </div>
                                                <div className='text-xs text-gray-600'>
                                                    By: {safeDisplay(item.performedBy)}
                                                </div>
                                                <div className='text-xs text-gray-600 mt-1'>
                                                    {safeDisplay(item.details)}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='text-sm text-gray-500'>No history available</div>
                                    )}
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className='bg-white rounded-lg p-6'>
                                <div className='flex items-center justify-between mb-4'>
                                    <h3 className='text-lg font-semibold text-gray-900'>Notes</h3>
                                    <button
                                        onClick={handleAddNote}
                                        className='flex items-center gap-1 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50'
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M12 4v16m8-8H4'
                                            />
                                        </svg>
                                        Add Note
                                    </button>
                                </div>

                                <div className='mb-4'>
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder='Add a note...'
                                        rows={3}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm'
                                    />
                                </div>

                                <div>
                                    <h4 className='font-medium text-gray-900 mb-3'>Previous Notes</h4>
                                    <div className='space-y-4 max-h-80 overflow-y-auto'>
                                        {notes.map((note) => (
                                            <div
                                                key={note.id}
                                                className='border-b border-gray-100 pb-3 last:border-b-0'
                                            >
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <span className='font-medium text-sm text-gray-900'>
                                                        {note.author}
                                                    </span>
                                                    <span className='text-xs text-gray-500'>on {note.date}</span>
                                                </div>
                                                <p className='text-sm text-gray-600 leading-relaxed'>{note.content}</p>
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
