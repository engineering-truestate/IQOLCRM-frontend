export interface TowerDetail {
    name: string
    floors: number
}

export interface PhaseDetail {
    id: string
    phaseName: string
    viewDetails: string
    constructionUpdate: string
}

export interface DevelopmentDetail {
    TypeOfInventory: string
    NumberOfInventory: number
    CarpetAreaSqMtr?: number
    BalconyVerandahSqMtr?: number
    OpenTerraceSqMtr?: number
}

export interface ConfigurationDetails {
    apartments: ApartmentConfig[]
    villa: VillaConfig[]
    flat: FlatConfig[]
    plot: PlotConfig[]
}

export interface ApartmentConfig {
    type: string
    currentPricePerSqft: number
    totalAreasqft: number
}

export interface VillaConfig {
    type: string
    currentPricePerSqft: number
    totalAreasqft: number
}

export interface FlatConfig {
    type: string
    currentPricePerSqft: number
    totalAreasqft: number
}

export interface PlotConfig {
    type: string
    currentPricePerSqft: number
    totalAreasqft: number
}

export interface ClubHouseDetail {
    name: string
    sizeSqft: number
    floor: string
}

export interface DocumentDetail {
    phaseName: string
    CommencementCertificate: string
    approvalCertificate: string
    approvedBuildingPlan: string
    environmentalClearance: string
    occupancyCertificate: string
}

export interface PostReraProperty {
    projectId: string
    projectName: string
    projectType: string
    projectDescription: string
    projectSubType: string
    projectStatus: string
    projectStartDate: number
    handoverDate: number
    reraID: string
    acknowledgeNumber: string
    reraStatus: string
    developerName: string
    promoterName: string
    developerLegalName: string
    promoterLegalName: string
    developerTransferFee: number
    developerTier: string
    currentPricePerSqft: number
    address: string
    lat: number
    long: number
    mapLink: string
    district: string
    taluk: string
    microMarket: string
    subMicromarket: string
    zone: string
    pincode: number
    northSchedule: string
    southSchedule: string
    eastSchedule: string
    westSchedule: string
    phaseDetails: PhaseDetail[]
    totalOpenArea: number
    totalCoveredArea: number
    totalLandArea: number
    totalBuiltUpArea: number
    totalCarpetArea: number
    totalPlinthArea: number
    openParkingArea: number
    coveredParkingArea: number
    garageArea: number
    projectDensity: number
    localAuthority: string
    approvingAuthority: string
    planApprovalDate: string
    approvedPlanNumber: string
    totalInventories: string
    totalParking: string
    openParking: string
    coveredParking: string
    numberOfGarage: string
    waterSource: string[]
    developmentDetails: DevelopmentDetail[]
    configurationDetails: ConfigurationDetails
    totalTowers: number
    floorAreaRatio: number
    towerDetails: TowerDetail[]
    launchPricePerSqft: string
    Images: string[]
    CDPMapURL: string
    costSheet: string
    brochure: string
    masterPlanURL: string
    projectAmenities: string[]
    clubHouseDetails: ClubHouseDetail[]
    litigation: string
    affidavitLink: string
    Complaints: string[]
    documents: DocumentDetail[]
    areaUnit: string
    lastUpdated: string
    createdAt: number
    updatedAt: number
    sizes: string
    stockType?: string
}

export interface PostReraPropertyState {
    properties: PostReraProperty[]
    selectedProperty: PostReraProperty | null
    loading: boolean
    error: string | null
    filters: PostReraPropertyFilters
}

export interface PostReraPropertyFilters {
    projectType?: string
    stockType?: string
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
