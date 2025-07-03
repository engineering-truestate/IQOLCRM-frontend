import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import DateRangePicker from '../../../components/design-elements/DateRangePicker'
import { searchLeads, type LeadSearchFilters } from '../../../services/canvas_homes/leadAlgoliaService'
import google from '/icons/canvas_homes/google.svg'
import linkedin from '/icons/canvas_homes/linkedin.svg'
import instagram from '/icons/canvas_homes/instagram.svg'
import facebook from '/icons/canvas_homes/facebook.svg'
import meta from '/icons/canvas_homes/meta.svg'
import AddLeadModal from '../../../components/canvas_homes/AddLeadModal'
import { useNavigate } from 'react-router-dom'
import potentialIcon from '/icons/canvas_homes/potential-bulb.svg'
import hotIcon from '/icons/canvas_homes/hoticon.svg'
import superHotIcon from '/icons/canvas_homes/super-hot.svg'
import coldIcon from '/icons/canvas_homes/coldicon.svg'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'
import ASLCRenderer from '../../../components/canvas_homes/ASLCRenderer'
import { toast } from 'react-toastify'
import { getUnixDateTime } from '../../../components/helper/getUnixDateTime'
import useAuth from '../../../hooks/useAuth'
import { enquiryService } from '../../../services/canvas_homes'
import { leadService } from '../../../services/canvas_homes'

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
            className={`px-2 py-2.5 rounded-[12px] w-full sm:w-32 h-14 border transition-colors ${
                isActive ? 'bg-[#E2F4FF] border-[#3279EA]' : 'border border-gray-200 bg-white hover:bg-gray-50'
            }`}
        >
            <div className='flex w-full items-center gap-2'>
                <span className='text-sm font-normal w-17.5 text-gray-700'>{title}</span>
                <span className={`text-lg font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>{count}</span>
            </div>
        </button>
    )
}

const tagStyles: Record<
    string,
    {
        icon: string
        bg: string
        text: string
    }
> = {
    potential: {
        icon: potentialIcon,
        bg: 'bg-[#DCFCE7]',
        text: 'text-[#15803D]',
    },
    hot: {
        icon: hotIcon,
        bg: 'bg-[#FFEDD5]',
        text: 'text-[#9A3412]',
    },
    superhot: {
        icon: superHotIcon,
        bg: 'bg-[#FECACA]',
        text: 'text-[#991B1B]',
    },
    cold: {
        icon: coldIcon,
        bg: 'bg-[#DBEAFE]',
        text: 'text-[#1D4ED8]',
    },
}

const Leads = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    // Initialize state from URL params
    const [activeStatusCard, setActiveStatusCard] = useState('All')
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [searchValue, setSearchValue] = useState('')
    const [selectedDateRange, setSelectedDateRange] = useState('')

    // Separate state for date range picker (not applied until user confirms)
    const [pendingDateRange, setPendingDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
        startDate: null,
        endDate: null,
    })

    const [customDateRange, setCustomDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
        startDate: null,
        endDate: null,
    })

    const [selectedProperty, setSelectedProperty] = useState('')
    const [selectedAgent, setSelectedAgent] = useState('')
    const [selectedSource, setSelectedSource] = useState('')
    const [selectedLeadStage, setSelectedLeadStage] = useState('')
    const [selectedTag, setSelectedTag] = useState('')
    const [selectedTask, setSelectedTask] = useState('')
    const [selectedLeadStatus, setSelectedLeadStatus] = useState('')
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false)
    // const [junkTab,setjunkTab]= useState(false)

    // Store initial facets to prevent filter options from changing
    const [initialFacets, setInitialFacets] = useState<Record<string, Record<string, number>>>({})
    const [allLeadsData, setAllLeadsData] = useState<any[]>([])
    const [filteredLeadsData, setFilteredLeadsData] = useState<any[]>([])
    const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})

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
            status: activeStatusCard !== 'All' ? activeStatusCard : null,
            search: searchValue || null,
            dateRange: selectedDateRange || null,
            startDate: customDateRange.startDate,
            endDate: customDateRange.endDate,
            property: selectedProperty || null,
            agent: selectedAgent || null,
            source: selectedSource || null,
            leadStage: selectedLeadStage || null,
            tag: selectedTag || null,
            task: selectedTask || null,
            leadStatus: selectedLeadStatus || null,
        })
    }, [
        activeStatusCard,
        searchValue,
        selectedDateRange,
        customDateRange,
        selectedProperty,
        selectedAgent,
        selectedSource,
        selectedLeadStage,
        selectedTag,
        selectedTask,
        selectedLeadStatus,
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
        selectedAgent && { label: toCapitalizedWords(selectedAgent), onClear: () => setSelectedAgent('') },
        selectedSource && { label: toCapitalizedWords(selectedSource), onClear: () => setSelectedSource('') },
        selectedLeadStage && { label: toCapitalizedWords(selectedLeadStage), onClear: () => setSelectedLeadStage('') },
        selectedTag && { label: toCapitalizedWords(selectedTag), onClear: () => setSelectedTag('') },
        selectedTask && { label: toCapitalizedWords(selectedTask), onClear: () => setSelectedTask('') },
        selectedLeadStatus && {
            label: toCapitalizedWords(selectedLeadStatus),
            onClear: () => setSelectedLeadStatus(''),
        },
    ].filter(Boolean)

    const debounce = useCallback(<T extends (...args: any[]) => any>(func: T, delay: number) => {
        let timeoutId: NodeJS.Timeout
        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => func(...args), delay)
        }
    }, [])

    const createFilters = useCallback((): LeadSearchFilters => {
        const filters: LeadSearchFilters = {
            propertyName: selectedProperty ? [selectedProperty] : undefined,
            agentName: selectedAgent ? [selectedAgent] : undefined,
            source: selectedSource ? [selectedSource] : undefined,
            stage: selectedLeadStage ? [selectedLeadStage] : undefined,
            tag: selectedTag ? [selectedTag] : undefined,
            taskType: selectedTask ? [selectedTask] : undefined,
            leadStatus: selectedLeadStatus ? [selectedLeadStatus] : undefined,
            dateRange: selectedDateRange || undefined,
        }

        if (customDateRange.startDate || customDateRange.endDate) {
            filters.addedRange = {
                startDate: customDateRange.startDate || undefined,
                endDate: customDateRange.endDate || undefined,
            }
        }

        return filters
    }, [
        selectedProperty,
        selectedAgent,
        selectedSource,
        selectedLeadStage,
        selectedTag,
        selectedTask,
        selectedLeadStatus,
        selectedDateRange,
        customDateRange,
    ])

    useEffect(() => {
        let filtered = allLeadsData.filter((lead) => lead.state?.toLowerCase() !== 'junk')

        if (activeStatusCard !== 'All') {
            const stateValue = activeStatusCard.toLowerCase()
            filtered = filtered.filter((lead) => lead.state?.toLowerCase() === stateValue)
        }

        setFilteredLeadsData(filtered)
    }, [allLeadsData, activeStatusCard, searchValue])

    const performSearch = useCallback(async () => {
        try {
            const filters = createFilters()
            const result = await searchLeads({
                query: searchValue,
                filters,
                page: 0,
                hitsPerPage: 1000,
            })

            setAllLeadsData(result.hits)
            setFacets(result.facets || {})

            // Store initial facets on first load to maintain consistent filter options
            if (Object.keys(initialFacets).length === 0) {
                setInitialFacets(result.facets || {})
            }
        } catch (error) {
            setAllLeadsData([])
            setFilteredLeadsData([])
        }
    }, [searchValue, createFilters, initialFacets])

    const debouncedSearch = useMemo(() => debounce(performSearch, 300), [performSearch, debounce])

    useEffect(() => {
        performSearch()
    }, [
        selectedProperty,
        selectedAgent,
        selectedSource,
        selectedLeadStage,
        selectedTag,
        selectedTask,
        selectedLeadStatus,
        selectedDateRange,
        customDateRange,
        performSearch,
    ])

    useEffect(() => {
        debouncedSearch()
    }, [searchValue, debouncedSearch])
    const statusCounts = useMemo(() => {
        const counts = {
            All: allLeadsData.filter((lead) => lead.state?.toLowerCase() !== 'junk').length,
            Fresh: 0,
            Open: 0,
            Closed: 0,
            Dropped: 0,
        }

        allLeadsData.forEach((lead) => {
            const state = lead.state?.toLowerCase() || ''
            if (state === 'fresh') counts.Fresh++
            else if (state === 'open') counts.Open++
            else if (state === 'closed') counts.Closed++
            else if (state === 'dropped') counts.Dropped++
        })

        return counts
    }, [allLeadsData])

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
        menu: 'absolute z-50 mt-1 w-fit min-w-[300px] max-h-80 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg',
        option: 'px-3 py-2 text-sm w-full text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md ',
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
                .sort(([, a], [, b]) => b - a) // Keep original sort order from initial load
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
        [initialFacets],
    )

    const handleRowSelect = (rowId: string, selected: boolean) => {
        if (selected) {
            setSelectedRows([...selectedRows, rowId])
        } else {
            setSelectedRows(selectedRows.filter((id) => id !== rowId))
        }
    }

    const handleSelectAllRows = (selected: boolean) => {
        if (selected) {
            const allLeadIds = allLeadsData.map((lead) => lead.leadId)
            setSelectedRows(allLeadIds)
        } else {
            setSelectedRows([])
        }
    }

    const handleRowClick = (row: any) => {
        navigate(`leaddetails/${row.leadId}`)
    }

    const goToJunkLeads = () => {
        // console.log("button clicked")
        navigate('junkleads')
    }

    const { user } = useAuth()

    const handleJunkSelected = async () => {
        if (!selectedRows.length) return

        const timestamp = getUnixDateTime()

        try {
            const junkPromises = selectedRows.map(async (leadId) => {
                console.log('Processing lead:', leadId)

                // Fetch enquiries for the lead
                const enquiries = await enquiryService.getByLeadId(leadId)
                if (!enquiries.length) {
                    console.warn(`No enquiries found for lead ${leadId}`)
                    return
                }

                // Pick one enquiry to update (e.g., most recent)
                const enquiry = enquiries.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0))[0]

                // Update the lead
                const updateLead = leadService.update(leadId, {
                    state: 'junk',
                    lastModified: timestamp,
                })

                // Update the enquiry
                const updateEnquiry = enquiryService.update(enquiry.enquiryId ?? '', {
                    state: 'junk',
                    lastModified: timestamp,
                })

                console.log(user)

                // Add activity
                const addActivity = enquiryService.addActivity(enquiry.enquiryId ?? '', {
                    activityType: 'status update',
                    timestamp,
                    agentName: user?.displayName || '',
                    data: {
                        newStatus: 'junk',
                    },
                })

                await Promise.all([updateLead, updateEnquiry, addActivity])
            })

            await Promise.all(junkPromises)

            toast.success('Selected leads marked as junk')
            setSelectedRows([])
        } catch (error) {
            console.error('Error junking leads:', error)
            toast.error('Failed to junk selected leads')
        }
    }

    const statusCards = [
        { title: 'All', count: statusCounts.All },
        { title: 'Fresh', count: statusCounts.Fresh },
        { title: 'Open', count: statusCounts.Open },
        { title: 'Closed', count: statusCounts.Closed },
        { title: 'Dropped', count: statusCounts.Dropped },
    ]

    const columns: TableColumn[] = [
        {
            key: 'name',
            header: 'Name',
            render: (value, row) => (
                <div className='whitespace-nowrap'>
                    <div
                        className='max-w-[100px] overflow-hidden whitespace-nowrap truncate text-sm font-semibold text-gray-900'
                        title={value || row.property || '-'} // optional: full text on hover
                    >
                        {toCapitalizedWords(value || row.name || '-')}
                    </div>
                    <div className='text-xs text-gray-500 font-normal'>
                        {row.addedDate || `Added ${new Date(row.added * 1000).toLocaleDateString()}`}
                    </div>
                </div>
            ),
        },
        {
            key: 'propertyName',
            header: 'Property',
            render: (value, row) => (
                <div
                    className='max-w-[100px] overflow-hidden whitespace-nowrap truncate text-sm font-normal text-gray-900'
                    title={value || row.property || '-'} // optional: full text on hover
                >
                    {toCapitalizedWords(value || row.property || '-')}
                </div>
            ),
        },
        {
            key: 'source',
            header: 'Source',
            render: (value) => (
                <div className='flex justify-start'>
                    <div className='inline-flex items-center min-w-max rounded-[20px] gap-[6px] h-8 px-2 whitespace-nowrap border border-gray-300 w-fit'>
                        {value === 'google' && <img src={google} alt='Google' className='w-4 h-4 object-contain' />}
                        {value === 'linkedin' && (
                            <img src={linkedin} alt='LinkedIn' className='w-4 h-4 object-contain' />
                        )}
                        {value === 'instagram' && (
                            <img src={instagram} alt='instagram' className='w-4 h-4 object-contain' />
                        )}
                        {value === 'facebook' && (
                            <img src={facebook} alt='facebook' className='w-4 h-4 object-contain' />
                        )}
                        {value === 'meta' && <img src={meta} alt='Meta' className='w-4 h-4 object-contain' />}
                        {!['Google', 'LinkedIn', 'META'].includes(value) && (
                            <span className='text-sm font-norma'>{toCapitalizedWords(value || '-')}</span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'phoneNumber',
            header: 'Contact',
            render: (value, row) => <span className='text-sm font-normal'>{value || row.contact || '-'}</span>,
        },
        {
            key: 'agentName',
            header: 'Agent',
            render: (value, row) => (
                <div
                    className='max-w-[60px] overflow-hidden whitespace-nowrap truncate text-sm font-normal text-gray-900'
                    title={value || row.property || '-'} // optional: full text on hover
                >
                    {toCapitalizedWords(value || row.agent || '-')}
                </div>
            ),
        },
        {
            key: 'stage',
            header: 'Lead Stage',
            render: (value, row) => (
                <div
                    className='max-w-[100px] overflow-hidden whitespace-nowrap truncate text-sm font-normal text-gray-900'
                    title={value || row.property || '-'} // optional: full text on hover
                >
                    {toCapitalizedWords(value || row.leadStage || '-')}
                </div>
            ),
        },
        {
            key: 'leadStatus',
            header: 'Lead Status',
            // render: (value) => <span className='text-sm text-gray-900'>{toCapitalizedWords(value || '-')}</span>,
            render: (value, row) => (
                <div
                    className='max-w-[80px] overflow-hidden whitespace-nowrap truncate text-sm font-normal text-gray-900'
                    title={value || row.property || '-'} // optional: full text on hover
                >
                    <div>{toCapitalizedWords(value || '-')}</div>
                    {row.rnr && <div>RNR {row.rnrCount}</div>}
                </div>
            ),
        },
        {
            key: 'tag',
            header: 'Tag',
            width: 'git',
            render: (value: string) => {
                const key = value?.toLowerCase().replace(/\s+/g, '')
                const style = tagStyles[key]
                const capitalizeWords = (str: string) => str.replace(/\b\w/g, (char) => char.toUpperCase())

                if (!style) return <div>-</div>

                return (
                    <div className='flex justify-start'>
                        <div
                            className={`inline-flex items-center min-w-max h-6 gap-1.5 px-2 py-1 rounded-[4px] text-xs font-medium ${style.bg} ${style.text}`}
                        >
                            <img src={style.icon} alt={value} className='w-3 h-3 object-contain' />
                            <span className='text-xs font-medium'>{capitalizeWords(value || '-')}</span>
                        </div>
                    </div>
                )
            },
        },
        {
            key: 'lastModified',
            header: 'ASLC',
            render: (_value, row) => {
                if (row.state === 'closed' || row.state === 'dropped') {
                    return <div className='text-sm text-gray-500'>-</div>
                } else {
                    return <ASLCRenderer lead={row} />
                }
            },
        },

        {
            key: 'taskType',
            header: 'Schedule Task',
            render: (value, row) => {
                if (!row.scheduledDate) {
                    return <div className='text-sm text-gray-500'>-</div>
                }

                const taskType = toCapitalizedWords(value || row?.taskType || '-')
                const scheduleUnix = row?.scheduledDate

                const formattedDate = scheduleUnix
                    ? new Date(scheduleUnix * 1000).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                      })
                    : ''

                const formattedTime = scheduleUnix
                    ? new Date(scheduleUnix * 1000).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                      })
                    : ''

                return (
                    <div className='flex flex-col -mx-4 w-fit'>
                        <div className='text-sm font-medium text-gray-900 '>{taskType}</div>
                        {(formattedDate || formattedTime) && (
                            <div className='text-xs text-gray-500'>
                                {formattedDate}
                                {formattedDate && formattedTime ? ' | ' : ''}
                                {formattedTime}
                            </div>
                        )}
                    </div>
                )
            },
        },
    ]

    return (
        <>
            <div className='p-3 pb-0 h-full'>
                {/* Search and Filters */}
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
                        placeholder='Search name and number'
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
                        options={generateDropdownOptions('propertyName', 'Property')}
                        onSelect={setSelectedProperty}
                        defaultValue={selectedProperty}
                        value={selectedProperty}
                        forcePlaceholderAlways
                        placeholder='Property'
                        className={dropdownClasses.container}
                        triggerClassName={dropdownClasses.trigger(!!selectedProperty)}
                        menuClassName={dropdownClasses.menu}
                        optionClassName={dropdownClasses.option}
                    />
                    <Dropdown
                        options={generateDropdownOptions('agentName', 'Agent')}
                        onSelect={setSelectedAgent}
                        defaultValue={selectedAgent}
                        value={selectedAgent}
                        forcePlaceholderAlways
                        placeholder='Agent'
                        className={dropdownClasses.container}
                        triggerClassName={dropdownClasses.trigger(!!selectedAgent)}
                        menuClassName={dropdownClasses.menu}
                        optionClassName={dropdownClasses.option}
                    />

                    <Dropdown
                        options={generateDropdownOptions('stage', 'Lead Stage')}
                        onSelect={setSelectedLeadStage}
                        defaultValue={selectedLeadStage}
                        value={selectedLeadStage}
                        forcePlaceholderAlways
                        placeholder='Lead Stage'
                        className={dropdownClasses.container}
                        triggerClassName={dropdownClasses.trigger(!!selectedLeadStage)}
                        menuClassName={dropdownClasses.menu}
                        optionClassName={dropdownClasses.option}
                    />
                    <Dropdown
                        options={generateDropdownOptions('tag', 'Tag')}
                        onSelect={setSelectedTag}
                        defaultValue={selectedTag}
                        value={selectedTag}
                        forcePlaceholderAlways
                        placeholder='Tag'
                        className={dropdownClasses.container}
                        triggerClassName={dropdownClasses.trigger(!!selectedTag)}
                        menuClassName={dropdownClasses.menu}
                        optionClassName={dropdownClasses.option}
                    />
                    <Dropdown
                        options={generateDropdownOptions('taskType', 'Task')}
                        onSelect={setSelectedTask}
                        defaultValue={selectedTask}
                        value={selectedTask}
                        forcePlaceholderAlways
                        placeholder='Task'
                        className={dropdownClasses.container}
                        triggerClassName={dropdownClasses.trigger(!!selectedTask)}
                        menuClassName={dropdownClasses.menu}
                        optionClassName={dropdownClasses.option}
                    />
                    <Dropdown
                        options={generateDropdownOptions('leadStatus', 'Lead Status')}
                        onSelect={setSelectedLeadStatus}
                        defaultValue={selectedLeadStatus}
                        value={selectedLeadStatus}
                        forcePlaceholderAlways
                        placeholder='Lead Status'
                        className={dropdownClasses.container}
                        triggerClassName={dropdownClasses.trigger(!!selectedLeadStatus)}
                        menuClassName={dropdownClasses.menu}
                        optionClassName={dropdownClasses.option}
                    />
                    <Dropdown
                        options={generateDropdownOptions('source', 'Source')}
                        onSelect={setSelectedSource}
                        defaultValue={selectedSource}
                        value={selectedSource}
                        forcePlaceholderAlways
                        placeholder='Source'
                        className={dropdownClasses.container}
                        triggerClassName={dropdownClasses.trigger(!!selectedSource)}
                        menuClassName={dropdownClasses.menu}
                        optionClassName={dropdownClasses.option}
                    />
                </div>

                {/* Status Cards */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
                    <div className='grid grid-cols-2 gap-2 sm:flex sm:flex-wrap md:flex-nowrap'>
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
                    <div className='flex flex-row gap-4.5'>
                        <Button
                            bgColor='bg-gray-200'
                            textColor='text-gray-700'
                            className='p-2 w-full sm:w-fit h-8 font-[10px] hover:bg-gray-300'
                            onClick={goToJunkLeads}
                        >
                            <span>View Junk</span>
                        </Button>
                        <Button
                            bgColor='bg-blue-600'
                            textColor='text-white'
                            className='p-2 w-full sm:w-fit h-8 font-[10px] hover:bg-blue-700'
                            onClick={() => setIsAddLeadModalOpen(true)}
                        >
                            <span>+ Add Lead</span>
                        </Button>
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
                                setSelectedAgent('')
                                setSelectedSource('')
                                setSelectedLeadStage('')
                                setSelectedTag('')
                                setSelectedTask('')
                                setSelectedLeadStatus('')
                            }}
                            className='ml-4 text-xs bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-1.5 px-4 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer'
                        >
                            Clear All
                        </button>
                    </div>
                )}

                {/* Table */}
                <div
                    className='bg-white rounded-lg shadow-sm overflow-hidden'
                    style={{
                        height: `${activeFilters.length > 0 ? 57 : 63}vh`, // You can adjust these values
                    }}
                >
                    <FlexibleTable
                        showCheckboxes={true}
                        data={filteredLeadsData}
                        columns={columns}
                        borders={{ table: false, header: true, rows: true, cells: false, outer: true }}
                        selectedRows={selectedRows}
                        headerClassName='font-normal text-left px-1'
                        cellClassName='text-left px-1'
                        onRowSelect={handleRowSelect}
                        onRowClick={handleRowClick}
                        onSelectAll={handleSelectAllRows}
                        className='rounded-lg overflow-x-hidden'
                        stickyHeader={true}
                        hoverable={true}
                        maxHeight={`${activeFilters.length > 0 ? 55 : 63}vh`}
                    />
                </div>
                <AddLeadModal isOpen={isAddLeadModalOpen} onClose={() => setIsAddLeadModalOpen(false)} />
            </div>
            {selectedRows.length > 0 && (
                <div className='fixed bottom-0 w-[86%] bg-gray-200 border-t border-gray-300 shadow-md p-4 flex justify-between items-center z-50'>
                    <span className='text-sm text-gray-700'>{selectedRows.length} selected</span>
                    <button
                        className='bg-gray-500 text-white text-sm px-4 py-2 rounded hover:bg-gray-700'
                        onClick={handleJunkSelected}
                    >
                        Move to Junk
                    </button>
                </div>
            )}
        </>
    )
}

export default Leads
