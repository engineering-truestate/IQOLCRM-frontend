import {
    collection,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    query,
    orderBy,
    deleteDoc,
    runTransaction,
    increment,
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
            const counterRef = doc(db, 'canvashomesAdmin', 'lastUser')

            const nextUserId = await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef)
                let currentCount = 0

                if (counterDoc.exists()) {
                    currentCount = counterDoc.data().count || 0
                }

                const newCount = currentCount + 1
                const newUserId = `user${newCount.toString().padStart(3, '0')}`

                const timestamp = getUnixDateTime()
                const newUser = {
                    ...userData,
                    userId: newUserId,
                    added: timestamp,
                    lastModified: timestamp,
                }

                transaction.set(doc(db, this.collectionName, newUserId), newUser)
                transaction.update(counterRef, {
                    count: increment(1),
                })

                return newUserId
            })

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
            console.log(`User ${userId} deleted successfully`)
        } catch (error) {
            console.error('Error deleting user:', error)
            throw error
        }
    }
}

export const userService = new UserService()
