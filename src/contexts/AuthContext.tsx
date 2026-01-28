import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

import { type Profile } from "@/types"

type AuthContextType = {
    session: Session | null
    user: User | null
    profile: Profile | null
    loading: boolean
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    async function fetchProfile(userId: string) {
        console.log("Fetching profile for:", userId)
        const { data, error } = await supabase
            .from('usuarios')
            .select('*, clinicas ( nome, status, trial_ends_at )')
            .eq('id', userId)
            .single()

        if (error) {
            console.error("Profile fetch error:", error)
        }
        if (data) {
            console.log("Profile loaded:", data)

            const clinicaData = data.clinicas
            setProfile({
                ...data,
                clinica_nome: clinicaData?.nome,
                clinica_status: clinicaData?.status,
                clinica_trial_ends: clinicaData?.trial_ends_at
            })
        } else {
            console.warn("No profile found for this ID.")
        }
    }

    async function refreshProfile() {
        if (user) {
            await fetchProfile(user.id)
        }
    }

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            const currentUser = session?.user ?? null
            setUser(currentUser)
            if (currentUser) fetchProfile(currentUser.id).finally(() => setLoading(false))
            else setLoading(false)
        })

        // Listen for changes on auth state (logged in, signed out, etc.)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            const currentUser = session?.user ?? null
            setUser(currentUser)
            if (currentUser) fetchProfile(currentUser.id).finally(() => setLoading(false))
            else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, signOut, refreshProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}
