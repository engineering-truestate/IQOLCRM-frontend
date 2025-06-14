import React, { useState } from 'react'

interface Document {
    id: string
    name: string
    size: string
    uploadDate: string
    isNew?: boolean
}

const Documents: React.FC = () => {
    const [dragActive, setDragActive] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [documents, setDocuments] = useState<Document[]>([
        {
            id: '1',
            name: 'Property Doc1',
            size: '500kb',
            uploadDate: 'May 20, 2023',
        },
    ])

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            Array.from(e.dataTransfer.files).forEach((file) => {
                handleFileUpload(file)
            })
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            Array.from(e.target.files).forEach((file) => {
                handleFileUpload(file)
            })
        }
        // Reset the input
        e.target.value = ''
    }

    const handleFileUpload = async (file: File) => {
        setUploading(true)

        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const formatFileSize = (bytes: number) => {
            if (bytes < 1024) return `${bytes}b`
            if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}kb`
            return `${Math.round(bytes / (1024 * 1024))}mb`
        }

        const newDoc: Document = {
            id: Date.now().toString(),
            name: file.name,
            size: formatFileSize(file.size),
            uploadDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }),
            isNew: true,
        }

        setDocuments((prev) => [newDoc, ...prev])
        setUploading(false)

        // Remove the "new" indicator after 3 seconds
        setTimeout(() => {
            setDocuments((prev) => prev.map((doc) => (doc.id === newDoc.id ? { ...doc, isNew: false } : doc)))
        }, 3000)
    }

    const handleSelectFile = () => {
        document.getElementById('file-upload')?.click()
    }

    const handleView = (doc: Document) => {
        alert(`Viewing ${doc.name}`)
    }

    const handleDownload = (doc: Document) => {
        alert(`Downloading ${doc.name}`)
    }

    const handleEdit = (doc: Document) => {
        alert(`Editing ${doc.name}`)
    }

    const handleRemove = (docId: string) => {
        setDocuments((prev) => prev.filter((doc) => doc.id !== docId))
    }

    return (
        <div className='bg-white h-full p-4.5 space-y-6'>
            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                    dragActive
                        ? 'border-blue-400 bg-blue-50 scale-105'
                        : uploading
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={!uploading ? handleSelectFile : undefined}
            >
                <div className='mb-4'>
                    {uploading ? (
                        <div className='mx-auto w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin'></div>
                    ) : (
                        <svg className='mx-auto text-gray-400' width='48' height='48' viewBox='0 0 24 24' fill='none'>
                            <path
                                d='M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                            <path
                                d='M14 2V8H20'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                            <path
                                d='M12 18V12'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                            <path
                                d='M9 15L12 12L15 15'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                        </svg>
                    )}
                </div>
                <p className='text-gray-600 mb-2 font-medium'>
                    {uploading ? 'Uploading...' : 'Drag and drop file her'}
                </p>
                <p className='text-sm text-gray-500'>
                    {uploading ? 'Please wait while we process your file' : 'Browse file from your computer'}
                </p>
                <input
                    id='file-upload'
                    type='file'
                    multiple
                    className='hidden'
                    onChange={handleFileSelect}
                    accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.pptx'
                    disabled={uploading}
                />
            </div>

            {/* Document List */}
            <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>Uploaded Documents ({documents.length})</h3>

                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-300 ${
                            doc.isNew
                                ? 'bg-green-50 border-green-200 animate-pulse'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <div className='flex items-center gap-3'>
                            {/* Document Icon */}
                            <div className='flex-shrink-0'>
                                <svg
                                    className={doc.isNew ? 'text-green-600' : 'text-gray-500'}
                                    width='20'
                                    height='20'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                >
                                    <path
                                        d='M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M14 2V8H20'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </div>

                            {/* Document Info */}
                            <div className='flex flex-col'>
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm font-medium text-gray-900'>{doc.name}</span>
                                    <span className='text-xs text-gray-500 bg-white px-2 py-1 rounded border'>
                                        {doc.size}
                                    </span>
                                    {doc.isNew && (
                                        <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium'>
                                            New
                                        </span>
                                    )}
                                </div>
                                <span className='text-xs text-gray-400 mt-1'>Uploaded on {doc.uploadDate}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center gap-1'>
                            <button
                                className='p-2 hover:bg-gray-200 rounded-md transition-colors'
                                title='View document'
                                onClick={() => handleView(doc)}
                            >
                                <svg className='text-gray-500' width='16' height='16' viewBox='0 0 24 24' fill='none'>
                                    <path
                                        d='M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <circle cx='12' cy='12' r='3' stroke='currentColor' strokeWidth='2' />
                                </svg>
                            </button>

                            <button
                                className='p-2 hover:bg-gray-200 rounded-md transition-colors'
                                title='Download document'
                                onClick={() => handleDownload(doc)}
                            >
                                <svg className='text-gray-500' width='16' height='16' viewBox='0 0 24 24' fill='none'>
                                    <path
                                        d='M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M7 10L12 15L17 10'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M12 15V3'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </button>

                            <button
                                className='p-2 hover:bg-gray-200 rounded-md transition-colors'
                                title='Edit document'
                                onClick={() => handleEdit(doc)}
                            >
                                <svg className='text-gray-500' width='16' height='16' viewBox='0 0 24 24' fill='none'>
                                    <path
                                        d='M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </button>

                            {/* Remove button for newly uploaded files */}
                            {doc.id !== '1' && (
                                <button
                                    className='p-2 hover:bg-red-100 text-red-500 rounded-md transition-colors'
                                    title='Remove document'
                                    onClick={() => handleRemove(doc.id)}
                                >
                                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
                                        <path
                                            d='M18 6L6 18M6 6L18 18'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Documents
