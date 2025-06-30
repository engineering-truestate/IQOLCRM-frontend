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
import { ClipLoader } from 'react-spinners'
import useAuth from '../../hooks/useAuth'

interface CallModalProps {
    isOpen: boolean
    onClose: () => void
    rowData: {
        leadId?: string
        cpId?: string
        name: string
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
    const { user } = useAuth()
    const dispatch = useDispatch<AppDispatch>()
    const location = useLocation()

    // Determine if we're in leads or agents context
    const isLeadsContext = location.pathname.includes('/acn/leads')
    const isAgentsContext = location.pathname.includes('/acn/agents')

    // Form state
    const [connection, setConnection] = useState<'connected' | 'not connected' | ''>('connected')
    const [connectMedium, setConnectMedium] = useState<'on call' | 'on whatsapp' | ''>('on call')
    const [direction, setDirection] = useState<'inbound' | 'outbound' | ''>('outbound')
    const [note, setNote] = useState('')

    // Redux selectors - use appropriate selector based on context
    const leadsConnectHistoryLoading = useSelector((state: RootState) => selectConnectHistoryLoading(state))
    const agentsConnectHistoryLoading = useSelector((state: RootState) => selectAgentConnectHistoryLoading(state))

    const connectHistoryLoading = isLeadsContext ? leadsConnectHistoryLoading : agentsConnectHistoryLoading

    // loader state
    const [isLoading, setIsLoading] = useState(false)

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
            setIsLoading(true)
            try {
                // Set default values if connected and fields are empty
                let finalDirection = direction
                let finalConnectMedium = connectMedium

                if (connection === 'connected') {
                    if (direction === '') {
                        finalDirection = 'outbound'
                    }
                    if (connectMedium === '') {
                        finalConnectMedium = 'on call'
                    }
                }

                const callData = {
                    connection,
                    connectMedium: finalConnectMedium,
                    direction: finalDirection,
                }

                if (isLeadsContext && rowData.leadId) {
                    await dispatch(
                        addCallResultToLead({
                            leadId: rowData.leadId,
                            callData,
                            note: note.trim() || undefined,
                            name: user?.displayName ?? 'Unknown',
                            kamId: rowData.kamId || 'CURRENT_USER',
                        }),
                    ).unwrap()
                    console.log('here', callData)
                    //toast.success('Call result added successfully')
                } else if (isAgentsContext && rowData.cpId) {
                    await dispatch(
                        addCallResultToAgent({
                            cpId: rowData.cpId,
                            callData,
                            note: note.trim() || undefined,
                            name: user?.displayName ?? 'Unknown',
                            kamId: rowData.kamId || 'CURRENT_USER',
                        }),
                    ).unwrap()
                }

                // Reset form
                setConnection('')
                setConnectMedium('')
                setDirection('')
                setNote('')

                // Close modal
                toast.success('Call result added successfully')
                onClose()

                // Reload page to get fresh data
                //window.location.reload()
            } catch (error) {
                console.error('Failed to add call result:', error)
                toast.error('Failed to add call result')
            } finally {
                setIsLoading(false)
            }
        }
    }

    if (!isOpen || !rowData) return null

    // Get the appropriate ID and phone number based on context
    const displayId = isLeadsContext ? rowData.leadId : rowData.cpId
    const phoneNumber = rowData.phoneNumber || rowData.phoneNumber || ''

    return (
        <>
            {/* Overlay */}
            <div className='fixed inset-0 bg-black/75 z-40' onClick={onClose} />

            {/* Modal */}
            <div
                className='fixed top-0 right-0 h-full min-w-[30%] w-fit bg-white z-50 shadow-2xl border-l border-gray-200 p-5'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex flex-col h-full'>
                    {/* Header */}
                    <div className=''>
                        <button
                            onClick={onClose}
                            className='absolute top-4 right-5 bg-gray-200 rounded-full cursor-pointer mb-3'
                        >
                            <img src={crossic} alt='Icon' className='w-7 h-7' />
                        </button>
                        <div className='flex flex-col items-start gap-3 pt-3 pb-4 justify-between border-b border-gray-200'>
                            <div className='flex'>
                                <div className='text-sm mb-2 text-[#0D141C]'>{displayId}</div>
                            </div>
                            <div className='flex flex-row items-center w-full justify-between'>
                                <h2 className='text-xl font-bold text-[#0D141C]'>{rowData.name}</h2>
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
                    <div className='flex-1 pt-6 overflow-y-auto'>
                        {/* Add Call Result Section */}
                        <div className='flex flex-col gap-3'>
                            <p className='text-sm font-semibold'>Call Result</p>

                            <div className='flex flex-col gap-3'>
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
                                <div className='pt-3'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        <p className='text-base font-semibold '>Notes</p>
                                    </label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className='w-full h-30 p-3 border border-[#D4DBE3] rounded-xl resize-none text-sm bg-[#FAFAFA]'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className='px-4 py-3'>
                        {!isLoading ? (
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
                                    Save
                                </button>
                            </div>
                        ) : (
                            <div className='flex justify-end items-center'>
                                <ClipLoader color='#000' />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default CallModal
