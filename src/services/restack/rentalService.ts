import { db } from '../../firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { updateDoc } from 'firebase/firestore'
import type { RestackRentalProperty } from '../../data_types/restack/restack-rental.d'

export const get99AcresRentalData = async (): Promise<RestackRentalProperty[]> => {
    const querySnapshot = await getDocs(collection(db, 'restackRental99AcresProperties'))

    const data: RestackRentalProperty[] = querySnapshot.docs.map((doc) => {
        const docData = doc.data()
        return {
            propertyId: doc.id,
            propertyName: docData.propertyName || '',
            description: docData.description || '',
            configuration: docData.configuration || '',
            superBuiltUpArea: docData.superBuiltUpArea || 0,
            carpetArea: docData.carpetArea || 0,
            builtup: docData.builtup || 0,
            price: docData.price || 0,
            micromarket: docData.micromarket || '',
            address: docData.address || '',
            furnishStatus: docData.furnishStatus || '',
            ageOfProperty: docData.ageOfProperty || 0,
            postedOn: docData.postedOn || '',
            postedBy: docData.postedBy || '',
            url: docData.url || '',
            aboutProject: docData.aboutProject || '',
        } as RestackRentalProperty
    })
    return data
}

export const getMagicBricksRentalData = async (): Promise<RestackRentalProperty[]> => {
    const querySnapshot = await getDocs(collection(db, 'restackRental99AcresProperties'))
    const data: RestackRentalProperty[] = querySnapshot.docs.map((doc) => {
        const docData = doc.data()
        return {
            propertyId: doc.id,
            propertyName: docData.propertyName || '',
            description: docData.description || '',
            configuration: docData.configuration || '',
            superBuiltUpArea: docData.superBuiltUpArea || 0,
            carpetArea: docData.carpetArea || 0,
            builtup: docData.builtup || 0,
            price: docData.price || 0,
            micromarket: docData.micromarket || '',
            address: docData.address || '',
            furnishStatus: docData.furnishStatus || '',
            ageOfProperty: docData.ageOfProperty || 0,
            postedOn: docData.postedOn || '',
            postedBy: docData.postedBy || '',
            url: docData.url || '',
            aboutProject: docData.aboutProject || '',
        } as RestackRentalProperty
    })
    return data
}

export const get99AcresRentalDataById = async (id: string): Promise<RestackRentalProperty | undefined> => {
    try {
        const docRef = doc(db, 'restackRental99AcresProperties', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data()
            return {
                propertyId: docSnap.id,
                propertyName: docData.propertyName || '',
                description: docData.description || '',
                configuration: docData.configuration || '',
                superBuiltUpArea: docData.superBuiltUpArea || 0,
                carpetArea: docData.carpetArea || 0,
                builtup: docData.builtup || 0,
                price: docData.price || 0,
                micromarket: docData.micromarket || '',
                address: docData.address || '',
                furnishStatus: docData.furnishStatus || '',
                ageOfProperty: docData.ageOfProperty || 0,
                postedOn: docData.postedOn || '',
                postedBy: docData.postedBy || '',
                url: docData.url || '',
                aboutProject: docData.aboutProject || '',
            } as RestackRentalProperty
        } else {
            return undefined
        }
    } catch (error) {
        console.error('Error fetching 99Acres rental data by ID:', error)
        return undefined
    }
}

export const getMagicBricksRentalDataById = async (id: string): Promise<RestackRentalProperty | undefined> => {
    try {
        const docRef = doc(db, 'restackRental99AcresProperties', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data()
            return {
                propertyId: docSnap.id,
                propertyName: docData.propertyName || '',
                description: docData.description || '',
                configuration: docData.configuration || '',
                superBuiltUpArea: docData.superBuiltUpArea || 0,
                carpetArea: docData.carpetArea || 0,
                builtup: docData.builtup || 0,
                price: docData.price || 0,
                micromarket: docData.micromarket || '',
                address: docData.address || '',
                furnishStatus: docData.furnishStatus || '',
                ageOfProperty: docData.ageOfProperty || 0,
                postedOn: docData.postedOn || '',
                postedBy: docData.postedBy || '',
                url: docData.url || '',
                aboutProject: docData.aboutProject || '',
            } as RestackRentalProperty
        } else {
            return undefined
        }
    } catch (error) {
        console.error('Error fetching MagicBricks rental data by ID:', error)
        return undefined
    }
}

export const update99AcresRentalDataById = async (
    id: string,
    data: Partial<RestackRentalProperty>,
): Promise<RestackRentalProperty | undefined> => {
    try {
        const docRef = doc(db, 'restackRental99AcresProperties', id)
        await updateDoc(docRef, data)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data()
            return {
                propertyId: docSnap.id,
                propertyName: docData.propertyName || '',
                description: docData.description || '',
                configuration: docData.configuration || '',
                superBuiltUpArea: docData.superBuiltUpArea || 0,
                carpetArea: docData.carpetArea || 0,
                builtup: docData.builtup || 0,
                price: docData.price || 0,
                micromarket: docData.micromarket || '',
                address: docData.address || '',
                furnishStatus: docData.furnishStatus || '',
                ageOfProperty: docData.ageOfProperty || 0,
                postedOn: docData.postedOn || '',
                postedBy: docData.postedBy || '',
                url: docData.url || '',
                aboutProject: docData.aboutProject || '',
            } as RestackRentalProperty
        } else {
            return undefined
        }
    } catch (error) {
        console.error('Error patching 99Acres rental data by ID:', error)
        return undefined
    }
}

export const updateMagicBricksRentalDataById = async (
    id: string,
    data: Partial<RestackRentalProperty>,
): Promise<RestackRentalProperty | undefined> => {
    try {
        const docRef = doc(db, 'restackRental99AcresProperties', id)
        await updateDoc(docRef, data)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data()
            return {
                propertyId: docSnap.id,
                propertyName: docData.propertyName || '',
                description: docData.description || '',
                configuration: docData.configuration || '',
                superBuiltUpArea: docData.superBuiltUpArea || 0,
                carpetArea: docData.carpetArea || 0,
                builtup: docData.builtup || 0,
                price: docData.price || 0,
                micromarket: docData.micromarket || '',
                address: docData.address || '',
                furnishStatus: docData.furnishStatus || '',
                ageOfProperty: docData.ageOfProperty || 0,
                postedOn: docData.postedOn || '',
                postedBy: docData.postedBy || '',
                url: docData.url || '',
                aboutProject: docData.aboutProject || '',
            } as RestackRentalProperty
        } else {
            return undefined
        }
    } catch (error) {
        console.error('Error patching MagicBricks rental data by ID:', error)
        return undefined
    }
}
