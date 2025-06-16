import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
    sendPasswordResetEmail,
} from 'firebase/auth'
import { app } from '../firebase'

const auth = getAuth(app)

export const registerUser = async (email: string, password: string, platform: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(userCredential.user, {
            displayName: platform,
        })
        return userCredential.user
    } catch (error: any) {
        console.error('Error creating user:', error)
        throw error
    }
}

export const loginUser = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        return userCredential.user
    } catch (error: any) {
        console.error('Error signing in:', error)
        throw error
    }
}

export const handleLogout = async (navigate: any) => {
    try {
        await signOut(auth)
        navigate('/login')
    } catch (error: any) {
        console.error('Logout failed', error)
    }
}

export const logoutUser = async (): Promise<void> => {
    try {
        console.log(auth.currentUser, 'beforer')
        await signOut(auth)
        console.log(auth.currentUser)
    } catch (error: any) {
        throw new Error(error.message || 'Logout failed')
    }
}

export const sendForgotPasswordEmail = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
        console.error('Error sending password reset email:', error)
        throw error
    }
}
