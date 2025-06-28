// import React from 'react'
import profileIcon from '/icons/canvas_homes/profile.svg'
import arrowRightIcon from '/icons/canvas_homes/arrow-right.svg'

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

interface AgentTransferData {
    fromAgent?: string
    toAgent?: string
}

interface AgentTransferActivity {
    activityType?: string
    timestamp?: number | string
    agentName?: string
    data?: AgentTransferData
}

const AgentTransferCard = ({ activity }: { activity: AgentTransferActivity }) => {
    const { activityType = 'Agent Transfer', timestamp = '', agentName = '', data = {} } = activity || {}
    const { fromAgent = '', toAgent = '' } = data

    return (
        <div className='bg-white flex flex-row justify-between border border-gray-300 rounded-md px-3 py-2.5 w-full max-w-210 ml-4 text-sm'>
            <div>
                <div className='flex justify-between items-start'>
                    <div className='font-semibold text-gray-800'>
                        {capitalizeWords(activityType)}{' '}
                        <span className='text-gray-500 font-normal text-[13px]'>| {formatTime(Number(timestamp))}</span>
                    </div>
                </div>

                <div className='mt-4 flex items-center gap-5'>
                    <div className='flex items-center gap-1'>
                        <img src={profileIcon} alt='Profile' className='w-5 h-5' />
                        <span className='text-gray-500 font-medium text-[13px]'>{capitalizeWords(fromAgent)}</span>
                    </div>

                    <img src={arrowRightIcon} alt='→' className='w-4 h-4' />

                    <div className='flex items-center gap-1'>
                        <img src={profileIcon} alt='Profile' className='w-5 h-5' />
                        <span className='text-gray-500 font-medium text-[13px]'>{capitalizeWords(toAgent)}</span>
                    </div>
                </div>
            </div>
            <div className='text-gray-500 text-sm flex items-center gap-1'>
                Agent: <span className='text-gray-700'>{capitalizeWords(agentName)}</span>
            </div>
        </div>
    )
}

export default AgentTransferCard
