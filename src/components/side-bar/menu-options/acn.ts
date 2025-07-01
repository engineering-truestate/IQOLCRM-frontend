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
    { label: 'Properties', path: '/acn/properties', icon: Propertiesicon },
    { label: 'Requirements', path: '/acn/requirements', icon: Requirementsicon },
    { label: 'QC Dashboard', path: '/acn/qc/dashboard', icon: QC_Dashboard },
]
export const truestateMenuItems = [
    { label: 'Notifications', path: '/truestate/notifications', icon: Notifications },
    { label: 'Dashboard', path: '/truestate/dashboard', icon: Dashicon },
    { label: 'Leads', path: '/truestate/leads', icon: Agenticon },
    { label: 'Website Dashboard', path: '/truestate/website', icon: Website },
    { label: 'Properties', path: '/truestate/properties', icon: QC_Dashboard },
]
export const MenuItems = [
    { label: 'ACN', path: '/acn/leads', icon: ACNicon },
    { label: 'Restake', path: '/restack/primary', icon: Restakeicon },
    { label: 'Vault', path: '/vault/requirements', icon: Vaulticon },
    { label: 'Canvas Home', path: '/canvas-homes/home', icon: CanvasHomesicon },
]
export const canvasMenuItems = [
    { label: 'Notifications', path: '/canvas-homes/notifications', icon: Notifications },
    { label: 'Home', path: '/canvas-homes/home', icon: Home },
    { label: 'Properties', path: '/canvas-homes/properties', icon: Propertiesicon },
    { label: 'Sales', path: '/canvas-homes/sales', icon: Sales },
    { label: 'Marketing', path: '/canvas-homes/marketing', icon: Agenticon },
    { label: 'Settings', path: '/canvas-homes/settings', icon: setting },
]
export const RestackItems = [
    { label: 'Pre-launch', path: '/restack/prelaunch', icon: prelaunch },
    { label: 'Primary', path: '/restack/primary', icon: primary },
    { label: 'Stock', path: '/restack/stock', icon: primary },
    { label: 'Resale', path: '/restack/resale', icon: primary },
    { label: 'Rental', path: '/restack/rental', icon: primary },
]
