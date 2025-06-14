import { configureStore } from '@reduxjs/toolkit'
import propertiesReducer from './reducers/acn/propertiesReducers'
import preLaunchReducer from './reducers/restack/preLaunchReducer'
import requirementsReducer from './reducers/acn/requirementsReducers'

// Create the store using configureStore from Redux Toolkit
const store = configureStore({
    reducer: {
        properties: propertiesReducer,
        preLaunch: preLaunchReducer,
        requirements: requirementsReducer,
    },
})

// RootState type inferred from the store
export type RootState = ReturnType<typeof store.getState>

// AppDispatch type inferred from the store
export type AppDispatch = typeof store.dispatch

export default store
