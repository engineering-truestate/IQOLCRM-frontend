import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import { activityLoggerMiddleware } from './middleware/acn/loggerMiddleware'
import propertiesReducer from './reducers/acn/propertiesReducers'
import platformReducer from './reducers/platformSlice'
import preLaunchReducer from './reducers/restack/preLaunchReducer'
import preReraReducer from './reducers/restack/preReraReducer'
import primaryPropertiesReducer from './reducers/restack/primaryProperties'
import requirementsReducer from './reducers/acn/requirementsReducers'
import userReducer from './reducers/user/userReducer'
import qcReducer from './reducers/acn/qcReducer'
import postReraReducer from './reducers/restack/postReraReducer'
import leadsReducer from './reducers/acn/leadsReducers'
import agentsReducer from './slices/agentsSlice'
import agentDetailsReducer from './slices/agentDetailsSlice'
import type { IInventory, IRequirement } from '../data_types/acn/types'
import taskIdReducer from './reducers/canvas-homes/taskIdReducer'

interface TaskIdState {
    taskId: string | null
    enquiryId: string | null
    leadId: string | null
}

interface PropertyData {
    inventories: IInventory[]
    requirements: IRequirement[]
    enquiries: any[]
}

interface AgentInfo {
    cpId: string
    agentName: string
    phoneNumber: string
}

interface AgentsState {
    currentAgent: AgentInfo | null
    resale: PropertyData
    rental: PropertyData
    loading: boolean
    error: string | null
    fetchLoading: boolean
    fetchError: string | null
    connectHistoryLoading: boolean
    connectHistoryError: string | null
    currentAgentConnectHistory: any[]
    notesLoading: boolean
    notesError: string | null
    agentNotes: Record<string, any[]>
}

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['primaryProperties', 'user'], // Added user to persist auth state
}

const rootReducer = combineReducers({
    properties: propertiesReducer,
    platform: platformReducer,
    primaryProperties: primaryPropertiesReducer,
    preLaunch: preLaunchReducer,
    preRera: preReraReducer,
    requirements: requirementsReducer,
    user: userReducer, // This will serve as auth state
    qc: qcReducer,
    taskId: taskIdReducer,
    leads: leadsReducer,
    agents: agentsReducer,
    agentDetails: agentDetailsReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Create the store using configureStore from Redux Toolkit
export const store = configureStore({
    reducer: {
        properties: propertiesReducer,
        platform: persistedReducer,
        primaryProperties: primaryPropertiesReducer,
        preLaunch: preLaunchReducer,
        preRera: preReraReducer,
        postRera: postReraReducer,
        requirements: requirementsReducer,
        user: userReducer,
        qc: qcReducer,
        taskId: taskIdReducer,
        leads: leadsReducer,
        agents: agentsReducer,
        agentDetails: agentDetailsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE',
                    'persist/REGISTER',
                    'persist/PURGE',
                    'persist/FLUSH',
                    'persist/PAUSE',
                    'persist/REHYDRATE',
                ],
                ignoredPaths: ['user.lastFetch'], // Ignore Date objects in user state
            },
        }).concat(activityLoggerMiddleware), // ✅ Added activity logger middleware
})

export const persistor = persistStore(store)

// RootState type inferred from the store
export type RootState = ReturnType<typeof store.getState> & {
    agents: AgentsState
    taskId: TaskIdState
}
export type AppDispatch = typeof store.dispatch

export default store
