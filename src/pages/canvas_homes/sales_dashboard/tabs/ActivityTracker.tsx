import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import TaskExecutionCard from '../../../../components/canvas_homes/activity_tracker_cards/TaskExecutionCard'
import TaskCreatedCard from '../../../../components/canvas_homes/activity_tracker_cards/TaskCreatedCard'
import ChangeAgentCard from '../../../../components/canvas_homes/activity_tracker_cards/ChangeAgentCard'
import NewEnquiryCard from '../../../../components/canvas_homes/activity_tracker_cards/NewEnquiryCard'
import PropertyChangeCard from '../../../../components/canvas_homes/activity_tracker_cards/PropertyChangeCard'
import LeadStateCard from '../../../../components/canvas_homes/activity_tracker_cards/LeadStateCard'
import LeadAddedCard from '../../../../components/canvas_homes/activity_tracker_cards/LeadAddedCard'
import { enquiryService } from '../../../../services/canvas_homes/enquiryService'
import { UseLeadDetails } from '../../../../hooks/canvas_homes/UseLeadDetails'

interface RootState {
    taskId: {
        enquiryId: string
    }
}

interface ActivityHistoryItem {
    activityType: string
    timestamp: number
    agentName: string
    data?: any
}

const ActivityTracker: React.FC = (enquiryId) => {
    const [groupedActivities, setGroupedActivities] = useState<Record<string, ActivityHistoryItem[]>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { leadId } = useParams()

    // Set selected enquiry ID when component mounts

    useEffect(() => {
        const fetchActivityHistory = async () => {
            if (!enquiryId) {
                setError('No enquiry selected')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)

                const activities = await enquiryService.getActivityHistory(enquiryId.enquiryId)

                if (!activities || activities.length === 0) {
                    setGroupedActivities({})
                    setLoading(false)
                    return
                }

                // Group activities by date
                const groupByDate = (activityList: ActivityHistoryItem[]) => {
                    const groups: Record<string, ActivityHistoryItem[]> = {}

                    activityList.forEach((activity) => {
                        // Convert Unix timestamp to milliseconds if needed
                        const timestamp = activity.timestamp * 1000 // Assuming Unix timestamp in seconds
                        const date = new Date(timestamp)
                        const dateStr = date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })

                        if (!groups[dateStr]) {
                            groups[dateStr] = []
                        }

                        // Update the activity with corrected timestamp
                        groups[dateStr].push({
                            ...activity,
                            timestamp: timestamp,
                        })
                    })

                    // Sort activities within each date group by timestamp (ascending order)
                    Object.keys(groups).forEach((date) => {
                        groups[date].sort((a, b) => a.timestamp - b.timestamp)
                    })

                    return groups
                }

                setGroupedActivities(groupByDate(activities))
            } catch (err) {
                console.error('Error fetching activity history:', err)
                setError('Failed to load activity history')
            } finally {
                setLoading(false)
            }
        }

        fetchActivityHistory()
    }, [enquiryId])

    // Render the appropriate card based on activity type
    const renderActivityCard = (activity: ActivityHistoryItem, index: number) => {
        switch (activity.activityType) {
            case 'task execution':
                return <TaskExecutionCard key={index} activity={activity} />
            case 'task created':
                return <TaskCreatedCard key={index} activity={activity} />
            case 'agent transfer':
                return <ChangeAgentCard key={index} activity={activity} />
            case 'new enquiry':
                return <NewEnquiryCard key={index} activity={activity} />
            case 'property change':
                return <PropertyChangeCard key={index} activity={activity} />
            case 'lead closed':
                return <LeadStateCard key={index} activity={activity} />
            case 'lead added':
                return <LeadAddedCard key={index} activity={activity} />
            default:
                return (
                    <div key={index} className='bg-gray-50 p-3 rounded-md border'>
                        <div className='text-sm font-medium text-gray-800'>{activity.activityType}</div>
                        <div className='text-xs text-gray-600 mt-1'>
                            By {activity.agentName} • {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                )
        }
    }

    // Format date for display in header
    const formatDateDisplay = (dateStr: string): string => {
        const date = new Date(dateStr)
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`
    }

    if (loading) {
        return (
            <div className='bg-white h-[calc(100vh-110.4px)] overflow-auto p-4 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                    <p className='text-gray-600'>Loading activity history...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='bg-white h-[calc(100vh-110.4px)] overflow-auto p-4 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='text-red-500 mb-4'>
                        <svg className='w-12 h-12 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                        </svg>
                        <p className='font-medium'>Error loading activities</p>
                    </div>
                    <p className='text-gray-600 mb-4'>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (Object.keys(groupedActivities).length === 0) {
        return (
            <div className='bg-white h-[calc(100vh-110.4px)] overflow-auto p-4 flex items-center justify-center'>
                <div className='text-center text-gray-500'>
                    <svg
                        className='w-12 h-12 mx-auto mb-4 text-gray-300'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
                        />
                    </svg>
                    <p className='text-lg font-medium text-gray-900 mb-2'>No activities yet</p>
                    <p className='text-gray-600'>
                        Activities will appear here as actions are performed on this enquiry
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className='bg-white h-[calc(100vh-110.4px)] overflow-auto p-4'>
            <div className='flex flex-col'>
                {Object.entries(groupedActivities)
                    .sort(([dateA], [dateB]) => {
                        // Sort dates in descending order (newest first)
                        return new Date(dateB).getTime() - new Date(dateA).getTime()
                    })
                    .map(([date, activities]) => (
                        <div key={date} className='relative mb-8'>
                            {/* Date header with blue dot */}
                            <div className='flex items-center mb-4 ml-4'>
                                <div className='absolute left-0 w-4 h-4 bg-blue-500 rounded-full'></div>
                                <div className='text-sm text-blue-500 font-medium ml-6'>{formatDateDisplay(date)}</div>
                            </div>

                            {/* Activity cards for this date */}
                            <div className='border-l border-gray-200 ml-2 pl-4'>
                                {activities.map((activity, index) => (
                                    <div key={`${activity.timestamp}-${index}`} className='relative mb-4'>
                                        {/* Three horizontal dots */}
                                        <div className='absolute left-[-12px] top-[50%] transform translate-y-[-50%]'>
                                            <div className='flex flex-row items-center gap-[2px]'>
                                                <div className='w-[6px] h-[6px] bg-gray-400 rounded-full'></div>
                                                <div className='w-[6px] h-[6px] bg-gray-400 rounded-full'></div>
                                                <div className='w-[6px] h-[6px] bg-gray-400 rounded-full'></div>
                                            </div>
                                        </div>
                                        {renderActivityCard(activity, index)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    )
}

export default ActivityTracker
