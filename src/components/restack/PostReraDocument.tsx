import React, { useState } from 'react'

interface Document {
    name: string
    url: string
}

interface PostReraDocumentProps {
    documents?: Document[]
}

const PostReraDocument: React.FC<PostReraDocumentProps> = ({ documents = [] }) => {
    const [expandedDocument, setExpandedDocument] = useState<string | null>(null)

    const toggleDocument = (documentName: string) => {
        setExpandedDocument((prevDocument) => (prevDocument === documentName ? null : documentName))
    }

    return (
        <div className='container mx-auto mt-8'>
            <h1 className='text-2xl font-bold mb-4'>Project Documents</h1>

            {documents.map((document) => (
                <div key={document.name} className='bg-white rounded-lg shadow-md mb-4'>
                    <div
                        className='flex items-center justify-between px-4 py-2 cursor-pointer'
                        onClick={() => toggleDocument(document.name)}
                    >
                        <h2 className='text-lg font-semibold'>{document.name}</h2>
                        <svg
                            className={`w-6 h-6 transition-transform transform ${
                                expandedDocument === document.name ? 'rotate-180' : ''
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

                    {expandedDocument === document.name && (
                        <div className='p-4'>
                            <div className='flex flex-wrap gap-4 mb-4'>
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
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default PostReraDocument
