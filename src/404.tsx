import { useNavigate } from 'react-router'
import Button from './components/design-elements/Button'

const ErrorPage = () => {
    const navigate = useNavigate()
    return (
        <div className='flex flex-col items-center justify-center min-h-[100dvh] px-4 text-center bg-white'>
            <div className='space-y-6 max-w-lg mx-auto'>
                <h1 className='text-6xl font-bold tracking-tighter sm:text-7xl text-gray-900'>404</h1>
                <h2 className='text-3xl font-semibold tracking-tight text-gray-800'>Page not found</h2>
                <p className='text-gray-600'>
                    Sorry, we couldn't find the page you're looking for. The page might have been removed, had its name
                    changed, or is temporarily unavailable.
                </p>
                <div className='flex justify-center pt-6'>
                    <Button onClick={() => navigate('/')}>Back to home</Button>
                </div>
            </div>
        </div>
    )
}

export default ErrorPage
