import React from 'react'
import hot from '/icons/canvas_homes/hoticon.svg'
import cold from '/icons/canvas_homes/coldicon.svg'
import bulb from '/icons/canvas_homes/bulbicon.svg'
import arrow from '/icons/canvas_homes/arrow-right.svg'

const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    })
}

const PropertyChangeCard = ({ activity }) => {
    const { activityType = 'Task Execution', timestamp = '', agentName = '', data = {} } = activity || {}

    const {
        taskType = '',
        leadStatus = '',
        propertyAdded = '',
        propertyChanged = '',
        reason = '',
        note = '',
    } = data || {}

    const formattedTime = formatTime(timestamp)

    return (
        <div className='bg-white shadow-sm border border-gray-300 rounded-lg p-4 w-full max-w-3xl mx-auto text-sm'>
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {'Task Execution'}{' '}
                    {formattedTime && <span className='text-gray-500 font-normal'>| {formattedTime}</span>}
                </div>
                <div className='text-gray-500 text-sm'>
                    Agent: <span className='text-gray-700'>{agentName}</span>
                </div>
            </div>

            {activityType && <div className='mt-1 text-gray-800 font-medium'>{activityType}</div>}

            <div className='mt-3 space-y-2 pt-3 border-t border-gray-200'>
                {leadStatus && (
                    <div className='flex flex-row gap-2'>
                        <p className='text-gray-500 mb-0.5 w-1/10'>Lead status</p>
                        <p className='text-gray-800'>{leadStatus}</p>
                    </div>
                )}

                <div className='flex'>
                    <div className='w-1/6 text-gray-500'>Property added</div>
                    <div className='flex items-center'>
                        <span className='text-gray-700'>{propertyAdded}</span>

                        <img src={arrow} alt='→' className='mx-2 w-4 h-4' />
                        <span className='text-gray-700'>{propertyChanged}</span>
                    </div>
                </div>

                {reason && (
                    <div className='flex flex-row gap-2'>
                        <p className='text-gray-500 mb-0.5 w-1/10'>Reason</p>
                        <p className='text-gray-800'>{reason}</p>
                    </div>
                )}

                {note && (
                    <div className='flex flex-row gap-2'>
                        <p className='text-gray-500 mb-0.5 w-1/10'>Note</p>
                        <p className='text-gray-800'>{note}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PropertyChangeCard
