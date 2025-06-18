import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { Lead } from './types'

class LeadService {
    private collectionName = 'canvashomesLeads'

    /**
     * Fetch a lead document by its leadId
     */
    async getById(leadId: string): Promise<Lead | null> {
        try {
            if (!leadId || typeof leadId !== 'string' || leadId.trim() === '') {
                console.error('Invalid leadId provided:', leadId)
                return null
            }

            const leadDoc = await getDoc(doc(db, this.collectionName, leadId.trim()))

            if (leadDoc.exists()) {
                const data = leadDoc.data()
                return { leadId: leadDoc.id, ...data } as Lead
            } else {
                return null
            }
        } catch (error) {
            console.error('Error fetching lead:', error)
            throw new Error(`Failed to fetch lead: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Fetch all leads with optional filtering based on agentId, stage, leadState, or tag.
     * Results are ordered by 'added' timestamp in descending order.
     */
    async getAll(filters?: { agentId?: string; stage?: string; leadState?: string; tag?: string }): Promise<Lead[]> {
        try {
            let q = query(collection(db, this.collectionName), orderBy('added', 'desc'))

            // Apply filters dynamically
            if (filters?.agentId) {
                q = query(q, where('agentId', '==', filters.agentId))
            }
            if (filters?.stage) {
                q = query(q, where('stage', '==', filters.stage))
            }
            if (filters?.leadState) {
                q = query(q, where('leadState', '==', filters.leadState))
            }
            if (filters?.tag) {
                q = query(q, where('tag', '==', filters.tag))
            }

            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map((doc) => ({
                leadId: doc.id,
                ...doc.data(),
            })) as Lead[]
        } catch (error) {
            console.error('Error fetching leads:', error)
            throw error
        }
    }

    /**
     * Create a new lead with a unique sequential leadId (e.g., lead001, lead002, ...)
     */
    async create(leadData: Omit<Lead, 'leadId' | 'added' | 'lastModified'>): Promise<string> {
        try {
            // Get the most recent lead to determine the next leadId
            const q = query(collection(db, this.collectionName), orderBy('leadId', 'desc'), limit(1))
            const snapshot = await getDocs(q)

            let nextLeadId = 'lead001'

            if (!snapshot.empty) {
                const lastLeadId = snapshot.docs[0].data().leadId
                const lastNumber = parseInt(lastLeadId.replace('lead', ''))
                const newNumber = lastNumber + 1
                nextLeadId = `lead${newNumber.toString().padStart(3, '0')}`
            }

            // Construct new lead object with timestamps
            const newLead = {
                ...leadData,
                leadId: nextLeadId,
                added: Date.now(),
                lastModified: Date.now(),
            }

            await setDoc(doc(db, this.collectionName, nextLeadId), newLead)

            return nextLeadId
        } catch (error) {
            console.error('Error creating lead:', error)
            throw error
        }
    }

    /**
     * Update an existing lead by its ID.
     * Automatically updates the 'lastModified' timestamp.
     */
    async update(leadId: string, updates: Partial<Lead>): Promise<void> {
        try {
            if (!leadId || typeof leadId !== 'string' || leadId.trim() === '') {
                throw new Error('Invalid leadId provided for update')
            }

            const updateData = {
                ...updates,
                lastModified: Date.now(),
            }

            await updateDoc(doc(db, this.collectionName, leadId.trim()), updateData)
        } catch (error) {
            console.error('Error updating lead:', error)
            throw error
        }
    }

    /**
     * Delete a lead by its leadId.
     */
    async delete(leadId: string): Promise<void> {
        try {
            if (!leadId || typeof leadId !== 'string' || leadId.trim() === '') {
                throw new Error('Invalid leadId provided for deletion')
            }

            await deleteDoc(doc(db, this.collectionName, leadId.trim()))
        } catch (error) {
            console.error('Error deleting lead:', error)
            throw error
        }
    }
}

export const leadService = new LeadService()
