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

const TaskExecutionCard = ({ activity }) => {
    const { activityType = 'Task Execution', timestamp = '', agentName = '', data = {} } = activity || {}

    const { taskType = '', leadStatus = '', tag = [], reason = '', note = '' } = data || {}

    const tags = Array.isArray(tag) ? tag : [tag].filter(Boolean)

    const getTagColorClass = (tagName) => {
        switch (tagName) {
            case 'Hot':
                return 'bg-[#FEE8BD] text-orange-800'
            case 'Cold':
                return 'bg-[#E1F5FE] text-blue-800'
            case 'Super Hot':
                return 'bg-[#FFCCBC] text-red-800'
            case 'Potential':
                return 'bg-[#E8F5E9] text-green-800'
            default:
                return 'bg-gray-200 text-gray-800'
        }
    }

    const getTagIconPath = (tagName) => {
        switch (tagName) {
            case 'Hot':
                return hot
            case 'Cold':
                return cold
            case 'Super Hot':
                return hot
            case 'Potential':
                return bulb
            default:
                return null
        }
    }

    const renderSingleTag = (tagName) => {
        if (!tagName) return null
        const iconPath = getTagIconPath(tagName)
        return (
            <div
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTagColorClass(tagName)}`}
            >
                {iconPath && <img src={iconPath} alt={tagName} className='w-3 h-3 mr-1' />}
                <span>{tagName}</span>
            </div>
        )
    }

    const renderTag = () => {
        if (tags.length === 1) return renderSingleTag(tags[0])
        if (tags.length === 2) {
            return (
                <div className='flex items-center gap-2'>
                    {renderSingleTag(tags[0])}
                    <img src={arrow} alt='arrow' className='w-3 h-3 text-gray-600' />
                    {renderSingleTag(tags[1])}
                </div>
            )
        }
        return null
    }

    const formattedTime = formatTime(timestamp)

    return (
        <div className='bg-white shadow-sm border border-gray-300 rounded-lg p-4 w-full max-w-3xl mx-auto text-sm'>
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {activityType}{' '}
                    {formattedTime && <span className='text-gray-500 font-normal'>| {formattedTime}</span>}
                </div>
                <div className='text-gray-500 text-sm'>
                    Agent: <span className='text-gray-700'>{agentName}</span>
                </div>
            </div>

            {taskType && <div className='mt-1 text-gray-800 font-medium'>{taskType}</div>}

            <div className='mt-3 space-y-2 pt-3 border-t border-gray-200'>
                {leadStatus && (
                    <div className='flex flex-row gap-2'>
                        <p className='text-gray-500 mb-0.5 w-1/10'>Lead status</p>
                        <p className='text-gray-800'>{leadStatus}</p>
                    </div>
                )}

                {tags.length > 0 && (
                    <div className='flex flex-row gap-2'>
                        <p className='text-gray-500 mb-0.5 w-1/10'>Tag</p>
                        {renderTag()}
                    </div>
                )}

                {reason && tags.length < 2 && (
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

export default TaskExecutionCard
