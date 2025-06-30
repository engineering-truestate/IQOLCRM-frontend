export function toCapitalizedWords(str: string | null | undefined): string {
    if (!str || typeof str !== 'string') return '-'
    str = str.trim()

    const words = str.split(/\s+/)

    const capitalizedWords = words.map((word: string) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })

    return capitalizedWords.join(' ')
}

export function formatStatus(status: string) {
    if (typeof status !== 'string') return status
    // Handle RNR statuses specially
    if (status.startsWith('rnr')) {
        return 'RNR' + toCapitalizedWords(status.slice(3))
    }
    // Use toCapitalize for all other statuses
    return toCapitalizedWords(status)
}
