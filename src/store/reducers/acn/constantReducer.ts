import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
    fetchMicromarkets,
    fetchBuilderNames,
    addBuilderName,
    searchBuilderNames,
    fetchSellingPlatforms,
    addSellingPlatform,
    searchSellingPlatforms,
} from '../../../services/acn/constants/constantService'

interface Micromarket {
    name: string
    zone: string
}

interface BuilderNamesState {
    names: string[]
    userAdded: string[]
    allNames: string[]
    filteredNames: string[]
}

interface SellingPlatformsState {
    names: string[]
    userAdded: string[]
    allNames: string[]
    filteredNames: string[]
}

interface ConstantsState {
    micromarkets: Micromarket[]
    builderNames: BuilderNamesState
    sellingPlatforms: SellingPlatformsState
    loading: {
        micromarkets: boolean
        builderNames: boolean
        addingBuilder: boolean
        searching: boolean
        sellingPlatforms: boolean
        addingPlatform: boolean
        searchingPlatforms: boolean
    }
    error: {
        micromarkets: string | null
        builderNames: string | null
        addingBuilder: string | null
        searching: string | null
        sellingPlatforms: string | null
        addingPlatform: string | null
        searchingPlatforms: string | null
    }
}

const initialState: ConstantsState = {
    micromarkets: [],
    builderNames: {
        names: [],
        userAdded: [],
        allNames: [],
        filteredNames: [],
    },
    sellingPlatforms: {
        names: [],
        userAdded: [],
        allNames: [],
        filteredNames: [],
    },
    loading: {
        micromarkets: false,
        builderNames: false,
        addingBuilder: false,
        searching: false,
        sellingPlatforms: false,
        addingPlatform: false,
        searchingPlatforms: false,
    },
    error: {
        micromarkets: null,
        builderNames: null,
        addingBuilder: null,
        searching: null,
        sellingPlatforms: null,
        addingPlatform: null,
        searchingPlatforms: null,
    },
}

const constantsSlice = createSlice({
    name: 'constants',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = {
                micromarkets: null,
                builderNames: null,
                addingBuilder: null,
                searching: null,
                sellingPlatforms: null,
                addingPlatform: null,
                searchingPlatforms: null,
            }
        },
        clearFilteredBuilderNames: (state) => {
            state.builderNames.filteredNames = []
        },
        setFilteredBuilderNames: (state, action: PayloadAction<string[]>) => {
            state.builderNames.filteredNames = action.payload
        },
        clearFilteredSellingPlatforms: (state) => {
            state.sellingPlatforms.filteredNames = []
        },
        setFilteredSellingPlatforms: (state, action: PayloadAction<string[]>) => {
            state.sellingPlatforms.filteredNames = action.payload
        },
        resetFilteredSellingPlatforms: (state) => {
            state.sellingPlatforms.filteredNames = state.sellingPlatforms.allNames
        },
    },
    extraReducers: (builder) => {
        // Fetch Micromarkets
        builder
            .addCase(fetchMicromarkets.pending, (state) => {
                state.loading.micromarkets = true
                state.error.micromarkets = null
            })
            .addCase(fetchMicromarkets.fulfilled, (state, action) => {
                state.loading.micromarkets = false
                state.micromarkets = action.payload
            })
            .addCase(fetchMicromarkets.rejected, (state, action) => {
                state.loading.micromarkets = false
                state.error.micromarkets = action.payload as string
            })

        // Fetch Builder Names
        builder
            .addCase(fetchBuilderNames.pending, (state) => {
                state.loading.builderNames = true
                state.error.builderNames = null
            })
            .addCase(fetchBuilderNames.fulfilled, (state, action) => {
                state.loading.builderNames = false
                state.builderNames = {
                    ...action.payload,
                    filteredNames: action.payload.allNames,
                }
            })
            .addCase(fetchBuilderNames.rejected, (state, action) => {
                state.loading.builderNames = false
                state.error.builderNames = action.payload as string
            })

        // Add Builder Name
        builder
            .addCase(addBuilderName.pending, (state) => {
                state.loading.addingBuilder = true
                state.error.addingBuilder = null
            })
            .addCase(addBuilderName.fulfilled, (state, action) => {
                state.loading.addingBuilder = false
                // Add to user_added and allNames arrays
                state.builderNames.userAdded.push(action.payload)
                state.builderNames.allNames.push(action.payload)
                state.builderNames.filteredNames = state.builderNames.allNames
            })
            .addCase(addBuilderName.rejected, (state, action) => {
                state.loading.addingBuilder = false
                state.error.addingBuilder = action.payload as string
            })

        // Search Builder Names
        builder
            .addCase(searchBuilderNames.pending, (state) => {
                state.loading.searching = true
                state.error.searching = null
            })
            .addCase(searchBuilderNames.fulfilled, (state, action) => {
                state.loading.searching = false
                state.builderNames.filteredNames = action.payload
            })
            .addCase(searchBuilderNames.rejected, (state, action) => {
                state.loading.searching = false
                state.error.searching = action.payload as string
            })

        // Fetch Selling Platforms
        builder
            .addCase(fetchSellingPlatforms.pending, (state) => {
                state.loading.sellingPlatforms = true
                state.error.sellingPlatforms = null
            })
            .addCase(fetchSellingPlatforms.fulfilled, (state, action) => {
                state.loading.sellingPlatforms = false
                state.sellingPlatforms = {
                    ...action.payload,
                    filteredNames: action.payload.allNames,
                }
            })
            .addCase(fetchSellingPlatforms.rejected, (state, action) => {
                state.loading.sellingPlatforms = false
                state.error.sellingPlatforms = action.payload as string
            })

        // Add Selling Platform
        builder
            .addCase(addSellingPlatform.pending, (state) => {
                state.loading.addingPlatform = true
                state.error.addingPlatform = null
            })
            .addCase(addSellingPlatform.fulfilled, (state, action) => {
                state.loading.addingPlatform = false
                // Add to user_added and allNames arrays
                state.sellingPlatforms.userAdded.push(action.payload)
                state.sellingPlatforms.allNames.push(action.payload)
                state.sellingPlatforms.filteredNames = state.sellingPlatforms.allNames
            })
            .addCase(addSellingPlatform.rejected, (state, action) => {
                state.loading.addingPlatform = false
                state.error.addingPlatform = action.payload as string
            })

        // Search Selling Platforms
        builder
            .addCase(searchSellingPlatforms.pending, (state) => {
                state.loading.searchingPlatforms = true
                state.error.searchingPlatforms = null
            })
            .addCase(searchSellingPlatforms.fulfilled, (state, action) => {
                state.loading.searchingPlatforms = false
                state.sellingPlatforms.filteredNames = action.payload
            })
            .addCase(searchSellingPlatforms.rejected, (state, action) => {
                state.loading.searchingPlatforms = false
                state.error.searchingPlatforms = action.payload as string
            })
    },
})

export const {
    clearErrors,
    clearFilteredBuilderNames,
    setFilteredBuilderNames,
    clearFilteredSellingPlatforms,
    setFilteredSellingPlatforms,
    resetFilteredSellingPlatforms,
} = constantsSlice.actions

export default constantsSlice.reducer
