import type { IRequirement } from '../../../store/reducers/types'
import { collection, getDocs, query, where, QueryConstraint } from 'firebase/firestore'
import { db } from '../../../firebase'

export const fetchAllRequirements = async (filters: any) => {
    try {
        const constraints: QueryConstraint[] = []
        if (filters) {
            Object.entries(filters).forEach(([field, value]) => {
                constraints.push(where(field, '==', value))
            })
        }

        const q = query(collection(db, 'acn-requirements'), ...constraints)

        const snapshot = await getDocs(q)

        const requirements = snapshot.docs.map((doc) => {
            const data = doc.data() as IRequirement
            return {
                ...data,
                id: doc.id,
            }
        })

        // console.log(requirements, "he")

        return { success: true, data: requirements }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export const fetchRequirementsBatch =
    (batchSize: number, loadMore: boolean = false) =>
    async () => {
        try {
            console.log('fetchRequirementsBatch not implemented yet')
            return { success: true, data: [], hasMore: false }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }
