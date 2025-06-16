import {
    FETCH_PRIMARY_PROPERTIES_REQUEST,
    FETCH_PRIMARY_PROPERTIES_SUCCESS,
    FETCH_PRIMARY_PROPERTIES_FAILURE,
    SET_PRIMARY_PROPERTIES_FILTER,
} from '../../actionTypes/primaryProperties'
import type { RERAProject } from '../../../pages/dummy_data/restack_primary_dummy_data'

interface PrimaryPropertiesState {
    properties: RERAProject[]
    loading: boolean
    error: string | null
    filter: string
}

const initialState: PrimaryPropertiesState = {
    properties: [],
    loading: false,
    error: null,
    filter: '',
}

const primaryPropertiesReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case FETCH_PRIMARY_PROPERTIES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            }
        case FETCH_PRIMARY_PROPERTIES_SUCCESS:
            return {
                ...state,
                loading: false,
                properties: action.payload,
                error: null,
            }
        case FETCH_PRIMARY_PROPERTIES_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            }
        case SET_PRIMARY_PROPERTIES_FILTER:
            return {
                ...state,
                filter: action.payload,
            }
        default:
            return state
    }
}

export default primaryPropertiesReducer
