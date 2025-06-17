import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import type { User } from './types'

class UserService {
    private collectionName = 'canvashomesUsers'

    async getById(userId: string): Promise<User | null> {
        try {
            const userDoc = await getDoc(doc(db, this.collectionName, userId))
            if (userDoc.exists()) {
                return { userId, ...userDoc.data() } as User
            }
            return null
        } catch (error) {
            console.error('Error fetching user:', error)
            throw error
        }
    }

    async getAll(): Promise<User[]> {
        try {
            const q = query(collection(db, this.collectionName), orderBy('added', 'desc'))
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map((doc) => ({
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
            const newUser = {
                ...userData,
                added: Date.now(),
                lastModified: Date.now(),
            }
            const docRef = await addDoc(collection(db, this.collectionName), newUser)
            return docRef.id
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    }

    async update(userId: string, updates: Partial<User>): Promise<void> {
        try {
            const updateData = {
                ...updates,
                lastModified: Date.now(),
            }
            await updateDoc(doc(db, this.collectionName, userId), updateData)
        } catch (error) {
            console.error('Error updating user:', error)
            throw error
        }
    }
}

export const userService = new UserService()
