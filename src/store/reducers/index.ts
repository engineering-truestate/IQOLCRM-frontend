import { combineReducers } from '@reduxjs/toolkit'
import primaryPropertiesReducer from './restack/primaryProperties'
import preReraPropertiesReducer from './restack/preReraProperties'
import resaleReducer from './restack/resaleReducer'

const rootReducer = combineReducers({
    primaryProperties: primaryPropertiesReducer,
    preReraProperties: preReraPropertiesReducer,
    resale: resaleReducer,
})

export default rootReducer

export interface RootState {
    primaryProperties: ReturnType<typeof primaryPropertiesReducer>
    preReraProperties: ReturnType<typeof preReraPropertiesReducer>
    resale: ReturnType<typeof resaleReducer>
}
