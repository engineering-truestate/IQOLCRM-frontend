'use client'

import React, { useState } from 'react'
import { type FormField } from './add-inventory_config'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import Dropdown from '../../../components/design-elements/Dropdown'
import { SelectionGroup } from '../../../components/design-elements/SelectionButtonsGroup'

interface FormFieldRendererProps {
    field: FormField
    value: any
    onChange: (value: any) => void
    error?: string
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({ field, value, onChange, error }) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

    const renderField = () => {
        switch (field.type) {
            case 'text':
            case 'number':
                return (
                    <StateBaseTextField
                        placeholder={field.placeholder}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        type={field.type === 'number' ? 'number' : 'text'}
                        className='w-full'
                    />
                )

            case 'textarea':
                return (
                    <textarea
                        placeholder={field.placeholder}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        rows={4}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm'
                    />
                )

            case 'dropdown':
                return (
                    <Dropdown
                        options={field.options || []}
                        onSelect={onChange}
                        defaultValue={value}
                        placeholder={field.placeholder}
                        className='w-full'
                        triggerClassName='w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                        optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                    />
                )

            case 'radio':
                return (
                    <SelectionGroup
                        title=''
                        type='radio'
                        color='blue'
                        options={field.options || []}
                        name={field.id}
                        onChange={(values) => onChange(values[0])}
                        className='flex gap-6'
                    />
                )

            case 'multiChoice':
                return (
                    <SelectionGroup
                        title=''
                        type='checkbox'
                        color='blue'
                        options={field.options || []}
                        multiSelect={true}
                        onChange={onChange}
                        className='flex gap-4'
                    />
                )

            case 'tabs':
                return (
                    <div className='flex flex-wrap gap-2'>
                        {field.options?.map((option) => (
                            <button
                                key={option.value}
                                type='button'
                                onClick={() => onChange(option.value)}
                                className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                                    value === option.value
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )

            case 'checkbox':
                return (
                    <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                            type='checkbox'
                            checked={value || false}
                            onChange={(e) => onChange(e.target.checked)}
                            className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                        />
                        <span className='text-sm text-gray-700'>{field.label}</span>
                    </label>
                )

            case 'upload':
                return (
                    <div className='space-y-4'>
                        <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                            <div className='flex flex-col items-center'>
                                <svg
                                    className='w-8 h-8 text-gray-400 mb-2'
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
                                <p className='text-sm text-gray-600 mb-2'>Choose a file or drag & drop it here</p>
                                <input
                                    type='file'
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || [])
                                        setUploadedFiles((prev) => [...prev, ...files])
                                        onChange([...uploadedFiles, ...files])
                                    }}
                                    className='hidden'
                                    id={`file-upload-${field.id}`}
                                />
                                <label
                                    htmlFor={`file-upload-${field.id}`}
                                    className='px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md cursor-pointer hover:bg-blue-100'
                                >
                                    Browse Files
                                </label>
                            </div>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className='space-y-2'>
                                {uploadedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md'
                                    >
                                        <div className='flex items-center gap-2'>
                                            <svg
                                                className='w-4 h-4 text-green-600'
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
                                            <span className='text-sm text-green-800'>{file.name}</span>
                                            <span className='text-xs text-green-600'>Uploading...</span>
                                        </div>
                                        <button
                                            type='button'
                                            onClick={() => {
                                                const newFiles = uploadedFiles.filter((_, i) => i !== index)
                                                setUploadedFiles(newFiles)
                                                onChange(newFiles)
                                            }}
                                            className='text-red-600 hover:text-red-800'
                                        >
                                            <svg
                                                className='w-4 h-4'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className={`space-y-2 ${field.gridCols === 1 ? 'col-span-1' : 'col-span-2'}`}>
            {field.type !== 'checkbox' && (
                <label className='block text-sm font-medium text-gray-700'>
                    {field.label}
                    {field.required && <span className='text-red-500 ml-1'>*</span>}
                </label>
            )}
            {renderField()}
            {error && <p className='text-sm text-red-600'>{error}</p>}
        </div>
    )
}

export default FormFieldRenderer
