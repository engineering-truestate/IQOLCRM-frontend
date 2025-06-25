import { createAsyncThunk } from '@reduxjs/toolkit'

import type { AppDispatch } from '../../index'
import type { PostReraProperty, PostReraPropertyFilters } from '../../reducers/restack/postReraTypes'
import PostReraService from '../../../services/restack/postReraService'
import {
    addPostReraPropertyFailure,
    addPostReraPropertyRequest,
    addPostReraPropertySuccess,
    clearPostReraPropertyFilters,
    clearSelectedPostReraProperty,
    deletePostReraPropertyFailure,
    deletePostReraPropertyRequest,
    deletePostReraPropertySuccess,
    fetchPostReraPropertyFailure,
    fetchPostReraPropertyRequest,
    fetchPostReraPropertySuccess,
    selectPostReraProperty,
    setPostReraPropertyFilters,
    updatePostReraPropertyFailure,
    updatePostReraPropertyRequest,
    updatePostReraPropertySuccess,
} from '../../reducers/restack/postReraReducer'
import { clearError } from '../../reducers/acn/propertiesReducers'

// Async thunk for fetching post-rera properties
export const fetchPostReraProperties = createAsyncThunk(
    'postRera/fetchProperties',
    async (filters: PostReraPropertyFilters | undefined, { dispatch, rejectWithValue }) => {
        try {
            dispatch(fetchPostReraPropertyRequest())

            const properties = await PostReraService.fetchProperties(filters)

            dispatch(fetchPostReraPropertySuccess(properties))
            return properties
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch properties'
            dispatch(fetchPostReraPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for adding a post-rera property
export const addPostReraProperty = createAsyncThunk(
    'postRera/addProperty',
    async (
        propertyData: Omit<PostReraProperty, 'projectId' | 'createdAt' | 'updatedAt'>,
        { dispatch, rejectWithValue },
    ) => {
        try {
            dispatch(addPostReraPropertyRequest())

            const newProperty = await PostReraService.addProperty(propertyData)

            dispatch(addPostReraPropertySuccess(newProperty))
            return newProperty
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add property'
            dispatch(addPostReraPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for updating a post-rera property
export const updatePostReraProperty = createAsyncThunk(
    'postRera/updateProperty',
    async (
        { projectId, updates }: { projectId: string; updates: Partial<PostReraProperty> },
        { dispatch, rejectWithValue },
    ) => {
        try {
            dispatch(updatePostReraPropertyRequest())

            const updatedProperty = await PostReraService.updateProperty(projectId, updates)

            dispatch(updatePostReraPropertySuccess(updatedProperty))
            return updatedProperty
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update property'
            dispatch(updatePostReraPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for deleting a post-rera property
// export const deletePostReraProperty = createAsyncThunk(
//     'postRera/deleteProperty',
//     async (projectId: string, { dispatch, rejectWithValue }) => {
//         try {
//             dispatch(deletePostReraPropertyRequest())

//             await PostReraService.deleteProperty(projectId)

//             dispatch(deletePostReraPropertySuccess(projectId))
//             return projectId
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Failed to delete property'
//             dispatch(deletePostReraPropertyFailure(errorMessage))
//             return rejectWithValue(errorMessage)
//         }
//     },
// )

// Async thunk for getting a single post-rera property by ID
export const getPostReraPropertyById = createAsyncThunk(
    'postRera/getPropertyById',
    async (projectId: string, { dispatch, rejectWithValue }) => {
        try {
            dispatch(fetchPostReraPropertyRequest())

            const property = await PostReraService.getPropertyById(projectId)

            dispatch(fetchPostReraPropertySuccess([property]))
            return property
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch property'
            dispatch(fetchPostReraPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for searching post-rera properties
// export const searchPostReraProperties = createAsyncThunk(
//     'postRera/searchProperties',
//     async (searchTerm: string, { dispatch, rejectWithValue }) => {
//         try {
//             dispatch(fetchPostReraPropertyRequest())

//             const properties = await PostReraService.searchProperties(searchTerm)

//             dispatch(fetchPostReraPropertySuccess(properties))
//             return properties
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Failed to search properties'
//             dispatch(fetchPostReraPropertyFailure(errorMessage))
//             return rejectWithValue(errorMessage)
//         }
//     },
// )

// Synchronous action creators (these don't need thunks)
export const selectProperty = (property: PostReraProperty) => (dispatch: AppDispatch) => {
    dispatch(selectPostReraProperty(property))
}

export const clearSelectedProperty = () => (dispatch: AppDispatch) => {
    dispatch(clearSelectedPostReraProperty())
}

export const setFilters = (filters: PostReraPropertyFilters) => (dispatch: AppDispatch) => {
    dispatch(setPostReraPropertyFilters(filters))
}

export const clearFilters = () => (dispatch: AppDispatch) => {
    dispatch(clearPostReraPropertyFilters())
}

export const clearErrorState = () => (dispatch: AppDispatch) => {
    dispatch(clearError())
}

// Export all action creators for easy import
export const postReraActions = {
    fetchPostReraProperties,
    addPostReraProperty,
    updatePostReraProperty,
    // deletePostReraProperty,
    getPostReraPropertyById,
    // searchPostReraProperties,
    selectProperty,
    clearSelectedProperty,
    setFilters,
    clearFilters,
    clearErrorState,
}
