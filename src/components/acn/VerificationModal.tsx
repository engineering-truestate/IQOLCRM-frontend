import React, { useState } from 'react'

interface VerificationModalProps {
    isOpen: boolean
    onClose: () => void
    rowData: {
        id: string
        agentName: string
        contactNumber: string
        leadStatus: string
        connectStatus: string
        lastTried: string
    } | null
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, rowData }) => {
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        address: '',
        reraNo: '',
        firmName: '',
        firmSize: '',
        kam: '',
        leadSource: '',
    })

    const [selectedAreas, setSelectedAreas] = useState<string[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [firmSearchResults, setFirmSearchResults] = useState<string[]>([])
    const [showFirmDropdown, setShowFirmDropdown] = useState(false)

    // Mock firm data for search suggestions
    const firmDatabase = [
        'ABC Real Estate Pvt Ltd',
        'XYZ Properties',
        'Dream Home Realty',
        'Prime Location Consultants',
        'Urban Living Solutions',
        'Golden Gate Properties',
        'Metro Housing Services',
        'Prestige Real Estate',
    ]

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value })

        // Handle firm name search
        if (field === 'firmName') {
            if (value.length > 0) {
                const results = firmDatabase.filter((firm) => firm.toLowerCase().includes(value.toLowerCase()))
                setFirmSearchResults(results)
                setShowFirmDropdown(true)
            } else {
                setShowFirmDropdown(false)
            }
        }
    }

    const handleFirmSelect = (firmName: string) => {
        setFormData({ ...formData, firmName })
        setShowFirmDropdown(false)
    }

    const handleAreaToggle = (area: string) => {
        setSelectedAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
    }

    const handleCategoryToggle = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
        )
    }

    const handleVerify = () => {
        // Validation for mandatory fields
        const requiredFields: (keyof typeof formData)[] = ['name', 'phoneNumber', 'email', 'address']
        const missingFields = requiredFields.filter((field) => !formData[field].trim())

        if (missingFields.length > 0) {
            alert('Please fill all personal information fields')
            return
        }

        console.log('Verification data:', {
            formData,
            selectedAreas,
            selectedCategories,
        })
        onClose()
    }

    if (!isOpen || !rowData) return null

    const areas = ['North Bangalore', 'South Bangalore', 'East Bangalore', 'West Bangalore', 'Pan Bangalore']
    const categories = ['Resale', 'Rental', 'Primary']

    return (
        <>
            {/* Very light overlay - only covers left 60% */}
            <div className='fixed top-0 left-0 w-[60%] h-full bg-black opacity-50 z-40' onClick={onClose} />

            {/* Modal */}
            <div className='fixed top-0 right-0 h-full w-[40%] bg-white z-50 shadow-2xl border-l border-gray-200'>
                <div className='flex flex-col h-full'>
                    {/* Header */}
                    <div className='p-6 border-b border-gray-200'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-xl font-semibold text-gray-900'>Verify Agent Information</h2>
                            <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded-md'>
                                <svg
                                    className='w-5 h-5 text-gray-400'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
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

                    {/* Form Content */}
                    <div className='flex-1 p-6 overflow-y-auto'>
                        {/* Personal Information */}
                        <div className='mb-8'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>
                                Personal Information <span className='text-red-500'>*</span>
                            </h3>

                            <div className='grid grid-cols-2 gap-4 mb-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Name <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type='text'
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder='Enter agent name'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Phone number <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type='tel'
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        placeholder='Enter agent number'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                        required
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Email <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type='email'
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder='Enter agent email Id'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Address <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type='text'
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder='Enter agent address'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Background */}
                        <div className='mb-8'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>Professional Background</h3>

                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>RERA No.</label>
                                <input
                                    type='text'
                                    value={formData.reraNo}
                                    onChange={(e) => handleInputChange('reraNo', e.target.value)}
                                    placeholder='Enter RERA no.'
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4 mb-4'>
                                <div className='relative'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Firm Name</label>
                                    <div className='relative'>
                                        <div className='flex items-center'>
                                            <svg
                                                className='absolute left-3 w-4 h-4 text-gray-400'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                                />
                                            </svg>
                                            <input
                                                type='text'
                                                value={formData.firmName}
                                                onChange={(e) => handleInputChange('firmName', e.target.value)}
                                                placeholder='Search firm name'
                                                className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                            />
                                        </div>
                                        {showFirmDropdown && firmSearchResults.length > 0 && (
                                            <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto'>
                                                {firmSearchResults.map((firm, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleFirmSelect(firm)}
                                                        className='w-full px-3 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none first:rounded-t-lg last:rounded-b-lg'
                                                    >
                                                        {firm}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Firm Size</label>
                                    <input
                                        type='text'
                                        value={formData.firmSize}
                                        onChange={(e) => handleInputChange('firmSize', e.target.value)}
                                        placeholder='Enter firm size'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>KAM</label>
                                    <div className='relative'>
                                        <select
                                            value={formData.kam}
                                            onChange={(e) => handleInputChange('kam', e.target.value)}
                                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm appearance-none bg-white'
                                        >
                                            <option value=''>Select KAM</option>
                                            <option value='samarth'>Samarth</option>
                                            <option value='priya'>Priya</option>
                                            <option value='raj'>Raj</option>
                                        </select>
                                        <svg
                                            className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M19 9l-7 7-7-7'
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Lead Source</label>
                                    <div className='relative'>
                                        <select
                                            value={formData.leadSource}
                                            onChange={(e) => handleInputChange('leadSource', e.target.value)}
                                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm appearance-none bg-white'
                                        >
                                            <option value=''>Select Lead Source</option>
                                            <option value='website'>Website</option>
                                            <option value='referral'>Referral</option>
                                            <option value='social_media'>Social Media</option>
                                            <option value='advertisement'>Advertisement</option>
                                        </select>
                                        <svg
                                            className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M19 9l-7 7-7-7'
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Area of Operation */}
                        <div className='mb-8'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>Area of Operation</h3>
                            <div className='flex flex-wrap gap-3'>
                                {areas.map((area) => (
                                    <button
                                        key={area}
                                        onClick={() => handleAreaToggle(area)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedAreas.includes(area)
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {area}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Business Category */}
                        <div className='mb-8'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>Business Category</h3>
                            <div className='flex flex-wrap gap-3'>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryToggle(category)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedCategories.includes(category)
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className='p-6 border-t border-gray-200'>
                        <div className='flex items-center justify-between'>
                            <button
                                onClick={onClose}
                                className='px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
                            >
                                Close
                            </button>
                            <button
                                onClick={handleVerify}
                                className='px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors'
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default VerificationModal
