// store/services/acn/leads/leadsService.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { doc, getDoc, updateDoc, deleteDoc, setDoc, getDocs, collection, where, query } from 'firebase/firestore'
import { db } from '../../../firebase'
import { type ILead, leadSearchService } from '../../../services/acn/leads/algoliaLeadsService'

// Helper function to get current Unix timestamp in milliseconds
const getCurrentTimestamp = () => Date.now()

// Notes interface matching your database structure
export interface NoteData {
    kamId: string
    note: string
    source: string
    timestamp: number
    archive: boolean
}

// Call result interface matching your database structure
export interface CallResultData {
    connection: 'connected' | 'not connected' | ''
    connectMedium: 'on call' | 'on whatsapp' | ''
    direction: 'inbound' | 'outbound' | ''
    timestamp: number
}

// Update lead status
export const updateLeadStatus = createAsyncThunk(
    'leads/updateStatus',
    async ({ leadId, status }: { leadId: string; status: string }, { rejectWithValue }) => {
        try {
            console.log('📝 Updating lead status:', leadId, status)

            const docRef = doc(db, 'acnLeads', leadId)
            const updateData = {
                leadStatus: status,
                lastModified: getCurrentTimestamp(),
            }

            await updateDoc(docRef, updateData)

            console.log('✅ Lead status updated successfully')
            return { leadId, status, lastModified: updateData.lastModified }
        } catch (error: any) {
            console.error('❌ Error updating lead status:', error)
            return rejectWithValue(error.message || 'Failed to update lead status')
        }
    },
)

// Update lead contact status
export const updateLeadContactStatus = createAsyncThunk(
    'leads/updateContactStatus',
    async ({ leadId, contactStatus }: { leadId: string; contactStatus: string }, { rejectWithValue }) => {
        try {
            console.log('📝 Updating lead contact status:', leadId, contactStatus)

            const docRef = doc(db, 'acnLeads', leadId)
            const updateData = {
                contactStatus: contactStatus,
                lastModified: getCurrentTimestamp(),
                lastTried: getCurrentTimestamp(),
            }

            await updateDoc(docRef, updateData)

            console.log('✅ Lead contact status updated successfully')
            return { leadId, contactStatus, lastModified: updateData.lastModified }
        } catch (error: any) {
            console.error('❌ Error updating lead contact status:', error)
            return rejectWithValue(error.message || 'Failed to update lead contact status')
        }
    },
)

// Update KAM assignment
export const updateLeadKAM = createAsyncThunk(
    'leads/updateKAM',
    async ({ leadId, kamName, kamId }: { leadId: string; kamName: string; kamId?: string }, { rejectWithValue }) => {
        try {
            console.log('📝 Updating lead KAM:', leadId, kamName)

            const docRef = doc(db, 'acnLeads', leadId)
            const updateData = {
                kamName: kamName,
                kamId: kamId || '',
                lastModified: getCurrentTimestamp(),
            }

            await updateDoc(docRef, updateData)

            console.log('✅ Lead KAM updated successfully')
            return { leadId, kamName, kamId: kamId || '', lastModified: updateData.lastModified }
        } catch (error: any) {
            console.error('❌ Error updating lead KAM:', error)
            return rejectWithValue(error.message || 'Failed to update lead KAM')
        }
    },
)

// Update lead boolean fields (verified, blackListed, onBroadcast, communityJoined)
export const updateLeadBooleanField = createAsyncThunk(
    'leads/updateBooleanField',
    async ({ leadId, field, value }: { leadId: string; field: keyof ILead; value: boolean }, { rejectWithValue }) => {
        try {
            console.log('📝 Updating lead boolean field:', leadId, field, value)

            const docRef = doc(db, 'acnLeads', leadId)
            const updateData = {
                [field]: value,
                lastModified: getCurrentTimestamp(),
            }

            await updateDoc(docRef, updateData)

            console.log('✅ Lead boolean field updated successfully')
            return { leadId, field, value, lastModified: updateData.lastModified }
        } catch (error: any) {
            console.error('❌ Error updating lead boolean field:', error)
            return rejectWithValue(error.message || 'Failed to update lead boolean field')
        }
    },
)

// Fetch single lead by ID
export const fetchLeadById = createAsyncThunk('leads/fetchById', async (leadId: string, { rejectWithValue }) => {
    try {
        console.log('🔍 Fetching lead with ID:', leadId)

        const docRef = doc(db, 'acnLeads', leadId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const data = docSnap.data() as any
            console.log('✅ Lead data fetched:', data)

            const convertedData: ILead = {
                ...data,
                leadId: docSnap.id,
                lastConnect: data.lastConnect || 0,
                lastTried: data.lastTried || 0,
                added: data.added || 0,
                lastModified: data.lastModified || 0,
            }

            return convertedData
        }

        console.log('❌ No lead found with ID:', leadId)
        throw new Error(`Lead with ID ${leadId} not found`)
    } catch (error: any) {
        console.error('❌ Error fetching lead:', error)
        return rejectWithValue(error.message || 'Failed to fetch lead')
    }
})

// Legacy add call result (keeping for compatibility)
export const addCallResult = createAsyncThunk(
    'leads/addCallResult',
    async ({ leadId, connectResult }: { leadId: string; connectResult: string }, { rejectWithValue }) => {
        try {
            console.log('📞 Adding call result:', leadId, connectResult)

            const docRef = doc(db, 'acnLeads', leadId)
            const leadDoc = await getDoc(docRef)

            if (!leadDoc.exists()) {
                throw new Error('Lead not found')
            }

            const leadData = leadDoc.data()
            const connectHistory = leadData.connectHistory || []

            const newHistoryItem = {
                timestamp: getCurrentTimestamp(),
                connectResult: connectResult,
            }

            const updateData = {
                connectHistory: [...connectHistory, newHistoryItem],
                lastConnect: connectResult === 'connected' ? getCurrentTimestamp() : leadData.lastConnect,
                lastTried: getCurrentTimestamp(),
                contactStatus: connectResult === 'connected' ? 'connected' : connectResult,
                lastModified: getCurrentTimestamp(),
            }

            await updateDoc(docRef, updateData)

            console.log('✅ Call result added successfully')
            return { leadId, updateData }
        } catch (error: any) {
            console.error('❌ Error adding call result:', error)
            return rejectWithValue(error.message || 'Failed to add call result')
        }
    },
)

// Add note to lead's notes array
export const addNoteToLead = createAsyncThunk(
    'leads/addNoteToLead',
    async (
        { leadId, noteData }: { leadId: string; noteData: Omit<NoteData, 'timestamp' | 'archive'> },
        { rejectWithValue },
    ) => {
        try {
            console.log('📝 Adding note to lead:', leadId, noteData)

            const docRef = doc(db, 'acnLeads', leadId)
            const leadDoc = await getDoc(docRef)

            if (!leadDoc.exists()) {
                throw new Error('Lead not found')
            }

            const leadData = leadDoc.data()
            const existingNotes = leadData.notes || []

            const newNote: NoteData = {
                ...noteData,
                timestamp: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
                archive: false,
            }

            const updatedNotes = [...existingNotes, newNote]

            await updateDoc(docRef, {
                notes: updatedNotes,
                lastModified: getCurrentTimestamp(),
            })

            console.log('✅ Note added successfully')
            return { leadId, note: newNote, allNotes: updatedNotes }
        } catch (error: any) {
            console.error('❌ Error adding note:', error)
            return rejectWithValue(error.message || 'Failed to add note')
        }
    },
)

// Fetch lead with notes
export const fetchLeadWithNotes = createAsyncThunk(
    'leads/fetchLeadWithNotes',
    async (leadId: string, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching lead with notes:', leadId)

            const docRef = doc(db, 'acnLeads', leadId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                const notes = data.notes || []

                // Sort notes by timestamp (newest first) and filter out archived notes
                const sortedNotes = notes
                    .filter((note: NoteData) => !note.archive)
                    .sort((a: NoteData, b: NoteData) => b.timestamp - a.timestamp)

                console.log('✅ Lead notes fetched successfully:', sortedNotes.length)

                // Return the notes directly instead of an object
                return sortedNotes
            }

            throw new Error(`Lead with ID ${leadId} not found`)
        } catch (error: any) {
            console.error('❌ Error fetching lead notes:', error)
            return rejectWithValue(error.message || 'Failed to fetch lead notes')
        }
    },
)

// Add call result to lead with proper contact status logic
export const addCallResultToLead = createAsyncThunk(
    'leads/addCallResultToLead',
    async (
        {
            leadId,
            callData,
            note,
        }: {
            leadId: string
            callData: Omit<CallResultData, 'timestamp'>
            note?: string
        },
        { rejectWithValue },
    ) => {
        try {
            console.log('📞 Adding call result to lead:', leadId, callData)

            const docRef = doc(db, 'acnLeads', leadId)
            const leadDoc = await getDoc(docRef)

            if (!leadDoc.exists()) {
                throw new Error('Lead not found')
            }

            const leadData = leadDoc.data()
            const existingConnectHistory = leadData.connectHistory || []
            const existingNotes = leadData.notes || []
            const currentContactStatus = leadData.contactStatus || 'not contact'

            const timestamp = Math.floor(Date.now() / 1000) // Unix timestamp in seconds

            // Create new connect history entry
            const newConnectHistory: CallResultData = {
                ...callData,
                timestamp,
            }

            const updatedConnectHistory = [...existingConnectHistory, newConnectHistory]

            // Create note entry if note is provided
            let updatedNotes = existingNotes
            if (note && note.trim()) {
                const newNote: NoteData = {
                    kamId: leadData.kamId || 'UNKNOWN',
                    note: note.trim(),
                    source: `direct - ${callData.connectMedium}`,
                    timestamp,
                    archive: false,
                }
                updatedNotes = [...existingNotes, newNote]
            }

            // Determine new contact status based on connection result and current status
            let newContactStatus = currentContactStatus

            if (callData.connection === 'connected') {
                // If connected, status becomes 'connected' regardless of previous status
                newContactStatus = 'connected'
            } else {
                // If not connected, handle RNR progression
                if (currentContactStatus === 'not contact') {
                    // First failed attempt: not contact -> rnr-1
                    newContactStatus = 'rnr-1'
                } else if (currentContactStatus.startsWith('rnr-')) {
                    // Extract current RNR number and increment
                    const currentRnrNumber = parseInt(currentContactStatus.split('-')[1])
                    const nextRnrNumber = currentRnrNumber + 1
                    newContactStatus = `rnr-${nextRnrNumber}`
                } else if (currentContactStatus === 'connected') {
                    // If was connected but now not connected, start RNR sequence
                    newContactStatus = 'rnr-1'
                }
            }

            // Update contact status and last tried/connect based on call result
            const updateData: any = {
                connectHistory: updatedConnectHistory,
                notes: updatedNotes,
                contactStatus: newContactStatus,
                lastTried: timestamp,
                lastModified: getCurrentTimestamp(),
            }

            // Update lastConnect only if call was successful
            if (callData.connection === 'connected') {
                updateData.lastConnect = timestamp
            }

            await updateDoc(docRef, updateData)

            console.log('✅ Call result added successfully')
            console.log('📊 Contact status changed from', currentContactStatus, 'to', newContactStatus)

            return {
                leadId,
                callResult: newConnectHistory,
                allConnectHistory: updatedConnectHistory,
                allNotes: updatedNotes,
                updateData,
                previousContactStatus: currentContactStatus,
                newContactStatus,
            }
        } catch (error: any) {
            console.error('❌ Error adding call result:', error)
            return rejectWithValue(error.message || 'Failed to add call result')
        }
    },
)

// Fetch lead with connect history
export const fetchLeadWithConnectHistory = createAsyncThunk(
    'leads/fetchLeadWithConnectHistory',
    async (leadId: string, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching lead with connect history:', leadId)

            const docRef = doc(db, 'acnLeads', leadId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                const connectHistory = data.connectHistory || []

                // Sort connect history by timestamp (newest first)
                const sortedHistory = connectHistory.sort(
                    (a: CallResultData, b: CallResultData) => b.timestamp - a.timestamp,
                )

                console.log('✅ Lead connect history fetched successfully:', sortedHistory.length)
                return { leadId, connectHistory: sortedHistory }
            }

            throw new Error(`Lead with ID ${leadId} not found`)
        } catch (error: any) {
            console.error('❌ Error fetching lead connect history:', error)
            return rejectWithValue(error.message || 'Failed to fetch lead connect history')
        }
    },
)

// Add these interfaces
interface InventoryStatus {
    available: boolean
    delisted: boolean
    hold: boolean
    sold: boolean
}

interface PaymentHistoryItem {
    amount: number
    date: number
    status: string
}

interface ContactHistoryItem {
    timestamp: number
    contactResult: string
    medium: string
    direction: string
}

interface Note {
    kamId: string
    note: string
    source: string
    timestamp: number
    archive: boolean
}

interface IAgent {
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
    source: 'whatsApp' | 'instagram' | 'facebook' | 'referral' | 'direct' | 'meta'
    lastSeen: number
    added: number
    lastModified: number
    extraDetails: string
}

interface AgentVerificationData {
    name: string
    phoneNumber: string
    emailAddress: string
    workAddress: string
    reraId: string
    firmName: string
    firmSize: string
    kamName: string
    kamId: string
    areaOfOperation: string[]
    businessCategory: string[]
}

// Get KAM options from Algolia
export const fetchKAMOptions = createAsyncThunk('leads/fetchKAMOptions', async (_, { rejectWithValue }) => {
    try {
        console.log('🔍 Fetching KAM options from Algolia')

        const kamFacets = await leadSearchService.getFacetValues('kamName')

        console.log('✅ KAM options fetched successfully:', kamFacets.length)
        return kamFacets
    } catch (error: any) {
        console.error('❌ Error fetching KAM options:', error)
        return rejectWithValue(error.message || 'Failed to fetch KAM options')
    }
})

// Verify lead and create agent
export const verifyLeadAndCreateAgent = createAsyncThunk(
    'leads/verifyLeadAndCreateAgent',
    async (
        { leadId, verificationData }: { leadId: string; verificationData: AgentVerificationData },
        { rejectWithValue },
    ) => {
        try {
            console.log('🔄 Starting lead verification and agent creation:', leadId)

            // Step 1: Get the lead data
            const leadDocRef = doc(db, 'acnLeads', leadId)
            const leadDoc = await getDoc(leadDocRef)

            if (!leadDoc.exists()) {
                throw new Error('Lead not found')
            }

            const leadData = leadDoc.data() as any

            // Step 2: Get next CP ID from admin collection
            const adminDocRef = doc(db, 'acn-admin', 'lastCpId')
            const adminDoc = await getDoc(adminDocRef)

            if (!adminDoc.exists()) {
                throw new Error('Admin document not found')
            }

            const adminData = adminDoc.data()
            const currentCount = adminData.count || 545
            const prefix = adminData.prefix || 'B'
            const label = adminData.label || 'CP'

            const newCpId = `${label}${prefix}${currentCount + 1}`

            // Step 3: Create agent data by mapping lead data
            const timestamp = Math.floor(Date.now() / 1000)

            const agentData: IAgent = {
                cpId: newCpId,
                name: verificationData.name,
                phoneNumber: verificationData.phoneNumber,
                emailAddress: verificationData.emailAddress,
                workAddress: verificationData.workAddress || '',
                reraId: verificationData.reraId || '',
                firmName: verificationData.firmName || '',
                firmSize: parseInt(verificationData.firmSize) || 0,
                areaOfOperation: (verificationData.areaOfOperation as any[]) || [],
                businessCategory: (verificationData.businessCategory as any[]) || [],
                preferedMicromarket: '',
                userType: 'basic',
                activity: 'active',
                agentStatus: leadData.leadStatus || 'not contact yet',
                verified: true,
                verficationDate: timestamp,
                blackListed: false,
                trialUsed: false,
                trialStartedAt: 0,
                noOfinventories: 0,
                inventoryStatus: {
                    available: false,
                    delisted: false,
                    hold: false,
                    sold: false,
                },
                noOfEnquiries: 0,
                noOfrequirements: 0,
                noOfleagalLeads: 0,
                lastEnquiry: 0,
                payStatus: 'will not',
                planExpiry: 0,
                nextRenewal: 0,
                paymentHistory: [],
                monthlyCredits: 0,
                boosterCredits: 0,
                inboundEnqCredits: 0,
                inboundReqCredits: 0,
                contactStatus: leadData.contactStatus || 'not contact',
                contactHistory: leadData.connectHistory || [],
                lastTried: leadData.lastTried || 0,
                kamName: verificationData.kamName,
                kamId: verificationData.kamId,
                notes: leadData.notes || [],
                appInstalled: false,
                communityJoined: leadData.communityJoined || false,
                onBroadcast: leadData.onBroadcast || false,
                onboardingComplete: false,
                source: leadData.source || 'direct',
                lastSeen: 0,
                added: leadData.added || timestamp,
                lastModified: timestamp,
                extraDetails: '',
            }

            // Step 4: Create agent document
            const agentDocRef = doc(db, 'acnAgents', newCpId)
            await setDoc(agentDocRef, agentData)

            // Step 5: Update admin count
            await updateDoc(adminDocRef, {
                count: currentCount + 1,
            })

            // Step 6: Delete the lead
            await deleteDoc(leadDocRef)

            console.log('✅ Lead verified and agent created successfully:', newCpId)

            return {
                leadId,
                agentId: newCpId,
                agentData,
                message: `Agent ${newCpId} created successfully`,
            }
        } catch (error: any) {
            console.error('❌ Error verifying lead and creating agent:', error)
            return rejectWithValue(error.message || 'Failed to verify lead and create agent')
        }
    },
)

// Add these interfaces
interface BulkLeadData {
    Number: string
    Name: string
    Email: string
    'Lead Source': string
}

interface ProcessedLeadData {
    leadId: string
    name: string
    phonenumber: string
    emailAddress: string
    source: string
    kamId: string
    kamName: string
    notes: NoteData[]
    leadStatus: 'not contact yet'
    contactStatus: 'not contact'
    verified: false
    communityJoined: boolean
    onBroadcast: boolean
    blackListed: boolean
    lastTried: number
    lastConnect: number
    added: number
    lastModified: number
}

interface ManualLeadData {
    name: string
    phone: string
    email: string
    leadSource: string
    notes: string
    kamName: string
    kamId: string
}

// Validate CSV data
export const validateCSVData = createAsyncThunk(
    'leads/validateCSVData',
    async (csvData: BulkLeadData[], { rejectWithValue }) => {
        try {
            console.log('🔄 Validating CSV data:', csvData.length, 'rows')

            const criticalErrors: string[] = [] // Only blocking errors
            const warnings: string[] = [] // Non-blocking warnings (duplicates)
            const validatedData: (BulkLeadData & { isDuplicate?: boolean; duplicateType?: string })[] = []
            const duplicateNumbers: string[] = []

            // Helper function to safely convert to string and trim
            const safeStringTrim = (value: any): string => {
                if (value === null || value === undefined) {
                    return ''
                }
                return String(value).trim()
            }

            // Check each row
            for (let i = 0; i < csvData.length; i++) {
                const row = csvData[i]
                const rowErrors: string[] = []
                let isDuplicate = false
                let duplicateType = ''

                // Safely convert all fields to strings
                const phoneNumber = safeStringTrim(row.Number)
                const name = safeStringTrim(row.Name)
                const email = safeStringTrim(row.Email)
                const leadSource = safeStringTrim(row['Lead Source'])

                // **CRITICAL VALIDATION - these will block upload**
                if (!phoneNumber || phoneNumber === '') {
                    rowErrors.push(`Row ${i + 1}: Phone number is required`)
                }
                if (!name || name === '') {
                    rowErrors.push(`Row ${i + 1}: Name is required`)
                }
                if (!leadSource || leadSource === '') {
                    rowErrors.push(`Row ${i + 1}: Lead Source is required`)
                }

                // Phone number format validation
                if (phoneNumber) {
                    let phone = phoneNumber.replace(/\s+/g, '')
                    if (phone.startsWith('+91')) {
                        phone = phone.substring(3)
                    } else if (phone.startsWith('91') && phone.length === 12) {
                        phone = phone.substring(2)
                    }

                    if (!/^\d{10}$/.test(phone)) {
                        rowErrors.push(`Row ${i + 1}: Phone number must be exactly 10 digits`)
                    } else {
                        // **DUPLICATE CHECK - this is a WARNING, not a blocking error**
                        try {
                            const phoneToCheck = phone
                            const phoneWithPrefix = `+91${phone}`
                            const originalPhone = phoneNumber

                            // Check in acnLeads collection
                            const leadsQuery = query(
                                collection(db, 'acnLeads'),
                                where('phonenumber', 'in', [originalPhone, phoneWithPrefix, phoneToCheck]),
                            )
                            const leadsSnapshot = await getDocs(leadsQuery)

                            // Check in acnAgents collection
                            const agentsQuery = query(
                                collection(db, 'acnAgents'),
                                where('phonenumber', 'in', [originalPhone, phoneWithPrefix, phoneToCheck]),
                            )
                            const agentsSnapshot = await getDocs(agentsQuery)

                            if (!leadsSnapshot.empty) {
                                isDuplicate = true
                                duplicateType = 'leads'
                                duplicateNumbers.push(`${phoneNumber} (exists in leads)`)
                                // **Add to warnings, not critical errors**
                                warnings.push(
                                    `Row ${i + 1}: Phone number ${phoneNumber} already exists in leads database`,
                                )
                            } else if (!agentsSnapshot.empty) {
                                isDuplicate = true
                                duplicateType = 'agents'
                                duplicateNumbers.push(`${phoneNumber} (exists in agents)`)
                                // **Add to warnings, not critical errors**
                                warnings.push(
                                    `Row ${i + 1}: Phone number ${phoneNumber} already exists in agents database`,
                                )
                            }
                        } catch (checkError) {
                            console.error('Error checking duplicate for row', i + 1, ':', checkError)
                            // Continue validation even if duplicate check fails
                        }
                    }
                }

                // Email validation (if provided)
                if (email && email !== '') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(email)) {
                        rowErrors.push(`Row ${i + 1}: Invalid email format`)
                    }
                }

                // Lead source validation
                const validSources = [
                    'whatsApp',
                    'instagram',
                    'facebook',
                    'referral',
                    'direct',
                    'whatsapp group',
                    'whatsapp campaign',
                    'classified',
                    'organic,',
                    'meta',
                ]
                if (leadSource && !validSources.includes(leadSource.toLowerCase())) {
                    rowErrors.push(`Row ${i + 1}: Invalid lead source. Valid sources: ${validSources.join(', ')}`)
                }

                // **Add critical errors only (not duplicate warnings)**
                criticalErrors.push(...rowErrors)

                // Add row to validated data with cleaned string values
                validatedData.push({
                    Number: phoneNumber,
                    Name: name,
                    Email: email,
                    'Lead Source': leadSource,
                    isDuplicate,
                    duplicateType,
                })
            }

            // Check for internal duplicates within the CSV
            const phoneMap = new Map()
            validatedData.forEach((row, index) => {
                if (row.Number) {
                    let phone = row.Number.replace(/\s+/g, '')
                    if (phone.startsWith('+91')) {
                        phone = phone.substring(3)
                    } else if (phone.startsWith('91') && phone.length === 12) {
                        phone = phone.substring(2)
                    }

                    if (phoneMap.has(phone)) {
                        const firstOccurrence = phoneMap.get(phone)
                        // **This is a critical error - internal duplicates**
                        criticalErrors.push(
                            `Row ${index + 1}: Duplicate phone number within CSV (first occurrence at row ${firstOccurrence + 1})`,
                        )
                        // Mark both as duplicates
                        validatedData[index].isDuplicate = true
                        validatedData[index].duplicateType = 'csv'
                        validatedData[firstOccurrence].isDuplicate = true
                        validatedData[firstOccurrence].duplicateType = 'csv'
                    } else {
                        phoneMap.set(phone, index)
                    }
                }
            })

            // **Only reject if there are CRITICAL errors (not duplicate warnings)**
            if (criticalErrors.length > 0) {
                return rejectWithValue(criticalErrors.join('\n'))
            }

            // Filter out duplicates for actual processing
            const cleanData = validatedData.filter((row) => !row.isDuplicate)

            console.log(
                '✅ CSV validation successful:',
                cleanData.length,
                'valid rows,',
                duplicateNumbers.length,
                'duplicates found',
            )

            return {
                validatedData: cleanData,
                allData: validatedData, // Include all data for preview
                duplicateInfo: {
                    count: duplicateNumbers.length,
                    numbers: duplicateNumbers,
                },
                warnings: warnings, // Include warnings for display
            }
        } catch (error: any) {
            console.error('❌ Error validating CSV data:', error)
            return rejectWithValue(error.message || 'Failed to validate CSV data')
        }
    },
)

// Add bulk leads
export const addBulkLeads = createAsyncThunk(
    'leads/addBulkLeads',
    async (validatedData: BulkLeadData[], { rejectWithValue }) => {
        try {
            console.log('🔄 Adding bulk leads:', validatedData.length, 'leads')

            const timestamp = Math.floor(Date.now() / 1000)
            const processedLeads: ProcessedLeadData[] = []
            const duplicateNumbers: string[] = []
            const skippedCount = { leads: 0, agents: 0 }

            // Get starting lead ID from admin collection
            const adminDocRef = doc(db, 'acn-admin', 'lastLeadId')
            const adminDoc = await getDoc(adminDocRef)

            if (!adminDoc.exists()) {
                throw new Error('Admin lead ID document not found')
            }

            const adminData = adminDoc.data()
            let currentCount = adminData.count || 100
            const prefix = adminData.prefix || 'A'
            const label = adminData.label || 'LD'

            // Process each lead
            for (const leadData of validatedData) {
                // Format phone number for checking
                let phoneToCheck = leadData.Number.replace(/\s+/g, '')
                if (phoneToCheck.startsWith('+91')) {
                    phoneToCheck = phoneToCheck.substring(3)
                } else if (phoneToCheck.startsWith('91') && phoneToCheck.length === 12) {
                    phoneToCheck = phoneToCheck.substring(2)
                }

                // Check for duplicate phone numbers
                try {
                    // Check in acnLeads collection with original format
                    const leadsQuery = query(collection(db, 'acnLeads'), where('phonenumber', '==', leadData.Number))
                    const leadsSnapshot = await getDocs(leadsQuery)

                    // Check with +91 prefix
                    const phoneWithPrefix = `+91${phoneToCheck}`
                    const leadsQueryWithPrefix = query(
                        collection(db, 'acnLeads'),
                        where('phonenumber', '==', phoneWithPrefix),
                    )
                    const leadsSnapshotWithPrefix = await getDocs(leadsQueryWithPrefix)

                    // Check without prefix (just 10 digits)
                    const leadsQueryWithoutPrefix = query(
                        collection(db, 'acnLeads'),
                        where('phonenumber', '==', phoneToCheck),
                    )
                    const leadsSnapshotWithoutPrefix = await getDocs(leadsQueryWithoutPrefix)

                    // Check in acnAgents collection with original format
                    const agentsQuery = query(collection(db, 'acnAgents'), where('phonenumber', '==', leadData.Number))
                    const agentsSnapshot = await getDocs(agentsQuery)

                    // Check agents with +91 prefix
                    const agentsQueryWithPrefix = query(
                        collection(db, 'acnAgents'),
                        where('phonenumber', '==', phoneWithPrefix),
                    )
                    const agentsSnapshotWithPrefix = await getDocs(agentsQueryWithPrefix)

                    // Check agents without prefix
                    const agentsQueryWithoutPrefix = query(
                        collection(db, 'acnAgents'),
                        where('phonenumber', '==', phoneToCheck),
                    )
                    const agentsSnapshotWithoutPrefix = await getDocs(agentsQueryWithoutPrefix)

                    if (!leadsSnapshot.empty || !leadsSnapshotWithPrefix.empty || !leadsSnapshotWithoutPrefix.empty) {
                        console.log(`⚠️ Phone number ${leadData.Number} already exists in acnLeads`)
                        duplicateNumbers.push(`${leadData.Number} (exists in leads)`)
                        skippedCount.leads++
                        continue // Skip this lead
                    }

                    if (
                        !agentsSnapshot.empty ||
                        !agentsSnapshotWithPrefix.empty ||
                        !agentsSnapshotWithoutPrefix.empty
                    ) {
                        console.log(`⚠️ Phone number ${leadData.Number} already exists in acnAgents`)
                        duplicateNumbers.push(`${leadData.Number} (exists in agents)`)
                        skippedCount.agents++
                        continue // Skip this lead
                    }
                } catch (checkError) {
                    console.error('Error checking duplicate phone:', checkError)
                    // Continue processing if check fails
                }

                currentCount++
                const leadId = `${label}${prefix}${currentCount}`

                // Check if phone exists in acnPipeline for KAM details
                let kamId = ''
                let kamName = ''

                try {
                    const pipelineDocRef = doc(db, 'acnPipeline', leadData.Number)
                    const pipelineDoc = await getDoc(pipelineDocRef)

                    if (pipelineDoc.exists()) {
                        const pipelineData = pipelineDoc.data()
                        kamId = pipelineData.kamId || ''
                        kamName = pipelineData.kamName || ''
                    }
                } catch (error) {
                    console.log('Pipeline doc not found for:', leadData.Number)
                }

                const newLead: ProcessedLeadData = {
                    leadId,
                    name: leadData.Name,
                    phonenumber: leadData.Number,
                    emailAddress: leadData.Email,
                    source: leadData['Lead Source'],
                    kamId,
                    kamName,
                    notes: [],
                    leadStatus: 'not contact yet',
                    contactStatus: 'not contact',
                    verified: false,
                    communityJoined: false,
                    onBroadcast: false,
                    blackListed: false,
                    lastTried: 0,
                    lastConnect: 0,
                    added: timestamp,
                    lastModified: timestamp,
                }

                // Add lead to Firestore
                const leadDocRef = doc(db, 'acnLeads', leadId)
                await setDoc(leadDocRef, newLead)

                processedLeads.push(newLead)
            }

            // Update admin count only if we added leads
            if (processedLeads.length > 0) {
                await updateDoc(adminDocRef, {
                    count: currentCount,
                })
            }

            // Provide detailed success message
            let message = `✅ Successfully added ${processedLeads.length} leads`
            if (duplicateNumbers.length > 0) {
                message += `\n⚠️ Skipped ${duplicateNumbers.length} duplicate numbers`
            }

            console.log(message)
            return {
                leads: processedLeads,
                duplicates: duplicateNumbers,
                skippedCount,
                message,
            }
        } catch (error: any) {
            console.error('❌ Error adding bulk leads:', error)
            return rejectWithValue(error.message || 'Failed to add bulk leads')
        }
    },
)

// Add manual lead
export const addManualLead = createAsyncThunk(
    'leads/addManualLead',
    async (manualData: ManualLeadData, { rejectWithValue }) => {
        try {
            console.log('🔄 Adding manual lead:', manualData.name)

            const timestamp = Math.floor(Date.now() / 1000)

            // Get next lead ID from admin collection
            const adminDocRef = doc(db, 'acn-admin', 'lastLeadId')
            const adminDoc = await getDoc(adminDocRef)

            if (!adminDoc.exists()) {
                throw new Error('Admin lead ID document not found')
            }

            const adminData = adminDoc.data()
            const currentCount = adminData.count || 100
            const prefix = adminData.prefix || 'A'
            const label = adminData.label || 'LD'

            const leadId = `${label}${prefix}${currentCount + 1}`

            // Format phone number
            let phone = manualData.phone.replace(/\s+/g, '')
            if (!phone.startsWith('+91')) {
                if (phone.startsWith('91') && phone.length === 12) {
                    phone = `+${phone}`
                } else {
                    phone = `+91${phone}`
                }
            }

            // Create notes array if notes provided
            const notes: NoteData[] = []
            if (manualData.notes.trim()) {
                notes.push({
                    kamId: manualData.kamId,
                    note: manualData.notes.trim(),
                    source: 'direct',
                    timestamp,
                    archive: false,
                })
            }

            const newLead: ProcessedLeadData = {
                leadId,
                name: manualData.name,
                phonenumber: phone,
                emailAddress: manualData.email,
                source: manualData.leadSource,
                kamId: manualData.kamId,
                kamName: manualData.kamName,
                notes,
                leadStatus: 'not contact yet',
                contactStatus: 'not contact',
                verified: false,
                communityJoined: false,
                onBroadcast: false,
                blackListed: false,
                lastTried: 0,
                lastConnect: 0,
                added: timestamp,
                lastModified: timestamp,
            }

            // Add lead to Firestore
            const leadDocRef = doc(db, 'acnLeads', leadId)
            await setDoc(leadDocRef, newLead)

            // Update admin count
            await updateDoc(adminDocRef, {
                count: currentCount + 1,
            })

            console.log('✅ Manual lead added successfully:', leadId)
            return newLead
        } catch (error: any) {
            console.error('❌ Error adding manual lead:', error)
            return rejectWithValue(error.message || 'Failed to add manual lead')
        }
    },
)

// Add this new thunk to your leadsService file
export const validateLeadData = createAsyncThunk(
    'leads/validateLeadData',
    async (leadData: { phone: string; isManual?: boolean }, { rejectWithValue }) => {
        try {
            console.log('🔄 Validating lead data:', leadData.phone)

            // Format phone number for checking
            let phone = leadData.phone.replace(/\s+/g, '')
            if (!phone.startsWith('+91')) {
                if (phone.startsWith('91') && phone.length === 12) {
                    phone = `+${phone}`
                } else {
                    phone = `+91${phone}`
                }
            }

            const phoneToCheck = phone.replace(/^\+91/, '')

            // Check in acnLeads collection
            const leadsQuery = query(collection(db, 'acnLeads'), where('phonenumber', '==', phone))
            const leadsSnapshot = await getDocs(leadsQuery)

            // Also check without +91 prefix
            const leadsQueryWithoutPrefix = query(collection(db, 'acnLeads'), where('phonenumber', '==', phoneToCheck))
            const leadsSnapshotWithoutPrefix = await getDocs(leadsQueryWithoutPrefix)

            // Check in acnAgents collection
            const agentsQuery = query(collection(db, 'acnAgents'), where('phonenumber', '==', phone))
            const agentsSnapshot = await getDocs(agentsQuery)

            // Also check agents without +91 prefix
            const agentsQueryWithoutPrefix = query(
                collection(db, 'acnAgents'),
                where('phonenumber', '==', phoneToCheck),
            )
            const agentsSnapshotWithoutPrefix = await getDocs(agentsQueryWithoutPrefix)

            if (!leadsSnapshot.empty || !leadsSnapshotWithoutPrefix.empty) {
                return rejectWithValue(`Phone number ${phone} already exists in leads database`)
            }

            if (!agentsSnapshot.empty || !agentsSnapshotWithoutPrefix.empty) {
                return rejectWithValue(`Phone number ${phone} already exists in agents database`)
            }

            console.log('✅ Phone number validation successful')
            return { phone, isValid: true }
        } catch (error: any) {
            console.error('❌ Error validating lead data:', error)
            return rejectWithValue(error.message || 'Failed to validate lead data')
        }
    },
)
