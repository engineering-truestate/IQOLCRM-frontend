'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../../../layout/Layout'
import Button from '../../../../components/design-elements/Button'
import { FlexibleTable, type TableColumn } from '../../../../components/design-elements/FlexibleTable'
import StateBaseTextField from '../../../../components/design-elements/StateBaseTextField'
import Dropdown from '../../../../components/design-elements/Dropdown'
import usePreRera from '../../../../hooks/restack/usePreRera'
import type { PreReraProperty } from '../../../../store/reducers/restack/preReraTypes'
import { formatUnixDate } from '../../../../components/helper/getUnixDateTime'

const PreReraProjectDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = useState<PreReraProperty | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [, setOriginalDetails] = useState<PreReraProperty | null>(null)
    // const [isEditingProjectOverview, setIsEditingProjectOverview] = useState(false)
    // const [isEditingProjectLocation, setIsEditingProjectLocation] = useState(false)
    // const [isEditingProjectTimeline, setIsEditingProjectTimeline] = useState(false)
    const [isEditingProjectConfiguration] = useState(false)
    // const [isEditingProjectResources, setIsEditingProjectResources] = useState(false)
    const [isEditingAmenities] = useState(false)
    // const [isEditingDeveloperDetails, setIsEditingDeveloperDetails] = useState(false)
    // const [isEditingKhataDetails, setIsEditingKhataDetails] = useState(false)
    const [editingTowerRowId] = useState<string | null>(null)
    // const [isAddingTowerRow, setIsAddingTowerRow] = useState(false)

    const { getPropertyById, loading, error } = usePreRera()

    useEffect(() => {
        const fetchProjectById = async () => {
            if (!id) {
                setFetchError('No project ID provided')
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setFetchError(null)

                const result = await getPropertyById(id)

                if (result.payload && typeof result.payload === 'object' && 'projectId' in result.payload) {
                    setProject(result.payload as PreReraProperty)
                    setOriginalDetails(result.payload as PreReraProperty)
                } else {
                    setFetchError('Property not found')
                }
            } catch (err) {
                console.error('Error fetching project:', err)
                setFetchError(err instanceof Error ? err.message : 'Failed to fetch project')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProjectById()
    }, [id, getPropertyById])

    // Helper function to update project fields
    const updateField = (field: string, value: string) => {
        if (!project) return
        setProject({
            ...project,
            [field]: value,
        })
    }

    // // Generic handle edit for sections
    // const handleEditSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    //     setter(true)
    // }

    // // Generic handle cancel for sections
    // const handleCancelSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    //     if (originalDetails) {
    //         setProject(originalDetails)
    //     }
    //     setter(false)
    //     setEditingTowerRowId(null)
    //     setIsAddingTowerRow(false)
    // }

    // // Generic handle save for sections
    // const handleSaveSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    //     if (project) {
    //         setOriginalDetails(project)
    //         setter(false)
    //         setEditingTowerRowId(null)
    //         setIsAddingTowerRow(false)
    //     }
    // }

    // Handle tower data updates
    const updateTowerData = (rowId: string, field: string, value: string) => {
        if (!project?.TowerDetails) return

        const updatedTowers = project.TowerDetails.map((tower) =>
            tower.id === rowId ? { ...tower, [field]: value } : tower,
        )

        setProject({
            ...project,
            TowerDetails: updatedTowers,
        })
    }

    // Add new tower row
    // const addTowerRow = () => {
    //     if (!project) return

    //     const newTower: TowerDetail = {
    //         name: towerName,
    //         floors: Number(towerFloors),
    //         name: '',
    //         floors: '',
    //     }

    //     const currentTowers = project.TowerDetails || []
    //     setProject({
    //         ...project,
    //         TowerDetails: [...currentTowers, newTower],
    //     })

    //     setEditingTowerRowId(newId)
    //     setIsAddingTowerRow(true)
    // }

    // // Delete tower row
    // const deleteTowerRow = (rowId: string) => {
    //     if (!project?.TowerDetails) return
    //     setProject({
    //         ...project,
    //         TowerDetails: project.TowerDetails.filter((tower) => tower.id !== rowId),
    //     })
    // }

    // Helper for rendering info rows
    const renderInfoRow = (
        label1: string,
        value1: string | undefined,
        label2: string,
        value2: string | undefined,
        fieldKey1?: string,
        fieldKey2?: string,
        options1?: { label: string; value: string }[],
        options2?: { label: string; value: string }[],
        type1: 'text' | 'date' | 'link' = 'text',
        type2: 'text' | 'date' | 'link' = 'text',
        onClick1?: () => void,
        onClick2?: () => void,
        classNameOverride?: string,
        isSectionEditable: boolean = false,
    ) => {
        const renderField = (
            label: string,
            value: string | undefined,
            fieldKey: string | undefined,
            options?: { label: string; value: string }[],
            type: 'text' | 'date' | 'link' = 'text',
            onClick?: () => void,
        ) => {
            const displayValue = value || ''
            return (
                <div
                    className={`flex flex-col gap-1 border-t border-solid border-t-[#d4dbe2] py-4 ${classNameOverride?.includes('pr-') ? '' : 'pr-2'}`}
                >
                    <p className='text-[#5c738a] text-sm font-normal leading-normal'>{label}</p>
                    {isSectionEditable && fieldKey ? (
                        options ? (
                            <Dropdown
                                options={options}
                                defaultValue={value || ''}
                                onSelect={(optionValue: string) => updateField(fieldKey, optionValue)}
                                className='w-full'
                                optionClassName='text-base'
                            />
                        ) : type === 'date' ? (
                            <StateBaseTextField
                                type='date'
                                value={value || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    updateField(fieldKey, e.target.value)
                                }
                                className='h-9 text-base'
                            />
                        ) : (
                            <StateBaseTextField
                                value={value || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    updateField(fieldKey, e.target.value)
                                }
                                className='h-9 text-base'
                            />
                        )
                    ) : type === 'link' &&
                      value &&
                      onClick &&
                      (value.startsWith('http') ||
                          (value.startsWith('/') && !onClick.toString().includes('navigate'))) ? (
                        <a
                            href={value}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 underline text-sm font-medium leading-normal'
                            onClick={onClick}
                        >
                            {displayValue}
                        </a>
                    ) : type === 'link' && onClick ? (
                        <button
                            onClick={onClick}
                            className='text-blue-600 underline text-sm font-medium leading-normal text-left cursor-pointer'
                        >
                            {displayValue}
                        </button>
                    ) : (
                        <p className='text-[#101418] text-sm font-normal leading-normal'>{displayValue}</p>
                    )}
                </div>
            )
        }

        return (
            <>
                <div
                    className={`${classNameOverride && classNameOverride.includes('col-span-2') ? classNameOverride : ''}`}
                >
                    {renderField(label1, value1, fieldKey1, options1, type1, onClick1)}
                </div>
                {!classNameOverride?.includes('col-span-2') && (
                    <div className={'pl-2'}>{renderField(label2, value2, fieldKey2, options2, type2, onClick2)}</div>
                )}
            </>
        )
    }

    // Render table cell for tower details
    const renderTableCell = (
        value: string | number | null,
        row: Record<string, any>,
        field: string,
        type: 'text' | 'number' = 'text',
        isRowEditable: boolean = false,
    ) => {
        const uniqueKey = `${row.id}-${field}`

        if (isEditingProjectConfiguration && isRowEditable) {
            return (
                <StateBaseTextField
                    key={uniqueKey}
                    id={uniqueKey}
                    name={field}
                    value={value !== null ? String(value) : ''}
                    onChange={(e) => updateTowerData(row.id, field, e.target.value)}
                    type={type === 'number' ? 'number' : 'text'}
                    className='w-full text-sm font-normal text-gray-700 leading-tight border-b border-gray-300 focus:border-blue-500 focus:outline-none py-1'
                />
            )
        }

        if (isEditingProjectConfiguration && editingTowerRowId === row.id) {
            return (
                <StateBaseTextField
                    type={type === 'number' ? 'number' : 'text'}
                    value={value !== null ? value.toString() : ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateTowerData(row.id, field, e.target.value)
                    }
                    className='h-9 text-sm'
                />
            )
        } else {
            return <span className='whitespace-nowrap text-sm text-gray-600'>{value !== null ? value : ''}</span>
        }
    }

    // Tower Details Table Configuration
    const getTowerColumns = (): TableColumn[] => [
        {
            key: 'name',
            header: 'Tower',
            render: (value: any, row: any) =>
                renderTableCell(value || `Tower ${row.index + 1}`, row, 'name', 'text', editingTowerRowId === row.id),
        },
        {
            key: 'floors',
            header: 'Floors per Tower',
            render: (value: any, row: any) =>
                renderTableCell(value || '', row, 'floors', 'text', editingTowerRowId === row.id),
        },
    ]

    // Project Summary Table Configuration
    const summaryColumns: TableColumn[] = [
        {
            key: 'sizes',
            header: 'Sizes',
            render: (value) => <span className='text-sm text-gray-700'>{value || 'N/A'}</span>,
        },
        {
            key: 'projectSize',
            header: 'Project Size',
            render: (value) => <span className='text-sm text-gray-700'>{value || 'N/A'}</span>,
        },
        {
            key: 'launchDate',
            header: 'Launch Date',
            render: (value) => <span className='text-sm text-gray-700'>{value ? formatUnixDate(value) : '---'}</span>,
        },
        {
            key: 'possessionStarts',
            header: 'Possession Starts',
            render: (value) => <span className='text-sm text-gray-700'>{value || 'N/A'}</span>,
        },
        {
            key: 'configurations',
            header: 'Configurations',
            render: (value) => <span className='text-sm text-gray-700'>{value || 'N/A'}</span>,
        },
        {
            key: 'reraId',
            header: 'RERA ID',
            render: (value) => <span className='text-sm text-gray-700'>{value || 'N/A'}</span>,
        },
    ]

    // Show loading state
    if (isLoading || loading) {
        return (
            <Layout loading={true}>
                <div className='flex items-center justify-center h-64'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                        <p className='text-gray-600'>Loading project details...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    // Show error state
    if (fetchError || error || !project) {
        return (
            <Layout loading={false}>
                <div className='flex items-center justify-center h-64'>
                    <div className='text-center'>
                        <h2 className='text-xl font-semibold text-gray-900 mb-2'>Project Not Found</h2>
                        <p className='text-gray-600 mb-4'>
                            {fetchError || error || 'The requested project could not be found.'}
                        </p>
                        <Button bgColor='bg-blue-600' textColor='text-white' onClick={() => navigate('/restack/stock')}>
                            Back to Stock
                        </Button>
                    </div>
                </div>
            </Layout>
        )
    }

    const summaryData = [project]
    const towerData = project.TowerDetails?.map((tower, index) => ({ ...tower, index })) || []

    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen' style={{ width: 'calc(100vw)', maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='mb-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <div>
                                <h1 className='text-2xl font-semibold text-gray-900'>{project.projectName}</h1>
                                <p className='text-sm text-gray-500 mt-1'>
                                    <button
                                        onClick={() => navigate('/restack/stock/pre-rera')}
                                        className='text-gray-500 hover:text-gray-700 cursor-pointer'
                                    >
                                        Pre-rera
                                    </button>
                                    <span> / </span>
                                    <span>{id}</span>
                                </p>
                            </div>
                            <Button
                                bgColor='bg-gray-100'
                                textColor='text-gray-700'
                                className='px-4 py-2 hover:bg-gray-200'
                                onClick={() => navigate(`/restack/stock/pre-rera/${id}/edit`)}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>

                    {/* Project Overview */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Project Overview</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Project Name',
                            project.projectName,
                            'Project Type',
                            project.projectType,
                            'projectName',
                            'projectType',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            false,
                        )}
                    </div>

                    {/* Project Summary Table */}
                    <div className='bg-white rounded-lg overflow-hidden mb-6'>
                        <FlexibleTable
                            data={summaryData}
                            columns={summaryColumns}
                            hoverable={false}
                            borders={{
                                table: true,
                                header: true,
                                rows: false,
                                cells: false,
                                outer: true,
                            }}
                            className='rounded-lg'
                        />
                    </div>

                    {/* Description */}
                    {project.description && (
                        <div className='mb-6'>
                            <p className='text-gray-700 leading-relaxed text-sm'>{project.description}</p>
                        </div>
                    )}

                    {/* Project Images */}
                    {project.images && project.images.length > 0 && (
                        <div className='mb-8'>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4'>
                                {project.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Project image ${index + 1}`}
                                        className='max-w-full max-h-full object-contain rounded-2xl'
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Project Location */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Project Location</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Address',
                            project.address,
                            'District',
                            project.district,
                            'address',
                            'district',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            false,
                        )}
                        {renderInfoRow(
                            'Micromarket',
                            project.micromarket,
                            'Zone',
                            project.zone,
                            'micromarket',
                            'zone',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            false,
                        )}
                        {renderInfoRow(
                            'Latitude',
                            String(project.lat),
                            'Longitude',
                            String(project?.long),
                            'lat',
                            'long',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            false,
                        )}
                    </div>

                    {/* Project Timeline */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Project Timeline</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Project Start Date',
                            project.startDate ? formatUnixDate(project.startDate) : undefined,
                            'Handover Date',
                            project.handoverDate ? formatUnixDate(project.handoverDate) : undefined,
                            'startDate',
                            'handoverDate',
                            undefined,
                            undefined,
                            'date',
                            'date',
                            undefined,
                            undefined,
                            undefined,
                            false,
                        )}
                        {renderInfoRow(
                            'Age of Building',
                            project.ageOfBuildinginYears ? `${project.ageOfBuildinginYears} years` : undefined,
                            '',
                            '',
                            'ageOfBuildinginYears',
                            undefined,
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            'col-span-2 pr-[50%]',
                            false,
                        )}
                    </div>

                    {/* Project Configuration */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Project Configuration</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Project Type',
                            project.projectType,
                            'Project Size',
                            project.projectSize,
                            'projectType',
                            'projectSize',
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            false,
                        )}
                        {renderInfoRow(
                            'Total Units',
                            String(project.totalUnits),
                            'Status',
                            project.status,
                            'totalUnits',
                            'status',
                            undefined,
                            [
                                { label: 'Active', value: 'active' },
                                { label: 'Completed', value: 'completed' },
                                { label: 'On Hold', value: 'on-hold' },
                                { label: 'Sold Out', value: 'sold-out' },
                            ],
                            'text',
                            'text',
                            undefined,
                            undefined,
                            undefined,
                            false,
                        )}
                    </div>

                    {/* Tower Details Table */}
                    {project.TowerDetails && project.TowerDetails.length > 0 && (
                        <div className='px-4'>
                            <FlexibleTable
                                data={towerData}
                                columns={getTowerColumns()}
                                hoverable={true}
                                borders={{
                                    table: true,
                                    header: true,
                                    rows: true,
                                    cells: false,
                                    outer: true,
                                }}
                                className='rounded-lg bg-gray-50'
                            />
                        </div>
                    )}

                    {/* Project Resources */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Project Resources</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Brochure',
                            project?.brochureURL?.[0] ? 'PDF Link' : 'Not available',
                            'Master Plan',
                            project?.masterPlanURL?.[0] ? 'View' : 'Not available',
                            'brochureURL',
                            'masterPlanURL',
                            undefined,
                            undefined,
                            'link',
                            'link',
                            () => window.open(project?.brochureURL?.[0] || '', '_blank'),
                            () => window.open(project?.masterPlanURL?.[0] || '', '_blank'),
                            undefined,
                            false,
                        )}
                        {renderInfoRow(
                            'Units and Floor Plan',
                            project?.unitandfloorURL?.[0] ? 'View' : 'Not available',
                            '',
                            '',
                            'unitandfloorURL',
                            undefined,
                            undefined,
                            undefined,
                            'link',
                            'text',
                            () => window.open(project?.unitandfloorURL?.[0] || '', '_blank'),
                            undefined,
                            'col-span-2 pr-[50%]',
                            false,
                        )}
                    </div>

                    {/* Amenities */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Amenities</h2>
                    {isEditingAmenities ? (
                        <div className='flex flex-wrap gap-3 p-3 pr-4'>
                            <textarea
                                value={project?.amenities?.join(', ')}
                                onChange={(e) =>
                                    setProject({
                                        ...project,
                                        amenities: e.target.value.split(',').map((s) => s.trim()),
                                    })
                                }
                                className='w-full h-auto text-base border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='Enter amenities separated by commas'
                                rows={3}
                            />
                        </div>
                    ) : (
                        <div className='flex flex-wrap gap-3 p-3 pr-4'>
                            {project?.amenities?.map((amenity: string, index: number) => (
                                <div
                                    key={index}
                                    className='flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#e9edf1] pl-4 pr-4'
                                >
                                    <p className='text-[#101419] text-sm font-medium leading-normal'>{amenity}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Developer Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Developer Details</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Developer Name',
                            project.developerName,
                            '',
                            '',
                            'developerName',
                            undefined,
                            undefined,
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            'col-span-2 pr-[50%]',
                            false,
                        )}
                    </div>

                    {/* Khata Details */}
                    <h2 className='text-xl font-semibold text-gray-900 px-4 pb-3 pt-5'>Khata Details</h2>
                    <div className='p-4 grid grid-cols-2'>
                        {renderInfoRow(
                            'Khata Type',
                            project.khataType,
                            '',
                            '',
                            'khataType',
                            undefined,
                            [
                                { label: 'A', value: 'A' },
                                { label: 'B', value: 'B' },
                            ],
                            undefined,
                            'text',
                            'text',
                            undefined,
                            undefined,
                            'col-span-2 pr-[50%]',
                            false,
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PreReraProjectDetails
