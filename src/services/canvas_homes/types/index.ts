export interface Lead {
    leadId: string | null
    agentId: string | null
    agentName: string | null
    name: string | null
    phoneNumber: string | null
    propertyName: string | null
    tag: 'cold' | 'potential' | 'hot' | 'super hot' | null
    userId: string | null
    label?: 'whatsapp' | 'call' | null
    source: string | null
    stage: 'lead registered' | 'initial contacted' | 'site visited' | 'eoi collected' | 'booking confirmed' | null
    taskType: 'lead registration' | 'initial contact' | 'site visit' | 'eoi collection' | 'booking' | null
    scheduledDate: number | null
    leadStatus:
        | 'interested'
        | 'follow up'
        | 'not interested'
        | 'not connected'
        | 'visit unsuccessful'
        | 'visit dropped'
        | 'eoi dropped'
        | 'booking dropped'
        | 'requirement collected'
        | 'closed'
        | null
    state: 'open' | 'closed' | 'fresh' | 'dropped' | null
    added: number | null
    lastModified: number | null
}

export interface Enquiry {
    enquiryId: string | null
    leadId: string | null
    agentId: string | null
    propertyName: string | null
    propertyId: string | null
    source: string | null
    leadStatus: string | null
    stage: string | null
    agentHistory: AgentHistoryItem[] | null
    notes: NoteItem[] | null
    activityHistory: ActivityHistoryItem[] | null
    tag: 'cold' | 'potential' | 'hot' | 'super hot' | null
    documents?:
        | {
              id: string | null
              name: string | null
              size: string | null
              uploadDate: string | null
              url: string | null
              storagePath: string | null
          }[]
        | null
    requirements?:
        | {
              id: string | null
              name: string | null
              expectedBudget: string | null
              zone: string | null
              microMarket: string | null
              propertyType: string | null
              typology: string | null
              size: string | null
              propertyStage: string | null
              possessionType: string | null
              notes: string | null
              added: string | null
          }[]
        | null
    state: 'open' | 'closed' | 'fresh' | 'dropped' | null
    added: number | null
    lastModified: number | null
}

export interface AgentHistoryItem {
    timestamp: number
    agentId: string
    agentName: string
    lastStage: string | null
}

export interface NoteItem {
    timestamp: number
    agentId: string
    agentName: string
    taskType: string
    note: string
}

export interface ActivityHistoryItem {
    activityType: string
    timestamp: number // includes both date and time
    agentName: string
    data: Record<string, any>
}

export interface Task {
    taskId: string
    enquiryId: string
    agentId: string
    agentName: string
    name: string
    leadAddDate: number
    propertyName: string
    taskType: 'lead registration' | 'initial contact' | 'site visit' | 'eoi collection' | 'booking'
    eventName?: string
    status: 'open' | 'complete'
    stage: string // e.g., "Initial Contacted"
    leadStatus: string // e.g., "Interested"
    tag: string // e.g., "Hot"
    scheduledDate: number
    added: number
    eoiEntries?: any
    completionDate?: number
    lastModified: number
}

export interface User {
    userId: string | null
    name: string | null
    phoneNumber: string | null
    emailAddress: string | null
    label?: 'whatsapp' | 'call' | null
    added: number | null
    lastModified: number | null
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
