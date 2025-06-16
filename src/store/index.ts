import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import rootReducer from './reducers'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['primaryProperties'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Create the store using configureStore from Redux Toolkit
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})

export const persistor = persistStore(store)
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof rootReducer>
export default store
