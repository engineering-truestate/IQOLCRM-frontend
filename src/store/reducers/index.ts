import { combineReducers } from '@reduxjs/toolkit'
import primaryPropertiesReducer from './restack/primaryProperties'

const rootReducer = combineReducers({
    primaryProperties: primaryPropertiesReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer
