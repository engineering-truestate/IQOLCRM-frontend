// store/services/qcService.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { doc, getDoc, updateDoc, setDoc, runTransaction } from 'firebase/firestore'
import { db } from '../../../firebase'
import type { IQCInventory, AgentData } from '../../../store/reducers/acn/qcTypes'

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
            const newPropertyId = `${initialData.prefix}${initialData.label}${initialData.count + 1}`
            return newPropertyId
        }

        const adminData = adminDoc.data()
        const currentCount = adminData.count || 5269
        const label = adminData.label || 'P'
        const prefix = adminData.prefix || 'A'

        const newCount = currentCount + 1
        const newPropertyId = `${prefix}${label}${newCount}`

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

            const docRef = doc(db, 'acn-qc-inventories', qcId)
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

// Update QC Status with Role-Based Logic
export const updateQCStatusWithRoleCheck = createAsyncThunk<
    {
        propertyId: string
        updates: Partial<IQCInventory>
        propertyCreated: boolean
    },
    {
        property: IQCInventory
        status: string
        agentData: AgentData
        activeTab: string
        reviewedBy: string
    },
    { rejectValue: string }
>(
    'qc/updateStatusWithRoleCheck',
    async ({ property, status, agentData, activeTab, reviewedBy }, { rejectWithValue }) => {
        try {
            console.log('📝 Updating QC status with role check:', {
                propertyId: property.propertyId,
                status,
                role: agentData.role,
                activeTab,
            })

            let dataToSave: Partial<IQCInventory> = {}
            let shouldCreateProperty = false
            const currentTime = getCurrentTimestamp()

            // Role-based logic
            switch (agentData.role) {
                case 'dataTeam':
                    // Data team can only edit if KAM status is approved
                    if (property.qcReview.kamReview.status !== 'approved') {
                        return rejectWithValue('Data team can only edit status if KAM status is approved')
                    }
                    if (status === property.qcReview.dataReview.status) {
                        return rejectWithValue(`You cannot change the status of a property that is already: ${status}`)
                    }

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
                        qcStatus: status as any,
                        status: status === 'approved' ? 'available' : (status as any),
                        lastmodified: currentTime,
                        qcHistory: [
                            ...property.qcHistory,
                            {
                                date: currentTime,
                                action: `Data Review: ${status}`,
                                performedBy: reviewedBy,
                                details: `Data review status updated to ${status}`,
                            },
                        ],
                    }

                    // If data team approves and KAM already approved, create property
                    if (status === 'approved' && property.qcReview.kamReview.status === 'approved') {
                        shouldCreateProperty = true
                        dataToSave.stage = 'live'
                    }
                    break

                case 'kam':
                    if (property.stage !== 'kam') {
                        return rejectWithValue(
                            'You cannot change the status of a property that is not in the KAM stage',
                        )
                    }
                    if (status === property.qcReview.kamReview.status) {
                        return rejectWithValue(`You cannot change the status of a property that is already: ${status}`)
                    }

                    dataToSave = {
                        qcReview: {
                            ...property.qcReview,
                            kamReview: {
                                status: status as any,
                                reviewDate: currentTime,
                                reviewedBy,
                                comments: `KAM review status updated to ${status}`,
                            },
                        },
                        kamStatus: status as any,
                        stage: status === 'approved' ? 'dataTeam' : 'kam',
                        lastmodified: currentTime,
                        qcHistory: [
                            ...property.qcHistory,
                            {
                                date: currentTime,
                                action: `KAM Review: ${status}`,
                                performedBy: reviewedBy,
                                details: `KAM review status updated to ${status}`,
                            },
                        ],
                    }
                    break

                case 'kamModerator':
                    if (activeTab === 'kam') {
                        if (status === property.qcReview.kamReview.status) {
                            return rejectWithValue(
                                `You cannot change the status of a property that is already: ${status}`,
                            )
                        }

                        dataToSave = {
                            qcReview: {
                                ...property.qcReview,
                                kamReview: {
                                    status: status as any,
                                    reviewDate: currentTime,
                                    reviewedBy,
                                    comments: `KAM review status updated to ${status} by moderator`,
                                },
                            },
                            kamStatus: status as any,
                            stage: status === 'approved' ? 'dataTeam' : 'kam',
                            lastmodified: currentTime,
                            qcHistory: [
                                ...property.qcHistory,
                                {
                                    date: currentTime,
                                    action: `KAM Review (Moderator): ${status}`,
                                    performedBy: reviewedBy,
                                    details: `KAM review status updated to ${status} by moderator`,
                                },
                            ],
                        }
                    } else if (activeTab === 'dataTeam') {
                        // Data team can only edit if KAM status is approved
                        if (property.qcReview.kamReview.status !== 'approved') {
                            return rejectWithValue('Data team can only edit status if KAM status is approved')
                        }
                        if (status === property.qcReview.dataReview.status) {
                            return rejectWithValue(
                                `You cannot change the status of a property that is already: ${status}`,
                            )
                        }

                        dataToSave = {
                            qcReview: {
                                ...property.qcReview,
                                dataReview: {
                                    status: status as any,
                                    reviewDate: currentTime,
                                    reviewedBy,
                                    comments: `Data review status updated to ${status} by moderator`,
                                },
                            },
                            qcStatus: status as any,
                            status: status === 'approved' ? 'available' : (status as any),
                            lastmodified: currentTime,
                            qcHistory: [
                                ...property.qcHistory,
                                {
                                    date: currentTime,
                                    action: `Data Review (Moderator): ${status}`,
                                    performedBy: reviewedBy,
                                    details: `Data review status updated to ${status} by moderator`,
                                },
                            ],
                        }

                        // If moderator approves data and KAM already approved, create property
                        if (status === 'approved' && property.qcReview.kamReview.status === 'approved') {
                            shouldCreateProperty = true
                            dataToSave.stage = 'live'
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

            // Update QC inventory
            const qcDocRef = doc(db, 'acn-qc-inventories', property.propertyId)
            await updateDoc(qcDocRef, dataToSave)

            // Send notification
            try {
                await fetch(`https://notification-server-acn.onrender.com/qcstatus/${property.propertyId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            } catch (notificationError) {
                console.warn('Failed to send notification:', notificationError)
            }

            // Create property if both reviews are approved
            if (shouldCreateProperty) {
                const propertyId = await generateUniquePropertyId()

                const propertyData = {
                    ...property,
                    ...dataToSave,
                    propertyId,
                    status: 'Available',
                    dateOfInventoryAdded: property.dateOfInventoryAdded,
                    dateOfStatusLastChecked: currentTime,
                    ageOfStatus: 0,
                }

                const propertyDocRef = doc(db, 'acn-properties', propertyId)
                await setDoc(propertyDocRef, propertyData)

                // Send property creation notification
                try {
                    await fetch(`https://notification-server-acn.onrender.com/property/${propertyId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                } catch (notificationError) {
                    console.warn('Failed to send property creation notification:', notificationError)
                }

                console.log('✅ Property created successfully with ID:', propertyId)
            }

            console.log('✅ QC status updated successfully')
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
