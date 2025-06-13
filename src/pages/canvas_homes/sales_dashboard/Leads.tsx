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
import AddLeadModal from '../../../components/canvas_homes/AddLeadModal'

// Lead data type
type SalesLead = {
    id: string
    name: string
    addedDate: string
    property: string
    source: string
    contact: string
    agent: string
    leadStage: string
    leadStatus: string
    tag: string
    scheduleTask: {
        type: string
        date: string
        time: string
        avatar: string
    }
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
            className={`px-2 py-2.5 rounded-[12px]  w-32 h-14 border transition-colors ${
                isActive ? 'bg-[#E2F4FF] border-[#3279EA]' : '  border border-gray-200 bg-white hover:bg-gray-50'
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

// Generate dummy leads data
const generateLeadsData = (): SalesLead[] => {
    return [
        {
            id: '1',
            name: 'Rasika Myana',
            addedDate: 'Added 23/05/25',
            property: 'Prestige Gardenia',
            source: 'Google',
            contact: '+91 7024396102',
            agent: 'Yashwant',
            leadStage: 'Initial Contacted',
            leadStatus: 'Interested',
            tag: 'Hot',
            scheduleTask: {
                type: 'Site Visit',
                date: 'May 23, 2025',
                time: '10:30 AM',
                avatar: 'E',
            },
        },
        {
            id: '2',
            name: 'Rasika Myana',
            addedDate: 'Added 23/05/25',
            property: 'Prestige Gardenia',
            source: 'Google',
            contact: '+91 7024396102',
            agent: 'Yashwant',
            leadStage: 'Initial Contacted',
            leadStatus: 'Follow Up RNR 1',
            tag: 'Hot',
            scheduleTask: {
                type: 'Call Scheduled',
                date: 'May 23, 2025',
                time: '10:30 AM',
                avatar: 'E',
            },
        },
        {
            id: '3',
            name: 'Rasika Myana',
            addedDate: 'Added 23/05/25',
            property: 'Prestige Gardenia',
            source: 'Google',
            contact: '+91 7024396102',
            agent: 'Yashwant',
            leadStage: 'Site Visited',
            leadStatus: 'Interested',
            tag: 'Hot',
            scheduleTask: {
                type: 'Collect EOI',
                date: 'May 23, 2025',
                time: '10:30 AM',
                avatar: 'E',
            },
        },
        {
            id: '4',
            name: 'Rasika Myana',
            addedDate: 'Added 23/05/25',
            property: 'Prestige Gardenia',
            source: 'Google',
            contact: '+91 7024396102',
            agent: 'Yashwant',
            leadStage: 'EOI Collected',
            leadStatus: 'Interested',
            tag: 'Hot',
            scheduleTask: {
                type: 'Booking',
                date: 'May 23, 2025',
                time: '10:30 AM',
                avatar: 'E',
            },
        },
        {
            id: '5',
            name: 'Rasika Myana',
            addedDate: 'Added 23/05/25',
            property: 'Prestige Gardenia',
            source: 'Google',
            contact: '+91 7024396102',
            agent: 'Yashwant',
            leadStage: 'Lead Registered',
            leadStatus: 'Not Connected RNR 2',
            tag: 'Hot',
            scheduleTask: {
                type: 'Call Scheduled',
                date: 'May 23, 2025',
                time: '10:30 AM',
                avatar: 'E',
            },
        },
        {
            id: '5',
            name: 'Rasika Myana',
            addedDate: 'Added 23/05/25',
            property: 'Prestige Gardenia',
            source: 'Google',
            contact: '+91 7024396102',
            agent: 'Yashwant',
            leadStage: 'Lead Registered',
            leadStatus: 'Not Connected RNR 2',
            tag: 'Hot',
            scheduleTask: {
                type: 'Call Scheduled',
                date: 'May 23, 2025',
                time: '10:30 AM',
                avatar: 'E',
            },
        },

        {
            id: '5',
            name: 'Rasika Myana',
            addedDate: 'Added 23/05/25',
            property: 'Prestige Gardenia',
            source: 'Google',
            contact: '+91 7024396102',
            agent: 'Yashwant',
            leadStage: 'Lead Registered',
            leadStatus: 'Not Connected RNR 2',
            tag: 'Hot',
            scheduleTask: {
                type: 'Call Scheduled',
                date: 'May 23, 2025',
                time: '10:30 AM',
                avatar: 'E',
            },
        },
    ]
}

const Leads = () => {
    const [activeStatusCard, setActiveStatusCard] = useState('All')
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [searchValue, setSearchValue] = useState('')
    const [selectedDateRange, setSelectedDateRange] = useState('')
    const [selectedProperty, setSelectedProperty] = useState('')
    const [selectedAgent, setSelectedAgent] = useState('')
    const [selectedSource, setSelectedSource] = useState('')
    const [selectedLeadStage, setSelectedLeadStage] = useState('')
    const [selectedTag, setSelectedTag] = useState('')
    const [selectedTask, setSelectedTask] = useState('')
    const [selectedLeadStatus, setSelectedLeadStatus] = useState('')
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false)

    const leadsData = generateLeadsData()

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
        { title: 'All', count: 20 },
        { title: 'Fresh', count: 20 },
        { title: 'Open', count: 80 },
        { title: 'Closed', count: 50 },
        { title: 'Dropped', count: 120 },
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
    ]

    const agentOptions = [
        { label: 'Agent', value: '' },
        { label: 'Yashwant', value: 'yashwant' },
        { label: 'Priya', value: 'priya' },
        { label: 'Raj', value: 'raj' },
    ]

    const sourceOptions = [
        { label: 'Source', value: '' },
        { label: 'Google', value: 'google' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'WhatsApp', value: 'whatsapp' },
    ]

    const leadStageOptions = [
        { label: 'Lead Stage', value: '' },
        { label: 'Initial Contacted', value: 'initial_contacted' },
        { label: 'Site Visited', value: 'site_visited' },
        { label: 'EOI Collected', value: 'eoi_collected' },
    ]

    const tagOptions = [
        { label: 'Tag', value: '' },
        { label: 'Hot', value: 'hot' },
        { label: 'Warm', value: 'warm' },
        { label: 'Cold', value: 'cold' },
    ]

    const taskOptions = [
        { label: 'Task', value: '' },
        { label: 'Site Visit', value: 'site_visit' },
        { label: 'Call Scheduled', value: 'call_scheduled' },
        { label: 'Booking', value: 'booking' },
    ]

    const leadStatusOptions = [
        { label: 'Lead Status', value: '' },
        { label: 'Interested', value: 'interested' },
        { label: 'Not Connected', value: 'not_connected' },
        { label: 'Follow Up', value: 'follow_up' },
    ]

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
            key: 'source',
            header: 'Source',
            render: (value) => (
                <div className='w-full h-full flex items-center justify-center'>
                    {value === 'Google' && <img src={google} alt='Google' className='w-4 h-4 object-contain' />}
                </div>
            ),
        },
        {
            key: 'contact',
            header: 'Contact',
            render: (value) => <span className='text-sm font-normal'>{value}</span>,
        },
        {
            key: 'agent',
            header: 'Agent',
            render: (value) => <span className='text-sm font-normal'>{value}</span>,
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
                <div className='inline-flex items-center w-17 h-6  gap-2 px-2 py-1 rounded-[4px] text-xs font-medium bg-[#FFEDD5] text-[#9A3412]'>
                    <img src={hot} alt='Google' className='w-3 h-3 object-contain' />
                    <span className='text-sm font-norma'>{value}</span>
                </div>
            ),
        },
        {
            key: 'ASLC',
            header: 'ASLC',
            render: (value) => (
                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
                    {value}
                </span>
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
    ]

    return (
        <div className='w-full'>
            {/* Search and Filters */}
            <div className='flex items-center gap-3 mb-5'>
                <div className='w-64'>
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
                                    stroke-width='1.5'
                                    stroke-linecap='round'
                                    stroke-linejoin='round'
                                />
                                <path
                                    d='M14.6667 14.6666L13.3333 13.3333'
                                    stroke='#3A3A47'
                                    stroke-width='1.5'
                                    stroke-linecap='round'
                                    stroke-linejoin='round'
                                />
                            </svg>
                        }
                        placeholder='Search name and number'
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className='h-7'
                    />
                </div>

                <Dropdown
                    options={dateRangeOptions}
                    onSelect={setSelectedDateRange}
                    defaultValue={selectedDateRange}
                    placeholder='Date Range'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between px-3 py-1 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={propertyOptions}
                    onSelect={setSelectedProperty}
                    defaultValue={selectedProperty}
                    placeholder='Property'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between px-3 py-1 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
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

                <Dropdown
                    options={sourceOptions}
                    onSelect={setSelectedSource}
                    defaultValue={selectedSource}
                    placeholder='Source'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between px-3 py-1 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={leadStageOptions}
                    onSelect={setSelectedLeadStage}
                    defaultValue={selectedLeadStage}
                    placeholder='Lead Stage'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between px-3 py-1 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={tagOptions}
                    onSelect={setSelectedTag}
                    defaultValue={selectedTag}
                    placeholder='Tag'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between px-3 py-1 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={taskOptions}
                    onSelect={setSelectedTask}
                    defaultValue={selectedTask}
                    placeholder='Task'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between px-3 py-1 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={leadStatusOptions}
                    onSelect={setSelectedLeadStatus}
                    defaultValue={selectedLeadStatus}
                    placeholder='Lead Status'
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
                <Button
                    bgColor='bg-blue-600'
                    textColor='text-white'
                    className='p-2 w-fit h-8 font-[10px] hover:bg-blue-700'
                    onClick={() => setIsAddLeadModalOpen(true)}
                >
                    <span>+ Add Lead</span>
                </Button>
            </div>

            {/* Table */}
            <div className='bg-white rounded-lg shadow-sm overflow-hidden h-[58vh]'>
                <FlexibleTable
                    data={leadsData}
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
                    maxHeight='58vh'
                />
            </div>
            <AddLeadModal isOpen={isAddLeadModalOpen} onClose={() => setIsAddLeadModalOpen(false)} />
        </div>
    )
}

export default Leads
