import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { IAgent, IInventory, IQCInventory, IRequirement } from '../../data_types/acn/types'
import { fetchAgentByCpId, fetchAgentDetails } from '../../services/acn/agents/agentThunkService'

interface PropertyData {
    inventories: IInventory[]
    requirements: IRequirement[]
    enquiries: any[]
    qc: IQCInventory[]
}

interface AgentsState {
    resale: PropertyData
    rental: PropertyData
    loading: boolean
    error: string | null
    agentDetails: IAgent
}

const initialState: AgentsState = {
    resale: {
        inventories: [],
        requirements: [],
        enquiries: [],
        qc: [],
    },
    rental: {
        inventories: [],
        requirements: [],
        enquiries: [],
        qc: [],
    },
    loading: false,
    error: null,
    agentDetails: {} as IAgent,
}

const agentsSlice = createSlice({
    name: 'agents',
    initialState,
    reducers: {
        clearAgentDetails: (state) => {
            state.resale = initialState.resale
            state.rental = initialState.rental
            state.error = null
            state.agentDetails = initialState.agentDetails
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
                targetState.qc = action.payload.qc
                state.error = action.payload.error || null
            })
            .addCase(fetchAgentDetails.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Failed to fetch agent details'
            })
            .addCase(fetchAgentByCpId.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAgentByCpId.fulfilled, (state, action) => {
                state.loading = false
                state.agentDetails = action.payload
            })
            .addCase(fetchAgentByCpId.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Failed to fetch agent details'
            })
    },
})

export const { clearAgentDetails } = agentsSlice.actions

export default agentsSlice.reducer
