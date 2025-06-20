import React from 'react'
import useAuth from '../hooks/useAuth'
import { logoutUser } from '../services/auth'
import { useNavigate } from 'react-router-dom'

const ProfilePage: React.FC = () => {
    const { user, role, platform } = useAuth()
    const [isLoading, setIsLoading] = React.useState(false)
    const [showConfirm, setShowConfirm] = React.useState(false)
    const navigate = useNavigate()

    if (!user && !isLoading) {
        return (
            <div className='flex items-center justify-center h-screen text-lg'>Please login to view your profile.</div>
        )
    }

    const handleLogout = async () => {
        setIsLoading(true)
        setShowConfirm(false)
        try {
            await logoutUser()
        } catch (error: any) {
            // Optionally show error
        } finally {
            setIsLoading(false)
            navigate('/login')
        }
    }

    return (
        <>
            {user && (
                <div className='max-w-xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md'>
                    <div className='flex items-center gap-6 mb-6'>
                        <img
                            src={
                                user.photoURL ||
                                'https://ui-avatars.com/api/?name=' + (user.displayName || user.email || 'User')
                            }
                            alt='Profile'
                            className='w-24 h-24 rounded-full border'
                        />
                        <div>
                            <h1 className='text-2xl font-bold'>{user.displayName || 'No Name'}</h1>
                            <p className='text-gray-600'>{user.email}</p>
                            {role && (
                                <span className='inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold'>
                                    {role}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className='space-y-2'>
                        <div>
                            <span className='font-semibold'>User ID:</span> {user.uid}
                        </div>
                        <div>
                            <span className='font-semibold'>Email Verified:</span> {user.emailVerified ? 'Yes' : 'No'}
                        </div>
                        {user.phoneNumber && (
                            <div>
                                <span className='font-semibold'>Phone Number:</span> {user.phoneNumber}
                            </div>
                        )}
                        <div>
                            <span className='font-semibold'>Account Created:</span> {user.metadata?.creationTime}
                        </div>
                        <div>
                            <span className='font-semibold'>Last Sign-in:</span> {user.metadata?.lastSignInTime}
                        </div>
                        <div>
                            <span className='font-semibold'>Platform:</span> {platform || 'No Platform'}
                        </div>
                        <div>
                            <span className='font-semibold'>Providers:</span>{' '}
                            {user.providerData.map((provider, idx) => (
                                <span key={provider.providerId}>
                                    {provider.providerId}
                                    {idx < user.providerData.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className='flex justify-end'>
                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={isLoading}
                            className='inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-current'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                    >
                                        <circle
                                            className='opacity-25'
                                            cx='12'
                                            cy='12'
                                            r='10'
                                            stroke='currentColor'
                                            strokeWidth='4'
                                        ></circle>
                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                    Logging out...
                                </>
                            ) : (
                                'Logout'
                            )}
                        </button>
                    </div>
                    {showConfirm && (
                        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                            <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-auto'>
                                <div className='p-6'>
                                    <div className='flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4'>
                                        <svg
                                            className='w-6 h-6 text-red-600'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                                            />
                                        </svg>
                                    </div>
                                    <h3 className='text-lg font-semibold text-gray-900 text-center mb-2'>
                                        Confirm Logout
                                    </h3>
                                    <p className='text-gray-600 text-center mb-6'>
                                        Are you sure you want to logout? You'll need to sign in again to access your
                                        account.
                                    </p>
                                    <div className='flex gap-3'>
                                        <button
                                            onClick={() => setShowConfirm(false)}
                                            disabled={isLoading}
                                            className='flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            disabled={isLoading}
                                            className='flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center'
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg
                                                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                                        fill='none'
                                                        viewBox='0 0 24 24'
                                                    >
                                                        <circle
                                                            className='opacity-25'
                                                            cx='12'
                                                            cy='12'
                                                            r='10'
                                                            stroke='currentColor'
                                                            strokeWidth='4'
                                                        ></circle>
                                                        <path
                                                            className='opacity-75'
                                                            fill='currentColor'
                                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                        ></path>
                                                    </svg>
                                                    Logging out...
                                                </>
                                            ) : (
                                                'Yes, Logout'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default ProfilePage
