// store/services/qcService.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { doc, getDoc, updateDoc, setDoc, runTransaction } from 'firebase/firestore'
import { db } from '../../../firebase'
import type {
    IQCInventory,
    BaseQCInventory,
    UpdateQCStatusParams,
    UpdateStatusResponse,
    AddNoteParams,
    AddNoteResponse,
} from '../../../data_types/acn/types'

// Helper function to get current Unix timestamp
const getCurrentTimestamp = () => Date.now()

// Generate unique Property ID for approved QC items
const generateUniquePropertyId = async (): Promise<string> => {
    return await runTransaction(db, async (transaction) => {
        const adminDocRef = doc(db, 'acn-admin', 'lastPropId')
        const adminDoc = await transaction.get(adminDocRef)

        if (!adminDoc.exists()) {
            const initialData = {
                count: 5269,
                label: 'P',
                prefix: 'A',
            }
            transaction.set(adminDocRef, initialData)
            const newPropertyId = `${initialData.label}${initialData.prefix}${initialData.count + 1}`
            return newPropertyId
        }

        const adminData = adminDoc.data()
        const currentCount = adminData.count || 5269
        const label = adminData.label || 'P'
        const prefix = adminData.prefix || 'A'

        const newCount = currentCount + 1
        const newPropertyId = `${label}${prefix}${newCount}`

        transaction.update(adminDocRef, { count: newCount })

        return newPropertyId
    })
}

// Fetch QC Inventory by ID
export const fetchQCInventoryById = createAsyncThunk<IQCInventory, string, { rejectValue: string }>(
    'qc/fetchById',
    async (qcId: string, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching QC inventory with ID:', qcId)

            const docRef = doc(db, 'acnQCInventories', qcId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data() as IQCInventory
                console.log('✅ QC inventory data fetched successfully:', data)
                return data
            } else {
                console.log('❌ No QC inventory found with ID:', qcId)
                return rejectWithValue(`QC inventory with ID ${qcId} not found`)
            }
        } catch (error: any) {
            console.error('❌ Error fetching QC inventory:', error)
            return rejectWithValue(error.message || 'Failed to fetch QC inventory')
        }
    },
)

// Update QC Status with Role-Based Logic and Business Rules
export const updateQCStatusWithRoleCheck = createAsyncThunk<
    UpdateStatusResponse,
    UpdateQCStatusParams,
    { rejectValue: string }
>(
    'qc/updateStatusWithRoleCheck',
    async ({ property, status, agentData, activeTab, reviewedBy }, { rejectWithValue }) => {
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
            })

            // Safely get current statuses with fallbacks
            const currentKamStatus = property.qcReview?.kamReview?.status || property.kamStatus || 'pending'
            const currentDataStatus = property.qcReview?.dataReview?.status || property.dataStatus || 'pending'

            switch (agentData.role) {
                case 'data':
                    console.log('🔄 Processing data update')
                    // Role-based validation first
                    if (currentKamStatus !== 'approved') {
                        return rejectWithValue('Data team can only edit status if KAM status is approved')
                    }
                    if (property.stage === 'notApproved') {
                        return rejectWithValue('Data team cannot edit properties in notApproved stage')
                    }
                    if (status === currentDataStatus) {
                        return rejectWithValue(`You cannot change the status of a property that is already: ${status}`)
                    }

                    // Check if status is other than approved
                    if (status !== 'approved') {
                        // Apply special logic: kamStatus = given status, qcStatus = pending, stage = notApproved, status = given status
                        dataToSave = {
                            qcReview: {
                                ...property.qcReview,
                                kamReview: {
                                    ...property.qcReview?.kamReview,
                                    status: status as any,
                                    reviewDate: currentTime,
                                    reviewedBy,
                                    comments: `Status updated to ${status} - moved to notApproved stage`,
                                },
                                dataReview: {
                                    status: status as any,
                                    reviewDate: currentTime,
                                    reviewedBy,
                                    comments: `Data review status updated to ${status}`,
                                },
                            },
                            kamStatus: status as any,
                            dataStatus: status as any,
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
                                    userPhone: agentData.phone,
                                    kamId: agentData.kamId || '',
                                    cpId: property.cpId,
                                    action: `Status changed to ${status}`,
                                    details: `Status updated by ${reviewedBy} (${agentData.role}) - moved to notApproved stage`,
                                    performedBy: reviewedBy,
                                    date: currentTime,
                                },
                            ],
                        }
                    } else {
                        // Original logic for approved status
                        dataToSave = {
                            qcReview: {
                                ...property.qcReview,
                                dataReview: {
                                    status: status as any,
                                    reviewDate: currentTime,
                                    reviewedBy,
                                    comments: `Data review status updated to ${status}`,
                                },
                            },
                            dataStatus: status as any,
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
                                    userPhone: agentData.phone,
                                    kamId: agentData.kamId || '',
                                    cpId: property.cpId,
                                    action: `Status changed to ${status}`,
                                    details: `Status updated by ${reviewedBy} (${agentData.role})`,
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
                    // Role-based validation first
                    if (property.stage !== 'kam' && property.stage !== 'notApproved') {
                        return rejectWithValue(
                            'You cannot change the status of a property that is not in the KAM or notApproved stage',
                        )
                    }
                    if (status === currentKamStatus) {
                        return rejectWithValue(`You cannot change the status of a property that is already: ${status}`)
                    }

                    // Check if status is other than approved
                    if (status !== 'approved') {
                        // Apply special logic: kamStatus = given status, qcStatus = pending, stage = notApproved, status = given status
                        dataToSave = {
                            qcReview: {
                                ...property.qcReview,
                                kamReview: {
                                    status: status as any,
                                    reviewDate: currentTime,
                                    reviewedBy,
                                    comments: `Status updated to ${status} - moved to notApproved stage`,
                                },
                                // Preserve existing dataReview if it exists
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
                                    userPhone: agentData.phone,
                                    kamId: agentData.kamId || '',
                                    cpId: property.cpId,
                                    action: `Status changed to ${status}`,
                                    details: `Status updated by ${reviewedBy} (${agentData.role}) - moved to notApproved stage`,
                                    performedBy: reviewedBy,
                                    date: currentTime,
                                },
                            ],
                        }
                    } else {
                        // Original logic for approved status
                        dataToSave = {
                            qcReview: {
                                ...property.qcReview,
                                kamReview: {
                                    status: status as any,
                                    reviewDate: currentTime,
                                    reviewedBy,
                                    comments: `KAM review status updated to ${status}`,
                                },
                                // Preserve existing dataReview if it exists
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
                                    userPhone: agentData.phone,
                                    kamId: agentData.kamId || '',
                                    cpId: property.cpId,
                                    action: `Status changed to ${status}`,
                                    details: `Status updated by ${reviewedBy} (${agentData.role})`,
                                    performedBy: reviewedBy,
                                    date: currentTime,
                                },
                            ],
                        }
                    }
                    break

                case 'kamModerator':
                    console.log('🔄 Processing kamModerator update')
                    // KAM moderators can edit in ALL stages (kam, data, notApproved)
                    if (activeTab === 'kam') {
                        if (status === currentKamStatus) {
                            return rejectWithValue(
                                `You cannot change the status of a property that is already: ${status}`,
                            )
                        }

                        // Check if status is other than approved
                        if (status !== 'approved') {
                            // Apply special logic
                            dataToSave = {
                                qcReview: {
                                    ...property.qcReview,
                                    kamReview: {
                                        status: status as any,
                                        reviewDate: currentTime,
                                        reviewedBy,
                                        comments: `Status updated to ${status} by moderator - moved to notApproved stage`,
                                    },
                                    // Preserve existing dataReview if it exists
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
                                        userPhone: agentData.phone,
                                        kamId: agentData.kamId || '',
                                        cpId: property.cpId,
                                        action: `Status changed to ${status}`,
                                        details: `Status updated by ${reviewedBy} (${agentData.role}) - moved to notApproved stage`,
                                        performedBy: reviewedBy,
                                        date: currentTime,
                                    },
                                ],
                            }
                        } else {
                            // Original logic for approved status
                            dataToSave = {
                                qcReview: {
                                    ...property.qcReview,
                                    kamReview: {
                                        status: status as any,
                                        reviewDate: currentTime,
                                        reviewedBy,
                                        comments: `KAM review status updated to ${status} by moderator`,
                                    },
                                    // Preserve existing dataReview if it exists
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
                                        userPhone: agentData.phone,
                                        kamId: agentData.kamId || '',
                                        cpId: property.cpId,
                                        action: `Status changed to ${status}`,
                                        details: `Status updated by ${reviewedBy} (${agentData.role})`,
                                        performedBy: reviewedBy,
                                        date: currentTime,
                                    },
                                ],
                            }
                        }
                    } else if (activeTab === 'data') {
                        // For data tab, still need KAM to be approved (unless in notApproved stage)
                        if (currentKamStatus !== 'approved' && property.stage !== 'notApproved') {
                            return rejectWithValue('Data team can only edit status if KAM status is approved')
                        }
                        if (status === currentDataStatus) {
                            return rejectWithValue(
                                `You cannot change the status of a property that is already: ${status}`,
                            )
                        }

                        // Check if status is other than approved
                        if (status !== 'approved') {
                            // Apply special logic
                            dataToSave = {
                                qcReview: {
                                    ...property.qcReview,
                                    kamReview: {
                                        ...property.qcReview?.kamReview,
                                        status: status as any,
                                        reviewDate: currentTime,
                                        reviewedBy,
                                        comments: `Status updated to ${status} by moderator - moved to notApproved stage`,
                                    },
                                    dataReview: {
                                        status: status as any,
                                        reviewDate: currentTime,
                                        reviewedBy,
                                        comments: `Data review status updated to ${status} by moderator`,
                                    },
                                },
                                kamStatus: status as any,
                                dataStatus: status as any,
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
                                        userPhone: agentData.phone,
                                        kamId: agentData.kamId || '',
                                        cpId: property.cpId,
                                        action: `Status changed to ${status}`,
                                        details: `Status updated by ${reviewedBy} (${agentData.role}) - moved to notApproved stage`,
                                        performedBy: reviewedBy,
                                        date: currentTime,
                                    },
                                ],
                            }
                        } else {
                            // Original logic for approved status
                            dataToSave = {
                                qcReview: {
                                    ...property.qcReview,
                                    kamReview: property.qcReview?.kamReview || {
                                        status: currentKamStatus as any,
                                        reviewDate: currentTime,
                                        reviewedBy: 'System',
                                        comments: 'Initial KAM review',
                                    },
                                    dataReview: {
                                        status: status as any,
                                        reviewDate: currentTime,
                                        reviewedBy,
                                        comments: `Data review status updated to ${status} by moderator`,
                                    },
                                },
                                dataStatus: status as any,
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
                                        userPhone: agentData.phone,
                                        kamId: agentData.kamId || '',
                                        cpId: property.cpId,
                                        action: `Status changed to ${status}`,
                                        details: `Status updated by ${reviewedBy} (${agentData.role})`,
                                        performedBy: reviewedBy,
                                        date: currentTime,
                                    },
                                ],
                            }
                            shouldCreateProperty = true
                        }
                    } else {
                        return rejectWithValue('These fields cannot be edited from this tab!')
                    }
                    break

                default:
                    return rejectWithValue('Unauthorized role for this operation')
            }

            if (!property.propertyId) {
                return rejectWithValue('Property ID is missing')
            }

            console.log('💾 Saving data:', dataToSave)

            // Update QC inventory
            const qcDocRef = doc(db, 'acnQCInventories', property.propertyId)
            await updateDoc(qcDocRef, dataToSave)

            // Send notification (non-blocking)
            fetch(`https://notification-server-acn.onrender.com/qcstatus/${property.propertyId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            }).catch(() => {})

            // Create property if both reviews are approved
            if (shouldCreateProperty) {
                const newPropertyId = await generateUniquePropertyId()
                const propertyData = {
                    ...property,
                    ...dataToSave,
                    propertyId: newPropertyId,
                    status: 'available',
                    dateOfInventoryAdded: property.dateOfInventoryAdded,
                    dateOfStatusLastChecked: currentTime,
                    ageOfStatus: 0,
                }
                const propertyDocRef = doc(db, 'acnProperties', newPropertyId)
                await setDoc(propertyDocRef, propertyData)

                console.log('🏠 Property created successfully with ID:', newPropertyId)

                // Send property creation notification (non-blocking)
                fetch(`https://notification-server-acn.onrender.com/property/${newPropertyId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).catch(() => {})
            }

            console.log('✅ Status updated successfully')
            return {
                propertyId: property.propertyId,
                updates: dataToSave,
                propertyCreated: shouldCreateProperty,
            }
        } catch (error: any) {
            console.error('❌ Error updating QC status:', error)
            return rejectWithValue(error.message || 'Failed to update QC status')
        }
    },
)

// Add Note to QC Inventory
export const addQCInventoryNote = createAsyncThunk<AddNoteResponse, AddNoteParams, { rejectValue: string }>(
    'qc/addNote',
    async ({ propertyId, details, kamId, kamName }, { rejectWithValue }) => {
        try {
            console.log('📝 Adding note to QC inventory:', {
                propertyId,
                details,
                kamId,
                kamName,
            })

            const docRef = doc(db, 'acnQCInventories', propertyId)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists()) {
                return rejectWithValue('Property not found')
            }

            const currentProperty = docSnap.data() as BaseQCInventory
            const currentTime = getCurrentTimestamp()

            const newNote = {
                kamId,
                kamName,
                details,
                timestamp: currentTime,
            }

            const dataToSave = {
                notes: [...(currentProperty.notes || []), newNote],
                lastModified: currentTime,
            }

            await updateDoc(docRef, dataToSave)

            console.log('✅ Note added successfully')
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
