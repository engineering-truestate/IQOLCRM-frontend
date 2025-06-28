import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import type { Agent } from '../types'

export class AgentService {
    static async fetchSalesAgents(): Promise<Agent[]> {
        try {
            const colRef = collection(db, 'internal-agents')
            const q = query(colRef, where('platform.canvasHomes.role', '==', 'sales'))

            const snapshot = await getDocs(q)

            const agents = snapshot.docs.map((doc) => {
                const data = doc.data() as Omit<Agent, 'id'>
                return {
                    ...data,
                    id: doc.id, // Use Firestore document ID as unique agent ID
                } as Agent
            })

            return agents
        } catch (error) {
            console.error('Error fetching sales agents:', error)
            throw error
        }
    }
}
