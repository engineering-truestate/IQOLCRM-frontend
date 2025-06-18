import React, { useCallback, useState } from 'react'
import Dropdown from './Dropdown'
import RequirementCollectedModal from '../RquirementCollectionModal'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../../store'
import { setTaskState } from '../../../store/reducers/canvas-homes/taskIdReducer'

// Define interfaces for better type safety
interface DropdownOption {
    label: string
    value: string
    modal?: () => void
}

interface SiteVisitTaskProps {
    taskId: string
    updateTaskState: (taskId: string, field: string, value: string) => void
    setActiveTab: (tab: string) => void
}

const SiteVisitTask: React.FC<SiteVisitTaskProps> = ({ taskId, updateTaskState, setActiveTab }) => {
    const dispatch = useDispatch<AppDispatch>()

    const visitedOptions: DropdownOption[] = [
        { label: 'Want To Book', value: 'want to book' },
        { label: 'Change Property', value: 'change property' },
        {
            label: 'Collect Requirement',
            value: 'collect requirement',
            modal: useCallback(() => {
                console.log('Collect Requirement Modal Opened', taskId)
                dispatch(setTaskState('Site Visit'))
                setActiveTab('Requirements')
            }, []),
        },
        { label: 'Close Lead', value: 'close lead' },
    ]

    const notVisitedOptions: DropdownOption[] = [
        { label: 'Reschedule Task', value: 'reschedule task' },
        { label: 'Change Property', value: 'change property' },
        {
            label: 'Collect Requirement',
            value: 'collect requirement',
            modal: useCallback(() => {
                dispatch(setTaskState('Site Not Visit'))
                setActiveTab('Requirements')
            }, []),
        },
        { label: 'Close Lead', value: 'close lead' },
    ]

    const handleSelect = useCallback(
        (value: string) => {
            updateTaskState(taskId, 'eoiMode', value)
        },
        [taskId, updateTaskState],
    )

    return (
        <div className='flex gap-3'>
            <Dropdown
                defaultValue=''
                options={visitedOptions}
                onSelect={handleSelect}
                triggerClassName='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#40A42B] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                placeholder='Visited'
            />

            <Dropdown
                defaultValue=''
                options={notVisitedOptions}
                onSelect={handleSelect}
                triggerClassName='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#F02532] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                placeholder='Not Visited'
            />
        </div>
    )
}

export default SiteVisitTask
