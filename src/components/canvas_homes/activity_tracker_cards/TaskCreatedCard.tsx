import React from 'react'

// Format time from Unix timestamp in seconds
const formatTime = (timestamp: number) => {
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
const formatDateTime = (timestamp: number) => {
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
const capitalizeWords = (text: string) => {
    if (!text) return ''
    return String(text)
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

interface TaskCreatedCardProps {
    activity: {
        activityType?: string
        timestamp?: number
        agentName?: string
        data?: {
            taskType?: string
            scheduledDate?: number
        }
    }
}

const TaskCreatedCard: React.FC<TaskCreatedCardProps> = ({ activity }) => {
    const { activityType = 'Task Created', timestamp = 0, agentName = '', data = {} } = activity || {}
    const { taskType = '', scheduledDate = 0 } = data || {}

    return (
        <div className='bg-white flex flex-row justify-between border border-gray-300 rounded-md px-3 py-2.5 w-full max-w-210 ml-4 text-sm'>
            <div>
                <div className='flex justify-between items-start'>
                    <div className='font-semibold text-gray-800'>
                        {capitalizeWords(activityType)}{' '}
                        <span className='text-gray-500 font-normal text-[13px]'>| {formatTime(Number(timestamp))}</span>
                    </div>
                </div>

                <div className='mt-1 text-gray-500 text-sm font-medium'>
                    {taskType && `${capitalizeWords(taskType)}`}{' '}
                    <span className='text-gray-500 text-[13px] font-normal'>| {formatDateTime(scheduledDate)}</span>
                </div>
            </div>
            <div className='text-gray-500 text-sm flex items-center gap-1'>
                Agent: <span className='text-gray-700'>{capitalizeWords(agentName)}</span>
            </div>
        </div>
    )
}

export default TaskCreatedCard
