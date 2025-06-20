import React from 'react'
import profileIcon from '/icons/canvas_homes/profile.svg'
import arrowRightIcon from '/icons/canvas_homes/arrow-right.svg'

const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    })
}

const AgentTransferCard = ({ activity }) => {
    const { activityType = 'Agent Transfer', timestamp = '', agentName = '', data = {} } = activity || {}

    const { fromAgent = '', toAgent = '' } = data

    return (
        <div className='bg-white shadow-sm border border-gray-300 rounded-lg p-4 w-full max-w-3xl mx-auto text-sm'>
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {activityType} <span className='text-gray-500 font-normal'>| {formatTime(timestamp)}</span>
                </div>
                <div className='text-gray-500 text-sm'>
                    Agent: <span className='text-gray-700'>{agentName}</span>
                </div>
            </div>

            <div className='mt-4 flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                    <img src={profileIcon} alt='Profile' className='w-5 h-5' />
                    <span className='text-gray-700'>{fromAgent}</span>
                </div>

                <img src={arrowRightIcon} alt='→' className='w-4 h-4' />

                <div className='flex items-center gap-1'>
                    <img src={profileIcon} alt='Profile' className='w-5 h-5' />
                    <span className='text-gray-700'>{toAgent}</span>
                </div>
            </div>
        </div>
    )
}

export default AgentTransferCard
