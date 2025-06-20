// ShareInventoryModal.tsx
import React from 'react'
import CopyIcon from '/icons/acn/copy-button.svg'
import WhatsappIcon from '/icons/acn/whatsapp-black.svg'
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

Link: ${`https://acnonline.in/?propertyId%5Bquery%5D=${property.propertyId || property.id}`}
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

 *Property Name:* ${property.nameOfTheProperty || property.area || 'Unknown'}
 *Property ID:* ${property.propertyId || property.id}
 *Location:* ${property.micromarket || 'Unknown'}
 *Asset Type:* ${property.assetType || 'Unknown'}
 *SBUA:* ${property.sbua ? `${property.sbua} sq ft` : 'N/A'}
 *Plot Size:* ${property.plotSize ? `${property.plotSize} sq ft` : 'N/A'}
 *Facing:* ${property.facing || 'N/A'}
 *Total Ask Price:* ${formatCurrency(property.totalAskPrice)}
 *Status:* ${property.status || 'Unknown'}
 *Agent:* ${property.cpCode || 'N/A'}

 *Link:* ${`https://acnonline.in/?propertyId%5Bquery%5D=${property.propertyId || property.id}`}
        `.trim()

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
        window.open(whatsappUrl, '_blank')
    }

    //     const handleEmailShare = () => {
    //         const subject = `Property Details - ${property.nameOfTheProperty || property.area || 'Unknown'}`
    //         const body = `
    // Property Details

    // Property Name: ${property.nameOfTheProperty || property.area || 'Unknown'}
    // Property ID: ${property.propertyId || property.id}
    // Location: ${property.micromarket || 'Unknown'}
    // Asset Type: ${property.assetType || 'Unknown'}
    // SBUA: ${property.sbua ? `${property.sbua} sq ft` : 'N/A'}
    // Plot Size: ${property.plotSize ? `${property.plotSize} sq ft` : 'N/A'}
    // Facing: ${property.facing || 'N/A'}
    // Total Ask Price: ${formatCurrency(property.totalAskPrice)}
    // Status: ${property.status || 'Unknown'}
    // Agent: ${property.cpCode || 'N/A'}
    // Link: ${`https://acnonline.in/?propertyId%5Bquery%5D=${property.propertyId || property.id}`}

    // Best regards,
    // Property Management Team
    //         `.trim()

    //         const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    //         window.location.href = mailtoUrl
    //     }

    return (
        <>
            <div className='fixed inset-0 bg-black/75 flex items-center justify-center z-50' onClick={onClose}>
                <div className='flex flex-col gap-0 bg-white rounded-xl w-72 h-80 bg-baseWhite'>
                    {/* Header */}
                    <div className='flex items-center justify-between px-4 py-2'>
                        <h2 className='text-[16px] font-bold'>Share Inventory</h2>
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

                    {/* Card Content */}
                    <div className='flex flex-col px-4'>
                        <div className='rounded-xl border border-gray-200 bg-white  px-4 py-2'>
                            <div className='space-y-2'>
                                <div className='flex '>
                                    <span className='text-[#121417] text-[14px]'>Project Name :&nbsp;</span>
                                    <span className='font-bold text-[#121417] text-[14px]'>
                                        {property.nameOfTheProperty || property.area || 'Unknown'}
                                    </span>
                                </div>
                                <div className='flex'>
                                    <span className='text-[#121417] text-[14px]'>Location :&nbsp;</span>
                                    <span className='font-bold text-[#121417] text-[14px]'>
                                        {property.micromarket || 'Unknown'}
                                    </span>
                                </div>
                                <div className='flex'>
                                    <span className='text-[#121417] text-[14px]'>Asset Type :&nbsp;</span>
                                    <span className='font-bold text-[#121417] capitalize text-[14px]'>
                                        {property.assetType || 'Unknown'}
                                    </span>
                                </div>
                                <div className='flex'>
                                    <span className='text-[#121417] text-[14px]'>Configuration :&nbsp;</span>
                                    <span className='font-bold text-[#121417] text-[14px]'>
                                        {property.unitType || 'N/A'}
                                    </span>
                                </div>
                                <div className='flex'>
                                    <span className='text-[#121417] text-[14px]'>SBUA :&nbsp;</span>
                                    <span className='font-bold text-[#121417] text-[14px]'>
                                        {property.sbua ? property.sbua : 'N/A'}
                                    </span>
                                </div>
                                <div className='flex'>
                                    <span className='text-[#121417] text-[14px]'>Facing :&nbsp;</span>
                                    <span className='font-bold text-[#121417] text-[14px]'>
                                        {property.facing || 'N/A'}
                                    </span>
                                </div>
                                <div className='flex'>
                                    <span className='text-[#121417] text-[14px]'>Total Ask Price :&nbsp;</span>
                                    <span className='font-bold text-[#121417] text-[14px]'>
                                        {formatCurrency(property.totalAskPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex justify-between px-4 py-2'>
                        <button
                            onClick={handleCopyToClipboard}
                            className='flex items-center justify-center gap-2 p-2 w-[106px] h-[32px] bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium'
                        >
                            <img src={CopyIcon} alt='Copy Icon' className='w-5 h-5' />
                            <span className='text-[14px]'>Clipboard</span>
                        </button>
                        <button
                            onClick={handleWhatsAppShare}
                            className='flex items-center justify-center gap-2 px-4 py-2 w-[106px] h-[32px] bg-black text-white rounded-lg hover:bg-green-700 transition-colors font-medium'
                        >
                            <img src={WhatsappIcon} alt='Whatsapp Icon' className='w-5 h-5' />
                            <span className='text-[14px]'>Whatsapp</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ShareInventoryModal
