import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { addNoteToLead, fetchLeadWithNotes } from '../../services/acn/leads/leadsService'
import { addNoteToAgent, fetchAgentWithNotes } from '../../services/acn/agents/agentThunkService'
import type { AppDispatch } from '../../store'
import note from '/icons/acn/note.svg'
import crossic from '/icons/acn/cross.svg'
import { toast } from 'react-toastify'
import copyic from '/icons/acn/copy-icon.svg'

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
                    source: 'direct' as const,
                    archive: false as const,
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
            {/* Overlay */}
            <div className='fixed inset-0 bg-black/75 z-40' onClick={onClose} />

            {/* Modal */}
            <div
                className='fixed top-0 right-0 h-full min-w-[25%] bg-white z-50 shadow-2xl border-l border-gray-200'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex flex-col h-full px-4 py-2 '>
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

                    {/* Notes Section */}
                    <div className='flex-1 flex flex-col gap-6 pr-1 overflow-y-auto'>
                        {/* Internal Notes Section */}
                        <div className='pt-6 flex flex-col gap-4'>
                            <h3 className='text-base font-semibold text-gray-900'>Internal Notes</h3>
                            <div className='relative'>
                                <textarea
                                    value={internalNote}
                                    onChange={(e) => setInternalNote(e.target.value)}
                                    className='w-full h-32 p-4 border border-gray-300 rounded-lg text-sm bg-[#FAFAFA]'
                                />
                            </div>
                            <div className='flex justify-end'>
                                <button
                                    onClick={handleAddNote}
                                    disabled={!internalNote.trim() || notesLoading}
                                    className='flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-200 text-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors'
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
                        <div className='flex flex-col gap-2'>
                            <h3 className='text-base font-semibold text-gray-900'>Notes</h3>

                            {notesLoading && notes.length === 0 ? (
                                <div className='flex justify-center'>
                                    <div className='w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                                </div>
                            ) : notes.length === 0 ? (
                                <div className='text-center py-8 text-gray-500'>No notes added yet</div>
                            ) : (
                                <div className='flex flex-col gap-4'>
                                    {notes.map((noteItem, index) => (
                                        <div key={`${noteItem.timestamp}-${index}`} className='flex flex-col gap-3'>
                                            <div className='flex justify-end items-center'>
                                                <div className='text-xs text-gray-400'>
                                                    {`${formatTimestamp(noteItem.timestamp)} by ${noteItem.kamName}`}
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
