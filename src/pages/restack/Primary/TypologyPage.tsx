import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../../layout/Layout'
import { FlexibleTable, type TableColumn } from '../../../components/design-elements/FlexibleTable'
import Dropdown from '../../../components/design-elements/Dropdown'
import Button from '../../../components/design-elements/Button'
import StateBaseTextField from '../../../components/design-elements/StateBaseTextField'
import {
    generateCompleteProjectDetails,
    type CompleteProjectDetails,
    apartmentTypologies,
    villaTypologies,
    plotTypes,
    type ApartmentUnit,
    type VillaUnit,
    type PlotUnit,
    sampleFloorPlans,
    type FloorPlan,
} from '../../../pages/dummy_data/restack_primary_details_dummy_data'

// Floor plan image component
const FloorPlanImage = ({ imageUrl, size = 'small' }: { imageUrl: string; size?: 'small' | 'large' }) => {
    const sizeClasses = size === 'small' ? 'w-10 h-10' : 'w-16 h-16'

    return (
        <div className={`${sizeClasses} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt='Floor Plan'
                    className='w-full h-full object-cover'
                    onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                />
            ) : null}
            <div className={`${imageUrl ? 'hidden' : ''} text-xs text-gray-500 text-center`}>No Image</div>
        </div>
    )
}

const TypologyPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    const [projectDetails, setProjectDetails] = useState<CompleteProjectDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'apartment' | 'villa' | 'plot'>('apartment')
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [isAddingRow, setIsAddingRow] = useState(false)

    useEffect(() => {
        const loadProjectDetails = async () => {
            try {
                setIsLoading(true)
                if (id) {
                    const details = generateCompleteProjectDetails(id)
                    setProjectDetails(details)
                    console.log('TypologyPage - id:', id)
                    console.log('TypologyPage - Loaded project details:', details)
                }
            } catch (error) {
                console.error('Error loading project details on TypologyPage:', error)
                const defaultProject = generateCompleteProjectDetails('P0001')
                setProjectDetails(defaultProject)
                console.log('TypologyPage - Falling back to default project:', defaultProject)
            } finally {
                setIsLoading(false)
            }
        }
        loadProjectDetails()
    }, [id])

    const updateDataRow = (dataType: 'apartment' | 'villa' | 'plot', rowId: string, field: string, value: string) => {
        if (!projectDetails) return

        let fieldName: keyof CompleteProjectDetails
        let dataRows: any[]

        switch (dataType) {
            case 'apartment':
                fieldName = 'apartmentUnits'
                dataRows = projectDetails[fieldName]
                break
            case 'villa':
                fieldName = 'villaUnits'
                dataRows = projectDetails[fieldName]
                break
            case 'plot':
                fieldName = 'plotUnits'
                dataRows = projectDetails[fieldName]
                break
            default:
                return
        }

        const updatedDataRows = dataRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))

        setProjectDetails((prev) =>
            prev ? { ...prev, [fieldName as keyof CompleteProjectDetails]: updatedDataRows } : null,
        )
    }

    const addNewUnit = (unitType: 'apartment' | 'villa' | 'plot') => {
        if (!projectDetails) return

        const newId = `${unitType}_${Date.now()}`
        let newUnit: ApartmentUnit | VillaUnit | PlotUnit

        switch (unitType) {
            case 'apartment':
                newUnit = {
                    id: newId,
                    aptType: '',
                    typology: '',
                    superBuiltUpArea: '',
                    carpetArea: '',
                    pricePerSqft: '',
                    totalPrice: '',
                    floorPlan: '',
                }
                break
            case 'villa':
                newUnit = {
                    id: newId,
                    villaType: '',
                    typology: '',
                    plotSize: '',
                    builtUpArea: '',
                    carpetArea: '',
                    pricePerSqft: '',
                    totalPrice: '',
                    uds: '',
                    noOfFloors: '',
                    floorPlan: '',
                }
                break
            case 'plot':
                newUnit = {
                    id: newId,
                    plotType: '',
                    plotArea: '',
                    pricePerSqft: '',
                    totalPrice: '',
                }
                break
        }

        const fieldName = `${unitType}Units` as keyof CompleteProjectDetails
        const units = projectDetails[fieldName] as any[]

        setProjectDetails((prev) => (prev ? { ...prev, [fieldName]: [...units, newUnit] } : null))
        setIsAddingRow(true)
        setEditingRowId(newId)
    }

    const deleteUnit = (unitType: 'apartment' | 'villa' | 'plot', unitId: string) => {
        if (!projectDetails) return

        const fieldName = `${unitType}Units` as keyof CompleteProjectDetails
        const units = projectDetails[fieldName] as any[]
        const updatedUnits = units.filter((unit) => unit.id !== unitId)

        setProjectDetails((prev) => (prev ? { ...prev, [fieldName]: updatedUnits } : null))
        setEditingRowId(null)
        setIsAddingRow(false)
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
            if (field === 'typology' || field === 'aptType' || field === 'villaType' || field === 'plotType') {
                return (
                    <Dropdown
                        options={options || []}
                        defaultValue={value ? String(value) : ''}
                        onSelect={(selectedValue) => updateDataRow(dataType, row.id, field, selectedValue)}
                        placeholder='Select'
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
            if (field === 'floorPlan' && value) {
                const floorPlanId = String(value)
                const floorPlanImage: FloorPlan | undefined = sampleFloorPlans.find((fp) => fp.id === floorPlanId)
                if (floorPlanImage) {
                    return <FloorPlanImage imageUrl={floorPlanImage.url} />
                }
            }
            return value === null || value === undefined || value === '' ? '' : String(value)
        }
    }

    const getApartmentColumns = (): TableColumn[] => [
        {
            key: 'aptType',
            header: 'Apartment Type',
            render: (value, row) =>
                renderTableCell(
                    row.aptType,
                    row,
                    'aptType',
                    'apartment',
                    apartmentTypologies.map((item) => ({ label: item.name, value: item.typology })),
                ),
        },
        {
            key: 'typology',
            header: 'Typology',
            render: (value, row) =>
                renderTableCell(
                    row.typology,
                    row,
                    'typology',
                    'apartment',
                    apartmentTypologies.map((item) => ({ label: item.name, value: item.typology })),
                ),
        },
        {
            key: 'superBuiltUpArea',
            header: 'Super Built-Up Area',
            render: (value, row) => renderTableCell(row.superBuiltUpArea, row, 'superBuiltUpArea', 'apartment'),
        },
        {
            key: 'carpetArea',
            header: 'Carpet Area',
            render: (value, row) => renderTableCell(row.carpetArea, row, 'carpetArea', 'apartment'),
        },
        {
            key: 'pricePerSqft',
            header: 'Price Per Sq.ft',
            render: (value, row) => renderTableCell(row.pricePerSqft, row, 'pricePerSqft', 'apartment'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (value, row) => renderTableCell(row.totalPrice, row, 'totalPrice', 'apartment'),
        },
        {
            key: 'floorPlan',
            header: 'Floor Plan',
            render: (value, row) => renderTableCell(row.floorPlan, row, 'floorPlan', 'apartment'),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (value, row) => (
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
            render: (value, row) =>
                renderTableCell(
                    row.villaType,
                    row,
                    'villaType',
                    'villa',
                    villaTypologies.map((item) => ({ label: item.name, value: item.typology })),
                ),
        },
        {
            key: 'typology',
            header: 'Typology',
            render: (value, row) =>
                renderTableCell(
                    row.typology,
                    row,
                    'typology',
                    'villa',
                    villaTypologies.map((item) => ({ label: item.name, value: item.typology })),
                ),
        },
        {
            key: 'plotSize',
            header: 'Plot Size',
            render: (value, row) => renderTableCell(row.plotSize, row, 'plotSize', 'villa'),
        },
        {
            key: 'builtUpArea',
            header: 'Built-Up Area',
            render: (value, row) => renderTableCell(row.builtUpArea, row, 'builtUpArea', 'villa'),
        },
        {
            key: 'carpetArea',
            header: 'Carpet Area',
            render: (value, row) => renderTableCell(row.carpetArea, row, 'carpetArea', 'villa'),
        },
        {
            key: 'pricePerSqft',
            header: 'Price Per Sq.ft',
            render: (value, row) => renderTableCell(row.pricePerSqft, row, 'pricePerSqft', 'villa'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (value, row) => renderTableCell(row.totalPrice, row, 'totalPrice', 'villa'),
        },
        {
            key: 'uds',
            header: 'UDS',
            render: (value, row) => renderTableCell(row.uds, row, 'uds', 'villa'),
        },
        {
            key: 'noOfFloors',
            header: 'No. of Floors',
            render: (value, row) => renderTableCell(row.noOfFloors, row, 'noOfFloors', 'villa'),
        },
        {
            key: 'floorPlan',
            header: 'Floor Plan',
            render: (value, row) => renderTableCell(row.floorPlan, row, 'floorPlan', 'villa'),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (value, row) => (
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
            render: (value, row) =>
                renderTableCell(
                    row.plotType,
                    row,
                    'plotType',
                    'plot',
                    plotTypes.map((item) => ({ label: item.type, value: item.type })),
                ),
        },
        {
            key: 'plotArea',
            header: 'Plot Area',
            render: (value, row) => renderTableCell(row.plotArea, row, 'plotArea', 'plot'),
        },
        {
            key: 'pricePerSqft',
            header: 'Price Per Sq.ft',
            render: (value, row) => renderTableCell(row.pricePerSqft, row, 'pricePerSqft', 'plot'),
        },
        {
            key: 'totalPrice',
            header: 'Total Price',
            render: (value, row) => renderTableCell(row.totalPrice, row, 'totalPrice', 'plot'),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (value, row) => (
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

    if (isLoading) {
        return (
            <Layout loading={isLoading}>
                <div className='flex h-full items-center justify-center'>Loading Typology & Unit Plan...</div>
            </Layout>
        )
    }

    if (!projectDetails) {
        return (
            <Layout loading={isLoading}>
                <div className='flex h-full items-center justify-center text-red-500'>
                    Error: Project details not found.
                </div>
            </Layout>
        )
    }

    return (
        <Layout loading={isLoading}>
            <div className='pt-8'>
                <div className='text-sm text-gray-500 mb-4'>
                    <a href='/restack/prelaunch' className='hover:text-gray-700'>
                        Projects
                    </a>
                    <span className='mx-2'>/</span>
                    <a href='/restack/primary' className='hover:text-gray-700'>
                        Configurations
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
                                ? projectDetails.apartmentUnits
                                : activeTab === 'villa'
                                  ? projectDetails.villaUnits
                                  : projectDetails.plotUnits
                        }
                    />
                    <Button
                        bgColor='bg-white'
                        textColor='text-gray-700'
                        borderColor='border-gray-300'
                        className='!h-[28px] !w-[unset] px-3 text-sm mt-4'
                        onClick={() => addNewUnit(activeTab)}
                    >
                        Add New {activeTab === 'apartment' ? 'Apartment' : activeTab === 'villa' ? 'Villa' : 'Plot'}{' '}
                        Unit
                    </Button>
                </div>
            </div>
        </Layout>
    )
}

export default TypologyPage
