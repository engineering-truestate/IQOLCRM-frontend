export const FETCH_RESALE_DATA_REQUEST = 'FETCH_RESALE_DATA_REQUEST'
export const FETCH_RESALE_DATA_SUCCESS = 'FETCH_RESALE_DATA_SUCCESS'
export const FETCH_RESALE_DATA_FAILURE = 'FETCH_RESALE_DATA_FAILURE'

export const FETCH_RESALE_OVERVIEW_DATA_REQUEST = 'FETCH_RESALE_OVERVIEW_DATA_REQUEST'
export const FETCH_RESALE_OVERVIEW_DATA_SUCCESS = 'FETCH_RESALE_OVERVIEW_DATA_SUCCESS'
export const FETCH_RESALE_OVERVIEW_DATA_FAILURE = 'FETCH_RESALE_OVERVIEW_DATA_FAILURE'

export interface ResaleData {
    propertyId: string
    projectName: string
    propertyType: string
    subType: string
    configuration: string
    price: string
    pricePerSqft: number
    acres: number
    superBuiltUpArea: number
    totalUnits: number
    carpetArea: string
    reraId: string
    developer: string
    projectSize: string
    ageOfProperty: string
    projectAddress: string
    micromarket: string
    area: string
    status: string
    handoverDate: string
    launchDate: string
    maplink: string
    lat: number
    long: number
    inventoryDetails: {
        availability: string
        ageOfInventory: string
        facing: string
        overlooking: string
        url: string
        floorNumber: number
    }
    amenities: string[]
    aboutProject: {
        configuration: string
        towersandunits: string
        description: string
    }
    extraDetails: {
        beds: number
        baths: number
        balconies: number
        furnishing: string
    }
    priceHistory: {
        date: string
        price: number
    }[]
}

export interface OverviewData {
    totalProperties: number
    availableUnits: number
    soldOutUnits: number
}

interface FetchResaleDataRequestAction {
    type: typeof FETCH_RESALE_DATA_REQUEST
    payload: string
}

interface FetchResaleDataSuccessAction {
    type: typeof FETCH_RESALE_DATA_SUCCESS
    payload: ResaleData
}

interface FetchResaleDataFailureAction {
    type: typeof FETCH_RESALE_DATA_FAILURE
    payload: string
}

interface FetchResaleOverviewDataRequestAction {
    type: typeof FETCH_RESALE_OVERVIEW_DATA_REQUEST
}

interface FetchResaleOverviewDataSuccessAction {
    type: typeof FETCH_RESALE_OVERVIEW_DATA_SUCCESS
    payload: { [key: string]: OverviewData }
}

interface FetchResaleOverviewDataFailureAction {
    type: typeof FETCH_RESALE_OVERVIEW_DATA_FAILURE
    payload: string
}

export type ResaleActionTypes =
    | FetchResaleDataRequestAction
    | FetchResaleDataSuccessAction
    | FetchResaleDataFailureAction
    | FetchResaleOverviewDataRequestAction
    | FetchResaleOverviewDataSuccessAction
    | FetchResaleOverviewDataFailureAction
