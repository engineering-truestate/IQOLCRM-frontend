import React, { useState, useEffect } from 'react'
import Dropdown from '../design-elements/Dropdown'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { toast } from 'react-toastify'
import { leadService } from '../../services/canvas_homes'
import { taskService } from '../../services/canvas_homes'
import { getUnixDateTime } from '../helper/getUnixDateTime'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store'
import { clearTaskId } from '../../store/reducers/canvas-homes/taskIdReducer'

interface RootState {
    taskId: {
        taskId: string
        enquiryId: string
        taskState: string
    }
}

interface Note {
    timestamp: number
    agentId: string
    agentName: string
    note: string
    taskType: string
}

interface RequirementCollectedModalProps {
    isOpen: boolean
    onClose: () => void
    taskType?: string
    subTaskType?: string
    taskData?: any
    enquiryData?: any
    leadData?: any
}

const RequirementCollectedModal: React.FC<RequirementCollectedModalProps> = ({
    isOpen,
    onClose,
    taskType,
    subTaskType,
    taskData = {},
    enquiryData = {},
    leadData = {},
}) => {
    // State management
    const [selectedTag, setSelectedTag] = useState<string>('potential')
    const [note, setNote] = useState<string>('')
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // Get IDs from Redux and route params
    const { taskId, enquiryId, taskState } = useSelector((state: RootState) => state.taskId)
    const dispatch = useDispatch<AppDispatch>()
    const { leadId } = useParams()

    taskType = taskType || taskState || ''

    // Agent details (mocked for this example)
    const agentId = 'agent123' // Replace with actual agent ID from context or props
    const agentName = 'John Doe' // Replace with actual agent name from context or props
    const isLoading = isSaving || !isOpen

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setSelectedTag(leadData.tag || 'potential')
            setNote('')
            setError(null)
        }
    }, [isOpen, leadData.tag])

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

            // 1. Update task details

            const taskUpdateData = {
                ...taskData,
                taskResult: 'requirement_collected',
                status: 'complete',
                lastModified: getUnixDateTime(),
                completionDate: getUnixDateTime(),
            }

            await taskService.update(taskId, taskUpdateData)

            switch (taskType) {
                case 'Initial Contact':
                    leadData = {
                        ...leadData,
                        state: 'dropped',
                        stage: taskType,
                    }
                    break
                case 'Site Visit':
                    leadData = {
                        ...leadData,
                        state: 'dropped',
                        stage: taskType,
                    }
                    break
                case 'Site Not Visit':
                    leadData = {
                        ...leadData,
                        state: 'dropped',
                    }
                    break
                case 'EOI Not Collected':
                    leadData = {
                        ...leadData,
                        state: 'dropped',
                    }
                    break
                case 'Booking Unsuccessful':
                    leadData = {
                        ...leadData,
                        state: 'dropped',
                    }
                    break
                default:
                    break
            }

            try {
                // 4. Add note if provided
                let noteData: Note | null = null
                if (note.trim()) {
                    noteData = {
                        timestamp: getUnixDateTime(),
                        agentId,
                        agentName,
                        note: note.trim(),
                        taskType: taskType,
                    }
                }
                const currentEnquiry = await enquiryService.getById(enquiryId)
                const updatedNotes = [...(currentEnquiry?.notes || []), noteData]

                await enquiryService.update(enquiryId, {
                    ...enquiryData,
                    notes: updatedNotes,
                    tag: selectedTag,
                    leadStatus: 'Requirement Collected',
                    lastModified: getUnixDateTime(),
                })
            } catch (noteError) {
                toast.error(
                    'Error adding note: ' + (noteError instanceof Error ? noteError.message : String(noteError)),
                )
            }

            // 3. Update lead with new status, stage, and tag

            const leadUpdateData = {
                ...leadData,
                tag: selectedTag,
                leadStatus: 'Requirement Collected',
                lastModified: getUnixDateTime(),
            }

            await leadService.update(leadId, leadUpdateData)
            dispatch(clearTaskId())
            // 5. Show success message and close modal
            toast.success('Requirements collected successfully!')
            onClose()
        } catch (err) {
            toast.error('Error saving requirement')
            setError('Failed to save. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Modal Overlay */}
            {/* <div className='fixed inset-0 bg-black opacity-50 z-40' onClick={onClose} /> */}

            {/* Modal Container */}
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white z-50 rounded-lg shadow-lg'>
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6 pb-4 border-b border-gray-100'>
                        <h2 className='text-lg font-semibold text-black'>Requirement Collected</h2>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className='p-1 hover:bg-gray-100 rounded-md'
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
                                triggerClassName='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white flex items-center justify-between text-left'
                                menuClassName='absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm'
                                optionClassName='cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-sm'
                            />
                        </div>

                        {/* Note */}
                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Add Note (Optional)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
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
        </>
    )
}

export default RequirementCollectedModal
