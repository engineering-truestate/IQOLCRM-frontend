import { useEffect, useState } from "react"

interface StatusSelectCellProps {
    value: string
    row: any
    statusMap: Record<string, string>
    setStatusMap: React.Dispatch<React.SetStateAction<Record<string, string>>>
    options: { label: string; value: string }[]
    idKey: string
    getBgColor: (value: string) => string
}

const StatusSelectCell: React.FC<StatusSelectCellProps> = ({
    value,
    row,
    statusMap,
    setStatusMap,
    options,
    idKey,
    getBgColor,
}) => {
    const [localStatus, setLocalStatus] = useState(statusMap[row[idKey]] ?? value)

    useEffect(() => {
        setLocalStatus(statusMap[row[idKey]] ?? value)
    }, [statusMap[row[idKey]], value])

    const bgColor = getBgColor(localStatus)

    return (
        <select
            value={localStatus}
            onChange={(e) => {
                const newStatus = e.target.value
                setLocalStatus(newStatus)
                setStatusMap((prev) => ({
                    ...prev,
                    [row[idKey]]: newStatus,
                }))
                console.log(`${newStatus} pressed`)
            }}
            className={`text-sm text-gray-700 border rounded px-2 py-1 ${bgColor}`}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    )
}

export default StatusSelectCell