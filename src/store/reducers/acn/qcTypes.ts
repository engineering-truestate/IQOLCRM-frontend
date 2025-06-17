// store/reducers/acn/qcTypes.ts
export interface GeoLocation {
    lat: number
    lng: number
}

export interface PriceHistoryItem {
    date: number
    price: number
    updatedBy: string
}

export interface QCReview {
    kamReview: {
        status: 'approved' | 'pending' | 'rejected' | 'duplicate' | 'primary'
        reviewDate?: number
        reviewedBy?: string
        comments?: string
    }
    dataReview: {
        status: 'approved' | 'pending' | 'rejected' | 'duplicate' | 'primary'
        reviewDate?: number
        reviewedBy?: string
        comments?: string
    }
}

export interface QCHistoryItem {
    date: number
    action: string
    performedBy: string
    details: string
}

export interface HighlightResult {
    [key: string]: {
        value: string
        matchLevel: string
        matchedWords: string[]
    }
}

export interface IQCInventory {
    propertyId: string
    nameOfTheProperty: string
    unitNo: string
    path: string
    _geoloc: GeoLocation
    address: string
    area: string
    micromarket: string
    mapLocation: string
    assetType: 'villa' | 'apartment' | 'plot' | 'commercial' | 'warehouse' | 'office'
    unitType: '1 bhk' | '2 bhk' | '3 bhk' | '4 bhk' | '5+ bhk'
    subType: string
    communityType: 'gated' | 'open' | 'independent'
    sbua: number
    carpet: number
    plotSize: number
    uds: number
    structure: number
    buildingAge: number
    floorNo: number
    exactFloor: number
    facing: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'
    plotFacing: 'north' | 'south' | 'east' | 'west'
    balconyFacing: 'north' | 'south' | 'east' | 'west' | 'outside'
    noOfBalconies: string
    noOfBathrooms: string
    carPark: number
    cornerUnit: boolean
    extraRoom: ('servent room' | 'study room')[]
    furnishing: 'fullFurnished' | 'semiFurnished' | 'unfurnished'
    totalAskPrice: number
    askPricePerSqft: number
    priceHistory: PriceHistoryItem[]
    rentalIncome: number
    status: 'available' | 'delisted' | 'sold' | 'hold'
    currentStatus: 'ready to move' | 'under construction' | 'new launch'
    exclusive: boolean
    tenanted: boolean
    eKhata: boolean
    buildingKhata: string
    landKhata: string
    ocReceived: boolean
    bdaApproved: boolean
    biappaApproved: boolean
    stage: 'kam' | 'dataTeam' | 'live'
    qcStatus: 'approved' | 'pending' | 'reject' | 'duplicate' | 'primary'
    qcReview: QCReview
    kamStatus: 'approved' | 'pending' | 'rejected'
    cpCode: string
    kamName: string
    kamId: string
    handoverDate: number
    photo: string[]
    video: string[]
    document: string[]
    driveLink: string
    noOfEnquiries: number
    dateOfInventoryAdded: number
    lastmodified: number
    dateOfStatusLastChecked: number
    ageOfInventory: number
    ageOfStatus: number
    qcHistory: QCHistoryItem[]
    extraDetails: string
    __position?: number
    _highlightResult?: HighlightResult
}

export interface QCInventoryState {
    qcInventories: IQCInventory[]
    currentQCInventory: IQCInventory | null
    loading: boolean
    error: string | null
    lastFetch: number | null // Changed from Date to Unix timestamp
}

// User types for the auth integration
export interface FirebaseUser {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
}

export interface AgentData {
    email: string
    role: 'kam' | 'dataTeam' | 'kamModerator'
    name?: string
    id?: string
}

export interface AuthStateResponse {
    user: FirebaseUser | null
    agentData: AgentData | null
}

export interface UserAuthResponse {
    user: FirebaseUser | null
    agentData: AgentData | null
}
