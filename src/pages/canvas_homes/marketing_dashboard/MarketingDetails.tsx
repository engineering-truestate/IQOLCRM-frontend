import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import google from '/icons/canvas_homes/google.svg'
import { campaignService } from '../../../services/canvas_homes/campaignService'
import type { AppDispatch, RootState } from '../../../store'
import { fetchPreLaunchProperties } from '../../../store/actions/restack/preLaunchActions'
import { toast } from 'react-toastify'

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
    campaignName: string
    startDate: string
    endDate: string
    isPaused: boolean
    lastActiveDate?: string
    propertyName?: string
    propertyId?: string
    medium?: string
    totalCost?: string
    totalLeads?: number
    cpl?: string
}

interface ProcessedMetric {
    id: string
    date: string
    startDate?: string
    dateRange?: string
    totalCost: number
    totalImpression: number
    totalClicks: number
    cpiCpc: number
    totalLeads: number
    cpl: number
}

const MarketingDetails = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { properties } = useSelector((state: RootState) => state.preLaunch)
    const { campaignId } = useParams<{ campaignId: string }>()

    // Table states
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [tableData, setTableData] = useState<ProcessedMetric[]>([])
    const [columns, setColumns] = useState<TableColumn[]>([])

    // Campaign and metrics states
    const [campaignDetails, setCampaignDetails] = useState<CampaignData | null>(null)
    const [rawMetrics, setRawMetrics] = useState<GoogleAdsMetric[]>([])

    // UI states
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [setSuccessMessage] = useState<string | null>(null)

    // Property selection states
    const [isEditingProperty, setIsEditingProperty] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState<{ id: string; name: string } | null>(null)
    const [propertyOptions, setPropertyOptions] = useState<{ label: string; value: string }[]>([])

    const formatDate = (d: Date) =>
        d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })

    // Load properties for dropdown
    useEffect(() => {
        const loadProperties = async () => {
            if (!properties || properties.length === 0) {
                await dispatch(fetchPreLaunchProperties())
            }
        }
        loadProperties()
    }, [dispatch, properties])

    // Set property options when properties load
    useEffect(() => {
        if (properties && properties.length > 0) {
            const options = properties.map((property) => ({
                label: property.projectName,
                value: `${property.projectId}|${property.projectName}`,
            }))
            setPropertyOptions(options)
        }
    }, [properties])

    // Fetch campaign metrics from API
    const getCampaignMetrics = async (campaign: CampaignData): Promise<any[]> => {
        try {
            setLoading(true)
            setError(null)

            // Prepare campaign data as JSON payload
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
    const loadCampaignData = async () => {
        try {
            if (!campaignId) {
                setError('Campaign ID is required')
                setLoading(false)
                return
            }

            // Fetch campaign details from Firebase
            const campaign = await campaignService.getByCampaignId(campaignId)

            if (!campaign) {
                setError(`Campaign with ID ${campaignId} not found`)
                setLoading(false)
                return
            }

            setCampaignDetails(campaign)

            // Fetch metrics using the hosted Google Ads API
            const metrics = await getCampaignMetrics(campaign)
            setRawMetrics(metrics)
        } catch (err) {
            console.error('Error loading campaign data:', err)
            setError(err instanceof Error ? err.message : 'Failed to load campaign data')
            setLoading(false)
        }
    }

    // Initial data load
    useEffect(() => {
        loadCampaignData()
    }, [campaignId])

    // Handle property selection from dropdown
    const handlePropertySelect = (value: string) => {
        if (value) {
            const [id, name] = value.split('|')
            setSelectedProperty({ id, name })
        }
    }

    // Save property changes to campaign
    const savePropertyChanges = async () => {
        if (!selectedProperty || !campaignDetails) return

        try {
            setLoading(true)

            // Update campaign with new property
            const updatedCampaign = {
                propertyName: selectedProperty.name,
                propertyId: selectedProperty.id,
            }

            await campaignService.update(campaignDetails.campaignId, updatedCampaign)

            // Show success message
            toast.success('Property updated successfully')

            // Reset editing state
            setIsEditingProperty(false)

            // Reload campaign data to reflect changes
            await loadCampaignData()

            // Clear success message after 3 seconds
            setTimeout(() => {}, 3000)
        } catch (err) {
            toast.error('Error updating property')
            setError(err instanceof Error ? err.message : 'Failed to update property')
        } finally {
            setLoading(false)
        }
    }

    // Discard property changes
    const discardPropertyChanges = () => {
        setSelectedProperty(null)
        setIsEditingProperty(false)
    }

    // Process data based on API response
    const originalData = useMemo(() => {
        if (rawMetrics && rawMetrics.length > 0) {
            return processMetrics(rawMetrics)
        }
        return []
    }, [rawMetrics])

    // Helper functions for date grouping
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

    // Render property field with edit/add functionality
    const renderPropertyField = () => {
        const hasProperty = campaignDetails?.propertyName && campaignDetails.propertyName !== 'N/A'

        if (isEditingProperty) {
            return (
                <div className='flex flex-col sm:flex-row gap-2 w-full'>
                    <div className='relative w-full'>
                        <Dropdown
                            options={propertyOptions}
                            onSelect={handlePropertySelect}
                            defaultValue={
                                hasProperty ? `${campaignDetails?.propertyId}|${campaignDetails?.propertyName}` : ''
                            }
                            placeholder='Select Property Name'
                            className='w-full relative inline-block'
                            triggerClassName={`relative w-full min-w-[177px] h-7 p-2 rounded-sm text-sm font-mediun text-gray-500 bg-gray-200 flex items-center justify-between disabled:opacity-50 ${
                                selectedProperty ? '[&>span]:text-gray-700' : ''
                            }`}
                            menuClassName='absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg'
                            optionClassName='px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                        />
                    </div>
                    <div className='flex gap-2 justify-end sm:flex-shrink-0'>
                        <button
                            onClick={discardPropertyChanges}
                            className='px-2 h-7 w-fit text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-sm text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Discard
                        </button>
                        <button
                            onClick={savePropertyChanges}
                            className='p-2 h-7 w-fit bg-blue-500 text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                            disabled={!selectedProperty}
                        >
                            Save
                        </button>
                    </div>
                </div>
            )
        }

        return (
            <div className='flex items-center justify-between w-full'>
                {hasProperty ? (
                    <>
                        <div className='font-normal truncate mr-2'>{campaignDetails.propertyName}</div>
                        <button
                            onClick={() => setIsEditingProperty(true)}
                            className='p-2 w-fit text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-sm text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0'
                        >
                            Edit
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setIsEditingProperty(true)}
                        className='p-2 h-7 w-fit bg-blue-500 text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    >
                        Add Property
                    </button>
                )}
            </div>
        )
    }

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
                <div className='py-3 bg-white min-h-screen' style={{ width: '100%', maxWidth: '100%' }}>
                    <div className='flex items-center justify-between px-4 sm:px-6 border-b-1 border-gray-400 pb-3'>
                        <div>
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <button
                                    className='font-medium hover:text-gray-800 cursor-pointer'
                                    onClick={() => (window.location.href = '/canvas-homes/marketing')}
                                >
                                    <span>Marketing Dashboard</span>
                                </button>
                                <span>/</span>
                                <span className='text-gray-900 font-medium truncate max-w-[150px] sm:max-w-none'>
                                    {campaignDetails?.campaignName}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        className='flex flex-col lg:flex-row w-full min-h-screen'
                        style={{ height: 'auto', minHeight: '40vh', maxHeight: 'none' }}
                    >
                        <div className='flex-1 p-4 sm:p-6 pt-0 overflow-x-auto'>
                            <div className='flex gap-2 sm:gap-4 mb-3 border-b border-gray-200 overflow-x-auto pb-1 sm:pb-0'>
                                {['daily', 'weekly', 'monthly'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as 'daily' | 'weekly' | 'monthly')}
                                        className={`pt-2 pb-3 px-2 sm:px-4 text-sm font-medium capitalize border-b-2 transition-colors duration-150 whitespace-nowrap ${
                                            activeTab === tab
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className='bg-white rounded-lg shadow-sm overflow-hidden overflow-x-auto'>
                                {tableData.length > 0 ? (
                                    <div className='overflow-x-auto'>
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
                                            showCheckboxes={true}
                                            selectedRows={selectedRows}
                                            onRowSelect={handleRowSelect}
                                            className='rounded-lg min-w-full'
                                            stickyHeader={true}
                                            hoverable={true}
                                            headerClassName='font-normal text-left px-3 sm:px-6 whitespace-nowrap'
                                            cellClassName='text-left px-3 sm:px-6 whitespace-nowrap'
                                        />
                                    </div>
                                ) : (
                                    <div className='p-8 text-center text-gray-500'>
                                        No data available for this campaign
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Campaign Details */}
                        <div
                            className='w-full lg:w-[30%] border-t lg:border-t-0 lg:border-l border-gray-200 px-4 py-6'
                            style={{ height: 'auto', minHeight: 'auto', maxHeight: 'none' }}
                        >
                            <div className='flex items-center justify-between mb-4'>
                                <h3 className='text-md font-semibold text-gray-700'>Campaign Details</h3>
                            </div>

                            <div className='space-y-4 text-sm text-[#24252E]'>
                                <div className={`flex gap-3.5 justify-between ${isEditingProperty ? 'flex-col' : ''}`}>
                                    <strong className='w-[40%] text-[#515162] font-normal'>Property Name</strong>

                                    <div
                                        className={`${isEditingProperty ? 'w-full mt-1' : 'w-[60%]'} text-left font-normal`}
                                    >
                                        {renderPropertyField()}
                                    </div>
                                </div>

                                {[
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
                                        <div className='w-[60%] text-left font-normal truncate'>{value}</div>
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
