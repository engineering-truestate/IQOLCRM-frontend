// ShareInventoryModal.tsx
import React from 'react'
import CopyIcon from '/icons/acn/copy-button.svg'
import WhatsappIcon from '/icons/acn/whatsapp-black.svg'
import { type IInventory } from '../../store/reducers/acn/propertiesTypes'

interface BulkShareModalProps {
    isOpen: boolean
    onClose: () => void
    properties: IInventory[] | null
}

const BulkShareModal: React.FC<BulkShareModalProps> = ({ isOpen, onClose, properties }) => {
    if (!isOpen || !properties || properties.length === 0) return null

    // Helper function to format currency
    const formatCurrency = (amount: number | undefined | null) => {
        if (!amount) return '₹0'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    // Get property IDs for display
    const propertyIds = properties.map((prop) => prop.propertyId || prop.id || 'Unknown ID')

    const handleCopyToClipboard = () => {
        const shareText = `Selected Properties

Property IDs: ${propertyIds.join(', ')}

Total Properties: ${properties.length}

Property Details:
${properties
    .map(
        (prop, index) => `
${index + 1}. ${prop.nameOfTheProperty || prop.area || 'Unknown Property'}
   ID: ${prop.propertyId || prop.id || 'Unknown'}
   Location: ${prop.micromarket || 'Unknown'}
   Asset Type: ${prop.assetType || 'Unknown'}
   SBUA: ${prop.sbua ? `${prop.sbua} sq ft` : 'N/A'}
   Price: ${formatCurrency(prop.totalAskPrice)}
   Status: ${prop.status || 'Unknown'}
   Agent: ${prop.cpCode || 'N/A'}
`,
    )
    .join('\n')}

Shared via Property Management System
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
        const shareText = `*🏠 Selected Properties*

*Property IDs:* ${propertyIds.join(', ')}

*Total Properties:* ${properties.length}

*Property Details:*
${properties
    .map(
        (prop, index) => `
*${index + 1}.* ${prop.nameOfTheProperty || prop.area || 'Unknown Property'}
   🆔 *ID:* ${prop.propertyId || prop.id || 'Unknown'}
   📍 *Location:* ${prop.micromarket || 'Unknown'}
   🏠 *Asset Type:* ${prop.assetType || 'Unknown'}
   📐 *SBUA:* ${prop.sbua ? `${prop.sbua} sq ft` : 'N/A'}
   💰 *Price:* ${formatCurrency(prop.totalAskPrice)}
   📊 *Status:* ${prop.status || 'Unknown'}
   👤 *Agent:* ${prop.cpCode || 'N/A'}
`,
    )
    .join('\n\n')}

_Shared via Property Management System_
        `.trim()

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
        window.open(whatsappUrl, '_blank')
    }

    const handleEmailShare = () => {
        const subject = `Selected Properties - ${properties.length} Properties`
        const body = `Selected Properties

Property IDs: ${propertyIds.join(', ')}

Total Properties: ${properties.length}

Property Details:
${properties
    .map(
        (prop, index) => `
${index + 1}. ${prop.nameOfTheProperty || prop.area || 'Unknown Property'}
   ID: ${prop.propertyId || prop.id || 'Unknown'}
   Location: ${prop.micromarket || 'Unknown'}
   Asset Type: ${prop.assetType || 'Unknown'}
   SBUA: ${prop.sbua ? `${prop.sbua} sq ft` : 'N/A'}
   Price: ${formatCurrency(prop.totalAskPrice)}
   Status: ${prop.status || 'Unknown'}
   Agent: ${prop.cpCode || 'N/A'}
`,
    )
    .join('\n')}

Best regards,
Property Management Team
        `.trim()

        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        window.location.href = mailtoUrl
    }

    return (
        <>
            <div
                className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
                onClick={onClose}
            >
                <div className='flex flex-col gap-0 bg-white rounded-xl w-fit h-fit bg-baseWhite'>
                    {/* Header */}
                    <div className='flex items-center justify-between px-4 py-2'>
                        <h2 className='text-[16px] font-bold'>Share Selected Properties</h2>
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
                    <div className='flex flex-col px-4 overflow-y-auto scrollbar-hide'>
                        <div className='rounded-xl border border-gray-200 bg-white px-4 py-2'>
                            <div className='space-y-2'>
                                <div className='flex'>
                                    <span className='text-[#121417] text-[14px]'>Total Properties :&nbsp;</span>
                                    <span className='font-bold text-[#121417] text-[14px]'>{properties.length}</span>
                                </div>
                                <div className='flex flex-row items-center w-full scrollbar-hide'>
                                    <div className='text-[#121417] text-[14px]'>Property IDs :</div>
                                    <div className='flex-1 max-h-32 overflow-y-auto mt-1'>
                                        {propertyIds.map((id, index) => (
                                            <div
                                                key={index}
                                                className='w-full text-right font-bold text-[#121417] text-[14px]'
                                            >
                                                {id}
                                            </div>
                                        ))}
                                    </div>
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

export default BulkShareModal
