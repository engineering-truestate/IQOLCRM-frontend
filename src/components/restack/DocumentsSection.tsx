import React from 'react'

interface Document {
    name: string
    url: string
}

interface DocumentsSectionProps {
    documents: Document[]
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ documents }) => {
    return (
        <div className='mb-8'>
            <h2 className='text-lg font-semibold text-black mb-4'>Documents</h2>
            {documents.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {documents.map((document, index) => (
                        <a
                            key={index}
                            href={document.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow'
                        >
                            <svg
                                className='w-6 h-6 text-gray-500 mr-2'
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
            ) : (
                <p>No documents available.</p>
            )}
        </div>
    )
}

export default DocumentsSection
