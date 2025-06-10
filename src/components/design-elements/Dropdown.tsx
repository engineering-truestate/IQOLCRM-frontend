import React, { useState, useRef, useEffect } from 'react'

interface Option {
    label: string
    value: string
    color?: string
    textColor?: string
}

interface DropdownProps {
    options: Option[]
    onSelect: (option: string) => void
    defaultValue?: string
    placeholder?: string
    className?: string
    triggerClassName?: string
    menuClassName?: string
    optionClassName?: string
}

const Dropdown = ({
    options,
    onSelect,
    defaultValue,
    placeholder = 'Select an option',
    className,
    triggerClassName,
    menuClassName,
    optionClassName,
}: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState<string>(defaultValue || '')
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Find the selected option object
    const selectedOption = options.find((opt) => opt.value === selected)

    const selectedLabel = selected ? selectedOption?.label : placeholder

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen((open) => !open)
        }
        if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    const handleSelect = (option: Option) => {
        setSelected(option.value)
        onSelect(option.value)
        setIsOpen(false)
    }

    // Default styles (Tailwind) that can be overridden via props
    const defaultContainerClass = 'relative w-64'
    const defaultTriggerClass = 'border px-4 py-2 rounded cursor-pointer shadow flex items-center justify-between'
    const defaultMenuClass = 'absolute z-10 w-full mt-1 bg-white border rounded shadow-lg'
    const defaultOptionClass = 'px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center'

    return (
        <div className={className || defaultContainerClass} tabIndex={0} ref={dropdownRef} onKeyDown={handleKeyDown}>
            {/* Trigger */}
            <div
                className={triggerClassName || defaultTriggerClass}
                onClick={() => setIsOpen((open) => !open)}
                style={
                    selectedOption
                        ? { backgroundColor: selectedOption.color, color: selectedOption.textColor }
                        : undefined
                }
                aria-haspopup='listbox'
                aria-expanded={isOpen}
            >
                <span>{selectedLabel}</span>
                <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
            </div>

            {/* Menu */}
            {isOpen && (
                <div className={menuClassName || defaultMenuClass} role='listbox'>
                    {options.map((option) => {
                        const isSelected = selected === option.value
                        // Apply selected styling if matches
                        const style = option.color
                            ? { backgroundColor: option.color, color: option.textColor }
                            : undefined

                        const combinedClass = `${optionClassName || defaultOptionClass} ${
                            isSelected ? 'font-bold' : ''
                        }`

                        return (
                            <div
                                key={option.value}
                                className={combinedClass}
                                style={style}
                                role='option'
                                aria-selected={isSelected}
                                onClick={() => handleSelect(option)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        handleSelect(option)
                                    }
                                }}
                                tabIndex={0}
                            >
                                {option.label}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Dropdown
