import React, { useState } from 'react'

const TaskCompletionModal = ({
    isOpen,
    onClose,
    onSave,
    title = 'Task Completed',
    taskStatusOptions = [],
    leadStatusOptions = [],
    tagOptions = [],
    defaultTaskStatus = '',
    defaultLeadStatus = '',
    defaultTag = '',
    actionButtonText = 'Save',
    actionButtonColor = 'blue',
}) => {
    const [formData, setFormData] = useState({
        taskStatus: defaultTaskStatus,
        leadStatus: defaultLeadStatus,
        tag: defaultTag,
        note: '',
    })

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSave = () => {
        if (!formData.taskStatus) {
            alert('Please select a task status')
            return
        }

        onSave(formData)
        onClose()

        // Reset form
        setFormData({
            taskStatus: defaultTaskStatus,
            leadStatus: defaultLeadStatus,
            tag: defaultTag,
            note: '',
        })
    }

    const handleDiscard = () => {
        setFormData({
            taskStatus: defaultTaskStatus,
            leadStatus: defaultLeadStatus,
            tag: defaultTag,
            note: '',
        })
        onClose()
    }

    const getButtonColor = () => {
        const colors = {
            blue: 'bg-blue-600 hover:bg-blue-700',
            red: 'bg-red-600 hover:bg-red-700',
            green: 'bg-green-600 hover:bg-green-700',
            purple: 'bg-purple-600 hover:bg-purple-700',
            orange: 'bg-orange-600 hover:bg-orange-700',
        }
        return colors[actionButtonColor] || colors.blue
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={onClose}>
            <div className='bg-white rounded-lg shadow-xl w-full max-w-md mx-4' onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-gray-200'>
                    <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold w-6 h-6 flex items-center justify-center'
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className='p-4 space-y-4'>
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
                            <input
                                type='text'
                                value={formData.leadStatus}
                                onChange={(e) => handleInputChange('leadStatus', e.target.value)}
                                readOnly
                                className='w-full px-2 py-2 border border-gray-300 rounded-md bg-gray-50 text-xs text-gray-600 cursor-not-allowed'
                            />
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
                        onClick={handleSave}
                        className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${getButtonColor()}`}
                    >
                        {actionButtonText}
                    </button>
                </div>
            </div>
        </div>
    )
}
export default TaskCompletionModal
