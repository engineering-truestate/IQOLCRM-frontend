import { configureStore } from '@reduxjs/toolkit'
import propertiesReducer from './reducers/acn/propertiesReducers'

// Create the store using configureStore from Redux Toolkit
const store = configureStore({
    reducer: {
        properties: propertiesReducer, // your slice reducer
    },
})

// RootState type inferred from the store
export type RootState = ReturnType<typeof store.getState>

// AppDispatch type inferred from the store
export type AppDispatch = typeof store.dispatch

export default store
