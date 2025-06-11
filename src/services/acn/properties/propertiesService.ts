import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    startAfter,
    QueryDocumentSnapshot,
    QueryConstraint,
} from 'firebase/firestore'
import { db } from '../../../firebase'
import {
    fetchPropertiesStart,
    fetchPropertiesSuccess,
    fetchPropertiesFailure,
    fetchPropertiesBatchStart,
    fetchPropertiesBatchSuccess,
    fetchPropertiesBatchFailure,
    fetchPropertiesBatchMore,
} from '../../../store/reducers/acn/propertiesReducers'
import type { AppDispatch, RootState } from '../../../store/index'
import type { IInventory } from '../../../store/reducers/types'

// === fetch-all (no pagination) ===
export const fetchAllProperties = () => async (dispatch: AppDispatch) => {
    dispatch(fetchPropertiesStart())
    try {
        const colRef = collection(db, 'acn-properties')
        const snapshot = await getDocs(colRef)

        const properties = snapshot.docs.map((doc) => {
            const data = doc.data() as IInventory // Ensure typing for doc.data() as IInventory
            return {
                ...data, // Spread properties data
                id: doc.id, // Add the id manually
            }
        })

        dispatch(fetchPropertiesSuccess({ properties, total: properties.length }))

        return { success: true, data: properties }
    } catch (error: any) {
        dispatch(fetchPropertiesFailure(error.message))
        return { success: false, error: error.message }
    }
}

// === batched/paginated fetch ===
export const fetchPropertiesBatch =
    (batchSize: number, loadMore: boolean = false) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        const { properties } = getState()
        dispatch(loadMore ? fetchPropertiesBatchMore() : fetchPropertiesBatchStart())

        try {
            const constraints: QueryConstraint[] = [orderBy('dateOfInventoryAdded', 'desc'), limit(batchSize)]

            if (loadMore && properties.lastDocument) {
                constraints.push(startAfter(properties.lastDocument)) // Pass the correct lastDocument
            }

            const q = query(collection(db, 'acn-properties'), ...constraints)
            const snapshot = await getDocs(q)

            const propertiesBatch = snapshot.docs.map((doc) => {
                const data = doc.data() as IInventory // Ensure typing for doc.data() as IInventory
                return {
                    ...data, // Spread properties data
                    id: doc.id, // Add the id manually
                }
            })

            const lastDoc = snapshot.docs.length
                ? (snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot<IInventory>) // Type cast here
                : null
            const hasMore = snapshot.docs.length === batchSize

            dispatch(
                fetchPropertiesBatchSuccess({
                    properties: propertiesBatch,
                    lastDocument: lastDoc, // Correctly typed lastDocument
                    hasMore,
                    isLoadingMore: loadMore,
                    batchSize: propertiesBatch.length,
                }),
            )

            return { success: true, data: propertiesBatch, hasMore }
        } catch (error: any) {
            dispatch(fetchPropertiesBatchFailure(error.message))
            return { success: false, error: error.message }
        }
    }
