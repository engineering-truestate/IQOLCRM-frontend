import { useNavigate, useParams } from 'react-router'
import Layout from '../../../layout/Layout'
import Breadcrumb from '../../../components/acn/Breadcrumb'
import { useState, useEffect, useMemo } from 'react'
import StateBaseTextFieldTest from '../../../components/design-elements/StateBaseTextField'
import Button from '../../../components/design-elements/Button'
import addinventoryic from '/icons/acn/user-add.svg'
import { useDispatch } from 'react-redux'
import type { IInventory, IRequirement } from '../../../store/reducers/types'
import { fetchAllRequirements } from '../../../services/acn/requirements/requirementService'

import AgentInventoryTable from './AgentInventoryTable'
import AgentRequirementTable from './AgentRequirementTable'
import AgentEnquiryTable from './AgentEnquiryTable'

import { fetchAllProperties } from '../../../services/acn/properties/propertiesService'
import { fetchAllEnquiries } from '../../../services/acn/enquiries/enquiryService'

const AgentDetailsPage = () => {
    const { agentId } = useParams()
    const [searchValue, setSearchValue] = useState('')
    const navigate = useNavigate()
    const [selectedInventoryStatus, setSelectedInventoryStatus] = useState('')
    const [inventoryData, setInventoryData] = useState<IInventory[]>([])
    const [requirementsData, setRequirementsData] = useState<IRequirement[]>([])
    const [enquiryData, setEnquiryData] = useState<any[]>([])

    const [activeTab, setActiveTab] = useState<'Inventory' | 'Requirement' | 'Enquiry'>('Inventory')
    const [activePropertyTab, setActivePropertyTab] = useState<'Resale' | 'Rental' | null>(null)

    const handleTabClick = (tab: string) => {
        if (tab === 'Resale' || tab === 'Rental') {
            setActivePropertyTab(tab as 'Resale' | 'Rental')
        } else {
            setActiveTab(tab as 'Inventory' | 'Requirement' | 'Enquiry')
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!agentId) return
            const filters = { cpId: 'INT001' }

            // Fetch properties
            const propertiesResponse = await fetchAllProperties(filters)
            if (propertiesResponse.success && propertiesResponse?.data) {
                setInventoryData(propertiesResponse.data)
            } else {
                console.error('Failed to fetch properties:', propertiesResponse.error)
            }

            // Fetch requirements
            const requirementsResponse = await fetchAllRequirements(filters)
            if (requirementsResponse.success && requirementsResponse.data) {
                setRequirementsData(requirementsResponse.data)

                console.log(requirementsData, 'hello')
            } else {
                console.error('Failed to fetch requirements:', requirementsResponse.error)
            }

            // Fetch enquiry
            const enquiryResponse = await fetchAllEnquiries(filters)
            if (enquiryResponse.success && enquiryResponse.data) {
                setEnquiryData(enquiryResponse.data)
            } else {
                console.error('Failed to fetch requirements:', enquiryResponse.error)
            }
        }

        fetchData()
    })

    return (
        <Layout loading={false}>
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
                                        onChange={(e) => setSearchValue(e.target.value)}
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

                    {/* tabs */}
                    <div className='flex items-center space-x-4'>
                        <div className='flex space-x-4'>
                            <div
                                onClick={() => handleTabClick('Inventory')}
                                className={`cursor-pointer ${activeTab === 'Inventory' ? 'border-b-2 border-black' : ''}`}
                            >
                                Inventory ({inventoryData.length})
                            </div>
                            <div
                                onClick={() => handleTabClick('Requirement')}
                                className={`cursor-pointer ${activeTab === 'Requirement' ? 'border-b-2 border-black' : ''}`}
                            >
                                Requirement ({requirementsData.length})
                            </div>
                            <div
                                onClick={() => handleTabClick('Enquiry')}
                                className={`cursor-pointer ${activeTab === 'Enquiry' ? 'border-b-2 border-black' : ''}`}
                            >
                                Enquiry ({enquiryData.length})
                            </div>
                        </div>
                        <div>
                            <div className='flex items-center bg-gray-100 rounded-md p-1 h-8 w-fit'>
                                <button
                                    onClick={() => setActivePropertyTab('Resale')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activePropertyTab === 'Resale'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Resale
                                </button>
                                <button
                                    onClick={() => setActivePropertyTab('Rental')}
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

                    {activeTab === 'Inventory' && (
                        <AgentInventoryTable inventoryData={inventoryData} agentId={agentId} />
                    )}

                    {activeTab === 'Requirement' && (
                        <AgentRequirementTable requirementsData={requirementsData} agentId={agentId} />
                    )}

                    {activeTab === 'Enquiry' && <AgentEnquiryTable enquiryData={enquiryData} agentId={agentId} />}
                </div>
            </div>
        </Layout>
    )
}

export default AgentDetailsPage
