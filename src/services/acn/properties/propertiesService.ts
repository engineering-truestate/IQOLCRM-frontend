// store/services/propertiesService.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    setDoc,
    runTransaction,
    QueryConstraint,
    arrayUnion,
} from 'firebase/firestore'
import { db } from '../../../firebase'
import { type IInventory } from '../../../store/reducers/acn/propertiesTypes'
import { getUnixDateTime } from '../../../components/helper/getUnixDateTime'

// Helper function to get current Unix timestamp in milliseconds
const getCurrentTimestamp = () => Date.now()

// Helper function to remove undefined values
const removeUndefinedFields = (obj: any): any => {
    const cleaned: any = {}

    Object.keys(obj).forEach((key) => {
        const value = obj[key]

        if (value !== undefined) {
            if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                const cleanedNested = removeUndefinedFields(value)
                if (Object.keys(cleanedNested).length > 0) {
                    cleaned[key] = cleanedNested
                }
            } else {
                cleaned[key] = value
            }
        }
    })

    return cleaned
}

// Helper function to set default values
const setDefaultValues = (propertyData: Partial<IInventory>): Partial<IInventory> => {
    return {
        ...propertyData,
        nameOfTheProperty: propertyData.nameOfTheProperty || '',
        area: propertyData.area || '',
        micromarket: propertyData.micromarket || '',
        mapLocation: propertyData.mapLocation || '',
        assetType: propertyData.assetType || 'apartment',
        unitType: propertyData.unitType || '',
        subType: propertyData.subType || '',
        sbua: propertyData.sbua || 0,
        totalAskPrice: propertyData.totalAskPrice || 0,
        askPricePerSqft: propertyData.askPricePerSqft || 0,
        floorNo: propertyData.floorNo || '',
        facing: propertyData.facing || '',
        status: propertyData.status || 'Available',
        currentStatus: propertyData.currentStatus || 'Available',
        cpId: propertyData.cpId || '',
        extraDetails: propertyData.extraDetails || '',
        driveLink: propertyData.driveLink || '',
        photo: propertyData.photo || [],
        video: propertyData.video || [],
        document: propertyData.document || [],
        _geoloc: propertyData._geoloc || { lat: 0, lng: 0 },
        tenanted: propertyData.tenanted !== undefined ? propertyData.tenanted : false,
        ocReceived: propertyData.ocReceived !== undefined ? propertyData.ocReceived : false,
    }
}

// Convert any timestamp to Unix milliseconds
const convertTimestampToUnix = (timestamp: any): number => {
    if (!timestamp) return getCurrentTimestamp()

    if (typeof timestamp === 'number') return timestamp

    if (timestamp.seconds !== undefined) {
        return timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000)
    }

    if (timestamp instanceof Date) {
        return timestamp.getTime()
    }

    if (typeof timestamp === 'string') {
        const parsed = new Date(timestamp).getTime()
        return isNaN(parsed) ? getCurrentTimestamp() : parsed
    }

    return getCurrentTimestamp()
}

// Generate unique property ID using admin collection
const generateUniquePropertyId = async (): Promise<string> => {
    return await runTransaction(db, async (transaction) => {
        console.log('🔢 Generating unique property ID from admin collection')

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
            console.log('🆕 Initialized admin document and generated first property ID:', newPropertyId)
            return newPropertyId
        }

        const adminData = adminDoc.data()
        const currentCount = adminData.count || 5269
        const label = adminData.label || 'P'
        const prefix = adminData.prefix || 'A'

        const newCount = currentCount + 1
        const newPropertyId = `${label}${prefix}${newCount}`

        transaction.update(adminDocRef, { count: newCount })

        console.log('✅ Generated unique property ID:', newPropertyId, 'with count:', newCount)
        return newPropertyId
    })
}

// Add new property with unique ID generation - FIXED VERSION
export const addProperty = createAsyncThunk(
    'properties/add',
    async (propertyData: Partial<IInventory>, { rejectWithValue }) => {
        try {
            console.log('➕ Adding new property:', propertyData)

            // Generate unique property ID from admin collection
            const propertyId = await generateUniquePropertyId()
            const currentTime = getCurrentTimestamp()

            // Set default values and use Unix timestamps
            const propertyWithDefaults = setDefaultValues({
                ...propertyData,
                propertyId,
                dateOfInventoryAdded: currentTime, // Use Unix timestamp directly
                dateOfStatusLastChecked: currentTime, // Use Unix timestamp directly
                ageOfInventory: 0,
                ageOfStatus: 0,
                handoverDate: propertyData.handoverDate ? convertTimestampToUnix(propertyData.handoverDate) : null,
            })

            // Remove undefined fields
            const cleanedProperty = removeUndefinedFields(propertyWithDefaults)

            console.log('🧹 Cleaned property data with ID:', propertyId, cleanedProperty)

            // Use setDoc with the propertyId as document ID
            const docRef = doc(db, 'acnProperties', propertyId)
            await setDoc(docRef, cleanedProperty)

            console.log('✅ Property added successfully with document ID:', propertyId)

            // Return the property with Unix timestamps only (NO Firebase Timestamp objects)
            const returnProperty: IInventory = {
                ...cleanedProperty,
                id: propertyId,
                propertyId: propertyId,
                dateOfInventoryAdded: currentTime, // Ensure Unix timestamp
                dateOfStatusLastChecked: currentTime, // Ensure Unix timestamp
            } as IInventory

            console.log('🔄 Returning property to Redux:', returnProperty)
            return returnProperty
        } catch (error: any) {
            console.error('❌ Error adding property:', error)
            return rejectWithValue(error.message || 'Failed to add property')
        }
    },
)

export const fetchAllProperties = async (filters: any) => {
    try {
        const constraints: QueryConstraint[] = []

        if (filters && Object.keys(filters).length > 0) {
            Object.entries(filters).forEach(([field, value]) => {
                if (Array.isArray(value)) {
                    constraints.push(where(field, 'in', value))
                } else {
                    constraints.push(where(field, '==', value))
                }
            })
        }

        console.log(filters)
        const q = query(collection(db, 'acnProperties'), ...constraints)

        const snapshot = await getDocs(q)

        const properties = snapshot.docs.map((doc) => {
            const data = doc.data() as IInventory

            return {
                ...data,
                id: doc.id,
            }
        })

        console.log([properties, 'hello'])

        return { success: true, data: properties }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Get next property ID preview
export const getNextPropertyId = createAsyncThunk('properties/getNextId', async (_, { rejectWithValue }) => {
    try {
        console.log('🔍 Getting next property ID preview')

        const adminDocRef = doc(db, 'acn-admin', 'lastPropId')
        const adminDoc = await getDoc(adminDocRef)

        if (!adminDoc.exists()) {
            return 'AP5270'
        }

        const adminData = adminDoc.data()
        const currentCount = adminData.count || 5269
        const label = adminData.label || 'P'
        const prefix = adminData.prefix || 'A'

        const nextId = `${label}${prefix}${currentCount + 1}`
        console.log('📋 Next property ID will be:', nextId)

        return nextId
    } catch (error: any) {
        console.error('Error getting next property', error)
        return rejectWithValue(error.message || 'Failed to get next property ID')
    }
})

// Fetch single property by ID
export const fetchPropertyById = createAsyncThunk(
    'properties/fetchById',
    async (propertyId: string, { rejectWithValue }) => {
        console.log('🔍 Fetching property with ID:', propertyId)
        try {
            // Determine collection based on property ID prefix
            let dbPath = ''
            if (propertyId.startsWith('PA')) {
                dbPath = 'acnProperties'
                console.log('🏠 Using acnProperties collection for PA prefix')
            } else if (propertyId.startsWith('RN')) {
                dbPath = 'acnRentalInventories'
                console.log('🏠 Using acnRentalInventories collection for RN prefix')
            } else {
                // Fallback to acnProperties for backward compatibility
                dbPath = 'acnProperties'
                console.log('🏠 Using acnProperties collection as fallback')
            }

            // Try to get by document ID (which should match propertyId)
            const docRef = doc(db, dbPath, propertyId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data() as any
                console.log('✅ Property data fetched by document ID:', data)

                const convertedData: IInventory = {
                    ...data,
                    id: docSnap.id,
                    dateOfInventoryAdded: convertTimestampToUnix(data.dateOfInventoryAdded),
                    dateOfStatusLastChecked: convertTimestampToUnix(data.dateOfStatusLastChecked),
                    handoverDate: data.handoverDate ? convertTimestampToUnix(data.handoverDate) : null,
                }

                return convertedData
            }

            // If not found by document ID, try to find by propertyId field
            console.log('🔍 Document not found by ID, searching by propertyId field...')
            const q = query(collection(db, dbPath), where('propertyId', '==', propertyId))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0]
                const data = doc.data() as any
                console.log('✅ Property data fetched by propertyId field:', data)

                const convertedData: IInventory = {
                    ...data,
                    id: doc.id,
                    dateOfInventoryAdded: convertTimestampToUnix(data.dateOfInventoryAdded),
                    dateOfStatusLastChecked: convertTimestampToUnix(data.dateOfStatusLastChecked),
                    handoverDate: data.handoverDate ? convertTimestampToUnix(data.handoverDate) : null,
                }

                return convertedData
            }

            console.log('❌ No property found with ID:', propertyId)
            throw new Error(`Property with ID ${propertyId} not found`)
        } catch (error: any) {
            console.error('❌ Error fetching property:', error)
            return rejectWithValue(error.message || 'Failed to fetch property')
        }
    },
)

// Update existing property
export const updateProperty = createAsyncThunk(
    'properties/update',
    async ({ id, updates }: { id: string; updates: Partial<IInventory> }, { rejectWithValue }) => {
        try {
            console.log('📝 Updating property:', id, updates)

            const docRef = doc(db, 'acnProperties', id)

            const updatesWithDefaults = setDefaultValues({
                ...updates,
                dateOfStatusLastChecked: getCurrentTimestamp(),
                handoverDate: updates.handoverDate
                    ? convertTimestampToUnix(updates.handoverDate)
                    : updates.handoverDate,
            })

            if (updates.status) {
                updatesWithDefaults.ageOfStatus = 0
                updatesWithDefaults.currentStatus = updates.status
            }

            const cleanedUpdates = removeUndefinedFields(updatesWithDefaults)

            console.log('🧹 Cleaned update data:', cleanedUpdates)

            await updateDoc(docRef, cleanedUpdates)

            console.log('✅ Property updated successfully')

            return { id, updates: cleanedUpdates }
        } catch (error: any) {
            console.error('❌ Error updating property:', error)
            return rejectWithValue(error.message || 'Failed to update property')
        }
    },
)

// Other thunks...
export const fetchPropertiesByIds = createAsyncThunk(
    'properties/fetchByIds',
    async (propertyIds: string[], { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching properties with IDs:', propertyIds)

            if (propertyIds.length === 0) {
                return []
            }

            const docPromises = propertyIds.map(async (propertyId) => {
                // Determine collection based on property ID prefix
                let dbPath = ''
                if (propertyId.startsWith('PA')) {
                    dbPath = 'acnProperties'
                } else if (propertyId.startsWith('RN')) {
                    dbPath = 'acnRentalInventories'
                } else {
                    // Fallback to acnProperties for backward compatibility
                    dbPath = 'acnProperties'
                }

                const docRef = doc(db, dbPath, propertyId)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = docSnap.data() as any
                    return {
                        ...data,
                        id: docSnap.id,
                        dateOfInventoryAdded: convertTimestampToUnix(data.dateOfInventoryAdded),
                        dateOfStatusLastChecked: convertTimestampToUnix(data.dateOfStatusLastChecked),
                        handoverDate: data.handoverDate ? convertTimestampToUnix(data.handoverDate) : null,
                    } as IInventory
                }
                return null
            })

            const results = await Promise.all(docPromises)
            const allProperties = results.filter((result) => result !== null) as IInventory[]

            console.log('✅ Properties fetched successfully:', allProperties.length, 'properties')
            return allProperties
        } catch (error: any) {
            console.error('❌ Error fetching properties:', error)
            return rejectWithValue(error.message || 'Failed to fetch properties')
        }
    },
)

export const updatePropertyStatus = createAsyncThunk(
    'properties/updateStatus',
    async (
        {
            propertyId,
            status,
            soldPrice,
            sold,
            notes,
        }: {
            propertyId: string
            status: string
            soldPrice?: number
            sold?: {
                date: number
                soldPrice: number
                sellingPlatform: string
            }
            notes?: string
        },
        { rejectWithValue, dispatch },
    ) => {
        try {
            console.log('📝 Updating property status:', propertyId, status, soldPrice, sold, notes)

            // Determine collection based on property ID prefix
            let dbPath = ''
            if (propertyId.startsWith('PA')) {
                dbPath = 'acnProperties'
                console.log('🏠 Using acnProperties collection for PA prefix')
            } else if (propertyId.startsWith('RN')) {
                dbPath = 'acnRentalInventories'
                console.log('🏠 Using acnRentalInventories collection for RN prefix')
            } else {
                // Fallback to acnProperties for backward compatibility
                dbPath = 'acnProperties'
                console.log('🏠 Using acnProperties collection as fallback')
            }

            const docRef = doc(db, dbPath, propertyId)

            // Prepare update data
            const updateData: any = {
                status: status,
                currentStatus: status,
                dateOfStatusLastChecked: getUnixDateTime(),
                ageOfStatus: 0,
            }

            // Add sold object if provided (for Sold status)
            if (sold) {
                updateData.sold = sold
                // Also update soldPrice for backward compatibility
                updateData.soldPrice = sold.soldPrice
            } else if (soldPrice !== undefined) {
                // Add soldPrice if provided (for Rented status or other cases)
                updateData.soldPrice = soldPrice
            }

            await updateDoc(docRef, updateData)

            // Add note if provided
            if (notes && notes.trim()) {
                const noteData: INote = {
                    id: `note_${Date.now()}`,
                    email: 'system@acn.com', // You might want to get this from user context
                    author: 'System', // You might want to get this from user context
                    content: notes.trim(),
                    timestamp: getUnixDateTime(), // Unix timestamp
                }

                await dispatch(addNoteToProperty({ propertyId, note: noteData }))
            }

            console.log('✅ Property status updated successfully')
            return { propertyId, status, soldPrice, sold }
        } catch (error: any) {
            console.error('❌ Error updating property status:', error)
            return rejectWithValue(error.message || 'Failed to update property status')
        }
    },
)

// Add note to property
export const addNoteToProperty = createAsyncThunk(
    'properties/addNote',
    async (
        {
            propertyId,
            note,
        }: {
            propertyId: string
            note: INote
        },
        { rejectWithValue },
    ) => {
        try {
            console.log('📝 Adding note to property:', propertyId, note)

            // Determine collection based on property ID prefix
            let dbPath = ''
            if (propertyId.startsWith('PA')) {
                dbPath = 'acnProperties'
            } else if (propertyId.startsWith('RN')) {
                dbPath = 'acnRentalInventories'
            } else {
                // Fallback to acnProperties for backward compatibility
                dbPath = 'acnProperties'
            }

            const docRef = doc(db, dbPath, propertyId)
            const newNote: INote = {
                ...note,
                id: `note_${Date.now()}`,
                timestamp: getUnixDateTime(),
            }

            await updateDoc(docRef, {
                notes: arrayUnion(newNote),
                lastModified: getCurrentTimestamp(),
            })

            console.log('✅ Note added successfully')
            return { propertyId, note: newNote }
        } catch (error: any) {
            console.error('❌ Error adding note:', error)
            return rejectWithValue(error.message || 'Failed to add note')
        }
    },
)

// Remove note from property
export const removeNoteFromProperty = createAsyncThunk(
    'properties/removeNote',
    async (
        {
            propertyId,
            noteId,
        }: {
            propertyId: string
            noteId: string
        },
        { rejectWithValue },
    ) => {
        try {
            console.log('🗑️ Removing note from property:', propertyId, noteId)

            // Determine collection based on property ID prefix
            let dbPath = ''
            if (propertyId.startsWith('PA')) {
                dbPath = 'acnProperties'
            } else if (propertyId.startsWith('RN')) {
                dbPath = 'acnRentalInventories'
            } else {
                // Fallback to acnProperties for backward compatibility
                dbPath = 'acnProperties'
            }

            const docRef = doc(db, dbPath, propertyId)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists()) {
                throw new Error('Property not found')
            }

            const data = docSnap.data() as IInventory
            const updatedNotes = (data.notes || []).filter((note: INote) => note.id !== noteId)

            await updateDoc(docRef, {
                notes: updatedNotes,
                lastModified: getCurrentTimestamp(),
            })

            console.log('✅ Note removed successfully')
            return { propertyId, noteId }
        } catch (error: any) {
            console.error('❌ Error removing note:', error)
            return rejectWithValue(error.message || 'Failed to remove note')
        }
    },
)

// Note interface for properties
interface INote {
    id: string
    email: string
    author: string
    content: string
    timestamp: number
}

export const addPriceDropHistory = createAsyncThunk(
    'properties/addPriceDropHistory',
    async (
        {
            propertyId,
            sbua,
            priceDropData,
        }: {
            propertyId: string
            sbua: number
            priceDropData: {
                kamId?: string
                kamName?: string
                kamEmail?: string
                oldTotalAskPrice?: number
                newTotalAskPrice?: number
                oldAskPricePerSqft?: number
                newAskPricePerSqft?: number
                timestamp: number
            }
        },
        { rejectWithValue },
    ) => {
        try {
            console.log('📝 Adding price drop history to property:', propertyId, priceDropData)

            // Determine collection based on property ID prefix
            let dbPath = ''
            if (propertyId.startsWith('PA')) {
                dbPath = 'acnProperties'
            } else if (propertyId.startsWith('RN')) {
                dbPath = 'acnRentalInventories'
            } else {
                // Fallback to acnProperties for backward compatibility
                dbPath = 'acnProperties'
            }

            const docRef = doc(db, dbPath, propertyId)

            // Calculate ALL complementary price values based on sbua
            const updatedPriceDropData = { ...priceDropData }

            // Always calculate both old and new values for both price types
            if (sbua > 0) {
                // If totalAskPrice values are provided, calculate askPricePerSqft values
                if (priceDropData.newTotalAskPrice !== undefined) {
                    updatedPriceDropData.newAskPricePerSqft = priceDropData.newTotalAskPrice / sbua
                }
                if (priceDropData.oldTotalAskPrice !== undefined) {
                    updatedPriceDropData.oldAskPricePerSqft = priceDropData.oldTotalAskPrice / sbua
                }

                // If askPricePerSqft values are provided, calculate totalAskPrice values
                if (priceDropData.newAskPricePerSqft !== undefined) {
                    updatedPriceDropData.newTotalAskPrice = sbua * priceDropData.newAskPricePerSqft
                }
                if (priceDropData.oldAskPricePerSqft !== undefined) {
                    updatedPriceDropData.oldTotalAskPrice = sbua * priceDropData.oldAskPricePerSqft
                }
            }

            // Create the price history entry with all calculated values
            const priceHistoryEntry = {
                ...updatedPriceDropData,
                id: `price_${Date.now()}`,
                timestamp: Math.floor(Date.now() / 1000), // Unix timestamp
            }

            // Update the document with new price history and BOTH current prices
            const updateData: any = {
                priceHistory: arrayUnion(priceHistoryEntry),
                lastModified: Math.floor(Date.now() / 1000),
            }

            // Always update BOTH current prices
            if (updatedPriceDropData.newTotalAskPrice !== undefined) {
                updateData.totalAskPrice = updatedPriceDropData.newTotalAskPrice
            }
            if (updatedPriceDropData.newAskPricePerSqft !== undefined) {
                updateData.askPricePerSqft = updatedPriceDropData.newAskPricePerSqft
            }

            await updateDoc(docRef, updateData)

            console.log('✅ Price drop history added successfully with ALL calculated values:', {
                oldTotalAskPrice: updatedPriceDropData.oldTotalAskPrice,
                newTotalAskPrice: updatedPriceDropData.newTotalAskPrice,
                oldAskPricePerSqft: updatedPriceDropData.oldAskPricePerSqft,
                newAskPricePerSqft: updatedPriceDropData.newAskPricePerSqft,
            })

            return { propertyId, priceHistoryEntry, updateData }
        } catch (error: any) {
            console.error('❌ Error adding price drop history:', error)
            return rejectWithValue(error.message || 'Failed to add price drop history')
        }
    },
)
