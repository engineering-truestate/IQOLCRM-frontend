import type { Lead, Task, Enquiry } from '../../services/canvas_homes/types'
import { getUnixDateTime } from './getUnixDateTime'

export async function calculateALSC(data: Lead, tasks: Task[], enquiries: Enquiry[]): Promise<string | null> {
    // Return null if no added timestamp is available
    if (!data.added) {
        return null
    }

    try {
        // Ensure the lead has an ID
        if (!data.leadId) {
            return null
        }

        // Filter open tasks with scheduled dates
        const openTasksWithSchedule = tasks.filter((task) => task.status === 'open' && task.scheduledDate)
        let endTime: number

        if (openTasksWithSchedule.length > 0) {
            // Find the earliest task (smallest scheduled date)
            const earliestTask = openTasksWithSchedule.reduce((earliest, current) => {
                return current.scheduledDate < earliest.scheduledDate ? current : earliest
            })

            // Compare and choose the smaller date between earliestTask.scheduledDate and lastModified
            if (data.lastModified && earliestTask.scheduledDate < data.lastModified) {
                endTime = data.lastModified
            } else {
                endTime = earliestTask.scheduledDate
            }
        } else {
            if (data.lastModified) {
                // Fallback to lead's last modified date if no latest enquiry or its lastModified is missing
                endTime = data.lastModified
            } else {
                return null // No valid end time found
            }
        }

        const currentTime = getUnixDateTime() // Current time in Unix timestamp (seconds)

        // Calculate the difference in seconds
        const timeDifferenceSeconds = currentTime - endTime

        // Return "0 Hours" if the end time is in the future
        if (timeDifferenceSeconds < 0) {
            return '0 hrs'
        }

        // Calculate the number of days and remaining hours
        const days = Math.floor(timeDifferenceSeconds / (60 * 60 * 24))
        const remainingHours = Math.floor((timeDifferenceSeconds % (60 * 60 * 24)) / (60 * 60))

        if (days === 0) return `${remainingHours} hrs`

        return `${days} days : ${remainingHours} hrs`
    } catch (error) {
        console.error('Error calculating ALSC:', error)
        return null
    }
}
