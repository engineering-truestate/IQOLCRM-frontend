import React, { useState, useEffect, useRef } from 'react'
import TaskCard from '../../../../components/canvas_homes/tasks/TaskCard'
import LeadRegistrationTask from '../../../../components/canvas_homes/tasks/LeadRegistrationTask'
import InitialContactTask from '../../../../components/canvas_homes/tasks/InitialContactTask'
import SiteVisitTask from '../../../../components/canvas_homes/tasks/SiteVisitTask'
import CollectEOITask from '../../../../components/canvas_homes/tasks/CollectEOITask'
import BookingAmountTask from '../../../../components/canvas_homes/tasks/BookingAmountTask'

const Tasks = () => {
    const [expandedTasks, setExpandedTasks] = useState({})
    const [taskStates, setTaskStates] = useState({})
    const containerRef = useRef(null)

    const tasks = [
        {
            id: 1,
            type: 'lead_registration',
            title: 'Lead Registration',
            date: '23/05/25 | 10:30 AM',
            scheduledInfo: 'Registration scheduled',
            scheduledDate: 'May 23, 2023 | 11:30 AM',
        },
        {
            id: 2,
            type: 'initial_contact',
            title: 'Initial Contact',
            date: '23/05/25 | 10:30 AM',
            scheduledInfo: 'Call Scheduled',
            scheduledDate: 'May 23, 2023 | 11:30 AM',
        },
        {
            id: 3,
            type: 'site_visit',
            title: 'Site Visit',
            date: '23/05/25 | 10:30 AM',
            scheduledInfo: 'Visit Scheduled',
            scheduledDate: 'May 23, 2023 | 11:30 AM',
        },
        {
            id: 4,
            type: 'collect_eoi',
            title: 'Collect EOI',
            date: '23/05/25 | 10:30 AM',
            scheduledInfo: 'EOI Scheduled',
            scheduledDate: 'May 23, 2023 | 11:30 AM',
        },
        {
            id: 5,
            type: 'booking_amount',
            title: 'Booking Amount',
            date: '23/05/25 | 10:30 AM',
            scheduledInfo: 'Booking Scheduled',
            scheduledDate: 'May 23, 2023 | 11:30 AM',
        },
    ]

    const taskStatusOptions = [
        { label: 'Open', value: 'open' },
        { label: 'Completed', value: 'completed' },
    ]

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setExpandedTasks({})
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleTaskExpansion = (taskId) => {
        setExpandedTasks((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }))
    }

    const updateTaskState = (taskId, key, value) => {
        setTaskStates((prev) => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                [key]: value,
            },
        }))
    }

    const getTaskState = (taskId, key, defaultValue = '') => {
        return taskStates[taskId]?.[key] || defaultValue
    }

    const renderTaskContent = (task) => {
        const commonProps = {
            taskId: task.id,
            updateTaskState,
            getTaskState,
        }

        switch (task.type) {
            case 'lead_registration':
                return <LeadRegistrationTask taskStatusOptions={taskStatusOptions} />
            case 'initial_contact':
                return <InitialContactTask {...commonProps} />
            case 'site_visit':
                return <SiteVisitTask {...commonProps} />
            case 'collect_eoi':
                return <CollectEOITask {...commonProps} />
            case 'booking_amount':
                return <BookingAmountTask {...commonProps} />
            default:
                return null
        }
    }

    return (
        <div
            ref={containerRef}
            className='bg-white flex flex-col justify-between h-full p-4 overflow-y-auto'
            style={{ height: 'calc(100vh - 110.4px)' }}
        >
            <div className='flex flex-col gap-4 overflow-y-auto' style={{ height: 'calc(100vh - 40px)' }}>
                {tasks.map((task, index) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        isExpanded={expandedTasks[task.id]}
                        onToggleExpansion={toggleTaskExpansion}
                        taskStatusOptions={taskStatusOptions}
                    >
                        {renderTaskContent(task)}
                    </TaskCard>
                ))}
            </div>
        </div>
    )
}

export default Tasks
