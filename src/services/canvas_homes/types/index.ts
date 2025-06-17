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
    leadStatus: 'interested' | 'not interested' | 'booking dropped' | null
    leadState: 'open' | 'closed' | 'fresh' | 'dropped' | null
    added: number | null
    lastModified: number | null
}

export interface Enquiry {
    enquiryId: string | null
    leadId: string | null
    agentId: string | null
    propertyName: string | null
    source: string | null
    status: string | null
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
    added: number | null
    lastModified: number | null
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
    userId: string | null
    name: string | null
    phonenumber: string | null
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
