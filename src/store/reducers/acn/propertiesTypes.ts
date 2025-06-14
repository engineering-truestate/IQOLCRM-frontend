import { type PayloadAction } from '@reduxjs/toolkit'
import type { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore'

// === Inventory shape ===
export interface IInventory {
    id: string
    propertyId: string
    cpId: string
    cpCode: string // Added for agent code
    nameOfTheProperty: string // Changed from propertyName
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
    handoverDate: Timestamp | null
    buildingKhata: string | null
    landKhata: string | null
    ocReceived: boolean | null
    photo: string[]
    video: string[]
    document: string[]
    driveLink: string
    dateOfInventoryAdded: Timestamp
    dateOfStatusLastChecked: Timestamp
    ageOfInventory: number
    ageOfStatus: number
    extraDetails: string

    // Additional properties used in your components
    objectID?: string // For Algolia search results
    enquiries?: number // Used in table columns
    lastCheck?: Timestamp // Used in table columns

    // Optional properties for backward compatibility
    propertyName?: string // Keep as optional for backward compatibility
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
