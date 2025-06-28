import { useNavigate } from 'react-router-dom'
import Button from './components/design-elements/Button'

const Home = () => {
    const navigate = useNavigate()

    return (
        <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
            <h1 className='text-3xl font-bold mb-4'>Welcome to the Home Page</h1>
            <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
    )
}

export default Home
