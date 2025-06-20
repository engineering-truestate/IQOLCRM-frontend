import {
    FETCH_RESALE_DATA_REQUEST,
    FETCH_RESALE_DATA_SUCCESS,
    FETCH_RESALE_DATA_FAILURE,
    FETCH_RESALE_OVERVIEW_DATA_REQUEST,
    FETCH_RESALE_OVERVIEW_DATA_SUCCESS,
    FETCH_RESALE_OVERVIEW_DATA_FAILURE,
} from '../../actionTypes/restack/resaleActionTypes'
import type { ResaleActionTypes, ResaleData, OverviewData } from '../../actionTypes/restack/resaleActionTypes'

interface ResaleState {
    loading: boolean
    data: ResaleData | null
    error: string | null
    overviewData: { [key: string]: OverviewData } | null
}

const initialState: ResaleState = {
    loading: false,
    data: null,
    error: null,
    overviewData: null,
}

const resaleReducer = (state = initialState, action: ResaleActionTypes): ResaleState => {
    switch (action.type) {
        case FETCH_RESALE_DATA_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            }
        case FETCH_RESALE_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                data: (action.payload as any[]).find((item: any) => item.propertyId === action.propertyId) || null,
            }
        case FETCH_RESALE_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            }
        case FETCH_RESALE_OVERVIEW_DATA_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            }
        case FETCH_RESALE_OVERVIEW_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                overviewData: action.payload,
            }
        case FETCH_RESALE_OVERVIEW_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            }
        default:
            return state
    }
}

export default resaleReducer
