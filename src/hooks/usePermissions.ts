import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { permissionService } from '@/services/permissionService'

export type Permission = {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
}

export function usePermissions(moduleId: string): Permission {
    const { profile } = useAuth()
    const [permissions, setPermissions] = useState<Permission>({
        view: false,
        create: false,
        edit: false,
        delete: false
    })

    useEffect(() => {
        async function loadPermissions() {
            if (!profile?.clinica_id || !profile?.role) {
                setPermissions({ view: false, create: false, edit: false, delete: false })
                return
            }

            // Admin always has full permissions
            if (profile.role === 'admin') {
                setPermissions({ view: true, create: true, edit: true, delete: true })
                return
            }

            try {
                const allPermissions = await permissionService.getPermissions(profile.clinica_id)
                const modulePermission = allPermissions.find(
                    p => p.role === profile.role && p.module === moduleId
                )

                if (modulePermission) {
                    setPermissions({
                        view: modulePermission.can_view,
                        create: modulePermission.can_create,
                        edit: modulePermission.can_edit,
                        delete: modulePermission.can_delete
                    })
                } else {
                    // No permission record = no access
                    setPermissions({ view: false, create: false, edit: false, delete: false })
                }
            } catch (error) {
                console.error('Error loading permissions:', error)
                setPermissions({ view: false, create: false, edit: false, delete: false })
            }
        }

        loadPermissions()
    }, [profile?.clinica_id, profile?.role, moduleId])

    return permissions
}
