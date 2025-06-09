import React, { useState, useRef } from 'react'

interface AddLeadModalProps {
    isOpen: boolean
    onClose: () => void
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'bulk' | 'manual'>('bulk')
    const [dragActive, setDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Manual upload form state
    const [manualForm, setManualForm] = useState({
        name: '',
        phone: '',
        email: '',
        leadSource: '',
        notes: '',
    })

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

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setSelectedFile(file)
            } else {
                alert('Please upload a CSV file only')
            }
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setSelectedFile(file)
            } else {
                alert('Please upload a CSV file only')
            }
        }
    }

    const handleSelectFile = () => {
        fileInputRef.current?.click()
    }

    const downloadTemplate = () => {
        const headers = ['Name', 'Email', 'Company', 'Phone', 'Lead Source', 'Notes']
        const sampleData = [
            ['John Doe', 'john@example.com', 'ABC Corp', '555-1234', 'Website', 'Interested in premium package'],
            ['Jane Smith', 'jane@example.com', 'XYZ Ltd', '555-5678', 'Referral', 'Looking for consultation'],
        ]

        const csvContent = [headers.join(','), ...sampleData.map((row) => row.join(','))].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'leads_template.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleUpload = () => {
        if (selectedFile) {
            console.log('Uploading file:', selectedFile.name)
            // Handle file upload logic here
            setSelectedFile(null)
            onClose()
        } else {
            alert('Please select a CSV file to upload')
        }
    }

    const handleManualInputChange = (field: keyof typeof manualForm, value: string) => {
        setManualForm({ ...manualForm, [field]: value })
    }

    const handleAddUser = () => {
        if (!manualForm.name || !manualForm.phone || !manualForm.email) {
            alert('Please fill in all required fields (Name, Phone, Email)')
            return
        }

        console.log('Adding new lead:', manualForm)
        // Handle manual lead creation logic here
        setManualForm({
            name: '',
            phone: '',
            email: '',
            leadSource: '',
            notes: '',
        })
        onClose()
    }

    const handleClear = () => {
        setManualForm({
            name: '',
            phone: '',
            email: '',
            leadSource: '',
            notes: '',
        })
    }

    if (!isOpen) return null

    return (
        <>
            {/* Very light overlay - only covers left 60% */}
            <div className='fixed top-0 left-0 w-[60%] h-full bg-black opacity-50 z-40' onClick={onClose} />

            {/* Modal */}
            <div className='fixed top-0 right-0 h-full w-[40%] bg-white z-50 shadow-2xl border-l border-gray-200'>
                <div className='flex flex-col h-full'>
                    {/* Header with Tabs */}
                    <div className='border-b border-gray-200'>
                        <div className='flex items-center justify-between p-6 pb-0'>
                            <h2 className='text-xl font-semibold text-gray-900'>
                                {activeTab === 'bulk' ? 'Upload Leads' : 'New Lead'}
                            </h2>
                            <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded-md'>
                                <svg
                                    className='w-5 h-5 text-gray-400'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M6 18L18 6M6 6l12 12'
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className='flex border-b border-gray-200 px-6'>
                            <button
                                onClick={() => setActiveTab('bulk')}
                                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'bulk'
                                        ? 'border-gray-900 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Bulk Upload
                            </button>
                            <button
                                onClick={() => setActiveTab('manual')}
                                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'manual'
                                        ? 'border-gray-900 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Manual Upload
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className='flex-1 p-6 overflow-y-auto'>
                        {activeTab === 'bulk' ? (
                            // Bulk Upload Content
                            <div>
                                <p className='text-sm text-gray-600 mb-6'>
                                    Upload a <strong>CSV</strong> file containing your leads. Ensure the file is
                                    properly formatted with columns for Name, Email, and Company.
                                </p>

                                {/* Drag and Drop Area */}
                                <div
                                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                                        dragActive
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    {selectedFile ? (
                                        <div className='space-y-4'>
                                            <div className='flex items-center justify-center'>
                                                <svg
                                                    className='w-12 h-12 text-green-500'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className='text-sm font-medium text-gray-900'>{selectedFile.name}</p>
                                                <p className='text-xs text-gray-500'>File ready for upload</p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedFile(null)}
                                                className='text-sm text-red-600 hover:text-red-800'
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    ) : (
                                        <div className='space-y-4'>
                                            <div className='flex items-center justify-center'>
                                                <svg
                                                    className='w-12 h-12 text-gray-400'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className='text-lg font-medium text-gray-900'>
                                                    Drag and drop your CSV file here
                                                </p>
                                                <p className='text-sm text-gray-500 mt-1'>Or</p>
                                                <button
                                                    onClick={handleSelectFile}
                                                    className='mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors'
                                                >
                                                    Select File
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <p className='text-xs text-gray-500 mt-4'>
                                    <strong>Note:</strong> You can drag and drop the file here or select it from your
                                    computer.
                                </p>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept='.csv'
                                    onChange={handleFileSelect}
                                    className='hidden'
                                />
                            </div>
                        ) : (
                            // Manual Upload Content
                            <div className='space-y-6'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Name</label>
                                    <div className='relative'>
                                        <svg
                                            className='absolute left-3 top-1/3 transform -translate-y-1/2 w-4 h-4 text-gray-400'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                            />
                                        </svg>
                                        <input
                                            type='text'
                                            value={manualForm.name}
                                            onChange={(e) => handleManualInputChange('name', e.target.value)}
                                            placeholder='Enter lead name'
                                            className='w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Phone</label>
                                    <div className='relative'>
                                        <svg
                                            className='absolute left-3 top-1/3 transform -translate-y-1/2 w-4 h-4 text-gray-400'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                                            />
                                        </svg>
                                        <input
                                            type='tel'
                                            value={manualForm.phone}
                                            onChange={(e) => handleManualInputChange('phone', e.target.value)}
                                            placeholder='Enter phone number'
                                            className='w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                                    <div className='relative'>
                                        <svg
                                            className='absolute left-3 top-1/3 transform -translate-y-1/2 w-4 h-4 text-gray-400'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'
                                            />
                                        </svg>
                                        <input
                                            type='email'
                                            value={manualForm.email}
                                            onChange={(e) => handleManualInputChange('email', e.target.value)}
                                            placeholder='Enter email id'
                                            className='w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Lead Source</label>
                                    <div className='relative'>
                                        <select
                                            value={manualForm.leadSource}
                                            onChange={(e) => handleManualInputChange('leadSource', e.target.value)}
                                            className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm appearance-none bg-white'
                                        >
                                            <option value=''>Select lead source</option>
                                            <option value='website'>Website</option>
                                            <option value='referral'>Referral</option>
                                            <option value='social_media'>Social Media</option>
                                            <option value='advertisement'>Advertisement</option>
                                            <option value='cold_call'>Cold Call</option>
                                            <option value='email_campaign'>Email Campaign</option>
                                        </select>
                                        <svg
                                            className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M19 9l-7 7-7-7'
                                            />
                                        </svg>
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Notes</label>
                                    <textarea
                                        value={manualForm.notes}
                                        onChange={(e) => handleManualInputChange('notes', e.target.value)}
                                        placeholder='Add any additional notes here...'
                                        rows={6}
                                        className='w-full px-3 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className='p-6 border-t border-gray-200'>
                        {activeTab === 'bulk' ? (
                            <div className='flex items-center justify-between'>
                                <button
                                    onClick={downloadTemplate}
                                    className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                        />
                                    </svg>
                                    Download Template CSV
                                </button>
                                <button
                                    onClick={handleUpload}
                                    className='flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors'
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                                        />
                                    </svg>
                                    Upload
                                </button>
                            </div>
                        ) : (
                            <div className='flex items-center justify-between'>
                                <button
                                    onClick={handleClear}
                                    className='px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleAddUser}
                                    className='flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors'
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                                        />
                                    </svg>
                                    Add User
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddLeadModal
