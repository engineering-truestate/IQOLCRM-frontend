import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable } from '../../../components/design-elements/FlexibleTable'
import { useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../../store'
import { useDispatch } from 'react-redux'
import { fetchPrimaryPropertyById } from '../../../store/actions/restack/primaryProperties'
import { clearCurrentProperty } from '../../../store/reducers/acn/propertiesReducers'

const DocumentsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const [projectDocuments, setProjectDocuments] = useState<string[]>([])
    const [nocDocuments, setNOCDocuments] = useState<string[]>([])
    const [otherDocuments, setOtherDocuments] = useState<string[]>([])
    const [projectName, setProjectName] = useState<string>('')

    const { currentProperty, loading } = useSelector((state: RootState) => state.primaryProperties)

    useEffect(() => {
        if (id) {
            dispatch(fetchPrimaryPropertyById(id))
        }

        return () => {
            dispatch(clearCurrentProperty())
        }
    }, [id, dispatch])

    useEffect(() => {
        setProjectDocuments(currentProperty?.documents?.projectDocuments || [])
        setNOCDocuments(currentProperty?.documents?.nocDocuments || [])
        setOtherDocuments(currentProperty?.documents?.otherDocuments || [])
        setProjectName(currentProperty?.projectName || '')
    }, [currentProperty])

    // Function to handle navigation back to main page
    const handleNavigateToMain = () => {
        navigate('/restack/primary')
    }

    // Function to handle navigation to project details page
    const handleNavigateToProjectDetails = () => {
        navigate(`/restack/primary/${id}`)
    }

    // Function to handle document download/view
    const handleDocumentView = (url: string) => {
        if (url) {
            window.open(url, '_blank')
        }
    }

    const projectDocumentColumns = [
        {
            key: 'documentName',
            header: 'Document Name',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'link',
            header: 'Link',
            render: (value: any) => (
                <button
                    onClick={() => handleDocumentView(value)}
                    className='text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium'
                >
                    PDF Link
                </button>
            ),
        },
    ]

    const nocDocumentColumns = [
        {
            key: 'documentName',
            header: 'Document Name',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'link',
            header: 'Link',
            render: (value: any) => (
                <button
                    onClick={() => handleDocumentView(value)}
                    className='text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium'
                >
                    PDF Link
                </button>
            ),
        },
    ]

    const otherDocumentColumns = [
        {
            key: 'documentName',
            header: 'Document Name',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'link',
            header: 'Link',
            render: (value: any) => (
                <button
                    onClick={() => handleDocumentView(value)}
                    className='text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium'
                >
                    PDF Link
                </button>
            ),
        },
    ]

    return (
        <Layout loading={loading}>
            <div className='pt-6 px-4 sm:px-6 lg:px-8'>
                {/* Breadcrumb Navigation */}
                <div className='flex items-center space-x-2 text-sm text-gray-500 mb-4'>
                    <button
                        onClick={handleNavigateToMain}
                        className='hover:text-gray-700 transition-colors cursor-pointer'
                    >
                        Projects
                    </button>
                    <span>/</span>
                    <button
                        onClick={handleNavigateToProjectDetails}
                        className='font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer'
                    >
                        {projectName}
                    </button>
                    <span>/</span>
                    <span className='font-medium text-gray-700'>Documents</span>
                </div>

                {/* Page Title */}
                <h1 className='text-3xl font-bold text-gray-900 mb-8'>Documents</h1>

                {/* Project Documents Section */}
                <div className='mb-12'>
                    <h2 className='text-xl font-semibold text-gray-800 mb-6'>Project Documents</h2>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                        <FlexibleTable
                            data={projectDocuments}
                            columns={projectDocumentColumns}
                            hoverable={true}
                            borders={{
                                table: true,
                                header: true,
                                rows: true,
                                cells: false,
                                outer: true,
                            }}
                        />
                    </div>
                </div>

                {/* NOC Documents Section */}
                <div className='mb-12'>
                    <h2 className='text-xl font-semibold text-gray-800 mb-6'>NOC Documents</h2>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                        <FlexibleTable
                            data={nocDocuments}
                            columns={nocDocumentColumns}
                            enableRowSelection={false}
                            enableColumnFilters={false}
                            enableGlobalFilter={false}
                            enableColumnVisibility={false}
                            enableDensityToggle={false}
                            enableFullScreenToggle={false}
                            enableHiding={false}
                            enableMultiRowSelection={false}
                            enableColumnResizing={true}
                            enableSorting={true}
                        />
                    </div>
                </div>

                {/* Other Documents Section */}
                <div className='mb-8'>
                    <h2 className='text-xl font-semibold text-gray-800 mb-6'>Other Documents</h2>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                        <FlexibleTable data={otherDocuments} columns={otherDocumentColumns} />
                    </div>
                </div>

                {/* Empty State - Show when no documents */}
                {projectDocuments.length === 0 &&
                    nocDocuments.length === 0 &&
                    otherDocuments.length === 0 &&
                    !loading && (
                        <div className='text-center py-12'>
                            <div className='text-gray-400 mb-4'>
                                <svg
                                    className='mx-auto h-12 w-12'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                    />
                                </svg>
                            </div>
                            <h3 className='text-lg font-medium text-gray-900 mb-2'>No Documents Found</h3>
                            <p className='text-gray-500'>There are no documents available for this project.</p>
                        </div>
                    )}
            </div>
        </Layout>
    )
}

export default DocumentsPage
