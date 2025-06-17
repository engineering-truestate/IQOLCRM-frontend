// store/reducers/qcReducer.ts
import { createSlice } from '@reduxjs/toolkit'
import type {
    BaseQCInventory,
    QCInventoryState,
    QCInventoryUpdate,
    UpdateQCStatusPayload,
} from '../../../data_types/acn/types'
import { fetchQCInventoryById, updateQCStatusWithRoleCheck } from '../../../services/acn/qc/qcService'

const initialState: QCInventoryState = {
    qcInventories: [],
    currentQCInventory: null,
    loading: false,
    error: null,
    lastFetch: null,
}

const qcSlice = createSlice({
    name: 'qc',
    initialState,
    reducers: {
        clearCurrentQCInventory: (state) => {
            state.currentQCInventory = null
            state.error = null
        },
        clearError: (state) => {
            state.error = null
        },
        setCurrentQCInventory: (state, action) => {
            state.currentQCInventory = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQCInventoryById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchQCInventoryById.fulfilled, (state, action) => {
                const payload = action.payload as unknown as BaseQCInventory
                state.loading = false
                state.currentQCInventory = payload
                state.lastFetch = new Date()
                state.error = null

                const index = state.qcInventories.findIndex((qc) => qc.propertyId === payload.propertyId)
                if (index !== -1) {
                    state.qcInventories[index] = payload
                } else {
                    state.qcInventories.push(payload)
                }
            })
            .addCase(fetchQCInventoryById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
                state.currentQCInventory = null
            })
            .addCase(updateQCStatusWithRoleCheck.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateQCStatusWithRoleCheck.fulfilled, (state, action) => {
                state.loading = false

                const { propertyId, updates } = action.payload as UpdateQCStatusPayload
                if (state.currentQCInventory?.propertyId === propertyId) {
                    state.currentQCInventory = { ...state.currentQCInventory, ...updates }
                }

                const index = state.qcInventories.findIndex((qc) => qc.propertyId === propertyId)
                if (index !== -1) {
                    state.qcInventories[index] = { ...state.qcInventories[index], ...updates }
                }

                state.error = null
            })
            .addCase(updateQCStatusWithRoleCheck.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearCurrentQCInventory, clearError, setCurrentQCInventory } = qcSlice.actions

export default qcSlice.reducer
