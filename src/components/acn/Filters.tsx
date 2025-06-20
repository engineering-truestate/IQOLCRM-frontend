import React, { useState, useEffect } from 'react'
import { MdLocationOn } from 'react-icons/md'
import algoliaService, {
    type SearchFilters,
    type FacetValue,
} from '../../services/acn/properties/algoliaPropertiesService'

// ---------- Types ----------
interface AddFilterModalProps {
    isOpen: boolean
    onClose: () => void
    filters: SearchFilters
    onFiltersChange: (filters: SearchFilters) => void
}

const assetTypes = ['Apartment', 'Duplex', 'Triplex', 'Penthouse', 'Villament', 'Plot', 'Villa', 'Row House']

function AssetTypeSelector({
    filters = {},
    onFiltersChange,
}: {
    filters?: SearchFilters
    onFiltersChange: (f: SearchFilters) => void
}) {
    return (
        <div className='flex flex-wrap gap-2 mb-4'>
            {assetTypes.map((type) => (
                <button
                    key={type}
                    onClick={() => onFiltersChange({ ...filters, assetType: [type] })}
                    className={`px-3 py-1 rounded border border-[#E3E3E3] ${filters.assetType?.includes(type) ? 'bg-[#24252E] text-white' : 'bg-white text-black'}`}
                >
                    {type}
                </button>
            ))}
        </div>
    )
}

function RangeSelector({
    label,
    filterKey,
    filters = {},
    onFiltersChange,
    min,
    max,
}: {
    label: string
    filterKey: keyof SearchFilters
    filters?: SearchFilters
    onFiltersChange: (f: SearchFilters) => void
    min: number
    max: number
}) {
    const value = (filters[filterKey] as [number, number]) || [min, max]
    return (
        <div className='my-2'>
            <div className='mb-1 font-normal'>{label}</div>
            <div className='flex gap-2 items-center'>
                <input
                    type='number'
                    value={value[0]}
                    onChange={(e) => onFiltersChange({ ...filters, [filterKey]: [+e.target.value, value[1]] })}
                    className='border border-[#E3E3E3] px-2 py-1 w-20'
                />
                <span>to</span>
                <input
                    type='number'
                    value={value[1]}
                    onChange={(e) => onFiltersChange({ ...filters, [filterKey]: [value[0], +e.target.value] })}
                    className='border border-[#E3E3E3] px-2 py-1 w-20'
                />
                <button className='bg-[#24252E] text-white px-3 py-1 rounded'>Apply</button>
            </div>
        </div>
    )
}

export const AddFilterModal: React.FC<AddFilterModalProps> = ({ isOpen, onClose, filters, onFiltersChange }) => {
    const handleReset = () => {
        onFiltersChange({})
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
                    <button
                        onClick={handleReset}
                        className='text-sm text-[#24252E] border border-[#24252E] px-3 py-1 rounded hover:bg-[#24252E] hover:text-white transition'
                    >
                        Reset
                    </button>
                </div>
                <div className='w-full h-px bg-gray-400 my-5' />
                <div className='mb-1 font-normal'>Asset Type</div>
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>
                <AssetTypeSelector filters={filters} onFiltersChange={onFiltersChange} />
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>
                <RangeSelector
                    label='Price'
                    filterKey='priceRange'
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    min={100}
                    max={2000}
                />
                <div style={{ marginTop: '20px', marginBottom: '20px' }}></div>
            </div>
        </div>
    )
}
