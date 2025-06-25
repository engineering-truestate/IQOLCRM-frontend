import React, { useRef } from 'react'

interface DocumentFieldProps {
    value: File[]
    setValue: (files: File[]) => void
    label?: string
    required?: boolean
    error?: string
    propertyId: string | 'id'
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

const DocumentField: React.FC<DocumentFieldProps> = ({ value, setValue, label, required, error }) => {
    const inputRef = useRef<HTMLInputElement>(null)

    // Merge value for display
    const filesToShow: File[] = value

    const handleFiles = (fileList: FileList) => {
        const newFiles: File[] = []
        Array.from(fileList).forEach((file) => {
            if (
                ACCEPTED_TYPES.includes(file.type) &&
                file.size <= MAX_SIZE_MB * 1024 * 1024 &&
                !value.some((f) => f.name === file.name && f.size === file.size)
            ) {
                newFiles.push(file)
            }
        })
        if (newFiles.length) {
            setValue([...value, ...newFiles])
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
            <div className='mt-4 space-y-2'>
                {filesToShow.map((f, idx) => (
                    <div key={idx} className='flex items-center bg-green-100 rounded p-2'>
                        {getFileIcon(f)}
                        <div className='ml-2 flex-1'>
                            <div className='font-medium truncate max-w-xs'>{f.name}</div>
                            <div className='text-xs text-gray-500'>{formatBytes(f.size)}</div>
                        </div>
                        <button
                            className='ml-2 text-gray-400 hover:text-red-500'
                            onClick={() => handleRemove(f)}
                            aria-label={`Remove ${f.name}`}
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
            {error && <div className='text-xs text-red-600 mt-1'>{error}</div>}
        </div>
    )
}

export default DocumentField
