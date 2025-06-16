import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../firebase'
import type { RERAProject } from '../../../pages/dummy_data/restack_primary_dummy_data'
import {
    FETCH_PRIMARY_PROPERTIES_REQUEST,
    FETCH_PRIMARY_PROPERTIES_SUCCESS,
    FETCH_PRIMARY_PROPERTIES_FAILURE,
    SET_PRIMARY_PROPERTIES_FILTER,
    SET_PRIMARY_PROPERTIES_PAGE,
} from '../../actionTypes/primaryProperties'
import type { Dispatch } from 'redux'

export const fetchPrimaryProperties = () => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: FETCH_PRIMARY_PROPERTIES_REQUEST })
        try {
            // Verify Firebase is initialized
            if (!db) {
                throw new Error('Firebase is not initialized')
            }

            // Log the collection name for debugging
            console.log('Fetching from collection: restack_primary_properties')

            const querySnapshot = await getDocs(collection(db, 'restack_primary_properties'))

            if (querySnapshot.empty) {
                console.log('No documents found in collection')
                dispatch({ type: FETCH_PRIMARY_PROPERTIES_SUCCESS, payload: [] })
                return
            }

            const properties = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as RERAProject[]

            console.log(`Successfully fetched ${properties.length} properties`)
            dispatch({ type: FETCH_PRIMARY_PROPERTIES_SUCCESS, payload: properties })
        } catch (error) {
            console.error('Error fetching properties:', error)
            dispatch({
                type: FETCH_PRIMARY_PROPERTIES_FAILURE,
                payload: error instanceof Error ? error.message : 'An error occurred while fetching properties',
            })
        }
    }
}

export const setPrimaryPropertiesFilter = (filter: string) => ({
    type: SET_PRIMARY_PROPERTIES_FILTER,
    payload: filter,
})

export const setPrimaryPropertiesPage = (page: number) => ({
    type: SET_PRIMARY_PROPERTIES_PAGE,
    payload: page,
})
