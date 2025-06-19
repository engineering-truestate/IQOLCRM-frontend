// hooks/useInfiniteLeadSearch.ts
import { useState, useCallback, useRef } from 'react'
import {
    searchLeads,
    type LeadSearchFilters,
    type AlgoliaLeadSearchResponse,
} from '../../services/canvas_homes/leadAlgoliaService'

export interface UseInfiniteLeadSearchResult {
    leads: any[]
    totalHits: number
    isLoading: boolean
    isLoadingMore: boolean
    error: string | null
    facets: Record<string, Record<string, number>>
    hasNextPage: boolean
    currentPage: number
    search: (query: string, filters: LeadSearchFilters) => Promise<void>
    loadMore: () => Promise<void>
    resetSearch: () => void
    refreshSearch: () => Promise<void>
}

export const useInfiniteLeadSearch = (hitsPerPage = 20): UseInfiniteLeadSearchResult => {
    const [leads, setLeads] = useState<any[]>([])
    const [totalHits, setTotalHits] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})
    const [currentPage, setCurrentPage] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)

    // Store current search params for loadMore and refresh
    const searchParamsRef = useRef<{ query: string; filters: LeadSearchFilters }>({
        query: '',
        filters: {},
    })

    const search = useCallback(
        async (query: string, filters: LeadSearchFilters) => {
            setIsLoading(true)
            setError(null)
            setCurrentPage(0)

            // Update search params
            searchParamsRef.current = { query, filters }

            try {
                const result: AlgoliaLeadSearchResponse = await searchLeads({
                    query,
                    filters,
                    page: 0,
                    hitsPerPage,
                })

                setLeads(result.hits)
                setTotalHits(result.nbHits)
                setFacets(result.facets || {})
                setCurrentPage(0)
                setHasNextPage(result.hits.length === hitsPerPage && result.nbHits > hitsPerPage)
            } catch (err) {
                console.error('Search error:', err)
                setError('Failed to search leads. Please try again.')
                setLeads([])
                setTotalHits(0)
                setHasNextPage(false)
            } finally {
                setIsLoading(false)
            }
        },
        [hitsPerPage],
    )

    const loadMore = useCallback(async () => {
        if (!hasNextPage || isLoadingMore) return

        setIsLoadingMore(true)
        setError(null)

        const nextPage = currentPage + 1

        try {
            const result: AlgoliaLeadSearchResponse = await searchLeads({
                query: searchParamsRef.current.query,
                filters: searchParamsRef.current.filters,
                page: nextPage,
                hitsPerPage,
            })

            // Append new results to existing data
            setLeads((prevLeads) => [...prevLeads, ...result.hits])
            setCurrentPage(nextPage)

            // Check if there are more pages
            const totalPages = Math.ceil(result.nbHits / hitsPerPage)
            setHasNextPage(nextPage < totalPages - 1)
        } catch (err) {
            console.error('Load more error:', err)
            setError('Failed to load more results.')
        } finally {
            setIsLoadingMore(false)
        }
    }, [hasNextPage, isLoadingMore, currentPage, hitsPerPage])

    const refreshSearch = useCallback(async () => {
        // Refresh current search without changing filters
        await search(searchParamsRef.current.query, searchParamsRef.current.filters)
    }, [search])

    const resetSearch = useCallback(() => {
        setLeads([])
        setTotalHits(0)
        setCurrentPage(0)
        setHasNextPage(false)
        setError(null)
        setFacets({})
        searchParamsRef.current = { query: '', filters: {} }
    }, [])

    return {
        leads,
        totalHits,
        isLoading,
        isLoadingMore,
        error,
        facets,
        hasNextPage,
        currentPage,
        search,
        loadMore,
        resetSearch,
        refreshSearch,
    }
}
