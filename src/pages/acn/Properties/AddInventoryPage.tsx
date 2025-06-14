'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import Button from '../../../components/design-elements/Button'
import FormFieldRenderer from './AddInventoryRenderer'
import { formConfigs, type PropertyType } from './add-inventory_config'
import { generateProperties, type Property } from '../../../pages/dummy_data/acn_properties_inventory_dummy_data'

// Asset type options
const assetTypes: { label: string; value: PropertyType; icon: string }[] = [
    { label: 'flats/apartments', value: 'apartments', icon: '🏢' },
    { label: 'Villa', value: 'villa', icon: '🏡' },
    { label: 'plot', value: 'plot', icon: '🏞️' },
    { label: 'Row House', value: 'rowhouse', icon: '🏘️' },
    { label: 'Villament', value: 'villament', icon: '🏠' },
    { label: 'Independent Building', value: 'independent', icon: '🏛️' },
]

// Helper function to map property data to form fields
const mapPropertyToFormData = (property: Property): Record<string, any> => {
    return {
        // Basic Information
        communityType: 'gated', // Default or derive from property
        projectName: property.propertyName,
        sbua: property.sbua?.replace(/[^\d]/g, ''), // Remove non-numeric characters
        carpetArea: '', // Not available in current property structure
        floorNo: '', // Not available in current property structure
        doorFacing: property.facing?.toLowerCase(),
        unitNo: property.propertyId,
        furnishing: '', // Not available in current property structure

        // Property type specific
        bedrooms: property.assetType?.includes('BHK') ? property.assetType.charAt(0) : '',
        apartmentType: 'simplex', // Default

        // Pricing
        totalAskPrice: property.salePrice || property.monthlyRent,
        handoverDate: property.possessionDate,
        readyToMove: false, // Default

        // Additional details
        balconyFacing: 'outside', // Default
        ageOfBuilding: '', // Not available
        insideOutsideFacing: 'outside', // Default
        ups: '', // Not available
        carPark: '', // Not available
        cornerUnit: false, // Default
        ocReceived: false, // Default
        tenanted: false, // Default
        rentalIncome: '', // Not available
        exclusive: false, // Default

        // Legal documents
        buildingKhata: 'a_khata', // Default
        landKhata: 'a_khata', // Default
        eKhata: false, // Default
        biappaApprovedKhata: false, // Default
        bdaApprovedKhata: false, // Default

        // Files and notes
        fileUpload: [],
        extraDetails: '',
    }
}

// Helper function to determine property type from asset type
const getPropertyTypeFromAssetType = (assetType: string): PropertyType => {
    if (assetType.includes('BHK') || assetType.toLowerCase().includes('apartment')) {
        return 'apartments'
    } else if (assetType.toLowerCase().includes('villa')) {
        return 'villa'
    } else if (assetType.toLowerCase().includes('plot')) {
        return 'plot'
    } else if (assetType.toLowerCase().includes('row')) {
        return 'rowhouse'
    } else if (assetType.toLowerCase().includes('villament')) {
        return 'villament'
    } else {
        return 'independent'
    }
}

const AddEditInventoryPage = () => {
    const navigate = useNavigate()
    const { pId } = useParams<{ pId: string }>()
    const isEditMode = Boolean(pId)

    const [selectedAssetType, setSelectedAssetType] = useState<PropertyType>('apartments')
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [property, setProperty] = useState<Property | null>(null)

    // Load property data if in edit mode
    useEffect(() => {
        if (isEditMode && pId) {
            setLoading(true)

            // Simulate API call - replace with actual API call
            const fetchProperty = async () => {
                try {
                    // For demo purposes, generate sample data and find the property
                    // In real app, you'd make an API call here
                    const sampleData = generateProperties(200, 'Resale')
                    const foundProperty = sampleData.find((p) => p.id === pId)

                    if (foundProperty) {
                        setProperty(foundProperty)

                        // Determine property type from asset type
                        const propertyType = getPropertyTypeFromAssetType(foundProperty.assetType)
                        setSelectedAssetType(propertyType)

                        // Map property data to form fields
                        const mappedData = mapPropertyToFormData(foundProperty)
                        setFormData(mappedData)
                    } else {
                        console.error('Property not found')
                        // Optionally redirect back to properties page
                        navigate('/acn/properties')
                    }
                } catch (error) {
                    console.error('Error fetching property:', error)
                } finally {
                    setLoading(false)
                }
            }

            fetchProperty()
        }
    }, [isEditMode, pId, navigate])

    const handleFieldChange = (fieldId: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }))

        // Clear error when user starts typing
        if (errors[fieldId]) {
            setErrors((prev) => ({
                ...prev,
                [fieldId]: '',
            }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        const config = formConfigs[selectedAssetType]

        config.forEach((section) => {
            section.fields.forEach((field) => {
                if (field.required && !formData[field.id]) {
                    newErrors[field.id] = `${field.label} is required`
                }
            })
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (validateForm()) {
            setLoading(true)
            try {
                if (isEditMode) {
                    // Update existing property
                    console.log('Updating property:', pId, formData)
                    // Make API call to update property
                    // await updateProperty(pId, formData)
                } else {
                    // Create new property
                    console.log('Creating new property:', formData)
                    // Make API call to create property
                    // await createProperty(formData)
                }

                // Navigate back to properties page
                navigate('/acn/properties')
            } catch (error) {
                console.error('Error saving property:', error)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleSaveDraft = () => {
        console.log('Draft saved:', formData)
        // Handle save draft
    }

    const currentConfig = formConfigs[selectedAssetType]

    if (loading) {
        return (
            <Layout loading={true}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-lg'>Loading...</div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-6 px-6 bg-white min-h-screen'>
                    {/* Header */}
                    <div className='mb-6'>
                        <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
                            {isEditMode ? 'Edit Inventory' : 'Add Inventory'}
                        </h1>
                        {isEditMode && property && (
                            <p className='text-gray-600 mb-6'>
                                Editing: {property.propertyName} ({property.propertyId})
                            </p>
                        )}

                        {/* Asset Type Selection */}
                        <div className='mb-8'>
                            <h2 className='text-lg font-medium text-gray-900 mb-4'>Asset Type</h2>
                            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                                {assetTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setSelectedAssetType(type.value)}
                                        disabled={isEditMode} // Disable asset type change in edit mode
                                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                            selectedAssetType === type.value
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                        } ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className='text-2xl mb-2'>{type.icon}</div>
                                        <div className='text-sm font-medium'>{type.label}</div>
                                    </button>
                                ))}
                            </div>
                            {isEditMode && (
                                <p className='text-sm text-gray-500 mt-2'>Asset type cannot be changed in edit mode</p>
                            )}
                        </div>
                    </div>

                    {/* Form Sections */}
                    <div className='space-y-8'>
                        {currentConfig.map((section, sectionIndex) => (
                            <div key={sectionIndex} className='bg-white border border-gray-200 rounded-lg p-6'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-6'>{section.title}</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    {section.fields.map((field) => (
                                        <FormFieldRenderer
                                            key={field.id}
                                            field={field}
                                            value={formData[field.id]}
                                            onChange={(value) => handleFieldChange(field.id, value)}
                                            error={errors[field.id]}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className='flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200'>
                        <Button
                            bgColor='bg-white'
                            textColor='text-gray-700'
                            className='px-6 py-2 border border-gray-300 hover:bg-gray-50'
                            onClick={handleSaveDraft}
                            disabled={loading}
                        >
                            Save as draft
                        </Button>
                        <Button
                            bgColor='bg-gray-900'
                            textColor='text-white'
                            className='px-6 py-2 hover:bg-gray-800'
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isEditMode ? 'Update' : 'Submit'}
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AddEditInventoryPage
