import React from 'react'

interface CheckBoxProps {
    checked: boolean
    setChecked: (checked: boolean) => void
    label?: string
    required?: boolean
}

const CheckBox: React.FC<CheckBoxProps> = ({ checked, setChecked, label, required }) => (
    <label className='flex items-center gap-2 cursor-pointer'>
        <input
            type='checkbox'
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className='w-4 h-4 accent-black rounded'
        />
        <span className='text-sm text-gray-700'>
            {label}
            {required && <span className='text-red-500 ml-1'>*</span>}
        </span>
    </label>
)

export default CheckBox
