'use client'

import type React from 'react'
import { useState, useRef, useEffect } from 'react'

export interface DropdownOption {
    label: string
    value: string
    onClick?: () => void
    color?: string // New: color for the option
    textColor?: string // New: optional text color override
}

export interface TableAction {
    icon: React.ReactNode
    label: string
    onClick: (row: any) => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
}

export interface TableColumn {
    key: string
    header: string
    width?: string
    minWidth?: string
    fixed?: boolean // For sticky columns
    fixedPosition?: 'left' | 'right' // New: position of fixed column
    render?: (value: any, row: any) => React.ReactNode
    sortable?: boolean
    dropdown?: {
        options: DropdownOption[]
        placeholder?: string
        value?: string
        onChange?: (value: string, row: any) => void
    }
    checkbox?: {
        trueValue?: string // Value that represents checked state (default: "Yes")
        falseValue?: string // Value that represents unchecked state (default: "No")
        onChange?: (checked: boolean, row: any) => void
    }
}

export interface BorderConfig {
    table?: boolean
    header?: boolean
    rows?: boolean
    cells?: boolean
    outer?: boolean
    style?: 'solid' | 'dashed' | 'dotted'
    color?: string
    width?: 'thin' | 'medium' | 'thick'
}

export interface FlexibleTableProps {
    data: any[]
    columns: TableColumn[]
    showCheckboxes?: boolean
    selectedRows?: string[]
    onRowSelect?: (rowId: string, selected: boolean) => void
    onSelectAll?: (selected: boolean) => void
    actions?: TableAction[]
    className?: string
    rowClassName?: string
    headerClassName?: string
    cellClassName?: string
    emptyMessage?: string
    hoverable?: boolean
    striped?: boolean
    borders?: BorderConfig
    maxHeight?: string
    stickyHeader?: boolean
    verticalScroll?: boolean
}

// Custom Checkbox Component
const CustomCheckbox = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => {
    return (
        <button
            type='button'
            onClick={() => onChange(!checked)}
            className={`
        w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
        ${checked ? 'bg-white border-gray-300' : 'bg-white border-gray-300 hover:border-gray-400'}
      `}
        >
            {checked && (
                <svg className='w-4 h-4 text-black' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                    />
                </svg>
            )}
        </button>
    )
}

// Dropdown Component
const TableDropdown = ({
    options,
    value,
    placeholder = 'Select...',
    onChange,
    row,
}: {
    options: DropdownOption[]
    value?: string
    placeholder?: string
    onChange?: (value: string, row: any) => void
    row: any
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedOption = options.find((opt) => opt.value === value)

    const handleSelect = (option: DropdownOption) => {
        onChange?.(option.value, row)
        option.onClick?.()
        setIsOpen(false)
    }

    // Generate button styles based on selected option color
    const getButtonStyles = () => {
        if (!selectedOption?.color) {
            return {
                className:
                    'flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap',
                style: {},
            }
        }

        const bgColor = selectedOption.color
        return {
            className:
                'flex items-center justify-between w-full px-3 py-1 text-sm  rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 whitespace-nowrap font-semibold',
            style: {
                backgroundColor: bgColor,
                color: '#000000',
                borderColor: darkenColor(bgColor, 0.1),
            },
        }
    }

    // Helper function to determine if a color is light
    const isLightColor = (color: string): boolean => {
        // Convert hex to RGB and calculate brightness
        const hex = color.replace('#', '')
        const r = Number.parseInt(hex.substr(0, 2), 16)
        const g = Number.parseInt(hex.substr(2, 2), 16)
        const b = Number.parseInt(hex.substr(4, 2), 16)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000
        return brightness > 128
    }

    // Helper function to darken a color
    const darkenColor = (color: string, amount: number): string => {
        const hex = color.replace('#', '')
        const r = Math.max(0, Number.parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount))
        const g = Math.max(0, Number.parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount))
        const b = Math.max(0, Number.parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount))
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    const buttonConfig = getButtonStyles()

    return (
        <div className='relative' ref={dropdownRef}>
            <button
                type='button'
                className={buttonConfig.className}
                style={buttonConfig.style}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedOption ? '' : 'text-gray-500'}>{selectedOption?.label || placeholder}</span>
                <svg
                    className={`w-4 h-4 transition-transform ml-2 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
            </button>

            {isOpen && (
                <div className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'>
                    {options.map((option, index) => {
                        const optionStyles = option.color
                            ? {
                                  backgroundColor: option.color,
                                  color: option.textColor || (isLightColor(option.color) ? '#374151' : '#ffffff'),
                              }
                            : {}

                        return (
                            <button
                                key={index}
                                type='button'
                                className={`w-full px-3 py-2 text-sm text-center hover:opacity-80 focus:opacity-80 focus:outline-none first:rounded-t-md last:rounded-b-md transition-opacity duration-150 whitespace-nowrap ${
                                    !option.color ? 'hover:bg-gray-100 focus:bg-gray-100' : ''
                                }`}
                                style={optionStyles}
                                onClick={() => handleSelect(option)}
                            >
                                <div className='flex items-center gap-2'>
                                    {option.color && (
                                        <div
                                            className='w-3 h-3 rounded-full border border-gray-300 flex-shrink-0'
                                            style={{ backgroundColor: option.color }}
                                        />
                                    )}
                                    <span className='whitespace-nowrap'>{option.label}</span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export function FlexibleTable({
    data,
    columns,
    showCheckboxes = false,
    selectedRows = [],
    onRowSelect,
    onSelectAll,
    actions = [],
    className = '',
    rowClassName = '',
    headerClassName = '',
    cellClassName = '',
    emptyMessage = 'No data available',
    hoverable = true,
    striped = false,
    borders = {},
    maxHeight,
    stickyHeader = false,
    verticalScroll = false,
}: FlexibleTableProps) {
    const allSelected = data.length > 0 && selectedRows.length === data.length
    const someSelected = selectedRows.length > 0 && selectedRows.length < data.length

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelectAll?.(e.target.checked)
    }

    const handleRowSelect = (rowId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        onRowSelect?.(rowId, e.target.checked)
    }

    // Border styling
    const getBorderClasses = () => {
        const borderClasses = []

        if (borders.outer !== false) {
            const borderWidth = borders.width === 'thick' ? 'border-2' : borders.width === 'thin' ? 'border' : 'border'
            const borderColor = borders.color || 'border-gray-200'
            const borderStyle =
                borders.style === 'dashed' ? 'border-dashed' : borders.style === 'dotted' ? 'border-dotted' : ''
            borderClasses.push(borderWidth, borderColor, borderStyle)
        }

        return borderClasses.filter(Boolean).join(' ')
    }

    const getTableClasses = () => {
        const classes = ['w-full border-collapse']
        if (borders.table !== false) {
            classes.push('border-separate border-spacing-0')
        }
        return classes.join(' ')
    }

    const getCellBorderClasses = (isHeader = false) => {
        const classes = []

        if (borders.cells !== false) {
            classes.push('border-r border-gray-200 last:border-r-0')
        }

        if (isHeader && borders.header !== false) {
            classes.push('border-b-2 border-gray-300')
        } else if (!isHeader && borders.rows !== false) {
            classes.push('border-b border-gray-200')
        }

        return classes.join(' ')
    }

    // Enhanced fixed columns logic
    const leftFixedColumns = columns.filter((col) => col.fixed && col.fixedPosition !== 'right')
    const rightFixedColumns = columns.filter((col) => col.fixed && col.fixedPosition === 'right')
    const scrollableColumns = columns.filter((col) => !col.fixed)

    const hasLeftFixedColumns = leftFixedColumns.length > 0

    // Calculate column widths for positioning
    const getColumnWidth = (column: TableColumn) => {
        return Number.parseInt(column.minWidth || column.width || '150')
    }

    const containerStyle =
        maxHeight || verticalScroll
            ? {
                  maxHeight: maxHeight || (verticalScroll ? '400px' : undefined),
                  overflowY: 'auto' as const,
              }
            : {}

    return (
        <div className={`w-full ${getBorderClasses()} rounded-lg overflow-hidden ${className}`}>
            <div className='overflow-auto' style={containerStyle}>
                <table className={getTableClasses()}>
                    <thead className={stickyHeader ? 'sticky top-0 z-30 bg-[#FAFAFA] shadow-sm' : ''}>
                        <tr className={`${stickyHeader ? 'bg-white' : ''} ${headerClassName}`}>
                            {showCheckboxes && (
                                <th
                                    className={`w-12 px-4 py-2 text-center bg-[#FAFAFA] ${hasLeftFixedColumns ? 'sticky left-0 z-40' : ''} ${getCellBorderClasses(true)}`}
                                    style={hasLeftFixedColumns ? { boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)' } : {}}
                                >
                                    <input
                                        type='checkbox'
                                        className='h-4 w-4 rounded border-gray-300'
                                        checked={allSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = someSelected
                                        }}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}

                            {/* Left Fixed columns */}
                            {leftFixedColumns.map((column, index) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-2 whitespace-nowrap text-center text-sm font-medium text-black bg-[#FAFAFA] sticky z-20 ${getCellBorderClasses(true)} ${
                                        column.width ? `w-${column.width}` : ''
                                    } ${column.minWidth ? `min-w-${column.minWidth}` : ''}`}
                                    style={{
                                        left: showCheckboxes
                                            ? `${48 + leftFixedColumns.slice(0, index).reduce((acc, col) => acc + getColumnWidth(col), 0)}px`
                                            : `${leftFixedColumns.slice(0, index).reduce((acc, col) => acc + getColumnWidth(col), 0)}px`,
                                        boxShadow:
                                            index === leftFixedColumns.length - 1
                                                ? '2px 0 4px -2px rgba(0,0,0,0.1)'
                                                : 'none',
                                    }}
                                >
                                    {column.header}
                                </th>
                            ))}

                            {/* Scrollable columns */}
                            {scrollableColumns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-2 whitespace-nowrap text-center text-sm font-medium text-black bg-[#FAFAFA] ${getCellBorderClasses(true)} ${
                                        column.width ? `w-${column.width}` : ''
                                    } ${column.minWidth ? `min-w-${column.minWidth}` : ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}

                            {/* Right Fixed columns */}
                            {rightFixedColumns.map((column, index) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-2 text-center whitespace-nowrap text-sm font-medium text-black bg-[#FAFAFA] sticky z-20 border-l ${getCellBorderClasses(true)} ${
                                        column.width ? `w-${column.width}` : ''
                                    } ${column.minWidth ? `min-w-${column.minWidth}` : ''}`}
                                    style={{
                                        right: `${rightFixedColumns.slice(index + 1).reduce((acc, col) => acc + getColumnWidth(col), 0)}px`,
                                        boxShadow: index === 0 ? '-2px 0 4px -2px rgba(0,0,0,0.1)' : 'none',
                                    }}
                                >
                                    {column.header}
                                </th>
                            ))}

                            {actions.length > 0 && (
                                <th
                                    className={`w-32 px-4 py-2 text-center text-sm font-medium text-gray-600 bg-[#FAFAFA] ${getCellBorderClasses(true)}`}
                                >
                                    Action
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (showCheckboxes ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                                    className='p-8 text-center text-gray-500'
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => {
                                const isSelected = selectedRows.includes(row.id)
                                const rowClasses = [
                                    hoverable ? 'hover:bg-gray-90' : '',
                                    striped && index % 2 === 0 ? 'bg-gray-50' : '',
                                    rowClassName,
                                ]
                                    .filter(Boolean)
                                    .join(' ')

                                return (
                                    <tr key={row.id || index} className={rowClasses}>
                                        {showCheckboxes && (
                                            <td
                                                className={`py-2 px-4 text-center items-center mx-auto bg-white ${hasLeftFixedColumns ? 'sticky left-0 z-10' : ''} ${getCellBorderClasses()}`}
                                                style={
                                                    hasLeftFixedColumns
                                                        ? { boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)' }
                                                        : {}
                                                }
                                            >
                                                <input
                                                    type='checkbox'
                                                    className='h-4 w-4 rounded border-gray-300'
                                                    checked={isSelected}
                                                    onChange={(e) => handleRowSelect(row.id, e)}
                                                />
                                            </td>
                                        )}

                                        {/* Left Fixed columns */}
                                        {leftFixedColumns.map((column, colIndex) => (
                                            <td
                                                key={column.key}
                                                className={`py-2 px-4 text-sm text-center items-center mx-auto justify-center bg-white sticky z-10 ${getCellBorderClasses()} ${cellClassName}`}
                                                style={{
                                                    left: showCheckboxes
                                                        ? `${48 + leftFixedColumns.slice(0, colIndex).reduce((acc, col) => acc + getColumnWidth(col), 0)}px`
                                                        : `${leftFixedColumns.slice(0, colIndex).reduce((acc, col) => acc + getColumnWidth(col), 0)}px`,
                                                    boxShadow:
                                                        colIndex === leftFixedColumns.length - 1
                                                            ? '2px 0 4px -2px rgba(0,0,0,0.1)'
                                                            : 'none',
                                                }}
                                            >
                                                {column.checkbox ? (
                                                    <div className='flex items-center justify-center'>
                                                        <CustomCheckbox
                                                            checked={
                                                                row[column.key] === (column.checkbox.trueValue || 'Yes')
                                                            }
                                                            onChange={(checked) => {
                                                                column.checkbox!.onChange?.(checked, row)
                                                            }}
                                                        />
                                                    </div>
                                                ) : column.dropdown ? (
                                                    <div className='flex items-center justify-center'>
                                                        <TableDropdown
                                                            options={column.dropdown.options}
                                                            value={column.dropdown.value || row[column.key]}
                                                            placeholder={column.dropdown.placeholder}
                                                            onChange={column.dropdown.onChange}
                                                            row={row}
                                                        />
                                                    </div>
                                                ) : column.render ? (
                                                    column.render(row[column.key], row)
                                                ) : (
                                                    row[column.key]
                                                )}
                                            </td>
                                        ))}

                                        {/* Scrollable columns */}
                                        {scrollableColumns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={`py-2 px-4 text-center align-middle text-sm ${getCellBorderClasses()} ${cellClassName}`}
                                            >
                                                {column.checkbox ? (
                                                    <div className='flex items-center justify-center'>
                                                        <CustomCheckbox
                                                            checked={
                                                                row[column.key] === (column.checkbox.trueValue || 'Yes')
                                                            }
                                                            onChange={(checked) => {
                                                                column.checkbox!.onChange?.(checked, row)
                                                            }}
                                                        />
                                                    </div>
                                                ) : column.dropdown ? (
                                                    <div className=''>
                                                        <TableDropdown
                                                            options={column.dropdown.options}
                                                            value={column.dropdown.value || row[column.key]}
                                                            placeholder={column.dropdown.placeholder}
                                                            onChange={column.dropdown.onChange}
                                                            row={row}
                                                        />
                                                    </div>
                                                ) : column.render ? (
                                                    column.render(row[column.key], row)
                                                ) : (
                                                    row[column.key]
                                                )}
                                            </td>
                                        ))}

                                        {/* Right Fixed columns */}
                                        {rightFixedColumns.map((column, colIndex) => (
                                            <td
                                                key={column.key}
                                                className={`py-2 px-4 text-center item-center mx-auto justify-center text-sm bg-white sticky z-10 border-l ${getCellBorderClasses()} ${cellClassName}`}
                                                style={{
                                                    right: `${rightFixedColumns.slice(colIndex + 1).reduce((acc, col) => acc + getColumnWidth(col), 0)}px`,
                                                    boxShadow:
                                                        colIndex === 0 ? '-2px 0 4px -2px rgba(0,0,0,0.1)' : 'none',
                                                }}
                                            >
                                                {column.checkbox ? (
                                                    <div className='flex items-center justify-center'>
                                                        <CustomCheckbox
                                                            checked={
                                                                row[column.key] === (column.checkbox.trueValue || 'Yes')
                                                            }
                                                            onChange={(checked) => {
                                                                column.checkbox!.onChange?.(checked, row)
                                                            }}
                                                        />
                                                    </div>
                                                ) : column.dropdown ? (
                                                    <div className='flex items-center justify-center'>
                                                        <TableDropdown
                                                            options={column.dropdown.options}
                                                            value={column.dropdown.value || row[column.key]}
                                                            placeholder={column.dropdown.placeholder}
                                                            onChange={column.dropdown.onChange}
                                                            row={row}
                                                        />
                                                    </div>
                                                ) : column.render ? (
                                                    column.render(row[column.key], row)
                                                ) : (
                                                    row[column.key]
                                                )}
                                            </td>
                                        ))}

                                        {actions.length > 0 && (
                                            <td
                                                className={`py-2 px-4 text-center mx-auto item-center justify-center ${getCellBorderClasses()}`}
                                            >
                                                <div className='flex items-center gap-1'>
                                                    {actions.map((action, actionIndex) => {
                                                        const buttonClasses = [
                                                            'h-8 w-8 p-0 flex items-center justify-center rounded',
                                                            action.variant === 'destructive'
                                                                ? 'text-red-500 hover:bg-red-50'
                                                                : '',
                                                            action.variant === 'outline'
                                                                ? 'border border-gray-200 hover:bg-gray-50'
                                                                : '',
                                                            action.variant === 'secondary'
                                                                ? 'bg-gray-100 hover:bg-gray-200'
                                                                : '',
                                                            !action.variant || action.variant === 'ghost'
                                                                ? 'hover:bg-gray-100'
                                                                : '',
                                                            action.variant === 'default'
                                                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                                : '',
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ')

                                                        return (
                                                            <button
                                                                key={actionIndex}
                                                                className={buttonClasses}
                                                                onClick={() => action.onClick(row)}
                                                                title={action.label}
                                                            >
                                                                {action.icon}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Helper components for common cell types
export const TextCell = ({ primary, secondary }: { primary: string; secondary?: string }) => (
    <div>
        <div className='font-medium text-gray-900'>{primary}</div>
        {secondary && <div className='text-sm text-gray-500'>{secondary}</div>}
    </div>
)

export const AvatarCell = ({
    src,
    alt,
    fallback,
    text,
}: {
    src?: string
    alt?: string
    fallback?: string
    text?: string
}) => (
    <div className='flex items-center gap-3'>
        <div className='relative h-8 w-8 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0'>
            {src ? (
                <img
                    src={src || '/placeholder.svg?height=32&width=32'}
                    alt={alt || ''}
                    className='h-full w-full object-cover'
                />
            ) : (
                <span className='text-xs font-medium'>{fallback}</span>
            )}
        </div>
        {text && <span className='font-medium'>{text}</span>}
    </div>
)

export const BadgeCell = ({
    text,
    variant = 'secondary',
    count,
}: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    count?: number
}) => {
    const badgeClasses = {
        default: 'bg-blue-100 text-blue-800',
        secondary: 'bg-gray-100 text-gray-800',
        destructive: 'bg-red-100 text-red-800',
        outline: 'bg-white border border-gray-200 text-gray-800',
    }

    return (
        <div className='flex items-center gap-2'>
            <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClasses[variant]}`}
            >
                {text}
            </span>
            {count !== undefined && <span className='text-sm text-gray-500'>+{count} other</span>}
        </div>
    )
}

export const IconTextCell = ({
    icon,
    text,
    secondary,
}: {
    icon: React.ReactNode
    text: string
    secondary?: string
}) => (
    <div className='flex items-center gap-2'>
        <div className='flex-shrink-0'>{icon}</div>
        <div>
            <div className='font-medium'>{text}</div>
            {secondary && <div className='text-sm text-gray-500'>{secondary}</div>}
        </div>
    </div>
)
