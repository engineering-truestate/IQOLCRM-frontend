import { useNavigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import { ClipLoader } from 'react-spinners'

// Import platform icons
import ACNicon from '/icons/acn/sidebar/ACNlogoicon.svg'
import Restackicon from '/icons/acn/sidebar/restackicon1.svg'
import Vaulticon from '/icons/acn/sidebar/Vaulticon.svg'
import canvas from '/icons/acn/sidebar/canvas.svg'
import Truestateicon from '/icons/acn/sidebar/Truestateicon.svg'

const options = [
    {
        name: 'ACN',
        value: 'acn',
        path: '/acn/leads',
        icon: ACNicon,
        description: 'Agent Communication Network - Manage leads, properties, and agent relationships',
        color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
        textColor: 'text-blue-700',
        iconBg: 'bg-blue-100',
    },
    {
        name: 'Canvas Homes',
        value: 'canvas-homes',
        path: '/canvas-homes/home',
        icon: canvas,
        description: 'Real estate marketing and sales platform for property management',
        color: 'bg-green-50 border-green-200 hover:bg-green-100',
        textColor: 'text-green-700',
        iconBg: 'bg-green-100',
    },
    {
        name: 'Vault',
        value: 'vault',
        path: '/vault/dashboard',
        icon: Vaulticon,
        description: 'Secure document management and property vault system',
        color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
        textColor: 'text-purple-700',
        iconBg: 'bg-purple-100',
    },
    {
        name: 'TrueState',
        value: 'truestate',
        path: '/truestate/dashboard',
        icon: Truestateicon,
        description: 'Property verification and state management platform',
        color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
        textColor: 'text-orange-700',
        iconBg: 'bg-orange-100',
    },
    {
        name: 'Restack',
        value: 'restack',
        path: '/restack/primary',
        icon: Restackicon,
        description: 'Property stacking and investment management system',
        color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
        textColor: 'text-indigo-700',
        iconBg: 'bg-indigo-100',
    },
]

const ChoosePlatform = () => {
    const navigate = useNavigate()
    const { loading, platform } = useAuth()

    if (platform) {
        const platformEntries = Object.entries(platform)
        const availablePlatforms = platformEntries.filter(([_, platformData]) => platformData?.role)

        if (availablePlatforms.length === 1) {
            const [platformKey] = availablePlatforms[0]
            const platformOption = options.find(
                (option) =>
                    option.value === platformKey || (platformKey === 'canvasHomes' && option.value === 'canvas-homes'),
            )
            if (platformOption) {
                navigate(platformOption.path)
            }
        }
    }

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    return loading ? (
        <div className='flex justify-center items-center h-screen'>
            <ClipLoader color='#000' />
        </div>
    ) : (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='text-center mb-12'>
                    <h1 className='text-4xl font-bold text-gray-900 mb-4'>Choose Your Platform</h1>
                    <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                        Select the platform you'd like to access. Each platform offers specialized tools and features
                        for different aspects of real estate management.
                    </p>
                </div>

                {/* Platform Cards Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleNavigate(option.path)}
                            className={`
                                ${option.color} ${option.textColor}
                                border-2 rounded-xl p-6 cursor-pointer transition-all duration-300
                                transform hover:scale-105 hover:shadow-lg
                                group relative overflow-hidden
                            `}
                        >
                            {/* Background Pattern */}
                            <div className='absolute inset-0 opacity-5'>
                                <div className='absolute top-0 right-0 w-32 h-32 bg-current rounded-full -translate-y-16 translate-x-16'></div>
                                <div className='absolute bottom-0 left-0 w-24 h-24 bg-current rounded-full translate-y-12 -translate-x-12'></div>
                            </div>

                            {/* Card Content */}
                            <div className='relative z-10'>
                                {/* Icon and Title */}
                                <div className='flex items-center mb-4'>
                                    <div
                                        className={`${option.iconBg} p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <img src={option.icon} alt={`${option.name} icon`} className='w-8 h-8' />
                                    </div>
                                    <h2 className='text-2xl font-bold'>{option.name}</h2>
                                </div>

                                {/* Description */}
                                <p className='text-sm opacity-80 mb-6 leading-relaxed'>{option.description}</p>

                                {/* Action Button */}
                                <div className='flex items-center justify-between'>
                                    <span className='text-sm font-medium opacity-90'>Click to access</span>
                                    <div className='w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M9 5l7 7-7 7'
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Effect Overlay */}
                            <div className='absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl'></div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                {/* <div className='text-center mt-12'>
                    <p className='text-sm text-gray-500'>Need help? Contact your administrator for platform access.</p>
                </div> */}
            </div>
        </div>
    )
}

export default ChoosePlatform
