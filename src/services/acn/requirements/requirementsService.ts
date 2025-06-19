// store/services/requirementsService.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../../../firebase' // Adjust path to your Firebase config
import { type IRequirement } from '../../../store/reducers/acn/requirementsTypes'
import { getUnixDateTime } from '../../../components/helper/getUnixDateTime'
import type { INote } from '../../../data_types/acn/types'

// Fetch requirement by ID thunk
export const fetchRequirementById = createAsyncThunk(
    'requirements/fetchById',
    async (requirementId: string, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching requirement with ID:', requirementId)

            const docRef = doc(db, 'acnRequirements', requirementId)
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

            const docRef = doc(db, 'acnRequirements', id)
            await updateDoc(docRef, {
                ...updates,
                lastModified: getUnixDateTime(),
            })

            console.log('✅ Requirement updated successfully')
            return { id, updates: { ...updates, lastModified: getUnixDateTime() } }
        } catch (error: any) {
            console.error('❌ Error updating requirement:', error)
            return rejectWithValue(error.message || 'Failed to update requirement')
        }
    },
)

export const updateRequirementStatus = createAsyncThunk(
    'requirements/updateStatus',
    async (
        {
            id,
            status,
            type,
        }: {
            id: string
            status: string
            type: 'requirement' | 'internal'
        },
        { rejectWithValue },
    ) => {
        try {
            console.log('📝 Updating requirement status:', id, status, type)

            const docRef = doc(db, 'acnRequirements', id)
            const updateField = type === 'requirement' ? 'requirementStatus' : 'internalStatus'

            // Update the document
            await updateDoc(docRef, {
                [updateField]: status,
                lastModified: getUnixDateTime(),
            })

            // Fetch the updated document
            const updatedDoc = await getDoc(docRef)
            if (!updatedDoc.exists()) {
                throw new Error('Requirement not found after update')
            }

            const updatedData = updatedDoc.data() as IRequirement
            console.log('✅ Requirement status updated successfully:', updatedData)

            return {
                id,
                updates: {
                    ...updatedData,
                    lastModified: getUnixDateTime(),
                },
            }
        } catch (error: any) {
            console.error('❌ Error updating requirement status:', error)
            return rejectWithValue(error.message || 'Failed to update requirement status')
        }
    },
)

export const addNoteToRequirement = createAsyncThunk(
    'requirements/addNote',
    async (
        {
            requirementId,
            note,
        }: {
            requirementId: string
            note: Omit<INote, 'id' | 'timestamp'>
        },
        { rejectWithValue },
    ) => {
        try {
            console.log('📝 Adding note to requirement:', requirementId, note)

            const docRef = doc(db, 'acnRequirements', requirementId)
            const newNote: INote = {
                ...note,
                id: `note_${Date.now()}`,
                timestamp: getUnixDateTime(),
            }

            await updateDoc(docRef, {
                notes: arrayUnion(newNote),
                lastModified: getUnixDateTime(),
            })

            console.log('✅ Note added successfully')
            return { requirementId, note: newNote }
        } catch (error: any) {
            console.error('❌ Error adding note:', error)
            return rejectWithValue(error.message || 'Failed to add note')
        }
    },
)

export const removeNoteFromRequirement = createAsyncThunk(
    'requirements/removeNote',
    async (
        {
            requirementId,
            noteId,
        }: {
            requirementId: string
            noteId: string
        },
        { rejectWithValue },
    ) => {
        try {
            console.log('🗑️ Removing note from requirement:', requirementId, noteId)

            const docRef = doc(db, 'acnRequirements', requirementId)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists()) {
                throw new Error('Requirement not found')
            }

            const data = docSnap.data() as IRequirement
            const updatedNotes = (data.notes || []).filter((note) => note.id !== noteId)

            await updateDoc(docRef, {
                notes: updatedNotes,
                lastModified: getUnixDateTime(),
            })

            console.log('✅ Note removed successfully')
            return { requirementId, noteId }
        } catch (error: any) {
            console.error('❌ Error removing note:', error)
            return rejectWithValue(error.message || 'Failed to remove note')
        }
    },
)

export const addPropertiesToRequirement = createAsyncThunk(
    'requirements/addMatchingProperties',
    async ({ requirementId, propertyIds }: { requirementId: string; propertyIds: string[] }, { rejectWithValue }) => {
        try {
            console.log('🏠 Adding properties to requirement:', requirementId, propertyIds)

            const docRef = doc(db, 'acnRequirements', requirementId)

            // Use arrayUnion to add property IDs without duplicates
            await updateDoc(docRef, {
                matchingProperties: arrayUnion(...propertyIds),
                lastModified: getUnixDateTime(),
            })

            console.log('✅ Properties added to requirement successfully')
            return { requirementId, addedPropertyIds: propertyIds }
        } catch (error: any) {
            console.error('❌ Error adding properties to requirement:', error)
            return rejectWithValue(error.message || 'Failed to add properties to requirement')
        }
    },
)
