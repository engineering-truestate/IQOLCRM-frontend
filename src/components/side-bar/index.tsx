import React from 'react'
// import Platforms from '../Platforms'
import { acnMenuItems } from './menu-options/acn'
// import { restackMenuItems } from './menu-options/restack'
// import { useSelector } from 'react-redux'
// import type { RootState } from '../../store'
// import { canvasHomesMenuItems } from './menu-options/canvas-homes'
// import { truestateMenuItems } from './menu-options/truestate'
import { handleLogout } from '../../services/auth'
// import { vaultMenuItems } from './menu-options/vault'
import { useNavigate } from 'react-router-dom'
import Button from '../design-elements/Button'
import useAuth from '../../hooks/useAuth'

// interface MenuItem {
//     label: string
//     path: string
// }

const Sidebar = () => {
    const navigate = useNavigate()
    // const selectedPlatform = useSelector((state: RootState) => state.platform.selectedPlatform)

    // const getMenuItems = (): MenuItem[] => {
    //     switch (selectedPlatform) {
    //         case 'acn':
    //             return acnMenuItems
    //         case 'canvas-homes':
    //             return canvasHomesMenuItems
    //         case 'truestate':
    //             return truestateMenuItems
    //         case 'vault':
    //             return vaultMenuItems
    //         case 'restack':
    //             return restackMenuItems
    //         default:
    //             return truestateMenuItems
    //     }
    // }

    // const menuItems = getMenuItems()

    const { role } = useAuth()

    return (
        <div className='flex flex-col w-[16%] min-h-screen h-full bg-[#F7F7F7] border-r border-[#ececec] sticky top-0 z-10'>
            <div className='px-6 py-4'>{/* <Platforms /> */}</div>

            <nav className='flex-1 mt-2'>
                <ul className='flex flex-col'>
                    {acnMenuItems.map((item) => (
                        <li key={item.label}>
                            <div
                                className='flex items-center gap-3 px-6 py-2 rounded-md cursor-pointer font-medium text-base transition hover:bg-gray-200'
                                onClick={() => navigate(item.path)}
                            >
                                <span>{item.label}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </nav>
            {role === 'admin' && (
                <div className='mt-auto px-6 py-4'>
                    <Button onClick={() => navigate('/register')}>
                        <span>Register</span>
                    </Button>
                </div>
            )}
            <div className='mt-auto px-6 py-4'>
                <Button onClick={() => navigate('/profile')}>
                    <span>Profile</span>
                </Button>
            </div>

            <div className='mt-auto px-6 py-4'>
                <Button onClick={() => handleLogout(navigate)}>
                    <span>Logout</span>
                </Button>
            </div>
        </div>
    )
}

export default Sidebar
