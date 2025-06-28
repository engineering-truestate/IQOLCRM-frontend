import React from 'react'
import { useNavigate } from 'react-router'

interface BreadcrumbProps {
    link: string
    parent: string
    child: string
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ link, parent, child }) => {
    const navigate = useNavigate()

    return (
        <div className='text-sm text-gray-500 mb-2'>
            <span onClick={() => navigate(link)} className='cursor-pointer hover:text-gray-700'>
                {parent}
            </span>
            <span className='mx-2'>/</span>
            <span className='text-black font-medium'>{child}</span>
        </div>
    )
}

export default Breadcrumb
