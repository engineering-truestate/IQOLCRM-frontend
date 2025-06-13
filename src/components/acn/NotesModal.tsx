import React, { useState } from 'react'

interface NoteEntry {
    id: string
    title: string
    content: string
    timestamp: string
}

interface NotesModalProps {
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

const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose, rowData }) => {
    const [notes, setNotes] = useState<NoteEntry[]>([
        {
            id: '1',
            title: 'Connected over Call on 25 May',
            content:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it .....",
            timestamp: '25 May 2023',
        },
        {
            id: '2',
            title: 'Not connected on 25 May',
            content:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it .....",
            timestamp: '25 May 2023',
        },
    ])

    const [internalNote, setInternalNote] = useState('')

    const handleAddNote = () => {
        if (internalNote.trim()) {
            const today = new Date().toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            })

            const note: NoteEntry = {
                id: Date.now().toString(),
                title: `Note added on ${today}`,
                content: internalNote,
                timestamp: today,
            }

            setNotes([note, ...notes])
            setInternalNote('')
            onClose()
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
                                    className='absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors'
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                                        />
                                    </svg>
                                    Add Note
                                </button>
                            </div>
                        </div>

                        {/* Notes History Section */}
                        <div>
                            <h3 className='text-lg font-medium text-gray-900 mb-6'>Notes</h3>
                            <div className='space-y-6'>
                                {notes.map((note) => (
                                    <div key={note.id} className='space-y-3'>
                                        <div className='text-sm text-gray-600 text-center'>{note.title}</div>
                                        <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                                            <div className='text-sm text-gray-700 leading-relaxed'>{note.content}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NotesModal
