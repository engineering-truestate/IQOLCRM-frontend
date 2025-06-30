import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { useParams } from 'react-router'
import useAuth from '../../hooks/useAuth'
import { toast } from 'react-toastify'
import { getUnixDateTime } from '../helper/getUnixDateTime'
import { UseLeadDetails } from '../../hooks/canvas_homes/useLeadDetails'
import { taskService } from '../../services/canvas_homes/taskService'
import { leadService } from '../../services/canvas_homes/leadService'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
// import { useNavigate } from 'react-router'
import Dropdown from '../design-elements/Dropdown'
import { toCapitalizedWords } from '../helper/toCapitalize'

interface CloseLeadModalProps {
    isOpen: boolean
    onClose: () => void
    taskState?: string | null
    taskType: string
    refreshData: () => void
}

const CloseLeadModal: React.FC<CloseLeadModalProps> = ({ isOpen, onClose, taskState, taskType, refreshData }) => {
    const taskIds: string = useSelector((state: RootState) => state.taskId.taskId || '')
    const enquiryId: string = useSelector((state: RootState) => state.taskId.enquiryId || '')
    const { user } = useAuth()
    const { leadId } = useParams()
    const { leadData } = UseLeadDetails(leadId || '')
    // const navigate = useNavigate()

    const agentId = user?.uid || ''
    const agentName = user?.displayName || ''
    const currentTimestamp = getUnixDateTime()

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        reason: '',
        tag: leadData?.tag || '',
        note: '',
        status: 'Complete',
        state: 'dropped',
        leadStatus: 'not connected',
        stage: '',
        taskId: taskIds,
        agentId: agentId,
        agentName: agentName,
        timestamp: currentTimestamp,
    })

    // Set lead status based on taskState when modal opens
    useEffect(() => {
        if (isOpen && taskState) {
            let leadStatus = 'not connected'
            let stage = ''

            // Determine appropriate lead status based on task state
            switch (taskState) {
                case 'connected':
                    leadStatus = 'not interested'
                    stage = 'initial contacted'
                    break
                case 'not connected':
                    leadStatus = 'not connected'
                    stage = leadData?.stage || ''
                    break
                case 'visited':
                    leadStatus = 'visit unsuccessful'
                    stage = 'site visited'
                    break
                case 'not visited':
                    leadStatus = 'visit dropped'
                    stage = leadData?.stage || ''
                    break
                case 'eoi not collected':
                    leadStatus = 'eoi dropped'
                    stage = leadData?.stage || ''
                    break
                case 'booking unsuccessful':
                    leadStatus = 'booking dropped'
                    stage = leadData?.stage || ''
                    break
                default:
                    leadStatus = 'not connected'
            }

            setFormData((prev) => ({
                ...prev,
                leadStatus,
                stage,
                tag: leadData?.tag || prev.tag, // Ensure tag is set from leadData
                timestamp: getUnixDateTime(),
            }))
        }
    }, [isOpen, taskState, taskIds, agentId, agentName, leadData])
    const reasonOptions = [
        // { value: '', label: 'Select reason' },
        { value: 'incorrect contact details', label: 'Incorrect Contact Details' },
        { value: 'no response after multiple follow ups', label: 'No Response After Multiple Follow-Ups' },
        { value: 'not interested', label: 'Not Interested' },
        { value: 'property not suitable', label: 'Property Not Suitable' },
        { value: 'visit dropped', label: 'Visit Dropped' },
        { value: 'eoi dropped', label: 'EOI Dropped' },
        { value: 'booking dropped', label: 'Booking Dropped' },
        { value: 'other', label: 'Other' },
    ]

    // const taskStatusOptions = [{ value: 'Complete', label: 'Complete' }]

    const tagOptions = [
        { value: 'cold', label: 'Cold' },
        { value: 'hot', label: 'Hot' },
        { value: 'super hot', label: 'Super Hot' },
        { value: 'potential', label: 'Potential' },
    ]

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }
    const handleSubmit = async () => {
        if (!formData.reason || !formData.tag) {
            toast.error('Please fill in all required fields.')
            return
        }

        setIsLoading(true)

        try {
            const currentTimestamp = getUnixDateTime()

            if (taskIds && enquiryId && leadId) {
                // First, get all open enquiries for this lead
                const openEnquiries = await enquiryService.getByLeadId(leadId)

                // Filter out the current enquiry that we're closing
                const remainingOpenEnquiries = openEnquiries.filter(
                    (enq) => enq.enquiryId !== enquiryId && enq.state === 'open',
                )

                const enqData = {
                    state: 'dropped' as 'open' | 'closed' | 'fresh' | 'dropped' | null,
                    stage: formData.stage,
                    leadStatus: formData.leadStatus,
                    tag: formData.tag,
                    lastModified: currentTimestamp,
                    rnr: false,
                    rnrCount: 0,
                }

                const addLeadClosedActivity = enquiryService.addActivity(enquiryId, {
                    activityType: 'lead closed',
                    timestamp: currentTimestamp,
                    agentName: agentName,
                    data: { reason: formData.reason },
                })

                const addTaskExecutionActivity = enquiryService.addActivity(enquiryId, {
                    activityType: 'task execution',
                    timestamp: currentTimestamp,
                    agentName: agentName,
                    data: {
                        reason: formData.reason,
                        note: formData.note,
                        taskType: taskType,
                        leadStatus: formData.leadStatus,
                        tag: leadData?.tag !== formData.tag ? [leadData?.tag, formData.tag] : [formData.tag],
                    },
                })

                const addNotePromise = formData.note
                    ? enquiryService.addNote(enquiryId, {
                          note: formData.note,
                          timestamp: currentTimestamp,
                          agentName: agentName,
                          agentId: agentId,
                          taskType: taskType,
                      })
                    : Promise.resolve()

                let updateLeadData
                let shouldUpdateLead = false

                // Check if there are remaining open enquiries
                if (remainingOpenEnquiries.length > 0) {
                    // Find the most recently modified open enquiry
                    const mostRecentEnquiry = remainingOpenEnquiries.sort(
                        (a, b) => (b.lastModified || 0) - (a.lastModified || 0),
                    )[0]

                    // Get open tasks for the most recent enquiry
                    const openTasksForRecentEnquiry = await taskService.getOpenByEnquiryId(
                        mostRecentEnquiry.enquiryId || '',
                    )
                    const remainingOpenTasks = openTasksForRecentEnquiry.filter((task) => task.taskId !== taskIds)

                    if (remainingOpenTasks.length > 0) {
                        // Find the earliest scheduled task for this enquiry
                        const earliestTask = remainingOpenTasks[0]

                        updateLeadData = {
                            state: mostRecentEnquiry.state,
                            stage: mostRecentEnquiry.stage,
                            leadStatus: mostRecentEnquiry.leadStatus as any,
                            propertyName: mostRecentEnquiry.propertyName,
                            rnr: mostRecentEnquiry?.rnr,
                            rnrCount: mostRecentEnquiry.rnrCount,
                            tag: mostRecentEnquiry.tag,
                            taskType: earliestTask.taskType,
                            scheduledDate: earliestTask.scheduledDate,
                            lastModified: currentTimestamp,
                        }
                        shouldUpdateLead = true
                    } else {
                        // Recent enquiry exists but no open tasks
                        updateLeadData = {
                            state: mostRecentEnquiry.state || 'open',
                            stage: mostRecentEnquiry.stage,
                            leadStatus: mostRecentEnquiry.leadStatus as any,
                            propertyName: mostRecentEnquiry.propertyName,
                            tag: mostRecentEnquiry.tag,
                            taskType: null,
                            scheduledDate: null,
                            rnr: false,
                            rnrCount: 0,
                            lastModified: currentTimestamp,
                        }
                        shouldUpdateLead = true
                    }
                } else {
                    const openTasksForRecentEnquiry = await taskService.getOpenByEnquiryId(enquiryId || '')
                    const remainingOpenTasks = openTasksForRecentEnquiry.filter((task) => task.taskId !== taskIds)

                    if (remainingOpenTasks.length > 0) {
                        // Find the earliest scheduled task for this enquiry
                        const earliestTask = remainingOpenTasks[0]

                        updateLeadData = {
                            state: 'dropped',
                            stage: formData.stage,
                            leadStatus: formData.leadStatus as any,
                            completionDate: currentTimestamp,
                            tag: formData.tag,
                            rnr: false,
                            rnrCount: 0,
                            scheduledDate: earliestTask.scheduledDate,
                            taskType: earliestTask.taskType,
                            lastModified: currentTimestamp,
                        }
                        shouldUpdateLead = true
                    } else {
                        // Recent enquiry exists but no open tasks
                        updateLeadData = {
                            state: 'dropped',
                            stage: formData.stage,
                            leadStatus: formData.leadStatus as any,
                            completionDate: currentTimestamp,
                            tag: formData.tag,
                            rnr: false,
                            rnrCount: 0,
                            scheduledDate: null,
                            taskType: null,
                            lastModified: currentTimestamp,
                        }
                        shouldUpdateLead = true
                    }
                    shouldUpdateLead = true
                }

                const updateTaskStatus = taskService.update(taskIds, {
                    status: 'complete',
                    completionDate: currentTimestamp,
                })

                const enquiryUpdatePromise = enquiryService.update(enquiryId, enqData)

                // Only update lead if we determined we should
                const promises = [
                    enquiryUpdatePromise,
                    updateTaskStatus,
                    addLeadClosedActivity,
                    addTaskExecutionActivity,
                    addNotePromise,
                ]

                if (shouldUpdateLead) {
                    const leadUpdatePromise = leadService.update(leadId, updateLeadData)
                    promises.push(leadUpdatePromise)
                }

                await Promise.all(promises)

                await refreshData()

                toast.success('Lead closed successfully')
                onClose()

                setFormData({
                    reason: '',
                    status: 'Complete',
                    leadStatus: 'not connected',
                    tag: leadData?.tag || '',
                    state: 'dropped',
                    note: '',
                    stage: '',
                    taskId: taskIds,
                    agentId: agentId,
                    agentName: agentName,
                    timestamp: currentTimestamp,
                })
            } else {
                toast.error('Required IDs are missing')
            }
        } catch (error: any) {
            console.error('Error closing lead:', error)
            toast.error(error.message || 'Failed to close lead')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        if (isLoading) return // Prevent closing while loading

        setFormData({
            reason: '',
            status: 'Complete',
            leadStatus: 'not connected',
            tag: 'cold',
            state: 'dropped',
            note: '',
            stage: '',
            taskId: taskIds,
            agentId: agentId,
            agentName: agentName,
            timestamp: currentTimestamp,
        })
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed inset-0 bg-black opacity-66 z-40' onClick={!isLoading ? onClose : undefined} />

            {/* Modal Container */}
            <div
                className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[589px] bg-white z-50 rounded-2xl shadow-2xl'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6'>
                        <h2 className='text-xl font-semibold text-gray-900'>Close Lead</h2>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className='p-1 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50'
                        >
                            <svg
                                width='20'
                                height='21'
                                viewBox='0 0 20 21'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M10.0013 18.8337C14.5846 18.8337 18.3346 15.0837 18.3346 10.5003C18.3346 5.91699 14.5846 2.16699 10.0013 2.16699C5.41797 2.16699 1.66797 5.91699 1.66797 10.5003C1.66797 15.0837 5.41797 18.8337 10.0013 18.8337Z'
                                    stroke='#515162'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M7.64062 12.8583L12.3573 8.1416'
                                    stroke='#515162'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M12.3573 12.8583L7.64062 8.1416'
                                    stroke='#515162'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className='px-6 pt-0'>
                        <div className='space-y-4'>
                            {/* Reason Dropdown */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Reason<span className='text-red-500'> *</span>
                                </label>
                                <Dropdown
                                    options={reasonOptions}
                                    onSelect={(value) => handleInputChange('reason', value)}
                                    defaultValue={formData.reason}
                                    placeholder='Select reason'
                                    className='w-full relative inline-block'
                                    triggerClassName={`relative w-full h-8 px-3 py-2.5 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                        formData.reason ? '[&>span]:text-black' : ''
                                    }`}
                                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                    optionClassName='px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Status and Tag Fields */}
                            <div className='grid grid-cols-3 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Task Status</label>
                                    <input
                                        type='text'
                                        value={'Complete'}
                                        disabled
                                        className='w-full px-4 py-1 border border-gray-300 rounded-sm bg-gray-50 text-gray-500'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Lead Status</label>
                                    <input
                                        type='text'
                                        value={toCapitalizedWords(formData.leadStatus)}
                                        disabled
                                        className='w-full px-4 py-1 border border-gray-300 rounded-sm bg-gray-50 text-gray-500'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Tag<span className='text-red-500'> *</span>
                                    </label>
                                    <Dropdown
                                        options={tagOptions}
                                        onSelect={(value) => handleInputChange('tag', value)}
                                        // defaultValue={toCapitalizedWords(leadData?.tag)}
                                        defaultValue={leadData?.tag || ''}
                                        // placeholder={toCapitalizedWords(leadData?.tag)}
                                        className='w-full relative inline-block'
                                        triggerClassName={`relative w-full h-8 px-3 py-2.5 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                            formData.tag ? '[&>span]:text-black' : ''
                                        }`}
                                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                        optionClassName='px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Note Textarea */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Add Note (Optional)
                                </label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => handleInputChange('note', e.target.value)}
                                    rows={4}
                                    disabled={isLoading}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-black focus:ring-0'
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='p-6 mt-4 flex items-center justify-center gap-4'>
                        <button
                            onClick={handleDiscard}
                            disabled={isLoading}
                            className='px-6 py-2 w-30 text-gray-600 bg-gray-200 rounded-sm hover:text-gray-800 hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !formData.reason || !formData.tag}
                            className='px-6 py-2 w-30 bg-blue-500 text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                            {isLoading && (
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                            )}
                            {isLoading ? 'Closing...' : 'Close Lead'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CloseLeadModal
