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
import Dropdown from '../../../components/design-elements/Dropdown'

interface MonthlyData {
    month: string
    year: number
    monthNum: number
    totalProperties: number
    availableUnits: number
    soldOutUnits: number
}

interface OverviewData {
    [key: string]: MonthlyData[]
}

interface ScrapedAtData {
    [key: string]: string | number | undefined
}

const Rental: React.FC = () => {
    const navigate = useNavigate()
    const [overviewData, setOverviewData] = useState<OverviewData>({})
    const [scrapedAtData, setScrapedAtData] = useState<ScrapedAtData>({})
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
    const [availableYears, setAvailableYears] = useState<number[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Helper function to parse date in dd/MM/yyyy format
    const parseDate = (dateString: string): Date => {
        const [day, month, year] = dateString.split('/').map(Number)
        return new Date(year, month - 1, day) // Month is 0-indexed
    }

    // Helper function to get available months from price history
    const getAvailableMonths = (priceHistory: { date: string; price: number }[]) => {
        if (!priceHistory || priceHistory.length === 0) return []

        return priceHistory.map((entry) => {
            const date = parseDate(entry.date)
            return {
                year: date.getFullYear(),
                month: date.getMonth(), // 0-11
                monthName: date.toLocaleString('default', { month: 'long' }),
                price: entry.price,
                date: entry.date,
            }
        })
    }

    // Get all unique years from all properties
    const getAllAvailableYears = (allData: RestackRentalProperty[]) => {
        const years = new Set<number>()

        allData.forEach((property) => {
            if (property.priceHistory && property.priceHistory.length > 0) {
                property.priceHistory.forEach((entry) => {
                    const year = parseDate(entry.date).getFullYear()
                    years.add(year)
                })
            }
        })

        return Array.from(years).sort((a, b) => b - a) // Sort descending
    }

    // Calculate monthly overview data for a specific year
    const calculateMonthlyOverview = (data: RestackRentalProperty[], year: number): MonthlyData[] => {
        const monthlyData: { [key: number]: MonthlyData } = {}
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = currentDate.getMonth()

        // Determine the last month to show data for
        const lastMonth = year === currentYear ? currentMonth : 11

        // Initialize months for the year (only up to current month if current year)
        for (let month = 0; month <= lastMonth; month++) {
            const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' })
            monthlyData[month] = {
                month: monthName,
                year: year,
                monthNum: month,
                totalProperties: data.length,
                availableUnits: 0,
                soldOutUnits: 0,
            }
        }

        // Calculate availability for each property in each month
        data.forEach((property) => {
            const availableMonths = getAvailableMonths(property.priceHistory || [])

            for (let month = 0; month <= lastMonth; month++) {
                // Check if property has data for this specific month/year
                const hasDataForMonth = availableMonths.some((entry) => entry.year === year && entry.month === month)

                if (hasDataForMonth) {
                    monthlyData[month].availableUnits++
                } else {
                    // Check if property was available before this month (indicating it might be sold out)
                    const wasAvailableBefore = availableMonths.some((entry) => {
                        return entry.year < year || (entry.year === year && entry.month < month)
                    })

                    // Check if property becomes available after this month (indicating it wasn't launched yet)
                    const willBeAvailableLater = availableMonths.some((entry) => {
                        return entry.year > year || (entry.year === year && entry.month > month)
                    })

                    // Only count as sold out if it was available before but not available now and not launching later
                    if (wasAvailableBefore && !willBeAvailableLater) {
                        monthlyData[month].soldOutUnits++
                    }
                }
            }
        })

        // Return only months that have some activity (available or sold out units > 0)
        return Object.values(monthlyData).filter((data) => data.availableUnits > 0 || data.soldOutUnits > 0)
    }

    useEffect(() => {
        const fetchOverviewData = async () => {
            setLoading(true)
            try {
                const [acresResult, magicBricksResult, acnResult, myGateResult, housingResult] = await Promise.all([
                    get99AcresRentalData(),
                    getMagicBricksRentalData(),
                    getACNRentalData(),
                    getMyGateRentalData(),
                    getHousingRentalData(),
                ])

                const acresData = acresResult
                const magicBricksData = magicBricksResult
                const acnData = acnResult
                const myGateData = myGateResult
                const housingData = housingResult

                // Store scrapedAt data in state
                const newScrapedAtData: ScrapedAtData = {
                    '99acres': acresResult.length > 0 ? acresResult[0].scrapedAt : undefined,
                    magicbricks: magicBricksResult.length > 0 ? magicBricksResult[0].scrapedAt : undefined,
                    ACN: acnResult.length > 0 ? acnResult[0].scrapedAt : undefined,
                    myGate: myGateResult.length > 0 ? myGateResult[0].scrapedAt : undefined,
                    Housing: housingResult.length > 0 ? housingResult[0].scrapedAt : undefined,
                }
                setScrapedAtData(newScrapedAtData)

                // Get all available years from all data sources
                const allData = [...acresData, ...magicBricksData, ...acnData, ...myGateData, ...housingData]
                const years = getAllAvailableYears(allData)
                setAvailableYears(years)

                // Set default year to the latest available year
                if (years.length > 0 && !years.includes(selectedYear)) {
                    setSelectedYear(years[0])
                }

                // Calculate monthly data for each source
                const newOverviewData: OverviewData = {
                    '99acres': calculateMonthlyOverview(acresData, selectedYear),
                    magicbricks: calculateMonthlyOverview(magicBricksData, selectedYear),
                    ACN: calculateMonthlyOverview(acnData, selectedYear),
                    myGate: calculateMonthlyOverview(myGateData, selectedYear),
                    Housing: calculateMonthlyOverview(housingData, selectedYear),
                }

                setOverviewData(newOverviewData)
            } catch (error) {
                console.error('Error fetching rental data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOverviewData()
    }, [selectedYear])

    const handleRentalTypeSelect = (type: string) => {
        navigate(`/restack/rental/${type}`)
    }

    const handleYearChange = (year: number) => {
        setSelectedYear(year)
    }

    const renderSourceSection = (sourceName: string, displayName: string) => {
        const data = overviewData[sourceName]
        const scrapedAt = scrapedAtData[sourceName]

        if (!data || data.length === 0) {
            return null
        }

        return (
            <div key={sourceName} className='bg-white rounded-lg shadow-sm border border-gray-200 mb-8'>
                <div className='px-6 py-4 border-b border-gray-200 flex justify-between'>
                    <h2 className='text-xl font-semibold text-gray-900'>{displayName}</h2>
                    <div className='flex gap-2'>
                        {scrapedAt && (
                            <div className=' text-sm mt-1 text-gray-500'>
                                Last Scraped At: {new Date(scrapedAt).toLocaleString()}
                            </div>
                        )}
                        <button
                            onClick={() => handleRentalTypeSelect(sourceName)}
                            className='bg-black text-white w-35 text-xs font-medium px-3 py-1 rounded transition-colors hover:bg-gray-800'
                        >
                            View Inventories
                        </button>
                    </div>
                </div>
                <div className='p-6'>
                    <FlexibleTable
                        data={data}
                        columns={[
                            { key: 'month', header: 'Month' },
                            { key: 'totalProperties', header: 'Total Inventory' },
                            { key: 'availableUnits', header: 'Available Units' },
                            { key: 'soldOutUnits', header: 'Rented Out Units' },
                        ]}
                    />
                </div>
            </div>
        )
    }

    return (
        <Layout loading={loading}>
            <div className='min-h-screen bg-gray-50 p-6'>
                <div className='max-w-7xl mx-auto'>
                    <div className='flex justify-between items-center mb-8'>
                        <h1 className='text-3xl font-bold text-gray-900'>Rental Inventory Overview</h1>

                        <div className='flex items-center gap-4'>
                            <Dropdown
                                options={availableYears.map((year) => ({
                                    label: year.toString(),
                                    value: year.toString(),
                                }))}
                                placeholder='Select Year'
                                onSelect={(value) => handleYearChange(Number(value))}
                                triggerClassName='flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                menuClassName='absolute z-50 mt-1 top-7 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'
                                optionClassName='px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2'
                            />
                        </div>
                    </div>

                    {availableYears.length === 0 && !loading && (
                        <div className='text-center py-12'>
                            <div className='text-gray-500'>
                                <svg
                                    className='mx-auto h-12 w-12 text-gray-400'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                    />
                                </svg>
                                <h3 className='mt-2 text-sm font-medium text-gray-900'>No rental data available</h3>
                                <p className='mt-1 text-sm text-gray-500'>No properties with price history found.</p>
                            </div>
                        </div>
                    )}

                    {/* Render each source section */}
                    {renderSourceSection('99acres', '99 Acres')}
                    {renderSourceSection('magicbricks', 'Magic Bricks')}
                    {renderSourceSection('ACN', 'ACN')}
                    {renderSourceSection('myGate', 'myGate')}
                    {renderSourceSection('Housing', 'Housing')}
                </div>
            </div>
        </Layout>
    )
}

export default Rental
