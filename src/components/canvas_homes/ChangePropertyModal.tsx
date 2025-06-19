import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { enquiryService } from '../../services/canvas_homes'
import { leadService } from '../../services/canvas_homes'
import { taskService } from '../../services/canvas_homes'

interface ChangePropertyModalProps {
    isOpen: boolean
    onClose: () => void
    onChangeProperty: (formData: any) => void
}

const ChangePropertyModal: React.FC<ChangePropertyModalProps> = ({ isOpen, onClose, onChangeProperty }) => {
    const taskIds: string = useSelector((state: RootState) => state.taskId.taskId)
    const enquiryId: string = useSelector((state: RootState) => state.taskId.enquiryId)

    const { leadId } = useParams()

    const [formData, setFormData] = useState({
        reason: '',
        leadId: leadId,
        state: 'open',
        newProperty: '',
    })

    const reasonOptions = [
        { value: '', label: 'Select reason' },
        { value: 'customer_preference', label: 'Customer Preference' },
        { value: 'budget_constraints', label: 'Budget Constraints' },
        { value: 'location_change', label: 'Location Change' },
        { value: 'size_requirements', label: 'Size Requirements' },
        { value: 'amenities_mismatch', label: 'Amenities Mismatch' },
        { value: 'other', label: 'Other' },
    ]

    const propertyOptions = [
        { value: '', label: 'Select new property' },
        { value: 'property_1', label: 'Property 1' },
        { value: 'property_2', label: 'Property 2' },
        { value: 'property_3', label: 'Property 3' },
        { value: 'property_4', label: 'Property 4' },
    ]

    const taskStatusOptions = [
        { value: 'Complete', label: 'Complete' },
        { value: 'Incomplete', label: 'Incomplete' },
        { value: 'Pending', label: 'Pending' },
    ]

    const leadStatusOptions = [
        { value: 'Property Changed', label: 'Property Changed' },
        { value: 'Follow Up', label: 'Follow Up' },
        { value: 'Connected', label: 'Connected' },
    ]

    const tagOptions = [
        { value: 'hot', label: 'Hot' },
        { value: 'super hot', label: 'Super Hot' },
        { value: 'potential', label: 'Potential' },
        { value: 'Cold', label: 'Cold' },
    ]

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async () => {
        if (!formData.reason || !formData.newProperty) {
            alert('Please select a reason and new property')
            return
        }

        try {
            if (enquiryId && leadId && taskIds) {
                const enqData = {
                    leadStatus: 'Property Changed',
                }
                await enquiryService.update(enquiryId, enqData)
                await enquiryService.create(enqData)

                const data = {
                    stage: null,
                    state: 'fresh',
                    status: 'interested',
                }
                await leadService.update(leadId, data)
                await taskService.update(taskIds, { status: 'complete' })
            } else {
                console.error('enquiryId is undefined')
            }
        } catch (error) {
            console.error('Error updating enquiry:', error)
            alert('Failed to update enquiry')
            return
        }

        onChangeProperty(formData)
        onClose()

        // Reset form
        setFormData({
            leadId: leadId,
            reason: '',
            newProperty: '',
            taskStatus: 'Complete',
            leadStatus: 'Property Changed',
            tag: 'Cold',
            note: '',
        })
    }

    const handleDiscard = () => {
        setFormData({
            reason: '',
            newProperty: '',
            taskStatus: 'Complete',
            leadStatus: 'Property Changed',
            tag: 'Cold',
            note: '',
        })
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 bg-black bg-opacity-0 flex items-center justify-center z-50' onClick={onClose}>
            <div className='bg-white rounded-lg shadow-xl w-full max-w-md mx-4' onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-gray-200'>
                    <h2 className='text-lg font-semibold text-gray-900'>Change Property</h2>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold w-6 h-6 flex items-center justify-center'
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className='p-4 space-y-4'>
                    {/* Reason */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Reason</label>
                        <select
                            value={formData.reason}
                            onChange={(e) => handleInputChange('reason', e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50'
                        >
                            {reasonOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Add New Property */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Add New Property</label>
                        <select
                            value={newProperty}
                            onChange={(e) => handleInputChange('newProperty', e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50'
                        >
                            {propertyOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Current Enquiry Section */}
                    <div className='bg-gray-50 p-3 rounded-md'>
                        <h3 className='text-sm font-medium text-gray-900 mb-3'>Current Enquiry</h3>

                        {/* Task Status and Lead Status Row */}
                        <div className='grid grid-cols-2 gap-3 mb-3'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Task Status</label>
                                <select
                                    value={formData.taskStatus}
                                    onChange={(e) => handleInputChange('taskStatus', e.target.value)}
                                    className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs'
                                >
                                    {taskStatusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Lead Status</label>
                                <input
                                    type='text'
                                    value='Property Changed'
                                    onChange={(e) => handleInputChange('leadStatus', e.target.value)}
                                    className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs'
                                    placeholder='Property Changed'
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {/* New Enquiry Section */}
                    <div className='bg-gray-50 p-3 rounded-md'>
                        <h3 className='text-sm font-medium text-gray-900 mb-3'>New Enquiry</h3>

                        {/* Lead Status and Tag Row */}
                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Lead Status</label>
                                <input
                                    type='text'
                                    value='Interested'
                                    disabled
                                    className='w-full px-2 py-2 border border-gray-300 rounded-md text-xs bg-gray-100 text-gray-500'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Tag</label>
                                <select
                                    value={formData.tag}
                                    onChange={(e) => handleInputChange('tag', e.target.value)}
                                    className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs'
                                >
                                    {tagOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Add Note */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Add Note (Optional)</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => handleInputChange('note', e.target.value)}
                            placeholder='Add your notes here...'
                            rows={4}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none'
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className='flex justify-end gap-3 p-4 border-t border-gray-200'>
                    <button
                        onClick={handleDiscard}
                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
                    >
                        Change Property
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChangePropertyModal
