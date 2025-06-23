import { createAsyncThunk } from '@reduxjs/toolkit'
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase'
import type { PrimaryProperty } from '../../../data_types/restack/restack-primary'
import { SET_PRIMARY_PROPERTIES_FILTER, SET_PRIMARY_PROPERTIES_PAGE } from '../../actionTypes/primaryProperties'

// Action types
export const FETCH_PRIMARY_PROPERTIES = 'FETCH_PRIMARY_PROPERTIES'
export const FETCH_PRIMARY_PROPERTY_BY_ID = 'FETCH_PRIMARY_PROPERTY_BY_ID'
export const UPDATE_PRIMARY_PROPERTY = 'UPDATE_PRIMARY_PROPERTY'
export const CLEAR_CURRENT_PROPERTY = 'CLEAR_CURRENT_PROPERTY'

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
        const querySnapshot = await getDocs(collection(db, 'testRestackPrimary'))
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
            const docRef = doc(db, 'testRestackPrimary', id)
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
            const docRef = doc(db, 'testRestackPrimary', projectId)

            // Flatten the data for Firestore compatibility
            const flattenedUpdates = flattenForFirestore(updates)

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
