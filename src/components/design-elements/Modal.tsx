import React, { useRef, useEffect } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    className?: string
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
        } else {
            document.removeEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50'>
            <div
                ref={modalRef}
                className={`relative w-auto my-6 mx-auto max-w-3xl rounded-lg shadow-lg flex flex-col bg-white outline-none focus:outline-none ${className}`}
            >
                {/* Header */}
                <div className='flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t'>
                    <h3 className='text-xl font-semibold text-gray-800'>{title}</h3>
                    <button
                        className='p-1 ml-auto bg-transparent border-0 text-black opacity-50 float-right text-3xl leading-none font-semibold outline-none focus:outline-none'
                        onClick={onClose}
                    >
                        <span className='text-black opacity-50 h-6 w-6 text-2xl block outline-none focus:outline-none'>
                            ×
                        </span>
                    </button>
                </div>
                {/* Body */}
                <div className='relative p-6 flex-auto overflow-y-auto max-h-[80vh]'>{children}</div>
            </div>
        </div>
    )
}

export default Modal
