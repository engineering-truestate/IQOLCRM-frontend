import { createAsyncThunk } from '@reduxjs/toolkit'
import type { PreReraProperty, PreReraPropertyFilters } from '../../reducers/restack/preReraTypes'
import {
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
} from '../../reducers/restack/preReraReducer'
import PreReraService from '../../../services/restack/preReraService'
import type { AppDispatch } from '../../index'

// Async thunk for fetching pre-rera properties
export const fetchPreReraProperties = createAsyncThunk(
    'preRera/fetchProperties',
    async (filters: PreReraPropertyFilters | undefined, { dispatch, rejectWithValue }) => {
        try {
            dispatch(fetchPreReraPropertyRequest())

            const properties = await PreReraService.fetchProperties(filters)

            dispatch(fetchPreReraPropertySuccess(properties))
            return properties
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch properties'
            dispatch(fetchPreReraPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for adding a pre-rera property
export const addPreReraProperty = createAsyncThunk(
    'preRera/addProperty',
    async (
        propertyData: Omit<PreReraProperty, 'projectId' | 'createdAt' | 'updatedAt'>,
        { dispatch, rejectWithValue },
    ) => {
        try {
            dispatch(addPreReraPropertyRequest())

            const newProperty = await PreReraService.addProperty(propertyData)

            dispatch(addPreReraPropertySuccess(newProperty))
            return newProperty
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add property'
            dispatch(addPreReraPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for updating a pre-rera property
export const updatePreReraProperty = createAsyncThunk(
    'preRera/updateProperty',
    async (
        { projectId, updates }: { projectId: string; updates: Partial<PreReraProperty> },
        { dispatch, rejectWithValue },
    ) => {
        try {
            dispatch(updatePreReraPropertyRequest())

            const updatedProperty = await PreReraService.updateProperty(projectId, updates)

            dispatch(updatePreReraPropertySuccess(updatedProperty))
            return updatedProperty
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update property'
            dispatch(updatePreReraPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for deleting a pre-rera property
export const deletePreReraProperty = createAsyncThunk(
    'preRera/deleteProperty',
    async (projectId: string, { dispatch, rejectWithValue }) => {
        try {
            dispatch(deletePreReraPropertyRequest())

            await PreReraService.deleteProperty(projectId)

            dispatch(deletePreReraPropertySuccess(projectId))
            return projectId
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete property'
            dispatch(deletePreReraPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for getting a single pre-rera property by ID
export const getPreReraPropertyById = createAsyncThunk(
    'preRera/getPropertyById',
    async (projectId: string, { dispatch, rejectWithValue }) => {
        try {
            dispatch(fetchPreReraPropertyRequest())

            const property = await PreReraService.getPropertyById(projectId)

            dispatch(fetchPreReraPropertySuccess([property]))
            return property
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch property'
            dispatch(fetchPreReraPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for searching pre-rera properties
export const searchPreReraProperties = createAsyncThunk(
    'preRera/searchProperties',
    async (searchTerm: string, { dispatch, rejectWithValue }) => {
        try {
            dispatch(fetchPreReraPropertyRequest())

            const properties = await PreReraService.searchProperties(searchTerm)

            dispatch(fetchPreReraPropertySuccess(properties))
            return properties
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to search properties'
            dispatch(fetchPreReraPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Synchronous action creators (these don't need thunks)
export const selectProperty = (property: PreReraProperty) => (dispatch: AppDispatch) => {
    dispatch(selectPreReraProperty(property))
}

export const clearSelectedProperty = () => (dispatch: AppDispatch) => {
    dispatch(clearSelectedPreReraProperty())
}

export const setFilters = (filters: PreReraPropertyFilters) => (dispatch: AppDispatch) => {
    dispatch(setPreReraPropertyFilters(filters))
}

export const clearFilters = () => (dispatch: AppDispatch) => {
    dispatch(clearPreReraPropertyFilters())
}

export const clearErrorState = () => (dispatch: AppDispatch) => {
    dispatch(clearError())
}

// Export all action creators for easy import
export const preReraActions = {
    fetchPreReraProperties,
    addPreReraProperty,
    updatePreReraProperty,
    deletePreReraProperty,
    getPreReraPropertyById,
    searchPreReraProperties,
    selectProperty,
    clearSelectedProperty,
    setFilters,
    clearFilters,
    clearErrorState,
}
