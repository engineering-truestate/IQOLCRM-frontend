import React, { useState, useCallback } from 'react'
import Dropdown from './Dropdown'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../../store'
import { setTaskState } from '../../../store/reducers/canvas-homes/taskIdReducer'
import TaskCompleteModal from '../TaskCompleteModal'
import ChangePropertyModal from '../ChangePropertyModal'
import CloseLeadModal from '../CloseLeadModal'

interface DropdownOption {
    label: string
    value: string
    modal?: () => void
}

interface BookingAmountTaskProps {
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

const BookingAmountTask: React.FC<BookingAmountTaskProps> = ({
    taskId,
    updateTaskState,
    getTaskState,
    onUpdateLead,
    onUpdateEnquiry,
    onUpdateTask,
    onAddNote,
    onTaskStatusUpdate,
    updating = false,
    setActiveTab,
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const [showTaskCompleteModal, setShowTaskCompleteModal] = useState(false)
    const [showChangePropertyModal, setShowChangePropertyModal] = useState(false)
    const [showCloseLeadModal, setShowCloseLeadModal] = useState(false)
    const [isDebounced, setIsDebounced] = useState(false)

    const commonModalProps = {
        onUpdateLead,
        onUpdateEnquiry,
        onUpdateTask,
        onAddNote,
    }

    const unsuccessfulOptions: DropdownOption[] = [
        {
            label: 'Change Property',
            value: 'change property',
        },
        {
            label: 'Collect Requirement',
            value: 'collect requirement',
            modal: () => {
                dispatch(setTaskState('Booking Unsuccessful'))
                setActiveTab('Requirements')
            },
        },
        {
            label: 'Close Lead',
            value: 'close lead',
        },
    ]

    const handleSuccessfulClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        console.log('Successful button clicked')
        setShowTaskCompleteModal(true)
    }

    const handleUnsuccessfulOptionAction = (value: string) => {
        console.log('Unsuccessful option selected:', value)
        if (value === 'change property') setShowChangePropertyModal(true)
        if (value === 'close lead') setShowCloseLeadModal(true)
    }

    return (
        <>
            <div className='flex gap-3'>
                <button
                    onClick={handleSuccessfulClick}
                    className='flex items-center h-8 px-3 justify-center border border-gray-300 rounded-sm bg-[#40A42B] text-sm text-white min-w-[100px] cursor-pointer hover:bg-green-600'
                    type='button'
                >
                    Successful
                </button>

                <Dropdown
                    defaultValue=''
                    options={unsuccessfulOptions}
                    onSelect={handleUnsuccessfulOptionAction}
                    triggerClassName='flex items-center h-8 justify-between px-3 border border-gray-300 rounded-sm bg-[#F02532] text-sm text-white min-w-[100px] cursor-pointer hover:bg-red-600'
                    placeholder='Unsuccessful'
                />
            </div>

            {/* Modals */}
            <TaskCompleteModal
                isOpen={showTaskCompleteModal}
                onClose={() => setShowTaskCompleteModal(false)}
                title='Booking Successful'
                leadStatus='closed'
                stage='booking confirmed'
                state='closed'
                taskType='booking'
                {...commonModalProps}
            />

            <ChangePropertyModal
                isOpen={showChangePropertyModal}
                onClose={() => setShowChangePropertyModal(false)}
                taskType='booking'
                {...commonModalProps}
            />

            <CloseLeadModal
                isOpen={showCloseLeadModal}
                onClose={() => setShowCloseLeadModal(false)}
                taskType='booking'
                taskState='booking unsuccessful'
                {...commonModalProps}
            />
        </>
    )
}

export default BookingAmountTask
