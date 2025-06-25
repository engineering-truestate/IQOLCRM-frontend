import React, { useState } from 'react'
import Layout from '../../../layout/Layout'
import Leads from './Leads'
import Tasks from './Tasks'
import { useNavigate } from 'react-router-dom'

const SalesDashboard: React.FC = () => {
    // Manage active tab state
    const [activeTab, setActiveTab] = useState<'leads' | 'tasks'>('leads')
    const navigate = useNavigate()

    // Function to handle tab changes while explicitly removing query params
    const handleTabChange = (tab: 'leads' | 'tasks') => {
        setActiveTab(tab)
        // Navigate to base path without query params
        navigate('/canvas-homes/sales', { replace: true })
    }

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden'>
                <div className='bg-white min-h-screen w-[100vw] max-w-full'>
                    {/* Header */}
                    <div className='mb-4'>
                        <div className='flex items-center justify-between p-3 border-b border-gray-300'>
                            <div>
                                <h1 className='text-base font-semibold text-black'>Sales Dashboard</h1>
                            </div>
                        </div>
                        <div className='px-3 border-b border-gray-300'>
                            {/* Tab Navigation */}
                            <div className='flex gap-6'>
                                <button
                                    onClick={() => handleTabChange('leads')}
                                    className={`py-3 px-1 text-base font-medium border-b-2 transition-colors duration-150 ${
                                        activeTab === 'leads'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Leads
                                </button>
                                <button
                                    onClick={() => handleTabChange('tasks')}
                                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-150 ${
                                        activeTab === 'tasks'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Tasks
                                </button>
                            </div>
                        </div>
                        {/* Tab Content */}
                        <div className='w-full'>
                            {activeTab === 'leads' && <Leads />}
                            {activeTab === 'tasks' && <Tasks />}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default SalesDashboard
