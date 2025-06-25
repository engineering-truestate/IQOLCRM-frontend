import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
    fetchMicromarkets,
    fetchBuilderNames,
    addBuilderName,
    searchBuilderNames,
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

interface ConstantsState {
    micromarkets: Micromarket[]
    builderNames: BuilderNamesState
    loading: {
        micromarkets: boolean
        builderNames: boolean
        addingBuilder: boolean
        searching: boolean
    }
    error: {
        micromarkets: string | null
        builderNames: string | null
        addingBuilder: string | null
        searching: string | null
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
    loading: {
        micromarkets: false,
        builderNames: false,
        addingBuilder: false,
        searching: false,
    },
    error: {
        micromarkets: null,
        builderNames: null,
        addingBuilder: null,
        searching: null,
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
            }
        },
        clearFilteredBuilderNames: (state) => {
            state.builderNames.filteredNames = []
        },
        setFilteredBuilderNames: (state, action: PayloadAction<string[]>) => {
            state.builderNames.filteredNames = action.payload
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
    },
})

export const { clearErrors, clearFilteredBuilderNames, setFilteredBuilderNames } = constantsSlice.actions
export default constantsSlice.reducer
