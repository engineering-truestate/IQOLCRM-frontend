import React, { useState } from 'react'
import Dropdown from './Dropdown'
import SendEmailModal from '../SendEmailModal'

const LeadRegistrationTask = ({ taskStatusOptions }) => {
    const [isModalOpen, setModalOpen] = useState<boolean>(true)

    return (
        <div>
            <div className='flex justify-between items-center'>
                <label className='block text-sm font-medium mb-2'>Builder Email</label>
                <div className='text-sm font-medium text-gray-700'>Registration Portal</div>
            </div>

            <div className='flex justify-between items-center mb-3'>
                <Dropdown
                    onSelect={() => {}}
                    options={taskStatusOptions}
                    placeholder='Select Builder Email'
                    triggerClassName='flex items-center w-[485px] h-8 justify-between px-3 py-2 border border-gray-300 rounded-sm text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                />

                <div className='text-left'>
                    <a href='#' onClick={(e) => e.stopPropagation()} className='text-blue-500 text-sm hover:underline'>
                        Link website
                    </a>
                </div>
            </div>

            <button
                onClick={() => {
                    setModalOpen(true)
                }}
                className='px-2 bg-blue-500 w-26.5 h-8 text-white text-sm rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
                Proceed
            </button>
            {isModalOpen && <SendEmailModal onClose={() => setModalOpen(false)} />}
        </div>
    )
}

export default LeadRegistrationTask
