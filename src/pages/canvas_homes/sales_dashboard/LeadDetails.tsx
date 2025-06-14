import React, { useState } from 'react'
import Layout from '../../../layout/Layout'
import Documents from './tabs/Documents'
import Notes from './tabs/Notes'
import Requirements from './tabs/Requirements'
import Dropdown from '../../../components/design-elements/Dropdown'

// Types
interface Agent {
    name: string
    lastStage: string
    date: string
}

interface Task {
    id: string
    title: string
    date: string
    status: 'Open' | 'Completed' | 'Scheduled'
    scheduledInfo: string
    scheduledDate: string
}

interface Enquiry {
    id: string
    propertyName: string
    enquiryDate: string
    stage: string
    status: string
    source: string
    tag: string
}

interface LeadDetailProps {
    leadName?: string
    onClose?: () => void
}

const LeadDetails: React.FC<LeadDetailProps> = ({ leadName = 'Rasika Myana', onClose }) => {
    const [activeTab, setActiveTab] = useState('Task')
    const [selectedEnquiry, setSelectedEnquiry] = useState('2')
    const [selectedTaskStatus, setSelectedTaskStatus] = useState<{ [key: string]: string }>({
        '1': 'Open',
        '2': 'Open',
        '3': 'Open',
        '4': 'Open',
        '5': 'Open',
    })

    const tasks: Task[] = [
        {
            id: '1',
            title: 'Lead Registration',
            date: '23/05/25 | 10:30 AM',
            status: 'Open',
            scheduledInfo: 'Registration scheduled',
            scheduledDate: 'May 23, 2023 | 11:30 AM',
        },
        {
            id: '2',
            title: 'Initial Contact',
            date: '23/05/25 | 10:30 AM',
            status: 'Open',
            scheduledInfo: 'Call Scheduled',
            scheduledDate: 'May 23, 2023 | 11:30 AM',
        },
        {
            id: '3',
            title: 'Site Visit',
            date: '23/05/25 | 10:30 AM',
            status: 'Open',
            scheduledInfo: 'Visit Scheduled',
            scheduledDate: 'May 23, 2023 | 11:30 AM',
        },
        {
            id: '4',
            title: 'EOI Collection',
            date: '23/05/25 | 10:30 AM',
            status: 'Open',
            scheduledInfo: 'Visit Scheduled',
            scheduledDate: 'May 23, 2023 | 11:30 AM',
        },
        {
            id: '5',
            title: 'Booking Amount',
            date: '23/05/25 | 10:30 AM',
            status: 'Open',
            scheduledInfo: 'Booking Scheduled',
            scheduledDate: 'May 23, 2023 | 11:30 AM',
        },
    ]

    const enquiries: { [key: string]: Enquiry } = {
        '1': {
            id: '1',
            propertyName: 'Sattva Hamlet',
            enquiryDate: 'May 20, 2023',
            stage: 'Initial Contact',
            status: 'Follow Up',
            source: 'Website',
            tag: 'Warm',
        },
        '2': {
            id: '2',
            propertyName: 'Prestige Gardenia',
            enquiryDate: 'May 23, 2023',
            stage: 'Prestige Gardenia',
            status: '--',
            source: 'Google',
            tag: 'Hot',
        },
    }

    const agents: Agent[] = [
        { name: 'Ish Gupta', lastStage: 'Site Visit', date: 'May 23, 2023' },
        { name: 'Ish Gupta', lastStage: 'Site Visit', date: 'May 23, 2023' },
        { name: 'Ish Gupta', lastStage: 'Site Visit', date: 'May 23, 2023' },
        { name: 'Ish Gupta', lastStage: 'Site Visit', date: 'May 23, 2023' },
    ]

    const tabs = ['Task', 'Properties', 'Requirements', 'Notes', 'Activity tracker', 'Documents']

    const handleStatusChange = (taskId: string, newStatus: string) => {
        setSelectedTaskStatus((prev) => ({
            ...prev,
            [taskId]: newStatus,
        }))
    }

    const currentEnquiry = enquiries[selectedEnquiry]

    const renderTaskContent = () => {
        const taskStatusOptions = [
            { label: 'Open', value: 'open' },
            { label: 'Completed', value: 'completed' },
        ]
        return (
            <div className='bg-white flex flex-col justify-between h-full p-4.5 overflow-y-auto scrollbar-hide'>
                <div className='flex flex-col gap-4'>
                    {tasks.map((task, index) => (
                        <div key={task.id} className='py-3 px-2 h-16 rounded-md border border-gray-300 '>
                            <div className='grid grid-cols-3 gap-8 items-start'>
                                {/* Task Info */}
                                <div>
                                    <div className='text-sm font-medium text-gray-900 mb-1'>
                                        Task {index + 1}: {task.title}
                                    </div>
                                    <div className='text-xs text-gray-500'>Date: {task.date}</div>
                                </div>

                                {/* Task Status */}
                                <div>
                                    <div className='text-sm font-medium text-gray-900'>Task Status</div>
                                    <Dropdown
                                        onSelect={() => {}}
                                        options={taskStatusOptions}
                                        defaultValue={'Open'}
                                        className='relative inline-block'
                                        triggerClassName='flex items-center h-4.5 justify-between px-2 py-1 border border-gray-300 rounded-sm bg-gray-100 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                        optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                                    />
                                </div>

                                {/* Scheduled Info */}
                                <div>
                                    <div className='font-medium text-sm text-gray-900 mb-1'>{task.scheduledInfo}</div>
                                    <div className='text-xs text-gray-500'>{task.scheduledDate}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderTabContent = () => {
        if (activeTab === 'Task') {
            return renderTaskContent()
        } else if (activeTab === 'Documents') {
            return <Documents />
        } else if (activeTab === 'Notes') {
            return <Notes />
        } else if (activeTab === 'Requirements') {
            return <Requirements />
        }

        return (
            <div className='bg-white rounded-lg shadow-sm p-8 h-full'>
                <div className='text-center text-gray-500'>
                    <div className='text-lg font-medium text-gray-900 mb-2'>{activeTab} Content</div>
                    <p className='text-gray-600'>Content for {activeTab} tab will be displayed here</p>
                </div>
            </div>
        )
    }

    return (
        <Layout loading={false}>
            <div className='h-screen w-full flex flex-col overflow-hidden font-sans bg-gray-100'>
                {/* Header with Breadcrumb */}
                <div className='bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0'>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <button onClick={onClose} className='hover:text-gray-800'>
                            <span>Sales Dashboard</span>
                        </button>
                        <span>/</span>
                        <span className='text-gray-900 font-medium'>{leadName}</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className='flex flex-1 overflow-hidden'>
                    <div className='w-[75%]'>
                        {/* Tabs */}
                        <div className='bg-white  border-b border-gray-200 flex-shrink-0'>
                            <div className='px-6'>
                                <div className='flex items-center justify-between'>
                                    <nav className='flex space-x-8'>
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                                                    activeTab === tab
                                                        ? 'border-blue-500 text-blue-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </nav>
                                    <button className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700'>
                                        <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                                            <path
                                                d='M8 1V15M1 8H15'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        Create Task
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='flex-1 h-full overflow-y-auto'>{renderTabContent()}</div>
                    </div>
                    {/* Right Sidebar */}
                    <div
                        className='w-[25%] bg-white border-l border-gray-200 flex flex-col'
                        style={{ height: 'calc(100vh - 40px)' }}
                    >
                        <div className='flex-1 p-4 space-y-6 flex flex-col overflow-hidden'>
                            {/* Customer Details */}
                            <div className='flex-shrink-0'>
                                <div className='flex items-center justify-between mb-3'>
                                    <h3 className='font-medium text-gray-900'>Customer Details</h3>
                                    <button className='bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-300'>
                                        Add Details
                                    </button>
                                </div>
                                <div className='space-y-3'>
                                    <div className='flex justify-between'>
                                        <span className='text-sm text-gray-600'>Name</span>
                                        <span className='text-sm text-gray-900'>{leadName}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-sm text-gray-600'>Phone no.</span>
                                        <span className='text-sm text-gray-900'>+91 9890673423</span>
                                    </div>
                                    <div className='mt-3'>
                                        <input
                                            type='text'
                                            value='Details from Sign 3'
                                            className='w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500'
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Enquiry Details */}
                            <div className='flex-shrink-0'>
                                <div className='flex items-center justify-between mb-3'>
                                    <h3 className='font-medium text-gray-900'>Enquiry Details</h3>
                                    <button className='bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-300'>
                                        Add Enquiry
                                    </button>
                                </div>

                                <div className='space-y-3'>
                                    <div className='flex gap-3'>
                                        <button
                                            onClick={() => setSelectedEnquiry('2')}
                                            className={`text-sm underline ${selectedEnquiry === '2' ? 'text-blue-600 font-medium' : 'text-blue-600 hover:text-blue-800'}`}
                                        >
                                            Enquiry 2
                                        </button>
                                        <button
                                            onClick={() => setSelectedEnquiry('1')}
                                            className={`text-sm underline ${selectedEnquiry === '1' ? 'text-blue-600 font-medium' : 'text-blue-600 hover:text-blue-800'}`}
                                        >
                                            Enquiry 1
                                        </button>
                                        <button className='text-blue-600 hover:text-blue-800 text-sm'>View All</button>
                                    </div>

                                    <div className='space-y-3'>
                                        <div className='flex justify-between'>
                                            <span className='text-sm text-gray-600'>Property Name</span>
                                            <span className='text-sm text-gray-900'>{currentEnquiry.propertyName}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-sm text-gray-600'>Enquiry Date</span>
                                            <span className='text-sm text-gray-900'>{currentEnquiry.enquiryDate}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-sm text-gray-600'>Stage</span>
                                            <span className='text-sm text-gray-900'>{currentEnquiry.stage}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-sm text-gray-600'>Status</span>
                                            <span className='text-sm text-gray-900'>{currentEnquiry.status}</span>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-sm text-gray-600'>Source</span>
                                            <div className='flex items-center gap-2'>
                                                {currentEnquiry.source === 'Google' ? (
                                                    <div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                                                        <span className='text-white text-xs font-bold'>G</span>
                                                    </div>
                                                ) : (
                                                    <div className='w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center'>
                                                        <span className='text-white text-xs font-bold'>W</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-sm text-gray-600'>Tag</span>
                                            <div
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                    currentEnquiry.tag === 'Hot'
                                                        ? 'bg-[#FFEDD5] text-[#9A3412]'
                                                        : 'bg-orange-100 text-orange-800'
                                                }`}
                                            >
                                                <svg width='12' height='12' viewBox='0 0 12 12' fill='none'>
                                                    <path
                                                        d='M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z'
                                                        fill='currentColor'
                                                    />
                                                </svg>
                                                <span>{currentEnquiry.tag}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Agent Details */}
                            <div className='flex-1 flex flex-col min-h-0'>
                                <div className='flex items-center justify-between mb-3 flex-shrink-0'>
                                    <h3 className='font-medium text-gray-900'>Agent Details</h3>
                                    <button className='bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-300'>
                                        Change Agent
                                    </button>
                                </div>

                                <div
                                    className='flex-1 overflow-y-auto scrollbar-hide space-y-4'
                                    style={{
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                    }}
                                >
                                    <style jsx>{`
                                        div::-webkit-scrollbar {
                                            display: none;
                                        }
                                    `}</style>

                                    {agents.map((agent, index) => (
                                        <div key={index} className='space-y-2'>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                                                <span className='text-sm text-gray-600'>Agent Name</span>
                                                <span className='text-sm text-gray-900 ml-auto'>{agent.name}</span>
                                            </div>
                                            <div className='flex justify-between ml-4'>
                                                <span className='text-sm text-gray-600'>Last Stage</span>
                                                <span className='text-sm text-gray-900'>{agent.lastStage}</span>
                                            </div>
                                            <div className='flex justify-between ml-4'>
                                                <span className='text-sm text-gray-600'>Date</span>
                                                <span className='text-sm text-gray-900'>{agent.date}</span>
                                            </div>
                                            {index < agents.length - 1 && <hr className='my-3 border-gray-200' />}
                                        </div>
                                    ))}

                                    {/* Additional agents to demonstrate overflow */}
                                    <div className='space-y-2'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                                            <span className='text-sm text-gray-600'>Agent Name</span>
                                            <span className='text-sm text-gray-900 ml-auto'>Shrikant</span>
                                        </div>
                                        <div className='flex justify-between ml-4'>
                                            <span className='text-sm text-gray-600'>Last Stage</span>
                                            <span className='text-sm text-gray-900'>Site Visit</span>
                                        </div>
                                        <div className='flex justify-between ml-4'>
                                            <span className='text-sm text-gray-600'>Date</span>
                                            <span className='text-sm text-gray-900'>May 23, 2023</span>
                                        </div>
                                    </div>

                                    <hr className='my-3 border-gray-200' />

                                    <div className='space-y-2'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                                            <span className='text-sm text-gray-600'>Agent Name</span>
                                            <span className='text-sm text-gray-900 ml-auto'>Deepak Sharma</span>
                                        </div>
                                        <div className='flex justify-between ml-4'>
                                            <span className='text-sm text-gray-600'>Last Stage</span>
                                            <span className='text-sm text-gray-900'>Site Visit</span>
                                        </div>
                                        <div className='flex justify-between ml-4'>
                                            <span className='text-sm text-gray-600'>Date</span>
                                            <span className='text-sm text-gray-900'>May 23, 2023</span>
                                        </div>
                                    </div>

                                    <hr className='my-3 border-gray-200' />

                                    <div className='space-y-2'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                                            <span className='text-sm text-gray-600'>Agent Name</span>
                                            <span className='text-sm text-gray-900 ml-auto'>Priya Singh</span>
                                        </div>
                                        <div className='flex justify-between ml-4'>
                                            <span className='text-sm text-gray-600'>Last Stage</span>
                                            <span className='text-sm text-gray-900'>Initial Contact</span>
                                        </div>
                                        <div className='flex justify-between ml-4'>
                                            <span className='text-sm text-gray-600'>Date</span>
                                            <span className='text-sm text-gray-900'>May 22, 2023</span>
                                        </div>
                                    </div>

                                    <hr className='my-3 border-gray-200' />

                                    <div className='space-y-2'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                                            <span className='text-sm text-gray-600'>Agent Name</span>
                                            <span className='text-sm text-gray-900 ml-auto'>Rajesh Kumar</span>
                                        </div>
                                        <div className='flex justify-between ml-4'>
                                            <span className='text-sm text-gray-600'>Last Stage</span>
                                            <span className='text-sm text-gray-900'>Follow Up</span>
                                        </div>
                                        <div className='flex justify-between ml-4'>
                                            <span className='text-sm text-gray-600'>Date</span>
                                            <span className='text-sm text-gray-900'>May 21, 2023</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Close Lead Button */}
                        <div className='p-4 border-t border-gray-200 flex-shrink-0'>
                            <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700'>
                                Close lead
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default LeadDetails
