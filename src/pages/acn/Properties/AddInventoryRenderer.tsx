'use client'

import React, { useState } from 'react'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import Dropdown from '../../../components/design-elements/Dropdown'
import { SelectionGroup } from '../../../components/design-elements/SelectionButtonsGroup'
// Import or create the following field components to match native logic
import PlacesSearch from '../../../components/design-elements/PlacesSearch'
import MonthYearPicker from '../../../components/design-elements/ListingFields/MonthYearPicker'
import TotalAskPrice from '../../../components/design-elements/ListingFields/TotalAskPrice'
import CheckBox from '../../../components/design-elements/ListingFields/CheckBox'
import ExtraDetailsField from '../../../components/design-elements/ListingFields/ExtraDetailsField'
import TextInputField from '../../../components/design-elements/ListingFields/TextInputField'
import DropdownField from '../../../components/design-elements/ListingFields/DropdownField'
import RadioButtonSelect from '../../../components/design-elements/ListingFields/RadioButtonSelect'
import SliderButtonSelect from '../../../components/design-elements/ListingFields/SliderButtonSelect'
import MultiSelectSlider from '../../../components/design-elements/ListingFields/MultiSelectSlider'
import DocumentField from '../../../components/design-elements/ListingFields/DocumentField'

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

const FIELD_COMPONENTS: Record<string, any> = {
    textInput: TextInputField,
    text: TextInputField,
    number: TextInputField,
    dropdown: DropdownField,
    Dropdown: DropdownField,
    radioSelect: RadioButtonSelect,
    slider: SliderButtonSelect,
    multiSelectSlider: MultiSelectSlider,
    Checkbox: CheckBox,
    MonthYearPicker: MonthYearPicker,
    TotalAskPrice: TotalAskPrice,
    ExtraDetails: ExtraDetailsField,
    projectName: PlacesSearch,
    placesSearch: PlacesSearch,
    Document: DocumentField,
}

interface FormFieldRendererProps {
    field: FormField
    value: any
    onChange: (value: any) => void
    error?: string
    assetType?: AssetType
    formData?: Record<string, any>
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
    field,
    value,
    onChange,
    error,
    // assetType,
    formData,
}) => {
    // Check if field is compulsory
    // const fieldKey = field.field || ''
    // const isCompulsoryField = assetType ? getCompulsoryFields(assetType).includes(fieldKey) : false
    const isRequired = field.required
    const FieldComponent = FIELD_COMPONENTS[field.type]

    if (!FieldComponent) {
        return (
            <div className='p-4 bg-gray-100 rounded-md'>
                <p className='text-sm text-gray-600'>Field type "{field.type}" not implemented yet</p>
            </div>
        )
    }

    // Map props for each field type
    switch (field.type) {
        case 'textInput':
        case 'text':
        case 'number':
            return (
                <TextInputField
                    value={value}
                    setValue={onChange}
                    label={field.label}
                    required={isRequired}
                    placeholder={field.placeholder}
                    prefix={field.prefix}
                    suffix={field.suffix}
                    type={field.type === 'number' ? 'number' : 'text'}
                    error={error}
                />
            )
        case 'dropdown':
        case 'Dropdown':
            return (
                <DropdownField
                    value={value}
                    setValue={onChange}
                    label={field.label}
                    required={isRequired}
                    options={field.option || field.options || []}
                    placeholder={field.placeholder}
                    error={error}
                />
            )
        case 'radioSelect':
            return (
                <RadioButtonSelect
                    value={value}
                    setValue={onChange}
                    label={field.label}
                    required={isRequired}
                    options={field.options || []}
                    error={error}
                />
            )
        case 'slider':
            return (
                <SliderButtonSelect
                    value={value}
                    setValue={onChange}
                    label={field.label}
                    required={isRequired}
                    options={field.options || []}
                    footer={field.footer}
                    error={error}
                />
            )
        case 'multiSelectSlider':
            return (
                <MultiSelectSlider
                    value={value || []}
                    setValue={onChange}
                    label={field.label}
                    required={isRequired}
                    options={field.options || []}
                    footer={field.footer}
                    error={error}
                />
            )
        case 'Checkbox':
            return <CheckBox checked={!!value} setChecked={onChange} label={field.label} required={isRequired} />
        case 'MonthYearPicker':
            return <MonthYearPicker value={value} setValue={onChange} title={field.label} required={isRequired} />
        case 'TotalAskPrice':
            return (
                <TotalAskPrice
                    onPriceChange={(_unit: string, price: number) => onChange(price)}
                    initialPrice={value}
                    title={field.label}
                    required={isRequired}
                    sbua={formData?.sbua}
                />
            )
        case 'ExtraDetails':
            return (
                <ExtraDetailsField
                    value={value}
                    setValue={onChange}
                    placeholder={field.placeholder}
                    required={isRequired}
                />
            )
        case 'projectName':
        case 'placesSearch':
            return (
                <PlacesSearch
                    selectedPlace={value}
                    setSelectedPlace={onChange}
                    placeholder={field.placeholder}
                    label={field.label}
                    required={isRequired}
                />
            )
        case 'Document':
            return (
                <DocumentField
                    value={value || []}
                    setValue={onChange}
                    label={field.label}
                    required={isRequired}
                    error={error}
                    propertyId={formData?.propertyId}
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
