import { db } from '../../firebase'
import { collection, getDocs } from 'firebase/firestore'
import type { RestackResaleProperty } from '../../data_types/restack/restack-resale.d'

export const get99AcresResaleData = async (): Promise<RestackResaleProperty[]> => {
    const querySnapshot = await getDocs(collection(db, 'restackPostReraProperties'))

    const data: RestackResaleProperty[] = querySnapshot.docs.map((doc) => {
        const docData = doc.data()
        return {
            propertyId: doc.id,
            projectName: docData.projectName || '',
            propertyType: docData.propertyType || '',
            subType: docData.subType || '',
            configuration: docData.configuration || '',
            price: docData.price || '',
            pricePerSqft: docData.pricePerSqft || 0,
            acres: docData.acres || 0,
            superBuiltUpArea: docData.superBuiltUpArea || 0,
            totalUnits: docData.totalUnits || 0,
            carpetArea: docData.carpetArea || '',
            reraId: docData.reraId || '',
            developer: docData.developer || '',
            projectSize: docData.projectSize || '',
            ageOfProperty: docData.ageOfProperty || '',
            projectAddress: docData.projectAddress || '',
            micromarket: docData.micromarket || '',
            area: docData.area || '',
            status: docData.status || '',
            handoverDate: docData.handoverDate || '',
            launchDate: docData.launchDate || '',
            maplink: docData.maplink || '',
            lat: docData.lat || 0,
            long: docData.long || 0,
            inventoryDetails: docData.inventoryDetails || {
                availability: '',
                ageOfInventory: '',
                facing: '',
                overlooking: '',
                url: '',
                floorNumber: 0,
            },
            amenities: docData.amenities || [],
            aboutProject: docData.aboutProject || {
                configuration: '',
                towersandunits: '',
                description: '',
            },
            extraDetails: docData.extraDetails || {
                beds: 0,
                baths: 0,
                balconies: 0,
                furnishing: '',
            },
            priceHistory: docData.priceHistory || [],
        } as RestackResaleProperty
    })
    return data
}

export const getMagicBricksResaleData = async (): Promise<RestackResaleProperty[]> => {
    const querySnapshot = await getDocs(collection(db, 'restackPostReraProperties'))
    const data: RestackResaleProperty[] = querySnapshot.docs.map((doc) => {
        const docData = doc.data()
        return {
            propertyId: doc.id,
            projectName: docData.projectName || '',
            propertyType: docData.propertyType || '',
            subType: docData.subType || '',
            configuration: docData.configuration || '',
            price: docData.price || '',
            pricePerSqft: docData.pricePerSqft || 0,
            acres: docData.acres || 0,
            superBuiltUpArea: docData.superBuiltUpArea || 0,
            totalUnits: docData.totalUnits || 0,
            carpetArea: docData.carpetArea || '',
            reraId: docData.reraId || '',
            developer: docData.developer || '',
            projectSize: docData.projectSize || '',
            ageOfProperty: docData.ageOfProperty || '',
            projectAddress: docData.projectAddress || '',
            micromarket: docData.micromarket || '',
            area: docData.area || '',
            status: docData.status || '',
            handoverDate: docData.handoverDate || '',
            launchDate: docData.launchDate || '',
            maplink: docData.maplink || '',
            lat: docData.lat || 0,
            long: docData.long || 0,
            inventoryDetails: docData.inventoryDetails || {
                availability: '',
                ageOfInventory: '',
                facing: '',
                overlooking: '',
                url: '',
                floorNumber: 0,
            },
            amenities: docData.amenities || [],
            aboutProject: docData.aboutProject || {
                configuration: '',
                towersandunits: '',
                description: '',
            },
            extraDetails: docData.extraDetails || {
                beds: 0,
                baths: 0,
                balconies: 0,
                furnishing: '',
            },
            priceHistory: docData.priceHistory || [],
        } as RestackResaleProperty
    })
    return data
}
