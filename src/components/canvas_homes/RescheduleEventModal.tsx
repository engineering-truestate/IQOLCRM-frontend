import React, { useState } from 'react'

const RescheduleEventModal = ({ isOpen, onClose, onReschedule }) => {
    const [formData, setFormData] = useState({
        reason: '',
        eventName: '',
        date: '',
        time: '',
        leadStatus: '',
        note: '',
    })

    const reasonOptions = [
        { value: '', label: 'Select reason' },
        { value: 'customer_request', label: 'Customer Request' },
        { value: 'agent_unavailable', label: 'Agent Unavailable' },
        { value: 'technical_issues', label: 'Technical Issues' },
        { value: 'emergency', label: 'Emergency' },
        { value: 'other', label: 'Other' },
    ]

    const eventNameOptions = [
        { value: '', label: 'Select Event Name' },
        { value: 'site_visit', label: 'Site Visit' },
        { value: 'follow_up_call', label: 'Follow Up Call' },
        { value: 'documentation_review', label: 'Documentation Review' },
        { value: 'final_discussion', label: 'Final Discussion' },
    ]

    const leadStatusOptions = [
        { value: '', label: 'Status' },
        { value: 'hot', label: 'Hot' },
        { value: 'warm', label: 'Warm' },
        { value: 'cold', label: 'Cold' },
        { value: 'follow_up', label: 'Follow Up' },
    ]

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = () => {
        if (!formData.reason || !formData.eventName || !formData.date || !formData.time) {
            alert('Please fill in all required fields')
            return
        }

        onReschedule(formData)
        onClose()

        // Reset form
        setFormData({
            reason: '',
            eventName: '',
            date: '',
            time: '',
            leadStatus: '',
            note: '',
        })
    }

    const handleDiscard = () => {
        setFormData({
            reason: '',
            eventName: '',
            date: '',
            time: '',
            leadStatus: '',
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
                    <h2 className='text-lg font-semibold text-gray-900'>Reschedule Event</h2>
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
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                        >
                            {reasonOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Event Name, Date and Time, Lead Status Row */}
                    <div className='grid grid-cols-3 gap-3'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Event Name</label>
                            <select
                                value={formData.eventName}
                                onChange={(e) => handleInputChange('eventName', e.target.value)}
                                className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs'
                            >
                                {eventNameOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Date and Time</label>
                            <div className='space-y-1'>
                                <input
                                    type='date'
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className='w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs'
                                />
                                <input
                                    type='time'
                                    value={formData.time}
                                    onChange={(e) => handleInputChange('time', e.target.value)}
                                    className='w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs'
                                />
                            </div>
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
                        Reschedule an event
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RescheduleEventModal
