import React from 'react'

interface Option {
    label: string
    value: string
}

interface RadioButtonSelectProps {
    value: string | null
    setValue: (val: string | null) => void
    label?: string
    required?: boolean
    options: Option[]
    error?: string
    disable?: boolean
}

const RadioButtonSelect: React.FC<RadioButtonSelectProps> = ({
    value,
    setValue,
    label,
    required,
    options,
    error,
    disable,
}) => (
    <div className='flex flex-col gap-1'>
        {label && (
            <label className='block text-sm font-medium text-gray-700'>
                {label}
                {required && <span className='text-red-500 ml-1'>*</span>}
            </label>
        )}
        <div className='flex gap-4'>
            {options.map((opt) => (
                <label
                    key={opt.value}
                    className='flex items-center gap-2 relative cursor-pointer border-1 px-3 py-[6px] rounded-md border-[#E1E3E6]'
                >
                    <input
                        type='radio'
                        name={label}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={() => setValue(opt.value)}
                        disabled={disable}
                        className='peer absolute opacity-0 w-4 h-4'
                    />
                    <span
                        className={`
                            w-4 h-4 rounded-full border-gray-400 flex items-center justify-center
                            peer-checked:border-[#24252E] border-2
                            peer-checked:bg-[#24252E]
                            transition
                        `}
                    >
                        {value === opt.value && <span className='w-2 h-2 rounded-full bg-white block'></span>}
                    </span>
                    <span>{opt.label}</span>
                </label>
            ))}
        </div>
        {error && <div className='text-sm text-red-600'>{error}</div>}
    </div>
)

export default RadioButtonSelect
