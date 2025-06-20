import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { get99AcresResaleData, getMagicBricksResaleData } from '../../../services/restack/resaleService'
import type { RestackResaleProperty } from '../../../data_types/restack/restack-resale.d'
import { FlexibleTable } from '../../../components/design-elements/FlexibleTable'

interface OverviewData {
    totalProperties: number
    availableUnits: number
    soldOutUnits: number
}

const Resale: React.FC = () => {
    const navigate = useNavigate()
    const [overviewData, setOverviewData] = useState<{ [key: string]: OverviewData }>({})

    useEffect(() => {
        const fetchOverviewData = async () => {
            const acresData = await get99AcresResaleData()
            const magicBricksData = await getMagicBricksResaleData()

            const calculateOverview = (data: RestackResaleProperty[]): OverviewData => {
                const totalProperties = data.length
                let availableUnits = 0
                let soldOutUnits = 0

                data.forEach((item: any) => {
                    availableUnits += item.inventoryDetails?.availability === 'Yes' ? 1 : 0
                    soldOutUnits += item.inventoryDetails?.soldOutUnits || 0 // Assuming there's a soldOutUnits property
                })

                return {
                    totalProperties,
                    availableUnits,
                    soldOutUnits,
                }
            }

            setOverviewData({
                '99acres': calculateOverview(acresData),
                magicbricks: calculateOverview(magicBricksData),
                other: { totalProperties: 0, availableUnits: 0, soldOutUnits: 0 }, // Placeholder for other sources
            })
        }
        fetchOverviewData()
    }, [])

    const handleResaleTypeSelect = (type: string) => {
        navigate(`/restack/resale/${type}`)
    }

    return (
        <Layout loading={false}>
            <div className='min-h-screen bg-gray-50 p-6'>
                <div className='max-w-7xl mx-auto'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-8'>Inventory Overview</h1>

                    {/* 99 Acres Section */}
                    {overviewData['99acres'] && (
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-8'>
                            <div className='px-6 py-4 border-b border-gray-200'>
                                <h2 className='text-xl font-semibold text-gray-900'>99 Acres</h2>
                            </div>
                            <div className='p-6'>
                                <FlexibleTable
                                    data={[
                                        {
                                            month: 'November',
                                            totalProperties: overviewData['99acres']?.totalProperties || 0,
                                            availableUnits: overviewData['99acres']?.availableUnits || 0,
                                            soldOutUnits: overviewData['99acres']?.soldOutUnits || 0,
                                        },
                                    ]}
                                    columns={[
                                        { key: 'month', header: 'Month' },
                                        { key: 'totalProperties', header: 'Total Properties' },
                                        { key: 'availableUnits', header: 'Available Units' },
                                        { key: 'soldOutUnits', header: 'Sold Out Units' },
                                    ]}
                                />
                                <button
                                    onClick={() => handleResaleTypeSelect('99acres')}
                                    className='mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                                >
                                    View Properties
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Magic Bricks Section */}
                    {overviewData['magicbricks'] && (
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-8'>
                            <div className='px-6 py-4 border-b border-gray-200'>
                                <h2 className='text-xl font-semibold text-gray-900'>Magic Bricks</h2>
                            </div>
                            <div className='p-6'>
                                <FlexibleTable
                                    data={[
                                        {
                                            month: 'November',
                                            totalProperties: overviewData['magicbricks']?.totalProperties || 0,
                                            availableUnits: overviewData['magicbricks']?.availableUnits || 0,
                                            soldOutUnits: overviewData['magicbricks']?.soldOutUnits || 0,
                                        },
                                    ]}
                                    columns={[
                                        { key: 'month', header: 'Month' },
                                        { key: 'totalProperties', header: 'Total Properties' },
                                        { key: 'availableUnits', header: 'Available Units' },
                                        { key: 'soldOutUnits', header: 'Sold Out Units' },
                                    ]}
                                />
                                <button
                                    onClick={() => handleResaleTypeSelect('magicbricks')}
                                    className='mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                                >
                                    View Properties
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Other Sources Section */}
                    {overviewData['other'] && (
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-8'>
                            <div className='px-6 py-4 border-b border-gray-200'>
                                <h2 className='text-xl font-semibold text-gray-900'>Other Sources</h2>
                            </div>
                            <div className='p-6'>
                                <FlexibleTable
                                    data={[
                                        {
                                            month: 'November',
                                            totalProperties: overviewData['other']?.totalProperties || 0,
                                            availableUnits: overviewData['other']?.availableUnits || 0,
                                            soldOutUnits: overviewData['other']?.soldOutUnits || 0,
                                        },
                                    ]}
                                    columns={[
                                        { key: 'month', header: 'Month' },
                                        { key: 'totalProperties', header: 'Total Properties' },
                                        { key: 'availableUnits', header: 'Available Units' },
                                        { key: 'soldOutUnits', header: 'Sold Out Units' },
                                    ]}
                                />
                                <button
                                    onClick={() => handleResaleTypeSelect('other')}
                                    className='mt-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                                    disabled={overviewData['other']?.totalProperties === 0}
                                >
                                    View Properties
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default Resale
