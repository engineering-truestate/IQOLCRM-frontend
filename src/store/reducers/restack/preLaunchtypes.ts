export interface ApartmentConfig {
    Configuration: string
    apartmentType: string
    sbua: number
    carpetArea: number
    pricePerSqft: number
    totalPrice: number
    floorPlan: string
}

export interface VillaConfig {
    Configuration: string
    VillaType: string
    plotSize: number
    builtUpArea: number
    carpetArea: number
    pricePerSqft: number
    totalPrice: number
    uds: number
    numberOfFloors: number
}

export interface PlotConfig {
    plotType: string
    plotArea: number
    pricePerSqft: number
    totalPrice: number
}

export interface PropertyConfigurations {
    apartments: ApartmentConfig[]
    villas: VillaConfig[]
    plots: PlotConfig[]
}

export interface PropertyDocuments {
    villageMaps: string[]
    cdpMaps: string[]
    masterPlan: string[]
    projectLayoutPlan: string[]
    brochure: string[]
}

export interface Property {
    projectId: string
    projectName: string
    projectType: string
    stage: string
    status: string
    developerName: string
    projectSize: number
    projectSizeUnit: string
    pricePerSqft: number
    projectStartDate: number
    handoverDate: number
    address: string
    lat: number
    long: number
    mapLink: string
    totalUnits: number
    eoiAmount: number
    numberOfFloors: number
    numberOfTowers: number
    totalParking: number
    openParking: number
    coveredParking: number
    openArea: number
    reraId: string
    reraStatus: string
    environmentalClearance: string
    buildingPermission: string
    configurations: PropertyConfigurations
    amenities: string[]
    documents: PropertyDocuments
    areaUnit: string
    lastUpdated: number
    createdAt: number
}

export interface PropertyState {
    properties: Property[]
    selectedProperty: Property | null
    loading: boolean
    error: string | null
    filters: PropertyFilters
}

export interface PropertyFilters {
    projectType?: string
    stage?: string
    status?: string
    priceRange?: {
        min: number
        max: number
    }
    location?: string
}
