import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable } from '../../../components/design-elements/FlexibleTable'
import { useDispatch } from 'react-redux'
import type { AppDispatch, RootState } from '../../../store'
import { fetchPrimaryPropertyById } from '../../../store/actions/restack/primaryProperties'
import { clearCurrentProperty } from '../../../store/reducers/acn/propertiesReducers'
import { useSelector } from 'react-redux'
import type { Complaint } from '../../../data_types/restack/restack-primary'

const ComplaintsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const [projectComplaints, setProjectComplaints] = useState<Complaint[]>([])
    const [promoterComplaints, setPromoterComplaints] = useState<Complaint[]>([])
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
        console.log(currentProperty, 'daata')
        setProjectComplaints(currentProperty?.complaints?.complaintsOnProject || [])
        setPromoterComplaints(currentProperty?.complaints?.complaintsOnPromoter || [])
        setProjectName(currentProperty?.projectName || 'Unknown Project')
    }, [currentProperty])

    // Function to handle navigation back to main page
    const handleNavigateToMain = () => {
        navigate('/restack/primary')
    }

    // Function to handle navigation to project details page
    const handleNavigateToProjectDetails = () => {
        navigate(`/restack/primary/${id}`)
    }

    const projectComplaintsColumns = [
        {
            key: 'registrationNo',
            header: 'Registration No',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        // {
        //     key: 'serialNo',
        //     header: 'S.No.',
        //     render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        // },
        {
            key: 'complaintNo',
            header: 'Complaint No',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'complaintBy',
            header: 'Complaint By',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'complaintDate',
            header: 'Complaint Date',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'complaintSubject',
            header: 'Complaint Subject',
            render: (value: any) => (
                <div className='max-w-[180px] truncate' title={value}>
                    <span className='text-sm text-gray-600'>{value}</span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'promoterName',
            header: 'Promoter Name',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'projectName',
            header: 'Project Name',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
    ]

    const promoterComplaintsColumns = [
        {
            key: 'registrationNo',
            header: 'Registration No',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        // {
        //     key: 'serialNo',
        //     header: 'S.No.',
        //     render: (value: any,row:any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        // },
        {
            key: 'complaintNo',
            header: 'Complaint No',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'complaintBy',
            header: 'Complaint By',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'complaintDate',
            header: 'Complaint Date',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'complaintSubject',
            header: 'Complaint Subject',
            render: (value: any) => (
                <div className='max-w-[180px] truncate' title={value}>
                    <span className='text-sm text-gray-600'>{value}</span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'promoterName',
            header: 'Promoter Name',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
        },
        {
            key: 'projectName',
            header: 'Project Name',
            render: (value: any) => <span className='whitespace-nowrap text-sm text-gray-600'>{value}</span>,
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
                        Primary
                    </button>
                    <span>/</span>
                    <button
                        onClick={handleNavigateToProjectDetails}
                        className='font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer'
                    >
                        {projectName}
                    </button>
                    <span>/</span>
                    <span className='font-medium text-gray-700'>Complaints</span>
                </div>

                {/* Page Title */}
                <h1 className='text-3xl font-bold text-gray-900 mb-8'>Complaints</h1>

                {/* Complaints on Project Section */}
                <div className='mb-12'>
                    <h2 className='text-xl font-semibold text-gray-800 mb-6'>Complaints on Project</h2>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                        <FlexibleTable
                            data={projectComplaints}
                            columns={projectComplaintsColumns}
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

                {/* Complaints on Promoter Section */}
                <div className='mb-8'>
                    <h2 className='text-xl font-semibold text-gray-800 mb-6'>Complaints on Promoter</h2>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                        <FlexibleTable
                            data={promoterComplaints}
                            columns={promoterComplaintsColumns}
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

                {/* Empty State - Show when no complaints */}
                {projectComplaints.length === 0 && promoterComplaints.length === 0 && !loading && (
                    <div className='text-center py-12'>
                        <div className='text-gray-400 mb-4'>
                            <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                />
                            </svg>
                        </div>
                        <h3 className='text-lg font-medium text-gray-900 mb-2'>No Complaints Found</h3>
                        <p className='text-gray-500'>
                            There are no complaints registered for this project or promoter.
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default ComplaintsPage
