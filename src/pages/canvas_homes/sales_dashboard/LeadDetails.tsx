import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLeadDetails } from '../../../hooks/canvas_homes/useLeadDetails'
import Layout from '../../../layout/Layout'
import Documents from './tabs/Documents'
import Notes from './tabs/Notes'
import Requirements from './tabs/Requirements'
import Tasks from './tabs/Tasks'
import CreateTaskModal from '../../../components/canvas_homes/CreateTaskModal'
import AddDetailsModal from '../../../components/canvas_homes/AddDetailsModal'
import AddEnquiryModal from '../../../components/canvas_homes/AddEnquiryModal'
import ChangeAgentModal from '../../../components/canvas_homes/ChangeAgentModal'
import type { AgentHistoryItem } from '../../../services/canvas_homes/types'
import google from '/icons/canvas_homes/google.svg'
import CloseLeadSideModal from '../../../components/canvas_homes/CloseLeadSideModal'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../../store'
import ActivityTracker from './tabs/ActivityTracker'

// Helper function to handle null/undefined values
const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
        return '-'
    }
    return String(value)
}

// Update the interface to make leadId optional since we'll get it from URL
interface LeadDetailProps {
    leadId?: string // Optional - will use URL param if not provided
    onClose?: () => void
}

const LeadDetails: React.FC<LeadDetailProps> = ({ leadId: propLeadId, onClose }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { leadId } = useParams<{ leadId: string }>()

    const {
        leadData,
        enquiries,
        currentEnquiry,
        tasks,
        userData,
        selectedEnquiryId,
        activeTab,
        loading,
        errors,
        setActiveTab,
        setSelectedEnquiryId,
        refreshData,
        updateTaskStatus,
        addNote,
        createNewTask,
        updateEnquiry,
        updateLead,
        updateTask,
    } = useLeadDetails(leadId || '') // Provide empty string as fallback

    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
    const [isAddDetailsModalOpen, setIsAddDetailsModalOpen] = useState(false)
    const [isCloseLeadSideModalOpen, setIsCloseLeadSideModalOpen] = useState(false)
    const [isAddEnquiryModalOpen, setIsAddEnquiryModalOpen] = useState(false)
    const [isChangeAgentModalOpen, setIsChangeAgentModalOpen] = useState(false)

    // Early return AFTER hooks are called
    if (!leadId) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center h-screen'>
                    <div className='text-center'>
                        <p className='text-red-600 mb-4'>No lead ID provided</p>
                        <button
                            onClick={() => navigate('/leads')}
                            className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                        >
                            Back to Leads
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    const tabs = ['Task', 'Properties', 'Requirements', 'Notes', 'Activity tracker', 'Documents']

    // Event Handlers
    const handleCreateTaskClick = () => {
        setIsCreateTaskModalOpen(true)
    }

    const handleCloseCreateTaskModal = () => {
        setIsCreateTaskModalOpen(false)
        refreshData()
    }

    // Add Details Modal Handlers
    const handleAddDetailsClick = () => {
        setIsAddDetailsModalOpen(true)
    }
    const handleDetailsAdded = () => {
        refreshData()
        setIsAddDetailsModalOpen(false)
    }

    const handleClose = () => {
        if (onClose) {
            onClose()
        } else {
            navigate('/canvas-homes/sales')
        }
    }

    const handleEnquirySelect = (enquiryId: string) => {
        setSelectedEnquiryId(enquiryId)
    }

    // Format date helpers
    const formatDate = (timestamp: number | null | undefined) => {
        if (!timestamp) return '-'
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const formatDateTime = (timestamp: number | null | undefined) => {
        if (!timestamp) return '-'
        const date = new Date(timestamp)
        return (
            date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
            }) +
            ' | ' +
            date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
        )
    }

    // Tab Content Renderer
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Task':
                return (
                    <Tasks
                        tasks={tasks}
                        loading={loading.tasks}
                        error={errors.tasks}
                        setActiveTab={setActiveTab}
                        refreshData={refreshData}
                    />
                )
            case 'Documents':
                return (
                    <Documents
                        leadId={leadId}
                        enquiryId={selectedEnquiryId}
                        documents={currentEnquiry?.documents || []}
                        onDocumentsUpdate={refreshData}
                    />
                )
            case 'Notes':
                return <Notes notes={currentEnquiry?.notes || []} onAddNote={addNote} loading={loading.enquiries} />
            case 'Activity tracker':
                return <ActivityTracker enquiryId={selectedEnquiryId} />
            case 'Requirements':
                return (
                    <Requirements
                        leadId={leadId}
                        enquiryId={selectedEnquiryId}
                        requirements={currentEnquiry?.requirements || []}
                        onRequirementsUpdate={refreshData}
                    />
                )
            default:
                return (
                    <div className='bg-white rounded-lg shadow-sm p-8 h-full'>
                        <div className='text-center text-gray-500'>
                            <div className='text-lg font-medium text-gray-900 mb-2'>{activeTab} Content</div>
                            <p className='text-gray-600'>Content for {activeTab} tab will be displayed here</p>
                        </div>
                    </div>
                )
        }
    }

    // Loading state
    if (loading.lead) {
        return (
            <Layout loading={true}>
                <div className='flex items-center justify-center h-screen'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                        <p className='text-gray-600'>Loading lead details...</p>
                        <p className='text-sm text-gray-500 mt-2'>Lead ID: {leadId}</p>
                    </div>
                </div>
            </Layout>
        )
    }

    // Error state
    if (errors.lead) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center h-screen'>
                    <div className='text-center'>
                        <p className='text-red-600 mb-4'>{errors.lead}</p>
                        <p className='text-sm text-gray-500 mb-4'>Lead ID: {leadId}</p>
                        <div className='space-x-2'>
                            <button
                                onClick={refreshData}
                                className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                            >
                                Retry
                            </button>
                            <button
                                onClick={handleClose}
                                className='bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700'
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    // No lead data
    if (!leadData) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center h-screen'>
                    <div className='text-center'>
                        <p className='text-gray-600 mb-4'>Lead not found</p>
                        <p className='text-sm text-gray-500 mb-4'>Lead ID: {leadId}</p>
                        <button
                            onClick={handleClose}
                            className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    // Agent Item Component
    const AgentItem: React.FC<{ agent: AgentHistoryItem; showDivider: boolean }> = ({ agent, showDivider }) => (
        <div className='space-y-2'>
            <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                <span className='text-[13px] w-[60%] text-gray-600'>Agent Name</span>
                <span className='text-[13px] w-[40%] text-left text-gray-900 ml-auto'>
                    {formatValue(agent.agentName)}
                </span>
            </div>
            <div className='flex justify-between ml-4'>
                <span className='text-[13px] w-[60%] text-gray-600'>Last Stage</span>
                <span className='text-[13px] w-[40%] text-left text-gray-900'>{formatValue(agent.lastStage)}</span>
            </div>
            <div className='flex justify-between ml-4'>
                <span className='text-[13px] w-[60%] text-gray-600'>Date</span>
                <span className='text-[13px] w-[40%] text-left text-gray-900'>{formatDate(agent.timestamp)}</span>
            </div>
            {showDivider && <hr className='my-3 border-gray-200' />}
        </div>
    )

    return (
        <Layout loading={false}>
            <div className='w-full'>
                <div className='bg-white min-h-screen w-full max-w-full'>
                    {/* Header with Breadcrumb */}
                    <div className='flex items-center justify-between p-3 border-b border-gray-300'>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <button onClick={handleClose} className='font-medium hover:text-gray-800'>
                                <span>Sales Dashboard</span>
                            </button>
                            <span>/</span>
                            <span className='text-gray-900 font-medium'>{formatValue(leadData?.name)}</span>
                        </div>
                    </div>

                    <div className='flex flex-1 overflow-hidden flex-col md:flex-row'>
                        {/* Main Content - Left Side */}
                        <div className='w-full md:w-[70%]'>
                            {/* Tabs Navigation */}
                            <div className='bg-white border-b border-gray-200 flex-shrink-0 overflow-x-auto'>
                                <div className='px-2 md:px-6'>
                                    <div className='flex items-center justify-between'>
                                        <nav className='flex space-x-4 md:space-x-11 overflow-x-auto scrollbar-hide'>
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => {
                                                        setActiveTab(tab)
                                                    }}
                                                    className={`py-3 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-colors ${
                                                        activeTab === tab
                                                            ? 'border-blue-500 text-blue-600'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </nav>
                                        {activeTab === 'Task' && (
                                            <button
                                                onClick={handleCreateTaskClick}
                                                className='flex items-center gap-2 bg-blue-600 text-white px-2 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap'
                                            >
                                                <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                                                    <path
                                                        d='M8 1V15M1 8H15'
                                                        stroke='currentColor'
                                                        strokeWidth='2'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                </svg>
                                                <span className='hidden md:inline'>Create Task</span>
                                                <span className='inline md:hidden'>Task</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className='flex-1 h-full overflow-y-auto'>{renderTabContent()}</div>
                        </div>

                        {/* Right Sidebar - Customer Details, Enquiry Details, Agent Details */}
                        <div
                            className='w-full md:w-[30%] bg-white border-t md:border-t-0 md:border-l border-gray-200 flex flex-col'
                            style={{ height: 'auto', minHeight: '40vh', maxHeight: 'calc(100vh - 44.6px)' }}
                        >
                            <div className='flex-1 p-4 space-y-6 flex flex-col overflow-hidden'>
                                {/* Customer Details Section */}
                                <div className='flex-shrink-0'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <h3 className='font-medium text-sm text-gray-900'>Customer Details</h3>

                                        <button
                                            onClick={handleAddDetailsClick}
                                            className='bg-gray-200 h-8 w-26 text-gray-700 p-2 rounded text-xs font-medium hover:bg-gray-300 transition-colors'
                                        >
                                            Add Details
                                        </button>
                                    </div>

                                    <div className='space-y-3'>
                                        <div className='flex justify-between'>
                                            <span className='text-[13px] w-[60%] font-normal text-gray-600'>Name</span>
                                            <span className='text-[13px] w-[40%] text-left font-normal text-gray-900'>
                                                {formatValue(leadData?.leadName || leadData?.name || userData?.name)}
                                            </span>
                                        </div>

                                        <div className='flex justify-between'>
                                            <span className='text-[13px] w-[60%] text-gray-600'>Phone no.</span>
                                            <div className='w-[40%] text-left'>
                                                <span className='text-[13px] text-gray-900'>
                                                    {formatValue(leadData?.phoneNumber || userData?.phonenumber)}
                                                </span>
                                                {leadData?.label && (
                                                    <span
                                                        className={`ml-1 text-xs px-1 py-0.5 rounded ${
                                                            leadData.label === 'whatsapp'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}
                                                    >
                                                        {leadData.label === 'whatsapp' ? 'WhatsApp' : 'Call'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Additional Phone Numbers */}
                                        {leadData?.phoneNumbers &&
                                            leadData.phoneNumbers.length > 0 &&
                                            leadData.phoneNumbers.map((phone, index) => (
                                                <div key={index} className='flex justify-between'>
                                                    <span className='text-[13px] w-[60%] text-gray-600'>
                                                        Phone {index + 2}
                                                    </span>
                                                    <div className='w-[40%] text-left'>
                                                        <span className='text-[13px] text-gray-900'>
                                                            {formatValue(phone.number)}
                                                        </span>
                                                        <span
                                                            className={`ml-1 text-xs px-1 py-0.5 rounded ${
                                                                phone.label === 'whatsapp'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                            }`}
                                                        >
                                                            {phone.label === 'whatsapp' ? 'WhatsApp' : 'Call'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                        <div className='mt-3'>
                                            <button className='w-full h-7.5 text-sm border border-gray-200 rounded-md pb-1 bg-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors'>
                                                Details From Sign 3
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Enquiry Details Section */}
                                <div className='flex-shrink-0'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <h3 className='font-medium text-sm text-gray-900'>Enquiry Details</h3>
                                        <button
                                            className='bg-gray-200 h-8 w-26 text-gray-700 p-2 rounded text-xs font-medium hover:bg-gray-300 transition-colors'
                                            onClick={() => {
                                                setIsAddEnquiryModalOpen(true)
                                            }}
                                        >
                                            Add Enquiry
                                        </button>
                                    </div>

                                    {loading.enquiries ? (
                                        <div className='flex items-center justify-center py-4'>
                                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                                            <span className='ml-2 text-sm text-gray-600'>Loading enquiries...</span>
                                        </div>
                                    ) : enquiries.length > 0 ? (
                                        <div className='space-y-3'>
                                            {/* Enquiry Tabs */}
                                            <div className='flex gap-4 md:gap-8 mb-3.5 border-b border-gray-200 overflow-x-auto scrollbar-hide'>
                                                {enquiries.map((enquiry, index) => (
                                                    <button
                                                        key={enquiry.enquiryId}
                                                        onClick={() => handleEnquirySelect(enquiry.enquiryId)}
                                                        className={`py-1 px-1 text-xs font-medium border-b-2 transition-colors duration-150 whitespace-nowrap ${
                                                            selectedEnquiryId === enquiry.enquiryId
                                                                ? 'border-blue-500 text-blue-600'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                        }`}
                                                    >
                                                        Enquiry {index + 1}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Current Enquiry Details */}
                                            {currentEnquiry && (
                                                <div className='space-y-3'>
                                                    <div className='flex justify-between'>
                                                        <span className='text-[13px] w-[60%] text-gray-600'>
                                                            Property Name
                                                        </span>
                                                        <span className='text-[13px] w-[40%] text-gray-900'>
                                                            {formatValue(currentEnquiry.propertyName)}
                                                        </span>
                                                    </div>

                                                    <div className='flex justify-between'>
                                                        <span className='text-[13px] w-[60%] text-gray-600'>
                                                            Enquiry Date
                                                        </span>
                                                        <span className='text-[13px] w-[40%] text-gray-900'>
                                                            {formatDate(currentEnquiry.added)}
                                                        </span>
                                                    </div>

                                                    <div className='flex justify-between'>
                                                        <span className='text-[13px] w-[60%] text-gray-600'>Stage</span>
                                                        <span className='text-[13px] w-[40%] text-gray-900'>
                                                            {formatValue(currentEnquiry.stage)}
                                                        </span>
                                                    </div>

                                                    <div className='flex justify-between'>
                                                        <span className='text-[13px] w-[60%] text-gray-600'>
                                                            Status
                                                        </span>
                                                        <span className='text-[13px] w-[40%] text-gray-900'>
                                                            {formatValue(currentEnquiry.leadStatus)}
                                                        </span>
                                                    </div>

                                                    <div className='flex justify-between items-center'>
                                                        <span className='text-sm w-[60%] text-gray-600'>Source</span>
                                                        <div className='w-[40%] flex items-center gap-2 text-left'>
                                                            {currentEnquiry?.source === 'Google' ? (
                                                                <img src={google} alt='Google' className='w-4 h-4' />
                                                            ) : currentEnquiry.source === 'META' ||
                                                              currentEnquiry.source === 'Facebook' ? (
                                                                <div className='w-4 h-4 bg-blue-600 rounded flex items-center justify-center'>
                                                                    <span className='text-white text-xs font-bold'>
                                                                        F
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className='w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center'>
                                                                    <span className='text-white text-xs font-bold'>
                                                                        {currentEnquiry?.source
                                                                            ? currentEnquiry.source
                                                                                  .charAt(0)
                                                                                  .toUpperCase()
                                                                            : '-'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <span className='text-xs text-gray-600'>
                                                                {formatValue(currentEnquiry.source)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className='flex justify-between items-center'>
                                                        <span className='text-sm w-[60%] text-gray-600'>Tag</span>
                                                        <div className='w-[40%] text-left'>
                                                            {currentEnquiry.tag ? (
                                                                <div
                                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                                        currentEnquiry.tag === 'hot'
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : currentEnquiry.tag === 'super hot'
                                                                              ? 'bg-red-200 text-red-900'
                                                                              : currentEnquiry.tag === 'potential'
                                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                                : 'bg-blue-100 text-blue-800'
                                                                    }`}
                                                                >
                                                                    <svg
                                                                        width='12'
                                                                        height='12'
                                                                        viewBox='0 0 12 12'
                                                                        fill='none'
                                                                    >
                                                                        <path
                                                                            d='M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z'
                                                                            fill='currentColor'
                                                                        />
                                                                    </svg>
                                                                    <span>{currentEnquiry.tag}</span>
                                                                </div>
                                                            ) : (
                                                                <span className='text-[13px] text-gray-500'>-</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className='text-center py-4 text-gray-500'>
                                            <p className='text-sm'>No enquiries found</p>
                                        </div>
                                    )}
                                </div>

                                {/* Agent Details Section */}
                                <div className='flex-1 flex flex-col min-h-0'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <h3 className='font-medium text-sm text-gray-900'>Agent Details</h3>
                                        <button
                                            className='bg-gray-200 h-8 w-26 text-gray-700 p-2 rounded text-xs font-medium hover:bg-gray-300 transition-colors'
                                            onClick={() => {
                                                setIsChangeAgentModalOpen(true)
                                            }}
                                        >
                                            Change Agent
                                        </button>
                                    </div>

                                    <div className='flex-1 overflow-y-auto scrollbar-hide space-y-4'>
                                        {loading.enquiries ? (
                                            <div className='flex items-center justify-center py-4'>
                                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                                                <span className='ml-2 text-sm text-gray-600'>Loading agents...</span>
                                            </div>
                                        ) : currentEnquiry?.agentHistory && currentEnquiry.agentHistory.length > 0 ? (
                                            currentEnquiry.agentHistory.map((agent, index) => (
                                                <AgentItem
                                                    key={index}
                                                    agent={agent}
                                                    showDivider={index < currentEnquiry.agentHistory.length - 1}
                                                />
                                            ))
                                        ) : (
                                            <div className='text-center py-4 text-gray-500'>
                                                <p className='text-sm'>No agent history available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Close Lead Button */}
                            <div className='p-4 border-t border-gray-200 flex-shrink-0'>
                                <button
                                    className='w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors'
                                    onClick={() => {
                                        setIsCloseLeadSideModalOpen(true)
                                    }}
                                >
                                    Close lead
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateTaskModalOpen}
                onClose={handleCloseCreateTaskModal}
                enquiryId={selectedEnquiryId}
                onTaskCreated={createNewTask}
                agentId={currentEnquiry?.agentId}
                agentName={leadData?.agentName}
                leadId={leadId}
                leadStatus={leadData?.leadStatus}
                stage={currentEnquiry?.stage}
                tag={currentEnquiry?.tag}
                propertyName={currentEnquiry?.propertyName}
                name={leadData?.name}
                leadAddDate={leadData?.added}
            />
            <AddDetailsModal
                isOpen={isAddDetailsModalOpen}
                onClose={() => setIsAddDetailsModalOpen(false)}
                onDetailsAdded={handleDetailsAdded}
                leadId={leadId}
                userId={leadData?.userId}
                currentPhoneNumber={leadData?.phoneNumber}
                currentLabel={leadData?.label}
                additionalPhoneNumbers={leadData?.phoneNumbers || []}
            />
            <ChangeAgentModal
                isOpen={isChangeAgentModalOpen}
                onClose={() => setIsChangeAgentModalOpen(false)}
                onDetailsAdded={handleDetailsAdded}
                leadId={leadId}
                enquiryId={selectedEnquiryId}
                agentName={leadData?.agentName}
            />
            <AddEnquiryModal
                isOpen={isAddEnquiryModalOpen}
                onClose={() => setIsAddEnquiryModalOpen(false)}
                onEnquiryAdded={refreshData}
                leadId={leadId}
                stage={leadData?.stage}
                agentName={leadData?.agentName}
            />
            <CloseLeadSideModal
                isOpen={isCloseLeadSideModalOpen}
                onClose={() => setIsCloseLeadSideModalOpen(false)}
                leadId={leadId}
                enquiryId={selectedEnquiryId}
                onLeadClosed={refreshData}
                agentName={leadData?.agentName}
            />
        </Layout>
    )
}

export default LeadDetails
