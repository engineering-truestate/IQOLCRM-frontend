import { createAsyncThunk } from '@reduxjs/toolkit'
import { collection, doc, getDoc, getDocs, query, where, updateDoc, arrayUnion } from 'firebase/firestore'
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

// Fetch selling platforms
export const fetchSellingPlatforms = createAsyncThunk(
    'constants/fetchSellingPlatforms',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching selling platforms from acn-admin')

            const platformDocRef = doc(db, 'acn-admin', 'sellingPlatforms')
            const platformDoc = await getDoc(platformDocRef)

            if (!platformDoc.exists()) {
                throw new Error('Selling platforms document not found')
            }

            const platformData = platformDoc.data()
            const names = platformData.names || []
            const userAdded = platformData.user_added || []

            console.log('✅ Selling platforms fetched:', names.length, 'User added:', userAdded.length)
            return {
                names,
                userAdded,
                allNames: [...names, ...userAdded],
            }
        } catch (error: any) {
            console.error('❌ Error fetching selling platforms:', error)
            return rejectWithValue(error.message || 'Failed to fetch selling platforms')
        }
    },
)

// Add new selling platform to user_added array
export const addSellingPlatform = createAsyncThunk(
    'constants/addSellingPlatform',
    async (platformName: string, { rejectWithValue }) => {
        try {
            console.log('➕ Adding new selling platform:', platformName)

            const platformDocRef = doc(db, 'acn-admin', 'sellingPlatforms')

            await updateDoc(platformDocRef, {
                user_added: arrayUnion(platformName),
            })

            console.log('✅ Selling platform added successfully:', platformName)
            return platformName
        } catch (error: any) {
            console.error('❌ Error adding selling platform:', error)
            return rejectWithValue(error.message || 'Failed to add selling platform')
        }
    },
)

// Search selling platforms (for autocomplete functionality)
export const searchSellingPlatforms = createAsyncThunk(
    'constants/searchSellingPlatforms',
    async (searchTerm: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any
            const allNames = state.constants.sellingPlatforms.allNames || []

            if (!searchTerm.trim()) {
                return allNames
            }

            const filteredNames = allNames.filter((name: string) =>
                name.toLowerCase().includes(searchTerm.toLowerCase()),
            )

            console.log('🔍 Filtered selling platforms:', filteredNames.length, 'for term:', searchTerm)
            return filteredNames
        } catch (error: any) {
            console.error('❌ Error searching selling platforms:', error)
            return rejectWithValue(error.message || 'Failed to search selling platforms')
        }
    },
)
