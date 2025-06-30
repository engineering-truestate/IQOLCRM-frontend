import { algoliasearch, type SearchResponse } from 'algoliasearch'

// Algolia client configuration
const searchClient = algoliasearch('VR5QNVAGQ8', '8859e68d9f9f21f28d0983ffe8bd7705')
const INDEX_NAME = 'agents'

// Consistent facets array used across all functions
const AGENT_FACETS = [
    'agentStatus',
    'appInstalled',
    'areaOfOperation',
    'businessCategory',
    'contactStatus',
    'connectHistory.timestamp',
    'inventoryStatus.available',
    'inventoryStatus.delisted',
    'inventoryStatus.hold',
    'inventoryStatus.sold',
    'kamName',
    'kamId',
    'payStatus',
    'noOfEnquiries',
    'userType',
    'activity',
    'verified',
    'blackListed',
    'lastEnquiry',
    'lastSeen',
    'lastTried',
]

// Types for search parameters
export interface AgentSearchFilters {
    agentStatus?: string
    role?: string[]
    location?: string[]
    kamName?: string
    payStatus?: string
    appInstalled?: string
    contactStatus?: string
    inventoryStatus?: {
        delisted?: boolean
        hold?: boolean
        sold?: boolean
        available?: boolean
    }
    userType?: string
    activity?: string
    verified?: boolean
    blackListed?: boolean
    areaOfOperation?: string[]
    businessCategory?: string[]
    lastEnquiryFrom?: string
    lastEnquiryTo?: string
    lastSeenFrom?: string
    lastSeenTo?: string
    lastContactFrom?: string
    lastContactTo?: string
}

export interface AgentSearchParams {
    query?: string
    filters?: AgentSearchFilters
    page?: number
    hitsPerPage?: number
    sortBy?: string
}

export interface AlgoliaAgentSearchResponse {
    hits: any[]
    nbHits: number
    page: number
    nbPages: number
    hitsPerPage: number
    processingTimeMS: number
    facets?: Record<string, Record<string, number>>
}

export interface AgentFacetValue {
    value: string
    count: number
    highlighted?: string
}

const buildAgentFilterString = (filters: AgentSearchFilters): string => {
    const filterParts: string[] = []

    // Single value filters
    const singleValueFilters = [
        { key: 'agentStatus', field: 'agentStatus' },
        { key: 'kamName', field: 'kamName' },
        { key: 'payStatus', field: 'payStatus' },
        { key: 'appInstalled', field: 'appInstalled' },
        { key: 'userType', field: 'userType' },
        { key: 'activity', field: 'activity' },
        { key: 'contactStatus', field: 'contactStatus' },
    ]

    singleValueFilters.forEach(({ key, field }) => {
        if (filters[key as keyof AgentSearchFilters]) {
            filterParts.push(`${field}:'${filters[key as keyof AgentSearchFilters]}'`)
        }
    })

    // Boolean filters
    if (filters.verified !== undefined) {
        filterParts.push(`verified:${filters.verified}`)
    }
    if (filters.blackListed !== undefined) {
        filterParts.push(`blackListed:${filters.blackListed}`)
    }

    // Array filters
    if (filters.areaOfOperation && filters.areaOfOperation.length > 0) {
        const areaFilters = filters.areaOfOperation.map((area) => `areaOfOperation:'${area}'`).join(' OR ')
        filterParts.push(`(${areaFilters})`)
    }

    if (filters.businessCategory && filters.businessCategory.length > 0) {
        const categoryFilters = filters.businessCategory
            .map((category) => `businessCategory:'${category}'`)
            .join(' OR ')
        filterParts.push(`(${categoryFilters})`)
    }

    // Date range filters
    const dateRangeFilters = [
        { from: 'lastEnquiryFrom', to: 'lastEnquiryTo', field: 'lastEnquiry' },
        { from: 'lastSeenFrom', to: 'lastSeenTo', field: 'lastSeen' },
        { from: 'lastContactFrom', to: 'lastContactTo', field: 'connectHistory.timestamp' },
    ]

    dateRangeFilters.forEach(({ from, to, field }) => {
        if (filters[from as keyof AgentSearchFilters] || filters[to as keyof AgentSearchFilters]) {
            const fromTimestamp = filters[from as keyof AgentSearchFilters]
            const toTimestamp = filters[to as keyof AgentSearchFilters]

            if (fromTimestamp && toTimestamp) {
                filterParts.push(`${field} >= ${fromTimestamp} AND ${field} <= ${toTimestamp}`)
            } else if (fromTimestamp) {
                filterParts.push(`${field} >= ${fromTimestamp}`)
            } else if (toTimestamp) {
                filterParts.push(`${field} <= ${toTimestamp}`)
            }
        }
    })

    // Inventory status filters
    if (filters.inventoryStatus) {
        const subStatuses = ['delisted', 'hold', 'sold', 'available']
        const selected = subStatuses.filter(
            (key) => filters.inventoryStatus && filters.inventoryStatus[key as keyof typeof filters.inventoryStatus],
        )
        if (selected.length > 0) {
            const statusFilters = selected.map((key) => `inventoryStatus.${key}:true`).join(' OR ')
            filterParts.push(`(${statusFilters})`)
        }
    }

    return filterParts.join(' AND ')
}

// Algolia sort options for Agents page (replica-based)
export const agentSortOptions = [
    { label: 'Recent First', value: 'recent' },
    { label: 'Name A-Z', value: 'name_asc' },
    { label: 'Name Z-A', value: 'name_desc' },
]

// Helper function to get the correct index name for sorting
export const getAgentIndexNameForSort = (sortBy?: string): string => {
    if (!sortBy || sortBy === 'recent') {
        return INDEX_NAME
    }

    const sortIndexMap: Record<string, string> = {
        name_asc: `${INDEX_NAME}_name_asc`,
        name_desc: `${INDEX_NAME}_name_desc`,
        recent: `${INDEX_NAME}`,
    }

    return sortIndexMap[sortBy] || INDEX_NAME
}

// Main search function for agents
export const searchAgents = async (params: AgentSearchParams = {}): Promise<AlgoliaAgentSearchResponse> => {
    try {
        const { query = '', filters = {}, page = 0, hitsPerPage = 50, sortBy } = params

        const indexName = getAgentIndexNameForSort(sortBy)
        const filterString = buildAgentFilterString(filters)

        console.log('Algolia agents search params:', {
            indexName,
            query,
            page,
            hitsPerPage,
            filters: filterString,
            facets: AGENT_FACETS,
        })

        const response = await searchClient.search({
            requests: [
                {
                    indexName,
                    query,
                    page,
                    hitsPerPage,
                    filters: filterString,
                    facets: AGENT_FACETS,
                    maxValuesPerFacet: 1000,
                    analytics: true,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>

        console.log('Search response facets:', {
            totalHits: result.nbHits,
            facetsReceived: Object.keys(result.facets || {}),
            facetCounts: result.facets,
        })

        return {
            hits: result.hits || [],
            nbHits: result.nbHits || 0,
            page: result.page || 0,
            nbPages: result.nbPages || 0,
            hitsPerPage: result.hitsPerPage || 50,
            processingTimeMS: result.processingTimeMS || 0,
            facets: result.facets || {},
        }
    } catch (error) {
        console.error('Algolia agents search error:', error)
        throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Get facet values for a specific attribute
export const getAgentFacetValues = async (
    facetName: string,
    query?: string,
    maxFacetHits: number = 100,
): Promise<AgentFacetValue[]> => {
    try {
        console.log(`Fetching facet values for: ${facetName}`)

        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: query || '',
                    hitsPerPage: 0,
                    facets: [facetName],
                    maxValuesPerFacet: maxFacetHits,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const facetValues = result.facets?.[facetName] || {}

        console.log(`Facet values for ${facetName}:`, facetValues)

        return Object.entries(facetValues)
            .map(([value, count]) => ({
                value,
                count: count as number,
            }))
            .sort((a, b) => b.count - a.count)
    } catch (error) {
        console.error('Get agent facet values error:', error)
        throw new Error(`Failed to get facet values: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Get all facets for filters initialization
export const getAllAgentFacets = async (): Promise<Record<string, any>> => {
    try {
        console.log('Fetching all agent facets with facets:', AGENT_FACETS)

        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: '',
                    hitsPerPage: 0,
                    facets: AGENT_FACETS,
                    maxValuesPerFacet: 1000,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>

        console.log('All facets response:', {
            totalHits: result.nbHits,
            facetsReceived: Object.keys(result.facets || {}),
            facetCounts: Object.keys(result.facets || {}).map((key) => ({
                facet: key,
                count: Object.keys(result.facets![key] || {}).length,
            })),
        })

        return result.facets || {}
    } catch (error) {
        console.error('Failed to fetch agent facets:', error)
        throw new Error(`Failed to get facets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Get agent by ID
export const getAgentById = async (objectID: string): Promise<any | null> => {
    try {
        const response = await searchClient.getObject({
            indexName: INDEX_NAME,
            objectID,
        })

        return response
    } catch (error) {
        console.error('Get agent by ID error:', error)
        return null
    }
}

// Get agents by IDs
export const getAgentsByIds = async (objectIDs: string[]): Promise<any[]> => {
    try {
        const response = await searchClient.getObjects({
            requests: objectIDs.map((objectID) => ({
                indexName: INDEX_NAME,
                objectID,
            })),
        })

        return response.results.filter((result) => result !== null)
    } catch (error) {
        console.error('Get agents by IDs error:', error)
        throw new Error(`Failed to get agents: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Search with autocomplete suggestions
export const getAgentSearchSuggestions = async (query: string): Promise<string[]> => {
    try {
        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query,
                    hitsPerPage: 5,
                    attributesToRetrieve: ['agentId', 'name', 'location'],
                    analytics: false,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const suggestions = new Set<string>()

        result.hits.forEach((hit: any) => {
            if (hit.agentId) suggestions.add(hit.agentId)
            if (hit.name) suggestions.add(hit.name)
            if (hit.location) suggestions.add(hit.location)
        })

        return Array.from(suggestions).slice(0, 10)
    } catch (error) {
        console.error('Get agent search suggestions error:', error)
        return []
    }
}

// Helper function to format filters for debugging
export const formatAgentFiltersForDisplay = (filters: AgentSearchFilters): string => {
    const parts: string[] = []

    Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
            parts.push(`${key}: ${value.join(', ')}`)
        }
    })

    return parts.join(' | ')
}

// Get date range limits from database
export const getAgentDateLimits = async (): Promise<{
    lastEnquiry: { min: number; max: number }
    lastSeen: { min: number; max: number }
    lastContact: { min: number; max: number }
}> => {
    try {
        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: '',
                    hitsPerPage: 0,
                    facets: ['lastEnquiry', 'lastSeen', 'connectHistory.timestamp'],
                    maxValuesPerFacet: 1000,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const facets = result.facets || {}

        const getMinMax = (facetName: string) => {
            const facetValues = facets[facetName] || {}
            const timestamps = Object.keys(facetValues)
                .map(Number)
                .filter((t) => !isNaN(t))

            if (timestamps.length === 0) {
                return { min: 0, max: 0 }
            }

            return {
                min: Math.min(...timestamps),
                max: Math.max(...timestamps),
            }
        }

        return {
            lastEnquiry: getMinMax('lastEnquiry'),
            lastSeen: getMinMax('lastSeen'),
            lastContact: getMinMax('connectHistory.timestamp'),
        }
    } catch (error) {
        console.error('Get agent date limits error:', error)
        // Return default values if error occurs
        const now = Math.floor(Date.now() / 1000)
        return {
            lastEnquiry: { min: 0, max: now },
            lastSeen: { min: 0, max: now },
            lastContact: { min: 0, max: now },
        }
    }
}

export const getTodayAgentFacets = async (): Promise<Record<string, any>> => {
    try {
        // Calculate today's start and end timestamps (in seconds)
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)

        const startTimestamp = Math.floor(startOfDay.getTime() / 1000)
        const endTimestamp = Math.floor(endOfDay.getTime() / 1000)

        // Build filter string for today's lastConnected values
        const todayFilter = `lastTried >= ${startTimestamp} AND lastTried <= ${endTimestamp}`

        console.log('Today filter:', todayFilter)
        console.log('Today facets being requested:', AGENT_FACETS)

        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: '',
                    hitsPerPage: 0,
                    filters: todayFilter,
                    facets: AGENT_FACETS,
                    maxValuesPerFacet: 1000,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>

        console.log('Today facets response:', {
            totalHits: result.nbHits,
            facetsReceived: Object.keys(result.facets || {}),
            facetCounts: result.facets,
        })

        return result.facets || {}
    } catch (error) {
        console.error('Failed to fetch today agent facets:', error)
        throw new Error(`Failed to get today facets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Test individual facets function for debugging
export const testFacet = async (facetName: string): Promise<any> => {
    try {
        console.log(`Testing facet: ${facetName}`)

        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: '',
                    hitsPerPage: 5,
                    facets: [facetName],
                    maxValuesPerFacet: 100,
                    attributesToRetrieve: [facetName, 'objectID'],
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>

        console.log(`Facet ${facetName} results:`, {
            totalHits: result.nbHits,
            facetValues: result.facets?.[facetName],
            sampleData: result.hits.slice(0, 3).map((hit) => ({
                objectID: hit.objectID,
                [facetName]: hit[facetName],
            })),
        })

        return result.facets?.[facetName] || {}
    } catch (error) {
        console.error(`Failed to test facet ${facetName}:`, error)
        return {}
    }
}

// Inspect agent data function for debugging
export const inspectAgentData = async (): Promise<void> => {
    try {
        console.log('Inspecting agent data structure...')

        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: '',
                    hitsPerPage: 3,
                    attributesToRetrieve: ['*'],
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        console.log('Sample agent data:', result.hits)

        // Check what fields actually exist
        if (result.hits.length > 0) {
            console.log('Available fields in first record:', Object.keys(result.hits[0]))

            // Check which of our expected facets exist
            const firstRecord = result.hits[0]
            const existingFacets = AGENT_FACETS.filter((facet) => {
                const value = facet.includes('.')
                    ? facet.split('.').reduce((obj, key) => obj?.[key], firstRecord)
                    : firstRecord[facet]
                return value !== undefined
            })

            console.log('Facets that exist in data:', existingFacets)
            console.log(
                "Facets that DON'T exist in data:",
                AGENT_FACETS.filter((f) => !existingFacets.includes(f)),
            )
        }
    } catch (error) {
        console.error('Failed to inspect data:', error)
    }
}

export default {
    searchAgents,
    getAgentFacetValues,
    getAllAgentFacets,
    getAgentById,
    getAgentsByIds,
    getAgentSearchSuggestions,
    formatAgentFiltersForDisplay,
    getAgentDateLimits,
    getTodayAgentFacets,
    testFacet,
    inspectAgentData,
}
