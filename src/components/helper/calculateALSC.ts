import type { Lead } from '../../services/canvas_homes'
import { getUnixDateTime } from './getUnixDateTime'
import { UseLeadDetails } from '../../hooks/canvas_homes/useLeadDetails'

export async function calculateALSC(data: Lead): Promise<string | null> {
    // Return null if no added timestamp is available
    if (!data.added) {
        return null
    }

    try {
        // Ensure the lead has an ID
        if (!data.leadId) {
            return null
        }

        // Fetch tasks using the lead's ID
        const { tasks } = UseLeadDetails(data.leadId)

        // Filter open tasks with scheduled dates
        const openTasksWithSchedule = tasks.filter((task) => task.status === 'open' && task.scheduledDate)
        let endTime: number

        if (openTasksWithSchedule.length > 0) {
            // Find the earliest task (smallest scheduled date)
            const earliestTask = openTasksWithSchedule.reduce((earliest, current) => {
                return current.scheduledDate < earliest.scheduledDate ? current : earliest
            })

            // Use the earliest task's scheduled date as the end time
            endTime = earliestTask.scheduledDate
        } else {
            // Use the lead's last modified date as the fallback
            if (!data.lastModified) {
                return null
            }
            endTime = data.lastModified
        }

        const currentTime = getUnixDateTime() // Current time in Unix timestamp (seconds)

        // Calculate the difference in seconds
        const timeDifferenceSeconds = currentTime - endTime

        // Return "0 Days : 0 Hours" if the end time is in the future
        if (timeDifferenceSeconds < 0) {
            return '0 Days : 0 Hours'
        }

        // Calculate the number of days and remaining hours
        const days = Math.floor(timeDifferenceSeconds / (60 * 60 * 24))
        const remainingHours = Math.floor((timeDifferenceSeconds % (60 * 60 * 24)) / (60 * 60))

        return `${days} Days : ${remainingHours} Hours`
    } catch (error) {
        console.error('Error calculating ALSC:', error)
        return null
    }
}
