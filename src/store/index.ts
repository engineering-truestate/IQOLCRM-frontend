import { configureStore } from '@reduxjs/toolkit'
import propertiesReducer from './reducers/acn/propertiesReducers'
import platformReducer from './reducers/platformSlice'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['platform'],
}

const persistedPlatformReducer = persistReducer(persistConfig, platformReducer)

// Create the store using configureStore from Redux Toolkit
const store = configureStore({
    reducer: {
        properties: propertiesReducer,
        platform: persistedPlatformReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
})

// RootState type inferred from the store
export type RootState = ReturnType<typeof store.getState>

// AppDispatch type inferred from the store
export type AppDispatch = typeof store.dispatch

export const persistor = persistStore(store)

export default store
