import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    limit,
    orderBy,
    where,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { Task } from './types'

class TaskService {
    private collectionName = 'canvashomesTasks'

    async getById(taskId: string): Promise<Task | null> {
        try {
            const taskDoc = await getDoc(doc(db, this.collectionName, taskId))
            if (taskDoc.exists()) {
                return { taskId, ...taskDoc.data() } as Task
            }
            return null
        } catch (error) {
            console.error('Error fetching task:', error)
            throw error
        }
    }

    async getByEnquiryId(enquiryId: string): Promise<Task[]> {
        try {
            const q = query(collection(db, this.collectionName), where('enquiryId', '==', enquiryId))
            const querySnapshot = await getDocs(q)

            const tasks = querySnapshot.docs
                .map(
                    (doc) =>
                        ({
                            taskId: doc.id,
                            ...doc.data(),
                        }) as Task,
                )
                .sort((a, b) => {
                    const aDate = a.scheduledDate?.toMillis?.() ?? 0
                    const bDate = b.scheduledDate?.toMillis?.() ?? 0
                    return aDate - bDate // Ascending
                })

            return tasks
        } catch (error) {
            console.error('Error fetching tasks by enquiry ID:', error)
            throw error
        }
    }

    async getByAgentId(
        agentId: string,
        filters?: {
            status?: 'open' | 'complete'
            type?: string
        },
    ): Promise<Task[]> {
        try {
            let q = query(collection(db, this.collectionName), where('agentId', '==', agentId))

            if (filters?.status) {
                q = query(q, where('status', '==', filters.status))
            }
            if (filters?.type) {
                q = query(q, where('type', '==', filters.type))
            }

            const querySnapshot = await getDocs(q)
            const tasks = querySnapshot.docs
                .map((doc) => ({ taskId: doc.id, ...doc.data() }) as Task)
                .sort((a, b) => {
                    const aDate = a.scheduledDate?.toMillis?.() ?? 0
                    const bDate = b.scheduledDate?.toMillis?.() ?? 0
                    return aDate - bDate
                })

            return tasks
        } catch (error) {
            console.error('Error fetching tasks by agent ID:', error)
            throw error
        }
    }

    async create(taskData: Omit<Task, 'taskId' | 'added' | 'lastModified'>): Promise<string> {
        try {
            const q = query(collection(db, this.collectionName), orderBy('taskId', 'desc'), limit(1))
            const snapshot = await getDocs(q)

            let nextTaskId = 'task001'
            if (!snapshot.empty) {
                const lastTaskId = snapshot.docs[0].data().taskId
                const lastNumber = parseInt(lastTaskId.replace('task', ''))
                const newNumber = lastNumber + 1
                nextTaskId = `task${newNumber.toString().padStart(3, '0')}`
            }

            const newTask = {
                ...taskData,
                taskId: nextTaskId,
                taskResult: taskData.taskResult || null,
                added: Date.now(),
                lastModified: Date.now(),
            }

            await setDoc(doc(db, this.collectionName, nextTaskId), newTask)
            return nextTaskId
        } catch (error) {
            console.error('Error creating task:', error)
            throw error
        }
    }

    async updateStatus(taskId: string, status: 'open' | 'complete', taskResult?: string): Promise<void> {
        try {
            const updateData: any = {
                status,
                lastModified: Date.now(),
            }

            if (status === 'complete') {
                updateData.completionDate = Date.now()
                if (taskResult) {
                    updateData.taskResult = taskResult
                }
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
                lastModified: Date.now(),
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
}

export const taskService = new TaskService()
