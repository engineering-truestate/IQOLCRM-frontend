import React, { useState } from 'react'
import Dropdown from '../../components/design-elements/Dropdown'
import { leadService } from '../../services/canvas_homes'
import { enquiryService } from '../../services/canvas_homes/enquiryService'
import { getUnixDateTime } from '../../components/helper/getUnixDateTime'

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
}) => {
    const [formData, setFormData] = useState({
        task: '',
        dueDate: '',
    })

    const [saving, setSaving] = useState(false)

    const taskOptions = [
        { label: 'Please select', value: '' },
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
    }

    const handleSave = async () => {
        if (!formData.task || !formData.dueDate) {
            alert('Please fill in all required fields (Task, Due Date)')
            return
        }

        if (!enquiryId) {
            alert('No enquiry selected. Please select an enquiry first.')
            return
        }

        if (!onTaskCreated) {
            alert('Task creation handler not provided.')
            return
        }

        setSaving(true)

        try {
            const scheduledDate = new Date(formData.dueDate)
            const taskData = {
                enquiryId,
                agentId,
                agentName: agentName,
                propertyName: propertyName,
                name: name,
                leadAddDate,
                taskType: formData.task,
                status: 'open',
                stage: stage,
                leadStatus: leadStatus,
                tag: tag,
                scheduledDate: scheduledDate.getTime(),
                added: getUnixDateTime(),
                completionDate: null,
                lastModified: getUnixDateTime(),
            }

            console.log('Creating task:', taskData)

            // Update lead with task information
            await leadService.update(leadId, {
                taskType: formData.task.toLowerCase(),
                lastModified: getUnixDateTime(),
                scheduledDate: Math.floor(scheduledDate.getTime() / 1000),
            })

            // Add activity history to enquiry
            if (enquiryId) {
                await enquiryService.addActivity(enquiryId, {
                    activityType: 'task created',
                    timestamp: getUnixDateTime(),
                    agentName: agentName,
                    data: {
                        taskType: formData.task.toLowerCase(),
                        scheduledDate: Math.floor(scheduledDate.getTime() / 1000),
                    },
                })
            }

            // Create the task
            await onTaskCreated(taskData)

            alert('Task created successfully!')
            handleDiscard()
        } catch (error) {
            console.error('Error creating task:', error)
            alert('Failed to create task. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = () => {
        setFormData({
            task: '',
            dueDate: '',
        })
        onClose()
    }

    const getCurrentDateTime = () => {
        const now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        return now.toISOString().slice(0, 16)
    }

    if (!isOpen) return null

    return (
        <>
            <div className='fixed inset-0 bg-black opacity-66 z-40' onClick={!saving ? onClose : undefined} />

            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[433px] bg-white z-50 rounded-lg shadow-2xl'>
                <div className='flex flex-col'>
                    <div className='flex items-center justify-between p-6 pb-4'>
                        <h2 className='text-xl font-semibold text-gray-900'>Create Task</h2>
                        <button
                            onClick={onClose}
                            disabled={saving}
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
                        {/* Task Dropdown */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Task</label>
                            <Dropdown
                                options={taskOptions}
                                onSelect={(value) => handleInputChange('task', value)}
                                defaultValue={formData.task}
                                placeholder='Please select'
                                className='w-full'
                                triggerClassName='w-full h-8 px-3 py-2.5 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50'
                                menuClassName='absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto'
                                optionClassName='px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer'
                            />
                        </div>

                        {/* Due Date & Time */}
                        <div>
                            <input
                                type='datetime-local'
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                min={getCurrentDateTime()}
                                disabled={saving}
                                className='w-1/2 h-8 px-3 py-2.5 border text-gray-500 border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50'
                            />
                        </div>
                    </div>

                    <div className='flex items-center justify-center p-6 pt-4'>
                        <div className='flex items-center gap-3'>
                            <button
                                onClick={handleDiscard}
                                disabled={saving}
                                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50'
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !formData.task || !formData.dueDate}
                                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2'
                            >
                                {saving && (
                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                                )}
                                {saving ? 'Creating...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateTaskModal
