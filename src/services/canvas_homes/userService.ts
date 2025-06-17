import { collection, doc, getDocs, getDoc, setDoc, updateDoc, limit, query, orderBy } from 'firebase/firestore'
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
            const q = query(collection(db, this.collectionName), orderBy('userId', 'desc'), limit(1))
            const snapshot = await getDocs(q)
            let nextUserId = 'user001'
            if (!snapshot.empty) {
                // Retrieve the last lead's ID and parse the number from it
                const lastUserId = snapshot.docs[0].data().userId
                const lastNumber = parseInt(lastUserId.replace('user', '')) // Remove 'lead' and convert to integer
                const newNumber = lastNumber + 1 // Increment the last number
                nextUserId = `user${newNumber.toString().padStart(3, '0')}` // Generate the next leadId with padding
            }
            const newUser = {
                ...userData,
                userId: nextUserId,
                added: Date.now(),
                lastModified: Date.now(),
            }
            await setDoc(doc(db, this.collectionName, nextUserId), newUser)

            return nextUserId // Return the generated leadId
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
