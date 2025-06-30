// marketingAlgoliaService.ts - Fixed version with consistent timestamp handling

import { algoliasearch, type SearchResponse } from 'algoliasearch'

// Algolia client configuration
const searchClient = algoliasearch('6BFCE2XYSC', 'd5a143df9d4ed0681c0f3a3d459fe17a')
const INDEX_NAME = 'canvashomescampaigns'

// Types for search parameters
export interface CampaignSearchFilters {
    campaignName?: string[]
    status?: string[]
    dateRange?: string
    addedRange?: {
        startDate?: string | Date | number
        endDate?: string | Date | number
    }
}

export interface CampaignSearchParams {
    query?: string
    filters?: CampaignSearchFilters
    page?: number
    hitsPerPage?: number
    sortBy?: string
}

export interface AlgoliaCampaignSearchResponse {
    hits: any[]
    nbHits: number
    page: number
    nbPages: number
    hitsPerPage: number
    processingTimeMS: number
    facets?: Record<string, Record<string, number>>
}

export interface CampaignFacetValue {
    value: string
    count: number
    highlighted?: string
}

// Helper function to convert date to timestamp (consistent seconds format)
const convertToTimestamp = (date: string | Date | number): number => {
    if (typeof date === 'number') {
        // If it's already a number, assume it's milliseconds and convert to seconds
        return date > 1000000000000 ? Math.floor(date / 1000) : date
    }

    if (typeof date === 'string') {
        const dateObj = new Date(date)
        return Math.floor(dateObj.getTime() / 1000) // Convert to seconds
    }

    if (date instanceof Date) {
        return Math.floor(date.getTime() / 1000) // Convert to seconds
    }

    return 0
}

const buildCampaignFilterString = (filters: CampaignSearchFilters): string => {
    const filterParts: string[] = []

    if (filters.campaignName && filters.campaignName.length > 0) {
        const campaignFilters = filters.campaignName.map((campaign) => `campaignName:"${campaign}"`).join(' OR ')
        filterParts.push(`(${campaignFilters})`)
    }

    if (filters.status && filters.status.length > 0) {
        const statusFilters = filters.status.map((status) => `status:"${status}"`).join(' OR ')
        filterParts.push(`(${statusFilters})`)
    }

    // Date range filter - consistent seconds timestamps
    if (filters.dateRange) {
        const now = Math.floor(Date.now() / 1000) // Convert to seconds
        let startTime = 0

        switch (filters.dateRange) {
            case 'today': {
                const todayStart = new Date()
                todayStart.setHours(0, 0, 0, 0)
                startTime = Math.floor(todayStart.getTime() / 1000) // Convert to seconds
                break
            }
            case '7d': {
                startTime = now - 7 * 24 * 60 * 60 // 7 days in seconds
                break
            }
            case '30d': {
                startTime = now - 30 * 24 * 60 * 60 // 30 days in seconds
                break
            }
            case '90d': {
                startTime = now - 90 * 24 * 60 * 60 // 90 days in seconds
                break
            }
        }

        if (startTime > 0) {
            filterParts.push(`added >= ${startTime}`)
            console.log('Added date filter:', `added >= ${startTime}`)
        }
    }

    // Calendar-based range filter for 'added' field
    if (filters.addedRange) {
        const rangeFilters: string[] = []

        if (filters.addedRange.startDate) {
            const startTimestamp = convertToTimestamp(filters.addedRange.startDate)
            if (startTimestamp > 0) {
                rangeFilters.push(`added >= ${startTimestamp}`)
            }
        }

        if (filters.addedRange.endDate) {
            const endTimestamp = convertToTimestamp(filters.addedRange.endDate)
            if (endTimestamp > 0) {
                // Add 24 hours to end date to include the full day
                const endOfDay = endTimestamp + 24 * 60 * 60 - 1
                rangeFilters.push(`added <= ${endOfDay}`)
            }
        }

        if (rangeFilters.length > 0) {
            filterParts.push(`(${rangeFilters.join(' AND ')})`)
            console.log('Added calendar range filter:', rangeFilters.join(' AND '))
        }
    }

    const finalFilter = filterParts.join(' AND ')
    return finalFilter
}

// Helper function to get the correct index name for sorting
const getCampaignIndexNameForSort = (sortBy?: string): string => {
    if (!sortBy || sortBy === 'relevance') {
        return INDEX_NAME
    }

    const sortIndexMap: Record<string, string> = {
        date_desc: `${INDEX_NAME}_date_desc`,
        date_asc: `${INDEX_NAME}_date_asc`,
        name_asc: `${INDEX_NAME}_name_asc`,
        name_desc: `${INDEX_NAME}_name_desc`,
        updated_desc: `${INDEX_NAME}_updated_desc`,
        cost_desc: `${INDEX_NAME}_cost_desc`,
        cost_asc: `${INDEX_NAME}_cost_asc`,
    }

    return sortIndexMap[sortBy] || INDEX_NAME
}

// Main search function for Campaigns
export const searchCampaigns = async (params: CampaignSearchParams = {}): Promise<AlgoliaCampaignSearchResponse> => {
    try {
        const { query = '', filters = {}, page = 0, hitsPerPage = 20, sortBy } = params

        const indexName = getCampaignIndexNameForSort(sortBy)
        const filterString = buildCampaignFilterString(filters)

        const response = await searchClient.search({
            requests: [
                {
                    indexName,
                    query,
                    page,
                    hitsPerPage,
                    filters: filterString,
                    facets: ['campaignName', 'status'],
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
            hitsPerPage: result.hitsPerPage || 20,
            processingTimeMS: result.processingTimeMS || 0,
            facets: result.facets || {},
        }
    } catch (error) {
        throw new Error(`Campaign search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Get facet values for a specific attribute
export const getCampaignFacetValues = async (
    facetName: string,
    query?: string,
    maxFacetHits: number = 100,
): Promise<CampaignFacetValue[]> => {
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
        console.error('Get campaign facet values error:', error)
        throw new Error(
            `Failed to get campaign facet values: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
    }
}

// Get all facets for Campaigns filters initialization
export const getAllCampaignFacets = async (): Promise<Record<string, CampaignFacetValue[]>> => {
    try {
        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: '',
                    hitsPerPage: 0, // We only want facets, not hits
                    facets: ['campaignName', 'status'],
                    maxValuesPerFacet: 100,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const facets: Record<string, CampaignFacetValue[]> = {}

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
        console.error('Get all campaign facets error:', error)
        throw new Error(`Failed to get campaign facets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Search with autocomplete suggestions for campaigns
export const getCampaignSearchSuggestions = async (query: string): Promise<string[]> => {
    try {
        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query,
                    hitsPerPage: 5,
                    attributesToRetrieve: ['objectID', 'status', 'campaignName'],
                    analytics: false,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const suggestions = new Set<string>()

        result.hits.forEach((hit: any) => {
            if (hit.status) suggestions.add(hit.status)
            if (hit.campaignName) suggestions.add(hit.campaignName)
        })

        return Array.from(suggestions).slice(0, 10)
    } catch (error) {
        console.error('Get campaign search suggestions error:', error)
        return []
    }
}

// Get campaign by ID
export const getCampaignById = async (objectID: string): Promise<any | null> => {
    try {
        const response = await searchClient.getObject({
            indexName: INDEX_NAME,
            objectID,
        })

        return response
    } catch (error) {
        console.error('Get campaign by ID error:', error)
        return null
    }
}

// Update campaign (for status changes etc.)
export const updateCampaign = async (objectID: string, updates: Record<string, any>): Promise<boolean> => {
    try {
        await searchClient.partialUpdateObject({
            indexName: INDEX_NAME,
            objectID,
            attributesToUpdate: {
                ...updates,
                lastModified: Math.floor(Date.now() / 1000),
            },
        })

        return true
    } catch (error) {
        console.error('Update campaign error:', error)
        return false
    }
}

// Batch operations for getting multiple campaigns
export const getCampaignsByIds = async (objectIDs: string[]): Promise<any[]> => {
    try {
        const response = await searchClient.getObjects({
            requests: objectIDs.map((objectID) => ({
                indexName: INDEX_NAME,
                objectID,
            })),
        })

        return response.results.filter((result) => result !== null)
    } catch (error) {
        console.error('Get campaigns by IDs error:', error)
        throw new Error(`Failed to get campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Analytics - track search events for campaigns
export const trackCampaignSearchEvent = async (eventName: string, properties: Record<string, any>): Promise<void> => {
    try {
        console.log('Campaign search event tracked:', eventName, properties)
        // Add actual analytics tracking here if needed
    } catch (error) {
        console.error('Track campaign search event error:', error)
    }
}

// Helper function to format filters for debugging
export const formatCampaignFiltersForDisplay = (filters: CampaignSearchFilters): string => {
    const parts: string[] = []

    Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
            parts.push(`${key}: ${value.join(', ')}`)
        } else if (value && typeof value === 'object') {
            if ('startDate' in value || 'endDate' in value) {
                const range = value as { startDate?: string | Date | number; endDate?: string | Date | number }
                const start = range.startDate
                    ? new Date(convertToTimestamp(range.startDate) * 1000).toLocaleDateString()
                    : 'Start'
                const end = range.endDate
                    ? new Date(convertToTimestamp(range.endDate) * 1000).toLocaleDateString()
                    : 'End'
                parts.push(`${key}: ${start} - ${end}`)
            } else if ('min' in value) {
                const range = value as { min?: number; max?: number }
                if (range.min !== undefined || range.max !== undefined) {
                    parts.push(`${key}: ${range.min || 0} - ${range.max || '∞'}`)
                }
            }
        } else if (typeof value === 'string') {
            parts.push(`${key}: ${value}`)
        }
    })

    return parts.join(' | ')
}

// Helper function to initialize facets on app load
export default {
    searchCampaigns,
    getCampaignFacetValues,
    getAllCampaignFacets,
    getCampaignSearchSuggestions,
    getCampaignById,
    updateCampaign,
    getCampaignsByIds,
    trackCampaignSearchEvent,
    formatCampaignFiltersForDisplay,
}
