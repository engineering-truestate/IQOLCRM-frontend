import { createSlice } from '@reduxjs/toolkit'
import type { IInventory, IRequirement } from '../../../data_types/acn/types'
import {
    fetchAgentDetails,
    fetchAgentByPhone,
    fetchAgentWithConnectHistory,
    addCallResultToAgent,
} from '../../../services/acn/agents/agentThunkService'
import type { RootState } from '../../index'

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
    connectHistoryLoading: boolean
    connectHistoryError: string | null
    currentAgentConnectHistory: any[]
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
    connectHistoryLoading: false,
    connectHistoryError: null,
    currentAgentConnectHistory: [],
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
        clearAgentConnectHistory: (state) => {
            state.currentAgentConnectHistory = []
            state.connectHistoryError = null
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
            .addCase(fetchAgentWithConnectHistory.pending, (state) => {
                state.connectHistoryLoading = true
                state.connectHistoryError = null
            })
            .addCase(fetchAgentWithConnectHistory.fulfilled, (state, action) => {
                state.connectHistoryLoading = false
                state.currentAgentConnectHistory = action.payload.contactHistory
            })
            .addCase(fetchAgentWithConnectHistory.rejected, (state, action) => {
                state.connectHistoryLoading = false
                state.connectHistoryError = action.payload as string
            })

            // Add call result to agent cases
            .addCase(addCallResultToAgent.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(addCallResultToAgent.fulfilled, (state, action) => {
                state.loading = false
                state.currentAgentConnectHistory = action.payload.contactHistory
            })
            .addCase(addCallResultToAgent.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const selectAgentConnectHistoryLoading = (state: RootState) => state.agents.connectHistoryLoading

export const { clearAgentDetails, clearCurrentAgent, clearAgentError } = agentsSlice.actions
export default agentsSlice.reducer
