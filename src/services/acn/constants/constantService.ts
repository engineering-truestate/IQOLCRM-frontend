import { createAsyncThunk } from '@reduxjs/toolkit'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../../../firebase'

// Fetch micromarkets from acn-admin
export const fetchMicromarkets = createAsyncThunk('constants/fetchMicromarkets', async (_, { rejectWithValue }) => {
    try {
        console.log('🔍 Fetching micromarkets from acn-admin')

        const adminDocRef = doc(db, 'acn-admin', 'micromarkets')
        const adminDoc = await getDoc(adminDocRef)

        if (!adminDoc.exists()) {
            throw new Error('Micromarkets document not found')
        }

        const adminData = adminDoc.data()
        const micromarkets = adminData.micromarkets || []

        console.log('✅ Micromarkets fetched:', micromarkets.length)
        return micromarkets
    } catch (error: any) {
        console.error('❌ Error fetching micromarkets:', error)
        return rejectWithValue(error.message || 'Failed to fetch micromarkets')
    }
})

// Fetch builder names from acn-admin
export const fetchBuilderNames = createAsyncThunk('constants/fetchBuilderNames', async (_, { rejectWithValue }) => {
    try {
        console.log('🔍 Fetching builder names from acn-admin')

        const builderDocRef = doc(db, 'acn-admin', 'builderNames')
        const builderDoc = await getDoc(builderDocRef)

        if (!builderDoc.exists()) {
            throw new Error('Builder names document not found')
        }

        const builderData = builderDoc.data()
        const names = builderData.names || []
        const userAdded = builderData.user_added || []

        console.log('✅ Builder names fetched:', names.length, 'User added:', userAdded.length)
        return {
            names,
            userAdded,
            allNames: [...names, ...userAdded],
        }
    } catch (error: any) {
        console.error('❌ Error fetching builder names:', error)
        return rejectWithValue(error.message || 'Failed to fetch builder names')
    }
})

// Add new builder name to user_added array
export const addBuilderName = createAsyncThunk(
    'constants/addBuilderName',
    async (builderName: string, { rejectWithValue }) => {
        try {
            console.log('➕ Adding new builder name:', builderName)

            const builderDocRef = doc(db, 'acn-admin', 'builderNames')

            await updateDoc(builderDocRef, {
                user_added: arrayUnion(builderName),
            })

            console.log('✅ Builder name added successfully:', builderName)
            return builderName
        } catch (error: any) {
            console.error('❌ Error adding builder name:', error)
            return rejectWithValue(error.message || 'Failed to add builder name')
        }
    },
)

// Search builder names (for autocomplete functionality)
export const searchBuilderNames = createAsyncThunk(
    'constants/searchBuilderNames',
    async (searchTerm: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any
            const allNames = state.constants.builderNames.allNames || []

            if (!searchTerm.trim()) {
                return allNames
            }

            const filteredNames = allNames.filter((name: string) =>
                name.toLowerCase().includes(searchTerm.toLowerCase()),
            )

            console.log('🔍 Filtered builder names:', filteredNames.length, 'for term:', searchTerm)
            return filteredNames
        } catch (error: any) {
            console.error('❌ Error searching builder names:', error)
            return rejectWithValue(error.message || 'Failed to search builder names')
        }
    },
)
