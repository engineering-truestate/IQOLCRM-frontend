import { useState, useEffect } from 'react'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import type { IInventory } from '../../../store/reducers/types'
import { useNavigate } from 'react-router-dom'

interface AgentInventoryTableProps {
    inventoryData: IInventory[]
    agentId: string | undefined
}

const AgentInventoryTable: React.FC<AgentInventoryTableProps> = ({ inventoryData, agentId }) => {
    const [selectedInventoryStatus, setSelectedInventoryStatus] = useState('')
    const navigate = useNavigate()

    const getInventoryStatusOptions = () => {
        return [
            { label: 'All Status', value: '' },
            { label: 'Available', value: 'available' },
            { label: 'Sold', value: 'sold' },
            { label: 'Hold', value: 'hold' },
            { label: 'Delisted', value: 'delisted' },
            { label: 'Pending QC', value: 'pending_qc' },
        ]
    }

    const getInventoryColumns = (): TableColumn[] => {
        const baseColumns: TableColumn[] = [
            {
                key: 'propertyId',
                header: 'Property ID',
                render: (value) => (
                    <span
                        onClick={() => {
                            navigate(`/acn/properties/${value}/details`)
                        }}
                        className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'
                    >
                        {value}
                    </span>
                ),
            },
            {
                key: 'propertyName',
                header: 'Property Name',
                render: (value) => <span className='whitespace-nowrap text-sm font-semibold w-auto'>{value}</span>,
            },
            {
                key: 'assetType',
                header: 'Asset Type',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                ),
            },
            {
                key: 'price',
                header: 'Price',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                ),
            },
            {
                key: 'sbua',
                header: 'SBUA',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                ),
            },
            {
                key: 'plotSize',
                header: 'Plot Size',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                ),
            },
            {
                key: 'facing',
                header: 'Facing',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
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
                key: 'enquiries',
                header: 'Enquiries',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                ),
            },
            {
                key: 'micromarket',
                header: 'Micromarket',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                ),
            },
            {
                key: 'lastCheck',
                header: 'Last check',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                ),
            },
            {
                key: 'actions',
                header: 'Actions',
                render: (value) => (
                    <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
                ),
            },
        ]

        return baseColumns
    }

    return (
        <>
            <div className='flex items-center gap-2 mb-2'>
                <Dropdown
                    options={getInventoryStatusOptions()}
                    onSelect={setSelectedInventoryStatus}
                    defaultValue={selectedInventoryStatus}
                    placeholder='Inventory Status'
                    className='relative inline-block'
                    triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer'
                    menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                />
            </div>

            <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                <div className='h-[65vh] overflow-y-auto'>
                    <FlexibleTable
                        data={inventoryData}
                        columns={getInventoryColumns()}
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
        </>
    )
}

export default AgentInventoryTable
