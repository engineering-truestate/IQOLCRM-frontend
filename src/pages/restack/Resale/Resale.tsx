import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import {
    get99AcresResaleData,
    getACNResaleData,
    getHousingResaleData,
    getMagicBricksResaleData,
    getMyGateResaleData,
} from '../../../services/restack/resaleService'
import type { RestackResaleProperty } from '../../../data_types/restack/restack-resale.d'
import { FlexibleTable } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import { formatUnixDate } from '../../../components/helper/getUnixDateTime'

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

const Resale: React.FC = () => {
    const navigate = useNavigate()
    const [overviewData, setOverviewData] = useState<OverviewData>({})
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
    const [availableYears, setAvailableYears] = useState<number[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const [lastDataUpdataed, setLastDataUpdated] = useState<string | number>()

    const getAvailableMonths = (priceHistory: { date: string; price: number }[]) => {
        if (!priceHistory || priceHistory.length === 0) return []

        return priceHistory.map((entry) => {
            const date = new Date(entry.date)
            return {
                year: date.getFullYear(),
                month: date.getMonth(), // 0-11
                monthName: date.toLocaleString('default', { month: 'long' }),
                price: entry.price,
                date: entry.date,
            }
        })
    }

    const getAllAvailableYears = (allData: RestackResaleProperty[]) => {
        const years = new Set<number>()

        allData.forEach((property) => {
            if (property.priceHistory && property.priceHistory.length > 0) {
                property.priceHistory.forEach((entry) => {
                    const year = new Date(entry.date).getFullYear()
                    years.add(year)
                })
            }
        })

        return Array.from(years).sort((a, b) => b - a) // Sort descending
    }

    const calculateMonthlyOverview = (data: RestackResaleProperty[], year: number): MonthlyData[] => {
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
                const [acresData, magicBricksData, acnData, myGateData, housingData] = await Promise.all([
                    get99AcresResaleData(),
                    getMagicBricksResaleData(),
                    getACNResaleData(),
                    getMyGateResaleData(),
                    getHousingResaleData(),
                ])

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
                setLastDataUpdated(
                    formatUnixDate(Number(acresData?.[0]?.lastModified)) || formatUnixDate(Date.now() / 1000),
                )
                setOverviewData(newOverviewData)
            } catch (error) {
                console.error('Error fetching resale data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOverviewData()
    }, [selectedYear])

    const handleResaleTypeSelect = (type: string) => {
        navigate(`/restack/resale/${type}`)
    }

    const handleYearChange = (year: number) => {
        setSelectedYear(year)
    }

    const renderSourceSection = (sourceName: string, displayName: string) => {
        const data = overviewData[sourceName]

        if (!data || data.length === 0) {
            return null
        }

        return (
            <div key={sourceName} className='bg-white rounded-lg shadow-sm border border-gray-200 mb-8'>
                <div className='px-6 py-4 border-b border-gray-200 flex justify-between'>
                    <h2 className='text-xl font-semibold text-gray-900'>{displayName}</h2>
                    <button
                        onClick={() => handleResaleTypeSelect(sourceName)}
                        className='bg-black text-white w-35 text-xs font-medium px-3 py-1 rounded transition-colors hover:bg-gray-800'
                    >
                        View Inventories
                    </button>
                </div>
                <div className='p-6'>
                    <FlexibleTable
                        data={data}
                        columns={[
                            { key: 'month', header: 'Month' },
                            { key: 'totalProperties', header: 'Total Inventory' },
                            { key: 'availableUnits', header: 'Available Units' },
                            { key: 'soldOutUnits', header: 'Sold Out Units' },
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
                        <h1 className='text-3xl font-bold text-gray-900'>Resale Inventory Overview </h1>

                        {/* Year Filter */}
                        <div className='flex items-center gap-4'>
                            <h3 className='text-sm font-bold text-gray-900'> last Updated : {lastDataUpdataed}</h3>
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

export default Resale
