import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from './firebase'

const authContext = createContext()

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth().
export function ProvideAuth({ children }) {
    const auth = useProvideAuth()
    return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

// Hook for child components to get the auth object and re-render when it changes.
export const useAuth = () => {
    return useContext(authContext)
}

// Provider hook that creates auth object and handles state
function useProvideAuth() {
    const [user, setUser] = useState(null)

    // Wrap any Firebase methods we want to use making sure to save the user to state.
    async function signin(email, password) {
        const { user } = await auth.signInWithEmailAndPassword(email, password)
        setUser(user)
        return user
    }

    async function signup(email, password) {
        const { user } = await auth.createUserWithEmailAndPassword(email, password)
        setUser(user)
        return user
    }

    async function signout() {
        await auth.signOut()
        setUser(false)
    }

    async function sendPasswordResetEmail(email) {
        await auth.sendPasswordResetEmail(email)
        return true
    }

    async function confirmPasswordReset(code, password) {
        await auth.confirmPasswordReset(code, password)
        return true
    }

    async function updateProfile(displayName) {
        await auth.currentUser.updateProfile({ displayName })
        return true
    }

    // Subscribe to user on mount
    // Because this sets state in the callback it will cause any component that utilizes this hook to re-render with thelatest auth object.
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setUser(user ? user : false)
        })

        // Cleanup subscription on unmount
        return () => unsubscribe()
    }, [])

    // Return the user object and auth methods
    return {
        user,
        signin,
        signup,
        signout,
        sendPasswordResetEmail,
        confirmPasswordReset,
        updateProfile,
    }
}
