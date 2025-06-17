// services/algolia/leadSearchService.ts
import { algoliasearch, type SearchResponse } from 'algoliasearch'

// Algolia client configuration
const searchClient = algoliasearch('KFYKBHE5TN', '9c5e86a5e2148415d3fca9817617fd0e')
const INDEX_NAME = 'leads'

interface ConnectHistoryItem {
    timestamp: number
    connectResult: 'connected' | 'not connected' | 'on call' | 'on whatsapp' | 'out bound' | 'in bound'
}

interface Note {
    id: string
    content: string
    timestamp: number
    author: string
}

interface ILead {
    leadId: string
    name: string
    phonenumber: string
    emailAddress: string
    source: 'whatsApp' | 'instagram' | 'facebook' | 'referral' | 'direct'
    leadStatus: 'interested' | 'not interested' | 'not contact yet'
    contactStatus: 'connected' | 'not contact' | 'rnr-1' | 'rnr-2' | 'rnr-3' | 'rnr-4' | 'rnr-5' | 'rnr-6'
    verified: boolean
    blackListed: boolean
    connectHistory: ConnectHistoryItem[]
    lastConnect: number
    lastTried: number
    kamName: string
    kamId: string
    notes: Note[]
    onBroadcast: boolean
    communityJoined: boolean
    added: number
    lastModified: number
    extraDetails: string
}

// Algolia hit type that includes both your data and Algolia metadata
interface AlgoliaLeadHit extends ILead {
    objectID: string
    _highlightResult?: { [key: string]: any }
    _snippetResult?: { [key: string]: any }
    _rankingInfo?: any
    _distinctSeqID?: number
}

interface SearchFilters {
    leadStatus?: string[]
    contactStatus?: string[]
    source?: string[]
    kamName?: string[]
    verified?: boolean
    blackListed?: boolean
    onBroadcast?: boolean
    communityJoined?: boolean
}

interface LeadSearchResponse {
    hits: ILead[]
    nbHits: number
    page: number
    nbPages: number
    hitsPerPage: number
    facets?: Record<string, Record<string, number>>
}

class LeadSearchService {
    async searchLeads(
        query: string = '',
        filters: SearchFilters = {},
        page: number = 0,
        hitsPerPage: number = 50,
        sortBy?: string,
    ): Promise<LeadSearchResponse> {
        try {
            const filterString = this.buildFilterString(filters)

            const searchParams: any = {
                query,
                page,
                hitsPerPage,
                facets: ['leadStatus', 'contactStatus', 'source', 'kamName', 'verified', 'blackListed'],
                attributesToHighlight: ['name', 'phonenumber', 'emailAddress'],
                highlightPreTag: '<mark>',
                highlightPostTag: '</mark>',
            }

            if (filterString) {
                searchParams.filters = filterString
            }

            const response = await searchClient.searchSingleIndex({
                indexName: INDEX_NAME,
                searchParams,
            })

            // Map Algolia hits to ILead objects
            const mappedHits: ILead[] = (response.hits as AlgoliaLeadHit[]).map((hit) => ({
                leadId: hit.leadId,
                name: hit.name,
                phonenumber: hit.phonenumber,
                emailAddress: hit.emailAddress,
                source: hit.source,
                leadStatus: hit.leadStatus,
                contactStatus: hit.contactStatus,
                verified: hit.verified,
                blackListed: hit.blackListed,
                connectHistory: hit.connectHistory,
                lastConnect: hit.lastConnect,
                lastTried: hit.lastTried,
                kamName: hit.kamName,
                kamId: hit.kamId,
                notes: hit.notes,
                onBroadcast: hit.onBroadcast,
                communityJoined: hit.communityJoined,
                added: hit.added,
                lastModified: hit.lastModified,
                extraDetails: hit.extraDetails,
            }))

            return {
                hits: mappedHits,
                nbHits: response.nbHits ?? 0,
                page: response.page ?? 0,
                nbPages: response.nbPages ?? 0,
                hitsPerPage: response.hitsPerPage ?? 50,
                facets: response.facets,
            }
        } catch (error) {
            console.error('Error searching leads:', error)
            throw new Error('Search failed')
        }
    }

    async saveLeads(leads: ILead[]): Promise<void> {
        try {
            const objectsToSave = leads.map((lead) => ({
                ...lead,
                objectID: lead.leadId,
            }))

            await searchClient.saveObjects({
                indexName: INDEX_NAME,
                objects: objectsToSave,
            })
        } catch (error) {
            console.error('Error saving leads:', error)
            throw new Error('Failed to save leads')
        }
    }

    async deleteLeads(leadIds: string[]): Promise<void> {
        try {
            await searchClient.deleteObjects({
                indexName: INDEX_NAME,
                objectIDs: leadIds,
            })
        } catch (error) {
            console.error('Error deleting leads:', error)
            throw new Error('Failed to delete leads')
        }
    }

    async getLeadById(leadId: string): Promise<ILead | null> {
        try {
            const response = await searchClient.getObjects({
                requests: [
                    {
                        indexName: INDEX_NAME,
                        objectID: leadId,
                    },
                ],
            })

            const hit = response.results[0] as AlgoliaLeadHit
            if (!hit) return null

            // Map Algolia hit back to ILead
            return {
                leadId: hit.leadId,
                name: hit.name,
                phonenumber: hit.phonenumber,
                emailAddress: hit.emailAddress,
                source: hit.source,
                leadStatus: hit.leadStatus,
                contactStatus: hit.contactStatus,
                verified: hit.verified,
                blackListed: hit.blackListed,
                connectHistory: hit.connectHistory,
                lastConnect: hit.lastConnect,
                lastTried: hit.lastTried,
                kamName: hit.kamName,
                kamId: hit.kamId,
                notes: hit.notes,
                onBroadcast: hit.onBroadcast,
                communityJoined: hit.communityJoined,
                added: hit.added,
                lastModified: hit.lastModified,
                extraDetails: hit.extraDetails,
            }
        } catch (error) {
            console.error('Error getting lead by ID:', error)
            return null
        }
    }

    async getFacetValues(facetName: string, query: string = ''): Promise<Array<{ value: string; count: number }>> {
        try {
            const response = await searchClient.search({
                requests: [
                    {
                        indexName: INDEX_NAME,
                        query: query || '',
                        hitsPerPage: 0,
                        facets: [facetName],
                        maxValuesPerFacet: 100,
                    },
                ],
            })

            const result = response.results[0] as any
            const facetValues = result.facets?.[facetName] || {}

            return Object.entries(facetValues)
                .map(([value, count]) => ({
                    value,
                    count: count as number,
                }))
                .sort((a, b) => b.count - a.count)
        } catch (error) {
            console.error(`Error getting facet values for ${facetName}:`, error)
            return []
        }
    }

    private buildFilterString(filters: SearchFilters): string {
        const filterParts: string[] = []

        if (filters.leadStatus?.length) {
            const statusFilters = filters.leadStatus.map((status) => `leadStatus:"${status}"`).join(' OR ')
            filterParts.push(`(${statusFilters})`)
        }

        if (filters.contactStatus?.length) {
            const contactFilters = filters.contactStatus.map((status) => `contactStatus:"${status}"`).join(' OR ')
            filterParts.push(`(${contactFilters})`)
        }

        if (filters.source?.length) {
            const sourceFilters = filters.source.map((source) => `source:"${source}"`).join(' OR ')
            filterParts.push(`(${sourceFilters})`)
        }

        if (filters.kamName?.length) {
            const kamFilters = filters.kamName.map((kam) => `kamName:"${kam}"`).join(' OR ')
            filterParts.push(`(${kamFilters})`)
        }

        if (filters.verified !== undefined) {
            filterParts.push(`verified:${filters.verified}`)
        }

        if (filters.blackListed !== undefined) {
            filterParts.push(`blackListed:${filters.blackListed}`)
        }

        if (filters.onBroadcast !== undefined) {
            filterParts.push(`onBroadcast:${filters.onBroadcast}`)
        }

        if (filters.communityJoined !== undefined) {
            filterParts.push(`communityJoined:${filters.communityJoined}`)
        }

        return filterParts.join(' AND ')
    }
}

export const leadSearchService = new LeadSearchService()
export default leadSearchService
export type { ILead, SearchFilters, LeadSearchResponse }
