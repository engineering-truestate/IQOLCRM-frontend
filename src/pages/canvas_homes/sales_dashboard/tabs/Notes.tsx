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
        <div className='bg-white p-4.5 h-[calc(100vh-110.4px)]'>
            {/* Task Sections */}
            <div className='flex flex-col gap-4.5 max-h-full overflow-y-auto'>
                {taskSections.map((section) => (
                    <div key={section.id} className='border border-gray-300 border-2 bg-red rounded-md h-45'>
                        {/* Task Header */}
                        <div className='flex items-center h-10 px-2 justify-between cursor-pointer border-b-2 border-gray-300 rounded-t-md'>
                            <div className='flex flex-row'>
                                <svg
                                    width='22'
                                    height='22'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'
                                >
                                    <path
                                        d='M20.1654 10.9999C20.1654 5.94908 16.0495 1.83325 10.9987 1.83325C5.94786 1.83325 1.83203 5.94908 1.83203 10.9999C1.83203 13.6583 2.97786 16.0508 4.79286 17.7283C4.79286 17.7374 4.79286 17.7374 4.7837 17.7466C4.87536 17.8383 4.98536 17.9116 5.07703 17.9941C5.13203 18.0399 5.17786 18.0858 5.23286 18.1224C5.39786 18.2599 5.5812 18.3883 5.75536 18.5166C5.81953 18.5624 5.87453 18.5991 5.9387 18.6449C6.11286 18.7641 6.2962 18.8741 6.4887 18.9749C6.55286 19.0116 6.6262 19.0574 6.69036 19.0941C6.8737 19.1949 7.0662 19.2866 7.26786 19.3691C7.3412 19.4058 7.41453 19.4424 7.48786 19.4699C7.68953 19.5524 7.8912 19.6258 8.09286 19.6899C8.1662 19.7174 8.23953 19.7449 8.31286 19.7633C8.53286 19.8274 8.75286 19.8824 8.97286 19.9374C9.03703 19.9558 9.1012 19.9741 9.17453 19.9833C9.4312 20.0383 9.68786 20.0749 9.9537 20.1024C9.99036 20.1024 10.027 20.1116 10.0637 20.1208C10.3754 20.1483 10.687 20.1666 10.9987 20.1666C11.3104 20.1666 11.622 20.1483 11.9245 20.1208C11.9612 20.1208 11.9979 20.1116 12.0345 20.1024C12.3004 20.0749 12.557 20.0383 12.8137 19.9833C12.8779 19.9741 12.942 19.9466 13.0154 19.9374C13.2354 19.8824 13.4645 19.8366 13.6754 19.7633C13.7487 19.7358 13.822 19.7083 13.8954 19.6899C14.097 19.6166 14.3079 19.5524 14.5004 19.4699C14.5737 19.4424 14.647 19.4058 14.7204 19.3691C14.9129 19.2866 15.1054 19.1949 15.2979 19.0941C15.3712 19.0574 15.4354 19.0116 15.4995 18.9749C15.6829 18.8649 15.8662 18.7641 16.0495 18.6449C16.1137 18.6083 16.1687 18.5624 16.2329 18.5166C16.4162 18.3883 16.5904 18.2599 16.7554 18.1224C16.8104 18.0766 16.8562 18.0308 16.9112 17.9941C17.012 17.9116 17.1129 17.8291 17.2045 17.7466C17.2045 17.7374 17.2045 17.7374 17.1954 17.7283C19.0195 16.0508 20.1654 13.6583 20.1654 10.9999ZM15.527 15.5558C13.0429 13.8874 8.97286 13.8874 6.47036 15.5558C6.06703 15.8216 5.73703 16.1333 5.46203 16.4724C4.0687 15.0608 3.20703 13.1266 3.20703 10.9999C3.20703 6.70075 6.69953 3.20825 10.9987 3.20825C15.2979 3.20825 18.7904 6.70075 18.7904 10.9999C18.7904 13.1266 17.9287 15.0608 16.5354 16.4724C16.2695 16.1333 15.9304 15.8216 15.527 15.5558Z'
                                        fill='#606060'
                                    />
                                    <path
                                        d='M11 6.35254C9.1025 6.35254 7.5625 7.89254 7.5625 9.79004C7.5625 11.6509 9.02 13.1634 10.9542 13.2184C10.9817 13.2184 11.0183 13.2184 11.0367 13.2184C11.055 13.2184 11.0825 13.2184 11.1008 13.2184C11.11 13.2184 11.1192 13.2184 11.1192 13.2184C12.9708 13.1542 14.4283 11.6509 14.4375 9.79004C14.4375 7.89254 12.8975 6.35254 11 6.35254Z'
                                        fill='#606060'
                                    />
                                </svg>

                                <span>
                                    <h3 className='font-medium text-sm'>{section.title}</h3>
                                </span>
                            </div>
                            <div>
                                <span>
                                    <h3 className='font-medium text-sm'>Agent:{section.notes[0].agent}</h3>
                                </span>
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
