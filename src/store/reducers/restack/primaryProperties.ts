import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { PrimaryProperty } from '../../../data_types/restack/restack-primary'
import { fetchPrimaryPropertyById, fetchPrimaryProperties } from '../../actions/restack/primaryProperties'

interface PrimaryPropertiesState {
    properties: PrimaryProperty[]
    currentProperty: PrimaryProperty | null
    loading: boolean
    error: string | null
    filter: string
    sortBy: keyof PrimaryProperty | null
    sortOrder: 'asc' | 'desc'
}

const initialState: PrimaryPropertiesState = {
    properties: [],
    currentProperty: null,
    loading: false,
    error: null,
    filter: '',
    sortBy: null,
    sortOrder: 'asc',
}

const primaryPropertiesSlice = createSlice({
    name: 'primaryProperties',
    initialState,
    reducers: {
        clearCurrentProperty: (state) => {
            state.currentProperty = null
            state.error = null
        },
        clearError: (state) => {
            state.error = null
        },
        setPrimaryPropertiesFilter: (state, action: PayloadAction<string>) => {
            state.filter = action.payload
        },
        setSortBy: (state, action: PayloadAction<keyof PrimaryProperty>) => {
            state.sortBy = action.payload
            // If sorting by the same field, toggle order
            if (state.sortBy === action.payload) {
                state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc'
            } else {
                // Default to ascending for new sort field
                state.sortOrder = 'asc'
            }
        },
        resetFilters: (state) => {
            state.filter = ''
            state.sortBy = null
            state.sortOrder = 'asc'
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
                state.error = action.payload || 'Failed to fetch properties'
                state.properties = []
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
                state.error = action.payload || 'Failed to fetch property'
                state.currentProperty = null
            })
    },
})

export const { clearCurrentProperty, clearError, setPrimaryPropertiesFilter, setSortBy, resetFilters } =
    primaryPropertiesSlice.actions

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
