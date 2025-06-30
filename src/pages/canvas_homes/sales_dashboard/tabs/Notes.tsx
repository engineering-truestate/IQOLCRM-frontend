import React, { useState } from 'react'
import type { NoteItem } from '../../../../services/canvas_homes/types'
import { formatUnixDateTime } from '../../../../components/helper/getUnixDateTime'

interface NotesProps {
    notes: NoteItem[]
    onAddNote: (noteData: { agentId: string; agentName: string; taskType: string; note: string }) => Promise<void>
    loading: boolean
    agentName: string | null
}

interface Note {
    id: string
    timestamp: number
    content: string
    agent: string
}

interface TaskSection {
    id: string
    title: string
    notes: Note[]
}

const Notes: React.FC<NotesProps> = ({ notes = [], loading, agentName }) => {
    const [expandedSections, _setExpandedSections] = useState<{ [key: string]: boolean }>({
        'lead-registration': true,
        'site-visit': true,
        'eoi-submitted': true,
        booking: true,
        'follow-up': true,
        'initial-contact': true,
    })

    // Convert Firebase notes to display format
    const convertFirebaseNotes = (firebaseNotes: NoteItem[]): Note[] => {
        return firebaseNotes.map((note, index) => ({
            id: `${note?.timestamp}-${index}`,
            timestamp: typeof note?.timestamp === 'number' ? note.timestamp : 0,
            content: note?.note,
            agent: note?.agentName,
        }))
    }

    // Group notes by task type
    const groupNotesByTaskType = (firebaseNotes: NoteItem[]) => {
        // console.log('Firebase Notes:', firebaseNotes.length)
        const convertedNotes = convertFirebaseNotes(firebaseNotes)

        // console.log('Hare Krishna', convertedNotes.length)

        const sections = [
            { id: 'lead-registration', title: 'Lead Registration', taskTypes: ['lead registration'] },
            { id: 'requirement-collection', title: 'Requirement Collection', taskTypes: ['requirement collection'] },
            { id: 'initial-contact', title: 'Initial Contact', taskTypes: ['initial contact'] },
            { id: 'site-visit', title: 'Site Visit', taskTypes: ['site visit'] },
            { id: 'eoi-submitted', title: 'EOI Submitted', taskTypes: ['eoi collection', 'eoi'] },
            { id: 'booking', title: 'Booking', taskTypes: ['booking'] },
        ]

        return sections.map((section) => ({
            ...section,
            notes: convertedNotes.filter((_, index) => {
                const originalNote = firebaseNotes[index]
                return section.taskTypes.some((taskType) =>
                    originalNote?.taskType?.toLowerCase().includes(taskType.toLowerCase()),
                )
            }),
        }))
    }

    const taskSections: TaskSection[] = notes.length > 0 ? groupNotesByTaskType(notes) : []

    // const toggleSection = (sectionId: string) => {
    //     setExpandedSections((prev) => ({
    //         ...prev,
    //         [sectionId]: !prev[sectionId],
    //     }))
    // }

    if (loading) {
        return (
            <div className='bg-white p-4.5 h-[calc(100vh-110.4px)]'>
                <div className='flex items-center justify-center h-full'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                        <p className='text-gray-600'>Loading notes...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (notes.length === 0) {
        return (
            <div className='bg-white p-4.5 h-[calc(100vh-110.4px)]'>
                <div className='flex items-center justify-center h-full'>
                    <div className='text-center text-gray-500'>
                        <p className='text-lg font-medium text-gray-900 mb-2'>No notes available</p>
                        <p className='text-gray-600'>Notes will appear here when added to the enquiry</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='bg-white p-4.5 h-[calc(100vh-110.4px)]'>
            {/* Task Sections */}
            <div className='flex flex-col gap-4.5 max-h-full overflow-y-auto'>
                {taskSections.map(
                    (section) =>
                        section.notes.length > 0 && (
                            <div key={section.id} className='border border-gray-300 bg-red rounded-md max-h-45 '>
                                {/* Task Header */}
                                <div className='flex items-center h-10 px-2 justify-between cursor-pointer border-b-2 border-gray-300 rounded-t-md'>
                                    <div className='flex flex-row'>
                                        <svg
                                            width='22'
                                            height='22'
                                            viewBox='0 0 22 22'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <path
                                                d='M7.33203 1.83325V4.58325'
                                                stroke='#515162'
                                                stroke-width='1.5'
                                                stroke-miterlimit='10'
                                                stroke-linecap='round'
                                                stroke-linejoin='round'
                                            />
                                            <path
                                                d='M14.668 1.83325V4.58325'
                                                stroke='#515162'
                                                stroke-width='1.5'
                                                stroke-miterlimit='10'
                                                stroke-linecap='round'
                                                stroke-linejoin='round'
                                            />
                                            <path
                                                d='M6.41797 11.9167H13.7513'
                                                stroke='#515162'
                                                stroke-width='1.5'
                                                stroke-miterlimit='10'
                                                stroke-linecap='round'
                                                stroke-linejoin='round'
                                            />
                                            <path
                                                d='M6.41797 15.5833H11.0013'
                                                stroke='#515162'
                                                stroke-width='1.5'
                                                stroke-miterlimit='10'
                                                stroke-linecap='round'
                                                stroke-linejoin='round'
                                            />
                                            <path
                                                d='M14.6667 3.20825C17.7192 3.37325 19.25 4.53742 19.25 8.84575V14.5108C19.25 18.2874 18.3333 20.1758 13.75 20.1758H8.25C3.66667 20.1758 2.75 18.2874 2.75 14.5108V8.84575C2.75 4.53742 4.28083 3.38242 7.33333 3.20825H14.6667Z'
                                                stroke='#515162'
                                                stroke-width='1.5'
                                                stroke-miterlimit='10'
                                                stroke-linecap='round'
                                                stroke-linejoin='round'
                                            />
                                        </svg>

                                        <span>
                                            <h3 className='font-medium text-sm ml-2'>{section.title}</h3>
                                        </span>
                                    </div>
                                    <div>
                                        <span>
                                            <h3 className='font-medium text-sm'>Agent: {agentName}</h3>
                                        </span>
                                    </div>
                                </div>

                                {/* Notes List - Scrollable */}
                                {expandedSections[section.id] && (
                                    <div className='p-4 max-h-31 g overflow-y-auto space-y-3 pr-2 scrollbar-hide'>
                                        {[...section.notes]
                                            .sort((a, b) => b.timestamp - a.timestamp)
                                            .map((note) => (
                                                <div key={note.id}>
                                                    <div className='flex mb-2'>
                                                        <svg
                                                            width='22'
                                                            height='22'
                                                            viewBox='0 0 22 22'
                                                            fill='none'
                                                            xmlns='http://www.w3.org/2000/svg'
                                                        >
                                                            <path
                                                                d='M11.1089 11.7151C11.0447 11.7059 10.9622 11.7059 10.8889 11.7151C9.27552 11.6601 7.99219 10.3401 7.99219 8.7176C7.99219 7.05844 9.33052 5.71094 10.9989 5.71094C12.658 5.71094 14.0055 7.05844 14.0055 8.7176C13.9964 10.3401 12.7222 11.6601 11.1089 11.7151Z'
                                                                stroke='#515162'
                                                                stroke-width='1.5'
                                                                stroke-linecap='round'
                                                                stroke-linejoin='round'
                                                            />
                                                            <path
                                                                d='M17.177 17.7649C15.5453 19.2591 13.382 20.1666 10.9986 20.1666C8.61531 20.1666 6.45198 19.2591 4.82031 17.7649C4.91198 16.9033 5.46198 16.0599 6.44281 15.3999C8.95448 13.7316 13.0611 13.7316 15.5545 15.3999C16.5353 16.0599 17.0853 16.9033 17.177 17.7649Z'
                                                                stroke='#515162'
                                                                stroke-width='1.5'
                                                                stroke-linecap='round'
                                                                stroke-linejoin='round'
                                                            />
                                                            <path
                                                                d='M10.9987 20.1666C16.0613 20.1666 20.1654 16.0625 20.1654 10.9999C20.1654 5.93731 16.0613 1.83325 10.9987 1.83325C5.93609 1.83325 1.83203 5.93731 1.83203 10.9999C1.83203 16.0625 5.93609 20.1666 10.9987 20.1666Z'
                                                                stroke='#515162'
                                                                stroke-width='1.5'
                                                                stroke-linecap='round'
                                                                stroke-linejoin='round'
                                                            />
                                                        </svg>
                                                        <span className='text-[13px] text-gray-500 ml-2'>
                                                            {note.agent} |
                                                        </span>

                                                        <span className='text-[13px] text-gray-500'>
                                                            {formatUnixDateTime(note.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className='text-sm text-gray-900 leading-relaxed'>
                                                        {note.content}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        ),
                )}
            </div>
        </div>
    )
}

export default Notes
