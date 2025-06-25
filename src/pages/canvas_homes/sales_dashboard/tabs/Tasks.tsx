import React, { useState, useEffect, useRef } from 'react'
import TaskCard from '../../../../components/canvas_homes/tasks/TaskCard'
import { useParams } from 'react-router-dom'
import useAuth from '../../../../hooks/useAuth'
import LeadRegistrationTask from '../../../../components/canvas_homes/tasks/LeadRegistrationTask'
import InitialContactTask from '../../../../components/canvas_homes/tasks/InitialContactTask'
import SiteVisitTask from '../../../../components/canvas_homes/tasks/SiteVisitTask'
import CollectEOITask from '../../../../components/canvas_homes/tasks/CollectEOITask'
import BookingAmountTask from '../../../../components/canvas_homes/tasks/BookingAmountTask'
import type { Task } from '../../../../services/canvas_homes/types'
import { taskService } from '../../../../services/canvas_homes/taskService'
import { leadService } from '../../../../services/canvas_homes/leadService'
import { enquiryService } from '../../../../services/canvas_homes/enquiryService'
import { getUnixDateTime } from '../../../../components/helper/getUnixDateTime'

interface TasksProps {
    tasks: Task[]
    loading: boolean
    error?: string | null
    setActiveTab?: (tab: string) => void
    refreshData?: () => void
}

interface DisplayTask {
    id: string
    enquiryId: string
    type: string
    title: string
    date: number
    scheduledInfo: string
    scheduledDate?: number
    completionDate?: number
    status: string
    firebaseTask: Task
    eoiEntries: any[]
}

const Tasks: React.FC<TasksProps> = ({ tasks: firebaseTasks = [], loading, error, setActiveTab, refreshData }) => {
    const [expandedTasks, setExpandedTasks] = useState<{ [key: string]: boolean }>({}) // Track which tasks are expanded
    const [taskStates, setTaskStates] = useState<{ [key: string]: { [key: string]: string } }>({}) // Track state for each task
    const [updatingTasks, setUpdatingTasks] = useState<{ [key: string]: boolean }>({}) // Track task updates in progress
    const containerRef = useRef<HTMLDivElement | null>(null)

    const taskStatusOptions = [
        { label: 'Open', value: 'open' },
        { label: 'Complete', value: 'complete' },
    ]
    const { leadId } = useParams<{ leadId?: string }>()
    const { user } = useAuth()
    // const agentId = user?.uid || ''
    // const agentName = user?.displayName || ''

    // Convert Firebase tasks to display format
    const getDisplayTasks = (): DisplayTask[] => {
        return firebaseTasks
            .map((firebaseTask) => ({
                id: firebaseTask.taskId,
                enquiryId: firebaseTask.enquiryId,
                type: firebaseTask.taskType,
                title: getTaskTitle(firebaseTask.taskType),
                date: firebaseTask.added,
                scheduledInfo: firebaseTask?.eventName ? firebaseTask.eventName : getScheduledInfo(firebaseTask),
                scheduledDate: firebaseTask.scheduledDate,
                completionDate: firebaseTask.completionDate,
                status: firebaseTask.status,
                firebaseTask: firebaseTask,
                eoiEntries: firebaseTask.eoiEntries || [],
            }))
            .sort((a, b) => {
                return a.date - b.date
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
        return titleMapping[firebaseType] || firebaseType
    }

    const getScheduledInfo = (task: Task): string => {
        switch (task.taskType.toLowerCase()) {
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

    // Handle task status update using services
    const handleTaskStatusUpdate = async (taskId: string, selectedStatus: string) => {
        setUpdatingTasks((prev) => ({ ...prev, [taskId]: true }))

        try {
            const currentUnixTime = getUnixDateTime()

            // Prepare the task update promise
            const taskUpdatePromise = taskService.update(taskId, {
                status: 'complete',
                completionDate: currentUnixTime,
                lastModified: currentUnixTime,
            })

            // Prepare enquiry updates if enquiryId exists
            const enquiryUpdatePromise = new Promise<void>((resolve, reject) => {
                const task = firebaseTasks.find((t) => t.taskId === taskId)
                if (task?.enquiryId) {
                    Promise.all([
                        enquiryService.update(task.enquiryId, {
                            stage: 'lead registered',
                            state: 'open',
                        }),
                        enquiryService.addActivity(task.enquiryId, {
                            activityType: 'task execution',
                            agentName: user?.displayName || 'Unknown Agent',
                            timestamp: currentUnixTime,
                            data: {},
                        }),
                    ])
                        .then(() => resolve())
                        .catch((error) => reject(error))
                } else {
                    resolve() // No enquiryId, resolve immediately
                }
            })

            // Prepare lead update promise if leadId exists
            const leadUpdatePromise = leadId
                ? leadService.update(leadId, {
                      stage: 'lead registered',
                      state: 'open',
                      //   completionDate: currentUnixTime,
                      lastModified: currentUnixTime,
                  })
                : Promise.resolve() // If no leadId, resolve immediately

            // Wait for all promises to complete in parallel
            await Promise.all([taskUpdatePromise, enquiryUpdatePromise, leadUpdatePromise])

            // ✅ Fix: use selectedStatus instead of undefined status
            setTaskStates((prev) => ({
                ...prev,
                [taskId]: {
                    ...prev[taskId],
                    status: selectedStatus,
                },
            }))

            // Refresh data if callback provided
            if (refreshData) {
                refreshData()
            }
        } catch (error) {
            console.error('Failed to update task:', error)
            alert('Failed to update task status. Please try again.')
        } finally {
            setUpdatingTasks((prev) => ({ ...prev, [taskId]: false }))
        }
    }

    const renderTaskContent = (task: DisplayTask) => {
        const commonProps = {
            taskStatusOptions,
            refreshData,
        }

        switch (task.type?.toLowerCase()) {
            case 'lead registration':
                return <LeadRegistrationTask propertyLink={(task.firebaseTask as any).propertyLink || '#'} />
            case 'initial contact':
                return <InitialContactTask {...commonProps} setActiveTab={setActiveTab || (() => {})} />
            case 'site visit':
                return (
                    <SiteVisitTask
                        {...commonProps}
                        refreshData={refreshData || (() => {})}
                        setActiveTab={setActiveTab || (() => {})}
                    />
                )
            case 'eoi collection':
                return (
                    <CollectEOITask
                        {...commonProps}
                        refreshData={refreshData || (() => {})}
                        setActiveTab={setActiveTab || (() => {})}
                        eoiEntries={task.eoiEntries}
                        updateTaskState={updateTaskState}
                        getTaskState={getTaskState}
                    />
                )
            case 'booking':
                return (
                    <BookingAmountTask
                        {...commonProps}
                        refreshData={refreshData || (() => {})}
                        setActiveTab={setActiveTab || (() => {})}
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
                        key={task.id}
                        task={task}
                        index={index}
                        isExpanded={expandedTasks[task.id] || task.eoiEntries?.length > 0}
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
