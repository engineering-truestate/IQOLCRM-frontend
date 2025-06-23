import { useState, useEffect, useCallback } from 'react'
import { leadService, enquiryService, taskService, userService } from '../../services/canvas_homes'
import type { Lead, Enquiry, Task, User, ActivityHistoryItem } from '../../services/canvas_homes/types'

export const UseLeadDetails = (leadId: string) => {
    // State
    const [leadData, setLeadData] = useState<Lead | null>(null)
    const [enquiries, setEnquiries] = useState<Enquiry[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [userData, setUserData] = useState<User | null>(null)
    const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>('Task')

    const [loading, setLoading] = useState({
        lead: false,
        enquiries: false,
        tasks: false,
        user: false,
        activities: false,
    })

    const [errors, setErrors] = useState({
        lead: null as string | null,
        enquiries: null as string | null,
        tasks: null as string | null,
        user: null as string | null,
        activities: null as string | null,
    })

    // Computed values
    const currentEnquiry = enquiries.find((e) => e.enquiryId === selectedEnquiryId) || null

    // Load lead data
    const loadLeadData = useCallback(async () => {
        if (!leadId) {
            console.error('Invalid leadId provided to UseLeadDetails:', leadId)
            setErrors((prev) => ({ ...prev, lead: 'Invalid lead ID provided' }))
            return
        }

        setLoading((prev) => ({ ...prev, lead: true }))
        setErrors((prev) => ({ ...prev, lead: null }))

        try {
            const lead = await leadService.getById(leadId.trim())
            if (lead) {
                setLeadData(lead)
                if (lead.userId) {
                    loadUserData(lead.userId)
                }
            } else {
                setErrors((prev) => ({ ...prev, lead: 'Lead not found' }))
            }
        } catch (error: any) {
            console.error('Error in loadLeadData:', error)
            setErrors((prev) => ({ ...prev, lead: error.message || 'Failed to load lead data' }))
        } finally {
            setLoading((prev) => ({ ...prev, lead: false }))
        }
    }, [leadId])

    // Load enquiries data
    const loadEnquiriesData = useCallback(async () => {
        if (!leadId) {
            console.error('Invalid leadId provided for enquiries:', leadId)
            setErrors((prev) => ({ ...prev, enquiries: 'Invalid lead ID provided' }))
            return
        }

        setLoading((prev) => ({ ...prev, enquiries: true }))
        setErrors((prev) => ({ ...prev, enquiries: null }))

        try {
            const enquiriesData = await enquiryService.getByLeadId(leadId.trim())
            setEnquiries(enquiriesData)

            if (enquiriesData.length > 0 && !selectedEnquiryId) {
                setSelectedEnquiryId(enquiriesData[0].enquiryId)
            }
        } catch (error: any) {
            console.error('Error in loadEnquiriesData:', error)
            setErrors((prev) => ({ ...prev, enquiries: error.message || 'Failed to load enquiries' }))
        } finally {
            setLoading((prev) => ({ ...prev, enquiries: false }))
        }
    }, [leadId, selectedEnquiryId])

    // Load tasks data
    const loadTasksData = useCallback(async () => {
        if (!selectedEnquiryId) return

        setLoading((prev) => ({ ...prev, tasks: true }))
        setErrors((prev) => ({ ...prev, tasks: null }))

        try {
            const tasksData = await taskService.getByEnquiryId(selectedEnquiryId.trim())
            setTasks(tasksData)
        } catch (error: any) {
            console.error('Error in loadTasksData:', error)
            setErrors((prev) => ({ ...prev, tasks: error.message || 'Failed to load tasks' }))
        } finally {
            setLoading((prev) => ({ ...prev, tasks: false }))
        }
    }, [selectedEnquiryId])

    // Load user data
    const loadUserData = useCallback(async (userId: string) => {
        if (!userId) return

        setLoading((prev) => ({ ...prev, user: true }))
        setErrors((prev) => ({ ...prev, user: null }))

        try {
            const user = await userService.getById(userId.trim())
            setUserData(user)
        } catch (error: any) {
            console.error('Error in loadUserData:', error)
            setErrors((prev) => ({ ...prev, user: error.message || 'Failed to load user data' }))
        } finally {
            setLoading((prev) => ({ ...prev, user: false }))
        }
    }, [])

    // Actions
    const updateTaskStatus = useCallback(
        async (taskId: string, status: string, taskResult?: any) => {
            if (!taskId) throw new Error('Invalid taskId provided')
            try {
                await taskService.updateStatus(taskId.trim(), status, taskResult)
                await loadTasksData()
            } catch (error) {
                console.error('Failed to update task status:', error)
                throw error
            }
        },
        [loadTasksData],
    )

    const addNote = useCallback(
        async (noteData: { agentId: string; agentName: string; taskType: string; note: string }) => {
            if (!selectedEnquiryId) throw new Error('No valid enquiry selected')
            try {
                await enquiryService.addNote(selectedEnquiryId.trim(), noteData)
                await loadEnquiriesData()
            } catch (error) {
                console.error('Failed to add note:', error)
                throw error
            }
        },
        [selectedEnquiryId, loadEnquiriesData],
    )

    const addActivity = useCallback(
        async (activityData: { activityType: string; agentName: string; data: Record<string, any> }) => {
            if (!selectedEnquiryId) throw new Error('No valid enquiry selected')
            try {
                await enquiryService.addActivity(selectedEnquiryId.trim(), activityData)
                await loadEnquiriesData()
            } catch (error) {
                console.error('Failed to add activity:', error)
                throw error
            }
        },
        [selectedEnquiryId, loadEnquiriesData],
    )

    // New activity history methods
    const getActivityHistory = useCallback(async (): Promise<ActivityHistoryItem[]> => {
        if (!selectedEnquiryId) return []

        setLoading((prev) => ({ ...prev, activities: true }))
        setErrors((prev) => ({ ...prev, activities: null }))

        try {
            const activities = await enquiryService.getActivityHistory(selectedEnquiryId.trim())
            return activities
        } catch (error: any) {
            console.error('Failed to get activity history:', error)
            setErrors((prev) => ({ ...prev, activities: error.message || 'Failed to load activity history' }))
            throw error
        } finally {
            setLoading((prev) => ({ ...prev, activities: false }))
        }
    }, [selectedEnquiryId])

    const getActivityByType = useCallback(
        async (activityType: string): Promise<ActivityHistoryItem[]> => {
            if (!selectedEnquiryId) return []

            try {
                const activities = await enquiryService.getActivityByType(selectedEnquiryId.trim(), activityType)
                return activities
            } catch (error) {
                console.error('Failed to get activity by type:', error)
                throw error
            }
        },
        [selectedEnquiryId],
    )

    const createNewTask = useCallback(
        async (taskData: Omit<Task, 'taskId' | 'added' | 'lastModified'>) => {
            try {
                await taskService.create(taskData)
                await loadTasksData()
            } catch (error) {
                console.error('Failed to create task:', error)
                throw error
            }
        },
        [loadTasksData],
    )

    const updateEnquiry = useCallback(
        async (updates: Partial<Enquiry>) => {
            try {
                if (selectedEnquiryId) {
                    await enquiryService.update(selectedEnquiryId, updates)
                }
            } catch (error) {
                console.error('Failed to update enquiry:', error)
                throw error
            }
        },
        [selectedEnquiryId],
    )

    const updateLead = useCallback(
        async (updates: Partial<Lead>) => {
            try {
                if (leadId) {
                    await leadService.update(leadId, updates)
                }
            } catch (error) {
                console.error('Failed to update lead:', error)
                throw error
            }
        },
        [leadId],
    )

    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        try {
            if (taskId) {
                await taskService.update(taskId, updates)
            }
        } catch (error) {
            console.error('Failed to update task:', error)
            throw error
        }
    }, [])

    const refreshData = useCallback(() => {
        if (leadId) {
            loadLeadData()
            loadEnquiriesData()
            if (selectedEnquiryId) {
                loadTasksData()
            }
        }
    }, [loadLeadData, loadEnquiriesData, loadTasksData, leadId, selectedEnquiryId])

    // Real-time subscription for activity history
    const subscribeToActivityHistory = useCallback(
        (callback: (activities: ActivityHistoryItem[]) => void) => {
            if (!selectedEnquiryId) {
                callback([])
                return () => {}
            }

            return enquiryService.subscribeToActivityHistory(selectedEnquiryId.trim(), callback)
        },
        [selectedEnquiryId],
    )

    // Effects
    useEffect(() => {
        if (leadId) {
            loadLeadData()
            loadEnquiriesData()
        } else {
            setErrors((prev) => ({ ...prev, lead: 'Invalid lead ID provided' }))
        }
    }, [leadId])

    useEffect(() => {
        if (selectedEnquiryId) {
            loadTasksData()
        }
    }, [selectedEnquiryId])

    return {
        // Data
        leadData,
        enquiries,
        currentEnquiry,
        tasks,
        userData,

        // State
        selectedEnquiryId,
        activeTab,
        loading,
        errors,

        // Setters
        setActiveTab,
        setSelectedEnquiryId,

        // Actions
        refreshData,
        updateTaskStatus,
        addNote,
        addActivity,
        createNewTask,
        updateEnquiry,
        updateLead,
        updateTask,

        // Activity History Methods
        getActivityHistory,
        getActivityByType,
        subscribeToActivityHistory,
    }
}
