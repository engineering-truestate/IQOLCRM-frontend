'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../../store/index'
import { fetchPropertyById, updateProperty } from '../../../services/acn/properties/propertiesService'
import { addQCInventory, updateQCInventory, fetchQCInventoryById } from '../../../services/acn/qc/qcService'
import { fetchAgentByPhone } from '../../../services/acn/agents/agentThunkService'
import { clearCurrentProperty, clearError } from '../../../store/reducers/acn/propertiesReducers'
import { clearCurrentQCInventory } from '../../../store/reducers/acn/qcReducer'
import { clearCurrentAgent, clearAgentError } from '../../../store/reducers/acn/agentsReducer'
import { getMicromarketFromCoordinates } from '../../../components/helper/findMicromarket'
import Layout from '../../../layout/Layout'
import Button from '../../../components/design-elements/Button'
// import PlacesSearch from '../../../components/design-elements/PlacesSearch'
import FormFieldRenderer, {
    assetConfigurations,
    getAssetTypeConfig,
    validateCompulsoryFields,
} from './AddInventoryRenderer'
import { type IInventory } from '../../../store/reducers/acn/propertiesTypes'
import type { IQCInventory } from '../../../data_types/acn/types'
import { type FileToUpload } from '../../../services/acn/upload/fileUploadService'

// Import icons
import apartmentIcon from '/icons/acn/ListingFlow/Apartments.svg'
import villaIcon from '/icons/acn/ListingFlow/Villas.svg'
import plotIcon from '/icons/acn/ListingFlow/Plots.svg'
import villamentIcon from '/icons/acn/ListingFlow/Villaments.svg'
import rowhouseIcon from '/icons/acn/ListingFlow/RowHouses.svg'
import independentIcon from '/icons/acn/ListingFlow/IndependentBuildings.svg'
import { toast } from 'react-toastify'
import useAuth from '../../../hooks/useAuth'

// Map old PropertyType to new AssetType
type PropertyType = 'apartments' | 'villa' | 'plot' | 'rowhouse' | 'villament' | 'independent'
type AssetType = keyof typeof assetConfigurations

// Asset type mapping
const propertyTypeToAssetType: Record<PropertyType, AssetType> = {
    apartments: 'Apartment',
    villa: 'Villa',
    plot: 'Plot',
    rowhouse: 'Row House',
    villament: 'Villament',
    independent: 'Independent Building',
}

// Asset type options
const assetTypes: { label: string; value: PropertyType; icon: string }[] = [
    { label: 'flats/ apartments', value: 'apartments', icon: apartmentIcon },
    { label: 'Villa', value: 'villa', icon: villaIcon },
    { label: 'Plot', value: 'plot', icon: plotIcon },
    { label: 'Row House', value: 'rowhouse', icon: rowhouseIcon },
    { label: 'Villament', value: 'villament', icon: villamentIcon },
    { label: 'Independent Building', value: 'independent', icon: independentIcon },
]

interface Places {
    name: string
    lat: number
    lng: number
    address: string
    mapLocation: string
}

// Helper function to map property data to form fields
const mapPropertyToFormData = (property: IInventory): Record<string, any> => {
    return {
        propertyName: property.propertyName || property.area,
        communityType: property.communityType || 'gated',
        subType: property.subType || 'Simplex',
        sbua: property.sbua?.toString() || '',
        carpet: property.carpet?.toString() || '',
        exactFloor: property.exactFloor || property.floorNo || '',
        facing: property.facing || '',
        unitNo: property.unitNo || property.propertyId,
        furnishing: property.furnishing || 'unfurnished',
        unitType: property.unitType || '',
        noOfBathrooms: property.noOfBathrooms?.toString() || '1',
        noOfBalconies: property.noOfBalconies?.toString() || '0',
        totalAskPrice: property.totalAskPrice?.toString() || '',
        handoverDate: property.handoverDate
            ? {
                  month: new Date(property.handoverDate).getMonth() + 1,
                  year: new Date(property.handoverDate).getFullYear(),
              }
            : null,
        currentStatus: property.currentStatus === 'Available',
        buildingAge: property.buildingAge?.toString() || 'New Building',
        balconyFacing: property.balconyFacing || 'outside',
        uds: property.uds?.toString() || '',
        carPark: property.carPark?.toString() || '',
        cornerUnit: property.cornerUnit || false,
        exclusive: property.exclusive || false,
        tenanted: property.tenanted || false,
        ocReceived: property.ocReceived || false,
        rentalIncome: property.rentalIncome?.toString() || '',
        buildingKhata: property.buildingKhata || 'A-Khata',
        landKhata: property.landKhata || 'A-Khata',
        eKhata: property.eKhata || false,
        biappaApproved: property.biappaApproved || false,
        bdaApproved: property.bdaApproved || false,
        extraDetails: property.extraDetails || '',
        plotSize: property.plotSize?.toString() || '',
        structure: property.structure || '',
        micromarket: property.micromarket || '',
        area: property.area || '',
        mapLocation: property.mapLocation || '',
        document: property.document || [],
        photo: property.photo || [],
        video: property.video || [],
        driveLink: property.driveLink || '',
        agentName: property.agentName || '',
        agentPhoneNumber: property.agentPhoneNumber || '',
    }
}

// Helper function to map QC data to form fields
const mapQCToFormData = (qc: IQCInventory): Record<string, any> => {
    return {
        communityType: qc.communityType || 'gated',
        propertyName: qc.propertyName || qc.area,
        subType: qc.subType || 'Simplex',
        sbua: qc.sbua?.toString() || '',
        carpet: qc.carpet?.toString() || '',
        exactFloor: qc.exactFloor?.toString() || qc.floorNo?.toString() || '',
        facing: qc.facing || '',
        unitNo: qc.unitNo || qc.propertyId,
        furnishing: qc.furnishing || 'unfurnished',
        unitType: qc.unitType || '',
        noOfBathrooms: qc.noOfBathrooms || '1',
        noOfBalconies: qc.noOfBalconies || '0',
        totalAskPrice: qc.totalAskPrice?.toString() || '',
        handoverDate: qc.handoverDate
            ? {
                  month: new Date(qc.handoverDate).getMonth() + 1,
                  year: new Date(qc.handoverDate).getFullYear(),
              }
            : null,
        currentStatus: qc.currentStatus === 'ready to move',
        buildingAge: qc.buildingAge?.toString() || 'New Building',
        balconyFacing: qc.balconyFacing || 'outside',
        uds: qc.uds?.toString() || '',
        carPark: qc.carPark?.toString() || '',
        cornerUnit: qc.cornerUnit || false,
        exclusive: qc.exclusive || false,
        tenanted: qc.tenanted || false,
        ocReceived: qc.ocReceived || false,
        rentalIncome: qc.rentalIncome?.toString() || '',
        buildingKhata: qc.buildingKhata || 'A-Khata',
        landKhata: qc.landKhata || 'A-Khata',
        eKhata: qc.eKhata || false,
        biappaApproved: qc.biappaApproved || false,
        bdaApproved: qc.bdaApproved || false,
        extraDetails: qc.extraDetails || '',
        plotSize: qc.plotSize?.toString() || '',
        structure: qc.structure?.toString() || '',
        micromarket: qc.micromarket || '',
        area: qc.area || '',
        mapLocation: qc.mapLocation || '',
        document: qc.document || [],
        photo: qc.photo || [],
        video: qc.video || [],
        driveLink: qc.driveLink || '',
    }
}

// Helper function to map form data to Property
const mapFormDataToProperty = (formData: Record<string, any>, assetType: PropertyType): Partial<IInventory> => {
    return {
        propertyName: formData.propertyName || '',
        area: formData.area || formData.propertyName || '',
        micromarket: formData.micromarket || '',
        mapLocation: formData.mapLocation || '',
        assetType: propertyTypeToAssetType[assetType],
        unitType: formData.unitType || '',
        subType: formData.subType || '',
        sbua: formData.sbua ? parseInt(formData.sbua) : 0,
        carpet: formData.carpet ? parseInt(formData.carpet) : null,
        plotSize: formData.plotSize ? parseInt(formData.plotSize) : null,
        buildingAge:
            typeof formData.buildingAge === 'string' && formData.buildingAge !== 'New Building'
                ? parseInt(formData.buildingAge.split('-')[0])
                : null,
        floorNo: formData.exactFloor || '',
        exactFloor: formData.exactFloor || '',
        facing: formData.facing || '',
        furnishing: formData.furnishing || 'unFurnished',
        noOfBathrooms: formData.noOfBathrooms ? parseInt(formData.noOfBathrooms) : 1,
        noOfBalconies: formData.noOfBalconies ? parseInt(formData.noOfBalconies) : 0,
        balconyFacing: formData.balconyFacing || '',
        uds: formData.uds ? parseInt(formData.uds) : null,
        carPark: formData.carPark ? parseInt(formData.carPark) : null,
        cornerUnit: Boolean(formData.cornerUnit),
        exclusive: Boolean(formData.exclusive),
        tenanted: Boolean(formData.tenanted),
        ocReceived: Boolean(formData.ocReceived),
        rentalIncome: formData.rentalIncome ? parseInt(formData.rentalIncome) : null,
        buildingKhata: formData.buildingKhata || null,
        landKhata: formData.landKhata || null,
        eKhata: Boolean(formData.eKhata),
        biappaApproved: Boolean(formData.biappaApproved),
        bdaApproved: Boolean(formData.bdaApproved),
        structure: formData.structure || '',
        communityType: formData.communityType || '',
        unitNo: formData.unitNo || '',
        totalAskPrice: formData.totalAskPrice ? parseInt(formData.totalAskPrice) : 0,
        askPricePerSqft: formData.askPricePerSqft ? parseInt(formData.askPricePerSqft) : 0,
        currentStatus: formData.currentStatus ? 'Available' : 'Under Construction',
        status: formData.status || 'Available',
        handoverDate:
            formData.handoverDate && formData.handoverDate.month && formData.handoverDate.year
                ? new Date(formData.handoverDate.year, formData.handoverDate.month - 1).getTime()
                : null,
        photo: Array.isArray(formData.photo) ? formData.photo : [],
        video: Array.isArray(formData.video) ? formData.video : [],
        document: Array.isArray(formData.document) ? formData.document : [],
        driveLink: formData.driveLink || '',
        extraDetails: formData.extraDetails || '',
        cpId: formData.cpId || 'CURRENT_USER_ID',
        _geoloc: formData._geoloc || { lat: 0, lng: 0 },
        dateOfInventoryAdded: Date.now(),
        dateOfStatusLastChecked: Date.now(),
        ageOfInventory: 0,
        ageOfStatus: 0,
        agentName: formData.name,
        agentPhoneNumber: formData.phoneNumber || '',
    }
}

// Helper function to map form data to QC
const mapFormDataToQC = (
    formData: Record<string, any>,
    assetType: PropertyType,
    kamId: string,
    kamName: string,
): Partial<IQCInventory> => {
    return {
        agentName: formData.name,
        agentPhoneNumber: formData.phoneNumber || '',
        propertyName: formData.propertyName || '',
        address: formData.area || formData.propertyName || '',
        area: formData.area || formData.propertyName || '',
        micromarket: formData.micromarket || '',
        mapLocation: formData.mapLocation || '',
        assetType: assetType as any,
        unitType: (formData.unitType as any) || '1 bhk',
        subType: formData.subType || '',
        sbua: formData.sbua ? parseInt(formData.sbua) : 0,
        carpet: formData.carpet ? parseInt(formData.carpet) : 0,
        plotSize: formData.plotSize ? parseInt(formData.plotSize) : 0,
        buildingAge:
            typeof formData.buildingAge === 'string' && formData.buildingAge !== 'New Building'
                ? parseInt(formData.buildingAge.split('-')[0])
                : 0,
        floorNo: formData.exactFloor ? parseInt(formData.exactFloor) : 0,
        exactFloor: formData.exactFloor ? parseInt(formData.exactFloor) : 0,
        facing: (formData.facing as any) || 'north',
        furnishing: (formData.furnishing as any) || 'unfurnished',
        noOfBathrooms: formData.noOfBathrooms || '1',
        noOfBalconies: formData.noOfBalconies || '0',
        balconyFacing: (formData.balconyFacing as any) || 'outside',
        uds: formData.uds ? parseInt(formData.uds) : 0,
        carPark: formData.carPark ? parseInt(formData.carPark) : 0,
        cornerUnit: Boolean(formData.cornerUnit),
        exclusive: Boolean(formData.exclusive),
        tenanted: Boolean(formData.tenanted),
        ocReceived: Boolean(formData.ocReceived),
        rentalIncome: formData.rentalIncome ? parseInt(formData.rentalIncome) : 0,
        buildingKhata: formData.buildingKhata || '',
        landKhata: formData.landKhata || '',
        eKhata: Boolean(formData.eKhata),
        biappaApproved: Boolean(formData.biappaApproved),
        bdaApproved: Boolean(formData.bdaApproved),
        structure: formData.structure ? parseInt(formData.structure) : 0,
        communityType: (formData.communityType as any) || 'gated',
        unitNo: formData.unitNo || '',
        totalAskPrice: formData.totalAskPrice ? parseInt(formData.totalAskPrice) : 0,
        askPricePerSqft: formData.askPricePerSqft ? parseInt(formData.askPricePerSqft) : 0,
        currentStatus: formData.currentStatus ? 'ready to move' : ('under construction' as any),
        status: 'available' as any,
        handoverDate:
            formData.handoverDate && formData.handoverDate.month && formData.handoverDate.year
                ? new Date(formData.handoverDate.year, formData.handoverDate.month - 1).getTime()
                : Date.now(),
        photo: Array.isArray(formData.photo) ? formData.photo : [],
        video: Array.isArray(formData.video) ? formData.video : [],
        document: Array.isArray(formData.document) ? formData.document : [],
        driveLink: formData.driveLink || '',
        extraDetails: formData.extraDetails || '',
        cpId: formData.cpId,
        kamName: kamName,
        kamId: kamId,
        city: 'Bangalore',
        state: 'Karnataka',
        price: formData.totalAskPrice ? parseInt(formData.totalAskPrice) : 0,
        pricePerSqft: formData.askPricePerSqft ? parseInt(formData.askPricePerSqft) : 0,
        priceHistory: [],
        extraRoom: [],
        _geoloc: formData._geoloc || { lat: 0, lng: 0 },
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
    const location = useLocation()
    const { id } = useParams<{ id: string }>()
    const dispatch = useDispatch<AppDispatch>()

    const { platform, user } = useAuth()
    const kamId = platform?.acn?.kamId || 'INT003'
    const kamName = user?.displayName || 'Siddharth Gujrathi'

    const [isEditMode, setIsEditMode] = useState(false)

    const [filesToUpload, setFilesToUpload] = useState<{ [key: string]: FileToUpload[] }>({
        photo: [],
        video: [],
        document: [],
    })
    const [isUploading, setIsUploading] = useState(false)

    // Determine the mode based on URL
    const isPropertyEdit = location.pathname.includes('/properties/') && location.pathname.includes('/edit')
    const isQCAdd = location.pathname.includes('/addinv')
    const isQCEdit = location.pathname.includes('/qc/') && location.pathname.includes('/edit')

    // Redux state
    const {
        currentProperty: property,
        loading: propertyLoading,
        error: propertyError,
    } = useSelector((state: RootState) => state.properties)
    const {
        currentQCInventory: qcInventory,
        loading: qcLoading,
        error: qcError,
    } = useSelector((state: RootState) => state.qc)
    const {
        // currentAgent,
        fetchLoading: agentFetchLoading,
        // fetchError: agentFetchError,
    } = useSelector((state: RootState) => state.agents)

    const [selectedAssetType, setSelectedAssetType] = useState<PropertyType>('apartments')
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [successMessage, setSuccessMessage] = useState('')
    const [agentPhoneInput, setAgentPhoneInput] = useState('')
    const [selectedPlace, setSelectedPlace] = useState<Places | null>(null)
    const [placesApiError, _] = useState<string>('')
    const loading = propertyLoading || qcLoading
    const error = propertyError || qcError

    useEffect(() => {
        if ((isPropertyEdit && property) || (isQCEdit && qcInventory)) {
            const currentData = property || qcInventory

            // Check if we have the necessary location data
            if (currentData && currentData._geoloc && currentData.propertyName) {
                const prefillPlace: Places = {
                    name: currentData.propertyName,
                    lat: currentData._geoloc.lat,
                    lng: currentData._geoloc.lng,
                    address: currentData.area || '',
                    mapLocation: currentData.mapLocation || '',
                }

                console.log('📍 Prefilling place data for edit:', prefillPlace)
                setSelectedPlace(prefillPlace)
            }
        }
    }, [property, qcInventory, isPropertyEdit, isQCEdit])

    // Load data based on mode
    useEffect(() => {
        if (isPropertyEdit && id) {
            console.log('🔄 Loading property for edit:', id)
            setIsEditMode(true)
            dispatch(fetchPropertyById(id))
        } else if (isQCEdit && id) {
            console.log('🔄 Loading QC for edit:', id)
            setIsEditMode(true)
            dispatch(fetchQCInventoryById(id))
        } else if (isQCAdd) {
            setIsEditMode(false)
            console.log('🆕 Ready to add new QC inventory')
        }

        // Cleanup on unmount
        return () => {
            console.log('🧹 Clearing current data on unmount')
            dispatch(clearCurrentProperty())
            dispatch(clearCurrentQCInventory())
            dispatch(clearCurrentAgent())
        }
    }, [isPropertyEdit, isQCEdit, isQCAdd, id, dispatch])

    // Update form data when data is loaded
    useEffect(() => {
        if (property && isPropertyEdit) {
            console.log('📋 Property loaded, updating form data:', property)
            const propertyType = getPropertyTypeFromAssetType(property.assetType)
            setSelectedAssetType(propertyType)
            const mappedData = mapPropertyToFormData(property)
            setFormData(mappedData)
        } else if (qcInventory && isQCEdit) {
            console.log('📋 QC loaded, updating form data:', qcInventory)
            const propertyType = getPropertyTypeFromAssetType(qcInventory.assetType)
            setSelectedAssetType(propertyType)
            const mappedData = mapQCToFormData(qcInventory)
            setFormData(mappedData)
        }
    }, [property, qcInventory, isPropertyEdit, isQCEdit])

    // Update form data when place is selected
    useEffect(() => {
        if (selectedPlace) {
            console.log('📍 Place selected, updating form data:', selectedPlace)

            // Get micromarket from coordinates
            const [micromarket, zone] = getMicromarketFromCoordinates(selectedPlace)

            // Validate coordinates before setting
            const validLat = selectedPlace.lat && !isNaN(selectedPlace.lat) ? selectedPlace.lat : 0
            const validLng = selectedPlace.lng && !isNaN(selectedPlace.lng) ? selectedPlace.lng : 0

            setFormData((prev) => ({
                ...prev,
                propertyName: selectedPlace.name || '',
                area: selectedPlace.address || '',
                mapLocation: selectedPlace.mapLocation || '',
                micromarket: micromarket || '',
                _geoloc: {
                    lat: validLat,
                    lng: validLng,
                },
            }))

            console.log('📊 Form data updated with Places API data:', {
                propertyName: selectedPlace.name,
                area: selectedPlace.address,
                micromarket: micromarket,
                coordinates: { lat: validLat, lng: validLng },
                mapLocation: selectedPlace.mapLocation,
            })
            console.log('🏘️ Micromarket detected:', micromarket)
            console.log('🌍 Zone detected:', zone)
        }
    }, [selectedPlace])

    const handleFieldChange = (fieldId: string, value: any) => {
        // Special handling for PlacesSearch - don't store the object, only use it to trigger updates
        if (fieldId === 'selectedPlace' || (typeof value === 'object' && value?.name && value?.lat && value?.lng)) {
            // This is a Places object, don't store it in formData
            setSelectedPlace(value)
            return
        }

        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }))

        if (errors[fieldId]) {
            setErrors((prev) => ({
                ...prev,
                [fieldId]: '',
            }))
        }
    }

    const handleFetchAgent = async () => {
        if (!agentPhoneInput.trim()) {
            return
        }

        try {
            dispatch(clearAgentError())

            // Use unwrap() to get the returned agent details directly
            const result = await dispatch(fetchAgentByPhone(agentPhoneInput.trim())).unwrap()

            // Update form data directly with the returned agent details
            setFormData((prev) => ({
                ...prev,
                cpId: result.cpId,
                kamId: kamId,
                name: result.name,
                kamName: kamName,
            }))
            console.log('👤 Agent fetched, updating cpId:', result)
        } catch (error) {
            console.error('Failed to fetch agent:', error)
        }
    }

    const validateForm = () => {
        const assetType = propertyTypeToAssetType[selectedAssetType]
        const validation = validateCompulsoryFields(assetType, formData)

        console.log('formData', validation)
        if (!validation.isValid) {
            const newErrors: Record<string, string> = {}
            validation.missingFields.forEach((field) => {
                newErrors[field] = `${field} is required`
            })
            setErrors(newErrors)
            return false
        }

        setErrors({})
        return true
    }

    const handleSubmit = async () => {
        console.log('formData', formData)
        if (validateForm()) {
            setIsUploading(true) // Add loading state for file uploads

            try {
                if (isPropertyEdit && property) {
                    // Property edit flow
                    const propertyData = mapFormDataToProperty(formData, selectedAssetType)
                    console.log('📝 Updating property:', property.id, propertyData)

                    await dispatch(
                        updateProperty({
                            id: property.id,
                            updates: propertyData,
                            filesToUpload: Object.keys(filesToUpload).length > 0 ? filesToUpload : undefined,
                        }),
                    ).unwrap()

                    console.log('✅ Property updated successfully')
                    setSuccessMessage('Property updated successfully!')

                    setTimeout(() => {
                        navigate(`/acn/properties/${property.propertyId}/details`)
                    }, 1500)
                } else if (isQCAdd) {
                    // QC add flow
                    const qcData = mapFormDataToQC(formData, selectedAssetType, kamId, kamName)
                    console.log('➕ Creating new QC:', qcData)

                    const newQC = await dispatch(
                        addQCInventory({
                            qcData,
                            filesToUpload: Object.keys(filesToUpload).length > 0 ? filesToUpload : undefined,
                        }),
                    ).unwrap()

                    console.log('✅ QC created successfully:', newQC)
                    setSuccessMessage('QC Inventory created successfully!')

                    setTimeout(() => {
                        navigate('/acn/qc/dashboard')
                    }, 1500)
                } else if (isQCEdit && qcInventory) {
                    // QC edit flow
                    const qcData = mapFormDataToQC(formData, selectedAssetType, kamId, kamName)
                    console.log('📝 Updating QC:', qcInventory.propertyId, qcData)

                    await dispatch(
                        updateQCInventory({
                            id: qcInventory.propertyId,
                            updates: qcData,
                            filesToUpload: Object.keys(filesToUpload).length > 0 ? filesToUpload : undefined,
                        }),
                    ).unwrap()

                    console.log('✅ QC updated successfully')
                    setSuccessMessage('QC Inventory updated successfully!')

                    setTimeout(() => {
                        navigate(`/acn/qc/${qcInventory.propertyId}/details`)
                    }, 1500)
                }
            } catch (error) {
                console.error('❌ Error during form submission:', error)
                toast.error(`${error}`)
            } finally {
                setIsUploading(false) // Reset loading state
            }
        }
    }

    // Get current configuration for selected asset type
    const assetType = propertyTypeToAssetType[selectedAssetType]
    const currentConfig = getAssetTypeConfig(assetType)

    // Loading state
    if (loading && ((isPropertyEdit && !property) || (isQCEdit && !qcInventory))) {
        return (
            <Layout loading={true}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-lg'>Loading data...</div>
                </div>
            </Layout>
        )
    }

    // console.log('assetConfigurations', assetConfigurations)

    // Error state
    if (error && (isPropertyEdit || isQCEdit)) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-center'>
                        <div className='text-lg text-red-600 mb-4'>Error loading data</div>
                        <div className='text-sm text-gray-600 mb-4'>{error}</div>
                        <div className='flex gap-2 justify-center'>
                            <button
                                onClick={() => {
                                    dispatch(clearError())
                                    if (id) {
                                        if (isPropertyEdit) dispatch(fetchPropertyById(id))
                                        if (isQCEdit) dispatch(fetchQCInventoryById(id))
                                    }
                                }}
                                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => navigate(isPropertyEdit ? '/acn/properties' : '/acn/qc/dashboard')}
                                className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    // const getPageTitle = () => {
    //     if (isPropertyEdit) return 'Edit Property'
    //     if (isQCAdd) return 'Add QC Inventory'
    //     if (isQCEdit) return 'Edit QC Inventory'
    //     return 'Inventory Management'
    // }

    const getEditingText = () => {
        if (isPropertyEdit && property) {
            return `Editing Property: ${property.propertyName || property.area} (${property.propertyId})`
        }
        if (isQCEdit && qcInventory) {
            return `Editing QC: ${qcInventory.propertyName || qcInventory.area} (${qcInventory.propertyId})`
        }
        return null
    }

    return (
        <Layout loading={false}>
            <div className='flex'>
                {/* Sticky Left Sidebar */}
                <div className='w-64 sticky top-0 h-screen overflow-y-auto p-4'>
                    <h2 className='text-lg font-medium text-gray-900 mb-4'>Asset Type</h2>
                    <div className='flex flex-col gap-4'>
                        {assetTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setSelectedAssetType(type.value)}
                                disabled={isPropertyEdit || isQCEdit}
                                className={`p-4 rounded-lg border-1 transition-all duration-200 text-left flex items-center gap-x-3 ${
                                    selectedAssetType === type.value ? 'bg-[#DFF4F3]' : 'bg-whiye text-gray-700'
                                } ${isPropertyEdit || isQCEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <img src={type.icon} alt={type.label} className='text-2xl' />
                                <div className='text-sm font-medium'>{type.label}</div>
                            </button>
                        ))}
                    </div>
                    {(isPropertyEdit || isQCEdit) && (
                        <p className='text-sm text-gray-500 mt-4'>Asset type cannot be changed in edit mode</p>
                    )}
                </div>

                {/* Right Content Area */}
                <div className='flex-1 pl-6 overflow-y-auto'>
                    <div className='w-full overflow-hidden font-sans'>
                        <div className='py-6 px-6 bg-white min-h-screen'>
                            {/* Header */}
                            <div className='mb-6'>
                                {/* <h1 className='text-2xl font-semibold text-gray-900 mb-2'>{getPageTitle()}</h1> */}

                                {getEditingText() && <p className='text-gray-600 mb-6'>{getEditingText()}</p>}

                                {/* {isQCAdd && (
                                    <div className='mb-6'>
                                        <p className='text-gray-600'>QC ID will be auto-generated (e.g., QCA357)</p>
                                    </div>
                                )} */}

                                {/* Agent Phone fetch section */}
                                <div className='mb-4'>
                                    <label className='block text-sm py-2 text-gray-600'>Agent phone no.</label>
                                    <div className='flex gap-2'>
                                        <input
                                            type='text'
                                            value={agentPhoneInput}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setAgentPhoneInput(e.target.value)
                                                handleFieldChange('agentPhoneNumber', e.target.value)
                                            }}
                                            placeholder='Type here'
                                            className='flex-1 p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400'
                                        />
                                        <button
                                            onClick={handleFetchAgent}
                                            disabled={agentFetchLoading}
                                            className='px-4 py-2 bg-black text-white rounded text-sm hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed'
                                        >
                                            {agentFetchLoading ? 'Fetching...' : 'Fetch Agent'}
                                        </button>
                                    </div>
                                </div>

                                {/* Agent Details */}
                                <div className='flex gap-2'>
                                    <div className='flex-1'>
                                        <input
                                            type='text'
                                            value={formData.cpId}
                                            onChange={(e) => handleFieldChange('cpId', e.target.value)}
                                            placeholder='Agent ID'
                                            className='w-full p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400 bg-gray-100'
                                            readOnly
                                        />
                                    </div>
                                    <div className='flex-1'>
                                        <input
                                            type='text'
                                            value={formData.name}
                                            onChange={(e) => handleFieldChange('name', e.target.value)}
                                            placeholder='Agent name'
                                            className='w-full p-2 border border-gray-300 rounded text-[14px] text-black placeholder-gray-400 bg-gray-100'
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* Success/Error Messages */}
                                {successMessage && (
                                    <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
                                        <div className='flex items-center gap-2'>
                                            <svg
                                                className='w-5 h-5 text-green-600'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M5 13l4 4L19 7'
                                                />
                                            </svg>
                                            <div className='text-sm text-green-700'>{successMessage}</div>
                                        </div>
                                        <div className='text-xs text-green-600 mt-1'>Redirecting...</div>
                                    </div>
                                )}

                                {error && (
                                    <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                                        <div className='text-sm text-red-700'>{error}</div>
                                    </div>
                                )}

                                {placesApiError && (
                                    <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                                        <div className='flex items-center gap-2'>
                                            <svg
                                                className='w-5 h-5 text-yellow-600'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                                                />
                                            </svg>
                                            <div className='text-sm text-yellow-700'>
                                                Places API Warning: {placesApiError}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Form Fields */}
                            <div className='space-y-4'>
                                <div className='bg-white'>
                                    <div className='flex flex-col gap-3'>
                                        {(() => {
                                            const rows = []
                                            let i = 0
                                            while (i < currentConfig.length) {
                                                const field = currentConfig[i]
                                                if (field.colspan === 2) {
                                                    rows.push(
                                                        <div className='flex gap-3' key={i}>
                                                            <div className='w-full'>
                                                                <FormFieldRenderer
                                                                    key={field.field || i}
                                                                    field={field}
                                                                    value={formData[field.field || '']}
                                                                    onChange={(value) =>
                                                                        handleFieldChange(field.field || '', value)
                                                                    }
                                                                    error={errors[field.field || '']}
                                                                    assetType={assetType}
                                                                    formData={{
                                                                        ...formData,
                                                                        setSelectedPlace,
                                                                        selectedPlace: selectedPlace?.name || '',
                                                                    }}
                                                                    isEditMode={isEditMode}
                                                                    filesToUpload={filesToUpload}
                                                                    setFilesToUpload={setFilesToUpload}
                                                                />
                                                            </div>
                                                        </div>,
                                                    )
                                                    i += 1
                                                } else {
                                                    const nextField = currentConfig[i + 1]
                                                    if (nextField && nextField.colspan !== 2) {
                                                        rows.push(
                                                            <div className='flex gap-3' key={i}>
                                                                <div className='w-1/2'>
                                                                    <FormFieldRenderer
                                                                        key={field.field || i}
                                                                        field={field}
                                                                        value={formData[field.field || '']}
                                                                        onChange={(value) =>
                                                                            handleFieldChange(field.field || '', value)
                                                                        }
                                                                        error={errors[field.field || '']}
                                                                        assetType={assetType}
                                                                        formData={{
                                                                            ...formData,
                                                                            setSelectedPlace,
                                                                            selectedPlace: selectedPlace?.name || '',
                                                                        }}
                                                                        isEditMode={isEditMode}
                                                                        filesToUpload={filesToUpload}
                                                                        setFilesToUpload={setFilesToUpload}
                                                                    />
                                                                </div>
                                                                <div className='w-1/2'>
                                                                    <FormFieldRenderer
                                                                        key={nextField.field || i + 1}
                                                                        field={nextField}
                                                                        value={formData[nextField.field || '']}
                                                                        onChange={(value) =>
                                                                            handleFieldChange(
                                                                                nextField.field || '',
                                                                                value,
                                                                            )
                                                                        }
                                                                        error={errors[nextField.field || '']}
                                                                        assetType={assetType}
                                                                        formData={{
                                                                            ...formData,
                                                                            setSelectedPlace,
                                                                            selectedPlace: selectedPlace?.name || '',
                                                                        }}
                                                                        isEditMode={isEditMode}
                                                                        filesToUpload={filesToUpload}
                                                                        setFilesToUpload={setFilesToUpload}
                                                                    />
                                                                </div>
                                                            </div>,
                                                        )
                                                        i += 2
                                                    } else {
                                                        rows.push(
                                                            <div className='flex gap-3' key={i}>
                                                                <div className='w-1/2'>
                                                                    <FormFieldRenderer
                                                                        key={field.field || i}
                                                                        field={field}
                                                                        value={formData[field.field || '']}
                                                                        onChange={(value) =>
                                                                            handleFieldChange(field.field || '', value)
                                                                        }
                                                                        error={errors[field.field || '']}
                                                                        assetType={assetType}
                                                                        formData={{
                                                                            ...formData,
                                                                            setSelectedPlace,
                                                                            selectedPlace: selectedPlace?.name || '',
                                                                        }}
                                                                        isEditMode={isEditMode}
                                                                        filesToUpload={filesToUpload}
                                                                        setFilesToUpload={setFilesToUpload}
                                                                    />
                                                                </div>
                                                                <div className='w-1/2' />
                                                            </div>,
                                                        )
                                                        i += 1
                                                    }
                                                }
                                            }
                                            return rows
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex justify-end gap-4 mt-8 pt-6'>
                                {
                                    <Button
                                        bgColor={
                                            loading || isUploading
                                                ? 'bg-gray-400'
                                                : successMessage
                                                  ? 'bg-green-600'
                                                  : 'bg-gray-900'
                                        }
                                        textColor='text-white'
                                        className='px-4 py-2 hover:bg-gray-800 text-base font-medium'
                                        onClick={handleSubmit}
                                        disabled={loading || isUploading || successMessage !== ''}
                                    >
                                        {loading || isUploading ? (
                                            <div className='flex items-center gap-2'>
                                                <svg className='animate-spin h-4 w-4' fill='none' viewBox='0 0 24 24'>
                                                    <circle
                                                        className='opacity-25'
                                                        cx='12'
                                                        cy='12'
                                                        r='10'
                                                        stroke='currentColor'
                                                        strokeWidth='4'
                                                    ></circle>
                                                    <path
                                                        className='opacity-75'
                                                        fill='currentColor'
                                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                    ></path>
                                                </svg>
                                                {isUploading
                                                    ? 'Uploading Files...'
                                                    : isPropertyEdit
                                                      ? 'Updating...'
                                                      : isQCEdit
                                                        ? 'Updating...'
                                                        : 'Creating...'}
                                            </div>
                                        ) : successMessage ? (
                                            <div className='flex items-center gap-2'>
                                                <svg
                                                    className='w-4 h-4'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M5 13l4 4L19 7'
                                                    />
                                                </svg>
                                                {isPropertyEdit ? 'Updated!' : isQCEdit ? 'Updated!' : 'Created!'}
                                            </div>
                                        ) : isPropertyEdit ? (
                                            'Update Property'
                                        ) : isQCEdit ? (
                                            'Update QC'
                                        ) : (
                                            'Submit'
                                        )}
                                    </Button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AddEditInventoryPage
