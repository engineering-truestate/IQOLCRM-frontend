import React, { useState } from 'react'

interface DropdownProps {
    options: { label: string; value: string }[]
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
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedLabel = selected ? options.find((opt) => opt.value === selected)?.label : placeholder

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') setIsOpen((open) => !open)
        if (e.key === 'Escape') setIsOpen(false)
    }

    const handleSelect = (value: string) => {
        setSelected(value)
        onSelect(value)
        setIsOpen(false)
    }

    // Default styles that can be completely overridden
    const defaultContainerClass = 'relative w-64'
    const defaultTriggerClass = 'border px-4 py-2 rounded cursor-pointer bg-white shadow'
    const defaultMenuClass = 'absolute z-10 w-full mt-1 bg-white border rounded shadow-lg'
    const defaultOptionClass = 'px-4 py-2 cursor-pointer hover:bg-gray-100'

    return (
        <div className={className || defaultContainerClass} tabIndex={0} ref={dropdownRef} onKeyDown={handleKeyDown}>
            <div className={triggerClassName || defaultTriggerClass} onClick={() => setIsOpen((open) => !open)}>
                <span className={selected}>{selectedLabel}</span>
                <svg className='w-4 h-4 ml-2 float-right' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
            </div>
            {isOpen && (
                <div className={menuClassName || defaultMenuClass}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`${optionClassName || defaultOptionClass} ${
                                selected === option.value ? 'bg-gray-100 font-bold' : ''
                            }`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Dropdown
