import React, { useCallback, useState } from 'react'
import Dropdown from './Dropdown'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../../store'
import { setTaskState } from '../../../store/reducers/canvas-homes/taskIdReducer'
import TaskCompleteModal from '../TaskCompleteModal'
import ChangePropertyModal from '../ChangePropertyModal'
import CloseLeadModal from '../CloseLeadModal'
import RescheduleEventModal from '../RescheduleEventModal'

interface DropdownOption {
    label: string
    value: string
    modal?: () => void
}

interface SiteVisitTaskProps {
    taskId: string
    updateTaskState: (taskId: string, field: string, value: string) => void
    getTaskState?: (taskId: string) => any
    onUpdateLead?: () => void
    onUpdateEnquiry?: () => void
    onUpdateTask?: (taskId: string, updates: any) => Promise<void>
    onTaskStatusUpdate?: () => void
    onAddNote?: () => void
    updating?: boolean
    setActiveTab: (tab: string) => void
}

const SiteVisitTask: React.FC<SiteVisitTaskProps> = ({
    updateTaskState,
    onUpdateLead,
    onUpdateEnquiry,
    onUpdateTask,
    onAddNote,
    updating = false,
    setActiveTab,
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const [showTaskCompleteModal, setShowTaskCompleteModal] = useState(false)
    const [showChangePropertyModal, setShowChangePropertyModal] = useState(false)
    const [showcloseLeadModal, setShowCloseLeadModal] = useState(false)
    const [showRescheduleEvent, setShowRescheduleEvent] = useState(false)
    const [taskState, changeTaskState] = useState('')

    const commonModalProps = {
        onUpdateLead,
        onUpdateEnquiry,
        onUpdateTask,
        onAddNote,
    }

    const visitedOptions: DropdownOption[] = [
        { label: 'Want To Book', value: 'want to book' },
        {
            label: 'Change Property',
            value: 'change property',
        },
        {
            label: 'Collect Requirement',
            value: 'collect requirement',
            modal: () => {
                dispatch(setTaskState('Site Visit'))
                setActiveTab('Requirements')
            },
        },
        { label: 'Close Lead', value: 'close lead' },
    ]

    const notVisitedOptions: DropdownOption[] = [
        { label: 'Reschedule Task', value: 'reschedule task' },
        {
            label: 'Change Property',
            value: 'change property',
        },
        {
            label: 'Collect Requirement',
            value: 'collect requirement',
            modal: () => {
                dispatch(setTaskState('Site Not Visit'))
                setActiveTab('Requirements')
            },
        },
        { label: 'Close Lead', value: 'close lead' },
    ]

    const handleVisitedAction = (value: string) => {
        if (value === 'want to book') setShowTaskCompleteModal(true)
        if (value === 'change property') setShowChangePropertyModal(true)
        if (value === 'close lead') {
            changeTaskState('visited')
            setShowCloseLeadModal(true)
        }
    }

    const handleNotVisitedAction = (value: string) => {
        if (value === 'reschedule task') setShowRescheduleEvent(true)
        if (value === 'change property') setShowChangePropertyModal(true)
        if (value === 'close lead') {
            changeTaskState('not visited')
            setShowCloseLeadModal(true)
        }
    }

    return (
        <>
            <div className='flex gap-3'>
                <Dropdown
                    defaultValue=''
                    options={visitedOptions}
                    onSelect={handleVisitedAction}
                    triggerClassName='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#40A42B] text-sm text-white min-w-[100px] cursor-pointer'
                    placeholder='Visited'
                />

                <Dropdown
                    defaultValue=''
                    options={notVisitedOptions}
                    onSelect={handleNotVisitedAction}
                    triggerClassName='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#F02532] text-sm text-white min-w-[100px] cursor-pointer'
                    placeholder='Not Visited'
                />
            </div>

            <TaskCompleteModal
                isOpen={showTaskCompleteModal}
                onClose={() => setShowTaskCompleteModal(false)}
                title='Want to Book'
                leadStatus='interested'
                stage='site visited'
                state='open'
                taskType='site visit'
                {...commonModalProps}
            />

            <ChangePropertyModal
                isOpen={showChangePropertyModal}
                onClose={() => setShowChangePropertyModal(false)}
                taskType='site visit'
                {...commonModalProps}
            />
            <CloseLeadModal
                isOpen={showcloseLeadModal}
                onClose={() => setShowCloseLeadModal(false)}
                taskType='site visit'
                taskState={taskState}
                {...commonModalProps}
            />
            <RescheduleEventModal
                isOpen={showRescheduleEvent}
                onClose={() => setShowRescheduleEvent(false)}
                taskType='site visit'
                taskState={taskState}
                {...commonModalProps}
            />
        </>
    )
}

export default SiteVisitTask
