import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PostReraProperty, PostReraPropertyFilters, PostReraPropertyState } from './postReraTypes'

const initialState: PostReraPropertyState = {
    properties: [],
    selectedProperty: null,
    loading: false,
    error: null,
    filters: {} as PostReraPropertyFilters,
}

const postReraSlice = createSlice({
    name: 'postRera',
    initialState,
    reducers: {
        // Fetch Properties
        fetchPostReraPropertyRequest(state) {
            state.loading = true
            state.error = null
        },
        fetchPostReraPropertySuccess(state, action: PayloadAction<PostReraProperty[]>) {
            state.loading = false
            state.properties = action.payload
            state.selectedProperty = action.payload[0] || null
            state.error = null
        },
        fetchPostReraPropertyFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        // Add Property
        addPostReraPropertyRequest(state) {
            state.loading = true
            state.error = null
        },
        addPostReraPropertySuccess(state, action: PayloadAction<PostReraProperty>) {
            state.loading = false
            state.properties.push(action.payload)
            state.error = null
        },
        addPostReraPropertyFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        // Update Property
        updatePostReraPropertyRequest(state) {
            state.loading = true
            state.error = null
        },
        updatePostReraPropertySuccess(state, action: PayloadAction<PostReraProperty>) {
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
        updatePostReraPropertyFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        // Delete Property
        deletePostReraPropertyRequest(state) {
            state.loading = true
            state.error = null
        },
        deletePostReraPropertySuccess(state, action: PayloadAction<string>) {
            state.loading = false
            state.properties = state.properties.filter((prop) => prop.projectId !== action.payload)
            // Clear selected property if it was deleted
            if (state.selectedProperty?.projectId === action.payload) {
                state.selectedProperty = null
            }
            state.error = null
        },
        deletePostReraPropertyFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        // Select Property
        selectPostReraProperty(state, action: PayloadAction<PostReraProperty>) {
            state.selectedProperty = action.payload
        },
        clearSelectedPostReraProperty(state) {
            state.selectedProperty = null
        },

        // Filters
        setPostReraPropertyFilters(state, action: PayloadAction<PostReraPropertyFilters>) {
            state.filters = { ...state.filters, ...action.payload }
        },
        clearPostReraPropertyFilters(state) {
            state.filters = {}
        },

        // Clear Error
        clearError(state) {
            state.error = null
        },
    },
})

export const {
    fetchPostReraPropertyRequest,
    fetchPostReraPropertySuccess,
    fetchPostReraPropertyFailure,
    addPostReraPropertyRequest,
    addPostReraPropertySuccess,
    addPostReraPropertyFailure,
    updatePostReraPropertyRequest,
    updatePostReraPropertySuccess,
    updatePostReraPropertyFailure,
    deletePostReraPropertyRequest,
    deletePostReraPropertySuccess,
    deletePostReraPropertyFailure,
    selectPostReraProperty,
    clearSelectedPostReraProperty,
    setPostReraPropertyFilters,
    clearPostReraPropertyFilters,
    clearError,
} = postReraSlice.actions

export default postReraSlice.reducer
