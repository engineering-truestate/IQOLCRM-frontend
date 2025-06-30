// services/algolia/algoliaService.ts

import { algoliasearch, type SearchResponse } from 'algoliasearch'

// Algolia client configuration
const resaleClient = algoliasearch('1F93ZRBESW', 'b9023694178852d83995620a6c9ba933')
const rentalClient = algoliasearch('6BDI6EEXAF', '39cc6c040a588fc945c2470671c9061a')

const RESALE_INDEX_NAME = 'properties'
const RENTAL_INDEX_NAME = 'rental-inventories'

// Types for search parameters
export interface SearchFilters {
    status?: string[]
    kamName?: string[]
    assetType?: string[]
    micromarket?: string[]
    landmark?: string
    unitType?: string[]
    noOfBathrooms?: string[]
    priceRange?: string
    kam?: string
    noOfBalcony?: string[]
    totalAskPrice?: { min?: number; max?: number }
    askPricePerSqft?: { min?: number; max?: number }
    sbua?: { min?: number; max?: number }
    facing?: string[]
    exactFloor?: string[]
    area?: string[]
    carpet?: { min?: number; max?: number }
    currentStatus?: string[]
    dateOfStatusLastCheckedFrom?: string
    dateOfStatusLastCheckedTo?: string
}

export interface SearchParams {
    query?: string
    filters?: SearchFilters
    page?: number
    hitsPerPage?: number
    sortBy?: string
    propertyType?: 'Resale' | 'Rental'
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

// Memoization utility for buildFilterString
function memoizeBuildFilterString(fn: (filters: SearchFilters) => string) {
    const cache = new Map<string, string>()
    return (filters: SearchFilters) => {
        const key = JSON.stringify(filters)
        if (cache.has(key)) {
            return cache.get(key) as string
        }
        const result = fn(filters)
        cache.set(key, result)
        return result
    }
}

const _buildFilterString = (filters: SearchFilters): string => {
    const filterParts: string[] = []

    // Always exclude closed properties
    filterParts.push("NOT status:'Closed'")

    if (filters.status && filters.status.length > 0) {
        const statusFilters = filters.status.map((status) => `status:'${status}'`).join(' OR ')
        filterParts.push(`(${statusFilters})`)
    }

    if (filters.kamName && filters.kamName.length > 0) {
        const kamNameFilters = filters.kamName.map((kamName) => `kamName:'${kamName}'`).join(' OR ')
        filterParts.push(`(${kamNameFilters})`)
    }

    if (filters.assetType && filters.assetType.length > 0) {
        const assetTypeFilters = filters.assetType.map((type) => `assetType:'${type}'`).join(' OR ')
        filterParts.push(`(${assetTypeFilters})`)
    }

    if (filters.micromarket && filters.micromarket.length > 0) {
        const micromarketFilters = filters.micromarket.map((market) => `micromarket:'${market}'`).join(' OR ')
        filterParts.push(`(${micromarketFilters})`)
    }

    if (filters.unitType && filters.unitType.length > 0) {
        const unitTypeFilters = filters.unitType.map((type) => `unitType:'${type}'`).join(' OR ')
        filterParts.push(`(${unitTypeFilters})`)
    }

    if (filters.noOfBathrooms && filters.noOfBathrooms.length > 0) {
        const bathroomFilters = filters.noOfBathrooms.map((val) => `noOfBathrooms = ${val}`).join(' OR ')
        filterParts.push(`(${bathroomFilters})`)
    }

    if (filters.noOfBalcony && filters.noOfBalcony.length > 0) {
        const balconyFilters = filters.noOfBalcony.map((val) => `noOfBalcony = ${val}`).join(' OR ')
        filterParts.push(`(${balconyFilters})`)
    }

    if (filters.facing && filters.facing.length > 0) {
        const facingFilters = filters.facing.map((val) => `facing:'${val}'`).join(' OR ')
        filterParts.push(`(${facingFilters})`)
    }

    if (filters.exactFloor && filters.exactFloor.length > 0) {
        const floorFilters = filters.exactFloor.map((val) => `exactFloor:'${val}'`).join(' OR ')
        filterParts.push(`(${floorFilters})`)
    }

    if (filters.area && filters.area.length > 0) {
        const areaFilters = filters.area.map((val) => `area:'${val}'`).join(' OR ')
        filterParts.push(`(${areaFilters})`)
    }

    if (filters.currentStatus && filters.currentStatus.length > 0) {
        const availabilityFilters = filters.currentStatus.map((val) => `currentStatus:'${val}'`).join(' OR ')
        filterParts.push(`(${availabilityFilters})`)
    }

    if (filters.totalAskPrice) {
        if (filters.totalAskPrice.min !== undefined) {
            filterParts.push(`totalAskPrice >= ${filters.totalAskPrice.min}`)
        }
        if (filters.totalAskPrice.max !== undefined) {
            filterParts.push(`totalAskPrice <= ${filters.totalAskPrice.max}`)
        }
    }

    if (filters.askPricePerSqft) {
        if (filters.askPricePerSqft.min !== undefined) {
            filterParts.push(`askPricePerSqft >= ${filters.askPricePerSqft.min}`)
        }
        if (filters.askPricePerSqft.max !== undefined) {
            filterParts.push(`askPricePerSqft <= ${filters.askPricePerSqft.max}`)
        }
    }

    if (filters.sbua) {
        if (filters.sbua.min !== undefined) {
            filterParts.push(`sbua >= ${filters.sbua.min}`)
        }
        if (filters.sbua.max !== undefined) {
            filterParts.push(`sbua <= ${filters.sbua.max}`)
        }
    }

    if (filters.carpet) {
        if (filters.carpet.min !== undefined) {
            filterParts.push(`carpet >= ${filters.carpet.min}`)
        }
        if (filters.carpet.max !== undefined) {
            filterParts.push(`carpet <= ${filters.carpet.max}`)
        }
    }

    if (filters.dateOfStatusLastCheckedFrom) {
        filterParts.push(`dateOfStatusLastChecked >= ${filters.dateOfStatusLastCheckedFrom}`)
    }
    if (filters.dateOfStatusLastCheckedTo) {
        filterParts.push(`dateOfStatusLastChecked <= ${filters.dateOfStatusLastCheckedTo}`)
    }

    return filterParts.join(' AND ')
}

export const buildFilterString = memoizeBuildFilterString(_buildFilterString)

// Helper function to get the correct client and index
const getClientAndIndex = (propertyType: 'Resale' | 'Rental' = 'Resale', sortBy?: string) => {
    const client = propertyType === 'Resale' ? resaleClient : rentalClient
    const baseIndex = propertyType === 'Resale' ? RESALE_INDEX_NAME : RENTAL_INDEX_NAME

    if (!sortBy || sortBy === 'relevance') {
        return { client, indexName: baseIndex }
    }

    const sortIndexMap: Record<string, string> = {
        price_asc: `${baseIndex}_price_asc`,
        price_desc: `${baseIndex}_price_desc`,
        properties_id_asc: `${baseIndex}_id_asc`,
        properties_id_desc: `${baseIndex}_id_desc`,
        date_desc: `${baseIndex}`,
    }

    return { client, indexName: sortIndexMap[sortBy] || baseIndex }
}

// Main search function
export const searchProperties = async (params: SearchParams = {}): Promise<AlgoliaSearchResponse> => {
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
                    facets: [
                        'micromarket',
                        'assetType',
                        'status',
                        'kamName',
                        'unitType',
                        'noOfBathrooms',
                        'noOfBalcony',
                        'facing',
                        'exactFloor',
                        'area',
                        'currentStatus',
                    ],
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
): Promise<Record<string, FacetValue[]>> => {
    try {
        const { client, indexName } = getClientAndIndex(propertyType)
        const response = await client.search({
            requests: [
                {
                    indexName,
                    query: '',
                    hitsPerPage: 0,
                    facets: [
                        'status',
                        'kamName',
                        'assetType',
                        'micromarket',
                        'unitType',
                        'noOfBathrooms',
                        'noOfBalcony',
                        'facing',
                        'exactFloor',
                        'area',
                        'currentStatus',
                        'dateOfStatusLastChecked',
                    ],
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
                    .sort((a, b) => b.count - a.count)
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
        const response = await resaleClient.search({
            requests: [
                {
                    indexName: RESALE_INDEX_NAME,
                    query,
                    hitsPerPage: 5,
                    attributesToRetrieve: ['propertyId', 'propertyName', 'micromarket'],
                    analytics: false,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const suggestions = new Set<string>()

        result.hits.forEach((hit: any) => {
            if (hit.propertyId) suggestions.add(hit.propertyId)
            if (hit.propertyName) suggestions.add(hit.propertyName)
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
    indices: string[] = [RESALE_INDEX_NAME],
): Promise<Record<string, AlgoliaSearchResponse>> => {
    try {
        const requests = indices.map((indexName) => ({
            indexName,
            query,
            hitsPerPage: 20,
            facets: ['status', 'kamName', 'assetType'],
        }))

        const response = await resaleClient.search({
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
        const response = await resaleClient.getObjects({
            requests: objectIDs.map((objectID) => ({
                indexName: RESALE_INDEX_NAME,
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
        const response = await resaleClient.search({
            requests: [
                {
                    indexName: RESALE_INDEX_NAME,
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
        const response = await resaleClient.getObject({
            indexName: RESALE_INDEX_NAME,
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
