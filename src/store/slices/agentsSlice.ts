import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { IInventory, IRequirement } from '../../data_types/acn/types'
import { fetchAgentDetails } from '../../services/acn/agents/agentThunkService'

interface PropertyData {
    inventories: IInventory[]
    requirements: IRequirement[]
    enquiries: any[]
}

interface AgentsState {
    resale: PropertyData
    rental: PropertyData
    loading: boolean
    error: string | null
}

const initialState: AgentsState = {
    resale: {
        inventories: [],
        requirements: [],
        enquiries: [],
    },
    rental: {
        inventories: [],
        requirements: [],
        enquiries: [],
    },
    loading: false,
    error: null,
}

const agentsSlice = createSlice({
    name: 'agents',
    initialState,
    reducers: {
        clearAgentDetails: (state) => {
            state.resale = initialState.resale
            state.rental = initialState.rental
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAgentDetails.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAgentDetails.fulfilled, (state, action) => {
                state.loading = false
                const { propertyType } = action.meta.arg
                const targetState = propertyType === 'Resale' ? state.resale : state.rental
                targetState.inventories = action.payload.inventories
                targetState.requirements = action.payload.requirements
                targetState.enquiries = action.payload.enquiries
                state.error = action.payload.error || null
            })
            .addCase(fetchAgentDetails.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Failed to fetch agent details'
            })
    },
})

export const { clearAgentDetails } = agentsSlice.actions

export default agentsSlice.reducer
