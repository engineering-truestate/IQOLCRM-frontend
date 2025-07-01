// services/acn/qc/qcService.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { doc, getDoc, updateDoc, arrayUnion, setDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../../../firebase'
import { addProperty } from '../properties/propertiesService'
import type {
    IQCInventory,
    UpdateQCStatusParams,
    AddNoteParams,
    UpdateStatusResponse,
    AddNoteResponse,
    QCNote,
} from '../../../data_types/acn/types'
import type { IInventory } from '../../../store/reducers/acn/propertiesTypes'
import { updateAgentInventoryCountThunk } from '../agents/agentThunkService'

// Helper function to get current timestamp
const getCurrentTimestamp = (): number => {
    return Date.now()
}

// Helper function to convert QC inventory to property format
const convertQCInventoryToProperty = (qcInventory: IQCInventory): Partial<IInventory> => {
    return {
        propertyName: qcInventory.propertyName,
        _geoloc: qcInventory._geoloc,
        area: qcInventory.area,
        micromarket: qcInventory.micromarket,
        mapLocation: qcInventory.mapLocation,
        assetType: qcInventory.assetType,
        unitType: qcInventory.unitType,
        subType: qcInventory.subType,
        sbua: qcInventory.sbua,
        carpet: qcInventory.carpet,
        plotSize: qcInventory.plotSize,
        floorNo: qcInventory.floorNo ? qcInventory.floorNo.toString() : '',
        facing: qcInventory.facing,
        totalAskPrice: qcInventory.totalAskPrice,
        askPricePerSqft: qcInventory.askPricePerSqft,
        status: 'Available',
        currentStatus: qcInventory.currentStatus,
        cpId: qcInventory.cpId,
        extraDetails: qcInventory.extraDetails,
        driveLink: qcInventory.driveLink,
        photo: qcInventory.photo,
        video: qcInventory.video,
        document: qcInventory.document,
        tenanted: qcInventory.tenanted,
        ocReceived: qcInventory.ocReceived,
        handoverDate: qcInventory.handoverDate,
        buildingAge: qcInventory.buildingAge,
        buildingKhata: qcInventory.buildingKhata,
        landKhata: qcInventory.landKhata,
        bdaApproved: qcInventory.bdaApproved,
        biappaApproved: qcInventory.biappaApproved,
    }
}

// Prefetch all kamId to kamName mappings from acnQCInventories
export const prefetchKamNameMappings = createAsyncThunk<Record<string, string>, void, { rejectValue: string }>(
    'qc/prefetchKamNameMappings',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Prefetching kamId to kamName mappings')

            const qcCollection = collection(db, 'acnQCInventories')
            const querySnapshot = await getDocs(qcCollection)

            const kamMappings: Record<string, string> = {}

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                const kamId = data.kamId
                const kamName = data.kamName

                if (kamId && kamId !== 'N/A' && kamName && kamName !== 'N/A') {
                    kamMappings[kamId] = kamName
                }
            })

            console.log(
                '✅ KamId to kamName mappings prefetched successfully:',
                Object.keys(kamMappings).length,
                'mappings',
            )
            return kamMappings
        } catch (error: any) {
            console.error('❌ Error prefetching kamId to kamName mappings:', error)
            return rejectWithValue(error.message || 'Failed to prefetch kamId to kamName mappings')
        }
    },
)

// Helper function to get next QC ID
const getNextQcId = async (): Promise<string> => {
    const lastQcIdRef = doc(db, 'acn-admin', 'lastQcId')
    const lastQcIdSnap = await getDoc(lastQcIdRef)

    if (!lastQcIdSnap.exists()) {
        throw new Error('lastQcId document does not exist in acn-admin collection')
    }

    const data = lastQcIdSnap.data()
    const count = data.count
    const label = data.label
    const prefix = data.prefix

    const nextId = `${label}${prefix}${count}`

    // Update count
    await updateDoc(lastQcIdRef, { count: count + 1 })

    return nextId
}

// Add QC Inventory
export const addQCInventory = createAsyncThunk<IQCInventory, Partial<IQCInventory>, { rejectValue: string }>(
    'qc/addQCInventory',
    async (qcData, { rejectWithValue }) => {
        try {
            console.log('🔄 Adding new QC inventory', qcData)

            const nextId = await getNextQcId()
            // const qcCollection = collection(db, 'acnQCInventories')
            const currentTime = getCurrentTimestamp()

            const newQcData: Partial<IQCInventory> = {
                ...qcData,
                propertyId: nextId,
                dateOfInventoryAdded: currentTime,
                dateOfStatusLastChecked: currentTime,
                lastModified: currentTime,
                ageOfInventory: 0,
                ageOfStatus: 0,
                stage: 'kam',
                qcStatus: 'pending',
                kamStatus: 'pending',
                qcHistory: [],
                notes: [],
                noOfEnquiries: 0,
                _geoloc: qcData._geoloc || { lat: 0, lng: 0 },
            }

            const qcDocRef = doc(db, 'acnQCInventories', nextId)
            await setDoc(qcDocRef, newQcData)
            const result = { ...newQcData, id: nextId } as IQCInventory

            console.log('✅ QC inventory added successfully:', result.propertyId)
            return result
        } catch (error: any) {
            console.error('❌ Error adding QC inventory:', error)
            return rejectWithValue(error.message || 'Failed to add QC inventory')
        }
    },
)

// Update QC Inventory
export const updateQCInventory = createAsyncThunk<
    IQCInventory,
    { id: string; updates: Partial<IQCInventory> },
    { rejectValue: string }
>('qc/updateQCInventory', async ({ id, updates }, { rejectWithValue }) => {
    try {
        console.log('🔄 Updating QC inventory:', id)

        const qcDocRef = doc(db, 'acnQCInventories', id)
        const currentTime = getCurrentTimestamp()

        const updateData = {
            ...updates,
            lastModified: currentTime,
            dateOfStatusLastChecked: currentTime,
        }

        await updateDoc(qcDocRef, updateData)

        // Fetch the updated document
        const updatedDoc = await getDoc(qcDocRef)
        if (!updatedDoc.exists()) {
            throw new Error('Updated document not found')
        }

        const result = { id: updatedDoc.id, ...updatedDoc.data() } as IQCInventory

        console.log('✅ QC inventory updated successfully:', result.propertyId)
        return result
    } catch (error: any) {
        console.error('❌ Error updating QC inventory:', error)
        return rejectWithValue(error.message || 'Failed to update QC inventory')
    }
})

// Fetch QC inventory by ID
export const fetchQCInventoryById = createAsyncThunk<IQCInventory, string, { rejectValue: string }>(
    'qc/fetchById',
    async (propertyId, { rejectWithValue }) => {
        try {
            console.log('🔄 Fetching QC inventory:', propertyId)

            const docRef = doc(db, 'acnQCInventories', propertyId)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists()) {
                console.log('❌ QC inventory not found:', propertyId)
                return rejectWithValue('QC inventory not found')
            }

            const data = docSnap.data() as IQCInventory
            console.log('✅ QC inventory fetched successfully:', data.propertyId)

            return data
        } catch (error: any) {
            console.error('❌ Error fetching QC inventory:', error)
            return rejectWithValue(error.message || 'Failed to fetch QC inventory')
        }
    },
)

// Update QC status with role-based checks
export const updateQCStatusWithRoleCheck = createAsyncThunk<
    UpdateStatusResponse,
    UpdateQCStatusParams & { additionalData?: any },
    { rejectValue: string }
>(
    'qc/updateStatusWithRoleCheck',
    async (
        { property, status, agentData, activeTab, reviewedBy, comments, additionalData },
        { rejectWithValue, dispatch },
    ) => {
        try {
            let dataToSave: Partial<IQCInventory> = {}
            let shouldCreateProperty = false
            const currentTime = getCurrentTimestamp()

            console.log('🔄 Processing status update:', {
                propertyId: property.propertyId,
                status,
                role: agentData.role,
                activeTab,
                currentStage: property.stage,
                additionalData,
            })

            // Safely get current statuses with fallbacks
            const currentKamStatus = property.kamStatus || 'pending'
            // const currentDataStatus = property.qcStatus || 'pending'

            // Base QC review object
            const baseQCReview = {
                ...property.qcReview,
                ...(additionalData?.rejectedFields && { rejectedFields: additionalData.rejectedFields }),
                ...(additionalData?.originalPropertyId && { originalPropertyId: additionalData.originalPropertyId }),
            }

            switch (agentData.role) {
                case 'data':
                    console.log('🔄 Processing data update')
                    if (currentKamStatus !== 'approved') {
                        return rejectWithValue('Data team can only edit status if KAM status is approved')
                    }
                    if (property.stage === 'notApproved') {
                        return rejectWithValue('Data team cannot edit properties in notApproved stage')
                    }

                    if (status !== 'approved') {
                        dataToSave = {
                            qcReview: {
                                ...baseQCReview,
                                kamReview: {
                                    ...property.qcReview?.kamReview,
                                    status: status as any,
                                    reviewDate: currentTime,
                                    reviewedBy,
                                    comments: comments,
                                },
                                dataReview: {
                                    status: status as any,
                                    reviewDate: currentTime,
                                    reviewedBy,
                                    comments: comments,
                                },
                            },
                            kamStatus: status as any,
                            qcStatus: 'pending',
                            stage: 'notApproved',
                            status: status as any,
                            lastModified: currentTime,
                            qcHistory: [
                                ...(property.qcHistory || []),
                                {
                                    timestamp: currentTime,
                                    qcStatus: status as any,
                                    userName: reviewedBy,
                                    userRole: agentData.role,
                                    userEmail: agentData.email,
                                    userPhone: agentData.phone || '',
                                    kamId: agentData.kamId || '',
                                    cpId: property.cpId,
                                    action: `Status changed to ${status}`,
                                    details:
                                        comments ||
                                        `Status updated by ${reviewedBy} (${agentData.role}) - moved to notApproved stage`,
                                    performedBy: reviewedBy,
                                    date: currentTime,
                                },
                            ],
                        }
                    } else {
                        dataToSave = {
                            qcReview: {
                                ...baseQCReview,
                                dataReview: {
                                    status: status as any,
                                    reviewDate: currentTime,
                                    reviewedBy,
                                    comments: comments,
                                },
                            },
                            qcStatus: status as any,
                            status: 'available',
                            stage: 'live',
                            lastModified: currentTime,
                            qcHistory: [
                                ...(property.qcHistory || []),
                                {
                                    timestamp: currentTime,
                                    qcStatus: status as any,
                                    userName: reviewedBy,
                                    userRole: agentData.role,
                                    userEmail: agentData.email,
                                    userPhone: agentData.phone || '',
                                    kamId: agentData.kamId || '',
                                    cpId: property.cpId,
                                    action: `Status changed to ${status}`,
                                    details: comments || `Status updated by ${reviewedBy} (${agentData.role})`,
                                    performedBy: reviewedBy,
                                    date: currentTime,
                                },
                            ],
                        }
                        shouldCreateProperty = true
                    }
                    break

                case 'kam':
                    console.log('🔄 Processing kam update')
                    if (property.stage !== 'kam' && property.stage !== 'notApproved') {
                        return rejectWithValue(
                            'You cannot change the status of a property that is not in the KAM or notApproved stage',
                        )
                    }

                    if (status !== 'approved') {
                        dataToSave = {
                            qcReview: {
                                ...baseQCReview,
                                kamReview: {
                                    status: status as any,
                                    reviewDate: currentTime,
                                    reviewedBy,
                                    comments: comments || `Status updated to ${status} - moved to notApproved stage`,
                                },
                                ...(property.qcReview?.dataReview && { dataReview: property.qcReview.dataReview }),
                            },
                            kamStatus: status as any,
                            qcStatus: 'pending',
                            stage: 'notApproved',
                            status: status as any,
                            lastModified: currentTime,
                            qcHistory: [
                                ...(property.qcHistory || []),
                                {
                                    timestamp: currentTime,
                                    qcStatus: status as any,
                                    userName: reviewedBy,
                                    userRole: agentData.role,
                                    userEmail: agentData.email,
                                    userPhone: agentData.phone || '',
                                    kamId: agentData.kamId || '',
                                    cpId: property.cpId,
                                    action: `Status changed to ${status}`,
                                    details:
                                        comments ||
                                        `Status updated by ${reviewedBy} (${agentData.role}) - moved to notApproved stage`,
                                    performedBy: reviewedBy,
                                    date: currentTime,
                                },
                            ],
                        }
                    } else {
                        dataToSave = {
                            qcReview: {
                                ...baseQCReview,
                                kamReview: {
                                    status: status as any,
                                    reviewDate: currentTime,
                                    reviewedBy,
                                    comments: comments || `KAM review status updated to ${status}`,
                                },
                                ...(property.qcReview?.dataReview && { dataReview: property.qcReview.dataReview }),
                            },
                            kamStatus: status as any,
                            stage: 'data',
                            lastModified: currentTime,
                            qcHistory: [
                                ...(property.qcHistory || []),
                                {
                                    timestamp: currentTime,
                                    qcStatus: status as any,
                                    userName: reviewedBy,
                                    userRole: agentData.role,
                                    userEmail: agentData.email,
                                    userPhone: agentData.phone || '',
                                    kamId: agentData.kamId || '',
                                    cpId: property.cpId,
                                    action: `Status changed to ${status}`,
                                    details: comments || `KAM review status updated to ${status}`,
                                    performedBy: reviewedBy,
                                    date: currentTime,
                                },
                            ],
                        }
                    }
                    break

                case 'kamModerator':
                    console.log('🔄 Processing kamModerator update')

                    if (activeTab === 'kam') {
                        if (status !== 'approved') {
                            dataToSave = {
                                qcReview: {
                                    ...baseQCReview,
                                    kamReview: {
                                        status: status as any,
                                        reviewDate: currentTime,
                                        reviewedBy,
                                        comments:
                                            comments || `Status updated to ${status} - moved to notApproved stage`,
                                    },
                                    ...(property.qcReview?.dataReview && { dataReview: property.qcReview.dataReview }),
                                },
                                kamStatus: status as any,
                                qcStatus: 'pending',
                                stage: 'notApproved',
                                status: status as any,
                                lastModified: currentTime,
                                qcHistory: [
                                    ...(property.qcHistory || []),
                                    {
                                        timestamp: currentTime,
                                        qcStatus: status as any,
                                        userName: reviewedBy,
                                        userRole: agentData.role,
                                        userEmail: agentData.email,
                                        userPhone: agentData.phone || '',
                                        kamId: agentData.kamId || '',
                                        cpId: property.cpId,
                                        action: `Status changed to ${status}`,
                                        details:
                                            comments ||
                                            `Status updated by ${reviewedBy} (${agentData.role}) - moved to notApproved stage`,
                                        performedBy: reviewedBy,
                                        date: currentTime,
                                    },
                                ],
                            }
                        } else {
                            dataToSave = {
                                qcReview: {
                                    ...baseQCReview,
                                    kamReview: {
                                        status: status as any,
                                        reviewDate: currentTime,
                                        reviewedBy,
                                        comments: comments || `KAM review status updated to ${status}`,
                                    },
                                    ...(property.qcReview?.dataReview && { dataReview: property.qcReview.dataReview }),
                                },
                                kamStatus: status as any,
                                stage: 'data',
                                lastModified: currentTime,
                                qcHistory: [
                                    ...(property.qcHistory || []),
                                    {
                                        timestamp: currentTime,
                                        qcStatus: status as any,
                                        userName: reviewedBy,
                                        userRole: agentData.role,
                                        userEmail: agentData.email,
                                        userPhone: agentData.phone || '',
                                        kamId: agentData.kamId || '',
                                        cpId: property.cpId,
                                        action: `Status changed to ${status}`,
                                        details: comments || `KAM review status updated to ${status}`,
                                        performedBy: reviewedBy,
                                        date: currentTime,
                                    },
                                ],
                            }
                        }
                    } else if (activeTab === 'data') {
                        if (status !== 'approved') {
                            dataToSave = {
                                qcReview: {
                                    ...baseQCReview,
                                    kamReview: {
                                        ...property.qcReview?.kamReview,
                                        status: status as any,
                                        reviewDate: currentTime,
                                        reviewedBy,
                                        comments: comments,
                                    },
                                    dataReview: {
                                        status: status as any,
                                        reviewDate: currentTime,
                                        reviewedBy,
                                        comments: comments,
                                    },
                                },
                                kamStatus: status as any,
                                qcStatus: 'pending',
                                stage: 'notApproved',
                                status: status as any,
                                lastModified: currentTime,
                                qcHistory: [
                                    ...(property.qcHistory || []),
                                    {
                                        timestamp: currentTime,
                                        qcStatus: status as any,
                                        userName: reviewedBy,
                                        userRole: agentData.role,
                                        userEmail: agentData.email,
                                        userPhone: agentData.phone || '',
                                        kamId: agentData.kamId || '',
                                        cpId: property.cpId,
                                        action: `Status changed to ${status}`,
                                        details:
                                            comments ||
                                            `Status updated by ${reviewedBy} (${agentData.role}) - moved to notApproved stage`,
                                        performedBy: reviewedBy,
                                        date: currentTime,
                                    },
                                ],
                            }
                        } else {
                            dataToSave = {
                                qcReview: {
                                    ...baseQCReview,
                                    dataReview: {
                                        status: status as any,
                                        reviewDate: currentTime,
                                        reviewedBy,
                                        comments: comments,
                                    },
                                },
                                qcStatus: status as any,
                                status: 'available',
                                stage: 'live',
                                lastModified: currentTime,
                                qcHistory: [
                                    ...(property.qcHistory || []),
                                    {
                                        timestamp: currentTime,
                                        qcStatus: status as any,
                                        userName: reviewedBy,
                                        userRole: agentData.role,
                                        userEmail: agentData.email,
                                        userPhone: agentData.phone || '',
                                        kamId: agentData.kamId || '',
                                        cpId: property.cpId,
                                        action: `Status changed to ${status}`,
                                        details: comments || `Status updated by ${reviewedBy} (${agentData.role})`,
                                        performedBy: reviewedBy,
                                        date: currentTime,
                                    },
                                ],
                            }
                            shouldCreateProperty = true
                        }
                    }
                    break

                default:
                    return rejectWithValue('Invalid user role')
            }

            // Update the document in Firestore
            const docRef = doc(db, 'acnQCInventories', property.propertyId)
            await updateDoc(docRef, dataToSave)

            // Create property in acnProperties collection when approved
            if (shouldCreateProperty) {
                try {
                    console.log('🏠 Creating new property from approved QC inventory:', property.propertyId)

                    const propertyData = convertQCInventoryToProperty(property)
                    await dispatch(addProperty(propertyData))
                    await dispatch(
                        updateAgentInventoryCountThunk({ cpId: property.cpId, propertyId: property.propertyId }),
                    )

                    console.log('✅ Property creation dispatched successfully for QC inventory:', property.propertyId)
                } catch (propertyError: any) {
                    console.error('❌ Error creating property from QC inventory:', propertyError)
                    // Don't fail the entire operation if property creation fails
                }
            }

            console.log('✅ Status updated successfully:', {
                propertyId: property.propertyId,
                newStatus: status,
                stage: dataToSave.stage,
                shouldCreateProperty,
            })

            return {
                propertyId: property.propertyId,
                updates: dataToSave,
                propertyCreated: shouldCreateProperty,
            }
        } catch (error: any) {
            console.error('❌ Error updating QC status:', error)
            return rejectWithValue(error.message || 'Failed to update status')
        }
    },
)

// Add note to QC inventory
export const addQCInventoryNote = createAsyncThunk<AddNoteResponse, AddNoteParams, { rejectValue: string }>(
    'qc/addNote',
    async ({ propertyId, details, kamId, kamName }, { rejectWithValue }) => {
        try {
            const currentTime = getCurrentTimestamp()

            const newNote: QCNote = {
                kamId,
                kamName,
                details,
                timestamp: currentTime,
            }

            const docRef = doc(db, 'acnQCInventories', propertyId)
            await updateDoc(docRef, {
                notes: arrayUnion(newNote),
                lastModified: currentTime,
            })

            console.log('✅ Note added successfully:', propertyId)

            return {
                propertyId,
                note: newNote,
            }
        } catch (error: any) {
            console.error('❌ Error adding note:', error)
            return rejectWithValue(error.message || 'Failed to add note')
        }
    },
)
