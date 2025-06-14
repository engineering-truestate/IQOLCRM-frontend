export const fetchCounts = async () => {
    try {
        const [agentCount, leadCount, requirementCount] = await Promise.all([
            fetchCollectionCount('acn-agents'),
            fetchCollectionCount('acn-leads'),
            fetchCollectionCount('acn-requirements'),
        ])

        return {
            agentCount,
            leadCount,
            requirementCount,
        }
    } catch (error) {
        console.error('Error fetching counts:', error)
        return { agentCount: 0, leadCount: 0, requirementCount: 0 }
    }
}

const fetchCollectionCount = async (collectionName: string): Promise<number> => {
    try {
        const response = await fetch(
            'https://us-central1-iqolcrm-frontend.cloudfunctions.net/getCollectionDocumentCount',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ collectionName }),
            },
        )

        if (!response.ok) {
            console.error('Error fetching collection count:', response.status, response.statusText)
            return 0
        }

        const data = await response.json()
        return data.documentCount || 0
    } catch (error) {
        console.error('Error fetching collection count:', error)
        return 0
    }
}
