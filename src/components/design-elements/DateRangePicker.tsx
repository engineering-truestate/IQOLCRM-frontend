import React, { useState, useRef, useEffect } from 'react'

interface DateRangePickerProps {
    onDateRangeChange: (startDate: string | null, endDate: string | null) => void
    onApply?: () => void
    onCancel?: () => void
    placeholder?: string
    className?: string
    triggerClassName?: string
    menuClassName?: string
    showApplyCancel?: boolean
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    onDateRangeChange,
    onApply,
    onCancel,
    placeholder = 'Select Date Range',
    className = '',
    triggerClassName = '',
    menuClassName = '',
    showApplyCancel = false,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [displayText, setDisplayText] = useState(placeholder)
    const [selectedPreset, setSelectedPreset] = useState('')
    const [borderClass, setBorderClass] = useState('')

    const dropdownRef = useRef<HTMLDivElement>(null)

    // Handle custom date changes - now calls onDateRangeChange immediately for preview
    const handleCustomDateChange = () => {
        if (showApplyCancel) {
            // In apply/cancel mode, just update the preview
            onDateRangeChange(startDate || null, endDate || null)

            if (startDate && endDate) {
                const start = new Date(startDate)
                const end = new Date(endDate)
                if (start <= end) {
                    setDisplayText(`${start.toLocaleDateString()} - ${end.toLocaleDateString()}`)
                    setSelectedPreset('')
                }
            } else if (startDate || endDate) {
                setDisplayText(startDate || endDate ? 'Custom Range' : placeholder)
                setSelectedPreset('')
            } else {
                setDisplayText(placeholder)
            }
        } else {
            // Legacy behavior - immediate application
            if (startDate && endDate) {
                const start = new Date(startDate)
                const end = new Date(endDate)

                if (start <= end) {
                    setDisplayText(`${start.toLocaleDateString()} - ${end.toLocaleDateString()}`)
                    setSelectedPreset('')
                    onDateRangeChange(startDate, endDate)
                }
            } else if (startDate || endDate) {
                setDisplayText(startDate || endDate ? 'Custom Range' : placeholder)
                setSelectedPreset('')
                onDateRangeChange(startDate || null, endDate || null)
            }
        }
    }

    // Clear selection
    const handleClear = () => {
        setStartDate('')
        setEndDate('')
        setSelectedPreset('')
        setDisplayText(placeholder)
        onDateRangeChange(null, null)
        setIsOpen(false)
    }

    // Apply custom range
    const handleApply = () => {
        if (showApplyCancel && onApply) {
            onApply()
        } else {
            handleCustomDateChange()
        }

        setIsOpen(false)
    }

    // Cancel selection
    const handleCancel = () => {
        if (showApplyCancel && onCancel) {
            onCancel()
        }
        setIsOpen(false)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                if (showApplyCancel) {
                    handleCancel()
                } else {
                    setIsOpen(false)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showApplyCancel])

    // Update display when dates change
    useEffect(() => {
        if (!selectedPreset) {
            handleCustomDateChange()
        }
    }, [startDate, endDate, selectedPreset])

    return (
        <div className={`relative inline-block ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between h-7 border bg-gray-100 border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-0.5 focus:ring-black focus:border-black-500 min-w-[100px] cursor-pointer transition-colors duration-200 ${triggerClassName}`}
            >
                <span className='truncate'>Date Range</span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className={`absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg w-80 ${menuClassName}`}
                >
                    <div className='p-4'>
                        {/* Custom Date Range */}
                        <div>
                            <h3 className='text-sm font-medium text-gray-700 mb-3'>Custom Range</h3>
                            <div className='grid grid-cols-2 gap-3 mb-4'>
                                <div>
                                    <label className='block text-xs text-gray-600 mb-1'>From</label>
                                    <input
                                        type='date'
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className='w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black-500'
                                        max={endDate || undefined}
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs text-gray-600 mb-1'>To</label>
                                    <input
                                        type='date'
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className='w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black-500'
                                        min={startDate || undefined}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex justify-between gap-2'>
                                <button
                                    onClick={handleClear}
                                    className='px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150'
                                >
                                    Clear
                                </button>
                                <div className='flex gap-2'>
                                    <button
                                        onClick={handleApply}
                                        disabled={!startDate || !endDate}
                                        className='px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150'
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DateRangePicker
