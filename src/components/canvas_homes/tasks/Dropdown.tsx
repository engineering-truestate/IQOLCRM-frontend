import React, { useState, useRef, useEffect } from 'react'

const Dropdown = ({
    options,
    defaultValue,
    onSelect,
    className = '',
    triggerClassName = '',
    menuClassName = '',
    optionClassName = '',
    nestedOptionClassName = '',
    placeholder = 'Select...',
    disabled = false,
}) => {
    // State Management
    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState(defaultValue || '')
    const [nestedOpen, setNestedOpen] = useState(null)

    // Ref for click outside detection
    const dropdownRef = useRef(null)

    // Click outside effect
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
                setNestedOpen(null)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    // Event Handlers
    const handleOptionClick = (option, index) => {
        if (option.task) option.task()
        if (option.modal) option.modal(true)

        if (option.subOptions) {
            setNestedOpen(nestedOpen === index ? null : index)
        } else {
            setSelected(option.label)
            onSelect(option.value)
            setIsOpen(false)
            setNestedOpen(null)
        }
    }

    const handleSubOptionClick = (subOption) => {
        if (subOption.task) subOption.task()
        if (subOption.modal) subOption.modal()
        setSelected(subOption.label)
        onSelect(subOption.value)
        setIsOpen(false)
        setNestedOpen(null)
    }

    const handleToggle = (e) => {
        e.stopPropagation()
        if (disabled) return
        setIsOpen(!isOpen)
        setNestedOpen(null)
    }

    // Default Styles (unchanged)
    const defaultTriggerStyles =
        'flex items-center justify-between px-2 py-1 border border-gray-300 rounded-sm bg-gray-100 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
    const defaultMenuStyles = 'absolute z-50 mt-1 w-fit bg-white border border-gray-300 rounded-md shadow-lg'
    const defaultOptionStyles =
        'px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'

    return (
        <div ref={dropdownRef} className={`relative inline-block ${className} bg red`}>
            {/* Trigger Button */}
            <button onClick={handleToggle} className={`${triggerClassName || defaultTriggerStyles} whitespace-nowrap`}>
                {selected || placeholder}
                <span className='ml-1'>
                    <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={`${menuClassName || defaultMenuStyles} `}>
                    {options.map((option, index) => (
                        <div key={option.value}>
                            {/* Main Option */}
                            <div
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleOptionClick(option, index)
                                }}
                                className={`${optionClassName || defaultOptionStyles} whitespace-nowrap flex flex-row bg-red`}
                            >
                                {option.label}
                                {option.subOptions && (
                                    <span>
                                        <svg
                                            className='w-4 h-4 ml-1 mt-1'
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
                                    </span>
                                )}
                            </div>

                            {/* Sub Options */}
                            {option.subOptions && nestedOpen === index && (
                                <div
                                    className={`absolute left-full top-0 mt-10 w-fit bg-white border border-gray-300 rounded-md shadow-lg ${nestedOptionClassName} w-fit`}
                                >
                                    {option.subOptions.map((subOption) => (
                                        <div
                                            key={subOption.value}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleSubOptionClick(subOption)
                                            }}
                                            className={defaultOptionStyles}
                                        >
                                            {subOption.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Dropdown
