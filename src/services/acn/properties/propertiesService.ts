// store/services/propertiesService.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase'
import { type IInventory } from '../../../store/reducers/acn/propertiesTypes'

// Fetch single property by ID
export const fetchPropertyById = createAsyncThunk(
    'properties/fetchById',
    async (propertyId: string, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching property with ID:', propertyId)

            const docRef = doc(db, 'acn-properties', propertyId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data() as IInventory
                console.log('✅ Property data fetched successfully:', data)
                return { ...data, id: docSnap.id }
            } else {
                console.log('❌ No property found with ID:', propertyId)
                throw new Error(`Property with ID ${propertyId} not found`)
            }
        } catch (error: any) {
            console.error('❌ Error fetching property:', error)
            return rejectWithValue(error.message || 'Failed to fetch property')
        }
    },
)

// Fetch multiple properties by IDs (for matching properties table)
export const fetchPropertiesByIds = createAsyncThunk(
    'properties/fetchByIds',
    async (propertyIds: string[], { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching properties with IDs:', propertyIds)

            if (propertyIds.length === 0) {
                return []
            }

            // Firebase 'in' queries are limited to 10 items, so we need to batch them
            const batchSize = 10
            const batches: Promise<IInventory[]>[] = []

            for (let i = 0; i < propertyIds.length; i += batchSize) {
                const batch = propertyIds.slice(i, i + batchSize)

                const batchQuery = query(collection(db, 'acn-properties'), where('propertyId', 'in', batch))

                const batchPromise = getDocs(batchQuery).then((querySnapshot) => {
                    const properties: IInventory[] = []
                    querySnapshot.forEach((doc) => {
                        properties.push({ id: doc.id, ...doc.data() } as IInventory)
                    })
                    return properties
                })

                batches.push(batchPromise)
            }

            // Wait for all batches to complete
            const batchResults = await Promise.all(batches)
            const allProperties = batchResults.flat()

            console.log('✅ Properties fetched successfully:', allProperties.length, 'properties')
            return allProperties
        } catch (error: any) {
            console.error('❌ Error fetching properties:', error)
            return rejectWithValue(error.message || 'Failed to fetch properties')
        }
    },
)

// Update property status (bonus functionality)
export const updatePropertyStatus = createAsyncThunk(
    'properties/updateStatus',
    async ({ propertyId, status }: { propertyId: string; status: string }, { rejectWithValue }) => {
        try {
            console.log('📝 Updating property status:', propertyId, status)

            const docRef = doc(db, 'acn-properties', propertyId)
            await updateDoc(docRef, {
                status: status,
                dateOfStatusLastChecked: new Date(),
            })

            console.log('✅ Property status updated successfully')
            return { propertyId, status }
        } catch (error: any) {
            console.error('❌ Error updating property status:', error)
            return rejectWithValue(error.message || 'Failed to update property status')
        }
    },
)
