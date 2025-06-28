import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
    sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, db, storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'
import type { Platform } from '../pages/auth/Register'

export const registerHelper = async (
    uid: string,
    platform: Platform[],
    phoneNumber: string,
    email: string,
    name: string,
) => {
    try {
        if (phoneNumber === '' || phoneNumber === undefined || phoneNumber === null) {
            throw new Error('Phone number is required')
        }
        if (email === '' || email === undefined || email === null) {
            throw new Error('Email is required')
        }
        if (name === '' || name === undefined || name === null) {
            throw new Error('Name is required')
        }
        let acn = {}
        let canvasHomes = {}
        let vault = {}
        let truestate = {}
        let restack = {}
        if (platform.some((p) => p.platform === 'acn')) {
            const DocRef = doc(db, 'acn-admin', 'lastIntId')
            const DocSnap = await getDoc(DocRef)
            const count = DocSnap.data()?.count
            const newIntId = `INT${String(count).padStart(3, '0')}`
            acn = {
                kamId: newIntId,
                role: platform.find((p) => p.platform === 'acn')?.role,
            }
            await updateDoc(DocRef, {
                count: increment(1),
            })
        }
        if (platform.some((p) => p.platform === 'canvas-homes')) {
            const DocRef = doc(db, 'canvashomesAdmin', 'lastAgent')

            const DocSnap = await getDoc(DocRef)
            const count = DocSnap.data()?.count

            const newAgentId = `canv${String(count).padStart(2, '0')}`

            canvasHomes = {
                role: platform.find((p) => p.platform === 'canvas-homes')?.role,
                agentId: newAgentId,
            }

            await updateDoc(DocRef, {
                count: increment(1),
            })
        }
        if (platform.some((p) => p.platform === 'vault')) {
            vault = {
                role: platform.find((p) => p.platform === 'vault')?.role,
            }
        }
        if (platform.some((p) => p.platform === 'truestate')) {
            truestate = {
                role: platform.find((p) => p.platform === 'truestate')?.role,
            }
        }
        if (platform.some((p) => p.platform === 'restack')) {
            restack = {
                role: platform.find((p) => p.platform === 'restack')?.role,
            }
        }
        await setDoc(doc(db, 'internal-agents', email), {
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            uid: uid,
            acn: acn,
            canvasHomes: canvasHomes,
            vault: vault,
            truestate: truestate,
            restack: restack,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        // const abc = await setDoc(doc(db, 'internal-agents', uid), {
        //     uid: uid,
        //     acn: {

        //     }
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // })
        // console.log(abc)
    } catch (error: any) {
        console.error('Error creating platform:', error)
        throw error
    }
}

export const registerUser = async (
    email: string,
    password: string,
    name: string,
    picture: File | null,
    role: string,
    platform: Platform[],
    phoneNumber: string,
) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        let photoURL: string | undefined = undefined

        if (picture) {
            try {
                const pictureRef = ref(storage, `profile-pictures/${user.uid}/${picture.name}`)
                const uploadResult = await uploadBytes(pictureRef, picture)
                photoURL = await getDownloadURL(uploadResult.ref)

                console.log('Profile picture uploaded successfully:', photoURL)
            } catch (uploadError) {
                console.error('Error uploading profile picture:', uploadError)
                // Continue without photo if upload fails
            }
        }

        // Update user profile
        await updateProfile(user, {
            displayName: name,
            photoURL: photoURL,
        })

        // Set custom claims using HTTP endpoint (if keeping onRequest)
        try {
            const response = await fetch(`https://setcustomclaims-wi5onpxm7q-uc.a.run.app`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid: user.uid, role: role }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            console.log('Custom claims set successfully:', result)
        } catch (claimsError) {
            console.error('Error setting custom claims:', claimsError)
            console.warn('User created but role assignment failed')
        }
        console.log(platform)
        await registerHelper(user.uid, platform, phoneNumber, email, name)

        return user
    } catch (error: any) {
        console.error('Error creating user:', error)
        throw error
    }
}

export const loginUser = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        const idTokenResult = await user.getIdTokenResult()

        return {
            user,
            customClaims: idTokenResult.claims,
            role: idTokenResult.claims.role,
            userData: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
            },
        }
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
