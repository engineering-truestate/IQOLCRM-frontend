import React, { useState, useEffect } from 'react'
import Dropdown from '../design-elements/Dropdown'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { toast } from 'react-toastify'
import { leadService } from '../../services/canvas_homes/leadService'
import { taskService } from '../../services/canvas_homes/taskService'
import { getUnixDateTime } from '../helper/getUnixDateTime'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store'
import { clearTaskId } from '../../store/reducers/canvas-homes/taskIdReducer'
import { useLeadDetails } from '../../hooks/canvas_homes/useLeadDetails'
import useAuth from '../../hooks/useAuth'

interface RootState {
    taskId: {
        taskId: string
        enquiryId: string
        taskState: string
    }
}

interface RequirementCollectedModalProps {
    isOpen: boolean
    onClose: () => void
    taskType?: string
}

const RequirementCollectedModal: React.FC<RequirementCollectedModalProps> = ({ isOpen, onClose, taskType }) => {
    // State management
    const [selectedTag, setSelectedTag] = useState<string>('potential')
    const [note, setNote] = useState<string>('')
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // Get IDs from Redux and route params
    const { taskId, enquiryId, taskState } = useSelector((state: RootState) => state.taskId)
    const dispatch = useDispatch<AppDispatch>()
    const { leadId } = useParams()
    const { user } = useAuth()
    const { refreshData, setSelectedEnquiryId, leadData } = useLeadDetails(leadId || '')

    // Set selected enquiry ID when component mounts
    React.useEffect(() => {
        if (enquiryId) {
            setSelectedEnquiryId(enquiryId)
        }
    }, [enquiryId, setSelectedEnquiryId])

    // Agent details from auth
    const agentId = user?.uid || ''
    const agentName = user?.displayName || ''
    const currentTaskType = taskType || taskState || ''
    const isLoading = isSaving || !isOpen

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setSelectedTag(leadData?.tag || 'potential')
            setNote('')
            setError(null)
        }
    }, [isOpen, leadData?.tag])

    const tagOptions = [
        { label: 'Potential', value: 'potential' },
        { label: 'Hot', value: 'hot' },
        { label: 'Super Hot', value: 'super hot' },
        { label: 'Fresh', value: 'fresh' },
    ]

    const handleSave = async () => {
        if (!taskId) {
            setError('Task ID is missing')
            return
        }

        if (!enquiryId) {
            setError('Enquiry ID is missing')
            return
        }

        if (!leadId) {
            setError('Lead ID is missing')
            return
        }

        try {
            setIsSaving(true)
            setError(null)

            const currentTimestamp = getUnixDateTime()

            // 1. Update task to complete
            await taskService.update(taskId, {
                status: 'complete',
                lastModified: currentTimestamp,
                completionDate: currentTimestamp,
            })

            // 2. Determine lead state and stage based on task type
            let leadState = 'open'
            let leadStage = currentTaskType

            switch (currentTaskType.toLowerCase()) {
                case 'initial contact':
                case 'site visit':
                    leadState = 'open'
                    leadStage = currentTaskType
                    break
                case 'site not visit':
                case 'eoi not collected':
                case 'booking unsuccessful':
                    leadState = 'dropped'
                    break
                default:
                    leadState = 'open'
                    break
            }

            // 3. Update enquiry with new status and tag
            await enquiryService.update(enquiryId, {
                tag: selectedTag,
                leadStatus: 'Requirement Collected',
                state: leadState,
                stage: leadStage,
                lastModified: currentTimestamp,
            })

            // 4. Add Task Execution activity to enquiry
            await enquiryService.addActivity(enquiryId, {
                activityType: 'Task Execution',
                timestamp: currentTimestamp,
                agentName: agentName,
                data: {
                    taskType: currentTaskType,
                    leadStatus: 'Requirement Collected',
                    tag:
                        leadData.tag?.toLowerCase() !== selectedTag?.toLowerCase()
                            ? [leadData.tag?.toLowerCase(), selectedTag?.toLowerCase()]
                            : [selectedTag?.toLowerCase()],
                    note: note.trim() || '',
                },
            })

            // 5. Add note to enquiry if provided
            if (note.trim()) {
                await enquiryService.addNote(enquiryId, {
                    timestamp: currentTimestamp,
                    agentId,
                    agentName,
                    note: note.trim(),
                    taskType: currentTaskType,
                })
            }

            // 6. Update lead with new status, stage, and tag
            await leadService.update(leadId, {
                tag: selectedTag,
                leadStatus: 'Requirement Collected',
                state: leadState,
                stage: leadStage,
                lastModified: currentTimestamp,
            })

            // 7. Refresh data and clean up
            await refreshData()
            dispatch(clearTaskId())

            // 8. Show success message and close modal
            toast.success('Requirements collected successfully!')
            onClose()
        } catch (err) {
            console.error('Error saving requirement:', err)
            toast.error('Error saving requirement: ' + (err instanceof Error ? err.message : String(err)))
            setError('Failed to save. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={onClose}>
            <div className='w-96 bg-white rounded-lg shadow-lg' onClick={(e) => e.stopPropagation()}>
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6 pb-4 border-b border-gray-100'>
                        <h2 className='text-lg font-semibold text-black'>Requirement Collected</h2>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className='p-1 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
                            aria-label='Close'
                        >
                            <svg
                                width='16'
                                height='16'
                                viewBox='0 0 20 20'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M15 5L5 15M5 5L15 15'
                                    stroke='#6B7280'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className='p-6 space-y-4'>
                        {/* Loading indicator */}
                        {isSaving && (
                            <div className='bg-blue-50 border border-blue-200 p-3 rounded-md'>
                                <div className='flex items-center gap-2 text-blue-700'>
                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                                    <span className='text-sm font-medium'>Saving requirements...</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm'>
                                {error}
                            </div>
                        )}

                        {/* Task Status - Read-only */}
                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Task Status</label>
                            <div className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed text-sm'>
                                Complete
                            </div>
                        </div>

                        {/* Lead Status - Read-only */}
                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Lead Status</label>
                            <div className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed text-sm'>
                                Requirement Collected
                            </div>
                        </div>

                        {/* Tag - Editable */}
                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Tag</label>
                            <Dropdown
                                options={tagOptions}
                                onSelect={setSelectedTag}
                                defaultValue={selectedTag}
                                placeholder='Select Tag'
                                className='w-full'
                                triggerClassName='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white flex items-center justify-between text-left disabled:opacity-50 disabled:cursor-not-allowed'
                                menuClassName='absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm'
                                optionClassName='cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-sm'
                                disabled={isLoading}
                            />
                        </div>

                        {/* Note */}
                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Add Note (Optional)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
                                rows={4}
                                placeholder='Enter notes here...'
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='flex items-center justify-center gap-4 p-6 pt-4 border-t border-gray-100'>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className='px-5 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className='px-5 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[80px]'
                        >
                            {isLoading ? (
                                <>
                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RequirementCollectedModal
