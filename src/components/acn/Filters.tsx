import React, { useState, useEffect } from 'react'
import { MdLocationOn } from 'react-icons/md'
import algoliaService, {
    type SearchFilters,
    type FacetValue,
} from '../../services/acn/properties/algoliaPropertiesService'

// ---------- Types ----------
type SelectorProps = {
    selected: string[]
    onChange: (value: string) => void
    facets: FacetValue[]
}

type TabSelectorProps = {
    selectedTab: string
    onTabChange: (value: string) => void
    landmark: string
    onLandmarkChange: (value: string) => void
}

type NumberSelectorProps = {
    label: string
    values: number[]
    selected: number | null
    onChange: (value: number) => void
}

type RangeSelectorProps = {
    label: string
    min: number
    max: number
    onChange: (value: [number, number]) => void
}

type DropdownProps = {
    label: string
    options: string[]
    selected: string
    onChange: (value: string) => void
}

// ---------- Components ----------

const assetTypes = ['Apartment', 'Duplex', 'Triplex', 'Penthouse', 'Villament', 'Plot', 'Villa', 'Row House']

function AssetTypeSelector({ selected, onChange, facets }: SelectorProps) {
    return (
        <div className='flex flex-wrap gap-2 mb-4'>
            {facets.map((facet) => (
                <button
                    key={facet.value}
                    onClick={() => onChange(facet.value)}
                    className={`px-3 py-1 rounded border border-[#E3E3E3] ${
                        selected.includes(facet.value) ? 'bg-[#24252E] text-white' : 'bg-white text-black'
                    }`}
                >
                    {facet.value} ({facet.count})
                </button>
            ))}
        </div>
    )
}

function LocationSelector({ selectedTab, onTabChange, landmark, onLandmarkChange }: TabSelectorProps) {
    return (
        <div className='mb-4'>
            <div className='flex'>
                <button
                    onClick={() => onTabChange('Landmark')}
                    className={`flex-1 p-2 ${
                        selectedTab === 'Landmark' ? 'bg-[#24252E] text-white' : 'bg-gray-300 text-black'
                    }`}
                >
                    Landmark
                </button>
                <button
                    onClick={() => onTabChange('Micromarket')}
                    className={`flex-1 p-2 ${
                        selectedTab === 'Micromarket' ? 'bg-[#24252E] text-white' : 'bg-gray-300 text-black'
                    }`}
                >
                    Micromarket
                </button>
            </div>

            {/* Input with location icon */}
            <div className='relative w-full mt-2'>
                <span className='absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500'>
                    <MdLocationOn />
                </span>
                <input
                    type='text'
                    value={landmark}
                    onChange={(e) => onLandmarkChange(e.target.value)}
                    placeholder='Search by landmark'
                    className='w-full border p-2 pl-10'
                />
            </div>
        </div>
    )
}

export default LocationSelector

function NumberSelector({ label, values, selected, onChange }: NumberSelectorProps) {
    return (
        <div className='my-2'>
            <div className='mb-1 font-normal'>{label}</div>
            <div className='flex gap-2'>
                {values.map((value) => (
                    <button
                        key={value}
                        onClick={() => onChange(value)}
                        className={`px-3 py-1 border border-[#E3E3E3] rounded ${selected === value ? 'bg-[#24252E] text-white' : 'bg-white text-black'}`}
                    >
                        {value}
                    </button>
                ))}
            </div>
        </div>
    )
}

function RangeSelector({ label, min, max, onChange }: RangeSelectorProps) {
    return (
        <div className='my-2'>
            <div className='mb-1 font-normal'>{label}</div>
            <div className='flex gap-2 items-center'>
                <input
                    type='number'
                    value={min}
                    onChange={(e) => onChange([+e.target.value, max])}
                    className='border border-[#E3E3E3] px-2 py-1 w-20'
                />
                <span>to</span>
                <input
                    type='number'
                    value={max}
                    onChange={(e) => onChange([min, +e.target.value])}
                    className='border border-[#E3E3E3] px-2 py-1 w-20'
                />
                <button className='bg-[#24252E] text-white px-3 py-1 rounded'>Apply</button>
            </div>
        </div>
    )
}

function SelectDropdown({ label, options, selected, onChange }: DropdownProps) {
    return (
        <div className='my-2'>
            <div className='mb-1 font-normal'>{label}</div>
            <select value={selected} onChange={(e) => onChange(e.target.value)} className='border px-2 py-1'>
                <option value=''>Select</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    )
}

// ---------- Modal ----------

interface AddFilterModalProps {
    isOpen: boolean
    onClose: () => void
    onApplyFilters?: (filters: SearchFilters) => void
}

export const AddFilterModal: React.FC<AddFilterModalProps> = ({ isOpen, onClose, onApplyFilters }) => {
    // Algolia state
    const [facets, setFacets] = useState<Record<string, FacetValue[]>>({})

    // Filter state
    const [assetTypes, setAssetTypes] = useState<string[]>([])
    const [selectedTab, setSelectedTab] = useState('Landmark')
    const [landmark, setLandmark] = useState('')
    const [bedroom, setBedroom] = useState<number | null>(null)
    const [bathroom, setBathroom] = useState<number | null>(null)
    const [balcony, setBalcony] = useState<number | null>(null)
    const [price, setPrice] = useState<[number, number]>([100, 2000])
    const [sbua, setSbua] = useState<[number, number]>([100, 2000])
    const [facing, setFacing] = useState<string[]>([])
    const [floor, setFloor] = useState<string[]>([])
    const [carpet, setCarpet] = useState<[number, number]>([100, 2000])
    const [availability, setAvailability] = useState<string[]>([])
    const [pricePerSqft, setPricePerSqft] = useState<[number, number]>([100, 2000])
    const [area, setArea] = useState('')

    // Load facets on component mount
    useEffect(() => {
        const loadFacets = async () => {
            try {
                const facetData = await algoliaService.getAllFacets()
                setFacets(facetData)
            } catch (error) {
                console.error('Failed to load facets:', error)
            }
        }

        if (isOpen) {
            loadFacets()
        }
    }, [isOpen])

    const handleReset = () => {
        setAssetTypes([])
        setSelectedTab('Landmark')
        setLandmark('')
        setBedroom(null)
        setBathroom(null)
        setBalcony(null)
        setPrice([100, 2000])
        setSbua([100, 2000])
        setFacing([])
        setFloor([])
        setCarpet([100, 2000])
        setAvailability([])
        setPricePerSqft([100, 2000])
        setArea('')
    }

    const handleApply = () => {
        const filters: SearchFilters = {
            assetType: assetTypes,
            priceRange: {
                min: price[0],
                max: price[1],
            },
        }

        if (onApplyFilters) {
            onApplyFilters(filters)
        }
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex'>
            {/* Left overlay (60%) */}
            <div className='w-[60%] h-full bg-black opacity-50' onClick={onClose} role='presentation' />
            {/* Right modal (40%) */}
            <div className='w-[40%] h-full overflow-y-auto bg-white p-4 shadow-lg animate-slide-in'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-normal'>Filters</h2>
                    <div className='flex gap-2'>
                        <button
                            onClick={handleReset}
                            className='text-sm text-[#24252E] border border-[#24252E] px-3 py-1 rounded hover:bg-[#24252E] hover:text-white transition'
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleApply}
                            className='text-sm bg-[#24252E] text-white px-3 py-1 rounded hover:opacity-90 transition'
                        >
                            Apply
                        </button>
                    </div>
                </div>
                <div className='w-full h-px bg-gray-400 my-5' />
                <div className='mb-1 font-normal'>Asset Type</div>
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>

                <AssetTypeSelector
                    selected={assetTypes}
                    onChange={(value) => {
                        setAssetTypes((prev) =>
                            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
                        )
                    }}
                    facets={facets.assetType || []}
                />
                <LocationSelector
                    selectedTab={selectedTab}
                    onTabChange={setSelectedTab}
                    landmark={landmark}
                    onLandmarkChange={setLandmark}
                />
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>

                <NumberSelector label='Bedroom' values={[1, 2, 3, 4, 5]} selected={bedroom} onChange={setBedroom} />
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>

                <NumberSelector label='Bathroom' values={[1, 2, 3, 4, 5]} selected={bathroom} onChange={setBathroom} />
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>

                <NumberSelector label='Balcony' values={[1, 2, 3, 4, 5]} selected={balcony} onChange={setBalcony} />
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>

                <RangeSelector label='Price' min={price[0]} max={price[1]} onChange={setPrice} />
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>

                <RangeSelector label='SBUA (sqft)' min={sbua[0]} max={sbua[1]} onChange={setSbua} />
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>

                <div className='my-2'>
                    <div className='mb-1 font-normal'>Facing</div>
                    <div className='flex flex-wrap gap-2'>
                        {['North', 'South', 'East', 'West'].map((direction) => (
                            <button
                                key={direction}
                                onClick={() => {
                                    setFacing((prev) =>
                                        prev.includes(direction)
                                            ? prev.filter((v) => v !== direction)
                                            : [...prev, direction],
                                    )
                                }}
                                className={`px-3 py-1 rounded border ${
                                    facing.includes(direction) ? 'bg-[#24252E] text-white' : 'bg-white text-black'
                                }`}
                            >
                                {direction}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>

                <div className='my-2'>
                    <div className='mb-1 font-normal'>Floor</div>
                    <div className='flex flex-wrap gap-2'>
                        {['Ground', '1', '2', '3+'].map((floorOption) => (
                            <button
                                key={floorOption}
                                onClick={() => {
                                    setFloor((prev) =>
                                        prev.includes(floorOption)
                                            ? prev.filter((v) => v !== floorOption)
                                            : [...prev, floorOption],
                                    )
                                }}
                                className={`px-3 py-1 rounded border ${
                                    floor.includes(floorOption) ? 'bg-[#24252E] text-white' : 'bg-white text-black'
                                }`}
                            >
                                {floorOption}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>

                <div className='my-2'>
                    <div className='mb-1 font-normal'>Area</div>
                    <div className='flex flex-wrap gap-2'>
                        {[
                            'Centre Bangalore',
                            'North Bangalore',
                            'South Bangalore',
                            'East Bangalore',
                            'West Bangalore',
                            'PAN Bangalore',
                        ].map((areaOption) => (
                            <button
                                key={areaOption}
                                onClick={() => setArea(area === areaOption ? '' : areaOption)}
                                className={`px-3 py-1 rounded border ${
                                    area === areaOption ? 'bg-[#24252E] text-white' : 'bg-white text-black'
                                }`}
                            >
                                {areaOption}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>
                <RangeSelector label='Carpet Area (sqft)' min={carpet[0]} max={carpet[1]} onChange={setCarpet} />
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>
                <div className='my-2'>
                    <div className='mb-1 font-normal'>Availability</div>
                    <div className='flex flex-wrap gap-2'>
                        {['Low', 'Ready-to-move', 'Not Ready-to-move'].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setAvailability((prev) =>
                                        prev.includes(status) ? prev.filter((v) => v !== status) : [...prev, status],
                                    )
                                }}
                                className={`px-3 py-1 rounded border ${
                                    availability.includes(status) ? 'bg-[#24252E] text-white' : 'bg-white text-black'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>
                <RangeSelector
                    label='Ask Price/sqft'
                    min={pricePerSqft[0]}
                    max={pricePerSqft[1]}
                    onChange={setPricePerSqft}
                />
            </div>
        </div>
    )
}
