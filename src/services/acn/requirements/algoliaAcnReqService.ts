// services/algolia/algoliaRequirementsService.ts

import { algoliasearch, type SearchResponse } from 'algoliasearch'

// Types
export interface RequirementSearchParams {
    query?: string
    filters?: RequirementSearchFilters
    page?: number
    hitsPerPage?: number
    sortBy?: string
    propertyType?: 'Resale' | 'Rental'
}

export interface RequirementSearchFilters {
    requirementStatus?: string[]
    assetType?: string[]
    micromarket?: string[]
    configuration?: string[]
    budget?: {
        min?: number
        max?: number
    }
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

// Algolia client configuration
const resaleClient = algoliasearch('YXMDFDHYEO', '9394fe020e50445263e0171877e37a2a')
const rentalClient = algoliasearch('QPC0GQQX8S', 'a0a0e3ba32c5b4158707987d4244fd32')
const RESALE_INDEX_NAME = 'requirements'
const RENTAL_INDEX_NAME = 'rental-requirements'

// Helper function to get the correct client and index
const getClientAndIndex = (propertyType: 'Resale' | 'Rental' = 'Resale', sortBy?: string) => {
    const client = propertyType === 'Resale' ? resaleClient : rentalClient
    const baseIndex = propertyType === 'Resale' ? RESALE_INDEX_NAME : RENTAL_INDEX_NAME

    if (!sortBy || sortBy === 'relevance') {
        return { client, indexName: baseIndex }
    }

    const sortIndexMap: Record<string, string> = {
        budget_asc: `${baseIndex}_budget_asc`,
        budget_desc: `${baseIndex}_budget_desc`,
        date_desc: `${baseIndex}_date_desc`,
    }

    return { client, indexName: sortIndexMap[sortBy] || baseIndex }
}

const buildFilterString = (filters: RequirementSearchFilters): string => {
    const filterParts: string[] = []

    if (filters.requirementStatus && filters.requirementStatus.length > 0) {
        const statusFilters = filters.requirementStatus.map((status) => `requirementStatus:'${status}'`).join(' OR ')
        filterParts.push(`(${statusFilters})`)
    }

    if (filters.assetType && filters.assetType.length > 0) {
        const assetTypeFilters = filters.assetType.map((type) => `assetType:'${type}'`).join(' OR ')
        filterParts.push(`(${assetTypeFilters})`)
    }

    if (filters.micromarket && filters.micromarket.length > 0) {
        const micromarketFilters = filters.micromarket.map((market) => `micromarket:'${market}'`).join(' OR ')
        filterParts.push(`(${micromarketFilters})`)
    }

    if (filters.configuration && filters.configuration.length > 0) {
        const configFilters = filters.configuration.map((config) => `configuration:'${config}'`).join(' OR ')
        filterParts.push(`(${configFilters})`)
    }

    if (filters.budget) {
        if (filters.budget.min !== undefined) {
            filterParts.push(`budget.from >= ${filters.budget.min}`)
        }
        if (filters.budget.max !== undefined) {
            filterParts.push(`budget.to <= ${filters.budget.max}`)
        }
    }

    return filterParts.join(' AND ')
}

// Main search function
export const searchRequirements = async (
    params: RequirementSearchParams = {},
): Promise<AlgoliaRequirementSearchResponse> => {
    try {
        const { query = '', filters = {}, page = 0, hitsPerPage = 50, sortBy, propertyType = 'Resale' } = params
        const { client, indexName } = getClientAndIndex(propertyType, sortBy)
        const filterString = buildFilterString(filters)

        console.log('Algolia search params:', {
            indexName,
            query,
            page,
            hitsPerPage,
            filters: filterString,
        })

        const response = await client.search({
            requests: [
                {
                    indexName,
                    query,
                    page,
                    hitsPerPage,
                    filters: filterString,
                    facets: ['micromarket', 'assetType', 'requirementStatus', 'configuration'],
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
        console.error('Algolia search error:', error)
        throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Get facet values for a specific attribute
export const getFacetValues = async (
    facetName: string,
    query?: string,
    maxFacetHits: number = 100,
): Promise<{ value: string; count: number }[]> => {
    try {
        const response = await resaleClient.search({
            requests: [
                {
                    indexName: RESALE_INDEX_NAME,
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
        console.error('Get facet values error:', error)
        throw new Error(`Failed to get facet values: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Get all facets for filters initialization
export const getAllFacets = async (
    propertyType: 'Resale' | 'Rental' = 'Resale',
): Promise<Record<string, { value: string; count: number }[]>> => {
    try {
        const { client, indexName } = getClientAndIndex(propertyType)
        const response = await client.search({
            requests: [
                {
                    indexName,
                    query: '',
                    hitsPerPage: 0,
                    facets: ['requirementStatus', 'assetType', 'micromarket', 'configuration'],
                    maxValuesPerFacet: 100,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const facets: Record<string, { value: string; count: number }[]> = {}

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
        console.error('Get all facets error:', error)
        throw new Error(`Failed to get facets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Get requirement by ID
export const getRequirementById = async (objectID: string): Promise<any | null> => {
    try {
        const response = await resaleClient.getObject({
            indexName: RESALE_INDEX_NAME,
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
        await resaleClient.partialUpdateObject({
            indexName: RESALE_INDEX_NAME,
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
        const response = await resaleClient.getObjects({
            requests: objectIDs.map((objectID) => ({
                indexName: RESALE_INDEX_NAME,
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
    getFacetValues,
    getAllFacets,
    getRequirementById,
    updateRequirement,
    getRequirementsByIds,
    trackRequirementSearchEvent,
    formatRequirementFiltersForDisplay,
}
