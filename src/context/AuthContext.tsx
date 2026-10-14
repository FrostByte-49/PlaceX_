import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { type User } from '@supabase/supabase-js'

interface SignUpUserData {
  name: string
  roll_number: string
  branch: string
  current_year: number
}

interface AuthContextType {
  user: User | null
  userRole: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData: SignUpUserData) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      // Role fetch should have a fast timeout or be non-blocking for the main app
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.warn('Role fetch error (might be using default):', error)
        return 'student'
      }
      return data?.role || 'student'
    } catch (error) {
      console.error('Error fetching user role:', error)
      return 'student'
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (session?.user) {
          setUser(session.user)
          fetchUserRole(session.user.id).then(role => {
            if (isMounted) setUserRole(role)
          })
        } else {
          setUser(null)
          setUserRole(null)
        }
      } catch (error) {
        console.error('Initial auth error:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        fetchUserRole(currentUser.id).then(role => {
          if (isMounted) setUserRole(role)
        })
      } else {
        setUserRole(null)
      }
      
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserRole])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, userData: SignUpUserData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${import.meta.env.VITE_SITE_URL}/login`
      }
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    try {
      // Always clear local state first to make UI responsive
      setUser(null)
      setUserRole(null)
      setLoading(false)
      
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      // We still cleared state locally so navigation can proceed
    }
  }

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
