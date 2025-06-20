import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    limit,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { Enquiry, NoteItem, ActivityHistoryItem } from './types'

class EnquiryService {
    private collectionName = 'canvashomesEnquiries'

    async getById(enquiryId: string): Promise<Enquiry | null> {
        try {
            if (!enquiryId) {
                console.error('Invalid enquiryId provided:', enquiryId)
                return null
            }

            console.log('Fetching enquiry by ID:', enquiryId)

            const enquiryDoc = await getDoc(doc(db, this.collectionName, enquiryId))
            if (enquiryDoc.exists()) {
                return { enquiryId: enquiryDoc.id, ...enquiryDoc.data() } as Enquiry
            }
            return null
        } catch (error) {
            console.error('Error fetching enquiry:', error)
            throw error
        }
    }

    async getActivityHistory(enquiryId: string): Promise<ActivityHistoryItem[]> {
        if (!enquiryId) {
            throw new Error('Invalid enquiryId provided for getting activity history')
        }

        try {
            console.log('Fetching activity history for enquiryId:', enquiryId)
            const enquiry = await this.getById(enquiryId)
            console.log('Fetched enquiry for activity history:', enquiry)
            return enquiry?.activityHistory ?? []
        } catch (error) {
            console.error('Error getting activity history:', error)
            throw error
        }
    }

    async getByLeadId(leadId: string): Promise<Enquiry[]> {
        try {
            console.log('Hare Krishna', leadId)
            // Validate leadId
            if (!leadId) {
                console.error('Invalid leadId provided for enquiry fetch:', leadId)
                return []
            }

            console.log('Fetching enquiries for leadId:', leadId)

            const q = query(collection(db, this.collectionName), where('leadId', '==', leadId))

            const querySnapshot = await getDocs(q)

            const enquiries = querySnapshot.docs
                .map(
                    (doc) =>
                        ({
                            enquiryId: doc.id,
                            ...doc.data(),
                        }) as Enquiry,
                )
                .sort((a, b) => b.added?.toMillis?.() - a.added?.toMillis?.()) // if 'added' is a Firestore Timestamp

            console.log('Enquiries fetched and sorted manually:', enquiries)
            return enquiries
        } catch (error) {
            console.error('Error fetching enquiries by lead ID:', error)
            throw new Error(`Failed to fetch enquiries: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async create(enquiryData: Omit<Enquiry, 'enquiryId' | 'added' | 'lastModified'>): Promise<string> {
        try {
            // Query to get the last created enquiry and generate the next enquiry ID
            const q = query(collection(db, this.collectionName), orderBy('enquiryId', 'desc'), limit(1))
            const snapshot = await getDocs(q)

            let nextEnquiryId = 'enq001' // Default to 'enq001' if no previous enquiries exist
            if (!snapshot.empty) {
                const lastEnquiryId = snapshot.docs[0].data().enquiryId
                const lastNumber = parseInt(lastEnquiryId.replace('enq', ''))
                const newNumber = lastNumber + 1
                nextEnquiryId = `enq${newNumber.toString().padStart(3, '0')}` // Format the ID like 'enq001', 'enq002', etc.
            }

            // Prepare the new enquiry data with the generated ID
            const newEnquiry = {
                ...enquiryData,
                enquiryId: nextEnquiryId,
                notes: enquiryData.notes || [],
                activityHistory: enquiryData.activityHistory || [],
                agentHistory: enquiryData.agentHistory || [],
                added: Date.now(),
                lastModified: Date.now(),
            }

            // Use setDoc to specify the document ID as enquiryId
            const docRef = doc(db, this.collectionName, nextEnquiryId)
            await setDoc(docRef, newEnquiry)

            return nextEnquiryId // Return the newly generated enquiryId
        } catch (error) {
            console.error('Error creating enquiry:', error)
            throw error
        }
    }

    async update(enquiryId: string, updates: Partial<Enquiry>): Promise<void> {
        try {
            if (!enquiryId) {
                throw new Error('Invalid enquiryId provided for update')
            }

            const updateData = {
                ...updates,
                lastModified: Date.now(),
            }
            await updateDoc(doc(db, this.collectionName, enquiryId), updateData)
        } catch (error) {
            console.error('Error updating enquiry:', error)
            throw error
        }
    }

    async addNote(
        enquiryId: string,
        noteData: {
            agentId: string
            agentName: string
            taskType: string
            note: string
            timestamp?: number
        },
    ): Promise<void> {
        try {
            if (!enquiryId) {
                throw new Error('Invalid enquiryId provided for adding note')
            }

            const enquiryRef = doc(db, this.collectionName, enquiryId)
            const enquiryDoc = await getDoc(enquiryRef)

            if (enquiryDoc.exists()) {
                const currentData = enquiryDoc.data() as Enquiry
                const newNote: NoteItem = {
                    timestamp: noteData.timestamp || Date.now(),
                    agentId: noteData.agentId,
                    agentName: noteData.agentName,
                    taskType: noteData.taskType,
                    note: noteData.note,
                }

                const updatedNotes = [...(currentData.notes || []), newNote]

                await updateDoc(enquiryRef, {
                    notes: updatedNotes,
                    lastModified: Date.now(),
                })
            }
        } catch (error) {
            console.error('Error adding note:', error)
            throw error
        }
    }

    async addActivity(
        enquiryId: string,
        activityData: {
            activityType: string
            timestamp: number
            agentName: string
            data?: any
        },
    ): Promise<void> {
        try {
            if (!enquiryId) {
                throw new Error('Invalid enquiryId provided for adding activity')
            }

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
                    lastModified: Date.now(),
                })
            }
        } catch (error) {
            console.error('Error adding activity:', error)
            throw error
        }
    }

    subscribeToEnquiry(enquiryId: string, callback: (enquiry: Enquiry | null) => void) {
        if (!enquiryId) {
            console.error('Invalid enquiryId provided for subscription')
            callback(null)
            return () => {}
        }

        return onSnapshot(
            doc(db, this.collectionName, enquiryId),
            (doc) => {
                if (doc.exists()) {
                    callback({ enquiryId: doc.id, ...doc.data() } as Enquiry)
                } else {
                    callback(null)
                }
            },
            (error) => {
                console.error('Error in enquiry subscription:', error)
                callback(null)
            },
        )
    }

    subscribeToEnquiriesByLeadId(leadId: string, callback: (enquiries: Enquiry[]) => void) {
        if (!leadId) {
            console.error('Invalid leadId provided for enquiries subscription')
            callback([])
            return () => {}
        }

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
