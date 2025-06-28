import React, { useState } from 'react'

interface UnitOption {
    label: string
    value: string
}

interface TotalAskPriceProps {
    onPriceChange: (unit: string, price: number) => void
    initialPrice?: number | string
    title?: string
    required?: boolean
    sbua?: number | string
}

const unitOptions: UnitOption[] = [
    { label: 'Total Ask Price', value: 'totalAskPrice' },
    { label: '/Sq ft', value: 'askPricePerSqft' },
]

const TotalAskPrice: React.FC<TotalAskPriceProps> = ({ onPriceChange, initialPrice = '', title, required, sbua }) => {
    // State for price and unit
    const [price, setPrice] = useState(initialPrice ? initialPrice.toString() : '')
    const [selectedUnit, setSelectedUnit] = useState<UnitOption>(unitOptions[0])
    const [dropdownOpen, setDropdownOpen] = useState(false)

    // Convert between totalAskPrice and askPricePerSqft
    const getConvertedPrice = (val: string, fromUnit: string, toUnit: string) => {
        const num = parseFloat(val.replace(/,/g, ''))
        const area = typeof sbua === 'string' ? parseFloat(sbua) : sbua
        if (!num || !area) return ''
        if (fromUnit === 'totalAskPrice' && toUnit === 'askPricePerSqft') {
            return (num / area).toFixed(2)
        }
        if (fromUnit === 'askPricePerSqft' && toUnit === 'totalAskPrice') {
            return (num * area).toFixed(0)
        }
        return val
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow numbers, commas, and decimals
        const val = e.target.value.replace(/[^0-9.,]/g, '')
        setPrice(val)
        onPriceChange(selectedUnit.value, val ? parseFloat(val.replace(/,/g, '')) : 0)
    }

    const handleUnitChange = (option: UnitOption) => {
        // Convert price to the new unit if possible
        let newPrice = price
        if (price) {
            newPrice = getConvertedPrice(price, selectedUnit.value, option.value)
        }
        setSelectedUnit(option)
        setPrice(newPrice)
        onPriceChange(option.value, newPrice ? parseFloat(newPrice.replace(/,/g, '')) : 0)
        setDropdownOpen(false)
    }

    const getPriceInWords = () => {
        const num = parseFloat(price.replace(/,/g, ''))
        if (!num) {
            if (selectedUnit.value === 'totalAskPrice') return 'Eg. 2.20 Cr | 2 Crore 20 Lakh Rupees only'
            else return 'Eg. 7.50 K | 7500 Rupees only'
        }
        if (num >= 10000000)
            return `${(num / 10000000).toFixed(2)} Cr | ${Math.floor(num / 10000000)} Crore ${Math.floor((num % 10000000) / 100000)} Lakh Rupees only`
        if (num >= 100000) return `${(num / 100000).toFixed(2)} Lakh | ${Math.floor(num / 100000)} Lakh Rupees only`
        if (num >= 1000) return `${(num / 1000).toFixed(2)} K | ${num} Rupees only`
        return `${num} Rupees only`
    }

    return (
        <div className='flex flex-col gap-1'>
            {title && (
                <label className='block text-sm font-medium text-gray-700'>
                    {title}
                    {required && <span className='text-red-500 ml-1'>*</span>}
                </label>
            )}
            <div className='relative flex items-center'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm'>₹</span>
                <input
                    type='text'
                    value={price}
                    onChange={handlePriceChange}
                    className='w-full pl-8 pr-32 py-2 border border-gray-300 rounded-md outline-none'
                    placeholder={selectedUnit.value === 'totalAskPrice' ? 'eg. 2,20,00,000' : 'eg. 7,500'}
                />
                <div className='absolute right-2 top-1/2 transform -translate-y-1/2'>
                    <button
                        type='button'
                        className='flex items-center gap-1 px-2 py-1 border border-gray-300 rounded bg-white hover:bg-gray-100 text-sm'
                        onClick={() => setDropdownOpen((open) => !open)}
                    >
                        {selectedUnit.label}
                        <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
                            <path
                                d='M7 10l5 5 5-5'
                                stroke='#555'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                        </svg>
                    </button>
                    {dropdownOpen && (
                        <div className='absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow-lg z-10'>
                            {unitOptions.map((option) => (
                                <button
                                    key={option.value}
                                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedUnit.value === option.value ? 'bg-gray-100 font-semibold' : ''}`}
                                    onClick={() => handleUnitChange(option)}
                                    type='button'
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className='text-xs text-gray-500 mt-1'>
                {getPriceInWords()} {selectedUnit.value === 'totalAskPrice' ? '' : 'per sq ft'}
            </div>
            {sbua && (
                <div className='text-xs text-blue-500 mt-1'>
                    {selectedUnit.value === 'totalAskPrice'
                        ? `Ask Price Per Sqft: ₹${getConvertedPrice(price, 'totalAskPrice', 'askPricePerSqft')}`
                        : `Total Ask Price: ₹${getConvertedPrice(price, 'askPricePerSqft', 'totalAskPrice')}`}
                </div>
            )}
        </div>
    )
}

export default TotalAskPrice
