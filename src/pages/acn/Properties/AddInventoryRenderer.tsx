'use client'

import React, { useState } from 'react'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import Dropdown from '../../../components/design-elements/Dropdown'
import { SelectionGroup } from '../../../components/design-elements/SelectionButtonsGroup'
import PlacesSearch from '../../../components/design-elements/PlacesSearch'

// Import your existing component configurations
import { appartmentComponents } from '../../../components/acn/addInventoryConfigs/apartmentComponents'
import { villaComponents } from '../../../components/acn/addInventoryConfigs/villaComponents'
import { plotComponents } from '../../../components/acn/addInventoryConfigs/plotComponents'
import { villamentComponents } from '../../../components/acn/addInventoryConfigs/villamentComponents'
import { rowhouseComponents } from '../../../components/acn/addInventoryConfigs/rowhouseComponents'
import { independentComponents } from '../../../components/acn/addInventoryConfigs/independentComponents'

// Types
export interface PropertyData {
    id?: string
    propertyId?: string
    cpId?: string
    cpCode?: string
    assetType: string
    dateOfInventoryAdded?: number
    dateOfStatusLastChecked?: number
    _geoloc?: { lat: number; lng: number }
    [key: string]: any // Dynamic properties
}

export interface FormField {
    label?: string
    type: string
    field?: string
    required?: boolean
    placeholder?: string
    options?: { label: string; value: string }[]
    option?: { label: string; value: string }[]
    gridCols?: 1 | 2
    colspan?: number
    keyboardType?: string
    suffix?: string
    prefix?: string
    footer?: string
    numberToStringFooter?: boolean
}

// Asset configurations
export const assetConfigurations = {
    Apartment: appartmentComponents,
    Villa: villaComponents,
    Plot: plotComponents,
    Villament: villamentComponents,
    'Row House': rowhouseComponents,
    'Independent Building': independentComponents,
} as const

type AssetType = keyof typeof assetConfigurations

// Compulsory fields - now more flexible
export const getCompulsoryFields = (assetType: AssetType): string[] => {
    const fieldMappings = {
        Apartment: [
            'communityType',
            'propertyName',
            'subType',
            'sbua',
            'exactFloor',
            'facing',
            'unitType',
            'totalAskPrice',
        ],
        Villa: ['communityType', 'propertyName', 'sbua', 'structure', 'facing', 'unitType', 'totalAskPrice'],
        Plot: ['communityType', 'propertyName', 'plotSize', 'facing', 'totalAskPrice'],
        Villament: [
            'communityType',
            'propertyName',
            'exactFloor',
            'sbua',
            'structure',
            'facing',
            'unitType',
            'totalAskPrice',
        ],
        'Row House': ['communityType', 'propertyName', 'sbua', 'structure', 'facing', 'unitType', 'totalAskPrice'],
        'Independent Building': [
            'communityType',
            'propertyName',
            'sbua',
            'plotSize',
            'structure',
            'facing',
            'totalAskPrice',
        ],
    }

    return fieldMappings[assetType] || []
}

interface FormFieldRendererProps {
    field: FormField
    value: any
    onChange: (value: any) => void
    error?: string
    assetType?: AssetType
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({ field, value, onChange, error, assetType }) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

    // Check if field is compulsory
    const fieldKey = field.field || ''
    const isCompulsoryField = assetType ? getCompulsoryFields(assetType).includes(fieldKey) : false

    const renderField = () => {
        // Custom: Use PlacesSearch for propertyName
        // if (field.field === 'propertyName') {
        //     return (
        //         <PlacesSearch
        //             selectedPlace={value && value.lat && value.lng ? value : null}
        //             setSelectedPlace={(place) => {
        //                 if (place) {
        //                     // Pass a composite object to parent: { name, address, lat, lng, mapLocation }
        //                     onChange({
        //                         name: place.name,
        //                         address: place.address,
        //                         lat: place.lat,
        //                         lng: place.lng,
        //                         mapLocation: place.mapLocation,
        //                     })
        //                 } else {
        //                     onChange('')
        //                 }
        //             }}
        //             placeholder={field.placeholder || 'Search property name...'}
        //             label={field.label || 'Property Name'}
        //             required={field.required}
        //             error={error}
        //         />
        //     )
        // }
        switch (field.type) {
            case 'text':
            case 'number':
            case 'textInput':
                return (
                    <div className='relative'>
                        {field.prefix && (
                            <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm'>
                                {field.prefix}
                            </span>
                        )}
                        <StateBaseTextField
                            placeholder={field.placeholder}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            type={field.type === 'number' || field.keyboardType === 'numeric' ? 'number' : 'text'}
                            className={`w-full ${field.prefix ? 'pl-8' : ''} ${field.suffix ? 'pr-12' : ''}`}
                        />
                        {field.suffix && (
                            <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm'>
                                {field.suffix}
                            </span>
                        )}
                    </div>
                )

            case 'dropdown':
            case 'Dropdown':
                return (
                    <Dropdown
                        options={field.option || field.options || []}
                        onSelect={onChange}
                        defaultValue={value}
                        placeholder={field.placeholder || `Select ${field.label}`}
                        className='w-full'
                        triggerClassName='w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                        optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                    />
                )

            case 'radioSelect':
                return (
                    <SelectionGroup
                        title=''
                        type='radio'
                        color='blue'
                        options={field.options || []}
                        name={fieldKey}
                        onChange={(values) => onChange(values[0])}
                        className='flex gap-6'
                    />
                )

            case 'slider':
                return (
                    <div className='flex flex-wrap gap-2'>
                        {field.options?.map((option) => (
                            <button
                                key={option.value}
                                type='button'
                                onClick={() => onChange(option.value)}
                                className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                                    value === option.value
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )

            case 'multiSelectSlider':
                return (
                    <SelectionGroup
                        title=''
                        type='checkbox'
                        color='blue'
                        options={field.options || []}
                        multiSelect={true}
                        onChange={onChange}
                        className='flex gap-4'
                    />
                )

            case 'Checkbox':
                return (
                    <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                            type='checkbox'
                            checked={value || false}
                            onChange={(e) => onChange(e.target.checked)}
                            className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                        />
                        <span className='text-sm text-gray-700'>{field.label}</span>
                    </label>
                )

            case 'TotalAskPrice':
                return (
                    <div className='space-y-2'>
                        <div className='relative'>
                            <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm'>
                                ₹
                            </span>
                            <StateBaseTextField
                                placeholder='Enter total ask price'
                                value={value || ''}
                                onChange={(e) => onChange(e.target.value)}
                                type='number'
                                className='w-full pl-8'
                            />
                        </div>
                        {field.numberToStringFooter && value && (
                            <p className='text-xs text-gray-500'>
                                {new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                    maximumFractionDigits: 0,
                                }).format(Number(value))}
                            </p>
                        )}
                    </div>
                )

            case 'MonthYearPicker':
                return (
                    <div className='grid grid-cols-2 gap-2'>
                        <select
                            value={value?.month || ''}
                            onChange={(e) => onChange({ ...value, month: e.target.value })}
                            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            <option value=''>Month</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={value?.year || ''}
                            onChange={(e) => onChange({ ...value, year: e.target.value })}
                            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            <option value=''>Year</option>
                            {Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() + i
                                return (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                )

            case 'Document':
                return (
                    <div className='space-y-4'>
                        <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                            <div className='flex flex-col items-center'>
                                <svg
                                    className='w-8 h-8 text-gray-400 mb-2'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                                    />
                                </svg>
                                <p className='text-sm text-gray-600 mb-2'>Upload property documents</p>
                                <input
                                    type='file'
                                    multiple
                                    accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || [])
                                        setUploadedFiles((prev) => [...prev, ...files])
                                        onChange([...uploadedFiles, ...files])
                                    }}
                                    className='hidden'
                                    id={`file-upload-${fieldKey}`}
                                />
                                <label
                                    htmlFor={`file-upload-${fieldKey}`}
                                    className='px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md cursor-pointer hover:bg-blue-100'
                                >
                                    Browse Documents
                                </label>
                            </div>
                        </div>
                    </div>
                )

            case 'ExtraDetails':
                return (
                    <textarea
                        placeholder='Add any additional details...'
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        rows={4}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm'
                    />
                )

            case 'Project Name':
                return (
                    <StateBaseTextField
                        placeholder='Enter project name'
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        type='text'
                        className='w-full'
                    />
                )

            default:
                return (
                    <div className='p-4 bg-gray-100 rounded-md'>
                        <p className='text-sm text-gray-600'>Field type "{field.type}" not implemented yet</p>
                    </div>
                )
        }
    }

    const colSpan = field.gridCols || field.colspan || 1

    return (
        <div className={`space-y-2 ${colSpan === 1 ? 'col-span-1' : 'col-span-2'}`}>
            {field.type !== 'Checkbox' && field.label && (
                <label className='block text-sm font-medium text-gray-700'>
                    {field.label}
                    {(field.required || isCompulsoryField) && <span className='text-red-500 ml-1'>*</span>}
                </label>
            )}
            {renderField()}
            {field.footer && <p className='text-xs text-gray-500 mt-1'>{field.footer}</p>}
            {error && <p className='text-sm text-red-600'>{error}</p>}
        </div>
    )
}

// Utility functions
export const getAssetTypeConfig = (assetType: AssetType) => {
    return assetConfigurations[assetType]
}

export const validateCompulsoryFields = (
    assetType: AssetType,
    formData: Record<string, any>,
): { isValid: boolean; missingFields: string[] } => {
    const required = getCompulsoryFields(assetType)
    const missingFields = required.filter((field) => !formData[field])

    return {
        isValid: missingFields.length === 0,
        missingFields,
    }
}

export default FormFieldRenderer
