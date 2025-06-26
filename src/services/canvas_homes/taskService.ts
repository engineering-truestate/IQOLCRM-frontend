import {
    collection,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    limit,
    orderBy,
    where,
    runTransaction,
    increment,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { Task } from './types'
import { getUnixDateTime } from '../../components/helper/getUnixDateTime'

class TaskService {
    private collectionName = 'canvashomesTasks'

    async getById(taskId: string): Promise<Task | null> {
        try {
            const taskDoc = await getDoc(doc(db, this.collectionName, taskId))
            return taskDoc.exists() ? ({ taskId, ...taskDoc.data() } as Task) : null
        } catch (error) {
            console.error('Error fetching task:', error)
            throw error
        }
    }

    async getByEnquiryId(enquiryId: string): Promise<Task[]> {
        try {
            const q = query(collection(db, this.collectionName), where('enquiryId', '==', enquiryId))
            const querySnapshot = await getDocs(q)

            return querySnapshot.docs
                .map((doc) => ({ taskId: doc.id, ...doc.data() }) as Task)
                .sort((a, b) => (a.scheduledDate ?? 0) - (b.scheduledDate ?? 0))
        } catch (error) {
            console.error('Error fetching tasks by enquiry ID:', error)
            throw error
        }
    }

    async create(taskData: Omit<Task, 'taskId' | 'added' | 'lastModified'>): Promise<string> {
        try {
            const counterRef = doc(db, 'canvashomesAdmin', 'lastTask')

            const nextTaskId = await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef)
                let currentNumber = 0

                if (counterDoc.exists()) {
                    currentNumber = counterDoc.data().count || 0
                }

                const newTaskNumber = currentNumber + 1
                const newTaskId = `task${newTaskNumber}`
                const timestamp = getUnixDateTime()

                const newTask = {
                    ...taskData,
                    taskId: newTaskId,
                    added: timestamp,
                    lastModified: timestamp,
                }

                // Save new task
                transaction.set(doc(db, this.collectionName, newTaskId), newTask)

                // Update the count
                transaction.update(counterRef, {
                    count: increment(1),
                })

                return newTaskId
            })

            return nextTaskId
        } catch (error) {
            console.error('Error creating task:', error)
            throw error
        }
    }

    async updateStatus(taskId: string, status: 'open' | 'complete', _taskResult?: string): Promise<void> {
        try {
            const timestamp = getUnixDateTime()
            const updateData: Partial<Task> = {
                status,
                lastModified: timestamp,
            }

            if (status === 'complete') {
                updateData.completionDate = timestamp
            }

            await updateDoc(doc(db, this.collectionName, taskId), updateData)
        } catch (error) {
            console.error('Error updating task status:', error)
            throw error
        }
    }

    async update(taskId: string, updates: Partial<Task>): Promise<void> {
        try {
            const updateData = {
                ...updates,
                lastModified: getUnixDateTime(),
            }
            await updateDoc(doc(db, this.collectionName, taskId), updateData)
        } catch (error) {
            console.error('Error updating task:', error)
            throw error
        }
    }

    async delete(taskId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, this.collectionName, taskId))
        } catch (error) {
            console.error('Error deleting task:', error)
            throw error
        }
    }
    async getEarliestTaskByLeadId(leadId: string): Promise<Task | null> {
        try {
            const q = query(
                collection(db, this.collectionName),
                where('leadId', '==', leadId),
                where('scheduledDate', '!=', null),
                where('status', '==', 'open'),
                orderBy('scheduledDate', 'asc'),
                limit(1),
            )
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                return null
            }

            const docSnap = snapshot.docs[0]
            return { taskId: docSnap.id, ...docSnap.data() } as Task
        } catch (error) {
            console.error('Error fetching earliest task by lead ID:', error)
            throw error
        }
    }
}

export const taskService = new TaskService()
