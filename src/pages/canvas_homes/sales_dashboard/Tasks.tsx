import { useState, useMemo, useEffect, useCallback } from 'react'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import DateRangePicker from '../../../components/design-elements/DateRangePicker'
import { searchTasks, type TaskSearchFilters } from '../../../services/canvas_homes/taskAlgoliaService'
import potentialIcon from '/icons/canvas_homes/potential-bulb.svg'
import hotIcon from '/icons/canvas_homes/hoticon.svg'
import superHotIcon from '/icons/canvas_homes/super-hot.svg'
import coldIcon from '/icons/canvas_homes/coldicon.svg'
//import linkedin from '/icons/canvas_homes/linkedin.svg'
//import meta from '/icons/canvas_homes/meta.svg'
import { useNavigate } from 'react-router-dom'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'
import { getUnixDateTime, formatUnixDateTime } from '../../../components/helper/getUnixDateTime'

const capitalizeFirst = (text: string) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '')

// Task data type
type SalesTask = {
    id: string
    name: string
    addedDate: string
    added?: number | string
    property: string
    propertyName?: string
    leadStage: string
    stage?: string
    leadStatus: string
    tag: string
    scheduleTask: {
        type: string
        date: string
        time: string
        avatar: string
    }
    scheduledDate?: number | string
    taskType?: string
    dueDays: number
    taskStatus: 'complete' | 'open'
    status?: string
    completionDate: string
    leadId?: string
    agentName?: string
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
    const [customDateRange, setCustomDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
        startDate: null,
        endDate: null,
    })
    const navigate = useNavigate()

    // Task data state
    const [allTasksData, setAllTasksData] = useState<SalesTask[]>([])
    const [filteredTasksData, setFilteredTasksData] = useState<SalesTask[]>([])
    const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})
    const [loading, setLoading] = useState(false)

    // ✅ FIXED: Properly typed debounce function
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

            // Transform backend data to match the expected format with capitalization
            const transformedData = result.hits.map((task: any) => ({
                ...task,
                // Map backend fields to frontend fields with capitalization
                name: toCapitalizedWords(task.name || ''),
                property: toCapitalizedWords(task.propertyName || task.property || '-'),
                leadStage: toCapitalizedWords(task.stage || task.leadStage || '-'),
                leadStatus: toCapitalizedWords(task.leadStatus || '-'),
                tag: task.tag || '-', // Tags handled specially in render function
                agentName: toCapitalizedWords(task.agentName || '-'),
                addedDate: task.added ? formatAddedDate(task.added) : '-',
                scheduleTask: {
                    type: toCapitalizedWords(task.taskType || task.scheduleTask?.type || '-'),
                    date: task.scheduledDate ? formatScheduleDate(task.scheduledDate) : task.scheduleTask?.date || '-',
                    time: task.scheduleTask?.time || '',
                    avatar: task.scheduleTask?.avatar || task.name?.charAt(0) || 'U',
                },
                taskType: toCapitalizedWords(task.taskType || '-'),
                taskStatus: determineTaskStatus(task),
                dueDays: calculateDueDays(task.scheduledDate),
            }))

            setAllTasksData(transformedData)
            setFacets(result.facets || {})
        } catch (error) {
            console.error('Search error:', error)
            setAllTasksData([])
            setFilteredTasksData([])
        } finally {
            setLoading(false)
        }
    }, [searchValue, createTaskFilters])

    // Helper functions for data transformation
    const formatAddedDate = (timestamp: number | string) => {
        const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
        const date = new Date(String(ts).length === 10 ? ts * 1000 : ts)
        return `Added ${date.toLocaleDateString()}`
    }

    const formatScheduleDate = (timestamp: number | string) => {
        const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
        const date = new Date(String(ts).length === 10 ? ts * 1000 : ts)
        return date.toLocaleDateString()
    }

    const calculateDueDays = (scheduledDate: number | string | undefined): number => {
        if (!scheduledDate) return 0

        const ts = typeof scheduledDate === 'string' ? parseInt(scheduledDate) : scheduledDate
        const scheduleDate = new Date(String(ts).length === 10 ? ts * 1000 : ts)
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const diffTime = scheduleDate.getTime() - todayStart.getTime()
        return Math.floor(diffTime / (1000 * 60 * 60 * 24))
    }

    const determineTaskStatus = (task: any): 'complete' | 'open' | 'Overdue' | 'Upcoming' => {
        if (task.status === 'complete' || task.taskStatus === 'complete') return 'complete'

        const dueDays = calculateDueDays(task.scheduledDate)
        if (dueDays < 0) return 'Overdue'
        if (dueDays === 0) return 'open'
        return 'Upcoming'
    }

    // Filter tasks based on status card selection
    useEffect(() => {
        if (activeStatusCard === 'All') {
            setFilteredTasksData(allTasksData)
        } else if (activeStatusCard === 'Upcoming') {
            const upcomingTasks = allTasksData.filter((task) => {
                const dueDays = calculateDueDays(task.scheduledDate)
                return dueDays >= 0
            })
            setFilteredTasksData(upcomingTasks)
        } else if (activeStatusCard === 'Missed') {
            const missedTasks = allTasksData.filter((task) => {
                const dueDays = calculateDueDays(task.scheduledDate)
                return dueDays < 0
            })
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
    ])

    // Search on text input change (debounced)
    useEffect(() => {
        debouncedSearch()
    }, [searchValue, debouncedSearch])

    // Calculate the status counts manually
    const statusCounts = useMemo(() => {
        const counts = {
            All: allTasksData.length,
            Upcoming: 0,
            Missed: 0,
        }

        // Count each category
        allTasksData.forEach((task) => {
            const dueDays = calculateDueDays(task.scheduledDate)
            if (dueDays < 0) {
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
        if (startDate || endDate) {
            setSelectedDateRange('')
        }
    }, [])

    // Handle row click
    const handleRowClick = (row: any) => {
        console.log('Row clicked:', row)
        if (row.leadId || row.id) {
            navigate(`/sales/taskdetails/${row.leadId || row.id}`)
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

    // Status cards data with dynamic counts
    const statusCards = [
        { title: 'All', count: statusCounts.All },
        { title: 'Upcoming', count: statusCounts.Upcoming },
        { title: 'Missed', count: statusCounts.Missed },
    ]

    // Generate dropdown options dynamically from facets with capitalization
    const generateDropdownOptions = (facetKey: string, defaultLabel: string) => {
        const facetData = facets[facetKey] || {}
        const options = [{ label: defaultLabel, value: '' }]

        Object.entries(facetData)
            .sort(([, a], [, b]) => b - a)
            .forEach(([key, count]) => {
                if (count > 0) {
                    options.push({
                        label: `${toCapitalizedWords(key)} (${count})`,
                        value: key,
                    })
                }
            })

        return options
    }

    // Helper function to get task status badge color
    const getTaskStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'complete':
                return 'bg-[#E1F6DF] text-[#2E8E16]'
            case 'open':
                return 'bg-[#DADAE2] text-gray-700'
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
                    <div className='max-w-[100px] text-sm font-medium text-gray-900'>{value || '-'}</div>
                    <div className='max-w-[100px] text-xs text-gray-500 font-normal'>{row.addedDate}</div>
                </div>
            ),
        },
        {
            key: 'property',
            header: 'Property',
            render: (value) => (
                <span className='max-w-[100px] text-[14px] overflow-hidden whitespace-nowrap text-ellipsis text-sm font-normal text-gray-900'>
                    {value || '-'}
                </span>
            ),
        },
        {
            key: 'leadStage',
            header: 'Lead Stage',
            render: (value) => (
                <span
                    className='inline-block max-w-[100px] overflow-hidden whitespace-nowrap text-ellipsis text-sm font-normal text-gray-900'
                    title={value}
                >
                    {value || '-'}
                </span>
            ),
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
            key: 'scheduleTask',
            header: 'Schedule Task',
            render: (value, row) => (
                <div className='flex items-center gap-3'>
                    <div>
                        <div className='text-sm font-medium text-gray-900'>
                            {value?.type || toCapitalizedWords(row.taskType) || '-'}
                        </div>
                        <div className='text-xs text-gray-500'>
                            {value?.date || '-'} {value?.time ? `| ${value.time}` : ''}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'dueDays',
            header: 'Due Days',
            render: (value) => {
                const displayValue = Math.abs(value) < 10 ? `0${Math.abs(value)}` : `${Math.abs(value)}`
                const textColor = value < 0 ? 'text-red-600' : value === 0 ? 'text-black' : 'text-gray-900'

                return (
                    <span className={`text-sm max-w-[97px] font-medium ${textColor}`}>
                        {value === 0 ? '00' : displayValue}
                    </span>
                )
            },
        },
        {
            key: 'taskStatus',
            header: 'Task Status',
            render: (value) => (
                <div className={`p-2 rounded-sm h-7 w-22.5 text-xs font-medium ${getTaskStatusColor(value)}`}>
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

                const formatted = formatUnixDateTime(rawDate)
                return <span className='text-[14px] text-gray-900'>{formatted}</span>
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
                    className='h-7 w-[240px] h-[28px]'
                />

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
                    options={generateDropdownOptions('leadStatus', 'Lead Status')}
                    onSelect={setSelectedLeadStatus}
                    defaultValue={selectedLeadStatus}
                    placeholder='Lead Status'
                    className='relative inline-block w-full sm:w-auto'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] w-full sm:w-auto cursor-pointer'
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
                        headerClassName='font-normal text-left px-0'
                        cellClassName='text-left'
                        onRowSelect={handleRowSelect}
                        //onRowClick={handleRowClick}
                        className='rounded-lg'
                        stickyHeader={true}
                        hoverable={true}
                        maxHeight='63vh'
                        showCheckboxes={true}
                    />
                )}
            </div>
        </div>
    )
}
export default Tasks
