export function camelCaseToCapitalizedWords(input: string | string[]): string {
    // Handle array input
    if (Array.isArray(input)) {
        return input.map((str) => formatSingleString(str)).join(', ')
    }

    // Handle single string
    return formatSingleString(input)
}

function formatSingleString(str: string) {
    if (!str || typeof str !== 'string') return '-'
    str = str?.trim()

    // Split on camelCase boundaries and spaces
    const words = str
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(/\s+/)

    const capitalizedWords = words.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })

    return capitalizedWords.join(' ')
}
