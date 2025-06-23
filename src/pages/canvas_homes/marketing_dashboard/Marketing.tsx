import React from 'react'
import { useState, useEffect } from 'react'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import google from '/icons/canvas_homes/google.svg'
import linkedin from '/icons/canvas_homes/linkedin.svg'
import meta from '/icons/canvas_homes/meta.svg'
import { useNavigate } from 'react-router-dom'

// Campaign data type
type Campaign = {
    id: string
    property: string
    campaignName: string
    campaignId: string
    source: string
    medium: string
    startDate: string
    endDate: string
    noOfDays: number
    totalCost: number
    totalLeads: number
    cpl: number
}

// Summary card data type
type SummaryCard = {
    title: string
    icon?: string
    totalCampaigns: number
    totalCost: string
    totalLeads: number
    costPerLead: string
    color?: string
}

// Dummy campaign data
const generateCampaignData = (): Campaign[] => {
    return [
        {
            id: '1',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '2',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '1',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '2',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '1',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '2',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '1',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '2',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },

        {
            id: '1',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '2',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '1',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '2',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '1',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '2',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '1',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '2',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '1',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '2',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '1',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '2',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '1',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '2',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '1',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
        {
            id: '2',
            property: 'Sattva Hamlet',
            campaignName: 'Sattva Hamlet NRT',
            campaignId: 'ID: C1006',
            source: 'Google',
            medium: 'Search',
            startDate: 'May 25, 2023',
            endDate: 'May 28, 2023',
            noOfDays: 4,
            totalCost: 40000,
            totalLeads: 35,
            cpl: 1142,
        },
    ]
}

// Summary Card Component
const SummaryCard = ({
    card,
    isSelected,
    onClick,
}: {
    card: SummaryCard
    isSelected: boolean
    onClick: () => void
}) => {
    const getIcon = () => {
        switch (card.title) {
            case 'Google':
                return <img src={google} alt='Google' className='w-4 h-4 object-contain' />
            case 'LinkedIn':
                return <img src={linkedin} alt='LinkedIn' className='w-4 h-4 object-contain' />
            case 'Meta':
                return <img src={meta} alt='Meta' className='w-4 h-4 object-contain' />
            default:
                return null
        }
    }

    return (
        <div
            className={`w-54 h-34 rounded-[12px] border p-[11px] cursor-pointer transition-colors duration-200 ${
                isSelected ? 'bg-[#E2F4FF] border-[#3279EA]' : '  border border-gray-200 bg-white hover:bg-gray-50'
            }`}
            onClick={onClick}
        >
            <div className='flex items-center justify-between mb-1'>
                <div className='flex items-center gap-2'>
                    {getIcon()}
                    <p className='font-semibold text-[13px] text-gray-900'>{card.title}</p>
                </div>
            </div>

            <div className='inline-grid grid-cols-2 gap-x-6 gap-y-2.5'>
                <div className='w-fit'>
                    <p className='text-[13px] text-gray-500 whitespace-nowrap'>Total Campaigns</p>
                    <p className='text-[13px] font-semibold text-gray-900'>{card.totalCampaigns}</p>
                </div>

                <div className='w-fit'>
                    <p className='text-[13px] text-gray-500 whitespace-nowrap'>Total Cost</p>
                    <p className='text-[13px] font-semibold text-gray-900'>{card.totalCost}</p>
                </div>

                <div className='w-fit'>
                    <p className='text-[13px] text-gray-500 whitespace-nowrap'>Total Leads</p>
                    <p className='text-[13px] font-semibold text-gray-900'>{card.totalLeads}</p>
                </div>

                <div className='w-fit'>
                    <p className='text-[13px] text-gray-500 whitespace-nowrap'>Cost per Lead</p>
                    <p className='text-[13px] font-semibold text-gray-900'>{card.costPerLead}</p>
                </div>
            </div>
        </div>
    )
}

const MarketingDashboard = () => {
    const [searchValue, setSearchValue] = useState('')
    const [selectedDateRange, setSelectedDateRange] = useState('')
    const [selectedSummaryCard, setselectedSummaryCard] = useState('all')
    const [selectedProperty, setSelectedProperty] = useState('')
    const [selectedMedium, setSelectedMedium] = useState('')
    const [selectedCampaignStatus, setSelectedCampaignStatus] = useState('')
    const [campaignData] = useState<Campaign[]>(() => generateCampaignData())
    const navigate = useNavigate()

    const handleRowClick = () => {
        navigate('/canvas-homes/marketingdetails')
    }

    // Summary cards data
    const summaryCards: SummaryCard[] = [
        {
            title: 'All',
            totalCampaigns: 23,
            totalCost: '230K',
            totalLeads: 400,
            costPerLead: '1.8k',
        },
        {
            title: 'Google',
            totalCampaigns: 23,
            totalCost: '230K',
            totalLeads: 400,
            costPerLead: '1.8k',
        },
        {
            title: 'LinkedIn',
            totalCampaigns: 23,
            totalCost: '230K',
            totalLeads: 400,
            costPerLead: '1.8k',
        },
        {
            title: 'Meta',
            totalCampaigns: 23,
            totalCost: '230K',
            totalLeads: 400,
            costPerLead: '1.8k',
        },
    ]

    // Dropdown options
    const dateRangeOptions = [
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' },
        { label: 'Custom Range', value: 'custom' },
    ]

    const propertyOptions = [
        { label: 'All Properties', value: '' },
        { label: 'Sattva Hamlet', value: 'sattva_hamlet' },
        { label: 'Green Valley', value: 'green_valley' },
        { label: 'Urban Heights', value: 'urban_heights' },
    ]

    const mediumOptions = [
        { label: 'All Medium', value: '' },
        { label: 'Search', value: 'search' },
        { label: 'Display', value: 'display' },
        { label: 'Social', value: 'social' },
    ]

    const campaignStatusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
    ]

    // Table columns configuration
    const columns: TableColumn[] = [
        {
            key: 'property',
            header: 'Property',
            render: (value) => <span className='whitespace-nowrap text-sm text-left font-normal'>{value}</span>,
        },
        {
            key: 'campaignName',
            header: 'Campaign Name',
            render: (value, row) => (
                <div className='whitespace-nowrap'>
                    <div className='text-sm font-normal text-gray-900'>{value}</div>
                    <div className='text-xs text-gray-500' font-normal>
                        {row.campaignId}
                    </div>
                </div>
            ),
        },
        {
            key: 'source',
            header: 'Source',
            render: (value) => (
                <div className='flex items-center rounded-[20px] gap-[3px] h-8 w-18 px-1.5 whitespace-nowrap border border-gray-300 '>
                    {value === 'Google' && <img src={google} alt='Google' className='w-4 h-4 object-contain' />}
                    <span className='text-sm font-norma'>{value}</span>
                </div>
            ),
        },
        {
            key: 'medium',
            header: 'Medium',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        {
            key: 'startDate',
            header: 'Start Date',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600 font-normal'>{value}</span>,
        },
        {
            key: 'endDate',
            header: 'End Date',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600 font-normal'>{value}</span>,
        },
        {
            key: 'noOfDays',
            header: 'No of days',
            render: (value) => <span className='whitespace-nowrap text-sm text-center font-normal'>{value}</span>,
        },
        {
            key: 'totalCost',
            header: 'Total Cost',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value.toLocaleString()}</span>,
        },
        {
            key: 'totalLeads',
            header: 'Total Leads',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        {
            key: 'cpl',
            header: 'CPL',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value.toLocaleString()}</span>,
        },
    ]

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden '>
                <div className='py-2 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-6'>
                        <div className='flex items-center justify-between pb-4 border-b-1 border-gray-400 mb-[13px]'>
                            <h1 className='text-xl font-semibold text-black'>Marketing Dashboard</h1>
                            <div className='flex items-center'>
                                <svg
                                    className='w-5 h-5 text-gray-400'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className='flex items-center gap-4 mb-5.5'>
                            <div className='w-68'>
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
                                    placeholder='Search campaign'
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
                                triggerClassName='flex items-center justify-between px-2 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />

                            <Dropdown
                                options={propertyOptions}
                                onSelect={setSelectedProperty}
                                defaultValue={selectedProperty}
                                placeholder='Property'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-2 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm  text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />

                            <Dropdown
                                options={mediumOptions}
                                onSelect={setSelectedMedium}
                                defaultValue={selectedMedium}
                                placeholder='Medium'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-2 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 w-fit text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />

                            <Dropdown
                                options={campaignStatusOptions}
                                onSelect={setSelectedCampaignStatus}
                                defaultValue={selectedCampaignStatus}
                                placeholder='Campaign Status'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-2 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-fit bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />
                        </div>

                        {/* Summary Cards */}
                        <div className='flex flex-row gap-4.5 mb-5.25'>
                            {summaryCards.map((card, index) => (
                                <SummaryCard
                                    key={index}
                                    card={card}
                                    onClick={() => setselectedSummaryCard(card.title)}
                                    isSelected={selectedSummaryCard === card.title}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Campaign Table */}
                    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                        <div className='h-[58vh] overflow-y-auto'>
                            <FlexibleTable
                                data={campaignData}
                                columns={columns}
                                borders={{
                                    table: false,
                                    header: true,
                                    rows: true,
                                    cells: false,
                                    outer: true,
                                }}
                                showCheckboxes={true}
                                className='rounded-lg'
                                stickyHeader={true}
                                maxHeight='58vh'
                                onRowClick={handleRowClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default MarketingDashboard
