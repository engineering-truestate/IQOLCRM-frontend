// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { acnMenuItems, truestateMenuItems } from './menu-options/acn';
// import { canvasHomesMenuItems } from './menu-options/canvas-homes';
// import downicon from '../../../public/icons/acn/sidebar/downarrow.svg';
// import ACNlogo from '../../../public/icons/acn/sidebar/ACNlogoicon.svg';
// import Truestatelogo from '../../../public/icons/acn/sidebar/Truestateicon.svg';
// import { handleLogout } from '../../services/auth';
// import Button from '../design-elements/Button';
// import useAuth from '../../hooks/useAuth';

// const platforms = ['ACN', 'canvas-homes', 'truestate'];

// const platformLogos: Record<string, string> = {
//   'ACN': ACNlogo,
//   'truestate': Truestatelogo,
//   'canvas-homes': '', // Add logo path if available
// };

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();

//   const [platformState, setPlatformState] = useState('ACN');
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   const getMenuItems = () => {
//     switch (platformState) {
//       case 'ACN':
//         return acnMenuItems;
//       case 'canvas-homes':
//         return canvasHomesMenuItems;
//       case 'truestate':
//         return truestateMenuItems;
//       default:
//         return [];
//     }
//   };

//   const menuItems = getMenuItems();

//   return (
//     <div className="flex flex-col w-[220px] h-screen bg-[#F7F7F7] border-r border-[#ececec] sticky top-0 z-10">

//       {/* Platform Selector */}
//       <div className="relative px-4 py-4">
//         <div
//           className="flex justify-between items-center cursor-pointer"
//           onClick={() => setDropdownOpen((prev) => !prev)}
//         >
//           <div className="flex items-center gap-2">
//             {platformLogos[platformState] && (
//               <img
//                 src={platformLogos[platformState]}
//                 alt={`${platformState} logo`}
//                 className="w-8 h-8"
//               />
//             )}
//             <div className="flex flex-col text-left">
//               <p className="text-[14px] font-semibold">{platformState}</p>
//               <p className="text-[13px] font-normal text-[#3A3A47] truncate w-[120px]">
//                 {user?.displayName || 'Name'}
//               </p>
//             </div>
//           </div>
//           <img
//             src={downicon}
//             alt="Dropdown icon"
//             className={`w-4 h-4 transform transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}
//           />
//         </div>

//         {/* Dropdown Menu */}
//         {dropdownOpen && (
//           <nav className=" realtive mt-2 w-full ">
//         <ul className="flex flex-col px-2 py-3">
//           {menuItems.map((item) => {
//             const isActive = location.pathname === item.path;
//             return (
//               <li key={item.label}>
//                 <div
//                   className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer font-medium text- transition ${
//                     isActive ? 'bg-white' : 'bg-white'
//                   }`}
//                   onClick={() => navigate(item.path)}
//                 >
//                   <img
//                     src={item.icon}
//                     alt={`${item.label} icon`}
//                     className="w-5 h-5"
//                   />
//                   <span className="text-base">{item.label}</span>
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>
//         )}
//       </div>

//       {/* Menu Items */}
//       <nav className="mt-2 w-full">
//         <ul className="flex flex-col px-2 py-3">
//           {menuItems.map((item) => {
//             const isActive = location.pathname === item.path;
//             return (
//               <li key={item.label}>
//                 <div
//                   className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer font-medium text- transition ${
//                     isActive ? 'bg-white' : 'bg-[#F7F7F7] hover:bg-white'
//                   }`}
//                   onClick={() => navigate(item.path)}
//                 >
//                   <img
//                     src={item.icon}
//                     alt={`${item.label} icon`}
//                     className="w-5 h-5"
//                   />
//                   <span className="text-base">{item.label}</span>
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>

//       {/* Profile Section - Only for 'truestate' */}
//       {platformState === 'truestate' && (
//         <div className="px-2 py-1 bg-white shadow-inner rounded-md mx-2 mt-2">
//           <h1 className="text-[14px] font-['IBM_Plex_Sans']">Profile</h1>
//           <div className="flex items-center gap-2 mb-4 mt-2">
//             <img
//               src={
//                 user?.photoURL ||
//                 'https://ui-avatars.com/api/?name=' + (user?.displayName || user?.email || 'User')
//               }
//               alt="Profile"
//               className="w-9 h-9 rounded-full border"
//             />
//             <div>
//               <p className="text-sm font-normal text-[#3A3A47] truncate w-[120px]">
//                 {user?.displayName || 'Name'}
//               </p>
//               <p className="text-[13px] text-gray-500 truncate w-[120px]">
//                 {user?.email}
//               </p>
//             </div>
//           </div>

//           <div className="pt-2">
//             <Button onClick={() => handleLogout(navigate)}>
//               <span>Logout</span>
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Sidebar;

// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { acnMenuItems, truestateMenuItems} from './menu-options/acn';
// import { canvasHomesMenuItems } from './menu-options/canvas-homes';
// import downicon from '../../../public/icons/acn/sidebar/downarrow.svg';
// import ACNlogo from '../../../public/icons/acn/sidebar/ACNlogoicon.svg';
// import Truestatelogo from '../../../public/icons/acn/sidebar/Truestateicon.svg';
// import { handleLogout } from '../../services/auth';
// import Button from '../design-elements/Button';
// import useAuth from '../../hooks/useAuth';
// import ACNicon from '../../../public/icons/acn/sidebar/ACNlogoicon.svg'
// import Restakeicon from '../../../public/icons/acn/sidebar/Restackicon.svg'
// import Vaulticon from '../../../public/icons/acn/sidebar/Vaulticon.svg'
// import CanvasHomesicon from '../../../public/icons/acn/sidebar/cold.svg'
// import Truestateicon from '../../../public/icons/acn/sidebar/Truestateicon.svg'
// export const Options=[
//      { label: 'ACN', path: '/acn/agents',icon: ACNicon  },
//     { label: 'Restack', path: '/acn/leads',icon:Restakeicon },
//     { label: 'Vault', path: '/acn/requirements',icon:Vaulticon},
//     { label: 'Canvas Home', path: '/acn/properties',icon:CanvasHomesicon},
//     { label: 'Truestate', path: '/acn/properties',icon:Truestateicon},
// ]
// const platforms = ['ACN', 'canvas-homes', 'truestate'];

// const platformLogos: Record<string, string> = {
//   'ACN': ACNlogo,
//   'truestate': Truestatelogo,
//   'canvas-homes': '', // Add logo path if available
// };

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();

//   const [platformState, setPlatformState] = useState('ACN');
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   const getMenuItems = () => {
//     switch (platformState) {
//       case 'ACN':
//         return acnMenuItems;
//       case 'canvas-homes':
//         return canvasHomesMenuItems;
//       case 'truestate':
//         return truestateMenuItems;
//       default:
//         return [];
//     }
//   };

//   const menuItems = getMenuItems();

//   return (
//     <div className="flex flex-col w-[220px] h-screen bg-[#F7F7F7] border-r border-[#ececec] sticky top-0 z-10">
//       {/* Platform Selector */}
//       <div className="relative px-4 py-4">
//         <div
//           className="flex justify-between items-center cursor-pointer"
//           onClick={() => setDropdownOpen((prev) => !prev)}
//         >
//           <div className="flex items-center gap-2">
//             {platformLogos[platformState] && (
//               <img
//                 src={platformLogos[platformState]}
//                 alt={`${platformState} logo`}
//                 className="w-8 h-8"
//               />
//             )}
//             <div className="flex flex-col text-left">
//               <p className="text-[14px] font-semibold">{platformState}</p>
//               <p className="text-[13px] font-normal text-[#3A3A47] truncate w-[120px]">
//                 {user?.displayName || 'Name'}
//               </p>
//             </div>
//           </div>
//           <img
//             src={downicon}
//             alt="Dropdown icon"
//             className={`w-4 h-4 transform transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}
//           />
//         </div>

//         {/* Dropdown Menu OVER menu items */}
//         {dropdownOpen && (
//   <nav className="absolute left-4 top-full mt-2 w-[192px] bg-white shadow-md rounded-md z-20 border">
//     <ul className="flex flex-col px-2 py-2">
//       {Options.map((item) => {
//         const isActive = location.pathname === item.path;
//         return (
//           <li key={item.label}>
//             <div
//               className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer font-medium text-[16px] transition ${
//                 isActive ? 'bg-white' : 'hover:bg-[#F7F7F7]'
//               }`}
//               onClick={() => {
//                 setDropdownOpen(false);
//                 navigate(item.path);
//               }}
//             >
//               <img
//                 src={item.icon}
//                 alt={`${item.label} icon`}
//                 className="w-5 h-5"
//               />
//               <span>{item.label}</span>
//             </div>
//           </li>
//         );
//       })}
//     </ul>
//   </nav>
// )}

//       </div>

//       {/* Menu Items */}
//       <nav className="mt-2 w-full">
//         <ul className="flex flex-col px-2 py-3">
//           {menuItems.map((item) => {
//             const isActive = location.pathname === item.path;
//             return (
//               <li key={item.label}>
//                 <div
//                   className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-[16px] text-[#515162] transition ${
//                     isActive ? 'bg-white' : 'bg-[#F7F7F7] hover:bg-white'
//                   }`}
//                   onClick={() => navigate(item.path)}
//                 >
//                   <img
//                     src={item.icon}
//                     alt={`${item.label} icon`}
//                     className="w-5 h-5"
//                   />
//                   <span>{item.label}</span>
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>

//       {/* Profile Section - Only for 'truestate' */}
//       {platformState === 'truestate' && (
//         <div className="px-2 py-1 bg-white shadow-inner rounded-md mx-2 mt-2">
//           <h1 className="text-[14px] font-['IBM_Plex_Sans']">Profile</h1>
//           <div className="flex items-center gap-2 mb-4 mt-2">
//             <img
//               src={
//                 user?.photoURL ||
//                 'https://ui-avatars.com/api/?name=' + (user?.displayName || user?.email || 'User')
//               }
//               alt="Profile"
//               className="w-9 h-9 rounded-full border"
//             />
//             <div>
//               <p className="text-sm font-normal text-[#3A3A47] truncate w-[120px]">
//                 {user?.displayName || 'Name'}
//               </p>
//               <p className="text-[13px] text-gray-500 truncate w-[120px]">
//                 {user?.email}
//               </p>
//             </div>
//           </div>

//           <div className="pt-2">
//             <Button onClick={() => handleLogout(navigate)}>
//               <span>Logout</span>
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Sidebar;
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { acnMenuItems, truestateMenuItems, RestackItems, canvasMenuItems } from './menu-options/acn'
import { canvasHomesMenuItems } from './menu-options/canvas-homes'
import downicon from '../../../public/icons/acn/sidebar/downarrow.svg'
import ACNlogo from '../../../public/icons/acn/sidebar/ACNlogoicon.svg'
import Truestatelogo from '../../../public/icons/acn/sidebar/Truestateicon.svg'
import { handleLogout } from '../../services/auth'
import Button from '../design-elements/Button'
import useAuth from '../../hooks/useAuth'

import ACNicon from '../../../public/icons/acn/sidebar/ACNlogoicon.svg'
import Restakeicon from '../../../public/icons/acn/sidebar/Restackicon.svg'
import Vaulticon from '../../../public/icons/acn/sidebar/Vaulticon.svg'
import CanvasHomesicon from '../../../public/icons/acn/sidebar/cold.svg'
import Truestateicon from '../../../public/icons/acn/sidebar/Truestateicon.svg'
import Restackicon from '../../../public/icons/acn/sidebar/restackicon1.svg'
import canvas from '../../../public/icons/acn/sidebar/canvas.svg'
export const Options = [
    { label: 'ACN', path: '/acn/agents', icon: ACNicon },
    { label: 'Restack', path: '/acn/leads', icon: Restackicon },
    { label: 'Vault', path: '/acn/requirements', icon: Vaulticon },
    { label: 'Canvas Home', path: '/acn/properties', icon: canvas },
    { label: 'Truestate', path: '/acn/properties', icon: Truestateicon },
]

const platformLogos: Record<string, string> = {
    ACN: ACNlogo,
    Truestate: Truestatelogo,
    'Canvas Home': canvas, // Add logo if needed
    Restack: Restackicon,
}

const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()

    const [platformState, setPlatformState] = useState('ACN')
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const getMenuItems = () => {
        switch (platformState) {
            case 'ACN':
                return acnMenuItems
            case 'Canvas Home':
                return canvasMenuItems
            case 'Truestate':
                return truestateMenuItems
            case 'Restack':
                return RestackItems
            default:
                return []
        }
    }

    const menuItems = getMenuItems()

    return (
        <div className='flex flex-col w-[220px] h-screen bg-[#F7F7F7] border-r border-[#ececec] sticky top-0 z-10'>
            {/* Platform Selector */}
            <div className='relative px-4 py-4'>
                <div
                    className='flex justify-between items-center cursor-pointer'
                    onClick={() => setDropdownOpen((prev) => !prev)}
                >
                    <div className='flex items-center gap-2'>
                        {platformLogos[platformState] && (
                            <img src={platformLogos[platformState]} alt={`${platformState} logo`} className='w-8 h-8' />
                        )}
                        <div className='flex flex-col text-left'>
                            <p className='text-[14px] font-semibold'>{platformState}</p>
                            <p className='text-[13px] font-normal text-[#3A3A47] truncate w-[120px]'>
                                {user?.displayName || 'Name'}
                            </p>
                        </div>
                    </div>
                    <img
                        src={downicon}
                        alt='Dropdown icon'
                        className={`w-4 h-4 transform transition-transform duration-200 ${
                            dropdownOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                    />
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                    <nav className='absolute left-4 top-full mt-2 w-[192px] bg-white shadow-md rounded-md z-20 border-white'>
                        <ul className='flex flex-col px-2 py-2'>
                            {Options.map((item) => (
                                <li key={item.label}>
                                    <div
                                        className='flex items-center gap-3 px-3 py-2 h-[44px] rounded-md cursor-pointer text-[16px] text-[#515162] transition hover:bg-[#F7F7F7]'
                                        onClick={() => {
                                            setPlatformState(item.label)
                                            setDropdownOpen(false)
                                            navigate(item.path)
                                        }}
                                    >
                                        <img src={item.icon} alt={`${item.label} icon`} className='w-5 h-5' />
                                        <span>{item.label}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Always Visible Profile Section */}
                        <div className='px-3 py-3 border-white'>
                            <h1 className="text-[14px] font-['IBM_Plex_Sans'] mb-2">Profile</h1>
                            <div className='flex items-center gap-2 mb-4'>
                                <img
                                    src={
                                        user?.photoURL ||
                                        'https://ui-avatars.com/api/?name=' +
                                            (user?.displayName || user?.email || 'User')
                                    }
                                    alt='Profile'
                                    className='w-9 h-9 rounded-full border'
                                />
                                <div>
                                    <p className='text-sm font-normal text-[#3A3A47] truncate w-[120px]'>
                                        {user?.displayName || 'Name'}
                                    </p>
                                    <p className='text-[13px] text-gray-500 truncate w-[120px]'>{user?.email}</p>
                                </div>
                            </div>

                            <Button onClick={() => handleLogout(navigate)}>
                                <span>Logout</span>
                            </Button>
                        </div>
                    </nav>
                )}
            </div>

            {/* Menu Items */}
            <nav className='mt-2 w-full'>
                <ul className='flex flex-col px-2 py-3'>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <li key={item.label}>
                                <div
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-[16px] text-[#515162] transition ${
                                        isActive ? 'bg-white' : 'bg-[#F7F7F7] hover:bg-white'
                                    }`}
                                    onClick={() => navigate(item.path)}
                                >
                                    <img src={item.icon} alt={`${item.label} icon`} className='w-5 h-5' />
                                    <span>{item.label}</span>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </div>
    )
}

export default Sidebar
