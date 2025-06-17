// store/reducers/qcReducer.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IQCInventory, QCInventoryState } from './qcTypes'
import { fetchQCInventoryById, updateQCStatusWithRoleCheck } from '../../../services/acn/qc/qcService'

const initialState: QCInventoryState = {
    qcInventories: [],
    currentQCInventory: null,
    loading: false,
    error: null,
    lastFetch: null, // Initialize as null
}

const qcSlice = createSlice({
    name: 'qc',
    initialState,
    reducers: {
        clearCurrentQCInventory: (state) => {
            console.log('🧹 Clearing current QC inventory from state')
            state.currentQCInventory = null
            state.error = null
        },
        clearError: (state) => {
            console.log('🧹 Clearing QC error')
            state.error = null
        },
        setCurrentQCInventory: (state, action: PayloadAction<IQCInventory>) => {
            console.log('📋 Setting current QC inventory:', action.payload.propertyId)
            state.currentQCInventory = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch QC inventory by ID cases
            .addCase(fetchQCInventoryById.pending, (state) => {
                console.log('⏳ Fetch QC inventory by ID - pending')
                state.loading = true
                state.error = null
            })
            .addCase(fetchQCInventoryById.fulfilled, (state, action: PayloadAction<IQCInventory>) => {
                console.log('✅ Fetch QC inventory by ID - fulfilled:', action.payload.propertyId)
                state.loading = false
                state.currentQCInventory = action.payload
                state.lastFetch = Date.now() // Store as Unix timestamp instead of Date object
                state.error = null

                const index = state.qcInventories.findIndex((qc) => qc.propertyId === action.payload.propertyId)
                if (index !== -1) {
                    state.qcInventories[index] = action.payload
                } else {
                    state.qcInventories.push(action.payload)
                }
            })
            .addCase(fetchQCInventoryById.rejected, (state, action) => {
                console.log('❌ Fetch QC inventory by ID - rejected:', action.payload)
                state.loading = false
                state.error = action.payload as string
                state.currentQCInventory = null
            })

            // Update QC status with role check cases
            .addCase(updateQCStatusWithRoleCheck.pending, (state) => {
                console.log('⏳ Update QC status with role check - pending')
                state.loading = true
                state.error = null
            })
            .addCase(updateQCStatusWithRoleCheck.fulfilled, (state, action) => {
                console.log('✅ Update QC status with role check - fulfilled:', action.payload)
                state.loading = false

                // Update current QC inventory if it matches
                if (state.currentQCInventory && state.currentQCInventory.propertyId === action.payload.propertyId) {
                    state.currentQCInventory = { ...state.currentQCInventory, ...action.payload.updates }
                }

                // Update in qcInventories array
                const index = state.qcInventories.findIndex((qc) => qc.propertyId === action.payload.propertyId)
                if (index !== -1) {
                    state.qcInventories[index] = { ...state.qcInventories[index], ...action.payload.updates }
                }

                state.error = null
            })
            .addCase(updateQCStatusWithRoleCheck.rejected, (state, action) => {
                console.log('❌ Update QC status with role check - rejected:', action.payload)
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearCurrentQCInventory, clearError, setCurrentQCInventory } = qcSlice.actions

export default qcSlice.reducer
