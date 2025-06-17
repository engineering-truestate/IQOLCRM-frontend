// store/services/acn/leads/leadsService.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase'
import { type ILead } from '../../../services/acn/leads/algoliaLeadsService'

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
    connection: 'connected' | 'not connected'
    connectMedium: 'on call' | 'on whatsapp'
    direction: 'inbound' | 'outbound'
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
                return { leadId, notes: sortedNotes }
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
