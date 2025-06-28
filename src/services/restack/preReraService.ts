import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    query,
    orderBy,
    limit,
    startAfter,
    QueryDocumentSnapshot,
    QueryConstraint,
    where,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { PreReraProperty, PreReraPropertyFilters } from '../../store/reducers/restack/preReraTypes'

export class PreReraService {
    /**
     * Fetch all pre-rera properties with optional filters
     */
    static async fetchProperties(filters?: PreReraPropertyFilters): Promise<PreReraProperty[]> {
        try {
            const colRef = collection(db, 'restack_pre_rera_properties')
            let q = query(colRef, orderBy('createdAt', 'desc'))

            // Apply filters if provided
            if (filters) {
                const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]

                if (filters.projectType) {
                    constraints.push(where('projectType', '==', filters.projectType))
                }
                if (filters.status) {
                    constraints.push(where('status', '==', filters.status))
                }
                if (filters.developerTier) {
                    constraints.push(where('developerTier', '==', filters.developerTier))
                }
                if (filters.district) {
                    constraints.push(where('district', '==', filters.district))
                }
                if (filters.zone) {
                    constraints.push(where('zone', '==', filters.zone))
                }
                if (filters.micromarket) {
                    constraints.push(where('micromarket', '==', filters.micromarket))
                }
                if (filters.khataType) {
                    constraints.push(where('khataType', '==', filters.khataType))
                }

                q = query(colRef, ...constraints)
            }

            const snapshot = await getDocs(q)

            const properties = snapshot.docs.map((doc) => {
                const data = doc.data() as Omit<PreReraProperty, 'projectId'>
                return {
                    ...data,
                    projectId: doc.id, // Use Firestore document ID as projectId
                } as PreReraProperty
            })

            return properties
        } catch (error) {
            console.error('Error fetching pre-rera properties:', error)
            throw error
        }
    }

    /**
     * Fetch properties with pagination and search
     */
    static async fetchPropertiesBatch(
        batchSize: number,
        searchTerm: string = '',
        lastDocument?: QueryDocumentSnapshot,
    ): Promise<{ properties: PreReraProperty[]; lastDocument?: QueryDocumentSnapshot; hasMore: boolean }> {
        try {
            const colRef = collection(db, 'restack_pre_rera_properties')
            const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(batchSize)]

            if (searchTerm) {
                constraints.push(where('projectName', '>=', searchTerm))
                constraints.push(where('projectName', '<=', searchTerm + '\uf8ff'))
            }

            if (lastDocument) {
                constraints.push(startAfter(lastDocument))
            }

            const q = query(colRef, ...constraints)
            const snapshot = await getDocs(q)

            const properties = snapshot.docs.map((doc) => {
                const data = doc.data() as Omit<PreReraProperty, 'projectId'>
                return {
                    ...data,
                    projectId: doc.id,
                } as PreReraProperty
            })

            const lastDoc =
                snapshot.docs.length > 0
                    ? (snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot)
                    : undefined

            return {
                properties,
                lastDocument: lastDoc,
                hasMore: snapshot.docs.length === batchSize,
            }
        } catch (error) {
            console.error('Error fetching pre-rera properties batch:', error)
            throw error
        }
    }

    /**
     * Add a new pre-rera property
     */
    static async addProperty(
        propertyData: Omit<PreReraProperty, 'projectId' | 'createdAt' | 'updatedAt'>,
    ): Promise<PreReraProperty> {
        try {
            const colRef = collection(db, 'restack_pre_rera_properties')

            // Add timestamps (using Unix timestamps as per schema)
            const currentTimestamp = Math.floor(Date.now() / 1000)
            const propertyWithTimestamps = {
                ...propertyData,
                createdAt: currentTimestamp,
                updatedAt: currentTimestamp,
            }

            const docRef = await addDoc(colRef, propertyWithTimestamps)

            // Get the created document to return complete data
            const createdDoc = await getDoc(docRef)
            const createdProperty = {
                ...createdDoc.data(),
                projectId: createdDoc.id,
            } as PreReraProperty

            return createdProperty
        } catch (error) {
            console.error('Error adding pre-rera property:', error)
            throw error
        }
    }

    /**
     * Update an existing pre-rera property
     */
    static async updateProperty(projectId: string, updates: Partial<PreReraProperty>): Promise<PreReraProperty> {
        try {
            const docRef = doc(db, 'restack_pre_rera_properties', projectId)

            // Add updatedAt timestamp
            const updatesWithTimestamp = {
                ...updates,
                updatedAt: Math.floor(Date.now() / 1000),
            }

            await updateDoc(docRef, updatesWithTimestamp)

            // Get the updated document
            const updatedDoc = await getDoc(docRef)
            const updatedProperty = {
                ...updatedDoc.data(),
                projectId: updatedDoc.id,
            } as PreReraProperty

            return updatedProperty
        } catch (error) {
            console.error('Error updating pre-rera property:', error)
            throw error
        }
    }

    /**
     * Delete a pre-rera property
     */
    static async deleteProperty(projectId: string): Promise<void> {
        try {
            const docRef = doc(db, 'restack_pre_rera_properties', projectId)
            await deleteDoc(docRef)
        } catch (error) {
            console.error('Error deleting pre-rera property:', error)
            throw error
        }
    }

    /**
     * Get a single pre-rera property by ID
     */
    static async getPropertyById(projectId: string): Promise<PreReraProperty> {
        try {
            const docRef = doc(db, 'restack_pre_rera_properties', projectId)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists()) {
                throw new Error('Property not found')
            }

            const property = {
                ...docSnap.data(),
                projectId: docSnap.id,
            } as PreReraProperty

            return property
        } catch (error) {
            console.error('Error fetching pre-rera property:', error)
            throw error
        }
    }

    /**
     * Search properties by text (project name, developer name, etc.)
     */
    static async searchProperties(searchTerm: string): Promise<PreReraProperty[]> {
        try {
            const colRef = collection(db, 'restack_pre_rera_properties')
            const snapshot = await getDocs(colRef)

            const properties = snapshot.docs
                .map((doc) => {
                    const data = doc.data() as Omit<PreReraProperty, 'projectId'>
                    return {
                        ...data,
                        projectId: doc.id,
                    } as PreReraProperty
                })
                .filter((property) => {
                    const searchLower = searchTerm.toLowerCase()
                    return (
                        property.projectName.toLowerCase().includes(searchLower) ||
                        property.developerName.toLowerCase().includes(searchLower) ||
                        property.address.toLowerCase().includes(searchLower) ||
                        property.micromarket.toLowerCase().includes(searchLower)
                    )
                })

            return properties
        } catch (error) {
            console.error('Error searching pre-rera properties:', error)
            throw error
        }
    }
}

export default PreReraService
