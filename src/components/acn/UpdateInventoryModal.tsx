'use client'

import React, { useState, useEffect } from 'react'
import Dropdown from '../design-elements/Dropdown'
import StateBaseTextField from '../design-elements/StateBaseTextField'
import Button from '../design-elements/Button'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store'
import { updatePropertyStatus } from '../../services/acn/properties/propertiesService'
import { updatePropertyStatusOptimistic, updatePropetiesLocal } from '../../store/reducers/acn/propertiesReducers'
import type { IInventory } from '../../store/reducers/acn/propertiesTypes'

// Use the correct types from IInventory
type PropertyStatus = IInventory['status']
type PropertyType = 'Resale' | 'Rental'

interface UpdateInventoryStatusModalProps {
    isOpen: boolean
    onClose: () => void
    propertyType: PropertyType
    selectedCount: number
    propertyId?: string // Single property ID for dropdown updates
    selectedPropertyIds?: string[] // Multiple property IDs for bulk updates
    onUpdate?: (status: PropertyStatus, soldPrice?: string) => void // Make optional since we'll handle internally
}

const UpdateInventoryStatusModal: React.FC<UpdateInventoryStatusModalProps> = ({
    isOpen,
    onClose,
    propertyType,
    selectedCount,
    propertyId,
    selectedPropertyIds = [],
    onUpdate,
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const [selectedStatus, setSelectedStatus] = useState<PropertyStatus>('Available')
    const [soldPrice, setSoldPrice] = useState('')
    const [notes, setNotes] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    // Check if this is a single property update (show sold price field)
    const isSinglePropertyUpdate = selectedCount === 1 || Boolean(propertyId)

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedStatus('Available')
            setSoldPrice('')
            setNotes('')
        }
    }, [isOpen])

    if (!isOpen) return null

    const getStatusOptions = () => {
        const baseOptions = [
            {
                label: 'Available',
                value: 'Available' as PropertyStatus,
                color: '#E1F6DF',
                textColor: '#065F46',
            },
            {
                label: 'Hold',
                value: 'Hold' as PropertyStatus,
                color: '#FFF3CD',
                textColor: '#B45309',
            },
            {
                label: 'De-listed',
                value: 'De-listed' as PropertyStatus,
                color: '#F3F4F6',
                textColor: '#374151',
            },
        ]

        if (propertyType === 'Resale') {
            baseOptions.splice(1, 0, {
                label: 'Sold',
                value: 'Sold' as PropertyStatus,
                color: '#FEECED',
                textColor: '#991B1B',
            })
        } else {
            baseOptions.splice(1, 0, {
                label: 'Rented',
                value: 'Rented' as PropertyStatus,
                color: '#FEECED',
                textColor: '#991B1B',
            })
        }

        return baseOptions
    }

    const handleUpdate = async () => {
        setIsUpdating(true)

        try {
            // Get the property IDs to update
            const propertyIdsToUpdate = propertyId ? [propertyId] : selectedPropertyIds

            if (propertyIdsToUpdate.length === 0) {
                toast.error('No properties selected for update')
                return
            }

            // Validate sold price for single property updates when status is Sold/Rented
            if (
                isSinglePropertyUpdate &&
                (selectedStatus === 'Sold' || selectedStatus === 'Rented') &&
                !soldPrice.trim()
            ) {
                toast.error(`Please enter ${selectedStatus === 'Sold' ? 'sold price' : 'monthly rent'}`)
                return
            }

            // Update each property
            const updatePromises = propertyIdsToUpdate.map(async (id) => {
                // Optimistically update Redux store
                dispatch(
                    updatePropertyStatusOptimistic({
                        propertyId: id,
                        status: selectedStatus,
                    }),
                )

                // Also update local state if soldPrice is provided for single property
                if (isSinglePropertyUpdate && soldPrice && (selectedStatus === 'Sold' || selectedStatus === 'Rented')) {
                    dispatch(
                        updatePropetiesLocal({
                            propertyId: id,
                            updates: {
                                status: selectedStatus,
                                soldPrice: parseFloat(soldPrice) || undefined,
                            },
                        }),
                    )
                }

                // Prepare update parameters
                const updateParams: {
                    propertyId: string
                    status: string
                    soldPrice?: number
                    notes?: string
                } = {
                    propertyId: id,
                    status: selectedStatus,
                }

                // Add sold price only for single property updates
                if (isSinglePropertyUpdate && soldPrice && (selectedStatus === 'Sold' || selectedStatus === 'Rented')) {
                    updateParams.soldPrice = parseFloat(soldPrice)
                }

                // Add notes if provided
                if (notes.trim()) {
                    updateParams.notes = notes.trim()
                }

                // Call the API service
                return dispatch(updatePropertyStatus(updateParams)).unwrap()
            })

            // Wait for all updates to complete
            await Promise.all(updatePromises)

            toast.success(
                `Successfully updated ${propertyIdsToUpdate.length} ${propertyIdsToUpdate.length === 1 ? 'property' : 'properties'}`,
            )

            // Call the original onUpdate callback if provided (for backward compatibility)
            if (onUpdate) {
                onUpdate(selectedStatus, soldPrice || undefined)
            }

            onClose()
        } catch (error) {
            console.error('Failed to update property status:', error)
            toast.error('Failed to update property status. Please try again.')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className='fixed inset-0 bg-black/75 bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg shadow-xl w-96 max-w-md mx-4'>
                {/* Header */}
                <div className='px-6 py-4 border-b border-gray-200'>
                    <h2 className='text-lg font-semibold text-gray-900'>Update Inventory Status</h2>
                    <p className='text-sm text-gray-600 mt-1'>
                        Updating status for {selectedCount} selected {selectedCount === 1 ? 'property' : 'properties'}
                    </p>
                </div>

                {/* Content */}
                <div className='px-6 py-4 space-y-4'>
                    {/* Status Dropdown */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Status</label>
                        <div className='relative'>
                            <Dropdown
                                options={getStatusOptions()}
                                onSelect={(value) => setSelectedStatus(value as PropertyStatus)}
                                defaultValue={selectedStatus}
                                placeholder='Select Status'
                                className='w-full'
                                triggerClassName='w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                            />
                        </div>
                    </div>

                    {/* Sold/Rented Price Field - Only show for single property updates when status is Sold or Rented */}
                    {isSinglePropertyUpdate && (selectedStatus === 'Sold' || selectedStatus === 'Rented') && (
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                {selectedStatus === 'Sold' ? 'Sold Price' : 'Monthly Rent'} (in Lakhs) *
                            </label>
                            <StateBaseTextField
                                placeholder='Enter amount in lakhs'
                                value={soldPrice}
                                onChange={(e) => setSoldPrice(e.target.value)}
                                className='w-full'
                                type='number'
                                step='0.01'
                                required
                            />
                        </div>
                    )}

                    {/* Notes Field */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Notes (Optional)</label>
                        <textarea
                            placeholder='Add notes...'
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm'
                        />
                    </div>

                    {/* Info message for bulk updates */}
                    {!isSinglePropertyUpdate && (selectedStatus === 'Sold' || selectedStatus === 'Rented') && (
                        <div className='bg-blue-50 border border-blue-200 rounded-md p-3'>
                            <div className='flex'>
                                <div className='ml-3'>
                                    <p className='text-sm text-blue-700'>
                                        <strong>Note:</strong>{' '}
                                        {selectedStatus === 'Sold' ? 'Sold price' : 'Monthly rent'} cannot be set for
                                        bulk updates. Please update properties individually to set{' '}
                                        {selectedStatus === 'Sold' ? 'sold prices' : 'monthly rent'}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
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

export default UpdateInventoryStatusModal
