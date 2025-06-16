import React from 'react'
import Dropdown from './Dropdown'

const BookingAmountTask = ({ taskId, updateTaskState, getTaskState }) => {
    const bookingStatus = getTaskState(taskId, 'bookingStatus')
    const isUnsuccessful = bookingStatus === 'unsuccessful'

    const handleSuccessfulClick = (e) => {
        e.stopPropagation()
        updateTaskState(taskId, 'bookingStatus', 'successful')
    }

    const handleUnsuccessfulClick = (e) => {
        e.stopPropagation()
        updateTaskState(taskId, 'bookingStatus', 'unsuccessful')
    }

    const getButtonStyles = (status, isActive) => {
        const baseStyles = 'px-4 py-2 text-sm rounded-md font-medium'

        if (status === 'successful') {
            return `${baseStyles} ${isActive ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`
        }

        return `${baseStyles} flex items-center gap-1 ${isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`
    }
    const notConnectedOptions = [
        { label: 'Reschedule Task', value: 'reschedule task' },
        { label: 'Close Lead', value: 'close lead' },
    ]

    return (
        <div className='space-y-4'>
            <div className='flex gap-3'>
                <button className='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#40A42B] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'>
                    Successful
                </button>

                <div className='relative'>
                    <Dropdown
                        options={notConnectedOptions}
                        onSelect={handleUnsuccessfulClick}
                        triggerClassName='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#F02532] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                        placeholder='Not Connected'
                    />

                    {isUnsuccessful && (
                        <div className='absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[150px]'>
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className='py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-200'
                            >
                                Change Property
                            </div>
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className='py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-200'
                            >
                                Collect Requirement
                            </div>
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className='py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                            >
                                Close Lead
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BookingAmountTask
