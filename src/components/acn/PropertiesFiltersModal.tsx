import React, { useState, useEffect, useCallback, useRef } from 'react'
import algoliaService from '../../services/acn/properties/algoliaPropertiesService'
import type { SearchFilters, FacetValue } from '../../services/acn/properties/algoliaPropertiesService'
import AlgoliaFacetMultiSelect from '../design-elements/AlgoliaFacetMultiSelect'
import DateRangePicker from '../design-elements/DateRangePicker'
import Button from '../design-elements/Button'
import { getUnixDateTimeCustom } from '../helper/getUnixDateTime'
import { SelectionGroup } from '../design-elements/SelectionButtonsGroup'
import StateBaseTextField from '../design-elements/StateBaseTextField'
import PlacesSearch from '../design-elements/PlacesSearch'

function useDebouncedCallback<A extends any[]>(callback: (...args: A) => void, wait: number): (...args: A) => void {
    const timeoutId = useRef<NodeJS.Timeout | null>(null)
    return useCallback(
        (...args: A) => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current)
            }
            timeoutId.current = setTimeout(() => {
                callback(...args)
            }, wait)
        },
        [callback, wait],
    )
}

// ---------- Types ----------
interface PropertiesFiltersModalProps {
    isOpen: boolean
    onClose: () => void
    filters: SearchFilters
    onFiltersChange: (filters: SearchFilters) => void
    propertyType: 'Resale' | 'Rental'
}

const assetTypes = ['Apartment', 'Duplex', 'Triplex', 'Penthouse', 'Villament', 'Plot', 'Villa', 'Row House']
const bedroomOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK']
const bathroomOptions = ['1', '2', '3', '4', '5']
const balconyOptions = ['1', '2', '3', '4', '5']
const availabilityOptions = ['Ready-to-move', 'Not Ready-to-move']
const areaOptions = [
    'Centre Bangalore',
    'North Bangalore',
    'South Bangalore',
    'East Bangalore',
    'West Bangalore',
    'PAN Bangalore',
]

const RangeInput = ({
    label,
    value,
    onChange,
}: {
    label: string
    value: { min?: number; max?: number }
    onChange: (value: { min?: number; max?: number }) => void
}) => {
    const [range, setRange] = useState(value)
    const debouncedOnChange = useDebouncedCallback(onChange, 500)

    useEffect(() => {
        setRange(value)
    }, [value])

    const handleChange = (newVal: { min?: number; max?: number }) => {
        setRange(newVal)
        debouncedOnChange(newVal)
    }

    return (
        <div className='my-2'>
            <div className='mb-1 font-normal'>{label}</div>
            <div className='flex gap-2 items-center'>
                <input
                    type='number'
                    placeholder='Min'
                    value={range.min || ''}
                    onChange={(e) => {
                        handleChange({ ...range, min: e.target.value ? Number(e.target.value) : undefined })
                    }}
                    className='border border-[#E3E3E3] px-2 py-1 w-full rounded'
                />
                <span className='text-gray-500'>to</span>
                <input
                    type='number'
                    placeholder='Max'
                    value={range.max || ''}
                    onChange={(e) => {
                        handleChange({ ...range, max: e.target.value ? Number(e.target.value) : undefined })
                    }}
                    className='border border-[#E3E3E3] px-2 py-1 w-full rounded'
                />
            </div>
        </div>
    )
}

// Helper function to get Unix timestamp from date string
const getUnixTimestamp = (dateString: string): number => {
    return getUnixDateTimeCustom(dateString)
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
    if (!unixTimestamp) return ''
    return new Date(unixTimestamp * 1000).toISOString().split('T')[0]
}

export const PropertiesFiltersModal: React.FC<PropertiesFiltersModalProps> = ({
    isOpen,
    onClose,
    filters,
    onFiltersChange,
    propertyType,
}) => {
    const [facets, setFacets] = useState<Record<string, FacetValue[]>>({})
    const [dateLimits, setDateLimits] = useState<{
        dateOfStatusLastChecked: { min: number; max: number }
    }>({
        dateOfStatusLastChecked: { min: 0, max: Math.floor(Date.now() / 1000) },
    })
    const [dateRanges, setDateRanges] = useState<{
        dateOfStatusLastChecked: { start?: string; end?: string }
    }>({
        dateOfStatusLastChecked: {},
    })
    const [activeTab, setActiveTab] = useState('Micromarket')
    const [landmarkValue, setLandmarkValue] = useState(filters.landmark || '')
    const debouncedOnFiltersChange = useDebouncedCallback(onFiltersChange, 500)

    useEffect(() => {
        // When switching tabs, clear the filter for the inactive tab to avoid confusion.
        const newFilters = { ...filters }
        let changed = false

        if (activeTab === 'Landmark' && newFilters.micromarket) {
            delete newFilters.micromarket
            changed = true
        } else if (activeTab === 'Micromarket' && newFilters.landmark) {
            delete newFilters.landmark
            changed = true
        }

        if (changed) {
            onFiltersChange(newFilters)
        }
    }, [activeTab, filters, onFiltersChange])

    // Fetch facets when modal opens
    useEffect(() => {
        const fetchData = async () => {
            try {
                const allFacets = await algoliaService.getAllFacets(propertyType)
                setFacets(allFacets)

                // Get date limits from facets
                const statusFacets = allFacets.dateOfStatusLastChecked || []
                if (statusFacets.length > 0) {
                    const timestamps = statusFacets.map((f) => parseInt(f.value)).filter((t) => !isNaN(t))

                    if (timestamps.length > 0) {
                        setDateLimits({
                            dateOfStatusLastChecked: {
                                min: Math.min(...timestamps),
                                max: Math.max(...timestamps),
                            },
                        })
                    }
                }
            } catch (err) {
                console.error('Failed to fetch property facets:', err)
                setFacets({})
            }
        }

        if (isOpen) {
            fetchData()
        }
    }, [isOpen, propertyType])

    // Reset local filters when modal opens with new filters
    useEffect(() => {
        // onFiltersChange({}) // This was causing an infinite re-render loop.
        // Convert Unix timestamps back to date strings for display
        setDateRanges({
            dateOfStatusLastChecked: {
                start: filters.dateOfStatusLastCheckedFrom
                    ? unixToDateString(parseInt(filters.dateOfStatusLastCheckedFrom))
                    : undefined,
                end: filters.dateOfStatusLastCheckedTo
                    ? unixToDateString(parseInt(filters.dateOfStatusLastCheckedTo))
                    : undefined,
            },
        })
    }, [filters])

    // Sync landmark value
    useEffect(() => {
        if (filters.landmark !== landmarkValue) {
            setLandmarkValue(filters.landmark || '')
        }
    }, [filters.landmark])

    const handleLandmarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLandmarkValue(e.target.value)
        debouncedOnFiltersChange({ ...filters, landmark: e.target.value })
    }

    const handleReset = () => {
        onFiltersChange({})
    }

    // Convert facets to options format
    const getFacetOptions = (facetName: string) => {
        return (facets[facetName] || []).map(({ value, count }) => ({
            value,
            count,
            label: value,
        }))
    }

    // Handle date range changes
    const handleDateRangeChange = (start?: string | null, end?: string | null) => {
        const updatedFilters = { ...filters }

        if (start) {
            const startTimestamp = getStartOfDayTimestamp(start)
            updatedFilters.dateOfStatusLastCheckedFrom = Math.max(
                startTimestamp,
                dateLimits.dateOfStatusLastChecked.min,
            ).toString()
        } else {
            delete updatedFilters.dateOfStatusLastCheckedFrom
        }

        if (end) {
            const endTimestamp = getEndOfDayTimestamp(end)
            updatedFilters.dateOfStatusLastCheckedTo = Math.min(
                endTimestamp,
                dateLimits.dateOfStatusLastChecked.max,
            ).toString()
        } else {
            delete updatedFilters.dateOfStatusLastCheckedTo
        }

        onFiltersChange(updatedFilters)
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex'>
            {/* Left overlay (60%) */}
            <div className='w-[60%] h-full bg-black opacity-50' onClick={onClose} role='presentation' />
            {/* Right panel (40%) */}
            <div className='w-[40%] h-full overflow-y-auto bg-white p-6 shadow-lg animate-slide-in'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-normal'>Filters</h2>
                    <Button
                        onClick={handleReset}
                        className='text-sm border border-[#24252E] px-3 py-1 rounded hover:bg-[#24252E] hover:text-white transition'
                    >
                        Reset
                    </Button>
                </div>
                <div className='w-full h-px bg-gray-400 my-5' />

                {/* Status & KAM Name */}
                <div className='flex gap-4 mb-4'>
                    <div className='flex-1 flex flex-col gap-2'>
                        <span className='text-[15px] text-semibold text-[#0A0B0A]'>Status</span>
                        <AlgoliaFacetMultiSelect
                            options={getFacetOptions('status')}
                            selectedValues={filters.status || []}
                            onSelectionChange={(values) => onFiltersChange({ ...filters, status: values })}
                            placeholder='Please Select'
                            label='Status'
                            className='w-full text-sm text-[#696979]'
                            triggerClassName='w-full border border-gray-300 rounded p-3'
                        />
                    </div>
                    <div className='flex-1 flex flex-col gap-2'>
                        <span className='text-[15px] text-semibold text-[#0A0B0A]'>KAM Name</span>
                        <AlgoliaFacetMultiSelect
                            options={getFacetOptions('kamName')}
                            selectedValues={filters.kamName || []}
                            onSelectionChange={(values) => onFiltersChange({ ...filters, kamName: values })}
                            placeholder='Please Select'
                            label='KAM Name'
                            className='w-full text-sm text-[#696979]'
                            triggerClassName='w-full border border-gray-300 rounded p-3'
                        />
                    </div>
                </div>

                {/* Asset Type */}
                <div className='mb-4'>
                    <span className='text-[15px] text-semibold text-[#0A0B0A] mb-2 block'>Asset Type</span>
                    <SelectionGroup
                        title='Asset Type'
                        options={assetTypes.map((value) => ({ value, label: value }))}
                        defaultValues={filters.assetType || []}
                        onChange={(selected: string[]) => onFiltersChange({ ...filters, assetType: selected })}
                        multiSelect={true}
                        type='checkbox'
                    />
                </div>

                {/* Micromarket / Landmark */}
                <div className='mb-4'>
                    <div className='flex items-center bg-gray-100 rounded-md p-1'>
                        <button
                            onClick={() => setActiveTab('Landmark')}
                            className={`flex-1 px-3 py-1 text-sm font-medium rounded transition-colors ${
                                activeTab === 'Landmark'
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-600 hover:text-black'
                            }`}
                        >
                            Landmark
                        </button>
                        <button
                            onClick={() => setActiveTab('Micromarket')}
                            className={`flex-1 px-3 py-1 text-sm font-medium rounded transition-colors ${
                                activeTab === 'Micromarket'
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-600 hover:text-black'
                            }`}
                        >
                            Micromarket
                        </button>
                    </div>

                    <div className='mt-2'>
                        {activeTab === 'Landmark' ? (
                            <PlacesSearch
                                selectedPlace={
                                    landmarkValue
                                        ? { name: landmarkValue, address: '', lat: 0, lng: 0, mapLocation: '' }
                                        : null
                                }
                                setSelectedPlace={(place) => {
                                    setLandmarkValue(place?.name || '')
                                    debouncedOnFiltersChange({ ...filters, landmark: place?.name || '' })
                                }}
                                placeholder='Search by landmark'
                                label='Landmark'
                                className='w-full'
                            />
                        ) : (
                            <AlgoliaFacetMultiSelect
                                options={getFacetOptions('micromarket')}
                                selectedValues={filters.micromarket || []}
                                onSelectionChange={(values: string[]) =>
                                    onFiltersChange({ ...filters, micromarket: values })
                                }
                                placeholder='Search by micromarket'
                                label='Micromarket'
                                triggerClassName='w-full border border-gray-300 rounded p-3'
                            />
                        )}
                    </div>
                </div>

                {/* Price Range */}
                <div className='mb-4'>
                    <span className='text-[15px] text-semibold text-[#0A0B0A] mb-2 block'>Price Range (in Lakhs)</span>
                    <RangeInput
                        label=''
                        value={filters.totalAskPrice || {}}
                        onChange={(value) => debouncedOnFiltersChange({ ...filters, totalAskPrice: value })}
                    />
                </div>

                {/* Date Range */}
                <div className='mb-4'>
                    <span className='text-[15px] text-semibold text-[#0A0B0A] mb-2 block'>Last Status Check</span>
                    <DateRangePicker
                        onDateRangeChange={handleDateRangeChange}
                        placeholder='Select Last Status Check Range'
                        className='w-full'
                        triggerClassName='w-full'
                    />
                    <div className='text-xs text-gray-500 mt-1'>
                        Available range: {unixToDateString(dateLimits.dateOfStatusLastChecked.min)} to{' '}
                        {unixToDateString(dateLimits.dateOfStatusLastChecked.max)}
                    </div>
                </div>

                {/* Bedroom */}
                <div className='mb-4'>
                    <span className='text-[15px] text-semibold text-[#0A0B0A] mb-2 block'>Bedroom</span>
                    <SelectionGroup
                        title='Bedroom'
                        options={bedroomOptions.map((value) => ({ value, label: value }))}
                        defaultValues={filters.unitType || []}
                        onChange={(selected: string[]) => onFiltersChange({ ...filters, unitType: selected })}
                        multiSelect={true}
                        type='checkbox'
                    />
                </div>

                {/* Bathroom */}
                <div className='mb-4'>
                    <span className='text-[15px] text-semibold text-[#0A0B0A] mb-2 block'>Bathroom</span>
                    <SelectionGroup
                        title='Bathroom'
                        options={bathroomOptions.map((value) => ({ value, label: value }))}
                        defaultValues={filters.noOfBathrooms || []}
                        onChange={(selected: string[]) => onFiltersChange({ ...filters, noOfBathrooms: selected })}
                        multiSelect={true}
                        type='checkbox'
                    />
                </div>

                {/* Balcony */}
                <div className='mb-4'>
                    <span className='text-[15px] text-semibold text-[#0A0B0A] mb-2 block'>Balcony</span>
                    <SelectionGroup
                        title='Balcony'
                        options={balconyOptions.map((value) => ({ value, label: value }))}
                        defaultValues={filters.noOfBalcony || []}
                        onChange={(selected: string[]) => onFiltersChange({ ...filters, noOfBalcony: selected })}
                        multiSelect={true}
                        type='checkbox'
                    />
                </div>

                {/* Ask Price/sqft */}
                <div className='mb-4'>
                    <span className='text-[15px] text-semibold text-[#0A0B0A] mb-2 block'>Ask Price/sqft</span>
                    <RangeInput
                        label=''
                        value={filters.askPricePerSqft || {}}
                        onChange={(value) => debouncedOnFiltersChange({ ...filters, askPricePerSqft: value })}
                    />
                </div>

                {/* SBUA (sqft) */}
                <div className='mb-4'>
                    <span className='text-[15px] text-semibold text-[#0A0B0A] mb-2 block'>SBUA (sqft)</span>
                    <RangeInput
                        label=''
                        value={filters.sbua || {}}
                        onChange={(value) => debouncedOnFiltersChange({ ...filters, sbua: value })}
                    />
                </div>

                {/* Facing & Floor */}
                <div className='flex gap-4 mt-4 mb-4'>
                    <div className='flex-1 flex flex-col gap-2'>
                        <span className='text-[15px] text-semibold text-[#0A0B0A]'>Facing</span>
                        <AlgoliaFacetMultiSelect
                            options={getFacetOptions('facing')}
                            selectedValues={filters.facing || []}
                            onSelectionChange={(values: string[]) => onFiltersChange({ ...filters, facing: values })}
                            placeholder='Select Facing'
                            label='Facing'
                            className='w-full'
                            triggerClassName='w-full border border-gray-300 rounded p-3'
                        />
                    </div>
                    <div className='flex-1 flex flex-col gap-2'>
                        <span className='text-[15px] text-semibold text-[#0A0B0A]'>Floor</span>
                        <AlgoliaFacetMultiSelect
                            options={getFacetOptions('exactFloor')}
                            selectedValues={filters.exactFloor || []}
                            onSelectionChange={(values: string[]) =>
                                onFiltersChange({ ...filters, exactFloor: values })
                            }
                            placeholder='Select Floor'
                            label='Floor'
                            className='w-full'
                            triggerClassName='w-full border border-gray-300 rounded p-3'
                        />
                    </div>
                </div>

                {/* Area */}
                <div className='mb-4'>
                    <span className='text-[15px] text-semibold text-[#0A0B0A] mb-2 block'>Area</span>
                    <SelectionGroup
                        title='Area'
                        options={areaOptions.map((value) => ({ value, label: value }))}
                        defaultValues={filters.area || []}
                        onChange={(selected: string[]) => onFiltersChange({ ...filters, area: selected })}
                        multiSelect={true}
                        type='checkbox'
                    />
                </div>

                {/* Carpet Area (sqft) */}
                <div className='mb-4'>
                    <span className='text-[15px] text-semibold text-[#0A0B0A] mb-2 block'>Carpet Area (sqft)</span>
                    <RangeInput
                        label=''
                        value={filters.carpet || {}}
                        onChange={(value) => debouncedOnFiltersChange({ ...filters, carpet: value })}
                    />
                </div>

                {/* Availability */}
                <div className='mb-4'>
                    <span className='text-[15px] text-semibold text-[#0A0B0A] mb-2 block'>Availability</span>
                    <SelectionGroup
                        title='Availability'
                        options={availabilityOptions.map((value) => ({ value, label: value }))}
                        defaultValues={filters.currentStatus || []}
                        onChange={(selected: string[]) => onFiltersChange({ ...filters, currentStatus: selected })}
                        multiSelect={false}
                        type='radio'
                    />
                </div>
            </div>
        </div>
    )
}
