import { useLeadDetails } from '../../hooks/canvas_homes/useLeadDetails'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { useParams } from 'react-router'
import { enquiryService } from '../../services/canvas_homes'
import { taskService } from '../../services/canvas_homes/taskService'
import { leadService } from '../../services/canvas_homes/leadService'
import useAuth from '../../hooks/useAuth'
import { toast } from 'react-toastify'
import { getUnixDateTime } from '../helper/getUnixDateTime'
import { useNavigate } from 'react-router'
import Dropdown from '../design-elements/Dropdown'

interface ChangePropertyModalProps {
    isOpen: boolean
    onClose: () => void
    taskType: string
}

const ChangePropertyModal: React.FC<ChangePropertyModalProps> = ({ isOpen, onClose, taskType }) => {
    const taskIds: string = useSelector((state: RootState) => state.taskId.taskId || '')
    const enquiryId: string = useSelector((state: RootState) => state.taskId.enquiryId || '')
    const { user } = useAuth()
    const { leadId } = useParams()
    const { refreshData, setSelectedEnquiryId, leadData } = useLeadDetails(leadId || '')
    const navigate = useNavigate()

    // Set selected enquiry ID when component mounts
    React.useEffect(() => {
        if (enquiryId) {
            setSelectedEnquiryId(enquiryId)
        }
    }, [enquiryId, setSelectedEnquiryId])

    const agentId = user?.uid || ''
    const agentName = user?.displayName || ''
    const previousPropertyName = leadData?.propertyName || 'Previous Property'

    const currentTimestamp = getUnixDateTime()
    const enquiryDateTimestamp = currentTimestamp

    const [formData, setFormData] = useState({
        reason: '',
        leadId: leadId,
        state: 'open',
        propertyId: '',
        propertyName: '',
        agentId: agentId,
        agentName: agentName,
        tag: 'cold',
        status: 'complete',
        note: '',
        newProperty: '',
        taskStatus: 'Complete',
        leadStatus: 'Property Changed',
    })

    const [isLoading, setIsLoading] = useState(false)

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

        setIsLoading(true)

        try {
            if (enquiryId && leadId && taskIds) {
                // Update existing enquiry using service
                const enqData = {
                    leadStatus: 'Property Changed',
                    stage: null,
                    state: 'open',
                    lastModified: currentTimestamp,
                }
                await enquiryService.update(enquiryId, enqData)

                // Add Property Change activity to old enquiry
                await enquiryService.addActivity(enquiryId, {
                    activityType: 'property change',
                    timestamp: currentTimestamp,
                    agentName: agentName,
                    data: {
                        propertyAdded: formData.propertyName,
                        propertyChanged: previousPropertyName,
                        leadStatus: 'Property Changed',
                        reason: formData.reason,
                        note: formData.note || '',
                    },
                })

                // Add note to existing enquiry if provided
                if (formData.note) {
                    const newNote = {
                        note: formData.note,
                        timestamp: currentTimestamp,
                        agentName: formData.agentName,
                        agentId: formData.agentId,
                        taskType: taskType,
                    }
                    await enquiryService.addNote(enquiryId, newNote)
                }

                // Create new enquiry using service
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
                    activityHistory: [
                        {
                            activityType: 'new enquiry',
                            timestamp: currentTimestamp,
                            agentName: agentName,
                            data: {
                                propertyAdded: formData.propertyName,
                                leadStatus: 'interested',
                                tag: formData.tag || 'cold',
                            },
                        },
                    ],
                    notes: [],
                    state: 'open',
                    tag: formData.tag || 'cold',
                    documents: [],
                    requirements: [],
                    added: enquiryDateTimestamp,
                    lastModified: currentTimestamp,
                }

                const newEnquiryResult = await enquiryService.create(newEnquiry)

                // Update lead using service
                const leadData = {
                    stage: null,
                    state: 'open',
                    propertyName: formData.propertyName,
                    propertyId: formData.propertyId,
                    tag: formData.tag,
                    leadStatus: 'interested',
                    lastModified: currentTimestamp,
                }
                await leadService.update(leadId, leadData)

                // Update task using service
                await taskService.update(taskIds, {
                    status: 'complete',
                    completionDate: currentTimestamp,
                })

                toast.success('Property changed successfully')

                onClose()

                navigate(`/canvas-homes/sales/leaddetails/${leadId}`)
                // Reset form
                setFormData((prev) => ({
                    ...prev,
                    reason: '',
                    newProperty: '',
                    propertyId: '',
                    propertyName: '',
                    tag: 'cold',
                    note: '',
                }))
            } else {
                toast.error('Required IDs are missing')
            }
        } catch (error: any) {
            console.error('Error updating enquiry:', error)
            toast.error(error.message || 'Failed to update enquiry')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiscard = () => {
        setFormData((prev) => ({
            ...prev,
            reason: '',
            newProperty: '',
            propertyId: '',
            propertyName: '',
            tag: 'cold',
            note: '',
        }))
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            {/* Modal Overlay */}
            <div className='fixed inset-0 bg-black opacity-50 z-40' onClick={!isLoading ? onClose : undefined} />

            {/* Modal Container */}
            <div
                className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[688px] bg-white z-50 rounded-lg shadow-2xl'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex flex-col'>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between p-6'>
                        <h2 className='text-xl font-semibold text-gray-900'>Change Property</h2>
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
                            {/* Reason and New Property */}
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Reason</label>
                                    <Dropdown
                                        options={reasonOptions}
                                        onSelect={(value) => handleInputChange('reason', value)}
                                        defaultValue={formData.reason}
                                        placeholder='Select reason'
                                        className='w-full'
                                        triggerClassName='w-full px-3 py-1 border border-gray-300 rounded-sm bg-white flex items-center justify-between text-left'
                                        menuClassName='absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-lg shadow-lg'
                                        optionClassName='px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer'
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Add New Property
                                    </label>
                                    <Dropdown
                                        options={propertyOptions}
                                        onSelect={(value) => handleInputChange('newProperty', value)}
                                        defaultValue={formData.newProperty}
                                        placeholder='Select new property'
                                        className='w-full'
                                        triggerClassName='w-full px-3 py-1 border border-gray-300 rounded-sm bg-white flex items-center justify-between text-left'
                                        menuClassName='absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-lg shadow-lg'
                                        optionClassName='px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer'
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Current Enquiry Section */}
                            <div>
                                <h3 className='text-sm font-medium text-gray-700 mb-2'>Current Enquiry</h3>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Task Status
                                        </label>
                                        <Dropdown
                                            options={taskStatusOptions}
                                            onSelect={() => {}}
                                            defaultValue='Complete'
                                            placeholder='Complete'
                                            className='w-full'
                                            triggerClassName='w-full px-3 py-1 border bg-gray-50 text-gray-500 border-gray-300 rounded-sm flex items-center justify-between text-left cursor-not-allowed opacity-80'
                                            menuClassName='absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-lg shadow-lg'
                                            optionClassName='px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-50 cursor-pointer'
                                            disabled={true}
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Lead Status
                                        </label>
                                        <input
                                            type='text'
                                            value='Property Changed'
                                            disabled
                                            className='w-full px-3 py-1 border border-gray-300 rounded-sm bg-gray-50 text-gray-500'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* New Enquiry Section */}
                            <div>
                                <h3 className='text-sm font-medium text-gray-700 mb-2'>New Enquiry</h3>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Lead Status
                                        </label>
                                        <input
                                            type='text'
                                            value='Interested'
                                            disabled
                                            className='w-full px-3 py-1 border border-gray-300 rounded-sm bg-gray-50 text-gray-500'
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
                                            triggerClassName='w-full px-3 py-1 border border-gray-300 rounded-sm bg-white flex items-center justify-between text-left'
                                            menuClassName='absolute z-10 w-fit mt-1 bg-white border border-gray-300 rounded-lg shadow-lg'
                                            optionClassName='px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer'
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Note Textarea */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Add Note (Optional)
                                </label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => handleNoteChange(e.target.value)}
                                    rows={4}
                                    disabled={isLoading}
                                    className='w-full px-3 py-1 border border-gray-300 rounded-sm resize-none'
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
                            disabled={isLoading}
                            className='px-6 py-2 w-fit bg-blue-500 text-white rounded-sm text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                            {isLoading && (
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                            )}
                            {isLoading ? 'Changing...' : 'Change Property'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChangePropertyModal
