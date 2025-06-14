import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { app } from '../firebase'

interface AuthState {
    user: User | null
    loading: boolean
}

const auth = getAuth(app)

const useAuth = (): AuthState => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        loading: true,
    })

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthState({ user, loading: false })
        })

        return () => unsubscribe()
    }, [])

    return authState
}

export default useAuth
