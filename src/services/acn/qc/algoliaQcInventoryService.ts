import { algoliasearch, type SearchResponse } from 'algoliasearch'

const searchClient = algoliasearch('YRTIP4R3ZR', '53f176209e2536837f335aba4c8e093d')
const INDEX_NAME = 'qc-inventories'

export interface InventorySearchFilters {
    kamId?: string[]
    stage?: string[]
    KamStatus?: string[]
    assetType?: string[]
}

export interface InventorySearchParams {
    query?: string
    filters?: InventorySearchFilters
    page?: number
    hitsPerPage?: number
    sortBy?: string
}

export interface InventorySearchResponse {
    hits: any[]
    nbHits: number
    page: number
    nbPages: number
    hitsPerPage: number
    processingTimeMS: number
    facets?: Record<string, Record<string, number>>
}

const buildFilterString = (filters: InventorySearchFilters = {}): string => {
    const filterParts: string[] = []

    if (filters.kamId?.length) {
        filterParts.push(`(${filters.kamId.map((s) => `kamId:${s}`).join(' OR ')})`)
    }
    if (filters.stage?.length) {
        filterParts.push(`(${filters.stage.map((s) => `stage:${s}`).join(' OR ')})`)
    }
    if (filters.KamStatus?.length) {
        filterParts.push(`(${filters.KamStatus.map((s) => `KamStatus:${s}`).join(' OR ')})`)
    }
    if (filters.assetType?.length) {
        filterParts.push(`(${filters.assetType.map((t) => `assetType:${t}`).join(' OR ')})`)
    }

    return filterParts.join(' AND ')
}

const getIndexName = (sortBy?: string): string => {
    const sortMap: Record<string, string> = {
        price_asc: `${INDEX_NAME}_price_asc`,
        price_desc: `${INDEX_NAME}_price_desc`,
        date_asc: `${INDEX_NAME}_date_asc`,
        date_desc: `${INDEX_NAME}_date_desc`,
        updated_desc: `${INDEX_NAME}_updated_desc`,
    }
    return sortMap[sortBy || ''] || INDEX_NAME
}

export const searchInventory = async (params: InventorySearchParams): Promise<InventorySearchResponse> => {
    try {
        const { query = '', filters = {}, page = 0, hitsPerPage = 50, sortBy } = params

        const response = await searchClient.search([
            {
                indexName: getIndexName(sortBy),
                params: {
                    query,
                    page,
                    hitsPerPage,
                    // filters: buildFilterString(filters),
                    facets: ['kamId', 'stage', 'KamStatus', 'assetType'],
                    maxValuesPerFacet: 100,
                },
            },
        ])

        const result = response.results[0] as SearchResponse<any>

        return {
            hits: result.hits,
            nbHits: result.nbHits || 0,
            page: result.page || 0,
            nbPages: result.nbPages || 0,
            hitsPerPage: result.hitsPerPage || 0,
            processingTimeMS: result.processingTimeMS,
            facets: result.facets,
        }
    } catch (error) {
        console.error('Inventory search error:', error)
        throw new Error(`Inventory search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

export const getInventoryFacets = async (): Promise<Record<string, { value: string; count: number }[]>> => {
    try {
        const response = await searchClient.search([
            {
                indexName: INDEX_NAME,
                params: {
                    query: '',
                    hitsPerPage: 0,
                    facets: ['kamId', 'stage', 'KamStatus', 'assetType'],
                    maxValuesPerFacet: 100,
                },
            },
        ])

        const result = response.results[0] as SearchResponse<any>
        const facets: Record<string, { value: string; count: number }[]> = {}

        Object.entries(result.facets || {}).forEach(([name, values]) => {
            facets[name] = Object.entries(values)
                .map(([value, count]) => ({ value, count: count as number }))
                .sort((a, b) => b.count - a.count)
        })

        return facets
    } catch (error) {
        console.error('Get inventory facets error:', error)
        throw new Error(`Failed to get facets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}
