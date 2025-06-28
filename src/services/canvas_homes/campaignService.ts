import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'

// Define Campaign interface based on the provided data structure
interface Campaign {
    campaignId: string
    campaignName: string
    activeDuration: string
    averageCpc: string
    costPerDay: string
    ctr: string
    dailyAvgCost: string
    endDate: string
    isPaused: boolean
    lastActiveDate: string
    startDate: string
    status: string
    totalClicks: number
    totalConversions: string
    totalConversionsValue: string
    totalCost: string
    totalImpressions: number
}

class CampaignService {
    private collectionName = 'google_ads_campaigns'

    /**
     * Fetch a campaign document by its document ID
     */
    async getById(id: string): Promise<Campaign | null> {
        try {
            const campaignDoc = await getDoc(doc(db, this.collectionName, id))

            if (campaignDoc.exists()) {
                return { ...campaignDoc.data() } as Campaign
            }
            return null
        } catch (error) {
            console.error('Error fetching campaign:', error)
            throw new Error(`Failed to fetch campaign: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Fetch a campaign document by its campaignId field
     */
    async getByCampaignId(campaignId: string): Promise<Campaign | null> {
        try {
            const campaignQuery = query(collection(db, this.collectionName), where('campaignId', '==', campaignId))

            const querySnapshot = await getDocs(campaignQuery)

            if (!querySnapshot.empty) {
                const campaignDoc = querySnapshot.docs[0]
                return { ...campaignDoc.data() } as Campaign
            }

            return null
        } catch (error) {
            console.error('Error fetching campaign by campaignId:', error)
            throw new Error(
                `Failed to fetch campaign by campaignId: ${error instanceof Error ? error.message : 'Unknown error'}`,
            )
        }
    }
}

export const campaignService = new CampaignService()
