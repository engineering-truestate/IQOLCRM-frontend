import React, { useState, useEffect } from 'react'
import Dropdown from '../design-elements/Dropdown'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { enquiryService } from '../../services/canvas_homes/enquiryService'

interface RootState {
    taskId: {
        taskId: string
        enquiryId: string
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
    onUpdateTask?: (taskId: string, data: any) => Promise<void>
    onUpdateEnquiry?: (data: any) => Promise<void>
    onUpdateLead?: (data: any) => Promise<void>
    onAddNote?: (data: any) => Promise<void>
    agentId?: string
    agentName?: string
    isLoading?: boolean
    taskData?: any
    enquiryData?: any
    leadData?: any
}

const RequirementCollectedModal: React.FC<RequirementCollectedModalProps> = ({
    isOpen,
    onClose,
    onUpdateTask,
    onUpdateEnquiry,
    onUpdateLead,
    onAddNote,
    agentId: propAgentId,
    agentName: propAgentName,
    isLoading: propIsLoading = false,
    taskType,
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
    const { taskId, enquiryId } = useSelector((state: RootState) => state.taskId)
    const { leadId } = useParams()

    // Use provided agent info or fall back to defaults
    const agentId = propAgentId || 'system'
    const agentName = propAgentName || 'System'
    const isLoading = propIsLoading || isSaving

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
            if (onUpdateTask) {
                const taskUpdateData = {
                    ...taskData,
                    taskResult: 'requirement_collected',
                    status: 'complete',
                    lastModified: Date.now(),
                    completionDate: Date.now(),
                }

                await onUpdateTask(taskId, taskUpdateData)
            }

            // 2. Update enquiry with new status, stage, and tag
            if (onUpdateEnquiry) {
                const enquiryUpdateData = {
                    ...enquiryData,
                    tag: selectedTag,
                    lastModified: Date.now(),
                }

                await onUpdateEnquiry(enquiryUpdateData)
            } else if (enquiryId) {
                // Fallback to direct service call if no callback provided
                const enquiryUpdateData = {
                    tag: selectedTag,
                    lastModified: Date.now(),
                }

                await enquiryService.update(enquiryId, enquiryUpdateData)
            }

            // 3. Update lead with new status, stage, and tag
            if (onUpdateLead) {
                const leadUpdateData = {
                    ...leadData,
                    tag: selectedTag,
                    lastModified: Date.now(),
                }

                await onUpdateLead(leadUpdateData)
            }

            // 4. Add note if provided
            if (note.trim()) {
                const noteData: Note = {
                    timestamp: Date.now(),
                    agentId,
                    agentName,
                    note: note.trim(),
                    taskType: taskType,
                }

                if (onAddNote) {
                    await onAddNote(noteData)
                } else if (enquiryId) {
                    // Fallback to direct service call if no callback provided
                    try {
                        const currentEnquiry = await enquiryService.getById(enquiryId)
                        const updatedNotes = [...(currentEnquiry.notes || []), noteData]

                        await enquiryService.update(enquiryId, {
                            notes: updatedNotes,
                            lastModified: Date.now(),
                        })
                    } catch (noteError) {
                        console.error('Error adding note:', noteError)
                        // Continue with other operations even if note addition fails
                    }
                }
            }

            // 5. Show success message and close modal
            alert('Requirements collected successfully!')
            onClose()
        } catch (err) {
            console.error('Error saving requirement:', err)
            setError('Failed to save. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed inset-0 bg-black opacity-50 z-40' onClick={onClose} />

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
                                disabled={isLoading}
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
