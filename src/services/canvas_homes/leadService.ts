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

    async getById(leadId: string): Promise<Lead | null> {
        try {
            // Validate leadId
            if (!leadId || typeof leadId !== 'string' || leadId.trim() === '') {
                console.error('Invalid leadId provided:', leadId)
                return null
            }

            console.log('Fetching lead with ID:', leadId)

            const leadDoc = await getDoc(doc(db, this.collectionName, leadId.trim()))

            if (leadDoc.exists()) {
                const data = leadDoc.data()
                console.log('Lead data fetched successfully:', data)
                return { leadId: leadDoc.id, ...data } as Lead
            } else {
                console.log('Lead document does not exist for ID:', leadId)
                return null
            }
        } catch (error) {
            console.error('Error fetching lead:', error)
            throw new Error(`Failed to fetch lead: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async getAll(filters?: { agentId?: string; stage?: string; leadState?: string; tag?: string }): Promise<Lead[]> {
        try {
            let q = query(collection(db, this.collectionName), orderBy('added', 'desc'))

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

    async create(leadData: Omit<Lead, 'leadId' | 'added' | 'lastModified'>): Promise<string> {
        try {
            // Query the collection to get the lead with the highest leadId
            const q = query(collection(db, this.collectionName), orderBy('leadId', 'desc'), limit(1))
            const snapshot = await getDocs(q)

            // Default the leadId to 'lead001' if no leads exist
            let nextLeadId = 'lead001'

            if (!snapshot.empty) {
                // Retrieve the last lead's ID and parse the number from it
                const lastLeadId = snapshot.docs[0].data().leadId
                const lastNumber = parseInt(lastLeadId.replace('lead', '')) // Remove 'lead' and convert to integer
                const newNumber = lastNumber + 1 // Increment the last number
                nextLeadId = `lead${newNumber.toString().padStart(3, '0')}` // Generate the next leadId with padding
            }

            // Prepare the new lead data including the generated leadId and timestamps
            const newLead = {
                ...leadData,
                leadId: nextLeadId,
                added: Date.now(), // Timestamp when the lead is created
                lastModified: Date.now(), // Timestamp when the lead is last modified
            }

            // Save the lead to Firestore with the custom leadId
            await setDoc(doc(db, this.collectionName, nextLeadId), newLead)

            return nextLeadId // Return the generated leadId
        } catch (error) {
            console.error('Error creating lead:', error) // Log any errors
            throw error // Re-throw the error for further handling
        }
    }
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
