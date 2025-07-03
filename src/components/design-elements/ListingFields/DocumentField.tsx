import React, { useRef } from 'react'
import { type FileToUpload } from '../../../services/acn/upload/fileUploadService'

interface DocumentFieldProps {
    value: string[] // Existing file URLs
    setValue: (urls: string[]) => void
    label?: string
    required?: boolean
    error?: string
    propertyId?: string
    filesToUpload?: { [key: string]: FileToUpload[] }
    setFilesToUpload?: (files: { [key: string]: FileToUpload[] }) => void
}

const ACCEPTED_TYPES = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'video/mp4',
    'image/jpg',
    'image/gif',
    'image/webp',
]
const MAX_SIZE_MB = 50

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const DocumentField: React.FC<DocumentFieldProps> = ({
    value,
    setValue,
    label,
    required,
    error,
    filesToUpload,
    setFilesToUpload,
}) => {
    const inputRef = useRef<HTMLInputElement>(null)

    // Get all files to display (new files to upload)
    const allFilesToUpload = filesToUpload
        ? [...(filesToUpload.photo || []), ...(filesToUpload.video || []), ...(filesToUpload.document || [])]
        : []

    const handleFiles = (fileList: FileList) => {
        if (!setFilesToUpload || !filesToUpload) return

        const newFiles: FileToUpload[] = []

        Array.from(fileList).forEach((file) => {
            // Validate file type and size
            if (
                ACCEPTED_TYPES.includes(file.type) &&
                file.size <= MAX_SIZE_MB * 1024 * 1024 &&
                !allFilesToUpload.some((f) => f.name === file.name && f.file.size === file.size)
            ) {
                newFiles.push({
                    name: file.name,
                    file: file,
                })
            }
        })

        if (newFiles.length) {
            // Categorize files by type
            const photoFiles: FileToUpload[] = []
            const videoFiles: FileToUpload[] = []
            const documentFiles: FileToUpload[] = []

            newFiles.forEach((fileObj) => {
                if (fileObj.file.type.startsWith('image/')) {
                    photoFiles.push(fileObj)
                } else if (fileObj.file.type.startsWith('video/')) {
                    videoFiles.push(fileObj)
                } else {
                    documentFiles.push(fileObj)
                }
            })

            // Update filesToUpload state
            setFilesToUpload({
                ...filesToUpload,
                photo: [...(filesToUpload.photo || []), ...photoFiles],
                video: [...(filesToUpload.video || []), ...videoFiles],
                document: [...(filesToUpload.document || []), ...documentFiles],
            })
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
    }

    const handleBrowse = () => inputRef.current?.click()

    const handleRemoveNewFile = (fileToRemove: FileToUpload) => {
        if (!setFilesToUpload || !filesToUpload) return

        const updatedFiles = { ...filesToUpload }

        // Remove from appropriate category
        if (fileToRemove.file.type.startsWith('image/')) {
            updatedFiles.photo = updatedFiles.photo?.filter((f) => f !== fileToRemove) || []
        } else if (fileToRemove.file.type.startsWith('video/')) {
            updatedFiles.video = updatedFiles.video?.filter((f) => f !== fileToRemove) || []
        } else {
            updatedFiles.document = updatedFiles.document?.filter((f) => f !== fileToRemove) || []
        }

        setFilesToUpload(updatedFiles)
    }

    const handleRemoveExistingFile = (urlToRemove: string) => {
        setValue(value.filter((url) => url !== urlToRemove))
    }

    const getFileIcon = (file: File) => {
        if (file.type === 'application/pdf') {
            return <span className='text-red-500 mr-1'>📄</span>
        }
        if (file.type.startsWith('image/')) {
            return <img src={URL.createObjectURL(file)} alt='' className='w-6 h-6 object-cover rounded mr-1' />
        }
        if (file.type.startsWith('video/')) {
            return <span className='text-blue-500 mr-1'>🎬</span>
        }
        return <span className='text-gray-400 mr-1'>📁</span>
    }

    const getUrlIcon = (url: string) => {
        const extension = url.split('.').pop()?.toLowerCase()
        if (extension === 'pdf') {
            return <span className='text-red-500 mr-1'>📄</span>
        }
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
            return <span className='text-green-500 mr-1'>🖼️</span>
        }
        if (['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
            return <span className='text-blue-500 mr-1'>🎬</span>
        }
        return <span className='text-gray-400 mr-1'>📁</span>
    }

    const getFileName = (url: string) => {
        try {
            const urlObj = new URL(url)
            const pathname = urlObj.pathname
            const fileName = pathname.split('/').pop() || 'Unknown file'
            return decodeURIComponent(fileName)
        } catch {
            return 'Unknown file'
        }
    }

    return (
        <div className='flex flex-col gap-1'>
            {label && (
                <label className='block text-sm font-medium text-gray-700'>
                    {label}
                    {required && <span className='text-red-500 ml-1'>*</span>}
                </label>
            )}

            <div
                className='border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition'
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={handleBrowse}
            >
                <div className='flex flex-col items-center'>
                    <svg className='w-8 h-8 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M7 16a4 4 0 01.88-7.903A5.5 5.5 0 1119 16.5H7z'
                        />
                    </svg>
                    <div className='mt-2 font-medium'>Choose files or drag & drop them here</div>
                    <div className='text-xs text-gray-500'>JPEG, PNG, PDF, MP4 up to 50MB each</div>
                    <button
                        type='button'
                        className='mt-4 px-4 py-2 bg-white border rounded shadow hover:bg-gray-100'
                        onClick={(e) => {
                            e.stopPropagation()
                            handleBrowse()
                        }}
                    >
                        Browse Files
                    </button>
                    <input
                        ref={inputRef}
                        type='file'
                        multiple
                        accept={ACCEPTED_TYPES.join(',')}
                        className='hidden'
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    />
                </div>
            </div>

            {/* Display existing files */}
            {value && value.length > 0 && (
                <div className='mt-4'>
                    <h4 className='text-sm font-medium text-gray-700 mb-2'>Existing Files</h4>
                    <div className='space-y-2'>
                        {value.map((url, idx) => (
                            <div key={`existing-${idx}`} className='flex items-center bg-blue-50 rounded p-2'>
                                {getUrlIcon(url)}
                                <div className='ml-2 flex-1'>
                                    <div className='font-medium truncate max-w-xs'>{getFileName(url)}</div>
                                    <a
                                        href={url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-xs text-blue-600 hover:text-blue-800 underline'
                                    >
                                        View file
                                    </a>
                                </div>
                                <button
                                    type='button'
                                    className='ml-2 text-gray-400 hover:text-red-500'
                                    onClick={() => handleRemoveExistingFile(url)}
                                    aria-label={`Remove ${getFileName(url)}`}
                                >
                                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M6 18L18 6M6 6l12 12'
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Display new files to upload */}
            {allFilesToUpload.length > 0 && (
                <div className='mt-4'>
                    <h4 className='text-sm font-medium text-gray-700 mb-2'>Files to Upload</h4>
                    <div className='space-y-2'>
                        {allFilesToUpload.map((fileObj, idx) => (
                            <div key={`new-${idx}`} className='flex items-center bg-green-100 rounded p-2'>
                                {getFileIcon(fileObj.file)}
                                <div className='ml-2 flex-1'>
                                    <div className='font-medium truncate max-w-xs'>{fileObj.name}</div>
                                    <div className='text-xs text-gray-500'>{formatBytes(fileObj.file.size)}</div>
                                </div>
                                <button
                                    type='button'
                                    className='ml-2 text-gray-400 hover:text-red-500'
                                    onClick={() => handleRemoveNewFile(fileObj)}
                                    aria-label={`Remove ${fileObj.name}`}
                                >
                                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M6 18L18 6M6 6l12 12'
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error && <div className='text-xs text-red-600 mt-1'>{error}</div>}
        </div>
    )
}

export default DocumentField
