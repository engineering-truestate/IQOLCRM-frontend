import React, { useState, useRef, useEffect } from 'react'
import { toCapitalizedWords } from '../helper/toCapitalize'

interface FacetOption {
    value: string
    count: number
}

interface AlgoliaFacetMultiSelectProps {
    options: FacetOption[]
    selectedValues: string[]
    onSelectionChange: (values: string[]) => void
    placeholder: string
    label: string
    facets?: Record<string, number>
    className?: string
    triggerClassName?: string
    menuClassName?: string
    optionClassName?: string
}

const AlgoliaFacetMultiSelect: React.FC<AlgoliaFacetMultiSelectProps> = ({
    options,
    selectedValues,
    onSelectionChange,
    placeholder,
    label,
    facets = {},
    className = '',
    triggerClassName = '',
    menuClassName = '',
    // optionClassName = '',
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const updateFilter = (value: string) => {
        if (selectedValues.includes(value)) {
            onSelectionChange(selectedValues.filter((v) => v !== value))
        } else {
            onSelectionChange([...selectedValues, value])
        }
    }

    const getFacetCount = (value: string) => {
        const option = options.find((opt) => opt.value === value)
        if (option && option.count > 0) {
            return option.count
        }
        return facets[value] || 0
    }

    const getDisplayText = () => {
        if (selectedValues.length === 0) return placeholder
        if (selectedValues.length === 1) {
            const option = options.find((opt) => opt.value === selectedValues[0])
            return option?.value || selectedValues[0]
        }
        return `${selectedValues.length} selected`
    }

    return (
        <div className={`relative inline-block ${className}`} ref={dropdownRef}>
            <button
                type='button'
                onClick={() => setIsOpen(!isOpen)}
                className={`${triggerClassName} flex items-center justify-between w-full`}
            >
                <span className='truncate'>{getDisplayText()}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
            </button>

            {isOpen && (
                <div
                    className={`${menuClassName} absolute z-50 mt-1 min-w-fit w-full bg-white border border-gray-300 rounded-md shadow-lg whitespace-nowrap`}
                >
                    <div className='px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b sticky top-0'>
                        {label}
                    </div>

                    <div className='px-3 py-2 border-b bg-gray-50 flex gap-2'>
                        <button
                            className='text-xs text-blue-600 hover:text-blue-800 font-medium'
                            onClick={(e) => {
                                e.stopPropagation()
                                onSelectionChange(options.map((opt) => opt.value))
                            }}
                        >
                            Select All
                        </button>
                        <span className='text-xs text-gray-400'>|</span>
                        <button
                            className='text-xs text-red-600 hover:text-red-800 font-medium'
                            onClick={(e) => {
                                e.stopPropagation()
                                onSelectionChange([])
                            }}
                        >
                            Clear All
                        </button>
                    </div>

                    {options.map((facet) => {
                        const currentCount = getFacetCount(facet.value)
                        const isSelected = selectedValues.includes(facet.value)
                        return (
                            <div
                                key={facet.value}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 last:rounded-b-md w-full ${
                                    isSelected ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => {
                                    updateFilter(facet.value)
                                }}
                            >
                                <div className='flex items-center justify-between w-full'>
                                    <div className='flex items-center gap-1 w-full'>
                                        <input
                                            type='checkbox'
                                            checked={isSelected}
                                            onChange={() => {}}
                                            className='rounded text-blue-600'
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className='flex flex-row items-center justify-between gap-2 w-full'>
                                            <span
                                                className={isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}
                                            >
                                                {toCapitalizedWords(facet.value)}
                                            </span>
                                            <span className='text-xs text-gray-500'>({currentCount})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default AlgoliaFacetMultiSelect
