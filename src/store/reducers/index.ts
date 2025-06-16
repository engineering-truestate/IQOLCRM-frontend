import { combineReducers } from '@reduxjs/toolkit'
import primaryPropertiesReducer from './restack/primaryProperties'
import preReraPropertiesReducer from './restack/preReraProperties'

const rootReducer = combineReducers({
    primaryProperties: primaryPropertiesReducer,
    preReraProperties: preReraPropertiesReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer
