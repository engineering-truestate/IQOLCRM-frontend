import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'

// Define Agent type directly in this file
interface Agent {
    name: string
    uid?: string
    canvasHomes?: {
        agentId?: string
        role?: string
    }
}

export class AgentService {
    static async fetchSalesAgents(): Promise<Record<string, string>> {
        try {
            const colRef = collection(db, 'internal-agents')

            const snapshot = await getDocs(colRef)

            const agentMap: Record<string, string> = {}

            snapshot.docs.forEach((doc) => {
                const data = doc.data() as Agent

                if (data?.canvasHomes?.agentId && data?.canvasHomes?.role == 'sales' && data.name) {
                    agentMap[data?.canvasHomes.agentId] = data.name
                }
            })

            return agentMap
        } catch (error) {
            console.error('Error fetching agents:', error)
            throw error
        }
    }
}
