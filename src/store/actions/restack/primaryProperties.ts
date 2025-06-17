import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../../../firebase'
import type { PrimaryProperty } from '../../../data_types/restack/restack-primary'
import { SET_PRIMARY_PROPERTIES_FILTER, SET_PRIMARY_PROPERTIES_PAGE } from '../../actionTypes/primaryProperties'
import { createAsyncThunk } from '@reduxjs/toolkit'

export const fetchPrimaryProperties = createAsyncThunk<PrimaryProperty[], void, { rejectValue: string }>(
    'primary/fetchPrimaryProperties',
    async (_, { rejectWithValue }) => {
        try {
            const querySnapshot = await getDocs(collection(db, 'restack_primary_properties'))
            const properties = querySnapshot.docs.map((doc) => ({
                projectId: doc.id,
                ...doc.data(),
            })) as PrimaryProperty[]

            return properties
        } catch (error) {
            return rejectWithValue('Failed to fetch properties')
        }
    },
)

export const setPrimaryPropertiesFilter = (filter: string) => ({
    type: SET_PRIMARY_PROPERTIES_FILTER,
    payload: filter,
})

export const setPrimaryPropertiesPage = (page: number) => ({
    type: SET_PRIMARY_PROPERTIES_PAGE,
    payload: page,
})

export const fetchPrimaryPropertyById = createAsyncThunk<PrimaryProperty, string, { rejectValue: string }>(
    'primary/fetchPrimaryPropertyById',
    async (id: string, { rejectWithValue }) => {
        try {
            const docRef = doc(db, 'restack_primary_properties', id)
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
            return rejectWithValue('Failed to fetch property')
        }
    },
)
