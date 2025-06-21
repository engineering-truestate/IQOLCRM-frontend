import React from 'react'

// Format time from Unix timestamp in seconds
const formatTime = (timestamp) => {
    if (!timestamp) return ''

    // Convert seconds to milliseconds for Date object
    const date = new Date(timestamp * 1000)

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    })
}

// Format date and time from Unix timestamp in seconds
const formatDateTime = (timestamp) => {
    if (!timestamp) return ''

    // Convert seconds to milliseconds for Date object
    const date = new Date(timestamp * 1000)

    return (
        date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }) +
        ' | ' +
        formatTime(timestamp)
    )
}

// Capitalize first letter of each word
const capitalizeWords = (text) => {
    if (!text) return ''
    return String(text)
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

const TaskCreatedCard = ({ activity }) => {
    const { activityType = 'Task Created', timestamp = '', agentName = '', data = {} } = activity || {}
    const { taskType = '', scheduledDate = '' } = data || {}

    return (
        <div className='bg-white shadow-sm border border-gray-300 rounded-lg p-4 w-full max-w-3xl mx-auto text-sm px-4'>
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {capitalizeWords(activityType)}{' '}
                    <span className='text-gray-500 font-normal'>| {formatTime(timestamp)}</span>
                </div>
                <div className='text-gray-500 text-sm'>
                    Agent: <span className='text-gray-700'>{capitalizeWords(agentName)}</span>
                </div>
            </div>

            <div className='mt-1 text-gray-700 font-medium'>
                {taskType && `${capitalizeWords(taskType)}`}{' '}
                <span className='text-gray-500 font-normal'>| {formatDateTime(scheduledDate)}</span>
            </div>
        </div>
    )
}

export default TaskCreatedCard
