import React from 'react'
import { formatStatus } from '../helper/toCapitalize'

interface StatusBadgeProps {
    status: string | number
    type: 'lead' | 'connect' | 'agent' | 'pay'
    className?: string
    color?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, className = '', color }) => {
    const getStatusColors = () => {
        switch (type) {
            case 'lead':
                switch (status.toString().toLowerCase()) {
                    case 'interested':
                        return 'bg-[#E1F6DF] text-black'
                    case 'not interested':
                        return 'text-black'
                    case 'not contact yet':
                        return 'text-black'
                    default:
                        return 'border-gray-600 text-black'
                }

            case 'connect':
                switch (status.toString().toLowerCase()) {
                    case 'connected':
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
                        if (status.toString().toLowerCase().startsWith('rnr')) {
                            return 'border-[#FCCE74]'
                        }
                        return 'border-gray-400 text-gray-600 bg-gray-50'
                }

            case 'agent':
                if (typeof status !== 'string') {
                    if (status >= 0 && status < 10) {
                        return 'border-[#C85D00]'
                    } else if (status >= 10 && status < 100) {
                        return 'border-[#FCCE74]'
                    } else if (status >= 100) {
                        return 'border-[#9DE695]'
                    }
                    return 'border-gray-600 text-black'
                }
                switch (status.toString().toLowerCase()) {
                    case 'active':
                        return 'border-[#9DE695] text-black'
                    case 'no activity':
                        return 'border-[#D01E29] text-black'
                    case 'nudge':
                        return 'border-[#D5A400] text-black'
                    default:
                        return 'border-gray-600 text-black'
                }

            case 'pay':
                switch (status.toString().toLowerCase()) {
                    case 'free':
                        return 'bg-[#E0F2FE] text-black'
                    case 'premium':
                        return 'bg-[#E1F6DF] text-black'
                    case 'trial':
                        return 'bg-[#FEF3C7] text-black'
                    case 'expired':
                        return 'bg-[#FEE2E2] text-black'
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
            {status === 0 ? '00' : formatStatus(status.toString())}
        </span>
    )
}

export default StatusBadge
