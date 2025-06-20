import { algoliasearch, type SearchResponse } from 'algoliasearch'

// Algolia client configuration
const searchClient = algoliasearch('VR5QNVAGQ8', '8859e68d9f9f21f28d0983ffe8bd7705')
const INDEX_NAME = 'agents'

// Types for search parameters
export interface AgentSearchFilters {
    status?: string[]
    role?: string[]
    location?: string[]
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

    if (filters.status && filters.status.length > 0) {
        const statusFilters = filters.status.map((status) => `status:'${status}'`).join(' OR ')
        filterParts.push(`(${statusFilters})`)
    }

    if (filters.role && filters.role.length > 0) {
        const roleFilters = filters.role.map((role) => `role:'${role}'`).join(' OR ')
        filterParts.push(`(${roleFilters})`)
    }

    if (filters.location && filters.location.length > 0) {
        const locationFilters = filters.location.map((location) => `location:'${location}'`).join(' OR ')
        filterParts.push(`(${locationFilters})`)
    }

    return filterParts.join(' AND ')
}

// Helper function to get the correct index name for sorting
const getAgentIndexNameForSort = (sortBy?: string): string => {
    if (!sortBy || sortBy === 'relevance') {
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
        })

        const response = await searchClient.search({
            requests: [
                {
                    indexName,
                    query,
                    page,
                    hitsPerPage,
                    filters: filterString,
                    facets: ['status', 'role', 'location'],
                    maxValuesPerFacet: 100,
                    analytics: true,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>

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
export const getAllAgentFacets = async (): Promise<Record<string, AgentFacetValue[]>> => {
    try {
        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: '',
                    hitsPerPage: 0,
                    facets: ['status', 'role', 'location'],
                    maxValuesPerFacet: 100,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const facets: Record<string, AgentFacetValue[]> = {}

        if (result.facets) {
            Object.entries(result.facets).forEach(([facetName, facetValues]) => {
                facets[facetName] = Object.entries(facetValues)
                    .map(([value, count]) => ({
                        value,
                        count: count as number,
                    }))
                    .sort((a, b) => b.count - a.count)
            })
        }

        return facets
    } catch (error) {
        console.error('Get all agent facets error:', error)
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

export default {
    searchAgents,
    getAgentFacetValues,
    getAllAgentFacets,
    getAgentById,
    getAgentsByIds,
    getAgentSearchSuggestions,
    formatAgentFiltersForDisplay,
}
