import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import google from '/icons/canvas_homes/google.svg'
import { campaignService } from '../../../services/canvas_homes/campaignService'
import { useNavigate } from 'react-router-dom'

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

// // Direct format from the API - matching the server's exact response format
// interface DirectMetric {
//     campaignId: string
//     date: string
//     clicks: number
//     conversions: number
//     cost: number
//     impressions: number
// }

interface CampaignData {
    campaignId: string
    campaignName: string
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
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [tableData, setTableData] = useState<ProcessedMetric[]>([])
    const [columns, setColumns] = useState<TableColumn[]>([])
    const [campaignDetails, setCampaignDetails] = useState<CampaignData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [rawMetrics, setRawMetrics] = useState<GoogleAdsMetric[]>([])

    const formatDate = (d: Date) =>
        d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })

    // Updated Google Ads API integration function using hosted endpoint
    const getCampaignMetrics = async (campaign: CampaignData): Promise<any[]> => {
        try {
            setLoading(true)
            setError(null)

            // Prepare campaign data as JSON payload - exactly matching the server's expected format
            const payload = {
                campaignId: campaign.campaignId,
                startDate: campaign.startDate,
                endDate: campaign.endDate || 'No end date',
                isPaused: campaign.isPaused,
                ...(campaign.isPaused && campaign.lastActiveDate && { lastActiveDate: campaign.lastActiveDate }),
            }

            const apiUrl = 'https://daily-report-campaign-server.onrender.com/campaign-metrics'

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

            return data
        } catch (err) {
            console.error('Error fetching campaign metrics:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch campaign data')
            return []
        } finally {
            setLoading(false)
        }
    }

    // Process raw metrics into display format
    const processMetrics = (metrics: any[]): ProcessedMetric[] => {
        return metrics.map((metric, index) => {
            // Handle both the Google Ads Metric format and the direct format provided

            // Server response format (campaignId, date, clicks, conversions, cost, impressions)
            const costInRupees = metric.cost / 1000000 // Convert micros to rupees
            const clicks = metric.clicks
            const leads = metric.conversions

            return {
                id: `${metric.campaignId}-${metric.date}-${index}`,
                date: new Date(metric.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                totalCost: Math.round(costInRupees),
                totalImpression: metric.impressions,
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
                if (!campaignId) {
                    setError('Campaign ID is required')
                    setLoading(false)
                    return
                }

                // Fetch campaign details from Firebase using the campaignService
                const campaign = await campaignService.getByCampaignId(campaignId)

                if (!campaign) {
                    setError(`Campaign with ID ${campaignId} not found`)
                    setLoading(false)
                    return
                }

                // Use the campaign data as is, without modifying its structure
                // Just map it to the expected format for the component state
                const campaignData: CampaignData = {
                    campaignId: campaign.campaignId,
                    campaignName: campaign.campaignName,
                    startDate: campaign.startDate,
                    endDate: campaign.endDate,
                    isPaused: campaign.isPaused,
                    lastActiveDate: campaign.lastActiveDate,
                }

                setCampaignDetails(campaign)

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

    // Process data based on API response
    const originalData = useMemo(() => {
        if (rawMetrics && rawMetrics.length > 0) {
            return processMetrics(rawMetrics)
        }
        return [] // No fallback data, return empty array if no metrics
    }, [rawMetrics])

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

    // const handleRowClick = (row: any) => {}

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
                render: (_, row) => {
                    const isMonthly = activeTab === 'monthly'

                    return (
                        <div className='text-sm text-gray-700'>
                            {isMonthly ? (
                                new Date(row.startDate || row.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                })
                            ) : (
                                <div>
                                    <div>{row.date}</div>
                                    {row.dateRange && <div className='text-gray-500 text-xs'>{row.dateRange}</div>}
                                </div>
                            )}
                        </div>
                    )
                },
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
                header: 'CPC',
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
                render: (v) => <span className='text-sm font-semibold'>₹{v.toLocaleString()}</span>,
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

            const grouped: Record<string, { items: ProcessedMetric[]; start: Date; end: Date }> = {}

            originalData.forEach((item) => {
                const d = new Date(item.date)
                let key = ''
                // const label = ''
                let start: Date
                let end: Date

                if (activeTab === 'weekly') {
                    const weekNumber = getWeekNumber(d)
                    const year = d.getFullYear()

                    // Start on Monday
                    start = new Date(d)
                    const day = start.getDay()
                    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // adjust when Sunday (0)
                    start.setDate(diff)

                    // End = start + 6 days
                    end = new Date(start)
                    end.setDate(start.getDate() + 6)

                    key = `Week ${weekNumber} - ${year}`

                    if (!grouped[key]) {
                        grouped[key] = { items: [], start, end }
                    }

                    grouped[key].items.push(item)
                } else {
                    key = getMonthYear(d)
                    start = end = d

                    if (!grouped[key]) grouped[key] = { items: [], start, end }
                    grouped[key].items.push(item)
                }
            })

            return Object.entries(grouped).map(([label, group]) => ({
                date: label,
                dateRange: `${formatDate(group.start)} – ${formatDate(group.end)}`,
                ...aggregate(group.items),
            }))
        }

        setTableData(groupData())
    }, [activeTab, originalData])

    const navigate = useNavigate()

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
                <div className='py-3 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    <div className='flex items-center justify-between px-6 border-b-1 border-gray-400 pb-3'>
                        <div>
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <button
                                    className='font-medium hover:text-gray-800 cursor-pointer'
                                    onClick={() => navigate('/canvas-homes/marketing')}
                                >
                                    <span>Marketing Dashboard</span>
                                </button>
                                <span>/</span>
                                <span className='text-gray-900 font-medium'>{campaignDetails?.campaignName}</span>
                            </div>
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
                                {tableData.length > 0 ? (
                                    <FlexibleTable
                                        data={tableData}
                                        columns={columns}
                                        borders={{ table: false, header: true, rows: true, cells: false, outer: true }}
                                        showCheckboxes={true}
                                        selectedRows={selectedRows}
                                        onRowSelect={handleRowSelect}
                                        // onRowClick={handleRowClick}
                                        className='rounded-lg'
                                        stickyHeader={true}
                                        hoverable={true}
                                        headerClassName='font-normal text-left px-6'
                                        cellClassName='text-left px-6'
                                    />
                                ) : (
                                    <div className='p-8 text-center text-gray-500'>
                                        No data available for this campaign
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Campaign Details */}
                        <div className='w-[25%] border-l border-gray-200 px-4 py-6'>
                            <div className='flex items-center justify-between mb-4'>
                                <h3 className='text-md font-semibold text-gray-700'>Campaign Details</h3>
                            </div>

                            <div className='space-y-4 text-sm text-[#24252E]'>
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
                                        <strong className='w-[40%] text-[#515162] font-normal'>{label}</strong>
                                        <div className='w-[60%] text-left font-normal'>{value}</div>
                                    </div>
                                ))}
                            </div>

                            {rawMetrics.length === 0 && !loading && (
                                <div className='mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded'>
                                    <div className='text-sm text-yellow-800'>
                                        <strong>Note:</strong> No metrics data available for this campaign.
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
