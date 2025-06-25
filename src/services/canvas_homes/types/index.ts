export interface Lead {
    leadId: string
    agentId: string
    agentName: string | null
    name: string | null
    phoneNumber: string
    propertyName: string
    tag: 'cold' | 'potential' | 'hot' | 'super hot' | string | null
    userId: string | null
    label?: 'whatsapp' | 'call' | null
    source: string | null
    stage:
        | 'lead registered'
        | 'initial contacted'
        | 'site visited'
        | 'eoi collected'
        | 'booking confirmed'
        | string
        | null
    taskType: 'lead registration' | 'initial contact' | 'site visit' | 'eoi collection' | 'booking' | string | null
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
    state: 'open' | 'closed' | 'fresh' | 'dropped' | string | null
    added: number
    lastModified: number
}

export interface Enquiry {
    enquiryId: string
    leadId: string
    agentId: string
    propertyName: string | null
    propertyId: string
    source: string | null
    leadStatus: string | null
    stage: string | null
    agentHistory: AgentHistoryItem[] | null
    notes: NoteItem[] | null
    activityHistory: ActivityHistoryItem[] | null
    tag: 'cold' | 'potential' | 'hot' | 'super hot' | string | null
    documents?:
        | {
              id: string
              name: string | null
              size: string | null
              uploadDate: string
              url: string | null
              storagePath: string | null
          }[]
        | null
    requirements?:
        | {
              id: string
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
              added: string
          }[]
        | null
    state: 'open' | 'closed' | 'fresh' | 'dropped' | string | null
    added: number
    lastModified: number
}

export interface AgentHistoryItem {
    timestamp: number
    agentId: string
    agentName: string | null
    lastStage: string | null
}

export interface NoteItem {
    timestamp: number
    agentId: string
    agentName: string | null
    taskType: string | null
    note: string | null
}

export interface ActivityHistoryItem {
    activityType: string | null
    timestamp: number | null // includes both date and time
    agentName: string | null
    data: Record<string, any>
}

export interface Task {
    taskId: string
    enquiryId: string
    agentId: string
    agentName: string | null
    name: string
    leadAddDate: number
    propertyName: string
    taskType: 'lead registration' | 'initial contact' | 'site visit' | 'eoi collection' | 'booking' | string | null
    eventName?: string | null
    status: 'open' | 'complete' | null
    stage: string | null // e.g., "Initial Contacted"
    leadStatus: string | null // e.g., "Interested"
    tag: string | null // e.g., "Hot"
    scheduledDate: number
    added: number
    eoiEntries?: any | null
    completionDate?: number | null
    lastModified: number
}

export interface User {
    userId: string
    name: string
    phoneNumber: string
    emailAddress: string | null
    label?: 'whatsapp' | 'call' | null
    added: number
    lastModified: number
}

export interface Campaign {
    campaignId: string | null
    propertyName: string | null
    campaignName: string | null
    source: string | null
    medium: string | null
    startDate: number | null
    endDate: number | null
    totalCost: number | null
    totalLeads: number | null
    added: number | null
    lastModified: number | null
}
