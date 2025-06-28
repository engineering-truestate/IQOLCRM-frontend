import React from 'react'

interface Option {
    label: string
    value: string
}

interface DropdownFieldProps {
    value: string
    setValue: (val: string) => void
    label?: string
    required?: boolean
    options: Option[]
    placeholder?: string
    error?: string
}

const DropdownField: React.FC<DropdownFieldProps> = ({
    value,
    setValue,
    label,
    required,
    options,
    placeholder,
    error,
}) => (
    <div className='flex flex-col gap-1'>
        {label && (
            <label className='block text-sm font-medium text-gray-700'>
                {label}
                {required && <span className='text-red-500 ml-1'>*</span>}
            </label>
        )}
        <select
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md outline-none'
        >
            <option value=''>{placeholder || 'Select'}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        {error && <div className='text-sm text-red-600'>{error}</div>}
    </div>
)

export default DropdownField
