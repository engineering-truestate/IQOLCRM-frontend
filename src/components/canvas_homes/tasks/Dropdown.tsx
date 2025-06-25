import { useState, useRef, useEffect } from 'react'

type Option = {
    label: string
    value: string
    task?: () => void
    modal?: (state?: boolean) => void
    subOptions?: Option[]
}

interface DropdownProps {
    options: Option[]
    defaultValue?: string
    onSelect: (value: string) => void
    className?: string
    triggerClassName?: string
    menuClassName?: string
    optionClassName?: string
    nestedOptionClassName?: string
    placeholder?: string
    disabled?: boolean
    state?: boolean
}

const Dropdown: React.FC<DropdownProps> = ({
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
    state = false,
}) => {
    // State Management
    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState(defaultValue || '')
    const [nestedOpen, setNestedOpen] = useState<number | null>(null)

    // Ref for click outside detection
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Click outside effect
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    const handleOptionClick = (option: Option, index: number) => {
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

    const handleSubOptionClick = (subOption: Option) => {
        if (subOption.task) subOption.task()
        if (subOption.modal) subOption.modal()
        setSelected(subOption.label)
        onSelect(subOption.value)
        setIsOpen(false)
        setNestedOpen(null)
    }

    const handleToggle = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
                {selected === 'open' || selected === 'complete' || state
                    ? selected == ''
                        ? placeholder
                        : selected
                    : placeholder}

                <span className='ml-1'>
                    <svg
                        className={`w-4 h-4 ml-1  transition-transform duration-200 ${isOpen && !disabled ? 'rotate-180' : ''}`}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
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
                                    <span className='mt-0.5 ml-1'>
                                        <svg
                                            width='16'
                                            height='16'
                                            viewBox='0 0 16 16'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <path
                                                d='M5.96484 2.72003L10.3115 7.0667C10.8248 7.58003 10.8248 8.42003 10.3115 8.93336L5.96484 13.28'
                                                stroke='#606060'
                                                stroke-width='1.5'
                                                stroke-miterlimit='10'
                                                stroke-linecap='round'
                                                stroke-linejoin='round'
                                            />
                                        </svg>
                                    </span>
                                )}
                            </div>

                            {/* Sub Options */}
                            {option.subOptions && nestedOpen === index && (
                                <div
                                    className={`absolute left-full top-0 mt-10 w-fit bg-white border border-gray-300 rounded-md shadow-lg ${nestedOptionClassName} w-full min-w-[160px]`}
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
