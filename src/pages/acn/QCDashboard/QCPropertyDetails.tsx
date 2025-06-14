'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import Dropdown from '../../../components/design-elements/Dropdown'
import { generateQCProperties, type QCProperty, type QCReviewStatus } from '../../dummy_data/acn_qc_dummy_data'

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

    const [property, setProperty] = useState<QCProperty | null>(null)
    const [loading, setLoading] = useState(true)
    const [_, setCurrentImageIndex] = useState(0)
    const [newNote, setNewNote] = useState('')
    const [notes, setNotes] = useState<Note[]>([
        {
            id: '1',
            author: 'Samarth',
            date: '25 May',
            content:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a",
        },
        {
            id: '2',
            author: 'Siddharth',
            date: '25 May',
            content:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a",
        },
    ])

    // Sample property images
    const propertyImages = [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&h=600&fit=crop',
    ]

    useEffect(() => {
        if (id) {
            setLoading(true)

            // Simulate API call
            const fetchProperty = async () => {
                try {
                    const sampleData = generateQCProperties(300)
                    const foundProperty = sampleData.find((p) => p.id === id)

                    if (foundProperty) {
                        setProperty(foundProperty)
                    } else {
                        console.error('Property not found')
                        navigate('/acn/qc/dashboard')
                    }
                } catch (error) {
                    console.error('Error fetching property:', error)
                } finally {
                    setLoading(false)
                }
            }

            fetchProperty()
        }
    }, [id, navigate])

    const handleKamStatusChange = (option: string) => {
        const newStatus = option as QCReviewStatus
        if (property) {
            const updatedProperty = { ...property }

            // Update kam review status
            updatedProperty.kamReviewed = newStatus
            updatedProperty.kamReviewDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

            // If kam approves, data review becomes pending
            // If kam rejects/duplicate/primary, data review becomes pending (but won't show in data table)
            if (newStatus === 'approved') {
                updatedProperty.dataReviewed = 'pending'
            } else if (newStatus !== 'pending') {
                updatedProperty.dataReviewed = 'pending'
            }

            setProperty(updatedProperty)

            // Simulate API call to update the property
            console.log('Updated property:', updatedProperty)

            // Navigate back to QC dashboard after a brief delay to show the change
            setTimeout(() => {
                navigate('/acn/qc/dashboard')
            }, 1500)
        }
    }

    const handleDataStatusChange = (option: string) => {
        const newStatus = option as QCReviewStatus
        if (property) {
            const updatedProperty = { ...property }

            // Update data review status
            updatedProperty.dataReviewed = newStatus
            updatedProperty.dataReviewDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

            setProperty(updatedProperty)

            // Simulate API call to update the property
            console.log('Updated property:', updatedProperty)

            // Navigate back to QC dashboard after a brief delay to show the change
            setTimeout(() => {
                navigate('/acn/qc/dashboard')
            }, 1500)
        }
    }

    const handleNotApprovedStatusChange = (option: string) => {
        const newStatus = option as QCReviewStatus
        if (property) {
            const updatedProperty = { ...property }

            // For not approved items, we're changing the kam review status
            updatedProperty.kamReviewed = newStatus
            updatedProperty.kamReviewDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

            // Reset data review to pending
            updatedProperty.dataReviewed = 'pending'

            setProperty(updatedProperty)

            // Simulate API call to update the property
            console.log('Updated property:', updatedProperty)

            // Navigate back to QC dashboard after a brief delay to show the change
            setTimeout(() => {
                navigate('/acn/qc/dashboard')
            }, 1500)
        }
    }

    const handleAddNote = () => {
        if (newNote.trim()) {
            const note: Note = {
                id: Date.now().toString(),
                author: 'Current User',
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                content: newNote.trim(),
            }
            setNotes((prev) => [note, ...prev])
            setNewNote('')
        }
    }

    const getKamReviewOptions = () => [
        {
            label: 'Approved',
            value: 'approved',
            color: '#E1F6DF',
            textColor: '#065F46',
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
            label: 'Reject',
            value: 'reject',
            color: '#FEECED',
            textColor: '#991B1B',
        },
    ]

    const getDataReviewOptions = () => [
        {
            label: 'Approved',
            value: 'approved',
            color: '#E1F6DF',
            textColor: '#065F46',
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
            label: 'Reject',
            value: 'reject',
            color: '#FEECED',
            textColor: '#991B1B',
        },
    ]

    const getStatusBadgeColor = (status: QCReviewStatus) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'duplicate':
                return 'bg-yellow-100 text-yellow-800'
            case 'primary':
                return 'bg-blue-100 text-blue-800'
            case 'reject':
                return 'bg-red-100 text-red-800'
            case 'pending':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getDisplayStatus = (status: QCReviewStatus) => {
        return status.charAt(0).toUpperCase() + status.slice(1)
    }

    // Determine which review section to show based on property status
    const getReviewSection = () => {
        if (!property) return null

        // If kam is pending, show kam review
        if (property.kamReviewed === 'pending') {
            return {
                title: 'Kam Review',
                currentStatus: property.kamReviewed,
                options: getKamReviewOptions(),
                onStatusChange: handleKamStatusChange,
            }
        }
        // If kam is approved and data is pending, show data review
        else if (property.kamReviewed === 'approved' && property.dataReviewed === 'pending') {
            return {
                title: 'Data Review',
                currentStatus: property.dataReviewed,
                options: getDataReviewOptions(),
                onStatusChange: handleDataStatusChange,
            }
        }
        // If it's in not approved state, show kam review (to allow re-review)
        else if (
            (property.kamReviewed as QCReviewStatus) !== 'pending' &&
            (property.kamReviewed as QCReviewStatus) !== 'approved'
        ) {
            return {
                title: 'Kam Review',
                currentStatus: property.kamReviewed,
                options: getKamReviewOptions(),
                onStatusChange: handleNotApprovedStatusChange,
            }
        }
        // If data is not approved, show kam review (to allow re-review)
        else if (
            property.kamReviewed === 'approved' &&
            property.dataReviewed !== 'pending' &&
            property.dataReviewed !== 'approved'
        ) {
            return {
                title: 'Kam Review',
                currentStatus: property.kamReviewed,
                options: getKamReviewOptions(),
                onStatusChange: handleNotApprovedStatusChange,
            }
        }

        return null
    }

    if (loading) {
        return (
            <Layout loading={true}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-lg'>Loading...</div>
                </div>
            </Layout>
        )
    }

    if (!property) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-lg'>Property not found</div>
                </div>
            </Layout>
        )
    }

    const reviewSection = getReviewSection()

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
                            <span className='text-gray-900'>{property.id}</span>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className='flex items-center gap-4 mb-6'>
                        <button className='flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'>
                            <img src={shareIcon} alt='Share' className='w-4 h-4' />
                            Share
                        </button>
                        <button
                            onClick={() => navigate(`/acn/properties/${property.id}/details`)}
                            className='flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                        >
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
                                            {property.projectName}
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
                                                Micromarket
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
                                                Handover
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
                                                Asset Type
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
                                                Unit Type
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <div className='text-2xl font-bold text-gray-900 mb-2'>{property.price}</div>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium'>
                                                {property.kam.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className='font-medium text-gray-900'>{property.agent}</div>
                                                <div className='text-sm text-gray-600'>
                                                    CPA001 | {property.phoneNumber}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Property Images */}
                                <div className='grid grid-cols-3 gap-4 mb-6'>
                                    {propertyImages.map((image, index) => (
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
                                            />
                                            {index === 2 && (
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
                                                        View all photos
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
                                        <span className='text-gray-600'>Property Type</span>
                                        <span className='font-medium'>Apartment</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Asset Type</span>
                                        <span className='font-medium'>{property.assetType}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Price</span>
                                        <span className='font-medium'>{property.price}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>SBUA</span>
                                        <span className='font-medium'>{property.sbua}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Plot Size</span>
                                        <span className='font-medium'>{property.plotSize}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Agent</span>
                                        <span className='font-medium'>{property.agent}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Phone Number</span>
                                        <span className='font-medium'>{property.phoneNumber}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Micromarket</span>
                                        <span className='font-medium'>{property.micromarket}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>KAM</span>
                                        <span className='font-medium'>{property.kam}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Created Date</span>
                                        <span className='font-medium'>{property.createdDate}</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>KAM Review Status</span>
                                        <span
                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeColor(property.kamReviewed)}`}
                                        >
                                            {getDisplayStatus(property.kamReviewed)}
                                        </span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Data Review Status</span>
                                        <span
                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeColor(property.dataReviewed)}`}
                                        >
                                            {getDisplayStatus(property.dataReviewed)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className='space-y-6'>
                            {/* Review Status Section */}
                            {reviewSection && (
                                <div className='bg-white rounded-lg p-6'>
                                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>{reviewSection.title}</h3>

                                    <div className='mb-4'>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>Status</label>
                                        <Dropdown
                                            options={reviewSection.options}
                                            onSelect={reviewSection.onStatusChange}
                                            defaultValue={reviewSection.currentStatus}
                                            placeholder='Select Status'
                                            className='w-full'
                                            triggerClassName='w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                            optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md'
                                        />
                                    </div>

                                    {/* Review History */}
                                    <div className='mb-6'>
                                        <h4 className='font-medium text-gray-900 mb-3'>Review History</h4>
                                        <div className='space-y-2'>
                                            {property.kamReviewDate && (
                                                <div className='flex justify-between'>
                                                    <span className='text-gray-600'>KAM Review Date</span>
                                                    <span className='font-medium'>{property.kamReviewDate}</span>
                                                </div>
                                            )}
                                            {property.dataReviewDate && (
                                                <div className='flex justify-between'>
                                                    <span className='text-gray-600'>Data Review Date</span>
                                                    <span className='font-medium'>{property.dataReviewDate}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

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

                                {/* Add Note Input */}
                                <div className='mb-4'>
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder='Add a note...'
                                        rows={3}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm'
                                    />
                                </div>

                                {/* Previous Notes */}
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
