// import React from 'react'
import potentialIcon from '/icons/canvas_homes/potential-bulb.svg'
import hotIcon from '/icons/canvas_homes/hoticon.svg'
import superHotIcon from '/icons/canvas_homes/super-hot.svg'
import coldIcon from '/icons/canvas_homes/coldicon.svg'
import arrow from '/icons/canvas_homes/arrow-right.svg'

// Format time from Unix timestamp in seconds
const formatTime = (timestamp: number) => {
    if (!timestamp) return ''

    const date = new Date(Number(timestamp) * 1000)

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

// Display with fallback if value is missing
const displayValue = (value?: string) => (value?.trim() ? capitalizeWords(value) : '-')

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

    const tagStyles: Record<
        string,
        {
            icon: string
            bg: string
            text: string
        }
    > = {
        potential: {
            icon: potentialIcon,
            bg: 'bg-[#DCFCE7]',
            text: 'text-[#15803D]',
        },
        hot: {
            icon: hotIcon,
            bg: 'bg-[#FFEDD5]',
            text: 'text-[#9A3412]',
        },
        superhot: {
            icon: superHotIcon,
            bg: 'bg-[#FECACA]',
            text: 'text-[#991B1B]',
        },
        cold: {
            icon: coldIcon,
            bg: 'bg-[#DBEAFE]',
            text: 'text-[#1D4ED8]',
        },
    }

    const renderSingleTag = (tagName: string) => {
        if (!tagName) return null
        const style = tagStyles[tagName]
        const capitalizeWords = (str: string) => str.replace(/\b\w/g, (char) => char.toUpperCase())

        if (!style) return <div>-</div>

        return (
            <div className='flex justify-start'>
                <div
                    className={`inline-flex items-center min-w-max h-6 gap-1.5 px-2 py-1 rounded-[4px] text-xs font-medium ${style.bg} ${style.text}`}
                >
                    <img src={style.icon} alt={tagName} className='w-3 h-3 object-contain' />
                    <span className='text-xs font-medium'>{capitalizeWords(tagName || '-')}</span>
                </div>
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
        return <p className='text-gray-800 text-[13px]'>-</p>
    }

    return (
        <div className='bg-white border border-gray-300 rounded-md px-3 py-2.5 w-full max-w-3xl mx-auto text-sm'>
            <div className='flex flex-row justify-between '>
                <div>
                    <div className='flex justify-between items-start'>
                        <div className='font-semibold text-gray-800'>
                            {capitalizeWords(activityType)}{' '}
                            <span className='text-gray-500 font-normal text-[13px]'>
                                | {formatTime(Number(timestamp))}
                            </span>
                        </div>
                    </div>
                    <div className='mt-1 text-gray-500 text-sm font-medium'>
                        {taskType && `${capitalizeWords(taskType)}`}{' '}
                    </div>
                </div>
                <div className='text-gray-500 text-sm flex items-center gap-1'>
                    Agent: <span className='text-gray-700'>{capitalizeWords(agentName)}</span>
                </div>
            </div>

            <div className='mt-3 space-y-2 pt-3 border-t border-gray-200'>
                <div className='flex flex-row gap-2'>
                    <p className='text-gray-500 mb-0.5 w-1/7 text-[13px]'>Lead status</p>
                    <p className='text-gray-800 text-sm'>{displayValue(leadStatus)}</p>
                </div>

                <div className='flex flex-row gap-2'>
                    <p className='text-gray-500 mb-0.5 w-1/7 text-[13px]'>Tag</p>
                    {renderTag()}
                </div>

                <div className='flex flex-row gap-2'>
                    <p className='text-gray-500 mb-0.5 w-1/7 text-[13px]'>Reason</p>
                    <p className='text-gray-800 text-sm'>{tags.length < 2 ? displayValue(reason) : '-'}</p>
                </div>

                <div className='flex flex-row gap-2'>
                    <p className='text-gray-500 mb-0.5 w-1/7 text-[13px]'>Note</p>
                    <p className='text-gray-800 text-sm'>{displayValue(note)}</p>
                </div>
            </div>
        </div>
    )
}

export default TaskExecutionCard
