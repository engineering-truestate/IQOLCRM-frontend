import React from 'react'
import Layout from '../../../../layout/Layout'
import PostReraDocument from '../../../../components/restack/PostReraDocument'

const PostReraDocumentPage: React.FC = () => {
    return (
        <Layout loading={false}>
            <div className='w-full overflow-hidden font-sans'>
                <div className='py-4 px-6 bg-white min-h-screen'>
                    <PostReraDocument />
                </div>
            </div>
        </Layout>
    )
}

export default PostReraDocumentPage
