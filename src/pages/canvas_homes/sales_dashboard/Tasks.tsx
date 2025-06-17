import React from 'react'
import { useState } from 'react'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import google from '/icons/canvas_homes/google.svg'
import hot from '/icons/canvas_homes/hoticon.svg'
import linkedin from '/icons/canvas_homes/linkedin.svg'
import meta from '/icons/canvas_homes/meta.svg'

// Task data type
type SalesTask = {
    id: string
    name: string
    addedDate: string
    property: string
    leadStage: string
    leadStatus: string
    tag: string
    scheduleTask: {
        type: string
        date: string
        time: string
        avatar: string
    }
    dueDays: number
    taskStatus: 'Complete' | 'Open' | 'Overdue' | 'Upcoming'
    completionDate: string
}

// Status card component
const StatusCard = ({
    title,
    count,
    isActive,
    onClick,
}: {
    title: string
    count: number
    isActive: boolean
    onClick: () => void
}) => {
    return (
        <button
            onClick={onClick}
            className={`px-2 py-2.5 rounded-[12px] w-32 h-14 border transition-colors ${
                isActive ? 'bg-[#E2F4FF] border-[#3279EA]' : 'border border-gray-200 bg-white hover:bg-gray-50'
            }`}
        >
            <div className='flex w-full items-center gap-2'>
                <span className='text-sm font-normal w-17.5 text-gray-700'>{title}</span>
                <span className={`text-lg font-semibold font-normal ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {count}
                </span>
            </div>
        </button>
    )
}

// Generate dummy tasks data
const generateTasksData = (): SalesTask[] => {
    return [
        {
            id: '1',
            name: 'Rasika Myana',
            addedDate: 'Added 23/05/25',
            property: 'Prestige Gardenia',
            leadStage: 'Initial Contacted',
            leadStatus: 'Interested',
            tag: 'Hot',
            scheduleTask: {
                type: 'Site Visit',
                date: 'May 23, 2025',
                time: '10:30 AM',
                avatar: 'E',
            },
            dueDays: 3,
            taskStatus: 'Complete',
            completionDate: 'May 23, 2025 | 11:30',
        },
        {
            id: '2',
            name: 'Rasika Myana',
            addedDate: 'Added 23/05/25',
            property: 'Prestige Gardenia',
            leadStage: 'Initial Contacted',
            leadStatus: 'Interested',
            tag: 'Hot',
            scheduleTask: {
                type: 'Site Visit',
                date: 'May 23, 2025',
                time: '10:30 AM',
                avatar: 'E',
            },
            dueDays: 3,
            taskStatus: 'Open',
            completionDate: 'May 23, 2025 | 11:30',
        },
        {
            id: '3',
            name: 'John Smith',
            addedDate: 'Added 22/05/25',
            property: 'Sattva Hamlet',
            leadStage: 'Site Visited',
            leadStatus: 'Follow Up RNR 1',
            tag: 'Warm',
            scheduleTask: {
                type: 'Call Scheduled',
                date: 'May 24, 2025',
                time: '2:00 PM',
                avatar: 'J',
            },
            dueDays: 1,
            taskStatus: 'Upcoming',
            completionDate: '-',
        },
        {
            id: '4',
            name: 'Sarah Wilson',
            addedDate: 'Added 21/05/25',
            property: 'Prestige Gardenia',
            leadStage: 'EOI Collected',
            leadStatus: 'Interested',
            tag: 'Hot',
            scheduleTask: {
                type: 'Collect EOI',
                date: 'May 20, 2025',
                time: '11:00 AM',
                avatar: 'S',
            },
            dueDays: -3,
            taskStatus: 'Overdue',
            completionDate: '-',
        },
        {
            id: '5',
            name: 'Mike Johnson',
            addedDate: 'Added 20/05/25',
            property: 'Riverside Towers',
            leadStage: 'Lead Registered',
            leadStatus: 'Not Connected RNR 2',
            tag: 'Cold',
            scheduleTask: {
                type: 'Booking',
                date: 'May 25, 2025',
                time: '3:30 PM',
                avatar: 'M',
            },
            dueDays: 2,
            taskStatus: 'Upcoming',
            completionDate: '-',
        },
        {
            id: '6',
            name: 'Emma Davis',
            addedDate: 'Added 19/05/25',
            property: 'Garden Heights',
            leadStage: 'Initial Contacted',
            leadStatus: 'Interested',
            tag: 'Warm',
            scheduleTask: {
                type: 'Call Scheduled',
                date: 'May 23, 2025',
                time: '4:00 PM',
                avatar: 'E',
            },
            dueDays: 0,
            taskStatus: 'Complete',
            completionDate: 'May 23, 2025 | 16:15',
        },
    ]
}

const Tasks = () => {
    const [activeStatusCard, setActiveStatusCard] = useState('All')
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [searchValue, setSearchValue] = useState('')
    const [selectedDateRange, setSelectedDateRange] = useState('')
    const [selectedProperty, setSelectedProperty] = useState('')
    const [selectedLeadStage, setSelectedLeadStage] = useState('')
    const [selectedTask, setSelectedTask] = useState('')
    const [selectedTag, setSelectedTag] = useState('')
    const [selectedLeadStatus, setSelectedLeadStatus] = useState('')
    const [selectedAgent, setSelectedAgent] = useState('')

    const tasksData = generateTasksData()

    const handleRowSelect = (rowId: string, selected: boolean) => {
        if (selected) {
            setSelectedRows([...selectedRows, rowId])
        } else {
            setSelectedRows(selectedRows.filter((id) => id !== rowId))
        }
    }

    const handleRowClick = (row: any) => {
        console.log('Row clicked:', row)
    }

    // Status cards data
    const statusCards = [
        { title: 'All', count: 80 },
        { title: 'Upcoming', count: 20 },
        { title: 'Missed', count: 50 },
    ]

    // Dropdown options
    const dateRangeOptions = [
        { label: 'Date Range', value: '' },
        { label: 'Today', value: 'today' },
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
    ]

    const propertyOptions = [
        { label: 'Property', value: '' },
        { label: 'Prestige Gardenia', value: 'prestige_gardenia' },
        { label: 'Sattva Hamlet', value: 'sattva_hamlet' },
        { label: 'Riverside Towers', value: 'riverside_towers' },
        { label: 'Garden Heights', value: 'garden_heights' },
    ]

    const leadStageOptions = [
        { label: 'Lead Stage', value: '' },
        { label: 'Initial Contacted', value: 'initial_contacted' },
        { label: 'Site Visited', value: 'site_visited' },
        { label: 'EOI Collected', value: 'eoi_collected' },
        { label: 'Lead Registered', value: 'lead_registered' },
    ]

    const taskOptions = [
        { label: 'Task', value: '' },
        { label: 'Site Visit', value: 'site_visit' },
        { label: 'Call Scheduled', value: 'call_scheduled' },
        { label: 'Booking', value: 'booking' },
        { label: 'Collect EOI', value: 'collect_eoi' },
    ]

    const tagOptions = [
        { label: 'Tag', value: '' },
        { label: 'Hot', value: 'hot' },
        { label: 'Warm', value: 'warm' },
        { label: 'Cold', value: 'cold' },
    ]

    const leadStatusOptions = [
        { label: 'Lead Status', value: '' },
        { label: 'Interested', value: 'interested' },
        { label: 'Not Connected', value: 'not_connected' },
        { label: 'Follow Up', value: 'follow_up' },
    ]

    const agentOptions = [
        { label: 'Agent', value: '' },
        { label: 'Yashwant', value: 'yashwant' },
        { label: 'Priya', value: 'priya' },
        { label: 'Raj', value: 'raj' },
    ]

    // Helper function to get task status badge color
    const getTaskStatusColor = (status: string) => {
        switch (status) {
            case 'Complete':
                return 'bg-[#E1F6DF]'
            case 'Open':
                return 'bg-[#DADAE2]'
            default:
                return 'bg-gray-100'
        }
    }

    // Helper function to get tag color
    const getTagColor = (tag: string) => {
        switch (tag) {
            case 'Hot':
                return 'bg-[#FFEDD5] text-[#9A3412]'
            case 'Warm':
                return 'bg-orange-100 text-orange-800'
            case 'Cold':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // Table columns
    const columns: TableColumn[] = [
        {
            key: 'name',
            header: 'Name',
            render: (value, row) => (
                <div className='whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>{value}</div>
                    <div className='text-xs text-gray-500 font-normal'>{row.addedDate}</div>
                </div>
            ),
        },
        {
            key: 'property',
            header: 'Property',
            render: (value) => <span className='text-sm font-normal text-gray-900'>{value}</span>,
        },
        {
            key: 'leadStage',
            header: 'Lead Stage',
            render: (value) => <span className='text-sm text-gray-900'>{value}</span>,
        },
        {
            key: 'leadStatus',
            header: 'Lead Status',
            render: (value) => <span className='text-sm text-gray-900'>{value}</span>,
        },
        {
            key: 'tag',
            header: 'Tag',
            render: (value) => (
                <div
                    className={`inline-flex items-center w-17 h-6 gap-2 px-2 py-1 rounded-[4px] text-xs font-medium ${getTagColor(value)}`}
                >
                    <img src={hot} alt='Tag' className='w-3 h-3 object-contain' />
                    <span className='text-sm font-normal'>{value}</span>
                </div>
            ),
        },
        {
            key: 'scheduleTask',
            header: 'Schedule Task',
            render: (value, row) => (
                <div className='flex items-center gap-3'>
                    <div>
                        <div className='text-sm font-medium text-gray-900'>{value.type}</div>
                        <div className='text-xs text-gray-500'>
                            {value.date} | {value.time}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'dueDays',
            header: 'Due Days',
            render: (value) => (
                <span
                    className={`text-sm font-medium ${value < 0 ? 'text-red-600' : value === 0 ? 'text-yellow-600' : 'text-gray-900'}`}
                >
                    {value < 0 ? `${Math.abs(value)} overdue` : value === 0 ? 'Today' : `${value} days`}
                </span>
            ),
        },
        {
            key: 'taskStatus',
            header: 'Task Status',
            render: (value) => (
                <div className={`p-2 rounded-sm h-7 w-22.5 text-xs font-medium ${getTaskStatusColor(value)}`}>
                    {value}
                </div>
            ),
        },
        {
            key: 'completionDate',
            header: 'Completion Date',
            render: (value) => <span className='text-sm text-gray-900'>{value === '-' ? '-' : value}</span>,
        },
    ]

    return (
        <div className='w-full p-3 pb-0'>
            {/* Search and Filters */}
            <div className='flex items-center gap-3 mb-5'>
                <StateBaseTextField
                    leftIcon={
                        <svg
                            className='w-4 h-4 text-gray-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 16 16'
                            width='16'
                            height='16'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <path
                                d='M7.66668 13.9999C11.1645 13.9999 14 11.1644 14 7.66659C14 4.16878 11.1645 1.33325 7.66668 1.33325C4.16887 1.33325 1.33334 4.16878 1.33334 7.66659C1.33334 11.1644 4.16887 13.9999 7.66668 13.9999Z'
                                stroke='#3A3A47'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                            <path
                                d='M14.6667 14.6666L13.3333 13.3333'
                                stroke='#3A3A47'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                        </svg>
                    }
                    placeholder='Search name and number'
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className='h-7 w-68'
                />

                <Dropdown
                    options={dateRangeOptions}
                    onSelect={setSelectedDateRange}
                    defaultValue={selectedDateRange}
                    placeholder='Date Range'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={propertyOptions}
                    onSelect={setSelectedProperty}
                    defaultValue={selectedProperty}
                    placeholder='Property'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={leadStageOptions}
                    onSelect={setSelectedLeadStage}
                    defaultValue={selectedLeadStage}
                    placeholder='Lead Stage'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={taskOptions}
                    onSelect={setSelectedTask}
                    defaultValue={selectedTask}
                    placeholder='Task'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={tagOptions}
                    onSelect={setSelectedTag}
                    defaultValue={selectedTag}
                    placeholder='Tag'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={leadStatusOptions}
                    onSelect={setSelectedLeadStatus}
                    defaultValue={selectedLeadStatus}
                    placeholder='Lead Status'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={agentOptions}
                    onSelect={setSelectedAgent}
                    defaultValue={selectedAgent}
                    placeholder='Agent'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between px-3 py-1 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />
            </div>

            {/* Status Cards */}
            <div className='flex items-center justify-between mb-7'>
                <div className='flex gap-2'>
                    {statusCards.map((card) => (
                        <StatusCard
                            key={card.title}
                            title={card.title}
                            count={card.count}
                            isActive={activeStatusCard === card.title}
                            onClick={() => setActiveStatusCard(card.title)}
                        />
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className='bg-white rounded-lg shadow-sm overflow-hidden h-[63vh]'>
                <FlexibleTable
                    data={tasksData}
                    columns={columns}
                    borders={{ table: false, header: true, rows: true, cells: false, outer: true }}
                    showCheckboxes={true}
                    selectedRows={selectedRows}
                    headerClassName='font-normal'
                    onRowSelect={handleRowSelect}
                    onRowClick={handleRowClick}
                    className='rounded-lg'
                    stickyHeader={true}
                    hoverable={true}
                    maxHeight='63vh'
                />
            </div>
        </div>
    )
}

export default Tasks
