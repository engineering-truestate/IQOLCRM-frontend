'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import Dropdown from '../../../components/design-elements/Dropdown'
import {
    generateProperties,
    type Property,
    type PropertyStatus,
} from '../../../pages/dummy_data/acn_properties_inventory_dummy_data'

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

const PropertyDetailsPage = () => {
    const navigate = useNavigate()
    const { pId } = useParams<{ pId: string }>()

    const [property, setProperty] = useState<Property | null>(null)
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
        if (pId) {
            setLoading(true)

            // Simulate API call
            const fetchProperty = async () => {
                try {
                    const sampleData = generateProperties(200, 'Resale')
                    const foundProperty = sampleData.find((p) => p.id === pId)

                    if (foundProperty) {
                        setProperty(foundProperty)
                    } else {
                        console.error('Property not found')
                        navigate('/acn/properties')
                    }
                } catch (error) {
                    console.error('Error fetching property:', error)
                } finally {
                    setLoading(false)
                }
            }

            fetchProperty()
        }
    }, [pId, navigate])

    const handleStatusChange = (option: string) => {
        const newStatus = option as PropertyStatus
        if (property) {
            setProperty((prev) => (prev ? { ...prev, status: newStatus } : null))
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
            label: 'Delisted',
            value: 'Delisted',
            color: '#F3F4F6',
            textColor: '#374151',
        },
    ]

    // const getStatusColor = (status: PropertyStatus) => {
    //     switch (status) {
    //         case 'Available':
    //             return 'bg-green-100 text-green-800'
    //         case 'Sold':
    //             return 'bg-red-100 text-red-800'
    //         case 'Hold':
    //             return 'bg-orange-100 text-orange-800'
    //         case 'Delisted':
    //             return 'bg-gray-100 text-gray-800'
    //         default:
    //             return 'bg-gray-100 text-gray-800'
    //     }
    // }

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

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans bg-gray-50'>
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

                    {/* Header Actions */}
                    <div className='flex items-center gap-4 mb-6'>
                        <button className='flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'>
                            <img src={shareIcon} alt='Share' className='w-4 h-4' />
                            Share
                        </button>
                        <button
                            onClick={() => navigate(`/acn/properties/${pId}/edit`)}
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
                                            {property.propertyName}
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
                                        <div className='text-2xl font-bold text-gray-900 mb-2'>
                                            {property.salePrice || property.monthlyRent}
                                        </div>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium'>
                                                HR
                                            </div>
                                            <div>
                                                <div className='font-medium text-gray-900'>{property.agentName}</div>
                                                <div className='text-sm text-gray-600'>CPA001 | 8118823650</div>
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
                                        <span className='text-gray-600'>Bedrooms</span>
                                        <span className='font-medium'>3</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Sub Type</span>
                                        <span className='font-medium'>Simplex</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Bathrooms</span>
                                        <span className='font-medium'>3</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Price</span>
                                        <span className='font-medium'>1.5 Cr.</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Balconies</span>
                                        <span className='font-medium'>3</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Per Sqft Price</span>
                                        <span className='font-medium'>1500 / Sqft</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Floor</span>
                                        <span className='font-medium'>Lower Floor (1-5)</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Area</span>
                                        <span className='font-medium'>5500 Sqft.</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Facing</span>
                                        <span className='font-medium'>East</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Possession</span>
                                        <span className='font-medium'>Ready to move</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Furnishing</span>
                                        <span className='font-medium'>Fully furnished</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Age of Property</span>
                                        <span className='font-medium'>2 years</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Parking</span>
                                        <span className='font-medium'>3</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Age of Inventory:</span>
                                        <span className='font-medium'>1 Month old</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Building Khata:</span>
                                        <span className='font-medium'>-</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Age of Status:</span>
                                        <span className='font-medium'>1 Month old</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Land Khata:</span>
                                        <span className='font-medium'>-</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Date of Inventory Added:</span>
                                        <span className='font-medium'>July 2024</span>
                                    </div>
                                    <div className='flex justify-between py-2 border-b border-gray-100'>
                                        <span className='text-gray-600'>Tenanted:</span>
                                        <span className='font-medium'>Yes</span>
                                    </div>
                                </div>

                                {/* Extra Details */}
                                <div className='mt-6'>
                                    <h3 className='font-medium text-gray-900 mb-3'>Extra Details</h3>
                                    <ul className='space-y-1 text-sm text-gray-600'>
                                        <li>• 2 BHK + 2 T</li>
                                        <li>• 3 Balconies(west)</li>
                                        <li>• 1 closed parking</li>
                                        <li>• Semi furnished</li>
                                    </ul>
                                </div>

                                {/* Location Details */}
                                <div className='mt-6'>
                                    <h3 className='font-medium text-gray-900 mb-3'>Location Details</h3>
                                    <div className='space-y-2 text-sm'>
                                        <div className='flex justify-between'>
                                            <span className='text-gray-600'>Micromarket</span>
                                            <span className='font-medium'>Bannerghatta</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-gray-600'>Area</span>
                                            <span className='font-medium'>North Bangalore</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-gray-600'>Address</span>
                                            <span className='font-medium'>
                                                1579, 27th Main, 2nd sector, HSR Layout, Bangalore
                                            </span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-gray-600'>Coordinates</span>
                                            <span className='font-medium'>13.237741942078303, 77.44840734269587</span>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-gray-600'>Map</span>
                                            <button className='px-3 py-1 bg-gray-900 text-white text-xs rounded'>
                                                Open Maps
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className='space-y-6'>
                            {/* Update Inventory Status */}
                            <div className='bg-white rounded-lg p-6'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Update Inventory Status</h3>

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Status</label>
                                    <Dropdown
                                        options={getStatusOptions()}
                                        onSelect={handleStatusChange}
                                        defaultValue={property.status}
                                        placeholder='Select Status'
                                        className='w-full'
                                        triggerClassName='w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                        optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md'
                                    />
                                </div>

                                {/* Inventory Performance */}
                                <div className='mb-6'>
                                    <h4 className='font-medium text-gray-900 mb-3'>Inventory Performance</h4>
                                    <div className='space-y-2'>
                                        <div className='flex justify-between'>
                                            <span className='text-gray-600'>Enquiries</span>
                                            <span className='font-medium'>15</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-gray-600'>Inv Score</span>
                                            <span className='font-medium'>50 / 100</span>
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

export default PropertyDetailsPage
