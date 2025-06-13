import React from 'react'
import { type Property } from '../../pages/dummy_data/acn_properties_inventory_dummy_data'

interface ShareInventoryModalProps {
    isOpen: boolean
    onClose: () => void
    property: Property | null
}

const ShareInventoryModal: React.FC<ShareInventoryModalProps> = ({ isOpen, onClose, property }) => {
    if (!isOpen || !property) return null

    const handleCopyToClipboard = () => {
        const shareText = `
Project Name: ${property.projectName}
Location: ${property.location}
Asset Type: ${property.assetType}
Configuration: ${property.configuration}
SBUA: ${property.sbua}
Facing: ${property.facing}
Total Ask Price: ${property.totalAskPrice}
        `.trim()

        navigator.clipboard.writeText(shareText).then(() => {
            // You can add a toast notification here
            console.log('Copied to clipboard')
        })
    }

    const handleWhatsAppShare = () => {
        const shareText = `
*Property Details*

🏢 *Project Name:* ${property.projectName}
📍 *Location:* ${property.location}
🏠 *Asset Type:* ${property.assetType}
🛏️ *Configuration:* ${property.configuration}
📐 *SBUA:* ${property.sbua}
🧭 *Facing:* ${property.facing}
💰 *Total Ask Price:* ${property.totalAskPrice}
        `.trim()

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
        window.open(whatsappUrl, '_blank')
    }

    return (
        <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-gray-200'>
                    <h2 className='text-lg font-semibold text-gray-900'>Share Inventory</h2>
                    <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors'>
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
                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>Project Name:</span>
                            <span className='text-sm font-semibold text-gray-900'>{property.projectName}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>Location:</span>
                            <span className='text-sm font-semibold text-gray-900'>{property.location}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>Asset Type:</span>
                            <span className='text-sm font-semibold text-gray-900'>{property.assetType}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>Configuration:</span>
                            <span className='text-sm font-semibold text-gray-900'>{property.configuration}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>SBUA:</span>
                            <span className='text-sm font-semibold text-gray-900'>{property.sbua}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-sm font-medium text-gray-600'>Facing:</span>
                            <span className='text-sm font-semibold text-gray-900'>{property.facing}</span>
                        </div>

                        {property.propertyType === 'Resale' ? (
                            <>
                                <div className='flex justify-between'>
                                    <span className='text-sm font-medium text-gray-600'>Sale Price:</span>
                                    <span className='text-sm font-semibold text-gray-900'>{property.salePrice}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm font-medium text-gray-600'>Possession:</span>
                                    <span className='text-sm font-semibold text-gray-900'>
                                        {property.possessionDate}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className='flex justify-between'>
                                    <span className='text-sm font-medium text-gray-600'>Monthly Rent:</span>
                                    <span className='text-sm font-semibold text-gray-900'>{property.monthlyRent}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm font-medium text-gray-600'>Security Deposit:</span>
                                    <span className='text-sm font-semibold text-gray-900'>
                                        {property.securityDeposit}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-3 mt-6'>
                        <button
                            onClick={handleCopyToClipboard}
                            className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
                        >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                                />
                            </svg>
                            Clipboard
                        </button>

                        <button
                            onClick={handleWhatsAppShare}
                            className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                        >
                            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                                <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.188z' />
                            </svg>
                            Whatsapp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShareInventoryModal
