import ProfilePage from './pages/ProfilePage'
import PostReraPage from './pages/restack/Stock/post-rera/PostReraPage'
import PostReraDocumentPage from './pages/restack/Stock/post-rera/PostReraDocumentPage'
import RentalPage from './pages/restack/rental/RentalPage'
import type { RouteObject } from 'react-router-dom'
import React from 'react'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/canvas-homes/Dashboard'
import LeadsPage from './pages/acn/Leads/Leads'
import RequirementsPage from './pages/acn/Requirements/Requirements'
import RequirementDetailsPage from './pages/acn/Requirements/RequirementDetails'
import RequirementPropertiesSelectionPage from './pages/acn/Requirements/RequirementPropertiesSelection'
import Logout from './pages/auth/Logout'
import ForgotPassword from './pages/auth/ForgotPassword'
import PreLaunchPage from './pages/restack/PreLaunch/PreLaunch'
import PreLaunchDetailsPage from './pages/restack/PreLaunch/PreLaunchDetails'

import Home from './Home'
import AgentsPage from './pages/acn/Agents/AgentsPage'
import PropertyDetailsPage from './pages/acn/Properties/PropertyDetailsPage'
import AgentDetailsPage from './pages/acn/Agents/AgentDetailsPage'
import QCDashboardPage from './pages/acn/QCDashboard/QCDashboardPage'
import QCPropertyDetailsPage from './pages/acn/QCDashboard/QCPropertyDetails'
import PreReraPage from './pages/restack/Stock/Pre-Rera/PreReraPage'
import PreReraDetailsPage from './pages/restack/Stock/Pre-Rera/PreReraDetailsPage'
import PreReraEditPage from './pages/restack/Stock/Pre-Rera/PreReraEditPage'

import ComplaintsPage from './pages/restack/Primary/ComplaintsPage'
import DocumentsPage from './pages/restack/Primary/DocumentsPage'
import TypologyPage from './pages/restack/Primary/TypologyPage'
import RentalDetailsPage from './pages/restack/rental/RentalDetailsPage'

import Rental from './pages/restack/rental/Rental'
import PropertiesPage from './pages/acn/Properties/Properties'

import AddEditInventoryPage from './pages/acn/Properties/AddInventoryPage'
import LeadDetails from './pages/canvas_homes/sales_dashboard/LeadDetails'
import MarketingDashboard from './pages/canvas_homes/marketing_dashboard/Marketing'
import MarketingDetails from './pages/canvas_homes/marketing_dashboard/MarketingDetails'
import HomePage from './pages/canvas_homes/home/Home'
import SalesDashboard from './pages/canvas_homes/sales_dashboard/Sales'
import PrimaryDetailsPage from './pages/restack/Primary/PrimaryDetails'
import PostReraDetailsPage from './pages/restack/Stock/post-rera/PostReraDetailsPage'
import PrimaryPage from './pages/restack/Primary/Primary'
import ChoosePlatform from './ChoosePlatform'
import Resale from './pages/restack/resale/Resale'
import ResalePage from './pages/restack/resale/ResalePage'
import { ResaleDetailsPage } from './pages/restack/resale/ResalePageDetails'
import JunkLeads from './pages/canvas_homes/sales_dashboard/JunkLead'
import PrimaryImages from './pages/restack/Primary/PrimaryImages'

export const authRoutes: RouteObject[] = [
    {
        path: '/login',
        element: React.createElement(React.Suspense, null, React.createElement(Login, null)),
    },
    {
        path: '/register',
        element: React.createElement(React.Suspense, null, React.createElement(Register, null)),
    },
    {
        path: '/logout',
        element: React.createElement(React.Suspense, null, React.createElement(Logout, null)),
    },
    {
        path: '/forgotPassword',
        element: React.createElement(React.Suspense, null, React.createElement(ForgotPassword, null)),
    },
]

export const protectedRoutes: RouteObject[] = [
    {
        path: '/',
        element: React.createElement(React.Suspense, null, React.createElement(Home, null)),
    },
    {
        path: '/home',
        element: React.createElement(React.Suspense, null, React.createElement(ChoosePlatform, null)),
    },
    {
        path: '/profile',
        element: React.createElement(React.Suspense, null, React.createElement(ProfilePage, null)),
    },
    {
        path: '/canvas-homes/dashboard',
        element: React.createElement(React.Suspense, null, React.createElement(Dashboard, null)),
    },
    {
        path: '/acn/agents',
        element: React.createElement(React.Suspense, null, React.createElement(AgentsPage, null)),
    },
    {
        path: '/acn/agents/:agentId',
        element: React.createElement(React.Suspense, null, React.createElement(AgentDetailsPage, null)),
    },
    {
        path: '/canvas-homes/sales/',
        element: React.createElement(React.Suspense, null, React.createElement(SalesDashboard, null)),
    },
    {
        path: '/canvas-homes/sales/junkleads',
        element: React.createElement(React.Suspense, null, React.createElement(JunkLeads, null)),
    },
    {
        path: '/canvas-homes/sales/leaddetails/:leadId',
        element: React.createElement(React.Suspense, null, React.createElement(LeadDetails, null)),
    },
    {
        path: '/canvas-homes/marketing',
        element: React.createElement(React.Suspense, null, React.createElement(MarketingDashboard, null)),
    },
    {
        path: '/canvas-homes/home',
        element: React.createElement(React.Suspense, null, React.createElement(HomePage, null)),
    },
    {
        path: '/canvas-homes/marketingdetails/:campaignId',
        element: React.createElement(React.Suspense, null, React.createElement(MarketingDetails, null)),
    },

    {
        path: '/acn/leads',
        element: React.createElement(React.Suspense, null, React.createElement(LeadsPage, null)),
    },
    {
        path: '/acn/requirements',
        element: React.createElement(React.Suspense, null, React.createElement(RequirementsPage, null)),
    },
    {
        path: '/acn/agents/:agentId/properties',
        element: React.createElement(React.Suspense, null, React.createElement(AgentDetailsPage, null)),
    },
    {
        path: '/acn/qc/dashboard',
        element: React.createElement(React.Suspense, null, React.createElement(QCDashboardPage, null)),
    },
    {
        path: '/acn/qc/:id/edit',
        element: React.createElement(React.Suspense, null, React.createElement(AddEditInventoryPage, null)),
    },
    {
        path: '/acn/qc/:id/details',
        element: React.createElement(React.Suspense, null, React.createElement(QCPropertyDetailsPage, null)),
    },
    {
        path: '/acn/properties/:id/details',
        element: React.createElement(React.Suspense, null, React.createElement(PropertyDetailsPage, null)),
    },
    {
        path: '/acn/requirements/:id/details',
        element: React.createElement(React.Suspense, null, React.createElement(RequirementDetailsPage, null)),
    },
    {
        path: '/acn/requirements/:id/properties',
        element: React.createElement(
            React.Suspense,
            null,
            React.createElement(RequirementPropertiesSelectionPage, null),
        ),
    },
    {
        path: '/restack/prelaunch',
        element: React.createElement(React.Suspense, null, React.createElement(PreLaunchPage, null)),
    },
    {
        path: '/restack/prelaunch/:pId',
        element: React.createElement(React.Suspense, null, React.createElement(PreLaunchDetailsPage, null)),
    },
    {
        path: '/restack/primary',
        element: React.createElement(React.Suspense, null, React.createElement(PrimaryPage, null)),
    },
    {
        path: '/restack/resale/:type/:id/details',
        element: React.createElement(React.Suspense, null, React.createElement(ResaleDetailsPage, null)),
    },
    {
        path: '/restack/primary/:id',
        element: React.createElement(React.Suspense, null, React.createElement(PrimaryDetailsPage, null)),
    },
    {
        path: '/restack/primary/:id/typology',
        element: React.createElement(React.Suspense, null, React.createElement(TypologyPage, null)),
    },
    {
        path: '/restack/stock',
        element: React.createElement(React.Suspense, null, React.createElement(PostReraPage, null)),
    },
    {
        path: '/restack/stock/pre-rera',
        element: React.createElement(React.Suspense, null, React.createElement(PreReraPage, null)),
    },

    {
        path: '/restack/stock/pre-rera/:id/details',
        element: React.createElement(React.Suspense, null, React.createElement(PreReraDetailsPage, null)),
    },
    {
        path: '/restack/stock/post-rera/:id/details',
        element: React.createElement(React.Suspense, null, React.createElement(PostReraDetailsPage, null)),
    },
    {
        path: '/restack/stock/post-rera/:id/documents',
        element: React.createElement(React.Suspense, null, React.createElement(PostReraDocumentPage, null)),
    },
    {
        path: '/restack/stock/pre-rera/:id/edit',
        element: React.createElement(React.Suspense, null, React.createElement(PreReraEditPage, null)),
    },
    {
        path: '/acn/properties',
        element: React.createElement(
            ProtectedRoute,
            null,
            React.createElement(React.Suspense, null, React.createElement(PropertiesPage, null)),
        ),
    },
    {
        path: '/restack/stock/post-rera/:id/details',
        element: React.createElement(React.Suspense, null, React.createElement(PostReraDetailsPage, null)),
    },
    {
        path: '/restack/stock/post-rera/:id/documents',
        element: React.createElement(React.Suspense, null, React.createElement(PostReraDocumentPage, null)),
    },
    {
        path: '/restack/stock/pre-rera/:id/details',
        element: React.createElement(React.Suspense, null, React.createElement(PreReraDetailsPage, null)),
    },
    {
        path: '/restack/stock/pre-rera/:id/edit',
        element: React.createElement(React.Suspense, null, React.createElement(PreReraEditPage, null)),
    },
    {
        path: '/acn/properties',
        element: React.createElement(
            ProtectedRoute,
            null,
            React.createElement(React.Suspense, null, React.createElement(PropertiesPage, null)),
        ),
    },

    {
        path: '/restack/stock/post-rera/:id/details',
        element: React.createElement(React.Suspense, null, React.createElement(PostReraDetailsPage, null)),
    },
    {
        path: '/restack/stock/post-rera/:id/documents',
        element: React.createElement(React.Suspense, null, React.createElement(PostReraDocumentPage, null)),
    },
    {
        path: '/restack/stock/pre-rera/:id/details',
        element: React.createElement(React.Suspense, null, React.createElement(PreReraDetailsPage, null)),
    },
    {
        path: '/restack/stock/pre-rera/:id/edit',
        element: React.createElement(React.Suspense, null, React.createElement(PreReraEditPage, null)),
    },
    {
        path: '/restack/resale/:type',
        element: React.createElement(React.Suspense, null, React.createElement(ResalePage, null)),
    },
    {
        path: '/restack/resale',
        element: React.createElement(React.Suspense, null, React.createElement(Resale, null)),
    },
    {
        path: '/acn/properties',
        element: React.createElement(
            ProtectedRoute,
            null,
            React.createElement(React.Suspense, null, React.createElement(PropertiesPage, null)),
        ),
    },
    {
        path: '/acn/properties/addinv',
        element: React.createElement(
            ProtectedRoute,
            null,
            React.createElement(React.Suspense, null, React.createElement(AddEditInventoryPage, null)),
        ),
    },
    {
        path: '/acn/properties/:id/edit',
        element: React.createElement(
            ProtectedRoute,
            null,
            React.createElement(React.Suspense, null, React.createElement(AddEditInventoryPage, null)),
        ),
    },
    {
        path: '/restack/primary/:id/complaints',
        element: React.createElement(React.Suspense, null, React.createElement(ComplaintsPage, null)),
    },
    {
        path: '/acn/qc/dashboard',
        element: React.createElement(React.Suspense, null, React.createElement(QCDashboardPage, null)),
    },
    {
        path: '/acn/qc/:id/details',
        element: React.createElement(React.Suspense, null, React.createElement(QCPropertyDetailsPage, null)),
    },
    {
        path: '/restack/primary/:id/complaints',
        element: React.createElement(React.Suspense, null, React.createElement(ComplaintsPage, null)),
    },
    {
        path: '/restack/primary/:id/documents',
        element: React.createElement(React.Suspense, null, React.createElement(DocumentsPage, null)),
    },
    {
        path: '/restack/primary/:id/complaints',
        element: React.createElement(
            ProtectedRoute,
            null,
            React.createElement(React.Suspense, null, React.createElement(ComplaintsPage, null)),
        ),
    },
    {
        path: '/restack/primary/:id/documents',
        element: React.createElement(
            ProtectedRoute,
            null,
            React.createElement(React.Suspense, null, React.createElement(DocumentsPage, null)),
        ),
    },
    {
        path: '/restack/primary/:id/images',
        element: React.createElement(
            ProtectedRoute,
            null,
            React.createElement(React.Suspense, null, React.createElement(PrimaryImages, null)),
        ),
    },
    {
        path: '/restack/rental/:type/:id/details',
        element: React.createElement(React.Suspense, null, React.createElement(RentalDetailsPage, null)),
    },
    {
        path: '/restack/rental/:type',
        element: React.createElement(React.Suspense, null, React.createElement(RentalPage, null)),
    },
    {
        path: '/restack/rental',
        element: React.createElement(React.Suspense, null, React.createElement(Rental, null)),
    },
]

export const unprotectedRoutes: RouteObject[] = []
