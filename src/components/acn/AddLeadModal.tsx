import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as XLSX from 'xlsx'
import { validateCSVData, addBulkLeads, addManualLead, fetchKAMOptions } from '../../services/acn/leads/leadsService'
import {
    selectCSVValidationLoading,
    selectCSVValidationError,
    selectValidatedCSVData,
    selectBulkAddLoading,
    selectBulkAddError,
    selectManualAddLoading,
    selectManualAddError,
    selectKAMOptions,
    selectKAMOptionsLoading,
    clearCSVValidationError,
    clearValidatedCSVData,
    clearBulkAddError,
    clearManualAddError,
} from '../../store/reducers/acn/leadsReducers'
import type { AppDispatch, RootState } from '../../store'

interface BulkLeadData {
    Number: string
    Name: string
    Email: string
    'Lead Source': string
}

interface AddLeadModalProps {
    isOpen: boolean
    onClose: () => void
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>()

    const [activeTab, setActiveTab] = useState<'bulk' | 'manual'>('bulk')
    const [dragActive, setDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [parsedCSVData, setParsedCSVData] = useState<BulkLeadData[]>([])
    const [showCSVViewer, setShowCSVViewer] = useState(false)
    const [parseError, setParseError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Redux selectors
    const csvValidationLoading = useSelector(selectCSVValidationLoading)
    const csvValidationError = useSelector(selectCSVValidationError)
    const validatedCSVData = useSelector(selectValidatedCSVData)
    const bulkAddLoading = useSelector(selectBulkAddLoading)
    const bulkAddError = useSelector(selectBulkAddError)
    const manualAddLoading = useSelector(selectManualAddLoading)
    const manualAddError = useSelector(selectManualAddError)
    const kamOptions = useSelector(selectKAMOptions)
    const kamOptionsLoading = useSelector(selectKAMOptionsLoading)

    // Manual upload form state
    const [manualForm, setManualForm] = useState({
        name: '',
        phone: '',
        email: '',
        leadSource: '',
        notes: '',
        kamName: '',
        kamId: '',
    })

    // Load KAM options when modal opens
    useEffect(() => {
        if (isOpen && kamOptions.length === 0) {
            dispatch(fetchKAMOptions())
        }
    }, [isOpen, kamOptions.length, dispatch])

    // Clear errors when modal opens
    useEffect(() => {
        if (isOpen) {
            dispatch(clearCSVValidationError())
            dispatch(clearBulkAddError())
            dispatch(clearManualAddError())
            setParseError(null)
        }
    }, [isOpen, dispatch])

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
            if (
                file.type === 'text/csv' ||
                file.name.endsWith('.csv') ||
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.name.endsWith('.xlsx')
            ) {
                setSelectedFile(file)
                parseExcelFile(file)
            } else {
                alert('Please upload a CSV or XLSX file only')
            }
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (
                file.type === 'text/csv' ||
                file.name.endsWith('.csv') ||
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.name.endsWith('.xlsx')
            ) {
                setSelectedFile(file)
                parseExcelFile(file)
            } else {
                alert('Please upload a CSV or XLSX file only')
            }
        }
    }

    // XLSX parser for both CSV and Excel files
    const parseExcelFile = (file: File) => {
        setParseError(null)

        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = e.target?.result
                const workbook = XLSX.read(data, { type: 'binary' })

                // Get the first sheet
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]

                // Convert to JSON with header row
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1, // Use first row as header
                    defval: '', // Default value for empty cells
                })

                if (jsonData.length === 0) {
                    setParseError('The file appears to be empty')
                    return
                }

                // Convert array format to object format
                const headers = jsonData[0] as string[]
                const rows = jsonData.slice(1) as any[][]

                // Normalize headers to match expected format
                const headerMap: Record<string, string> = {
                    number: 'Number',
                    phone: 'Number',
                    phonenumber: 'Number',
                    name: 'Name',
                    email: 'Email',
                    'lead source': 'Lead Source',
                    leadsource: 'Lead Source',
                    source: 'Lead Source',
                }

                const normalizedHeaders = headers.map((header) => headerMap[header.toLowerCase()] || header)

                // Validate required columns
                const requiredColumns = ['Number', 'Name', 'Lead Source']
                const missingColumns = requiredColumns.filter((col) => !normalizedHeaders.includes(col))

                if (missingColumns.length > 0) {
                    setParseError(`Missing required columns: ${missingColumns.join(', ')}`)
                    return
                }

                // Convert to object format
                const objectData = rows
                    .map((row) => {
                        const obj: any = {}
                        normalizedHeaders.forEach((header, index) => {
                            obj[header] = row[index] || ''
                        })
                        return obj
                    })
                    .filter((row) => row.Number || row.Name) // Filter out empty rows

                console.log('Excel parsed:', objectData)
                setParsedCSVData(objectData)
                setShowCSVViewer(true)
            } catch (error) {
                console.error('Error parsing Excel file:', error)
                setParseError(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        }

        reader.onerror = () => {
            setParseError('Failed to read the file')
        }

        reader.readAsBinaryString(file)
    }

    const handleSelectFile = () => {
        fileInputRef.current?.click()
    }

    const downloadTemplate = () => {
        // Download XLSX template from public folder
        const link = document.createElement('a')
        link.href = '/csv_template/excel_leads_template.xlsx'
        link.download = 'leads_template.xlsx'
        link.click()
    }

    const handleValidateCSV = async () => {
        if (parsedCSVData.length === 0) {
            alert('No data to validate')
            return
        }

        try {
            await dispatch(validateCSVData(parsedCSVData)).unwrap()
            alert('File validation successful! You can now upload the leads.')
        } catch (error) {
            // Error will be shown in the UI
        }
    }

    const handleUpload = async () => {
        if (validatedCSVData.length === 0) {
            alert('Please validate the file first')
            return
        }

        try {
            await dispatch(addBulkLeads(validatedCSVData)).unwrap()
            alert(`Successfully added ${validatedCSVData.length} leads!`)

            // Reset state
            setSelectedFile(null)
            setParsedCSVData([])
            setShowCSVViewer(false)
            setParseError(null)
            dispatch(clearValidatedCSVData())

            onClose()
            window.location.reload()
        } catch (error) {
            // Error will be shown in the UI
        }
    }

    const handleManualInputChange = (field: keyof typeof manualForm, value: string) => {
        setManualForm({ ...manualForm, [field]: value })

        // Handle KAM selection
        if (field === 'kamName') {
            const selectedKAM = kamOptions.find((kam) => kam.value === value)
            if (selectedKAM) {
                setManualForm((prev) => ({
                    ...prev,
                    kamName: value,
                    kamId: value,
                }))
            }
        }
    }

    const validateManualForm = () => {
        const requiredFields = ['name', 'phone', 'leadSource', 'kamName']
        const missingFields = requiredFields.filter((field) => !manualForm[field as keyof typeof manualForm].trim())

        if (missingFields.length > 0) {
            alert(`Please fill the following mandatory fields: ${missingFields.join(', ')}`)
            return false
        }

        // Validate phone number
        let phone = manualForm.phone.replace(/\s+/g, '')
        if (phone.startsWith('+91')) {
            phone = phone.substring(3)
        } else if (phone.startsWith('91') && phone.length === 12) {
            phone = phone.substring(2)
        }

        if (!/^\d{10}$/.test(phone)) {
            alert('Phone number must be exactly 10 digits')
            return false
        }

        // Validate email if provided
        if (manualForm.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(manualForm.email.trim())) {
                alert('Please enter a valid email address')
                return false
            }
        }

        return true
    }

    const handleAddUser = async () => {
        if (!validateManualForm()) {
            return
        }

        try {
            await dispatch(addManualLead(manualForm)).unwrap()
            alert('Lead added successfully!')

            // Reset form
            setManualForm({
                name: '',
                phone: '',
                email: '',
                leadSource: '',
                notes: '',
                kamName: '',
                kamId: '',
            })

            onClose()
            window.location.reload()
        } catch (error) {
            // Error will be shown in the UI
        }
    }

    const handleClear = () => {
        setManualForm({
            name: '',
            phone: '',
            email: '',
            leadSource: '',
            notes: '',
            kamName: '',
            kamId: '',
        })
    }

    const leadSourceOptions = [
        'whatsapp group',
        'instagram',
        'whatsapp campaign',
        'facebook',
        'referral',
        'organic',
        'classified',
    ]

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
                                {/* Error Display */}
                                {parseError && (
                                    <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm'>
                                        <div className='font-medium mb-1'>File Parse Error:</div>
                                        <div className='whitespace-pre-line'>{parseError}</div>
                                    </div>
                                )}

                                {csvValidationError && (
                                    <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm'>
                                        <div className='font-medium mb-1'>Validation Errors:</div>
                                        <div className='whitespace-pre-line'>{csvValidationError}</div>
                                    </div>
                                )}

                                {bulkAddError && (
                                    <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm'>
                                        {bulkAddError}
                                    </div>
                                )}

                                <p className='text-sm text-gray-600 mb-6'>
                                    Upload a <strong>CSV or XLSX</strong> file containing your leads. Ensure the file
                                    follows the template format with columns for Number, Name, Email, and Lead Source.
                                </p>

                                {!showCSVViewer ? (
                                    // Drag and Drop Area
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
                                                    <p className='text-sm font-medium text-gray-900'>
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className='text-xs text-gray-500'>File ready for validation</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedFile(null)
                                                        setParsedCSVData([])
                                                        setShowCSVViewer(false)
                                                        setParseError(null)
                                                    }}
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
                                                        Drag and drop your CSV or XLSX file here
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
                                ) : (
                                    // File Viewer
                                    <div className='space-y-4'>
                                        <div className='flex items-center justify-between'>
                                            <h3 className='text-lg font-medium text-gray-900'>File Preview</h3>
                                            <button
                                                onClick={() => {
                                                    setShowCSVViewer(false)
                                                    setSelectedFile(null)
                                                    setParsedCSVData([])
                                                    setParseError(null)
                                                    dispatch(clearValidatedCSVData())
                                                }}
                                                className='text-sm text-gray-600 hover:text-gray-800'
                                            >
                                                Upload Different File
                                            </button>
                                        </div>

                                        <div className='border border-gray-300 rounded-lg overflow-hidden'>
                                            <div className='overflow-x-auto max-h-64'>
                                                <table className='min-w-full divide-y divide-gray-200'>
                                                    <thead className='bg-gray-50'>
                                                        <tr>
                                                            <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                                                                Number
                                                            </th>
                                                            <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                                                                Name
                                                            </th>
                                                            <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                                                                Email
                                                            </th>
                                                            <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                                                                Lead Source
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className='bg-white divide-y divide-gray-200'>
                                                        {parsedCSVData.slice(0, 10).map((row, index) => (
                                                            <tr key={index}>
                                                                <td className='px-3 py-2 text-sm text-gray-900'>
                                                                    {row.Number}
                                                                </td>
                                                                <td className='px-3 py-2 text-sm text-gray-900'>
                                                                    {row.Name}
                                                                </td>
                                                                <td className='px-3 py-2 text-sm text-gray-900'>
                                                                    {row.Email}
                                                                </td>
                                                                <td className='px-3 py-2 text-sm text-gray-900'>
                                                                    {row['Lead Source']}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {parsedCSVData.length > 10 && (
                                                <div className='px-3 py-2 bg-gray-50 text-sm text-gray-500'>
                                                    Showing first 10 rows of {parsedCSVData.length} total rows
                                                </div>
                                            )}
                                        </div>

                                        <div className='flex gap-3'>
                                            <button
                                                onClick={handleValidateCSV}
                                                disabled={csvValidationLoading}
                                                className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'
                                            >
                                                {csvValidationLoading ? (
                                                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                                ) : null}
                                                Validate File
                                            </button>
                                        </div>

                                        {validatedCSVData.length > 0 && (
                                            <div className='p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm'>
                                                ✅ Validation successful! {validatedCSVData.length} leads ready to
                                                upload.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <p className='text-xs text-gray-500 mt-4'>
                                    <strong>Note:</strong> Supported formats: CSV and XLSX with columns Number, Name,
                                    Email, Lead Source
                                </p>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept='.csv,.xlsx'
                                    onChange={handleFileSelect}
                                    className='hidden'
                                />
                            </div>
                        ) : (
                            // Manual Upload Content
                            <div className='space-y-6'>
                                {/* Error Display */}
                                {manualAddError && (
                                    <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm'>
                                        {manualAddError}
                                    </div>
                                )}

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Name <span className='text-red-500'>*</span>
                                    </label>
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
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Phone <span className='text-red-500'>*</span>
                                    </label>
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
                                            placeholder='Enter phone number (10 digits)'
                                            className='w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                            required
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
                                            placeholder='Enter email id (optional)'
                                            className='w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm'
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Lead Source <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='relative'>
                                        <select
                                            value={manualForm.leadSource}
                                            onChange={(e) => handleManualInputChange('leadSource', e.target.value)}
                                            className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm appearance-none bg-white'
                                            required
                                        >
                                            <option value=''>Select lead source</option>
                                            {leadSourceOptions.map((source) => (
                                                <option key={source} value={source}>
                                                    {source}
                                                </option>
                                            ))}
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
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        KAM <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='relative'>
                                        <select
                                            value={manualForm.kamName}
                                            onChange={(e) => handleManualInputChange('kamName', e.target.value)}
                                            className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm appearance-none bg-white'
                                            required
                                            disabled={kamOptionsLoading}
                                        >
                                            <option value=''>
                                                {kamOptionsLoading ? 'Loading KAMs...' : 'Select KAM'}
                                            </option>
                                            {kamOptions.map((kam) => (
                                                <option key={kam.value} value={kam.value}>
                                                    {kam.value} ({kam.count})
                                                </option>
                                            ))}
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
                                    Download Template XLSX
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={validatedCSVData.length === 0 || bulkAddLoading}
                                    className='flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                >
                                    {bulkAddLoading ? (
                                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                    ) : (
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                                            />
                                        </svg>
                                    )}
                                    Upload Leads
                                </button>
                            </div>
                        ) : (
                            <div className='flex items-center justify-between'>
                                <button
                                    onClick={handleClear}
                                    className='px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors'
                                    disabled={manualAddLoading}
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleAddUser}
                                    disabled={manualAddLoading}
                                    className='flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                >
                                    {manualAddLoading ? (
                                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                    ) : (
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                                            />
                                        </svg>
                                    )}
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
