import { useState } from 'react'
import StateBaseTextField from '../design-elements/StateBaseTextField'
import CrossIcon from '/icons/acn/cross.svg'
import { updateAgentCreditsThunk } from '../../services/acn/agents/agentThunkService'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../store'
import type { IAgent } from '../../data_types/acn/types'
import { toast } from 'react-toastify'
import { updateCurrentAgent } from '../../store/reducers/acn/agentsReducer'

const AddCredits = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [amount, setAmount] = useState<number>(0)
    const dispatch = useDispatch<AppDispatch>()
    const { agentDetails: agentDetails } = useSelector((state: RootState) => state.agents)

    const handleAddCredits = async () => {
        if (!agentDetails?.cpId) {
            console.log(agentDetails, 'agentDetails')
            toast.error('Error! Contact Tech Support to add credits')
            return
        }

        try {
            await dispatch(updateAgentCreditsThunk({ cpId: agentDetails.cpId, credits: amount })).unwrap()

            // Update the Redux state directly with new credits
            const currentCredits = (agentDetails as unknown as IAgent).monthlyCredits || 0
            const newCredits = currentCredits + amount
            dispatch(updateCurrentAgent({ monthlyCredits: newCredits }))

            toast.success('Credits added successfully')
            setAmount(0)
            onClose()
        } catch (error) {
            toast.error('Failed to add credits')
        }
    }
    return (
        <>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div className='fixed inset-0 bg-black/75 z-40' onClick={onClose} />
                    <div
                        className='fixed inset-0 flex justify-center items-center z-50'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='bg-white rounded-lg w-full max-w-md shadow-xl'>
                            {/* Header */}
                            <div className='flex justify-between items-center p-6 border-b border-gray-200'>
                                <h2 className='text-xl font-semibold text-gray-900'>Add Credits</h2>
                                <button
                                    onClick={onClose}
                                    className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                                >
                                    <img src={CrossIcon} alt='close' className='w-8 h-8' />
                                </button>
                            </div>

                            {/* Content */}
                            <div className='p-6'>
                                {/* Current Credits Display */}
                                <div className='mb-6'>
                                    <div className='flex justify-between items-center p-4 bg-gray-50 rounded-lg'>
                                        <span className='text-sm font-medium text-gray-700'>Current Credits</span>
                                        <span className='text-lg font-bold text-gray-900'>
                                            {(agentDetails as unknown as IAgent)?.monthlyCredits || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* Add Credits Form */}
                                <div className='space-y-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Amount to Add
                                        </label>
                                        <StateBaseTextField
                                            type='number'
                                            placeholder='Enter amount'
                                            className='w-full'
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                        />
                                    </div>

                                    <button
                                        className='w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                                        onClick={handleAddCredits}
                                    >
                                        Add Credits
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default AddCredits
