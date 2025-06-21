import { useState, useMemo, useEffect, useCallback } from 'react'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import DateRangePicker from '../../../components/design-elements/DateRangePicker'
import { searchLeads, type LeadSearchFilters } from '../../../services/canvas_homes/leadAlgoliaService'
import google from '/icons/canvas_homes/google.svg'
import hot from '/icons/canvas_homes/hoticon.svg'
import linkedin from '/icons/canvas_homes/linkedin.svg'
import meta from '/icons/canvas_homes/meta.svg'
import AddLeadModal from '../../../components/canvas_homes/AddLeadModal'
import { useNavigate } from 'react-router-dom'
import { getUnixDateTime } from '../../../components/helper/getUnixDateTime'
import potentialIcon from '/icons/canvas_homes/potential-bulb.svg'
import hotIcon from '/icons/canvas_homes/hoticon.svg'
import superHotIcon from '/icons/canvas_homes/super-hot.svg'
import coldIcon from '/icons/canvas_homes/coldicon.svg'

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
                <span className={`text-lg font-semibold font-normal ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {count}
                </span>
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
        icon: potentialIcon, // e.g. /icons/potential.svg
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
    const [activeStatusCard, setActiveStatusCard] = useState('All')
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [searchValue, setSearchValue] = useState('')
    const [selectedDateRange, setSelectedDateRange] = useState('')
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
    const navigate = useNavigate()
    const activeFilters = [
        selectedDateRange && { label: selectedDateRange, onClear: () => setSelectedDateRange('') },
        customDateRange.startDate &&
            customDateRange.endDate && {
                label: `${customDateRange.startDate} to ${customDateRange.endDate}`,
                onClear: () => setCustomDateRange({ startDate: null, endDate: null }),
            },
        selectedProperty && { label: selectedProperty, onClear: () => setSelectedProperty('') },
        selectedAgent && { label: selectedAgent, onClear: () => setSelectedAgent('') },
        selectedSource && { label: selectedSource, onClear: () => setSelectedSource('') },
        selectedLeadStage && { label: selectedLeadStage, onClear: () => setSelectedLeadStage('') },
        selectedTag && { label: selectedTag, onClear: () => setSelectedTag('') },
        selectedTask && { label: selectedTask, onClear: () => setSelectedTask('') },
        selectedLeadStatus && { label: selectedLeadStatus, onClear: () => setSelectedLeadStatus('') },
    ].filter(Boolean) // remove falsy values

    // Algolia state
    const [allLeadsData, setAllLeadsData] = useState<any[]>([])
    const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})

    // ✅ FIXED: Properly typed debounce function
    const debounce = useCallback(<T extends (...args: any[]) => any>(func: T, delay: number) => {
        let timeoutId: NodeJS.Timeout
        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => func(...args), delay) // ✅ Use spread operator instead of .apply()
        }
    }, [])

    // Create filters object - Fixed to use actual values from dropdowns
    const createFilters = useCallback((): LeadSearchFilters => {
        const filters: LeadSearchFilters = {
            state: activeStatusCard !== 'All' ? [activeStatusCard.toLowerCase()] : undefined,
            propertyName: selectedProperty ? [selectedProperty] : undefined,
            agentName: selectedAgent ? [selectedAgent] : undefined,
            source: selectedSource ? [selectedSource] : undefined,
            stage: selectedLeadStage ? [selectedLeadStage] : undefined,
            tag: selectedTag ? [selectedTag] : undefined,
            taskType: selectedTask ? [selectedTask] : undefined,
            leadStatus: selectedLeadStatus ? [selectedLeadStatus] : undefined,
            dateRange: selectedDateRange || undefined,
        }

        // Handle custom date range from DateRangePicker
        if (customDateRange.startDate || customDateRange.endDate) {
            filters.addedRange = {
                startDate: customDateRange.startDate || undefined,
                endDate: customDateRange.endDate || undefined,
            }
        }

        return filters
    }, [
        activeStatusCard,
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

    // Search function - Added debugging
    const performSearch = useCallback(async () => {
        try {
            const filters = createFilters()
            console.log('Searching with filters:', filters) // Debug log

            const result = await searchLeads({
                query: searchValue,
                filters,
                page: 0,
                hitsPerPage: 1000, // Get all results for now
            })

            console.log('Search result:', result) // Debug log
            setAllLeadsData(result.hits)
            setFacets(result.facets || {})
        } catch (error) {
            console.error('Search error:', error)
            setAllLeadsData([])
        }
    }, [searchValue, createFilters])

    // Debounced search for text input
    const debouncedSearch = useMemo(() => debounce(performSearch, 300), [performSearch, debounce])

    // Search on filter changes (immediate)
    useEffect(() => {
        performSearch()
    }, [
        activeStatusCard,
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

    // Search on text input change (debounced)
    useEffect(() => {
        debouncedSearch()
    }, [searchValue, debouncedSearch])

    // Initial search
    useEffect(() => {
        performSearch()
    }, [])

    // Filter data based on active status card and other filters (keep existing logic)
    const filteredLeadsData = useMemo(() => {
        let filtered = allLeadsData

        // Apply additional client-side search filter if needed
        if (searchValue) {
            filtered = filtered.filter(
                (lead) =>
                    lead.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    lead.phoneNumber?.includes(searchValue) ||
                    lead.agentName?.toLowerCase().includes(searchValue.toLowerCase()),
            )
        }

        return filtered
    }, [allLeadsData, searchValue])

    // Calculate status counts from facets - Fixed case sensitivity
    const statusCounts = useMemo(() => {
        const stateFacets = facets.state || {}
        const totalHits = allLeadsData.length

        console.log('Status facets:', stateFacets) // Debug log
        console.log('All facets:', facets) // Debug log

        return {
            All: totalHits,
            Fresh: stateFacets.fresh || 0,
            Open: stateFacets.open || 0,
            Closed: stateFacets.closed || 0,
            Dropped: stateFacets.dropped || 0,
        }
    }, [facets, allLeadsData])

    // Generate dropdown options from facets - Fixed to extract correct values
    const generateDropdownOptions = useCallback(
        (facetKey: string, defaultLabel: string, staticOptions?: any[]) => {
            if (staticOptions) return staticOptions // Use static options if provided

            const facetData = facets[facetKey] || {}
            const options = [{ label: defaultLabel, value: '' }]

            Object.entries(facetData)
                .sort(([, a], [, b]) => b - a)
                .forEach(([key, count]) => {
                    if (count > 0) {
                        options.push({
                            label: `${key} (${count})`,
                            value: key, // Use actual facet value, not transformed
                        })
                    }
                })

            return options
        },
        [facets],
    )

    // Handle date range changes from DateRangePicker
    const handleDateRangeChange = useCallback((startDate: string | null, endDate: string | null) => {
        setCustomDateRange({ startDate, endDate })
        // Clear preset selection when using custom range
        if (startDate || endDate) {
            setSelectedDateRange('')
        }
    }, [])

    const handleRowSelect = (rowId: string, selected: boolean) => {
        if (selected) {
            setSelectedRows([...selectedRows, rowId])
        } else {
            setSelectedRows(selectedRows.filter((id) => id !== rowId))
        }
    }

    const handleRowClick = (row: any) => {
        console.log('Row clicked:', row)
        window.location.href = `/sales/leaddetails/${row.objectId || row.id}`
    }

    // Status cards data with dynamic counts
    const statusCards = [
        { title: 'All', count: statusCounts.All },
        { title: 'Fresh', count: statusCounts.Fresh },
        { title: 'Open', count: statusCounts.Open },
        { title: 'Closed', count: statusCounts.Closed },
        { title: 'Dropped', count: statusCounts.Dropped },
    ]

    const capitalizeFirst = (text: string) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '')

    // Table columns (updated field names to match Algolia data)
    const columns: TableColumn[] = [
        {
            key: 'name',
            header: 'Name',
            render: (value, row) => (
                <div className='whitespace-nowrap' onClick={() => navigate(`leaddetails/${row.leadId}`)}>
                    <div
                        className='max-w-[100px] overflow-hidden whitespace-nowrap text-ellipsis text-sm font-semibold text-gray-900'
                        title={value || row.property || '-'} // optional: full text on hover
                    >
                        {capitalizeFirst(value || row.name || '-')}
                    </div>
                    <div className='text-xs text-gray-500 font-normal'>
                        {row.addedDate || `Added ${new Date(row.added).toLocaleDateString()}`}
                    </div>
                </div>
            ),
        },
        {
            key: 'propertyName',
            header: 'Property',
            render: (value, row) => (
                <div
                    className='max-w-[100px] overflow-hidden whitespace-nowrap text-ellipsis text-sm font-normal text-gray-900'
                    onClick={() => navigate(`leaddetails/${row.leadId}`)}
                    title={value || row.property || '-'} // optional: full text on hover
                >
                    {capitalizeFirst(value || row.property || '-')}
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
                        {value === 'meta' && <img src={meta} alt='Meta' className='w-4 h-4 object-contain' />}
                        {!['Google', 'LinkedIn', 'META'].includes(value) && (
                            <span className='text-sm font-norma'>{capitalizeFirst(value || '-')}</span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'phoneNumber',
            header: 'Contact',
            render: (value, row) => (
                <span className='text-sm font-normal' onClick={() => navigate(`leaddetails/${row.leadId}`)}>
                    {value || row.contact || '-'}
                </span>
            ),
        },
        {
            key: 'agentName',
            header: 'Agent',
            render: (value, row) => (
                <div
                    className='max-w-[60px] overflow-hidden whitespace-nowrap text-ellipsis text-sm font-normal text-gray-900'
                    onClick={() => navigate(`leaddetails/${row.leadId}`)}
                    title={value || row.property || '-'} // optional: full text on hover
                >
                    {capitalizeFirst(value || row.agent || '-')}
                </div>
            ),
        },
        {
            key: 'stage',
            header: 'Lead Stage',
            render: (value, row) => (
                <div
                    className='max-w-[100px] overflow-hidden whitespace-nowrap text-ellipsis text-sm font-normal text-gray-900'
                    onClick={() => navigate(`leaddetails/${row.leadId}`)}
                    title={value || row.property || '-'} // optional: full text on hover
                >
                    {capitalizeFirst(value || row.leadStage || '-')}
                </div>
            ),
        },
        {
            key: 'leadStatus',
            header: 'Lead Status',
            render: (value) => <span className='text-sm text-gray-900'>{capitalizeFirst(value || '-')}</span>,
        },
        {
            key: 'tag',
            header: 'Tag',
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
            render: (value, row) => {
                const lastModified = row.lastModified
                const today = Math.floor(Date.now() / 1000) // in seconds

                let daysDifference = 0
                if (lastModified) {
                    daysDifference = Math.floor((today - lastModified) / (60 * 60 * 24))
                }

                return (
                    <span
                        className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800'
                        onClick={() => navigate(`leaddetails/${row.leadId}`)}
                    >
                        {daysDifference || 0} days
                    </span>
                )
            },
        },
        {
            key: 'taskType',
            header: 'Schedule Task',
            render: (value, row) => {
                const taskType = capitalizeFirst(value || row?.taskType || '-')
                const scheduleUnix = row.scheduledDate || row.scheduleTask?.date

                let date = ''
                if (scheduleUnix) {
                    const ts = typeof scheduleUnix === 'string' ? parseInt(scheduleUnix) : scheduleUnix
                    if (!isNaN(ts)) date = new Date(ts * 1000).toLocaleDateString()
                }

                const time = row.scheduleTask?.time || ''

                return (
                    <div className='flex items-center gap-3' onClick={() => navigate(`leaddetails/${row.leadId}`)}>
                        <div>
                            <div className='text-sm font-medium text-gray-900'>{taskType}</div>
                            <div className='text-xs text-gray-500'>
                                {date || time ? (
                                    <>
                                        {date
                                            ? new Date(date).toLocaleDateString('en-US', {
                                                  year: 'numeric',
                                                  month: 'short',
                                                  day: 'numeric',
                                              })
                                            : ''}
                                        {date && time ? ' | ' : ''}
                                        {time || ''}
                                    </>
                                ) : (
                                    ''
                                )}
                            </div>
                        </div>
                    </div>
                )
            },
        },
    ]

    return (
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
                    className='h-7 w-full sm:w-68 bg-gray-300'
                />

                <DateRangePicker
                    onDateRangeChange={handleDateRangeChange}
                    placeholder='Date Range'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName='w-[130px] flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer truncate'
                    menuClassName='absolute z-50 mt-1 w-full min-w-[160px] bg-white border border-gray-300 rounded-md shadow-lg'
                />

                <Dropdown
                    options={generateDropdownOptions('propertyName', 'Property')}
                    onSelect={setSelectedProperty}
                    defaultValue={selectedProperty}
                    value={selectedProperty}
                    forcePlaceholderAlways
                    placeholder='Property'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName={`flex items-center justify-between p-2 h-7 border rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer
    ${selectedProperty ? 'border-black' : 'border-gray-300'}`}
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('agentName', 'Agent')}
                    onSelect={setSelectedAgent}
                    defaultValue={selectedAgent}
                    value={selectedAgent}
                    forcePlaceholderAlways
                    placeholder='Agent'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName={`flex items-center justify-between p-2 h-7 border rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer
    ${selectedAgent ? 'border-black' : 'border-gray-300'}`}
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('source', 'Source')}
                    onSelect={setSelectedSource}
                    defaultValue={selectedSource}
                    value={selectedSource}
                    forcePlaceholderAlways
                    placeholder='Source'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName={`flex items-center justify-between p-2 h-7 border rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer
    ${selectedSource ? 'border-black' : 'border-gray-300'}`}
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('stage', 'Lead Stage')}
                    onSelect={setSelectedLeadStage}
                    defaultValue={selectedLeadStage}
                    value={selectedLeadStage}
                    forcePlaceholderAlways
                    placeholder='Lead Stage'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName={`flex items-center justify-between p-2 h-7 border rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer
    ${selectedLeadStage ? 'border-black' : 'border-gray-300'}`}
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('tag', 'Tag')}
                    onSelect={setSelectedTag}
                    defaultValue={selectedTag}
                    value={selectedTag}
                    forcePlaceholderAlways
                    placeholder='Tag'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName={`flex items-center justify-between p-2 h-7 border rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer
    ${selectedTag ? 'border-black' : 'border-gray-300'}`}
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('taskType', 'Task')}
                    onSelect={setSelectedTask}
                    defaultValue={selectedTask}
                    value={selectedTask}
                    forcePlaceholderAlways
                    placeholder='Task'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName={`flex items-center justify-between p-2 h-7 border rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer
    ${selectedTask ? 'border-black' : 'border-gray-300'}`}
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('leadStatus', 'Lead Status')}
                    onSelect={setSelectedLeadStatus}
                    defaultValue={selectedLeadStatus}
                    value={selectedLeadStatus}
                    forcePlaceholderAlways
                    placeholder='Lead Status'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName={`flex items-center justify-between p-2 h-7 border rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer
    ${selectedLeadStatus ? 'border-black' : 'border-gray-300'}`}
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />
            </div>

            {/* Status Cards */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
                <div className='grid grid-cols-2 sm:flex sm:gap-2'>
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
                    className='p-2 w-full sm:w-fit h-8 font-[10px] hover:bg-blue-700'
                    onClick={() => setIsAddLeadModalOpen(true)}
                >
                    <span>+ Add Lead</span>
                </Button>
            </div>
            {activeFilters.length > 0 && (
                <div className='flex flex-wrap items-center gap-2 mb-4'>
                    {activeFilters.map((filter, index) =>
                        filter ? (
                            <div
                                key={index}
                                className='flex items-center bg-gray-100 text-xs font-medium text-gray-700 px-3 py-1.5 rounded-full'
                            >
                                {filter.label}
                                <button
                                    onClick={filter.onClear}
                                    className='ml-2 text-gray-500 hover:text-red-500 focus:outline-none'
                                >
                                    ✕
                                </button>
                            </div>
                        ) : null,
                    )}

                    <button
                        onClick={() => {
                            setSelectedDateRange('')
                            setCustomDateRange({ startDate: null, endDate: null })
                            setSelectedProperty('')
                            setSelectedAgent('')
                            setSelectedSource('')
                            setSelectedLeadStage('')
                            setSelectedTag('')
                            setSelectedTask('')
                            setSelectedLeadStatus('')
                        }}
                        className='text-xs bg-red-100 ml-2 p-1.5 rounded-full text-red-600 focus:outline-none cursor-pointer'
                    >
                        Clear All
                    </button>
                </div>
            )}

            {/* Table */}
            <div className='bg-white rounded-lg shadow-sm overflow-hidden h-[63vh]'>
                <FlexibleTable
                    showCheckboxes={true}
                    data={filteredLeadsData}
                    columns={columns}
                    borders={{ table: false, header: true, rows: true, cells: false, outer: true }}
                    selectedRows={selectedRows}
                    headerClassName='font-normal text-left'
                    cellClassName='text-left'
                    onRowSelect={handleRowSelect}
                    // onRowClick={handleRowClick}
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
