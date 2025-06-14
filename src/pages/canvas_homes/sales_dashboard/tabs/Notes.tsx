import React, { useState } from 'react'

interface Note {
    id: string
    timestamp: string
    content: string
    agent: string
}

interface TaskSection {
    id: string
    title: string
    notes: Note[]
}

const NotesTab: React.FC = () => {
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        'lead-registration': true,
        'site-visit': true,
        'eoi-submitted': true,
        booking: true,
        'follow-up': true,
    })

    const taskSections: TaskSection[] = [
        {
            id: 'lead-registration',
            title: 'Lead Registration',
            notes: [
                {
                    id: '1',
                    timestamp: 'May 20, 2023 | 2:10 PM',
                    content: 'Lead generated from website inquiry. Customer looking for 2/3 BHK in North Bangalore.',
                    agent: 'Rajesh Kumar',
                },
                {
                    id: '2',
                    timestamp: 'May 20, 2023 | 2:25 PM',
                    content:
                        'Basic qualification done - Budget 80L-1.2Cr, timeline 6-8 months. Genuine buyer, scheduled site visit.',
                    agent: 'Rajesh Kumar',
                },
                {
                    id: '3',
                    timestamp: 'May 20, 2023 | 3:15 PM',
                    content:
                        'Customer details captured in CRM. Contact preference: WhatsApp and calls between 10 AM - 7 PM.',
                    agent: 'System',
                },
            ],
        },
        {
            id: 'site-visit',
            title: 'Site Visit',
            notes: [
                {
                    id: '4',
                    timestamp: 'May 25, 2023 | 11:30 AM',
                    content: 'Site Visit good. Giving EOI by cheque on Tuesday. (Non Bankable)',
                    agent: 'Ish Vinayak',
                },
                {
                    id: '5',
                    timestamp: 'May 25, 2023 | 11:30 AM',
                    content: 'Client is busy on Saturday, visit rescheduled to Sunday same time.',
                    agent: 'Ish Vinayak',
                },
                {
                    id: '6',
                    timestamp: 'May 21, 2023 | 11:00 AM',
                    content: 'First site visit with customer and spouse. Showed sample flat and amenities.',
                    agent: 'Priya Singh',
                },
                {
                    id: '7',
                    timestamp: 'May 21, 2023 | 12:15 PM',
                    content:
                        'Customer impressed with build quality and location. Spouse concerned about school proximity - shared nearby school list.',
                    agent: 'Priya Singh',
                },
                {
                    id: '8',
                    timestamp: 'May 21, 2023 | 12:45 PM',
                    content: 'Customer particularly liked Unit 1204 in Tower B. East facing with good ventilation.',
                    agent: 'Priya Singh',
                },
            ],
        },
        {
            id: 'eoi-submitted',
            title: 'EOI Submitted',
            notes: [
                {
                    id: '9',
                    timestamp: 'May 22, 2023 | 5:20 PM',
                    content:
                        'Customer ready to book Unit 1204 in Tower B. EOI amount Rs. 2,00,000 to be paid by cheque.',
                    agent: 'Ish Vinayak',
                },
                {
                    id: '10',
                    timestamp: 'May 22, 2023 | 5:35 PM',
                    content:
                        'EOI received successfully. Cheque No. 456789 dated 22-May-2023. Booking confirmation sent.',
                    agent: 'Ish Vinayak',
                },
                {
                    id: '11',
                    timestamp: 'May 22, 2023 | 6:00 PM',
                    content:
                        'EOI documents uploaded to customer portal. Welcome kit and payment schedule shared via email.',
                    agent: 'Ish Vinayak',
                },
            ],
        },
        {
            id: 'booking',
            title: 'Booking',
            notes: [
                {
                    id: '12',
                    timestamp: 'May 26, 2023 | 10:30 AM',
                    content:
                        'Booking agreement prepared for Unit 1204. Customer to visit office for documentation on Monday.',
                    agent: 'Deepak Sharma',
                },
                {
                    id: '13',
                    timestamp: 'May 26, 2023 | 11:00 AM',
                    content: 'Home loan documentation checklist shared. Customer has pre-approval from HDFC Bank.',
                    agent: 'Deepak Sharma',
                },
                {
                    id: '14',
                    timestamp: 'May 26, 2023 | 2:15 PM',
                    content: 'Final payment schedule confirmed. 20% down payment, remaining through home loan EMI.',
                    agent: 'Deepak Sharma',
                },
            ],
        },
        {
            id: 'follow-up',
            title: 'Follow Up & Communication',
            notes: [
                {
                    id: '15',
                    timestamp: 'May 25, 2023 | 11:30 AM',
                    content: 'Customer asked to plan a visit on Saturday around 2:00 PM, Meet at Hebal.',
                    agent: 'Ish Vinayak',
                },
                {
                    id: '16',
                    timestamp: 'May 25, 2023 | 11:30 AM',
                    content: 'Interested, Discuss with family asked to call on Monday.',
                    agent: 'Ish Vinayak',
                },
                {
                    id: '17',
                    timestamp: 'May 24, 2023 | 3:45 PM',
                    content: 'Followed up via WhatsApp. Customer confirmed budget of 1.2-1.5Cr for 3BHK unit.',
                    agent: 'Shrikant',
                },
                {
                    id: '18',
                    timestamp: 'May 24, 2023 | 4:00 PM',
                    content: 'Shared project brochure and floor plans. Customer likes the east-facing units.',
                    agent: 'Shrikant',
                },
                {
                    id: '19',
                    timestamp: 'May 23, 2023 | 10:15 AM',
                    content: 'Customer wants to discuss payment plan options. Scheduled call for tomorrow at 11 AM.',
                    agent: 'Deepak Sharma',
                },
                {
                    id: '20',
                    timestamp: 'May 23, 2023 | 2:30 PM',
                    content:
                        'Call completed. Explained flexible payment plans and construction-linked plan. Customer interested.',
                    agent: 'Deepak Sharma',
                },
            ],
        },
    ]

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }))
    }

    return (
        <div className='bg-white p-4.5'>
            {/* Task Sections */}
            <div className='flex flex-col gap-4.5'>
                {taskSections.map((section) => (
                    <div key={section.id} className='border border-gray-300 border-2 rounded-md h-45'>
                        {/* Task Header */}
                        <div className='flex items-center h-10 justify-between cursor-pointer border-b-2 border-gray-300 rounded-t-md'>
                            <div>
                                <h3 className='font-medium text-sm'>{section.title}</h3>
                            </div>
                        </div>

                        {/* Notes List - Scrollable */}
                        {expandedSections[section.id] && (
                            <div className='p-4 pb-0 h-31 overflow-y-auto space-y-3 pr-2 scrollbar-hide'>
                                {section.notes.map((note) => (
                                    <div key={note.id}>
                                        <div className='flex items-start justify-between mb-2'>
                                            <span className='text-xs text-gray-500'>{note.timestamp}</span>
                                        </div>
                                        <p className='text-sm text-gray-900 leading-relaxed'>{note.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default NotesTab
