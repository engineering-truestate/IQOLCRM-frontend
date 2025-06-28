import React, { useCallback } from 'react'
import { useState } from 'react'
import Dropdown from './Dropdown'
import type { AppDispatch } from '../../../store'
import { useDispatch } from 'react-redux'
import { setTaskState } from '../../../store/reducers/canvas-homes/taskIdReducer'
import ChangePropertyModal from '../ChangePropertyModal'
import RescheduleEventModal from '../RescheduleEventModal'
import TaskCompleteModal from '../TaskCompleteModal'
import CloseLeadModal from '../CloseLeadModal'

interface InitialContactTaskProps {
    refreshData?: any
    setActiveTab: (tab: string) => void
    taskStatusOptions: Array<{ label: string; value: string }>
}

const InitialContactTask: React.FC<InitialContactTaskProps> = ({ setActiveTab, refreshData }) => {
    const [isChangePropertyModalOpen, setIsChangePropertyModalOpen] = useState(false)
    const [isResheduleEventModalOpen, setIsRescheduleEventModalOpen] = useState(false)
    const [isCloseLeadModalOpen, setIsCloseLeadModalOpen] = useState(false)
    const [isTaskCompleteModalOpen, setIsTaskCompleteModalOpen] = useState(false)
    const [taskState, changeTaskState] = useState('connected')
    // const [taskType, setTaskType] = useState('Initial Contact')

    const dispatch = useDispatch<AppDispatch>()

    const interestedOptions = [
        {
            label: 'Interested',
            value: 'interested',
            modal: useCallback(() => setIsTaskCompleteModalOpen(true), [setIsTaskCompleteModalOpen]),
        },
        {
            label: 'Not Interested',
            value: 'not_interested',
            subOptions: [
                {
                    label: 'Change Property',
                    value: 'change_property',
                    modal: useCallback(() => setIsChangePropertyModalOpen(true), [setIsChangePropertyModalOpen]),
                },
                {
                    label: 'Collect Requirement',
                    value: 'collect_requirement',
                    modal: useCallback(() => {
                        dispatch(setTaskState('Initial Contact'))
                        if (setActiveTab) {
                            setActiveTab('Requirements')
                        }
                    }, [dispatch, setActiveTab]),
                },
                {
                    label: 'Close Lead',
                    value: 'close_lead',
                    modal: useCallback(() => {
                        changeTaskState('connected')
                        setIsCloseLeadModalOpen(true)
                    }, [setIsCloseLeadModalOpen]),
                },
            ],
        },
        {
            label: 'Reschedule Event',
            value: 'reschedule_event',
            modal: useCallback(() => {
                changeTaskState('connected')
                setIsRescheduleEventModalOpen(true)
            }, [setIsRescheduleEventModalOpen]),
        },
    ]

    const notConnectedOptions = [
        {
            label: 'Reschedule Task',
            value: 'reschedule task',
            modal: useCallback(() => {
                changeTaskState('not connected')
                setIsRescheduleEventModalOpen(true)
            }, [setIsRescheduleEventModalOpen]),
        },
        {
            label: 'Close Lead',
            value: 'close_lead',
            modal: useCallback(() => {
                changeTaskState('not conected')
                setIsCloseLeadModalOpen(true)
            }, [setIsCloseLeadModalOpen]),
        },
    ]

    const handleSelect = (value: string) => {
        // Since we don't have taskId prop anymore, child components will handle their own updates
        console.log('Selected value:', value)
    }

    return (
        <div>
            <div className='flex gap-3'>
                <Dropdown
                    options={interestedOptions}
                    onSelect={handleSelect}
                    triggerClassName='flex items-center h-8 w-full justify-between p-2  rounded-sm bg-[#40A42B] text-sm text-white min-w-[100px] cursor-pointer'
                    nestedOptionClassName='ml-2 border-l w-fit border-gray-200 bg-gray- rounded-md text-[13px]'
                    placeholder='Connected'
                    defaultValue=''
                />

                <Dropdown
                    options={notConnectedOptions}
                    onSelect={handleSelect}
                    triggerClassName='flex items-center h-8 w-full justify-between p-2 rounded-sm bg-[#F02532] text-sm text-white focus:outline-none min-w-[100px] cursor-pointer'
                    placeholder='Not Connected'
                    defaultValue=''
                />
            </div>
            {isChangePropertyModalOpen && (
                <ChangePropertyModal
                    isOpen={isChangePropertyModalOpen}
                    onClose={() => setIsChangePropertyModalOpen(false)}
                    taskType='initial contact'
                    refreshData={refreshData}
                />
            )}
            {isResheduleEventModalOpen && (
                <RescheduleEventModal
                    isOpen={isResheduleEventModalOpen}
                    onClose={() => setIsRescheduleEventModalOpen(false)}
                    taskType='initial contact'
                    taskState={taskState}
                    refreshData={refreshData}
                />
            )}
            <CloseLeadModal
                isOpen={isCloseLeadModalOpen}
                onClose={() => setIsCloseLeadModalOpen(false)}
                taskType='initial contact'
                taskState={taskState}
                refreshData={refreshData}
            />
            <TaskCompleteModal
                isOpen={isTaskCompleteModalOpen}
                onClose={() => setIsTaskCompleteModalOpen(false)}
                title='interested'
                leadStatus='interested'
                stage='initial contacted'
                state='open'
                refreshData={refreshData}
                taskType='initial contact'
            />
        </div>
    )
}

export default InitialContactTask
