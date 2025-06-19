import React from 'react'
import useAuth from '../hooks/useAuth'

const ProfilePage: React.FC = () => {
    const { user, role } = useAuth()

    if (!user) {
        return <div>Please login to view your profile.</div>
    }

    return (
        <div>
            <h1>Profile Page</h1>
            <p>
                <strong>User ID:</strong> {user.uid}
            </p>
            <p>
                <strong>Email:</strong> {user.email}
            </p>
            <p>
                <strong>Display Name:</strong> {user.displayName}
            </p>
            <p>
                <strong>Photo URL:</strong> {user.photoURL}
            </p>
            {role && (
                <>
                    <h2>Agent Data</h2>
                    <p>
                        <strong>Role:</strong> {role}
                    </p>
                </>
            )}
        </div>
    )
}

export default ProfilePage
