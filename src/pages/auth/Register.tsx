import { useState, type ChangeEvent } from 'react'
import { registerUser } from '../../services/auth'
import Dropdown from '../../components/design-elements/Dropdown'

const Register: React.FC = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [picture, setPicture] = useState<File | null>(null)
    const [role, setRole] = useState<string>('')
    const [picturePreview, setPicturePreview] = useState<string | null>(null)

    const handlePictureChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0]
        if (file) {
            setPicture(file)
            // Create preview URL
            const previewUrl = URL.createObjectURL(file)
            setPicturePreview(previewUrl)
        }
    }

    const handleRegister = async (): Promise<void> => {
        try {
            // Validate required fields
            if (!email || !password || !name || !role) {
                alert('Please fill in all required fields')
                return
            }

            await registerUser(email, password, name, picture, role)
            alert('Registration successful!')

            // Clean up preview URL
            if (picturePreview) {
                URL.revokeObjectURL(picturePreview)
            }
        } catch (error: any) {
            alert(`Registration failed: ${error.message}`)
        }
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8'>
            <div className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md'>
                <h2 className='text-2xl font-bold mb-4 text-center'>Register</h2>

                {/* Name Field */}
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='name'>
                        Full Name *
                    </label>
                    <input
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        id='name'
                        type='text'
                        placeholder='Enter your full name'
                        value={name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        required
                    />
                </div>

                {/* Email Field */}
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='email'>
                        Email *
                    </label>
                    <input
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        id='email'
                        type='email'
                        placeholder='Enter your email'
                        value={email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password Field */}
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='password'>
                        Password *
                    </label>
                    <input
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        id='password'
                        type='password'
                        placeholder='Enter your password'
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Picture Upload */}
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='picture'>
                        Profile Picture (Optional)
                    </label>
                    <input
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        id='picture'
                        type='file'
                        accept='image/*'
                        onChange={handlePictureChange}
                    />
                    {picturePreview && (
                        <div className='mt-2'>
                            <img
                                src={picturePreview}
                                alt='Profile preview'
                                className='w-20 h-20 object-cover rounded-full border-2 border-gray-300'
                            />
                        </div>
                    )}
                </div>

                {/* Role Selection */}
                <div className='mb-6'>
                    <label className='block text-gray-700 text-sm font-bold mb-2'>Select Role *</label>
                    <Dropdown
                        options={[
                            { label: 'Admin', value: 'admin' },
                            { label: 'Agent', value: 'agent' },
                            { label: 'User', value: 'user' },
                        ]}
                        onSelect={(value: string) => setRole(value)}
                        placeholder='Choose a role'
                    />
                </div>

                <div className='flex items-center justify-between'>
                    <button
                        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50'
                        type='button'
                        onClick={handleRegister}
                        disabled={!email || !password || !name || !role}
                    >
                        Register
                    </button>
                    <a
                        className='inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800'
                        href='#'
                    >
                        Forgot Password?
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Register
