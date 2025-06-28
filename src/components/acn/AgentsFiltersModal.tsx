// import React, { useState, useEffect } from 'react'
// import algoliaAgentsService from '../../services/acn/agents/algoliaAgentsService'
// import type { AgentSearchFilters } from '../../services/acn/agents/algoliaAgentsService'
// import AlgoliaFacetMultiSelect from '../design-elements/AlgoliaFacetMultiSelect'
// import DateRangePicker from '../design-elements/DateRangePicker'
// import Button from '../design-elements/Button'

// // ---------- Types ----------

// interface AgentsFiltersModalProps {
//     isOpen: boolean
//     onClose: () => void
//     filters: AgentSearchFilters
//     onFiltersChange: (filters: AgentSearchFilters) => void
// }

// // Helper function to get start of day timestamp
// const getStartOfDayTimestamp = (dateString: string): number => {
//     const date = new Date(dateString)
//     date.setHours(0, 0, 0, 0)
//     return Math.floor(date.getTime() / 1000)
// }

// // Helper function to get end of day timestamp
// const getEndOfDayTimestamp = (dateString: string): number => {
//     const date = new Date(dateString)
//     date.setHours(23, 59, 59, 999)
//     return Math.floor(date.getTime() / 1000)
// }

// // Helper function to convert Unix timestamp to date string
// const unixToDateString = (unixTimestamp: number): string => {
//     return new Date(unixTimestamp * 1000).toISOString().split('T')[0]
// }

// export const AgentsFiltersModal: React.FC<AgentsFiltersModalProps> = ({
//     isOpen,
//     onClose,
//     filters,
//     onFiltersChange,
// }) => {
//     const [facets, setFacets] = useState<Record<string, any>>({})
//     const [localFilters, setLocalFilters] = useState<AgentSearchFilters>(filters)
//     const [dateLimits, setDateLimits] = useState<{
//         lastEnquiry: { min: number; max: number }
//         lastSeen: { min: number; max: number }
//         lastContact: { min: number; max: number }
//     }>({
//         lastEnquiry: { min: 0, max: Math.floor(Date.now() / 1000) },
//         lastSeen: { min: 0, max: Math.floor(Date.now() / 1000) },
//         lastContact: { min: 0, max: Math.floor(Date.now() / 1000) },
//     })
//     const [dateRanges, setDateRanges] = useState<{
//         lastEnquiry: { start?: string; end?: string }
//         lastSeen: { start?: string; end?: string }
//         lastContact: { start?: string; end?: string }
//     }>({
//         lastEnquiry: {},
//         lastSeen: {},
//         lastContact: {},
//     })

//     // Fetch facets and date limits when modal opens
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const [allFacets, limits] = await Promise.all([
//                     algoliaAgentsService.getAllAgentFacets(),
//                     algoliaAgentsService.getAgentDateLimits(),
//                 ])
//                 setFacets(allFacets)
//                 setDateLimits(limits)
//             } catch (err) {
//                 console.error('Failed to fetch agent data:', err)
//                 setFacets({})
//             }
//         }

//         if (isOpen) {
//             fetchData()
//         }
//     }, [isOpen])

//     // Reset local filters when modal opens with new filters
//     useEffect(() => {
//         setLocalFilters(filters)
//         // Convert Unix timestamps back to date strings for display
//         setDateRanges({
//             lastEnquiry: {
//                 start: filters.lastEnquiryFrom ? unixToDateString(parseInt(filters.lastEnquiryFrom)) : undefined,
//                 end: filters.lastEnquiryTo ? unixToDateString(parseInt(filters.lastEnquiryTo)) : undefined,
//             },
//             lastSeen: {
//                 start: filters.lastSeenFrom ? unixToDateString(parseInt(filters.lastSeenFrom)) : undefined,
//                 end: filters.lastSeenTo ? unixToDateString(parseInt(filters.lastSeenTo)) : undefined,
//             },
//             lastContact: {
//                 start: filters.lastContactFrom ? unixToDateString(parseInt(filters.lastContactFrom)) : undefined,
//                 end: filters.lastContactTo ? unixToDateString(parseInt(filters.lastContactTo)) : undefined,
//             },
//         })
//     }, [filters])

//     const handleApply = () => {
//         // Convert date ranges to Unix timestamps and update filters
//         const updatedFilters = { ...localFilters }

//         // Handle Last Enquiry dates with database limits
//         if (dateRanges.lastEnquiry.start || dateRanges.lastEnquiry.end) {
//             if (dateRanges.lastEnquiry.start) {
//                 const startTimestamp = getStartOfDayTimestamp(dateRanges.lastEnquiry.start)
//                 updatedFilters.lastEnquiryFrom = Math.max(startTimestamp, dateLimits.lastEnquiry.min).toString()
//             }
//             if (dateRanges.lastEnquiry.end) {
//                 const endTimestamp = getEndOfDayTimestamp(dateRanges.lastEnquiry.end)
//                 updatedFilters.lastEnquiryTo = Math.min(endTimestamp, dateLimits.lastEnquiry.max).toString()
//             }
//         } else {
//             delete updatedFilters.lastEnquiryFrom
//             delete updatedFilters.lastEnquiryTo
//         }

//         // Handle Last Seen dates with database limits
//         if (dateRanges.lastSeen.start || dateRanges.lastSeen.end) {
//             if (dateRanges.lastSeen.start) {
//                 const startTimestamp = getStartOfDayTimestamp(dateRanges.lastSeen.start)
//                 updatedFilters.lastSeenFrom = Math.max(startTimestamp, dateLimits.lastSeen.min).toString()
//             }
//             if (dateRanges.lastSeen.end) {
//                 const endTimestamp = getEndOfDayTimestamp(dateRanges.lastSeen.end)
//                 updatedFilters.lastSeenTo = Math.min(endTimestamp, dateLimits.lastSeen.max).toString()
//             }
//         } else {
//             delete updatedFilters.lastSeenFrom
//             delete updatedFilters.lastSeenTo
//         }

//         // Handle Last Contact dates with database limits
//         if (dateRanges.lastContact.start || dateRanges.lastContact.end) {
//             if (dateRanges.lastContact.start) {
//                 const startTimestamp = getStartOfDayTimestamp(dateRanges.lastContact.start)
//                 updatedFilters.lastContactFrom = Math.max(startTimestamp, dateLimits.lastContact.min).toString()
//             }
//             if (dateRanges.lastContact.end) {
//                 const endTimestamp = getEndOfDayTimestamp(dateRanges.lastContact.end)
//                 updatedFilters.lastContactTo = Math.min(endTimestamp, dateLimits.lastContact.max).toString()
//             }
//         } else {
//             delete updatedFilters.lastContactFrom
//             delete updatedFilters.lastContactTo
//         }

//         onFiltersChange(updatedFilters)
//         onClose()
//     }

//     const handleReset = () => {
//         setLocalFilters({})
//         setDateRanges({
//             lastEnquiry: {},
//             lastSeen: {},
//             lastContact: {},
//         })
//         onFiltersChange({})
//         onClose()
//     }

//     // Convert facets to options format
//     const getFacetOptions = (facetName: string) => {
//         return Object.entries(facets[facetName] || {}).map(([value, count]) => ({
//             value,
//             count: count as number,
//         }))
//     }

//     // Handle date range changes
//     const handleDateRangeChange = (
//         field: 'lastEnquiry' | 'lastSeen' | 'lastContact',
//         start?: string | null,
//         end?: string | null,
//     ) => {
//         setDateRanges((prev) => ({
//             ...prev,
//             [field]: {
//                 start: start || undefined,
//                 end: end || undefined,
//             },
//         }))
//     }

//     if (!isOpen) return null

//     return (
//         <div className='fixed inset-0 z-50 flex'>
//             {/* Left overlay (60%) */}
//             <div className='w-[60%] h-full bg-black opacity-50' onClick={onClose} role='presentation' />
//             {/* Right panel (40%) */}
//             <div className='w-[40%] h-full overflow-y-auto bg-white p-6 shadow-lg animate-slide-in'>
//                 <div className='flex justify-between items-center mb-4'>
//                     <h2 className='text-xl font-normal'>Filters</h2>
//                     <Button
//                         onClick={handleReset}
//                         className='text-sm border border-[#24252E] px-3 py-1 rounded hover:bg-[#24252E] hover:text-white transition'
//                     >
//                         Reset
//                     </Button>
//                 </div>
//                 <div className='w-full h-px bg-gray-400 my-5' />

//                 {/* App Installed & Pay Status */}
//                 <div className='flex gap-4 mb-4'>
//                     <div className='flex-1 flex flex-col gap-2'>
//                         <span className='text-[15px] text-semibold text-[#0A0B0A]'>App Installed</span>
//                         <AlgoliaFacetMultiSelect
//                             options={getFacetOptions('appInstalled')}
//                             selectedValues={localFilters.appInstalled ? [localFilters.appInstalled] : []}
//                             onSelectionChange={(values) =>
//                                 setLocalFilters({ ...localFilters, appInstalled: values[0] })
//                             }
//                             placeholder='Please Select'
//                             label='App Installed'
//                             className='w-full text-sm text-[#696979]'
//                             triggerClassName='w-full border border-gray-300 rounded p-3'
//                         />
//                     </div>
//                     <div className='flex-1 flex flex-col gap-2'>
//                         <span className='text-[15px] text-semibold text-[#0A0B0A]'>Pay Status</span>
//                         <AlgoliaFacetMultiSelect
//                             options={getFacetOptions('payStatus')}
//                             selectedValues={localFilters.payStatus ? [localFilters.payStatus] : []}
//                             onSelectionChange={(values) => setLocalFilters({ ...localFilters, payStatus: values[0] })}
//                             placeholder='Please Select'
//                             label='Pay Status'
//                             className='w-full text-sm text-[#696979]'
//                             triggerClassName='w-full border border-gray-300 rounded p-3'
//                         />
//                     </div>
//                 </div>

//                 {/* Area of Operation */}
//                 <div className='mb-4'>
//                     <AlgoliaFacetMultiSelect
//                         options={getFacetOptions('areaOfOperation')}
//                         selectedValues={localFilters.areaOfOperation || []}
//                         onSelectionChange={(values) => setLocalFilters({ ...localFilters, areaOfOperation: values })}
//                         placeholder='Area of Operation'
//                         label='Area'
//                         className='w-full'
//                         triggerClassName='w-full border border-gray-300 rounded px-2 py-1'
//                     />
//                 </div>

//                 {/* Business Category */}
//                 <div className='mb-4'>
//                     <AlgoliaFacetMultiSelect
//                         options={getFacetOptions('businessCategory')}
//                         selectedValues={localFilters.businessCategory || []}
//                         onSelectionChange={(values) => setLocalFilters({ ...localFilters, businessCategory: values })}
//                         placeholder='Business Category'
//                         label='Work Category'
//                         className='w-full'
//                         triggerClassName='w-full border border-gray-300 rounded px-2 py-1'
//                     />
//                 </div>

//                 {/* Date Ranges */}
//                 <div>
//                     <div className='mb-2'>
//                         <label className='block text-sm font-normal mb-1'>Last Enquiry</label>
//                         <DateRangePicker
//                             onDateRangeChange={(start, end) => handleDateRangeChange('lastEnquiry', start, end)}
//                             placeholder='Select Last Enquiry Range'
//                             className='w-full'
//                             triggerClassName='w-full'
//                         />
//                         <div className='text-xs text-gray-500 mt-1'>
//                             Available range: {unixToDateString(dateLimits.lastEnquiry.min)} to{' '}
//                             {unixToDateString(dateLimits.lastEnquiry.max)}
//                         </div>
//                     </div>
//                     <div className='mb-2'>
//                         <label className='block text-sm font-normal mb-1'>Last Seen</label>
//                         <DateRangePicker
//                             onDateRangeChange={(start, end) => handleDateRangeChange('lastSeen', start, end)}
//                             placeholder='Select Last Seen Range'
//                             className='w-full'
//                             triggerClassName='w-full'
//                         />
//                         <div className='text-xs text-gray-500 mt-1'>
//                             Available range: {unixToDateString(dateLimits.lastSeen.min)} to{' '}
//                             {unixToDateString(dateLimits.lastSeen.max)}
//                         </div>
//                     </div>
//                     <div className='mb-2'>
//                         <label className='block text-sm font-normal mb-1'>Last Connect</label>
//                         <DateRangePicker
//                             onDateRangeChange={(start, end) => handleDateRangeChange('lastContact', start, end)}
//                             placeholder='Select Last Connect Range'
//                             className='w-full'
//                             triggerClassName='w-full'
//                         />
//                         <div className='text-xs text-gray-500 mt-1'>
//                             Available range: {unixToDateString(dateLimits.lastContact.min)} to{' '}
//                             {unixToDateString(dateLimits.lastContact.max)}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className='flex justify-end gap-3 mt-6'>
//                     <Button
//                         onClick={onClose}
//                         className='px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50'
//                     >
//                         Cancel
//                     </Button>
//                     <Button
//                         onClick={handleApply}
//                         className='px-4 py-2 bg-[#24252E] text-white rounded hover:bg-[#393A47]'
//                     >
//                         Apply Filters
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     )
// }

import React, { useState, useEffect } from 'react'
import algoliaAgentsService from '../../services/acn/agents/algoliaAgentsService'
import type { AgentSearchFilters } from '../../services/acn/agents/algoliaAgentsService'
import AlgoliaFacetMultiSelect from '../design-elements/AlgoliaFacetMultiSelect'
import DateRangePicker from '../design-elements/DateRangePicker'
import Button from '../design-elements/Button'

// ---------- Types ----------

interface AgentsFiltersModalProps {
    isOpen: boolean
    onClose: () => void
    filters: AgentSearchFilters
    onFiltersChange: (filters: AgentSearchFilters) => void
}

// Helper function to get start of day timestamp
const getStartOfDayTimestamp = (dateString: string): number => {
    const date = new Date(dateString)
    date.setHours(0, 0, 0, 0)
    return Math.floor(date.getTime() / 1000)
}

// Helper function to get end of day timestamp
const getEndOfDayTimestamp = (dateString: string): number => {
    const date = new Date(dateString)
    date.setHours(23, 59, 59, 999)
    return Math.floor(date.getTime() / 1000)
}

// Helper function to convert Unix timestamp to date string
const unixToDateString = (unixTimestamp: number): string => {
    return new Date(unixTimestamp * 1000).toISOString().split('T')[0]
}

export const AgentsFiltersModal: React.FC<AgentsFiltersModalProps> = ({
    isOpen,
    onClose,
    filters,
    onFiltersChange,
}) => {
    const [facets, setFacets] = useState<Record<string, any>>({})
    const [localFilters, setLocalFilters] = useState<AgentSearchFilters>(filters)
    const [dateLimits, setDateLimits] = useState<{
        lastEnquiry: { min: number; max: number }
        lastSeen: { min: number; max: number }
        lastContact: { min: number; max: number }
    }>({
        lastEnquiry: { min: 0, max: Math.floor(Date.now() / 1000) },
        lastSeen: { min: 0, max: Math.floor(Date.now() / 1000) },
        lastContact: { min: 0, max: Math.floor(Date.now() / 1000) },
    })
    const [dateRanges, setDateRanges] = useState<{
        lastEnquiry: { start?: string; end?: string }
        lastSeen: { start?: string; end?: string }
        lastContact: { start?: string; end?: string }
    }>({
        lastEnquiry: {},
        lastSeen: {},
        lastContact: {},
    })

    // Radio button states for date filters
    const [lastEnquiryStatus, setLastEnquiryStatus] = useState<'received' | 'not-received' | null>(null)
    const [lastSeenStatus, setLastSeenStatus] = useState<'yes' | 'no' | null>(null)
    const [lastContactStatus, setLastContactStatus] = useState<'yes' | 'no' | null>(null)

    // Fetch facets and date limits when modal opens
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allFacets, limits] = await Promise.all([
                    algoliaAgentsService.getAllAgentFacets(),
                    algoliaAgentsService.getAgentDateLimits(),
                ])
                setFacets(allFacets)
                setDateLimits(limits)
            } catch (err) {
                console.error('Failed to fetch agent data:', err)
                setFacets({})
            }
        }

        if (isOpen) {
            fetchData()
        }
    }, [isOpen])

    // Reset local filters when modal opens with new filters
    useEffect(() => {
        setLocalFilters(filters)
        // Convert Unix timestamps back to date strings for display
        setDateRanges({
            lastEnquiry: {
                start: filters.lastEnquiryFrom ? unixToDateString(parseInt(filters.lastEnquiryFrom)) : undefined,
                end: filters.lastEnquiryTo ? unixToDateString(parseInt(filters.lastEnquiryTo)) : undefined,
            },
            lastSeen: {
                start: filters.lastSeenFrom ? unixToDateString(parseInt(filters.lastSeenFrom)) : undefined,
                end: filters.lastSeenTo ? unixToDateString(parseInt(filters.lastSeenTo)) : undefined,
            },
            lastContact: {
                start: filters.lastContactFrom ? unixToDateString(parseInt(filters.lastContactFrom)) : undefined,
                end: filters.lastContactTo ? unixToDateString(parseInt(filters.lastContactTo)) : undefined,
            },
        })
    }, [filters])

    const handleApply = () => {
        // Convert date ranges to Unix timestamps and update filters
        const updatedFilters = { ...localFilters }

        // Handle Last Enquiry dates with database limits
        if (dateRanges.lastEnquiry.start || dateRanges.lastEnquiry.end) {
            if (dateRanges.lastEnquiry.start) {
                const startTimestamp = getStartOfDayTimestamp(dateRanges.lastEnquiry.start)
                updatedFilters.lastEnquiryFrom = Math.max(startTimestamp, dateLimits.lastEnquiry.min).toString()
            }
            if (dateRanges.lastEnquiry.end) {
                const endTimestamp = getEndOfDayTimestamp(dateRanges.lastEnquiry.end)
                updatedFilters.lastEnquiryTo = Math.min(endTimestamp, dateLimits.lastEnquiry.max).toString()
            }
        } else {
            delete updatedFilters.lastEnquiryFrom
            delete updatedFilters.lastEnquiryTo
        }

        // Handle Last Seen dates with database limits
        if (dateRanges.lastSeen.start || dateRanges.lastSeen.end) {
            if (dateRanges.lastSeen.start) {
                const startTimestamp = getStartOfDayTimestamp(dateRanges.lastSeen.start)
                updatedFilters.lastSeenFrom = Math.max(startTimestamp, dateLimits.lastSeen.min).toString()
            }
            if (dateRanges.lastSeen.end) {
                const endTimestamp = getEndOfDayTimestamp(dateRanges.lastSeen.end)
                updatedFilters.lastSeenTo = Math.min(endTimestamp, dateLimits.lastSeen.max).toString()
            }
        } else {
            delete updatedFilters.lastSeenFrom
            delete updatedFilters.lastSeenTo
        }

        // Handle Last Contact dates with database limits
        if (dateRanges.lastContact.start || dateRanges.lastContact.end) {
            if (dateRanges.lastContact.start) {
                const startTimestamp = getStartOfDayTimestamp(dateRanges.lastContact.start)
                updatedFilters.lastContactFrom = Math.max(startTimestamp, dateLimits.lastContact.min).toString()
            }
            if (dateRanges.lastContact.end) {
                const endTimestamp = getEndOfDayTimestamp(dateRanges.lastContact.end)
                updatedFilters.lastContactTo = Math.min(endTimestamp, dateLimits.lastContact.max).toString()
            }
        } else {
            delete updatedFilters.lastContactFrom
            delete updatedFilters.lastContactTo
        }

        onFiltersChange(updatedFilters)
        onClose()
    }

    const handleReset = () => {
        setLocalFilters({})
        setDateRanges({
            lastEnquiry: {},
            lastSeen: {},
            lastContact: {},
        })
        setLastEnquiryStatus(null)
        setLastSeenStatus(null)
        setLastContactStatus(null)
        onFiltersChange({})
        onClose()
    }

    // Convert facets to options format
    const getFacetOptions = (facetName: string) => {
        return Object.entries(facets[facetName] || {}).map(([value, count]) => ({
            value,
            count: count as number,
        }))
    }

    // Handle date range changes
    const handleDateRangeChange = (
        field: 'lastEnquiry' | 'lastSeen' | 'lastContact',
        start?: string | null,
        end?: string | null,
    ) => {
        setDateRanges((prev) => ({
            ...prev,
            [field]: {
                start: start || undefined,
                end: end || undefined,
            },
        }))
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex'>
            {/* Left overlay (60%) */}
            <div className='w-[60%] h-full bg-black opacity-50' onClick={onClose} role='presentation' />
            {/* Right panel (40%) */}
            <div className='w-[40%] h-full bg-white shadow-lg flex flex-col'>
                {/* Header */}
                <div className='p-2 border-b border-gray-200'>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-xl font-medium text-gray-900'>Filters</h2>
                        <Button onClick={handleReset} className='text-sm border border-gray-300 px-3 py-1 rounded'>
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto p-6 space-y-6'>
                    {/* App Installed & Pay Status */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <label className='block text-sm font-medium text-gray-700'>App Installed</label>
                            <AlgoliaFacetMultiSelect
                                options={getFacetOptions('appInstalled')}
                                selectedValues={localFilters.appInstalled ? [localFilters.appInstalled] : []}
                                onSelectionChange={(values) =>
                                    setLocalFilters({ ...localFilters, appInstalled: values[0] })
                                }
                                placeholder='Please Select'
                                label='App Installed'
                                className='w-full'
                                triggerClassName='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                            />
                        </div>
                        <div className='space-y-2'>
                            <label className='block text-sm font-medium text-gray-700'>Pay Status</label>
                            <AlgoliaFacetMultiSelect
                                options={getFacetOptions('payStatus')}
                                selectedValues={localFilters.payStatus ? [localFilters.payStatus] : []}
                                onSelectionChange={(values) =>
                                    setLocalFilters({ ...localFilters, payStatus: values[0] })
                                }
                                placeholder='Please Select'
                                label='Pay Status'
                                className='w-full'
                                triggerClassName='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                            />
                        </div>
                    </div>

                    {/* Area */}
                    <div className='space-y-3'>
                        <label className='block text-sm font-medium text-gray-700'>Area</label>
                        <div className='flex flex-wrap gap-2'>
                            {getFacetOptions('areaOfOperation')
                                .slice(0, 6)
                                .map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            const currentValues = localFilters.areaOfOperation || []
                                            const isSelected = currentValues.includes(option.value)
                                            const newValues = isSelected
                                                ? currentValues.filter((v) => v !== option.value)
                                                : [...currentValues, option.value]
                                            setLocalFilters({ ...localFilters, areaOfOperation: newValues })
                                        }}
                                        className={`px-3 py-1.5 text-sm border rounded-md transition ${
                                            (localFilters.areaOfOperation || []).includes(option.value)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {option.value}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Work Category */}
                    <div className='space-y-3'>
                        <label className='block text-sm font-medium text-gray-700'>Work Category</label>
                        <div className='flex flex-wrap gap-2'>
                            {getFacetOptions('businessCategory')
                                .slice(0, 3)
                                .map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            const currentValues = localFilters.businessCategory || []
                                            const isSelected = currentValues.includes(option.value)
                                            const newValues = isSelected
                                                ? currentValues.filter((v) => v !== option.value)
                                                : [...currentValues, option.value]
                                            setLocalFilters({ ...localFilters, businessCategory: newValues })
                                        }}
                                        className={`px-3 py-1.5 text-sm border rounded-md transition ${
                                            (localFilters.businessCategory || []).includes(option.value)
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {option.value}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Last Enquiry */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
                            <label className='text-sm font-medium text-gray-700'>Last Enquiry</label>
                            <div className='flex border border-gray-300 rounded-md overflow-hidden bg-[#F0F0F5]'>
                                <button
                                    onClick={() =>
                                        setLastEnquiryStatus(lastEnquiryStatus === 'received' ? null : 'received')
                                    }
                                    className={`px-3 py-1 text-xs transition ${
                                        lastEnquiryStatus === 'received'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    Received
                                </button>
                                <button
                                    onClick={() =>
                                        setLastEnquiryStatus(
                                            lastEnquiryStatus === 'not-received' ? null : 'not-received',
                                        )
                                    }
                                    className={`px-3 py-1 text-xs border-l border-gray-300 transition ${
                                        lastEnquiryStatus === 'not-received'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    Not Received
                                </button>
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                            <input
                                type='date'
                                placeholder='DD/MM/YYYY'
                                value={dateRanges.lastEnquiry.start || ''}
                                onChange={(e) =>
                                    handleDateRangeChange('lastEnquiry', e.target.value, dateRanges.lastEnquiry.end)
                                }
                                className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                            />
                            <div className='flex items-center gap-2'>
                                <span className='text-sm text-gray-500'>To</span>
                                <input
                                    type='date'
                                    placeholder='DD/MM/YYYY'
                                    value={dateRanges.lastEnquiry.end || ''}
                                    onChange={(e) =>
                                        handleDateRangeChange(
                                            'lastEnquiry',
                                            dateRanges.lastEnquiry.start,
                                            e.target.value,
                                        )
                                    }
                                    className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Last Seen */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
                            <label className='text-sm font-medium text-gray-700'>Last Seen</label>
                            <div className='flex border border-gray-300 rounded-md overflow-hidden bg-[#F0F0F5]'>
                                <button
                                    onClick={() => setLastSeenStatus(lastSeenStatus === 'yes' ? null : 'yes')}
                                    className={`px-3 py-1 text-xs transition ${
                                        lastSeenStatus === 'yes'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setLastSeenStatus(lastSeenStatus === 'no' ? null : 'no')}
                                    className={`px-3 py-1 text-xs border-l border-gray-300 transition ${
                                        lastSeenStatus === 'no'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                            <input
                                type='date'
                                placeholder='DD/MM/YYYY'
                                value={dateRanges.lastSeen.start || ''}
                                onChange={(e) =>
                                    handleDateRangeChange('lastSeen', e.target.value, dateRanges.lastSeen.end)
                                }
                                className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                            />
                            <div className='flex items-center gap-2'>
                                <span className='text-sm text-gray-500'>To</span>
                                <input
                                    type='date'
                                    placeholder='DD/MM/YYYY'
                                    value={dateRanges.lastSeen.end || ''}
                                    onChange={(e) =>
                                        handleDateRangeChange('lastSeen', dateRanges.lastSeen.start, e.target.value)
                                    }
                                    className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Last Connect */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
                            <label className='text-sm font-medium text-gray-700 '>Last Connect</label>
                            <div className='flex border border-gray-300 rounded-md overflow-hidden bg-[#F0F0F5]'>
                                <button
                                    onClick={() => setLastContactStatus(lastContactStatus === 'yes' ? null : 'yes')}
                                    className={`px-3 py-1 text-xs transition ${
                                        lastContactStatus === 'yes'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setLastContactStatus(lastContactStatus === 'no' ? null : 'no')}
                                    className={`px-3 py-1 text-xs border-l border-gray-300 transition ${
                                        lastContactStatus === 'no'
                                            ? 'bg-white text-black font-semibold'
                                            : 'bg-[#F0F0F5] text-[#696979] hover:bg-gray-50'
                                    }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                            <input
                                type='date'
                                placeholder='DD/MM/YYYY'
                                value={dateRanges.lastContact.start || ''}
                                onChange={(e) =>
                                    handleDateRangeChange('lastContact', e.target.value, dateRanges.lastContact.end)
                                }
                                className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                            />
                            <div className='flex items-center gap-2'>
                                <span className='text-sm text-gray-500'>To</span>
                                <input
                                    type='date'
                                    placeholder='DD/MM/YYYY'
                                    value={dateRanges.lastContact.end || ''}
                                    onChange={(e) =>
                                        handleDateRangeChange(
                                            'lastContact',
                                            dateRanges.lastContact.start,
                                            e.target.value,
                                        )
                                    }
                                    className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='sticky bottom-0 bg-white border-t border-gray-200 px-6 py-2'>
                    <div className='flex justify-end gap-3'>
                        <Button
                            onClick={onClose}
                            className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-800 transition'
                        >
                            Clear
                        </Button>
                        <Button
                            onClick={handleApply}
                            className='px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition'
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
