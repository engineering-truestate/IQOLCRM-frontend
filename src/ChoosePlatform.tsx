import { useNavigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'

const options = [
    {
        name: 'ACN',
        value: 'acn',
        path: '/acn/leads',
    },
    {
        name: 'Canvas Homes',
        value: 'canvas-homes',
        path: '/canvas-homes/home',
    },
    {
        name: 'Vault',
        value: 'vault',
        path: '/vault/dashboard',
    },
    {
        name: 'TrueState',
        value: 'truestate',
        path: '/truestate/dashboard',
    },
    {
        name: 'Restack',
        value: 'restack',
        path: '/restack/primary',
    },
]

const ChoosePlatform = () => {
    const navigate = useNavigate()
    const { loading, platform } = useAuth()

    if (platform) {
        let totalAvailablePlatforms = 0
        for (let i = 0; i < platform.length; i++) {
            if (platform[i].role) {
                totalAvailablePlatforms++
            }
        }
        if (totalAvailablePlatforms === 1) {
            for (let i = 0; i < platform.length; i++) {
                if (platform[i].role) {
                    navigate(options[i].path)
                }
            }
        }
    }

    const handleNavigate = (path: string) => {
        navigate(path)
    }
    return loading ? (
        <div>Loading...</div>
    ) : (
        <div>
            <h1>Choose Platform</h1>
            {options.map((option) => (
                <div key={option.value} onClick={() => handleNavigate(option.path)}>
                    <h2>{option.name}</h2>
                </div>
            ))}
        </div>
    )
}

export default ChoosePlatform
