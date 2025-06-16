import React, { useState } from 'react'
import Dropdown from '../../components/design-elements/Dropdown'

interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        task: '',
        dueDate: '',
        dueTime: '',
        assignedTo: '',
        priority: '',
        status: '',
    })

    // Task type options
    const taskOptions = [
        { label: 'Please select', value: '' },
        { label: 'Follow-up Call', value: 'follow_up_call' },
        { label: 'Site Visit', value: 'site_visit' },
        { label: 'Document Review', value: 'document_review' },
        { label: 'Property Inspection', value: 'property_inspection' },
        { label: 'Client Meeting', value: 'client_meeting' },
        { label: 'Email Follow-up', value: 'email_followup' },
        { label: 'Contract Preparation', value: 'contract_preparation' },
        { label: 'Property Listing', value: 'property_listing' },
    ]

    // Assigned to options
    const assignedToOptions = [
        { label: 'Select Agent', value: '' },
        { label: 'John Smith', value: 'john_smith' },
        { label: 'Sarah Johnson', value: 'sarah_johnson' },
        { label: 'Mike Wilson', value: 'mike_wilson' },
        { label: 'Emily Davis', value: 'emily_davis' },
        { label: 'Robert Brown', value: 'robert_brown' },
    ]

    // Priority options
    const priorityOptions = [
        { label: 'Select Priority', value: '' },
        { label: 'Low', value: 'low', color: '#10B981', textColor: '#ffffff' },
        { label: 'Medium', value: 'medium', color: '#F59E0B', textColor: '#ffffff' },
        { label: 'High', value: 'high', color: '#EF4444', textColor: '#ffffff' },
        { label: 'Urgent', value: 'urgent', color: '#DC2626', textColor: '#ffffff' },
    ]

    // Status options
    const statusOptions = [
        { label: 'Select Status', value: '' },
        { label: 'Not Started', value: 'not_started', color: '#6B7280', textColor: '#ffffff' },
        { label: 'In Progress', value: 'in_progress', color: '#3B82F6', textColor: '#ffffff' },
        { label: 'Completed', value: 'completed', color: '#10B981', textColor: '#ffffff' },
        { label: 'On Hold', value: 'on_hold', color: '#F59E0B', textColor: '#ffffff' },
    ]

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSave = () => {
        if (!formData.task || !formData.dueDate) {
            alert('Please fill in all required fields (Task, Due Date)')
            return
        }

        console.log('Creating task:', formData)
        alert('Task created successfully!')
        handleDiscard()
    }

    const handleDiscard = () => {
        setFormData({
            task: '',
            dueDate: '',
            dueTime: '',
            assignedTo: '',
            priority: '',
            status: '',
        })
        onClose()
    }

    // Get current date in YYYY-MM-DD format for min date
    const getCurrentDate = () => {
        const today = new Date()
        return today.toISOString().split('T')[0]
    }

    if (!isOpen) return null

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed inset-0 bg-black opacity-66 z-40' onClick={onClose} />

            {/* Modal Container */}
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[480px] bg-white z-50 rounded-lg shadow-2xl'>
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6 pb-4'>
                        <h2 className='text-xl font-semibold text-gray-900'>Create Task</h2>
                        <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded-md transition-colors'>
                            <svg
                                width='20'
                                height='21'
                                viewBox='0 0 20 21'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M10.0013 18.8337C14.5846 18.8337 18.3346 15.0837 18.3346 10.5003C18.3346 5.91699 14.5846 2.16699 10.0013 2.16699C5.41797 2.16699 1.66797 5.91699 1.66797 10.5003C1.66797 15.0837 5.41797 18.8337 10.0013 18.8337Z'
                                    stroke='#515162'
                                    stroke-width='1.5'
                                    stroke-linecap='round'
                                    stroke-linejoin='round'
                                />
                                <path
                                    d='M7.64062 12.8583L12.3573 8.1416'
                                    stroke='#515162'
                                    stroke-width='1.5'
                                    stroke-linecap='round'
                                    stroke-linejoin='round'
                                />
                                <path
                                    d='M12.3573 12.8583L7.64062 8.1416'
                                    stroke='#515162'
                                    stroke-width='1.5'
                                    stroke-linecap='round'
                                    stroke-linejoin='round'
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className='p-6 pt-0 space-y-4'>
                        {/* Task Type Dropdown */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Task</label>
                            <Dropdown
                                options={taskOptions}
                                onSelect={(value) => handleInputChange('task', value)}
                                defaultValue={formData.task}
                                placeholder='Please select'
                                className='w-full'
                                triggerClassName='w-full h-8 px-3 py-2.5 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                menuClassName='absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto'
                                optionClassName='px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer'
                            />
                        </div>

                        {/* Due Date and Time Row */}
                        <div className='grid grid-cols-2 gap-4'>
                            {/* Due Date */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Due Date</label>
                                <input
                                    type='date'
                                    value={formData.dueDate}
                                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                    min={getCurrentDate()}
                                    className='w-full px-3 py-2.5 h-5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            {/* Due Time */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Due Time</label>
                                <input
                                    type='time'
                                    value={formData.dueTime}
                                    onChange={(e) => handleInputChange('dueTime', e.target.value)}
                                    className='w-full px-3 py-2.5 h-5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='flex items-center justify-center w-full'>
                        <div className='flex w-fit items-center justify-between gap-3 p-6 pt-4'>
                            <button
                                onClick={handleDiscard}
                                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
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

export default CreateTaskModal
