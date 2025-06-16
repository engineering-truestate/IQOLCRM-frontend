import React, { useState } from 'react'
import Dropdown from '../../components/design-elements/Dropdown'

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

    // Sample data for dropdowns with label-value format
    const propertyOptions = [
        { label: 'Select property name', value: '' },
        { label: 'Sunset Villa', value: 'sunset_villa' },
        { label: 'Ocean View Apartment', value: 'ocean_view_apt' },
        { label: 'Downtown Condo', value: 'downtown_condo' },
        { label: 'Garden Heights', value: 'garden_heights' },
        { label: 'Riverside Towers', value: 'riverside_towers' },
    ]

    const sourceOptions = [
        { label: 'Select Source', value: '' },
        { label: 'Website', value: 'website' },
        { label: 'Social Media', value: 'social_media' },
        { label: 'Referral', value: 'referral' },
        { label: 'Cold Call', value: 'cold_call' },
        { label: 'Advertisement', value: 'advertisement' },
        { label: 'Walk-in', value: 'walk_in' },
    ]

    const agentOptions = [
        { label: 'Select Agent', value: '' },
        { label: 'John Smith', value: 'john_smith' },
        { label: 'Sarah Johnson', value: 'sarah_johnson' },
        { label: 'Mike Wilson', value: 'mike_wilson' },
        { label: 'Emily Davis', value: 'emily_davis' },
        { label: 'Robert Brown', value: 'robert_brown' },
    ]

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
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
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed top-0 left-0 w-[75%] h-full bg-black opacity-50 z-40' onClick={onClose} />

            {/* Modal Container */}
            <div className='fixed top-0 right-0 h-full w-[25%] bg-white z-50 shadow-2xl border-l border-gray-200'>
                <div className='flex flex-col h-full'>
                    {/* Modal Header */}
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

                    {/* Modal Content */}
                    <div className='flex-1 p-6 overflow-y-auto'>
                        <div className='space-y-6'>
                            {/* Lead Name Input */}
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

                            {/* Phone Number Input */}
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

                            {/* Property Dropdown */}
                            <div>
                                <label className='block text-sm font-medium mb-2'>Property</label>
                                <Dropdown
                                    options={propertyOptions}
                                    onSelect={(value) => handleInputChange('property', value)}
                                    defaultValue={formData.property}
                                    placeholder='Select property name'
                                    className='w-full'
                                    triggerClassName='w-full px-4 py-2.5 border text-gray-500 font-medium text-xs border-gray-300 rounded-lg focus:outline-none focus:border-black appearance-none bg-white flex items-center justify-between text-left'
                                    menuClassName='absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto'
                                    optionClassName='w-fit px-4 py-2.5 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-sm'
                                />
                            </div>

                            {/* Source and Agent Row */}
                            <div className='grid grid-cols-2 gap-4'>
                                {/* Source Dropdown */}
                                <div>
                                    <label className='block text-sm font-medium mb-2'>Source</label>
                                    <Dropdown
                                        options={sourceOptions}
                                        onSelect={(value) => handleInputChange('source', value)}
                                        defaultValue={formData.source}
                                        placeholder='Select Source'
                                        className='w-full'
                                        triggerClassName='px-4 py-2.5 border border-gray-300 text-gray-500 font-medium rounded-lg focus:outline-none focus:border-black text-xs appearance-none bg-white flex items-center justify-between text-left'
                                        menuClassName='absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto'
                                        optionClassName='w-fit px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-sm'
                                    />
                                </div>

                                {/* Agent Dropdown */}
                                <div>
                                    <label className='block text-sm font-medium mb-2'>Agent</label>
                                    <Dropdown
                                        options={agentOptions}
                                        onSelect={(value) => handleInputChange('agent', value)}
                                        defaultValue={formData.agent}
                                        placeholder='Select Agent'
                                        className='w-full'
                                        triggerClassName='px-4 py-2.5 border border-gray-300 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-xs font-medium appearance-none bg-white flex items-center justify-between text-left'
                                        menuClassName='absolute z-50 mt-1 w-fit bg-white border border-gray-300 rounded-md shadow-lg'
                                        optionClassName='px-3  py-2 w-fit text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='p-6'>
                        <div className='flex items-center justify-center gap-6'>
                            <button
                                onClick={handleDiscard}
                                className='px-6 py-2 w-30 text-gray-600 bg-gray-100 rounded-sm hover:text-gray-800 text-sm font-medium transition-colors'
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                className='px-6 py-2 w-30 bg-blue-500 text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors'
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
