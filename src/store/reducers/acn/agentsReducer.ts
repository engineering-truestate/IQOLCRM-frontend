import { createSlice } from '@reduxjs/toolkit'
import type { IInventory, IRequirement } from '../../../data_types/acn/types'

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

const initialPropertyData: PropertyData = {
    inventories: [],
    requirements: [],
    enquiries: [],
}

const initialState: AgentsState = {
    resale: { ...initialPropertyData },
    rental: { ...initialPropertyData },
    loading: false,
    error: null,
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
    },
    extraReducers: (builder) => {
        builder
            .addCase('agents/fetchAgentDetails/pending', (state) => {
                state.loading = true
                state.error = null
            })
            .addCase('agents/fetchAgentDetails/fulfilled', (state, action) => {
                state.loading = false
                const { propertyType } = action.meta.arg
                const targetState = propertyType === 'Resale' ? state.resale : state.rental
                targetState.inventories = action.payload.inventories
                targetState.requirements = action.payload.requirements
                targetState.enquiries = action.payload.enquiries
                state.error = action.payload.error || null
            })
            .addCase('agents/fetchAgentDetails/rejected', (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Failed to fetch agent details'
            })
    },
})

export const { clearAgentDetails } = agentsSlice.actions
export default agentsSlice.reducer
