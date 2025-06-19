import React, { useState, useEffect, useRef } from 'react'
import TaskCard from '../../../../components/canvas_homes/tasks/TaskCard'
import LeadRegistrationTask from '../../../../components/canvas_homes/tasks/LeadRegistrationTask'
import InitialContactTask from '../../../../components/canvas_homes/tasks/InitialContactTask'
import SiteVisitTask from '../../../../components/canvas_homes/tasks/SiteVisitTask'
import CollectEOITask from '../../../../components/canvas_homes/tasks/CollectEOITask'
import BookingAmountTask from '../../../../components/canvas_homes/tasks/BookingAmountTask'
import type { Task } from '../../../../services/canvas_homes/types'
import { updateLead } from '../../../../services/canvas_homes/leadAlgoliaService'

interface TasksProps {
    tasks: Task[]
    loading: boolean
    onTaskStatusUpdate: (taskId: string, status: 'open' | 'complete', taskResult?: string) => Promise<void>
    onUpdateTask?: (taskId: string, updates: any) => Promise<void> // Added missing function
    error?: string | null
    setActiveTab?: (tab: string) => void
    onUpdateEnquiry?: (updates: any) => Promise<void>
    onUpdateLead?: (updates: any) => Promise<void>
    onAddNote?: (noteData: any) => Promise<void>
    agentId?: string
    agentName?: string
}

const Tasks: React.FC<TasksProps> = ({
    tasks: firebaseTasks = [],
    loading,
    onTaskStatusUpdate,
    onUpdateTask,
    error,
    setActiveTab,
    onUpdateEnquiry,
    onUpdateLead,
    onAddNote,
    agentId,
    agentName,
}) => {
    const [expandedTasks, setExpandedTasks] = useState<{ [key: string]: boolean }>({}) // Track which tasks are expanded
    const [taskStates, setTaskStates] = useState<{ [key: string]: { [key: string]: string } }>({}) // Track state for each task
    const [updatingTasks, setUpdatingTasks] = useState<{ [key: string]: boolean }>({}) // Track task updates in progress
    const containerRef = useRef<HTMLDivElement | null>(null)

    const taskStatusOptions = [
        { label: 'Open', value: 'open' },
        { label: 'Complete', value: 'complete' },
    ]

    // Convert Firebase tasks to display format
    const getDisplayTasks = () => {
        return firebaseTasks
            .map((firebaseTask) => ({
                id: firebaseTask.taskId,
                enquiryId: firebaseTask.enquiryId,
                type: firebaseTask.type,
                title: getTaskTitle(firebaseTask.type),
                date: formatDateTime(firebaseTask.added),
                scheduledInfo: firebaseTask?.eventName ? firebaseTask.eventName : getScheduledInfo(firebaseTask),
                scheduledDate: formatDateTime(firebaseTask.scheduledDate),
                status: firebaseTask.status,
                firebaseTask: firebaseTask,
            }))
            .sort((a, b) => {
                const taskOrder: { [key: string]: number } = {
                    'lead registration': 1,
                    'initial contact': 2,
                    'site visit': 3,
                    'eoi collection': 4,
                    booking: 5,
                }

                return (taskOrder[a.type] ?? 999) - (taskOrder[b.type] ?? 999)
            })
    }

    const getTaskTitle = (firebaseType: string): string => {
        const titleMapping: { [key: string]: string } = {
            'lead registration': 'Lead Registration',
            'initial contact': 'Initial Contact',
            'site visit': 'Site Visit',
            'eoi collection': 'Collect EOI',
            booking: 'Booking Amount',
        }
        return titleMapping[firebaseType.toLowerCase()] || firebaseType
    }

    const formatDateTime = (timestamp: number): string => {
        if (!timestamp) return 'Not scheduled'
        const date = new Date(timestamp)
        return (
            date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
            }) +
            ' | ' +
            date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            })
        )
    }

    const getScheduledInfo = (task: Task): string => {
        switch (task.type.toLowerCase()) {
            case 'lead registration':
                return 'Registration scheduled'
            case 'initial contact':
                return 'Call scheduled'
            case 'site visit':
                return 'Visit scheduled'
            case 'eoi collection':
                return 'EOI scheduled'
            case 'booking':
                return 'Booking scheduled'
            default:
                return 'Task scheduled'
        }
    }

    const displayTasks = getDisplayTasks()

    // Handle click outside to collapse expanded tasks
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setExpandedTasks({})
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Toggle task expansion on click
    const toggleTaskExpansion = (taskId: string) => {
        setExpandedTasks((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }))
    }

    // Update task state (e.g., changing task status or any other data)
    const updateTaskState = (taskId: string, key: string, value: string) => {
        setTaskStates((prev) => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                [key]: value,
            },
        }))
    }

    // Get task state from local state
    const getTaskState = (taskId: string, key: string, defaultValue: string = ''): string => {
        return taskStates[taskId]?.[key] || defaultValue
    }

    // Handle task status update
    const handleTaskStatusUpdate = async (taskId: string, selectedStatus: string) => {
        setUpdatingTasks((prev) => ({ ...prev, [taskId]: true }))

        try {
            onTaskStatusUpdate(taskId, 'complete')

            // Update task with completion details
            if (onUpdateTask) {
                await onUpdateTask(taskId, {
                    status: 'complete',
                    lastModified: Date.now(),
                })
            }

            // Update enquiry status and tag
            if (onUpdateEnquiry) {
                await onUpdateEnquiry({
                    stage: 'lead registered',
                    state: 'open',
                })
            }

            // Update lead status, state, and tag
            if (onUpdateLead) {
                await onUpdateLead({
                    stage: 'lead registered',
                    state: 'open',
                    lastModified: Date.now(),
                })
            }

            // ✅ Fix: use selectedStatus instead of undefined status
            setTaskStates((prev) => ({
                ...prev,
                [taskId]: {
                    ...prev[taskId],
                    status: selectedStatus,
                },
            }))
        } catch (error) {
            console.error('Failed to update task:', error)
            alert('Failed to update task status. Please try again.')
        } finally {
            setUpdatingTasks((prev) => ({ ...prev, [taskId]: false }))
        }
    }

    const renderTaskContent = (task: any) => {
        const commonProps = {
            taskId: task.id,
            updateTaskState,
            getTaskState,
            onUpdateLead,
            onUpdateTask,
            onUpdateEnquiry,
            onTaskStatusUpdate,
            onAddNote,
            updating: updatingTasks[task.id] || false,
        }

        switch (task.type.toLowerCase()) {
            case 'lead registration':
                return <LeadRegistrationTask {...commonProps} propertyLink={task.firebaseTask.propertyLink || '#'} />
            case 'initial contact':
                return (
                    <InitialContactTask
                        {...commonProps}
                        setActiveTab={setActiveTab}
                        taskStatusOptions={taskStatusOptions}
                    />
                )
            case 'site visit':
                return (
                    <SiteVisitTask {...commonProps} setActiveTab={setActiveTab} taskStatusOptions={taskStatusOptions} />
                )
            case 'eoi collection':
                return <CollectEOITask {...commonProps} taskStatusOptions={taskStatusOptions} />
            case 'booking':
                return (
                    <BookingAmountTask
                        {...commonProps}
                        taskStatusOptions={taskStatusOptions}
                        setActiveTab={setActiveTab}
                        onTaskStatusUpdate={onTaskStatusUpdate}
                        onUpdateEnquiry={onUpdateEnquiry}
                        onUpdateLead={onUpdateLead}
                        onAddNote={onAddNote}
                        agentId={agentId}
                        agentName={agentName}
                    />
                )
            default:
                return null
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className='bg-white h-full p-4 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                    <p className='text-gray-600'>Loading tasks...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className='bg-white h-full p-4 flex items-center justify-center'>
                <div className='text-center'>
                    <p className='text-red-600 mb-4'>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    // No tasks state
    if (displayTasks.length === 0) {
        return (
            <div className='bg-white h-full p-4 flex items-center justify-center'>
                <div className='text-center text-gray-500'>
                    <svg
                        className='w-12 h-12 mx-auto mb-4 text-gray-300'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
                        />
                    </svg>
                    <p className='text-lg font-medium text-gray-900 mb-2'>No tasks created yet</p>
                    <p className='text-gray-600'>Tasks will appear here when they are created for this enquiry</p>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className='bg-white flex flex-col justify-between h-full p-4 overflow-y-auto scrollbar-hide'
            style={{ height: 'calc(100vh - 110.4px)' }}
        >
            <div
                className='flex flex-col gap-4 overflow-y-auto scrollbar-hide'
                style={{ height: 'calc(100vh - 40px)' }}
            >
                {displayTasks.map((task, index) => (
                    <TaskCard
                        task={task}
                        index={index}
                        isExpanded={expandedTasks[task.id]}
                        onToggleExpansion={toggleTaskExpansion}
                        taskStatusOptions={taskStatusOptions}
                        onStatusUpdate={handleTaskStatusUpdate}
                        updating={updatingTasks[task.id] || false}
                    >
                        {renderTaskContent(task)}
                    </TaskCard>
                ))}
            </div>
        </div>
    )
}

export default Tasks
