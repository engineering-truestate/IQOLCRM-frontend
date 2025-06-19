import { useNavigate, useParams } from 'react-router'
import Layout from '../../../layout/Layout'
import Breadcrumb from '../../../components/acn/Breadcrumb'
import { useState, useEffect, useMemo } from 'react'
import StateBaseTextFieldTest from '../../../components/design-elements/StateBaseTextField'
import Button from '../../../components/design-elements/Button'
import addinventoryic from '/icons/acn/user-add.svg'
import { useDispatch, useSelector } from 'react-redux'
import type { IInventory, IRequirement } from '../../../data_types/acn/types'
import { fetchAgentDetails } from '../../../services/acn/agents/agentThunkService'
import { fetchAgentInfo } from '../../../store/thunks/agentDetailsThunk'
import type { AppDispatch, RootState } from '../../../store'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import { formatCost } from '../../../components/helper/formatCost'
import { formatUnixDate } from '../../../components/helper/formatDate'
import AgentDetailsDropdown from '../../../components/acn/AgentDetailsDropdown'
import React from 'react'
import AgentInventoryTable from './AgentInventoryTable'
import AgentRequirementTable from './AgentRequirementTable'
import AgentEnquiryTable from './AgentEnquiryTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import StatusSelectCell from '../../../components/acn/Status'
import shareic from '/icons/acn/share.svg'
import editicon from '/icons/acn/write.svg'

interface PropertyData {
    inventories: IInventory[]
    requirements: IRequirement[]
    enquiries: any[]
}

interface AgentsState {
    resale: PropertyData
    rental: PropertyData
    loading: boolean
    error: string | null
}

const AgentDetailsPage = () => {
    const { agentId } = useParams()
    const [searchValue, setSearchValue] = useState('')
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const [activeTab, setActiveTab] = useState<'Inventory' | 'Requirement' | 'Enquiry'>('Inventory')
    const [activePropertyTab, setActivePropertyTab] = useState<'Resale' | 'Rental'>('Resale')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [selectedPropertyType, setSelectedPropertyType] = useState('')
    // Get data from Redux store
    const { resale, rental, loading, error } = useSelector((state: RootState) => state.agents)
    const { data: agentDetails, loading: agentDetailsLoading } = useSelector((state: RootState) => state.agentDetails)

    // Get current property data based on active tab
    const currentPropertyData = activePropertyTab === 'Resale' ? resale : rental

    const handleTabClick = (tab: string) => {
        if (tab === 'Resale' || tab === 'Rental') {
            setActivePropertyTab(tab as 'Resale' | 'Rental')
        } else {
            setActiveTab(tab as 'Inventory' | 'Requirement' | 'Enquiry')
        }
    }

    // Initial data fetch and data refresh when property type changes
    useEffect(() => {
        // console.log("check")
        if (agentId) {
            // Fetch agent details
            dispatch(fetchAgentInfo({ agentId }))
            // Always fetch both Resale and Rental data
            dispatch(fetchAgentDetails({ agentId, propertyType: 'Resale' }))
            dispatch(fetchAgentDetails({ agentId, propertyType: 'Rental' }))
        }
    }, [dispatch, agentId])

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
                return currentPropertyData.requirements.filter(
                    (req: IRequirement) =>
                        req.propertyName?.toLowerCase().includes(searchLower) ||
                        req.requirementId?.toLowerCase().includes(searchLower),
                )
            case 'Enquiry':
                return currentPropertyData.enquiries.filter(
                    (enq: any) =>
                        enq.propertyName?.toLowerCase().includes(searchLower) ||
                        enq.enquiryId?.toLowerCase().includes(searchLower),
                )
            default:
                return []
        }
    }, [activeTab, currentPropertyData, searchValue, selectedStatus, selectedPropertyType])

    // Get counts for each tab
    const getTabCount = (type: 'Inventory' | 'Requirement' | 'Enquiry') => {
        if (!currentPropertyData) return 0

        switch (type) {
            case 'Inventory':
                return currentPropertyData.inventories.length
            case 'Requirement':
                return currentPropertyData.requirements.length
            case 'Enquiry':
                return currentPropertyData.enquiries.length
            default:
                return 0
        }
    }

    const getStatusOptions = () => {
        return [
            { label: 'All Status', value: '' },
            { label: 'Available', value: 'Available' },
            { label: 'Sold', value: 'Sold' },
            { label: 'Hold', value: 'Hold' },
            { label: 'Delisted', value: 'De-Listed' },
            { label: 'Pending QC', value: 'Pending QC' },
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
    const formatDate = (date: any) => {
        if (!date) return '-'
        let dateObj: Date

        if (date?.toDate) {
            dateObj = date.toDate()
        } else if (typeof date === 'string') {
            dateObj = new Date(date)
        } else if (date instanceof Date) {
            dateObj = date
        } else {
            return '-'
        }

        return dateObj.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }
    const [selectedProperty1, setSelectedProperty1] = useState<IInventory | null>(null)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [statusMap, setStatusMap] = useState<Record<string, string>>({})
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
                                className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                                onChange={(e) => {
                                    console.log(
                                        `Checkbox for property ID ${row.propertyId || row.id} is now:`,
                                        e.target.checked,
                                    )
                                }}
                            />
                        ),
                    },

                    {
                        key: 'propertyId',
                        header: 'Property ID',
                        render: (value) => (
                            console.log(value),
                            (
                                <span
                                    onClick={() => navigate(`/acn/properties/${value}/details`)}
                                    className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto cursor-pointer hover:text-blue-600'
                                >
                                    {value}
                                </span>
                            )
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
                            <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                                {value || 'N/A'}
                            </span>
                        ),
                    },
                    {
                        key: 'totalAskPrice',
                        header: 'Price',
                        render: (value) => (
                            <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                                {formatCost(value)}
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
                                {value ? `${value} sq ft` : 'N/A'}
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
                        key: 'status',
                        header: 'Status',
                        dropdown: {
                            options: getStatusOptions(),
                            placeholder: 'Select Status',
                            onChange: (value, row) => {
                                console.log(value, row)
                            },
                        },
                    },
                    {
                        key: 'status',
                        header: 'Status',
                        dropdown: {
                            options: getStatusOptions().filter(
                                (option) => option.label !== 'All Status' && option.label !== 'Pending QC',
                            ),
                            placeholder: 'Select Status',
                            onChange: (value, row) => {
                                console.log(value, row)
                            },
                        },
                    },
                    {
                        key: 'enquiries',
                        header: 'Enquiries',
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
                        key: 'dateOfInventoryAdded',
                        header: 'Last Check',
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
                                <button
                                    className='h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0'
                                    onClick={() => {
                                        setSelectedProperty1(row)
                                        setIsShareModalOpen(true)
                                    }}
                                    title='Share'
                                >
                                    <img src={shareic} alt='Share Icon' className='w-7 h-7 flex-shrink-0' />
                                </button>
                                <button
                                    className='h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0'
                                    onClick={() => {
                                        navigate(`/acn/properties/${row.propertyId || row.id}/edit`)
                                    }}
                                    title='Edit'
                                >
                                    <img src={editicon} alt='Edit Icon' className='w-7 h-7 flex-shrink-0' />
                                </button>
                            </div>
                        ),
                    },
                ]
            case 'Requirement':
                return [
                    {
                        key: 'requirementId',
                        header: 'Requirement ID',
                        render: (value) => (
                            <span
                                onClick={() => navigate(`/acn/requirements/${value}/details`)}
                                className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto cursor-pointer hover:text-blue-600'
                            >
                                {value}
                            </span>
                        ),
                    },
                    {
                        key: 'propertyName',
                        header: 'Project Name/Location',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-semibold w-auto'>{value}</span>
                        ),
                    },
                    {
                        key: 'assetType',
                        header: 'Asset Type',
                        render: (value) => (
                            <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                                {value || 'N/A'}
                            </span>
                        ),
                    },
                    {
                        key: 'budget',
                        header: 'Budget',
                        render: (value) => (
                            <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                                {formatCost(value.from)} - {formatCost(value.to)}
                            </span>
                        ),
                    },
                    {
                        key: 'requirementStatus',
                        header: 'Status',
                        dropdown: {
                            options: getStatusOptions(),
                            placeholder: 'Select Status',
                            onChange: (value, row) => {
                                console.log(value, row)
                            },
                        },
                    },
                    {
                        key: 'internalStatus',
                        header: 'Int. Status',
                        dropdown: {
                            options: getStatusOptions(),
                            placeholder: 'Select Status',
                            onChange: (value, row) => {
                                console.log(value, row)
                            },
                        },
                    },
                    {
                        key: 'status',
                        header: 'Int. Status',
                        dropdown: {
                            options: getStatusOptions(),
                            placeholder: 'Select Status',
                            onChange: (value, row) => {
                                console.log(value, row)
                            },
                        },
                    },

                    {
                        key: 'dateOfStatusLastChecked',
                        header: 'Last Updated',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-normal w-auto'>{formatDate(value)}</span>
                        ),
                    },
                ]
            case 'Enquiry':
                return [
                    {
                        key: 'enquiryId',
                        header: 'Enquiry ID',
                        render: (value) => (
                            <span
                                onClick={() => navigate(`/acn/enquiries/${value}/details`)}
                                className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto cursor-pointer hover:text-blue-600'
                            >
                                {value}
                            </span>
                        ),
                    },
                    {
                        key: 'propertyName',
                        header: 'Property Name',
                        render: (value) => (
                            <span className='whitespace-nowrap text-sm font-semibold w-auto'>{value}</span>
                        ),
                    },
                    {
                        key: 'status',
                        header: 'Status',
                        render: (value) => (
                            <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                        ),
                    },
                    {
                        key: 'createdAt',
                        header: 'Created On',
                        render: (value) => (
                            <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                                {formatUnixDate(value)}
                            </span>
                        ),
                    },
                ]
            default:
                return []
        }
    }, [activeTab, navigate])

    return (
        <Layout loading={loading || agentDetailsLoading}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-2 px-6 bg-white min-h-screen'>
                    {/* Header */}
                    <div className='mb-4'>
                        <div className='flex items-center justify-between mb-2'>
                            <Breadcrumb link='/acn/agents' parent='Agents' child={agentId || 'Details'} />
                            <div className='flex items-center gap-4'>
                                <div className='w-80'>
                                    <StateBaseTextFieldTest
                                        leftIcon={
                                            <svg
                                                className='w-4 h-4 text-gray-400'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                                />
                                            </svg>
                                        }
                                        placeholder='Search'
                                        value={searchValue}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setSearchValue(e.target.value)
                                        }
                                        className='h-8'
                                    />
                                </div>
                                <Button
                                    leftIcon={<img src={addinventoryic} alt='Add Inventory Icon' className='w-5 h-5' />}
                                    bgColor='bg-[#2D3748]'
                                    textColor='text-white'
                                    className='px-4 h-8 font-semibold'
                                    onClick={() => navigate('/acn/properties/addinv')}
                                >
                                    Add Inventory
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && <div className='mb-4 p-4 bg-red-50 text-red-700 rounded-md'>{error}</div>}

                    {/* tabs */}
                    <div className='flex items-center justify-between'>
                        <div className='flex flex-col gap-[10px]'>
                            <div className='flex items-center space-x-4'>
                                <div className='flex space-x-4'>
                                    <div
                                        onClick={() => handleTabClick('Inventory')}
                                        className={`cursor-pointer ${activeTab === 'Inventory' ? 'border-b-2 border-black' : ''}`}
                                    >
                                        Inventory ({getTabCount('Inventory')})
                                    </div>
                                    <div
                                        onClick={() => handleTabClick('Requirement')}
                                        className={`cursor-pointer ${activeTab === 'Requirement' ? 'border-b-2 border-black' : ''}`}
                                    >
                                        Requirement ({getTabCount('Requirement')})
                                    </div>
                                    <div
                                        onClick={() => handleTabClick('Enquiry')}
                                        className={`cursor-pointer ${activeTab === 'Enquiry' ? 'border-b-2 border-black' : ''}`}
                                    >
                                        Enquiry ({getTabCount('Enquiry')})
                                    </div>
                                </div>
                                <div>
                                    <div className='flex items-center bg-gray-100 rounded-md p-1 h-8 w-fit'>
                                        <button
                                            onClick={() => handleTabClick('Resale')}
                                            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                                activePropertyTab === 'Resale'
                                                    ? 'bg-white text-black shadow-sm'
                                                    : 'text-gray-600 hover:text-black'
                                            }`}
                                        >
                                            Resale
                                        </button>
                                        <button
                                            onClick={() => handleTabClick('Rental')}
                                            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                                activePropertyTab === 'Rental'
                                                    ? 'bg-white text-black shadow-sm'
                                                    : 'text-gray-600 hover:text-black'
                                            }`}
                                        >
                                            Rental
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className='flex items-center gap-[10px]'>
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
                            </div>
                        </div>
                        {/* agent details dropdown */}
                        <div className='absolute top-14 right-5 border-1 border-gray-300 rounded-md  transition-all duration-200 ease-in-out z-[100] w-[30%] bg-white '>
                            <AgentDetailsDropdown label='Agent Field' agentDetails={agentDetails} />
                        </div>
                    </div>

                    {/* Table */}
                    <div className='mt-10'>
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
                </div>
            </div>
        </Layout>
    )
}

export default AgentDetailsPage
