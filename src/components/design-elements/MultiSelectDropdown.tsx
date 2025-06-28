import React, { useState, useRef, useEffect } from 'react'

interface Option {
    label: string
    value: string
}

interface MultiSelectDropdownProps {
    options: Option[]
    selectedValues: string[]
    onSelectionChange: (values: string[]) => void
    placeholder: string
    className?: string
    triggerClassName?: string
    menuClassName?: string
    optionClassName?: string
    displaySelected?: (selected: string[]) => string
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    options,
    selectedValues,
    onSelectionChange,
    placeholder,
    className = '',
    triggerClassName = '',
    menuClassName = '',
    optionClassName = '',
    displaySelected,
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

    const handleOptionClick = (value: string) => {
        if (value === 'all') {
            onSelectionChange(['all'])
        } else {
            const filteredSelected = selectedValues.filter((v) => v !== 'all')
            if (filteredSelected.includes(value)) {
                const newSelection = filteredSelected.filter((v) => v !== value)
                onSelectionChange(newSelection.length === 0 ? ['all'] : newSelection)
            } else {
                onSelectionChange([...filteredSelected, value])
            }
        }
    }

    const getDisplayText = () => {
        if (displaySelected) {
            return displaySelected(selectedValues)
        }

        if (selectedValues.includes('all')) {
            return placeholder
        }

        if (selectedValues.length === 0) {
            return placeholder
        }

        if (selectedValues.length === 1) {
            const option = options.find((opt) => opt.value === selectedValues[0])
            return option?.label || selectedValues[0]
        }

        return `${selectedValues.length} selected`
    }

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
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
                    className={`${menuClassName} absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto`}
                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleOptionClick(option.value)}
                            className={`${optionClassName} px-3 py-2 text-sm cursor-pointer flex items-center hover:bg-gray-100`}
                        >
                            <input
                                type='checkbox'
                                checked={selectedValues.includes(option.value)}
                                onChange={() => {}} // Handled by onClick
                                className='mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                            />
                            <span className='flex-1'>{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MultiSelectDropdown
