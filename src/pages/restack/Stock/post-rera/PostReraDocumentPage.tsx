import React from 'react'
import Layout from '../../../../layout/Layout'
import PostReraDocument from '../../../../components/restack/PostReraDocument'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { postReraActions } from '../../../../store/actions/restack/postReraActions'
import type { PostReraProperty } from '../../../../store/reducers/restack/postReraTypes'
import type { RootState } from '../../../../store'
import type { AppDispatch } from '../../../../store'

const PostReraDocumentPage: React.FC = () => {
    const { id } = useParams()
    const dispatch = useDispatch<AppDispatch>()
    const { selectedProperty, loading } = useSelector((state: RootState) => state.postRera)
    const [projectDetails, setProjectDetails] = useState<PostReraProperty | null>(null)

    useEffect(() => {
        if (id) {
            dispatch(postReraActions.getPostReraPropertyById(id))
        }
    }, [dispatch, id])

    useEffect(() => {
        if (selectedProperty) {
            setProjectDetails(selectedProperty)
        }
    }, [selectedProperty])

    // Documents are now passed directly as they come from the API
    const documents = projectDetails?.documents || []

    return (
        <Layout loading={loading}>
            <div className='w-full overflow-hidden font-sans'>
                <PostReraDocument documents={documents} />
            </div>
        </Layout>
    )
}

export default PostReraDocumentPage
