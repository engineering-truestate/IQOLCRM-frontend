import { useCallback } from 'react'
import React, { useState } from 'react'
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
    setActiveTab: (tab: string) => void
    refreshData: () => void
}

const SiteVisitTask: React.FC<SiteVisitTaskProps> = ({ setActiveTab, refreshData }) => {
    const dispatch = useDispatch<AppDispatch>()
    const [showTaskCompleteModal, setShowTaskCompleteModal] = useState(false)
    const [showChangePropertyModal, setShowChangePropertyModal] = useState(false)
    const [showCloseLeadModal, setShowCloseLeadModal] = useState(false) // Fixed variable name
    const [showRescheduleEvent, setShowRescheduleEvent] = useState(false)
    const [taskState, changeTaskState] = useState('') // Renamed for clarity

    // Define the dropdown options with appropriate handlers
    const visitedOptions: DropdownOption[] = [
        {
            label: 'Want To Book',
            value: 'want to book',
            modal: () => setShowTaskCompleteModal(true),
        },
        {
            label: 'Change Property',
            value: 'change property',
            modal: () => setShowChangePropertyModal(true),
        },
        {
            label: 'Collect Requirement',
            value: 'collect_requirement',
            modal: useCallback(() => {
                dispatch(setTaskState('site visit'))
                if (setActiveTab) {
                    setActiveTab('Requirements')
                }
            }, [dispatch, setActiveTab]),
        },
        {
            label: 'Close Lead',
            value: 'close lead',
            modal: () => {
                changeTaskState('visited')
                setShowCloseLeadModal(true)
            },
        },
    ]

    const notVisitedOptions: DropdownOption[] = [
        {
            label: 'Reschedule Task',
            value: 'reschedule task',
            modal: () => setShowRescheduleEvent(true),
        },
        {
            label: 'Change Property',
            value: 'change property',
            modal: () => setShowChangePropertyModal(true),
        },
        {
            label: 'Collect Requirement',
            value: 'collect requirement',
            modal: () => {
                dispatch(setTaskState('site not visit'))
                setActiveTab('Requirements')
            },
        },
        {
            label: 'Close Lead',
            value: 'close lead',
            modal: () => {
                changeTaskState('not visited')
                setShowCloseLeadModal(true)
            },
        },
    ]

    // Unified handler for dropdown selections
    const handleDropdownSelect = (options: DropdownOption[], value: string) => {
        const option = options.find((opt) => opt.value === value)
        if (option && option.modal) {
            option.modal()
        }
    }

    return (
        <>
            <div className='flex gap-3'>
                <Dropdown
                    defaultValue=''
                    options={visitedOptions}
                    onSelect={(value: string) => handleDropdownSelect(visitedOptions, value)}
                    triggerClassName='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#40A42B] text-sm text-white min-w-[100px] cursor-pointer'
                    placeholder='Visited'
                />

                <Dropdown
                    defaultValue=''
                    options={notVisitedOptions}
                    onSelect={(value: string) => handleDropdownSelect(notVisitedOptions, value)}
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
                refreshData={refreshData}
            />

            <ChangePropertyModal
                isOpen={showChangePropertyModal}
                onClose={() => setShowChangePropertyModal(false)}
                taskType='site visit'
                refreshData={refreshData}
            />

            <CloseLeadModal
                isOpen={showCloseLeadModal}
                onClose={() => setShowCloseLeadModal(false)}
                taskType='site visit'
                taskState={taskState}
                refreshData={refreshData}
            />

            <RescheduleEventModal
                isOpen={showRescheduleEvent}
                onClose={() => setShowRescheduleEvent(false)}
                taskType='site visit'
                taskState='not visited'
                refreshData={refreshData}
            />
        </>
    )
}

export default SiteVisitTask
