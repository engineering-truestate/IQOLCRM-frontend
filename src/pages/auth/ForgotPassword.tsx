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
        <div className={`forgot-password-container ${className}`}>
            <div className='forgot-password-form'>
                <h2>Reset Password</h2>
                <p className='subtitle'>Enter your email address and we'll send you a link to reset your password.</p>

                {message && <div className={`message ${isSuccess ? 'success' : 'error'}`}>{message}</div>}

                {!isSuccess ? (
                    <form onSubmit={handleSubmit}>
                        <div className='form-group'>
                            <label htmlFor='email'>Email Address</label>
                            <input
                                type='email'
                                id='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='Enter your email'
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <button type='submit' disabled={isLoading || !email.trim()} className='submit-button'>
                            {isLoading ? 'Sending...' : 'Send Reset Email'}
                        </button>
                    </form>
                ) : (
                    <div className='success-actions'>
                        <p>Didn't receive the email? Check your spam folder or try again.</p>
                        <button
                            onClick={() => {
                                setIsSuccess(false)
                                setMessage('')
                            }}
                            className='try-again-button'
                        >
                            Try Again
                        </button>
                    </div>
                )}

                <div className='back-to-login'>
                    <button onClick={handleBackToLogin} className='back-button' type='button'>
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
