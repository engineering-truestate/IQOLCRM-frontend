// components/acn/PriceChangeModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Dropdown from '../design-elements/Dropdown'
import StateBaseTextField from '../design-elements/StateBaseTextField'
import Button from '../design-elements/Button'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store'
import { addPriceDropHistory } from '../../services/acn/properties/propertiesService'
import { addPriceDropHistoryOptimistic } from '../../store/reducers/acn/propertiesReducers'
import type { IInventory } from '../../store/reducers/acn/propertiesTypes'

interface PriceChangeModalProps {
    isOpen: boolean
    onClose: () => void
    property: IInventory | null
}

const PriceChangeModal: React.FC<PriceChangeModalProps> = ({ isOpen, onClose, property }) => {
    const dispatch = useDispatch<AppDispatch>()
    const [priceType, setPriceType] = useState<'Ask Price' | '/Sq ft'>('Ask Price')
    const [newPrice, setNewPrice] = useState('')
    const [notes, setNotes] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setPriceType('Ask Price')
            setNewPrice('')
            setNotes('')
        }
    }, [isOpen])

    if (!isOpen || !property) return null

    const priceTypeOptions = [
        {
            label: 'Ask Price',
            value: 'Ask Price',
        },
        {
            label: '/Sq ft',
            value: '/Sq ft',
        },
    ]

    const getCurrentPrice = () => {
        if (priceType === 'Ask Price') {
            return property.totalAskPrice || 0
        } else {
            return property.askPricePerSqft || 0
        }
    }

    const getPriceChangeType = () => {
        if (!newPrice.trim()) return null

        const newPriceValue = parseFloat(newPrice)
        const currentPrice = getCurrentPrice()

        if (newPriceValue > currentPrice) return 'increase'
        if (newPriceValue < currentPrice) return 'decrease'
        return 'same'
    }

    const getPriceChangePercentage = () => {
        if (!newPrice.trim()) return 0

        const newPriceValue = parseFloat(newPrice)
        const currentPrice = getCurrentPrice()

        if (currentPrice === 0) return 0

        return ((newPriceValue - currentPrice) / currentPrice) * 100
    }

    const handleUpdate = async () => {
        if (!newPrice.trim()) {
            toast.error('Please enter a new price')
            return
        }

        const newPriceValue = parseFloat(newPrice)
        if (isNaN(newPriceValue) || newPriceValue <= 0) {
            toast.error('Please enter a valid price')
            return
        }

        const currentPrice = getCurrentPrice()
        if (newPriceValue === currentPrice) {
            toast.error('New price must be different from current price')
            return
        }

        setIsUpdating(true)

        try {
            // Prepare price change data
            const priceChangeData: {
                kamId: string
                kamName: string
                kamEmail: string
                timestamp: number
                oldTotalAskPrice?: number
                newTotalAskPrice?: number
                oldAskPricePerSqft?: number
                newAskPricePerSqft?: number
            } = {
                kamId: property.kamId || '',
                kamName: property.kamName || '',
                kamEmail: property.kamEmail || '',
                timestamp: Math.floor(Date.now() / 1000),
            }

            // Add price-specific fields
            if (priceType === 'Ask Price') {
                priceChangeData.oldTotalAskPrice = currentPrice
                priceChangeData.newTotalAskPrice = newPriceValue
            } else {
                priceChangeData.oldAskPricePerSqft = currentPrice
                priceChangeData.newAskPricePerSqft = newPriceValue
            }

            // Optimistic update
            dispatch(
                addPriceDropHistoryOptimistic({
                    propertyId: property.propertyId,
                    priceHistoryEntry: {
                        ...priceChangeData,
                        id: `price_${Date.now()}`,
                    },
                    newTotalAskPrice: priceType === 'Ask Price' ? newPriceValue : undefined,
                    newAskPricePerSqft: priceType === '/Sq ft' ? newPriceValue : undefined,
                }),
            )

            // API call (reusing the same thunk since it handles both increases and decreases)
            await dispatch(
                addPriceDropHistory({
                    propertyId: property.propertyId,
                    priceDropData: priceChangeData,
                }),
            ).unwrap()

            const changeType = getPriceChangeType()
            toast.success(`Price ${changeType} recorded successfully`)
            onClose()
        } catch (error) {
            console.error('Failed to record price change:', error)
            toast.error('Failed to record price change. Please try again.')
        } finally {
            setIsUpdating(false)
        }
    }

    const priceChangeType = getPriceChangeType()
    const priceChangePercentage = getPriceChangePercentage()

    return (
        <div className='fixed inset-0 bg-black/75 bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg shadow-xl w-96 max-w-md mx-4'>
                {/* Header */}
                <div className='px-6 py-4 border-b border-gray-200'>
                    <h2 className='text-lg font-semibold text-gray-900'>Price Change</h2>
                </div>

                {/* Content */}
                <div className='px-6 py-4 space-y-4'>
                    {/* Price Type Dropdown */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>New Price</label>
                        <div className='flex gap-2'>
                            <StateBaseTextField
                                placeholder='Enter new price'
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                className='flex-1'
                                type='number'
                                step='0.01'
                            />
                            <Dropdown
                                options={priceTypeOptions}
                                onSelect={(value) => setPriceType(value as 'Ask Price' | '/Sq ft')}
                                defaultValue={priceType}
                                placeholder='Ask Price'
                                className='min-w-[120px]'
                                triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md'
                            />
                        </div>
                        <div className='mt-1 text-xs text-gray-500'>
                            Current {priceType}: ₹{getCurrentPrice().toLocaleString('en-IN')}{' '}
                            {priceType === '/Sq ft' ? 'per sq ft' : 'lakhs'}
                        </div>

                        {/* Price Change Indicator */}
                        {newPrice.trim() && priceChangeType && priceChangeType !== 'same' && (
                            <div
                                className={`mt-2 text-xs font-medium ${
                                    priceChangeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                }`}
                            >
                                {priceChangeType === 'increase' ? '↗' : '↘'}
                                {priceChangeType === 'increase' ? 'Price Increase' : 'Price Decrease'}:
                                {Math.abs(priceChangePercentage).toFixed(1)}%
                            </div>
                        )}
                    </div>

                    {/* Notes Field */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Notes</label>
                        <textarea
                            placeholder='Add notes...'
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm'
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className='px-6 py-4 border-t border-gray-200 flex justify-end gap-3'>
                    <Button
                        bgColor='bg-white'
                        textColor='text-gray-700'
                        className='px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50'
                        onClick={onClose}
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button
                        bgColor='bg-gray-900'
                        textColor='text-white'
                        className='px-4 py-2 text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
                        onClick={handleUpdate}
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Updating...' : 'Update'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default PriceChangeModal
