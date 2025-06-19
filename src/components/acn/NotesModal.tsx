import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addNoteToLead, fetchLeadWithNotes } from '../../services/acn/leads/leadsService'
import { selectNotesByLeadId, selectNotesLoading } from '../../store/reducers/acn/leadsReducers'
import type { AppDispatch, RootState } from '../../store'

interface NotesModalProps {
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

const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose, rowData }) => {
    const dispatch = useDispatch<AppDispatch>()
    const [internalNote, setInternalNote] = useState('')

    // Redux selectors
    const notes = useSelector((state: RootState) => (rowData ? selectNotesByLeadId(state, rowData.leadId) : []))
    const notesLoading = useSelector((state: RootState) => selectNotesLoading(state))

    // Fetch notes when modal opens
    useEffect(() => {
        if (isOpen && rowData) {
            dispatch(fetchLeadWithNotes(rowData.leadId))
        }
    }, [isOpen, rowData, dispatch])

    const handleAddNote = async () => {
        if (internalNote.trim() && rowData) {
            try {
                const noteData = {
                    kamId: rowData.kamId || 'CURRENT_USER',
                    note: internalNote.trim(),
                    source: 'direct',
                }

                await dispatch(addNoteToLead({ leadId: rowData.leadId, noteData })).unwrap()
                setInternalNote('')
            } catch (error) {
                console.error('Failed to add note:', error)
            }
        }
    }

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // const getSourceBadge = (source: string) => {
    //     const colors = {
    //         whatsapp: 'bg-green-100 text-green-800',
    //         direct: 'bg-blue-100 text-blue-800',
    //         facebook: 'bg-blue-100 text-blue-800',
    //         instagram: 'bg-pink-100 text-pink-800',
    //         referral: 'bg-purple-100 text-purple-800'
    //     }

    //     return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    // }

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
                                <div className='flex flex-wrap gap-2 text-xs'>
                                    <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded'>
                                        {rowData.leadStatus}
                                    </span>
                                    <span className='px-2 py-1 bg-green-100 text-green-800 rounded'>
                                        {rowData.contactStatus}
                                    </span>
                                    {rowData.kamName && (
                                        <span className='px-2 py-1 bg-purple-100 text-purple-800 rounded'>
                                            KAM: {rowData.kamName}
                                        </span>
                                    )}
                                </div>
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

                    {/* Notes Section */}
                    <div className='flex-1 p-6 overflow-y-auto'>
                        {/* Internal Notes Section */}
                        <div className='mb-8'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>Internal Notes</h3>
                            <div className='relative'>
                                <textarea
                                    value={internalNote}
                                    onChange={(e) => setInternalNote(e.target.value)}
                                    className='w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                                    placeholder='Add your internal notes here...'
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={!internalNote.trim() || notesLoading}
                                    className='absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors'
                                >
                                    {notesLoading ? (
                                        <div className='w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin' />
                                    ) : (
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                                            />
                                        </svg>
                                    )}
                                    Add Note
                                </button>
                            </div>
                        </div>

                        {/* Notes History Section */}
                        <div>
                            <h3 className='text-lg font-medium text-gray-900 mb-6'>Notes ({notes.length})</h3>

                            {notesLoading && notes.length === 0 ? (
                                <div className='flex justify-center py-8'>
                                    <div className='w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                                </div>
                            ) : notes.length === 0 ? (
                                <div className='text-center py-8 text-gray-500'>No notes added yet</div>
                            ) : (
                                <div className='space-y-6'>
                                    {notes.map((note, index) => (
                                        <div key={`${note.timestamp}-${index}`} className='space-y-3'>
                                            <div className='flex justify-between items-center'>
                                                <div className='flex items-center gap-2'>
                                                    {/* <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceBadge(note.source)}`}>
                                                        {note.source}
                                                    </span> */}
                                                    <span className='text-xs text-gray-500'>by {note.kamId}</span>
                                                </div>
                                                <div className='text-xs text-gray-400'>
                                                    {formatTimestamp(note.timestamp)}
                                                </div>
                                            </div>
                                            <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                                                <div className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap'>
                                                    {note.note}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className='p-6 border-t border-gray-200'>
                        <div className='flex justify-between items-center'>
                            <div className='text-sm text-gray-500'>
                                Last tried:{' '}
                                {rowData.lastTried ? new Date(rowData.lastTried).toLocaleDateString() : 'Never'}
                            </div>
                            <button
                                onClick={onClose}
                                className='px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NotesModal
