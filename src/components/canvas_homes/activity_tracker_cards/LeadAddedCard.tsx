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

const LeadAddedCard = ({ activity }) => {
    const { activityType = 'Lead Added', timestamp = '', agentName = '', data = {} } = activity || {}

    // Format the time from timestamp
    const formattedTime = formatTime(timestamp)

    return (
        <div className='bg-white shadow-sm border border-gray-300 rounded-lg p-4 w-full max-w-3xl mx-auto text-sm'>
            {/* Header - Activity Type and Time */}
            <div className='flex justify-between items-center'>
                <div className='font-semibold text-gray-800'>
                    {activityType} <span className='text-gray-500 font-normal'>| {formattedTime}</span>
                </div>

                {/* Only show agent name if provided */}
                {agentName && (
                    <div className='text-gray-500 text-sm'>
                        Agent: <span className='text-gray-700'>{agentName}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LeadAddedCard
