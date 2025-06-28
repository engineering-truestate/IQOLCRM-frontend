import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { app, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

interface Platforms {
    acn: {
        role: string
        kamId: string
    }
    canvasHomes: {
        role: string
    }
    vault: {
        role: string
    }
    truestate: {
        role: string
    }
    restack: {
        role: string
    }
}
interface AuthState {
    user: User | null
    loading: boolean
    role: string | null // Add role to the AuthState interface
    platform: Platforms | null
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
                const platform = {
                    acn: DocSnap.data()?.acn,
                    canvasHomes: DocSnap.data()?.canvasHomes,
                    vault: DocSnap.data()?.vault,
                    truestate: DocSnap.data()?.truestate,
                    restack: DocSnap.data()?.restack,
                } as Platforms | undefined // Extract the platform from claims
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
