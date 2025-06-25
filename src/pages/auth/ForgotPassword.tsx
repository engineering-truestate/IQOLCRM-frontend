import React, { useState } from 'react'
import { sendForgotPasswordEmail } from '../../services/auth'
import { useNavigate } from 'react-router-dom'
// Adjust path as needed

interface ForgotPasswordProps {
    onBackToLogin?: () => void
    onSuccess?: (email: string) => void
    onError?: (error: string) => void
    className?: string
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
    onSuccess = () => console.log('hiii'),
    onError,
    className = '',
}) => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            const errorMsg = 'Please enter your email address'
            setMessage(errorMsg)
            onError?.(errorMsg)
            return
        }

        if (!validateEmail(email)) {
            const errorMsg = 'Please enter a valid email address'
            setMessage(errorMsg)
            onError?.(errorMsg)
            return
        }

        setIsLoading(true)
        setMessage('')

        try {
            await sendForgotPasswordEmail(email)
            const successMsg = 'Password reset email sent! Check your inbox.'
            setMessage(successMsg)
            setIsSuccess(true)
            onSuccess?.(email)
        } catch (error: any) {
            let errorMessage = 'Failed to send password reset email'

            // Handle specific Firebase errors
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address'
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address'
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many requests. Please try again later'
            } else if (error.message) {
                errorMessage = error.message
            }

            setMessage(errorMessage)
            setIsSuccess(false)
            onError?.(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackToLogin = () => {
        navigate('/login')
    }

    return (
        <div
            className='flex flex-col items-center justify-center min-h-screen'
            style={{
                backgroundImage: `url(${design})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className='bg-white w-[380px] h-[380px] rounded-[3%] p-6 text-center font-sans shadow-lg'>
                <h2 className='text-[26px] text-[#09342e] font-bold'>Reset Password</h2>
                <p className='text-[15px] text-[#6d7071] mb-4'>
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                <div className='mb-4'>
                    <input
                        className='w-[300px] h-[45px] rounded-[10px] border border-[#e3e5e5] px-3 text-[#706f6c] font-medium text-[15px]'
                        id='email'
                        type='email'
                        placeholder='Your email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <button
                    className='w-[300px] h-[45px] rounded-[10px] text-white font-bold text-[19px] bg-gradient-to-l from-[#0f3d2e] to-[#1b5e3c] hover:bg-gray-600 transition-all duration-300'
                    onClick={handleSubmit}
                >
                    Send Reset Email
                </button>

                <div className='mt-4 text-[15px] text-[#b2b7ba]'>
                    <a onClick={handleBackToLogin} className='hover:underline'>
                        ← Back to Login
                    </a>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
