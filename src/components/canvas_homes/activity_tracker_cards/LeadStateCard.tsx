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

interface LeadStateCardProps {
    activity: {
        activityType?: string
        timestamp?: number
        agentName?: string
        data?: {
            reason?: string
            [key: string]: any
        }
        [key: string]: any
    }
}

const LeadStateCard = ({ activity }: LeadStateCardProps) => {
    const { activityType = '', timestamp = 0, agentName = '', data = {} } = activity || {}
    const { reason = '' } = data || {}

    return (
        <div className='bg-white border border-gray-300 rounded-lg py-2 px-4 w-full max-w-210 mx-auto text-sm ml-4'>
            {/* Header - Activity Type, Time and Agent */}
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {capitalizeWords(activityType)}{' '}
                    <span className='text-gray-500 font-normal text-[13px]'>| {formatTime(timestamp)}</span>
                </div>
                <div className='text-gray-500 text-sm'>
                    Agent: <span className='text-gray-700'>{capitalizeWords(agentName)}</span>
                </div>
            </div>

            {/* Details section */}
            <div className='mt-1 space-y-2 pt-1.5 pb-1.5 border-t border-gray-200'>
                {/* Reason */}
                {reason && (
                    <div className='flex'>
                        <div className='w-1/10 text-gray-500 text-[13px]'>Reason</div>
                        <div className=' text-gray-800 text-[13px]'>{capitalizeWords(reason)}</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LeadStateCard
