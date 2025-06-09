import { useState } from 'react'
import { loginUser } from '../../services/canvas-homes/auth'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleLogin = async () => {
        try {
            await loginUser(email, password)
            console.log('Login successful!')
        } catch (error: any) {
            console.log(`Login failed: ${error.message}`)
        } finally {
            navigate('/canvas-homes/dashboard')
        }
    }

    return (
        <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
            <div className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
                <h2 className='text-2xl font-bold mb-4'>Login</h2>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='email'>
                        Email
                    </label>
                    <input
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        id='email'
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className='mb-6'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='password'>
                        Password
                    </label>
                    <input
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        id='password'
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className='flex items-center justify-between'>
                    <button
                        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                        type='button'
                        onClick={handleLogin}
                    >
                        Sign In
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

export default Login
