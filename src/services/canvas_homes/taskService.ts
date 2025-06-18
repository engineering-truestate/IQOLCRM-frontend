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

    /**
     * Fetch a single task by its ID.
     */
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

    /**
     * Get all tasks associated with a specific enquiry, sorted by scheduledDate.
     */
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
                    return aDate - bDate // Sort by date ascending
                })

            return tasks
        } catch (error) {
            console.error('Error fetching tasks by enquiry ID:', error)
            throw error
        }
    }

    /**
     * Get all tasks assigned to a specific agent with optional filtering by status and type.
     * Results are sorted by scheduledDate.
     */
    async getByAgentId(
        agentId: string,
        filters?: {
            status?: 'open' | 'complete'
            type?: string
        },
    ): Promise<Task[]> {
        try {
            let q = query(collection(db, this.collectionName), where('agentId', '==', agentId))

            // Apply filters if provided
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

    /**
     * Create a new task with an auto-incremented taskId (e.g., task001, task002).
     */
    async create(taskData: Omit<Task, 'taskId' | 'added' | 'lastModified'>): Promise<string> {
        try {
            // Fetch the last created task to determine the next taskId
            const q = query(collection(db, this.collectionName), orderBy('taskId', 'desc'), limit(1))
            const snapshot = await getDocs(q)

            let nextTaskId = 'task001'
            if (!snapshot.empty) {
                const lastTaskId = snapshot.docs[0].data().taskId
                const lastNumber = parseInt(lastTaskId.replace('task', ''))
                const newNumber = lastNumber + 1
                nextTaskId = `task${newNumber.toString().padStart(3, '0')}`
            }

            // Prepare the task object
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

    /**
     * Update only the status and optionally the result of a task.
     * Automatically updates lastModified and completionDate if completed.
     */
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

    /**
     * Generic update for a task using partial fields.
     * Automatically updates lastModified timestamp.
     */
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

    /**
     * Delete a task by its taskId.
     */
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
