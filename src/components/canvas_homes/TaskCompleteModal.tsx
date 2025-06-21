import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { useParams } from 'react-router'
import useAuth from '../../hooks/useAuth'
import { toast } from 'react-toastify'
import { getUnixDateTime } from '../helper/getUnixDateTime'
import { useLeadDetails } from '../../hooks/canvas_homes/useLeadDetails'
import { taskService } from '../../services/canvas_homes/taskService'
import { leadService } from '../../services/canvas_homes/leadService'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { useNavigate } from 'react-router'
import Dropdown from '../design-elements/Dropdown'
import { toCapitalizedWords } from '../helper/toCapitalize'

interface TaskCompleteModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    stage?: string
    state?: string
    leadStatus?: string
    taskType?: string
}

const TaskCompleteModal: React.FC<TaskCompleteModalProps> = ({
    isOpen,
    onClose,
    title = 'Interested',
    stage,
    state = 'open',
    leadStatus = 'Interested',
    taskType,
}) => {
    const taskId = useSelector((state: RootState) => state.taskId.taskId || '')
    const enquiryId = useSelector((state: RootState) => state.taskId.enquiryId || '')
    const { user } = useAuth()
    const { leadId } = useParams()
    const { refreshData, setSelectedEnquiryId, leadData } = useLeadDetails(leadId || '')
    const navigate = useNavigate()

    // Set selected enquiry ID when component mounts
    useEffect(() => {
        if (enquiryId) {
            setSelectedEnquiryId(enquiryId)
        }
    }, [enquiryId, setSelectedEnquiryId])

    const agentId = user?.uid || ''
    const agentName = user?.displayName || ''

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        tag: 'cold',
        note: '',
    })

    const taskStatusOptions = [{ value: 'Complete', label: 'Complete' }]

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
        if (!enquiryId || !leadId || !taskId) {
            toast.error('Required IDs are missing')
            return
        }

        setIsLoading(true)

        try {
            // Update task using service
            const currentTimestamp = getUnixDateTime()
            await taskService.update(taskId, {
                status: 'complete',
                completionDate: currentTimestamp,
            })

            // Update enquiry using service
            await enquiryService.update(enquiryId, {
                state: state,
                stage: stage,
                leadStatus: leadStatus,
                tag: formData.tag,
                lastModified: currentTimestamp,
            })

            // Add Task Execution activity to enquiry

            // Add note to enquiry if provided
            if (formData.note.trim()) {
                await enquiryService.addNote(enquiryId, {
                    note: formData.note.trim(),
                    timestamp: currentTimestamp,
                    agentName,
                    agentId,
                    taskType: taskType || 'Task',
                })
            }
            await enquiryService.addActivity(enquiryId, {
                activityType: 'task execution',
                timestamp: currentTimestamp,
                agentName: agentName,
                data: {
                    taskType: taskType || 'Task',
                    leadStatus: leadStatus,
                    tag: leadData.tag !== formData.tag ? [leadData.tag, formData.tag] : [formData.tag],
                    note: formData.note.trim() || '',
                },
            })

            // Update lead using service
            await leadService.update(leadId, {
                state: state,
                stage: stage,
                leadStatus: leadStatus,
                tag: formData.tag,
                lastModified: currentTimestamp,
            })
            toast.success('Task completed successfully!')
            onClose()
            window.location.href = `/canvas-homes/sales/leadDetails/${leadId}`
        } catch (error: any) {
            console.error('Error completing task:', error)
            toast.error(error.message || 'Failed to complete task')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        if (isLoading) return
        onClose()
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
                        <h2 className='text-xl font-semibold text-gray-900'>{toCapitalizedWords(title)}</h2>
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
                        <div className='space-y-6'>
                            {/* Status and Tag Fields */}
                            <div className='grid grid-cols-3 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Task Status</label>
                                    <Dropdown
                                        options={taskStatusOptions}
                                        onSelect={() => {}}
                                        defaultValue='Complete'
                                        placeholder='Complete'
                                        className='w-full'
                                        triggerClassName='w-full px-4 py-1 border bg-gray-50 text-gray-500 border-gray-300 rounded-sm flex items-center justify-between text-left cursor-not-allowed opacity-80'
                                        menuClassName='absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-lg shadow-lg'
                                        optionClassName='px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-50 cursor-pointer'
                                        disabled={true}
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Lead Status</label>
                                    <input
                                        type='text'
                                        value={toCapitalizedWords(leadStatus)}
                                        disabled
                                        className='w-full px-4 py-1 border border-gray-300 rounded-sm bg-gray-50 text-gray-500'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Tag</label>
                                    <Dropdown
                                        options={tagOptions}
                                        onSelect={(value) => handleInputChange('tag', value)}
                                        defaultValue={formData.tag}
                                        placeholder='Select tag'
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
                                    value={formData.note}
                                    onChange={(e) => handleInputChange('note', e.target.value)}
                                    rows={6}
                                    disabled={isLoading}
                                    className='w-full px-4 py-1 border border-gray-300 rounded-lg resize-none'
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='p-6 pt-0 mt-5 flex items-center justify-center gap-4'>
                        <button
                            onClick={handleDiscard}
                            disabled={isLoading}
                            className='px-6 py-2 w-30 text-gray-600 bg-gray-200 rounded-sm hover:text-gray-800 hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className='px-6 py-2 w-30 bg-blue-500 text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                            {isLoading && (
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                            )}
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TaskCompleteModal
