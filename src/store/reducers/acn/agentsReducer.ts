import { createSlice } from '@reduxjs/toolkit'
import type { IInventory, IRequirement } from '../../../data_types/acn/types'
import { fetchAgentDetails, fetchAgentByPhone } from '../../../services/acn/agents/agentThunkService'

interface AgentInfo {
    cpId: string
    agentName: string
    phoneNumber: string
}

interface PropertyData {
    inventories: IInventory[]
    requirements: IRequirement[]
    enquiries: any[]
}

interface AgentsState {
    currentAgent: AgentInfo | null
    resale: PropertyData
    rental: PropertyData
    loading: boolean
    error: string | null
    fetchLoading: boolean
    fetchError: string | null
}

const initialPropertyData: PropertyData = {
    inventories: [],
    requirements: [],
    enquiries: [],
}

const initialState: AgentsState = {
    currentAgent: null,
    resale: { ...initialPropertyData },
    rental: { ...initialPropertyData },
    loading: false,
    error: null,
    fetchLoading: false,
    fetchError: null,
}

const agentsSlice = createSlice({
    name: 'agents',
    initialState,
    reducers: {
        clearAgentDetails: (state) => {
            state.resale = { ...initialPropertyData }
            state.rental = { ...initialPropertyData }
            state.error = null
        },
        clearCurrentAgent: (state) => {
            state.currentAgent = null
            state.fetchError = null
        },
        clearAgentError: (state) => {
            state.error = null
            state.fetchError = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Existing fetchAgentDetails cases
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
            // New fetchAgentByPhone cases
            .addCase(fetchAgentByPhone.pending, (state) => {
                state.fetchLoading = true
                state.fetchError = null
            })
            .addCase(fetchAgentByPhone.fulfilled, (state, action) => {
                state.fetchLoading = false
                state.currentAgent = action.payload
            })
            .addCase(fetchAgentByPhone.rejected, (state, action) => {
                state.fetchLoading = false
                state.fetchError = action.payload as string
            })
    },
})

export const { clearAgentDetails, clearCurrentAgent, clearAgentError } = agentsSlice.actions
export default agentsSlice.reducer
