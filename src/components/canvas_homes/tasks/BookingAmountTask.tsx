import React, { useState } from 'react'
import Dropdown from './Dropdown'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../../store'
import { setTaskState } from '../../../store/reducers/canvas-homes/taskIdReducer'
import TaskCompleteModal from '../TaskCompleteModal'
import ChangePropertyModal from '../ChangePropertyModal'
import CloseLeadModal from '../CloseLeadModal'
// import { ref } from 'firebase/storage'

interface DropdownOption {
    label: string
    value: string
    modal?: () => void
}

interface BookingAmountTaskProps {
    refreshData: () => void

    setActiveTab: (tab: string) => void
}

const BookingAmountTask: React.FC<BookingAmountTaskProps> = ({ refreshData, setActiveTab }) => {
    const dispatch = useDispatch<AppDispatch>()
    const [showTaskCompleteModal, setShowTaskCompleteModal] = useState(false)
    const [showChangePropertyModal, setShowChangePropertyModal] = useState(false)
    const [showCloseLeadModal, setShowCloseLeadModal] = useState(false)

    // Define dropdown options with their actions
    const unsuccessfulOptions: DropdownOption[] = [
        {
            label: 'Change Property',
            value: 'change property',
            modal: () => setShowChangePropertyModal(true),
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
            modal: () => setShowCloseLeadModal(true),
        },
    ]

    const handleSuccessfulClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setShowTaskCompleteModal(true)
    }

    const handleUnsuccessfulOptionSelect = (value: string) => {
        // Find and execute the modal function for the selected option
        const option = unsuccessfulOptions.find((opt) => opt.value === value)
        if (option && option.modal) {
            option.modal()
        }
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
                    onSelect={handleUnsuccessfulOptionSelect}
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
                refreshData={refreshData}
            />

            <ChangePropertyModal
                isOpen={showChangePropertyModal}
                onClose={() => setShowChangePropertyModal(false)}
                taskType='booking'
                refreshData={refreshData}
            />

            <CloseLeadModal
                isOpen={showCloseLeadModal}
                onClose={() => setShowCloseLeadModal(false)}
                taskType='booking'
                taskState='booking unsuccessful'
                refreshData={refreshData}
            />
        </>
    )
}

export default BookingAmountTask
