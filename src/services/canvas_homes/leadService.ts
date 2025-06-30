import { doc, getDoc, updateDoc, deleteDoc, runTransaction, increment } from 'firebase/firestore'
import { db } from '../../firebase'
import type { Lead } from './types'
import { getUnixDateTime } from '../../components/helper/getUnixDateTime'

class LeadService {
    private collectionName = 'canvashomesLeads'

    /**
     * Fetch a lead document by its leadId
     */
    async getById(leadId: string): Promise<Lead | null> {
        try {
            const leadDoc = await getDoc(doc(db, this.collectionName, leadId))

            if (leadDoc.exists()) {
                return { leadId: leadDoc.id, ...leadDoc.data() } as Lead
            }
            return null
        } catch (error) {
            console.error('Error fetching lead:', error)
            throw new Error(`Failed to fetch lead: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Create a new lead with a unique sequential leadId (e.g., lead01, lead02, etc.)
     */
    async create(leadData: Omit<Lead, 'leadId' | 'added' | 'lastModified'>): Promise<string> {
        try {
            const counterRef = doc(db, 'canvashomesAdmin', 'lastLead')

            const nextLeadId = await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef)
                let currentNumber = 0

                if (counterDoc.exists()) {
                    currentNumber = counterDoc.data().count || 0
                }

                const newNumber = currentNumber + 1
                const newLeadId = `lead${newNumber.toString().padStart(2, '0')}`

                const timestamp = getUnixDateTime()
                const newLead = {
                    ...leadData,
                    leadId: newLeadId,
                    added: timestamp,
                    lastModified: timestamp,
                }

                transaction.set(doc(db, this.collectionName, newLeadId), newLead)
                transaction.update(counterRef, {
                    count: increment(1),
                })

                return newLeadId
            })

            return nextLeadId
        } catch (error) {
            console.error('Error creating lead:', error)
            throw error
        }
    }

    /**
     * Update an existing lead by its ID
     */
    async update(leadId: string, updates: Partial<Lead>): Promise<void> {
        try {
            const updateData = {
                ...updates,
                lastModified: getUnixDateTime(),
            }

            await updateDoc(doc(db, this.collectionName, leadId), updateData)
        } catch (error) {
            console.error('Error updating lead:', error)
            throw error
        }
    }

    /**
     * Delete a lead by its leadId
     */
    async delete(leadId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, this.collectionName, leadId))
        } catch (error) {
            console.error('Error deleting lead:', error)
            throw error
        }
    }
}

export const leadService = new LeadService()
