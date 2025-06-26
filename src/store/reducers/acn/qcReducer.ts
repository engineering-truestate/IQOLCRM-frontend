// store/reducers/qcReducer.ts
import { createSlice } from '@reduxjs/toolkit'
import type {
    BaseQCInventory,
    QCInventoryState,
    AddNoteResponse,
    UpdateStatusResponse,
} from '../../../data_types/acn/types'
import {
    fetchQCInventoryById,
    updateQCStatusWithRoleCheck,
    addQCInventoryNote,
    addQCInventory,
    updateQCInventory,
} from '../../../services/acn/qc/qcService'

const initialState: QCInventoryState = {
    qcInventories: [],
    currentQCInventory: null,
    selectedInventory: null,
    loading: false,
    error: null,
    lastFetch: null,
    updateLoading: false,
    noteLoading: false,
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
        setSelectedInventory: (state, action) => {
            state.selectedInventory = action.payload
        },
        clearSelectedInventory: (state) => {
            state.selectedInventory = null
        },
        resetLoadingStates: (state) => {
            state.loading = false
            state.updateLoading = false
            state.noteLoading = false
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch QC Inventory
            .addCase(fetchQCInventoryById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchQCInventoryById.fulfilled, (state, action) => {
                const payload = action.payload as BaseQCInventory
                state.loading = false
                state.currentQCInventory = payload
                // state.lastFetch = new Date()
                state.error = null

                // Update or add to qcInventories array
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

            // Add QC Inventory
            .addCase(addQCInventory.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(addQCInventory.fulfilled, (state, action) => {
                const payload = action.payload as BaseQCInventory
                state.loading = false
                state.currentQCInventory = payload
                state.qcInventories.push(payload)
                // state.lastFetch = new Date()
                state.error = null
            })
            .addCase(addQCInventory.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // Update QC Inventory
            .addCase(updateQCInventory.pending, (state) => {
                state.updateLoading = true
                state.error = null
            })
            .addCase(updateQCInventory.fulfilled, (state, action) => {
                const payload = action.payload as BaseQCInventory
                state.updateLoading = false
                state.currentQCInventory = payload
                // state.lastFetch = new Date()
                state.error = null

                // Update in qcInventories array
                const index = state.qcInventories.findIndex((qc) => qc.propertyId === payload.propertyId)
                if (index !== -1) {
                    state.qcInventories[index] = payload
                }

                // Update selected inventory if it matches
                if (state.selectedInventory?.propertyId === payload.propertyId) {
                    state.selectedInventory = payload
                }
            })
            .addCase(updateQCInventory.rejected, (state, action) => {
                state.updateLoading = false
                state.error = action.payload as string
            })

            // Update QC Status with Role Check (handles both KAM and Data Team updates)
            .addCase(updateQCStatusWithRoleCheck.pending, (state) => {
                state.updateLoading = true
                state.error = null
            })
            .addCase(updateQCStatusWithRoleCheck.fulfilled, (state, action) => {
                state.updateLoading = false
                const { propertyId, updates, propertyCreated } = action.payload as UpdateStatusResponse

                // Update current QC inventory
                if (state.currentQCInventory?.propertyId === propertyId) {
                    state.currentQCInventory = { ...state.currentQCInventory, ...updates }
                }

                // Update selected inventory
                if (state.selectedInventory?.propertyId === propertyId) {
                    state.selectedInventory = { ...state.selectedInventory, ...updates }
                }

                // Update in qcInventories array
                const index = state.qcInventories.findIndex((qc) => qc.propertyId === propertyId)
                if (index !== -1) {
                    state.qcInventories[index] = { ...state.qcInventories[index], ...updates }
                }

                state.error = null

                // Log property creation for debugging
                if (propertyCreated) {
                    console.log('Property created successfully for:', propertyId)
                }
            })
            .addCase(updateQCStatusWithRoleCheck.rejected, (state, action) => {
                state.updateLoading = false
                state.error = action.payload as string
            })

            // Add Note
            .addCase(addQCInventoryNote.pending, (state) => {
                state.noteLoading = true
                state.error = null
            })
            .addCase(addQCInventoryNote.fulfilled, (state, action) => {
                state.noteLoading = false
                const { propertyId, note } = action.payload as AddNoteResponse

                // Update current QC inventory notes
                if (state.currentQCInventory?.propertyId === propertyId) {
                    state.currentQCInventory.notes = [...(state.currentQCInventory.notes || []), note]
                    state.currentQCInventory.lastModified = note.timestamp
                }

                // Update selected inventory notes
                if (state.selectedInventory?.propertyId === propertyId) {
                    state.selectedInventory.notes = [...(state.selectedInventory.notes || []), note]
                    state.selectedInventory.lastModified = note.timestamp
                }

                // Update in qcInventories array
                const index = state.qcInventories.findIndex((qc) => qc.propertyId === propertyId)
                if (index !== -1) {
                    state.qcInventories[index].notes = [...(state.qcInventories[index].notes || []), note]
                    state.qcInventories[index].lastModified = note.timestamp
                }

                state.error = null
            })
            .addCase(addQCInventoryNote.rejected, (state, action) => {
                state.noteLoading = false
                state.error = action.payload as string
            })
    },
})

export const {
    clearCurrentQCInventory,
    clearError,
    setCurrentQCInventory,
    setSelectedInventory,
    clearSelectedInventory,
    resetLoadingStates,
} = qcSlice.actions

export default qcSlice.reducer
