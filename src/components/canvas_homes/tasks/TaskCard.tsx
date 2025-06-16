import React from 'react'
import Dropdown from './Dropdown'

const TaskCard = ({ task, index, isExpanded, onToggleExpansion, taskStatusOptions, children }) => {
    const handleCardClick = () => onToggleExpansion(task.id)

    return (
        <div
            onClick={handleCardClick}
            className='rounded-md border border-gray-300 cursor-pointer transition-all duration-200'
        >
            <div
                className={`grid grid-cols-3 rounded-t-md gap-40 px-3 py-2.5 items-start ${isExpanded ? 'bg-gray-100' : ''}`}
            >
                <div className='flex items-center justify-between'>
                    <div>
                        <div className='text-sm font-medium text-gray-900 mb-1'>
                            Task {index + 1}: {task.title}
                        </div>
                        <div className='text-xs text-gray-500'>Date: {task.date}</div>
                    </div>
                </div>

                <div>
                    <div className='text-sm font-medium text-gray-900'>Task Status</div>
                    <Dropdown
                        onSelect={() => {}}
                        options={taskStatusOptions}
                        defaultValue='Open'
                        triggerClassName='flex items-center h-4.5 justify-between px-2 py-1 bg-white border border-gray-300 rounded-sm text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    />
                </div>

                <div>
                    <div className='font-medium text-sm text-gray-900 mb-1'>{task.scheduledInfo}</div>
                    <div className='text-xs text-gray-500'>{task.scheduledDate}</div>
                </div>
            </div>

            {isExpanded && <div className='px-3 py-2.5'>{children}</div>}
        </div>
    )
}

export default TaskCard
