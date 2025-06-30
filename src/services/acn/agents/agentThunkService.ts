import { createAsyncThunk } from '@reduxjs/toolkit'
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    getDoc,
    setDoc,
    onSnapshot,
    increment,
    arrayUnion,
} from 'firebase/firestore'
import { db } from '../../../firebase'
import type { IInventory, IRequirement, IAgent } from '../../../data_types/acn/types'
import { getUnixDateTime } from '../../../components/helper/getUnixDateTime'
import { formatPhoneNumber } from '../../../components/helper/formatPhone'

interface AgentDetailsResponse {
    inventories: IInventory[]
    requirements: IRequirement[]
    enquiries: any[]
    qc: any[]
    error?: string
}

interface FetchAgentDetailsParams {
    agentId: string
    propertyType: 'Resale' | 'Rental'
}

interface AgentData {
    cpId: string
    name: string
    phoneNumber: string
    kamId: string
    kamName: string
    workAddress: string
    // Add other agent fields as needed
}

// Define CallResultData type
interface CallResultData {
    connection: string
    connectMedium: string
    [key: string]: any // Add additional fields as needed
    timestamp: number
}

// Define NoteData type if not already defined
interface NoteData {
    name: string
    kamId: string
    note: string
    source: string
    timestamp: number
    archive: boolean
}

export const upgradeUserPlan = createAsyncThunk(
    'agents/upgradeUserPlan',
    async ({ cpId }: { cpId: string }, { rejectWithValue }) => {
        try {
            console.log('🔄 Upgrading user plan for:', cpId)

            const agentRef = doc(db, 'acnAgents', cpId)
            const agentSnapshot = await getDoc(agentRef)

            if (!agentSnapshot.exists()) {
                throw new Error('Agent not found')
            }

            const now = getUnixDateTime() // current unix timestamp in seconds
            const currentData = agentSnapshot.data()

            const updates = {
                nextRenewal: now + 2592000, // +30 days
                planExpiry: now + 31536000, // +1 year
                userType: 'premium',
                monthlyCredits: 100,
                lastModified: now,
            }

            await updateDoc(agentRef, updates)

            console.log('✅ User plan upgraded successfully')

            return {
                cpId,
                updates,
                updatedAgent: {
                    ...currentData,
                    ...updates,
                },
            }
        } catch (error: any) {
            console.error('❌ Error upgrading user plan:', error)
            return rejectWithValue(error.message || 'Failed to upgrade user plan')
        }
    },
)

export const fetchAgentByCpId = createAsyncThunk(
    'agents/fetchAgentByCpId',
    async (cpId: string, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching agent by cpId:', cpId)

            const agentsRef = collection(db, 'acnAgents')
            const agentQuery = query(agentsRef, where('cpId', '==', cpId))
            const agentSnapshot = await getDocs(agentQuery)

            if (agentSnapshot.empty) {
                throw new Error('Agent not found')
            }

            const agentDoc = agentSnapshot.docs[0]
            const agentData = agentDoc.data() as IAgent
            console.log('✅ Agent found:', agentData)

            return agentData
        } catch (error: any) {
            console.error('❌ Error fetching agent:', error)
            return rejectWithValue(error.message || 'Failed to fetch agent')
        }
    },
)

export const listenToAgentUpdates = (cpId: string, dispatch: any) => {
    const agentsRef = collection(db, 'acnAgents')
    const agentQuery = query(agentsRef, where('cpId', '==', cpId))

    return onSnapshot(
        agentQuery,
        (snapshot) => {
            if (!snapshot.empty) {
                const agentDoc = snapshot.docs[0]
                const agentData = agentDoc.data() as IAgent
                dispatch({ type: 'agents/fetchAgentByCpId/fulfilled', payload: agentData })
            }
        },
        (error) => {
            console.error('❌ Error listening to agent updates:', error)
        },
    )
}

export const fetchAgentByPhone = createAsyncThunk(
    'agents/fetchAgentByPhone',
    async (phoneNumber: string, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching agent by phone:', phoneNumber)

            const cleanedPhone = formatPhoneNumber(phoneNumber)

            const agentsRef = collection(db, 'acnAgents')
            const agentQuery = query(agentsRef, where('phoneNumber', '==', cleanedPhone))
            const agentSnapshot = await getDocs(agentQuery)

            if (agentSnapshot.empty) {
                throw new Error('Agent not found with this phone number')
            }

            const agentDoc = agentSnapshot.docs[0]
            const agentData = agentDoc.data() as AgentData

            console.log('✅ Agent found:', agentData)

            // Return the agent details
            return {
                cpId: agentData.cpId,
                name: agentData.name,
                phoneNumber: agentData.phoneNumber,
                kamId: agentData.kamId,
                kamName: agentData.kamName,
            }
        } catch (error: any) {
            console.error('❌ Error fetching agent:', error)
            return rejectWithValue(error.message || 'Failed to fetch agent')
        }
    },
)

export const addCallResultToAgent = createAsyncThunk(
    'agents/addCallResultToAgent',
    async (
        {
            cpId,
            callData,
            note,
            name,
            kamId,
        }: {
            cpId: string
            callData: Omit<CallResultData, 'timestamp'>
            note?: string
            name: string
            kamId: string
        },
        { rejectWithValue },
    ) => {
        try {
            console.log('📞 Adding call result to agent:', cpId, callData)

            const docRef = doc(db, 'acnAgents', cpId)
            const agentDoc = await getDoc(docRef)

            if (!agentDoc.exists()) {
                throw new Error('Agent not found')
            }

            const agentData = agentDoc.data()

            // Add proper type checks
            const existingConnectHistory = Array.isArray(agentData?.connectHistory) ? agentData.connectHistory : []

            const existingNotes = Array.isArray(agentData?.notes) ? agentData.notes : []

            const currentContactStatus =
                typeof agentData?.contactStatus === 'string' ? agentData.contactStatus.toLowerCase() : 'not contact'

            const timestamp = getUnixDateTime() // Unix timestamp in seconds

            // Create new connect history entry
            const newConnectHistory: CallResultData = {
                connection: callData.connection,
                connectMedium: callData.connectMedium,
                ...callData,
                timestamp,
            }

            const updatedConnectHistory = [...existingConnectHistory, newConnectHistory]

            // Create note entry if note is provided
            let updatedNotes = existingNotes
            if (note && note.trim()) {
                const newNote: NoteData = {
                    name: name || 'Unknown',
                    kamId: kamId || 'UNKNOWN',
                    note: note.trim(),
                    source: `direct - ${callData?.connectMedium || 'unknown'}`,
                    timestamp,
                    archive: false,
                }
                updatedNotes = [...existingNotes, newNote]
            }

            // Determine new contact status based on connection result and current status
            console.log(currentContactStatus, 'here')
            let newContactStatus = currentContactStatus

            if (callData?.connection === 'connected') {
                // If connected, status becomes 'connected' regardless of previous status
                newContactStatus = 'connected'
            } else if (callData?.connection === 'not connected') {
                // If not connected, handle RNR progression
                if (currentContactStatus === 'not contact') {
                    // First failed attempt: not contact -> rnr-1
                    newContactStatus = 'rnr-1'
                } else if (typeof currentContactStatus === 'string' && currentContactStatus.startsWith('rnr-')) {
                    // Extract current RNR number and increment
                    try {
                        const rnrParts = currentContactStatus.split('-')
                        if (rnrParts.length === 2) {
                            const currentRnrNumber = parseInt(rnrParts[1])
                            if (!isNaN(currentRnrNumber)) {
                                const nextRnrNumber = currentRnrNumber + 1
                                newContactStatus = `rnr-${nextRnrNumber}`
                            } else {
                                newContactStatus = 'rnr-1'
                            }
                        } else {
                            newContactStatus = 'rnr-1'
                        }
                    } catch (error) {
                        console.warn('Error parsing RNR number, defaulting to rnr-1:', error)
                        newContactStatus = 'rnr-1'
                    }
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
                lastModified: timestamp,
            }

            // Update lastConnect only if call was successful
            if (callData?.connection === 'connected') {
                updateData.lastConnect = timestamp
            }

            await updateDoc(docRef, updateData)

            console.log('✅ Call result added to agent successfully')
            console.log('📊 Contact status changed from', currentContactStatus, 'to', newContactStatus)

            return {
                cpId,
                callResult: newConnectHistory,
                allConnectHistory: updatedConnectHistory,
                allNotes: updatedNotes,
                updateData,
                previousContactStatus: currentContactStatus,
                newContactStatus,
            }
        } catch (error: any) {
            console.error('❌ Error adding call result to agent:', error)
            return rejectWithValue(error?.message || 'Failed to add call result to agent')
        }
    },
)

export const fetchAgentWithConnectHistory = createAsyncThunk(
    'agents/fetchAgentWithConnectHistory',
    async (cpId: string, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching agent connect history for:', cpId)

            const agentDocRef = doc(db, 'acnAgents', cpId)
            const agentDoc = await getDoc(agentDocRef)

            if (!agentDoc.exists()) {
                throw new Error('Agent not found')
            }

            const agentData = agentDoc.data()
            console.log('✅ Agent connect history fetched:', agentData.connectHistory)

            return {
                cpId,
                connectHistory: agentData.connectHistory || [],
                lastConnected: agentData.lastConnected,
                contactStatus: agentData.contactStatus,
            }
        } catch (error: any) {
            console.error('❌ Error fetching agent connect history:', error)
            return rejectWithValue(error.message || 'Failed to fetch agent connect history')
        }
    },
)

export const fetchAgentDetails = createAsyncThunk(
    'agents/fetchAgentDetails',
    async ({ agentId, propertyType }: FetchAgentDetailsParams): Promise<AgentDetailsResponse> => {
        try {
            // Fetch inventories from Firebase
            const inventoriesRef = collection(db, propertyType === 'Resale' ? 'acnProperties' : 'acnRentalInventories')
            const inventoriesQuery = query(inventoriesRef, where('cpId', '==', agentId))
            const inventoriesSnapshot = await getDocs(inventoriesQuery)
            const inventories = inventoriesSnapshot.docs.map((doc) => {
                const data = doc.data()
                return {
                    id: doc.id,
                    propertyId: data.propertyId || doc.id,
                    cpId: data.cpId || agentId,
                    propertyName: data.propertyName || data.propertyName || '',
                    _geoloc: data._geoloc || { lat: 0, lng: 0 },
                    area: data.area || '',
                    micromarket: data.micromarket || '',
                    mapLocation: data.mapLocation || '',
                    assetType: data.assetType || '',
                    unitType: data.unitType || data.configuration || '',
                    subType: data.subType || '',
                    sbua: data.sbua || data.SBUA || 0,
                    carpet: data.carpet || null,
                    plotSize: data.plotSize || null,
                    buildingAge: data.buildingAge || null,
                    floorNo: data.floorNo || data.floorNumber || '',
                    facing: data.facing || '',
                    tenanted: data.tenanted || null,
                    totalAskPrice: data.totalAskPrice || data.rentPerMonthInLakhs || 0,
                    askPricePerSqft: data.askPricePerSqft || 0,
                    status: data.status || '',
                    currentStatus: data.currentStatus || '',
                    builderName: data.builderName || null,
                    handoverDate: data.handoverDate || null,
                    buildingKhata: data.buildingKhata || null,
                    landKhata: data.landKhata || null,
                    ocReceived: data.ocReceived || null,
                    photo: data.photo || data.photos || [],
                    video: data.video || data.videos || [],
                    document: data.document || data.documents || [],
                    driveLink: data.driveLink || '',
                    dateOfInventoryAdded: data.dateOfInventoryAdded || Date.now(),
                    dateOfStatusLastChecked: data.dateOfStatusLastChecked || Date.now(),
                    ageOfInventory: data.ageOfInventory || 0,
                    ageOfStatus: data.ageOfStatus || 0,
                    extraDetails: data.extraDetails || '',
                } as IInventory
            })

            // Fetch requirements from Firebase
            const requirementsRef = collection(
                db,
                propertyType === 'Resale' ? 'acnRequirements' : 'acnRentalRequirements',
            )
            const requirementsQuery = query(requirementsRef, where('cpId', '==', agentId))
            const requirementsSnapshot = await getDocs(requirementsQuery)
            const requirements = requirementsSnapshot.docs.map((doc) => {
                const data = doc.data()
                return {
                    id: doc.id,
                    requirementId: data.requirementId || doc.id,
                    agentNumber: data.agentNumber || '',
                    agentName: data.agentName || '',
                    agentPhoneNumber: data.agentPhoneNumber || '',
                    cpId: data.cpId || agentId,
                    location: data.location || '',
                    area: data.area || '',
                    assetType: propertyType.toLowerCase(),
                    configuration: data.configuration || '1 bhk',
                    _geoloc: data._geoloc || { lat: 0, lng: 0 },
                    micromarket: data.micromarket || '',
                    budget: data.budget || { from: 0, to: 0 },
                    note: data.note || [],
                    notes: data.notes || [],
                    bedrooms: data.bedrooms || '',
                    bathrooms: data.bathrooms || '',
                    parking: data.parking || '',
                    propertyName: data.propertyName || '',
                    extraDetails: data.extraDetails || '',
                    marketValue: data.marketValue || '',
                    requirementStatus: data.requirementStatus || 'open',
                    internalStatus: data.internalStatus || 'not found',
                    added: data.added || Date.now(),
                    lastModified: data.lastModified || Date.now(),
                    matchingProperties: data.matchingProperties || [],
                    kamId: data.kamId || '',
                    kamName: data.kamName || '',
                    kamPhoneNumber: data.kamPhoneNumber || '',
                } as IRequirement
            })

            // Fetch enquiries from Firebase
            const enquiriesRef = collection(db, propertyType === 'Resale' ? 'acnEnquiries' : 'acnRentalEnquiries')
            // Fetch enquiries where agent is either buyer or seller
            const buyerQuery = query(enquiriesRef, where('buyerCpId', '==', agentId))
            const sellerQuery = query(enquiriesRef, where('sellerCpId', '==', agentId))

            const [buyerSnapshot, sellerSnapshot] = await Promise.all([getDocs(buyerQuery), getDocs(sellerQuery)])

            // Combine and deduplicate enquiries
            const buyerEnquiries = buyerSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                assetType: propertyType.toLowerCase(),
            }))

            const sellerEnquiries = sellerSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                assetType: propertyType.toLowerCase(),
            }))

            // Combine and remove duplicates based on enquiryId
            const allEnquiries = [...buyerEnquiries, ...sellerEnquiries]
            const uniqueEnquiries = allEnquiries.filter(
                (enquiry, index, self) => index === self.findIndex((e) => e.id === enquiry.id),
            )

            // Fetch QC data from Firebase
            const qcCollectionName = propertyType === 'Resale' ? 'acnQCInventories' : 'acnRentalQCInventories'
            const qcRef = collection(db, qcCollectionName)
            const qcQuery = query(qcRef, where('cpId', '==', agentId), where('stage', '!=', 'live'))
            const qcSnapshot = await getDocs(qcQuery)
            const qc = qcSnapshot.docs.map((doc) => ({
                id: doc.id,
                qcId: doc.id,
                ...doc.data(),
                assetType: propertyType.toLowerCase(),
            }))

            return {
                inventories,
                requirements,
                enquiries: uniqueEnquiries,
                qc,
            }
        } catch (error) {
            console.error('Error fetching agent details:', error)
            return {
                inventories: [],
                requirements: [],
                enquiries: [],
                qc: [],
                error: error instanceof Error ? error.message : 'Failed to fetch agent details',
            }
        }
    },
)

export const updateAgentStatus = createAsyncThunk(
    'agents/updateAgentStatus',
    async ({ cpId, status }: { cpId: string; status: string }): Promise<{ success: boolean; error?: string }> => {
        try {
            const agentRef = collection(db, 'agents')
            const agentQuery = query(agentRef, where('cpId', '==', cpId))
            const agentSnapshot = await getDocs(agentQuery)

            if (agentSnapshot.empty) {
                throw new Error('Agent not found')
            }

            const agentDoc = agentSnapshot.docs[0]
            await updateDoc(doc(db, 'agents', agentDoc.id), { status })

            return { success: true }
        } catch (error) {
            console.error('Error updating agent status:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update agent status',
            }
        }
    },
)

export const updateAgentKAM = createAsyncThunk(
    'agents/updateAgentKAM',
    async ({
        cpId,
        kamId,
        kamName,
        userRole,
    }: {
        cpId: string
        kamId: string
        kamName: string
        userRole?: string
    }): Promise<{ success: boolean; error?: string }> => {
        try {
            // Check if user has required role
            if (!userRole || (userRole !== 'marketing' && userRole !== 'kamModerator')) {
                return {
                    success: false,
                    error: 'Access denied. Only marketing and KAM moderator roles can update agent KAM.',
                }
            }
            console.log(kamId, 'here 2')

            const agentRef = collection(db, 'acnAgents') // Updated collection name
            const agentQuery = query(agentRef, where('cpId', '==', cpId))
            const agentSnapshot = await getDocs(agentQuery)

            if (agentSnapshot.empty) {
                throw new Error('Agent not found')
            }

            const agentDoc = agentSnapshot.docs[0]
            // Update both kamId and kamName
            await updateDoc(doc(db, 'acnAgents', agentDoc.id), {
                kamId,
                kamName,
            })

            return { success: true }
        } catch (error) {
            console.error('Error updating agent KAM:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update agent KAM',
            }
        }
    },
)

export const updateAgentStatusThunk = createAsyncThunk(
    'agents/updateAgentStatusThunk',
    async ({
        cpId,
        agentStatus,
    }: {
        cpId: string
        agentStatus: string
    }): Promise<{ success: boolean; error?: string }> => {
        try {
            const agentRef = collection(db, 'acnAgents')
            const agentQuery = query(agentRef, where('cpId', '==', cpId))
            const agentSnapshot = await getDocs(agentQuery)

            if (agentSnapshot.empty) {
                throw new Error('Agent not found')
            }

            const agentDoc = agentSnapshot.docs[0]
            await updateDoc(doc(db, 'acnAgents', agentDoc.id), { agentStatus })

            return { success: true }
        } catch (error) {
            console.error('Error updating agent status:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update agent status',
            }
        }
    },
)

export const updateAgentPayStatusThunk = createAsyncThunk(
    'agents/updateAgentPayStatusThunk',
    async ({ cpId, payStatus }: { cpId: string; payStatus: string }): Promise<{ success: boolean; error?: string }> => {
        try {
            const agentRef = collection(db, 'acnAgents')
            const agentQuery = query(agentRef, where('cpId', '==', cpId))
            const agentSnapshot = await getDocs(agentQuery)

            if (agentSnapshot.empty) {
                throw new Error('Agent not found')
            }

            const agentDoc = agentSnapshot.docs[0]
            await updateDoc(doc(db, 'acnAgents', agentDoc.id), { payStatus })

            return { success: true }
        } catch (error) {
            console.error('Error updating agent pay status:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update agent pay status',
            }
        }
    },
)

export const fetchAgentRequirementFilters = createAsyncThunk(
    'agents/fetchAgentRequirementFilters',
    async ({
        agentId,
        propertyType,
    }: {
        agentId: string
        propertyType: 'Resale' | 'Rental'
    }): Promise<{
        requirementStatuses: string[]
        internalStatuses: string[]
    }> => {
        try {
            const requirementsRef = collection(
                db,
                propertyType === 'Resale' ? 'acnRequirements' : 'acnRentalRequirements',
            )
            const requirementsQuery = query(requirementsRef, where('cpId', '==', agentId))
            const requirementsSnapshot = await getDocs(requirementsQuery)

            const requirements = requirementsSnapshot.docs.map((doc) => doc.data())

            // Extract unique values for filters
            const requirementStatuses = [...new Set(requirements.map((req) => req.requirementStatus).filter(Boolean))]
            const internalStatuses = [...new Set(requirements.map((req) => req.internalStatus).filter(Boolean))]

            return {
                requirementStatuses,
                internalStatuses,
            }
        } catch (error) {
            console.error('Error fetching agent requirement filters:', error)
            return {
                requirementStatuses: [],
                internalStatuses: [],
            }
        }
    },
)

export const updateEnquiryStatusThunk = createAsyncThunk(
    'agents/updateEnquiryStatus',
    async ({
        enquiryId,
        status,
        propertyType,
    }: {
        enquiryId: string
        status: string
        propertyType: 'Resale' | 'Rental'
    }): Promise<{ success: boolean; error?: string }> => {
        try {
            const enquiryRef = collection(db, propertyType === 'Resale' ? 'acnEnquiries' : 'acnRentalEnquiries')
            const enquiryQuery = query(enquiryRef, where('enquiryId', '==', enquiryId))
            const enquirySnapshot = await getDocs(enquiryQuery)

            if (enquirySnapshot.empty) {
                throw new Error('Enquiry not found')
            }

            const enquiryDoc = enquirySnapshot.docs[0]
            await updateDoc(doc(db, propertyType === 'Resale' ? 'acnEnquiries' : 'acnRentalEnquiries', enquiryDoc.id), {
                status,
                lastModified: Date.now(),
            })

            return { success: true }
        } catch (error) {
            console.error('Error updating enquiry status:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update enquiry status',
            }
        }
    },
)

interface Note {
    kamId: string
    note: string
    source: string
    timestamp: number
    archive: boolean
}

export const addNoteToAgent = createAsyncThunk(
    'agents/addNoteToAgent',
    async (
        { cpId, noteData }: { cpId: string; noteData: { kamId: string; note: string; source: string; archive: false } },
        { rejectWithValue },
    ) => {
        try {
            console.log('📝 Adding note to agent:', cpId, noteData)

            const docRef = doc(db, 'acnAgents', cpId)
            const agentDoc = await getDoc(docRef)

            if (!agentDoc.exists()) {
                throw new Error('Agent not found')
            }

            const agentData = agentDoc.data()
            const existingNotes = agentData.notes || []

            const newNote: Note = {
                ...noteData,
                timestamp: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
                archive: false,
            }

            const updatedNotes = [...existingNotes, newNote]

            await updateDoc(docRef, {
                notes: updatedNotes,
                lastModified: Date.now(),
            })

            console.log('✅ Note added to agent successfully')
            return { cpId, note: newNote, allNotes: updatedNotes }
        } catch (error: any) {
            console.error('❌ Error adding note to agent:', error)
            return rejectWithValue(error.message || 'Failed to add note to agent')
        }
    },
)

export const fetchAgentWithNotes = createAsyncThunk(
    'agents/fetchAgentWithNotes',
    async (cpId: string, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching agent with notes:', cpId)

            const docRef = doc(db, 'acnAgents', cpId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                const notes = data.notes || []

                // Sort notes by timestamp (newest first) and filter out archived notes
                const sortedNotes = notes
                    .filter((note: any) => !note.archive)
                    .sort((a: any, b: any) => b.timestamp - a.timestamp)

                console.log('✅ Agent notes fetched successfully:', sortedNotes.length)

                // Return the notes directly
                return sortedNotes
            }

            throw new Error(`Agent with ID ${cpId} not found`)
        } catch (error: any) {
            console.error('❌ Error fetching agent notes:', error)
            return rejectWithValue(error.message || 'Failed to fetch agent notes')
        }
    },
)

export const addAgentWithVerification = createAsyncThunk(
    'agents/addAgentWithVerification',
    async (
        { verificationData }: { verificationData: any }, // Use your AgentVerificationData type here
        { rejectWithValue },
    ) => {
        try {
            console.log('🔄 Starting agent creation via verification modal')

            // Step 1: Get next CP ID from admin collection
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

            let formattedPhoneNumber = verificationData.phoneNumber
            if (formattedPhoneNumber && !formattedPhoneNumber.startsWith('+91')) {
                // Remove any existing country code or leading zeros
                formattedPhoneNumber = formattedPhoneNumber.replace(/^(\+91|91|0+)/, '')
                formattedPhoneNumber = `+91${formattedPhoneNumber}`
            }

            // Step 2: Prepare agent data
            const timestamp = Math.floor(Date.now() / 1000)

            const agentData = {
                cpId: newCpId,
                name: verificationData.name,
                phoneNumber: formattedPhoneNumber,
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
                agentStatus: 'not contact yet',
                verified: true,
                verficationDate: timestamp,
                blackListed: false,
                trialUsed: false,
                trialStartedAt: 0,
                noOfInventories: 0,
                inventoryStatus: {
                    available: false,
                    delisted: false,
                    hold: false,
                    sold: false,
                },
                noOfEnquiries: 0,
                noOfRequirements: 0,
                noOfLegalLeads: 0,
                lastEnquiry: 0,
                payStatus: 'will not',
                planExpiry: 0,
                nextRenewal: 0,
                paymentHistory: [],
                monthlyCredits: 0,
                boosterCredits: 0,
                inboundEnqCredits: 0,
                inboundReqCredits: 0,
                contactStatus: 'not contact',
                connectHistory: verificationData.connectHistory,
                leadId: verificationData.leadId,
                lastTried: 0,
                kamName: verificationData.kamName,
                kamId: verificationData.kamId,
                notes: [],
                appInstalled: false,
                communityJoined: false,
                onBroadcast: false,
                source: 'direct',
                lastSeen: 0,
                added: timestamp,
                lastModified: timestamp,
                extraDetails: '',
            }

            // Step 3: Create agent document
            const agentDocRef = doc(db, 'acnAgents', newCpId)
            await setDoc(agentDocRef, agentData)

            // Step 4: Update admin count
            await updateDoc(adminDocRef, {
                count: currentCount + 1,
            })

            console.log('✅ Agent created successfully:', newCpId)

            return {
                agentId: newCpId,
                agentData,
                message: `Agent ${newCpId} created successfully`,
            }
        } catch (error: any) {
            console.error('❌ Error creating agent:', error)
            return rejectWithValue(error.message || 'Failed to create agent')
        }
    },
)

export const updateAgentDetailsThunk = createAsyncThunk(
    'agents/updateAgentDetailsThunk',
    async ({ cpId, agentDetails }: { cpId: string; agentDetails: IAgent }) => {
        try {
            console.log(cpId, agentDetails, 'cpId, agentDetails')
            const agentRef = doc(db, 'acnAgents', cpId)
            const agentSnapshot = await getDoc(agentRef)
            console.log(agentSnapshot, 'agentSnapshot')
            if (agentSnapshot.exists()) {
                await updateDoc(agentRef, {
                    ...agentDetails,
                    lastModified: Date.now(),
                })
                console.log('agent updated')
            }
        } catch (error) {
            console.error('Error updating agent details:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update agent details',
            }
        }
    },
)

export const updateAgentCreditsThunk = createAsyncThunk(
    'agents/updateAgentCreditsThunk',
    async ({ cpId, credits }: { cpId: string; credits: number }) => {
        console.log(cpId, credits, 'cpId, credits')
        try {
            const agentRef = doc(db, 'acnAgents', cpId)
            const agentSnapshot = await getDoc(agentRef)
            if (agentSnapshot.exists()) {
                await updateDoc(agentRef, {
                    monthlyCredits: credits,
                    lastModified: Date.now(),
                })
                console.log('agent credits updated')
            }
        } catch (error) {
            console.error('Error updating agent credits:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update agent credits',
            }
        }
    },
)

export const updateAgentInventoryCountThunk = createAsyncThunk(
    'agents/updateAgentInventoryCountThunk',
    async ({ cpId, propertyId }: { cpId: string; propertyId: string }) => {
        console.log(cpId, 'cpId')
        try {
            const agentRef = doc(db, 'acnAgents', cpId)
            const agentSnapshot = await getDoc(agentRef)
            if (agentSnapshot.exists()) {
                await updateDoc(agentRef, {
                    myInventories: arrayUnion(propertyId),
                    noOfInventories: increment(1),
                    lastModified: Date.now(),
                })
                console.log('agent inventory count updated')
            }
        } catch (error) {
            console.error('Error updating agent inventory count:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update agent inventory count',
            }
        }
    },
)
