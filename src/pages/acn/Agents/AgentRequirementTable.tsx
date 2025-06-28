import { useNavigate } from 'react-router-dom'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import type { IRequirement } from '../../../data_types/acn/types'

interface AgentRequirementTableProps {
    requirementsData: IRequirement[]
    agentId: string | undefined
}

const AgentRequirementTable: React.FC<AgentRequirementTableProps> = ({ requirementsData }) => {
    const navigate = useNavigate()

    const getRequirementColumns = (): TableColumn[] => {
        const columns: TableColumn[] = [
            {
                key: 'id',
                header: 'Req ID',
                render: (value) => (
                    <span
                        className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'
                        onClick={() => {
                            navigate(`/acn/requirements/${value}/details`)
                        }}
                    >
                        {value}
                    </span>
                ),
            },
            {
                key: 'projectNameLocation',
                header: 'Project Name/Location',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
            {
                key: 'assetType',
                header: 'Asset type',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
            // {
            //     key: 'budget',
            //     header: 'Budget',
            //     render: (value) => (
            //         <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
            //             {value}
            //         </span>
            //     ),
            // },
            {
                key: 'status',
                header: 'Status',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
            {
                key: 'intStatus',
                header: 'Int. Status',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
            {
                key: 'lastUpdated',
                header: 'Last Updated',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
            {
                key: 'agentName',
                header: 'Agent Name',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
            {
                key: 'agentNumber',
                header: 'Agent Number',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
            {
                key: 'actions',
                header: 'Actions',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
        ]

        return columns
    }

    return (
        <FlexibleTable
            data={requirementsData}
            columns={getRequirementColumns()}
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
    )
}

export default AgentRequirementTable
