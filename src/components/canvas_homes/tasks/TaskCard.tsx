import React from 'react'
import Dropdown from '../../design-elements/Dropdown'
import { useDispatch } from 'react-redux'
import { setEnquiryId, setTaskId } from '../../../store/reducers/canvas-homes/taskIdReducer'
import type { AppDispatch } from '../../../store'
import { formatUnixDateTime } from '../../helper/getUnixDateTime'

// Define proper type for the task object
interface Task {
    id: string
    enquiryId: string
    title: string
    date: string | number // Could be string or timestamp
    status: string
    type: string
    scheduledInfo: string
    firebaseTask: {
        scheduledDate: number
        completionDate?: number // Optional completion date
        // Add other properties from firebaseTask if needed
    }
    // Add other properties as needed
}

interface TaskCardProps {
    task: Task
    index: number
    isExpanded: boolean
    onToggleExpansion: (taskId: string) => void
    taskStatusOptions: { label: string; value: string }[]
    onStatusUpdate: (taskId: string, selectedStatus: string) => void
    updating?: boolean
    children: React.ReactNode
}

// Helper function to format values for display
const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
        return 'Not Available'
    }
    // Capitalize first letter of each word
    return String(value)
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
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
    const dispatch = useDispatch<AppDispatch>()

    // Handle task card click to toggle expansion (if the task isn't complete)
    const handleCardClick = () => {
        if (task.status !== 'complete') {
            dispatch(setTaskId(task.id))
            dispatch(setEnquiryId(task.enquiryId))
            onToggleExpansion(task.id)
        }
    }

    // Handle the status change and update the task status in the parent component
    const handleStatusChange = (selectedStatus: string) => {
        // Only update status if it's different from the current one
        if (selectedStatus !== task.status) {
            onStatusUpdate(task.id, selectedStatus)
        }
    }

    // Safely format the date (either completion or scheduled)
    const getFormattedDate = () => {
        try {
            if (!task.firebaseTask) return 'Not Available'

            // If task is complete and has a completion date, show that instead
            if (task.status === 'complete' && task.firebaseTask.completionDate) {
                // Use the timestamp directly as it's already in seconds
                return formatUnixDateTime(task.firebaseTask.completionDate) || 'Completion date not available'
            }

            // Otherwise show scheduled date if available
            if (task.firebaseTask.scheduledDate) {
                // Use the timestamp directly as it's already in seconds
                return formatUnixDateTime(task.firebaseTask.scheduledDate) || 'Not Scheduled'
            }

            return 'Not Scheduled'
        } catch (error) {
            console.error('Error formatting date:', error)
            return 'Date not available'
        }
    }

    // Get appropriate label for the date field
    const getDateLabel = () => {
        if (task.status === 'complete' && task.firebaseTask?.completionDate) {
            return 'Completed On:'
        }
        return 'Scheduled For:'
    }

    return (
        <div
            onClick={handleCardClick}
            className={`rounded-md border border-gray-300 ${
                task?.status === 'complete' ? 'cursor-not-allowed' : 'cursor-pointer'
            } transition-all duration-200 ]`}
        >
            <div
                className={`grid grid-cols-3 rounded-t-md gap-40 px-3 py-2.5 items-start hover:bg-gray-100 ${isExpanded ? 'bg-gray-100' : ''}`}
            >
                {/* Task Title & Date */}
                <div className='flex items-center justify-between'>
                    <div>
                        <div className='text-sm font-medium text-gray-900 mb-1'>
                            Task {index + 1}: {formatValue(task.title)}
                        </div>
                        <div className='text-xs text-gray-500'>
                            Created: {task.date ? formatUnixDateTime(task.date) : 'Not Available'}
                        </div>
                    </div>
                </div>

                {/* Status Dropdown */}
                <div>
                    <div className='text-sm font-medium text-gray-900 '>Task Status</div>
                    <Dropdown
                        onSelect={handleStatusChange}
                        disabled={task.type !== 'lead registration' || task.status === 'complete'}
                        options={taskStatusOptions}
                        defaultValue={task.status}
                        className='w-22 inline-block '
                        triggerClassName={`relative w-full h-4.5 px-2 py-1 border border-gray-300 rounded-sm text-xs text-gray-700 bg-white flex items-center justify-between focus:outline-none 
  ${task.type !== 'lead registration' || task.status === 'complete' ? 'opacity-50 cursor-not-allowed [&>svg]:hidden' : 'cursor-pointer'}
  ${task.status ? '[&>span]:font-medium text-black capitalize' : ''}`}
                        menuClassName='absolute z-50 mt-0.5 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                        optionClassName='px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                    />

                    {updating && <div className='text-xs text-blue-500 mt-1'>Updating...</div>}
                </div>

                {/* Scheduled Info */}
                <div>
                    <div className='font-medium text-sm text-gray-900 mb-1'>
                        {task.firebaseTask?.completionDate ? 'Completion Date' : formatValue(task.scheduledInfo)}
                    </div>
                    <div className='text-xs text-gray-500'>{getFormattedDate()}</div>
                </div>
            </div>

            {/* Expanded Task Content */}
            {isExpanded && <div className='px-3 py-2.5'>{children}</div>}
        </div>
    )
}

export default TaskCard
