import React, { useState } from 'react'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../../firebase'
import { toast } from 'react-toastify'

interface PDFUploadProps {
    files: string[]
    onFilesChange: (files: string[]) => void
    maxFiles?: number
    maxSizeMB?: number
    storagePath: string // e.g., 'documents/projectId' or 'pdfs/userId'
    title?: string
    disabled?: boolean
    isEdit?: boolean
}

const PDFUploadComponent: React.FC<PDFUploadProps> = ({
    files,
    onFilesChange,
    maxFiles = 10,
    maxSizeMB = 10,
    storagePath,
    title = 'PDF Documents',
    disabled = false,
    isEdit = true,
}) => {
    const [isDragOver, setIsDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [previewFile, setPreviewFile] = useState<string | null>(null)

    // Filter out null, undefined, and empty string values from files array
    const validFiles = files.filter((file) => file && file.trim() !== '')

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (!disabled) {
            setIsDragOver(true)
        }
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragOver(false)
        if (!disabled) {
            const droppedFiles = Array.from(e.dataTransfer.files)
            if (droppedFiles.length > 0) {
                handleFiles(droppedFiles)
            }
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        if (selectedFiles.length > 0) {
            handleFiles(selectedFiles)
        }
        e.target.value = ''
    }

    // Validate PDF file
    const validateFile = (file: File) => {
        const allowedTypes = ['application/pdf']
        const maxSizeBytes = maxSizeMB * 1024 * 1024

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Only PDF files are allowed. "${file.name}" is not a PDF file.`,
            }
        }

        if (file.size > maxSizeBytes) {
            return {
                valid: false,
                error: `File "${file.name}" is too large. Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB. Maximum allowed: ${maxSizeMB} MB.`,
            }
        }

        return { valid: true }
    }

    // Handle multiple files upload
    const handleFiles = async (filesToUpload: File[]) => {
        if (validFiles.length + filesToUpload.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - validFiles.length} more files.`)
            return
        }

        setUploading(true)
        const newFileUrls: string[] = []

        for (const file of filesToUpload) {
            const validation = validateFile(file)
            if (!validation.valid) {
                toast.error(validation.error)
                continue
            }

            try {
                // Upload to Firebase Storage
                const fileName = `${Date.now()}_${file.name}`
                const storageRef = ref(storage, `${storagePath}/${fileName}`)

                console.log(`Uploading file: ${file.name}`)
                await uploadBytes(storageRef, file)

                // Get download URL
                const downloadURL = await getDownloadURL(storageRef)
                newFileUrls.push(downloadURL)
                console.log(`Successfully uploaded: ${file.name}`)
            } catch (error) {
                console.error(`Error uploading file ${file.name}:`, error)
                toast.error(`Failed to upload ${file.name}. Please try again.`)
            }
        }

        if (newFileUrls.length > 0) {
            const updatedFiles = [...validFiles, ...newFileUrls]
            onFilesChange(updatedFiles)
            toast.success(`Successfully uploaded ${newFileUrls.length} file(s)`)
        }

        setUploading(false)
    }

    // Delete file from storage and update state
    const handleDeleteFile = async (fileToDelete: string) => {
        try {
            // Create reference from the full URL
            const fileRef = ref(storage, fileToDelete)
            await deleteObject(fileRef)

            // Remove from state
            const updatedFiles = validFiles.filter((file) => file !== fileToDelete)
            onFilesChange(updatedFiles)

            toast.success('File deleted successfully')
            console.log(`Successfully deleted: ${fileToDelete}`)
        } catch (error) {
            console.error('Error deleting file:', error)
            toast.error('Failed to delete file. Please try again.')
        }
    }

    // Open PDF in new tab
    const handlePreview = (fileUrl: string) => {
        window.open(fileUrl, '_blank')
    }

    // Get filename from URL
    const getFileNameFromUrl = (url: string): string => {
        try {
            const urlParts = url.split('/')
            const fileName = urlParts[urlParts.length - 1]
            const decodedFileName = decodeURIComponent(fileName.split('?')[0])
            // Remove timestamp prefix if present
            return decodedFileName.replace(/^\d+_/, '')
        } catch {
            return 'document.pdf'
        }
    }

    return (
        <div className='mb-8'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>{title}</h2>

            {/* File Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    disabled || !isEdit
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : isDragOver
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                hidden={!isEdit}
            >
                <div className='space-y-4'>
                    <div className='text-4xl'>📄</div>
                    <div>
                        <p className='text-lg font-medium text-gray-900'>
                            {uploading
                                ? 'Uploading PDFs...'
                                : disabled || !isEdit
                                  ? 'Upload disabled'
                                  : 'Drop your PDF files here'}
                        </p>
                        {!disabled && isEdit && (
                            <p className='text-sm text-gray-500 mt-1'>or click to browse your files</p>
                        )}
                    </div>
                    <div className='text-xs text-gray-400'>
                        <p>Supported format: PDF only</p>
                        <p>
                            Maximum file size: {maxSizeMB}MB | Maximum files: {maxFiles}
                        </p>
                        <p>
                            Current files: {validFiles.length}/{maxFiles}
                        </p>
                    </div>
                    {!disabled && isEdit && (
                        <>
                            <input
                                type='file'
                                multiple
                                accept='.pdf'
                                onChange={handleFileSelect}
                                className='hidden'
                                id={`pdf-upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
                                disabled={uploading}
                            />
                            <label
                                htmlFor={`pdf-upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
                                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <svg
                                            className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                                            xmlns='http://www.w3.org/2000/svg'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                        >
                                            <circle
                                                className='opacity-25'
                                                cx='12'
                                                cy='12'
                                                r='10'
                                                stroke='currentColor'
                                                strokeWidth='4'
                                            ></circle>
                                            <path
                                                className='opacity-75'
                                                fill='currentColor'
                                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                            ></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    'Choose PDF Files'
                                )}
                            </label>
                        </>
                    )}
                </div>
            </div>

            {/* Uploaded Files Display */}
            {validFiles.length > 0 && (
                <div className='mt-6'>
                    <h3 className='text-md font-medium text-gray-900 mb-3'>Uploaded PDFs ({validFiles.length})</h3>
                    <div className='space-y-2'>
                        {validFiles.map((fileUrl, index) => (
                            <div
                                key={index}
                                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'
                            >
                                <div className='flex items-center space-x-3'>
                                    <div className='text-2xl'>📄</div>
                                    <div>
                                        <p className='text-sm font-medium text-gray-900 w-2.5'>
                                            {getFileNameFromUrl(fileUrl)}
                                        </p>
                                        <p className='text-xs text-gray-500'>PDF Document</p>
                                    </div>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <button
                                        onClick={() => handlePreview(fileUrl)}
                                        className='p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-full transition-colors'
                                        title='Open PDF'
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteFile(fileUrl)}
                                        className='p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-full transition-colors'
                                        title='Delete PDF'
                                        hidden={!isEdit}
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PDFUploadComponent
