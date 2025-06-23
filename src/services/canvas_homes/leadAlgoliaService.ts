// leadAlgoliaService.ts - Complete version with calendar range filter

import { algoliasearch, type SearchResponse } from 'algoliasearch'

// Algolia client configuration
const searchClient = algoliasearch('QUHXD0ALIH', 'ab4ed159b314f08fe68510f5ed955583')
const INDEX_NAME = 'canvashomeleads'

// Types for search parameters
export interface LeadSearchFilters {
    state?: string[]
    propertyName?: string[]
    agentName?: string[]
    agentId?: string[]
    source?: string[]
    stage?: string[]
    tag?: string[]
    taskType?: string[]
    leadStatus?: string[]
    userId?: string[]
    dateRange?: string
    // Calendar-based range filter for 'added' field
    addedRange?: {
        startDate?: string | Date | number // Start date for range
        endDate?: string | Date | number // End date for range
    }
}

export interface LeadSearchParams {
    query?: string
    filters?: LeadSearchFilters
    page?: number
    hitsPerPage?: number
    sortBy?: string
}

export interface AlgoliaLeadSearchResponse {
    hits: any[]
    nbHits: number
    page: number
    nbPages: number
    hitsPerPage: number
    processingTimeMS: number
    facets?: Record<string, Record<string, number>>
}

export interface LeadFacetValue {
    value: string
    count: number
    highlighted?: string
}

// Helper function to convert date to timestamp
const convertToTimestamp = (date: string | Date | number): number => {
    if (typeof date === 'number') {
        return date
    }

    if (typeof date === 'string') {
        return new Date(date).getTime() / 1000
    }

    if (date instanceof Date) {
        return date.getTime()
    }

    return 0
}

const buildLeadFilterString = (filters: LeadSearchFilters): string => {
    const filterParts: string[] = []

    if (filters.state && filters.state.length > 0) {
        const stateFilters = filters.state.map((state) => `state:'${state}'`).join(' OR ')
        filterParts.push(`(${stateFilters})`)
        console.log('Added state filter:', stateFilters)
    }

    if (filters.propertyName && filters.propertyName.length > 0) {
        const propertyFilters = filters.propertyName.map((property) => `propertyName:'${property}'`).join(' OR ')
        filterParts.push(`(${propertyFilters})`)
        console.log('Added propertyName filter:', propertyFilters)
    }

    if (filters.agentName && filters.agentName.length > 0) {
        const agentFilters = filters.agentName.map((agent) => `agentName:'${agent}'`).join(' OR ')
        filterParts.push(`(${agentFilters})`)
        console.log('Added agentName filter:', agentFilters)
    }

    if (filters.agentId && filters.agentId.length > 0) {
        const agentIdFilters = filters.agentId.map((id) => `agentId:'${id}'`).join(' OR ')
        filterParts.push(`(${agentIdFilters})`)
        console.log('Added agentId filter:', agentIdFilters)
    }

    if (filters.source && filters.source.length > 0) {
        const sourceFilters = filters.source.map((source) => `source:'${source}'`).join(' OR ')
        filterParts.push(`(${sourceFilters})`)
        console.log('Added source filter:', sourceFilters)
    }

    if (filters.stage && filters.stage.length > 0) {
        const stageFilters = filters.stage.map((stage) => `stage:'${stage}'`).join(' OR ')
        filterParts.push(`(${stageFilters})`)
        console.log('Added stage filter:', stageFilters)
    }

    if (filters.tag && filters.tag.length > 0) {
        const tagFilters = filters.tag.map((tag) => `tag:'${tag}'`).join(' OR ')
        filterParts.push(`(${tagFilters})`)
        console.log('Added tag filter:', tagFilters)
    }

    if (filters.taskType && filters.taskType.length > 0) {
        const taskFilters = filters.taskType.map((task) => `taskType:'${task}'`).join(' OR ')
        filterParts.push(`(${taskFilters})`)
        console.log('Added taskType filter:', taskFilters)
    }

    if (filters.leadStatus && filters.leadStatus.length > 0) {
        const statusFilters = filters.leadStatus.map((status) => `leadStatus:'${status}'`).join(' OR ')
        filterParts.push(`(${statusFilters})`)
        console.log('Added leadStatus filter:', statusFilters)
    }

    if (filters.userId && filters.userId.length > 0) {
        const userFilters = filters.userId.map((id) => `userId:'${id}'`).join(' OR ')
        filterParts.push(`(${userFilters})`)
        console.log('Added userId filter:', userFilters)
    }

    // Date range filter - Fixed for millisecond timestamps and case block scoping
    if (filters.dateRange) {
        const now = Date.now() // Use milliseconds instead of seconds
        let startTime = 0

        switch (filters.dateRange) {
            case 'today': {
                const todayStart = new Date()
                todayStart.setHours(0, 0, 0, 0)
                startTime = todayStart.getTime()
                break
            }
            case '7d': {
                startTime = now - 7 * 24 * 60 * 60 * 1000 // milliseconds
                break
            }
            case '30d': {
                startTime = now - 30 * 24 * 60 * 60 * 1000 // milliseconds
                break
            }
            case '90d': {
                startTime = now - 90 * 24 * 60 * 60 * 1000 // milliseconds
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
                rangeFilters.push(`added <= ${endTimestamp}`)
            }
        }

        if (rangeFilters.length > 0) {
            filterParts.push(`(${rangeFilters.join(' AND ')})`)
            console.log('Added calendar range filter:', rangeFilters.join(' AND '))
        }
    }

    const finalFilter = filterParts.join(' AND ')
    console.log('Final filter string:', finalFilter)
    return finalFilter
}

// Helper function to get the correct index name for sorting
const getLeadIndexNameForSort = (sortBy?: string): string => {
    if (!sortBy || sortBy === 'relevance') {
        return INDEX_NAME
    }

    const sortIndexMap: Record<string, string> = {
        date_desc: `${INDEX_NAME}_date_desc`,
        date_asc: `${INDEX_NAME}_date_asc`,
        name_asc: `${INDEX_NAME}_name_asc`,
        name_desc: `${INDEX_NAME}_name_desc`,
        updated_desc: `${INDEX_NAME}_updated_desc`,
        scheduled_asc: `${INDEX_NAME}_scheduled_asc`,
        scheduled_desc: `${INDEX_NAME}_scheduled_desc`,
    }

    return sortIndexMap[sortBy] || INDEX_NAME
}

// Main search function for leads
export const searchLeads = async (params: LeadSearchParams = {}): Promise<AlgoliaLeadSearchResponse> => {
    try {
        const { query = '', filters = {}, page = 0, hitsPerPage = 20, sortBy } = params

        const indexName = getLeadIndexNameForSort(sortBy)
        const filterString = buildLeadFilterString(filters)

        console.log('Algolia leads search params:', {
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
                    facets: ['state', 'propertyName', 'agentName', 'source', 'stage', 'tag', 'taskType', 'leadStatus'],
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
        console.error('Algolia leads search error:', error)
        throw new Error(`Leads search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Get facet values for a specific attribute
export const getLeadFacetValues = async (
    facetName: string,
    query?: string,
    maxFacetHits: number = 100,
): Promise<LeadFacetValue[]> => {
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
        console.error('Get lead facet values error:', error)
        throw new Error(`Failed to get lead facet values: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Get all facets for leads filters initialization
export const getAllLeadFacets = async (): Promise<Record<string, LeadFacetValue[]>> => {
    try {
        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: '',
                    hitsPerPage: 0, // We only want facets, not hits
                    facets: ['state', 'propertyName', 'agentName', 'source', 'stage', 'tag', 'taskType', 'leadStatus'],
                    maxValuesPerFacet: 100,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const facets: Record<string, LeadFacetValue[]> = {}

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
        console.error('Get all lead facets error:', error)
        throw new Error(`Failed to get lead facets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Search with autocomplete suggestions for leads
export const getLeadSearchSuggestions = async (query: string): Promise<string[]> => {
    try {
        const response = await searchClient.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query,
                    hitsPerPage: 5,
                    attributesToRetrieve: ['objectId', 'name', 'phoneNumber', 'agentName', 'propertyName'],
                    analytics: false,
                },
            ],
        })

        const result = response.results[0] as SearchResponse<any>
        const suggestions = new Set<string>()

        result.hits.forEach((hit: any) => {
            if (hit.name) suggestions.add(hit.name)
            if (hit.phoneNumber) suggestions.add(hit.phoneNumber)
            if (hit.agentName) suggestions.add(hit.agentName)
            if (hit.propertyName) suggestions.add(hit.propertyName)
        })

        return Array.from(suggestions).slice(0, 10)
    } catch (error) {
        console.error('Get lead search suggestions error:', error)
        return []
    }
}

// Get lead by ID
export const getLeadById = async (objectID: string): Promise<any | null> => {
    try {
        const response = await searchClient.getObject({
            indexName: INDEX_NAME,
            objectID,
        })

        return response
    } catch (error) {
        console.error('Get lead by ID error:', error)
        return null
    }
}

// Update lead (for status changes etc.)
export const updateLead = async (objectID: string, updates: Record<string, any>): Promise<boolean> => {
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
        console.error('Update lead error:', error)
        return false
    }
}

// Batch operations for getting multiple leads
export const getLeadsByIds = async (objectIDs: string[]): Promise<any[]> => {
    try {
        const response = await searchClient.getObjects({
            requests: objectIDs.map((objectID) => ({
                indexName: INDEX_NAME,
                objectID,
            })),
        })

        return response.results.filter((result) => result !== null)
    } catch (error) {
        console.error('Get leads by IDs error:', error)
        throw new Error(`Failed to get leads: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

// Analytics - track search events for leads
export const trackLeadSearchEvent = async (eventName: string, properties: Record<string, any>): Promise<void> => {
    try {
        console.log('Lead search event tracked:', eventName, properties)
    } catch (error) {
        console.error('Track lead search event error:', error)
    }
}

// Helper function to format filters for debugging
export const formatLeadFiltersForDisplay = (filters: LeadSearchFilters): string => {
    const parts: string[] = []

    Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
            parts.push(`${key}: ${value.join(', ')}`)
        } else if (value && typeof value === 'object') {
            if ('startDate' in value || 'endDate' in value) {
                const range = value as { startDate?: string | Date | number; endDate?: string | Date | number }
                const start = range.startDate
                    ? new Date(convertToTimestamp(range.startDate)).toLocaleDateString()
                    : 'Start'
                const end = range.endDate ? new Date(convertToTimestamp(range.endDate)).toLocaleDateString() : 'End'
                parts.push(`${key}: ${start} - ${end}`)
            } else if ('min' in value) {
                const range = value as { min?: number; max?: number }
                if (range.min !== undefined || range.max !== undefined) {
                    parts.push(`${key}: ${range.min || 0} - ${range.max || '∞'}`)
                }
            }
        }
    })

    return parts.join(' | ')
}

export default {
    searchLeads,
    getLeadFacetValues,
    getAllLeadFacets,
    getLeadSearchSuggestions,
    getLeadById,
    updateLead,
    getLeadsByIds,
    trackLeadSearchEvent,
    formatLeadFiltersForDisplay,
}
