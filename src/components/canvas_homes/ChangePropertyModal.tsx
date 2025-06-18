import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { useParams } from 'react-router'
import { enquiryService } from '../../services/canvas_homes'
import { leadService } from '../../services/canvas_homes'
import { taskService } from '../../services/canvas_homes'
import useAuth from '../../hooks/useAuth'
import { toast } from 'react-toastify'
import { getUnixDateTime } from '../helper/getUnixDateTime'
import { useLeadDetails } from '../../hooks/canvas_homes/useLeadDetails'

interface ChangePropertyModalProps {
    isOpen: boolean
    onClose: () => void
    onChangeProperty: (formData: any) => void
    taskState: string
}

const ChangePropertyModal: React.FC<ChangePropertyModalProps> = ({ isOpen, onClose, onChangeProperty, taskState }) => {
    const taskIds: string = useSelector((state: RootState) => state.taskId.taskId || '')
    const enquiryId: string = useSelector((state: RootState) => state.taskId.enquiryId || '')
    const { user } = useAuth()
    const { leadId } = useParams()

    const agentId = user?.uid || ''
    const agentName = user?.displayName || ''

    const currentTimestamp = Date.now()
    const enquiryDateTimestamp = currentTimestamp
    const { refreshData } = useLeadDetails(leadId)

    const [formData, setFormData] = useState({
        reason: '',
        leadId: leadId,
        state: 'open',
        propertyId: '',
        propertyName: '',
        agentId: agentId,
        agentName: agentName,
        tag: 'potential',
        status: 'complete',
    })

    const reasonOptions = [
        { value: '', label: 'Select reason' },
        { value: 'not interested in current property', label: 'Not Interested in Current Property' },
        { value: 'other', label: 'Other' },
    ]

    const propertyOptions = [
        { value: '', label: 'Select new property' },
        { value: 'prop001|Sunset Villa', label: 'Sunset Villa' },
        { value: 'prop002|Ocean View Apartment', label: 'Ocean View Apartment' },
        { value: 'prop003|Downtown Condo', label: 'Downtown Condo' },
        { value: 'prop004|Garden Heights', label: 'Garden Heights' },
        { value: 'prop005|Riverside Towers', label: 'Riverside Towers' },
        { value: 'prop006|Sattva Hills', label: 'Sattva Hills' },
        { value: 'prop007|Prestige Gardenia', label: 'Prestige Gardenia' },
        { value: 'prop008|Brigade Cosmopolis', label: 'Brigade Cosmopolis' },
        { value: 'prop009|Sobha City', label: 'Sobha City' },
        { value: 'prop010|Embassy Springs', label: 'Embassy Springs' },
        { value: 'prop011|Mantri Energia', label: 'Mantri Energia' },
    ]

    const taskStatusOptions = [{ value: 'Complete', label: 'Complete' }]

    const leadStatusOptions = [{ value: 'Property Changed', label: 'Property Changed' }]

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

        // Set propertyId and propertyName when newProperty is selected
        if (field === 'newProperty' && value) {
            const [propertyId, propertyName] = value.split('|')
            setFormData((prev) => ({
                ...prev,
                propertyId: propertyId,
                propertyName: propertyName,
            }))
        }
    }

    const handleNoteChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            note: value,
        }))
    }

    const handleSubmit = async () => {
        if (!formData.reason || !formData.newProperty) {
            toast.error('Please select a reason and new property')
            return
        }

        try {
            if (enquiryId && leadId && taskIds) {
                // Update existing enquiry
                const enqData = {
                    leadStatus: 'Property Changed',
                    stage: null,
                    state: 'open',
                    lastModified: Date.now(),
                }
                await enquiryService.update(enquiryId, enqData)

                // Create new enquiry
                const newNote = formData.note
                    ? {
                          note: formData.note,
                          timestamp: getUnixDateTime(),
                          agentName: formData.agentName,
                          agentId: formData.agentId,
                          taskType: 'lead registration',
                      }
                    : null
                enquiryService.addNote(enquiryId, newNote)

                const newEnquiry = {
                    leadId: leadId,
                    agentId: agentId,
                    propertyId: formData.propertyId,
                    propertyName: formData.propertyName,
                    source: 'Manual',
                    leadStatus: 'interested', // Default status
                    stage: null,
                    agentHistory: [
                        {
                            agentId: agentId,
                            agentName: agentName,
                            timestamp: currentTimestamp,
                            lastStage: null,
                        },
                    ],
                    activityHistory: [],
                    notes: [],
                    state: 'open',
                    tag: formData.tag || 'potential',
                    documents: [],
                    requirements: [],
                    added: enquiryDateTimestamp,
                    lastModified: currentTimestamp,
                }

                await enquiryService.create(newEnquiry)

                // Update lead
                const leadData = {
                    stage: null,
                    state: 'open',
                    leadStatus: 'interested',
                    lastModifie: currentTimestamp,
                }
                await leadService.update(leadId, leadData)

                // Update task
                await taskService.update(taskIds, { status: 'complete', completionDate: currentTimestamp })

                toast.success('Property changed successfully')
                refreshData()
            } else {
                toast.error('Required IDs are missing')
            }
        } catch (error: any) {
            console.error('Error updating enquiry:', error)
            toast.error(error.message || 'Failed to update enquiry')
            return
        } finally {
            refreshData()
        }

        onChangeProperty(formData)
        onClose()

        // Reset form
        setFormData((prev) => ({
            ...prev,
            reason: '',
            newProperty: '',
            propertyId: '',
            propertyName: '',
            tag: 'potential',
            note: '',
        }))
    }

    const handleDiscard = () => {
        setFormData((prev) => ({
            ...prev,
            reason: '',
            newProperty: '',
            propertyId: '',
            propertyName: '',
            tag: 'potential',
            note: '',
        }))
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={onClose}>
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
                            value={formData.newProperty}
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
                            onChange={(e) => handleNoteChange(e.target.value)}
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
