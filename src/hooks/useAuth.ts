import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { app } from '../firebase'

interface AuthState {
    user: User | null
    loading: boolean
    role: string | null // Add role to the AuthState interface
}

const auth = getAuth(app)

const useAuth = (): AuthState => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        loading: true,
        role: null, // Initialize role to null
    })

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            // Make the callback async
            if (user) {
                const idTokenResult = await user.getIdTokenResult() // Get the ID token result
                const role = idTokenResult.claims.role as string | undefined // Extract the role from claims
                setAuthState({ user, loading: false, role: role || null }) // Set the role in the state
            } else {
                setAuthState({ user: null, loading: false, role: null }) // Reset the role when the user logs out
            }
        })

        return () => unsubscribe()
    }, [])

    return authState
}

export default useAuth
