import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate()

    return (
        <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
            <h1 className='text-3xl font-bold mb-4'>Welcome to the Home Page</h1>
            <button
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                onClick={() => navigate('/login')}
            >
                Login
            </button>
        </div>
    )
}

export default Home
