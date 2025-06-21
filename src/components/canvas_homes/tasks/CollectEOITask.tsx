import React, { useCallback, useState, useEffect } from 'react'
import Dropdown from './Dropdown'
import CloseLeadModal from '../CloseLeadModal'
import type { AppDispatch } from '../../../store'
import { useDispatch } from 'react-redux'
import { clearTaskId, setTaskState } from '../../../store/reducers/canvas-homes/taskIdReducer'
import RescheduleEventModal from '../RescheduleEventModal'
import ChangePropertyModal from '../ChangePropertyModal'
import TaskCompleteModal from '../TaskCompleteModal'
import { taskService } from '../../../services/canvas_homes/taskService'
import { getUnixDateTime } from '../../helper/getUnixDateTime'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../store'

interface CollectEOITaskProps {
    updateTaskState: (taskId: string, key: string, value: any) => void
    getTaskState: (taskId: string, key: string, defaultValue?: any) => any
    updating?: boolean
    setActiveTab?: (tab: string) => void
    eoiEntries: any[]
    taskStatusOptions: Array<{ label: string; value: string }>
}

const CollectEOITask: React.FC<CollectEOITaskProps> = ({
    updateTaskState,
    getTaskState,
    updating = false,
    setActiveTab,
    eoiEntries: existingEoiEntries = [],
    taskStatusOptions,
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const taskId: string = useSelector((state: RootState) => state.taskId.taskId || '')
    const [showRescheduleEventModal, setShowRescheduleEventModal] = useState(false)
    const [showCloseLeadModal, setShowCloseLeadModal] = useState(false)
    const [showChangePropertyModal, setShowChangePropertyModal] = useState(false)
    const [showTaskCompleteModal, setShowTaskCompleteModal] = useState(false)
    const [validationError, setValidationError] = useState('')
    const [isReadOnly, setIsReadOnly] = useState(false)

    // Initialize EOI entries state
    const [eoiEntries, setEoiEntries] = useState([{ amount: '', type: '' }])

    // Check if entries should be in read-only mode (if they already exist with valid data)
    useEffect(() => {
        if (existingEoiEntries && existingEoiEntries.length > 0) {
            setIsReadOnly(true)
            setEoiEntries(existingEoiEntries)
        }
    }, [existingEoiEntries])

    // Update the task state with new entries
    const updateEoiEntries = (newEntries: any[]) => {
        setEoiEntries(newEntries)
        // Note: taskId would need to be passed as prop or obtained from context/redux
        // updateTaskState(taskId, 'eoiEntries', newEntries)
    }

    // Add new EOI entry
    const handleAddEoiEntry = (e: React.MouseEvent) => {
        e.stopPropagation()

        const newEntries = [...eoiEntries, { amount: '', type: '' }]
        updateEoiEntries(newEntries)
    }

    // Remove EOI entry
    const handleRemoveEoiEntry = (index: number) => {
        if (eoiEntries.length > 1) {
            const newEntries = eoiEntries.filter((_, i) => i !== index)
            updateEoiEntries(newEntries)
        }
    }

    // Update EOI entry amount
    const handleAmountChange = (index: number, value: string) => {
        const newEntries = [...eoiEntries]
        newEntries[index].amount = value
        updateEoiEntries(newEntries)
    }

    // Update EOI entry type
    const handleTypeChange = (index: number, value: string) => {
        const newEntries = [...eoiEntries]
        newEntries[index].type = value
        updateEoiEntries(newEntries)
    }

    // Validate if all EOI entries are filled
    const validateEoiEntries = (): boolean => {
        for (let i = 0; i < eoiEntries.length; i++) {
            const entry = eoiEntries[i]
            if (!entry.amount || !entry.type) {
                setValidationError('Please fill all EOI amounts and types')
                return false
            }
        }
        setValidationError('')
        return true
    }

    // Handle proceed button click
    const handleProceed = async (e: React.MouseEvent) => {
        e.stopPropagation()

        // Validate all EOI entries
        if (!validateEoiEntries()) {
            return
        }

        // Note: In a real implementation, you'd need taskId from props or context
        // For now, this shows the structure without the actual service call
        try {
            await taskService.update(taskId, {
                status: 'completed',
                eoiEntries: eoiEntries,
                lastModified: getUnixDateTime(),
                completionDate: getUnixDateTime(),
            })

            // Open task complete modal
            setShowTaskCompleteModal(true)
            clearTaskId()
        } catch (error) {
            console.error('Error updating task:', error)
            setValidationError('Failed to update task. Please try again.')
        }
    }

    const notVisitedOptions = [
        {
            label: 'Reschedule Task',
            value: 'reschedule task',
            modal: useCallback(() => setShowRescheduleEventModal(true), []),
        },
        {
            label: 'Change Property',
            value: 'change property',
            modal: useCallback(() => setShowChangePropertyModal(true), []),
        },
        {
            label: 'Collect Requirement',
            value: 'collect requirement',
            modal: useCallback(() => {
                dispatch(setTaskState('EOI Not Collected'))
                if (setActiveTab) {
                    setActiveTab('Requirements')
                }
            }, [dispatch, setActiveTab]),
        },
        {
            label: 'Close Lead',
            value: 'close lead',
            modal: useCallback(() => setShowCloseLeadModal(true), []),
        },
    ]

    const eoiTypeOptions = [
        { label: 'Select Type', value: '' },
        { label: 'Bankable Check', value: 'bankable' },
        { label: 'Not Bankable Check', value: 'not_bankable' },
    ]

    const handleSelectMode = (value: string) => {
        // Since we don't have taskId directly, this would need to be handled differently
        // updateTaskState(taskId, 'eoiMode', value)
    }

    // Get display value for EOI type
    const getEoiTypeDisplay = (type: string): string => {
        const option = eoiTypeOptions.find((opt) => opt.value === type)
        return option ? option.label : type
    }

    return (
        <div className='space-y-4'>
            {!isReadOnly && (
                <div className='flex gap-3 mb-4'>
                    <button
                        className='flex items-center h-8 w-33.5 justify-between p-2 border border-gray-300 rounded-sm bg-[#40A42B] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                        disabled={updating}
                    >
                        EOI Collected
                    </button>

                    <Dropdown
                        defaultValue=''
                        options={notVisitedOptions}
                        onSelect={handleSelectMode}
                        triggerClassName='flex items-center h-8 w-33.5 w-fit justify-between p-2 border border-gray-300 rounded-sm bg-[#F02532] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer'
                        placeholder='EOI Not Collected'
                        disabled={updating}
                    />
                </div>
            )}

            <div className='space-y-3'>
                {isReadOnly && <h3 className='text-md font-medium text-gray-800'>EOI Details</h3>}

                {eoiEntries.map((entry, index) => (
                    <div key={index} className='flex flex-row gap-2 mb-2'>
                        <div className='w-[207px]'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Type of Check</label>
                            {isReadOnly ? (
                                <div className='w-full h-8 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-xs'>
                                    {getEoiTypeDisplay(entry.type)}
                                </div>
                            ) : (
                                <Dropdown
                                    options={eoiTypeOptions}
                                    defaultValue={entry.type}
                                    onSelect={(value) => handleTypeChange(index, value)}
                                    triggerClassName='flex items-center w-[207px] h-8 justify-between px-2 py-1 border border-gray-300 rounded-sm text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[100px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                    placeholder='Select Type'
                                    disabled={updating}
                                />
                            )}
                        </div>
                        <div className='w-[207px]'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Amount of EOI</label>
                            <div className='relative'>
                                <input
                                    type='text'
                                    placeholder='Text here'
                                    value={entry.amount}
                                    onChange={(e) => handleAmountChange(index, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    disabled={isReadOnly || updating}
                                    readOnly={isReadOnly}
                                    className={`w-full h-8 px-3 py-2 pr-8 border border-gray-300 rounded-md ${
                                        isReadOnly
                                            ? 'bg-gray-50'
                                            : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                />
                                {!isReadOnly &&
                                    (index === eoiEntries.length - 1 ? (
                                        <span
                                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={updating ? undefined : handleAddEoiEntry}
                                        >
                                            +
                                        </span>
                                    ) : (
                                        <span
                                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={updating ? undefined : () => handleRemoveEoiEntry(index)}
                                        >
                                            -
                                        </span>
                                    ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!isReadOnly && (
                <>
                    {validationError && <div className='text-red-500 text-sm'>{validationError}</div>}

                    <button
                        onClick={handleProceed}
                        disabled={updating}
                        className='px-2 bg-blue-500 w-26.5 h-8 text-white text-sm rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {updating ? 'Processing...' : 'Proceed'}
                    </button>
                </>
            )}

            {showRescheduleEventModal && (
                <RescheduleEventModal
                    isOpen={showRescheduleEventModal}
                    onClose={() => setShowRescheduleEventModal(false)}
                    taskType='eoi collection'
                    taskState='eoi not collected'
                />
            )}
            <CloseLeadModal
                isOpen={showCloseLeadModal}
                onClose={() => setShowCloseLeadModal(false)}
                taskType='eoi collection'
                taskState='eoi not collected'
            />
            <ChangePropertyModal
                isOpen={showChangePropertyModal}
                onClose={() => setShowChangePropertyModal(false)}
                taskType='eoi collection'
            />
            <TaskCompleteModal
                isOpen={showTaskCompleteModal}
                onClose={() => setShowTaskCompleteModal(false)}
                title='EOI Collected'
                leadStatus='interested'
                stage='eoi collected'
                state='open'
                taskType='eoi collection'
            />
        </div>
    )
}

export default CollectEOITask
