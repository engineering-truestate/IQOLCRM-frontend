import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { ClipLoader } from 'react-spinners'

interface Props {
    children: React.ReactNode
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
    const { user, loading } = useAuth()
    console.log('ProtectedRoute user:', user)
    const navigate = useNavigate()

    useEffect(() => {
        if (!user && !loading) {
            navigate('/login')
        }
    }, [user, loading, navigate])

    if (loading) {
        return <ClipLoader />
    }

    return user ? <>{children}</> : null
}

export default ProtectedRoute
