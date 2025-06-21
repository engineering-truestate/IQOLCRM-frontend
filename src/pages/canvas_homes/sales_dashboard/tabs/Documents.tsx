import React, { useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../../../../firebase'
import { enquiryService } from '../../../../services/canvas_homes'

interface DocumentItem {
    id: string
    name: string
    size: string
    uploadDate: string
    url: string
    storagePath: string
    isNew?: boolean
}

interface DocumentsProps {
    leadId: string
    enquiryId: string | null
    documents?: DocumentItem[]
    onDocumentsUpdate?: () => void
}

const Documents: React.FC<DocumentsProps> = ({
    leadId,
    enquiryId,
    documents: existingDocuments = [],
    onDocumentsUpdate,
}) => {
    const [dragActive, setDragActive] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [documents, setDocuments] = useState<DocumentItem[]>(existingDocuments)

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
        if (!enquiryId) {
            alert('No enquiry selected. Please select an enquiry first.')
            return
        }

        setUploading(true)
        setUploadProgress(0)

        try {
            // Create unique filename with timestamp
            const timestamp = Date.now()
            const fileName = `${timestamp}_${file.name}`
            const storagePath = `canvas_homes-enquiry-documents/${enquiryId}/${fileName}`
            console.log('rajan the king ', enquiryId, fileName)
            // Create storage reference
            const storageRef = ref(storage, storagePath)

            // Start upload
            const uploadTask = uploadBytesResumable(storageRef, file)

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Track upload progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    setUploadProgress(Math.round(progress))
                },
                (error) => {
                    console.error('Upload failed:', error)
                    alert('Upload failed. Please try again.')
                    setUploading(false)
                    setUploadProgress(0)
                },
                async () => {
                    try {
                        // Get download URL
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

                        // Format file size
                        const formatFileSize = (bytes: number) => {
                            if (bytes < 1024) return `${bytes}b`
                            if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}kb`
                            return `${Math.round(bytes / (1024 * 1024))}mb`
                        }

                        const newDoc: DocumentItem = {
                            id: timestamp.toString(),
                            name: file.name,
                            size: formatFileSize(file.size),
                            uploadDate: new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            }),
                            url: downloadURL,
                            storagePath: storagePath,
                            isNew: true,
                        }

                        // Update local state
                        setDocuments((prev) => [newDoc, ...prev])

                        // Update enquiry in Firebase with new document
                        await updateEnquiryDocuments([newDoc, ...documents])

                        setUploading(false)
                        setUploadProgress(0)

                        // Remove the "new" indicator after 3 seconds
                        setTimeout(() => {
                            setDocuments((prev) =>
                                prev.map((doc) => (doc.id === newDoc.id ? { ...doc, isNew: false } : doc)),
                            )
                        }, 3000)

                        // Notify parent component
                        if (onDocumentsUpdate) {
                            onDocumentsUpdate()
                        }
                    } catch (error) {
                        console.error('Error getting download URL:', error)
                        alert('Failed to save document. Please try again.')
                        setUploading(false)
                        setUploadProgress(0)
                    }
                },
            )
        } catch (error) {
            console.error('Error starting upload:', error)
            alert('Failed to start upload. Please try again.')
            setUploading(false)
            setUploadProgress(0)
        }
    }

    const updateEnquiryDocuments = async (updatedDocuments: DocumentItem[]) => {
        if (!enquiryId) return

        try {
            // Convert documents to simple format for storage
            const documentsForStorage = updatedDocuments.map((doc) => ({
                id: doc.id,
                name: doc.name,
                size: doc.size,
                uploadDate: doc.uploadDate,
                url: doc.url,
                storagePath: doc.storagePath,
            }))

            await enquiryService.update(enquiryId, {
                documents: documentsForStorage,
            })
        } catch (error) {
            console.error('Error updating enquiry documents:', error)
            throw error
        }
    }

    const handleSelectFile = () => {
        if (!uploading && enquiryId) {
            document.getElementById('file-upload')?.click()
        } else if (!enquiryId) {
            alert('No enquiry selected. Please select an enquiry first.')
        }
    }

    const handleView = (doc: DocumentItem) => {
        // Open document in new tab
        window.open(doc.url, '_blank')
    }

    const handleDownload = (doc: DocumentItem) => {
        // Create a temporary link to download the file
        const link = document.createElement('a')
        link.href = doc.url
        link.download = doc.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleEdit = (doc: DocumentItem) => {
        // For now, just open the document for viewing
        // In the future, you could integrate with document editing services
        alert(`Opening ${doc.name} for viewing. Editing functionality can be added later.`)
        window.open(doc.url, '_blank')
    }

    const handleRemove = async (docId: string) => {
        const docToRemove = documents.find((doc) => doc.id === docId)
        if (!docToRemove) return

        const confirmDelete = window.confirm(`Are you sure you want to delete ${docToRemove.name}?`)
        if (!confirmDelete) return

        try {
            // Delete from Firebase Storage
            const storageRef = ref(storage, docToRemove.storagePath)
            await deleteObject(storageRef)

            // Update local state
            const updatedDocuments = documents.filter((doc) => doc.id !== docId)
            setDocuments(updatedDocuments)

            // Update enquiry in Firebase
            await updateEnquiryDocuments(updatedDocuments)

            // Notify parent component
            if (onDocumentsUpdate) {
                onDocumentsUpdate()
            }
        } catch (error) {
            console.error('Error deleting document:', error)
            alert('Failed to delete document. Please try again.')
        }
    }

    // Update local documents when props change
    React.useEffect(() => {
        setDocuments(existingDocuments)
    }, [existingDocuments])

    return (
        <div className='bg-white h-full p-4.5 space-y-6'>
            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                    dragActive
                        ? 'border-blue-400 bg-blue-50 scale-105'
                        : uploading
                          ? 'border-green-400 bg-green-50'
                          : !enquiryId
                            ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
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
                        <svg
                            className={`mx-auto ${!enquiryId ? 'text-gray-300' : 'text-gray-400'}`}
                            width='48'
                            height='48'
                            viewBox='0 0 24 24'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <path
                                d='M12.0586 16.5V11.5'
                                stroke='#292D32'
                                strokeWidth='1.5'
                                strokeMiterlimit='10'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                            <path
                                d='M14.5 14H9.5'
                                stroke='#292D32'
                                strokeWidth='1.5'
                                strokeMiterlimit='10'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                            <path
                                d='M22 11V17C22 21 21 22 17 22H7C3 22 2 21 2 17V7C2 3 3 2 7 2H8.5C10 2 10.33 2.44 10.9 3.2L12.4 5.2C12.78 5.7 13 6 14 6H17C21 6 22 7 22 11Z'
                                stroke='#292D32'
                                strokeWidth='1.5'
                                strokeMiterlimit='10'
                            />
                        </svg>
                    )}
                </div>

                {!enquiryId ? (
                    <>
                        <p className='text-gray-400 mb-2 font-medium'>No enquiry selected</p>
                        <p className='text-sm text-gray-400'>Please select an enquiry to upload documents</p>
                    </>
                ) : uploading ? (
                    <>
                        <p className='text-gray-600 mb-2 font-medium'>Uploading... {uploadProgress}%</p>
                        <div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
                            <div
                                className='bg-green-500 h-2 rounded-full transition-all duration-300'
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <p className='text-sm text-gray-500'>Please wait while we process your file</p>
                    </>
                ) : (
                    <>
                        <p className='text-gray-600 mb-2 font-medium'>Drag and drop file here</p>
                        <p className='text-sm text-gray-500'>Browse file from your computer</p>
                    </>
                )}

                <input
                    id='file-upload'
                    type='file'
                    multiple
                    className='hidden'
                    onChange={handleFileSelect}
                    accept='.pdf'
                    disabled={uploading || !enquiryId}
                />
            </div>

            {/* Document List */}
            <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>
                    Uploaded Documents ({documents.length})
                    {!enquiryId && <span className='text-gray-400 ml-2'>(Select an enquiry to view documents)</span>}
                </h3>

                {documents.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                        <p className='text-lg font-medium text-gray-900 mb-2'>No documents uploaded</p>
                        <p className='text-gray-600'>
                            Upload documents to keep track of important files for this enquiry
                        </p>
                    </div>
                ) : (
                    documents.map((doc) => (
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
                                        width='24'
                                        height='24'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            d='M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z'
                                            stroke='#292D32'
                                            strokeWidth='1.5'
                                            strokeMiterlimit='10'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M14.5 4.5V6.5C14.5 7.6 15.4 8.5 16.5 8.5H18.5'
                                            stroke='#292D32'
                                            strokeWidth='1.5'
                                            strokeMiterlimit='10'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M8 13H12'
                                            stroke='#292D32'
                                            strokeWidth='1.5'
                                            strokeMiterlimit='10'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M8 17H16'
                                            stroke='#292D32'
                                            strokeWidth='1.5'
                                            strokeMiterlimit='10'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                </div>

                                {/* Document Info */}
                                <div className='flex flex-col'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-sm font-medium text-gray-600'>{doc.name}</span>

                                        {doc.isNew && (
                                            <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium'>
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <div className='flex items-center gap-2 mt-1'>
                                        <span className='text-xs text-gray-400'>{doc.size}</span>
                                        <span className='text-xs text-gray-400'>•</span>
                                        <span className='text-xs text-gray-400'>{doc.uploadDate}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex items-center gap-1'>
                                <button
                                    className='p-2 hover:bg-gray-200 rounded-md transition-colors'
                                    title='View document'
                                    onClick={() => handleView(doc)}
                                >
                                    <svg
                                        className='text-gray-500'
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                    >
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
                                    <svg
                                        className='text-gray-500'
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                    >
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
                                    <svg
                                        className='text-gray-500'
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                    >
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
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Documents
