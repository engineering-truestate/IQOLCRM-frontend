/**
 * Formats a Unix timestamp into a localized date string
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string in the format "DD MMM YYYY" (e.g., "15 Mar 2024")
 */
export const formatUnixDate = (timestamp: number): string => {
    if (!timestamp) return '-'

    // Convert Unix timestamp to milliseconds
    const date = new Date(Number(timestamp) * 1000)

    // Check if date is valid
    if (isNaN(date.getTime())) {
        console.warn('Invalid date:', timestamp)
        return '-'
    }

    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

/**
 * Formats a Unix timestamp into a localized date and time string
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date and time string in the format "DD MMM YYYY, HH:mm" (e.g., "15 Mar 2024, 14:30")
 */
export const formatUnixDateTime = (timestamp: number): string => {
    if (!timestamp) return '-'

    // Convert Unix timestamp to milliseconds
    const date = new Date(Number(timestamp) * 1000)

    // Check if date is valid
    if (isNaN(date.getTime())) {
        console.warn('Invalid date:', timestamp)
        return '-'
    }

    const dateStr = date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })

    const timeStr = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })

    return `${dateStr}, ${timeStr}`
}

export const formatRelativeTime = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000) // Current time in seconds
    const diff = now - timestamp // Difference in seconds

    // Less than 24 hours
    if (diff < 86400) {
        if (diff < 3600) {
            const minutes = Math.floor(diff / 60)
            return minutes <= 0 ? 'Just now' : `${minutes} minute${minutes === 1 ? '' : 's'} ago`
        }
        const hours = Math.floor(diff / 3600)
        return `${hours} hour${hours === 1 ? '' : 's'} ago`
    }

    // Calculate days
    const days = Math.floor(diff / 86400)
    if (days === 1) {
        return 'Yesterday'
    }

    // Return exact number of days ago
    return `${days} days ago`
}

export const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0]
}
