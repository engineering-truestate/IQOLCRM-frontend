import React, { useState } from 'react'

interface CallResultModalProps {
    isOpen: boolean
    onClose: () => void
    rowData: {
        id: string
        agentName: string
        contactNumber: string
        leadStatus: string
        connectStatus: string
        lastTried: string
    } | null
}

const CallResultModal: React.FC<CallResultModalProps> = ({ isOpen, onClose, rowData }) => {
    const [callResult, setCallResult] = useState({
        connection: 'Connected',
        callType: 'On Call',
        direction: 'Out-Bound',
    })

    const [notes, setNotes] = useState('')

    const handleClear = () => {
        setCallResult({
            connection: '',
            callType: '',
            direction: '',
        })
        setNotes('')
    }

    const handleSaveNote = () => {
        // Logic to save the call result and notes
        console.log('Call Result:', callResult)
        console.log('Notes:', notes)
        onClose()
    }

    if (!isOpen || !rowData) return null

    return (
        <>
            {/* Very light overlay - only covers left 60% */}
            <div className='fixed top-0 left-0 w-[70%] h-full bg-black opacity-50 z-40' onClick={onClose} />

            {/* Modal */}
            <div className='fixed top-0 right-0 h-full w-[30%] bg-white z-50 shadow-2xl border-l border-gray-200'>
                <div className='flex flex-col h-full'>
                    {/* Header */}
                    <div className='p-6 border-b border-gray-200'>
                        <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                                <div className='text-sm text-gray-500 mb-1'>{rowData.id}</div>
                                <h2 className='text-xl font-semibold text-gray-900 mb-2'>{rowData.agentName}</h2>
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
                                    onClick={() => navigator.clipboard.writeText(rowData.contactNumber)}
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
                                    {rowData.contactNumber}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Call Result Section */}
                    <div className='flex-1 p-6 overflow-y-auto'>
                        <div className='mb-8'>
                            <h3 className='text-lg font-medium text-gray-900 mb-6'>Call Result</h3>

                            {/* Connection Status */}
                            <div className='grid grid-cols-2 gap-4 mb-6'>
                                <label className='flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50'>
                                    <input
                                        type='radio'
                                        name='connection'
                                        value='Connected'
                                        checked={callResult.connection === 'Connected'}
                                        onChange={(e) => setCallResult({ ...callResult, connection: e.target.value })}
                                        className='w-4 h-4 accent-black border-gray-300'
                                    />
                                    <span className='ml-3 text-sm font-medium text-gray-900'>Connected</span>
                                </label>

                                <label className='flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50'>
                                    <input
                                        type='radio'
                                        name='connection'
                                        value='Not Connected'
                                        checked={callResult.connection === 'Not Connected'}
                                        onChange={(e) => setCallResult({ ...callResult, connection: e.target.value })}
                                        className='w-4 h-4 accent-black border-gray-300'
                                    />
                                    <span className='ml-3 text-sm font-medium text-gray-900'>Not Connected</span>
                                </label>
                            </div>

                            {/* Call Type - Only show when Connected */}
                            {callResult.connection === 'Connected' && (
                                <div className='grid grid-cols-2 gap-4 mb-6'>
                                    <label className='flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50'>
                                        <input
                                            type='radio'
                                            name='callType'
                                            value='On Call'
                                            checked={callResult.callType === 'On Call'}
                                            onChange={(e) => setCallResult({ ...callResult, callType: e.target.value })}
                                            className='w-4 h-4 accent-black border-gray-300'
                                        />
                                        <span className='ml-3 text-sm font-medium text-gray-900'>On Call</span>
                                    </label>

                                    <label className='flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50'>
                                        <input
                                            type='radio'
                                            name='callType'
                                            value='On WhatsApp'
                                            checked={callResult.callType === 'On WhatsApp'}
                                            onChange={(e) => setCallResult({ ...callResult, callType: e.target.value })}
                                            className='w-4 h-4 accent-black border-gray-300'
                                        />
                                        <span className='ml-3 text-sm font-medium text-gray-900'>On WhatsApp</span>
                                    </label>
                                </div>
                            )}

                            {/* Call Direction - Only show when Connected */}
                            {callResult.connection === 'Connected' && (
                                <div className='grid grid-cols-2 gap-4 mb-8'>
                                    <label className='flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50'>
                                        <input
                                            type='radio'
                                            name='direction'
                                            value='Out-Bound'
                                            checked={callResult.direction === 'Out-Bound'}
                                            onChange={(e) =>
                                                setCallResult({ ...callResult, direction: e.target.value })
                                            }
                                            className='w-4 h-4 accent-black border-gray-300'
                                        />
                                        <span className='ml-3 text-sm font-medium text-gray-900'>Out-Bound</span>
                                    </label>

                                    <label className='flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50'>
                                        <input
                                            type='radio'
                                            name='direction'
                                            value='In-Bound'
                                            checked={callResult.direction === 'In-Bound'}
                                            onChange={(e) =>
                                                setCallResult({ ...callResult, direction: e.target.value })
                                            }
                                            className='w-4 h-4 accent-black border-gray-300'
                                        />
                                        <span className='ml-3 text-sm font-medium text-gray-900'>In-Bound</span>
                                    </label>
                                </div>
                            )}

                            {/* Notes Section */}
                            <div className={callResult.connection === 'Connected' ? '' : 'mt-8'}>
                                <h3 className='text-lg font-medium text-gray-900 mb-4'>Notes</h3>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className='w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                    placeholder='Add your call notes here...'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className='p-6 border-t border-gray-200'>
                        <div className='flex items-center justify-between'>
                            <button
                                onClick={handleClear}
                                className='px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleSaveNote}
                                className='px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors'
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

export default CallResultModal
