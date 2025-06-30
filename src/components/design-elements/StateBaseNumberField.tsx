import type React from 'react'
import { useState, useEffect } from 'react'
import arrowdown from '/icons/design_elements_icons/arrow-down.svg'

export type CommonInputStatus = 'default' | 'error' | 'success' | 'disabled'
export type HintTextColor = 'default' | 'error' | 'success' | 'warning'
export type NumberInputType = 'integer' | 'decimal' | 'currency' | 'percentage'

interface DropdownOption {
    value: string
    label: string
}

interface NumberInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'disabled' | 'type' | 'value' | 'onChange'> {
    leftIcon?: React.ReactNode
    rightAddon?: React.ReactNode
    suffix?: string
    status?: CommonInputStatus
    fullWidth?: boolean
    className?: string
    hasDropdown?: boolean
    dropdownOptions?: DropdownOption[]
    dropdownValue?: string
    onDropdownChange?: (value: string) => void
    dropdownPrefix?: string
    dropdownSuffix?: string
    disabled?: boolean
    showPlaceholder?: boolean
    // Header and hint props
    label?: string
    labelIcon?: React.ReactNode
    required?: boolean
    hintText?: string
    hintTextColor?: HintTextColor
    // Number-specific props
    value?: number | string
    onChange?: (value: number | null, stringValue: string) => void
    numberType?: NumberInputType
    min?: number
    max?: number
    step?: number
    decimalPlaces?: number
    showControls?: boolean
    allowNegative?: boolean
    thousandSeparator?: boolean
    currencySymbol?: string
    percentageSymbol?: string
}

const statusClasses: Record<CommonInputStatus, string> = {
    default: 'border-gray-300 focus-within:border-blue-500 bg-white',
    error: 'border-red-500 focus-within:border-red-600 bg-white',
    success: 'border-green-500 focus-within:border-green-600 bg-white',
    disabled: 'border-gray-200 bg-gray-50 cursor-not-allowed',
}

const hintTextClasses: Record<HintTextColor, string> = {
    default: 'text-gray-500',
    error: 'text-red-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
}

const NumberInput: React.FC<NumberInputProps> = ({
    leftIcon,
    rightAddon,
    suffix,
    status = 'default',
    fullWidth = false,
    className = '',
    hasDropdown = false,
    dropdownOptions = [],
    dropdownValue = '',
    onDropdownChange,
    dropdownPrefix = '',
    dropdownSuffix = '',
    disabled = false,
    showPlaceholder = true,
    placeholder,
    label,
    labelIcon,
    required = false,
    hintText,
    hintTextColor = 'default',
    // Number-specific props
    value,
    onChange,
    numberType = 'decimal',
    min,
    max,
    step = 1,
    decimalPlaces = 2,
    showControls = false,
    allowNegative = true,
    thousandSeparator = false,
    currencySymbol = '₹',
    percentageSymbol = '%',
    ...props
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [inputValue, setInputValue] = useState<string>('')
    const [isFocused, setIsFocused] = useState(false)

    const actualStatus = disabled ? 'disabled' : status

    // Format number based on type
    const formatNumber = (num: number | null, forDisplay: boolean = true): string => {
        if (num === null || isNaN(num)) return ''

        let formatted = num.toString()

        if (numberType === 'integer') {
            formatted = Math.round(num).toString()
        } else if (numberType === 'decimal') {
            formatted = num.toString()
        } else if (numberType === 'currency') {
            formatted = num.toFixed(decimalPlaces)
            if (forDisplay && thousandSeparator) {
                formatted = Number(formatted).toLocaleString('en-IN', {
                    minimumFractionDigits: decimalPlaces,
                    maximumFractionDigits: decimalPlaces,
                })
            }
            if (forDisplay) formatted = `${currencySymbol} ${formatted}`
        } else if (numberType === 'percentage') {
            formatted = num.toFixed(decimalPlaces)
            if (forDisplay) formatted = `${formatted}${percentageSymbol}`
        }

        if (forDisplay && thousandSeparator && numberType === 'decimal') {
            formatted = Number(formatted).toLocaleString('en-IN', {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces,
            })
        }

        return formatted
    }

    // Parse input string to number
    const parseInputValue = (inputStr: string): number | null => {
        if (!inputStr.trim()) return null

        // Remove currency symbol and percentage symbol
        let cleanStr = inputStr.replace(currencySymbol, '').replace(percentageSymbol, '').trim()

        // Remove thousand separators
        cleanStr = cleanStr.replace(/,/g, '')

        const num = parseFloat(cleanStr)
        return isNaN(num) ? null : num
    }

    // Update input value when external value changes
    useEffect(() => {
        if (value !== undefined) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value
            if (!isFocused) {
                setInputValue(formatNumber(numValue, true))
            }
        }
    }, [value, numberType, decimalPlaces, currencySymbol, percentageSymbol, thousandSeparator, isFocused])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputStr = e.target.value
        setInputValue(inputStr)

        const numValue = parseInputValue(inputStr)

        // Validate constraints
        if (numValue !== null) {
            if (!allowNegative && numValue < 0) return
            if (min !== undefined && numValue < min) return
            if (max !== undefined && numValue > max) return
        }

        onChange?.(numValue, inputStr)
    }

    const handleInputFocus = () => {
        setIsFocused(true)
        // Show raw number when focused
        const numValue = parseInputValue(inputValue)
        if (numValue !== null) {
            setInputValue(numValue.toString())
        }
    }

    const handleInputBlur = () => {
        setIsFocused(false)
        // Format number when focus lost
        const numValue = parseInputValue(inputValue)
        if (numValue !== null) {
            setInputValue(formatNumber(numValue, true))
        }
    }

    const handleIncrement = () => {
        if (disabled) return
        const currentNum = parseInputValue(inputValue) || 0
        const newValue = currentNum + step
        if (max === undefined || newValue <= max) {
            const formatted = formatNumber(newValue, true)
            setInputValue(formatted)
            onChange?.(newValue, formatted)
        }
    }

    const handleDecrement = () => {
        if (disabled) return
        const currentNum = parseInputValue(inputValue) || 0
        const newValue = currentNum - step
        if ((min === undefined || newValue >= min) && (allowNegative || newValue >= 0)) {
            const formatted = formatNumber(newValue, true)
            setInputValue(formatted)
            onChange?.(newValue, formatted)
        }
    }

    const handleDropdownSelect = (option: DropdownOption) => {
        onDropdownChange?.(option.value)
        setIsDropdownOpen(false)
    }

    return (
        <div className={`${fullWidth ? 'w-full' : ''}`}>
            {/* Header/Label Section */}
            {label && (
                <div className='flex items-center mb-2'>
                    {labelIcon && <span className='mr-2 text-gray-600'>{labelIcon}</span>}
                    <label className='text-sm font-medium text-gray-700'>
                        {label}
                        {required && <span className='text-red-500 ml-1'>*</span>}
                    </label>
                    {required && labelIcon && <div className='ml-2 w-2 h-2 bg-red-500 rounded-full'></div>}
                </div>
            )}

            {/* Input Section */}
            <div className='relative'>
                <div
                    className={`flex items-center rounded-lg border transition-colors ${
                        statusClasses[actualStatus]
                    } ${className}`}
                >
                    {leftIcon && (
                        <span className={`ml-3 ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>{leftIcon}</span>
                    )}

                    <input
                        className={`flex-1 outline-none bg-transparent px-3 py-2 text-sm ${
                            disabled
                                ? 'text-gray-400 placeholder-gray-300 cursor-not-allowed'
                                : 'text-gray-900 placeholder-gray-400'
                        } ${leftIcon ? 'pl-2' : ''} ${showControls ? 'pr-0' : ''}`}
                        disabled={disabled}
                        placeholder={showPlaceholder ? placeholder : ''}
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        {...props}
                    />

                    {/* Number Controls */}
                    {showControls && !disabled && (
                        <div className='flex flex-col mr-1'>
                            <button
                                type='button'
                                onClick={handleIncrement}
                                className='px-1 py-0.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded'
                            >
                                ▲
                            </button>
                            <button
                                type='button'
                                onClick={handleDecrement}
                                className='px-1 py-0.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded'
                            >
                                ▼
                            </button>
                        </div>
                    )}

                    {suffix && (
                        <span className={`text-sm ${disabled ? 'text-gray-300' : 'text-gray-500'} mr-3`}>{suffix}</span>
                    )}

                    {hasDropdown && (
                        <div className='relative'>
                            <button
                                type='button'
                                onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
                                className={`flex items-center px-3 py-2 text-sm border-l border-gray-200 rounded-r-lg ${
                                    disabled
                                        ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                        : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                                }`}
                                disabled={disabled}
                            >
                                {dropdownPrefix && <span className='mr-1'>{dropdownPrefix}</span>}
                                <span>{dropdownValue || dropdownOptions[0]?.label || 'Select'}</span>
                                {dropdownSuffix && <span className='ml-1'>{dropdownSuffix}</span>}
                                <img
                                    src={arrowdown}
                                    alt='Chevron Down'
                                    className={`ml-1 h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isDropdownOpen && !disabled && (
                                <div className='absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10'>
                                    {dropdownOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleDropdownSelect(option)}
                                            className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg'
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {rightAddon && (
                        <span className={`mr-3 ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>{rightAddon}</span>
                    )}
                </div>
            </div>

            {/* Hint Text Section */}
            {hintText && (
                <div className='mt-1'>
                    <p className={`text-xs ${hintTextClasses[hintTextColor]}`}>{hintText}</p>
                </div>
            )}
        </div>
    )
}

export default NumberInput
