// import React from 'react'
import arrowRightIcon from '/icons/canvas_homes/arrow-right.svg'
// Import tag SVG icons
import hotIcon from '/icons/canvas_homes/hoticon.svg'
import coldIcon from '/icons/canvas_homes/coldicon.svg'
import potentialIcon from '/icons/canvas_homes/bulbicon.svg'

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

interface ActivityData {
    propertyAdded?: string
    propertyChanged?: string
    leadStatus?: string
    tag?: string
}

interface Activity {
    activityType?: string
    timestamp?: number | string
    agentName?: string
    data?: ActivityData
}

const NewEnquiryCard = ({ activity }: { activity: Activity }) => {
    const { activityType = 'New Enquiry', timestamp = '', agentName = '', data = {} } = activity || {}
    const { propertyAdded = '', propertyChanged = '', leadStatus = '', tag = '' } = data || {}

    // Determine if we have a property change (from one property to another)
    const hasPropertyChange = propertyAdded && propertyChanged

    // Get tag color class based on tag value
    const getTagColorClass = (tagValue: string) => {
        if (!tagValue) return 'bg-gray-200 text-gray-800'

        const lowercaseTag = tagValue.toLowerCase()

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

    // Get the appropriate tag icon path
    const getTagIcon = (tagValue: string): string | undefined => {
        if (!tagValue) return undefined

        const lowercaseTag = tagValue.toLowerCase()

        switch (lowercaseTag) {
            case 'hot':
                return hotIcon
            case 'cold':
                return coldIcon
            case 'super hot':
                return hotIcon
            case 'potential':
                return potentialIcon
            default:
                return undefined
        }
    }

    return (
        <div className='bg-white border border-gray-300 rounded-lg p-4 w-full max-w-210 mx-auto text-sm ml-4'>
            {/* Header - Activity Type, Time and Agent */}
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {capitalizeWords(activityType)}
                    <span className='text-gray-500 font-normal text-[13px]'> | {formatTime(Number(timestamp))}</span>
                </div>
                <div className='text-gray-500 text-sm'>
                    Agent: <span className='text-gray-700'>{capitalizeWords(agentName)}</span>
                </div>
            </div>

            {/* Property Details */}
            <div className='mt-3 space-y-2 text-[13px] border-t border-gray-200 '>
                {/* Property Added */}
                {propertyAdded && (
                    <div className='flex items-start mt-3'>
                        <div className='w-32 text-gray-500'>Property added</div>
                        <div className='flex items-center text-gray-700'>
                            <span>{capitalizeWords(propertyAdded)}</span>
                            {hasPropertyChange && (
                                <>
                                    <img src={arrowRightIcon} alt='→' className='mx-2 w-4 h-4' />
                                    <span>{capitalizeWords(propertyChanged)}</span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Lead Status */}
                {leadStatus && (
                    <div className='flex items-start'>
                        <div className='w-32 text-gray-500'>Lead status</div>
                        <div className='text-gray-700'>{capitalizeWords(leadStatus)}</div>
                    </div>
                )}

                {/* Tag */}
                {tag && tag.trim() !== '' && (
                    <div className='flex items-start'>
                        <div className='w-32 text-gray-500'>Tag</div>
                        <div>
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-sm text-xs ${getTagColorClass(tag)}`}
                            >
                                {getTagIcon(tag) && (
                                    <img src={getTagIcon(tag)} alt={capitalizeWords(tag)} className='w-3 h-3 mr-1' />
                                )}
                                <span className='text-[13px]'>{capitalizeWords(tag)}</span>
                            </span>
                        </div>
                    </div>
                )}
                {agentName && (
                    <div className='flex items-start'>
                        <div className='w-32 text-gray-500'>Agent</div>
                        <div className='text-gray-700'>{capitalizeWords(agentName)}</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NewEnquiryCard
