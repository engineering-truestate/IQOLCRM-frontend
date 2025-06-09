import type React from 'react'
import { useState } from 'react'
import { SelectionButton, type SelectionType, type SelectionColor } from './SelectionButtons'

export interface SelectionOption {
    label: string
    value: string
    disabled?: boolean
}

export interface SelectionGroupProps {
    title: string
    options: SelectionOption[]
    type: SelectionType
    color?: SelectionColor
    multiSelect?: boolean
    defaultValues?: string[]
    onChange?: (values: string[]) => void
    className?: string
    name?: string
}

// Utility function to join class names
const joinClasses = (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ')
}

export const SelectionGroup: React.FC<SelectionGroupProps> = ({
    title,
    options,
    type,
    color = 'blue',
    multiSelect = false,
    defaultValues = [],
    onChange,
    className,
    name,
}) => {
    const [selectedValues, setSelectedValues] = useState<string[]>(defaultValues)

    const handleSelectionChange = (value: string, checked: boolean) => {
        let newValues: string[]

        if (multiSelect || type === 'checkbox') {
            if (checked) {
                newValues = [...selectedValues, value]
            } else {
                newValues = selectedValues.filter((v) => v !== value)
            }
        } else {
            // Single select (radio behavior)
            newValues = checked ? [value] : []
        }

        setSelectedValues(newValues)
        onChange?.(newValues)
    }

    const containerClasses = joinClasses('space-y-3', className)

    return (
        <div className={containerClasses}>
            <h3 className='text-sm font-semibold text-gray-900'>{title}</h3>
            <div className='space-y-2'>
                {options.map((option) => (
                    <SelectionButton
                        key={option.value}
                        type={type}
                        label={option.label}
                        value={option.value}
                        checked={selectedValues.includes(option.value)}
                        disabled={option.disabled}
                        color={color}
                        onChange={handleSelectionChange}
                        name={name}
                    />
                ))}
            </div>
        </div>
    )
}
