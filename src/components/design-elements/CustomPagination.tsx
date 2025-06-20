import React from 'react'

interface CustomPaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    isMobile?: boolean
    className?: string
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    isMobile = false,
    className = '',
}) => {
    // Function to generate the pages to display in pagination
    const generatePages = () => {
        const pages: (number | string)[] = []
        const pageWindow = isMobile ? 1 : 3
        const totalVisiblePages = 2 * pageWindow + 1

        let startPage = Math.max(1, currentPage - pageWindow)
        let endPage = Math.min(totalPages, currentPage + pageWindow)

        // Adjust for pages near the start or end
        if (currentPage <= pageWindow) {
            endPage = Math.min(totalPages, totalVisiblePages)
        } else if (currentPage + pageWindow >= totalPages) {
            startPage = Math.max(1, totalPages - totalVisiblePages + 1)
        }

        // Add the first page and ellipsis if needed
        if (startPage > 1) {
            pages.push(1)
            if (startPage > 2) pages.push('...')
        }

        // Add pages within the range
        for (let page = startPage; page <= endPage; page++) {
            pages.push(page)
        }

        // Add last page and ellipsis if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('...')
            pages.push(totalPages)
        }

        return pages
    }

    const pages = generatePages()

    return (
        <div className={`py-4 w-full flex justify-center ${className}`}>
            <ul className='inline-flex items-center space-x-2'>
                {/* Previous Button */}
                {/* <li
                    className={`flex items-center justify-center px-2 py-2 bg-gray-100 border border-gray-300 rounded text-gray-600 hover:border-gray-400 cursor-pointer transition-colors ${
                        currentPage === 1 ? 'cursor-not-allowed text-gray-400' : ''
                    }`}
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                >
                    <svg className='w-4 md:w-5 h-4 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                    </svg>
                </li> */}

                {/* Page Numbers */}
                {pages.map((page, index) =>
                    page === '...' ? (
                        <li
                            key={`ellipsis-${index}`}
                            className='flex items-center justify-center px-2 py-2 text-gray-500'
                        >
                            ...
                        </li>
                    ) : (
                        <li
                            key={`page-${page}`}
                            className={`flex items-center justify-center w-10 h-10 border border-gray-300 rounded-[4px] text-gray-600 hover:bg-gray-100 hover:border-gray-400 cursor-pointer transition-colors ${
                                currentPage === page
                                    ? 'bg-[#24252E] text-white hover:text-white border-blue-600'
                                    : 'bg-[#F3F3F3] text-[#3A3A47]'
                            }`}
                            onClick={() => onPageChange(page as number)}
                        >
                            {page}
                        </li>
                    ),
                )}

                {/* Next Button */}
                {/* <li
                    className={`flex items-center justify-center px-2 py-2 bg-gray-100 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 hover:border-gray-400 cursor-pointer transition-colors ${
                        currentPage === totalPages ? 'cursor-not-allowed text-gray-400' : ''
                    }`}
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                >
                    <svg className='w-4 md:w-5 h-4 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                    </svg>
                </li> */}
            </ul>
        </div>
    )
}

export default CustomPagination
