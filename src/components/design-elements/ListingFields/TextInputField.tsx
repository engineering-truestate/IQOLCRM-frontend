import React from 'react'

interface TextInputFieldProps {
    value: string | number
    setValue: (val: string | number) => void
    label?: string
    required?: boolean
    placeholder?: string
    prefix?: string
    suffix?: string
    type?: 'text' | 'number'
    error?: string
    maxLength?: number
}

const TextInputField: React.FC<TextInputFieldProps> = ({
    value,
    setValue,
    label,
    required,
    placeholder,
    prefix,
    suffix,
    type = 'text',
    error,
    maxLength,
}) => (
    <div className='flex flex-col gap-1'>
        {label && (
            <label className='block text-sm font-medium text-gray-700'>
                {label}
                {required && <span className='text-red-500 ml-1'>*</span>}
            </label>
        )}
        <div className='relative border-1 border-[#E1E3E6] rounded-md px-3 py-2'>
            {prefix && (
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm'>
                    {prefix}
                </span>
            )}
            <input
                type={type}
                value={value || ''}
                onChange={(e) => setValue(type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`w-full ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''} rounded-md outline-none`}
            />
            {suffix && (
                <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm'>
                    {suffix}
                </span>
            )}
        </div>
        {error && <div className='text-sm text-red-600'>{error}</div>}
    </div>
)

export default TextInputField
