import type { Lead } from '../../services/canvas_homes'
import { getUnixDateTime } from './getUnixDateTime'

export function calculateALSC(data: Lead): string | null {
    if (!data.added) return null

    try {
        const currentTime = getUnixDateTime()
        let timeDifferenceSeconds: number

        if (!data.scheduledDate) {
            // Case 1: No scheduled date → use current time - added
            timeDifferenceSeconds = currentTime - data.added
        } else if (data.completionDate && data.completionDate > data.scheduledDate) {
            // Case 2a: scheduled exists AND completion > scheduled
            timeDifferenceSeconds = data.completionDate - currentTime
        } else {
            // Case 2b: scheduled exists AND no completion or completion <= scheduled
            timeDifferenceSeconds = data.scheduledDate - currentTime
        }

        // Prevent negative result
        if (timeDifferenceSeconds < 0) return '0 hrs'

        const days = Math.floor(timeDifferenceSeconds / (60 * 60 * 24))
        const remainingHours = Math.floor((timeDifferenceSeconds % (60 * 60 * 24)) / (60 * 60))

        return days === 0 ? `${remainingHours} hrs` : `${days} days : ${remainingHours} hrs`
    } catch (error) {
        console.error('Error calculating ALSC:', error)
        return null
    }
}
