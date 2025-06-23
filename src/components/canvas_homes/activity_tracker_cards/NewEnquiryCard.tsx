import React from 'react'
import arrowRightIcon from '/icons/canvas_homes/arrow-right.svg'
// Import tag SVG icons
import hotIcon from '/icons/canvas_homes/hoticon.svg'
import coldIcon from '/icons/canvas_homes/coldicon.svg'
import potentialIcon from '/icons/canvas_homes/bulbicon.svg'

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

const NewEnquiryCard = ({ activity }) => {
    const { activityType = 'New Enquiry', timestamp = '', agentName = '', data = {} } = activity || {}
    const { propertyAdded = '', propertyChanged = '', leadStatus = '', tag = '' } = data || {}

    // Determine if we have a property change (from one property to another)
    const hasPropertyChange = propertyAdded && propertyChanged

    // Get tag color class based on tag value
    const getTagColorClass = (tagValue) => {
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
    const getTagIcon = (tagValue) => {
        if (!tagValue) return null

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
                return null
        }
    }

    return (
        <div className='bg-white border border-gray-300 rounded-lg p-4 w-full max-w-3xl mx-auto text-sm'>
            {/* Header - Activity Type, Time and Agent */}
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {capitalizeWords(activityType)}{' '}
                    <span className='text-gray-500 font-normal text-[13px]'>| {formatTime(timestamp)}</span>
                </div>
                <div className='text-gray-500 text-sm'>
                    Agent: <span className='text-gray-700'>{capitalizeWords(agentName)}</span>
                </div>
            </div>

            {/* Property Details */}
            <div className='mt-4 space-y-2'>
                {/* Property Added/Changed */}
                {propertyAdded && (
                    <div className='flex'>
                        <div className='w-1/7 text-gray-500 text-[13px]'>Property added</div>
                        <div className='flex items-center'>
                            <span className='text-gray-700 text-[13px]'>{capitalizeWords(propertyAdded)}</span>

                            {hasPropertyChange && (
                                <>
                                    <img src={arrowRightIcon} alt='→' className='mx-2 w-4 h-4' />
                                    <span className='text-gray-700 text-[13px]'>
                                        {capitalizeWords(propertyChanged)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Lead Status */}
                {leadStatus && (
                    <div className='flex'>
                        <div className='w-1/10 text-gray-500 text-[13px]'>Lead status</div>
                        <div className=' text-gray-700 text-[13px]'>{capitalizeWords(leadStatus)}</div>
                    </div>
                )}

                {/* Tag (optional) */}
                {tag && (
                    <div className='flex'>
                        <div className='w-1/10 text-gray-500 text-[13px]'>Tag</div>
                        <div className=''>
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
            </div>
        </div>
    )
}

export default NewEnquiryCard
