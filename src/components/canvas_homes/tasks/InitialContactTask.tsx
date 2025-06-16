import React from 'react'
import { useState } from 'react'
import Dropdown from './Dropdown'

const InitialContactTask = ({ taskId, updateTaskState }) => {
    const interestedOptions = [
        { label: 'Interested', value: 'interested', task: () => console.log('Interested') },
        {
            label: 'Not Interested',
            value: 'not_interested',
            subOptions: [
                {
                    label: 'Change Property',
                    value: 'change_property',
                    modal: () => console.log('Open Change Property modal'),
                },
                {
                    label: 'Collect Requirement',
                    value: 'collect_requirement',
                    modal: () => console.log('Collect Requirement modal'),
                },
                {
                    label: 'Close Lead',
                    value: 'close_lead',
                    modal: () => console.log('Close Lead'),
                },
            ],
        },
        {
            label: 'Reschedule Event',
            value: 'reschedule_event',
            task: () => console.log('Reschedule'),
        },
    ]

    const notConnectedOptions = [
        { label: 'Reschedule Task', value: 'reschedule task' },
        { label: 'Close Lead', value: 'close lead' },
    ]

    const handleSelect = (value) => updateTaskState(taskId, 'eoiMode', value)

    return (
        <div>
            <div className='flex gap-3'>
                <Dropdown
                    options={interestedOptions}
                    onSelect={handleSelect}
                    triggerClassName='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#40A42B] text-sm text-white min-w-[100px] cursor-pointer'
                    nestedOptionClassName='ml-4 border-l border-gray-200 bg-gray-50 rounded-md'
                    placeholder='Connected'
                />

                <Dropdown
                    options={notConnectedOptions}
                    onSelect={handleSelect}
                    triggerClassName='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#F02532] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    placeholder='Not Connected'
                />
            </div>
        </div>
    )
}

export default InitialContactTask
