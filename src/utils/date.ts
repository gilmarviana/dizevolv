/**
 * Helper to convert local datetime input (like from a <input type="datetime-local">)
 * to UTC ISO string for database storage.
 */
export function convertLocalToUTC(localDateTimeString: string): string {
    if (!localDateTimeString) return ""
    // Parse the input as local time
    const localDate = new Date(localDateTimeString)
    // Return as ISO string (UTC)
    return localDate.toISOString()
}

/**
 * Helper to convert UTC datetime from database to local YYYY-MM-DDTHH:mm 
 * format for HTML datetime-local input fields.
 */
export function convertUTCToLocal(utcDateTimeString: string): string {
    if (!utcDateTimeString) return ""
    // Parse UTC datetime
    const utcDate = new Date(utcDateTimeString)

    // Get local datetime components
    const year = utcDate.getFullYear()
    const month = String(utcDate.getMonth() + 1).padStart(2, '0')
    const day = String(utcDate.getDate()).padStart(2, '0')
    const hours = String(utcDate.getHours()).padStart(2, '0')
    const minutes = String(utcDate.getMinutes()).padStart(2, '0')

    // Return in format for datetime-local input (YYYY-MM-DDTHH:mm)
    return `${year}-${month}-${day}T${hours}:${minutes}`
}
