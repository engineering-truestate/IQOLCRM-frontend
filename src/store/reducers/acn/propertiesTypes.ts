// store/reducers/acn/propertiesTypes.ts
import { type PayloadAction } from '@reduxjs/toolkit'
import type { QueryDocumentSnapshot, Timestamp, FieldValue } from 'firebase/firestore'

// === Inventory shape ===
// store/reducers/acn/propertiesTypes.ts
export interface IInventory {
    id: string
    propertyId: string
    cpId: string
    cpCode: string
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

    // Additional properties
    objectID?: string
    enquiries?: number
    lastCheck?: number // Unix timestamp in milliseconds
    propertyName?: string
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
