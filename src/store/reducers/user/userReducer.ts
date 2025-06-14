// store/reducers/userReducer.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { monitorAuthState, fetchUserRoleByEmail, getCurrentUser } from '../../../services/user/userRoleService'

interface FirebaseUser {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
}

interface AgentData {
    email: string
    role: 'kam' | 'dataTeam' | 'kamModerator'
    name?: string
    id?: string
}

interface UserState {
    currentUser: FirebaseUser | null
    agentData: AgentData | null
    userRole: string | null
    loading: boolean
    error: string | null
    authInitialized: boolean
}

const initialState: UserState = {
    currentUser: null,
    agentData: null,
    userRole: null,
    loading: false,
    error: null,
    authInitialized: false,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUser: (state) => {
            console.log('🧹 Clearing user data')
            state.currentUser = null
            state.agentData = null
            state.userRole = null
            state.error = null
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
            // Monitor auth state
            .addCase(monitorAuthState.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(monitorAuthState.fulfilled, (state, action) => {
                state.loading = false
                state.currentUser = action.payload.user
                state.agentData = action.payload.agentData
                state.userRole = action.payload.agentData?.role || null
                state.authInitialized = true
                state.error = null
            })
            .addCase(monitorAuthState.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
                state.authInitialized = true
                state.currentUser = null
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
                state.currentUser = action.payload.user
                state.agentData = action.payload.agentData
                state.userRole = action.payload.agentData?.role || null
                state.authInitialized = true
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
                state.agentData = action.payload
                state.userRole = action.payload.role
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
