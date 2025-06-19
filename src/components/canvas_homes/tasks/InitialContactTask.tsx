import React, { useCallback } from 'react'
import { useState } from 'react'
import Dropdown from './Dropdown'
import ChangePropertyModal from '../ChangePropertyModal'

interface InitialContactTaskProps {
    taskId: string
    updateTaskState: (taskId: string, key: string, value: any) => void
    taskStatusOptions: { label: string; value: string }[]
}

const InitialContactTask: React.FC<InitialContactTaskProps> = ({ taskId, updateTaskState, taskStatusOptions }) => {
    const [isChangePropertyModalOpen, setIsChangePropertyModalOpen] = useState(false)

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
                    modal: () => console.log('Collect Requirement modal'),
                },
                {
                    label: 'Close Lead',
                    value: 'close_lead',
                    modal: () => console.log('Close Lead'),
                },
            ],
        },
        {
            label: 'Reschedule Event',
            value: 'reschedule_event',
            task: () => console.log('Reschedule'),
        },
    ]

    const notConnectedOptions = [
        { label: 'Reschedule Task', value: 'reschedule task' },
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
        </div>
    )
}

export default InitialContactTask
