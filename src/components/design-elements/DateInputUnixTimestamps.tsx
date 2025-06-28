import type React from 'react'
import { useState, useEffect } from 'react'

export type CommonInputStatus = 'default' | 'error' | 'success' | 'disabled'
export type HintTextColor = 'default' | 'error' | 'success' | 'warning'

interface DateInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'disabled' | 'type' | 'value' | 'onChange'> {
    leftIcon?: React.ReactNode
    rightAddon?: React.ReactNode
    status?: CommonInputStatus
    fullWidth?: boolean
    className?: string
    disabled?: boolean
    showPlaceholder?: boolean
    // Header and hint props
    label?: string
    labelIcon?: React.ReactNode
    required?: boolean
    hintText?: string
    hintTextColor?: HintTextColor
    // Date-specific props
    value?: number | null // Unix timestamp
    onChange?: (timestamp: number | null, dateString: string) => void
    minDate?: string // YYYY-MM-DD format
    maxDate?: string // YYYY-MM-DD format
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

const DateInput: React.FC<DateInputProps> = ({
    leftIcon,
    rightAddon,
    status = 'default',
    fullWidth = false,
    className = '',
    disabled = false,
    showPlaceholder = true,
    placeholder = 'Select date',
    label,
    labelIcon,
    required = false,
    hintText,
    hintTextColor = 'default',
    // Date-specific props
    value,
    onChange,
    minDate,
    maxDate,
    ...props
}) => {
    const [inputValue, setInputValue] = useState<string>('')

    const actualStatus = disabled ? 'disabled' : status

    // Convert unix timestamp to YYYY-MM-DD format for input
    const timestampToDateString = (timestamp: number | null): string => {
        if (!timestamp) return ''
        const date = new Date(timestamp * 1000) // Convert to milliseconds
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Convert YYYY-MM-DD string to unix timestamp
    const dateStringToTimestamp = (dateString: string): number | null => {
        if (!dateString) return null
        const date = new Date(dateString + 'T00:00:00.000Z') // Add time to ensure UTC
        return Math.floor(date.getTime() / 1000) // Convert to seconds
    }

    // Update input value when external value changes
    useEffect(() => {
        if (value !== undefined) {
            setInputValue(timestampToDateString(value))
        }
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateString = e.target.value
        setInputValue(dateString)

        const timestamp = dateStringToTimestamp(dateString)
        onChange?.(timestamp, dateString)
    }

    const handleClear = () => {
        setInputValue('')
        onChange?.(null, '')
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
                        type='date'
                        className={`flex-1 outline-none bg-transparent px-3 py-2 text-sm ${
                            disabled
                                ? 'text-gray-400 placeholder-gray-300 cursor-not-allowed'
                                : 'text-gray-900 placeholder-gray-400'
                        } ${leftIcon ? 'pl-2' : ''}`}
                        disabled={disabled}
                        placeholder={showPlaceholder ? placeholder : ''}
                        value={inputValue}
                        onChange={handleInputChange}
                        min={minDate}
                        max={maxDate}
                        {...props}
                    />

                    {/* Clear button */}
                    {inputValue && !disabled && (
                        <button
                            type='button'
                            onClick={handleClear}
                            className='mr-2 px-1 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'
                            title='Clear date'
                        >
                            ✕
                        </button>
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

export default DateInput
