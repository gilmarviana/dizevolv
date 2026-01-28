import { supabase } from "@/lib/supabase"

export interface RolePermission {
    id?: string
    clinica_id?: string
    role: string
    module: string
    can_view: boolean
    can_create: boolean
    can_edit: boolean
    can_delete: boolean
}

export const permissionService = {
    async getPermissions(clinicaId: string) {
        const { data, error } = await supabase
            .from('role_permissions')
            .select('*')
            .eq('clinica_id', clinicaId)

        if (error) throw error
        return data as RolePermission[]
    },

    async upsertPermission(permission: RolePermission) {
        // Prepare data ensuring clinica_id is available if not passed (though ideally it should be)
        // Note: For upsert to work with the unique constraint(clinica_id, role, module), 
        // we need all those fields.

        const { data, error } = await supabase
            .from('role_permissions')
            .upsert(permission, { onConflict: 'clinica_id,role,module' })
            .select()
            .single()

        if (error) throw error
        return data as RolePermission
    },

    // Roles Management
    async getRoles(clinicaId: string) {
        const { data, error } = await supabase
            .from('clinic_roles')
            .select('*')
            .eq('clinica_id', clinicaId)
            .order('name')

        if (error) throw error
        return data as { id: string, name: string, slug: string, description: string }[]
    },

    async createRole(role: { clinica_id: string, name: string, slug: string }) {
        const { data, error } = await supabase
            .from('clinic_roles')
            .insert(role)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteRole(roleId: string) {
        const { error } = await supabase
            .from('clinic_roles')
            .delete()
            .eq('id', roleId)

        if (error) throw error
        return true
    },

    // Helper to get default permissions if none exist
    getDefaults(_role: string): Partial<RolePermission>[] {
        // Define default policies here if DB is empty
        return []
    }
}
