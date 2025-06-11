import { type PayloadAction } from '@reduxjs/toolkit'
import type { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore'

// === Inventory shape ===
export interface IInventory {
    id: string
    propertyId: string
    cpId: string
    propertyName: string
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
}

// === Redux slice state ===
// Updated type for lastDocument
export interface PropertiesState {
    properties: IInventory[]
    currentProperty: IInventory | null
    loading: boolean
    error: string | null
    totalFetched: number

    // pagination
    lastDocument: QueryDocumentSnapshot<IInventory> | null // Fixed type here
    hasMore: boolean
    isLoadingMore: boolean
}

// Action types can now be inferred using PayloadAction
export type PropertiesAction<T> = PayloadAction<T>
