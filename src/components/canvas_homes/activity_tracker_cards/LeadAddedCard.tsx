// import React from 'react'

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

// Capitalize first letter of each word
const capitalizeWords = (text: string) => {
    if (!text) return ''
    return String(text)
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

interface LeadActivity {
    activityType?: string
    timestamp?: number
    agentName?: string
}

const LeadAddedCard = ({ activity }: { activity: LeadActivity }) => {
    const { activityType = 'Lead Added', timestamp = 0, agentName = '' } = activity || {}
    return (
        <div className='bg-white border border-gray-300 rounded-lg p-4 w-full max-w-3xl mx-auto text-sm'>
            {/* Header - Activity Type and Time */}
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {capitalizeWords(activityType)}{' '}
                    <span className='text-gray-500 font-normal text-[13px]'>| {formatTime(timestamp)}</span>
                </div>

                {/* Only show agent name if provided */}
                {agentName && (
                    <div className='text-gray-500 text-sm'>
                        Agent: <span className='text-gray-700'>{capitalizeWords(agentName)}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LeadAddedCard
