import React from 'react'
import Dropdown from './Dropdown'

const SiteVisitTask = ({ taskId, updateTaskState }) => {
    const visitedOptions = [
        { label: 'Want To Book', value: 'want to book' },
        { label: 'Change Property', value: 'change property' },
        { label: 'Collect Requirement', value: 'collect requirement' },
        { label: 'Close Lead', value: 'close lead' },
    ]

    const notVisitedOptions = [
        { label: 'Reschedule Task', value: 'reschedule task' },
        { label: 'Change Property', value: 'change property' },
        { label: 'Collect Requirement', value: 'collect requirement' },
        { label: 'Close Lead', value: 'close lead' },
    ]

    const handleSelect = (value) => updateTaskState(taskId, 'eoiMode', value)

    return (
        <div className='flex gap-3'>
            <Dropdown
                options={visitedOptions}
                onSelect={handleSelect}
                triggerClassName='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#40A42B] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                placeholder='Visited'
            />

            <Dropdown
                options={notVisitedOptions}
                onSelect={handleSelect}
                triggerClassName='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#F02532] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                placeholder='Not Visited'
            />
        </div>
    )
}

export default SiteVisitTask
