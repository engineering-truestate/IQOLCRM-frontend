import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface AgentDetails {
    id: string
    name: string
    email: string
    phone: string
    status: string
    createdAt: number
    updatedAt: number
    [key: string]: any // Allow additional properties
}

interface AgentDetailsState {
    data: AgentDetails | null
    loading: boolean
    error: string | null
}

const initialState: AgentDetailsState = {
    data: null,
    loading: false,
    error: null,
}

const agentDetailsSlice = createSlice({
    name: 'agentDetails',
    initialState,
    reducers: {
        setSelectedAgent: (state, action: PayloadAction<AgentDetails>) => {
            state.data = action.payload
            state.loading = false
            state.error = null
        },
        fetchAgentDetailsStart: (state) => {
            state.loading = true
            state.error = null
        },
        fetchAgentDetailsSuccess: (state, action: PayloadAction<AgentDetails>) => {
            state.loading = false
            state.data = action.payload
            state.error = null
        },
        fetchAgentDetailsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
    },
})

export const { setSelectedAgent, fetchAgentDetailsStart, fetchAgentDetailsSuccess, fetchAgentDetailsFailure } =
    agentDetailsSlice.actions

export default agentDetailsSlice.reducer
