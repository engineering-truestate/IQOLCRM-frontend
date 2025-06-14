// services/algolia/algoliaRequirementsService.ts

import { algoliasearch, type SearchResponse } from 'algoliasearch'

// Algolia client configuration
const searchClient = algoliasearch('J150UQXDLH', '146a46f31a26226786751f663e88ae33')
const INDEX_NAME = 'acn-agent-requirement'

// Types for search parameters
export interface RequirementSearchFilters {
    status?: string[]
    assetType?: string[]
}

export interface RequirementSearchParams {
    query?: string
    filters?: RequirementSearchFilters
    page?: number
    hitsPerPage?: number
    sortBy?: string
}

export interface AlgoliaRequirementSearchResponse {
    hits: any[]
    nbHits: number
    page: number
    nbPages: number
    hitsPerPage: number
    processingTimeMS: number
    facets?: Record<string, Record<string, number>>
}

export interface RequirementFacetValue {
    value: string
    count: number
    highlighted?: string
}

const buildRequirementFilterString = (filters: RequirementSearchFilters): string => {
    const filterParts: string[] = []

    if (filters.status && filters.status.length > 0) {
        const statusFilters = filters.status.map((status) => `status:'${status}'`).join(' OR ')
        filterParts.push(`(${statusFilters})`)
    }

    if (filters.assetType && filters.assetType.length > 0) {
        const assetTypeFilters = filters.assetType.map((type) => `assetType:'${type}'`).join(' OR ')
        filterParts.push(`(${assetTypeFilters})`)
    }

    return filterParts.join(' AND ')
}

// Helper function to get the correct index name for sorting
const getRequirementIndexNameForSort = (sortBy?: string): string => {
    if (!sortBy || sortBy === 'relevance') {
        return INDEX_NAME
    }

    const sortIndexMap: Record<string, string> = {
        budget_asc: `${INDEX_NAME}_budget_asc`,
        budget_desc: `${INDEX_NAME}_budget_desc`,
        date_desc: `${INDEX_NAME}_date_desc`,
        date_asc: `${INDEX_NAME}_date_asc`,
        updated_desc: `${INDEX_NAME}_updated_desc`,
    }

    return sortIndexMap[sortBy] || INDEX_NAME
}

// Main search function for requirements
export const searchRequirements = async (
    params: RequirementSearchParams = {},
): Promise<AlgoliaRequirementSearchResponse> => {
    try {
        const { query = '', filters = {}, page = 0, hitsPerPage = 50, sortBy } = params

        const indexName = getRequirementIndexNameForSort(sortBy)
        const filterString = buildRequirementFilterString(filters)

        console.log('Algolia requirements search params:', {
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
                    facets: ['status', 'assetType'],
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
        console.error('Algolia requirements search error:', error)
        throw new Error(`Requirements search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Get facet values for a specific attribute
export const getRequirementFacetValues = async (
    facetName: string,
    query?: string,
    maxFacetHits: number = 100,
): Promise<RequirementFacetValue[]> => {
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
        console.error('Get requirement facet values error:', error)
        throw new Error(
            `Failed to get requirement facet values: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
    }
}

// Get all facets for requirements filters initialization
export const getAllRequirementFacets = async (): Promise<Record<string, RequirementFacetValue[]>> => {
    try {
        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: '',
                    hitsPerPage: 0, // We only want facets, not hits
                    facets: ['status', 'assetType'],
                    maxValuesPerFacet: 100,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const facets: Record<string, RequirementFacetValue[]> = {}

        if (result.facets) {
            Object.entries(result.facets).forEach(([facetName, facetValues]) => {
                facets[facetName] = Object.entries(facetValues)
                    .map(([value, count]) => ({
                        value,
                        count: count as number,
                    }))
                    .sort((a, b) => b.count - a.count) // Sort by count descending
            })
        }

        return facets
    } catch (error) {
        console.error('Get all requirement facets error:', error)
        throw new Error(`Failed to get requirement facets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Search with autocomplete suggestions for requirements
export const getRequirementSearchSuggestions = async (query: string): Promise<string[]> => {
    try {
        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query,
                    hitsPerPage: 5,
                    attributesToRetrieve: ['reqId', 'projectName', 'agentName', 'assetType'],
                    analytics: false,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const suggestions = new Set<string>()

        result.hits.forEach((hit: any) => {
            if (hit.reqId) suggestions.add(hit.reqId)
            if (hit.projectName) suggestions.add(hit.projectName)
            if (hit.agentName) suggestions.add(hit.agentName)
            if (hit.assetType) suggestions.add(hit.assetType)
        })

        return Array.from(suggestions).slice(0, 10)
    } catch (error) {
        console.error('Get requirement search suggestions error:', error)
        return []
    }
}

// Get requirement by ID
export const getRequirementById = async (objectID: string): Promise<any | null> => {
    try {
        const response = await searchClient.getObject({
            indexName: INDEX_NAME,
            objectID,
        })

        return response
    } catch (error) {
        console.error('Get requirement by ID error:', error)
        return null
    }
}

// Update requirement (for status changes etc.)
export const updateRequirement = async (objectID: string, updates: Record<string, any>): Promise<boolean> => {
    try {
        await searchClient.partialUpdateObject({
            indexName: INDEX_NAME,
            objectID,
            attributesToUpdate: updates,
        })

        return true
    } catch (error) {
        console.error('Update requirement error:', error)
        return false
    }
}

// Batch operations for getting multiple requirements
export const getRequirementsByIds = async (objectIDs: string[]): Promise<any[]> => {
    try {
        const response = await searchClient.getObjects({
            requests: objectIDs.map((objectID) => ({
                indexName: INDEX_NAME,
                objectID,
            })),
        })

        return response.results.filter((result) => result !== null)
    } catch (error) {
        console.error('Get requirements by IDs error:', error)
        throw new Error(`Failed to get requirements: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Analytics - track search events for requirements
export const trackRequirementSearchEvent = async (
    eventName: string,
    properties: Record<string, any>,
): Promise<void> => {
    try {
        console.log('Requirement search event tracked:', eventName, properties)
    } catch (error) {
        console.error('Track requirement search event error:', error)
    }
}

// Helper function to format filters for debugging
export const formatRequirementFiltersForDisplay = (filters: RequirementSearchFilters): string => {
    const parts: string[] = []

    Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
            parts.push(`${key}: ${value.join(', ')}`)
        } else if (value && typeof value === 'object' && 'min' in value) {
            const range = value as { min?: number; max?: number }
            if (range.min !== undefined || range.max !== undefined) {
                parts.push(`${key}: ${range.min || 0} - ${range.max || '∞'}`)
            }
        }
    })

    return parts.join(' | ')
}

export default {
    searchRequirements,
    getRequirementFacetValues,
    getAllRequirementFacets,
    getRequirementSearchSuggestions,
    getRequirementById,
    updateRequirement,
    getRequirementsByIds,
    trackRequirementSearchEvent,
    formatRequirementFiltersForDisplay,
}
