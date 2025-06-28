import type { Middleware } from '@reduxjs/toolkit'
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { onAuthStateChanged, getAuth } from 'firebase/auth'
import { db } from '../../../firebase'

// Store current user info globally
let currentUserInfo: any = null

// Initialize auth listener to keep user info updated
const auth = getAuth()
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserInfo = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
        }
        console.log('🔄 User info updated:', currentUserInfo)
    } else {
        currentUserInfo = null
        console.log('🔄 User logged out')
    }
})

// Function to get user info from multiple sources
const getCurrentUser = () => {
    // Try Firebase Auth first
    if (currentUserInfo) {
        console.log('👤 Got user from Firebase Auth:', currentUserInfo)
        return currentUserInfo
    }

    // Try localStorage
    try {
        const localUser = localStorage.getItem('user') || localStorage.getItem('currentUser')
        if (localUser) {
            const parsedUser = JSON.parse(localUser)
            console.log('👤 Got user from localStorage:', parsedUser)
            return parsedUser
        }
    } catch (error) {
        console.log('❌ Error parsing localStorage user:', error)
    }

    // Try sessionStorage
    try {
        const sessionUser = sessionStorage.getItem('user') || sessionStorage.getItem('currentUser')
        if (sessionUser) {
            const parsedUser = JSON.parse(sessionUser)
            console.log('👤 Got user from sessionStorage:', parsedUser)
            return parsedUser
        }
    } catch (error) {
        console.log('❌ Error parsing sessionStorage user:', error)
    }

    // Try Firebase Auth current user
    const authUser = getAuth().currentUser
    if (authUser) {
        const user = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            phoneNumber: authUser.phoneNumber,
        }
        console.log('👤 Got user from Firebase Auth currentUser:', user)
        return user
    }

    console.log('❌ No user found from any source')
    return null
}

const ACTION_MAPPINGS: Record<string, { action: string; target: string }> = {
    // Leads actions
    'leads/addNoteToLead/fulfilled': { action: 'add_note', target: 'lead' },
    'leads/updateLeadStatus/fulfilled': { action: 'update_status', target: 'lead' },
    'leads/verifyLeadAndCreateAgent/fulfilled': { action: 'verify_and_create', target: 'agent' },
    'leads/addCallResult/fulfilled': { action: 'add_call_result', target: 'lead' },
    'leads/fetchLeadWithNotes/fulfilled': { action: 'view_notes', target: 'lead' },
    'leads/fetchLeadWithConnectHistory/fulfilled': { action: 'view_call_history', target: 'lead' },

    // Agents actions
    'agents/addNoteToAgent/fulfilled': { action: 'add_note', target: 'agent' },
    'agents/addCallResultToAgent/fulfilled': { action: 'add_call_result', target: 'agent' },
    'agents/updateAgentStatus/fulfilled': { action: 'update_status', target: 'agent' },
    'agents/addAgentWithVerification/fulfilled': { action: 'create_agent', target: 'agent' },
    'agents/fetchAgentByPhone/fulfilled': { action: 'fetch_agent_by_phone', target: 'agent' },
    'agents/fetchAgentWithNotes/fulfilled': { action: 'view_notes', target: 'agent' },
    'agents/fetchAgentWithConnectHistory/fulfilled': { action: 'view_call_history', target: 'agent' },

    // Properties actions
    'properties/updateProperty/fulfilled': { action: 'update_property', target: 'property' },
    'properties/addProperty/fulfilled': { action: 'create_property', target: 'property' },
    'properties/fetchPropertyById/fulfilled': { action: 'view_property', target: 'property' },

    // Requirements actions
    'requirements/createRequirement/fulfilled': { action: 'create_requirement', target: 'requirement' },
    'requirements/fetchRequirementById/fulfilled': { action: 'view_requirement', target: 'requirement' },
    'requirements/updateRequirement/fulfilled': { action: 'update_requirement', target: 'requirement' },

    // QC actions
    'qc/addQCInventory/fulfilled': { action: 'create_qc_inventory', target: 'qc_inventory' },
    'qc/updateQCInventory/fulfilled': { action: 'update_qc_inventory', target: 'qc_inventory' },
    'qc/fetchQCInventoryById/fulfilled': { action: 'view_qc_inventory', target: 'qc_inventory' },
}

// Function to log activity to action-specific document
const logToActionDocument = async (actionType: string, logEntry: any) => {
    try {
        // Create document ID from action type (replace slashes and special chars)
        const docId = actionType.replace(/\//g, '_').replace(/\./g, '_')
        const docRef = doc(db, 'acnLogs', docId)

        console.log('📄 Checking if document exists:', docId)

        // Get current Unix timestamp
        const currentTimestamp = Math.floor(Date.now() / 1000)

        // Check if document exists
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            // Document exists, add to logs array
            console.log('📝 Document exists, adding to logs array')
            const currentData = docSnap.data()
            await updateDoc(docRef, {
                logs: arrayUnion(logEntry),
                lastUpdated: currentTimestamp,
                totalLogs: (currentData.totalLogs || 0) + 1,
            })
        } else {
            // Document doesn't exist, create it
            console.log("🆕 Document doesn't exist, creating new document")
            await setDoc(docRef, {
                actionType: actionType,
                logs: [logEntry],
                created: currentTimestamp,
                lastUpdated: currentTimestamp,
                totalLogs: 1,
            })
        }

        console.log('✅ Successfully logged to action document:', docId)
    } catch (error) {
        console.error('❌ Failed to log to action document:', error)
    }
}

export const activityLoggerMiddleware: Middleware = (store) => (next) => (action: any) => {
    //console.log('🔥 Middleware intercepted action:', action.type)

    const result = next(action)

    // Narrow action type to ensure it has a 'type' property
    const typedAction = action as { type: string; [key: string]: any }
    if (ACTION_MAPPINGS[typedAction.type]) {
        console.log('✅ Action should be logged:', typedAction.type)

        // Get user info directly
        const currentUser = getCurrentUser()

        // Also try to get agent data from Redux state as fallback
        const state = store.getState() as any
        const agentData = state.user?.agentData || null

        console.log('👤 User info:', {
            hasUser: !!currentUser,
            userDetails: currentUser
                ? {
                      id: currentUser.uid || currentUser.id,
                      email: currentUser.email,
                      name: currentUser.displayName || currentUser.name,
                  }
                : 'no user',
        })

        if (currentUser) {
            const mapping = ACTION_MAPPINGS[typedAction.type]

            // Get current Unix timestamp (in seconds)
            const currentTimestamp = Math.floor(Date.now() / 1000)

            const logEntry = {
                userId: currentUser.uid || currentUser.id || '',
                userName: currentUser.displayName || currentUser.name || 'Unknown User',
                userEmail: currentUser.email || '',
                cpId: agentData?.cpId || currentUser.cpId || '',
                action: mapping.action,
                target: mapping.target,
                oldValue: typedAction.meta?.arg,
                newValue: typedAction.payload,
                metadata: {
                    actionType: typedAction.type,
                    page: window.location.pathname,
                    timestamp: Date.now(), // Keep this in milliseconds for internal use
                    userType: agentData ? 'agent' : 'user',
                    source: 'middleware',
                },
                timestamp: currentTimestamp, // Unix timestamp in seconds
                userAgent: navigator.userAgent,
            }

            console.log('📝 Logging entry to action document:', logEntry)

            // Log to action-specific document
            logToActionDocument(typedAction.type, logEntry)
        } else {
            console.log('❌ No user found from any source')
        }
    } else {
        //console.log('⏭️ Action not in logging list:', (action as any).type)
    }

    return result
}
