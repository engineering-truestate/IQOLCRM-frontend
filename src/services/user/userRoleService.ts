// store/services/userService.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db } from '../../firebase'
import { getAuth } from 'firebase/auth'
import type { AgentData, FirebaseUser, AuthStateResponse, UserAuthResponse } from '../../data_types/acn/types'

const auth = getAuth()

// Monitor Firebase auth state changes
export const monitorAuthState = createAsyncThunk<AuthStateResponse, void, { rejectValue: string }>(
    'user/monitorAuthState',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            return await new Promise<AuthStateResponse>((resolve, reject) => {
                const unsubscribe = onAuthStateChanged(auth, async (user) => {
                    try {
                        if (user) {
                            console.log('🔍 User authenticated:', user.email)

                            // Fetch user role from internal-agents collection
                            const agentData = await dispatch(fetchUserRoleByEmail(user.email!)).unwrap()

                            const firebaseUser: FirebaseUser = {
                                uid: user.uid,
                                email: user.email,
                                displayName: user.displayName,
                                photoURL: user.photoURL,
                            }

                            resolve({
                                user: firebaseUser,
                                agentData,
                            })
                        } else {
                            console.log('🚪 User logged out')
                            resolve({
                                user: null,
                                agentData: null,
                            })
                        }
                    } catch (error: any) {
                        console.error('❌ Error in auth state change:', error)
                        reject(error)
                    }
                })

                // Store unsubscribe function for cleanup
                return () => unsubscribe()
            })
        } catch (error: any) {
            console.error('❌ Error monitoring auth state:', error)
            return rejectWithValue(error.message || 'Failed to monitor auth state')
        }
    },
)

// Fetch user role by email from internal-agents collection
export const fetchUserRoleByEmail = createAsyncThunk<AgentData, string, { rejectValue: string }>(
    'user/fetchRoleByEmail',
    async (email: string, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching user role for email:', email)

            const agentsRef = collection(db, 'internal-agents')
            const q = query(agentsRef, where('email', '==', email))
            const querySnapshot = await getDocs(q)

            if (querySnapshot.empty) {
                console.log('❌ No agent found with email:', email)
                return rejectWithValue('No agent found with this email')
            }

            const agentDoc = querySnapshot.docs[0]
            const agentData = agentDoc.data() as AgentData

            console.log('✅ Agent role fetched successfully:', agentData.role)
            return {
                ...agentData,
                id: agentDoc.id,
            }
        } catch (error: any) {
            console.error('❌ Error fetching user role:', error)
            return rejectWithValue(error.message || 'Failed to fetch user role')
        }
    },
)

// Get current user from Firebase auth
export const getCurrentUser = createAsyncThunk<UserAuthResponse, void, { rejectValue: string }>(
    'user/getCurrentUser',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const currentUser = auth.currentUser

            if (currentUser && currentUser.email) {
                console.log('👤 Current user found:', currentUser.email)

                // Fetch agent data
                const agentData = await dispatch(fetchUserRoleByEmail(currentUser.email)).unwrap()

                const firebaseUser: FirebaseUser = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                }

                return {
                    user: firebaseUser,
                    agentData,
                }
            } else {
                console.log('👤 No current user found')
                return {
                    user: null,
                    agentData: null,
                }
            }
        } catch (error: any) {
            console.error('❌ Error getting current user:', error)
            return rejectWithValue(error.message || 'Failed to get current user')
        }
    },
)
