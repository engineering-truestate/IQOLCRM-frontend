import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import type { IEnquiry } from '../../../data_types/acn/types'

interface AgentEnquiryTableProps {
    agentId: string | undefined
    enquiryData: IEnquiry[]
}

const AgentEnquiryTable: React.FC<AgentEnquiryTableProps> = ({ enquiryData }) => {
    const getEnquiryColumns = (): TableColumn[] => {
        const columns: TableColumn[] = [
            {
                key: 'propertyId',
                header: 'Property Id',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
            {
                key: 'propertyName',
                header: 'Property Name',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
            {
                key: 'buyerAgentName',
                header: 'Buyer-Agent Name',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
            {
                key: 'buyerAgentNumber',
                header: 'Buyer-Agent Number',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
            {
                key: 'added',
                header: 'Date of Enquiry',
                render: (value) => (
                    <span className='whitespace-nowrap text-black hover:text-blue-800 text-sm font-normal w-auto cursor-pointer transition-colors'>
                        {value}
                    </span>
                ),
            },
            {
                key: 'status',
                header: 'Status',
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
        <div>
            <div>
                <FlexibleTable
                    data={enquiryData} // Replace with actual data from the service
                    columns={getEnquiryColumns()}
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
    )
}

export default AgentEnquiryTable
