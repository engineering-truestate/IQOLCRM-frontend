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
            timeDifferenceSeconds = currentTime - data.scheduledDate
        }

        // Prevent negative result
        if (timeDifferenceSeconds < 0) return '0 hrs'

        const secondsInDay = 60 * 60 * 24
        const secondsInHour = 60 * 60

        const days = Math.floor(timeDifferenceSeconds / secondsInDay)
        const hours = Math.floor(timeDifferenceSeconds / secondsInHour)

        return days >= 1 ? `${days} days` : `${hours} hrs`
    } catch (error) {
        console.error('Error calculating ALSC:', error)
        return null
    }
}
