import { createSlice } from '@reduxjs/toolkit'
import type { PrimaryProperty } from '../../../data_types/restack/restack-primary'
import {
    fetchPrimaryPropertyById,
    fetchPrimaryProperties,
    updatePrimaryProperty,
} from '../../actions/restack/primaryProperties'

export interface PrimaryPropertiesState {
    properties: PrimaryProperty[]
    currentProperty: PrimaryProperty | null
    loading: boolean
    error: string | null
    filter: string
    sortBy: keyof PrimaryProperty | null
    sortOrder: 'asc' | 'desc'
    pagination: {
        page: number
        limit: number
        total: number
    }
}

const initialState: PrimaryPropertiesState = {
    properties: [],
    currentProperty: null,
    loading: false,
    error: null,
    filter: '',
    sortBy: null,
    sortOrder: 'asc',
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
    },
}

const primaryPropertiesSlice = createSlice({
    name: 'primaryProperties',
    initialState,
    reducers: {
        clearCurrentProperty: (state) => {
            state.currentProperty = null
        },
        setFilter: (state, action) => {
            state.filter = action.payload
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload
        },
        setSortOrder: (state, action) => {
            state.sortOrder = action.payload
        },
        setPage: (state, action) => {
            state.pagination.page = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle fetchPrimaryProperties
            .addCase(fetchPrimaryProperties.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchPrimaryProperties.fulfilled, (state, action) => {
                state.loading = false
                state.properties = action.payload
                state.error = null
            })
            .addCase(fetchPrimaryProperties.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            // Handle fetchPrimaryPropertyById
            .addCase(fetchPrimaryPropertyById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchPrimaryPropertyById.fulfilled, (state, action) => {
                state.loading = false
                state.currentProperty = action.payload
                state.error = null
            })
            .addCase(fetchPrimaryPropertyById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            // Handle updatePrimaryProperty
            .addCase(updatePrimaryProperty.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updatePrimaryProperty.fulfilled, (state, action) => {
                const { projectId, updates } = action.payload
                const propertyIndex = state.properties.findIndex((p) => p.projectId === projectId)

                if (propertyIndex !== -1) {
                    // Merge the updates with the existing property
                    state.properties[propertyIndex] = {
                        ...state.properties[propertyIndex],
                        ...updates,
                    }
                }

                // Also update current property if it's the one being updated
                if (state.currentProperty && state.currentProperty.projectId === projectId) {
                    state.currentProperty = {
                        ...state.currentProperty,
                        ...updates,
                    }
                }

                state.loading = false
                state.error = null
            })
            .addCase(updatePrimaryProperty.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearCurrentProperty, setFilter, setSortBy, setSortOrder, setPage } = primaryPropertiesSlice.actions
export default primaryPropertiesSlice.reducer

export const selectFilteredAndSortedProperties = (state: { primaryProperties: PrimaryPropertiesState }) => {
    const { properties, filter, sortBy, sortOrder } = state.primaryProperties

    let filtered = properties

    // Apply filter
    if (filter) {
        filtered = properties.filter((property) =>
            Object.values(property).some((value) => String(value).toLowerCase().includes(filter.toLowerCase())),
        )
    }

    // Apply sorting
    if (sortBy) {
        filtered = [...filtered].sort((a, b) => {
            const aValue = a[sortBy]
            const bValue = b[sortBy]

            if (sortOrder === 'asc') {
                return String(aValue).localeCompare(String(bValue))
            }
            return String(bValue).localeCompare(String(aValue))
        })
    }

    return filtered
}
