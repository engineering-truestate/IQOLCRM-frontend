import React, { useState } from 'react'

interface AddLeadModalProps {
    isOpen: boolean
    onClose: () => void
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        leadName: '',
        phoneNo: '',
        property: '',
        source: '',
        agent: '',
    })

    const [dropdownStates, setDropdownStates] = useState({
        property: false,
        source: false,
        agent: false,
    })

    // Sample data for dropdowns
    const properties = ['Sunset Villa', 'Ocean View Apartment', 'Downtown Condo', 'Garden Heights', 'Riverside Towers']

    const sources = ['Website', 'Social Media', 'Referral', 'Cold Call', 'Advertisement', 'Walk-in']

    const agents = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'Robert Brown']

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const toggleDropdown = (dropdown: keyof typeof dropdownStates) => {
        setDropdownStates((prev) => ({
            ...prev,
            [dropdown]: !prev[dropdown],
        }))
    }

    const selectOption = (field: keyof typeof formData, value: string) => {
        handleInputChange(field, value)
        setDropdownStates((prev) => ({
            ...prev,
            [field]: false,
        }))
    }

    const handleSave = () => {
        if (!formData.leadName || !formData.phoneNo) {
            alert('Please fill in all required fields (Lead Name, Phone No.)')
            return
        }

        console.log('Saving lead:', formData)
        alert('Lead saved successfully!')
        handleDiscard()
    }

    const handleDiscard = () => {
        setFormData({
            leadName: '',
            phoneNo: '',
            property: '',
            source: '',
            agent: '',
        })
        setDropdownStates({
            property: false,
            source: false,
            agent: false,
        })
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            {/* Very light overlay - only covers left 60% */}
            <div className='fixed top-0 left-0 w-[75%] h-full bg-black opacity-50 z-40' onClick={onClose} />

            {/* Modal */}
            <div className='fixed top-0 right-0 h-full w-[25%] bg-white z-50 shadow-2xl border-l border-gray-200'>
                <div className='flex flex-col h-full'>
                    {/* Header */}
                    <div>
                        <div className='flex items-center justify-between p-6 pb-0'>
                            <h2 className='text-xl font-semibold text-black'>Add Lead</h2>
                            <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded-md'>
                                <svg
                                    width='20'
                                    height='20'
                                    viewBox='0 0 20 20'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'
                                >
                                    <path
                                        d='M0 10C0 15.522 4.477 20 10 20C15.523 20 20 15.522 20 10C20 4.477 15.523 0 10 0C4.477 0 0 4.477 0 10ZM6.757 5.343L10 8.586L13.243 5.343C13.706 4.863 14.177 4.863 14.657 5.343C15.137 5.823 15.137 6.294 14.657 6.757L11.414 10L14.657 13.243C15.128 13.714 15.128 14.185 14.657 14.657C14.185 15.128 13.714 15.128 13.243 14.657L10 11.414L6.757 14.657C6.297 15.139 5.825 15.139 5.343 14.657C4.861 14.175 4.861 13.703 5.343 13.243L8.586 10L5.343 6.757C4.871 6.287 4.871 5.815 5.343 5.343C5.815 4.871 6.287 4.871 6.757 5.343Z'
                                        fill='#3A3A47'
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className='flex-1 p-6 overflow-y-auto'>
                        <div className='space-y-6'>
                            {/* Lead Name */}
                            <div>
                                <label className='block text-sm font-medium mb-2'>Lead Name</label>
                                <input
                                    type='text'
                                    value={formData.leadName}
                                    onChange={(e) => handleInputChange('leadName', e.target.value)}
                                    placeholder='Enter lead name'
                                    className='w-full px-4 py-2.5 border font-medium border-gray-300 rounded-lg focus:outline-none focus:border-black text-xs'
                                />
                            </div>

                            {/* Phone No. */}
                            <div>
                                <label className='block text-sm font-medium mb-2'>Phone No.</label>
                                <input
                                    type='tel'
                                    value={formData.phoneNo}
                                    onChange={(e) => handleInputChange('phoneNo', e.target.value)}
                                    placeholder='Enter phone no.'
                                    className='w-full px-4 py-2.5 border font-medium border-gray-300 rounded-lg focus:outline-none focus:border-black text-xs'
                                />
                            </div>

                            {/* Property */}
                            <div className='relative'>
                                <label className='block text-sm font-medium mb-2'>Property</label>
                                <button
                                    type='button'
                                    onClick={() => toggleDropdown('property')}
                                    className='w-full px-4 py-2.5 border font-medium text-xs border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm appearance-none bg-white flex items-center justify-between text-left'
                                >
                                    <span className={formData.property ? 'text-gray-900' : 'text-gray-500'}>
                                        {formData.property || 'Select property name'}
                                    </span>
                                    <svg
                                        className='w-4 h-4 text-gray-400 pointer-events-none'
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
                                </button>
                                {dropdownStates.property && (
                                    <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto'>
                                        {properties.map((property, index) => (
                                            <button
                                                key={index}
                                                type='button'
                                                onClick={() => selectOption('property', property)}
                                                className='w-full px-4 py-2.5 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-sm'
                                            >
                                                {property}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Source and Agent Row */}
                            <div className='grid grid-cols-2 gap-4'>
                                {/* Source */}
                                <div className='relative'>
                                    <label className='block text-sm font-medium mb-2'>Source</label>
                                    <button
                                        type='button'
                                        onClick={() => toggleDropdown('source')}
                                        className='w-full px-4 py-2.5 border border-gray-300 font-medium rounded-lg focus:outline-none focus:border-black text-xs appearance-none bg-white flex items-center justify-between text-left'
                                    >
                                        <span className={formData.source ? 'text-gray-900' : 'text-gray-500'}>
                                            {formData.source || 'Select Source'}
                                        </span>
                                        <svg
                                            className='w-4 h-4 text-gray-400 pointer-events-none'
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
                                    </button>
                                    {dropdownStates.source && (
                                        <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto'>
                                            {sources.map((source, index) => (
                                                <button
                                                    key={index}
                                                    type='button'
                                                    onClick={() => selectOption('source', source)}
                                                    className='w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-sm'
                                                >
                                                    {source}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Agent */}
                                <div className='relative'>
                                    <label className='block text-sm font-medium mb-2'>Agent</label>
                                    <button
                                        type='button'
                                        onClick={() => toggleDropdown('agent')}
                                        className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-xs font-medium appearance-none bg-white flex items-center justify-between text-left'
                                    >
                                        <span className={formData.agent ? 'text-gray-900' : 'text-gray-500'}>
                                            {formData.agent || 'Select Agent'}
                                        </span>
                                        <svg
                                            className='w-4 h-4 text-gray-400 pointer-events-none'
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
                                    </button>
                                    {dropdownStates.agent && (
                                        <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto'>
                                            {agents.map((agent, index) => (
                                                <button
                                                    key={index}
                                                    type='button'
                                                    onClick={() => selectOption('agent', agent)}
                                                    className='w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-sm'
                                                >
                                                    {agent}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className='p-6'>
                        <div className='flex items-center justify-center gap-6'>
                            <button
                                onClick={handleDiscard}
                                className='p-2 text-gray-600 bg-gray-100 rounded-sm h-8 w-30 hover:text-gray-800 text-sm font-medium transition-colors'
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                className='p-2 bg-blue-500 text-white rounded-sm h-8 w-30 text-sm font-medium hover:bg-blue-600 transition-colors'
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddLeadModal
