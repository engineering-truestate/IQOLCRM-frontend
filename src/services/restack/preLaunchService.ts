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
    serverTimestamp,
    where,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { Property, PropertyFilters } from '../../store/reducers/restack/preLaunchtypes'

export class PreLaunchService {
    /**
     * Fetch all pre-launch properties with optional filters
     */
    static async fetchProperties(filters?: PropertyFilters): Promise<Property[]> {
        try {
            const colRef = collection(db, 'restack_pre_launch_properties')
            const q = query(colRef, orderBy('createdAt', 'desc'))

            // Apply filters if provided
            // Note: For complex filtering, you might need to use where clauses
            // This is a basic implementation

            const snapshot = await getDocs(q)

            const properties = snapshot.docs.map((doc) => {
                const data = doc.data() as Omit<Property, 'projectId'>
                return {
                    ...data,
                    projectId: doc.id, // Use Firestore document ID as projectId
                } as Property
            })

            return properties
        } catch (error) {
            console.error('Error fetching pre-launch properties:', error)
            throw error
        }
    }

    /**
     * Fetch properties with pagination
     */
    static async fetchPropertiesBatch(
        batchSize: number,
        lastDocument?: QueryDocumentSnapshot,
    ): Promise<{ properties: Property[]; lastDocument?: QueryDocumentSnapshot; hasMore: boolean }> {
        try {
            const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(batchSize)]

            if (lastDocument) {
                constraints.push(startAfter(lastDocument))
            }

            const q = query(collection(db, 'restack_pre_launch_properties'), ...constraints)
            const snapshot = await getDocs(q)

            const properties = snapshot.docs.map((doc) => {
                const data = doc.data() as Omit<Property, 'projectId'>
                return {
                    ...data,
                    projectId: doc.id,
                } as Property
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
            console.error('Error fetching pre-launch properties batch:', error)
            throw error
        }
    }

    /**
     * Add a new pre-launch property
     */
    static async addProperty(
        propertyData: Omit<Property, 'projectId' | 'createdAt' | 'lastUpdated'>,
    ): Promise<Property> {
        try {
            const colRef = collection(db, 'restack_pre_launch_properties')

            // Add timestamps
            const propertyWithTimestamps = {
                ...propertyData,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
            }

            const docRef = await addDoc(colRef, propertyWithTimestamps)

            // Get the created document to return complete data
            const createdDoc = await getDoc(docRef)
            const createdProperty = {
                ...createdDoc.data(),
                projectId: createdDoc.id,
            } as Property

            return createdProperty
        } catch (error) {
            console.error('Error adding pre-launch property:', error)
            throw error
        }
    }

    /**
     * Update an existing pre-launch property
     */
    static async updateProperty(projectId: string, updates: Partial<Property>): Promise<Property> {
        try {
            const docRef = doc(db, 'restack_pre_launch_properties', projectId)

            // Add lastUpdated timestamp
            const updatesWithTimestamp = {
                ...updates,
                lastUpdated: new Date().toISOString(),
            }

            await updateDoc(docRef, updatesWithTimestamp)

            // Get the updated document
            const updatedDoc = await getDoc(docRef)
            const updatedProperty = {
                ...updatedDoc.data(),
                projectId: updatedDoc.id,
            } as Property

            return updatedProperty
        } catch (error) {
            console.error('Error updating pre-launch property:', error)
            throw error
        }
    }

    /**
     * Delete a pre-launch property
     */
    static async deleteProperty(projectId: string): Promise<void> {
        try {
            const docRef = doc(db, 'restack_pre_launch_properties', projectId)
            await deleteDoc(docRef)
        } catch (error) {
            console.error('Error deleting pre-launch property:', error)
            throw error
        }
    }

    /**
     * Get a single pre-launch property by ID
     */
    static async getPropertyById(projectId: string): Promise<Property> {
        try {
            const docRef = doc(db, 'restack_pre_launch_properties', projectId)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists()) {
                throw new Error('Property not found')
            }

            const property = {
                ...docSnap.data(),
                projectId: docSnap.id,
            } as Property

            return property
        } catch (error) {
            console.error('Error fetching pre-launch property:', error)
            throw error
        }
    }
    static async getPropertyByName(projectName: string): Promise<Property | undefined> {
        try {
            const colRef = collection(db, 'restack_pre_launch_properties')
            const q = query(colRef, where('projectName', '==', projectName))
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                return undefined // Property not found
            }

            const docSnap = snapshot.docs[0] // Get the first document

            const data = docSnap.data()

            if (!data) {
                throw new Error('Property data is empty')
            }

            const property: Property = {
                ...data,
                projectId: docSnap.id,
            } as Property

            return property
        } catch (error) {
            console.error('Error fetching pre-launch property:', error)
            throw error
        }
    }
    static async getAllPropertyName(): Promise<{ projectId: string; propertyName: string }[]> {
        try {
            const colRef = collection(db, 'restack_pre_launch_properties')

            // Modify query to fetch all properties and order by creation date
            const q = query(colRef, orderBy('createdAt', 'desc'))

            const snapshot = await getDocs(q)

            // Map over the snapshot to extract property names
            const propertyNames = snapshot.docs.map((doc) => {
                const data = doc.data()
                return {
                    projectId: doc.id, // Use Firestore document ID as projectId
                    propertyName: data.projectName, // Assuming 'name' is the field for property names
                }
            })

            return propertyNames
        } catch (error) {
            console.error('Error fetching property names:', error)
            throw error
        }
    }
}

export default PreLaunchService
