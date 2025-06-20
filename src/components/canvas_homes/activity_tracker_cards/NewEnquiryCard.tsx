import React from 'react'
import arrowRightIcon from '/icons/canvas_homes/arrow-right.svg'
// Import tag SVG icons
import hotIcon from '/icons/canvas_homes/hoticon.svg'
import coldIcon from '/icons/canvas_homes/coldicon.svg'
import potentialIcon from '/icons/canvas_homes/bulbicon.svg'

// Format time function
const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    })
}

const NewEnquiryCard = ({ activity }) => {
    const { activityType = 'New Enquiry', timestamp = '', agentName = '', data = {} } = activity || {}

    const { propertyAdded = '', propertyChanged = '', leadStatus = '', tag = '' } = data || {}

    // Determine if we have a property change (from one property to another)
    const hasPropertyChange = propertyAdded && propertyChanged

    // Get tag color class based on tag value
    const getTagColorClass = (tagValue) => {
        switch (tagValue) {
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

    // Get the appropriate tag icon path
    const getTagIcon = (tagValue) => {
        switch (tagValue) {
            case 'Hot':
                return hotIcon
            case 'Cold':
                return coldIcon
            case 'Super Hot':
                return hotIcon
            case 'Potential':
                return potentialIcon
            default:
                return null
        }
    }

    return (
        <div className='bg-white shadow-sm border border-gray-300 rounded-lg p-4 w-full max-w-3xl mx-auto text-sm'>
            {/* Header - Activity Type, Time and Agent */}
            <div className='flex justify-between items-start'>
                <div className='font-semibold text-gray-800'>
                    {activityType} <span className='text-gray-500 font-normal'>| {formatTime(timestamp)}</span>
                </div>
                <div className='text-gray-500 text-sm'>
                    Agent: <span className='text-gray-700'>{agentName}</span>
                </div>
            </div>

            {/* Property Details */}
            <div className='mt-4 space-y-2'>
                {/* Property Added/Changed */}
                {propertyAdded && (
                    <div className='flex'>
                        <div className='w-1/3 text-gray-500'>Property added</div>
                        <div className='w-2/3 flex items-center'>
                            <span className='text-gray-700'>{propertyAdded}</span>

                            {hasPropertyChange && (
                                <>
                                    <img src={arrowRightIcon} alt='→' className='mx-2 w-4 h-4' />
                                    <span className='text-gray-700'>{propertyChanged}</span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Lead Status */}
                {leadStatus && (
                    <div className='flex'>
                        <div className='w-1/3 text-gray-500'>Lead status</div>
                        <div className='w-2/3 text-gray-700'>{leadStatus}</div>
                    </div>
                )}

                {/* Tag (optional) */}
                {tag && (
                    <div className='flex'>
                        <div className='w-1/3 text-gray-500'>Tag</div>
                        <div className='w-2/3'>
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getTagColorClass(tag)}`}
                            >
                                {getTagIcon(tag) && <img src={getTagIcon(tag)} alt={tag} className='w-3 h-3 mr-1' />}
                                {tag}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NewEnquiryCard
