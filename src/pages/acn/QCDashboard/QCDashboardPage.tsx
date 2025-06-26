'use client'

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import useAuth from '../../../hooks/useAuth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../firebase'
import { useDispatch, useSelector } from 'react-redux'
import { prefetchKamNameMappings } from '../../../services/acn/qc/qcService'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import MetricsCards from '../../../components/design-elements/MetricCards'
import {
    searchInventory,
    getInventoryFacets,
    type InventorySearchParams,
    type InventorySearchResponse,
    getTotalProjectsByStage,
} from '../../../services/acn/qc/algoliaQcInventoryService'
import resetic from '/icons/acn/rotate-left.svg'
import verifyIcon from '/icons/acn/verify.svg'
import { toCapitalizedWords } from '../../../components/helper/toCapitalize'
import type { IQCInventory } from '../../../data_types/acn/types'
import MultiSelectDropdown from '../../../components/design-elements/MultiSelectDropdown'
import CustomPagination from '../../../components/design-elements/CustomPagination'

// Define types locally with proper type safety
export type QCReviewStatus = 'pending' | 'approved' | 'duplicate' | 'primary' | 'reject'
type TabType = 'kam' | 'data' | 'notApproved'

const QCDashboardPage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const ITEMS_PER_PAGE = 50

    // Get prefetched kamNameMappings from Redux store
    const { kamNameMappings } = useSelector((state: any) => state.qc)

    // User data state
    const [currentUserKamId, setCurrentUserKamId] = useState<string>('all')
    const [currentUserKamName, setCurrentUserKamName] = useState<string>('')

    const [activeTab, setActiveTab] = useState<TabType>('kam')
    const [searchValue, setSearchValue] = useState('')
    const [selectedSort, setSelectedSort] = useState('')
    const [currentPage, setCurrentPage] = useState(0) // Algolia uses 0-based pagination
    const [qcData, setQcData] = useState<IQCInventory[]>([])
    const [loading, setLoading] = useState(false)
    // const [totalHits, setTotalHits] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [facets, setFacets] = useState<Record<string, { value: string; count: number }[]>>({})
    const [_, setKamCounts] = useState({ kam: 0, data: 0, notApproved: 0 })
    const [selectedKAM, setSelectedKAM] = useState<string[]>([])
    const [selectedAssetType, setSelectedAssetType] = useState<string[]>(['all'])
    // const [selectedStage, setSelectedStage] = useState<string[]>(['all'])
    const [selectedKamStatus, setSelectedKamStatus] = useState<string[]>(['all'])

    const [stageCounts, setStageCounts] = useState<Record<string, number>>({})

    // Fetch current user's kamId and kamName
    const fetchCurrentUserData = async () => {
        if (!user?.uid) return

        try {
            const docRef = doc(db, 'internal-agents', user.uid)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const userData = docSnap.data()
                const kamId = userData?.acn?.kamId
                const kamName = userData?.name || user.displayName || 'Unknown'

                if (kamId) {
                    setCurrentUserKamId(kamId)
                    setCurrentUserKamName(kamName)
                    setSelectedKAM([kamId]) // Set default selection to current user's kamId
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        }
    }

    const fetchStageCounts = async () => {
        try {
            const counts = await getTotalProjectsByStage()
            setStageCounts(counts)
        } catch (error) {
            console.error('Error fetching stage counts:', error)
            setStageCounts({})
        }
    }

    // Enhanced data transformation with proper nested structure handling
    const transformAlgoliaData = (hits: any[]): IQCInventory[] => {
        return hits.map((hit, index) => ({
            propertyId: hit.propertyId || hit.objectID || `QC${index.toString().padStart(4, '0')}`,
            propertyName: hit.propertyName || hit.project_name || 'N/A',
            unitNo: hit.unitNo || 'N/A',
            path: hit.path || 'N/A',
            _geoloc: hit._geoloc || { lat: 0, lng: 0 },
            address: hit.address || 'N/A',
            area: hit.area || 'N/A',
            micromarket: hit.micromarket || hit.micro_market || 'N/A',
            mapLocation: hit.mapLocation || 'N/A',
            assetType: (hit.assetType || hit.asset_type || 'apartment') as
                | 'villa'
                | 'apartment'
                | 'plot'
                | 'commercial'
                | 'warehouse'
                | 'office',
            unitType: (hit.unitType || '1 bhk') as '1 bhk' | '2 bhk' | '3 bhk' | '4 bhk' | '5+ bhk',
            subType: hit.subType || 'N/A',
            communityType: (hit.communityType || 'gated') as 'gated' | 'open' | 'independent',
            sbua: hit.sbua || hit.built_up_area || 0,
            carpet: hit.carpet || 0,
            plotSize: hit.plotSize || hit.plot_size || 0,
            uds: hit.uds || 0,
            structure: hit.structure || 0,
            buildingAge: hit.buildingAge || 0,
            floorNo: hit.floorNo || 0,
            exactFloor: hit.exactFloor || 0,
            facing: (hit.facing || 'north') as
                | 'north'
                | 'south'
                | 'east'
                | 'west'
                | 'northeast'
                | 'northwest'
                | 'southeast'
                | 'southwest',
            plotFacing: (hit.plotFacing || 'north') as 'north' | 'south' | 'east' | 'west',
            balconyFacing: (hit.balconyFacing || 'north') as 'north' | 'south' | 'east' | 'west' | 'outside',
            noOfBalconies: hit.noOfBalconies || 'N/A',
            noOfBathrooms: hit.noOfBathrooms || 'N/A',
            carPark: hit.carPark || 0,
            cornerUnit: hit.cornerUnit || false,
            extraRoom: hit.extraRoom || [],
            furnishing: (hit.furnishing || 'unfurnished') as 'fullFurnished' | 'semiFurnished' | 'unfurnished',
            totalAskPrice: hit.totalAskPrice || 0,
            askPricePerSqft: hit.askPricePerSqft || 0,
            priceHistory: hit.priceHistory || [],
            rentalIncome: hit.rentalIncome || 0,
            status: hit.status,
            currentStatus: (hit.currentStatus || 'ready to move') as
                | 'ready to move'
                | 'under construction'
                | 'new launch',
            exclusive: hit.exclusive || false,
            tenanted: hit.tenanted || false,
            eKhata: hit.eKhata || false,
            buildingKhata: hit.buildingKhata || 'N/A',
            landKhata: hit.landKhata || 'N/A',
            ocReceived: hit.ocReceived || false,
            bdaApproved: hit.bdaApproved || false,
            biappaApproved: hit.biappaApproved || false,
            stage: hit.stage || 'data',
            qcStatus: (hit.qcStatus || 'duplicate') as 'approved' | 'pending' | 'rejected' | 'duplicate' | 'primary',
            qcReview: {
                type: hit.qcReview?.type || hit.type || 'duplicate',
                rejectedFields: hit.qcReview?.rejectedFields || [],
                qcNote: hit.qcReview?.qcNote || hit.qcNote || '',
                originalPropertyId: hit.qcReview?.originalPropertyId || hit.originalPropertyId || '',
                kamReview: {
                    status: hit.qcReview?.kamReview?.status || 'approved',
                    reviewedBy: hit.qcReview?.kamReview?.reviewedBy || hit.kamName || 'N/A',
                    reviewDate: hit.qcReview?.kamReview?.reviewDate || 0,
                    comments: hit.qcReview?.kamReview?.comments || '',
                },
                dataReview: {
                    status: hit.qcReview?.dataReview?.status || 'duplicate',
                    reviewedBy: hit.qcReview?.dataReview?.reviewedBy || 'N/A',
                    reviewDate: hit.qcReview?.dataReview?.reviewDate || 0,
                    comments: hit.qcReview?.dataReview?.comments || '',
                },
            },
            kamStatus: (hit.kamStatus || 'approved') as 'approved' | 'pending' | 'rejected',
            cpId: hit.cpId || hit.agent_name || 'N/A',
            cpPhone: hit.cpPhone || '',
            kamName: hit.kamName || hit.kam_name || 'N/A',
            kamId: hit.kamId || 'N/A',
            handoverDate: hit.handoverDate || 0,
            photo: hit.photo || [],
            video: hit.video || [],
            document: hit.document || [],
            driveLink: hit.driveLink || 'N/A',
            noOfEnquiries: hit.noOfEnquiries || 0,
            dateOfInventoryAdded: hit.dateOfInventoryAdded || 0,
            lastModified: hit.lastModified || 0,
            dateOfStatusLastChecked: hit.dateOfStatusLastChecked || 0,
            ageOfInventory: hit.ageOfInventory || 0,
            ageOfStatus: hit.ageOfStatus || 0,
            qcHistory: hit.qcHistory || [],
            extraDetails: hit.extraDetails || 'N/A',
            __position2: hit.__position2 || 0,
            _highlightResult: hit._highlightResult || {},
            notes: hit.notes,
            price: hit.price,
            pricePerSqft: hit.pricePerSqft,
            city: hit.city,
            state: hit.state,
        }))
    }

    // Get stage filters based on active tab - updated to match data structure
    const getStageFilters = (): string[] => {
        switch (activeTab) {
            case 'kam':
                return ['kam']
            case 'data':
                return ['data'] // Updated to match your data structure
            case 'notApproved':
                return ['notApproved']
            default:
                return ['kam']
        }
    }

    // Fetch QC data with enhanced error handling
    const fetchQCData = async () => {
        setLoading(true)
        try {
            const searchParams: InventorySearchParams = {
                query: searchValue,
                filters: {
                    kamId: selectedKAM.includes('all') ? undefined : selectedKAM,
                    stage: getStageFilters(),
                    assetType: selectedAssetType.includes('all') ? undefined : selectedAssetType,
                    kamStatus: selectedKamStatus.includes('all') ? undefined : selectedKamStatus,
                },
                page: currentPage,
                hitsPerPage: ITEMS_PER_PAGE,
                sortBy: selectedSort,
            }

            const response: InventorySearchResponse = await searchInventory(searchParams)
            const transformedData = transformAlgoliaData(response.hits)
            setQcData(transformedData)
            // setTotalHits(response.nbHits)
            setTotalPages(response.nbPages)
        } catch (error) {
            console.error('Error fetching QC data from Algolia:', error)
            setQcData([])
            // setTotalHits(0)
            setTotalPages(0)
        } finally {
            setLoading(false)
        }
    }

    // Fetch tab counts with proper stage filtering
    const fetchTabCounts = async () => {
        try {
            const kamFilter = selectedKAM.includes('all') ? undefined : selectedKAM

            const [kamResponse, dataResponse, notApprovedResponse] = await Promise.all([
                searchInventory({
                    query: '',
                    filters: {
                        kamId: kamFilter,
                        stage: ['kam'],
                    },
                    hitsPerPage: 0,
                }),
                searchInventory({
                    query: '',
                    filters: {
                        kamId: kamFilter,
                        stage: ['data'],
                    },
                    hitsPerPage: 0,
                }),
                searchInventory({
                    query: '',
                    filters: {
                        kamId: kamFilter,
                        stage: ['notApproved'],
                    },
                    hitsPerPage: 0,
                }),
            ])

            setKamCounts({
                kam: kamResponse.nbHits,
                data: dataResponse.nbHits,
                notApproved: notApprovedResponse.nbHits,
            })
        } catch (error) {
            console.error('Error fetching tab counts:', error)
            setKamCounts({
                kam: 0,
                data: 0,
                notApproved: 0,
            })
        }
    }

    // Fetch facets for dropdown options
    const fetchFacets = async () => {
        try {
            const facetsData = await getInventoryFacets()
            console.log('filter data', facetsData)
            setFacets(facetsData)
        } catch (error) {
            console.error('Error fetching facets:', error)
        }
    }

    // Effect hooks for data fetching
    useEffect(() => {
        fetchCurrentUserData()
        fetchTabCounts()
        fetchFacets()
        fetchStageCounts()
        // Dispatch prefetch kamNameMappings
        dispatch(prefetchKamNameMappings() as any)
    }, [user, dispatch])

    // Effect to fetch user data when user changes
    useEffect(() => {
        if (user) {
            fetchCurrentUserData()
        }
    }, [user])

    useEffect(() => {
        fetchQCData()
    }, [activeTab, searchValue, selectedKAM, selectedSort, selectedAssetType, currentPage])

    useEffect(() => {
        setCurrentPage(0)
    }, [activeTab, searchValue, selectedKAM, selectedSort, selectedAssetType])

    // Create a comprehensive mapping from kamId to kamName
    const kamIdToNameMap = useMemo(() => {
        const map = new Map<string, string>()

        // Add prefetched mappings first (highest priority)
        Object.entries(kamNameMappings).forEach(([kamId, kamName]) => {
            if (kamId && kamId !== 'N/A' && kamName && kamName !== 'N/A') {
                map.set(kamId, kamName as string)
            }
        })

        // Add current user's mapping (override if available)
        if (currentUserKamId && currentUserKamId !== 'all' && currentUserKamName) {
            map.set(currentUserKamId, currentUserKamName)
        }

        // Add mappings from current data (lowest priority)
        qcData.forEach((item) => {
            if (item.kamId && item.kamId !== 'N/A' && item.kamName && item.kamName !== 'N/A') {
                map.set(item.kamId, item.kamName)
            }
        })

        return map
    }, [kamNameMappings, qcData, currentUserKamId, currentUserKamName])

    // Generate dropdown options from facets with kamName in labels
    const kamOptions = [
        { label: 'All KAMs', value: 'all' },
        ...(facets.kamId || []).map((facet) => {
            const kamName = kamIdToNameMap.get(facet.value) || `KAM ${facet.value}`
            return {
                label: `${kamName} (${facet.count})`,
                value: facet.value, // Keep kamId as value for filtering
            }
        }),
    ]

    const assetTypeOptions = [
        { label: 'All Asset Types', value: 'all' },
        ...(facets.assetType || []).map((facet) => ({
            label: `${facet.value} (${facet.count})`,
            value: facet.value.toLowerCase(),
        })),
    ]

    // const kamStatusOptions = [
    //     { label: 'All Statuses', value: 'all' },
    //     ...(facets.kamStatus || []).map((facet) => ({
    //         label: `${facet.value} (${facet.count})`,
    //         value: facet.value,
    //     })),
    // ]

    const sortOptions = [
        { label: 'Sort by Date', value: '' },
        { label: 'Newest First', value: 'date_desc' },
        { label: 'Oldest First', value: 'date_asc' },
        { label: 'Price High to Low', value: 'price_desc' },
        { label: 'Price Low to High', value: 'price_asc' },
        { label: 'Recently Updated', value: 'updated_desc' },
    ]

    // Enhanced StatusBadge component with proper null handling
    const StatusBadge = ({ status }: { status: QCReviewStatus | undefined }) => {
        const getStatusColors = () => {
            switch (status) {
                case 'approved':
                    return 'bg-green-100 text-green-800 border-green-200'
                case 'duplicate':
                    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
                case 'primary':
                    return 'bg-blue-100 text-blue-800 border-blue-200'
                case 'reject':
                    return 'bg-red-100 text-red-800 border-red-200'
                case 'pending':
                    return 'bg-gray-100 text-gray-800 border-gray-200'
                default:
                    return 'bg-gray-100 text-gray-800 border-gray-200'
            }
        }

        const getDisplayText = () => {
            if (!status) return 'N/A'
            return status.charAt(0).toUpperCase() + status.slice(1)
        }

        return (
            <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap ${getStatusColors()}`}
            >
                {getDisplayText()}
            </span>
        )
    }

    // const handleKamSelection = (value: string) => {
    //     if (value === 'all') {
    //         setSelectedKAM(['all'])
    //     } else {
    //         setSelectedKAM((prev) => {
    //             const filtered = prev.filter((v) => v !== 'all')
    //             if (filtered.includes(value)) {
    //                 const newSelection = filtered.filter((v) => v !== value)
    //                 return newSelection.length === 0 ? ['all'] : newSelection
    //             } else {
    //                 return [...filtered, value]
    //             }
    //         })
    //     }
    // }

    // const handleAssetTypeSelection = (value: string) => {
    //     if (value === 'all') {
    //         setSelectedAssetType(['all'])
    //     } else {
    //         setSelectedAssetType((prev) => {
    //             const filtered = prev.filter((v) => v !== 'all')
    //             if (filtered.includes(value)) {
    //                 const newSelection = filtered.filter((v) => v !== value)
    //                 return newSelection.length === 0 ? ['all'] : newSelection
    //             } else {
    //                 return [...filtered, value]
    //             }
    //         })
    //     }
    // }

    // Base columns for kam and data tabs
    const getBaseColumns = (): TableColumn[] => [
        {
            key: 'propertyId',
            header: 'QC ID',
            render: (value) => <span className='whitespace-nowrap text-sm font-semibold w-auto'>{value}</span>,
        },
        {
            key: 'propertyName',
            header: 'Project Name/Location',
            render: (value) => <span className='whitespace-nowrap text-sm font-semibold w-auto'>{value}</span>,
        },
        {
            key: 'kamId',
            header: 'Kam',
            render: (value) => <span className='whitespace-nowrap text-sm font-semibold w-auto'>{value}</span>,
        },
        {
            key: 'assetType',
            header: 'Asset type',
            render: (value) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>
                    {toCapitalizedWords(value)}
                </span>
            ),
        },
        {
            key: 'cpId',
            header: 'Agent',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'cpPhone',
            header: 'Phone Number',
            render: (value) => (
                <span className='whitespace-nowrap text-gray-600 text-sm font-normal w-auto'>{value}</span>
            ),
        },
        {
            key: 'sbua',
            header: 'SBUA',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'plotSize',
            header: 'Plot Size',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'totalAskPrice',
            header: 'Price',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'micromarket',
            header: 'Micromarket',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        {
            key: 'actions',
            header: 'Action',
            fixed: true,
            fixedPosition: 'right',
            render: (_, row) => (
                <div className='flex items-center gap-1 whitespace-nowrap w-auto'>
                    <button
                        className='h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0'
                        onClick={() => {
                            navigate(`/acn/qc/${row.propertyId}/details`)
                        }}
                    >
                        <img src={verifyIcon} alt='Verify Icon' className='w-7 h-7 flex-shrink-0' />
                    </button>
                </div>
            ),
        },
    ]

    // Enhanced columns for not approved tab with proper nested data access
    const getNotApprovedColumns = (): TableColumn[] => [
        ...getBaseColumns().slice(0, -2),
        {
            key: 'qcReview.kamReview',
            header: 'Kam Review',
            render: (_, row) => {
                const kamStatus = row.status || row.kamStatus || 'pending'
                return (
                    <div className='whitespace-nowrap w-auto'>
                        <StatusBadge status={kamStatus as QCReviewStatus} />
                    </div>
                )
            },
        },
        {
            key: 'qcReview',
            header: 'Reviewed By',
            render: (_, row) => {
                const reviewedBy = row.qcReview?.kamReview?.reviewedBy || row.kamName || 'N/A'
                return <span className='whitespace-nowrap text-sm font-normal w-auto'>{reviewedBy}</span>
            },
        },
        {
            key: 'micromarket',
            header: 'Micromarket',
            render: (value) => <span className='whitespace-nowrap text-sm font-normal w-auto'>{value}</span>,
        },
        getBaseColumns()[getBaseColumns().length - 1],
    ]

    const getColumns = (): TableColumn[] => {
        if (activeTab === 'notApproved') {
            return getNotApprovedColumns()
        }
        return getBaseColumns()
    }

    // Calculate metrics from current data
    const QCMetrics = [
        { label: 'Kam QC Pending', value: stageCounts.kam },
        { label: 'Data QC Pending', value: stageCounts.data },
    ]

    useEffect(() => {
        fetchQCData()
    }, [activeTab, searchValue, selectedKAM, selectedSort, selectedAssetType, selectedKamStatus, currentPage])

    useEffect(() => {
        setCurrentPage(0)
    }, [activeTab, searchValue, selectedKAM, selectedSort, selectedAssetType, selectedKamStatus])

    useEffect(() => {
        fetchTabCounts()
    }, [selectedKAM]) // Add this to update counts when KAM filter changes

    return (
        <Layout loading={loading}>
            <div className='w-full overflow-hidden font-sans h-screen flex flex-col'>
                <div
                    className='flex flex-col gap-4 pt-2 px-6 bg-white flex-1 overflow-hidden'
                    style={{ width: 'calc(100vw)', maxWidth: '100%' }}
                >
                    {/* Header */}
                    <div className='flex-shrink-0'>
                        <div className='flex items-center justify-between mb-2'>
                            <h1 className='text-lg font-semibold text-black'>QC Dashboard</h1>
                            <div className='flex items-center gap-4'>
                                <div className='w-80'>
                                    <StateBaseTextField
                                        leftIcon={
                                            <svg
                                                className='w-4 h-4 text-gray-400'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                                />
                                            </svg>
                                        }
                                        placeholder='Search'
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className='h-8'
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className='border-gray-200 mb-4' />

                        {/* Metrics Cards */}
                        <MetricsCards metrics={QCMetrics} className='mb-2' />

                        {/* Filters */}
                        <div className='flex items-center gap-2 mb-2'>
                            <button
                                className='p-1 text-gray-500 border-gray-300 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors'
                                onClick={() => {
                                    setSearchValue('')
                                    setSelectedKAM(
                                        currentUserKamId && currentUserKamId !== 'all' ? [currentUserKamId] : ['all'],
                                    )
                                    setSelectedSort('')
                                    setSelectedAssetType(['all'])
                                    setSelectedKamStatus(['all'])
                                    setCurrentPage(0)
                                }}
                                title='Reset Filters'
                            >
                                <img src={resetic} alt='Reset Filters' className='w-5 h-5' />
                            </button>

                            {/* Tab Selection with counts */}
                            <div className='flex items-center bg-gray-100 rounded-md p-1 h-8'>
                                <button
                                    onClick={() => setActiveTab('kam')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'kam'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Kam Review
                                </button>
                                <button
                                    onClick={() => setActiveTab('data')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'data'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Data Review
                                </button>
                                <button
                                    onClick={() => setActiveTab('notApproved')}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                        activeTab === 'notApproved'
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Not Approved
                                </button>
                            </div>

                            <MultiSelectDropdown
                                options={kamOptions}
                                selectedValues={selectedKAM}
                                onSelectionChange={setSelectedKAM}
                                placeholder='All KAMs'
                                displaySelected={(selected) =>
                                    selected.includes('all')
                                        ? 'All KAMs'
                                        : selected.length === 1
                                          ? (() => {
                                                const kamId = selected[0]
                                                const kamName = kamIdToNameMap.get(kamId) || `KAM ${kamId}`
                                                return kamName
                                            })()
                                          : `${selected.length} KAMs`
                                }
                                className='relative inline-block min-w-[120px]'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer h-8'
                            />

                            <MultiSelectDropdown
                                options={assetTypeOptions}
                                selectedValues={selectedAssetType}
                                onSelectionChange={setSelectedAssetType}
                                placeholder='All Types'
                                displaySelected={(selected) =>
                                    selected.includes('all')
                                        ? 'All Types'
                                        : selected.length === 1
                                          ? assetTypeOptions.find((opt) => opt.value === selected[0])?.label ||
                                            selected[0]
                                          : `${selected.length} Types`
                                }
                                className='relative inline-block min-w-[120px]'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer h-8'
                            />

                            <Dropdown
                                options={sortOptions}
                                onSelect={setSelectedSort}
                                defaultValue={selectedSort}
                                placeholder='Sort By'
                                className='relative inline-block'
                                triggerClassName='flex items-center justify-between px-3 py-1 border-gray-300 rounded-md bg-gray-100 text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] cursor-pointer'
                                menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                                optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                            />
                        </div>
                    </div>

                    {/* Table Container - This will take remaining space */}
                    <div className='flex-1 flex flex-col gap-[29px] overflow-hidden'>
                        {/* Table */}
                        <div className='bg-white rounded-lg overflow-hidden flex-1'>
                            <div className='h-full overflow-hidden'>
                                <FlexibleTable
                                    data={qcData}
                                    columns={getColumns()}
                                    hoverable={true}
                                    borders={{
                                        table: false,
                                        header: true,
                                        rows: true,
                                        cells: false,
                                        outer: false,
                                    }}
                                    maxHeight='100%'
                                    className='rounded-lg h-full'
                                    stickyHeader={true}
                                />
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className='flex items-center justify-center flex-shrink-0'>
                            <CustomPagination
                                currentPage={currentPage + 1}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page - 1)}
                                className=''
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default QCDashboardPage
