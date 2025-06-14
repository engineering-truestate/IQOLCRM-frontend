// ShareInventoryModal.tsx
import React from 'react'
import { type IInventory } from '../../store/reducers/acn/propertiesTypes'

interface ShareInventoryModalProps {
    isOpen: boolean
    onClose: () => void
    property: IInventory | null
}

const ShareInventoryModal: React.FC<ShareInventoryModalProps> = ({ isOpen, onClose, property }) => {
    if (!isOpen || !property) return null

    // Helper function to format currency
    const formatCurrency = (amount: number | undefined | null) => {
        if (!amount) return '₹0'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const handleCopyToClipboard = () => {
        const shareText = `
Property Details

Property Name: ${property.nameOfTheProperty || property.area || 'Unknown'}
Property ID: ${property.propertyId || property.id}
Location: ${property.micromarket || 'Unknown'}
Asset Type: ${property.assetType || 'Unknown'}
SBUA: ${property.sbua ? `${property.sbua} sq ft` : 'N/A'}
Plot Size: ${property.plotSize ? `${property.plotSize} sq ft` : 'N/A'}
Facing: ${property.facing || 'N/A'}
Total Ask Price: ${formatCurrency(property.totalAskPrice)}
Status: ${property.status || 'Unknown'}
Agent: ${property.cpCode || 'N/A'}
        `.trim()

        navigator.clipboard
            .writeText(shareText)
            .then(() => {
                console.log('Copied to clipboard')
                // You can add a toast notification here
            })
            .catch((err) => {
                console.error('Failed to copy to clipboard:', err)
            })
    }

    const handleWhatsAppShare = () => {
        const shareText = `
*🏠 Property Details*

🏢 *Property Name:* ${property.nameOfTheProperty || property.area || 'Unknown'}
🆔 *Property ID:* ${property.propertyId || property.id}
📍 *Location:* ${property.micromarket || 'Unknown'}
🏠 *Asset Type:* ${property.assetType || 'Unknown'}
📐 *SBUA:* ${property.sbua ? `${property.sbua} sq ft` : 'N/A'}
📏 *Plot Size:* ${property.plotSize ? `${property.plotSize} sq ft` : 'N/A'}
🧭 *Facing:* ${property.facing || 'N/A'}
💰 *Total Ask Price:* ${formatCurrency(property.totalAskPrice)}
📊 *Status:* ${property.status || 'Unknown'}
👤 *Agent:* ${property.cpCode || 'N/A'}

_Shared via Property Management System_
        `.trim()

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
        window.open(whatsappUrl, '_blank')
    }

    const handleEmailShare = () => {
        const subject = `Property Details - ${property.nameOfTheProperty || property.area || 'Unknown'}`
        const body = `
Property Details

Property Name: ${property.nameOfTheProperty || property.area || 'Unknown'}
Property ID: ${property.propertyId || property.id}
Location: ${property.micromarket || 'Unknown'}
Asset Type: ${property.assetType || 'Unknown'}
SBUA: ${property.sbua ? `${property.sbua} sq ft` : 'N/A'}
Plot Size: ${property.plotSize ? `${property.plotSize} sq ft` : 'N/A'}
Facing: ${property.facing || 'N/A'}
Total Ask Price: ${formatCurrency(property.totalAskPrice)}
Status: ${property.status || 'Unknown'}
Agent: ${property.cpCode || 'N/A'}

Best regards,
Property Management Team
        `.trim()

        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        window.location.href = mailtoUrl
    }

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg'>
                    <h2 className='text-lg font-semibold text-gray-900'>Share Property</h2>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100'
                    >
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className='p-6'>
                    <div className='space-y-3'>
                        <div className='flex justify-between items-start'>
                            <span className='text-sm font-medium text-gray-600'>Property Name:</span>
                            <span className='text-sm font-semibold text-gray-900 text-right max-w-[60%]'>
                                {property.nameOfTheProperty || property.area || 'Unknown'}
                            </span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>Property ID:</span>
                            <span className='text-sm font-semibold text-gray-900'>
                                {property.propertyId || property.id}
                            </span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>Location:</span>
                            <span className='text-sm font-semibold text-gray-900'>
                                {property.micromarket || 'Unknown'}
                            </span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>Asset Type:</span>
                            <span className='text-sm font-semibold text-gray-900 capitalize'>
                                {property.assetType || 'Unknown'}
                            </span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>SBUA:</span>
                            <span className='text-sm font-semibold text-gray-900'>
                                {property.sbua ? `${property.sbua} sq ft` : 'N/A'}
                            </span>
                        </div>

                        {property.plotSize && (
                            <div className='flex justify-between'>
                                <span className='text-sm font-medium text-gray-600'>Plot Size:</span>
                                <span className='text-sm font-semibold text-gray-900'>{property.plotSize} sq ft</span>
                            </div>
                        )}

                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>Facing:</span>
                            <span className='text-sm font-semibold text-gray-900'>{property.facing || 'N/A'}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>Total Ask Price:</span>
                            <span className='text-sm font-semibold text-gray-900'>
                                {formatCurrency(property.totalAskPrice)}
                            </span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>Status:</span>
                            <span
                                className={`text-sm font-semibold px-2 py-1 rounded-full text-xs ${
                                    property.status === 'Available'
                                        ? 'bg-green-100 text-green-800'
                                        : property.status === 'Sold' || property.status === 'Rented'
                                          ? 'bg-gray-100 text-gray-800'
                                          : property.status === 'Hold'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {property.status || 'Unknown'}
                            </span>
                        </div>

                        {property.cpCode && (
                            <div className='flex justify-between'>
                                <span className='text-sm font-medium text-gray-600'>Agent:</span>
                                <span className='text-sm font-semibold text-gray-900'>{property.cpCode}</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col gap-3 mt-6'>
                        <div className='grid grid-cols-2 gap-3'>
                            <button
                                onClick={handleCopyToClipboard}
                                className='flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
                            >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                                    />
                                </svg>
                                Copy
                            </button>

                            <button
                                onClick={handleEmailShare}
                                className='flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'
                            >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                                    />
                                </svg>
                                Email
                            </button>
                        </div>

                        <button
                            onClick={handleWhatsAppShare}
                            className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                        >
                            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                                <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.188z' />
                            </svg>
                            Share via WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShareInventoryModal
