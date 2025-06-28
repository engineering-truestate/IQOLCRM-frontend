import React from 'react'
import { formatStatus } from '../helper/toCapitalize'

interface StatusBadgeProps {
    status: string | number | undefined
    type: 'lead' | 'connect' | 'agent' | 'pay'
    className?: string
    color?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, className = '', color }) => {
    // Handle undefined status with defaults
    const safeStatus = status ?? (type === 'agent' ? 0 : 'unknown')

    const getStatusColors = () => {
        switch (type) {
            case 'connect':
                switch (safeStatus.toString().toLowerCase()) {
                    case 'connected':
                    case 'connnected':
                        return 'border-[#9DE695]'
                    case 'rnr-1':
                        return 'border-[#FCCE74]'
                    case 'rnr-2':
                        return 'border-[#E6B84D]'
                    case 'rnr-3':
                        return 'border-[#D0A226]'
                    case 'rnr-4':
                        return 'border-[#BA8C00]'
                    case 'rnr-5':
                        return 'border-[#A47A00]'
                    case 'rnr-6':
                        return 'border-[#866600]'
                    case 'not contact':
                        return 'border-[#C85D00]'
                    default:
                        if (safeStatus.toString().toLowerCase().startsWith('rnr')) {
                            return 'border-[#FCCE74]'
                        }
                        return 'border-gray-400 text-gray-600 bg-gray-50'
                }

            case 'agent':
                if (typeof safeStatus !== 'string') {
                    if (safeStatus >= 0 && safeStatus < 10) {
                        return 'border-[#C85D00]'
                    } else if (safeStatus >= 10 && safeStatus < 100) {
                        return 'border-[#FCCE74]'
                    } else if (safeStatus >= 100) {
                        return 'border-[#9DE695]'
                    }
                    return 'border-gray-600 text-black'
                }
                switch (safeStatus.toString().toLowerCase()) {
                    case 'active':
                        return 'border-[#9DE695] text-black'
                    case 'nudge':
                        return 'border-[#D5A400] text-black'
                    case 'no activity':
                        return 'border-[#D01E29] text-black'
                    default:
                        return 'border-gray-600 text-black'
                }

            case 'pay':
                switch (safeStatus.toString().toLowerCase()) {
                    case 'paid':
                        return 'bg-[#E1F6DF] text-black'
                    case 'paid by team':
                        return 'bg-[#E1F6DF] text-black'
                    case 'will pay':
                        return 'bg-[#FEECED] text-black'
                    case 'will not':
                        return 'bg-[#FEECED] text-black'
                    default:
                        return 'border-gray-600 text-black'
                }

            default:
                return 'border-gray-600 text-black'
        }
    }

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-medium whitespace-nowrap ${getStatusColors()} ${className} ${color}`}
        >
            {safeStatus === 0 ? '00' : formatStatus(safeStatus.toString())}
        </span>
    )
}

export default StatusBadge
