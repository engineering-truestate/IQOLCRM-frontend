// store/reducers/acn/leadsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type ILead } from '../../../services/acn/leads/algoliaLeadsService'
import {
    updateLeadStatus,
    updateLeadContactStatus,
    updateLeadKAM,
    updateLeadBooleanField,
    fetchLeadById,
    addCallResult,
    addNoteToLead,
    fetchLeadWithNotes,
    addCallResultToLead,
    fetchLeadWithConnectHistory,
    type NoteData,
    type CallResultData,
    fetchKAMOptions,
    verifyLeadAndCreateAgent,
    validateCSVData,
    addBulkLeads,
    addManualLead,
} from '../../../services/acn/leads/leadsService'

interface LeadsState {
    leads: Record<string, ILead>
    loading: boolean
    error: string | null
    updating: Record<string, boolean> // Track which leads are being updated
    // Notes state
    notesByLeadId: Record<string, NoteData[]>
    notesLoading: boolean
    notesError: string | null
    // Connect history state
    connectHistoryByLeadId: Record<string, CallResultData[]>
    connectHistoryLoading: boolean
    connectHistoryError: string | null
    // KAM options state
    kamOptions: Array<{ value: string; count: number }>
    kamOptionsLoading: boolean
    kamOptionsError: string | null
    // Agent verification state
    agentVerificationLoading: boolean
    agentVerificationError: string | null
    // Add lead state
    csvValidationLoading: boolean
    csvValidationError: string | null
    validatedCSVData: any[]
    bulkAddLoading: boolean
    bulkAddError: string | null
    manualAddLoading: boolean
    manualAddError: string | null
}

const initialState: LeadsState = {
    leads: {},
    loading: false,
    error: null,
    updating: {},
    // Notes initial state
    notesByLeadId: {},
    notesLoading: false,
    notesError: null,
    // Connect history initial state
    connectHistoryByLeadId: {},
    connectHistoryLoading: false,
    connectHistoryError: null,
    // KAM options initial state
    kamOptions: [],
    kamOptionsLoading: false,
    kamOptionsError: null,
    // Agent verification initial state
    agentVerificationLoading: false,
    agentVerificationError: null,

    csvValidationLoading: false,
    csvValidationError: null,
    validatedCSVData: [],
    bulkAddLoading: false,
    bulkAddError: null,
    manualAddLoading: false,
    manualAddError: null,
}

const leadsSlice = createSlice({
    name: 'leads',
    initialState,
    reducers: {
        // Synchronous reducers for immediate UI updates
        updateLeadLocal: (state, action: PayloadAction<{ leadId: string; updates: Partial<ILead> }>) => {
            const { leadId, updates } = action.payload
            if (state.leads[leadId]) {
                state.leads[leadId] = { ...state.leads[leadId], ...updates }
            }
        },
        setLeads: (state, action: PayloadAction<ILead[]>) => {
            state.leads = {}
            action.payload.forEach((lead) => {
                state.leads[lead.leadId] = lead
            })
        },
        clearError: (state) => {
            state.error = null
        },
        // Notes reducers
        clearNotesError: (state) => {
            state.notesError = null
        },
        clearNotes: (state) => {
            state.notesByLeadId = {}
        },
        // Connect history reducers
        clearConnectHistoryError: (state) => {
            state.connectHistoryError = null
        },
        clearConnectHistory: (state) => {
            state.connectHistoryByLeadId = {}
        },
        clearKAMOptionsError: (state) => {
            state.kamOptionsError = null
        },
        clearAgentVerificationError: (state) => {
            state.agentVerificationError = null
        },
        clearCSVValidationError: (state) => {
            state.csvValidationError = null
        },
        clearValidatedCSVData: (state) => {
            state.validatedCSVData = []
        },
        clearBulkAddError: (state) => {
            state.bulkAddError = null
        },
        clearManualAddError: (state) => {
            state.manualAddError = null
        },
    },
    extraReducers: (builder) => {
        // Update Lead Status
        builder
            .addCase(updateLeadStatus.pending, (state, action) => {
                const leadId = action.meta.arg.leadId
                state.updating[leadId] = true
                state.error = null
            })
            .addCase(updateLeadStatus.fulfilled, (state, action) => {
                const { leadId, status, lastModified } = action.payload
                state.updating[leadId] = false
                if (state.leads[leadId]) {
                    state.leads[leadId].leadStatus = status as any
                    state.leads[leadId].lastModified = lastModified
                }
            })
            .addCase(updateLeadStatus.rejected, (state, action) => {
                const leadId = action.meta.arg.leadId
                state.updating[leadId] = false
                state.error = action.payload as string
            })

        // Update Lead Contact Status
        builder
            .addCase(updateLeadContactStatus.pending, (state, action) => {
                const leadId = action.meta.arg.leadId
                state.updating[leadId] = true
                state.error = null
            })
            .addCase(updateLeadContactStatus.fulfilled, (state, action) => {
                const { leadId, contactStatus, lastModified } = action.payload
                state.updating[leadId] = false
                if (state.leads[leadId]) {
                    state.leads[leadId].contactStatus = contactStatus as any
                    state.leads[leadId].lastModified = lastModified
                }
            })
            .addCase(updateLeadContactStatus.rejected, (state, action) => {
                const leadId = action.meta.arg.leadId
                state.updating[leadId] = false
                state.error = action.payload as string
            })

        // Update Lead KAM
        builder
            .addCase(updateLeadKAM.pending, (state, action) => {
                const leadId = action.meta.arg.leadId
                state.updating[leadId] = true
                state.error = null
            })
            .addCase(updateLeadKAM.fulfilled, (state, action) => {
                const { leadId, kamName, kamId, lastModified } = action.payload
                state.updating[leadId] = false
                if (state.leads[leadId]) {
                    state.leads[leadId].kamName = kamName
                    state.leads[leadId].kamId = kamId
                    state.leads[leadId].lastModified = lastModified
                }
            })
            .addCase(updateLeadKAM.rejected, (state, action) => {
                const leadId = action.meta.arg.leadId
                state.updating[leadId] = false
                state.error = action.payload as string
            })

        // Update Lead Boolean Field
        builder
            .addCase(updateLeadBooleanField.pending, (state, action) => {
                const leadId = action.meta.arg.leadId
                state.updating[leadId] = true
                state.error = null
            })
            .addCase(updateLeadBooleanField.fulfilled, (state, action) => {
                const { leadId, field, value, lastModified } = action.payload
                state.updating[leadId] = false
                if (state.leads[leadId]) {
                    ;(state.leads[leadId] as any)[field] = value
                    state.leads[leadId].lastModified = lastModified
                }
            })
            .addCase(updateLeadBooleanField.rejected, (state, action) => {
                const leadId = action.meta.arg.leadId
                state.updating[leadId] = false
                state.error = action.payload as string
            })

        // Fetch Lead By ID
        builder
            .addCase(fetchLeadById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLeadById.fulfilled, (state, action) => {
                state.loading = false
                const lead = action.payload
                state.leads[lead.leadId] = lead
            })
            .addCase(fetchLeadById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

        // Legacy Add Call Result (keeping for compatibility)
        builder
            .addCase(addCallResult.pending, (state, action) => {
                const leadId = action.meta.arg.leadId
                state.updating[leadId] = true
                state.error = null
            })
            .addCase(addCallResult.fulfilled, (state, action) => {
                const { leadId, updateData } = action.payload
                state.updating[leadId] = false
                if (state.leads[leadId]) {
                    state.leads[leadId] = { ...state.leads[leadId], ...updateData }
                }
            })
            .addCase(addCallResult.rejected, (state, action) => {
                const leadId = action.meta.arg.leadId
                state.updating[leadId] = false
                state.error = action.payload as string
            })

        // Add Note to Lead
        builder
            .addCase(addNoteToLead.pending, (state) => {
                state.notesLoading = true
                state.notesError = null
            })
            .addCase(addNoteToLead.fulfilled, (state, action) => {
                state.notesLoading = false
                const { leadId, note, allNotes } = action.payload

                // Filter out archived notes and sort by timestamp (newest first)
                const activeNotes = allNotes
                    .filter((n: NoteData) => !n.archive)
                    .sort((a: NoteData, b: NoteData) => b.timestamp - a.timestamp)

                state.notesByLeadId[leadId] = activeNotes

                // Update the lead's lastModified if it exists in state
                if (state.leads[leadId]) {
                    state.leads[leadId].lastModified = Date.now()
                }
            })
            .addCase(addNoteToLead.rejected, (state, action) => {
                state.notesLoading = false
                state.notesError = action.payload as string
            })

        // Fetch Lead with Notes
        builder
            .addCase(fetchLeadWithNotes.pending, (state) => {
                state.notesLoading = true
                state.notesError = null
            })
            .addCase(fetchLeadWithNotes.fulfilled, (state, action) => {
                state.notesLoading = false
                const { leadId, notes } = action.payload
                state.notesByLeadId[leadId] = notes
            })
            .addCase(fetchLeadWithNotes.rejected, (state, action) => {
                state.notesLoading = false
                state.notesError = action.payload as string
            })

        // Add Call Result to Lead (New implementation with RNR logic)
        builder
            .addCase(addCallResultToLead.pending, (state) => {
                state.connectHistoryLoading = true
                state.connectHistoryError = null
            })
            .addCase(addCallResultToLead.fulfilled, (state, action) => {
                state.connectHistoryLoading = false
                const {
                    leadId,
                    callResult,
                    allConnectHistory,
                    allNotes,
                    updateData,
                    previousContactStatus,
                    newContactStatus,
                } = action.payload

                // Update connect history
                state.connectHistoryByLeadId[leadId] = allConnectHistory.sort(
                    (a: CallResultData, b: CallResultData) => b.timestamp - a.timestamp,
                )

                // Update notes if they were modified
                if (allNotes) {
                    const activeNotes = allNotes
                        .filter((n: NoteData) => !n.archive)
                        .sort((a: NoteData, b: NoteData) => b.timestamp - a.timestamp)
                    state.notesByLeadId[leadId] = activeNotes
                }

                // Update lead data if it exists in state
                if (state.leads[leadId]) {
                    state.leads[leadId] = { ...state.leads[leadId], ...updateData }
                    // Ensure contact status is properly updated
                    state.leads[leadId].contactStatus = newContactStatus as any
                }

                console.log(`Contact status updated from ${previousContactStatus} to ${newContactStatus}`)
            })
            .addCase(addCallResultToLead.rejected, (state, action) => {
                state.connectHistoryLoading = false
                state.connectHistoryError = action.payload as string
            })

        // Fetch Lead with Connect History
        builder
            .addCase(fetchLeadWithConnectHistory.pending, (state) => {
                state.connectHistoryLoading = true
                state.connectHistoryError = null
            })
            .addCase(fetchLeadWithConnectHistory.fulfilled, (state, action) => {
                state.connectHistoryLoading = false
                const { leadId, connectHistory } = action.payload
                state.connectHistoryByLeadId[leadId] = connectHistory
            })
            .addCase(fetchLeadWithConnectHistory.rejected, (state, action) => {
                state.connectHistoryLoading = false
                state.connectHistoryError = action.payload as string
            })
        builder
            .addCase(fetchKAMOptions.pending, (state) => {
                state.kamOptionsLoading = true
                state.kamOptionsError = null
            })
            .addCase(fetchKAMOptions.fulfilled, (state, action) => {
                state.kamOptionsLoading = false
                state.kamOptions = action.payload
            })
            .addCase(fetchKAMOptions.rejected, (state, action) => {
                state.kamOptionsLoading = false
                state.kamOptionsError = action.payload as string
            })

        // Verify Lead and Create Agent
        builder
            .addCase(verifyLeadAndCreateAgent.pending, (state) => {
                state.agentVerificationLoading = true
                state.agentVerificationError = null
            })
            .addCase(verifyLeadAndCreateAgent.fulfilled, (state, action) => {
                state.agentVerificationLoading = false
                const { leadId } = action.payload

                // Remove the lead from state since it's been converted to agent
                delete state.leads[leadId]

                // Clear related data
                delete state.notesByLeadId[leadId]
                delete state.connectHistoryByLeadId[leadId]
                delete state.updating[leadId]
            })
            .addCase(verifyLeadAndCreateAgent.rejected, (state, action) => {
                state.agentVerificationLoading = false
                state.agentVerificationError = action.payload as string
            })
        builder
            .addCase(validateCSVData.pending, (state) => {
                state.csvValidationLoading = true
                state.csvValidationError = null
            })
            .addCase(validateCSVData.fulfilled, (state, action) => {
                state.csvValidationLoading = false
                state.validatedCSVData = action.payload
            })
            .addCase(validateCSVData.rejected, (state, action) => {
                state.csvValidationLoading = false
                state.csvValidationError = action.payload as string
                state.validatedCSVData = []
            })

        // Add Bulk Leads
        builder
            .addCase(addBulkLeads.pending, (state) => {
                state.bulkAddLoading = true
                state.bulkAddError = null
            })
            .addCase(addBulkLeads.fulfilled, (state, action) => {
                state.bulkAddLoading = false
                // Add new leads to state
                action.payload.forEach((lead) => {
                    state.leads[lead.leadId] = lead as any
                })
                // Clear validated data after successful add
                state.validatedCSVData = []
            })
            .addCase(addBulkLeads.rejected, (state, action) => {
                state.bulkAddLoading = false
                state.bulkAddError = action.payload as string
            })

        // Add Manual Lead
        builder
            .addCase(addManualLead.pending, (state) => {
                state.manualAddLoading = true
                state.manualAddError = null
            })
            .addCase(addManualLead.fulfilled, (state, action) => {
                state.manualAddLoading = false
                // Add new lead to state
                const newLead = action.payload
                state.leads[newLead.leadId] = newLead as any
            })
            .addCase(addManualLead.rejected, (state, action) => {
                state.manualAddLoading = false
                state.manualAddError = action.payload as string
            })
    },
})

export const {
    updateLeadLocal,
    setLeads,
    clearError,
    clearNotesError,
    clearNotes,
    clearConnectHistoryError,
    clearConnectHistory,
    clearKAMOptionsError,
    clearAgentVerificationError,
    clearCSVValidationError,
    clearValidatedCSVData,
    clearBulkAddError,
    clearManualAddError,
} = leadsSlice.actions

export const selectKAMOptions = (state: { leads: LeadsState }) => state.leads.kamOptions
export const selectKAMOptionsLoading = (state: { leads: LeadsState }) => state.leads.kamOptionsLoading
export const selectKAMOptionsError = (state: { leads: LeadsState }) => state.leads.kamOptionsError
export const selectAgentVerificationLoading = (state: { leads: LeadsState }) => state.leads.agentVerificationLoading
export const selectAgentVerificationError = (state: { leads: LeadsState }) => state.leads.agentVerificationError

export const selectCSVValidationLoading = (state: { leads: LeadsState }) => state.leads.csvValidationLoading
export const selectCSVValidationError = (state: { leads: LeadsState }) => state.leads.csvValidationError
export const selectValidatedCSVData = (state: { leads: LeadsState }) => state.leads.validatedCSVData
export const selectBulkAddLoading = (state: { leads: LeadsState }) => state.leads.bulkAddLoading
export const selectBulkAddError = (state: { leads: LeadsState }) => state.leads.bulkAddError
export const selectManualAddLoading = (state: { leads: LeadsState }) => state.leads.manualAddLoading
export const selectManualAddError = (state: { leads: LeadsState }) => state.leads.manualAddError

// Lead Selectors
export const selectAllLeads = (state: { leads: LeadsState }) => Object.values(state.leads.leads)
export const selectLeadById = (state: { leads: LeadsState }, leadId: string) => state.leads.leads[leadId]
export const selectLeadsLoading = (state: { leads: LeadsState }) => state.leads.loading
export const selectLeadsError = (state: { leads: LeadsState }) => state.leads.error
export const selectLeadUpdating = (state: { leads: LeadsState }, leadId: string) =>
    state.leads.updating[leadId] || false

// Notes Selectors
export const selectNotesByLeadId = (state: { leads: LeadsState }, leadId: string) =>
    state.leads.notesByLeadId[leadId] || []

export const selectNotesLoading = (state: { leads: LeadsState }) => state.leads.notesLoading
export const selectNotesError = (state: { leads: LeadsState }) => state.leads.notesError

// Connect History Selectors
export const selectConnectHistoryByLeadId = (state: { leads: LeadsState }, leadId: string) =>
    state.leads.connectHistoryByLeadId[leadId] || []

export const selectConnectHistoryLoading = (state: { leads: LeadsState }) => state.leads.connectHistoryLoading
export const selectConnectHistoryError = (state: { leads: LeadsState }) => state.leads.connectHistoryError

// Combined Selectors
export const selectLeadWithNotes = (state: { leads: LeadsState }, leadId: string) => ({
    lead: state.leads.leads[leadId],
    notes: state.leads.notesByLeadId[leadId] || [],
    isLoading: state.leads.loading || state.leads.notesLoading,
    error: state.leads.error || state.leads.notesError,
})

export const selectLeadWithConnectHistory = (state: { leads: LeadsState }, leadId: string) => ({
    lead: state.leads.leads[leadId],
    connectHistory: state.leads.connectHistoryByLeadId[leadId] || [],
    isLoading: state.leads.loading || state.leads.connectHistoryLoading,
    error: state.leads.error || state.leads.connectHistoryError,
})

export const selectLeadComplete = (state: { leads: LeadsState }, leadId: string) => ({
    lead: state.leads.leads[leadId],
    notes: state.leads.notesByLeadId[leadId] || [],
    connectHistory: state.leads.connectHistoryByLeadId[leadId] || [],
    isLoading: state.leads.loading || state.leads.notesLoading || state.leads.connectHistoryLoading,
    isUpdating: state.leads.updating[leadId] || false,
    error: state.leads.error || state.leads.notesError || state.leads.connectHistoryError,
})

export default leadsSlice.reducer
