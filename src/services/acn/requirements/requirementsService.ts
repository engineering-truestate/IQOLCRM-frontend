// store/services/requirementsService.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../../../firebase' // Adjust path to your Firebase config
import { type IRequirement } from '../../../store/reducers/acn/requirementsTypes'

// Fetch requirement by ID thunk
export const fetchRequirementById = createAsyncThunk(
    'requirements/fetchById',
    async (requirementId: string, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching requirement with ID:', requirementId)

            const docRef = doc(db, 'acn-requirements', requirementId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data() as IRequirement
                console.log('✅ Requirement data fetched successfully:', data)
                return { id: docSnap.id, ...data }
            } else {
                console.log('❌ No requirement found with ID:', requirementId)
                throw new Error(`Requirement with ID ${requirementId} not found`)
            }
        } catch (error: any) {
            console.error('❌ Error fetching requirement:', error)
            return rejectWithValue(error.message || 'Failed to fetch requirement')
        }
    },
)

export const updateRequirement = createAsyncThunk(
    'requirements/update',
    async ({ id, updates }: { id: string; updates: Partial<IRequirement> }, { rejectWithValue }) => {
        try {
            console.log('📝 Updating requirement:', id, updates)

            const docRef = doc(db, 'acn-requirements', id)
            await updateDoc(docRef, {
                ...updates,
                lastModified: Date.now(),
            })

            console.log('✅ Requirement updated successfully')
            return { id, updates: { ...updates, lastModified: Date.now() } }
        } catch (error: any) {
            console.error('❌ Error updating requirement:', error)
            return rejectWithValue(error.message || 'Failed to update requirement')
        }
    },
)

export const addPropertiesToRequirement = createAsyncThunk(
    'requirements/addMatchingProperties',
    async ({ requirementId, propertyIds }: { requirementId: string; propertyIds: string[] }, { rejectWithValue }) => {
        try {
            console.log('🏠 Adding properties to requirement:', requirementId, propertyIds)

            const docRef = doc(db, 'acn-requirements', requirementId)

            // Use arrayUnion to add property IDs without duplicates
            await updateDoc(docRef, {
                matchingProperties: arrayUnion(...propertyIds),
                lastModified: Date.now(),
            })

            console.log('✅ Properties added to requirement successfully')
            return { requirementId, addedPropertyIds: propertyIds }
        } catch (error: any) {
            console.error('❌ Error adding properties to requirement:', error)
            return rejectWithValue(error.message || 'Failed to add properties to requirement')
        }
    },
)
