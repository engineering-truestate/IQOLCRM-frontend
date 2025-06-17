import React from 'react'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import { searchLeads, type LeadSearchFilters } from '../../../services/canvas_homes/leadAlgoliaService'
import searchIcon from '/icons/canvas_homes/searchIcon.svg'
import google from '/icons/canvas_homes/google.svg'
import hot from '/icons/canvas_homes/hoticon.svg'
import linkedin from '/icons/canvas_homes/linkedin.svg'
import meta from '/icons/canvas_homes/meta.svg'
import AddLeadModal from '../../../components/canvas_homes/AddLeadModal'
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

const Leads = () => {
    const [activeStatusCard, setActiveStatusCard] = useState('All')
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [searchValue, setSearchValue] = useState('')
    const [selectedDateRange, setSelectedDateRange] = useState('')
    const [selectedProperty, setSelectedProperty] = useState('')
    const [selectedAgent, setSelectedAgent] = useState('')
    const [selectedSource, setSelectedSource] = useState('')
    const [selectedLeadStage, setSelectedLeadStage] = useState('')
    const [selectedTag, setSelectedTag] = useState('')
    const [selectedTask, setSelectedTask] = useState('')
    const [selectedLeadStatus, setSelectedLeadStatus] = useState('')
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false)
    const navigate = useNavigate()

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
        return {
            leadState: activeStatusCard !== 'All' ? [activeStatusCard.toLowerCase()] : undefined,
            propertyName: selectedProperty ? [selectedProperty] : undefined,
            agentName: selectedAgent ? [selectedAgent] : undefined,
            source: selectedSource ? [selectedSource] : undefined,
            stage: selectedLeadStage ? [selectedLeadStage] : undefined,
            tag: selectedTag ? [selectedTag] : undefined,
            taskType: selectedTask ? [selectedTask] : undefined,
            leadStatus: selectedLeadStatus ? [selectedLeadStatus] : undefined,
            dateRange: selectedDateRange || undefined,
        }
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
        const stateFacets = facets.leadState || {}
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

    // Dropdown options (static for date range)
    const dateRangeOptions = [
        { label: 'Date Range', value: '' },
        { label: 'Today', value: 'today' },
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
    ]

    // Table columns (updated field names to match Algolia data)
    const columns: TableColumn[] = [
        {
            key: 'name',
            header: 'Name',
            render: (value, row) => (
                <div className='whitespace-nowrap' onClick={() => navigate(`leaddetails/${row.leadId}`)}>
                    <div className='text-sm font-medium text-gray-900'>{value || row.name}</div>
                    <div className='text-xs text-gray-500 font-normal'>
                        {row.addedDate || `Added ${new Date(row.added).toLocaleDateString()}`}
                    </div>
                </div>
            ),
        },
        {
            key: 'propertyName',
            header: 'Property',
            render: (value, row) => <span className='text-sm font-normal text-gray-900'>{value || row.property}</span>,
        },
        {
            key: 'source',
            header: 'Source',
            render: (value) => (
                <div className='w-full h-full flex items-center justify-center'>
                    {value === 'Google' && <img src={google} alt='Google' className='w-4 h-4 object-contain' />}
                    {value === 'LinkedIn' && <img src={linkedin} alt='LinkedIn' className='w-4 h-4 object-contain' />}
                    {value === 'META' && <img src={meta} alt='Meta' className='w-4 h-4 object-contain' />}
                    {!['Google', 'LinkedIn', 'META'].includes(value) && (
                        <span className='text-xs font-medium px-2 py-1 bg-gray-100 rounded'>{value}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'phoneNumber',
            header: 'Contact',
            render: (value, row) => <span className='text-sm font-normal'>{value || row.contact}</span>,
        },
        {
            key: 'agentName',
            header: 'Agent',
            render: (value, row) => <span className='text-sm font-normal'>{value || row.agent}</span>,
        },
        {
            key: 'stage',
            header: 'Lead Stage',
            render: (value, row) => <span className='text-sm text-gray-900'>{value || row.leadStage}</span>,
        },
        {
            key: 'leadStatus',
            header: 'Lead Status',
            render: (value) => <span className='text-sm text-gray-900'>{value}</span>,
        },
        {
            key: 'tag',
            header: 'Tag',
            render: (value) => (
                <div className='inline-flex items-center min-w-17 w-full h-6 gap-2 px-2 py-1 rounded-[4px] text-xs font-medium bg-[#FFEDD5] text-[#9A3412]'>
                    <img src={hot} alt='Hot' className='w-3 h-3 object-contain' />
                    <span className='text-sm font-normal'>{value}</span>
                </div>
            ),
        },
        {
            key: 'aslc',
            header: 'ASLC',
            render: (value, row) => {
                const today = new Date().getTime()

                // Get the correct date based on lead state
                const dateToUse = row.leadState === 'fresh' ? row.added : row.scheduledDate

                // Calculate the difference in days
                const daysDifference = Math.floor((today - dateToUse) / (1000 * 60 * 60 * 24))

                return (
                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
                        {daysDifference || 0} days
                    </span>
                )
            },
        },
        {
            key: 'taskType',
            header: 'Schedule Task',
            render: (value, row) => (
                <div className='flex items-center gap-3'>
                    <div>
                        <div className='text-sm font-medium text-gray-900'>{value || row.scheduleTask?.type}</div>
                        <div className='text-xs text-gray-500'>
                            {row.scheduledDate
                                ? new Date(row.scheduledDate).toLocaleDateString()
                                : row.scheduleTask?.date}{' '}
                            |{row.scheduleTask?.time}
                        </div>
                    </div>
                </div>
            ),
        },
    ]

    return (
        <div className='p-3 pb-0 h-full'>
            {/* Search and Filters */}
            <div className='flex items-center gap-4 mb-5'>
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

                <Dropdown
                    options={generateDropdownOptions('', 'Date Range', dateRangeOptions)}
                    onSelect={setSelectedDateRange}
                    defaultValue={selectedDateRange}
                    placeholder='Date Range'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('propertyName', 'Property')}
                    onSelect={setSelectedProperty}
                    defaultValue={selectedProperty}
                    placeholder='Property'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('agentName', 'Agent')}
                    onSelect={setSelectedAgent}
                    defaultValue={selectedAgent}
                    placeholder='Agent'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('source', 'Source')}
                    onSelect={setSelectedSource}
                    defaultValue={selectedSource}
                    placeholder='Source'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('stage', 'Lead Stage')}
                    onSelect={setSelectedLeadStage}
                    defaultValue={selectedLeadStage}
                    placeholder='Lead Stage'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('tag', 'Tag')}
                    onSelect={setSelectedTag}
                    defaultValue={selectedTag}
                    placeholder='Tag'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('taskType', 'Task')}
                    onSelect={setSelectedTask}
                    defaultValue={selectedTask}
                    placeholder='Task'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between p-2 h-7 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />

                <Dropdown
                    options={generateDropdownOptions('leadStatus', 'Lead Status')}
                    onSelect={setSelectedLeadStatus}
                    defaultValue={selectedLeadStatus}
                    placeholder='Lead Status'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between px-3 py-1 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
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
                <Button
                    bgColor='bg-blue-600'
                    textColor='text-white'
                    className='p-2 w-fit h-8 font-[10px] hover:bg-blue-700'
                    onClick={() => setIsAddLeadModalOpen(true)}
                >
                    <span>+ Add Lead</span>
                </Button>
            </div>

            {/* Table */}
            <div className='bg-white rounded-lg shadow-sm overflow-hidden h-[63vh]'>
                <FlexibleTable
                    data={filteredLeadsData}
                    columns={columns}
                    borders={{ table: false, header: true, rows: true, cells: false, outer: true }}
                    showCheckboxes={true}
                    selectedRows={selectedRows}
                    headerClassName='font-normal'
                    onRowSelect={handleRowSelect}
                    onRowClick={handleRowClick}
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
