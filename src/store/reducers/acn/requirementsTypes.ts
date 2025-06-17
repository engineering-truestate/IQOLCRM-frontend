// types.ts

import { type INote } from '../../../services/acn/requirements/requirementsService'

interface BudgetRange {
    from: number
    to: number
}

interface SizeRange {
    from: number
    to: number
}

interface GeoLocation {
    lat: number
    lng: number
}

export interface IRequirement {
    requirementId: string
    cpId: string
    location: string
    assetType: 'villa' | 'apartment' | 'plot' | 'commercial' | 'warehouse' | 'office'
    configuration: '1 bhk' | '2 bhk' | '3 bhk' | '4 bhk' | '5+ bhk'
    _geoloc: GeoLocation
    micromarket: string
    budget: BudgetRange
    size: SizeRange
    bedrooms: string
    bathrooms: string
    parking: string
    propertyName: string
    extraDetails: string
    marketValue: string
    requirementStatus: 'open' | 'close'
    internalStatus: 'found' | 'not found' | 'pending'
    added: number
    lastModified: number
    matchingProperties: string[]
    notes: INote[]
}

export type RequirementState = {
    requirements: IRequirement[]
    currentRequirement: IRequirement | null
    loading: boolean
    error: string | null
    lastFetch: Date | null
}
