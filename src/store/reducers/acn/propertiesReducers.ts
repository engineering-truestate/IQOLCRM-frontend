// store/reducers/propertiesReducer.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IInventory, PropertiesState } from './propertiesTypes'
import {
    fetchPropertyById,
    fetchPropertiesByIds,
    addProperty,
    updateProperty,
    updatePropertyStatus,
} from '../../../services/acn/properties/propertiesService'

const initialState: PropertiesState = {
    // Original properties state
    properties: [],
    currentProperty: null,
    loading: false,
    error: null,
    totalFetched: 0,
    lastDocument: null,
    hasMore: true,
    isLoadingMore: false,

    // Algolia search state
    searchResults: [],
    totalHits: 0,
    totalPages: 0,
    currentPage: 0,
    facets: {},
    processingTime: 0,
    searching: false,
    searchQuery: '',
    activeFilters: {},
    facetValues: {},
}

const propertiesSlice = createSlice({
    name: 'properties',
    initialState,
    reducers: {
        clearCurrentProperty: (state) => {
            console.log('🧹 Clearing current property from state')
            state.currentProperty = null
            state.error = null
        },
        clearError: (state) => {
            console.log('🧹 Clearing properties error')
            state.error = null
        },
        setCurrentProperty: (state, action: PayloadAction<IInventory>) => {
            console.log('📋 Setting current property:', action.payload.propertyId)
            state.currentProperty = action.payload
        },
        clearProperties: (state) => {
            console.log('🧹 Clearing all properties from state')
            state.properties = []
            state.totalFetched = 0
            state.lastDocument = null
            state.hasMore = true
        },
        // Algolia search reducers
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload
        },
        setActiveFilters: (state, action: PayloadAction<Record<string, any>>) => {
            state.activeFilters = action.payload
        },
        clearFilters: (state) => {
            state.activeFilters = {}
            state.searchQuery = ''
        },
        clearSearchResults: (state) => {
            state.searchResults = []
            state.totalHits = 0
            state.totalPages = 0
            state.currentPage = 0
        },
        setSearchResults: (
            state,
            action: PayloadAction<{
                hits: IInventory[]
                nbHits: number
                nbPages: number
                page: number
                facets: Record<string, Record<string, number>>
                processingTimeMS: number
            }>,
        ) => {
            state.searchResults = action.payload.hits
            state.totalHits = action.payload.nbHits
            state.totalPages = action.payload.nbPages
            state.currentPage = action.payload.page
            state.facets = action.payload.facets
            state.processingTime = action.payload.processingTimeMS
        },
        setSearching: (state, action: PayloadAction<boolean>) => {
            state.searching = action.payload
        },
        setFacetValues: (
            state,
            action: PayloadAction<{
                facetName: string
                values: Record<string, number>
            }>,
        ) => {
            state.facetValues[action.payload.facetName] = action.payload.values
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch property by ID cases
            .addCase(fetchPropertyById.pending, (state) => {
                console.log('⏳ Fetch property by ID - pending')
                state.loading = true
                state.error = null
            })
            .addCase(fetchPropertyById.fulfilled, (state, action: PayloadAction<IInventory>) => {
                console.log('✅ Fetch property by ID - fulfilled:', action.payload.propertyId)
                state.loading = false
                state.currentProperty = action.payload
                state.error = null

                const index = state.properties.findIndex((prop) => prop.propertyId === action.payload.propertyId)
                if (index !== -1) {
                    state.properties[index] = action.payload
                } else {
                    state.properties.push(action.payload)
                    state.totalFetched += 1
                }
            })
            .addCase(fetchPropertyById.rejected, (state, action) => {
                console.log('❌ Fetch property by ID - rejected:', action.payload)
                state.loading = false
                state.error = action.payload as string
                state.currentProperty = null
            })

            // Fetch properties by IDs cases
            .addCase(fetchPropertiesByIds.pending, (state) => {
                console.log('⏳ Fetch properties by IDs - pending')
                state.isLoadingMore = true
                state.error = null
            })
            .addCase(fetchPropertiesByIds.fulfilled, (state, action: PayloadAction<IInventory[]>) => {
                console.log('✅ Fetch properties by IDs - fulfilled:', action.payload.length, 'properties')
                state.isLoadingMore = false

                action.payload.forEach((newProperty) => {
                    const existingIndex = state.properties.findIndex(
                        (prop) => prop.propertyId === newProperty.propertyId,
                    )
                    if (existingIndex !== -1) {
                        state.properties[existingIndex] = newProperty
                    } else {
                        state.properties.push(newProperty)
                    }
                })

                state.totalFetched = state.properties.length
                state.error = null
            })
            .addCase(fetchPropertiesByIds.rejected, (state, action) => {
                console.log('❌ Fetch properties by IDs - rejected:', action.payload)
                state.isLoadingMore = false
                state.error = action.payload as string
            })

            // Add property cases
            .addCase(addProperty.pending, (state) => {
                console.log('⏳ Add property - pending')
                state.loading = true
                state.error = null
            })
            .addCase(addProperty.fulfilled, (state, action: PayloadAction<IInventory>) => {
                console.log('✅ Add property - fulfilled:', action.payload.propertyId)
                state.loading = false
                state.properties.unshift(action.payload) // Add to beginning of array
                state.totalFetched += 1
                state.currentProperty = action.payload
                state.error = null
            })
            .addCase(addProperty.rejected, (state, action) => {
                console.log('❌ Add property - rejected:', action.payload)
                state.loading = false
                state.error = action.payload as string
            })

            // Update property cases
            .addCase(updateProperty.pending, (state) => {
                console.log('⏳ Update property - pending')
                state.loading = true
                state.error = null
            })
            .addCase(updateProperty.fulfilled, (state, action) => {
                console.log('✅ Update property - fulfilled:', action.payload)
                state.loading = false

                const updateProperty = (property: IInventory) => {
                    if (property.id === action.payload.id) {
                        return { ...property, ...action.payload.updates }
                    }
                    return property
                }

                state.properties = state.properties.map(updateProperty)

                if (state.currentProperty && state.currentProperty.id === action.payload.id) {
                    state.currentProperty = updateProperty(state.currentProperty)
                }

                state.searchResults = state.searchResults.map(updateProperty)
                state.error = null
            })
            .addCase(updateProperty.rejected, (state, action) => {
                console.log('❌ Update property - rejected:', action.payload)
                state.loading = false
                state.error = action.payload as string
            })

            // Update property status cases
            .addCase(updatePropertyStatus.pending, (state) => {
                console.log('⏳ Update property status - pending')
            })
            .addCase(updatePropertyStatus.fulfilled, (state, action) => {
                console.log('✅ Update property status - fulfilled:', action.payload)

                const updateProperty = (property: IInventory) => {
                    if (property.propertyId === action.payload.propertyId) {
                        return { ...property, status: action.payload.status, currentStatus: action.payload.status }
                    }
                    return property
                }

                state.properties = state.properties.map(updateProperty)

                if (state.currentProperty && state.currentProperty.propertyId === action.payload.propertyId) {
                    state.currentProperty = updateProperty(state.currentProperty)
                }

                state.searchResults = state.searchResults.map(updateProperty)
            })
            .addCase(updatePropertyStatus.rejected, (state, action) => {
                console.log('❌ Update property status - rejected:', action.payload)
                state.error = action.payload as string
            })
    },
})

export const {
    clearCurrentProperty,
    clearError,
    setCurrentProperty,
    clearProperties,
    setSearchQuery,
    setActiveFilters,
    clearFilters,
    clearSearchResults,
    setSearchResults,
    setSearching,
    setFacetValues,
} = propertiesSlice.actions

export default propertiesSlice.reducer
