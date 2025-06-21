import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { addNoteToLead, fetchLeadWithNotes } from '../../services/acn/leads/leadsService'
import { addNoteToAgent, fetchAgentWithNotes } from '../../services/acn/agents/agentThunkService'
import type { AppDispatch } from '../../store'
import copyIcon from '../../../public/icons/acn/copy-icon.svg'
import cross from '../../../public/icons/acn/cross.svg'
import note from '../../../public/icons/acn/note.svg'

interface NotesModalProps {
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
        lastConnect?: number
        lastConnected?: number
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
    const location = useLocation()
    const [internalNote, setInternalNote] = useState('')
    const [notes, setNotes] = useState<any[]>([]) // Store notes in local state
    const [notesLoading, setNotesLoading] = useState(false)

    // Determine context based on URL
    const isLeadsContext = location.pathname.includes('/acn/leads')
    const isAgentsContext = location.pathname.includes('/acn/agents')

    // Fetch notes when modal opens
    useEffect(() => {
        if (isOpen && rowData) {
            const fetchNotes = async () => {
                try {
                    setNotesLoading(true)

                    if (isLeadsContext && rowData.leadId) {
                        // For leads, get data directly from thunk
                        const leadNotes = await dispatch(fetchLeadWithNotes(rowData.leadId)).unwrap()
                        setNotes(leadNotes)
                        console.log('Fetching lead notes for:', rowData.leadId, leadNotes)
                    } else if (isAgentsContext && rowData.cpId) {
                        // For agents, get data directly from thunk
                        const agentNotes = await dispatch(fetchAgentWithNotes(rowData.cpId)).unwrap()
                        setNotes(agentNotes)
                        console.log('Fetching agent notes for:', rowData.cpId, agentNotes)
                    }
                } catch (error) {
                    console.error('Error fetching notes:', error)
                    setNotes([])
                } finally {
                    setNotesLoading(false)
                }
            }

            fetchNotes()
        }
    }, [isOpen, rowData, dispatch, isLeadsContext, isAgentsContext])

    const handleAddNote = async () => {
        if (internalNote.trim() && rowData) {
            try {
                setNotesLoading(true)
                const noteData = {
                    kamId: rowData.kamId || 'CURRENT_USER',
                    note: internalNote.trim(),
                    source: 'direct',
                }

                if (isLeadsContext && rowData.leadId) {
                    await dispatch(addNoteToLead({ leadId: rowData.leadId, noteData })).unwrap()
                    // Refresh notes for leads - get fresh data directly
                    const updatedNotes = await dispatch(fetchLeadWithNotes(rowData.leadId)).unwrap()
                    setNotes(updatedNotes)
                } else if (isAgentsContext && rowData.cpId) {
                    await dispatch(addNoteToAgent({ cpId: rowData.cpId, noteData })).unwrap()
                    // Refresh notes for agents - get fresh data directly
                    const updatedNotes = await dispatch(fetchAgentWithNotes(rowData.cpId)).unwrap()
                    setNotes(updatedNotes)
                }

                setInternalNote('')
            } catch (error) {
                console.error('Failed to add note:', error)
            } finally {
                setNotesLoading(false)
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
                <div className='flex flex-col h-full px-4 py-2 '>
                    {/* Header */}
                    <div className='flex items-start justify-between border-b border-gray-200'>
                        <div className='flex-1 py-4'>
                            <div className='text-sm mb-2'>{displayId}</div>
                            <h2 className='text-xl font-bold text-gray-900'>{rowData.name}</h2>
                            <div className='text-xs text-gray-500 mt-1'>{isLeadsContext ? 'Lead' : 'Agent'} Notes</div>
                        </div>
                        <div className='flex flex-col items-end p-2'>
                            <button onClick={onClose} className='bg-gray-200 rounded-full cursor-pointer mb-3'>
                                <img src={cross} alt='Icon' className='w-7 h-7' />
                            </button>

                            <div className='flex items-center gap-2'>
                                <button
                                    onClick={() => navigator.clipboard.writeText(phoneNumber)}
                                    className='flex items-center p-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm text-gray-700 transition-colors cursor-pointer'
                                >
                                    <img src={copyIcon} alt='Copy' className='w-4 h-4' />
                                </button>
                                <span className='text-sm text-black'>{phoneNumber}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className='flex-1 pr-1 overflow-y-auto'>
                        {/* Internal Notes Section */}
                        <div className='mb-4 px-4 pt-7 pb-8'>
                            <h3 className='text-base font-semibold text-gray-900 mb-4'>Internal Notes</h3>
                            <div className='relative'>
                                <textarea
                                    value={internalNote}
                                    onChange={(e) => setInternalNote(e.target.value)}
                                    className='w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={!internalNote.trim() || notesLoading}
                                    className='absolute right-0 mt-2 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-200 text-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors'
                                >
                                    {notesLoading ? (
                                        <div className='w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin' />
                                    ) : (
                                        <img src={note} alt='Copy' className='w-4 h-4' />
                                    )}
                                    <span>Add Note</span>
                                </button>
                            </div>
                        </div>

                        {/* Notes History Section */}
                        <div>
                            <h3 className='text-base font-semibold text-gray-900 mb-6'>Notes</h3>

                            {notesLoading && notes.length === 0 ? (
                                <div className='flex justify-center py-8'>
                                    <div className='w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                                </div>
                            ) : notes.length === 0 ? (
                                <div className='text-center py-8 text-gray-500'>No notes added yet</div>
                            ) : (
                                <div className='space-y-6'>
                                    {notes.map((noteItem, index) => (
                                        <div key={`${noteItem.timestamp}-${index}`} className='space-y-3'>
                                            <div className='flex justify-end items-center'>
                                                <div className='text-xs text-gray-400'>
                                                    {formatTimestamp(noteItem.timestamp)}
                                                </div>
                                            </div>
                                            <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                                                <div className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap'>
                                                    {noteItem.note}
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
                        <div className='flex justify-end items-center'>
                            <button
                                onClick={onClose}
                                className='px-4 py-2 text-gray-600 bg-gray-200 text-sm font-medium transition-colors rounded-sm'
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
