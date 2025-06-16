import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PrimaryProperty } from '../../../data_types/restack/restack-primary.types'

interface PreReraPropertiesState {
    properties: PrimaryProperty[]
    currentProperty: PrimaryProperty | null
    loading: boolean
    error: string | null
}

const initialState: PreReraPropertiesState = {
    properties: [],
    currentProperty: null,
    loading: false,
    error: null,
}

const preReraPropertiesSlice = createSlice({
    name: 'preReraProperties',
    initialState,
    reducers: {
        fetchPreReraPropertyRequest: (state) => {
            state.loading = true
            state.error = null
        },
        fetchPreReraPropertySuccess: (state, action: PayloadAction<PrimaryProperty>) => {
            state.loading = false
            state.currentProperty = action.payload
            state.error = null
        },
        fetchPreReraPropertyFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        clearCurrentProperty: (state) => {
            state.currentProperty = null
            state.error = null
        },
        updateProperty: (state, action: PayloadAction<Partial<PrimaryProperty>>) => {
            if (state.currentProperty) {
                state.currentProperty = { ...state.currentProperty, ...action.payload }
            }
        },
        updatePropertyField: (state, action: PayloadAction<{ field: string; value: any }>) => {
            if (state.currentProperty) {
                const { field, value } = action.payload
                state.currentProperty = {
                    ...state.currentProperty,
                    [field]: value,
                }
            }
        },
    },
})

export const {
    fetchPreReraPropertyRequest,
    fetchPreReraPropertySuccess,
    fetchPreReraPropertyFailure,
    clearCurrentProperty,
    updateProperty,
    updatePropertyField,
} = preReraPropertiesSlice.actions

export default preReraPropertiesSlice.reducer
