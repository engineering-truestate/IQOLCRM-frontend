import React, { useState } from 'react'
import Layout from '../../../layout/Layout'
import JunkLeadsDashboard from './JunkLeadsDashboard'

const JunkLeads: React.FC = () => {
    // Manage active tab state
    const [activeTab, _setActiveTab] = useState<'junkLeads'>('junkLeads')
    // const navigate = useNavigate()

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
