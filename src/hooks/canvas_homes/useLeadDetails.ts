import { useState, useEffect, useCallback } from 'react'
import { leadService, enquiryService, taskService, userService } from '../../services/canvas_homes'
import type { Lead, Enquiry, Task, User } from '../../services/canvas_homes/types'

interface UseLeadDetailsReturn {
    // Data
    leadData: Lead | null
    enquiries: Enquiry[]
    currentEnquiry: Enquiry | null
    tasks: Task[]
    userData: User | null

    // UI State
    selectedEnquiryId: string | null
    activeTab: string

    // Loading States
    loading: {
        lead: boolean
        enquiries: boolean
        tasks: boolean
        user: boolean
    }

    // Error States
    errors: {
        lead: string | null
        enquiries: string | null
        tasks: string | null
        user: string | null
    }

    // Actions
    setActiveTab: (tab: string) => void
    setSelectedEnquiryId: (id: string) => void
    refreshData: () => void
    updateTaskStatus: (taskId: string, status: 'open' | 'complete', taskResult?: string) => Promise<void>
    addNote: (noteData: { agentId: string; agentName: string; TaskType: string; note: string }) => Promise<void>
    createNewTask: (taskData: any) => Promise<void>
    addActivity: (activityData: {
        agentId: string
        activityType: string
        activityStatus: string
        activityNote: string
    }) => Promise<void>
    updateEnquiry: (updates: any) => Promise<void>
    updateLead: (updates: any) => Promise<void>
}

export const useLeadDetails = (leadId: string): UseLeadDetailsReturn => {
    // State
    const [leadData, setLeadData] = useState<Lead | null>(null)
    const [enquiries, setEnquiries] = useState<Enquiry[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [userData, setUserData] = useState<User | null>(null)
    const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('Task')

    const [loading, setLoading] = useState({
        lead: false,
        enquiries: false,
        tasks: false,
        user: false,
    })

    const [errors, setErrors] = useState({
        lead: null as string | null,
        enquiries: null as string | null,
        tasks: null as string | null,
        user: null as string | null,
    })

    // Computed values
    const currentEnquiry = enquiries.find((e) => e.enquiryId === selectedEnquiryId) || null

    // Load lead data
    const loadLeadData = useCallback(async () => {
        // Validate leadId before making the call
        if (!leadId || typeof leadId !== 'string' || leadId.trim() === '') {
            console.error('Invalid leadId provided to useLeadDetails:', leadId)
            setErrors((prev) => ({ ...prev, lead: 'Invalid lead ID provided' }))
            return
        }

        setLoading((prev) => ({ ...prev, lead: true }))
        setErrors((prev) => ({ ...prev, lead: null }))

        try {
            console.log('Loading lead data for ID:', leadId)
            const lead = await leadService.getById(leadId.trim())

            if (lead) {
                setLeadData(lead)
                console.log('Lead data loaded successfully:', lead)

                // Load user data if userId exists
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
        // Validate leadId before making the call
        if (!leadId || typeof leadId !== 'string' || leadId.trim() === '') {
            console.error('Invalid leadId provided for enquiries:', leadId)
            setErrors((prev) => ({ ...prev, enquiries: 'Invalid lead ID provided' }))
            return
        }

        setLoading((prev) => ({ ...prev, enquiries: true }))
        setErrors((prev) => ({ ...prev, enquiries: null }))

        try {
            console.log('Loading enquiries for lead ID:', leadId)
            const enquiriesData = await enquiryService.getByLeadId(leadId.trim())

            setEnquiries(enquiriesData)
            console.log('Enquiries loaded successfully:', enquiriesData)

            // Set first enquiry as selected if none selected and enquiries exist
            if (enquiriesData.length > 0 && !selectedEnquiryId) {
                setSelectedEnquiryId(enquiriesData[0].enquiryId)
                console.log('Selected first enquiry:', enquiriesData[0].enquiryId)
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
        if (!selectedEnquiryId || typeof selectedEnquiryId !== 'string' || selectedEnquiryId.trim() === '') {
            console.log('No valid selectedEnquiryId, skipping task load')
            return
        }

        setLoading((prev) => ({ ...prev, tasks: true }))
        setErrors((prev) => ({ ...prev, tasks: null }))

        try {
            console.log('Loading tasks for enquiry ID:', selectedEnquiryId)
            const tasksData = await taskService.getByEnquiryId(selectedEnquiryId.trim())
            setTasks(tasksData)
            console.log('Tasks loaded successfully:', tasksData)
        } catch (error: any) {
            console.error('Error in loadTasksData:', error)
            setErrors((prev) => ({ ...prev, tasks: error.message || 'Failed to load tasks' }))
        } finally {
            setLoading((prev) => ({ ...prev, tasks: false }))
        }
    }, [selectedEnquiryId])

    // Load user data
    const loadUserData = useCallback(async (userId: string) => {
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            console.log('No valid userId provided, skipping user load')
            return
        }

        setLoading((prev) => ({ ...prev, user: true }))
        setErrors((prev) => ({ ...prev, user: null }))

        try {
            console.log('Loading user data for ID:', userId)
            const user = await userService.getById(userId.trim())
            setUserData(user)
            console.log('User data loaded successfully:', user)
        } catch (error: any) {
            console.error('Error in loadUserData:', error)
            setErrors((prev) => ({ ...prev, user: error.message || 'Failed to load user data' }))
        } finally {
            setLoading((prev) => ({ ...prev, user: false }))
        }
    }, [])

    // Actions
    const updateTaskStatus = useCallback(
        async (taskId: string, status: 'open' | 'complete', taskResult?: string) => {
            if (!taskId || typeof taskId !== 'string' || taskId.trim() === '') {
                throw new Error('Invalid taskId provided')
            }

            try {
                await taskService.updateStatus(taskId.trim(), status, taskResult)
                // Reload tasks to get updated data
                await loadTasksData()
            } catch (error: any) {
                console.error('Failed to update task status:', error)
                throw error
            }
        },
        [loadTasksData],
    )

    const addNote = useCallback(
        async (noteData: { agentId: string; agentName: string; TaskType: string; note: string }) => {
            if (!selectedEnquiryId || typeof selectedEnquiryId !== 'string' || selectedEnquiryId.trim() === '') {
                throw new Error('No valid enquiry selected')
            }

            try {
                await enquiryService.addNote(selectedEnquiryId.trim(), noteData)
                // Reload enquiries to get updated notes
                await loadEnquiriesData()
            } catch (error: any) {
                console.error('Failed to add note:', error)
                throw error
            }
        },
        [selectedEnquiryId, loadEnquiriesData],
    )

    const addActivity = useCallback(
        async (activityData: {
            agentId: string
            activityType: string
            activityStatus: string
            activityNote: string
        }) => {
            if (!selectedEnquiryId || typeof selectedEnquiryId !== 'string' || selectedEnquiryId.trim() === '') {
                throw new Error('No valid enquiry selected')
            }

            try {
                await enquiryService.addActivity(selectedEnquiryId.trim(), activityData)
                // Reload enquiries to get updated activity
                await loadEnquiriesData()
            } catch (error: any) {
                console.error('Failed to add activity:', error)
                throw error
            }
        },
        [selectedEnquiryId, loadEnquiriesData],
    )

    const createNewTask = useCallback(
        async (taskData: any) => {
            try {
                await taskService.create(taskData)
                // Reload tasks to show new task
                await loadTasksData()
            } catch (error: any) {
                console.error('Failed to create task:', error)
                throw error
            }
        },
        [loadTasksData],
    )

    const updateEnquiry = useCallback(
        async (updates: any) => {
            try {
                if (selectedEnquiryId) {
                    await enquiryService.update(selectedEnquiryId, updates)
                    refreshData() // Refresh to get updated data
                }
            } catch (error: any) {
                console.error('Failed to update enquiry:', error)
                throw error
            }
        },
        [selectedEnquiryId],
    )

    const updateLead = useCallback(
        async (updates: any) => {
            try {
                if (leadId) {
                    await leadService.update(leadId, updates)
                    refreshData() // Refresh to get updated data
                }
            } catch (error: any) {
                console.error('Failed to update lead:', error)
                throw error
            }
        },
        [leadId],
    )

    const refreshData = useCallback(() => {
        if (leadId && typeof leadId === 'string' && leadId.trim() !== '') {
            loadLeadData()
            loadEnquiriesData()
            if (selectedEnquiryId) {
                loadTasksData()
            }
        }
    }, [loadLeadData, loadEnquiriesData, loadTasksData, leadId, selectedEnquiryId])

    // Effects
    useEffect(() => {
        console.log('useLeadDetails effect triggered with leadId:', leadId)
        console.log(leadId)
        if (leadId && typeof leadId === 'string' && leadId.trim() !== '') {
            loadLeadData()
            loadEnquiriesData()
        } else {
            console.error('Invalid leadId in useEffect:', leadId)
            setErrors((prev) => ({ ...prev, lead: 'Invalid lead ID provided' }))
        }
    }, [leadId]) // Remove other dependencies to prevent loops

    useEffect(() => {
        if (selectedEnquiryId && typeof selectedEnquiryId === 'string' && selectedEnquiryId.trim() !== '') {
            loadTasksData()
        }
    }, [selectedEnquiryId]) // Only depend on selectedEnquiryId

    return {
        // Data
        leadData,
        enquiries,
        currentEnquiry,
        tasks,
        userData,

        // UI State
        selectedEnquiryId,
        activeTab,

        // Loading States
        loading,

        // Error States
        errors,

        // Actions
        setActiveTab,
        setSelectedEnquiryId,
        refreshData,
        updateTaskStatus,
        addNote,
        createNewTask,
        addActivity,
        // ADD THESE LINES:
        updateEnquiry,
        updateLead,
    }
}
