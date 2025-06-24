import React, { useState } from 'react'
import Dropdown from '../../components/design-elements/Dropdown'
import { leadService } from '../../services/canvas_homes'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { getUnixDateTime } from '../../components/helper/getUnixDateTime'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void
    enquiryId?: string | null
    onTaskCreated?: (taskData: any) => Promise<void>
    agentId?: string
    agentName?: string
    leadId?: string
    leadStatus?: string
    stage?: string
    tag?: string
    propertyName?: string
    leadAddDate?: number
    name?: string
    refreshData?: any
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
    isOpen,
    onClose,
    enquiryId,
    onTaskCreated,
    agentId,
    agentName,
    leadStatus,
    leadId = '',
    propertyName,
    leadAddDate,
    name,
    stage,
    tag,
    refreshData,
}) => {
    const getCurrentDateTime = () => {
        const now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        return now.toISOString().slice(0, 16)
    }

    const [formData, setFormData] = useState({
        task: '',
        dueDate: getCurrentDateTime(),
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const taskOptions = [
        // { label: 'Please select', value: '' },
        { label: 'Lead Registration', value: 'lead registration' },
        { label: 'Initial Contact', value: 'initial contact' },
        { label: 'Site Visit', value: 'site visit' },
        { label: 'Collect EOI', value: 'eoi collection' },
        { label: 'Booking Amount', value: 'booking' },
    ]

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        if (error) setError(null)
    }

    const validateForm = (): boolean => {
        if (!formData.task) {
            setError('Please select a task type')
            return false
        }
        if (!formData.dueDate) {
            setError('Please select a date and time')
            return false
        }
        if (!enquiryId) {
            setError('No enquiry selected. Please select an enquiry first.')
            return false
        }
        if (!onTaskCreated) {
            setError('Task creation handler not provided.')
            return false
        }
        return true
    }

    const handleSave = async () => {
        setError(null)
        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            const scheduledDate = new Date(formData.dueDate)
            const taskData = {
                enquiryId,
                agentId,
                leadId,
                agentName: agentName,
                propertyName: propertyName,
                name: name,
                leadAddDate,
                taskType: formData.task,
                status: 'open',
                stage: stage,
                leadStatus: leadStatus,
                tag: tag,
                scheduledDate: Math.floor(scheduledDate.getTime() / 1000),
                added: getUnixDateTime(),
                completionDate: null,
                lastModified: getUnixDateTime(),
            }

            // Create promises for each async operation
            const updateLead = leadService.update(leadId, {
                state: 'open',
                taskType: formData.task.toLowerCase(),
                lastModified: getUnixDateTime(),
                scheduledDate: Math.floor(scheduledDate.getTime() / 1000),
            })

            const addActivityPromise = enquiryId
                ? enquiryService.addActivity(enquiryId, {
                      activityType: 'task created',
                      timestamp: getUnixDateTime(),
                      agentName: agentName || null,
                      data: {
                          taskType: formData.task.toLowerCase(),
                          scheduledDate: Math.floor(scheduledDate.getTime() / 1000),
                      },
                  })
                : null

            const createTaskPromise = onTaskCreated ? onTaskCreated(taskData) : null

            // Wait for all promises to resolve concurrently
            await Promise.all([updateLead, addActivityPromise, createTaskPromise])

            toast.success('Task Created Successfully')
            handleDiscard()
            refreshData()
        } catch (error) {
            console.error('Error creating task:', error)
            setError('Failed to create task. Please try again.')
            toast.error('Failed to Create Task')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        setFormData({
            task: '',
            dueDate: getCurrentDateTime(),
        })
        setError(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            <div className='fixed inset-0 bg-black opacity-62 z-40' onClick={!isLoading ? onClose : undefined} />

            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[433px] bg-white z-50 rounded-lg shadow-2xl'>
                <div className='flex flex-col'>
                    <div className='flex items-center justify-between p-6 pb-4'>
                        <h2 className='text-xl font-semibold text-gray-900'>Create Task</h2>
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

                    <div className='p-6 pt-0 space-y-4'>
                        {error && (
                            <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm'>
                                {error}
                            </div>
                        )}

                        {/* Task Dropdown */}

                        <label className='block text-sm font-medium text-gray-700 mb-2'>Task</label>
                        <Dropdown
                            options={taskOptions}
                            onSelect={(value) => handleInputChange('task', value)}
                            defaultValue={formData.task}
                            placeholder='Please select'
                            className='w-full relative inline-block'
                            triggerClassName={`relative w-full h-8 px-3 py-2.5 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                formData.task ? '[&>span]:text-black' : ''
                            }`}
                            menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                            optionClassName='px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                            disabled={isLoading}
                        />

                        {/* Due Date & Time */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Date and Time</label>
                            <input
                                type='datetime-local'
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                min={getCurrentDateTime()}
                                disabled={isLoading}
                                className='w-[55%] h-8 px-3 py-2.5 border text-gray-500 border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50'
                            />
                        </div>
                    </div>

                    <div className='flex items-center justify-center p-6 pt-4'>
                        <div className='flex items-center gap-3'>
                            <button
                                onClick={handleDiscard}
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
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateTaskModal
