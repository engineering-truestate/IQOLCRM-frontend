// import React from 'react'
// import hot from '/icons/canvas_homes/hoticon.svg'
// import cold from '/icons/canvas_homes/coldicon.svg'
// import bulb from '/icons/canvas_homes/bulbicon.svg'
import arrow from '/icons/canvas_homes/arrow-right.svg'

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

interface PropertyChangeCardProps {
    activity: {
        activityType?: string
        timestamp?: number | string
        agentName?: string
        data?: {
            leadStatus?: string
            propertyAdded?: string
            propertyChanged?: string
            reason?: string
            note?: string
        }
    }
}

const PropertyChangeCard = ({ activity }: PropertyChangeCardProps) => {
    const { activityType = 'Task Execution', timestamp = '', agentName = '', data = {} } = activity || {}

    const {
        // taskType = '',
        leadStatus = '',
        propertyAdded = '',
        propertyChanged = '',
        reason = '',
        note = '',
    } = data || {}

    return (
        <div className='bg-white border border-gray-300 rounded-lg p-4 w-full max-w-3xl mx-auto text-sm'>
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {capitalizeWords('Task Execution')}{' '}
                    <span className='text-gray-500 font-normal text-[13px]'>| {formatTime(Number(timestamp))}</span>
                </div>
                <div className='text-gray-500 text-sm'>
                    Agent: <span className='text-gray-700'>{capitalizeWords(agentName)}</span>
                </div>
            </div>

            {activityType && <div className='mt-1 text-gray-800 font-medium'>{capitalizeWords(activityType)}</div>}

            <div className='mt-3 space-y-2 pt-3 border-t border-gray-200'>
                {leadStatus && (
                    <div className='flex'>
                        <div className='w-1/10 text-gray-500 text-[13px]'>Lead status</div>
                        <div className='text-gray-800 text-[13px]'>{capitalizeWords(leadStatus)}</div>
                    </div>
                )}

                {propertyAdded && (
                    <div className='flex'>
                        <div className='w-1/7 text-gray-500 text-[13px]'>Property added</div>
                        <div className='flex items-center'>
                            <span className='text-gray-700 text-[13px]'>{capitalizeWords(propertyAdded)}</span>

                            {propertyChanged && (
                                <>
                                    <img src={arrow} alt='→' className='mx-2 w-4 h-4' />
                                    <span className='text-gray-700 text-[13px]'>
                                        {capitalizeWords(propertyChanged)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {reason && (
                    <div className='flex'>
                        <div className='w-1/10 text-gray-500 text-[13px]'>Reason</div>
                        <div className=' text-gray-800 text-[13px]'>{capitalizeWords(reason)}</div>
                    </div>
                )}

                {note && (
                    <div className='flex'>
                        <div className='w-1/10 text-gray-500 text-[13px]'>Note</div>
                        <div className=' text-gray-800 text-[13px]'>{capitalizeWords(note)}</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PropertyChangeCard
