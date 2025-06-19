import React from 'react'
import Dropdown from './Dropdown'

const CollectEOITask = ({ taskId, updateTaskState, getTaskState }) => {
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

    const eoiModeOptions = [
        { label: 'Select', value: '' },
        { label: 'Online', value: 'online' },
        { label: 'Offline', value: 'offline' },
        { label: 'Phone', value: 'phone' },
    ]

    const handleSelectMode = (value) => updateTaskState(taskId, 'eoiMode', value)
    const handleAmountChange = (e) => updateTaskState(taskId, 'eoiAmount', e.target.value)

    return (
        <div className='space-y-4'>
            <div className='flex gap-3 mb-4'>
                <button className='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#40A42B] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'>
                    EOI Collected
                </button>

                <Dropdown
                    options={notVisitedOptions}
                    onSelect={handleSelectMode}
                    triggerClassName='flex items-center h-8 w-33.5 w-fit justify-between p-2 border border-gray-300 rounded-sm bg-[#F02532] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    placeholder='EOI Not Collected'
                />
            </div>

            <div className='grid grid-cols-2'>
                <div className='w-[207px]'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Mode of EOI</label>
                    <Dropdown
                        options={eoiModeOptions}
                        defaultValue='Select'
                        onSelect={handleSelectMode}
                        triggerClassName='flex items-center w-[207px] h-8 justify-between px-2 py-1 border border-gray-300 rounded-sm text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    />
                </div>

                <div className='w-[207px]'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Amount of EOI</label>
                    <div className='relative'>
                        <input
                            type='text'
                            placeholder='Text here'
                            value={getTaskState(taskId, 'eoiAmount')}
                            onChange={handleAmountChange}
                            onClick={(e) => e.stopPropagation()}
                            className='w-full h-8 px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                        <span className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400'>+</span>
                    </div>
                </div>
            </div>

            <button
                onClick={(e) => e.stopPropagation()}
                className='px-2 bg-blue-500 w-26.5 h-8 text-white text-sm rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
                Proceed
            </button>
        </div>
    )
}

export default CollectEOITask
