import React, { useState, useEffect } from 'react'
import type { Lead, Task, Enquiry } from '../../services/canvas_homes/types'
import { UseLeadDetails } from '../../hooks/canvas_homes/useLeadDetails'
import { calculateALSC } from '../helper/calculateALSC'
import { taskService } from '../../services/canvas_homes'

interface ASLCRendererProps {
    lead: Lead
}

const getAslcColor = (aslcString: string): string => {
    if (!aslcString) return 'text-gray-500'

    const dayMatch = aslcString.match(/(\d+)\s+days?/)
    const hourMatch = aslcString.match(/(\d+)\s+hrs?/)

    const days = dayMatch ? parseInt(dayMatch[1], 10) : 0
    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0
    const totalHours = days * 24 + hours

    if (totalHours <= 6) {
        return 'bg-[#EFEFEF] border border-[#8F8FA2]'
    } else if (totalHours > 6 && totalHours <= 12) {
        return 'bg-[#FFF1D4] border border-[#FCCE74]'
    } else if (totalHours >= 13 && totalHours <= 24) {
        return 'bg-[#FFDDDE] border border-[#F02532]'
    } else if (totalHours > 24) {
        return 'bg-[#FAC8C9] border border-[#A4151E]'
    }
    return 'text-gray-500'
}

const ASLCRenderer: React.FC<ASLCRendererProps> = ({ lead }) => {
    const [aslc, setAslc] = useState<string | null>(null)
    const { enquiries } = UseLeadDetails(lead.leadId || '')

    useEffect(() => {
        let isMounted = true
        const fetchAndCalculate = async () => {
            if (!lead || !enquiries) {
                setAslc(null)
                return
            }

            let tasksToPass: Task[] = []

            // Find the latest enquiry based on 'added' timestamp
            const latestEnquiry = enquiries.reduce(
                (latest, current) => {
                    if (current.lastModified) {
                        if (!latest || !latest.lastModified || current?.lastModified > latest?.lastModified) {
                            return current
                        }
                    }
                    return latest
                },
                null as Enquiry | null,
            )

            if (latestEnquiry && latestEnquiry.enquiryId) {
                try {
                    // Fetch tasks specifically for the latest enquiry
                    const fetchedTasksForLatestEnquiry = await taskService.getByEnquiryId(latestEnquiry.enquiryId)
                    tasksToPass = fetchedTasksForLatestEnquiry
                } catch (error) {
                    console.error('Failed to fetch tasks for latest enquiry:', error)
                    // If fetching fails, tasksToPass remains empty, which is handled by calculateALSC
                }
            }

            // Pass the lead, the determined tasks (from latest enquiry), and all enquiries to calculateALSC
            const result = await calculateALSC(lead, tasksToPass, latestEnquiry?.added || null)
            if (isMounted) {
                setAslc(result)
            }
        }

        fetchAndCalculate()

        return () => {
            isMounted = false
        }
    }, [lead, enquiries])

    return (
        <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAslcColor(aslc ?? '')}`}
        >
            {aslc}
        </span>
    )
}

export default ASLCRenderer
