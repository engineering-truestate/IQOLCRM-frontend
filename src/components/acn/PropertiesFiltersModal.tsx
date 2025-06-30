import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import algoliaService from '../../services/acn/properties/algoliaPropertiesService'
import type { SearchFilters, FacetValue } from '../../services/acn/properties/algoliaPropertiesService'
import Button from '../design-elements/Button'
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
const bedroomOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK', '6BHK', '7BHK']
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
    showApplyButton = false,
}: {
    label: string
    value: { min?: number; max?: number }
    onChange: (value: { min?: number; max?: number }) => void
    showApplyButton?: boolean
}) => {
    const [range, setRange] = useState(value)
    const debouncedOnChange = useDebouncedCallback(onChange, 500)

    useEffect(() => {
        setRange(value)
    }, [value])

    const handleChange = (newVal: { min?: number; max?: number }) => {
        setRange(newVal)
        if (!showApplyButton) {
            debouncedOnChange(newVal)
        }
    }

    const handleApply = () => {
        onChange(range)
    }

    return (
        <div className='mb-4'>
            {label && <div className='mb-2 text-sm font-medium text-gray-900'>{label}</div>}
            <div className='flex gap-2 items-center'>
                <input
                    type='number'
                    placeholder='100'
                    value={range.min || ''}
                    onChange={(e) => {
                        handleChange({ ...range, min: e.target.value ? Number(e.target.value) : undefined })
                    }}
                    className='border border-gray-300 px-3 py-2 text-sm w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
                <span className='text-gray-500 text-sm'>to</span>
                <input
                    type='number'
                    placeholder='2000'
                    value={range.max || ''}
                    onChange={(e) => {
                        handleChange({ ...range, max: e.target.value ? Number(e.target.value) : undefined })
                    }}
                    className='border border-gray-300 px-3 py-2 text-sm w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
                {showApplyButton && (
                    <Button
                        onClick={handleApply}
                        className='bg-gray-800 text-white px-4 py-2 text-sm rounded hover:bg-gray-900 transition-colors'
                    >
                        Apply
                    </Button>
                )}
            </div>
        </div>
    )
}

const SearchRadiusSlider = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
    return (
        <div className='mb-4'>
            <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-gray-900'>Search Radius</span>
                <span className='text-xs text-gray-500'>ⓘ</span>
            </div>
            <div className='relative'>
                <input
                    type='range'
                    min='1'
                    max='10'
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider'
                />
                <div className='flex justify-between text-xs text-gray-500 mt-1'>
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                </div>
            </div>
        </div>
    )
}

export const PropertiesFiltersModal: React.FC<PropertiesFiltersModalProps> = ({
    isOpen,
    onClose,
    filters,
    onFiltersChange,
    propertyType,
}) => {
    const [facets, setFacets] = useState<Record<string, FacetValue[]>>({})
    const [_, setDateLimits] = useState<{
        dateOfStatusLastChecked: { min: number; max: number }
    }>({
        dateOfStatusLastChecked: { min: 0, max: Math.floor(Date.now() / 1000) },
    })
    const [activeTab, setActiveTab] = useState('Landmark')
    const [landmarkValue, setLandmarkValue] = useState(filters.landmark || '')
    const [searchRadius, setSearchRadius] = useState(5)
    const [micromarketQuery, setMicromarketQuery] = useState('')

    const debouncedOnFiltersChange = useDebouncedCallback(onFiltersChange, 500)

    // Convert facets to options format
    const getFacetOptions = useCallback(
        (facetName: string) => {
            return (facets[facetName] || []).map(({ value, count }) => ({
                value,
                count,
                label: value,
            }))
        },
        [facets],
    )

    // Memoize micromarket options and filtered suggestions
    const micromarketOptions = useMemo(() => getFacetOptions('micromarket'), [getFacetOptions])
    console.log('Data is Here')
    console.log(getFacetOptions('micromarket'))
    const filteredSuggestions = useMemo(() => {
        if (!micromarketQuery) return []
        return micromarketOptions
            .filter((item) => item.label.toLowerCase().includes(micromarketQuery.toLowerCase()))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
    }, [micromarketQuery, micromarketOptions])

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

    // Sync landmark value
    useEffect(() => {
        if (filters.landmark !== landmarkValue) {
            setLandmarkValue(filters.landmark || '')
        }
    }, [filters.landmark])

    const handleReset = () => {
        onFiltersChange({})
        setSearchRadius(5)
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex'>
            {/* Left overlay (60%) */}
            <div className='w-[60%] h-full bg-black opacity-50' onClick={onClose} role='presentation' />

            {/* Right panel (40%) - Made scrollable */}
            <div className='w-[40%] h-full bg-white shadow-lg animate-slide-in flex flex-col'>
                {/* Fixed header */}
                <div className='flex justify-between items-center p-6 border-b border-gray-200 bg-white'>
                    <h2 className='text-lg font-medium text-gray-900'>Filters</h2>
                    <Button onClick={handleReset} className='text-sm text-red-500 hover:text-red-700 font-medium'>
                        Reset
                    </Button>
                </div>

                {/* Scrollable content */}
                <div className='flex-1 overflow-y-auto p-6 space-y-6'>
                    {/* Asset Type */}
                    <div>
                        <h3 className='text-sm font-medium text-gray-900 mb-3'>Asset Type</h3>
                        <div className='grid grid-cols-5 gap-2'>
                            {assetTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        const currentSelection = filters.assetType || []
                                        const newSelection = currentSelection.includes(type)
                                            ? currentSelection.filter((t) => t !== type)
                                            : [...currentSelection, type]
                                        onFiltersChange({ ...filters, assetType: newSelection })
                                    }}
                                    className={`px-2 py-2 text-xs border rounded transition-colors ${
                                        (filters.assetType || []).includes(type)
                                            ? 'bg-gray-800 text-white border-gray-800'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location Tabs */}
                    <div>
                        <div className='flex bg-[#24252E] rounded-lg p-1 mb-3'>
                            <button
                                onClick={() => setActiveTab('Landmark')}
                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'Landmark' ? 'bg-gray-100 text-black' : 'text-white'
                                }`}
                            >
                                Landmark
                            </button>
                            <button
                                onClick={() => setActiveTab('Micromarket')}
                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'Micromarket' ? 'bg-gray-100 text-black' : 'text-white'
                                }`}
                            >
                                Micromarket
                            </button>
                        </div>

                        {activeTab === 'Landmark' ? (
                            <>
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
                                    label=''
                                    className='w-full'
                                />
                                {landmarkValue !== '' && landmarkValue !== null && landmarkValue !== undefined && (
                                    <SearchRadiusSlider value={searchRadius} onChange={setSearchRadius} />
                                )}
                            </>
                        ) : (
                            <div>
                                <div>
                                    {/* Micromarket Search Input with Icon */}
                                    <div className='flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700'>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            className='h-4 w-4 text-gray-500 mr-2'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z'
                                            />
                                        </svg>
                                        <input
                                            type='text'
                                            value={micromarketQuery}
                                            onChange={(e) => setMicromarketQuery(e.target.value)}
                                            placeholder='Search micromarket'
                                            className='w-full bg-transparent outline-none text-sm'
                                        />
                                    </div>

                                    {/* Suggestion Dropdown */}
                                    {micromarketQuery && filteredSuggestions.length > 0 && (
                                        <div className='mt-1 bg-white border border-gray-300 rounded-md shadow-sm max-h-60 overflow-y-auto z-10 relative'>
                                            {filteredSuggestions.map((item) => (
                                                <div
                                                    key={item.value}
                                                    className='px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                                                    onClick={() => {
                                                        const current = filters.micromarket || []
                                                        if (!current.includes(item.value)) {
                                                            onFiltersChange({
                                                                ...filters,
                                                                micromarket: [...current, item.value],
                                                            })
                                                        }
                                                        setMicromarketQuery('')
                                                    }}
                                                >
                                                    {item.label} ({item.count})
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Top + Selected Micromarkets as Buttons */}
                                    <div className='mt-4'>
                                        {/* <h3 className='text-sm font-medium text-gray-900 mb-3'>Top Micromarkets</h3> */}
                                        <div className='flex gap-2 flex-wrap'>
                                            {Array.from(
                                                new Map(
                                                    [
                                                        // Top 10 micromarkets
                                                        ...getFacetOptions('micromarket')
                                                            .sort((a, b) => b.count - a.count)
                                                            .slice(0, 10),
                                                        // Ensure all selected micromarkets also appear
                                                        ...(filters.micromarket || []).map((value) => ({
                                                            value,
                                                            count:
                                                                getFacetOptions('micromarket').find(
                                                                    (o) => o.value === value,
                                                                )?.count || 0,
                                                        })),
                                                    ].map((item) => [item.value, item]), // Deduplicate using Map
                                                ).values(),
                                            ).map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        const currentSelection = filters.micromarket || []
                                                        const isSelected = currentSelection.includes(option.value)
                                                        const newSelection = isSelected
                                                            ? currentSelection.filter((v) => v !== option.value)
                                                            : [...currentSelection, option.value]
                                                        onFiltersChange({ ...filters, micromarket: newSelection })
                                                    }}
                                                    className={`px-3 py-2 text-sm border rounded transition-colors ${
                                                        (filters.micromarket || []).includes(option.value)
                                                            ? 'bg-gray-800 text-white border-gray-800'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                                    }`}
                                                >
                                                    {option.value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bedroom */}
                    <div>
                        <h3 className='text-sm font-medium text-gray-900 mb-3'>Bedroom</h3>
                        <div className='flex gap-2 flex-wrap'>
                            {bedroomOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        const currentSelection = filters.unitType || []
                                        const newSelection = currentSelection.includes(option)
                                            ? currentSelection.filter((v) => v !== option)
                                            : [...currentSelection, option]
                                        onFiltersChange({ ...filters, unitType: newSelection })
                                    }}
                                    className={`px-3 py-2 text-sm border rounded transition-colors ${
                                        (filters.unitType || []).includes(option)
                                            ? 'bg-gray-800 text-white border-gray-800'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bathroom */}
                    <div>
                        <h3 className='text-sm font-medium text-gray-900 mb-3'>Bathroom</h3>
                        <div className='flex gap-2'>
                            {bathroomOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        const currentSelection = filters.noOfBathrooms || []
                                        const newSelection = currentSelection.includes(option)
                                            ? currentSelection.filter((v) => v !== option)
                                            : [...currentSelection, option]
                                        onFiltersChange({ ...filters, noOfBathrooms: newSelection })
                                    }}
                                    className={`w-8 h-8 text-sm border rounded transition-colors ${
                                        (filters.noOfBathrooms || []).includes(option)
                                            ? 'bg-gray-800 text-white border-gray-800'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Balcony */}
                    <div>
                        <h3 className='text-sm font-medium text-gray-900 mb-3'>Balcony</h3>
                        <div className='flex gap-2'>
                            {balconyOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        const currentSelection = filters.noOfBalcony || []
                                        const newSelection = currentSelection.includes(option)
                                            ? currentSelection.filter((v) => v !== option)
                                            : [...currentSelection, option]
                                        onFiltersChange({ ...filters, noOfBalcony: newSelection })
                                    }}
                                    className={`w-8 h-8 text-sm border rounded transition-colors ${
                                        (filters.noOfBalcony || []).includes(option)
                                            ? 'bg-gray-800 text-white border-gray-800'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price */}
                    <RangeInput
                        label='Price'
                        value={filters.totalAskPrice || {}}
                        onChange={(value) => onFiltersChange({ ...filters, totalAskPrice: value })}
                        showApplyButton={true}
                    />

                    {/* Ask Price/sqft */}
                    <RangeInput
                        label='Ask Price/sqft'
                        value={filters.askPricePerSqft || {}}
                        onChange={(value) => onFiltersChange({ ...filters, askPricePerSqft: value })}
                        showApplyButton={true}
                    />

                    {/* SBUA */}
                    <RangeInput
                        label='SBUA (sqft)'
                        value={filters.sbua || {}}
                        onChange={(value) => onFiltersChange({ ...filters, sbua: value })}
                        showApplyButton={true}
                    />

                    {/* Facing & Floor */}
                    <div className=' grid grid-cols-2 gap-4 w-[88%] '>
                        <div>
                            <h3 className='text-sm font-medium text-gray-900 mb-3'>Facing</h3>
                            <div className='relative'>
                                <select
                                    className='w-full border border-gray-300 rounded-lg p-2 text-sm bg-white appearance-none pr-8'
                                    onChange={(e) => {
                                        const value = e.target.value
                                        if (value) {
                                            onFiltersChange({ ...filters, facing: [value] })
                                        }
                                    }}
                                    value={(filters.facing && filters.facing[0]) || ''}
                                >
                                    <option value=''>Select</option>
                                    {getFacetOptions('facing').map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                                    <svg
                                        className='w-4 h-4 text-gray-400'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M19 9l-7 7-7-7'
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className='text-sm font-medium text-gray-900 mb-3'>Floor</h3>
                            <div className='relative'>
                                <select
                                    className='w-full border border-gray-300 rounded-lg p-2 text-sm bg-white appearance-none pr-8'
                                    onChange={(e) => {
                                        const value = e.target.value
                                        if (value) {
                                            onFiltersChange({ ...filters, exactFloor: [value] })
                                        }
                                    }}
                                    value={(filters.exactFloor && filters.exactFloor[0]) || ''}
                                >
                                    <option value=''>Select</option>
                                    {getFacetOptions('exactFloor').map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                                    <svg
                                        className='w-4 h-4 text-gray-400'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M19 9l-7 7-7-7'
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Area */}
                    <div>
                        <h3 className='text-sm font-medium text-gray-900 mb-3'>Area</h3>
                        <div className='grid grid-cols-4 gap-2'>
                            {areaOptions.map((area) => (
                                <button
                                    key={area}
                                    onClick={() => {
                                        const currentSelection = filters.area || []
                                        const newSelection = currentSelection.includes(area)
                                            ? currentSelection.filter((a) => a !== area)
                                            : [...currentSelection, area]
                                        onFiltersChange({ ...filters, area: newSelection })
                                    }}
                                    className={`px-3 py-2 text-xs border rounded transition-colors ${
                                        (filters.area || []).includes(area)
                                            ? 'bg-gray-800 text-white border-gray-800'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Carpet Area */}
                    <RangeInput
                        label='Carpet Area (sqft)'
                        value={filters.carpet || {}}
                        onChange={(value) => onFiltersChange({ ...filters, carpet: value })}
                        showApplyButton={true}
                    />

                    {/* Availability */}
                    <div>
                        <h3 className='text-sm font-medium text-gray-900 mb-3'>Availability</h3>
                        <div className='flex gap-2'>
                            {availabilityOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        const newSelection = (filters.currentStatus || []).includes(option)
                                            ? []
                                            : [option]
                                        onFiltersChange({ ...filters, currentStatus: newSelection })
                                    }}
                                    className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                                        (filters.currentStatus || []).includes(option)
                                            ? 'bg-gray-800 text-white border-gray-800'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Add some bottom padding for better scrolling */}
                    <div className='h-4'></div>
                </div>
            </div>
        </div>
    )
}
