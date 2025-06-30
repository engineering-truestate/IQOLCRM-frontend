import { db } from '../../firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { updateDoc } from 'firebase/firestore'
import type { RestackRentalProperty } from '../../data_types/restack/restack-rental.d'

export const get99AcresRentalData = async (): Promise<RestackRentalProperty[]> => {
    const querySnapshot = await getDocs(collection(db, 'restackRental99AcresProperties'))

    const data: RestackRentalProperty[] = querySnapshot.docs.map((doc) => {
        const docData = doc.data()
        return { ...docData, propertyId: doc.id } as RestackRentalProperty
    })
    return data
}

export const getMagicBricksRentalData = async (): Promise<RestackRentalProperty[]> => {
    const querySnapshot = await getDocs(collection(db, 'restackRental99AcresProperties'))
    const data: RestackRentalProperty[] = querySnapshot.docs.map((doc) => {
        const docData = doc.data()
        return { ...docData, propertyId: doc.id } as RestackRentalProperty
    })
    return data
}

export const get99AcresRentalDataById = async (id: string): Promise<RestackRentalProperty | undefined> => {
    try {
        const docRef = doc(db, 'restackRental99AcresProperties', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data()
            return { ...docData, propertyId: docSnap.id } as RestackRentalProperty
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
            return { ...docData, propertyId: docSnap.id } as RestackRentalProperty
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
            return { ...docData, propertyId: docSnap.id } as RestackRentalProperty
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
            return { ...docData, propertyId: docSnap.id } as RestackRentalProperty
        } else {
            return undefined
        }
    } catch (error) {
        console.error('Error patching MagicBricks rental data by ID:', error)
        return undefined
    }
}

export const getACNRentalData = async (): Promise<RestackRentalProperty[]> => {
    const querySnapshot = await getDocs(collection(db, 'restackRental99AcresProperties'))

    const data: RestackRentalProperty[] = querySnapshot.docs.map((doc) => {
        const docData = doc.data()
        return { ...docData, propertyId: doc.id } as RestackRentalProperty
    })
    return data
}

export const getACNRentalDataById = async (id: string): Promise<RestackRentalProperty | undefined> => {
    try {
        const docRef = doc(db, 'restackRental99AcresProperties', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data()
            return { ...docData, propertyId: docSnap.id } as RestackRentalProperty
        } else {
            return undefined
        }
    } catch (error) {
        console.error('Error fetching 99Acres rental data by ID:', error)
        return undefined
    }
}

export const updateACNRentalDataById = async (
    id: string,
    data: Partial<RestackRentalProperty>,
): Promise<RestackRentalProperty | undefined> => {
    try {
        const docRef = doc(db, 'restackRental99AcresProperties', id)
        await updateDoc(docRef, data)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data()
            return docData as RestackRentalProperty
        } else {
            return undefined
        }
    } catch (error) {
        console.error('Error patching 99Acres rental data by ID:', error)
        return undefined
    }
}

export const getMyGateRentalData = async (): Promise<RestackRentalProperty[]> => {
    const querySnapshot = await getDocs(collection(db, 'restackRental99AcresProperties'))

    const data: RestackRentalProperty[] = querySnapshot.docs.map((doc) => {
        const docData = doc.data()
        return { ...docData, propertyId: doc.id } as RestackRentalProperty
    })
    return data
}

export const getMyGateRentalDataById = async (id: string): Promise<RestackRentalProperty | undefined> => {
    try {
        const docRef = doc(db, 'restackRental99AcresProperties', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data()
            return { ...docData, propertyId: docSnap.id } as RestackRentalProperty
        } else {
            return undefined
        }
    } catch (error) {
        console.error('Error fetching 99Acres rental data by ID:', error)
        return undefined
    }
}

export const updateMyGateRentalDataById = async (
    id: string,
    data: Partial<RestackRentalProperty>,
): Promise<RestackRentalProperty | undefined> => {
    try {
        const docRef = doc(db, 'restackRental99AcresProperties', id)
        await updateDoc(docRef, data)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data()
            return docData as RestackRentalProperty
        } else {
            return undefined
        }
    } catch (error) {
        console.error('Error patching 99Acres rental data by ID:', error)
        return undefined
    }
}

export const getHousingRentalData = async (): Promise<RestackRentalProperty[]> => {
    const querySnapshot = await getDocs(collection(db, 'restackRentalHousing'))

    const data: RestackRentalProperty[] = querySnapshot.docs.map((doc) => {
        const docData = doc.data()
        return { ...docData, propertyId: doc.id } as RestackRentalProperty
    })
    return data
}

export const getHousingRentalDataById = async (id: string): Promise<RestackRentalProperty | undefined> => {
    try {
        const docRef = doc(db, 'restackRentalHousing', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data()
            return { ...docData, propertyId: docSnap.id } as RestackRentalProperty
        } else {
            return undefined
        }
    } catch (error) {
        console.error('Error fetching 99Acres rental data by ID:', error)
        return undefined
    }
}

export const updateHousingRentalDataById = async (
    id: string,
    data: Partial<RestackRentalProperty>,
): Promise<RestackRentalProperty | undefined> => {
    try {
        const docRef = doc(db, 'restackRentalHousing', id)
        await updateDoc(docRef, data)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docData = docSnap.data()
            return docData as RestackRentalProperty
        } else {
            return undefined
        }
    } catch (error) {
        console.error('Error patching 99Acres rental data by ID:', error)
        return undefined
    }
}
