'use client'

import React, { useState, useEffect } from 'react'
import { type PropertyStatus, type PropertyType } from '../../pages/dummy_data/acn_properties_inventory_dummy_data'
import Dropdown from '../design-elements/Dropdown'
import StateBaseTextField from '../design-elements/StateBaseTextField'
import Button from '../design-elements/Button'

interface UpdateInventoryStatusModalProps {
    isOpen: boolean
    onClose: () => void
    propertyType: PropertyType
    selectedCount: number
    onUpdate: (status: PropertyStatus, soldPrice?: string) => void
}

const UpdateInventoryStatusModal: React.FC<UpdateInventoryStatusModalProps> = ({
    isOpen,
    onClose,
    propertyType,
    selectedCount,
    onUpdate,
}) => {
    const [selectedStatus, setSelectedStatus] = useState<PropertyStatus>('Available')
    const [soldPrice, setSoldPrice] = useState('')
    const [notes, setNotes] = useState('')

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
                value: 'Available',
                color: '#E1F6DF',
                textColor: '#065F46',
            },
            {
                label: 'Hold',
                value: 'Hold',
                color: '#FFF3CD',
                textColor: '#B45309',
            },
            {
                label: 'De-Listed',
                value: 'De-Listed',
                color: '#F3F4F6',
                textColor: '#374151',
            },
        ]

        if (propertyType === 'Resale') {
            baseOptions.splice(1, 0, {
                label: 'Sold',
                value: 'Sold',
                color: '#FEECED',
                textColor: '#991B1B',
            })
        } else {
            baseOptions.splice(1, 0, {
                label: 'Rented',
                value: 'Sold', // Using 'Sold' as value but showing 'Rented'
                color: '#FEECED',
                textColor: '#991B1B',
            })
        }

        return baseOptions
    }

    const handleUpdate = () => {
        onUpdate(selectedStatus, soldPrice || undefined)
        onClose()
    }

    // const getStatusColor = (status: PropertyStatus) => {
    //     switch (status) {
    //         case 'Available':
    //             return 'bg-green-500'
    //         case 'Sold':
    //             return 'bg-red-500'
    //         case 'Hold':
    //             return 'bg-orange-500'
    //         case 'De-Listed':
    //             return 'bg-gray-500'
    //         default:
    //             return 'bg-gray-500'
    //     }
    // }

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
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
                                // renderOption={(option) => (
                                //     <div className="flex items-center gap-2">
                                //         <div
                                //             className={`w-3 h-3 rounded-full ${getStatusColor(option.value as PropertyStatus)}`}
                                //         />
                                //         <span>{option.label}</span>
                                //     </div>
                                // )}
                            />
                        </div>
                    </div>

                    {/* Sold Price Field - Only show when status is Sold/Rented */}
                    {selectedStatus === 'Sold' && (
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                {propertyType === 'Resale' ? 'Sold Price' : 'Monthly Rent'}
                            </label>
                            <StateBaseTextField
                                placeholder='in Lakhs'
                                value={soldPrice}
                                onChange={(e) => setSoldPrice(e.target.value)}
                                className='w-full'
                            />
                        </div>
                    )}

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
                    >
                        Cancel
                    </Button>
                    <Button
                        bgColor='bg-gray-900'
                        textColor='text-white'
                        className='px-4 py-2 text-sm hover:bg-gray-800'
                        onClick={handleUpdate}
                    >
                        Update
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default UpdateInventoryStatusModal
