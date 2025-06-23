import React, { useState } from 'react'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import google from '/icons/canvas_homes/google.svg'
import linkedin from '/icons/canvas_homes/linkedin.svg'
import meta from '/icons/canvas_homes/meta.svg'

export type Campaign = {
    property: string
    totalCost: string
    totalLeads: number
    CPL: string
    Dropped: string
    Open: string
    EOI_Collected: string
    Estimated_ROI: string
    Closed: string
    Actual_ROI: string
}

type SummaryCard = {
    title: string
    icon?: string
    totalCampaigns: number
    totalCost: string
    totalLeads: number
    costPerLead: string
    color?: string
}

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
                isSelected ? 'bg-[#E2F4FF] border-[#3279EA]' : 'border border-gray-200 bg-white hover:bg-gray-50'
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

const tableData: Campaign[] = [
    {
        property: 'Prestige Gardenia',
        totalCost: '70,000/-',
        totalLeads: 80,
        CPL: '875/-',
        Dropped: '42 (52.2%)',
        Open: '38 (12.2%)',
        EOI_Collected: '38 (12.2%)',
        Estimated_ROI: '70,000/-',
        Closed: '-',
        Actual_ROI: '-',
    },
    {
        property: 'Prestige Gardenia',
        totalCost: '70,000/-',
        totalLeads: 80,
        CPL: '875/-',
        Dropped: '42 (52.2%)',
        Open: '38 (12.2%)',
        EOI_Collected: '38 (12.2%)',
        Estimated_ROI: '70,000/-',
        Closed: '-',
        Actual_ROI: '-',
    },
]

const Home = () => {
    const [searchValue, setSearchValue] = useState('')
    const [selectedSummaryCard, setSelectedSummaryCard] = useState('all')
    const [selectedProperty, setSelectedProperty] = useState('All')
    const [activeTab, setActiveTab] = useState('Tabular')

    const summaryCards: SummaryCard[] = [
        {
            title: 'Marketing',
            totalCampaigns: 23,
            totalCost: '230K',
            totalLeads: 400,
            costPerLead: '1.8k',
        },
        {
            title: 'Sales',
            totalCampaigns: 23,
            totalCost: '230K',
            totalLeads: 400,
            costPerLead: '45',
        },
    ]

    const columns: TableColumn[] = [
        { key: 'property', header: 'Property' },
        { key: 'totalCost', header: 'Total Cost' },
        { key: 'totalLeads', header: 'Leads' },
        { key: 'CPL', header: 'CPL' },
        { key: 'Dropped', header: 'Dropped' },
        { key: 'Open', header: 'Open' },
        { key: 'EOI_Collected', header: 'EOI Collected' },
        { key: 'Estimated_ROI', header: 'Estimated ROI' },
        { key: 'Closed', header: 'Closed' },
        { key: 'Actual_ROI', header: 'Actual ROI' },
    ]

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden'>
                <div className='py-2 bg-white min-h-screen'>
                    {/* Header */}
                    <div className='mb-6'>
                        <div className='flex items-center justify-between pb-4 px-6 border-b border-gray-300 mb-[13px]'>
                            <h1 className='text-xl font-semibold text-black'>Home</h1>
                        </div>

                        {/* Summary Cards */}
                        <div className='flex flex-row px-6 gap-4 mb-5'>
                            {summaryCards.map((card, index) => (
                                <SummaryCard
                                    key={index}
                                    card={card}
                                    onClick={() => setSelectedSummaryCard(card.title)}
                                    isSelected={selectedSummaryCard === card.title}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Search, Dropdown & Toggle */}
                    <div className='flex items-center px-6 justify-between mb-5'>
                        {/* Left: Search + Dropdown */}
                        <div className='flex items-center gap-4'>
                            <div className='w-68'>
                                <StateBaseTextField
                                    leftIcon={
                                        <svg
                                            className='w-4 h-4 text-gray-400'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 16 16'
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
                                    placeholder='Search campaign'
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className='h-7'
                                />
                            </div>

                            {/* Property Dropdown */}
                            <div className='relative'>
                                <select
                                    value={selectedProperty}
                                    onChange={(e) => setSelectedProperty(e.target.value)}
                                    className='appearance-none bg-white border border-gray-300 rounded-sm px-1 py-1 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700'
                                >
                                    <option value='All'>Property</option>
                                    <option value='Prestige Gardenia'>Prestige Gardenia</option>
                                    <option value='Other Property'>Other Property</option>
                                </select>
                                <div className='absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'>
                                    <svg
                                        className='w-4 h-4 text-gray-400'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M19 9l-7 7-7-7'
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Tabular / Graphical Toggle */}
                        <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit'>
                            <button
                                onClick={() => setActiveTab('Tabular')}
                                className={`px-1 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'Tabular'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Tabular
                            </button>
                            <button
                                onClick={() => setActiveTab('Graphical')}
                                className={`px-1 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'Graphical'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Graphical
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className='bg-white rounded-lg shadow-sm overflow-hidden px-6'>
                        <div className='h-[58vh] overflow-y-auto'>
                            <FlexibleTable
                                data={tableData}
                                columns={columns}
                                borders={{
                                    table: false,
                                    header: true,
                                    rows: true,
                                    cells: false,
                                    outer: true,
                                }}
                                className='rounded-lg'
                                stickyHeader={true}
                                maxHeight='58vh'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Home
