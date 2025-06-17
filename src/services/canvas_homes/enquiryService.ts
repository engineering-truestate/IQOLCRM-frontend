import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    query,
    limit,
    where,
    orderBy,
    onSnapshot,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { Enquiry, NoteItem, ActivityHistoryItem } from './types'

class EnquiryService {
    private collectionName = 'canvashomesEnquiries'

    async getById(enquiryId: string): Promise<Enquiry | null> {
        try {
            if (!enquiryId || typeof enquiryId !== 'string' || enquiryId.trim() === '') {
                console.error('Invalid enquiryId provided:', enquiryId)
                return null
            }

            const enquiryDoc = await getDoc(doc(db, this.collectionName, enquiryId.trim()))
            if (enquiryDoc.exists()) {
                return { enquiryId: enquiryDoc.id, ...enquiryDoc.data() } as Enquiry
            }
            return null
        } catch (error) {
            console.error('Error fetching enquiry:', error)
            throw error
        }
    }

    async getByLeadId(leadId: string): Promise<Enquiry[]> {
        try {
            console.log('Hare Krishna', leadId)
            // Validate leadId
            if (!leadId || typeof leadId !== 'string' || leadId.trim() === '') {
                console.error('Invalid leadId provided for enquiry fetch:', leadId)
                return []
            }

            console.log('Fetching enquiries for leadId:', leadId)

            const q = query(collection(db, this.collectionName), where('leadId', '==', leadId.trim()))

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
            if (!enquiryId || typeof enquiryId !== 'string' || enquiryId.trim() === '') {
                throw new Error('Invalid enquiryId provided for update')
            }

            const updateData = {
                ...updates,
                lastModified: Date.now(),
            }
            await updateDoc(doc(db, this.collectionName, enquiryId.trim()), updateData)
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
            TaskType: string
            note: string
        },
    ): Promise<void> {
        try {
            if (!enquiryId || typeof enquiryId !== 'string' || enquiryId.trim() === '') {
                throw new Error('Invalid enquiryId provided for adding note')
            }

            const enquiryRef = doc(db, this.collectionName, enquiryId.trim())
            const enquiryDoc = await getDoc(enquiryRef)

            if (enquiryDoc.exists()) {
                const currentData = enquiryDoc.data() as Enquiry
                const newNote: NoteItem = {
                    timestamp: Date.now(),
                    ...noteData,
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
            agentId: string
            activityType: string
            activityStatus: string
            activityNote: string
        },
    ): Promise<void> {
        try {
            if (!enquiryId || typeof enquiryId !== 'string' || enquiryId.trim() === '') {
                throw new Error('Invalid enquiryId provided for adding activity')
            }

            const enquiryRef = doc(db, this.collectionName, enquiryId.trim())
            const enquiryDoc = await getDoc(enquiryRef)

            if (enquiryDoc.exists()) {
                const currentData = enquiryDoc.data() as Enquiry
                const newActivity: ActivityHistoryItem = {
                    timestamp: Date.now(),
                    ...activityData,
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
        if (!enquiryId || typeof enquiryId !== 'string' || enquiryId.trim() === '') {
            console.error('Invalid enquiryId provided for subscription')
            callback(null)
            return () => {}
        }

        return onSnapshot(
            doc(db, this.collectionName, enquiryId.trim()),
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
        if (!leadId || typeof leadId !== 'string' || leadId.trim() === '') {
            console.error('Invalid leadId provided for enquiries subscription')
            callback([])
            return () => {}
        }

        const q = query(
            collection(db, this.collectionName),
            where('leadId', '==', leadId.trim()),
            orderBy('added', 'desc'),
        )

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
