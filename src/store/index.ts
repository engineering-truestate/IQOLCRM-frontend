import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import propertiesReducer from './reducers/acn/propertiesReducers'
import platformReducer from './reducers/platformSlice'
import preLaunchReducer from './reducers/restack/preLaunchReducer'
import preReraReducer from './reducers/restack/preReraReducer'
import primaryPropertiesReducer from './reducers/restack/primaryProperties'
import requirementsReducer from './reducers/acn/requirementsReducers'
import userReducer from './reducers/user/userReducer' // Updated path
import qcReducer from './reducers/acn/qcReducer' // Updated path
import leadsReducer from './reducers/acn/leadsReducers'
import agentsReducer from './slices/agentsSlice'
import agentDetailsReducer from './slices/agentDetailsSlice'
import type { IInventory, IRequirement } from '../data_types/acn/types'

interface PropertyData {
    inventories: IInventory[]
    requirements: IRequirement[]
    enquiries: any[]
}

interface AgentsState {
    resale: PropertyData
    rental: PropertyData
    loading: boolean
    error: string | null
}

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['platform', 'user'], // Added user to persist auth state
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
    leads: leadsReducer,
    agents: agentsReducer,
    agentDetails: agentDetailsReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
    reducer: persistedReducer,
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
        }),
})

export const persistor = persistStore(store)

// RootState type properly inferred from the store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
