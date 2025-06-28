export interface TowerDetail {
    id: string
    name: string
    floors: number
}

export interface PreReraProperty {
    projectId: string
    projectName: string
    projectType: string
    sizes: string
    projectSize: string
    launchDate: number
    possessionStarts: string
    configurations: string
    reraId: string
    description: string
    totalUnits: number
    developerName: string
    developerLegalName: string
    developerTier: string
    address: string
    district: string
    zone: string
    lat: number
    long: number
    micromarket: string
    startDate: number
    handoverDate: number
    ageOfBuildinginYears: number
    TowerDetails: TowerDetail[]
    amenities: string[]
    brochureURL: string[]
    masterPlanURL: string[]
    unitandfloorURL: string[]
    images: string[]
    khataType: string
    status: string
    createdAt: number
    updatedAt: number
}

export interface PreReraPropertyState {
    properties: PreReraProperty[]
    selectedProperty: PreReraProperty | null
    loading: boolean
    error: string | null
    filters: PreReraPropertyFilters
}

export interface PreReraPropertyFilters {
    projectType?: string
    status?: string
    developerTier?: string
    district?: string
    zone?: string
    micromarket?: string
    configurations?: string
    khataType?: string
    priceRange?: {
        min: number
        max: number
    }
    location?: string
}
