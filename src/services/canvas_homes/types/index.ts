export interface Lead {
    leadId: string
    agentId: string
    agentName: string
    name: string
    phoneNumber: string
    propertyName: string
    tag: 'cold' | 'potential' | 'hot' | 'super hot'
    userId: string
    label?: 'whatsapp' | 'call'
    source: string
    stage: 'lead registered' | 'initial contacted' | 'site visited' | 'eoi collected' | 'booking confirmed'
    taskType: 'lead registration' | 'initial contact' | 'site visit' | 'eoi collection' | 'booking'
    scheduledDate: number
    leadStatus: 'interested' | 'not interested' | 'booking dropped'
    leadState: 'open' | 'closed' | 'fresh' | 'dropped'
    added: number
    lastModified: number
}

export interface Enquiry {
    enquiryId: string
    leadId: string
    agentId: string
    propertyName: string
    source: string
    status: string
    stage: string
    agentHistory: AgentHistoryItem[]
    notes: NoteItem[]
    activityHistory: ActivityHistoryItem[]
    tag: 'cold' | 'potential' | 'hot' | 'super hot'
    documents?: {
        id: string
        name: string
        size: string
        uploadDate: string
        url: string
        storagePath: string
    }[]
    requirements?: {
        id: string
        name: string
        expectedBudget: string
        zone: string
        microMarket: string
        propertyType: string
        typology: string
        size: string
        propertyStage: string
        possessionType: string
        notes: string
        added: string
    }[]
    added: number
    lastModified: number
}

export interface AgentHistoryItem {
    timestamp: number
    agentId: string
    agentName: string
    lastStage: string
}

export interface NoteItem {
    timestamp: number
    agentId: string
    agentName: string
    taskType: string
    note: string
}

export interface ActivityHistoryItem {
    timestamp: number
    agentId: string
    activityType: string
    activityStatus: string
    activityNote: string
}

export interface Task {
    taskId: string
    enquiryId: string
    agentId: string
    agentName: string
    type: 'lead registration' | 'initial contact' | 'site visit' | 'eoi collection' | 'booking'
    status: 'open' | 'complete'
    taskResult: 'eoi collected' | 'eoi not collected' | 'change property' | null
    stage: string // e.g., "Initial Contacted"
    leadStatus: string // e.g., "Interested"
    tag: string // e.g., "Hot"
    scheduledDate: number
    dueDays: number
    added: number
    completionDate?: number
    lastModified: number
}

export interface User {
    userId: string
    name: string
    phonenumber: string
    emailAddress: string
    label?: 'whatsapp' | 'call'
    added: number
    lastModified: number
}

export interface Campaign {
    campaignId: string
    propertyName: string
    campaignName: string
    source: string
    medium: string
    startDate: number
    endDate: number
    totalCost: number
    totalLeads: number
    added: number
    lastModified: number
}
