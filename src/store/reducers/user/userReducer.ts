// store/reducers/userReducer.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { initializeAuthListener, fetchUserRoleByEmail, getCurrentUser } from '../../../services/user/userRoleService'

interface FirebaseUser {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
}

interface AgentData {
    email: string
    role: 'kam' | 'data' | 'kamModerator'
    name: string
    id: string
    phone?: string
    cpId?: string
    kamId?: string
    lastFetch?: number
}

interface UserState {
    user: FirebaseUser | null
    agentData: AgentData | null
    userRole: string | null
    loading: boolean
    error: string | null
    authInitialized: boolean
    lastFetch: Date | null
}

const initialState: UserState = {
    user: null,
    agentData: null,
    userRole: null,
    loading: true,
    error: null,
    authInitialized: false,
    lastFetch: null,
}

const validRoles = ['kam', 'data', 'kamModerator'] as const
type ValidRole = (typeof validRoles)[number]

function toValidRole(role: string): ValidRole {
    return validRoles.includes(role as ValidRole) ? (role as ValidRole) : 'kam'
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUser: (state) => {
            console.log('🧹 Clearing user data')
            state.user = null
            state.agentData = null
            state.userRole = null
            state.error = null
            state.authInitialized = true
        },
        clearError: (state) => {
            state.error = null
        },
        setAuthInitialized: (state, action: PayloadAction<boolean>) => {
            state.authInitialized = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            // Initialize auth listener
            .addCase(initializeAuthListener.pending, (state) => {
                state.loading = true
                state.error = null
                state.authInitialized = false
            })
            .addCase(initializeAuthListener.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.agentData = action.payload.agentData
                    ? { ...action.payload.agentData, role: toValidRole(action.payload.agentData.role) }
                    : null
                state.userRole = action.payload.agentData?.role || null
                state.authInitialized = true
                state.lastFetch = new Date()
                state.error = null
            })
            .addCase(initializeAuthListener.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
                state.authInitialized = true
                state.user = null
                state.agentData = null
                state.userRole = null
            })

            // Get current user
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.agentData = action.payload.agentData
                    ? { ...action.payload.agentData, role: toValidRole(action.payload.agentData.role) }
                    : null
                state.userRole = action.payload.agentData?.role || null
                state.authInitialized = true
                state.lastFetch = new Date()
                state.error = null
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
                state.authInitialized = true
            })

            // Fetch user role by email
            .addCase(fetchUserRoleByEmail.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUserRoleByEmail.fulfilled, (state, action) => {
                state.loading = false
                state.agentData = action.payload as AgentData
                state.userRole = action.payload.role
                state.lastFetch = new Date()
                state.error = null
            })
            .addCase(fetchUserRoleByEmail.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
                state.agentData = null
                state.userRole = null
            })
    },
})

export const { clearUser, clearError, setAuthInitialized } = userSlice.actions
export default userSlice.reducer
