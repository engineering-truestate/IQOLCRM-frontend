import React from 'react'
import { useState } from 'react'
import Layout from '../../../layout/Layout'
import Leads from './Leads'
import Tasks from './Tasks'

const SalesDashboard = () => {
    const [activeTab, setActiveTab] = useState<'leads' | 'tasks'>('leads')

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className=' bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-4'>
                        <div className='flex items-center justify-between py-4 border-b border-gray-300'>
                            <div className='px-6'>
                                <h1 className='text-lg font-semibold text-black'>Sales Dashboard</h1>
                            </div>
                        </div>
                        <div className='px-6'>
                            {/* Tab Navigation */}
                            <div className='flex gap-8 mb-3.5 border-b border-gray-200'>
                                <button
                                    onClick={() => setActiveTab('leads')}
                                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-150 ${
                                        activeTab === 'leads'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Leads
                                </button>
                                <button
                                    onClick={() => setActiveTab('tasks')}
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
                        <div className='w-full px-6'>
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
