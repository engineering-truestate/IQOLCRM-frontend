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
import { useNavigate } from 'react-router-dom'

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
    refreshData?: any
}

const RequirementCollectedModal: React.FC<RequirementCollectedModalProps> = ({
    isOpen,
    onClose,
    taskType,
    refreshData,
}) => {
    // State management
    const [selectedTag, setSelectedTag] = useState<string>('potential')
    const [note, setNote] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    // Get IDs from Redux and route params
    const { taskId, enquiryId, taskState } = useSelector((state: RootState) => state.taskId)
    const dispatch = useDispatch<AppDispatch>()
    const { leadId } = useParams()
    const { user } = useAuth()
    const { leadData } = useLeadDetails(leadId || '')

    // Set selected enquiry ID when component mounts

    // Agent details from auth
    const agentId = user?.uid || ''
    const agentName = user?.displayName || ''
    const currentTaskType = taskType || taskState || ''

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setSelectedTag(leadData?.tag || 'potential')
            setNote('')
            setError(null)
        }
    }, [isOpen, leadData?.tag])

    const taskStatusOptions = [{ label: 'Complete', value: 'complete' }]

    const tagOptions = [
        { label: 'Potential', value: 'potential' },
        { label: 'Hot', value: 'hot' },
        { label: 'Super Hot', value: 'super hot' },
        { label: 'Cold', value: 'cold' },
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
            setIsLoading(true)
            setError(null)

            const currentTimestamp = getUnixDateTime()

            // 1. Determine lead state and stage based on task type
            let leadState = 'open'
            let leadStage = currentTaskType

            switch (currentTaskType.toLowerCase()) {
                case 'initial contact':
                    leadStage = 'initital contacted'
                    break
                case 'site visit':
                    leadState = 'open'
                    leadStage = 'site visited'
                    break
                case 'site not visit':
                    leadStage = 'initial contacted'
                    break
                case 'eoi not collected':
                    leadStage = 'site visited'
                    break
                case 'booking unsuccessful':
                    leadState = 'dropped'
                    leadStage = 'eoi collected'
                    break
                default:
                    leadState = 'open'
                    break
            }

            // 2. Update task to complete, enquiry, and lead in parallel
            const updateTask = taskService.update(taskId, {
                status: 'complete',
                lastModified: currentTimestamp,
                completionDate: currentTimestamp,
            })

            const updateEnquiry = enquiryService.update(enquiryId, {
                tag: selectedTag,
                leadStatus: 'requirement collected',
                state: leadState,
                stage: leadStage,
                lastModified: currentTimestamp,
            })

            const addActivity = enquiryService.addActivity(enquiryId, {
                activityType: 'task execution',
                timestamp: currentTimestamp,
                agentName: agentName,
                data: {
                    taskType: currentTaskType,
                    leadStatus: 'requirement collected',
                    tag: leadData.tag !== selectedTag ? [leadData.tag, selectedTag] : [selectedTag],
                    note: note.trim() || '',
                },
            })

            const addNote = note.trim()
                ? enquiryService.addNote(enquiryId, {
                      timestamp: currentTimestamp,
                      agentId,
                      agentName,
                      note: note.trim(),
                      taskType: currentTaskType,
                  })
                : Promise.resolve()

            const updateLead = leadService.update(leadId, {
                tag: selectedTag,
                leadStatus: 'requirement collected',
                state: leadState,
                stage: leadStage,
                completionDate: currentTimestamp,
                lastModified: currentTimestamp,
            })

            // Wait for all promises to complete in parallel
            await Promise.all([updateTask, updateEnquiry, addActivity, addNote, updateLead])

            // 3. Refresh data and clean up
            refreshData()

            // 4. Reset taskId in Redux store
            dispatch(clearTaskId())

            // 5. Show success message and close modal
            toast.success('Requirements collected successfully!')
            onClose()
        } catch (err) {
            console.error('Error saving requirement:', err)
            toast.error('Error saving requirement: ' + (err instanceof Error ? err.message : String(err)))
            setError('Failed to save. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed inset-0 bg-black opacity-50 z-40' onClick={!isLoading ? onClose : undefined} />

            {/* Modal Container */}
            <div
                className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[589px] bg-white z-50 rounded-lg shadow-2xl'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6'>
                        <h2 className='text-xl font-semibold text-gray-900'>Requirement Collected</h2>
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
                            {/* Error Message */}
                            {error && (
                                <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm'>
                                    {error}
                                </div>
                            )}

                            {/* Status and Tag Row */}
                            <div className='grid grid-cols-3 gap-4'>
                                {/* Task Status */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Task Status</label>
                                    <Dropdown
                                        options={taskStatusOptions}
                                        onSelect={() => {}}
                                        defaultValue='complete'
                                        placeholder='Complete'
                                        className='w-full'
                                        triggerClassName='w-full px-4 py-1 border bg-gray-50 text-gray-500 border-gray-300 rounded-sm flex items-center justify-between text-left cursor-not-allowed opacity-80'
                                        menuClassName='absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-lg shadow-lg'
                                        optionClassName='px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-50 cursor-pointer'
                                        disabled={true}
                                    />
                                </div>

                                {/* Lead Status */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Lead Status</label>
                                    <input
                                        type='text'
                                        value='Requirement Collected'
                                        disabled
                                        className='w-full px-4 py-1 border border-gray-300 rounded-sm bg-gray-50 text-gray-500'
                                    />
                                </div>

                                {/* Tag */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Tag</label>
                                    <Dropdown
                                        options={tagOptions}
                                        onSelect={setSelectedTag}
                                        defaultValue={selectedTag}
                                        placeholder='Select Tag'
                                        className='w-full'
                                        triggerClassName='w-full px-4 py-1 border border-gray-300 text-gray-500 rounded-sm bg-white flex items-center justify-between text-left'
                                        menuClassName='absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-lg shadow-lg'
                                        optionClassName='px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer'
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
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={4}
                                    disabled={isLoading}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg resize-none'
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='p-6 mt-4 flex items-center justify-center gap-4'>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className='px-6 py-2 w-30 text-gray-600 bg-gray-200 rounded-sm hover:text-gray-800 hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className='px-6 py-2 w-30 bg-blue-500 text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                            {isLoading && (
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                            )}
                            {isLoading ? 'Saving...' : 'Close Lead'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RequirementCollectedModal
