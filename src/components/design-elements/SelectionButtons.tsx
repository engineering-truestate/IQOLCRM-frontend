import type React from 'react'

export type SelectionType = 'radio' | 'checkbox'
export type SelectionState = 'default' | 'hover' | 'focus' | 'disabled'
export type SelectionColor = 'blue' | 'green' | 'purple' | 'red' | 'gray'

export interface SelectionButtonProps {
    type: SelectionType
    label: string
    value: string
    checked?: boolean
    disabled?: boolean
    color?: SelectionColor
    state?: SelectionState
    className?: string
    onChange?: (value: string, checked: boolean) => void
    name?: string
}

const colorVariants = {
    blue: {
        checked: 'border-blue-500 bg-blue-500',
        unchecked: 'border-gray-300 hover:border-blue-400',
        focus: 'ring-blue-500',
        disabled: 'border-gray-200 bg-gray-100',
    },
    green: {
        checked: 'border-green-500 bg-green-500',
        unchecked: 'border-gray-300 hover:border-green-400',
        focus: 'ring-green-500',
        disabled: 'border-gray-200 bg-gray-100',
    },
    purple: {
        checked: 'border-purple-500 bg-purple-500',
        unchecked: 'border-gray-300 hover:border-purple-400',
        focus: 'ring-purple-500',
        disabled: 'border-gray-200 bg-gray-100',
    },
    red: {
        checked: 'border-red-500 bg-red-500',
        unchecked: 'border-gray-300 hover:border-red-400',
        focus: 'ring-red-500',
        disabled: 'border-gray-200 bg-gray-100',
    },
    gray: {
        checked: 'border-gray-500 bg-gray-500',
        unchecked: 'border-gray-300 hover:border-gray-400',
        focus: 'ring-gray-500',
        disabled: 'border-gray-200 bg-gray-100',
    },
}

// Utility function to join class names
const joinClasses = (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ')
}

export const SelectionButton: React.FC<SelectionButtonProps> = ({
    type,
    label,
    value,
    checked = false,
    disabled = false,
    color = 'blue',
    state = 'default',
    // className,
    onChange,
    name,
}) => {
    const handleChange = () => {
        if (!disabled && onChange) {
            onChange(value, !checked)
        }
    }

    const getInputClasses = () => {
        const baseClasses = 'w-4 h-4 border-2 transition-all duration-200 cursor-pointer'
        const shapeClass = type === 'radio' ? 'rounded-full' : 'rounded-sm'
        const disabledClass = disabled ? 'cursor-not-allowed opacity-50' : ''
        const focusClass = state === 'focus' && !disabled ? 'ring-2 ring-offset-2' : ''

        const colorClass = colorVariants[color]
        let colorSpecificClass = ''

        if (disabled) {
            colorSpecificClass = colorClass.disabled
        } else if (checked) {
            colorSpecificClass = colorClass.checked
            if (state === 'focus') {
                colorSpecificClass += ` ring-2 ring-offset-2 ${colorClass.focus}`
            }
        } else {
            colorSpecificClass = colorClass.unchecked
            if (state === 'focus') {
                colorSpecificClass += ` ring-2 ring-offset-2 ${colorClass.focus}`
            }
        }

        return joinClasses(baseClasses, shapeClass, disabledClass, focusClass, colorSpecificClass)
    }

    const getLabelClasses = () => {
        const baseClass = 'ml-2 text-sm font-medium cursor-pointer select-none transition-colors'

        if (disabled) {
            return joinClasses(baseClass, 'text-gray-400 cursor-not-allowed')
        }

        const textColor = 'text-gray-900'
        const hoverColor = !disabled && state === 'hover' ? 'hover:text-gray-700' : ''

        return joinClasses(baseClass, textColor, hoverColor)
    }

    const containerClasses = joinClasses(
        'inline-flex items-center gap-2 px-4 py-2 border border-gray-800 rounded-md text-sm font-medium transition-all',
    )

    return (
        <div className={containerClasses}>
            <div className='relative'>
                <input
                    type={type}
                    name={name}
                    value={value}
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                    className='sr-only'
                />
                <div className={getInputClasses()} onClick={handleChange}>
                    {checked && (
                        <div className='flex items-center justify-center w-full h-full'>
                            {type === 'radio' ? (
                                <div className='w-2 h-2 bg-white rounded-full ' />
                            ) : (
                                <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                    <path
                                        fillRule='evenodd'
                                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <label className={getLabelClasses()} onClick={handleChange}>
                {label}
            </label>
        </div>
    )
}
