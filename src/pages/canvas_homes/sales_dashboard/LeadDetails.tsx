import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// import { UseLeadDetails } from '../../../hooks/canvas_homes/UseLeadDetails'
import { UseLeadDetails } from '../../../hooks/canvas_homes/useLeadDetails'
import Layout from '../../../layout/Layout'
import hotIcon from '/icons/canvas_homes/hoticon.svg'
import coldIcon from '/icons/canvas_homes/coldicon.svg'
import mailIcon from '/icons/canvas_homes/mailicon.svg'
import potentialIcon from '/icons/canvas_homes/bulbicon.svg'
import superhotIcon from '/icons/canvas_homes/superhoticon.svg'
import linkedin from '/icons/canvas_homes/linkedin.svg'
import meta from '/icons/canvas_homes/meta.svg'
import Documents from './tabs/Documents'
import Notes from './tabs/Notes'
import Requirements from './tabs/Requirements'
import Tasks from './tabs/Tasks'
import CreateTaskModal from '../../../components/canvas_homes/CreateTaskModal'
import AddDetailsModal from '../../../components/canvas_homes/AddDetailsModal'
import AddEnquiryModal from '../../../components/canvas_homes/AddEnquiryModal'
import ChangeAgentModal from '../../../components/canvas_homes/ChangeAgentModal'
import ReopenLeadModal from '../../../components/canvas_homes/ReopenLeadModal'
import google from '/icons/canvas_homes/google.svg'
import manualIcon from '/icons/canvas_homes/manualicon.svg'
import whatsapp from '/icons/canvas_homes/whatsappicon.svg'
import call from '/icons/canvas_homes/callicon.svg'
import CloseLeadSideModal from '../../../components/canvas_homes/CloseLeadSideModal'
import ActivityTracker from './tabs/ActivityTracker'
import PropertyDetail from './tabs/PropertyDetail'

// Type definitions
interface PhoneNumber {
    number: string
    label: string
}

interface AgentHistoryItem {
    agentName: string
    lastStage: string
    timestamp: number
    agentId?: string
}

interface Document {
    id: string
    name: string
    url: string
    type: string
    size: number
    uploadedAt: number
}

interface Note {
    id: string
    content: string
    createdAt: number
    createdBy: string
}

interface LeadRequirement {
    id: string
    description: string
    status: string
    createdAt: number
}

interface Enquiry {
    enquiryId: string
    propertyId: string
    propertyName: string
    stage: string
    leadStatus: string
    source: string
    tag: string
    added: number
    agentId: string
    state: string
    agentHistory: AgentHistoryItem[]
    documents: Document[]
    notes: Note[]
    requirements: LeadRequirement[]
}

interface Task {
    id: string
    title: string
    description: string
    status: string
    assignedTo: string
    dueDate: number
    createdAt: number
}

interface LeadData {
    leadId: string
    name: string
    phoneNumber: string
    phoneNumbers: PhoneNumber[]
    label: string
    userId: string
    agentName: string
    stage: string
    leadStatus: string
    state: string
    added: number
}

interface UserData {
    userId: string
    name: string
    phoneNumber: string
    emailAddress: string
}

interface UseLeadDetailsReturn {
    leadData: LeadData | null
    enquiries: Enquiry[]
    currentEnquiry: Enquiry | null
    tasks: Task[]
    userData: UserData | null
    selectedEnquiryId: string | null
    activeTab: string
    loading: {
        lead: boolean
        enquiries: boolean
        tasks: boolean
    }
    errors: {
        lead: string | null
        enquiries: string | null
        tasks: string | null
    }
    setActiveTab: (tab: string) => void
    setSelectedEnquiryId: (id: string) => void
    refreshData: () => void
    addNote: (note: string) => void
    createNewTask: (task: Partial<Task>) => Promise<void>
}

// Helper function to handle null/undefined values and capitalize first letter of each word
const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
        return '-'
    }
    // Capitalize first letter of each word
    return String(value)
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

// Update the interface to make leadId optional since we'll get it from URL
interface LeadDetailProps {
    leadId?: string // Optional - will use URL param if not provided
    onClose?: () => void
}

const LeadDetails: React.FC<LeadDetailProps> = ({ onClose }) => {
    const navigate = useNavigate()
    // const dispatch = useDispatch<AppDispatch>()
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
        addNote,
        createNewTask: _createNewTask,
    } = UseLeadDetails(leadId || '') as unknown as UseLeadDetailsReturn // Provide empty string as fallback

    // Ensure createNewTask returns a Promise
    const createNewTask = async (task: Partial<Task>) => {
        await _createNewTask(task)
    }

    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false)
    const [isAddDetailsModalOpen, setIsAddDetailsModalOpen] = useState<boolean>(false)
    const [isCloseLeadSideModalOpen, setIsCloseLeadSideModalOpen] = useState<boolean>(false)
    const [isAddEnquiryModalOpen, setIsAddEnquiryModalOpen] = useState<boolean>(false)
    const [isChangeAgentModalOpen, setIsChangeAgentModalOpen] = useState<boolean>(false)
    const [isReopenLeadModalOpen, setIsReopenLeadModalOpen] = useState<boolean>(false)

    // Early return AFTER hooks are called
    if (!leadId) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center h-screen'>
                    <div className='text-center'>
                        <p className='text-red-600 mb-4'>No lead ID provided</p>
                        <button
                            onClick={() => navigate('/canvas-homes/sales')}
                            className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                        >
                            Back to Leads
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    const tabs: string[] = ['Task', 'Properties', 'Requirements', 'Notes', 'Documents', 'Activity tracker']

    // Event Handlers
    const handleCreateTaskClick = (): void => {
        setIsCreateTaskModalOpen(true)
    }

    const handleCloseCreateTaskModal = (): void => {
        setIsCreateTaskModalOpen(false)
    }

    // Add Details Modal Handlers
    const handleAddDetailsClick = (): void => {
        setIsAddDetailsModalOpen(true)
    }
    // const handleDetailsAdded = () => {
    //     setIsAddDetailsModalOpen(false)
    // }

    const handleClose = (): void => {
        if (onClose) {
            onClose()
        } else {
            window.location.href = '/canvas-homes/sales'
        }
    }

    const handleEnquirySelect = (enquiryId: string): void => {
        setSelectedEnquiryId(enquiryId)
    }

    // Format date helpers
    const formatDate = (timestamp: number | null | undefined): string => {
        if (!timestamp) return '-'
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    // const formatDateTime = (timestamp: number | null | undefined) => {
    //     if (!timestamp) return '-'
    //     const date = new Date(timestamp)
    //     return (
    //         date.toLocaleDateString('en-US', {
    //             month: '2-digit',
    //             day: '2-digit',
    //             year: '2-digit',
    //         }) +
    //         ' | ' +
    //         date.toLocaleTimeString('en-US', {
    //             hour: '2-digit',
    //             minute: '2-digit',
    //             hour12: true,
    //         })
    //     )
    // }

    // Tab Content Renderer
    const renderTabContent = (): React.ReactNode => {
        switch (activeTab) {
            case 'Task':
                return (
                    <Tasks
                        tasks={tasks.map((task) => ({
                            // Map your local Task to the required Task type, filling all required fields
                            taskId: (task as any).taskId ?? task.id ?? '',
                            enquiryId: (task as any).enquiryId ?? selectedEnquiryId ?? '',
                            agentId: (task as any).agentId ?? currentEnquiry?.agentId ?? '',
                            agentName: (task as any).agentName ?? leadData?.agentName ?? '',
                            title: task.title,
                            description: task.description,
                            status: task.status === 'open' || task.status === 'complete' ? task.status : 'open',
                            assignedTo: task.assignedTo,
                            dueDate: task.dueDate,
                            createdAt: task.createdAt,
                            // Add all required fields with defaults or from context
                            name: (task as any).name ?? leadData?.name ?? '',
                            leadAddDate: (task as any).leadAddDate ?? leadData?.added ?? 0,
                            propertyName: (task as any).propertyName ?? currentEnquiry?.propertyName ?? '',
                            taskType: (task as any).taskType ?? '',
                            leadStatus: (task as any).leadStatus ?? leadData?.leadStatus ?? '',
                            stage: (task as any).stage ?? currentEnquiry?.stage ?? '',
                            tag: (task as any).tag ?? currentEnquiry?.tag ?? '',
                            propertyId: (task as any).propertyId ?? currentEnquiry?.propertyId ?? '',
                            // Required Task fields for type compatibility
                            scheduledDate: (task as any).scheduledDate ?? task.dueDate ?? 0,
                            added: (task as any).added ?? task.createdAt ?? 0,
                            lastModified: (task as any).lastModified ?? task.createdAt ?? 0,
                        }))}
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
                        enquiryId={selectedEnquiryId ?? ''}
                        documents={(currentEnquiry?.documents || []).map((doc) => ({
                            ...doc,
                            uploadDate: String(doc.uploadedAt), // Convert to string
                            storagePath: doc.url || '', // Map url to storagePath (or provide a default)
                            size: String(doc.size), // Convert size to string
                        }))}
                        onDocumentsUpdate={refreshData}
                    />
                )
            case 'Notes':
                return (
                    <Notes
                        notes={(currentEnquiry?.notes || []).map((note) => ({
                            // Map Note to NoteItem, filling missing fields with defaults or from context
                            timestamp: note.createdAt ?? 0,
                            agentId: currentEnquiry?.agentId ?? '',
                            agentName: leadData?.agentName ?? '',
                            taskType: '', // Provide a default or map if available
                            note: note.content,
                            // Optionally, include other NoteItem fields if needed
                            ...note,
                        }))}
                        onAddNote={async (noteData) => {
                            // Call your addNote function with the note content
                            addNote(noteData.note)
                        }}
                        loading={loading.enquiries}
                    />
                )
            case 'Activity tracker':
                return <ActivityTracker enquiryId={selectedEnquiryId ?? ''} />
            case 'Requirements':
                return (
                    <Requirements
                        leadId={leadId}
                        enquiryId={selectedEnquiryId ?? ''}
                        requirements={(currentEnquiry?.requirements as any) || []}
                        onRequirementsUpdate={refreshData}
                    />
                )
            case 'Properties':
                return (
                    <PropertyDetail
                        propertyId={currentEnquiry?.propertyId || ''}
                        propertyName={currentEnquiry?.propertyName || ''}
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

    // Source Icon Component
    const SourceIcon: React.FC<{ source: string | null | undefined }> = ({ source }) => {
        if (!source) return null

        const sourceType = String(source).toLowerCase()
        return (
            <div className='flex items-center justify-center h-5 rounded-[20px] py-4'>
                {sourceType === 'google' && <img src={google} alt='Google' className='w-4 h-4 object-contain' />}
                {sourceType === 'linkedin' && <img src={linkedin} alt='LinkedIn' className='w-4 h-4 object-contain' />}
                {sourceType === 'meta' && <img src={meta} alt='Meta' className='w-4 h-4 object-contain' />}
                {sourceType === 'manual' && <img src={manualIcon} alt='Manual' className='w-4 h-4 object-contain' />}

                <span className='ml-[3.5px] text-[13px] font-normal '>{formatValue(sourceType || '-')}</span>
            </div>
        )
    }

    // Tag Badge Component
    const TagBadge: React.FC<{ tag: string | null | undefined }> = ({ tag }) => {
        if (!tag) return <span className='text-[13px] text-gray-500'>-</span>

        const tagType = String(tag).toLowerCase()
        let badgeClasses = 'inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium'
        let tagIcon: string

        // Determine styling and icon based on tag type
        switch (tagType) {
            case 'hot':
                badgeClasses += ' bg-[#FFDDDE] text-[#F02532]'
                tagIcon = hotIcon
                break
            case 'super hot':
                badgeClasses += ' bg-[#FAC8C9] text-[#A4151E]'
                tagIcon = superhotIcon
                break
            case 'potential':
                badgeClasses += ' bg-[#E1F6DF] text-[#2E8E16]'
                tagIcon = potentialIcon
                break
            case 'cold':
                badgeClasses += ' bg-[#E2F4FF] text-[#1C6CED]'
                tagIcon = coldIcon
                break
            default:
                // Default styling for unknown tags
                badgeClasses += ' bg-[#E2F4FF] text-[#1C6CED]'
                tagIcon = coldIcon // Use cold as default
        }

        return (
            <div className={badgeClasses}>
                <img src={tagIcon} alt={tagType} width='12' height='12' />
                <span>{formatValue(tag)}</span>
            </div>
        )
    }

    // Agent Item Component
    // const AgentItem: React.FC<{ agent: AgentHistoryItem; showDivider: boolean }> = ({ agent, showDivider }) => (
    //     <div className='space-y-2'>
    //         <div className='flex items-center gap-2'>
    //             <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
    //             <span className='text-[13px] w-[60%] text-gray-600'>Agent Name</span>
    //             <span className='text-[13px] w-[40%] text-left text-gray-900 ml-auto'>
    //                 {formatValue(agent.agentName)}
    //             </span>
    //         </div>
    //         <div className='flex justify-between ml-4'>
    //             <span className='text-[13px] w-[60%] text-gray-600'>Last Stage</span>
    //             <span className='text-[13px] w-[40%] text-left text-gray-900'>{formatValue(agent.lastStage)}</span>
    //         </div>
    //         <div className='flex justify-between ml-4'>
    //             <span className='text-[13px] w-[60%] text-gray-600'>Date</span>
    //             <span className='text-[13px] w-[40%] text-left text-gray-900'>{formatDate(agent.timestamp)}</span>
    //         </div>
    //         {showDivider && <hr className='my-3 border-gray-200' />}
    //     </div>
    // )

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
                                                className='flex items-center gap-2 bg-[#1C6CED] text-white px-2 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap'
                                            >
                                                <svg width='12' height='12' viewBox='0 0 16 16' fill='none'>
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
                                {/* Customer Details Section - Made scrollable when content overflows */}
                                <div className='flex-shrink-0 flex flex-col max-h-[18vh] overflow-hidden'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <h3 className='font-medium text-sm text-gray-900'>Customer Details</h3>

                                        <button
                                            onClick={handleAddDetailsClick}
                                            className='bg-gray-200 h-8 w-26 text-gray-700 p-2 rounded text-xs font-medium hover:bg-gray-300 transition-colors'
                                        >
                                            Add Details
                                        </button>
                                    </div>

                                    {/* Scrollable container for customer details */}
                                    <div className='overflow-y-auto pr-1 scrollbar-thin'>
                                        <div className='space-y-[11px]'>
                                            <div className='flex justify-between'>
                                                <span className='text-[13px] w-[60%] font-normal text-gray-600'>
                                                    Name
                                                </span>
                                                <span className='text-[13px] w-[40%] text-left font-normal text-gray-900'>
                                                    {formatValue(leadData?.name || userData?.name)}
                                                </span>
                                            </div>

                                            <div className='flex justify-between'>
                                                <span className='text-[13px] w-[60%] text-gray-600'>Phone No.</span>
                                                <div className='w-[40%] text-left flex items-center'>
                                                    {leadData && (
                                                        <span className='mr-1 flex-shrink-0'>
                                                            <img
                                                                src={leadData?.label === 'whatsapp' ? whatsapp : call}
                                                                alt={
                                                                    leadData.label === 'whatsapp' ? 'WhatsApp' : 'Call'
                                                                }
                                                                className='w-4 h-4'
                                                            />
                                                        </span>
                                                    )}
                                                    <span className='text-[13px] text-gray-900 truncate'>
                                                        {formatValue(userData?.phoneNumber)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Additional Phone Numbers */}
                                            {leadData?.phoneNumbers &&
                                                leadData.phoneNumbers.length > 0 &&
                                                leadData.phoneNumbers.map((phone, index) => (
                                                    <div key={index} className='flex justify-between'>
                                                        <span className='text-[13px] w-[60%] text-gray-600'>
                                                            {phone.label === 'whatsapp'
                                                                ? 'WhatsApp No.'
                                                                : `Phone No. ${index + 2}`}
                                                        </span>

                                                        <div className='w-[40%] text-left flex items-center'>
                                                            <span className='mr-1 flex-shrink-0'>
                                                                <img
                                                                    src={phone.label === 'whatsapp' ? whatsapp : call}
                                                                    alt={
                                                                        phone.label === 'whatsapp' ? 'WhatsApp' : 'Call'
                                                                    }
                                                                    className='w-4 h-4'
                                                                />
                                                            </span>

                                                            <span className='text-[13px] text-gray-900 truncate'>
                                                                {formatValue(phone.number)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}

                                            {userData?.emailAddress && (
                                                <div className='flex justify-between'>
                                                    <span className='text-[13px] w-[60%] text-gray-600'>Email Id</span>
                                                    <div className='w-[40%] text-left flex items-center'>
                                                        <span className='mr-1 flex-shrink-0'>
                                                            <img src={mailIcon} alt='Email' className='w-4 h-4' />
                                                        </span>

                                                        <span
                                                            className='text-[13px] text-gray-900 truncate under 
text-decoration-line: underline'
                                                        >
                                                            {userData?.emailAddress}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-0'>
                                    <button className='w-full py-1 text-sm rounded-md pb-1 bg-gray-200 font-normal text-[#3A3A47] hover:bg-gray-300 transition-colors'>
                                        Details From Sign 3
                                    </button>
                                </div>

                                {/* Enquiry Details Section */}
                                <div className='flex-shrink-0'>
                                    <div className='flex items-center justify-between'>
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
                                        <div className='space-y-[11px]'>
                                            {/* Enquiry Tabs */}
                                            <div className='flex gap-4 md:gap-8 mb-3.5 border-b border-gray-200 overflow-x-auto scrollbar-hide'>
                                                {[...enquiries].map((enquiry, index) => {
                                                    const actualIndex = enquiries.length - index
                                                    return (
                                                        <button
                                                            key={enquiry.enquiryId}
                                                            onClick={() => handleEnquirySelect(enquiry.enquiryId)}
                                                            className={`py-1 px-1 text-[13px] font-semibold border-b-2 transition-colors duration-150 whitespace-nowrap
                                                                 ${
                                                                     selectedEnquiryId === enquiry.enquiryId
                                                                         ? enquiry.state === 'dropped'
                                                                             ? 'border-red-500 text-red-600'
                                                                             : 'border-blue-500 text-blue-600'
                                                                         : enquiry.state === 'dropped'
                                                                           ? 'border-transparent text-red-500 hover:text-red-700'
                                                                           : 'border-transparent text-gray-500 hover:text-gray-700'
                                                                 } }`}
                                                        >
                                                            Enquiry {actualIndex}
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            {/* Current Enquiry Details */}
                                            {currentEnquiry && (
                                                <div className='space-y-[11px]'>
                                                    <div className='flex justify-between'>
                                                        <span className='text-[13px] w-[60%] text-gray-600 font-normal'>
                                                            Property Name
                                                        </span>
                                                        <span className='text-[13px] w-[40%] text-gray-900 font-normal'>
                                                            {formatValue(currentEnquiry.propertyName)}
                                                        </span>
                                                    </div>

                                                    <div className='flex justify-between'>
                                                        <span className='text-[13px] w-[60%] text-gray-600 font-normal'>
                                                            Enquiry Date
                                                        </span>
                                                        <span className='text-[13px] w-[40%] text-gray-900 font-normal'>
                                                            {formatDate(currentEnquiry.added)}
                                                        </span>
                                                    </div>

                                                    <div className='flex justify-between'>
                                                        <span className='text-[13px] w-[60%] text-gray-600 font-normal'>
                                                            Stage
                                                        </span>
                                                        <span className='text-[13px] w-[40%] text-gray-900 font-normal'>
                                                            {formatValue(currentEnquiry.stage)}
                                                        </span>
                                                    </div>

                                                    <div className='flex justify-between'>
                                                        <span className='text-[13px] w-[60%] text-gray-600 font-normal'>
                                                            Status
                                                        </span>
                                                        <span className='text-[13px] w-[40%] text-gray-900 font-normal'>
                                                            {formatValue(currentEnquiry.leadStatus)}
                                                        </span>
                                                    </div>

                                                    <div className='flex justify-between items-center'>
                                                        <span className='text-[13px] w-[60%] text-gray-600 font-normal'>
                                                            Source
                                                        </span>
                                                        <div className='text-[13px] w-[40%] flex items-start gap-2 font-normal'>
                                                            <SourceIcon source={currentEnquiry.source} />
                                                        </div>
                                                    </div>

                                                    <div className='flex justify-between items-center font-normal'>
                                                        <span className='text-[13px] w-[60%] text-gray-600 font-normal'>
                                                            Tag
                                                        </span>
                                                        <div className='text-[13px] w-[40%] text-left'>
                                                            <TagBadge tag={currentEnquiry.tag} />
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
                                <div className='flex-1 flex flex-col min-h-0 overflow-hidden'>
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

                                    <div className='flex-1 overflow-y-auto scrollbar-hide'>
                                        {loading.enquiries ? (
                                            <div className='flex items-center justify-center py-4'>
                                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                                                <span className='ml-2 text-sm text-gray-600'>Loading agents...</span>
                                            </div>
                                        ) : (
                                            <div className='relative'>
                                                {/* Timeline vertical line */}
                                                <div className='absolute left-[5px] top-1 bottom-1 w-[1px] bg-gray-200'></div>

                                                {/* Agent History in descending order by timestamp */}
                                                {currentEnquiry?.agentHistory &&
                                                currentEnquiry.agentHistory.length > 0 ? (
                                                    [...currentEnquiry.agentHistory]
                                                        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) // Sort in descending order by timestamp

                                                        .map((agent, index) => (
                                                            <div key={index} className='relative space-y-2 mb-4'>
                                                                <div className='flex items-center'>
                                                                    <div className='w-3 h-3 bg-blue-500 rounded-[100%] z-10 border border-gray-200'></div>
                                                                    <span className='text-[13px] w-[60%] text-gray-600 ml-1'>
                                                                        Agent Name
                                                                    </span>
                                                                    <span className='text-[13px] w-[40%] text-left text-gray-900 ml-auto'>
                                                                        {formatValue(agent.agentName)}
                                                                    </span>
                                                                </div>
                                                                <div className='flex justify-between ml-4'>
                                                                    <span className='text-[13px] w-[60%] text-gray-600'>
                                                                        Last Stage
                                                                    </span>
                                                                    <span className='text-[13px] w-[40%] text-left text-gray-900'>
                                                                        {formatValue(agent.lastStage)}
                                                                    </span>
                                                                </div>
                                                                <div className='flex justify-between ml-4'>
                                                                    <span className='text-[13px] w-[60%] text-gray-600'>
                                                                        Date
                                                                    </span>
                                                                    <span className='text-[13px] w-[40%] text-left text-gray-900'>
                                                                        {formatDate(agent.timestamp)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                ) : !leadData?.agentName ? (
                                                    <div className='text-center py-4 text-gray-500'>
                                                        <p className='text-sm'>No agent history available</p>
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Close Lead Button */}
                            <div className='p-4 border-t border-gray-200 flex-shrink-0'>
                                {currentEnquiry?.state === 'dropped' ? (
                                    <button
                                        className='w-full  bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors'
                                        onClick={() => {
                                            setIsReopenLeadModalOpen(true)
                                        }}
                                    >
                                        Reopen Enquiry
                                    </button>
                                ) : (
                                    <button
                                        className='w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors'
                                        onClick={() => {
                                            setIsCloseLeadSideModalOpen(true)
                                        }}
                                    >
                                        Close Enquiry
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateTaskModalOpen}
                onClose={handleCloseCreateTaskModal}
                enquiryId={selectedEnquiryId ?? ''}
                onTaskCreated={createNewTask}
                agentId={currentEnquiry?.agentId}
                agentName={leadData?.agentName ?? undefined}
                leadId={leadId}
                leadStatus={leadData?.leadStatus}
                stage={currentEnquiry?.stage}
                tag={currentEnquiry?.tag}
                propertyName={currentEnquiry?.propertyName}
                name={leadData?.name}
                leadAddDate={leadData?.added}
                refreshData={refreshData}
            />
            <AddDetailsModal
                isOpen={isAddDetailsModalOpen}
                onClose={() => setIsAddDetailsModalOpen(false)}
                onDetailsAdded={refreshData}
                leadId={leadId}
                userId={leadData?.userId}
                currentPhoneNumber={leadData?.phoneNumber}
                currentLabel={
                    leadData?.label === 'whatsapp' || leadData?.label === 'call' || leadData?.label === ''
                        ? leadData.label
                        : undefined
                }
                additionalPhoneNumbers={(leadData?.phoneNumbers ?? []).map((phone) => ({
                    number: phone.number,
                    label: phone.label === 'whatsapp' ? 'whatsapp' : phone.label === 'call' ? 'call' : '',
                    // If you have addedAt, you can add it here as well
                }))}
            />
            <ChangeAgentModal
                isOpen={isChangeAgentModalOpen}
                onClose={() => setIsChangeAgentModalOpen(false)}
                onAgentChange={refreshData}
                leadId={leadId}
                enquiryId={selectedEnquiryId ?? ''}
                agentName={leadData?.agentName ?? undefined}
            />
            <AddEnquiryModal
                isOpen={isAddEnquiryModalOpen}
                onClose={() => setIsAddEnquiryModalOpen(false)}
                onEnquiryAdded={refreshData}
                leadId={leadId}
                stage={leadData?.stage ?? ''}
                agentName={leadData?.agentName ?? ''}
            />
            <CloseLeadSideModal
                isOpen={isCloseLeadSideModalOpen}
                onClose={() => setIsCloseLeadSideModalOpen(false)}
                leadId={leadId}
                enquiryId={selectedEnquiryId ?? ''}
                onLeadClosed={refreshData}
                agentName={leadData?.agentName ?? undefined}
            />
            <ReopenLeadModal
                isOpen={isReopenLeadModalOpen}
                onClose={() => setIsReopenLeadModalOpen(false)}
                leadId={leadId}
                enquiryId={selectedEnquiryId ?? ''}
                onLeadReopen={refreshData}
                agentName={leadData?.agentName ?? undefined}
            />
        </Layout>
    )
}

export default LeadDetails
