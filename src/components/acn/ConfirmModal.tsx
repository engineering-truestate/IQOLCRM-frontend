import React from 'react'

interface ConfirmModalProps {
    title: string
    message?: string
    onConfirm: () => void
    onCancel: () => void
    generatingEnquiry?: boolean
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    title,
    message,
    onConfirm,
    onCancel,
    generatingEnquiry = false,
}) => {
    if (generatingEnquiry) {
        return (
            <div className='fixed inset-0 z-50 flex justify-center items-center bg-black/75 bg-opacity-50 px-4'>
                <div className='bg-white rounded-lg p-6 w-full max-w-sm flex items-center gap-1'>
                    <h2 className='text-[16px] font-montserrat font-bold'>Upgrading Plan! Please wait...</h2>
                    {/* Pure CSS Spinner */}
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                </div>
            </div>
        )
    } else {
        return (
            <div className='fixed inset-0 z-50 flex justify-center items-center bg-black/75 bg-opacity-50 px-4'>
                <div className='bg-white rounded-lg p-6 w-full max-w-sm'>
                    <div className='flex flex-col gap-2'>
                        <h2 className='text-[16px] font-montserrat font-bold'>{title}</h2>
                    </div>
                    <p className='leading-[21px] text-[#433F3E] font-medium mb-4 max-w-[300px] text-[14px] mt-[6px]'>
                        {message || 'Are you sure you want to upgrade this plan?'}
                    </p>
                    <div className='flex gap-2 justify-between text-[14px]'>
                        <button
                            className='px-4 py-2 w-full border-[1px]  text-black rounded-[4px] text-[14px] font-semibold leading-[21px]'
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className='px-4 py-2 w-full bg-black text-white rounded-[4px] text-[14px] font-semibold leading-[21px]'
                            onClick={onConfirm}
                        >
                            Yes, Upgrade
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default ConfirmModal
