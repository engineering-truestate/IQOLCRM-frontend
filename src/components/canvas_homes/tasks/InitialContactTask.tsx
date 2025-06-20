import React, { useCallback } from 'react'
import { useState } from 'react'
import Dropdown from './Dropdown'
import ChangePropertyModal from '../ChangePropertyModal'
import RequirementCollectedModal from '../RquirementCollectionModal'
import CloseLeadModal from '../CloseLeadModal'
import type { AppDispatch } from '../../../store'
import { useDispatch } from 'react-redux'
import { setTaskState } from '../../../store/reducers/canvas-homes/taskIdReducer'
import RescheduleEventModal from '../RescheduleEventModal'

interface InitialContactTaskProps {
    taskId: string
    updateTaskState: (taskId: string, key: string, value: any) => void
    taskStatusOptions: { label: string; value: string }[]
    setActiveTab?: (tab: string) => void
}

const InitialContactTask: React.FC<InitialContactTaskProps> = ({
    taskId,
    updateTaskState,
    taskStatusOptions,
    setActiveTab,
}) => {
    const [isChangePropertyModalOpen, setIsChangePropertyModalOpen] = useState(false)
    const [isResheduleEventModalOpen, setIsRescheduleEventModalOpen] = useState(false)
    const [taskType, setTaskType] = useState('Initial Contact')

    const dispatch = useDispatch<AppDispatch>()

    const interestedOptions = [
        { label: 'Interested', value: 'interested', task: () => console.log('Interested') },
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
                },
            ],
        },
        {
            label: 'Reschedule Event',
            value: 'reschedule_event',
            modal: useCallback(() => {
                setTaskType('Initial Contact - Connected')
                setIsRescheduleEventModalOpen(true)
            }, [setIsRescheduleEventModalOpen]),
        },
    ]

    const notConnectedOptions = [
        {
            label: 'Reschedule Task',
            value: 'reschedule task',
            modal: useCallback(() => {
                setTaskType('Initial Contact - Not Connected')
                setIsRescheduleEventModalOpen(true)
            }, [setIsRescheduleEventModalOpen]),
        },
        { label: 'Close Lead', value: 'close lead' },
    ]

    const handleSelect = (value: string) => updateTaskState(taskId, 'eoiMode', value)

    const handleChangeProperty = (formData: any) => {
        console.log('Change property form data:', formData)
        setIsChangePropertyModalOpen(false) // Close the modal after submitting
    }

    return (
        <div>
            <div className='flex gap-3'>
                <Dropdown
                    options={interestedOptions}
                    onSelect={handleSelect}
                    triggerClassName='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#40A42B] text-sm text-white min-w-[100px] cursor-pointer'
                    nestedOptionClassName='ml-4 border-l border-gray-200 bg-gray-50 rounded-md'
                    placeholder='Connected'
                    defaultValue=''
                />

                <Dropdown
                    options={notConnectedOptions}
                    onSelect={handleSelect}
                    triggerClassName='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#F02532] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    placeholder='Not Connected'
                    defaultValue=''
                />
            </div>
            {isChangePropertyModalOpen && (
                <ChangePropertyModal
                    isOpen={isChangePropertyModalOpen}
                    onClose={() => setIsChangePropertyModalOpen(false)}
                    onChangeProperty={handleChangeProperty}
                />
            )}
            {isResheduleEventModalOpen && (
                <RescheduleEventModal
                    isOpen={isResheduleEventModalOpen}
                    onClose={() => setIsRescheduleEventModalOpen(false)}
                    taskType={taskType}
                />
            )}
        </div>
    )
}

export default InitialContactTask
