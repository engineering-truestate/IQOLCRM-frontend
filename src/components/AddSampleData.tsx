import React from 'react'
import { addSamplePrimaryData } from '../utils/addSampleData'
import Button from './design-elements/Button'

const AddSampleData: React.FC = () => {
    const handleAddSampleData = async () => {
        try {
            await addSamplePrimaryData()
            alert('Sample data added successfully!')
        } catch (error) {
            console.error('Error adding sample data:', error)
            alert('Error adding sample data. Check console for details.')
        }
    }

    return (
        <div className='p-4'>
            <Button
                onClick={handleAddSampleData}
                className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
            >
                Add Sample Primary Data
            </Button>
        </div>
    )
}

export default AddSampleData
