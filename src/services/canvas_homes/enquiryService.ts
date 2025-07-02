import {
    collection,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    runTransaction,
    increment,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { Enquiry, NoteItem, ActivityHistoryItem } from './types'
import { getUnixDateTime } from '../../components/helper/getUnixDateTime'

class EnquiryService {
    private collectionName = 'canvashomesEnquiries'

    async getById(enquiryId: string): Promise<Enquiry | null> {
        try {
            const enquiryDoc = await getDoc(doc(db, this.collectionName, enquiryId))
            return enquiryDoc.exists() ? ({ enquiryId: enquiryDoc.id, ...enquiryDoc.data() } as Enquiry) : null
        } catch (error) {
            console.error('Error fetching enquiry:', error)
            throw error
        }
    }

    async getActivityHistory(enquiryId: string): Promise<ActivityHistoryItem[]> {
        try {
            const enquiry = await this.getById(enquiryId)
            return enquiry?.activityHistory ?? []
        } catch (error) {
            console.error('Error getting activity history:', error)
            throw error
        }
    }

    async getByLeadId(leadId: string): Promise<Enquiry[]> {
        try {
            const q = query(collection(db, this.collectionName), where('leadId', '==', leadId))
            const snapshot = await getDocs(q)

            return snapshot.docs
                .map((doc) => ({ enquiryId: doc.id, ...doc.data() }) as Enquiry)
                .sort((a, b) => (b.added ?? 0) - (a.added ?? 0))
        } catch (error) {
            console.error('Error fetching enquiries by lead ID:', error)
            throw new Error(`Failed to fetch enquiries: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async create(enquiryData: Omit<Enquiry, 'enquiryId' | 'added' | 'lastModified'>): Promise<string> {
        try {
            const counterRef = doc(db, 'canvashomesAdmin', 'lastEnquiry')

            const nextEnquiryId = await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef)
                let currentNumber = 0

                if (counterDoc.exists()) {
                    currentNumber = counterDoc.data().count || 0
                }

                const newNumber = currentNumber + 1
                const newEnquiryId = `enq${newNumber.toString().padStart(3, '0')}`

                const timestamp = getUnixDateTime()
                const newEnquiry: Enquiry = {
                    ...enquiryData,
                    enquiryId: newEnquiryId,
                    notes: enquiryData.notes || [],
                    activityHistory: enquiryData.activityHistory || [],
                    agentHistory: enquiryData.agentHistory || [],
                    added: timestamp,
                    lastModified: timestamp,
                }

                transaction.set(doc(db, this.collectionName, newEnquiryId), newEnquiry)
                transaction.update(counterRef, {
                    count: increment(1),
                })

                return newEnquiryId
            })

            return nextEnquiryId
        } catch (error) {
            console.error('Error creating enquiry:', error)
            throw error
        }
    }

    async update(enquiryId: string, updates: Partial<Enquiry>): Promise<void> {
        try {
            const updateData = {
                ...updates,
                lastModified: getUnixDateTime(),
            }
            await updateDoc(doc(db, this.collectionName, enquiryId), updateData)
        } catch (error) {
            console.error('Error updating enquiry:', error)
            throw error
        }
    }

    async addNote(enquiryId: string, noteData: Omit<NoteItem, 'timestamp'> & { timestamp?: number }): Promise<void> {
        try {
            const enquiryRef = doc(db, this.collectionName, enquiryId)
            const enquiryDoc = await getDoc(enquiryRef)

            if (enquiryDoc.exists()) {
                const currentData = enquiryDoc.data() as Enquiry
                const newNote: NoteItem = {
                    timestamp: noteData.timestamp || getUnixDateTime(),
                    ...noteData,
                }

                const updatedNotes = [...(currentData.notes || []), newNote]

                await updateDoc(enquiryRef, {
                    notes: updatedNotes,
                    lastModified: getUnixDateTime(),
                })
            }
        } catch (error) {
            console.error('Error adding note:', error)
            throw error
        }
    }

    async addActivity(enquiryId: string, activityData: ActivityHistoryItem): Promise<void> {
        try {
            const enquiryRef = doc(db, this.collectionName, enquiryId)
            const enquiryDoc = await getDoc(enquiryRef)

            if (enquiryDoc.exists()) {
                const currentData = enquiryDoc.data() as Enquiry
                const newActivity: ActivityHistoryItem = {
                    activityType: activityData.activityType,
                    timestamp: activityData.timestamp,
                    agentName: activityData.agentName,
                    data: activityData.data || {},
                }

                const updatedActivity = [...(currentData.activityHistory || []), newActivity]

                await updateDoc(enquiryRef, {
                    activityHistory: updatedActivity,
                    lastModified: getUnixDateTime(),
                })
            }
        } catch (error) {
            console.error('Error adding activity:', error)
            throw error
        }
    }

    subscribeToEnquiry(enquiryId: string, callback: (enquiry: Enquiry | null) => void) {
        return onSnapshot(
            doc(db, this.collectionName, enquiryId),
            (doc) => {
                callback(doc.exists() ? ({ enquiryId: doc.id, ...doc.data() } as Enquiry) : null)
            },
            (error) => {
                console.error('Error in enquiry subscription:', error)
                callback(null)
            },
        )
    }

    subscribeToEnquiriesByLeadId(leadId: string, callback: (enquiries: Enquiry[]) => void) {
        const q = query(collection(db, this.collectionName), where('leadId', '==', leadId), orderBy('added', 'desc'))

        return onSnapshot(
            q,
            (snapshot) => {
                const enquiries = snapshot.docs.map((doc) => ({
                    enquiryId: doc.id,
                    ...doc.data(),
                })) as Enquiry[]
                callback(enquiries)
            },
            (error) => {
                console.error('Error in enquiries subscription:', error)
                callback([])
            },
        )
    }
}

export const enquiryService = new EnquiryService()
