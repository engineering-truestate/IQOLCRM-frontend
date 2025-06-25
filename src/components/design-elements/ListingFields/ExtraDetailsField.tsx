import React from 'react'

interface ExtraDetailsFieldProps {
    value: string
    setValue: (val: string) => void
    placeholder?: string
    required?: boolean
    maxLength?: number
}

const ExtraDetailsField: React.FC<ExtraDetailsFieldProps> = ({ value, setValue, placeholder, required, maxLength }) => (
    <div className='flex flex-col gap-1'>
        <label className='block text-sm font-medium text-gray-700'>
            Extra Details
            {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
        <textarea
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder || 'Add any additional details...'}
            rows={4}
            maxLength={maxLength}
            className='w-full px-3 py-2 border border-gray-300 rounded-md outline-none resize-none text-sm'
        />
    </div>
)

export default ExtraDetailsField
