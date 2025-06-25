import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import DateRangePicker from '../../../components/design-elements/DateRangePicker'
import { searchTasks, type TaskSearchFilters } from '../../../services/canvas_homes/taskAlgoliaService'
import potentialIcon from '/icons/canvas_homes/potential-bulb.svg'
import hotIcon from '/icons/canvas_homes/hoticon.svg'
import superHotIcon from '/icons/canvas_homes/super-hot.svg'
import coldIcon from '/icons/canvas_homes/coldicon.svg'
import { useNavigate } from 'react-router-dom'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'

// Task data type
type SalesTask = {
    taskId: string
    enquiryId: string
    agentId: string
    agentName: string
    name: string
    leadAddDate: number
    propertyName: string
    taskType: 'lead registration' | 'initial contact' | 'site visit' | 'eoi collection' | 'booking' | string
    eventName?: string
    status: 'open' | 'complete'
    stage: string
    leadStatus: string
    tag: string
    scheduledDate: number
    added: number
    eoiEntries?: any
    completionDate?: number
    lastModified: number
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

const Tasks = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    // Initialize state from URL params
    const [activeStatusCard, setActiveStatusCard] = useState('All')
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [searchValue, setSearchValue] = useState('')
    const [selectedDateRange, setSelectedDateRange] = useState('')
    const [selectedProperty, setSelectedProperty] = useState('')
    const [selectedLeadStage, setSelectedLeadStage] = useState('')
    const [selectedTask, setSelectedTask] = useState('')
    const [selectedTag, setSelectedTag] = useState('')
    const [selectedLeadStatus, setSelectedLeadStatus] = useState('')
    const [selectedAgent, setSelectedAgent] = useState('')

    // Separate state for date range picker (not applied until user confirms)
    const [pendingDateRange, setPendingDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
        startDate: null,
        endDate: null,
    })

    const [customDateRange, setCustomDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
        startDate: null,
        endDate: null,
    })

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
        selectedLeadStage,
        selectedTag,
        selectedTask,
        selectedLeadStatus,
        updateURL,
    ])

    // Active filters array
    const activeFilters = [
        selectedDateRange && { label: selectedDateRange, onClear: () => setSelectedDateRange('') },
        customDateRange.startDate &&
            customDateRange.endDate && {
                label: `${customDateRange.startDate} to ${customDateRange.endDate}`,
                onClear: () => setCustomDateRange({ startDate: null, endDate: null }),
            },
        selectedProperty && { label: toCapitalizedWords(selectedProperty), onClear: () => setSelectedProperty('') },
        selectedAgent && { label: toCapitalizedWords(selectedAgent), onClear: () => setSelectedAgent('') },
        selectedLeadStage && { label: toCapitalizedWords(selectedLeadStage), onClear: () => setSelectedLeadStage('') },
        selectedTag && { label: toCapitalizedWords(selectedTag), onClear: () => setSelectedTag('') },
        selectedTask && { label: toCapitalizedWords(selectedTask), onClear: () => setSelectedTask('') },
        selectedLeadStatus && {
            label: toCapitalizedWords(selectedLeadStatus),
            onClear: () => setSelectedLeadStatus(''),
        },
    ].filter(Boolean)

    // Task data state
    const [allTasksData, setAllTasksData] = useState<SalesTask[]>([])
    const [filteredTasksData, setFilteredTasksData] = useState<SalesTask[]>([])
    const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})
    const [initialFacets, setInitialFacets] = useState<Record<string, Record<string, number>>>({})
    const [loading, setLoading] = useState(false)

    const debounce = useCallback(<T extends (...args: any[]) => any>(func: T, delay: number) => {
        let timeoutId: NodeJS.Timeout
        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => func(...args), delay)
        }
    }, [])

    // Create filters object for tasks
    const createTaskFilters = useCallback((): TaskSearchFilters => {
        const filters: TaskSearchFilters = {
            propertyName: selectedProperty ? [selectedProperty] : undefined,
            agentName: selectedAgent ? [selectedAgent] : undefined,
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
        selectedLeadStage,
        selectedTag,
        selectedTask,
        selectedLeadStatus,
        selectedDateRange,
        customDateRange,
    ])

    // Task search function
    const performSearch = useCallback(async () => {
        try {
            setLoading(true)
            const filters = createTaskFilters()
            console.log('Searching with filters:', filters)

            const result = await searchTasks({
                query: searchValue,
                filters,
                page: 0,
                hitsPerPage: 1000,
            })

            console.log('Search result:', result)

            const transformedData = result.hits.map((task: any) => ({
                ...task,
                dueDays: calculateDueDays(task.scheduledDate),
            }))

            setAllTasksData(transformedData)
            setFacets(result.facets || {})

            // Store initial facets on first load to maintain consistent filter options
            if (Object.keys(initialFacets).length === 0) {
                setInitialFacets(result.facets || {})
            }
        } catch (error) {
            console.error('Search error:', error)
            setAllTasksData([])
            setFilteredTasksData([])
        } finally {
            setLoading(false)
        }
    }, [searchValue, createTaskFilters, initialFacets])

    const calculateDueDays = (scheduledDate: number | string | undefined): number => {
        if (!scheduledDate) return 0

        const ts = typeof scheduledDate === 'string' ? parseInt(scheduledDate) : scheduledDate
        const scheduleDate = new Date(String(ts).length === 10 ? ts * 1000 : ts)
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const diffTime = scheduleDate.getTime() - todayStart.getTime()
        return Math.floor(diffTime / (1000 * 60 * 60 * 24))
    }

    // Filter tasks based on status card selection
    useEffect(() => {
        if (activeStatusCard === 'All') {
            const sorted = [...allTasksData].sort((a, b) => b.added - a.added)
            setFilteredTasksData(sorted)
        } else if (activeStatusCard === 'Upcoming') {
            const upcomingTasks = allTasksData
                .filter((task) => {
                    const dueDays = calculateDueDays(task.scheduledDate)
                    return dueDays >= 0 && !task?.completionDate
                })
                .sort((a, b) => a.scheduledDate - b.scheduledDate)
            setFilteredTasksData(upcomingTasks)
        } else if (activeStatusCard === 'Missed') {
            const missedTasks = allTasksData
                .filter((task) => {
                    const dueDays = calculateDueDays(task.scheduledDate)

                    return dueDays < 0 && !task?.completionDate
                })
                .sort((a, b) => b.scheduledDate - a.scheduledDate)
            setFilteredTasksData(missedTasks)
        }
    }, [allTasksData, activeStatusCard])

    // Debounced search for tasks
    const debouncedSearch = useMemo(() => debounce(performSearch, 300), [performSearch, debounce])

    // Search on filter changes (immediate)
    useEffect(() => {
        performSearch()
    }, [
        selectedProperty,
        selectedAgent,
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

    // Calculate the status counts manually
    const statusCounts = useMemo(() => {
        const counts = {
            All: allTasksData.length,
            Upcoming: 0,
            Missed: 0,
        }

        allTasksData.forEach((task) => {
            const dueDays = calculateDueDays(task.scheduledDate)
            if (dueDays < 0 && !task?.completionDate) {
                counts.Missed++
            } else if (!task?.completionDate) {
                counts.Upcoming++
            }
        })

        return counts
    }, [allTasksData])

    // Handle row selection
    const handleRowSelect = (rowId: string, selected: boolean) => {
        if (selected) {
            setSelectedRows([...selectedRows, rowId])
        } else {
            setSelectedRows(selectedRows.filter((id) => id !== rowId))
        }
    }

    // Modified date range handler - doesn't apply immediately
    const handleDateRangeChange = useCallback((startDate: string | null, endDate: string | null) => {
        setPendingDateRange({ startDate, endDate })
    }, [])

    // Apply pending date range
    const applyDateRange = useCallback(() => {
        setCustomDateRange(pendingDateRange)
        if (pendingDateRange.startDate || pendingDateRange.endDate) {
            setSelectedDateRange('')
        }
    }, [pendingDateRange])

    // Cancel pending date range
    const cancelDateRange = useCallback(() => {
        setPendingDateRange(customDateRange)
    }, [customDateRange])

    // Define reusable dropdown CSS classes (same as Leads component)
    const dropdownClasses = {
        container: 'relative inline-block w-full sm:w-auto',
        trigger: (isSelected: boolean) =>
            `flex items-center justify-between p-2 h-7 border rounded-sm bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none min-w-[100px] w-full sm:w-auto cursor-pointer ${isSelected ? 'border-black' : 'border-gray-300'}`,
        menu: 'absolute z-50 mt-1 w-fit min-w-[300px] bg-white border border-gray-300 rounded-md shadow-lg',
        option: 'px-3 py-2 text-sm w-full text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md',
    }

    // Handle row click
    const handleRowClick = (row: any) => {
        console.log('Row clicked:', row)
        if (row.leadId || row.id) {
            navigate(`/canvas-homes/sales/leaddetails/${row.leadId || row.id}`)
        }
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

    // Status cards data with dynamic counts
    const statusCards = [
        { title: 'All', count: statusCounts.All },
        { title: 'Upcoming', count: statusCounts.Upcoming },
        { title: 'Missed', count: statusCounts.Missed },
    ]

    // Keep initial facet options and order, only update counts
    const generateDropdownOptions = useCallback(
        (facetKey: string) => {
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
        [initialFacets, facets],
    )

    // Helper function to get task status badge color
    const getTaskStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'complete':
                return 'bg-[#E1F6DF] font-medium'
            case 'open':
                return 'bg-[#DADAE2] font-medium'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    // Table columns
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
                        {`Created ${new Date(row.added * 1000).toLocaleDateString()}`}
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
            key: 'leadStatus',
            header: 'Lead Status',
            // render: (value) => <span className='text-sm text-gray-900'>{toCapitalizedWords(value || '-')}</span>,
            render: (value, row) => (
                <div
                    className='max-w-[60px] overflow-hidden whitespace-nowrap truncate text-sm font-normal text-gray-900'
                    title={value || row.property || '-'} // optional: full text on hover
                >
                    {toCapitalizedWords(value || '-')}
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
            key: 'tag',
            header: 'Tag',
            width: 'fit',
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
            key: 'taskType',
            header: 'Schedule Task',
            render: (value, row) => {
                if (row?.completionDate && row?.completionDate < row?.scheduledDate) {
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
                    <div className='flex flex-col'>
                        <div className='text-sm font-medium text-gray-900'>{taskType}</div>
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
        {
            key: 'dueDays',
            header: activeStatusCard === 'Missed' ? 'Delayed Days' : 'Due Days',
            render: (value) => {
                const absValue = Math.abs(value)
                const displayValue = absValue < 10 ? `0${absValue}` : `${absValue}`

                return (
                    <span className={`text-sm max-w-[97px] font-medium ${value < 0 ? 'text-red-500' : 'text-black'}`}>
                        {value === 0 ? '00' : displayValue}
                    </span>
                )
            },
        },
        {
            key: 'status',
            header: 'Task Status',
            render: (value) => (
                <div
                    className={`p-2 rounded-sm h-7 w-22.5 text-xs text-center font-medium ${getTaskStatusColor(value)}`}
                >
                    {toCapitalizedWords(value) || '-'}
                </div>
            ),
        },
        {
            key: 'completionDate',
            header: 'Completion Date',
            render: (value, row) => {
                const rawDate = value || row.completionDate

                if (!rawDate || rawDate === '-') {
                    return <span className='text-[14px] text-gray-900'>-</span>
                }

                const formattedDate = new Date(rawDate * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                })

                const formattedTime = new Date(rawDate * 1000).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                })

                return (
                    <div className='flex flex-col'>
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
        <div className='w-full p-3 pb-0'>
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
                    className='h-7 w-full sm:w-68 bg-gray-300 '
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
                    options={generateDropdownOptions('propertyName')}
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
                    options={generateDropdownOptions('stage')}
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
                    options={generateDropdownOptions('taskType')}
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
                    options={generateDropdownOptions('tag')}
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
                    options={generateDropdownOptions('leadStatus')}
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
                    options={generateDropdownOptions('agentName')}
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
            </div>

            {/* Status Cards */}
            <div className='flex items-center justify-between mb-4'>
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
                {loading ? (
                    <div className='flex items-center justify-center h-full'>
                        <div className='text-gray-500'>Loading...</div>
                    </div>
                ) : (
                    <FlexibleTable
                        data={filteredTasksData}
                        columns={columns}
                        borders={{ table: false, header: true, rows: true, cells: false, outer: true }}
                        selectedRows={selectedRows}
                        headerClassName='font-normal text-left px-1'
                        cellClassName='text-left px-1'
                        onRowSelect={handleRowSelect}
                        className='rounded-lg overflow-x-hidden'
                        stickyHeader={true}
                        hoverable={true}
                        maxHeight={`${activeFilters.length > 0 ? 55 : 63}vh`}
                        showCheckboxes={true}
                        onRowClick={handleRowClick}
                    />
                )}
            </div>
        </div>
    )
}

export default Tasks
