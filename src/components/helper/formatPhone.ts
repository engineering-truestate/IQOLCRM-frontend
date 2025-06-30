export function formatPhoneNumber(phoneNumber: string) {
    let cleanedPhone = phoneNumber.trim().replace(/\s+/g, '') // Remove spaces

    // Check if the number starts with +91, if not, add it
    if (!cleanedPhone.startsWith('+91')) {
        cleanedPhone = '+91' + cleanedPhone
    }
    return cleanedPhone
}
