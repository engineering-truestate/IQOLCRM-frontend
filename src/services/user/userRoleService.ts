// // services/userService.ts
// import { createAsyncThunk } from '@reduxjs/toolkit'
// import { collection, query, where, getDocs } from 'firebase/firestore'
// import { onAuthStateChanged } from 'firebase/auth'
// import { db } from '../../firebase'
// import { getAuth } from 'firebase/auth'
// import type { AgentData, FirebaseUser, AuthStateResponse, UserAuthResponse } from '../../data_types/acn/types'

// const auth = getAuth()

// // Fetch user role by email from internal-agents collection
// export const fetchUserRoleByEmail = createAsyncThunk<AgentData, string, { rejectValue: string }>(
//     'user/fetchRoleByEmail',
//     async (email: string, { rejectWithValue }) => {
//         try {
//             console.log('🔍 Fetching user role for email:', email)

//             const agentsRef = collection(db, 'internal-agents')
//             const q = query(agentsRef, where('email', '==', email))
//             const querySnapshot = await getDocs(q)

//             if (querySnapshot.empty) {
//                 console.log('❌ No agent found with email:', email)
//                 return rejectWithValue('No agent found with this email')
//             }

//             const agentDoc = querySnapshot.docs[0]
//             const rawAgentData = agentDoc.data()

//             console.log('✅ Agent role fetched successfully:', rawAgentData.role)

//             // Ensure all required properties are present
//             // Only allow specific roles
//             const allowedRoles = ['data', 'kam', 'kamModerator'] as const
//             let role: AgentData['role'] = 'kam'
//             if (rawAgentData.acn && allowedRoles.includes(rawAgentData.acn.role)) {
//                 role = rawAgentData.acn.role
//             }

//             const agentData: AgentData = {
//                 email: rawAgentData.email || email,
//                 role,
//                 name: rawAgentData.name || rawAgentData.displayName || email.split('@')[0],
//                 id: agentDoc.id,
//                 phone: rawAgentData.phone || '',
//                 cpId: rawAgentData.cpId || '',
//                 kamId: rawAgentData.kamId || agentDoc.id,
//                 lastFetch: Math.floor(Date.now() / 1000),
//             }

//             return agentData
//         } catch (error: any) {
//             console.error('❌ Error fetching user role:', error)
//             return rejectWithValue(error.message || 'Failed to fetch user role')
//         }
//     },
// )

// // Initialize authentication listener
// export const initializeAuthListener = createAsyncThunk<AuthStateResponse, void, { rejectValue: string }>(
//     'user/initializeAuthListener',
//     async (_, { dispatch, rejectWithValue }) => {
//         try {
//             return new Promise<AuthStateResponse>((resolve) => {
//                 const unsubscribe = onAuthStateChanged(auth, async (user) => {
//                     try {
//                         if (user && user.email) {
//                             console.log('🔍 User authenticated:', user.email)

//                             const agentDataResult = await dispatch(fetchUserRoleByEmail(user.email))

//                             if (fetchUserRoleByEmail.fulfilled.match(agentDataResult)) {
//                                 const agentData = agentDataResult.payload

//                                 const firebaseUser: FirebaseUser = {
//                                     uid: user.uid,
//                                     email: user.email,
//                                     displayName: user.displayName,
//                                     photoURL: user.photoURL,
//                                 }

//                                 resolve({
//                                     user: firebaseUser,
//                                     agentData,
//                                     lastFetch: Math.floor(Date.now() / 1000),
//                                 })
//                             } else {
//                                 console.log('❌ Failed to fetch agent data')
//                                 resolve({
//                                     user: null,
//                                     agentData: null,
//                                     lastFetch: Math.floor(Date.now() / 1000),
//                                 })
//                             }
//                         } else {
//                             console.log('🚪 User logged out')
//                             resolve({
//                                 user: null,
//                                 agentData: null,
//                                 lastFetch: Math.floor(Date.now() / 1000),
//                             })
//                         }
//                     } catch (error: any) {
//                         console.error('❌ Error in auth state change:', error)
//                         resolve({
//                             user: null,
//                             agentData: null,
//                             lastFetch: Math.floor(Date.now() / 1000),
//                         })
//                     }
//                 })

//                 return () => unsubscribe()
//             })
//         } catch (error: any) {
//             console.error('❌ Error initializing auth listener:', error)
//             return rejectWithValue(error.message || 'Failed to initialize auth listener')
//         }
//     },
// )

// // Get current user from Firebase auth
// export const getCurrentUser = createAsyncThunk<UserAuthResponse, void, { rejectValue: string }>(
//     'user/getCurrentUser',
//     async (_, { dispatch, rejectWithValue }) => {
//         try {
//             const currentUser = auth.currentUser

//             if (currentUser && currentUser.email) {
//                 console.log('👤 Current user found:', currentUser.email)

//                 const agentDataResult = await dispatch(fetchUserRoleByEmail(currentUser.email))

//                 if (fetchUserRoleByEmail.fulfilled.match(agentDataResult)) {
//                     const agentData = agentDataResult.payload

//                     const firebaseUser: FirebaseUser = {
//                         uid: currentUser.uid,
//                         email: currentUser.email,
//                         displayName: currentUser.displayName,
//                         photoURL: currentUser.photoURL,
//                     }

//                     return {
//                         user: firebaseUser,
//                         agentData,
//                         lastFetch: Math.floor(Date.now() / 1000),
//                     }
//                 } else {
//                     return rejectWithValue('Failed to fetch agent data')
//                 }
//             } else {
//                 console.log('👤 No current user found')
//                 return {
//                     user: null,
//                     agentData: null,
//                     lastFetch: Math.floor(Date.now() / 1000),
//                 }
//             }
//         } catch (error: any) {
//             console.error('❌ Error getting current user:', error)
//             return rejectWithValue(error.message || 'Failed to get current user')
//         }
//     },
// )

// // Alias for compatibility
// export const monitorAuthState = initializeAuthListener
