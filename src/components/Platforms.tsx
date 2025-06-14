import { useEffect } from 'react'
import Dropdown from './design-elements/Dropdown'
// import { useDispatch, useSelector } from 'react-redux'
import { setSelectedPlatform, initializePlatform } from '../store/reducers/platformSlice'
import type { RootState } from '../store'

//

// import { useMemo } from 'react';

const Platforms = () => {
    // const dispatch = useDispatch();
    // const selectedPlatform = useSelector((state: RootState) => state.platform.selectedPlatform);

    // const tabs = useMemo(() => [
    //     { label: 'Truestate', value: 'truestate' },
    //     { label: 'ACN', value: 'acn' },
    //     { label: 'Vault', value: 'vault' },
    //     { label: 'Canvas Homes', value: 'canvas-homes' },
    //     { label: 'Restack', value: 'restack' },
    // ], []);

    // Initialize from localStorage on mount
    // useEffect(() => {
    //     const savedPlatformValue = localStorage.getItem('selectedPlatform')
    //     if (savedPlatformValue && tabs.some(tab => tab.value === savedPlatformValue)) {
    //         dispatch(initializePlatform(savedPlatformValue))
    //     }
    // }, [dispatch])

    // // Save to localStorage whenever platform value changes
    // useEffect(() => {
    //     localStorage.setItem('selectedPlatform', selectedPlatform)
    // }, [selectedPlatform])

    // const handlePlatformSelect = (platformValue: string) => {
    //     // platformValue is the 'value' field from the selected option
    //     dispatch(setSelectedPlatform(platformValue))
    // }

    return (
        <div>
            <h3>Platforms</h3>
            {/* <Dropdown
                options={tabs} // Array of {label, value} objects
                onSelect={handlePlatformSelect} // Receives the platform value
                className='w-50'
            /> */}
        </div>
    )
}

export default Platforms
