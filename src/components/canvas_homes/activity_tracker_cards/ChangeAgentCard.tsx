import React from 'react'
import profileIcon from '/icons/canvas_homes/profile.svg'
import arrowRightIcon from '/icons/canvas_homes/arrow-right.svg'

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

// Capitalize first letter of each word
const capitalizeWords = (text) => {
    if (!text) return ''
    return String(text)
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

const AgentTransferCard = ({ activity }) => {
    const { activityType = 'Agent Transfer', timestamp = '', agentName = '', data = {} } = activity || {}
    const { fromAgent = '', toAgent = '' } = data

    return (
        <div className='bg-white border border-gray-300 rounded-lg p-4 w-full max-w-3xl mx-auto text-sm'>
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {capitalizeWords(activityType)}{' '}
                    <span className='text-gray-500 font-normal text-[13px]'>| {formatTime(timestamp)}</span>
                </div>
                <div className='text-gray-500 text-sm'>
                    Agent: <span className='text-gray-700'>{capitalizeWords(agentName)}</span>
                </div>
            </div>

            <div className='mt-4 flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                    <img src={profileIcon} alt='Profile' className='w-5 h-5' />
                    <span className='text-gray-700 text-[13px]'>{capitalizeWords(fromAgent)}</span>
                </div>

                <img src={arrowRightIcon} alt='→' className='w-4 h-4' />

                <div className='flex items-center gap-1'>
                    <img src={profileIcon} alt='Profile' className='w-5 h-5' />
                    <span className='text-gray-700 text-[13px]'>{capitalizeWords(toAgent)}</span>
                </div>
            </div>
        </div>
    )
}

export default AgentTransferCard
