// Type definitions for Restack Primary Properties

// Enums
export enum ProjectType {
    Residential = 'Residential',
    Commercial = 'Commercial',
    Plotted = 'plotted',
    MixedUse = 'Mixed-Use',
}

export enum ProjectSubType {
    Apartments = 'apartments',
    Villa = 'villa',
    Flat = 'flat',
    Plot = 'plot',
    Commercial = 'commercial',
}

export enum ProjectStatus {
    Active = 'active',
    Inactive = 'inactive',
    Completed = 'completed',
    OnHold = 'on-hold',
}

export enum ReraStatus {
    Approved = 'Approved',
    Pending = 'Pending',
    Rejected = 'Rejected',
    NotRequired = 'Not Required',
}

export enum DeveloperTier {
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
}

export enum AreaUnit {
    SqMtr = 'sqMtr',
    Sqft = 'sqft',
    Acres = 'acres',
    Hectares = 'hectares',
}

// Basic Project Information
export interface BasicProjectInfo {
    projectName: string
    projectType: ProjectType
    projectDescription?: string
    projectSubType: ProjectSubType
    projectStatus: ProjectStatus
    projectStartDate: number // Unix timestamp
    handoverDate: number // Unix timestamp
}

// RERA and Regulatory Information
export interface RegulatoryInfo {
    reraID: string
    acknowledgeNumber: string
    reraStatus: ReraStatus
    localAuthority: string
    approvingAuthority: string
    planApprovalDate?: string
    approvedPlanNumber?: string
}

// Developer and Promoter Details
export interface DeveloperInfo {
    developerName?: string
    promoterName?: string
    developerLegalName?: string
    promoterLegalName?: string
    developerTransferFee?: number
    developerTier?: DeveloperTier
}

// Location Details
export interface LocationDetails {
    address: string
    lat?: number
    long?: number
    mapLink?: string
    district?: string
    taluk?: string
    microMarket?: string
    subMicromarket?: string
    zone?: string
    pinCode?: number
    northSchedule?: string
    southSchedule?: string
    eastSchedule?: string
    westSchedule?: string
}

// Area Details
export interface AreaDetails {
    openArea?: number
    coveredArea?: number
    landArea?: number
    builtUpArea?: number
    carpetArea?: number
    plinthArea?: number
    openParkingArea?: number
    coveredParkingArea?: number
    garageArea?: number
    projectDensity?: number
}

// Project Specifications
export interface ProjectSpecifications {
    totalInventories?: string
    totalParking?: string
    openParking?: string
    coveredParking?: string
    numberOfGarage?: string
    totalTowers?: number
    floorAreaRatio?: number
    waterSource?: string[]
}
// Land use Analysis
export interface LanduseAnalysis {
    totalPlots?: number
    coveredArea?: number
    parksNumber?: number
    parkArea?: number
    numberofCAsites?: number
    areaofCAsites?: number
    roadArea?: number
    openArea?: number
    landArea?: number
}
// plot Dimemsion
export interface PlotDimension {
    plotType?: string
    numberOfSites?: number
    totalArea?: number
    slno?: string
}

// Development Details
export interface DevelopmentDetail {
    TypeOfInventory: string
    NumberOfInventory: number
    CarpetAreaSqMtr: number
    BalconyVerandahSqMtr?: number
    OpenTerraceSqMtr?: number
    slno: string
}

// Floor Plan
export interface FloorPlan {
    floorNo: string
    noOfUnits: string
}

// Floor Plan Details
export interface FloorPlanDetail extends FloorPlan {
    id: string
}

// Tower Details
export interface TowerDetail {
    id: string
    towerName: string
    typeOfTower: string
    floors: number
    units: number
    stilts: number
    slabs: number
    basements: number
    totalParking: number
    towerHeightInMeters: number
    floorplan: FloorPlan
    floorPlanDetails?: FloorPlanDetail[]
    unitDetails?: UnitDetail[]
    uploadedAt: timestamp
}

// Configuration Details with IDs
export interface ApartmentConfig {
    id: string
    aptType: 'Simplex' | 'Duplex' | 'Triplex' | 'Penthouse'
    typology: string
    superBuiltUpArea: number
    carpetArea: number
    currentPricePerSqft: number
    totalPrice: number
    floorPlan?: string
}

export interface VillaConfig {
    id: string
    villaType: 'UDS' | 'Plot' | 'Independent Villa'
    typology: string
    plotSize: number
    builtUpArea: number
    uds: string
    udsPercentage: number
    udsArea: number
    numberOfFloors: number
    currentPricePerSqft: number
    totalPrice: number
    carpetArea: number
    floorPlan?: string
}

export interface PlotConfig {
    id: string
    plotType: string
    plotArea: number
    currentPricePerSqft: number
    totalPrice: number
}

// Banking Details
export interface BankingDetails {
    bankName: string
    branch: string
    ifscCode: string
    accountNo: string
    bankState: string
    bankDistrict: string
}

// Media and Documents
export interface MediaDocuments {
    images?: string[]
    typologyAndUnitPlan?: string[]
    masterPlan?: string[]
    cdpMapURL?: string[]
    costSheetURL?: string[]
    brochureURL?: string[]
}

export interface Documents {
    projectDocuments?: string[]
    nocDocuments?: string[]
    otherDocuments?: string[]
}

// Complaints
export interface Complaint {
    registrationNo: string
    serialNo: number
    complaintNo: string
    complaintBy: string
    complaintDate: string
    complaintSubject: string
    projectName: string
    orderBy: string
    promoterName: string
    status: string
}

// Legal Information
export interface LegalInformation {
    litigationStatus: 'Yes' | 'No'
    affidavitLink?: string
    complaints?: {
        complaintsOnProject?: Complaint[]
        complaintsOnPromoter?: Complaint[]
    }
}

// Unit Details (Added for compatibility with existing code)
export interface UnitDetail {
    id: string
    slNo: string
    floorNo: string
    unitNo: string
    unitType: string
    carpetArea: string
    exclusiveArea: string
    associationArea: string
    uds: string
    parking: string
}

// Clubhouse Details (Added for compatibility with existing code)
export interface ClubhouseDetail {
    id: string
    name: string
    sizeSqft: string
    floor: string
}

// Ground Floor Details (Added for compatibility with existing code)
export interface GroundFloor {
    findOutTheTypeOfLaunchPerYearWill: string
    typologyUnitPlan: string
    vehiclePlan: string
    groundFloorArea: string
    floor: string
}

// Main Primary Property Interface
export interface PrimaryProperty {
    // Basic Information
    projectId: string
    projectName: string
    projectType: ProjectType | string
    projectSubType: ProjectSubType
    projectStatus: ProjectStatus
    projectDescription?: string
    projectStartDate: number
    handoverDate: number

    // Developer Information
    developerInfo?: DeveloperInfo
    developerName?: string
    developerLegalName?: string
    developerTier?: DeveloperTier
    developerTransferFee?: number
    promoterName?: string
    promoterLegalName?: string

    // Location Details
    address: string
    lat?: number
    long?: number
    mapLink?: string
    district?: string
    taluk?: string
    microMarket?: string
    subMicromarket?: string
    zone?: string
    pinCode?: number
    northSchedule?: string
    southSchedule?: string
    eastSchedule?: string
    westSchedule?: string

    // Area Details
    areaUnit: AreaUnit
    openArea?: number
    coveredArea?: number
    landArea?: number
    builtUpArea?: number
    carpetArea?: number
    plinthArea?: number
    openParkingArea?: number
    coveredParkingArea?: number
    garageArea?: number
    projectDensity?: number

    // Project Specifications
    totalInventories?: string
    totalParking?: string
    openParking?: string
    coveredParking?: string
    numberOfGarage?: string
    totalTowers?: number
    floorAreaRatio?: number
    waterSource?: string[]

    // Development Details
    developmentDetails?: DevelopmentDetail[]
    apartments?: ApartmentConfig[]
    villas?: VillaConfig[]
    plots?: PlotConfig[]
    towerDetails?: TowerDetail[]

    // Regulatory Information
    reraId?: string
    acknowledgeNumber?: string
    reraStatus?: ReraStatus
    localAuthority?: string
    approvingAuthority?: string
    planApprovalDate?: string
    approvedPlanNumber?: string

    // Media and Documents
    images?: string[]
    typologyAndUnitPlan?: string[]
    cdpMapURL?: string[]
    costSheetURL?: string[]
    brochureURL?: string[]
    documents?: Documents
    masterPlan?: string[]

    // Clubhouse Details
    clubHouseDetails?: Array<{
        name: string
        sizeSqft: number
        floor: string
    }>

    // Legal Information
    litigationStatus?: 'Yes' | 'No'
    affidavitLink?: string
    complaints?: {
        complaintsOnProject?: Complaint[]
        complaintsOnPromoter?: Complaint[]
    }

    // Amenities
    amenities?: string[]

    // Timestamps
    createdAt: string
    lastUpdated: string

    // Legacy fields for compatibility
    apartmentUnits?: ApartmentConfig[]
    villaUnits?: VillaConfig[]
    plotUnits?: PlotConfig[]
    groundFloor?: GroundFloor
    clubhouseDetails?: ClubhouseDetail[]
    projectOverview?: string
    projectTitle?: string
    pId?: string
    stage?: string
    developerPromoter?: string
    proposedCompletionDate?: string
    googleMap?: string
    totalUnits?: string
    eoiAmount?: string
    noOfFloors?: string
    noOfTowers?: string
    carParking?: string
    openSpace?: string
}
