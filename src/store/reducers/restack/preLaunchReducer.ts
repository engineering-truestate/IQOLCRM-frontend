import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PropertyState, Property, PropertyFilters } from './preLaunchtypes'

const initialState: PropertyState = {
    properties: [],
    selectedProperty: null,
    loading: false,
    error: null,
    filters: {},
}

const preLaunchSlice = createSlice({
    name: 'preLaunch',
    initialState,
    reducers: {
        // Fetch Properties
        fetchPreLaunchPropertyRequest(state) {
            state.loading = true
            state.error = null
        },
        fetchPreLaunchPropertySuccess(state, action: PayloadAction<Property[]>) {
            state.loading = false
            state.properties = action.payload
            state.error = null
        },
        fetchPreLaunchPropertyFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        // Add Property
        addPreLaunchPropertyRequest(state) {
            state.loading = true
            state.error = null
        },
        addPreLaunchPropertySuccess(state, action: PayloadAction<Property>) {
            state.loading = false
            state.properties.push(action.payload)
            state.error = null
        },
        addPreLaunchPropertyFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        // Update Property
        updatePreLaunchPropertyRequest(state) {
            state.loading = true
            state.error = null
        },
        updatePreLaunchPropertySuccess(state, action: PayloadAction<Property>) {
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
        updatePreLaunchPropertyFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        // Delete Property
        deletePreLaunchPropertyRequest(state) {
            state.loading = true
            state.error = null
        },
        deletePreLaunchPropertySuccess(state, action: PayloadAction<string>) {
            state.loading = false
            state.properties = state.properties.filter((prop) => prop.projectId !== action.payload)
            // Clear selected property if it was deleted
            if (state.selectedProperty?.projectId === action.payload) {
                state.selectedProperty = null
            }
            state.error = null
        },
        deletePreLaunchPropertyFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        // Select Property
        selectPreLaunchProperty(state, action: PayloadAction<Property>) {
            state.selectedProperty = action.payload
        },
        clearSelectedPreLaunchProperty(state) {
            state.selectedProperty = null
        },

        // Filters
        setPreLaunchPropertyFilters(state, action: PayloadAction<PropertyFilters>) {
            state.filters = { ...state.filters, ...action.payload }
        },
        clearPreLaunchPropertyFilters(state) {
            state.filters = {}
        },

        // Clear Error
        clearError(state) {
            state.error = null
        },
    },
})

export const {
    fetchPreLaunchPropertyRequest,
    fetchPreLaunchPropertySuccess,
    fetchPreLaunchPropertyFailure,
    addPreLaunchPropertyRequest,
    addPreLaunchPropertySuccess,
    addPreLaunchPropertyFailure,
    updatePreLaunchPropertyRequest,
    updatePreLaunchPropertySuccess,
    updatePreLaunchPropertyFailure,
    deletePreLaunchPropertyRequest,
    deletePreLaunchPropertySuccess,
    deletePreLaunchPropertyFailure,
    selectPreLaunchProperty,
    clearSelectedPreLaunchProperty,
    setPreLaunchPropertyFilters,
    clearPreLaunchPropertyFilters,
    clearError,
} = preLaunchSlice.actions

export default preLaunchSlice.reducer
