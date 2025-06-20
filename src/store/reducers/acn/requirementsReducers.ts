// store/reducers/requirementsReducer.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type IRequirement } from '../../../store/reducers/acn/requirementsTypes'
import {
    fetchRequirementById,
    updateRequirement,
    addPropertiesToRequirement,
    createRequirement,
} from '../../../services/acn/requirements/requirementsService'

interface RequirementState {
    requirements: IRequirement[]
    currentRequirement: IRequirement | null
    loading: boolean
    updating: boolean
    addingProperties: boolean
    error: string | null
    lastFetch: Date | null
}

const initialState: RequirementState = {
    requirements: [],
    currentRequirement: null,
    loading: false,
    updating: false,
    addingProperties: false,
    error: null,
    lastFetch: null,
}

const requirementsSlice = createSlice({
    name: 'requirements',
    initialState,
    reducers: {
        clearCurrentRequirement: (state) => {
            console.log('🧹 Clearing current requirement from state')
            state.currentRequirement = null
            state.error = null
        },
        clearError: (state) => {
            console.log('🧹 Clearing requirement error')
            state.error = null
        },
        setCurrentRequirement: (state, action: PayloadAction<IRequirement>) => {
            console.log('📋 Setting current requirement:', action.payload.requirementId)
            state.currentRequirement = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            // Existing cases...
            .addCase(fetchRequirementById.pending, (state) => {
                console.log('⏳ Fetch requirement by ID - pending')
                state.loading = true
                state.error = null
            })
            .addCase(fetchRequirementById.fulfilled, (state, action: PayloadAction<IRequirement>) => {
                console.log('✅ Fetch requirement by ID - fulfilled:', action.payload.requirementId)
                state.loading = false
                state.currentRequirement = action.payload
                state.lastFetch = new Date()
                state.error = null

                const index = state.requirements.findIndex((req) => req.requirementId === action.payload.requirementId)
                if (index !== -1) {
                    state.requirements[index] = action.payload
                }
            })
            .addCase(fetchRequirementById.rejected, (state, action) => {
                console.log('❌ Fetch requirement by ID - rejected:', action.payload)
                state.loading = false
                state.error = action.payload as string
                state.currentRequirement = null
            })

            .addCase(updateRequirement.pending, (state) => {
                console.log('⏳ Update requirement - pending')
                state.updating = true
                state.error = null
            })
            .addCase(updateRequirement.fulfilled, (state, action) => {
                console.log('✅ Update requirement - fulfilled:', action.payload)
                state.updating = false

                if (state.currentRequirement && state.currentRequirement.requirementId === action.payload.id) {
                    state.currentRequirement = { ...state.currentRequirement, ...action.payload.updates }
                }

                const index = state.requirements.findIndex((req) => req.requirementId === action.payload.id)
                if (index !== -1) {
                    state.requirements[index] = { ...state.requirements[index], ...action.payload.updates }
                }
            })
            .addCase(updateRequirement.rejected, (state, action) => {
                console.log('❌ Update requirement - rejected:', action.payload)
                state.updating = false
                state.error = action.payload as string
            })

            // NEW: Add properties cases
            .addCase(addPropertiesToRequirement.pending, (state) => {
                console.log('⏳ Add properties to requirement - pending')
                state.addingProperties = true
                state.error = null
            })
            .addCase(addPropertiesToRequirement.fulfilled, (state, action) => {
                console.log('✅ Add properties to requirement - fulfilled:', action.payload)
                state.addingProperties = false

                // Update current requirement's matching properties
                if (
                    state.currentRequirement &&
                    state.currentRequirement.requirementId === action.payload.requirementId
                ) {
                    const currentProperties = state.currentRequirement.matchingProperties || []
                    const newProperties = [...new Set([...currentProperties, ...action.payload.addedPropertyIds])]
                    state.currentRequirement = {
                        ...state.currentRequirement,
                        matchingProperties: newProperties,
                        lastModified: Date.now(),
                    }
                }

                // Update in requirements array
                const index = state.requirements.findIndex((req) => req.requirementId === action.payload.requirementId)
                if (index !== -1) {
                    const currentProperties = state.requirements[index].matchingProperties || []
                    const newProperties = [...new Set([...currentProperties, ...action.payload.addedPropertyIds])]
                    state.requirements[index] = {
                        ...state.requirements[index],
                        matchingProperties: newProperties,
                        lastModified: Date.now(),
                    }
                }
            })
            .addCase(addPropertiesToRequirement.rejected, (state, action) => {
                console.log('❌ Add properties to requirement - rejected:', action.payload)
                state.addingProperties = false
                state.error = action.payload as string
            })
            .addCase(createRequirement.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createRequirement.fulfilled, (state, action) => {
                state.loading = false
                state.requirements.unshift(action.payload) // Add to beginning of array
                state.currentRequirement = action.payload
            })
            .addCase(createRequirement.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

        // // BONUS: Remove properties cases
        // .addCase(removePropertiesFromRequirement.pending, (state) => {
        //     console.log('⏳ Remove properties from requirement - pending')
        //     state.updating = true
        //     state.error = null
        // })
        // .addCase(removePropertiesFromRequirement.fulfilled, (state, action) => {
        //     console.log('✅ Remove properties from requirement - fulfilled:', action.payload)
        //     state.updating = false

        //     // Update current requirement's matching properties
        //     if (state.currentRequirement && state.currentRequirement.requirementId === action.payload.requirementId) {
        //         const currentProperties = state.currentRequirement.matchingProperties || []
        //         const newProperties = currentProperties.filter(id => !action.payload.removedPropertyIds.includes(id))
        //         state.currentRequirement = {
        //             ...state.currentRequirement,
        //             matchingProperties: newProperties,
        //             lastModified: Date.now()
        //         }
        //     }

        //     // Update in requirements array
        //     const index = state.requirements.findIndex(req => req.requirementId === action.payload.requirementId)
        //     if (index !== -1) {
        //         const currentProperties = state.requirements[index].matchingProperties || []
        //         const newProperties = currentProperties.filter(id => !action.payload.removedPropertyIds.includes(id))
        //         state.requirements[index] = {
        //             ...state.requirements[index],
        //             matchingProperties: newProperties,
        //             lastModified: Date.now()
        //         }
        //     }
        // })
        // .addCase(removePropertiesFromRequirement.rejected, (state, action) => {
        //     console.log('❌ Remove properties from requirement - rejected:', action.payload)
        //     state.updating = false
        //     state.error = action.payload as string
        // })
    },
})

export const { clearCurrentRequirement, clearError, setCurrentRequirement } = requirementsSlice.actions
export default requirementsSlice.reducer
