import React, { useState } from 'react'

const CloseLeadModal = ({ isOpen, onClose, onCloseLead }) => {
    const [formData, setFormData] = useState({
        reason: '',
        taskStatus: 'Complete',
        leadStatus: 'Not Connected',
        tag: 'Cold',
        note: '',
    })

    const reasonOptions = [
        { value: '', label: 'Select reason' },
        { value: 'not_interested', label: 'Not Interested' },
        { value: 'budget_constraints', label: 'Budget Constraints' },
        { value: 'wrong_timing', label: 'Wrong Timing' },
        { value: 'found_alternative', label: 'Found Alternative' },
        { value: 'no_response', label: 'No Response' },
        { value: 'duplicate_lead', label: 'Duplicate Lead' },
        { value: 'invalid_contact', label: 'Invalid Contact' },
        { value: 'other', label: 'Other' },
    ]

    const taskStatusOptions = [
        { value: 'Complete', label: 'Complete' },
        { value: 'Incomplete', label: 'Incomplete' },
        { value: 'Pending', label: 'Pending' },
    ]

    const leadStatusOptions = [
        { value: 'Not Connected', label: 'Not Connected' },
        { value: 'Connected', label: 'Connected' },
        { value: 'Follow Up', label: 'Follow Up' },
        { value: 'Closed', label: 'Closed' },
    ]

    const tagOptions = [
        { value: 'Cold', label: 'Cold' },
        { value: 'Warm', label: 'Warm' },
        { value: 'Hot', label: 'Hot' },
        { value: 'Dead', label: 'Dead' },
    ]

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = () => {
        if (!formData.reason) {
            alert('Please select a reason for closing the lead')
            return
        }

        onCloseLead(formData)
        onClose()

        // Reset form
        setFormData({
            reason: '',
            taskStatus: 'Complete',
            leadStatus: 'Not Connected',
            tag: 'Cold',
            note: '',
        })
    }

    const handleDiscard = () => {
        setFormData({
            reason: '',
            taskStatus: 'Complete',
            leadStatus: 'Not Connected',
            tag: 'Cold',
            note: '',
        })
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={onClose}>
            <div className='bg-white rounded-lg shadow-xl w-full max-w-md mx-4' onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-gray-200'>
                    <h2 className='text-lg font-semibold text-gray-900'>Close Lead</h2>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold w-6 h-6 flex items-center justify-center'
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className='p-4 space-y-4'>
                    {/* Reason */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Reason</label>
                        <select
                            value={formData.reason}
                            onChange={(e) => handleInputChange('reason', e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50'
                        >
                            {reasonOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Task Status, Lead Status, Tag Row */}
                    <div className='grid grid-cols-3 gap-3'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Task Status</label>
                            <select
                                value={formData.taskStatus}
                                onChange={(e) => handleInputChange('taskStatus', e.target.value)}
                                className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs'
                            >
                                {taskStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Lead Status</label>
                            <select
                                value={formData.leadStatus}
                                onChange={(e) => handleInputChange('leadStatus', e.target.value)}
                                className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs'
                            >
                                {leadStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Tag</label>
                            <select
                                value={formData.tag}
                                onChange={(e) => handleInputChange('tag', e.target.value)}
                                className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs'
                            >
                                {tagOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Add Note */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Add Note (Optional)</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => handleInputChange('note', e.target.value)}
                            placeholder='Add your notes here...'
                            rows={4}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none'
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className='flex justify-end gap-3 p-4 border-t border-gray-200'>
                    <button
                        onClick={handleDiscard}
                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
                    >
                        Close Lead
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CloseLeadModal
