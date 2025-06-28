import type React from 'react'
import { useState } from 'react'
import arrowdown from '/icons/design_elements_icons/arrow-down.svg'

export type CommonInputStatus = 'default' | 'error' | 'success' | 'disabled'
export type HintTextColor = 'default' | 'error' | 'success' | 'warning'

interface DropdownOption {
    value: string
    label: string
}

interface CommonInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'disabled'> {
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
    // New props for header and hint
    label?: string
    labelIcon?: React.ReactNode
    required?: boolean
    hintText?: string
    hintTextColor?: HintTextColor
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

const CommonInput: React.FC<CommonInputProps> = ({
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
    ...props
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const actualStatus = disabled ? 'disabled' : status

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
                    className={`flex items-center rounded-lg border transition-colors ${className} ${
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
                        } ${leftIcon ? 'pl-2' : ''}`}
                        disabled={disabled}
                        placeholder={showPlaceholder ? placeholder : ''}
                        {...props}
                    />

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

export default CommonInput
