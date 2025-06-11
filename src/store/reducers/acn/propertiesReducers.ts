import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PropertiesState, IInventory } from '../types'
import { QueryDocumentSnapshot } from 'firebase/firestore'

const initialState: PropertiesState = {
    properties: [],
    currentProperty: null,
    loading: false,
    error: null,
    totalFetched: 0,
    lastDocument: null,
    hasMore: false,
    isLoadingMore: false,
}

const propertiesSlice = createSlice({
    name: 'properties',
    initialState,
    reducers: {
        fetchPropertiesStart(state) {
            state.loading = true
            state.error = null
        },
        fetchPropertiesSuccess(state, action: PayloadAction<{ properties: IInventory[]; total: number }>) {
            state.loading = false
            state.properties = action.payload.properties
            state.totalFetched = action.payload.total
            state.lastDocument = null
            state.hasMore = false
            state.isLoadingMore = false
            state.error = null
        },
        fetchPropertiesFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.error = action.payload
        },

        fetchPropertiesBatchStart(state) {
            state.loading = true
            state.error = null
            state.isLoadingMore = false
        },
        fetchPropertiesBatchMore(state) {
            state.loading = true
            state.error = null
            state.isLoadingMore = true
        },
        fetchPropertiesBatchSuccess(
            state,
            action: PayloadAction<{
                properties: IInventory[]
                lastDocument: QueryDocumentSnapshot<IInventory> | null
                hasMore: boolean
                isLoadingMore: boolean
                batchSize: number
            }>,
        ) {
            const { properties, lastDocument, hasMore, isLoadingMore, batchSize } = action.payload

            if (isLoadingMore) {
                state.properties = [...state.properties, ...properties]
                state.totalFetched += batchSize
            } else {
                state.properties = properties
                state.totalFetched = batchSize
            }

            state.lastDocument = lastDocument
            state.hasMore = hasMore
            state.isLoadingMore = false
        },
        fetchPropertiesBatchFailure(state, action: PayloadAction<string>) {
            state.loading = false
            state.isLoadingMore = false
            state.error = action.payload
        },

        // Keep other cases...
        setCurrentProperty(state, action: PayloadAction<IInventory | null>) {
            state.currentProperty = action.payload
        },
        clearProperties(state) {
            state.properties = []
            state.currentProperty = null
            state.totalFetched = 0
            state.lastDocument = null
            state.hasMore = false
            state.isLoadingMore = false
            state.loading = false
            state.error = null
        },
        resetPropertiesPagination(state) {
            state.lastDocument = null
            state.hasMore = false
            state.isLoadingMore = false
        },
    },
})

export const {
    fetchPropertiesStart,
    fetchPropertiesSuccess,
    fetchPropertiesFailure,
    fetchPropertiesBatchStart,
    fetchPropertiesBatchMore,
    fetchPropertiesBatchSuccess,
    fetchPropertiesBatchFailure,
    setCurrentProperty,
    clearProperties,
    resetPropertiesPagination,
} = propertiesSlice.actions

export default propertiesSlice.reducer
