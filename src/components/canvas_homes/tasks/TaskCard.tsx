import React from 'react'
import Dropdown from './Dropdown'
import type { Task } from '../../../services/canvas_homes/types' // Assuming you have a type for Task

interface TaskCardProps {
    task: Task // Assuming Task is the type of your task object from Firebase
    index: number
    isExpanded: boolean
    onToggleExpansion: (taskId: string) => void
    taskStatusOptions: { label: string; value: string }[] // Status options for the dropdown
    onStatusUpdate: (taskId: string, selectedStatus: string) => void // Status update function passed from parent
    updating?: boolean // Whether the task is currently being updated
    children: React.ReactNode
}

const TaskCard: React.FC<TaskCardProps> = ({
    task,
    index,
    isExpanded,
    onToggleExpansion,
    taskStatusOptions,
    onStatusUpdate,
    updating = false,
    children,
}) => {
    // Handle task card click to toggle expansion (if the task isn't complete)
    const handleCardClick = () => {
        if (task.status !== 'complete') {
            onToggleExpansion(task.id) // task.id assumes you have an 'id' in your task object from Firebase
        }
    }

    // Handle the status change and update the task status in the parent component
    const handleStatusChange = (selectedStatus: string) => {
        // Only update status if it's different from the current one
        if (selectedStatus !== task.status) {
            onStatusUpdate(task.id, selectedStatus) // Update task status by passing taskId and new status
        }
    }

    return (
        <div
            onClick={handleCardClick}
            className='rounded-md border border-gray-300 cursor-pointer transition-all duration-200'
        >
            <div
                className={`grid grid-cols-3 rounded-t-md gap-40 px-3 py-2.5 items-start ${isExpanded ? 'bg-gray-100' : ''}`}
            >
                {/* Task Title & Date */}
                <div className='flex items-center justify-between'>
                    <div>
                        <div className='text-sm font-medium text-gray-900 mb-1'>
                            Task {index + 1}: {task.title || 'No Title'} {/* Ensure task has a title */}
                        </div>
                        <div className='text-xs text-gray-500'>Date: {task.date || 'Not Available'}</div>{' '}
                        {/* Ensure date is available */}
                    </div>
                </div>

                {/* Status Dropdown */}
                <div>
                    <div className='text-sm font-medium text-gray-900 mb-1'>Task Status</div>
                    <Dropdown
                        onSelect={handleStatusChange} // Call handleStatusChange when the user selects a new status
                        disabled={task.status === 'complete' || task.type !== 'lead registration'} // Disable dropdown if task is complete
                        options={taskStatusOptions} // Status options for the dropdown
                        defaultValue={task.status} // Set the current status as default value
                        triggerClassName={`flex items-center h-4.5 justify-between px-2 py-1 bg-white border border-gray-300 rounded-sm text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] ${
                            task.status === 'complete' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    />
                    {updating && <div className='text-xs text-blue-500 mt-1'>Updating...</div>}
                </div>

                {/* Scheduled Info */}
                <div>
                    <div className='font-medium text-sm text-gray-900 mb-1'>{task.scheduledInfo || 'No Info'}</div>{' '}
                    {/* Ensure scheduledInfo exists */}
                    <div className='text-xs text-gray-500'>{task.scheduledDate || 'Not Scheduled'}</div>{' '}
                    {/* Ensure scheduledDate exists */}
                </div>
            </div>

            {/* Expanded Task Content */}
            {isExpanded && <div className='px-3 py-2.5'>{children}</div>}
        </div>
    )
}

export default TaskCard
