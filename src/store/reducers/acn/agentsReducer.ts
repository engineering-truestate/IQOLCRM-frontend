import { createSlice } from '@reduxjs/toolkit'
import type { IAgent, IInventory, IRequirement } from '../../../data_types/acn/types'
import {
    fetchAgentDetails,
    fetchAgentByPhone,
    fetchAgentWithConnectHistory,
    addCallResultToAgent,
    addNoteToAgent,
    fetchAgentWithNotes,
    addAgentWithVerification,
    updateAgentDetailsThunk,
    updateAgentCreditsThunk,
    fetchAgentByCpId,
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
    currentAgent: IAgent | null
    resale: PropertyData
    rental: PropertyData
    loading: boolean
    error: string | null
    fetchLoading: boolean
    fetchError: string | null
    connectHistoryLoading: boolean
    connectHistoryError: string | null
    currentAgentConnectHistory: any[]
    notesLoading: boolean
    notesError: string | null
    agentNotes: Record<string, any[]> // Store notes by cpId
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
    notesLoading: false,
    notesError: null,
    agentNotes: {}, // Initialize as empty object
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
        clearAgentNotes: (state) => {
            state.agentNotes = {}
            state.notesError = null
        },
        updateCurrentAgent: (state, action) => {
            if (state.currentAgent) {
                state.currentAgent = { ...state.currentAgent, ...action.payload }
            }
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
                state.currentAgent = action.payload as unknown as IAgent
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
                // If action.payload is a single object, push it to the array
                state.currentAgentConnectHistory.push(action.payload)
            })
            .addCase(addCallResultToAgent.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(fetchAgentWithNotes.pending, (state) => {
                state.notesLoading = true
                state.notesError = null
            })
            .addCase(fetchAgentWithNotes.fulfilled, (state, action) => {
                state.notesLoading = false
                state.agentNotes[action.payload.cpId] = action.payload.notes
            })
            .addCase(fetchAgentWithNotes.rejected, (state, action) => {
                state.notesLoading = false
                state.notesError = action.payload as string
            })
            .addCase(addNoteToAgent.pending, (state) => {
                state.notesLoading = true
                state.notesError = null
            })
            .addCase(addNoteToAgent.fulfilled, (state, action) => {
                state.notesLoading = false
                state.agentNotes[action.payload.cpId] = action.payload.allNotes
            })
            .addCase(addNoteToAgent.rejected, (state, action) => {
                state.notesLoading = false
                state.notesError = action.payload as string
            })
            .addCase(addAgentWithVerification.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(addAgentWithVerification.fulfilled, (state) => {
                state.loading = false
                //state.agents.push(action.payload.agentData)
            })
            .addCase(addAgentWithVerification.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(updateAgentDetailsThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateAgentDetailsThunk.fulfilled, (state) => {
                state.loading = false
                state.error = null
            })
            .addCase(updateAgentDetailsThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(updateAgentCreditsThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateAgentCreditsThunk.fulfilled, (state) => {
                state.loading = false
                state.error = null
            })
            .addCase(updateAgentCreditsThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(fetchAgentByCpId.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAgentByCpId.fulfilled, (state, action) => {
                state.loading = false
                state.currentAgent = action.payload
                state.error = null
            })
            .addCase(fetchAgentByCpId.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const selectNotesByCpId = (state: RootState, cpId: string) => {
    return state?.agents?.agentNotes?.[cpId] || []
}

export const selectAgentNotesLoading = (state: RootState) => {
    return state?.agents?.notesLoading || false
}

export const selectAgentConnectHistoryLoading = (state: RootState) => state.agents.connectHistoryLoading

export const {
    clearAgentDetails,
    clearCurrentAgent,
    clearAgentError,
    clearAgentNotes,
    clearAgentConnectHistory,
    updateCurrentAgent,
} = agentsSlice.actions
export default agentsSlice.reducer
