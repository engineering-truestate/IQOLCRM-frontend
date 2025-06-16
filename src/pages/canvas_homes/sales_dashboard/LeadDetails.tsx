import React, { useState } from 'react'
import Layout from '../../../layout/Layout'
import Documents from './tabs/Documents'
import Notes from './tabs/Notes'
import Requirements from './tabs/Requirements'
import Tasks from './tabs/Tasks'
import Dropdown from '../../../components/design-elements/Dropdown'
import CreateTaskModal from '../../../components/canvas_homes/CreateTaskModal'
import google from '/icons/canvas_homes/google.svg'

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
    // State Management
    const [activeTab, setActiveTab] = useState('Task')
    const [selectedEnquiry, setSelectedEnquiry] = useState('1')
    const [selectedTaskStatus, setSelectedTaskStatus] = useState<{ [key: string]: string }>({
        '1': 'Open',
        '2': 'Open',
        '3': 'Open',
        '4': 'Open',
        '5': 'Open',
    })
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)

    // Sample Data
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
        { name: 'Shrikant', lastStage: 'Site Visit', date: 'May 23, 2023' },
        { name: 'Deepak Sharma', lastStage: 'Site Visit', date: 'May 23, 2023' },
        { name: 'Priya Singh', lastStage: 'Follow Up', date: 'May 24, 2023' },
        { name: 'Rahul Kumar', lastStage: 'Initial Contact', date: 'May 25, 2023' },
    ]

    const tabs = ['Task', 'Properties', 'Requirements', 'Notes', 'Activity tracker', 'Documents']

    // Event Handlers
    const handleStatusChange = (taskId: string, newStatus: string) => {
        setSelectedTaskStatus((prev) => ({
            ...prev,
            [taskId]: newStatus,
        }))
    }

    const handleCreateTaskClick = () => {
        setIsCreateTaskModalOpen(true)
    }

    const handleCloseCreateTaskModal = () => {
        setIsCreateTaskModalOpen(false)
    }

    // Computed Values
    const currentEnquiry = enquiries[selectedEnquiry]

    // Tab Content Renderer
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Task':
                return <Tasks />
            case 'Documents':
                return <Documents />
            case 'Notes':
                return <Notes />
            case 'Requirements':
                return <Requirements />
            default:
                return (
                    <div className='bg-white rounded-lg shadow-sm p-8 h-full'>
                        <div className='text-center text-gray-500'>
                            <div className='text-lg font-medium text-gray-900 mb-2'>{activeTab} Content</div>
                            <p className='text-gray-600'>Content for {activeTab} tab will be displayed here</p>
                        </div>
                    </div>
                )
        }
    }

    // Agent Item Component
    const AgentItem: React.FC<{ agent: Agent; showDivider: boolean }> = ({ agent, showDivider }) => (
        <div className='space-y-2'>
            <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                <span className='text-[13px] w-[60%] text-gray-600'>Agent Name</span>
                <span className='text-[13px] w-[40%] text-left text-gray-900 ml-auto'>{agent.name}</span>
            </div>
            <div className='flex justify-between ml-4'>
                <span className='text-[13px] w-[60%] text-gray-600'>Last Stage</span>
                <span className='text-[13px] w-[40%] text-left text-gray-900'>{agent.lastStage}</span>
            </div>
            <div className='flex justify-between ml-4'>
                <span className='text-[13px] w-[60%] text-gray-600'>Date</span>
                <span className='text-[13px] w-[40%] text-left text-gray-900'>{agent.date}</span>
            </div>
            {showDivider && <hr className='my-3 border-gray-200' />}
        </div>
    )

    return (
        <Layout loading={false}>
            <div className='w-full'>
                <div className='bg-white min-h-screen w-[100vw] max-w-full'>
                    {/* Header with Breadcrumb */}
                    <div className='flex items-center justify-between p-3 border-b border-gray-300'>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <button onClick={onClose} className='font-medium hover:text-gray-800'>
                                <span>Sales Dashboard</span>
                            </button>
                            <span>/</span>
                            <span className='text-gray-900 font-medium'>{leadName}</span>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className='flex flex-1 overflow-hidden'>
                        {/* Main Content - Left Side */}
                        <div className='w-[70%]'>
                            {/* Tabs Navigation */}
                            <div className='bg-white border-b border-gray-200 flex-shrink-0'>
                                <div className='px-6'>
                                    <div className='flex items-center justify-between'>
                                        <nav className='flex space-x-11'>
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                        activeTab === tab
                                                            ? 'border-blue-500 text-blue-600'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </nav>

                                        <button
                                            onClick={handleCreateTaskClick}
                                            className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors'
                                        >
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

                            {/* Tab Content */}
                            <div className='flex-1 h-full overflow-y-auto'>{renderTabContent()}</div>
                        </div>

                        {/* Right Sidebar */}
                        <div
                            className='w-[30%] bg-white border-l border-gray-200 flex flex-col'
                            style={{ height: 'calc(100vh - 44.6px)' }}
                        >
                            <div className='flex-1 p-4 space-y-6 flex flex-col overflow-hidden'>
                                {/* Customer Details Section */}
                                <div className='flex-shrink-0'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <h3 className='font-medium text-sm text-gray-900'>Customer Details</h3>
                                        <button className='bg-gray-200 h-8 w-26 text-gray-700 p-2 rounded text-xs font-medium hover:bg-gray-300 transition-colors'>
                                            Add Details
                                        </button>
                                    </div>

                                    <div className='space-y-3'>
                                        <div className='flex justify-between'>
                                            <span className='text-[13px] w-[60%] font-normal text-gray-600'>Name</span>
                                            <span className='text-[13px] w-[40%] text-left font-normal text-gray-900'>
                                                {leadName}
                                            </span>
                                        </div>

                                        <div className='flex justify-between'>
                                            <span className='text-[13px] w-[60%] text-gray-600'>Phone no.</span>
                                            <span className='text-[13px] w-[40%] text-left text-gray-900'>
                                                +91 9890673423
                                            </span>
                                        </div>

                                        <div className='mt-3'>
                                            <button className='w-full h-7.5 text-sm border border-gray-200 rounded-md pb-1 bg-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors'>
                                                Details From Sign 3
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Enquiry Details Section */}
                                <div className='flex-shrink-0'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <h3 className='font-medium text-sm text-gray-900'>Enquiry Details</h3>
                                        <button className='bg-gray-200 h-8 w-26 text-gray-700 p-2 rounded text-xs font-medium hover:bg-gray-300 transition-colors'>
                                            Add Enquiry
                                        </button>
                                    </div>

                                    <div className='space-y-3'>
                                        <div className='flex gap-8 mb-3.5 border-b border-gray-200'>
                                            <button
                                                className={`py-1 px-1 text-xs font-medium border-b-2 transition-colors duration-150 ${
                                                    selectedEnquiry === '1'
                                                        ? 'border-blue-500 text-blue-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                            >
                                                Enquiry 1
                                            </button>
                                        </div>

                                        <div className='space-y-3'>
                                            <div className='flex justify-between'>
                                                <span className='text-[13px] w-[60%] text-gray-600'>Property Name</span>
                                                <span className='text-[13px] w-[40%] text-gray-900'>
                                                    {currentEnquiry.propertyName}
                                                </span>
                                            </div>

                                            <div className='flex justify-between'>
                                                <span className='text-[13px] w-[60%] text-gray-600'>Enquiry Date</span>
                                                <span className='text-[13px] w-[40%] text-gray-900'>
                                                    {currentEnquiry.enquiryDate}
                                                </span>
                                            </div>

                                            <div className='flex justify-between'>
                                                <span className='text-[13px] w-[60%] text-gray-600'>Stage</span>
                                                <span className='text-[13px] w-[40%] text-gray-900'>
                                                    {currentEnquiry.stage}
                                                </span>
                                            </div>

                                            <div className='flex justify-between'>
                                                <span className='text-[13px] w-[60%] text-gray-600'>Status</span>
                                                <span className='text-[13px] w-[40%] text-gray-900'>
                                                    {currentEnquiry.status}
                                                </span>
                                            </div>

                                            <div className='flex justify-between items-center'>
                                                <span className='text-sm w-[60%] text-gray-600'>Source</span>
                                                <div className='w-[40%] flex items-center gap-2 text-left'>
                                                    {currentEnquiry.source === 'Google' ? (
                                                        <img src={google} alt='Google' className='w-4 h-4' />
                                                    ) : (
                                                        <div className='w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center'>
                                                            <span className='text-white text-xs font-bold'>W</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className='flex justify-between items-center'>
                                                <span className='text-sm w-[60%] text-gray-600'>Tag</span>
                                                <div className='w-[40%] text-left'>
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
                                </div>

                                {/* Agent Details Section */}
                                <div className='flex-1 flex flex-col min-h-0'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <h3 className='font-medium text-sm text-gray-900'>Agent Details</h3>
                                        <button className='bg-gray-200 h-8 w-26 text-gray-700 p-2 rounded text-xs font-medium hover:bg-gray-300 transition-colors'>
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
                                            <AgentItem
                                                key={index}
                                                agent={agent}
                                                showDivider={index < agents.length - 1}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Close Lead Button */}
                            <div className='p-4 border-t border-gray-200 flex-shrink-0'>
                                <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors'>
                                    Close lead
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal isOpen={isCreateTaskModalOpen} onClose={handleCloseCreateTaskModal} />
        </Layout>
    )
}

export default LeadDetails
