import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { app, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import type { Platform } from '../pages/auth/Register'

interface AuthState {
    user: User | null
    loading: boolean
    role: string | null // Add role to the AuthState interface
    platform: Platform[] | null
}

const auth = getAuth(app)

const useAuth = (): AuthState => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        loading: true,
        role: null, // Initialize role to null
        platform: null,
    })

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            // Make the callback async
            if (user) {
                const idTokenResult = await user.getIdTokenResult() // Get the ID token result
                const role = idTokenResult.claims.role as string | undefined // Extract the role from claims
                const DocRef = doc(db, 'internal-agents', user.uid)
                const DocSnap = await getDoc(DocRef)
                const platform = [
                    DocSnap.data()?.acn,
                    DocSnap.data()?.canvasHomes,
                    DocSnap.data()?.vault,
                    DocSnap.data()?.truestate,
                    DocSnap.data()?.restack,
                ] as Platform[] | undefined // Extract the platform from claims
                console.log(platform, 'platform in auth state')
                setAuthState({ user, loading: false, role: role || null, platform: platform || null }) // Set the role in the state
            } else {
                setAuthState({ user: null, loading: false, role: null, platform: null }) // Reset the role when the user logs out
            }
        })

        return () => unsubscribe()
    }, [])

    return authState
}

export default useAuth
