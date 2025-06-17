import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PreReraPropertyState, PreReraProperty, PreReraPropertyFilters } from './preReraTypes'

const initialState: PreReraPropertyState = {
    properties: [],
    selectedProperty: null,
    loading: false,
    error: null,
    filters: {},
}

const preReraSlice = createSlice({
    name: 'preRera',
    initialState,
    reducers: {
        // Fetch Properties
        fetchPreReraPropertyRequest(state) {
            state.loading = true
            state.error = null
        },
        fetchPreReraPropertySuccess(state, action: PayloadAction<PreReraProperty[]>) {
            state.loading = false
            state.properties = action.payload
            state.error = null
        },
        fetchPreReraPropertyFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        // Add Property
        addPreReraPropertyRequest(state) {
            state.loading = true
            state.error = null
        },
        addPreReraPropertySuccess(state, action: PayloadAction<PreReraProperty>) {
            state.loading = false
            state.properties.push(action.payload)
            state.error = null
        },
        addPreReraPropertyFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        // Update Property
        updatePreReraPropertyRequest(state) {
            state.loading = true
            state.error = null
        },
        updatePreReraPropertySuccess(state, action: PayloadAction<PreReraProperty>) {
            state.loading = false
            const index = state.properties.findIndex((prop) => prop.projectId === action.payload.projectId)
            if (index !== -1) {
                state.properties[index] = action.payload
            }
            // Update selected property if it's the same one
            if (state.selectedProperty?.projectId === action.payload.projectId) {
                state.selectedProperty = action.payload
            }
            state.error = null
        },
        updatePreReraPropertyFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        // Delete Property
        deletePreReraPropertyRequest(state) {
            state.loading = true
            state.error = null
        },
        deletePreReraPropertySuccess(state, action: PayloadAction<string>) {
            state.loading = false
            state.properties = state.properties.filter((prop) => prop.projectId !== action.payload)
            // Clear selected property if it was deleted
            if (state.selectedProperty?.projectId === action.payload) {
                state.selectedProperty = null
            }
            state.error = null
        },
        deletePreReraPropertyFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        // Select Property
        selectPreReraProperty(state, action: PayloadAction<PreReraProperty>) {
            state.selectedProperty = action.payload
        },
        clearSelectedPreReraProperty(state) {
            state.selectedProperty = null
        },

        // Filters
        setPreReraPropertyFilters(state, action: PayloadAction<PreReraPropertyFilters>) {
            state.filters = { ...state.filters, ...action.payload }
        },
        clearPreReraPropertyFilters(state) {
            state.filters = {}
        },

        // Clear Error
        clearError(state) {
            state.error = null
        },
    },
})

export const {
    fetchPreReraPropertyRequest,
    fetchPreReraPropertySuccess,
    fetchPreReraPropertyFailure,
    addPreReraPropertyRequest,
    addPreReraPropertySuccess,
    addPreReraPropertyFailure,
    updatePreReraPropertyRequest,
    updatePreReraPropertySuccess,
    updatePreReraPropertyFailure,
    deletePreReraPropertyRequest,
    deletePreReraPropertySuccess,
    deletePreReraPropertyFailure,
    selectPreReraProperty,
    clearSelectedPreReraProperty,
    setPreReraPropertyFilters,
    clearPreReraPropertyFilters,
    clearError,
} = preReraSlice.actions

export default preReraSlice.reducer
