import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    limit,
    query,
    orderBy,
    deleteDoc,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { User } from './types'
import { getUnixDateTime } from '../../components/helper/getUnixDateTime'

class UserService {
    private collectionName = 'canvashomesUsers'

    async getById(userId: string): Promise<User | null> {
        try {
            const userDoc = await getDoc(doc(db, this.collectionName, userId))
            return userDoc.exists() ? ({ userId, ...userDoc.data() } as User) : null
        } catch (error) {
            console.error('Error fetching user:', error)
            throw error
        }
    }

    async getAll(): Promise<User[]> {
        try {
            const q = query(collection(db, this.collectionName), orderBy('added', 'desc'))
            const snapshot = await getDocs(q)

            return snapshot.docs.map((doc) => ({
                userId: doc.id,
                ...doc.data(),
            })) as User[]
        } catch (error) {
            console.error('Error fetching users:', error)
            throw error
        }
    }

    async create(userData: Omit<User, 'userId' | 'added' | 'lastModified'>): Promise<string> {
        try {
            const q = query(collection(db, this.collectionName), orderBy('userId', 'desc'), limit(1))
            const snapshot = await getDocs(q)

            let nextUserId = 'user01'
            if (!snapshot.empty) {
                const lastUserId = snapshot.docs[0].data().userId
                const newNumber = parseInt(lastUserId.replace('user', '')) + 1
                nextUserId = `user${newNumber.toString().padStart(2, '0')}`
            }

            const timestamp = getUnixDateTime()
            const newUser = {
                ...userData,
                userId: nextUserId,
                added: timestamp,
                lastModified: timestamp,
            }

            await setDoc(doc(db, this.collectionName, nextUserId), newUser)
            return nextUserId
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    }

    async update(userId: string, updates: Partial<User>): Promise<void> {
        try {
            const updateData = {
                ...updates,
                lastModified: getUnixDateTime(),
            }

            await updateDoc(doc(db, this.collectionName, userId), updateData)
        } catch (error) {
            console.error('Error updating user:', error)
            throw error
        }
    }

    async delete(userId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, this.collectionName, userId))
        } catch (error) {
            console.error('Error deleting user:', error)
            throw error
        }
    }
}

export const userService = new UserService()
