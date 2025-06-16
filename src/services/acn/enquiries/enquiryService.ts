import type { IEnquiry } from '../../../store/reducers/types'
import { collection, getDocs, query, where, QueryConstraint } from 'firebase/firestore'
import { db } from '../../../firebase'

export const fetchAllEnquiries = async (filters: any) => {
    try {
        const constraints: QueryConstraint[] = []
        if (filters) {
            Object.entries(filters).forEach(([field, value]) => {
                constraints.push(where(field, '==', value))
            })
        }

        const q = query(collection(db, 'acn-enquiries'), ...constraints)

        const snapshot = await getDocs(q)

        const enquiries = snapshot.docs.map((doc) => {
            const data = doc.data() as IEnquiry
            return {
                ...data,
                id: doc.id,
            }
        })

        return { success: true, data: enquiries }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
