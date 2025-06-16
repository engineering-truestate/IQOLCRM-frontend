import type { RouteObject } from 'react-router-dom'
import React from 'react'
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
import PrimaryPage from './pages/restack/Primary/Primary'
import PrimaryDetailsPage from './pages/restack/Primary/PrimaryDetails'
import ComplaintsPage from './pages/restack/Primary/ComplaintsPage'
import DocumentsPage from './pages/restack/Primary/DocumentsPage'
import TypologyPage from './pages/restack/Primary/TypologyPage'
import PropertiesPage from './pages/acn/Properties/Properties'

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
        path: '/canvas-homes/dashboard',
        element: React.createElement(React.Suspense, null, React.createElement(Dashboard, null)),
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
        path: '/acn/properties',
        element: React.createElement(React.Suspense, null, React.createElement(PropertiesPage, null)),
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
        path: '/restack/primary/:id',
        element: React.createElement(React.Suspense, null, React.createElement(PrimaryDetailsPage, null)),
    },
    {
        path: '/restack/primary/:id/typology',
        element: React.createElement(React.Suspense, null, React.createElement(TypologyPage, null)),
    },
    {
        path: '/restack/primary/:id/complaints',
        element: React.createElement(React.Suspense, null, React.createElement(ComplaintsPage, null)),
    },
    {
        path: '/restack/primary/:id/documents',
        element: React.createElement(React.Suspense, null, React.createElement(DocumentsPage, null)),
    },
]

export const unprotectedRoutes: RouteObject[] = []
