import React, { useState } from 'react'

interface DocumentItem {
    CommencementCertificate?: string
    approvalCertificate?: string
    approvedBuildingPlan?: string
    environmentalClearance?: string
    occupancyCertificate?: string
    phaseName: string
}

interface PostReraDocumentProps {
    documents?: DocumentItem[]
}

const PostReraDocument: React.FC<PostReraDocumentProps> = ({ documents = [] }) => {
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null)

    const togglePhase = (phaseName: string) => {
        setExpandedPhase((prevPhase) => (prevPhase === phaseName ? null : phaseName))
    }

    const getAvailableDocuments = (doc: DocumentItem) => {
        const docMap = [
            { name: 'Commencement Certificate', url: doc.CommencementCertificate },
            { name: 'Occupancy Certificate', url: doc.occupancyCertificate },
            { name: 'Approved Building Plan', url: doc.approvedBuildingPlan },
            { name: 'Environmental Clearance', url: doc.environmentalClearance },
            { name: 'Approval Certificate', url: doc.approvalCertificate },
        ]

        return docMap.filter((item) => item.url && item.url.trim() !== '')
    }

    return (
        <div className='max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen'>
            {/* Breadcrumb */}
            <div className='flex items-center text-sm text-gray-600 mb-6'>
                <span>Post-Rera</span>
                <span className='mx-2'>/</span>
                <span>Documents</span>
            </div>

            {/* Header */}
            <div className='flex items-center justify-between mb-8'>
                <h1 className='text-2xl font-bold text-gray-900'>Project Phases</h1>
            </div>

            {/* Document Phases */}
            <div className='space-y-4'>
                {documents.map((doc, index) => {
                    const availableDocuments = getAvailableDocuments(doc)
                    const isExpanded = expandedPhase === doc.phaseName

                    return (
                        <div key={index} className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                            {/* Phase Header */}
                            <div
                                className='flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors'
                                onClick={() => togglePhase(doc.phaseName)}
                            >
                                <h2 className='text-lg font-semibold text-gray-900'>{doc.phaseName}</h2>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className='px-6 pb-6 border-t border-gray-100'>
                                    {availableDocuments.length > 0 ? (
                                        <div className='flex flex-wrap gap-4 mt-4'>
                                            {availableDocuments.map((document, docIndex) => (
                                                <a
                                                    key={docIndex}
                                                    href={document.url}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group'
                                                >
                                                    <div className='p-2 bg-blue-50 rounded-md group-hover:bg-blue-100 transition-colors'></div>
                                                    <span className='text-sm font-medium text-gray-700 group-hover:text-gray-900'>
                                                        {document.name}
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className='mt-4 text-center py-8 text-gray-500'>
                                            No documents available for this phase
                                        </div>
                                    )}

                                    {availableDocuments.length > 0 && (
                                        <div className='mt-4 text-right'>
                                            <button className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
                                                View All Documents
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Empty State */}
            {documents.length === 0 && (
                <div className='text-center py-12'>
                    {/* <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" /> */}
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>No documents available</h3>
                    <p className='text-gray-500'>Documents will appear here once they are uploaded.</p>
                </div>
            )}
        </div>
    )
}

export default PostReraDocument
