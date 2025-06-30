import React, { useState, useEffect, type KeyboardEvent } from 'react'
import { sendLeadEmail } from '../../services/canvas_homes'
import { useParams } from 'react-router-dom'
import { leadService } from '../../services/canvas_homes/leadService'
import type { Lead } from '../../services/canvas_homes/types'
import { taskService } from '../../services/canvas_homes'
import useAuth from '../../hooks/useAuth'
import { toast } from 'react-toastify'

interface EmailModalProps {
    onClose: () => void
    email: string
    taskId: string
    refreshData: () => void
}

interface EmailChip {
    email: string
    id: string
}

const SendEmailModal: React.FC<EmailModalProps> = ({ onClose, email, taskId, refreshData }) => {
    const { leadId } = useParams<{ leadId: string }>()
    const [leadData, setLeadData] = useState<Lead | null>(null)
    const [toEmail, setToEmail] = useState(email)
    const [ccEmails, setCcEmails] = useState<EmailChip[]>([{ email: 'rahul@canvas-homes.com', id: '2' }])
    const [toInput, setToInput] = useState('')
    const [ccInput, setCcInput] = useState('')
    const [subject, setSubject] = useState('')
    const [content, setContent] = useState('')
    const { user } = useAuth()

    // Fetch lead data on component mount
    useEffect(() => {
        const fetchLeadData = async () => {
            if (leadId) {
                try {
                    const lead = await leadService.getById(leadId)
                    if (lead) {
                        setLeadData(lead)
                    } else {
                        console.log('Lead not found')
                    }
                } catch (error) {
                    console.error('Failed to fetch lead:', error)
                }
            }
        }

        fetchLeadData()
    }, [leadId])

    useEffect(() => {
        const setTemplateData = () => {
            // Only set template data if leadData exists and has required properties
            if (leadData && leadData.propertyName && leadData.name && leadData.phoneNumber) {
                setContent(`Hi Team,

Please register the below lead for the subject project :- ${leadData.propertyName}

Name :- ${leadData.name}
Contact :- ${leadData.phoneNumber}

Please don't call the customer

Regards,
Canvas Homes (IQOL Technologies Pvt Ltd)
Agent Name :- ${user?.displayName}
Agent's Phone Number :-${user?.phoneNumber || ''}`)

                setSubject(`Lead Registration for ${leadData.propertyName} | IQOL Technologies`)
            }
        }

        setTemplateData()
    }, [leadData])
    // New state for minimize/expand functionality
    const [isMinimized] = useState(false)
    const [isExpanded] = useState(false)

    const handleToKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (toInput.trim() && isValidEmail(toInput.trim())) {
                setToEmail(toInput.trim())
                setToInput('')
            }
        }
    }

    const handleCcKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
            e.preventDefault()
            if (ccInput.trim() && isValidEmail(ccInput.trim())) {
                const newEmail = {
                    email: ccInput.trim(),
                    id: Date.now().toString(),
                }
                setCcEmails([...ccEmails, newEmail])
                setCcInput('')
            }
        }
    }

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    const removeToEmail = () => {
        setToEmail('')
    }

    const removeCcEmail = (id: string) => {
        setCcEmails(ccEmails.filter((email) => email.id !== id))
    }

    const onSend = async () => {
        try {
            await sendLeadEmail(toEmail, content, subject)
            await taskService.update(taskId, { emailSent: toEmail })
            refreshData()
            toast.success('Email sent successfully')
            onClose()
        } catch (error) {
            toast.error('Failed to send email')
        }
    }

    const onDiscard = () => {
        onClose()
    }

    // Get modal classes based on state
    const getModalClasses = () => {
        if (isExpanded) {
            return 'fixed inset-4 z-50 bg-white rounded-lg shadow-xl'
        }
    }

    // Get container classes

    return (
        <>
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black opacity-50 ' />
            <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[608px] bg-white z-50 rounded-lg shadow-2xl'>
                <div className={getModalClasses()} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className='bg-blue-500 px-6 py-2 flex justify-between items-center'>
                        <h2 className='text-white text-md font-medium'>New Message</h2>
                    </div>

                    {/* Form Content - Hide when minimized */}
                    {!isMinimized && (
                        <>
                            <div className='p-4 space-y-3'>
                                {/* To Field */}
                                <div className='flex items-start'>
                                    <label className='text-gray-600 text-sm w-12 pt-2'>To</label>
                                    <div className='flex-1'>
                                        <div className='flex flex-wrap items-center gap-2 min-h-[40px] p-2 border border-gray-200 rounded focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'>
                                            {toEmail && (
                                                <div className='flex items-center border border-gray-300 rounded-full px-3 py-1'>
                                                    <div className='w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center mr-2'>
                                                        <span className='text-white text-xs'>👤</span>
                                                    </div>
                                                    <span className='text-sm text-gray-700'>{toEmail}</span>
                                                    <button
                                                        onClick={removeToEmail}
                                                        className='text-gray-500 hover:text-gray-700 ml-2 text-sm'
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                            <input
                                                type='email'
                                                value={toInput}
                                                onChange={(e) => setToInput(e.target.value)}
                                                onKeyPress={handleToKeyPress}
                                                className='flex-1 min-w-[200px] outline-none text-sm'
                                                placeholder={!toEmail ? 'Type email and press Enter' : ''}
                                                disabled={!!toEmail}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* CC Field */}
                                <div className='flex items-start'>
                                    <label className='text-gray-600 text-sm w-12 pt-2'>CC</label>
                                    <div className='flex-1'>
                                        <div className='flex flex-wrap items-center gap-2 min-h-[40px] p-2 border border-gray-200 rounded focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'>
                                            {ccEmails.map((emailChip) => (
                                                <div
                                                    key={emailChip.id}
                                                    className='flex items-center border border-gray-300 rounded-full px-3 py-1'
                                                >
                                                    <div className='w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center mr-2'>
                                                        <span className='text-white text-xs'>👤</span>
                                                    </div>
                                                    <span className='text-sm text-gray-700'>{emailChip.email}</span>
                                                    <button
                                                        onClick={() => removeCcEmail(emailChip.id)}
                                                        className='text-gray-500 hover:text-gray-700 ml-2 text-sm'
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            <input
                                                type='email'
                                                value={ccInput}
                                                onChange={(e) => setCcInput(e.target.value)}
                                                onKeyPress={handleCcKeyPress}
                                                className='flex-1 min-w-[200px] outline-none text-sm'
                                                placeholder={ccEmails.length === 0 ? 'Type email and press Enter' : ''}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Subject Field */}
                                <div className='border-b border-gray-200'>
                                    <input
                                        type='text'
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className='w-full text-base font-medium text-gray-800 outline-none pb-[11px]'
                                        placeholder='Subject'
                                    />
                                </div>

                                {/* Content Area */}
                                <div className='pt-4'>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={isExpanded ? 20 : 13}
                                        className='w-full text-sm text-gray-700 outline-none resize-none leading-relaxed'
                                        placeholder='Compose your message...'
                                    />
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className='bg-gray-50 px-6 py-4 flex justify-center space-x-3 border-t border-gray-200'>
                                <button
                                    onClick={onDiscard}
                                    className='px-6 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400 transition-colors'
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={onSend}
                                    className='px-8 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors'
                                >
                                    Send
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default SendEmailModal
