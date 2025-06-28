import React from 'react'

interface Option {
    label: string
    value: string
}

interface SliderButtonSelectProps {
    value: string | null
    setValue: (val: string | null) => void
    label?: string
    required?: boolean
    options: Option[]
    footer?: string
    error?: string
}

const SliderButtonSelect: React.FC<SliderButtonSelectProps> = ({
    value,
    setValue,
    label,
    required,
    options,
    footer,
    error,
}) => (
    <div className='flex flex-col gap-1'>
        {label && (
            <label className='block text-sm font-medium text-gray-700'>
                {label}
                {required && <span className='text-red-500 ml-1'>*</span>}
            </label>
        )}
        <div className='flex gap-2 overflow-x-auto'>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type='button'
                    onClick={() => setValue(opt.value)}
                    className={`py-2 px-3 line-height-[21px] text-sm font-normal text-[#3A3A47] rounded-md transition-colors cursor-pointer ${
                        value === opt.value
                            ? 'bg-[#24252E] text-white '
                            : 'bg-[#F0F0F5] text-gray-700 hover:bg-[#F0F0F5]'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
        {footer && <div className='text-xs text-gray-500 mt-1'>{footer}</div>}
        {error && <div className='text-sm text-red-600'>{error}</div>}
    </div>
)

export default SliderButtonSelect
