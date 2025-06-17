import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addCallResultToLead, fetchLeadWithConnectHistory } from '../../services/acn/leads/leadsService'
import { selectConnectHistoryByLeadId, selectConnectHistoryLoading } from '../../store/reducers/acn/leadsReducers'
import type { AppDispatch, RootState } from '../../store'

interface CallModalProps {
    isOpen: boolean
    onClose: () => void
    rowData: {
        leadId: string
        name: string
        phonenumber: string
        leadStatus: string
        contactStatus: string
        lastTried: number
        lastConnect: number
        kamName?: string
        kamId?: string
        source?: string
        verified?: boolean
        communityJoined?: boolean
        onBroadcast?: boolean
        lastModified: number
    } | null
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, rowData }) => {
    const dispatch = useDispatch<AppDispatch>()

    // Form state
    const [connection, setConnection] = useState<'connected' | 'not connected'>('connected')
    const [connectMedium, setConnectMedium] = useState<'on call' | 'on whatsapp'>('on call')
    const [direction, setDirection] = useState<'inbound' | 'outbound'>('outbound')
    const [note, setNote] = useState('')

    // Redux selectors
    const connectHistoryLoading = useSelector((state: RootState) => selectConnectHistoryLoading(state))

    // Fetch connect history when modal opens
    useEffect(() => {
        if (isOpen && rowData) {
            dispatch(fetchLeadWithConnectHistory(rowData.leadId))
        }
    }, [isOpen, rowData, dispatch])

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setConnection('connected')
            setConnectMedium('on call')
            setDirection('outbound')
            setNote('')
        }
    }, [isOpen])

    const handleAddCallResult = async () => {
        if (rowData) {
            try {
                const callData = {
                    connection,
                    connectMedium,
                    direction,
                }

                await dispatch(
                    addCallResultToLead({
                        leadId: rowData.leadId,
                        callData,
                        note: note.trim() || undefined,
                    }),
                ).unwrap()

                // Reset form
                setConnection('connected')
                setConnectMedium('on call')
                setDirection('outbound')
                setNote('')

                // Close modal
                onClose()

                // Reload page to get fresh data
                window.location.reload()
            } catch (error) {
                console.error('Failed to add call result:', error)
            }
        }
    }

    if (!isOpen || !rowData) return null

    return (
        <>
            {/* Very light overlay - only covers left 60% */}
            <div className='fixed top-0 left-0 w-[60%] h-full bg-black opacity-50 z-40' onClick={onClose} />

            {/* Modal */}
            <div className='fixed top-0 right-0 h-full w-[40%] bg-white z-50 shadow-2xl border-l border-gray-200'>
                <div className='flex flex-col h-full'>
                    {/* Header */}
                    <div className='p-6 border-b border-gray-200'>
                        <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                                <div className='text-sm text-gray-500 mb-1'>{rowData.leadId}</div>
                                <h2 className='text-xl font-semibold text-gray-900 mb-2'>{rowData.name}</h2>
                            </div>

                            <div className='flex flex-col items-end'>
                                <button onClick={onClose} className='pb-2 hover:bg-gray-100 rounded-md'>
                                    <svg
                                        className='w-5 h-5 text-gray-400'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M6 18L18 6M6 6l12 12'
                                        />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => navigator.clipboard.writeText(rowData.phonenumber)}
                                    className='flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 transition-colors'
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                                        />
                                    </svg>
                                    {rowData.phonenumber}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Call Result Form */}
                    <div className='flex-1 p-6 overflow-y-auto'>
                        {/* Add Call Result Section */}
                        <div className='mb-8'>
                            <h3 className='text-lg font-medium text-gray-900 mb-6'>Add Call Result</h3>

                            <div className='space-y-6'>
                                {/* Connection Status */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Connection Status
                                    </label>
                                    <div className='flex gap-3'>
                                        <button
                                            onClick={() => setConnection('connected')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                connection === 'connected'
                                                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                        >
                                            Connected
                                        </button>
                                        <button
                                            onClick={() => setConnection('not connected')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                connection === 'not connected'
                                                    ? 'bg-red-100 text-red-800 border-2 border-red-300'
                                                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                        >
                                            Not Connected
                                        </button>
                                    </div>
                                </div>

                                {/* Connect Medium */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Connect Medium
                                    </label>
                                    <div className='flex gap-3'>
                                        <button
                                            onClick={() => setConnectMedium('on call')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                connectMedium === 'on call'
                                                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                                                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                        >
                                            On Call
                                        </button>
                                        <button
                                            onClick={() => setConnectMedium('on whatsapp')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                connectMedium === 'on whatsapp'
                                                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                        >
                                            On WhatsApp
                                        </button>
                                    </div>
                                </div>

                                {/* Direction */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Direction</label>
                                    <div className='flex gap-3'>
                                        <button
                                            onClick={() => setDirection('inbound')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                direction === 'inbound'
                                                    ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                                                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                        >
                                            Inbound
                                        </button>
                                        <button
                                            onClick={() => setDirection('outbound')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                direction === 'outbound'
                                                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                                                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                        >
                                            Outbound
                                        </button>
                                    </div>
                                </div>

                                {/* Optional Note */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Call Notes (Optional)
                                    </label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className='w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                                        placeholder='Add any notes about this call...'
                                    />
                                </div>

                                {/* Submit Button */}
                            </div>
                        </div>

                        {/* Call History Section */}
                    </div>

                    {/* Footer */}
                    <div className='p-6 border-t border-gray-200'>
                        <div className='flex justify-end'>
                            <button
                                onClick={onClose}
                                className='px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
                            >
                                Close
                            </button>
                            <button
                                onClick={handleAddCallResult}
                                disabled={connectHistoryLoading}
                                className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors'
                            >
                                {connectHistoryLoading ? (
                                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                ) : (
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                                        />
                                    </svg>
                                )}
                                Add Call Result
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CallModal
