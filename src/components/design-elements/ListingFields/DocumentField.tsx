import React, { useRef, useState } from 'react'
import { uploadFileToFirebase } from '../../helper/fileUploadHelper'

const API_URL = 'https://uploadtodrive-wi5onpxm7q-uc.a.run.app'

interface UploadingFile {
    file: File
    progress: number // 0-100
    status: 'uploading' | 'done' | 'error'
}

interface DocumentFieldProps {
    value: File[]
    setValue: (files: File[]) => void
    label?: string
    required?: boolean
    error?: string
    propertyId: string
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4']
const MAX_SIZE_MB = 50

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper to call the uploadToDrive API
async function uploadToDrive(
    propId: string,
    uploadedFileUrls: { photo: string[]; video: string[]; document: string[] },
) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propId: propId, uploadedFileUrls: uploadedFileUrls }),
    })
    if (!response.ok) throw new Error('Failed to upload to Drive')
    const data = await response.json()
    return data.sharableFolderUrl
}

const DocumentField: React.FC<DocumentFieldProps> = ({ value, setValue, label, required, error, propertyId }) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState<UploadingFile[]>([])
    const [driveUrl, setDriveUrl] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Merge value and uploading for display
    const filesToShow: UploadingFile[] = [
        ...uploading,
        ...value
            .filter((f) => !uploading.some((u) => u.file.name === f.name && u.file.size === f.size))
            .map((f) => ({ file: f, progress: 100, status: 'done' as const })),
    ]

    const handleFiles = (fileList: FileList) => {
        const newFiles: UploadingFile[] = []
        Array.from(fileList).forEach((file) => {
            if (
                ACCEPTED_TYPES.includes(file.type) &&
                file.size <= MAX_SIZE_MB * 1024 * 1024 &&
                !value.some((f) => f.name === file.name && f.size === file.size)
            ) {
                newFiles.push({ file, progress: 0, status: 'uploading' })
            }
        })
        if (newFiles.length) {
            setUploading((prev) => [...prev, ...newFiles])
            setIsUploading(true)
            // Upload each file to Firebase Storage
            Promise.all(
                newFiles.map((uf) =>
                    uploadFileToFirebase(uf.file, `media-files/${propertyId}/document`, (progress: number) => {
                        setUploading((prev) => prev.map((u) => (u.file === uf.file ? { ...u, progress } : u)))
                    }).then((url: string) => ({ url, file: uf.file })),
                ),
            ).then(async (results: { url: string; file: File }[]) => {
                setUploading([])
                setValue([...value, ...results.map((r) => r.file)])
                // Collect all document URLs (and photo/video if needed)
                const documentUrls = results.map((r) => r.url)
                const uploadedFileUrls = { photo: [], video: [], document: documentUrls }
                // Call the API
                const sharableFolderUrl = await uploadToDrive(propertyId, uploadedFileUrls)
                setDriveUrl(sharableFolderUrl)
                console.log('sharableFolderUrl', sharableFolderUrl)
                setIsUploading(false)
            })
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
    }

    const handleBrowse = () => inputRef.current?.click()

    const handleRemove = (file: File) => {
        setValue(value.filter((f) => f !== file))
    }

    const getFileIcon = (file: File) => {
        if (file.type === 'application/pdf') {
            return <span className='text-red-500 mr-1'>📄</span>
        }
        if (file.type.startsWith('image/')) {
            return <img src={URL.createObjectURL(file)} alt='' className='w-6 h-6 object-cover rounded' />
        }
        if (file.type === 'video/mp4') {
            return <span className='text-blue-500 mr-1'>🎬</span>
        }
        return <span className='text-gray-400 mr-1'>📁</span>
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
                    <div className='mt-2 font-medium'>Choose a file or drag & drop it here</div>
                    <div className='text-xs text-gray-500'>JPEG, PNG, PDF, MP4 up to 50MB</div>
                    <button
                        type='button'
                        className='mt-4 px-4 py-2 bg-white border rounded shadow hover:bg-gray-100'
                        onClick={(e) => {
                            e.stopPropagation()
                            handleBrowse()
                        }}
                        disabled={isUploading}
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
                        disabled={isUploading}
                    />
                </div>
            </div>
            <div className='mt-4 space-y-2'>
                {filesToShow.map((f, idx) => (
                    <div key={idx} className='flex items-center bg-green-100 rounded p-2'>
                        {getFileIcon(f.file)}
                        <div className='ml-2 flex-1'>
                            <div className='font-medium truncate max-w-xs'>{f.file.name}</div>
                            <div className='text-xs text-gray-500'>
                                {formatBytes(f.file.size)}
                                {f.status === 'uploading' && <> &bull; Uploading...</>}
                            </div>
                            <div className='w-full bg-gray-200 rounded h-1 mt-1'>
                                <div
                                    className='bg-green-500 h-1 rounded transition-all'
                                    style={{ width: `${f.progress}%` }}
                                />
                            </div>
                        </div>
                        <button
                            className='ml-2 text-gray-400 hover:text-red-500'
                            onClick={() => handleRemove(f.file)}
                            aria-label={`Remove ${f.file.name}`}
                            disabled={isUploading}
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
            {driveUrl && (
                <div className='mt-4'>
                    <a
                        href={driveUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 underline font-medium'
                    >
                        View all documents in Google Drive
                    </a>
                </div>
            )}
            {error && <div className='text-xs text-red-600 mt-1'>{error}</div>}
        </div>
    )
}

export default DocumentField
