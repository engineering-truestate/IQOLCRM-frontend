// types.ts

interface INote {
    id: string
    email: string
    author: string
    content: string
    timestamp: number
}

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
    location?: string
    assetType: 'villa' | 'apartment' | 'plot' | 'commercial' | 'warehouse' | 'office'
    configuration: '1bhk' | '2bhk' | '3bhk' | '4bhk' | '5bhk' | null
    _geoloc?: GeoLocation
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
    agentPhone: string
    name: string
}

export type RequirementState = {
    requirements: IRequirement[]
    currentRequirement: IRequirement | null
    loading: boolean
    error: string | null
    lastFetch: Date | null
}
