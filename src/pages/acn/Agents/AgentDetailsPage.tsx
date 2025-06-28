import { useNavigate, useParams } from 'react-router'
import Layout from '../../../layout/Layout'
import Breadcrumb from '../../../components/acn/Breadcrumb'
import { useState, useEffect, useMemo } from 'react'
import StateBaseTextFieldTest from '../../../components/design-elements/StateBaseTextField'
import Button from '../../../components/design-elements/Button'
import { useDispatch, useSelector } from 'react-redux'
import type { IInventory, IRequirement } from '../../../data_types/acn/types'
import {
    fetchAgentByCpId,
    fetchAgentDetails,
    updateEnquiryStatusThunk,
    listenToAgentUpdates,
} from '../../../services/acn/agents/agentThunkService'
import { fetchAgentInfo } from '../../../store/thunks/agentDetailsThunk'
import type { AppDispatch, RootState } from '../../../store'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import { formatCost, formatExactCostToLacsOrCrs } from '../../../components/helper/formatCost'
import { formatUnixDate } from '../../../components/helper/formatDate'
import AgentDetailsDropdown from '../../../components/acn/AgentDetailsDropdown'
import React from 'react'
import Dropdown from '../../../components/design-elements/Dropdown'
import searchNormal from '/icons/acn/search-normal.svg'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'
import { updatePropertyStatus } from '../../../services/acn/properties/propertiesService'
import { toast } from 'react-toastify'
import { updateRequirementStatus } from '../../../services/acn/requirements/requirementsService'
import ShareInventoryModal from '../../../components/acn/ShareInventoryModal'
import UpdateInventoryStatusModal from '../../../components/acn/UpdateInventoryModal'
import BulkShareModal from '../../../components/acn/BulkShareModal'
import NotesModal from '../../../components/acn/NotesModal'
import CallModal from '../../../components/acn/CallModal'
import AddCredits from '../../../components/acn/AddCredits'
import { AddRequirementModal } from '../../../components/acn/AddRequirementModal'
import addIcon from '/icons/acn/add-icon.svg'

const AgentDetailsPage = () => {
    const { agentId } = useParams()
    const [searchValue, setSearchValue] = useState('')
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const [activeTab, setActiveTab] = useState<'Inventory' | 'Requirement' | 'Enquiry' | 'QC'>('Inventory')
    const [activePropertyTab, setActivePropertyTab] = useState<'Resale' | 'Rental'>('Resale')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [selectedPropertyType, setSelectedPropertyType] = useState('')

    // Requirement-specific filters
    const [selectedRequirementStatus, setSelectedRequirementStatus] = useState('')
    const [selectedInternalStatus, setSelectedInternalStatus] = useState('')

    // Enquiry type switcher
    const [enquiryType, setEnquiryType] = useState<'Enquired' | 'Received'>('Received')

    // Get data from Redux store
    const { resale, rental, loading, error } = useSelector((state: RootState) => state.agents)
    const { loading: agentDetailsLoading } = useSelector((state: RootState) => state.agentDetails)
    const [agentData, setAgentData] = useState<any>(null)
    const [agentLoading, setAgentLoading] = useState(false)
    // const [statusMap, setStatusMap] = useState<Record<string, string>>({})
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState<any>(null)
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
    const [isCallModalOpen, setIsCallModalOpen] = useState(false)
    const [isAddCreditsModalOpen, setIsAddCreditsModalOpen] = useState(false)
    // Multiple selection state
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isBulkShareModalOpen, setIsBulkShareModalOpen] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [isAddRequirementModalOpen, setIsAddRequirementModalOpen] = useState(false)
    // Get current property data based on active tab
    const currentPropertyData = activePropertyTab === 'Resale' ? resale : rental

    const handleTabClick = (tab: string) => {
        if (tab === 'Resale' || tab === 'Rental') {
            setActivePropertyTab(tab as 'Resale' | 'Rental')
            setSelectedRows(new Set()) // Clear selection when switching property type
        } else {
            setActiveTab(tab as 'Inventory' | 'Requirement' | 'Enquiry' | 'QC')
            setSelectedRows(new Set()) // Clear selection when switching tabs
        }
    }

    // Initial data fetch and data refresh when property type changes
    useEffect(() => {
        const fetchInitialData = async () => {
            setPageLoading(true)
            if (agentId) {
                await Promise.all([
                    dispatch(fetchAgentInfo({ agentId })),
                    dispatch(fetchAgentDetails({ agentId, propertyType: 'Resale' })),
                    dispatch(fetchAgentDetails({ agentId, propertyType: 'Rental' })),
                ])
            }
            setPageLoading(false)
        }
        fetchInitialData()
    }, [dispatch, agentId])

    // Fetch agent data from Firebase by ID
    useEffect(() => {
        const fetchAgent = async () => {
            if (!agentId) return
            setAgentLoading(true)
            try {
                const agent = await dispatch(fetchAgentByCpId(agentId)).unwrap()
                console.log(agent, 'cbuihasuiashd')
                setAgentData(agent || null)

                // Set up real-time listener for agent updates
                const unsubscribe = listenToAgentUpdates(agentId, dispatch)

                // Cleanup listener on unmount
                return () => {
                    if (unsubscribe) unsubscribe()
                }
            } catch (err) {
                setAgentData(null)
            } finally {
                setAgentLoading(false)
            }
        }
        fetchAgent()
    }, [agentId, dispatch])

    // Filter data based on search and property type
    const filteredData = useMemo(() => {
        if (!currentPropertyData) return []

        const searchLower = searchValue.toLowerCase()
        let filtered = []

        switch (activeTab) {
            case 'Inventory':
                filtered = currentPropertyData.inventories.filter(
                    (inv: IInventory) =>
                        inv.propertyName?.toLowerCase().includes(searchLower) ||
                        inv.propertyId?.toLowerCase().includes(searchLower),
                )
                // Apply status filter if selected
                if (selectedStatus) {
                    filtered = filtered.filter((inv: IInventory) => inv.status === selectedStatus)
                }
                // Apply property type filter if selected
                if (selectedPropertyType) {
                    filtered = filtered.filter((inv: IInventory) => inv.assetType === selectedPropertyType)
                }
                return filtered
            case 'Requirement':
                filtered = currentPropertyData.requirements.filter(
                    (req: IRequirement) =>
                        req.propertyName?.toLowerCase().includes(searchLower) ||
                        req.requirementId?.toLowerCase().includes(searchLower),
                )
                // Apply requirement-specific filters
                if (selectedRequirementStatus) {
                    filtered = filtered.filter(
                        (req: IRequirement) => req.requirementStatus === selectedRequirementStatus,
                    )
                }
                if (selectedInternalStatus) {
                    filtered = filtered.filter((req: IRequirement) => req.internalStatus === selectedInternalStatus)
                }
                return filtered
            case 'Enquiry': {
                // Filter based on enquiry type
                let enquiryData = currentPropertyData.enquiries
                if (enquiryType === 'Enquired') {
                    // Filter for enquiries made by the agent (buyerCpId matches agentId)
                    enquiryData = currentPropertyData.enquiries.filter((enq: any) => enq.buyerCpId === agentId)
                } else if (enquiryType === 'Received') {
                    // Filter for enquiries received by the agent (sellerCpId matches agentId)
                    enquiryData = currentPropertyData.enquiries.filter((enq: any) => enq.sellerCpId === agentId)
                }

                return enquiryData.filter(
                    (enq: any) =>
                        enq.propertyId?.toLowerCase().includes(searchLower) ||
                        enq.enquiryId?.toLowerCase().includes(searchLower) ||
                        enq.buyerName?.toLowerCase().includes(searchLower) ||
                        enq.sellerName?.toLowerCase().includes(searchLower),
                )
            }
            case 'QC':
                return currentPropertyData.qc.filter(
                    (qc: any) =>
                        qc.propertyName?.toLowerCase().includes(searchLower) ||
                        qc.qcId?.toLowerCase().includes(searchLower),
                )
            default:
                return []
        }
    }, [
        activeTab,
        currentPropertyData,
        searchValue,
        selectedStatus,
        selectedPropertyType,
        enquiryType,
        selectedRequirementStatus,
        selectedInternalStatus,
        agentId,
    ])

    // Get counts for each tab
    const getTabCount = (type: 'Inventory' | 'Requirement' | 'Enquiry' | 'QC') => {
        if (!currentPropertyData) return 0

        switch (type) {
            case 'Inventory':
                return currentPropertyData.inventories.length
            case 'Requirement':
                return currentPropertyData.requirements.length
            case 'Enquiry':
                // Count enquiries based on current enquiry type
                if (enquiryType === 'Enquired') {
                    return currentPropertyData.enquiries.filter((enq: any) => enq.buyerCpId === agentId).length
                } else if (enquiryType === 'Received') {
                    return currentPropertyData.enquiries.filter((enq: any) => enq.sellerCpId === agentId).length
                }
                return currentPropertyData.enquiries.length
            case 'QC':
                return currentPropertyData.qc.length
            default:
                return 0
        }
    }

    const getStatusOptions = () => {
        return [
            { label: 'All Status', value: '' },
            { label: 'Available', value: 'Available' },
            {
                label: activePropertyTab === 'Rental' ? 'Not Available' : 'Sold',
                value: activePropertyTab === 'Rental' ? 'Not Available' : 'Sold',
            },
            { label: 'Hold', value: 'Hold' },
            { label: 'De-listed', value: 'De-Listed' },
        ]
    }

    const getPropertyTypeOptions = () => {
        return [
            { label: 'All', value: '' },
            { label: 'Plot', value: 'Plot' },
            { label: 'Apartment', value: 'Apartment' },
            { label: 'Villa', value: 'Villa' },
            { label: 'Villament', value: 'Villament' },
            { label: 'Row House', value: 'Row House' },
        ]
    }

    // Status dropdown options for inventory status updates
    const statusDropdownOptions = [
        { label: 'Available', value: 'Available', color: '#E1F6DF', textColor: '#000000' },
        {
            label: activePropertyTab === 'Rental' ? 'Not Available' : 'Sold',
            value: activePropertyTab === 'Rental' ? 'Not Available' : 'Sold',
            color: '#FEE2E2',
            textColor: '#000000',
        },
        { label: 'Hold', value: 'Hold', color: '#FEF3C7', textColor: '#000000' },
        { label: 'De-Listed', value: 'De-Listed', color: '#F3F4F6', textColor: '#000000' },
    ]

    // Requirement status dropdown options with colors
    const requirementStatusOptions = [
        { label: 'Open', value: 'open', color: '#E1F6DF', textColor: '#000000' },
        { label: 'Close', value: 'close', color: '#FEE2E2', textColor: '#000000' },
    ]

    const internalStatusDropdownOptions = [
        { label: 'Found', value: 'found', color: '#E1F6DF', textColor: '#000000' },
        { label: 'Not Found', value: 'not found', color: '#E0F2FE', textColor: '#000000' },
        { label: 'Pending', value: 'pending', color: '#FEF3C7', textColor: '#000000' },
    ]

    // Enquiry status dropdown options with colors
    const enquiryStatusOptions = [
        { label: 'Site Visit Done', value: 'site visit done', color: '#E1F6DF', textColor: '#000000' },
        { label: 'Pending', value: 'pending', color: '#FEF3C7', textColor: '#000000' },
        { label: 'Not Interested', value: 'not interested', color: '#FEE2E2', textColor: '#000000' },
    ]

    // Handle property status update
    const handleUpdatePropertyStatus = async (propertyId: string, newStatus: string) => {
        if (!agentId) return

        try {
            await dispatch(
                updatePropertyStatus({
                    propertyId,
                    status: newStatus,
                }),
            ).unwrap()

            // Refetch agent details to update the UI
            dispatch(fetchAgentDetails({ agentId, propertyType: activePropertyTab }))

            toast.success(`Status updated successfully to ${newStatus}`)
        } catch (error: any) {
            console.error('Error updating property status:', error)
            toast.error(error.message || 'Failed to update property status')
        }
    }

    // Helper function to update requirement status
    const updateRowData = async (rowId: string, field: keyof IRequirement, value: string) => {
        try {
            // Dispatch the update action and wait for it to complete
            const result = await dispatch(
                updateRequirementStatus({
                    id: rowId,
                    status: value,
                    type: field === 'requirementStatus' ? 'requirement' : 'internal',
                }),
            ).unwrap()

            console.log('✅ Status updated successfully:', result)

            // Refetch agent details to update the UI
            if (agentId) {
                dispatch(fetchAgentDetails({ agentId, propertyType: activePropertyTab }))
            }
        } catch (error) {
            console.error('❌ Failed to update status:', error)
            toast.error('Failed to update requirement status')
        }
    }

    // Helper function to update enquiry status
    const updateEnquiryStatus = async (enquiryId: string, newStatus: string) => {
        try {
            // Dispatch the update thunk and wait for it to complete
            const result = await dispatch(
                updateEnquiryStatusThunk({
                    enquiryId,
                    status: newStatus,
                    propertyType: activePropertyTab,
                }),
            ).unwrap()

            console.log('✅ Enquiry status updated successfully:', result)

            // Refetch agent details to update the UI
            if (agentId) {
                dispatch(fetchAgentDetails({ agentId, propertyType: activePropertyTab }))
            }

            toast.success(`Enquiry status updated successfully to ${newStatus}`)
        } catch (error) {
            console.error('❌ Failed to update enquiry status:', error)
            toast.error('Failed to update enquiry status')
        }
    }

    // Handle row selection for multiple selection
    const handleRowSelect = (rowId: string, checked: boolean) => {
        setSelectedRows((prev) => {
            const newSet = new Set(prev)
            if (checked) {
                newSet.add(rowId)
            } else {
                newSet.delete(rowId)
            }
            return newSet
        })
    }

    // Handle bulk status update
    const handleBulkStatusUpdate = async (status: string, soldPrice?: string) => {
        const selectedRowIds = Array.from(selectedRows)
        console.log('📝 Bulk updating status for:', selectedRowIds, 'to:', status, ' ', soldPrice)

        try {
            // Update each selected property
            for (const propertyId of selectedRowIds) {
                await handleUpdatePropertyStatus(propertyId, status)
            }

            // Clear selection after successful update
            setSelectedRows(new Set())
            setIsUpdateModalOpen(false)

            toast.success(`Successfully updated ${selectedRowIds.length} properties to ${status}`)
        } catch (error) {
            console.error('❌ Failed to bulk update properties:', error)
            toast.error('Failed to update some properties')
        }
    }

    // Handle bulk share
    const handleBulkShare = () => {
        const selectedRowIds = Array.from(selectedRows)
        console.log('📤 Bulk sharing properties:', selectedRowIds)
        // Get the selected properties from filtered data
        // const selectedProperties = filteredData.filter((item: any) =>
        //     selectedRowIds.includes(item.propertyId || item.id),
        // )
        setIsBulkShareModalOpen(true)
    }

    // Define columns based on active tab
    const columns = useMemo<TableColumn[]>(() => {
        switch (activeTab) {
            case 'Inventory':
                return [
                    {
                        key: 'select',
                        header: '',
                        render: (_, row) => (
                            <input
                                type='checkbox'
                                checked={selectedRows.has(row.propertyId || row.id)}
                                onChange={(e) => handleRowSelect(row.propertyId || row.id, e.target.checked)}
                                className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                            />
                        ),
                    },
                    {
                        key: 'propertyId',
                        header: 'Property ID',
                        render: (value, row) => (
                            <span
                                onClick={() => navigate(`/acn/properties/${value}/details`)}
                                className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto cursor-pointer hover:text-blue-600'
                            >
                                {value || row.id || row.objectID}
                            </span>
                        ),
                    },
                    {
                        key: 'propertyName',
                        header: 'Property Name',
                        render: (value, row) => (
                            <span
                                className='whitespace-nowrap text-sm font-semibold w-auto cursor-pointer hover:text-blue-600'
                                onClick={() => navigate(`/acn/properties/${row.propertyId || row.id}/details`)}
                            >
                                {value || row.area || 'Unknown Property'}
                            </span>
                        ),
                    },
                    {
                        key: 'assetType',
                        header: 'Asset Type',
                        render: (value) => (
                            <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto capitalize'>
                                {value}
                            </span>
                        ),
                    },
                    {
                        key: 'totalAskPrice',
                        header: activePropertyTab === 'Resale' ? 'Sale Price' : 'Monthly Rent',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-normal w-auto'>
                                {value ? formatCost(value) : 'N/A'}
                            </span>
                        ),
                    },
                    {
                        key: 'sbua',
                        header: 'SBUA',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-normal w-auto'>
                                {value ? `${value} sq ft` : 'N/A'}
                            </span>
                        ),
                    },
                    {
                        key: 'plotSize',
                        header: 'Plot Size',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-normal w-auto'>
                                {value && value !== '–' ? `${value} sqft` : '-'}
                            </span>
                        ),
                    },
                    {
                        key: 'facing',
                        header: 'Facing',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-normal w-auto'>{value || 'N/A'}</span>
                        ),
                    },
                    {
                        key: 'micromarket',
                        header: 'Micromarket',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-normal w-auto'>{value || 'N/A'}</span>
                        ),
                    },
                    {
                        key: 'status',
                        header: 'Status',
                        dropdown: {
                            options: statusDropdownOptions,
                            placeholder: 'Select Status',
                            onChange: (value, row) => {
                                handleUpdatePropertyStatus(row.propertyId, value)
                            },
                        },
                    },
                    {
                        key: 'dateOfStatusLastChecked',
                        header: 'Last Check',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-normal w-auto'>
                                {value ? formatUnixDate(value) : 'N/A'}
                            </span>
                        ),
                    },
                    {
                        key: 'cpId',
                        header: 'Agent',
                        render: (_) => (
                            <span className='whitespace-nowrap text-sm font-normal w-auto'>
                                {agentData?.name || 'N/A'}
                            </span>
                        ),
                    },
                    {
                        key: 'photo',
                        header: 'Img/Vid',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-normal w-auto'>
                                {value && value.length > 0 ? (
                                    <img src='/icons/acn/tick.svg' alt='Check Icon' className='w-8 h-8 flex-shrink-0' />
                                ) : (
                                    <img
                                        src='/icons/acn/cross.svg'
                                        alt='Cross Icon'
                                        className='w-8 h-8 flex-shrink-0'
                                    />
                                )}
                            </span>
                        ),
                    },
                    {
                        key: 'actions',
                        header: 'Actions',
                        fixed: true,
                        fixedPosition: 'right',
                        render: (_, row) => (
                            <div className='flex items-center gap-1 whitespace-nowrap w-auto'>
                                <button
                                    className='h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0'
                                    onClick={() => {
                                        setSelectedProperty(row)
                                        setIsShareModalOpen(true)
                                    }}
                                    title='Share'
                                >
                                    <img
                                        src='/icons/acn/share.svg'
                                        alt='Share Icon'
                                        className='w-7 h-7 flex-shrink-0'
                                    />
                                </button>
                                <button
                                    className='h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0'
                                    onClick={() => navigate(`/acn/properties/${row.propertyId || row.id}/edit`)}
                                    title='Edit'
                                >
                                    <img src='/icons/acn/write.svg' alt='Edit Icon' className='w-7 h-7 flex-shrink-0' />
                                </button>
                            </div>
                        ),
                    },
                ]
            case 'Requirement':
                return [
                    {
                        key: 'requirementId',
                        header: 'Req ID',
                        render: (value, row) => (
                            <span
                                onClick={() => navigate(`/acn/requirements/${row.requirementId}/details`)}
                                className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'
                            >
                                {value}
                            </span>
                        ),
                    },
                    {
                        key: 'propertyName',
                        header: 'Project Name/Location',
                        render: (value, row) => (
                            <div className='relative group'>
                                <span
                                    onClick={() => navigate(`/acn/requirements/${row.requirementId}/details`)}
                                    className='block max-w-70 truncate text-black hover:text-blue-800 text-sm font-semibold cursor-pointer transition-colors'
                                    title={value}
                                >
                                    {value}
                                </span>
                                {/* Tooltip */}
                                <div className='absolute left-0 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal max-w-xs break-words'>
                                    {value}
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: 'assetType',
                        header: 'Asset type',
                        render: (value) => (
                            <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                                {toCapitalizedWords(value)}
                            </span>
                        ),
                    },
                    {
                        key: 'budget',
                        header: 'Budget',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-normal w-auto'>
                                {`from ${formatExactCostToLacsOrCrs(value.from)} to ${formatExactCostToLacsOrCrs(value.to)}`}
                            </span>
                        ),
                    },
                    {
                        key: 'requirementStatus',
                        header: 'Status',
                        dropdown: {
                            options: requirementStatusOptions,
                            placeholder: 'Select Status',
                            onChange: (value, row) => {
                                updateRowData(row.requirementId, 'requirementStatus', value)
                            },
                        },
                    },
                    {
                        key: 'internalStatus',
                        header: 'Int. Status',
                        dropdown: {
                            options: internalStatusDropdownOptions,
                            placeholder: 'Select Status',
                            onChange: (value, row) => {
                                updateRowData(row.requirementId, 'internalStatus', value)
                            },
                        },
                    },
                    {
                        key: 'lastModified',
                        header: 'Last Updated',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-normal w-auto'>
                                {formatUnixDate(value)}
                            </span>
                        ),
                    },
                    {
                        key: 'agentCpid',
                        header: 'Agent Name',
                        render: (_) => (
                            <span className='whitespace-nowrap text-sm font-normal w-auto'>
                                {agentData.name || 'N/A'}
                            </span>
                        ),
                    },
                    {
                        key: 'agentNumber',
                        header: 'Agent Number',
                        render: (_) => (
                            <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                                {agentData.phoneNumber || 'N/A'}
                            </span>
                        ),
                    },
                    {
                        key: 'actions',
                        header: 'Actions',
                        fixed: true,
                        fixedPosition: 'right',
                        render: (_, row) => (
                            <div className='flex items-center gap-1 whitespace-nowrap w-auto'>
                                <span onClick={() => navigate(`/acn/requirements/${row.requirementId}/details`)}>
                                    <Button
                                        bgColor='bg-[#F3F3F3]'
                                        textColor='text-[#3A3A47]'
                                        className='px-4 h-8 font-semibold'
                                        // you can omit onClick since <a> handles navigation
                                    >
                                        View Details
                                    </Button>
                                </span>
                            </div>
                        ),
                    },
                ]
            case 'Enquiry':
                if (enquiryType === 'Enquired') {
                    return [
                        {
                            key: 'propertyId',
                            header: 'Property ID',
                            render: (value: any) => (
                                <span
                                    onClick={() => navigate(`/acn/properties/${value}/details`)}
                                    className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto cursor-pointer hover:text-blue-600'
                                >
                                    {value}
                                </span>
                            ),
                        },
                        {
                            key: 'propertyName',
                            header: 'Property Name',
                            render: (value: any) => (
                                <span className='whitespace-nowrap text-sm font-semibold w-auto'>{value}</span>
                            ),
                        },
                        {
                            key: 'sellerName',
                            header: 'Seller Name',
                            render: (value: any) => (
                                <span className='whitespace-nowrap text-sm font-semibold w-auto'>{value}</span>
                            ),
                        },
                        {
                            key: 'sellerNumber',
                            header: 'Seller Number',
                            render: (value: any) => (
                                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                                    {value}
                                </span>
                            ),
                        },
                        {
                            key: 'added',
                            header: 'Date of Enquiry',
                            render: (value: any) => (
                                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                                    {formatUnixDate(value)}
                                </span>
                            ),
                        },
                        {
                            key: 'status',
                            header: 'Status',
                            dropdown: {
                                options: enquiryStatusOptions,
                                placeholder: 'Select Status',
                                onChange: (value, row) => {
                                    updateEnquiryStatus(row.enquiryId, value)
                                },
                            },
                        },
                    ]
                } else {
                    return [
                        {
                            key: 'propertyId',
                            header: 'Property ID',
                            render: (value: any) => (
                                <span
                                    onClick={() => navigate(`/acn/properties/${value}/details`)}
                                    className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto cursor-pointer hover:text-blue-600'
                                >
                                    {value}
                                </span>
                            ),
                        },
                        {
                            key: 'propertyName',
                            header: 'Property Name',
                            render: (value: any) => (
                                <span
                                    onClick={() => navigate(`/acn/properties/${value}/details`)}
                                    className='whitespace-nowrap text-sm font-semibold w-auto'
                                >
                                    {value}
                                </span>
                            ),
                        },
                        {
                            key: 'buyerName',
                            header: 'Buyer Name',
                            render: (value: any) => (
                                <span className='whitespace-nowrap text-sm font-semibold w-auto'>{value}</span>
                            ),
                        },
                        {
                            key: 'buyerNumber',
                            header: 'Buyer Number',
                            render: (value: any) => (
                                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                                    {value}
                                </span>
                            ),
                        },
                        {
                            key: 'added',
                            header: 'Date of Enquiry',
                            render: (value: any) => (
                                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                                    {formatUnixDate(value)}
                                </span>
                            ),
                        },
                        {
                            key: 'status',
                            header: 'Status',
                            dropdown: {
                                options: enquiryStatusOptions,
                                placeholder: 'Select Status',
                                onChange: (value, row) => {
                                    updateEnquiryStatus(row.enquiryId, value)
                                },
                            },
                        },
                    ]
                }
            case 'QC':
                return [
                    {
                        key: 'propertyName',
                        header: 'Property Name',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-semibold w-auto'>{value}</span>
                        ),
                    },
                    {
                        key: 'qcId',
                        header: 'QC ID',
                        render: (value) => (
                            <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                        ),
                    },
                    {
                        key: 'added',
                        header: 'Date of QC',
                        render: (value) => (
                            <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                                {formatUnixDate(value)}
                            </span>
                        ),
                    },
                    {
                        key: 'actions',
                        header: 'Actions',
                        fixed: true,
                        fixedPosition: 'right',
                        render: (_, row) => (
                            <div className='flex items-center gap-1 whitespace-nowrap w-auto'>
                                <span onClick={() => navigate(`/acn/qc/${row.qcId}/details`)}>
                                    <Button
                                        bgColor='bg-[#F3F3F3]'
                                        textColor='text-[#3A3A47]'
                                        className='px-4 h-8 font-semibold'
                                        // you can omit onClick since <a> handles navigation
                                    >
                                        View Details
                                    </Button>
                                </span>
                            </div>
                        ),
                    },
                ]
            default:
                return []
        }
    }, [
        activeTab,
        currentPropertyData,
        searchValue,
        selectedStatus,
        selectedPropertyType,
        enquiryType,
        selectedRequirementStatus,
        selectedInternalStatus,
        agentId,
        agentData,
        navigate,
        selectedRows,
        handleRowSelect,
        handleUpdatePropertyStatus,
        updateRowData,
        updateEnquiryStatus,
        statusDropdownOptions,
        requirementStatusOptions,
        internalStatusDropdownOptions,
        enquiryStatusOptions,
        activePropertyTab,
    ])

    return (
        <Layout loading={pageLoading || loading || agentDetailsLoading || agentLoading}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-2 bg-white min-h-screen'>
                    {/* Header */}
                    <div className='px-6'>
                        <div className='mb-4 '>
                            <div className='flex items-center justify-between mb-2'>
                                {<Breadcrumb link='/acn/agents' parent='Agents' child={agentId || 'Details'} />}
                                <div className='flex items-center gap-4'>
                                    <div className='w-54'>
                                        <StateBaseTextFieldTest
                                            leftIcon={<img src={searchNormal} alt='Search Icon' className='w-4 h-4' />}
                                            placeholder='Search'
                                            value={searchValue}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setSearchValue(e.target.value)
                                            }
                                            className='h-8'
                                        />
                                    </div>
                                    {activeTab === 'Inventory' ? (
                                        <Button
                                            leftIcon={
                                                <img src={addIcon} alt='Add Inventory Icon' className='w-5 h-5' />
                                            }
                                            bgColor='bg-[#24252E]'
                                            textColor='text-white'
                                            className='p-2 h-8 font-semibold'
                                            onClick={() => navigate('/acn/properties/addinv')}
                                        >
                                            Add Inventory
                                        </Button>
                                    ) : activeTab === 'Requirement' ? (
                                        <Button
                                            leftIcon={
                                                <img src={addIcon} alt='Add Inventory Icon' className='w-5 h-5' />
                                            }
                                            bgColor='bg-[#24252E]'
                                            textColor='text-white'
                                            className='px-4 h-8 font-semibold'
                                            onClick={() => setIsAddRequirementModalOpen(true)}
                                        >
                                            Add Requirement
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                            <div className='border-b-1 border-[#F3F3F3]'></div>
                        </div>

                        {/* Error message */}
                        {error && <div className='mb-4 p-4 bg-red-50 text-red-700 rounded-md'>{error}</div>}

                        {/* tabs */}
                        <div className='flex items-center justify-between'>
                            <div className='flex flex-col gap-[10px]'>
                                <div className='flex items-center gap-4 pb-1  w-full'>
                                    <div className='flex'>
                                        <div
                                            onClick={() => handleTabClick('Inventory')}
                                            className={`cursor-pointer px-2 ${activeTab === 'Inventory' ? 'border-b-2 border-black' : ''}`}
                                        >
                                            Inventory ({getTabCount('Inventory')})
                                        </div>
                                        <div
                                            onClick={() => handleTabClick('Requirement')}
                                            className={`cursor-pointer px-2 ${activeTab === 'Requirement' ? 'border-b-2 border-black' : ''}`}
                                        >
                                            Requirement ({getTabCount('Requirement')})
                                        </div>
                                        <div
                                            onClick={() => handleTabClick('Enquiry')}
                                            className={`cursor-pointer px-2 ${activeTab === 'Enquiry' ? 'border-b-2 border-black' : ''}`}
                                        >
                                            Enquiry ({getTabCount('Enquiry')})
                                        </div>
                                        <div
                                            onClick={() => handleTabClick('QC')}
                                            className={`cursor-pointer px-2 ${activeTab === 'QC' ? 'border-b-2 border-black' : ''}`}
                                        >
                                            QC ({getTabCount('QC')})
                                        </div>
                                    </div>
                                    <div>
                                        <div className='flex items-center bg-gray-100 rounded-md py-1 h-7 w-fit'>
                                            <button
                                                onClick={() => handleTabClick('Resale')}
                                                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                                    activePropertyTab === 'Resale'
                                                        ? 'bg-white text-black shadow-sm'
                                                        : 'text-gray-600 shadow-2xl hover:text-black'
                                                }`}
                                            >
                                                Resale
                                            </button>
                                            <button
                                                onClick={() => handleTabClick('Rental')}
                                                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                                    activePropertyTab === 'Rental'
                                                        ? 'bg-white text-black shadow-sm'
                                                        : 'text-gray-600 shadow-2xl hover:text-black'
                                                }`}
                                            >
                                                Rental
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Tab-specific filters */}
                                <div className='flex items-center gap-[10px]'>
                                    {/* Inventory filters */}
                                    {activeTab === 'Inventory' && (
                                        <>
                                            <Dropdown
                                                className='h-8 font-semibold'
                                                options={getStatusOptions()}
                                                onSelect={(value) => setSelectedStatus(value)}
                                                defaultValue={selectedStatus}
                                                placeholder='Inventory Status'
                                                triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                                menuClassName='absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                                optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                                            />
                                            <Dropdown
                                                className='h-8 font-semibold'
                                                options={getPropertyTypeOptions()}
                                                onSelect={(value) => setSelectedPropertyType(value)}
                                                defaultValue={selectedPropertyType}
                                                placeholder='Property Type'
                                                triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                                menuClassName='absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                                optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                                            />
                                        </>
                                    )}

                                    {/* Requirement filters */}
                                    {activeTab === 'Requirement' && (
                                        <>
                                            <Dropdown
                                                className='h-8 font-semibold'
                                                options={[
                                                    { label: 'All Status', value: '' },
                                                    { label: 'Open', value: 'open' },
                                                    { label: 'Close', value: 'close' },
                                                ]}
                                                onSelect={(value) => setSelectedRequirementStatus(value)}
                                                defaultValue={selectedRequirementStatus}
                                                placeholder='Requirement Status'
                                                triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                                menuClassName='absolute w-full top-8 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                                optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                                            />
                                            <Dropdown
                                                className='h-8 font-semibold'
                                                options={[
                                                    { label: 'All Internal Status', value: '' },
                                                    { label: 'Found', value: 'found' },
                                                    { label: 'Not Found', value: 'not found' },
                                                    { label: 'Pending', value: 'pending' },
                                                ]}
                                                onSelect={(value) => setSelectedInternalStatus(value)}
                                                defaultValue={selectedInternalStatus}
                                                placeholder='Internal Status'
                                                triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                                menuClassName='absolute w-full top-8 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                                optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                                            />
                                        </>
                                    )}

                                    {/* Enquiry type switcher */}
                                    {activeTab === 'Enquiry' && (
                                        <div className='flex items-center bg-gray-100 rounded-md mb-1 h-7 w-fit'>
                                            <button
                                                onClick={() => setEnquiryType('Enquired')}
                                                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                                    enquiryType === 'Enquired'
                                                        ? 'bg-white text-black shadow-sm'
                                                        : 'text-gray-600 shadow-2xl hover:text-black'
                                                }`}
                                            >
                                                Enquired
                                            </button>
                                            <button
                                                onClick={() => setEnquiryType('Received')}
                                                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                                    enquiryType === 'Received'
                                                        ? 'bg-white text-black shadow-sm'
                                                        : 'text-gray-600 shadow-2xl hover:text-black'
                                                }`}
                                            >
                                                Received
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Bulk action buttons for Inventory tab */}
                                {activeTab === 'Inventory' && selectedRows.size > 0 && (
                                    <div className='flex gap-2 mt-2'>
                                        <Button
                                            bgColor='bg-white'
                                            textColor='text-gray-700'
                                            className='px-4 h-8 text-sm border border-gray-300'
                                            onClick={() => setIsUpdateModalOpen(true)}
                                        >
                                            Update Status ({selectedRows.size})
                                        </Button>
                                        <Button
                                            bgColor='bg-gray-600'
                                            textColor='text-white'
                                            className='px-4 h-8 text-sm'
                                            onClick={handleBulkShare}
                                        >
                                            Share Selected ({selectedRows.size})
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {/* agent details dropdown */}
                            <div className='absolute top-[48px] right-0 border-1 border-[#D3D4DD] max-h-[calc(100vh-48px)] scrollbar-hide overflow-y-auto transition-all duration-200 ease-in-out z-40 w-[500px] bg-white '>
                                <AgentDetailsDropdown
                                    setIsNotesModalOpen={setIsNotesModalOpen}
                                    setIsCallModalOpen={setIsCallModalOpen}
                                    setIsAddCreditsModalOpen={setIsAddCreditsModalOpen}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className={`${activeTab === 'QC' ? 'mt-[51px]' : 'mt-[19px]'} pl-6`}>
                        <FlexibleTable
                            columns={columns}
                            data={filteredData}
                            emptyMessage={`No ${activeTab.toLowerCase()} found`}
                            hoverable={true}
                            borders={{
                                table: false,
                                header: true,
                                rows: true,
                                cells: false,
                                outer: false,
                            }}
                            maxHeight='65vh'
                            className='rounded-lg'
                            stickyHeader={true}
                        />
                    </div>
                    {/* Modals */}
                    <NotesModal
                        isOpen={isNotesModalOpen}
                        onClose={() => setIsNotesModalOpen(false)}
                        rowData={agentData}
                    />

                    <CallModal isOpen={isCallModalOpen} onClose={() => setIsCallModalOpen(false)} rowData={agentData} />

                    <AddCredits isOpen={isAddCreditsModalOpen} onClose={() => setIsAddCreditsModalOpen(false)} />

                    {/* Share Modal */}
                    <ShareInventoryModal
                        isOpen={isShareModalOpen}
                        onClose={() => setIsShareModalOpen(false)}
                        property={selectedProperty}
                    />

                    {/* Update Inventory Status Modal */}
                    <UpdateInventoryStatusModal
                        isOpen={isUpdateModalOpen}
                        onClose={() => setIsUpdateModalOpen(false)}
                        propertyType={activePropertyTab}
                        selectedCount={selectedRows.size}
                        onUpdate={handleBulkStatusUpdate}
                    />

                    {/* Bulk Share Modal */}
                    <BulkShareModal
                        isOpen={isBulkShareModalOpen}
                        onClose={() => setIsBulkShareModalOpen(false)}
                        properties={filteredData.filter((item: any) => selectedRows.has(item.propertyId || item.id))}
                    />

                    {/* Add Requirement Modal */}
                    <AddRequirementModal
                        cpId={agentData?.cpId || ''}
                        isOpen={isAddRequirementModalOpen}
                        onClose={() => setIsAddRequirementModalOpen(false)}
                    />
                </div>
            </div>
        </Layout>
    )
}

export default AgentDetailsPage
