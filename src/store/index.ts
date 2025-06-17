import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import userReducer from './reducers/user/userReducer'
import qcReducer from './reducers/acn/qcReducer'
import platformReducer from './reducers/platformSlice'
import propertiesReducer from './reducers/restack/primaryProperties'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['primaryProperties'],
}

const persistedPlatformReducer = persistReducer(persistConfig, platformReducer)
import preLaunchReducer from './reducers/restack/preLaunchReducer'
import preReraReducer from './reducers/restack/preReraReducer'
import requirementsReducer from './reducers/acn/requirementsReducers'
import postReraReducer from './reducers/restack/postReraReducer'

// Create the store using configureStore from Redux Toolkit
const store = configureStore({
    reducer: {
        properties: propertiesReducer,
        platform: persistedPlatformReducer,
        preLaunch: preLaunchReducer,
        preRera: preReraReducer,
        postRera: postReraReducer,
        requirements: requirementsReducer,
        user: userReducer,
        qc: qcReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})

export const persistor = persistStore(store)
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export default store
