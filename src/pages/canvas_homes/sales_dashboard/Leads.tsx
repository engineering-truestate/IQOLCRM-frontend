import React from 'react'
import { useState, useMemo } from 'react'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import searchIcon from '/icons/canvas_homes/searchIcon.svg'
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
    status: 'Fresh' | 'Open' | 'Closed' | 'Dropped'
    aslc: number
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
const generateLeadsData = (): SalesLead[] => {
    return [
        {
            id: '1',
            name: 'Rasika Myana',
            addedDate: 'Added 23/05/25',
            property: 'Prestige Gardenia',
            source: 'Google',
            contact: '+91 9890673423',
            agent: 'Yashwant',
            leadStage: 'Initial Contacted',
            leadStatus: 'Interested',
            tag: 'Hot',
            status: 'Fresh',
            aslc: 2,
            scheduleTask: {
                type: 'Site Visit',
                date: 'May 23, 2025',
                time: '10:30 AM',
                avatar: 'E',
            },
        },
        {
            id: '2',
            name: 'Priya Sharma',
            addedDate: 'Added 22/05/25',
            property: 'Brigade Cosmopolis',
            source: 'LinkedIn',
            contact: '+91 9876543210',
            agent: 'Priya',
            leadStage: 'Site Visited',
            leadStatus: 'Follow Up RNR 1',
            tag: 'Warm',
            status: 'Open',
            aslc: 5,
            scheduleTask: {
                type: 'Call Scheduled',
                date: 'May 24, 2025',
                time: '2:00 PM',
                avatar: 'E',
            },
        },
        {
            id: '3',
            name: 'Amit Kumar',
            addedDate: 'Added 21/05/25',
            property: 'Sobha City',
            source: 'Meta',
            contact: '+91 9123456789',
            agent: 'Raj',
            leadStage: 'EOI Collected',
            leadStatus: 'Interested',
            tag: 'Hot',
            status: 'Open',
            aslc: 1,
            scheduleTask: {
                type: 'Booking',
                date: 'May 25, 2025',
                time: '11:00 AM',
                avatar: 'E',
            },
        },
        {
            id: '4',
            name: 'Sneha Patel',
            addedDate: 'Added 20/05/25',
            property: 'Embassy Springs',
            source: 'Google',
            contact: '+91 9988776655',
            agent: 'Suman',
            leadStage: 'Lead Registered',
            leadStatus: 'Not Connected RNR 1',
            tag: 'Cold',
            status: 'Fresh',
            aslc: 7,
            scheduleTask: {
                type: 'Call Scheduled',
                date: 'May 26, 2025',
                time: '9:30 AM',
                avatar: 'E',
            },
        },
        {
            id: '5',
            name: 'Rajesh Singh',
            addedDate: 'Added 19/05/25',
            property: 'Mantri Energia',
            source: 'LinkedIn',
            contact: '+91 9876543211',
            agent: 'Kiran',
            leadStage: 'Booking Completed',
            leadStatus: 'Interested',
            tag: 'Hot',
            status: 'Closed',
            aslc: 0,
            scheduleTask: {
                type: 'Follow Up Call',
                date: 'May 27, 2025',
                time: '3:15 PM',
                avatar: 'E',
            },
        },
        {
            id: '6',
            name: 'Anita Desai',
            addedDate: 'Added 18/05/25',
            property: 'Prestige Gardenia',
            source: 'Meta',
            contact: '+91 9345678901',
            agent: 'Yashwant',
            leadStage: 'Site Visited',
            leadStatus: 'Callback Requested',
            tag: 'Warm',
            status: 'Open',
            aslc: 3,
            scheduleTask: {
                type: 'Collect EOI',
                date: 'May 28, 2025',
                time: '1:45 PM',
                avatar: 'E',
            },
        },
        {
            id: '7',
            name: 'Vikram Mehta',
            addedDate: 'Added 17/05/25',
            property: 'Brigade Cosmopolis',
            source: 'Google',
            contact: '+91 9567890123',
            agent: 'Priya',
            leadStage: 'Initial Contacted',
            leadStatus: 'Not Connected RNR 2',
            tag: 'Cold',
            status: 'Dropped',
            aslc: 15,
            scheduleTask: {
                type: 'Site Visit',
                date: 'May 29, 2025',
                time: '4:00 PM',
                avatar: 'E',
            },
        },
        {
            id: '8',
            name: 'Kavya Reddy',
            addedDate: 'Added 16/05/25',
            property: 'Sobha City',
            source: 'LinkedIn',
            contact: '+91 9789012345',
            agent: 'Raj',
            leadStage: 'EOI Collected',
            leadStatus: 'Interested',
            tag: 'Hot',
            status: 'Open',
            aslc: 4,
            scheduleTask: {
                type: 'Booking',
                date: 'May 30, 2025',
                time: '10:15 AM',
                avatar: 'E',
            },
        },
        {
            id: '9',
            name: 'Rohit Jain',
            addedDate: 'Added 15/05/25',
            property: 'Embassy Springs',
            source: 'Meta',
            contact: '+91 9012345678',
            agent: 'Suman',
            leadStage: 'Lead Registered',
            leadStatus: 'Follow Up RNR 1',
            tag: 'Warm',
            status: 'Fresh',
            aslc: 8,
            scheduleTask: {
                type: 'Call Scheduled',
                date: 'May 31, 2025',
                time: '12:30 PM',
                avatar: 'E',
            },
        },
        {
            id: '10',
            name: 'Deepika Nair',
            addedDate: 'Added 14/05/25',
            property: 'Mantri Energia',
            source: 'Google',
            contact: '+91 9234567890',
            agent: 'Kiran',
            leadStage: 'Site Visited',
            leadStatus: 'Interested',
            tag: 'Hot',
            status: 'Open',
            aslc: 6,
            scheduleTask: {
                type: 'Collect EOI',
                date: 'Jun 1, 2025',
                time: '2:45 PM',
                avatar: 'E',
            },
        },
        {
            id: '11',
            name: 'Arjun Gupta',
            addedDate: 'Added 13/05/25',
            property: 'Prestige Gardenia',
            source: 'LinkedIn',
            contact: '+91 9456789012',
            agent: 'Yashwant',
            leadStage: 'Booking Completed',
            leadStatus: 'Interested',
            tag: 'Hot',
            status: 'Closed',
            aslc: 1,
            scheduleTask: {
                type: 'Follow Up Call',
                date: 'Jun 2, 2025',
                time: '11:15 AM',
                avatar: 'E',
            },
        },
        {
            id: '12',
            name: 'Meera Kapoor',
            addedDate: 'Added 12/05/25',
            property: 'Brigade Cosmopolis',
            source: 'Meta',
            contact: '+91 9678901234',
            agent: 'Priya',
            leadStage: 'Initial Contacted',
            leadStatus: 'Callback Requested',
            tag: 'Warm',
            status: 'Fresh',
            aslc: 9,
            scheduleTask: {
                type: 'Site Visit',
                date: 'Jun 3, 2025',
                time: '9:00 AM',
                avatar: 'E',
            },
        },
        {
            id: '13',
            name: 'Suresh Iyer',
            addedDate: 'Added 11/05/25',
            property: 'Sobha City',
            source: 'Google',
            contact: '+91 9890123456',
            agent: 'Raj',
            leadStage: 'EOI Collected',
            leadStatus: 'Not Connected RNR 1',
            tag: 'Cold',
            status: 'Dropped',
            aslc: 12,
            scheduleTask: {
                type: 'Call Scheduled',
                date: 'Jun 4, 2025',
                time: '3:30 PM',
                avatar: 'E',
            },
        },
        {
            id: '14',
            name: 'Neha Agarwal',
            addedDate: 'Added 10/05/25',
            property: 'Embassy Springs',
            source: 'LinkedIn',
            contact: '+91 9012345679',
            agent: 'Suman',
            leadStage: 'Site Visited',
            leadStatus: 'Interested',
            tag: 'Hot',
            status: 'Open',
            aslc: 2,
            scheduleTask: {
                type: 'Booking',
                date: 'Jun 5, 2025',
                time: '1:00 PM',
                avatar: 'E',
            },
        },
        {
            id: '15',
            name: 'Karthik Raman',
            addedDate: 'Added 09/05/25',
            property: 'Mantri Energia',
            source: 'Meta',
            contact: '+91 9123456780',
            agent: 'Kiran',
            leadStage: 'Lead Registered',
            leadStatus: 'Follow Up RNR 1',
            tag: 'Warm',
            status: 'Fresh',
            aslc: 5,
            scheduleTask: {
                type: 'Call Scheduled',
                date: 'Jun 6, 2025',
                time: '4:15 PM',
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

    const allLeadsData = generateLeadsData()

    // Filter data based on active status card and other filters
    const filteredLeadsData = useMemo(() => {
        let filtered = allLeadsData

        // Filter by status card
        if (activeStatusCard !== 'All') {
            filtered = filtered.filter((lead) => lead.status === activeStatusCard)
        }

        // Apply search filter
        if (searchValue) {
            filtered = filtered.filter(
                (lead) =>
                    lead.name.toLowerCase().includes(searchValue.toLowerCase()) || lead.contact.includes(searchValue),
            )
        }

        // Apply dropdown filters
        if (selectedProperty) {
            filtered = filtered.filter((lead) => lead.property.toLowerCase().includes(selectedProperty))
        }
        if (selectedAgent) {
            filtered = filtered.filter((lead) => lead.agent.toLowerCase().includes(selectedAgent))
        }
        if (selectedSource) {
            filtered = filtered.filter((lead) => lead.source.toLowerCase().includes(selectedSource))
        }
        if (selectedLeadStage) {
            filtered = filtered.filter((lead) => lead.leadStage.toLowerCase().includes(selectedLeadStage))
        }
        if (selectedTag) {
            filtered = filtered.filter((lead) => lead.tag.toLowerCase().includes(selectedTag))
        }
        if (selectedTask) {
            filtered = filtered.filter((lead) => lead.scheduleTask.type.toLowerCase().includes(selectedTask))
        }
        if (selectedLeadStatus) {
            filtered = filtered.filter((lead) => lead.leadStatus.toLowerCase().includes(selectedLeadStatus))
        }

        return filtered
    }, [
        allLeadsData,
        activeStatusCard,
        searchValue,
        selectedProperty,
        selectedAgent,
        selectedSource,
        selectedLeadStage,
        selectedTag,
        selectedTask,
        selectedLeadStatus,
    ])

    // Calculate counts for status cards
    const statusCounts = useMemo(
        () => ({
            All: allLeadsData.length,
            Fresh: allLeadsData.filter((lead) => lead.status === 'Fresh').length,
            Open: allLeadsData.filter((lead) => lead.status === 'Open').length,
            Closed: allLeadsData.filter((lead) => lead.status === 'Closed').length,
            Dropped: allLeadsData.filter((lead) => lead.status === 'Dropped').length,
        }),
        [allLeadsData],
    )

    const handleRowSelect = (rowId: string, selected: boolean) => {
        if (selected) {
            setSelectedRows([...selectedRows, rowId])
        } else {
            setSelectedRows(selectedRows.filter((id) => id !== rowId))
        }
    }

    const handleRowClick = (row: any) => {
        console.log('Row clicked:', row)
        // Redirect to lead details page
        window.location.href = `/sales/leaddetails/${row.id}`
    }

    // Status cards data with dynamic counts
    const statusCards = [
        { title: 'All', count: statusCounts.All },
        { title: 'Fresh', count: statusCounts.Fresh },
        { title: 'Open', count: statusCounts.Open },
        { title: 'Closed', count: statusCounts.Closed },
        { title: 'Dropped', count: statusCounts.Dropped },
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
                    {value === 'LinkedIn' && <img src={linkedin} alt='LinkedIn' className='w-4 h-4 object-contain' />}
                    {value === 'Meta' && <img src={meta} alt='Meta' className='w-4 h-4 object-contain' />}
                    {!['Google', 'LinkedIn', 'Meta'].includes(value) && (
                        <span className='text-xs font-medium px-2 py-1 bg-gray-100 rounded'>{value}</span>
                    )}
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
                <div className='inline-flex items-center w-17 h-6 gap-2 px-2 py-1 rounded-[4px] text-xs font-medium bg-[#FFEDD5] text-[#9A3412]'>
                    <img src={hot} alt='Hot' className='w-3 h-3 object-contain' />
                    <span className='text-sm font-normal'>{value}</span>
                </div>
            ),
        },
        {
            key: 'aslc',
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
        <div className='p-3 pb-0 h-full'>
            {/* Search and Filters */}
            <div className='flex items-center gap-4 mb-5'>
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
                    options={agentOptions}
                    onSelect={setSelectedAgent}
                    defaultValue={selectedAgent}
                    placeholder='Agent'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={sourceOptions}
                    onSelect={setSelectedSource}
                    defaultValue={selectedSource}
                    placeholder='Source'
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
            <div className='bg-white rounded-lg shadow-sm overflow-hidden h-[63vh]'>
                <FlexibleTable
                    data={filteredLeadsData}
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
            <AddLeadModal isOpen={isAddLeadModalOpen} onClose={() => setIsAddLeadModalOpen(false)} />
        </div>
    )
}

export default Leads
