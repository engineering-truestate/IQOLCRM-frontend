import { useState, useEffect, useMemo } from 'react'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import google from '/icons/canvas_homes/google.svg'

const MarketingDetails = () => {
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [tableData, setTableData] = useState<any[]>([])
    const [columns, setColumns] = useState<TableColumn[]>([])

    const originalData = useMemo(
        () => [
            {
                id: '1',
                date: 'May 25, 2023',
                totalCost: 5000,
                totalImpression: 267,
                totalClicks: 60,
                cpiCpc: 52567,
                totalLeads: 5,
                cpl: 12500,
            },
            {
                id: '2',
                date: 'May 26, 2023',
                totalCost: 7200,
                totalImpression: 324,
                totalClicks: 78,
                cpiCpc: 46154,
                totalLeads: 8,
                cpl: 9000,
            },
            {
                id: '3',
                date: 'May 27, 2023',
                totalCost: 6800,
                totalImpression: 298,
                totalClicks: 71,
                cpiCpc: 47887,
                totalLeads: 7,
                cpl: 9714,
            },
            {
                id: '4',
                date: 'May 28, 2023',
                totalCost: 8500,
                totalImpression: 412,
                totalClicks: 95,
                cpiCpc: 44737,
                totalLeads: 12,
                cpl: 7083,
            },
            {
                id: '5',
                date: 'May 29, 2023',
                totalCost: 4200,
                totalImpression: 189,
                totalClicks: 43,
                cpiCpc: 48837,
                totalLeads: 4,
                cpl: 10500,
            },
            {
                id: '6',
                date: 'May 30, 2023',
                totalCost: 9200,
                totalImpression: 456,
                totalClicks: 112,
                cpiCpc: 41071,
                totalLeads: 15,
                cpl: 6133,
            },
            {
                id: '7',
                date: 'May 31, 2023',
                totalCost: 6700,
                totalImpression: 301,
                totalClicks: 68,
                cpiCpc: 49265,
                totalLeads: 6,
                cpl: 11167,
            },
        ],
        [],
    )

    const getWeekNumber = (date: Date) => {
        const oneJan = new Date(date.getFullYear(), 0, 1)
        const days = Math.floor((date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000))
        return Math.ceil((days + oneJan.getDay() + 1) / 7)
    }

    const getMonthYear = (date: Date) => {
        return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
    }

    const handleRowSelect = (rowId: string, selected: boolean) => {
        setSelectedRows((prev) => (selected ? [...prev, rowId] : prev.filter((id) => id !== rowId)))
    }

    const handleRowClick = (row: any) => {
        console.log('Row clicked:', row)
    }

    useEffect(() => {
        const getDateLabel = () => {
            switch (activeTab) {
                case 'weekly':
                    return 'Week'
                case 'monthly':
                    return 'Month'
                default:
                    return 'Date'
            }
        }

        setColumns([
            {
                key: 'date',
                header: getDateLabel(),
                render: (v) => <span className='text-sm'>{v}</span>,
            },
            {
                key: 'totalCost',
                header: 'Total Cost',
                render: (v) => <span className='text-sm'>{v.toLocaleString()}</span>,
            },
            {
                key: 'totalImpression',
                header: 'Total Impression',
                render: (v) => <span className='text-sm'>{v}</span>,
            },
            {
                key: 'totalClicks',
                header: 'Total Clicks',
                render: (v) => <span className='text-sm'>{v}</span>,
            },
            {
                key: 'cpiCpc',
                header: 'CPI/CPC',
                render: (v) => <span className='text-sm'>{v.toLocaleString()}</span>,
            },
            {
                key: 'totalLeads',
                header: 'Total Leads',
                render: (v) => <span className='text-sm'>{v}</span>,
            },
            {
                key: 'cpl',
                header: 'CPL',
                render: (v) => <span className='text-sm'>{v.toLocaleString()}</span>,
            },
        ])
    }, [activeTab, originalData])

    useEffect(() => {
        const format = (val: number) => Math.round(val * 100) / 100

        const aggregate = (items: typeof originalData) => {
            const totalCost = items.reduce((sum, x) => sum + x.totalCost, 0)
            const totalImpression = items.reduce((sum, x) => sum + x.totalImpression, 0)
            const totalClicks = items.reduce((sum, x) => sum + x.totalClicks, 0)
            const totalLeads = items.reduce((sum, x) => sum + x.totalLeads, 0)
            return {
                id: crypto.randomUUID(),
                totalCost,
                totalImpression,
                totalClicks,
                cpiCpc: totalClicks ? format(totalCost / totalClicks) : 0,
                totalLeads,
                cpl: totalLeads ? format(totalCost / totalLeads) : 0,
            }
        }

        const groupData = () => {
            if (activeTab === 'daily') return originalData

            const grouped: Record<string, typeof originalData> = {}

            originalData.forEach((item) => {
                const d = new Date(item.date)
                let key = ''
                if (activeTab === 'weekly') {
                    key = `Week ${getWeekNumber(d)}`
                } else {
                    key = getMonthYear(d)
                }
                if (!grouped[key]) grouped[key] = []
                grouped[key].push(item)
            })

            return Object.entries(grouped).map(([label, group]) => ({
                date: label,
                ...aggregate(group),
            }))
        }

        setTableData(groupData())
    }, [activeTab, originalData])

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden'>
                <div className='py-2 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    <div className='flex items-center justify-between px-6 border-b-1 border-gray-400 pb-4'>
                        <h2 className='text-base font-medium text-gray-400'>
                            Marketing Dashboard /{' '}
                            <span className='font-semibold text-gray-600'>Sattva Hamlet Bangalore</span>
                        </h2>
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

                    <div className='flex flex-row w-full min-h-screen'>
                        <div className='flex-1 p-6 pt-0'>
                            <div className='flex gap-4 mb-3 border-b border-gray-200'>
                                {['daily', 'weekly', 'monthly'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as 'daily' | 'weekly' | 'monthly')}
                                        className={`pt-2 pb-3 px-4 text-sm font-medium capitalize border-b-2 transition-colors duration-150 ${
                                            activeTab === tab
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                                <FlexibleTable
                                    data={tableData}
                                    columns={columns}
                                    borders={{ table: false, header: true, rows: true, cells: false, outer: true }}
                                    showCheckboxes={true}
                                    selectedRows={selectedRows}
                                    onRowSelect={handleRowSelect}
                                    onRowClick={handleRowClick}
                                    className='rounded-lg'
                                    stickyHeader={true}
                                />
                            </div>
                        </div>

                        {/* Right: Campaign Details */}
                        <div className='w-[25%] border-l border-gray-200 px-4 py-6'>
                            <div className='flex items-center justify-between mb-4'>
                                <h3 className='text-md font-semibold text-gray-500'>Campaign Details</h3>
                            </div>

                            <div className='space-y-4 text-sm text-gray-700'>
                                {[
                                    ['Property Name', 'Sattva Hamlet'],
                                    ['Campaign Name', 'Sattva Hamlet Bangalore'],
                                    [
                                        'Source',
                                        <div className='flex items-center gap-2'>
                                            <img src={google} alt='Google' className='w-4 h-4 object-contain' />
                                            Google
                                        </div>,
                                    ],
                                    ['Medium', 'Search'],
                                    ['Start Date', 'May 23, 2023'],
                                    ['End Date', 'May 28, 2023'],
                                    ['No. of Days', '05'],
                                    ['Total Cost', '₹50,000'],
                                    ['Total Lead', '55'],
                                    ['CPL', '₹909'],
                                ].map(([label, value], idx) => (
                                    <div key={idx} className='flex gap-3.5 justify-between'>
                                        <strong className='w-[40%] text-gray-600'>{label}</strong>
                                        <div className='w-[60%] text-left'>{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default MarketingDetails
