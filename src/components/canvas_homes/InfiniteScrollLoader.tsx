import React, { useEffect, useState } from 'react'

interface InfiniteScrollLoaderProps {
    hasNextPage: boolean
    isLoadingMore: boolean
    onLoadMore: () => void
    className?: string
    threshold?: number
}

const InfiniteScrollLoader: React.FC<InfiniteScrollLoaderProps> = ({
    hasNextPage,
    isLoadingMore,
    onLoadMore,
    className = '',
    // threshold = 0.8, // Default threshold when scrolling to the bottom (80%)
}) => {
    const [isNearBottom, setIsNearBottom] = useState(false)

    const checkScroll = () => {
        const scrollableElement = document.documentElement || document.body
        const bottom = scrollableElement.scrollHeight - scrollableElement.scrollTop === scrollableElement.clientHeight
        setIsNearBottom(bottom)
    }

    useEffect(() => {
        window.addEventListener('scroll', checkScroll)
        return () => {
            window.removeEventListener('scroll', checkScroll)
        }
    }, [])

    useEffect(() => {
        if (isNearBottom && hasNextPage && !isLoadingMore) {
            onLoadMore()
        }
    }, [isNearBottom, hasNextPage, isLoadingMore, onLoadMore])

    if (!hasNextPage) return null

    return (
        <div className={`flex justify-center py-4 ${className}`}>
            {isLoadingMore ? (
                <div className='flex items-center space-x-2'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                    <span className='text-gray-600'>Loading more leads...</span>
                </div>
            ) : (
                <div className='text-gray-400 text-sm'>Scroll for more</div>
            )}
        </div>
    )
}

export default InfiniteScrollLoader
