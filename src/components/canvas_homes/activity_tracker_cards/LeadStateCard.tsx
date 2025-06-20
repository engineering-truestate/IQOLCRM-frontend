import React from 'react'

const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    })
}

const LeadStateCard = ({ activity }) => {
    const { activityType = '', timestamp = '', agentName = '', data = {} } = activity || {}

    const { reason = '' } = data || {}

    // Format the time from timestamp
    const formattedTime = formatTime(timestamp)

    return (
        <div className='bg-white shadow-sm border border-gray-300 rounded-lg p-4 w-full max-w-3xl mx-auto text-sm'>
            {/* Header - Activity Type, Time and Agent */}
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {activityType} <span className='text-gray-500 font-normal'>| {formattedTime}</span>
                </div>
                <div className='text-gray-500 text-sm'>
                    Agent: <span className='text-gray-700'>{agentName}</span>
                </div>
            </div>

            {/* Details section */}
            <div className='mt-3 space-y-2 pt-3 border-t border-gray-200'>
                {/* Reason */}
                {reason && (
                    <div className='flex'>
                        <div className='w-1/3 text-gray-500'>Reason</div>
                        <div className='w-2/3 text-gray-800'>{reason}</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LeadStateCard
