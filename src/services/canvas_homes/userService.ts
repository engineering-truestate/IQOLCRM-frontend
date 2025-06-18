import { collection, doc, getDocs, getDoc, setDoc, updateDoc, limit, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import type { User } from './types'

class UserService {
    private collectionName = 'canvashomesUsers' // Firestore collection name

    /**
     * Fetch a user by their userId.
     * Returns null if user doesn't exist.
     */
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

    /**
     * Get all users sorted by most recently added.
     */
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

    /**
     * Create a new user with auto-incremented userId (e.g., user001, user002).
     * Adds timestamps for `added` and `lastModified`.
     */
    async create(userData: Omit<User, 'userId' | 'added' | 'lastModified'>): Promise<string> {
        try {
            // Get the last user by descending userId to generate next ID
            const q = query(collection(db, this.collectionName), orderBy('userId', 'desc'), limit(1))
            const snapshot = await getDocs(q)

            let nextUserId = 'user001'
            if (!snapshot.empty) {
                const lastUserId = snapshot.docs[0].data().userId
                const lastNumber = parseInt(lastUserId.replace('user', ''))
                const newNumber = lastNumber + 1
                nextUserId = `user${newNumber.toString().padStart(3, '0')}`
            }

            const newUser = {
                ...userData,
                userId: nextUserId,
                added: Date.now(),
                lastModified: Date.now(),
            }

            await setDoc(doc(db, this.collectionName, nextUserId), newUser)

            return nextUserId
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    }

    /**
     * Update existing user data with partial updates.
     * Also updates `lastModified` timestamp.
     */
    async update(userId: string, updates: Partial<User>): Promise<void> {
        try {
            if (!userId || typeof userId !== 'string' || userId.trim() === '') {
                throw new Error('Invalid userId provided for update')
            }

            const updateData = {
                ...updates,
                lastModified: Date.now(),
            }

            await updateDoc(doc(db, this.collectionName, userId.trim()), updateData)
        } catch (error) {
            console.error('Error updating lead:', error)
            throw error
        }
    }
}

export const userService = new UserService()
