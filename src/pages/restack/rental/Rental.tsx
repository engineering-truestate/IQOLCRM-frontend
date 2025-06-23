import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'

import { FlexibleTable } from '../../../components/design-elements/FlexibleTable'
import {
    get99AcresRentalData,
    getACNRentalData,
    getHousingRentalData,
    getMagicBricksRentalData,
    getMyGateRentalData,
} from '../../../services/restack/rentalService'
import type { RestackRentalProperty } from '../../../data_types/restack/restack-rental'

interface OverviewData {
    totalProperties: number
    availableUnits: number
    soldOutUnits: number
}

const Rental: React.FC = () => {
    const navigate = useNavigate()
    const [overviewData, setOverviewData] = useState<{ [key: string]: OverviewData }>({})

    useEffect(() => {
        const fetchOverviewData = async () => {
            const acresData = await get99AcresRentalData()
            const magicBricksData = await getMagicBricksRentalData()
            const acnData = await getACNRentalData()
            const myGateData = await getMyGateRentalData()
            const HousingData = await getHousingRentalData()

            const calculateOverview = (data: RestackRentalProperty[]): OverviewData => {
                const totalProperties = data.length
                let availableUnits = 0
                let soldOutUnits = 0

                data.forEach((item: any) => {
                    availableUnits += item.inventoryDetails?.listingStatus === 'available' ? 1 : 0
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
                ACN: calculateOverview(acnData),
                myGate: calculateOverview(myGateData),
                Housing: calculateOverview(HousingData),
            })
        }
        fetchOverviewData()
    }, [])

    const handleResaleTypeSelect = (type: string) => {
        navigate(`/restack/rental/${type}`)
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
                                    className='mt-3 inline-flex cursor-pointer items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
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
                                    className='mt-3 inline-flex cursor-pointer items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                                >
                                    View Properties
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Other Sources Section */}
                    {overviewData['ACN'] && (
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-8'>
                            <div className='px-6 py-4 border-b border-gray-200'>
                                <h2 className='text-xl font-semibold text-gray-900'>ACN</h2>
                            </div>
                            <div className='p-6'>
                                <FlexibleTable
                                    data={[
                                        {
                                            month: 'November',
                                            totalProperties: overviewData['ACN']?.totalProperties || 0,
                                            availableUnits: overviewData['ACN']?.availableUnits || 0,
                                            soldOutUnits: overviewData['ACN']?.soldOutUnits || 0,
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
                                    onClick={() => handleResaleTypeSelect('ACN')}
                                    className='mt-3 inline-flex cursor-pointer items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                                    // disabled={overviewData['ACN']?.totalProperties === 0}
                                >
                                    View Properties
                                </button>
                            </div>
                        </div>
                    )}
                    {overviewData['myGate'] && (
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-8'>
                            <div className='px-6 py-4 border-b border-gray-200'>
                                <h2 className='text-xl font-semibold text-gray-900'>myGate</h2>
                            </div>
                            <div className='p-6'>
                                <FlexibleTable
                                    data={[
                                        {
                                            month: 'November',
                                            totalProperties: overviewData['myGate']?.totalProperties || 0,
                                            availableUnits: overviewData['myGate']?.availableUnits || 0,
                                            soldOutUnits: overviewData['myGate']?.soldOutUnits || 0,
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
                                    onClick={() => handleResaleTypeSelect('myGate')}
                                    className='mt-3 inline-flex cursor-pointer items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                                    // disabled={overviewData['ACN']?.totalProperties === 0}
                                >
                                    View Properties
                                </button>
                            </div>
                        </div>
                    )}
                    {overviewData['Housing'] && (
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-8'>
                            <div className='px-6 py-4 border-b border-gray-200'>
                                <h2 className='text-xl font-semibold text-gray-900'>Housing</h2>
                            </div>
                            <div className='p-6'>
                                <FlexibleTable
                                    data={[
                                        {
                                            month: 'November',
                                            totalProperties: overviewData['Housing']?.totalProperties || 0,
                                            availableUnits: overviewData['Housing']?.availableUnits || 0,
                                            soldOutUnits: overviewData['Housing']?.soldOutUnits || 0,
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
                                    onClick={() => handleResaleTypeSelect('Housing')}
                                    className='mt-3 inline-flex cursor-pointer items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                                    // disabled={overviewData['ACN']?.totalProperties === 0}
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

export default Rental
