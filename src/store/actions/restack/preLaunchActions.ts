import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Property, PropertyFilters } from '../../reducers/restack/preLaunchtypes'
import {
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
} from '../../reducers/restack/preLaunchReducer'
import PreLaunchService from '../../../services/restack/preLaunchService'
import type { AppDispatch } from '../../index'

// Async thunk for fetching pre-launch properties
export const fetchPreLaunchProperties = createAsyncThunk(
    'preLaunch/fetchProperties',
    async (_: PropertyFilters | undefined, { dispatch, rejectWithValue }) => {
        try {
            dispatch(fetchPreLaunchPropertyRequest())

            const properties = await PreLaunchService.fetchProperties()

            dispatch(fetchPreLaunchPropertySuccess(properties))
            return properties
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch properties'
            dispatch(fetchPreLaunchPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for adding a pre-launch property
export const addPreLaunchProperty = createAsyncThunk(
    'preLaunch/addProperty',
    async (propertyData: Omit<Property, 'projectId' | 'createdAt' | 'lastUpdated'>, { dispatch, rejectWithValue }) => {
        try {
            dispatch(addPreLaunchPropertyRequest())

            const newProperty = await PreLaunchService.addProperty(propertyData)

            dispatch(addPreLaunchPropertySuccess(newProperty))
            return newProperty
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add property'
            dispatch(addPreLaunchPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for updating a pre-launch property
export const updatePreLaunchProperty = createAsyncThunk(
    'preLaunch/updateProperty',
    async (
        { projectId, updates }: { projectId: string; updates: Partial<Property> },
        { dispatch, rejectWithValue },
    ) => {
        try {
            dispatch(updatePreLaunchPropertyRequest())

            const updatedProperty = await PreLaunchService.updateProperty(projectId, updates)

            dispatch(updatePreLaunchPropertySuccess(updatedProperty))
            return updatedProperty
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update property'
            dispatch(updatePreLaunchPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for deleting a pre-launch property
export const deletePreLaunchProperty = createAsyncThunk(
    'preLaunch/deleteProperty',
    async (projectId: string, { dispatch, rejectWithValue }) => {
        try {
            dispatch(deletePreLaunchPropertyRequest())

            await PreLaunchService.deleteProperty(projectId)

            dispatch(deletePreLaunchPropertySuccess(projectId))
            return projectId
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete property'
            dispatch(deletePreLaunchPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for deleting a pre-launch property by ID
export const deletePreLaunchPropertyById = createAsyncThunk(
    'preLaunch/deletePropertyById',
    async (projectId: string, { dispatch, rejectWithValue }) => {
        try {
            dispatch(deletePreLaunchPropertyRequest())

            await PreLaunchService.deleteProperty(projectId)

            dispatch(deletePreLaunchPropertySuccess(projectId))
            return projectId
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete property'
            dispatch(deletePreLaunchPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Async thunk for getting a single pre-launch property by ID
export const getPreLaunchPropertyById = createAsyncThunk(
    'preLaunch/getPropertyById',
    async (projectId: string, { dispatch, rejectWithValue }) => {
        try {
            dispatch(fetchPreLaunchPropertyRequest())

            const property = await PreLaunchService.getPropertyById(projectId)

            dispatch(fetchPreLaunchPropertySuccess([property]))
            return property
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch property'
            dispatch(fetchPreLaunchPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)
export const getPreLaunchPropertyByName = createAsyncThunk(
    'preLaunch/getPropertyByName',
    async (projectName: string, { dispatch, rejectWithValue }) => {
        try {
            dispatch(fetchPreLaunchPropertyRequest())

            const property = await PreLaunchService.getPropertyByName(projectName)

            if (property) {
                dispatch(fetchPreLaunchPropertySuccess([property]))
                return property
            } else {
                const errorMessage = 'Property not found'
                dispatch(fetchPreLaunchPropertyFailure(errorMessage))
                return rejectWithValue(errorMessage)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch property'
            dispatch(fetchPreLaunchPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)
// You should create a new action for handling property names if needed, or just return the string[] result.
export const getPreLaunchAllPropertyName = createAsyncThunk(
    'preLaunch/getAllPropertyName',
    async (_: PropertyFilters | undefined, { rejectWithValue }) => {
        try {
            const propertyNames = await PreLaunchService.getAllPropertyName()

            return propertyNames
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch property'
            // Optionally dispatch a failure action if needed
            // dispatch(fetchPreLaunchPropertyFailure(errorMessage))
            return rejectWithValue(errorMessage)
        }
    },
)

// Synchronous action creators (these don't need thunks)
export const selectProperty = (property: Property) => (dispatch: AppDispatch) => {
    dispatch(selectPreLaunchProperty(property))
}

export const clearSelectedProperty = () => (dispatch: AppDispatch) => {
    dispatch(clearSelectedPreLaunchProperty())
}

export const setFilters = (filters: PropertyFilters) => (dispatch: AppDispatch) => {
    dispatch(setPreLaunchPropertyFilters(filters))
}

export const clearFilters = () => (dispatch: AppDispatch) => {
    dispatch(clearPreLaunchPropertyFilters())
}

export const clearErrorState = () => (dispatch: AppDispatch) => {
    dispatch(clearError())
}

// Export all action creators for easy import
export const preLaunchActions = {
    fetchPreLaunchProperties,
    addPreLaunchProperty,
    updatePreLaunchProperty,
    deletePreLaunchProperty,
    getPreLaunchPropertyById,
    selectProperty,
    clearSelectedProperty,
    setFilters,
    clearFilters,
    clearErrorState,
    deletePreLaunchPropertyById,
}
