import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { permissionService, type RolePermission } from '@/services/permissionService'

interface PermissionContextType {
    permissions: RolePermission[]
    loading: boolean
    can: (module: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean
    refreshPermissions: () => Promise<void>
}

const PermissionContext = createContext<PermissionContextType>({
    permissions: [],
    loading: true,
    can: () => false,
    refreshPermissions: async () => { },
})

export function PermissionProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth()
    const [permissions, setPermissions] = useState<RolePermission[]>([])
    const [loading, setLoading] = useState(true)

    const loadPermissions = async () => {
        if (!profile?.clinica_id || !profile?.role) {
            setLoading(false)
            return
        }

        // Admin has full access by default
        if (profile.role === 'admin' || profile.role === 'superadmin') {
            setLoading(false)
            return
        }

        try {
            const data = await permissionService.getPermissions(profile.clinica_id)
            setPermissions(data)
        } catch (error) {
            console.error("Failed to load permissions", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPermissions()
    }, [profile?.clinica_id, profile?.role])

    const can = (module: string, action: 'view' | 'create' | 'edit' | 'delete') => {
        // Superadmin and Admin bypass checks
        if (profile?.role === 'superadmin' || profile?.role === 'admin') return true

        // For other roles, check DB permissions
        // Note: If no permission record exists for a module, default is usually FALSE (safe by default)
        const permission = permissions.find(p => p.module === module && p.role === profile?.role)

        if (!permission) return false // Default deny

        switch (action) {
            case 'view': return permission.can_view
            case 'create': return permission.can_create
            case 'edit': return permission.can_edit
            case 'delete': return permission.can_delete
            default: return false
        }
    }

    return (
        <PermissionContext.Provider value={{ permissions, loading, can, refreshPermissions: loadPermissions }}>
            {children}
        </PermissionContext.Provider>
    )
}

export const usePermission = () => useContext(PermissionContext)
