import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import DateRangePicker from '../../../components/design-elements/DateRangePicker'
import { searchCampaigns, type CampaignSearchFilters } from '../../../services/canvas_homes/marketingAlgoliaService'
import google from '/icons/canvas_homes/google.svg'
import linkedin from '/icons/canvas_homes/linkedin.svg'
import meta from '/icons/canvas_homes/meta.svg'
import { useNavigate } from 'react-router-dom'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'

// Campaign data type
type Campaign = {
    campaignId: string
    campaignName: string
    property?: string
    source: string
    medium?: string
    startDate: string
    endDate: string
    activeDuration?: string
    totalCost: string
    totalClicks: number
    totalImpressions: number
    totalConversions: string
    ctr: string
    averageCpc: string
    status: string
    isPaused: boolean
    lastActiveDate?: string
    costPerDay: string
    dailyAvgCost: string
    totalConversionsValue: string
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

const Marketing = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    // Initialize state from URL params
    const [selectedSummaryCard, setSelectedSummaryCard] = useState(() => searchParams.get('source') || 'All')
    const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '')
    const [selectedDateRange, setSelectedDateRange] = useState(() => searchParams.get('dateRange') || '')

    // Separate state for date range picker (not applied until user confirms)
    const [pendingDateRange, setPendingDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
        startDate: null,
        endDate: null,
    })

    const [customDateRange, setCustomDateRange] = useState<{ startDate: string | null; endDate: string | null }>(
        () => ({
            startDate: searchParams.get('startDate'),
            endDate: searchParams.get('endDate'),
        }),
    )

    const [selectedProperty, setSelectedProperty] = useState(() => searchParams.get('property') || '')
    const [selectedCampaignStatus, setSelectedCampaignStatus] = useState(() => searchParams.get('status') || '')

    // Store initial facets to prevent filter options from changing
    const [initialFacets, setInitialFacets] = useState<Record<string, Record<string, number>>>({})
    const [allCampaignsData, setAllCampaignsData] = useState<Campaign[]>([])
    const [filteredCampaignsData, setFilteredCampaignsData] = useState<Campaign[]>([])
    const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})
    const [isLoading, setIsLoading] = useState(false)

    // Update URL when filters change
    const updateURL = useCallback(
        (newFilters: Record<string, string | null>) => {
            const newSearchParams = new URLSearchParams(searchParams)

            Object.entries(newFilters).forEach(([key, value]) => {
                if (value) {
                    newSearchParams.set(key, value)
                } else {
                    newSearchParams.delete(key)
                }
            })

            setSearchParams(newSearchParams)
        },
        [searchParams, setSearchParams],
    )

    // Update URL when individual filters change
    useEffect(() => {
        updateURL({
            source: selectedSummaryCard !== 'All' ? selectedSummaryCard : null,
            search: searchValue || null,
            dateRange: selectedDateRange || null,
            startDate: customDateRange.startDate,
            endDate: customDateRange.endDate,
            property: selectedProperty || null,
            status: selectedCampaignStatus || null,
        })
    }, [
        selectedSummaryCard,
        searchValue,
        selectedDateRange,
        customDateRange,
        selectedProperty,
        selectedCampaignStatus,
        updateURL,
    ])

    const activeFilters = [
        selectedDateRange && { label: selectedDateRange, onClear: () => setSelectedDateRange('') },
        customDateRange.startDate &&
            customDateRange.endDate && {
                label: `${customDateRange.startDate} to ${customDateRange.endDate}`,
                onClear: () => setCustomDateRange({ startDate: null, endDate: null }),
            },
        selectedProperty && { label: toCapitalizedWords(selectedProperty), onClear: () => setSelectedProperty('') },
        selectedCampaignStatus && {
            label: toCapitalizedWords(selectedCampaignStatus),
            onClear: () => setSelectedCampaignStatus(''),
        },
    ].filter(Boolean)

    const debounce = useCallback(<T extends (...args: any[]) => any>(func: T, delay: number) => {
        let timeoutId: NodeJS.Timeout
        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => func(...args), delay)
        }
    }, [])

    const createFilters = useMemo((): CampaignSearchFilters => {
        const filters: CampaignSearchFilters = {
            campaignName: selectedProperty ? [selectedProperty] : undefined,
            status: selectedCampaignStatus ? [selectedCampaignStatus] : undefined,
            dateRange: selectedDateRange || undefined,
        }

        if (customDateRange.startDate || customDateRange.endDate) {
            filters.addedRange = {
                startDate: customDateRange.startDate || undefined,
                endDate: customDateRange.endDate || undefined,
            }
        }

        return filters
    }, [selectedProperty, selectedCampaignStatus, selectedDateRange, customDateRange])

    // Filter campaigns based on summary card selection
    useEffect(() => {
        let filtered = allCampaignsData

        if (selectedSummaryCard !== 'All') {
            // Since all campaigns are from Google source, we'll filter by campaign name or other criteria
            // For now, we'll show all campaigns for any source selection
            // You can modify this logic based on your actual data structure
            filtered = allCampaignsData
        }

        setFilteredCampaignsData(filtered)
    }, [allCampaignsData, selectedSummaryCard])

    // Main search function - stable reference
    const performSearch = useCallback(async () => {
        if (isLoading) return

        setIsLoading(true)
        try {
            const result = await searchCampaigns({
                query: searchValue,
                filters: createFilters,
                page: 0,
                hitsPerPage: 1000,
            })

            setAllCampaignsData(result.hits)
            setFacets(result.facets || {})

            // Store initial facets on first load only
            setInitialFacets((prev) => (Object.keys(prev).length === 0 && result.facets ? result.facets : prev))
        } catch (error) {
            console.error('Search error:', error)
            setAllCampaignsData([])
            setFilteredCampaignsData([])
        } finally {
            setIsLoading(false)
        }
    }, [searchValue, createFilters, isLoading])

    // Debounced search for text input - stable reference
    const debouncedSearch = useMemo(() => {
        return debounce(performSearch, 300)
    }, [performSearch])

    // Effect for immediate search (filters)
    useEffect(() => {
        performSearch()
    }, [selectedProperty, selectedCampaignStatus, selectedDateRange, customDateRange])

    // Effect for debounced search (text input)
    useEffect(() => {
        if (searchValue.trim()) {
            debouncedSearch()
        } else {
            performSearch()
        }
    }, [searchValue])

    // Load initial data on component mount
    useEffect(() => {
        performSearch()
    }, [])

    // Summary card calculations
    const summaryCardCounts = useMemo(() => {
        const counts = {
            All: { campaigns: allCampaignsData.length, cost: 0, leads: 0 },
            Google: { campaigns: allCampaignsData.length, cost: 0, leads: 0 }, // All campaigns are Google
            LinkedIn: { campaigns: 0, cost: 0, leads: 0 },
            Meta: { campaigns: 0, cost: 0, leads: 0 },
        }

        allCampaignsData.forEach((campaign) => {
            const cost = parseFloat(campaign.totalCost.replace(/[^0-9.-]+/g, '')) || 0
            const conversions = parseFloat(campaign.totalConversions) || 0

            counts.All.cost += cost
            counts.All.leads += conversions

            // Since all campaigns are Google source
            counts.Google.cost += cost
            counts.Google.leads += conversions
        })

        return counts
    }, [allCampaignsData])

    // Modified date range handler - doesn't apply immediately
    const handleDateRangeChange = useCallback((startDate: string | null, endDate: string | null) => {
        setPendingDateRange({ startDate, endDate })
    }, [])

    // New function to apply pending date range
    const applyDateRange = useCallback(() => {
        setCustomDateRange(pendingDateRange)
        if (pendingDateRange.startDate || pendingDateRange.endDate) {
            setSelectedDateRange('')
        }
    }, [pendingDateRange])

    // New function to cancel pending date range
    const cancelDateRange = useCallback(() => {
        setPendingDateRange(customDateRange)
    }, [customDateRange])

    const dropdownClasses = {
        container: 'relative inline-block w-full sm:w-auto',
        trigger: (isSelected: boolean) =>
            `flex items-center justify-between p-2 h-7 border rounded-sm bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 min-w-[100px] w-full sm:w-auto cursor-pointer ${isSelected ? 'border-black' : 'border-gray-300'}`,
        menu: 'absolute z-50 mt-1 w-fit min-w-[200px] bg-white border border-gray-300 rounded-md shadow-lg',
        option: 'px-3 py-2 text-sm w-full text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md',
    }

    // Keep initial facet options and order, only update counts
    const generateDropdownOptions = useCallback(
        (facetKey: string, _defaultLabel: string, staticOptions?: any[]) => {
            if (staticOptions) return staticOptions

            const initialFacetData = initialFacets[facetKey] || {}
            const currentFacetData = facets[facetKey] || {}
            const options: { label: string; value: string }[] = []

            // Use initial facets for options and sorting, current facets only for counts
            Object.entries(initialFacetData)
                .sort(([, a], [, b]) => (b as number) - (a as number)) // Keep original sort order from initial load
                .forEach(([key]) => {
                    // Use current count if available, otherwise 0
                    const currentCount = currentFacetData[key] || 0
                    options.push({
                        label: `${toCapitalizedWords(key)} (${currentCount})`,
                        value: key,
                    })
                })

            return options
        },
        [initialFacets, facets],
    )

    const handleRowClick = () => {
        navigate('/canvas-homes/marketingdetails')
    }

    // Summary cards data
    const summaryCards: SummaryCard[] = [
        {
            title: 'All',
            totalCampaigns: summaryCardCounts.All.campaigns,
            totalCost: `${(summaryCardCounts.All.cost / 1000).toFixed(0)}K`,
            totalLeads: summaryCardCounts.All.leads,
            costPerLead:
                summaryCardCounts.All.leads > 0
                    ? `${(summaryCardCounts.All.cost / summaryCardCounts.All.leads / 1000).toFixed(1)}k`
                    : '0',
        },
        {
            title: 'Google',
            totalCampaigns: summaryCardCounts.Google.campaigns,
            totalCost: `${(summaryCardCounts.Google.cost / 1000).toFixed(0)}K`,
            totalLeads: summaryCardCounts.Google.leads,
            costPerLead:
                summaryCardCounts.Google.leads > 0
                    ? `${(summaryCardCounts.Google.cost / summaryCardCounts.Google.leads / 1000).toFixed(1)}k`
                    : '0',
        },
        {
            title: 'LinkedIn',
            totalCampaigns: summaryCardCounts.LinkedIn.campaigns,
            totalCost: `${(summaryCardCounts.LinkedIn.cost / 1000).toFixed(0)}K`,
            totalLeads: summaryCardCounts.LinkedIn.leads,
            costPerLead:
                summaryCardCounts.LinkedIn.leads > 0
                    ? `${(summaryCardCounts.LinkedIn.cost / summaryCardCounts.LinkedIn.leads / 1000).toFixed(1)}k`
                    : '0',
        },
        {
            title: 'Meta',
            totalCampaigns: summaryCardCounts.Meta.campaigns,
            totalCost: `${(summaryCardCounts.Meta.cost / 1000).toFixed(0)}K`,
            totalLeads: summaryCardCounts.Meta.leads,
            costPerLead:
                summaryCardCounts.Meta.leads > 0
                    ? `${(summaryCardCounts.Meta.cost / summaryCardCounts.Meta.leads / 1000).toFixed(1)}k`
                    : '0',
        },
    ]

    // Table columns configuration
    const columns: TableColumn[] = [
        {
            key: 'campaignName',
            header: 'Property',
            render: (value) => (
                <div
                    className='max-w-[150px] overflow-hidden whitespace-nowrap truncate text-sm font-normal text-gray-900'
                    title={value}
                >
                    {value}
                </div>
            ),
        },
        {
            key: 'campaignName',
            header: 'Campaign Name',
            render: (value, row) => (
                <div className='whitespace-nowrap'>
                    <div
                        className='max-w-[150px] overflow-hidden whitespace-nowrap truncate text-sm font-normal text-gray-900'
                        title={value}
                    >
                        {value}
                    </div>
                    <div className='text-xs text-gray-500 font-normal'>ID:{row.campaignId}</div>
                </div>
            ),
        },
        {
            key: 'source',
            header: 'Source',
            render: (value) => (
                <div className='flex justify-start'>
                    <div className='inline-flex items-center min-w-max rounded-[20px] gap-[6px] h-8 px-2 whitespace-nowrap border border-gray-300 w-fit'>
                        <img src={google} alt='Google' className='w-4 h-4 object-contain' />
                        <span className='text-sm font-normal'>Google</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'medium',
            header: 'Medium',
            render: (value) => <span className='whitespace-nowrap text-sm text-gray-600 font-normal'>Search</span>,
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
            key: 'status',
            header: 'Status',
            render: (value, row) => (
                <div className='flex flex-col'>
                    <span
                        className={`whitespace-nowrap text-sm font-normal ${row.isPaused ? 'text-orange-600' : 'text-green-600'}`}
                    >
                        {row.isPaused ? 'Paused' : 'Active'}
                    </span>
                    {row.activeDuration && <span className='text-xs text-gray-500'>{row.activeDuration}</span>}
                </div>
            ),
        },
        {
            key: 'totalCost',
            header: 'Total Cost',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        {
            key: 'totalClicks',
            header: 'Total Clicks',
            render: (value) => (
                <span className='whitespace-nowrap text-sm font-normal'>{value?.toLocaleString() || '0'}</span>
            ),
        },
        {
            key: 'totalConversions',
            header: 'Total Leads',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value || '0'}</span>,
        },
        {
            key: 'averageCpc',
            header: 'Avg CPC',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
        {
            key: 'ctr',
            header: 'CTR',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal'>{value}</span>,
        },
    ]

    return (
        <Layout loading={isLoading}>
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
                        <div className='flex flex-wrap items-center gap-2 sm:gap-4 mb-5'>
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
                                placeholder='Search campaign'
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className='h-7 w-full sm:w-68 bg-gray-300 focus-within:border-black'
                            />

                            <DateRangePicker
                                onDateRangeChange={handleDateRangeChange}
                                onApply={applyDateRange}
                                onCancel={cancelDateRange}
                                placeholder='Date Range'
                                className={dropdownClasses.container}
                                triggerClassName={dropdownClasses.trigger(!!selectedDateRange)}
                                menuClassName={dropdownClasses.menu}
                                showApplyCancel={true}
                            />

                            <Dropdown
                                options={generateDropdownOptions('campaignName', 'Campaign')}
                                onSelect={setSelectedProperty}
                                defaultValue={selectedProperty}
                                value={selectedProperty}
                                forcePlaceholderAlways
                                placeholder='Campaign'
                                className={dropdownClasses.container}
                                triggerClassName={dropdownClasses.trigger(!!selectedProperty)}
                                menuClassName={dropdownClasses.menu}
                                optionClassName={dropdownClasses.option}
                            />

                            <Dropdown
                                options={generateDropdownOptions('status', 'Status')}
                                onSelect={setSelectedCampaignStatus}
                                defaultValue={selectedCampaignStatus}
                                value={selectedCampaignStatus}
                                forcePlaceholderAlways
                                placeholder='Campaign Status'
                                className={dropdownClasses.container}
                                triggerClassName={dropdownClasses.trigger(!!selectedCampaignStatus)}
                                menuClassName={dropdownClasses.menu}
                                optionClassName={dropdownClasses.option}
                            />
                        </div>

                        {/* Summary Cards */}
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5.25'>
                            <div className='flex flex-row gap-4.5'>
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

                        {/* Active Filters */}
                        {activeFilters.length > 0 && (
                            <div className='flex flex-wrap items-center gap-2 mb-4'>
                                {activeFilters.map((filter, index) =>
                                    filter ? (
                                        <div
                                            key={index}
                                            className='flex items-center bg-gray-100 text-xs font-medium text-gray-700 px-3 py-1.5 rounded-md'
                                        >
                                            {filter.label}
                                            <button
                                                onClick={filter.onClear}
                                                className='ml-2 text-gray-500 hover:text-red-500 focus:outline-none'
                                                aria-label={`Clear ${filter.label}`}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : null,
                                )}

                                {/* Clear All Button */}
                                <button
                                    onClick={() => {
                                        setSelectedDateRange('')
                                        setCustomDateRange({ startDate: null, endDate: null })
                                        setPendingDateRange({ startDate: null, endDate: null })
                                        setSelectedProperty('')
                                        setSelectedCampaignStatus('')
                                    }}
                                    className='ml-4 text-xs bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-1.5 px-4 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer'
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>

                    <div
                        className='bg-white rounded-lg shadow-sm overflow-hidden'
                        style={{
                            height: `${activeFilters.length > 0 ? 45 : 57}vh`, // You can adjust these values
                        }}
                    >
                        <FlexibleTable
                            showCheckboxes={true}
                            data={filteredCampaignsData}
                            columns={columns}
                            borders={{ table: false, header: true, rows: true, cells: false, outer: true }}
                            headerClassName='font-normal text-left px-1'
                            cellClassName='text-left px-1'
                            onRowClick={handleRowClick}
                            className='rounded-lg overflow-x-hidden'
                            stickyHeader={true}
                            hoverable={true}
                            maxHeight={`${activeFilters.length > 0 ? 45 : 57}vh`}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Marketing
