import type { IInventory } from '../../../store/reducers/types'
import { collection, getDocs, query, where, QueryConstraint } from 'firebase/firestore'
import { db } from '../../../firebase'

export const fetchAllProperties = async (filters: any) => {
    try {
        const constraints: QueryConstraint[] = []

        if (filters && Object.keys(filters).length > 0) {
            Object.entries(filters).forEach(([field, value]) => {
                if (Array.isArray(value)) {
                    constraints.push(where(field, 'in', value))
                } else {
                    constraints.push(where(field, '==', value))
                }
            })
        }

        console.log(filters)
        const q = query(collection(db, 'acn-properties'), ...constraints)

        const snapshot = await getDocs(q)

        const properties = snapshot.docs.map((doc) => {
            const data = doc.data() as IInventory

            return {
                ...data,
                id: doc.id,
            }
        })

        console.log([properties, 'hello'])

        return { success: true, data: properties }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export const fetchPropertiesBatch =
    (batchSize: number, loadMore: boolean = false) =>
    async () => {
        try {
            console.log('fetchPropertiesBatch not implemented yet')
            return { success: true, data: [], hasMore: false }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }
