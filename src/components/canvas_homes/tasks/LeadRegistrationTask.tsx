import React, { useState } from 'react'
import Dropdown from './Dropdown'
import SendEmailModal from '../SendEmailModal'

const LeadRegistrationTask = ({ propertyLink = '' }) => {
    const [isModalOpen, setModalOpen] = useState<boolean>(false)
    const emailOptions = [
        { value: 'builder1@example.com', label: 'Builder 1' },
        { value: 'builder2@example.com', label: 'Builder 2' },
        { value: 'builder3@example.com', label: 'Builder 3' },
    ]

    const [selectedEmail, setSelectedEmail] = useState<string>('')

    const handleEmailSelect = (email: string) => {
        setSelectedEmail(email)
    }

    return (
        <div className='flex justify-between items-start mb-2 gap-6'>
            {/* LEFT SIDE: Builder Email + Dropdown + Proceed */}
            <div className='flex flex-col gap-2 w-[40%]'>
                <label className='text-sm font-medium text-gray-900'>Builder Email</label>

                <Dropdown
                    defaultValue='Select Builder Email'
                    onSelect={handleEmailSelect}
                    options={emailOptions}
                    placeholder='Select Builder Email'
                    className='w-full'
                    triggerClassName={`relative w-full h-9 px-3 py-2 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none`}
                    menuClassName='absolute z-50 mt-0.5 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                />

                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setModalOpen(true)
                    }}
                    className='w-fit px-4 h-8 bg-blue-500 text-white text-sm rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                    Proceed
                </button>
            </div>

            {/* RIGHT SIDE: Registration Portal + Link */}
            <div className='flex flex-col text-left pr-16 py-2'>
                <span className='text-sm font-medium text-gray-700 mb-1'>Registration Portal</span>
                <a
                    href={propertyLink}
                    onClick={(e) => e.stopPropagation()}
                    className='text-blue-500 text-sm hover:underline'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    Link website
                </a>
            </div>

            {isModalOpen && <SendEmailModal onClose={() => setModalOpen(false)} />}
        </div>
    )
}

export default LeadRegistrationTask
