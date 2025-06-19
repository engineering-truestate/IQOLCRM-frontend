// ==================== COMMON TYPES ====================

interface GeoLocation {
    lat: number
    lng: number
}

interface PriceHistoryItem {
    timestamp: number
    price: number
    updatedBy: string
}

interface ContactHistoryItem {
    timestamp: number
    contactResult: 'connected' | 'not connected' | 'on call' | 'on whatsapp' | 'out bound' | 'in bound'
}

interface Note {
    timestamp: number
    kamId: string
    source: string
    note: string
    archive: boolean
}

interface PaymentHistoryItem {
    paymentAmount: number
    paymentDate: number
    paymentId: string
    planId: string
}

interface QCHistoryItem {
    timestamp: number
    qcStatus: string
    userName: string
    userRole: string
    userEmail: string
    userPhone: string
    cpId: string
    action: string
    details: string
    performedBy: string
    date: number
}

interface HighlightResultItem {
    matchLevel: string
    matchedWords: string[]
    value: string
}

interface HighlightResult {
    assetType?: HighlightResultItem
    micromarket?: HighlightResultItem
    sbua?: HighlightResultItem
}

// ==================== ENQUIRY TYPES ====================

interface IEnquiry {
    enquiryId: string
    propertyId: string
    cpId: string
    status: 'site visit done' | 'pending' | 'not interested' | 'interested'
    added: number
    lastModified: number
}

type EnquiryState = {
    enquiries: IEnquiry[]
    loading: boolean
    error: string | null
    lastFetch: Date | null
}

// ==================== INVENTORY TYPES ====================

export interface IInventory {
    id: string
    propertyId: string
    cpId: string
    propertyName: string
    _geoloc: GeoLocation
    area: string
    builerName: string
    builderCategory: string
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
    handoverDate: number | null
    buildingKhata: string | null
    landKhata: string | null
    ocReceived: boolean | null
    photo: string[]
    video: string[]
    document: string[]
    driveLink: string
    dateOfInventoryAdded: number
    dateOfStatusLastChecked: number
    ageOfInventory: number
    ageOfStatus: number
    extraDetails: string
}

type InventoryState = {
    inventories: IInventory[]
    loading: boolean
    error: string | null
    lastFetch: Date | null
}

// ==================== QC INVENTORY TYPES ====================

// Add ReviewDetails interface for review objects
interface ReviewDetails {
    status: string
    reviewDate: number
    reviewedBy: string
    comments: string
}

interface QCReview {
    type: 'rejected' | 'duplicate'
    rejectedFields: string[]
    qcNote: string
    originalPropertyId: string
    kamReview: ReviewDetails
    dataReview: ReviewDetails
}

// Base QC Inventory type with required fields
interface BaseQCInventory {
    propertyId: string
    propertyName: string
    cpId: string
    lastModified: number
    __position2: number
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
    kamName: string
    kamId: string
    handoverDate: number
    photo: string[]
    video: string[]
    document: string[]
    driveLink: string
    noOfEnquiries: number
    dateOfInventoryAdded: number
    dateOfStatusLastChecked: number
    ageOfInventory: number
    ageOfStatus: number
    qcHistory: QCHistoryItem[]
    extraDetails: string
    _highlightResult?: HighlightResult
}

// QC Inventory type for API responses
type IQCInventory = BaseQCInventory

// Type for partial updates
type QCInventoryUpdate = Partial<BaseQCInventory>

// Update QCInventoryState type
type QCInventoryState = {
    qcInventories: BaseQCInventory[]
    currentQCInventory: BaseQCInventory | null
    loading: boolean
    error: string | null
    lastFetch: Date | null
}

// Add a type for the action payload
type UpdateQCStatusPayload = {
    propertyId: string
    updates: QCInventoryUpdate
}

// Add a type for the thunk response
type QCInventoryResponse = BaseQCInventory

// ==================== RENTAL INVENTORY TYPES ====================

interface IRentalInventory {
    propertyId: string
    propertyName: string
    assetType: 'villa' | 'apartment' | 'plot' | 'commercial' | 'warehouse' | 'office'
    configuration: '1 bhk' | '2 bhk' | '3 bhk' | '4 bhk' | '5+ bhk'
    _geoloc: GeoLocation
    area: string
    micromarket: string
    mapLocation: string
    rentPerMonthInLakhs: string
    securityDeposit: string
    maintenanceCharges: string
    leasePeriod: string
    lockInPeriod: string
    availableFrom: string
    facing: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'
    exactFloor: string
    floorNumber: string
    SBUA: string
    plotSize: string
    furnishingStatus: 'fully furnished' | 'semi furnished' | 'unfurnished'
    amenities: string
    petFriendly: string
    vegNonVeg: string
    restrictions: string
    photos: string[]
    videos: string[]
    documents: string[]
    driveFileLinks: string[]
    driveLink: string
    cpId: string
    kamName: string
    listingScore: number
    dateOfInventoryAdded: number
    dateOfStatusLastChecked: number
    extraDetails: string
}

type RentalInventoryState = {
    rentalInventories: IRentalInventory[]
    loading: boolean
    error: string | null
    lastFetch: Date | null
}

// ==================== REQUIREMENT TYPES ====================

// Note interface
export interface INote {
    id: string
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

interface IRequirement {
    requirementId: string
    agentNumber: string
    agentName: string
    cpId: string
    location: string
    assetType: 'villa' | 'apartment' | 'plot' | 'commercial' | 'warehouse' | 'office'
    configuration: '1 bhk' | '2 bhk' | '3 bhk' | '4 bhk' | '5+ bhk'
    _geoloc: GeoLocation
    micromarket: string
    budget: BudgetRange
    note: string[]
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
}

type RequirementState = {
    requirements: IRequirement[]
    loading: boolean
    error: string | null
    lastFetch: Date | null
}

// ==================== AGENT TYPES ====================

interface InventoryStatus {
    available: boolean
    delisted: boolean
    hold: boolean
    sold: boolean
}

interface IAgent {
    planId: string
    inventories: string[]
    requirements: string[]
    enquiries: string[]
    legalLeads: string[]
    cpId: string
    name: string
    phoneNumber: string
    emailAddress: string
    workAddress: string
    reraId: string
    firmName: string
    firmSize: number
    areaOfOperation: ('north bangalore' | 'south bangalore' | 'east bangalore' | 'west bangalore' | 'pan bangalore')[]
    businessCategory: ('resale' | 'rental' | 'primary')[]
    preferedMicromarket: string
    userType: 'basic' | 'trial' | 'premium'
    activity: 'active' | 'nudge' | 'no activity'
    agentStatus: 'interested' | 'not interested' | 'not contact yet'
    verified: boolean
    verficationDate: number
    blackListed: boolean
    trialUsed: boolean
    trialStartedAt: number
    noOfinventories: number
    inventoryStatus: InventoryStatus
    noOfEnquiries: number
    noOfrequirements: number
    noOfleagalLeads: number
    lastEnquiry: number
    payStatus: 'will pay' | 'paid' | 'will not' | 'paid by team'
    planExpiry: number
    nextRenewal: number
    paymentHistory: PaymentHistoryItem[]
    monthlyCredits: number
    boosterCredits: number
    inboundEnqCredits: number
    inboundReqCredits: number
    contactStatus: 'connected' | 'not contact' | 'rnr-2' | 'rnr-3' | 'rnr-1' | 'rnr-4' | 'rnr-5' | 'rnr-6'
    contactHistory: ContactHistoryItem[]
    lastTried: number
    kamName: string
    kamId: string
    notes: Note[]
    appInstalled: boolean
    communityJoined: boolean
    onBroadcast: boolean
    onboardingComplete: boolean
    source: 'whatsApp' | 'instagram' | 'facebook' | 'referral' | 'direct'
    lastSeen: number
    added: number
    lastModified: number
    extraDetails: string
}

type AgentState = {
    agents: IAgent[]
    loading: boolean
    error: string | null
    lastFetch: Date | null
}

// ==================== LEAD TYPES ====================

interface ConnectHistoryItem {
    timestamp: number
    connectResult: 'connected' | 'not connected' | 'on call' | 'on whatsapp' | 'out bound' | 'in bound'
}

interface ILead {
    leadId: string
    name: string
    phonenumber: string
    emailAddress: string
    source: 'whatsApp' | 'instagram' | 'facebook' | 'referral' | 'direct'
    leadStatus: 'interested' | 'not interested' | 'not contact yet'
    contactStatus: 'connected' | 'not contact' | 'rnr-1' | 'rnr-2' | 'rnr-3' | 'rnr-4' | 'rnr-5' | 'rnr-6'
    verified: boolean
    blackListed: boolean
    connectHistory: ConnectHistoryItem[]
    lastConnect: number
    lastTried: number
    kamName: string
    kamId: string
    notes: Note[]
    onBroadcast: boolean
    communityJoined: boolean
    added: number
    lastModified: number
    extraDetails: string
}

type LeadState = {
    leads: ILead[]
    loading: boolean
    error: string | null
    lastFetch: Date | null
}

// ==================== ROOT STATE TYPE ====================

type RootState = {
    enquiries: EnquiryState
    inventories: InventoryState
    qcInventories: QCInventoryState
    rentalInventories: RentalInventoryState
    requirements: RequirementState
    agents: AgentState
    leads: LeadState
    auth: AuthState // Your existing auth state
}

// ==================== COLLECTION ACTION TYPES ====================

type CollectionAction = {
    type: string
    payload?: any
}

type DispatchType = (args: CollectionAction) => CollectionAction

// ==================== EXISTING AUTH TYPES ====================

interface IUser {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
}

type AuthState = {
    user: IUser | null
    loading: boolean
    error: string | null
    isAuthenticated: boolean
}

interface AuthCredentials {
    email: string
    password: string
    displayName?: string
}

// ==================== QUERY OPTIONS FOR FETCHING ====================

interface FetchOptions {
    orderByField?: string
    orderDirection?: 'asc' | 'desc'
    limitCount?: number
    whereConditions?: Array<{
        field: string
        operator: any
        value: any
    }>
}

// ==================== COLLECTION NAMES ENUM ====================

enum CollectionNames {
    ENQUIRIES = 'acn-enquiries',
    PROPERTIES = 'acn-properties',
    QC_INVENTORIES = 'acn-qc-inventories',
    REQUIREMENTS = 'acn-requirements',
    AGENTS = 'acn-agents',
}

// ==================== FILTER TYPES ====================

interface PropertyFilters {
    assetType?: string[]
    unitType?: string[]
    priceRange?: BudgetRange
    sizeRange?: SizeRange
    micromarket?: string[]
    status?: string[]
    facing?: string[]
}

interface AgentFilters {
    userType?: string[]
    activity?: string[]
    areaOfOperation?: string[]
    businessCategory?: string[]
    verified?: boolean
    blackListed?: boolean
}

interface RequirementFilters {
    requirementStatus?: string[]
    internalStatus?: string[]
    assetType?: string[]
    configuration?: string[]
    micromarket?: string[]
}

// ==================== AGENT DATA TYPE ====================

export interface AgentData {
    role: string
    email: string
    phone: string
    cpId: string
    // Add any other fields as needed
}

// ==================== USER AUTH TYPES ====================

export interface FirebaseUser {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
}

export interface UserAuthResponse {
    user: FirebaseUser | null
    agentData: AgentData | null
}

export interface AuthStateResponse {
    user: FirebaseUser | null
    agentData: AgentData | null
}
