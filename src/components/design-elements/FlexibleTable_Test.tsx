'use client'

import { useState } from 'react'
import {
    FlexibleTable,
    TextCell,
    AvatarCell,
    BadgeCell,
    IconTextCell,
    type TableColumn,
    type TableAction,
} from './FlexibleTable'

const IconCopy = () => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <rect x='9' y='9' width='13' height='13' rx='2' ry='2'></rect>
        <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path>
    </svg>
)

const IconPhone = () => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'></path>
    </svg>
)

const IconMessage = () => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
    </svg>
)

const IconGlobe = () => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='text-blue-500'
    >
        <circle cx='12' cy='12' r='10'></circle>
        <line x1='2' y1='12' x2='22' y2='12'></line>
        <path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'></path>
    </svg>
)

const IconBuilding = () => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='text-gray-400'
    >
        <rect x='4' y='2' width='16' height='20' rx='2' ry='2'></rect>
        <path d='M9 22v-4h6v4'></path>
        <line x1='8' y1='6' x2='16' y2='6'></line>
        <line x1='8' y1='10' x2='16' y2='10'></line>
        <line x1='8' y1='14' x2='16' y2='14'></line>
    </svg>
)

const IconEye = () => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'></path>
        <circle cx='12' cy='12' r='3'></circle>
    </svg>
)

const IconEdit = () => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'></path>
        <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'></path>
    </svg>
)

const IconTrash = () => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='text-red-500'
    >
        <polyline points='3 6 5 6 21 6'></polyline>
        <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'></path>
        <line x1='10' y1='11' x2='10' y2='17'></line>
        <line x1='14' y1='11' x2='14' y2='17'></line>
    </svg>
)

export default function TableShowcase() {
    const [selectedRows1, setSelectedRows1] = useState<string[]>([])
    const [selectedRows2, setSelectedRows2] = useState<string[]>([])

    // Sample data for the main table (matching your template)
    const mainTableData = Array.from({ length: 15 }, (_, i) => ({
        id: `row-${i + 1}`,
        name: 'Ram the king',
        stage: 'EOI Collection',
        stageDesc: 'Assetz sora and saki',
        phone: '+91 7024396102',
        agent: 'Rajan Jain',
        source: 'Google',
        sourceDesc: 'Assetz sora and saki',
        property: '5 Project',
        todo: 'EOI Collection',
        todoCount: 5,
        aslc: 0,
    }))

    // Sample data for other variations
    const simpleTableData = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Inactive' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'Active' },
    ]

    const userTableData = [
        {
            id: '1',
            user: { name: 'Alice Cooper', avatar: '/placeholder.svg?height=32&width=32' },
            department: 'Engineering',
            location: 'San Francisco',
            joinDate: '2023-01-15',
        },
        {
            id: '2',
            user: { name: 'David Wilson', avatar: '/placeholder.svg?height=32&width=32' },
            department: 'Marketing',
            location: 'New York',
            joinDate: '2023-03-20',
        },
        {
            id: '3',
            user: { name: 'Sarah Davis', avatar: '/placeholder.svg?height=32&width=32' },
            department: 'Sales',
            location: 'Chicago',
            joinDate: '2023-02-10',
        },
    ]

    // Column definitions for main table
    const mainTableColumns: TableColumn[] = [
        {
            key: 'name',
            header: 'Name',
            render: (value) => <span className='font-medium'>{value}</span>,
        },
        {
            key: 'stage',
            header: 'Stage',
            render: (value, row) => <TextCell primary={value} secondary={row.stageDesc} />,
        },
        {
            key: 'phone',
            header: 'Phone number',
            render: (value) => <IconTextCell icon={<IconPhone />} text={value} />,
        },
        {
            key: 'agent',
            header: 'Agent',
            render: (value) => (
                <AvatarCell
                    src='/placeholder.svg?height=32&width=32'
                    fallback={value
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    text={value}
                />
            ),
        },
        {
            key: 'source',
            header: 'Source',
            render: (value, row) => <IconTextCell icon={<IconGlobe />} text={value} secondary={row.sourceDesc} />,
        },
        {
            key: 'property',
            header: 'Property',
            render: (value) => <BadgeCell text={value} variant='outline' />,
        },
        {
            key: 'todo',
            header: 'To do',
            render: (value, row) => <BadgeCell text={value} count={row.todoCount} />,
        },
        {
            key: 'aslc',
            header: 'ASLC',
            render: (value) => <span className='font-mono'>{value}</span>,
        },
    ]

    // Actions for main table
    const mainTableActions: TableAction[] = [
        {
            icon: <IconCopy />,
            label: 'Copy',
            onClick: (row) => console.log('Copy', row),
        },
        {
            icon: <IconPhone />,
            label: 'Call',
            onClick: (row) => console.log('Call', row),
        },
        {
            icon: <IconMessage />,
            label: 'Message',
            onClick: (row) => console.log('Message', row),
        },
    ]

    // Simple table columns
    const simpleColumns: TableColumn[] = [
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
        {
            key: 'status',
            header: 'Status',
            render: (value) => <BadgeCell text={value} variant={value === 'Active' ? 'default' : 'secondary'} />,
        },
    ]

    // User table columns
    const userColumns: TableColumn[] = [
        {
            key: 'user',
            header: 'User',
            render: (value) => (
                <AvatarCell
                    src={value.avatar}
                    fallback={value.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    text={value.name}
                />
            ),
        },
        {
            key: 'department',
            header: 'Department',
            render: (value) => <IconTextCell icon={<IconBuilding />} text={value} />,
        },
        { key: 'location', header: 'Location' },
        { key: 'joinDate', header: 'Join Date' },
    ]

    const userActions: TableAction[] = [
        {
            icon: <IconEye />,
            label: 'View',
            onClick: (row) => console.log('View', row),
        },
        {
            icon: <IconEdit />,
            label: 'Edit',
            onClick: (row) => console.log('Edit', row),
        },
        {
            icon: <IconTrash />,
            label: 'Delete',
            onClick: (row) => console.log('Delete', row),
            variant: 'destructive' as const,
        },
    ]

    const handleRowSelect1 = (rowId: string, selected: boolean) => {
        setSelectedRows1((prev) => (selected ? [...prev, rowId] : prev.filter((id) => id !== rowId)))
    }

    const handleSelectAll1 = (selected: boolean) => {
        setSelectedRows1(selected ? mainTableData.map((row) => row.id) : [])
    }

    const handleRowSelect2 = (rowId: string, selected: boolean) => {
        setSelectedRows2((prev) => (selected ? [...prev, rowId] : prev.filter((id) => id !== rowId)))
    }

    const handleSelectAll2 = (selected: boolean) => {
        setSelectedRows2(selected ? userTableData.map((row) => row.id) : [])
    }

    return (
        <div className='min-h-screen bg-gray-50 p-8'>
            <div className='max-w-7xl mx-auto space-y-12'>
                <div className='text-center'>
                    <h1 className='text-4xl font-bold text-gray-900 mb-4'>Flexible Table Component</h1>
                    <p className='text-lg text-gray-600'>
                        A comprehensive table component with various configurations and features
                    </p>
                </div>

                {/* Main Table - Matching your template */}
                <section className='bg-white rounded-lg shadow-sm border p-6'>
                    <h2 className='text-2xl font-semibold mb-4'>Main Template Table</h2>
                    <p className='text-gray-600 mb-6'>
                        Complete table with checkboxes, mixed content types, and action buttons
                    </p>
                    <FlexibleTable
                        data={mainTableData}
                        columns={mainTableColumns}
                        actions={mainTableActions}
                        showCheckboxes={true}
                        selectedRows={selectedRows1}
                        onRowSelect={handleRowSelect1}
                        onSelectAll={handleSelectAll1}
                        hoverable={true}
                        className='border rounded-lg'
                    />
                </section>

                {/* Simple Table */}
                <section className='bg-white rounded-lg shadow-sm border p-6'>
                    <h2 className='text-2xl font-semibold mb-4'>Simple Table</h2>
                    <p className='text-gray-600 mb-6'>Basic table without checkboxes or actions</p>
                    <FlexibleTable
                        data={simpleTableData}
                        columns={simpleColumns}
                        striped={true}
                        className='border rounded-lg'
                    />
                </section>

                {/* User Management Table */}
                <section className='bg-white rounded-lg shadow-sm border p-6'>
                    <h2 className='text-2xl font-semibold mb-4'>User Management Table</h2>
                    <p className='text-gray-600 mb-6'>Table with avatars, icons, and management actions</p>
                    <FlexibleTable
                        data={userTableData}
                        columns={userColumns}
                        actions={userActions}
                        showCheckboxes={true}
                        selectedRows={selectedRows2}
                        onRowSelect={handleRowSelect2}
                        onSelectAll={handleSelectAll2}
                        hoverable={true}
                        className='border rounded-lg'
                    />
                </section>

                {/* Empty State Table */}
                <section className='bg-white rounded-lg shadow-sm border p-6'>
                    <h2 className='text-2xl font-semibold mb-4'>Empty State</h2>
                    <p className='text-gray-600 mb-6'>Table with no data showing empty state</p>
                    <FlexibleTable
                        data={[]}
                        columns={simpleColumns}
                        emptyMessage='No users found. Add some users to get started.'
                        className='border rounded-lg'
                    />
                </section>

                {/* Customization Examples */}
                <section className='bg-white rounded-lg shadow-sm border p-6'>
                    <h2 className='text-2xl font-semibold mb-4'>Customization Examples</h2>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <div>
                            <h3 className='text-lg font-medium mb-3'>Custom Styling</h3>
                            <FlexibleTable
                                data={simpleTableData.slice(0, 2)}
                                columns={simpleColumns}
                                className='border-2 border-blue-200 rounded-xl'
                                headerClassName='bg-blue-50'
                                rowClassName='hover:bg-blue-25'
                                hoverable={true}
                            />
                        </div>
                        <div>
                            <h3 className='text-lg font-medium mb-3'>Compact Version</h3>
                            <FlexibleTable
                                data={simpleTableData.slice(0, 2)}
                                columns={simpleColumns}
                                cellClassName='py-2 px-3 text-xs'
                                className='border rounded-lg text-sm'
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
