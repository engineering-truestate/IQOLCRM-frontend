// Types for lead data
export type LeadStatus = 'Interested' | 'Not Interested' | 'No Contact Yet'
export type ConnectStatus = 'Connected' | 'Not Contact' | 'RNR-1' | 'RNR-2' | 'RNR-3' | 'RNR-4'
export type LeadSource = 'WhatsApp' | 'Instagram' | 'Facebook' | 'Classified' | 'Organic' | 'Referral'
export type KAMAssigned = 'Samarth' | 'Priya' | 'Raj'
export type YesNo = 'Yes' | 'No'

export interface Lead {
    id: string
    agentName: string
    contactNumber: string
    lastTried: string
    lastConnect: string
    leadStatus: LeadStatus
    connectStatus: ConnectStatus
    kamAssigned: KAMAssigned
    leadSource: LeadSource
    joinedCommunity: YesNo
    onBroadcast: YesNo
}

// Constants for data generation
const LEAD_SOURCES: LeadSource[] = ['WhatsApp', 'Instagram', 'Facebook', 'Classified', 'Organic', 'Referral']
const LEAD_STATUSES: LeadStatus[] = ['Interested', 'Not Interested', 'No Contact Yet']
const CONNECT_STATUSES: ConnectStatus[] = ['Connected', 'Not Contact', 'RNR-1', 'RNR-2', 'RNR-3', 'RNR-4']
const KAMS: KAMAssigned[] = ['Samarth', 'Priya', 'Raj']
const YES_NO: YesNo[] = ['Yes', 'No']

// Utility function to get random item from array
const getRandomItem = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
}

// Utility function to generate random phone number
const generatePhoneNumber = (): string => {
    const areaCode = Math.floor(100 + Math.random() * 900)
    const number = Math.floor(1000 + Math.random() * 9000)
    return `555-${areaCode}-${number}`
}

// Utility function to generate random date string
const generateRandomDate = (month: string): string => {
    const day = Math.floor(1 + Math.random() * 30)
    return `${day} ${month} 2025`
}

// Main function to generate leads data
export const generateLeads = (count: number = 200): Lead[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `LD${String(i + 1).padStart(3, '0')}`,
        agentName: `Lead ${i + 1}`,
        contactNumber: generatePhoneNumber(),
        lastTried: generateRandomDate('May'),
        lastConnect: generateRandomDate('Apr'),
        leadStatus: getRandomItem(LEAD_STATUSES),
        connectStatus: getRandomItem(CONNECT_STATUSES),
        kamAssigned: getRandomItem(KAMS),
        leadSource: getRandomItem(LEAD_SOURCES),
        joinedCommunity: getRandomItem(YES_NO),
        onBroadcast: getRandomItem(YES_NO),
    }))
}

// Export individual arrays if needed elsewhere
export { LEAD_SOURCES, LEAD_STATUSES, CONNECT_STATUSES, KAMS, YES_NO }
