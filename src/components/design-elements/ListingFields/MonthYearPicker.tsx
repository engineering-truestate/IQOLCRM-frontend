import React from 'react'

interface MonthYearPickerProps {
    value: { month?: number; year?: number } | null
    setValue: (val: { month: number; year: number }) => void
    title?: string
    required?: boolean
    disabled?: boolean
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ value, setValue, title, required, disabled }) => {
    const currentYear = new Date().getFullYear()
    return (
        <div className='flex flex-col gap-1'>
            {title && (
                <label className='block text-sm font-medium text-gray-700'>
                    {title}
                    {required && <span className='text-red-500 ml-1'>*</span>}
                </label>
            )}
            <div className='flex gap-2'>
                <select
                    value={value?.month || ''}
                    onChange={(e) => setValue({ month: value?.month ?? 1, year: Number(e.target.value) })}
                    disabled={disabled}
                    className='px-3 py-2 border border-gray-300 rounded-md outline-none'
                >
                    <option value=''>Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <select
                    value={value?.year || ''}
                    onChange={(e) => setValue({ month: value?.month ?? 1, year: Number(e.target.value) })}
                    disabled={disabled}
                    className='px-3 py-2 border border-gray-300 rounded-md outline-none'
                >
                    <option value=''>Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                        const year = currentYear + i
                        return (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        )
                    })}
                </select>
            </div>
        </div>
    )
}

export default MonthYearPicker
