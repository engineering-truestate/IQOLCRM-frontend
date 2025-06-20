import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { addCallResultToLead, fetchLeadWithConnectHistory } from '../../services/acn/leads/leadsService'
import { addCallResultToAgent, fetchAgentWithConnectHistory } from '../../services/acn/agents/agentThunkService'
import { selectConnectHistoryLoading } from '../../store/reducers/acn/leadsReducers'
import { selectAgentConnectHistoryLoading } from '../../store/reducers/acn/agentsReducer'
import type { AppDispatch, RootState } from '../../store'
import { toast } from 'react-toastify'
import copyic from '/icons/acn/copy-icon.svg'
import crossic from '/icons/acn/cross.svg'

interface CallModalProps {
    isOpen: boolean
    onClose: () => void
    rowData: {
        leadId?: string
        cpId?: string
        name: string
        phonenumber?: string
        phoneNumber?: string
        leadStatus?: string
        agentStatus?: string
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
    const location = useLocation()

    // Determine if we're in leads or agents context
    const isLeadsContext = location.pathname.includes('/acn/leads')
    const isAgentsContext = location.pathname.includes('/acn/agents')

    // Form state
    const [connection, setConnection] = useState<'connected' | 'not connected' | ''>('connected')
    const [connectMedium, setConnectMedium] = useState<'on call' | 'on whatsapp' | ''>('on call')
    const [direction, setDirection] = useState<'inbound' | 'outbound' | ''>('inbound')
    const [note, setNote] = useState('')

    // Redux selectors - use appropriate selector based on context
    const leadsConnectHistoryLoading = useSelector((state: RootState) => selectConnectHistoryLoading(state))
    const agentsConnectHistoryLoading = useSelector((state: RootState) => selectAgentConnectHistoryLoading(state))

    const connectHistoryLoading = isLeadsContext ? leadsConnectHistoryLoading : agentsConnectHistoryLoading

    // Fetch connect history when modal opens
    useEffect(() => {
        if (isOpen && rowData) {
            if (isLeadsContext && rowData.leadId) {
                dispatch(fetchLeadWithConnectHistory(rowData.leadId))
                console.log('Fetching lead connect history for:', rowData.leadId)
            } else if (isAgentsContext && rowData.cpId) {
                dispatch(fetchAgentWithConnectHistory(rowData.cpId))
                console.log('Fetching agent connect history for:', rowData.cpId)
            }
            console.log('Row data:', rowData)
        }
    }, [isOpen, rowData, dispatch, isLeadsContext, isAgentsContext])

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setConnection('')
            setConnectMedium('')
            setDirection('')
            setNote('')
        }
    }, [isOpen])

    const onClear = () => {
        setConnection('')
        setConnectMedium('')
        setDirection('')
        setNote('')
    }

    const handleAddCallResult = async () => {
        if (rowData) {
            try {
                const callData = {
                    connection,
                    connectMedium,
                    direction,
                }

                if (isLeadsContext && rowData.leadId) {
                    await dispatch(
                        addCallResultToLead({
                            leadId: rowData.leadId,
                            callData,
                            note: note.trim() || undefined,
                        }),
                    ).unwrap()
                } else if (isAgentsContext && rowData.cpId) {
                    await dispatch(
                        addCallResultToAgent({
                            cpId: rowData.cpId,
                            callData,
                            note: note.trim() || undefined,
                        }),
                    ).unwrap()
                }

                // Reset form
                setConnection('')
                setConnectMedium('')
                setDirection('')
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

    // Get the appropriate ID and phone number based on context
    const displayId = isLeadsContext ? rowData.leadId : rowData.cpId
    const phoneNumber = rowData.phonenumber || rowData.phoneNumber || ''

    return (
        <>
            {/* Very light overlay - only covers left 60% */}
            <div className='fixed top-0 left-0 w-[65%] h-full bg-black opacity-50 z-40' onClick={onClose} />

            {/* Modal */}
            <div className='fixed top-0 right-0 h-full w-[35%] bg-white z-50 shadow-2xl border-l border-gray-200'>
                <div className='flex flex-col h-full'>
                    {/* Header */}
                    <div className='px-4 py-2 '>
                        <div className='flex items-start justify-between border-b border-gray-200'>
                            <div className='flex-1 py-4'>
                                <div className='text-sm mb-2'>{displayId}</div>
                                <h2 className='text-xl font-bold text-gray-900'>{rowData.name}</h2>
                                <div className='text-xs text-gray-500 mt-1'>
                                    {isLeadsContext ? 'Lead' : 'Agent'} Contact
                                </div>
                            </div>
                            <div className='flex flex-col items-end p-2'>
                                <button onClick={onClose} className='bg-gray-200 rounded-full cursor-pointer mb-3'>
                                    <img src={crossic} alt='Icon' className='w-7 h-7' />
                                </button>

                                <div className='flex items-center gap-2'>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(phoneNumber)
                                            toast.success('Phone number copied to clipboard')
                                        }}
                                        className='flex items-center p-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm text-gray-700 transition-colors cursor-pointer'
                                    >
                                        <img src={copyic} alt='Copy' className='w-4 h-4' />
                                    </button>
                                    <span className='text-sm '>{phoneNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Call Result Form */}
                    <div className='flex-1 p-6 overflow-y-auto'>
                        {/* Add Call Result Section */}
                        <div className='mb-8'>
                            <p className='text-sm font-semibold mb-4'>Call Result</p>

                            <div className='space-y-3'>
                                {/* Connection Status */}
                                <div>
                                    <div className='flex gap-3'>
                                        <button
                                            onClick={() => setConnection('connected')}
                                            className={`flex flex-1 items-center gap-2 px-4 py-4 rounded-xl text-sm font-medium border transition-colors
                                            ${
                                                connection === 'connected'
                                                    ? 'border-gray-300 bg-white'
                                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                                            }
                                        `}
                                        >
                                            <span
                                                className={`w-4 h-4 rounded-full  flex items-center justify-center
                                            ${connection === 'connected' ? 'border-5 border-black' : 'border-1 border-gray-400'}
                                            `}
                                            >
                                                {connection === 'connected' && (
                                                    <span className='w-2 h-2 rounded-full' />
                                                )}
                                            </span>
                                            <span className='font-normal'>Connected</span>
                                        </button>

                                        <button
                                            onClick={() => setConnection('not connected')}
                                            className={`flex flex-1 items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                                            ${
                                                connection === 'not connected'
                                                    ? 'border-gray-300 bg-white '
                                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                                            }
                                        `}
                                        >
                                            <span
                                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                                            ${connection === 'not connected' ? 'border-5 border-black' : 'border-1 border-gray-400'}
                                            `}
                                            >
                                                {connection === 'not connected' && (
                                                    <span className='w-2 h-2 rounded-full' />
                                                )}
                                            </span>
                                            <span className='font-normal'>Not Connected</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Connect Medium */}
                                {connection === 'connected' && (
                                    <>
                                        <div>
                                            <div className='flex gap-3'>
                                                <button
                                                    onClick={() => setConnectMedium('on call')}
                                                    className={`flex flex-1 items-center gap-2 px-4 py-4 rounded-xl text-sm font-medium border transition-colors
                                            ${
                                                connectMedium === 'on call'
                                                    ? 'border-gray-300 bg-white'
                                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                                            }
                                        `}
                                                >
                                                    <span
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center
                                            ${connectMedium === 'on call' ? 'border-5 border-black' : 'border-1 border-gray-400'}
                                            `}
                                                    >
                                                        {connectMedium === 'on call' && (
                                                            <span className='w-2 h-2 rounded-full' />
                                                        )}
                                                    </span>
                                                    <span className='font-normal'>On Call</span>
                                                </button>

                                                <button
                                                    onClick={() => setConnectMedium('on whatsapp')}
                                                    className={`flex flex-1 items-center gap-2 px-4 py-4 rounded-xl text-sm font-medium border transition-colors
                                            ${
                                                connectMedium === 'on whatsapp'
                                                    ? 'border-gray-300 bg-white'
                                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                                            }
                                        `}
                                                >
                                                    <span
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center
                                            ${connectMedium === 'on whatsapp' ? 'border-5 border-black' : 'border-1 border-gray-400'}
                                            `}
                                                    >
                                                        {connectMedium === 'on whatsapp' && (
                                                            <span className='w-2 h-2 rounded-full' />
                                                        )}
                                                    </span>
                                                    <span className='font-normal'>On WhatsApp</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Direction */}
                                        <div>
                                            <div className='flex gap-3'>
                                                <button
                                                    onClick={() => setDirection('inbound')}
                                                    className={`flex flex-1 items-center gap-2 px-4 py-4 rounded-xl text-sm font-medium border transition-colors
                                            ${
                                                direction === 'inbound'
                                                    ? 'border-gray-300 bg-white'
                                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                                            }
                                        `}
                                                >
                                                    <span
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center
                                            ${direction === 'inbound' ? 'border-5 border-black' : 'border-1 border-gray-400'}
                                            `}
                                                    >
                                                        {direction === 'inbound' && (
                                                            <span className='w-2 h-2 rounded-full' />
                                                        )}
                                                    </span>
                                                    <span className='font-normal'>Inbound</span>
                                                </button>

                                                <button
                                                    onClick={() => setDirection('outbound')}
                                                    className={`flex flex-1 items-center gap-2 px-4 py-4 rounded-xl text-sm font-medium border transition-colors
                                            ${
                                                direction === 'outbound'
                                                    ? 'border-gray-300 bg-white'
                                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                                            }
                                        `}
                                                >
                                                    <span
                                                        className={`w-4 h-4 rounded-full flex items-center justify-center
                                            ${direction === 'outbound' ? 'border-5 border-black' : 'border-1 border-gray-400'}
                                            `}
                                                    >
                                                        {direction === 'outbound' && (
                                                            <span className='w-2 h-2 rounded-full' />
                                                        )}
                                                    </span>
                                                    <span className='font-normal'>Outbound</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Optional Note */}
                                <div className='mt-5'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        <p className='text-base font-semibold '>Notes</p>
                                    </label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className='w-full h-30 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm bg-gray-100'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className='p-6'>
                        <div className='flex justify-end gap-3'>
                            <button
                                onClick={onClear}
                                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors'
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleAddCallResult}
                                disabled={connectHistoryLoading}
                                className='px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                Save note
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CallModal
