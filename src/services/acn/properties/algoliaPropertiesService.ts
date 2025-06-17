// services/algolia/algoliaService.ts

import { algoliasearch, type SearchResponse } from 'algoliasearch'

// Algolia client configuration
const searchClient = algoliasearch('1F93ZRBESW', 'b9023694178852d83995620a6c9ba933')
const INDEX_NAME = 'properties'

// Types for search parameters
export interface SearchFilters {
    status?: string[]
    kam?: string[]
    assetType?: string[]
    micromarket?: string[]
    priceRange?: {
        min?: number
        max?: number
    }
}

export interface SearchParams {
    query?: string
    filters?: SearchFilters
    page?: number
    hitsPerPage?: number
    sortBy?: string
}

export interface AlgoliaSearchResponse {
    hits: any[]
    nbHits: number
    page: number
    nbPages: number
    hitsPerPage: number
    processingTimeMS: number
    facets?: Record<string, Record<string, number>>
}

export interface FacetValue {
    value: string
    count: number
    highlighted?: string
}

const buildFilterString = (filters: SearchFilters): string => {
    const filterParts: string[] = []

    // Always exclude closed properties
    filterParts.push("NOT status:'Closed'")

    if (filters.status && filters.status.length > 0) {
        const statusFilters = filters.status.map((status) => `status:'${status}'`).join(' OR ')
        filterParts.push(`(${statusFilters})`)
    }

    if (filters.kam && filters.kam.length > 0) {
        const kamFilters = filters.kam.map((kam) => `kam:'${kam}'`).join(' OR ')
        filterParts.push(`(${kamFilters})`)
    }

    if (filters.assetType && filters.assetType.length > 0) {
        const assetTypeFilters = filters.assetType.map((type) => `assetType:'${type}'`).join(' OR ')
        filterParts.push(`(${assetTypeFilters})`)
    }

    if (filters.micromarket && filters.micromarket.length > 0) {
        const micromarketFilters = filters.micromarket.map((market) => `micromarket:'${market}'`).join(' OR ')
        filterParts.push(`(${micromarketFilters})`)
    }

    if (filters.priceRange) {
        if (filters.priceRange.min !== undefined) {
            filterParts.push(`price >= ${filters.priceRange.min}`)
        }
        if (filters.priceRange.max !== undefined) {
            filterParts.push(`price <= ${filters.priceRange.max}`)
        }
    }

    return filterParts.join(' AND ')
}

// Helper function to get the correct index name for sorting
const getIndexNameForSort = (sortBy?: string): string => {
    if (!sortBy || sortBy === 'relevance') {
        return INDEX_NAME
    }

    const sortIndexMap: Record<string, string> = {
        price_asc: `${INDEX_NAME}_price_asc`,
        price_desc: `${INDEX_NAME}_price_desc`,
        recent: `${INDEX_NAME}`,
    }

    return sortIndexMap[sortBy] || INDEX_NAME
}

// Main search function
export const searchProperties = async (params: SearchParams = {}): Promise<AlgoliaSearchResponse> => {
    try {
        const { query = '', filters = {}, page = 0, hitsPerPage = 50, sortBy } = params

        const indexName = getIndexNameForSort(sortBy)
        const filterString = buildFilterString(filters)

        console.log('Algolia search params:', {
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
                    facets: ['micromarket', 'assetType', 'status', 'kam'],
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
): Promise<FacetValue[]> => {
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
        console.error('Get facet values error:', error)
        throw new Error(`Failed to get facet values: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Get all facets for filters initialization
export const getAllFacets = async (): Promise<Record<string, FacetValue[]>> => {
    try {
        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: '',
                    hitsPerPage: 0, // We only want facets, not hits
                    facets: ['status', 'kam', 'assetType', 'micromarket'],
                    maxValuesPerFacet: 100,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const facets: Record<string, FacetValue[]> = {}

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
        console.error('Get all facets error:', error)
        throw new Error(`Failed to get facets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Search with autocomplete suggestions
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
    try {
        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query,
                    hitsPerPage: 5,
                    attributesToRetrieve: ['propertyId', 'nameOfTheProperty', 'micromarket'],
                    analytics: false,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const suggestions = new Set<string>()

        result.hits.forEach((hit: any) => {
            if (hit.propertyId) suggestions.add(hit.propertyId)
            if (hit.nameOfTheProperty) suggestions.add(hit.nameOfTheProperty)
            if (hit.micromarket) suggestions.add(hit.micromarket)
        })

        return Array.from(suggestions).slice(0, 10)
    } catch (error) {
        console.error('Get search suggestions error:', error)
        return []
    }
}

// Advanced search with multiple indices (if you have different property types)
export const searchMultipleIndices = async (
    query: string,
    indices: string[] = [INDEX_NAME],
): Promise<Record<string, AlgoliaSearchResponse>> => {
    try {
        const requests = indices.map((indexName) => ({
            indexName,
            query,
            hitsPerPage: 20,
            facets: ['status', 'kam', 'assetType'],
        }))

        const response = await searchClient.search({
            requests,
        })

        const results: Record<string, AlgoliaSearchResponse> = {}

        response.results.forEach((result: any, index: number) => {
            const searchResult = result as SearchResponse<any>
            results[indices[index]] = {
                hits: searchResult.hits,
                nbHits: searchResult.nbHits || 0,
                page: searchResult.page || 0,
                nbPages: searchResult.nbPages || 0,
                hitsPerPage: searchResult.hitsPerPage || 0,
                processingTimeMS: searchResult.processingTimeMS,
                facets: searchResult.facets,
            }
        })

        return results
    } catch (error) {
        console.error('Multiple indices search error:', error)
        throw new Error(`Multi-search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Batch operations for getting multiple objects
export const getPropertiesByIds = async (objectIDs: string[]): Promise<any[]> => {
    try {
        const response = await searchClient.getObjects({
            requests: objectIDs.map((objectID) => ({
                indexName: INDEX_NAME,
                objectID,
            })),
        })

        return response.results.filter((result) => result !== null)
    } catch (error) {
        console.error('Get properties by IDs error:', error)
        throw new Error(`Failed to get properties: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Search for facet values (useful for facet search)

export const searchForFacetValues = async (
    facetName: string,
    facetQuery: string = '',
    maxFacetHits: number = 10,
): Promise<FacetValue[]> => {
    try {
        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: facetQuery,
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
                highlighted: value,
            }))
            .filter((item) => facetQuery === '' || item.value.toLowerCase().includes(facetQuery.toLowerCase()))
            .slice(0, maxFacetHits)
            .sort((a, b) => b.count - a.count)
    } catch (error) {
        console.error('Search for facet values error:', error)
        return []
    }
}

// Get object by ID
export const getPropertyById = async (objectID: string): Promise<any | null> => {
    console.log(objectID, 'objectID')
    try {
        const response = await searchClient.getObject({
            indexName: INDEX_NAME,
            objectID,
        })

        return response
    } catch (error) {
        console.error('Get property by ID error:', error)
        return null
    }
}

// Analytics - track search events
export const trackSearchEvent = async (eventName: string, properties: Record<string, any>): Promise<void> => {
    try {
        console.log('Search event tracked:', eventName, properties)
    } catch (error) {
        console.error('Track search event error:', error)
    }
}

// Helper function to format filters for debugging
export const formatFiltersForDisplay = (filters: SearchFilters): string => {
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
    searchProperties,
    getFacetValues,
    getAllFacets,
    getSearchSuggestions,
    searchMultipleIndices,
    getPropertiesByIds,
    searchForFacetValues,
    getPropertyById,
    trackSearchEvent,

    formatFiltersForDisplay,
}
