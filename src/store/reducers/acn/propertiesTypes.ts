// store/reducers/acn/propertiesTypes.ts
import { type PayloadAction } from '@reduxjs/toolkit'
import type { QueryDocumentSnapshot } from 'firebase/firestore'

// === Inventory shape ===
// store/reducers/acn/propertiesTypes.ts
export interface IInventory {
    // Core required properties
    id: string
    propertyId: string
    cpId: string
    nameOfTheProperty: string
    _geoloc: { lat: number; lng: number }
    area: string
    micromarket: string
    mapLocation: string
    assetType: string
    unitType: string
    subType: string
    sbua: number
    carpet: number | null
    plotSize: number | null
    buildingAge: number | null
    floorNo: string
    facing: string
    tenanted: boolean | null
    totalAskPrice: number
    askPricePerSqft: number
    status: string
    currentStatus: string
    builder_name: string | null
    handoverDate: number | null // Unix timestamp in milliseconds
    buildingKhata: string | null
    landKhata: string | null
    ocReceived: boolean | null
    photo: string[]
    video: string[]
    document: string[]
    driveLink: string
    dateOfInventoryAdded: number // Unix timestamp in milliseconds
    dateOfStatusLastChecked: number // Unix timestamp in milliseconds
    ageOfInventory: number
    ageOfStatus: number
    extraDetails: string

    // Additional core properties
    objectID?: string
    enquiries?: number
    lastCheck?: number // Unix timestamp in milliseconds
    propertyName?: string
    soldPrice?: number

    // Extended optional properties for different asset types
    communityType?: string
    unitNo?: string
    plotFacing?: string
    furnishing?: string
    extraRoom?: string | string[] // Flexible type for different implementations
    noOfBathrooms?: number
    noOfBalconies?: number
    balconyFacing?: string
    uds?: number | string | null // Allowing both number and string
    carPark?: number | string | null // Allowing both number and string
    cornerUnit?: boolean
    exclusive?: boolean
    rentalIncome?: number | string | null // Allowing both number and string
    eKhata?: boolean
    biappaApproved?: boolean
    bdaApproved?: boolean

    // Plot-specific fields
    oddSized?: boolean
    plotLength?: number | string // Allowing both number and string
    plotBreadth?: number | string // Allowing both number and string

    // Villa / Villament and similar
    exactFloor?: string
    structure?: string

    // Additional metadata fields
    propertyAge?: number
    lastRenovated?: number
    amenities?: string[]
    nearbyLandmarks?: string[]
    transportConnectivity?: string[]

    // Pricing details
    maintenanceCharges?: number
    securityDeposit?: number
    brokerage?: number

    // Legal and compliance
    approvalStatus?: string
    legalClearance?: boolean
    encumbrance?: boolean

    // Marketing
    featured?: boolean
    priority?: number
    marketingNotes?: string

    // Notes functionality
    notes?: Array<{
        id: string
        email: string
        author: string
        content: string
        timestamp: number
    }>

    // KAM details
    kamId?: string
    kamName?: string
    kamEmail?: string

    // Price Drop History - ADD THIS
    priceHistory?: Array<{
        id: string
        kamId?: string
        kamName?: string
        kamEmail?: string
        oldTotalAskPrice?: number
        newTotalAskPrice?: number
        oldAskPricePerSqft?: number
        newAskPricePerSqft?: number
        timestamp: number
    }>
}

// === Requirement shape ===
export interface IRequirement {
    id: string
    // Add requirement properties here
}

// === Redux slice state ===
export interface PropertiesState {
    properties: IInventory[]
    currentProperty: IInventory | null
    loading: boolean
    error: string | null
    totalFetched: number

    // pagination
    lastDocument: QueryDocumentSnapshot<IInventory> | null
    hasMore: boolean
    isLoadingMore: boolean

    // Algolia search state
    searchResults: IInventory[]
    totalHits: number
    totalPages: number
    currentPage: number
    facets: Record<string, Record<string, number>>
    processingTime: number
    searching: boolean
    searchQuery: string
    activeFilters: Record<string, any>
    facetValues: Record<string, Record<string, number>>
}

// Action types can now be inferred using PayloadAction
export type PropertiesAction<T> = PayloadAction<T>

export interface IEnquiry {
    propertyId: string
    propertyName: string
    buyerAgentName: string
    buyerAgentNumber: string
    dateOfEnquiry: string
    status: string
}
