import { useState, useMemo, useEffect, useCallback } from 'react'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import DateRangePicker from '../../../components/design-elements/DateRangePicker'
import { searchTasks, type TaskSearchFilters } from '../../../services/canvas_homes/taskAlgoliaService'
import google from '/icons/canvas_homes/google.svg'
import hot from '/icons/canvas_homes/hoticon.svg'
import linkedin from '/icons/canvas_homes/linkedin.svg'
import meta from '/icons/canvas_homes/meta.svg'
import { useNavigate } from 'react-router-dom'

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
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false)
    const navigate = useNavigate()

    // Task data state
    const [allTasksData, setAllTasksData] = useState<any[]>([])
    const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})

    // ✅ FIXED: Properly typed debounce function
    const debounce = useCallback(<T extends (...args: any[]) => any>(func: T, delay: number) => {
        let timeoutId: NodeJS.Timeout
        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => func(...args), delay) // ✅ Use spread operator instead of .apply()
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

        return filters
    }, [
        selectedProperty,
        selectedAgent,
        selectedLeadStage,
        selectedTag,
        selectedTask,
        selectedLeadStatus,
        selectedDateRange,
    ])

    // Task search function
    const performSearch = useCallback(async () => {
        try {
            const filters = createTaskFilters()
            console.log('Searching with filters:', filters) // Debug log

            // Mock the search function to set allTasksData
            // You would replace this with the actual Algolia search.
            const result = await searchTasks({
                query: searchValue,
                filters,
                page: 0,
                hitsPerPage: 1000, // Get all results for now
            })

            console.log('Search result:', result) // Debug log
            setAllTasksData(result.hits)
            setFacets(result.facets || {})
        } catch (error) {
            console.error('Search error:', error)
            setAllTasksData([]) // Reset data on error
        }
    }, [searchValue, createTaskFilters])

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
    ])

    // Search on text input change (debounced)
    useEffect(() => {
        debouncedSearch()
    }, [searchValue, debouncedSearch])

    // Calculate the status counts manually (e.g., "Fresh", "Open", "Closed")
    const statusCounts = useMemo(() => {
        const counts = {
            All: allTasksData.length,
            Upcoming: 0,
            Missed: 0,
        }

        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        allTasksData.forEach((task) => {
            const rawDate = task.scheduledDate || task.scheduleTask?.date
            if (!rawDate) return

            const ts = typeof rawDate === 'string' ? parseInt(rawDate) : rawDate
            const scheduleDate = new Date(String(ts).length === 10 ? ts * 1000 : ts)

            const diff = scheduleDate.getTime() - todayStart.getTime()
            const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

            if (diffDays < 0) {
                counts.Missed++
            } else {
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

    const handleDateRangeChange = useCallback((startDate: string | null, endDate: string | null) => {
        setCustomDateRange({ startDate, endDate })
        // Clear preset selection when using custom range
        if (startDate || endDate) {
            setSelectedDateRange('')
        }
    }, [])

    // Handle row click
    const handleRowClick = (row: any) => {
        console.log('Row clicked:', row)
        window.location.href = `/sales/taskdetails/${row.leadId || row.id}`
    }

    // Status cards data with dynamic counts
    const statusCards = [
        { title: 'All', count: statusCounts.All },
        { title: 'Upcoming', count: statusCounts.Upcoming },
        { title: 'Missed', count: statusCounts.Missed },
    ]

    // Generate dropdown options dynamically from facets
    const generateDropdownOptions = (facetKey: string, defaultLabel: string) => {
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
    }
    const columns: TableColumn[] = [
        {
            key: 'name',
            header: 'Name',
            render: (value, row) => {
                const addedDate = row.added
                const formattedDate = addedDate
                    ? new Date(String(addedDate).length === 10 ? addedDate * 1000 : addedDate).toLocaleDateString()
                    : '-'

                return (
                    <div className='whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>{value || '-'}</div>
                        <div className='text-xs text-gray-500 font-normal'>{formattedDate}</div>
                    </div>
                )
            },
        },
        {
            key: 'propertyName',
            header: 'Property',
            render: (value) => <span className='text-sm font-normal text-gray-900'>{value || '-'}</span>,
        },
        {
            key: 'stage',
            header: 'Lead Stage',
            render: (value) => <span className='text-sm text-gray-900'>{value || '-'}</span>,
        },
        {
            key: 'leadStatus',
            header: 'Lead Status',
            render: (value) => <span className='text-sm text-gray-900'>{value || '-'}</span>,
        },
        {
            key: 'tag',
            header: 'Tag',
            render: (value) => (
                <div className='inline-flex items-center w-17 h-6 gap-2 px-2 py-1 rounded-[4px] text-xs font-medium bg-gray-100 text-gray-800'>
                    <img src={hot} alt='Tag' className='w-3 h-3 object-contain' />
                    <span className='text-sm font-normal'>{value || '-'}</span>
                </div>
            ),
        },
        {
            key: 'scheduleTask',
            header: 'Schedule Task',
            render: (value, row) => {
                const rawDate = value?.date
                const rawTime = value?.time || ''
                let formattedDate = '-'

                if (rawDate) {
                    const ts = typeof rawDate === 'string' ? parseInt(rawDate) : rawDate
                    if (!isNaN(ts)) {
                        formattedDate = new Date(String(ts).length === 10 ? ts * 1000 : ts).toLocaleDateString()
                    }
                }

                return (
                    <div className='flex items-center gap-3'>
                        <div>
                            <div className='text-sm font-medium text-gray-900'>{row.taskType || '-'}</div>
                            <div className='text-xs text-gray-500'>
                                {formattedDate} {rawTime ? `| ${rawTime}` : ''}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            key: 'dueDays',
            header: 'Due Days',
            render: (value, row) => {
                const scheduleDateRaw = row.scheduledDate
                const now = new Date()
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

                if (!scheduleDateRaw) {
                    return <span className='text-sm font-medium text-gray-400'>-</span>
                }

                const ts = typeof scheduleDateRaw === 'string' ? parseInt(scheduleDateRaw) : scheduleDateRaw
                const scheduleDate = new Date(String(ts).length === 10 ? ts * 1000 : ts)

                const diffTime = scheduleDate.getTime() - todayStart.getTime()
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

                const color = diffDays < 0 ? 'text-red-600' : diffDays === 0 ? 'text-yellow-600' : 'text-gray-900'

                return (
                    <span className={`text-sm font-medium ${color}`}>
                        {diffDays < 0 ? `${Math.abs(diffDays)} overdue` : diffDays === 0 ? 'Today' : `${diffDays} days`}
                    </span>
                )
            },
        },
        {
            key: 'status',
            header: 'Task Status',
            render: (value) => <div className={`p-2 rounded-sm h-7 w-22.5 text-xs font-medium`}>{value || '-'}</div>,
        },
        {
            key: 'completionDate',
            header: 'Completion Date',
            render: (value) => {
                const ts = typeof value === 'string' ? parseInt(value) : value
                const formatted =
                    value && !isNaN(ts) ? new Date(String(ts).length === 10 ? ts * 1000 : ts).toLocaleDateString() : '-'

                return <span className='text-sm text-gray-900'>{formatted}</span>
            },
        },
    ]

    return (
        <div className='w-full p-3 pb-0'>
            {/* Search and Filters */}
            <div className='flex items-center gap-3 mb-5'>
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
                    className='h-7 w-68'
                />

                {/* Date Range Filter */}
                <DateRangePicker
                    onDateRangeChange={handleDateRangeChange}
                    placeholder='Date Range'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full min-w-[160px] bg-white border border-gray-300 rounded-md shadow-lg'
                />

                <Dropdown
                    options={generateDropdownOptions('propertyName', 'Property')}
                    onSelect={setSelectedProperty}
                    defaultValue={selectedProperty}
                    placeholder='Property'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('stage', 'Lead Stage')}
                    onSelect={setSelectedLeadStage}
                    defaultValue={selectedLeadStage}
                    placeholder='Lead Stage'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('tag', 'Tag')}
                    onSelect={setSelectedTag}
                    defaultValue={selectedTag}
                    placeholder='Tag'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('taskType', 'Task')}
                    onSelect={setSelectedTask}
                    defaultValue={selectedTask}
                    placeholder='Task'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('leadStatus', 'Lead Status')}
                    onSelect={setSelectedLeadStatus}
                    defaultValue={selectedLeadStatus}
                    placeholder='Lead Status'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName='flex items-center justify-between px-3 py-1 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />
                <Dropdown
                    options={generateDropdownOptions('agentName', 'Agent')}
                    onSelect={setSelectedAgent}
                    defaultValue={selectedAgent}
                    placeholder='Agent'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />
            </div>

            {/* Status Cards */}
            <div className='flex items-center justify-between mb-7'>
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

            {/* Table */}
            <div className='bg-white rounded-lg shadow-sm overflow-hidden h-[63vh]'>
                <FlexibleTable
                    data={allTasksData}
                    columns={columns}
                    borders={{ table: false, header: true, rows: true, cells: false, outer: true }}
                    selectedRows={selectedRows}
                    headerClassName='font-normal'
                    onRowSelect={handleRowSelect}
                    //onRowClick={handleRowClick}
                    className='rounded-lg'
                    stickyHeader={true}
                    hoverable={true}
                    maxHeight='63vh'
                />
            </div>
        </div>
    )
}

export default Tasks
