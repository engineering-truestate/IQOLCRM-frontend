import React, { useState } from 'react'
import Layout from '../../../layout/Layout'
import JunkLeadsDashboard from './JunkLeadsDashboard'
import { useNavigate } from 'react-router-dom'

const JunkLeads: React.FC = () => {
    // Manage active tab state
    const [activeTab, _setActiveTab] = useState<'junkLeads'>('junkLeads')
    const navigate = useNavigate()

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden'>
                <div className='bg-white min-h-screen w-[100vw] max-w-full'>
                    {/* Header */}
                    <div className='mb-4'>
                        <div className='flex items-center justify-between p-3 border-b border-gray-300'>
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <button
                                    onClick={() => {
                                        navigate('/canvas-homes/sales')
                                    }}
                                    className='font-medium hover:text-gray-800'
                                >
                                    <span>Sales Dashboard</span>
                                </button>
                                <span>/</span>
                                <span className='text-gray-900 font-medium'>Junk Leads</span>
                            </div>
                        </div>

                        <div className='px-3 border-b border-gray-300'>
                            {/* Tab Navigation */}
                            <div className='flex gap-6'>
                                <button
                                    // onClick={() => handleTabChange('junkLeads')}
                                    className={`py-3 px-1 text-base font-medium border-b-2 transition-colors duration-150 ${
                                        activeTab === 'junkLeads'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Junk Leads
                                </button>
                            </div>
                        </div>
                        {/* Tab Content */}
                        <div className='w-full'>{activeTab === 'junkLeads' && <JunkLeadsDashboard />}</div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default JunkLeads
