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

export interface IEnquiry {
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
    lastFetch: number | null
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
    builderName: string | null
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
    lastFetch: number | null
}

// ==================== QC INVENTORY TYPES ====================

// Add missing supporting interfaces
interface GeoLocation {
    lat: number
    lng: number
}

interface PriceHistoryItem {
    price: number
    timestamp: number
}

interface QCHistoryItem {
    timestamp: number
    qcStatus: 'approved' | 'pending' | 'rejected' | 'duplicate' | 'primary'
    userName: string
    userRole: 'kam' | 'data' | 'kamModerator'
    userEmail?: string
    userPhone?: string
    kamId: string
    cpId: string
    action: string
    details: string
    performedBy: string
    date: number
}

interface HighlightResult {
    [key: string]: any
}

// Add ReviewDetails interface for review objects
interface ReviewDetails {
    status: 'approved' | 'pending' | 'rejected' | 'duplicate' | 'primary'
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

// Available fields for rejection reasons - formatted for your MultiSelectDropdown
export const AVAILABLE_PROPERTY_FIELDS = [
    { label: 'Property Name', value: 'propertyName' },
    { label: 'Address', value: 'address' },
    { label: 'Area', value: 'area' },
    { label: 'Micromarket', value: 'micromarket' },
    { label: 'Map Location', value: 'mapLocation' },
    { label: 'Asset Type', value: 'assetType' },
    { label: 'Unit Type', value: 'unitType' },
    { label: 'Sub Type', value: 'subType' },
    { label: 'Community Type', value: 'communityType' },
    { label: 'SBUA (Super Built-up Area)', value: 'sbua' },
    { label: 'Carpet Area', value: 'carpet' },
    { label: 'Plot Size', value: 'plotSize' },
    { label: 'UDS (Undivided Share)', value: 'uds' },
    { label: 'Structure', value: 'structure' },
    { label: 'Building Age', value: 'buildingAge' },
    { label: 'Floor Number', value: 'floorNo' },
    { label: 'Exact Floor', value: 'exactFloor' },
    { label: 'Facing Direction', value: 'facing' },
    { label: 'Plot Facing', value: 'plotFacing' },
    { label: 'Balcony Facing', value: 'balconyFacing' },
    { label: 'Number of Balconies', value: 'noOfBalconies' },
    { label: 'Number of Bathrooms', value: 'noOfBathrooms' },
    { label: 'Car Parking', value: 'carPark' },
    { label: 'Corner Unit', value: 'cornerUnit' },
    { label: 'Extra Rooms', value: 'extraRoom' },
    { label: 'Furnishing Status', value: 'furnishing' },
    { label: 'Total Ask Price', value: 'totalAskPrice' },
    { label: 'Ask Price Per Sqft', value: 'askPricePerSqft' },
    { label: 'Price History', value: 'priceHistory' },
    { label: 'Rental Income', value: 'rentalIncome' },
    { label: 'Current Status', value: 'currentStatus' },
    { label: 'Exclusive Listing', value: 'exclusive' },
    { label: 'Tenanted Status', value: 'tenanted' },
    { label: 'E-Khata', value: 'eKhata' },
    { label: 'Building Khata', value: 'buildingKhata' },
    { label: 'Land Khata', value: 'landKhata' },
    { label: 'OC Received', value: 'ocReceived' },
    { label: 'BDA Approved', value: 'bdaApproved' },
    { label: 'BIAPPA Approved', value: 'biappaApproved' },
    { label: 'Handover Date', value: 'handoverDate' },
    { label: 'Photos', value: 'photo' },
    { label: 'Videos', value: 'video' },
    { label: 'Documents', value: 'document' },
    { label: 'Drive Link', value: 'driveLink' },
    { label: 'Extra Details', value: 'extraDetails' },
]

// Add Notes interface for the notes system
interface QCNote {
    kamId: string
    kamName: string
    details: string
    timestamp: number
}

// Add Agent Data interface for role-based operations
interface AgentData {
    role: string | undefined
    email: string
    phone?: string
    name: string
    kamId?: string
    id: string
}

// Base QC Inventory type with required fields
interface BaseQCInventory {
    name: string
    phoneNumber: string
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
    status: 'available' | 'delisted' | 'sold' | 'hold' | 'approved' | 'pending' | 'rejected' | 'duplicate' | 'primary'
    currentStatus: 'ready to move' | 'under construction' | 'new launch'
    exclusive: boolean
    tenanted: boolean
    eKhata: boolean
    buildingKhata: string
    landKhata: string
    ocReceived: boolean
    bdaApproved: boolean
    biappaApproved: boolean

    // Core workflow fields based on your business logic
    stage: 'kam' | 'data' | 'live' | 'notApproved'
    qcStatus: 'approved' | 'pending' | 'rejected' | 'duplicate' | 'primary'
    qcReview: QCReview

    // KAM workflow fields
    kamStatus: 'approved' | 'pending' | 'rejected' | 'duplicate'
    kamName: string
    kamId: string

    // Data team workflow fields
    dataStatus?: 'approved' | 'pending' | 'rejected' | 'duplicate' | 'primary'

    // Additional fields
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
    notes: QCNote[]
    extraDetails: string
    _highlightResult?: HighlightResult

    // Financial fields
    price: number
    pricePerSqft: number

    // Location fields
    city: string
    state: string

    // Missing fields from IInventory - added with optional (?)
    id?: string
    cpId?: string
    propertyName?: string
    builderName?: string | null
    objectID?: string
    enquiries?: number
    lastCheck?: number
    // propertyName?: string

    // Plot-specific fields
    oddSized?: boolean
    plotLength?: number | string
    plotBreadth?: number | string

    // Additional metadata fields
    propertyAge?: number
    lastRenovated?: number
    amenities?: string[]
    nearbyLandmarks?: string[]
    transportConnectivity?: string[]

    // Pricing details
    maintenanceCharges?: number
    securityDeposit?: number
    brokerage?: number

    // Legal and compliance
    approvalStatus?: string
    legalClearance?: boolean
    encumbrance?: boolean

    // Marketing
    featured?: boolean
    priority?: number
    marketingNotes?: string
}

// QC Inventory type for API responses
type IQCInventory = BaseQCInventory

// Type for partial updates - uses TypeScript's Partial utility type
type QCInventoryUpdate = Partial<BaseQCInventory>

// Update QCInventoryState type for Redux state management
type QCInventoryState = {
    qcInventories: BaseQCInventory[]
    currentQCInventory: BaseQCInventory | null
    selectedInventory?: BaseQCInventory | null
    kamNameMappings: Record<string, string>
    kamMappingsLoading: boolean
    loading: boolean
    error: string | null
    lastFetch: number | null
    updateLoading: boolean
    noteLoading: boolean
}

// Add a type for the action payload in Redux actions
type UpdateQCStatusPayload = {
    propertyId: string
    updates: QCInventoryUpdate
    propertyCreated?: boolean
}

// Add a type for the thunk response from API calls
type QCInventoryResponse = BaseQCInventory

// Types for thunk parameters
type UpdateQCStatusParams = {
    property: BaseQCInventory
    status: string
    agentData: AgentData
    activeTab: string
    reviewedBy: string
    comments: string
}

type UpdateKAMStatusParams = {
    propertyId: string
    newStatus: string
    kamId: string
    kamName: string
}

type UpdateDataTeamStatusParams = {
    propertyId: string
    newStatus: string
    kamId: string
    kamName: string
}

type AddNoteParams = {
    propertyId: string
    details: string
    kamId: string
    kamName: string
}

// Response types for thunk actions
type UpdateStatusResponse = {
    propertyId: string
    updates: Partial<BaseQCInventory>
    propertyCreated: boolean
}

type AddNoteResponse = {
    propertyId: string
    note: QCNote
}

// Export all types for use in other files
export type {
    BaseQCInventory,
    IQCInventory,
    QCInventoryUpdate,
    QCInventoryState,
    UpdateQCStatusPayload,
    QCInventoryResponse,
    QCHistoryItem,
    QCNote,
    QCReview,
    ReviewDetails,
    AgentData,
    GeoLocation,
    PriceHistoryItem,
    HighlightResult,
    UpdateQCStatusParams,
    UpdateKAMStatusParams,
    UpdateDataTeamStatusParams,
    AddNoteParams,
    UpdateStatusResponse,
    AddNoteResponse,
}

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
    lastFetch: number | null
}

// ==================== REQUIREMENT TYPES ====================

// Note interface
export interface INote {
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

export interface IRequirement {
    requirementId: string
    agentPhoneNumber: string
    agentName: string
    cpId: string
    assetType: 'villa' | 'apartment' | 'plot' | 'commercial' | 'warehouse' | 'office'
    configuration: '1 bhk' | '2 bhk' | '3 bhk' | '4 bhk' | '5+ bhk' | null
    micromarket: string
    budget: BudgetRange
    notes: INote[]
    area: number
    kamId: string
    kamName: string
    kamPhoneNumber: string
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
    lastFetch: number | null
}

// ==================== AGENT TYPES ====================

interface InventoryStatus {
    available: boolean
    delisted: boolean
    hold: boolean
    sold: boolean
}

export interface IAgent {
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
    inWhatsappCommunity: boolean
    onBroadcast: boolean
    lastSeen: number
    added: number
    lastModified: number
    extraDetails: string
    lastConnected: number
    lastTried: number
    contactStatus: 'connected' | 'not contact' | 'rnr-2' | 'rnr-3' | 'rnr-1' | 'rnr-4' | 'rnr-5' | 'rnr-6'
    contactHistory: ContactHistoryItem[]
    notes: Note[]
    appInstalled: boolean
    communityJoined: boolean
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
    noOfInventories: number
    inventoryStatus: InventoryStatus
    noOfEnquiries: number
    noOfRequirements: number
    noOfLegalLeads: number
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
    onboardingComplete?: boolean
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
    lastFetch: number | null
}

// ==================== LEAD TYPES ====================

interface ConnectHistoryItem {
    timestamp: number
    connectResult: 'connected' | 'not connected' | 'on call' | 'on whatsapp' | 'out bound' | 'in bound'
}

interface ILead {
    leadId: string
    name: string
    phoneNumber: string
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
    lastFetch: number | null
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
    lastFetch?: number
}

// ==================== AGENT DATA TYPE ====================

export interface AgentData {
    role: string
    email: string
    phone: string
    cpId: string
    name?: string
    id?: string
    kamId?: string
    lastFetch?: number
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
    lastFetch: number
}

export interface AuthStateResponse {
    user: FirebaseUser | null
    agentData: AgentData | null
    lastFetch: number
}
