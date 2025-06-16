export function toCapitalizedWords(str: string | null | undefined): string {
    if (!str || typeof str !== 'string') return 'NA'
    str = str.trim()

    const words = str.split(/\s+/)

    const capitalizedWords = words.map((word: string) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })

    return capitalizedWords.join(' ')
}
