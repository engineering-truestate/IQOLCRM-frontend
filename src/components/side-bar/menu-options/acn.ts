import Agenticon from '../../../../public/icons/acn/sidebar/Agentsicon.svg'
import Leadsicon from '../../../../public/icons/acn/sidebar/Leadsicon.svg'
import Requirementsicon from '../../../../public/icons/acn/sidebar/Requirementsicon.svg'
import Propertiesicon from '../../../../public/icons/acn/sidebar/Propertiesicon.svg'
import QC_Dashboard from '../../../../public/icons/acn/sidebar/QC_Dashboardicon.svg'
import ACNicon from '../../../../public/icons/acn/sidebar/ACNicon.svg'
import Restakeicon from '../../../../public/icons/acn/sidebar/Restackicon.svg'
import Vaulticon from '../../../../public/icons/acn/sidebar/Vaulticon.svg'
import CanvasHomesicon from '../../../../public/icons/acn/sidebar/cold.svg'
import Notifications from '../../../../public/icons/acn/sidebar/notificationicon.svg'
import Dashicon from '../../../../public/icons/acn/sidebar/Dashicon.svg'
import Website from '../../../../public/icons/acn/sidebar/WebsiteDashboard.svg'
import prelaunch from '../../../../public/icons/acn/sidebar/prelaunchicon.svg'
import primary from '../../../../public/icons/acn/sidebar/primary.svg'
import Home from '../../../../public/icons/acn/sidebar/Homeicon.svg'
import Sales from '../../../../public/icons/acn/sidebar/salesicon.svg'
import setting from '../../../../public/icons/acn/sidebar/settingicon.svg'
export const acnMenuItems = [
    { label: 'Agents', path: '/acn/agents', icon: Agenticon },
    { label: 'Leads', path: '/acn/leads', icon: Leadsicon },
    { label: 'Requirements', path: '/acn/requirements', icon: Requirementsicon },
    { label: 'Properties', path: '/acn/properties', icon: Propertiesicon },
    { label: 'QC Dashboard', path: '/acn/qc/dashboard', icon: QC_Dashboard },
]
export const truestateMenuItems = [
    { label: 'Notifications', path: '/', icon: Notifications },
    { label: 'Dashboard', path: '/', icon: Dashicon },
    { label: 'Leads', path: '/', icon: Agenticon },
    { label: 'Website Dashboard', path: '/', icon: Website },
    { label: 'Properties', path: '/', icon: QC_Dashboard },
]
export const MenuItems = [
    { label: 'ACN', path: '/acn/agents', icon: ACNicon },
    { label: 'Restake', path: '/acn/leads', icon: Restakeicon },
    { label: 'Vault', path: '/acn/requirements', icon: Vaulticon },
    { label: 'Canvas Home', path: '/acn/properties', icon: CanvasHomesicon },
]
export const canvasMenuItems = [
    { label: 'Notifications', path: '/', icon: Notifications },
    { label: 'Home', path: '/', icon: Home },
    { label: 'Properties', path: '/', icon: Propertiesicon },
    { label: 'Sales', path: '/', icon: Sales },
    { label: 'Marketing', path: '/', icon: Agenticon },
    { label: 'Settings', path: '/', icon: setting },
]
export const RestackItems = [
    { label: 'Pre-launch', path: '/', icon: prelaunch },
    { label: 'Primary', path: '/', icon: primary },
]
