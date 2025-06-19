import {
    FETCH_RESALE_DATA_REQUEST,
    FETCH_RESALE_DATA_SUCCESS,
    FETCH_RESALE_DATA_FAILURE,
} from '../../actionTypes/restack/resaleActionTypes'
import type { ResaleData } from '../../actionTypes/restack/resaleActionTypes'
import {
    FETCH_RESALE_OVERVIEW_DATA_REQUEST,
    FETCH_RESALE_OVERVIEW_DATA_SUCCESS,
    FETCH_RESALE_OVERVIEW_DATA_FAILURE,
} from '../../actionTypes/restack/resaleActionTypes'
import type { OverviewData, ResaleActionTypes } from '../../actionTypes/restack/resaleActionTypes'
import { get99AcresResaleData, getMagicBricksResaleData } from '../../../services/restack/resaleService'

export const fetchResaleDataRequest = (): ResaleActionTypes => ({
    type: FETCH_RESALE_DATA_REQUEST,
})

export const fetchResaleDataSuccess = (payload: ResaleData): ResaleActionTypes => ({
    type: FETCH_RESALE_DATA_SUCCESS,
    payload,
})

export const fetchResaleDataFailure = (payload: string): ResaleActionTypes => ({
    type: FETCH_RESALE_DATA_FAILURE,
    payload,
})

export const fetchResaleOverviewDataRequest = (): ResaleActionTypes => ({
    type: FETCH_RESALE_OVERVIEW_DATA_REQUEST,
})

export const fetchResaleOverviewDataSuccess = (payload: { [key: string]: OverviewData }): ResaleActionTypes => ({
    type: FETCH_RESALE_OVERVIEW_DATA_SUCCESS,
    payload,
})

export const fetchResaleOverviewDataFailure = (payload: string): ResaleActionTypes => ({
    type: FETCH_RESALE_OVERVIEW_DATA_FAILURE,
    payload,
})

export const fetchResaleOverviewData = () => {
    return async (dispatch: any) => {
        dispatch(fetchResaleOverviewDataRequest())
        try {
            const acresData = await get99AcresResaleData()
            const magicBricksData = await getMagicBricksResaleData()

            const calculateOverview = (data: any[]): OverviewData => {
                const totalProperties = data.length
                let availableUnits = 0
                let soldOutUnits = 0

                data.forEach((item: any) => {
                    availableUnits += item.inventoryDetails?.availability === 'Yes' ? 1 : 0
                    soldOutUnits += item.inventoryDetails?.soldOutUnits || 0 // Assuming there's a soldOutUnits property
                })

                return {
                    totalProperties,
                    availableUnits,
                    soldOutUnits,
                }
            }

            const overviewData = {
                '99acres': calculateOverview(acresData),
                magicbricks: calculateOverview(magicBricksData),
                other: { totalProperties: 0, availableUnits: 0, soldOutUnits: 0 }, // Placeholder
            }

            dispatch(fetchResaleOverviewDataSuccess(overviewData))
        } catch (error: any) {
            dispatch(fetchResaleOverviewDataFailure(error.message))
        }
    }
}
