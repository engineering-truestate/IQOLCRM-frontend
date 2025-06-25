import { useState } from 'react'
import { loginUser } from '../../services/auth'
import { useNavigate } from 'react-router-dom'
import design from '../../../images/design.png'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleLogin = async () => {
        try {
            await loginUser(email, password)
            console.log('Login successful!')
            navigate('/home')
        } catch (error: any) {
            console.log(`Login failed: ${error.message}`)
        }
    }
    const handleForgotPassword = async () => {
        try {
            navigate('/forgotPassword')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div
            className='flex flex-col items-center justify-center min-h-screen'
            style={{
                backgroundImage: `url(${design})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                // reduce opacity here
            }}
        >
            <div className='bg-white w-[380px] h-[380px] rounded-[3%] p-6 text-center font-sans shadow-lg'>
                <h2 className='text-[26px] text-[#09342e] font-bold'>Log in</h2>
                <p className='text-[15px] text-[#6d7071] mb-4'>Please Enter Your Credentials</p>

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

                <div className='mb-4'>
                    <input
                        className='w-[300px] h-[45px] rounded-[10px] border border-[#e3e5e5] px-3 text-[#706f6c] font-medium text-[15px]'
                        id='password'
                        type='password'
                        placeholder='Your password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    className='w-[300px] h-[45px] rounded-[10px] text-white font-bold text-[19px] bg-gradient-to-l from-[#0f3d2e] to-[#1b5e3c] hover:bg-gray-600 transition-all duration-300'
                    onClick={handleLogin}
                >
                    Log In
                </button>

                <div className='mt-4 text-[15px] text-[#b2b7ba]'>
                    Don't have an account?{' '}
                    <a href='/signup' className='hover:underline'>
                        Sign Up
                    </a>
                </div>

                <a className='mt-2 text-[15px] text-[#ebebeb] hover:underline block' onClick={handleForgotPassword}>
                    Forgot your password?
                </a>
            </div>
        </div>
    )
}

export default Login
