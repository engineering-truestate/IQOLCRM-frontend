import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import google from '/icons/canvas_homes/google.svg'

// Types for API response
interface GoogleAdsMetric {
    campaign: {
        id: string
        name: string
    }
    segments: {
        date: string
    }
    metrics: {
        clicks: number
        conversions: number
        cost_micros: number
        conversions_value: number
        impressions: number
    }
}

interface CampaignData {
    campaignId: string
    startDate: string
    endDate: string
    isPaused: boolean
    lastActiveDate?: string
    property?: string
    medium?: string
    totalCost?: string
    totalLeads?: number
    cpl?: string
}

interface ProcessedMetric {
    id: string
    date: string
    totalCost: number
    totalImpression: number
    totalClicks: number
    cpiCpc: number
    totalLeads: number
    cpl: number
}

const MarketingDetails = () => {
    const { campaignId } = useParams<{ campaignId: string }>()
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [tableData, setTableData] = useState<ProcessedMetric[]>([])
    const [columns, setColumns] = useState<TableColumn[]>([])
    const [campaignDetails, setCampaignDetails] = useState<CampaignData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [rawMetrics, setRawMetrics] = useState<GoogleAdsMetric[]>([])

    // Updated Google Ads API integration function using hosted endpoint
    const getCampaignMetrics = async (campaign: CampaignData): Promise<GoogleAdsMetric[]> => {
        try {
            setLoading(true)
            setError(null)

            // Prepare campaign data as JSON payload
            const payload = {
                campaignId: campaign.campaignId,
                startDate: campaign.startDate,
                endDate: campaign.endDate,
                isPaused: campaign.isPaused,
                ...(campaign.isPaused && campaign.lastActiveDate && { lastActiveDate: campaign.lastActiveDate }),
            }
            console.log(payload)

            const apiUrl = 'https://daily-report-campaign-server.onrender.com/campaign-metrics'

            console.log('Sending campaign data:', payload)

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch campaign metrics: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()

            const metrics = Array.isArray(data) ? data : data.metrics || data.data || []

            console.log('Received metrics:', metrics)
            return metrics
        } catch (err) {
            console.error('Error fetching campaign metrics:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch campaign data')
            return []
        } finally {
            setLoading(false)
        }
    }

    // Process raw metrics into display format
    const processMetrics = (metrics: GoogleAdsMetric[]): ProcessedMetric[] => {
        return metrics.map((metric, index) => {
            const costInRupees = metric.metrics.cost_micros / 1000000 // Convert micros to rupees
            const clicks = metric.metrics.clicks
            const leads = metric.metrics.conversions

            return {
                id: `${metric.campaign.id}-${metric.segments.date}-${index}`,
                date: new Date(metric.segments.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                totalCost: Math.round(costInRupees),
                totalImpression: metric.metrics.impressions,
                totalClicks: clicks,
                cpiCpc: clicks > 0 ? Math.round((costInRupees / clicks) * 100) / 100 : 0,
                totalLeads: leads,
                cpl: leads > 0 ? Math.round((costInRupees / leads) * 100) / 100 : 0,
            }
        })
    }

    // Load campaign details and metrics
    useEffect(() => {
        const loadCampaignData = async () => {
            try {
                // Get campaign data from URL parameters
                const urlParams = new URLSearchParams(window.location.search)

                const campaignData: CampaignData = {
                    campaignId: campaignId || '',
                    startDate: urlParams.get('startDate') || '',
                    endDate: urlParams.get('endDate') || 'No end date',
                    isPaused: urlParams.get('isPaused') === 'true',
                    lastActiveDate: urlParams.get('lastActiveDate') || undefined,
                }

                // Validate required parameters
                if (!campaignData.campaignId || !campaignData.startDate) {
                    setError('Campaign ID and start date are required in URL parameters')
                    setLoading(false)
                    return
                }

                console.log('Campaign data from URL params:', campaignData)
                setCampaignDetails(campaignData)

                // Fetch metrics using the hosted Google Ads API
                const metrics = await getCampaignMetrics(campaignData)
                setRawMetrics(metrics)
            } catch (err) {
                console.error('Error loading campaign data:', err)
                setError(err instanceof Error ? err.message : 'Failed to load campaign data')
                setLoading(false)
            }
        }

        loadCampaignData()
    }, [campaignId])

    // Fallback dummy data for development/testing
    const fallbackData = useMemo(
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

    // Process data based on API response or fallback
    const originalData = useMemo(() => {
        if (rawMetrics.length > 0) {
            return processMetrics(rawMetrics)
        }
        // Use fallback data if API data is not available
        return fallbackData
    }, [rawMetrics, fallbackData])

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

    // Set up table columns
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
                render: (v) => <span className='text-sm'>₹{v.toLocaleString()}</span>,
            },
            {
                key: 'totalImpression',
                header: 'Total Impression',
                render: (v) => <span className='text-sm'>{v.toLocaleString()}</span>,
            },
            {
                key: 'totalClicks',
                header: 'Total Clicks',
                render: (v) => <span className='text-sm'>{v.toLocaleString()}</span>,
            },
            {
                key: 'cpiCpc',
                header: 'CPI/CPC',
                render: (v) => <span className='text-sm'>₹{v.toLocaleString()}</span>,
            },
            {
                key: 'totalLeads',
                header: 'Total Leads',
                render: (v) => <span className='text-sm'>{v.toLocaleString()}</span>,
            },
            {
                key: 'cpl',
                header: 'CPL',
                render: (v) => <span className='text-sm'>₹{v.toLocaleString()}</span>,
            },
        ])
    }, [activeTab])

    // Process and aggregate data based on selected tab
    useEffect(() => {
        const format = (val: number) => Math.round(val * 100) / 100

        const aggregate = (items: ProcessedMetric[]) => {
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

            const grouped: Record<string, ProcessedMetric[]> = {}

            originalData.forEach((item) => {
                const d = new Date(item.date)
                let key = ''
                if (activeTab === 'weekly') {
                    key = `Week ${getWeekNumber(d)} - ${d.getFullYear()}`
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

    // Calculate totals for campaign details
    const campaignTotals = useMemo(() => {
        if (originalData.length === 0) return null

        const totalCost = originalData.reduce((sum, item) => sum + item.totalCost, 0)
        const totalLeads = originalData.reduce((sum, item) => sum + item.totalLeads, 0)
        const avgCpl = totalLeads > 0 ? totalCost / totalLeads : 0

        return {
            totalCost: `₹${totalCost.toLocaleString()}`,
            totalLeads,
            cpl: `₹${Math.round(avgCpl).toLocaleString()}`,
        }
    }, [originalData])

    if (loading) {
        return <Layout loading={true} />
    }

    if (error) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-center'>
                        <div className='text-red-600 text-lg font-medium mb-2'>Error Loading Campaign Data</div>
                        <div className='text-gray-600'>{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden'>
                <div className='py-2 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    <div className='flex items-center justify-between px-6 border-b-1 border-gray-400 pb-4'>
                        <h2 className='text-base font-medium text-gray-400'>
                            Marketing Dashboard /{' '}
                            <span className='font-semibold text-gray-600'>
                                {campaignDetails?.campaignName || 'Campaign Details'}
                            </span>
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
                                    hoverable={true}
                                    headerClassName='font-normal text-left px-1'
                                    cellClassName='text-left px-1'
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
                                    ['Property Name', campaignDetails?.property || 'N/A'],
                                    ['Campaign Name', campaignDetails?.campaignName || 'N/A'],
                                    [
                                        'Source',
                                        <div className='flex items-center gap-2' key='source'>
                                            <img src={google} alt='Google' className='w-4 h-4 object-contain' />
                                            Google
                                        </div>,
                                    ],
                                    ['Medium', campaignDetails?.medium || 'Search'],
                                    [
                                        'Start Date',
                                        campaignDetails?.startDate
                                            ? new Date(campaignDetails.startDate).toLocaleDateString()
                                            : 'N/A',
                                    ],
                                    [
                                        'End Date',
                                        campaignDetails?.endDate === 'No end date'
                                            ? 'No end date'
                                            : campaignDetails?.endDate
                                              ? new Date(campaignDetails.endDate).toLocaleDateString()
                                              : 'N/A',
                                    ],
                                    ['Campaign ID', campaignDetails?.campaignId || 'N/A'],
                                    ['Total Cost', campaignTotals?.totalCost || 'N/A'],
                                    ['Total Lead', campaignTotals?.totalLeads || 'N/A'],
                                    ['CPL', campaignTotals?.cpl || 'N/A'],
                                    ['Status', campaignDetails?.isPaused ? 'Paused' : 'Active'],
                                ].map(([label, value], idx) => (
                                    <div key={idx} className='flex gap-3.5 justify-between'>
                                        <strong className='w-[40%] text-gray-600'>{label}</strong>
                                        <div className='w-[60%] text-left'>{value}</div>
                                    </div>
                                ))}
                            </div>

                            {rawMetrics.length === 0 && !loading && (
                                <div className='mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded'>
                                    <div className='text-sm text-yellow-800'>
                                        <strong>Note:</strong> Showing sample data. Live metrics loading...
                                    </div>
                                </div>
                            )}

                            {rawMetrics.length > 0 && (
                                <div className='mt-6 p-3 bg-green-50 border border-green-200 rounded'>
                                    <div className='text-sm text-green-800'>
                                        <strong>Live Data:</strong> Displaying real-time Google Ads metrics
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default MarketingDetails
