import { createAsyncThunk } from '@reduxjs/toolkit'
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '../../../firebase'
import type {
    LanduseAnalysis,
    PlotDimension,
    PrimaryProperty,
    TowerDetail,
} from '../../../data_types/restack/restack-primary'
import { SET_PRIMARY_PROPERTIES_FILTER, SET_PRIMARY_PROPERTIES_PAGE } from '../../actionTypes/primaryProperties'

export const FETCH_PRIMARY_PROPERTIES = 'FETCH_PRIMARY_PROPERTIES'
export const FETCH_PRIMARY_PROPERTY_BY_ID = 'FETCH_PRIMARY_PROPERTY_BY_ID'
export const UPDATE_PRIMARY_PROPERTY = 'UPDATE_PRIMARY_PROPERTY'
export const CLEAR_CURRENT_PROPERTY = 'CLEAR_CURRENT_PROPERTY'
export const FETCH_TOWER_DETAILS = 'FETCH_TOWER_DETAILS'
export const UPDATE_TOWER_DETAILS = 'UPDATE_TOWER_DETAILS'

// Utility function to flatten nested arrays for Firestore compatibility
const flattenForFirestore = (data: any): any => {
    if (Array.isArray(data)) {
        // Convert arrays to objects with numeric keys
        const flattened: any = {}
        data.forEach((item, index) => {
            flattened[index] = flattenForFirestore(item)
        })
        return flattened
    } else if (data && typeof data === 'object') {
        const flattened: any = {}
        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
                // Convert nested arrays to objects
                flattened[key] = flattenForFirestore(value)
            } else if (value && typeof value === 'object') {
                // Recursively flatten nested objects
                flattened[key] = flattenForFirestore(value)
            } else {
                // Keep primitive values as is
                flattened[key] = value
            }
        }
        return flattened
    }
    return data
}

// Utility function to unflatten data from Firestore
const unflattenFromFirestore = (data: any): any => {
    if (data && typeof data === 'object') {
        // Check if this is a flattened array (has numeric keys)
        const keys = Object.keys(data)
        const hasNumericKeys = keys.every((key) => !isNaN(Number(key)))

        if (hasNumericKeys && keys.length > 0) {
            // Convert back to array
            const array: any[] = []
            keys.forEach((key) => {
                const index = Number(key)
                array[index] = unflattenFromFirestore(data[key])
            })
            return array
        } else {
            // Regular object, recursively unflatten
            const unflattened: any = {}
            for (const [key, value] of Object.entries(data)) {
                if (value && typeof value === 'object') {
                    unflattened[key] = unflattenFromFirestore(value)
                } else {
                    unflattened[key] = value
                }
            }
            return unflattened
        }
    }
    return data
}

// Action creators
export const fetchPrimaryProperties = createAsyncThunk('primaryProperties/fetchPrimaryProperties', async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'restackPrimary'))
        const properties: PrimaryProperty[] = []

        querySnapshot.forEach((doc) => {
            const data = doc.data()
            // Unflatten the data from Firestore format
            const unflattenedData = unflattenFromFirestore(data)
            properties.push({
                ...unflattenedData,
                projectId: doc.id,
            } as PrimaryProperty)
        })

        return properties
    } catch (error) {
        console.error('Error fetching primary properties:', error)
        throw error
    }
})

export const setPrimaryPropertiesFilter = (filter: string) => ({
    type: SET_PRIMARY_PROPERTIES_FILTER,
    payload: filter,
})

export const setPrimaryPropertiesPage = (page: number) => ({
    type: SET_PRIMARY_PROPERTIES_PAGE,
    payload: page,
})

export const fetchPrimaryPropertyById = createAsyncThunk(
    'primary/fetchPrimaryPropertyById',
    async (id: string, { rejectWithValue }) => {
        try {
            const docRef = doc(db, 'restackPrimary', id)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists()) {
                return rejectWithValue('Document does not exist')
            }

            const data = docSnap.data()
            if (!data) {
                return rejectWithValue('No data found')
            }

            return {
                projectId: docSnap.id,
                ...data,
            } as PrimaryProperty
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch primary property')
        }
    },
)

export const updatePrimaryProperty = createAsyncThunk(
    'primaryProperties/updatePrimaryProperty',
    async ({ projectId, updates }: { projectId: string; updates: Partial<PrimaryProperty> }) => {
        try {
            const docRef = doc(db, 'restackPrimary', projectId)

            const flattenedUpdates: any = {}
            for (const key in updates) {
                if (key === 'apartments' || key === 'villas' || key === 'plots' || key === 'images') {
                    flattenedUpdates[key] = (updates as any)[key]
                } else {
                    flattenedUpdates[key] = flattenForFirestore((updates as any)[key])
                }
            }

            await updateDoc(docRef, flattenedUpdates)

            return { projectId, updates }
        } catch (error) {
            console.error('Error updating primary property:', error)
            throw error
        }
    },
)

export const clearCurrentProperty = () => ({
    type: 'primary/clearCurrentProperty',
})

interface InventoryItem {
    BalconyVerandahSqMtr: string
    CarpetAreaSqMtr: string
    NumberOfInventory: string
    OpenTerraceSqMtr: string
    TypeOfInventory: string
    slno: string
}

export const fetchInventoryDetails = createAsyncThunk<InventoryItem[], string, { rejectValue: string }>(
    'InventoryDetails/fetchInventoryDetails',
    async (projectId: string, { rejectWithValue }) => {
        try {
            // Directly fetch the document by ID instead of getting all documents
            const docRef = doc(db, 'restackPrimaryInventory', projectId)
            const docSnapshot = await getDoc(docRef)

            if (!docSnapshot.exists()) {
                return rejectWithValue('Inventory details not found for this project.')
            }

            const data = docSnapshot.data()

            // Extract only the inventory_details array
            if (!data.inventory_details || !Array.isArray(data.inventory_details)) {
                return rejectWithValue('No inventory details found in this document.')
            }

            return data.inventory_details as InventoryItem[]
        } catch (error) {
            console.error('Error fetching inventory details:', error)
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch inventory details')
        }
    },
)

export const updateInventoryDetails = createAsyncThunk<
    InventoryItem[],
    { projectId: string; updates: InventoryItem[]; reraId: string },
    { rejectValue: string }
>('InventoryDetails/updateInventoryDetails', async ({ projectId, updates, reraId }, { rejectWithValue }) => {
    try {
        // Reference to the document
        const docRef = doc(db, 'restackPrimaryInventory', projectId)

        // Check if document exists before updating
        const docSnapshot = await getDoc(docRef)
        if (!docSnapshot.exists()) {
            // If the document doesn't exist, create a new document
            await setDoc(docRef, {
                inventory_details: updates,
                projectId: projectId,
                reraId: reraId,
                documentId: reraId,
                uploadedAt: new Date().toISOString(),
            })
            return updates // Return the updates as the new inventory details
        }

        // Update the inventory_details field in the document
        await updateDoc(docRef, {
            inventory_details: updates,
        })

        // Return the updated inventory details
        return updates
    } catch (error) {
        console.error('Error updating inventory details:', error)
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to update inventory details')
    }
})

export const fetchTowerDetails = createAsyncThunk<TowerDetail[], string, { rejectValue: string }>(
    'TowerDetails/fetchTowerDetails',
    async (projectId: string, { rejectWithValue }) => {
        try {
            const docRef = doc(db, 'restackPrimaryTowers', projectId)
            const docSnapshot = await getDoc(docRef)

            if (!docSnapshot.exists()) {
                return rejectWithValue('Invalid or missing tower details in document.')
            }

            const data = docSnapshot.data()

            if (!data || !Array.isArray(data.towers)) {
                return rejectWithValue('Invalid or missing tower details in document.')
            }

            // Optionally map/transform each tower if needed, otherwise just return as is
            return data.towers as TowerDetail[]
        } catch (error) {
            console.error('Error fetching tower details:', error)
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch tower details')
        }
    },
)

export const updateTowerDetails = createAsyncThunk<
    TowerDetail[],
    { projectId: string; updates: TowerDetail[] },
    { rejectValue: string }
>('TowerDetails/updateTowerDetails', async ({ projectId, updates }, { rejectWithValue }) => {
    try {
        const docRef = doc(db, 'restackPrimaryTowers', projectId)

        await updateDoc(docRef, {
            towers: updates,
        })

        return updates
    } catch (error) {
        console.error('Error updating tower details:', error)
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to update tower details')
    }
})

export const fetchLandUseAnalysisDetails = createAsyncThunk<LanduseAnalysis, string, { rejectValue: string }>(
    'InventoryDetails/fetchInventoryDetails',
    async (projectId: string, { rejectWithValue }) => {
        try {
            // Directly fetch the document by ID instead of getting all documents
            const docRef = doc(db, 'restackPrimaryLandUseAnalysis', projectId)
            const docSnapshot = await getDoc(docRef)

            if (!docSnapshot.exists()) {
                return rejectWithValue('Inventory details not found for this project.')
            }

            const data = docSnapshot.data()

            // Extract only the inventory_details array
            if (!data.landuseAnalysis) {
                return rejectWithValue('No inventory details found in this document.')
            }

            return data.landuseAnalysis as LanduseAnalysis
        } catch (error) {
            console.error('Error fetching inventory details:', error)
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch inventory details')
        }
    },
)

export const updateLandUseAnalysisDetails = createAsyncThunk<
    LanduseAnalysis,
    { projectId: string; updates: LanduseAnalysis; reraId: string },
    { rejectValue: string }
>('InventoryDetails/updateInventoryDetails', async ({ projectId, updates, reraId }, { rejectWithValue }) => {
    try {
        // Reference to the document
        const docRef = doc(db, 'restackPrimaryLandUseAnalysis', projectId)

        // Check if document exists before updating
        const docSnapshot = await getDoc(docRef)
        if (!docSnapshot.exists()) {
            // If the document doesn't exist, create a new document
            await setDoc(docRef, {
                landuseAnalysis: updates,
                projectId: projectId,
                reraId: reraId,
                documentId: reraId,
                uploadedAt: new Date().toISOString(),
            })
            return updates // Return the updates as the new inventory details
        }

        // Update the inventory_details field in the document
        await updateDoc(docRef, {
            landuseAnalysis: updates,
        })

        // Return the updated inventory details
        return updates
    } catch (error) {
        console.error('Error updating inventory details:', error)
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to update inventory details')
    }
})

export const fetchPlotDimensionDetails = createAsyncThunk<PlotDimension[], string, { rejectValue: string }>(
    'PlotDimensionDetails/fetchPlotDimensionDetails',
    async (projectId: string, { rejectWithValue }) => {
        try {
            // Directly fetch the document by ID instead of getting all documents
            const docRef = doc(db, 'restackPrimaryPlotDimension', projectId)
            const docSnapshot = await getDoc(docRef)

            if (!docSnapshot.exists()) {
                return rejectWithValue('Inventory details not found for this project.')
            }

            const data = docSnapshot.data()

            // Extract only the inventory_details array
            if (!data) {
                return rejectWithValue('No inventory details found in this document.')
            }

            return data.plotDimension as PlotDimension[]
        } catch (error) {
            console.error('Error fetching inventory details:', error)
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch inventory details')
        }
    },
)

export const updatePlotDimensionDetails = createAsyncThunk<
    PlotDimension[],
    { projectId: string; updates: PlotDimension[]; reraId: string },
    { rejectValue: string }
>('PlotDimensionDetails/updatePlotDimensionDetails', async ({ projectId, updates, reraId }, { rejectWithValue }) => {
    try {
        // Reference to the document
        const docRef = doc(db, 'restackPrimaryPlotDimension', projectId)

        // Check if document exists before updating
        const docSnapshot = await getDoc(docRef)
        if (!docSnapshot.exists()) {
            // If the document doesn't exist, create a new document
            await setDoc(docRef, {
                PlotDimension: updates,
                projectId: projectId,
                reraId: reraId,
                documentId: reraId,
                uploadedAt: new Date().toISOString(),
            })
            return updates // Return the updates as the new inventory details
        }

        // Update the inventory_details field in the document
        await updateDoc(docRef, {
            PlotDimension: updates,
        })

        // Return the updated inventory details
        return updates
    } catch (error) {
        console.error('Error updating inventory details:', error)
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to update inventory details')
    }
})
