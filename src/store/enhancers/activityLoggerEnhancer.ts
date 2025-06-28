import type { StoreEnhancer } from 'redux'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'

interface ActivityLog {
    userId?: string
    userName?: string
    userEmail?: string
    cpId?: string
    action: string
    target: string
    oldValue?: any
    newValue?: any
    metadata?: Record<string, any>
    timestamp: any
    userAgent?: string
}

const logToFirestore = async (logData: ActivityLog) => {
    try {
        await addDoc(collection(db, 'acnLogs'), logData)
        console.log('📝 Activity logged:', logData.action)
    } catch (error) {
        console.error('❌ Error logging activity:', error)
    }
}

// Action mapping for readable descriptions
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

    // Add more actions as needed
}

export const createActivityLoggerEnhancer = (): StoreEnhancer => {
    return (createStore) => (reducer, preloadedState) => {
        const store = createStore(reducer, preloadedState)

        const dispatch = (action: any) => {
            const result = store.dispatch(action)

            // Log specific actions
            if (ACTION_MAPPINGS[action.type]) {
                const state = store.getState() as any
                const { user: currentUser, agentData } = state.user || {}

                if (currentUser) {
                    const mapping = ACTION_MAPPINGS[action.type]

                    const logData: ActivityLog = {
                        userId: currentUser.uid || currentUser.id,
                        userName: currentUser.displayName || currentUser.name || 'Unknown User',
                        userEmail: currentUser.email || '',
                        cpId: agentData?.cpId || currentUser.cpId,
                        action: mapping.action,
                        target: mapping.target,
                        oldValue: action.meta?.arg,
                        newValue: action.payload,
                        metadata: {
                            actionType: action.type,
                            page: window.location.pathname,
                            timestamp: Date.now(),
                            userType: agentData ? 'agent' : 'user',
                        },
                        timestamp: serverTimestamp(),
                        userAgent: navigator.userAgent,
                    }

                    logToFirestore(logData)
                }
            }

            return result
        }

        return { ...store, dispatch }
    }
}
