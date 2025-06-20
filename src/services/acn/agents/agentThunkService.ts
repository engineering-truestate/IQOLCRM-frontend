import { createAsyncThunk } from '@reduxjs/toolkit'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase'
import type { IInventory, IRequirement } from '../../../data_types/acn/types'

interface AgentDetailsResponse {
    inventories: IInventory[]
    requirements: IRequirement[]
    enquiries: any[]
    qc: any[]
    error?: string
}

interface FetchAgentDetailsParams {
    agentId: string
    propertyType: 'Resale' | 'Rental'
}

export const fetchAgentDetails = createAsyncThunk(
    'agents/fetchAgentDetails',
    async ({ agentId, propertyType }: FetchAgentDetailsParams): Promise<AgentDetailsResponse> => {
        try {
            // Fetch inventories from Firebase
            const inventoriesRef = collection(db, propertyType === 'Resale' ? 'acnProperties' : 'acnRentalInventories')
            const inventoriesQuery = query(inventoriesRef, where('cpId', '==', agentId))
            const inventoriesSnapshot = await getDocs(inventoriesQuery)
            const inventories = inventoriesSnapshot.docs.map((doc) => {
                const data = doc.data()
                return {
                    id: doc.id,
                    propertyId: data.propertyId || doc.id,
                    cpId: data.cpId || agentId,
                    propertyName: data.propertyName || data.nameOfTheProperty || '',
                    _geoloc: data._geoloc || { lat: 0, lng: 0 },
                    area: data.area || '',
                    micromarket: data.micromarket || '',
                    mapLocation: data.mapLocation || '',
                    assetType: data.assetType || '',
                    unitType: data.unitType || data.configuration || '',
                    subType: data.subType || '',
                    sbua: data.sbua || data.SBUA || 0,
                    carpet: data.carpet || null,
                    plotSize: data.plotSize || null,
                    buildingAge: data.buildingAge || null,
                    floorNo: data.floorNo || data.floorNumber || '',
                    facing: data.facing || '',
                    tenanted: data.tenanted || null,
                    totalAskPrice: data.totalAskPrice || data.rentPerMonthInLakhs || 0,
                    askPricePerSqft: data.askPricePerSqft || 0,
                    status: data.status || '',
                    currentStatus: data.currentStatus || '',
                    builder_name: data.builder_name || null,
                    handoverDate: data.handoverDate || null,
                    buildingKhata: data.buildingKhata || null,
                    landKhata: data.landKhata || null,
                    ocReceived: data.ocReceived || null,
                    photo: data.photo || data.photos || [],
                    video: data.video || data.videos || [],
                    document: data.document || data.documents || [],
                    driveLink: data.driveLink || '',
                    dateOfInventoryAdded: data.dateOfInventoryAdded || Date.now(),
                    dateOfStatusLastChecked: data.dateOfStatusLastChecked || Date.now(),
                    ageOfInventory: data.ageOfInventory || 0,
                    ageOfStatus: data.ageOfStatus || 0,
                    extraDetails: data.extraDetails || '',
                } as IInventory
            })

            // Fetch requirements from Firebase
            const requirementsRef = collection(
                db,
                propertyType === 'Resale' ? 'acnRequirements' : 'acnRentalRequirements',
            )
            const requirementsQuery = query(requirementsRef, where('cpId', '==', agentId))
            const requirementsSnapshot = await getDocs(requirementsQuery)
            const requirements = requirementsSnapshot.docs.map((doc) => {
                const data = doc.data()
                return {
                    id: doc.id,
                    requirementId: data.requirementId || doc.id,
                    agentNumber: data.agentNumber || '',
                    agentName: data.agentName || '',
                    cpId: data.cpId || agentId,
                    location: data.location || '',
                    assetType: propertyType.toLowerCase(),
                    configuration: data.configuration || '1 bhk',
                    _geoloc: data._geoloc || { lat: 0, lng: 0 },
                    micromarket: data.micromarket || '',
                    budget: data.budget || { from: 0, to: 0 },
                    note: data.note || [],
                    size: data.size || { from: 0, to: 0 },
                    bedrooms: data.bedrooms || '',
                    bathrooms: data.bathrooms || '',
                    parking: data.parking || '',
                    propertyName: data.propertyName || '',
                    extraDetails: data.extraDetails || '',
                    marketValue: data.marketValue || '',
                    requirementStatus: data.requirementStatus || 'open',
                    internalStatus: data.internalStatus || 'not found',
                    added: data.added || Date.now(),
                    lastModified: data.lastModified || Date.now(),
                    matchingProperties: data.matchingProperties || [],
                } as IRequirement
            })

            // Fetch enquiries from Firebase
            const enquiriesRef = collection(db, propertyType === 'Resale' ? 'acnEnquiries' : 'acnRentalEnquiries')
            // Fetch enquiries where agent is either buyer or seller
            const buyerQuery = query(enquiriesRef, where('buyerCpId', '==', agentId))
            const sellerQuery = query(enquiriesRef, where('sellerCpId', '==', agentId))

            const [buyerSnapshot, sellerSnapshot] = await Promise.all([getDocs(buyerQuery), getDocs(sellerQuery)])

            // Combine and deduplicate enquiries
            const buyerEnquiries = buyerSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                assetType: propertyType.toLowerCase(),
            }))

            const sellerEnquiries = sellerSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                assetType: propertyType.toLowerCase(),
            }))

            // Combine and remove duplicates based on enquiryId
            const allEnquiries = [...buyerEnquiries, ...sellerEnquiries]
            const uniqueEnquiries = allEnquiries.filter(
                (enquiry, index, self) => index === self.findIndex((e) => e.id === enquiry.id),
            )

            // Fetch QC data from Firebase
            const qcCollectionName = propertyType === 'Resale' ? 'acnQCInventories' : 'acnRentalQCInventories'
            const qcRef = collection(db, qcCollectionName)
            const qcQuery = query(qcRef, where('cpId', '==', agentId))
            const qcSnapshot = await getDocs(qcQuery)
            const qc = qcSnapshot.docs.map((doc) => ({
                id: doc.id,
                qcId: doc.id,
                ...doc.data(),
                assetType: propertyType.toLowerCase(),
            }))

            return {
                inventories,
                requirements,
                enquiries: uniqueEnquiries,
                qc,
            }
        } catch (error) {
            console.error('Error fetching agent details:', error)
            return {
                inventories: [],
                requirements: [],
                enquiries: [],
                qc: [],
                error: error instanceof Error ? error.message : 'Failed to fetch agent details',
            }
        }
    },
)

export const updateAgentStatus = createAsyncThunk(
    'agents/updateAgentStatus',
    async ({ cpId, status }: { cpId: string; status: string }): Promise<{ success: boolean; error?: string }> => {
        try {
            const agentRef = collection(db, 'agents')
            const agentQuery = query(agentRef, where('cpId', '==', cpId))
            const agentSnapshot = await getDocs(agentQuery)

            if (agentSnapshot.empty) {
                throw new Error('Agent not found')
            }

            const agentDoc = agentSnapshot.docs[0]
            await updateDoc(doc(db, 'agents', agentDoc.id), { status })

            return { success: true }
        } catch (error) {
            console.error('Error updating agent status:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update agent status',
            }
        }
    },
)

export const updateAgentKAM = createAsyncThunk(
    'agents/updateAgentKAM',
    async ({ cpId, kam }: { cpId: string; kam: string }): Promise<{ success: boolean; error?: string }> => {
        try {
            const agentRef = collection(db, 'agents')
            const agentQuery = query(agentRef, where('cpId', '==', cpId))
            const agentSnapshot = await getDocs(agentQuery)

            if (agentSnapshot.empty) {
                throw new Error('Agent not found')
            }

            const agentDoc = agentSnapshot.docs[0]
            await updateDoc(doc(db, 'agents', agentDoc.id), { kam })

            return { success: true }
        } catch (error) {
            console.error('Error updating agent KAM:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update agent KAM',
            }
        }
    },
)

export const updateAgentStatusThunk = createAsyncThunk(
    'agents/updateAgentStatusThunk',
    async ({
        cpId,
        agentStatus,
    }: {
        cpId: string
        agentStatus: string
    }): Promise<{ success: boolean; error?: string }> => {
        try {
            const agentRef = collection(db, 'acnAgents')
            const agentQuery = query(agentRef, where('cpId', '==', cpId))
            const agentSnapshot = await getDocs(agentQuery)

            if (agentSnapshot.empty) {
                throw new Error('Agent not found')
            }

            const agentDoc = agentSnapshot.docs[0]
            await updateDoc(doc(db, 'acnAgents', agentDoc.id), { agentStatus })

            return { success: true }
        } catch (error) {
            console.error('Error updating agent status:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update agent status',
            }
        }
    },
)

export const updateAgentPayStatusThunk = createAsyncThunk(
    'agents/updateAgentPayStatusThunk',
    async ({ cpId, payStatus }: { cpId: string; payStatus: string }): Promise<{ success: boolean; error?: string }> => {
        try {
            const agentRef = collection(db, 'acnAgents')
            const agentQuery = query(agentRef, where('cpId', '==', cpId))
            const agentSnapshot = await getDocs(agentQuery)

            if (agentSnapshot.empty) {
                throw new Error('Agent not found')
            }

            const agentDoc = agentSnapshot.docs[0]
            await updateDoc(doc(db, 'acnAgents', agentDoc.id), { payStatus })

            return { success: true }
        } catch (error) {
            console.error('Error updating agent pay status:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update agent pay status',
            }
        }
    },
)

export const fetchAgentRequirementFilters = createAsyncThunk(
    'agents/fetchAgentRequirementFilters',
    async ({
        agentId,
        propertyType,
    }: {
        agentId: string
        propertyType: 'Resale' | 'Rental'
    }): Promise<{
        requirementStatuses: string[]
        internalStatuses: string[]
    }> => {
        try {
            const requirementsRef = collection(
                db,
                propertyType === 'Resale' ? 'acnRequirements' : 'acnRentalRequirements',
            )
            const requirementsQuery = query(requirementsRef, where('cpId', '==', agentId))
            const requirementsSnapshot = await getDocs(requirementsQuery)

            const requirements = requirementsSnapshot.docs.map((doc) => doc.data())

            // Extract unique values for filters
            const requirementStatuses = [...new Set(requirements.map((req) => req.requirementStatus).filter(Boolean))]
            const internalStatuses = [...new Set(requirements.map((req) => req.internalStatus).filter(Boolean))]

            return {
                requirementStatuses,
                internalStatuses,
            }
        } catch (error) {
            console.error('Error fetching agent requirement filters:', error)
            return {
                requirementStatuses: [],
                internalStatuses: [],
            }
        }
    },
)

export const updateEnquiryStatusThunk = createAsyncThunk(
    'agents/updateEnquiryStatus',
    async ({
        enquiryId,
        status,
        propertyType,
    }: {
        enquiryId: string
        status: string
        propertyType: 'Resale' | 'Rental'
    }): Promise<{ success: boolean; error?: string }> => {
        try {
            const enquiryRef = collection(db, propertyType === 'Resale' ? 'acnEnquiries' : 'acnRentalEnquiries')
            const enquiryQuery = query(enquiryRef, where('enquiryId', '==', enquiryId))
            const enquirySnapshot = await getDocs(enquiryQuery)

            if (enquirySnapshot.empty) {
                throw new Error('Enquiry not found')
            }

            const enquiryDoc = enquirySnapshot.docs[0]
            await updateDoc(doc(db, propertyType === 'Resale' ? 'acnEnquiries' : 'acnRentalEnquiries', enquiryDoc.id), {
                status,
                lastModified: Date.now(),
            })

            return { success: true }
        } catch (error) {
            console.error('Error updating enquiry status:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update enquiry status',
            }
        }
    },
)
