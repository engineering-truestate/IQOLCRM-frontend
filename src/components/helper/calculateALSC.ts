import type { Lead, Task } from '../../services/canvas_homes/types'
import { getUnixDateTime } from './getUnixDateTime'

export async function calculateALSC(data: Lead, tasks: Task[], created: number | null): Promise<string | null> {
    try {
        const openTasksWithSchedule = tasks
        let endTime: number
        const currentTime = getUnixDateTime() // Current time in Unix timestamp (seconds)

        if (openTasksWithSchedule.length > 0) {
            // Find the earliest task (smallest scheduled date)
            const earliestTask = openTasksWithSchedule.reduce((earliest, current) => {
                return current.scheduledDate > earliest.scheduledDate ? current : earliest
            })

            // Compare and choose the smaller date between earliestTask.scheduledDate and lastModified
            if (data.completionDate && earliestTask.scheduledDate < data.completionDate) {
                endTime = data.completionDate
            } else {
                endTime = earliestTask.scheduledDate
            }
        } else {
            if (data.completionDate) {
                endTime = data.completionDate
            } else {
                endTime = created || currentTime
            }
        }

        // Calculate the difference in seconds
        const timeDifferenceSeconds = currentTime - endTime

        // Return "0 Hours" if the end time is in the future
        if (timeDifferenceSeconds < 0) {
            return '0 hrs'
        }

        // Calculate the number of days and remaining hours
        const days = Math.floor(timeDifferenceSeconds / 86400)
        const remainingHours = Math.floor((timeDifferenceSeconds % 86400) / 3600)

        if (days === 0) return `${remainingHours} hrs`

        return `${days} days : ${remainingHours} hrs`
    } catch (error) {
        console.error('Error calculating ALSC:', error)
        return null
    }
}
