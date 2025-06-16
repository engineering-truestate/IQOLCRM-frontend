import React, { useState } from 'react'

interface Document {
    name: string
    url: string
}

interface PostReraDocumentProps {
    documents?: Document[]
}

const PostReraDocument: React.FC<PostReraDocumentProps> = ({ documents = [] }) => {
    const [expandedWing, setExpandedWing] = useState<string | null>(null)

    const toggleWing = (wingName: string) => {
        setExpandedWing((prevWing) => (prevWing === wingName ? null : wingName))
    }

    const wingData = [
        {
            name: 'Shobha Dream Acres Wing 2',
            documents: [
                { name: 'Commencement Certificate', url: 'https://example.com/commencement-certificate.pdf' },
                { name: 'Occupancy Certificate', url: 'https://example.com/occupancy-certificate.pdf' },
                { name: 'Approved Building Plan', url: 'https://example.com/approved-building-plan.pdf' },
            ],
        },
        {
            name: 'Shobha Dream Acres Wing 3',
            documents: [],
        },
        {
            name: 'Shobha Dream Acres Wing 5',
            documents: [],
        },
        {
            name: 'Shobha Dream Acres Wing 6',
            documents: [],
        },
    ]

    return (
        <div className='container mx-auto mt-8'>
            <h1 className='text-2xl font-bold mb-4'>Project Phases</h1>

            {wingData.map((wing) => (
                <div key={wing.name} className='bg-white rounded-lg shadow-md mb-4'>
                    <div
                        className='flex items-center justify-between px-4 py-2 cursor-pointer'
                        onClick={() => toggleWing(wing.name)}
                    >
                        <h2 className='text-lg font-semibold'>{wing.name}</h2>
                        <svg
                            className={`w-6 h-6 transition-transform transform ${
                                expandedWing === wing.name ? 'rotate-180' : ''
                            }`}
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M19 9l-7 7-7-7'
                            ></path>
                        </svg>
                    </div>

                    {expandedWing === wing.name && (
                        <div className='p-4'>
                            <div className='flex flex-wrap gap-4 mb-4'>
                                {wing.documents.map((document) => (
                                    <a
                                        key={document.name}
                                        href={document.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex items-center bg-gray-100 rounded-md px-4 py-2 hover:bg-gray-200 transition-colors'
                                    >
                                        <svg
                                            className='w-5 h-5 mr-2'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                                            ></path>
                                        </svg>
                                        <span>{document.name}</span>
                                    </a>
                                ))}
                            </div>
                            {wing.documents.length > 0 && (
                                <a href='#' className='text-blue-500 hover:underline'>
                                    View All Documents
                                </a>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default PostReraDocument
