import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { updatePrimaryProperty, fetchPrimaryPropertyById } from '../../../store/actions/restack/primaryProperties'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import { useDispatch } from 'react-redux'
import type { AppDispatch, RootState } from '../../../store'
import { useSelector } from 'react-redux'
import { clearCurrentProperty } from '../../../store/reducers/acn/propertiesReducers'
import type {
    ApartmentConfig,
    PlotConfig,
    PrimaryProperty,
    VillaConfig,
} from '../../../data_types/restack/restack-primary'

const apartmentTypes = [
    { label: 'Simplex', value: 'simplex' },
    { label: 'Duplex', value: 'duplex' },
    { label: 'Triplex', value: 'triplex' },
    { label: 'Penthouse', value: 'penthouse' },
]

const villaTypes = [
    { label: 'UDS', value: 'uds' },
    { label: 'Plot', value: 'plot' },
]

// // Floor plan image component
// const FloorPlanImage = ({ imageUrl, size = 'small' }: { imageUrl: string; size?: 'small' | 'large' }) => {
//     const sizeClasses = size === 'small' ? 'w-10 h-10' : 'w-16 h-16'

//     return (
//         <div className={`${sizeClasses} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
//             {imageUrl ? (
//                 <img
//                     src={imageUrl}
//                     alt='Floor Plan'
//                     className='w-full h-full object-cover'
//                     onError={(e) => {
//                         e.currentTarget.style.display = 'none'
//                         e.currentTarget.nextElementSibling?.classList.remove('hidden')
//                     }}
//                 />
//             ) : null}
//             <div className={`${imageUrl ? 'hidden' : ''} text-xs text-gray-500 text-center`}>No Image</div>
//         </div>
//     )
// }

const TypologyPage = () => {
    const { id } = useParams<{ id: string }>()
    const dispatch = useDispatch<AppDispatch>()

    const [projectDetails, setProjectDetails] = useState<PrimaryProperty | null>(null)
    const [activeTab, setActiveTab] = useState<'apartment' | 'villa' | 'plot'>('apartment')
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [, setIsAddingRow] = useState(false)

    const { currentProperty, loading } = useSelector((state: RootState) => state.primaryProperties)

    useEffect(() => {
        if (id) {
            dispatch(fetchPrimaryPropertyById(id))
        }

        return () => {
            dispatch(clearCurrentProperty())
        }
    }, [id, dispatch])

    useEffect(() => {
        if (currentProperty) {
            setProjectDetails({
                ...currentProperty,
                apartments: currentProperty.apartments || [],
                villas: currentProperty.villas || [],
                plots: currentProperty.plots || [],
            })
        }
    }, [currentProperty, loading])

    const updateDataRow = (dataType: 'apartment' | 'villa' | 'plot', rowId: string, field: string, value: string) => {
        if (!projectDetails) return

        let fieldName: keyof PrimaryProperty
        let dataRows: any[]

        switch (dataType) {
            case 'apartment':
                fieldName = 'apartments'
                dataRows = (projectDetails?.apartments as ApartmentConfig[]) || []
                break
            case 'villa':
                fieldName = 'villas'
                dataRows = (projectDetails?.villas as VillaConfig[]) || []
                break
            case 'plot':
                fieldName = 'plots'
                dataRows = (projectDetails?.plots as PlotConfig[]) || []
                break
            default:
                return
        }

        const updatedDataRows = dataRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))

        setProjectDetails((prev) => {
            if (!prev) return null
            return {
                ...prev,
                [fieldName as keyof PrimaryProperty]: updatedDataRows,
            }
        })

        if (projectDetails.projectId) {
            dispatch(
                updatePrimaryProperty({
                    projectId: projectDetails.projectId,
                    updates: { [fieldName]: updatedDataRows },
                }),
            )
        }
    }

    const addNewUnit = (unitType: 'apartment' | 'villa' | 'plot') => {
        if (!projectDetails) return

        const newId = `${unitType}_${Date.now()}`
        let newUnit: ApartmentConfig | VillaConfig | PlotConfig

        switch (unitType) {
            case 'apartment':
                newUnit = {
                    id: newId,
                    aptType: 'Simplex',
                    typology: '',
                    superBuiltUpArea: 0,
                    carpetArea: 0,
                    currentPricePerSqft: 0,
                    totalPrice: 0,
                    floorPlan: '',
                } as ApartmentConfig
                break
            case 'villa':
                newUnit = {
                    id: newId,
                    villaType: 'UDS',
                    typology: '2 BHK',
                    plotSize: 0,
                    builtUpArea: 0,
                    carpetArea: 0,
                    currentPricePerSqft: 0,
                    totalPrice: 0,
                    uds: '',
                    udsPercentage: 0,
                    udsArea: 0,
                    numberOfFloors: 0,
                    floorPlan: '',
                } as VillaConfig
                break
            case 'plot':
                newUnit = {
                    id: newId,
                    plotType: '',
                    plotArea: 0,
                    currentPricePerSqft: 0,
                    totalPrice: 0,
                } as PlotConfig
                break
        }

        const fieldName = `${unitType}s` as keyof PrimaryProperty
        const units = ((projectDetails[fieldName as keyof PrimaryProperty] as any) || []) as any[]

        setProjectDetails((prev) => (prev ? { ...prev, [fieldName]: [...units, newUnit] } : null))
        setIsAddingRow(true)
        setEditingRowId(newId)
    }

    const deleteUnit = (unitType: 'apartment' | 'villa' | 'plot', unitId: string) => {
        if (!projectDetails) return

        const fieldName = `${unitType}s` as keyof PrimaryProperty
        const units = ((projectDetails[fieldName as keyof PrimaryProperty] as any) || []) as any[]
        const updatedUnits = units.filter((unit: any) => unit.id !== unitId)

        setProjectDetails((prev) => (prev ? { ...prev, [fieldName]: updatedUnits } : null))
        setEditingRowId(null)
        setIsAddingRow(false)

        // Dispatch updatePrimaryProperty to persist changes to Firebase
        if (projectDetails.projectId) {
            dispatch(
                updatePrimaryProperty({ projectId: projectDetails.projectId, updates: { [fieldName]: updatedUnits } }),
            )
        }
    }

    const handleEditRow = (rowId: string) => {
        setEditingRowId(rowId)
    }

    const handleSaveRow = () => {
        setEditingRowId(null)
        setIsAddingRow(false)
    }

    const handleCancelEdit = () => {
        setEditingRowId(null)
        setIsAddingRow(false)
    }

    const renderTableCell = (
        value: string | number | null,
        row: any,
        field: string,
        dataType: 'apartment' | 'villa' | 'plot',
        options?: { label: string; value: string }[],
    ) => {
        const isEditing = editingRowId === row.id

        if (isEditing) {
            if (field === 'aptType' || field === 'villaType') {
                return (
                    <Dropdown
                        options={options || []}
                        defaultValue={value ? String(value) : ''}
                        onSelect={(selectedValue) => updateDataRow(dataType, row.id, field, selectedValue)}
                        placeholder='Select Type'
                        triggerClassName='flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full cursor-pointer'
                        menuClassName='absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg'
                        optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md'
                    />
                )
            } else if (field === 'floorPlan' && dataType !== 'plot') {
                return (
                    <StateBaseTextField
                        value={value ? String(value) : ''}
                        onChange={(e) => updateDataRow(dataType, row.id, field, e.target.value)}
                        placeholder='Enter URL'
                        type='url'
                    />
                )
            } else {
                return (
                    <StateBaseTextField
                        value={value ? String(value) : ''}
                        onChange={(e) => updateDataRow(dataType, row.id, field, e.target.value)}
                        placeholder='Enter value'
                    />
                )
            }
        } else {
            // Not editing
            return value === null || value === undefined || value === '' ? '' : String(value)
        }
    }

    const getApartmentColumns = (): TableColumn[] => [
        {
            key: 'aptType',
            header: 'Apartment Type',
            render: (_: any, row) => renderTableCell(row.aptType, row, 'aptType', 'apartment', apartmentTypes),
        },
        {
            key: 'typology',
            header: 'Typology',
            render: (_: any, row) => renderTableCell(row.typology, row, 'typology', 'apartment'),
        },
        {
            key: 'superBuiltUpArea',
            header: 'Super Built-Up Area',
            render: (_: any, row) => renderTableCell(row.superBuiltUpArea, row, 'superBuiltUpArea', 'apartment'),
        },
        {
            key: 'carpetArea',
            header: 'Carpet Area',
            render: (_: any, row) => renderTableCell(row.carpetArea, row, 'carpetArea', 'apartment'),
        },
        {
            key: 'currentPricePerSqft',
            header: 'Price Per Sq.ft',
            render: (_: any, row) => renderTableCell(row.currentPricePerSqft, row, 'currentPricePerSqft', 'apartment'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (_: any, row) => renderTableCell(row.totalPrice, row, 'totalPrice', 'apartment'),
        },
        {
            key: 'floorPlan',
            header: 'Floor Plan',
            render: (_: any, row) => renderTableCell(row.floorPlan, row, 'floorPlan', 'apartment'),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_: any, row) => (
                <div className='flex gap-2'>
                    {editingRowId === row.id ? (
                        <>
                            <Button
                                bgColor='bg-gray-500'
                                textColor='text-white'
                                borderColor='border-gray-500'
                                className='!h-[28px] !w-[unset] px-3 text-sm'
                                onClick={handleSaveRow}
                            >
                                Save
                            </Button>
                            <Button
                                bgColor='bg-white'
                                textColor='text-gray-500'
                                borderColor='border-gray-300'
                                className='!h-[28px] !w-[unset] px-3 text-sm'
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                bgColor='bg-white'
                                textColor='text-gray-500'
                                borderColor='border-gray-300'
                                className='!h-[28px] !w-[unset] px-3 text-sm'
                                onClick={() => handleEditRow(row.id)}
                            >
                                Edit
                            </Button>
                            <Button
                                bgColor='bg-white'
                                textColor='text-red-500'
                                borderColor='border-red-500'
                                className='!h-[28px] !w-[unset] px-3 text-sm hover:!bg-red-50 hover:!text-red-600'
                                onClick={() => deleteUnit('apartment', row.id)}
                            >
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ]

    const getVillaColumns = (): TableColumn[] => [
        {
            key: 'villaType',
            header: 'Villa Type',
            render: (_: any, row) => renderTableCell(row.villaType, row, 'villaType', 'villa', villaTypes),
        },
        {
            key: 'typology',
            header: 'Typology',
            render: (_: any, row) => renderTableCell(row.typology, row, 'typology', 'villa'),
        },
        {
            key: 'plotSize',
            header: 'Plot Size',
            render: (_: any, row) => renderTableCell(row.plotSize, row, 'plotSize', 'villa'),
        },
        {
            key: 'builtUpArea',
            header: 'Built-Up Area',
            render: (_: any, row) => renderTableCell(row.builtUpArea, row, 'builtUpArea', 'villa'),
        },
        {
            key: 'carpetArea',
            header: 'Carpet Area',
            render: (_: any, row) => renderTableCell(row.carpetArea, row, 'carpetArea', 'villa'),
        },
        {
            key: 'currentPricePerSqft',
            header: 'Price Per Sq.ft',
            // Fixed: Changed 'pricePerSqft' to 'currentPricePerSqft'
            render: (_: any, row) => renderTableCell(row.currentPricePerSqft, row, 'currentPricePerSqft', 'villa'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (_: any, row) => renderTableCell(row.totalPrice, row, 'totalPrice', 'villa'),
        },
        {
            key: 'uds',
            header: 'UDS',
            render: (_: any, row) => renderTableCell(row.uds, row, 'uds', 'villa'),
        },
        {
            key: 'udsPercentage',
            header: 'UDS Percentage',
            render: (_: any, row) => renderTableCell(row.udsPercentage, row, 'udsPercentage', 'villa'),
        },
        {
            key: 'udsArea',
            header: 'UDS Area',
            render: (_: any, row) => renderTableCell(row.udsArea, row, 'udsArea', 'villa'),
        },
        {
            key: 'numberOfFloors',
            header: 'No. of Floors',
            // Fixed: Changed 'noOfFloors' to 'numberOfFloors'
            render: (_: any, row) => renderTableCell(row.numberOfFloors, row, 'numberOfFloors', 'villa'),
        },
        {
            key: 'floorPlan',
            header: 'Floor Plan',
            render: (_: any, row) => renderTableCell(row.floorPlan, row, 'floorPlan', 'villa'),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_: any, row) => (
                <div className='flex gap-2'>
                    {editingRowId === row.id ? (
                        <>
                            <Button
                                bgColor='bg-gray-500'
                                textColor='text-white'
                                borderColor='border-gray-500'
                                className='!h-[28px] !w-[unset] px-3 text-sm'
                                onClick={handleSaveRow}
                            >
                                Save
                            </Button>
                            <Button
                                bgColor='bg-white'
                                textColor='text-gray-500'
                                borderColor='border-gray-300'
                                className='!h-[28px] !w-[unset] px-3 text-sm'
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                bgColor='bg-white'
                                textColor='text-gray-500'
                                borderColor='border-gray-300'
                                className='!h-[28px] !w-[unset] px-3 text-sm'
                                onClick={() => handleEditRow(row.id)}
                            >
                                Edit
                            </Button>
                            <Button
                                bgColor='bg-white'
                                textColor='text-red-500'
                                borderColor='border-red-500'
                                className='!h-[28px] !w-[unset] px-3 text-sm hover:!bg-red-50 hover:!text-red-600'
                                onClick={() => deleteUnit('villa', row.id)}
                            >
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ]

    const getPlotColumns = (): TableColumn[] => [
        {
            key: 'plotType',
            header: 'Plot Type',
            render: (_: any, row) => renderTableCell(row.plotType, row, 'plotType', 'plot'),
        },
        {
            key: 'plotArea',
            header: 'Plot Area',
            render: (_: any, row) => renderTableCell(row.plotArea, row, 'plotArea', 'plot'),
        },
        {
            key: 'currentPricePerSqft',
            header: 'Price Per Sq.ft',
            // Fixed: Changed 'pricePerSqft' to 'currentPricePerSqft'
            render: (_: any, row) => renderTableCell(row.currentPricePerSqft, row, 'currentPricePerSqft', 'plot'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (_: any, row) => renderTableCell(row.totalPrice, row, 'totalPrice', 'plot'),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_: any, row) => (
                <div className='flex gap-2'>
                    {editingRowId === row.id ? (
                        <>
                            <Button
                                bgColor='bg-gray-500'
                                textColor='text-white'
                                borderColor='border-gray-500'
                                className='!h-[28px] !w-[unset] px-3 text-sm'
                                onClick={handleSaveRow}
                            >
                                Save
                            </Button>
                            <Button
                                bgColor='bg-white'
                                textColor='text-gray-500'
                                borderColor='border-gray-300'
                                className='!h-[28px] !w-[unset] px-3 text-sm'
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                bgColor='bg-white'
                                textColor='text-gray-500'
                                borderColor='border-gray-300'
                                className='!h-[28px] !w-[unset] px-3 text-sm'
                                onClick={() => handleEditRow(row.id)}
                            >
                                Edit
                            </Button>
                            <Button
                                bgColor='bg-white'
                                textColor='text-red-500'
                                borderColor='border-red-500'
                                className='!h-[28px] !w-[unset] px-3 text-sm hover:!bg-red-50 hover:!text-red-600'
                                onClick={() => deleteUnit('plot', row.id)}
                            >
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ]

    if (loading) {
        return (
            <Layout loading={loading}>
                <div className='flex h-full items-center justify-center'>Loading Typology & Unit Plan...</div>
            </Layout>
        )
    }

    if (!projectDetails) {
        return (
            <Layout loading={loading}>
                <div className='flex h-full items-center justify-center text-red-500'>
                    Error: Project details not found.
                </div>
            </Layout>
        )
    }

    return (
        <Layout loading={loading}>
            <div className='p-8'>
                <div className='text-sm text-gray-500 mb-4'>
                    <a href='/restack/primary' className='hover:text-gray-700'>
                        Primary
                    </a>
                    <span className='mx-2'>/</span>
                    <a href={id ? `/restack/primary/${id}` : '/restack/primary'} className='hover:text-gray-700'>
                        {id || 'Project Details'}
                    </a>
                    <span className='mx-2'>/</span>
                    <span className='text-black font-medium'>Typology & Unit Plan</span>
                </div>

                <div className='flex items-center justify-between mb-4'>
                    <h1 className='text-2xl font-bold'>Typology & Unit Plan</h1>
                    <div className='flex gap-4'>
                        <Button
                            bgColor={'bg-white'}
                            textColor={activeTab === 'apartment' ? 'text-gray-900 font-bold' : 'text-gray-700'}
                            borderColor={'border-transparent'}
                            className={
                                'py-2 px-4 border-b-2 ' +
                                (activeTab === 'apartment' ? 'border-blue-500' : 'border-transparent')
                            }
                            onClick={() => setActiveTab('apartment')}
                        >
                            Apartment
                        </Button>
                        <Button
                            bgColor={'bg-white'}
                            textColor={activeTab === 'villa' ? 'text-gray-900 font-bold' : 'text-gray-700'}
                            borderColor={'border-transparent'}
                            className={
                                'py-2 px-4 border-b-2 ' +
                                (activeTab === 'villa' ? 'border-blue-500' : 'border-transparent')
                            }
                            onClick={() => setActiveTab('villa')}
                        >
                            Villa
                        </Button>
                        <Button
                            bgColor={'bg-white'}
                            textColor={activeTab === 'plot' ? 'text-gray-900 font-bold' : 'text-gray-700'}
                            borderColor={'border-transparent'}
                            className={
                                'py-2 px-4 border-b-2 ' +
                                (activeTab === 'plot' ? 'border-blue-500' : 'border-transparent')
                            }
                            onClick={() => setActiveTab('plot')}
                        >
                            Plot
                        </Button>
                    </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-md mb-6'>
                    <h2 className='text-xl font-semibold mb-4'>
                        {activeTab === 'apartment' && 'Apartment Units'}
                        {activeTab === 'villa' && 'Villa Units'}
                        {activeTab === 'plot' && 'Plot Units'}
                    </h2>
                    <FlexibleTable
                        columns={
                            activeTab === 'apartment'
                                ? getApartmentColumns()
                                : activeTab === 'villa'
                                  ? getVillaColumns()
                                  : getPlotColumns()
                        }
                        data={
                            activeTab === 'apartment'
                                ? projectDetails?.apartments || []
                                : activeTab === 'villa'
                                  ? projectDetails?.villas || []
                                  : activeTab === 'plot'
                                    ? projectDetails?.plots || []
                                    : []
                        }
                    />
                    <Button
                        bgColor='bg-white'
                        textColor='text-gray-700'
                        borderColor='border-gray-300'
                        className='!h-[28px] !w-[unset] px-3 text-sm mt-4'
                        onClick={() => addNewUnit(activeTab)}
                    >
                        Add New {activeTab === 'apartment' ? 'Apartment' : activeTab === 'villa' ? 'Villa' : 'Plot'}
                        Unit
                    </Button>
                </div>
            </div>
        </Layout>
    )
}

export default TypologyPage
