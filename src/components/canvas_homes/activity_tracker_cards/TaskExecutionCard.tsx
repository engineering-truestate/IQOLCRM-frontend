// import React from 'react'
import hot from '/icons/canvas_homes/hoticon.svg'
import cold from '/icons/canvas_homes/coldicon.svg'
import bulb from '/icons/canvas_homes/bulbicon.svg'
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

interface TaskExecutionCardProps {
    activity: {
        activityType?: string
        timestamp?: number | string
        agentName?: string
        data?: {
            taskType?: string
            leadStatus?: string
            tag?: string[] | string
            reason?: string
            note?: string
        }
    }
}

const TaskExecutionCard = ({ activity }: TaskExecutionCardProps) => {
    const { activityType = 'Task Execution', timestamp = '', agentName = '', data = {} } = activity || {}
    const { taskType = '', leadStatus = '', tag = [], reason = '', note = '' } = data || {}

    const tags = Array.isArray(tag) ? tag : [tag].filter(Boolean)

    const getTagColorClass = (tagName: string) => {
        if (!tagName) return 'bg-gray-200 text-gray-800'

        const lowercaseTag = String(tagName).toLowerCase()

        switch (lowercaseTag) {
            case 'hot':
                return 'bg-[#FFDDDE] text-[#F02532]'
            case 'cold':
                return 'bg-[#E2F4FF] text-[#1C6CED]'
            case 'super hot':
                return 'bg-[#FAC8C9] text-[#A4151E]'
            case 'potential':
                return 'bg-[#E1F6DF] text-[#2E8E16]'
            case 'fresh':
                return 'bg-[#E1F6DF] text-[#2E8E16]'
            default:
                return 'bg-gray-200 text-gray-800'
        }
    }

    const getTagIconPath = (tagName: string) => {
        if (!tagName) return null

        const lowercaseTag = String(tagName).toLowerCase()

        switch (lowercaseTag) {
            case 'hot':
                return hot
            case 'cold':
                return cold
            case 'super hot':
                return hot
            case 'potential':
                return bulb
            default:
                return null
        }
    }

    const renderSingleTag = (tagName: string) => {
        if (!tagName) return null
        const iconPath = getTagIconPath(tagName)
        return (
            <div
                className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${getTagColorClass(tagName)}`}
            >
                {iconPath && <img src={iconPath} alt={capitalizeWords(tagName)} className='w-3 h-3 mr-1' />}
                <span className='text-[13px]'>{capitalizeWords(tagName)}</span>
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

    return (
        <div className='bg-white shadow-sm border border-gray-300 rounded-lg p-4 w-full max-w-3xl mx-auto text-sm'>
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {capitalizeWords(activityType)}{' '}
                    <span className='text-gray-500 font-normal text-[13px]'>| {formatTime(Number(timestamp))}</span>
                </div>
                <div className='text-gray-500 text-sm'>
                    Agent: <span className='text-gray-700'>{capitalizeWords(agentName)}</span>
                </div>
            </div>

            {taskType && <div className='mt-1 text-gray-800 font-medium'>{capitalizeWords(taskType)}</div>}

            <div className='mt-3 space-y-2 pt-3 border-t border-gray-200'>
                {leadStatus && (
                    <div className='flex flex-row gap-2'>
                        <p className='text-gray-500 mb-0.5 w-1/10 text-[13px]'>Lead status</p>
                        <p className='text-gray-800 text-[13px]'>{capitalizeWords(leadStatus)}</p>
                    </div>
                )}

                {tags.length > 0 && (
                    <div className='flex flex-row gap-2'>
                        <p className='text-gray-500 mb-0.5 w-1/10 text-[13px]'>Tag</p>
                        {renderTag()}
                    </div>
                )}

                {reason && tags.length < 2 && (
                    <div className='flex flex-row gap-2'>
                        <p className='text-gray-500 mb-0.5 w-1/10 text-[13px]'>Reason</p>
                        <p className='text-gray-800 text-[13px]'>{capitalizeWords(reason)}</p>
                    </div>
                )}

                {note && (
                    <div className='flex flex-row gap-2'>
                        <p className='text-gray-500 mb-0.5 w-1/10 text-[13px]'>Note</p>
                        <p className='text-gray-800 text-[13px]'>{capitalizeWords(note)}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TaskExecutionCard
