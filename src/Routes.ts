import type { RouteObject } from 'react-router-dom'
import React from 'react'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/canvas_homes/Dashboard'
import Marketing from './pages/canvas_homes/marketing_dashboard/Marketing'
import MarketingDetails from './pages/canvas_homes/marketing_dashboard/MarketingDetails'
import Sales from './pages/canvas_homes/sales_dashboard/Sales'
import LeadsPage from './pages/acn/Leads/Leads'
import RequirementsPage from './pages/acn/Requirements/Requirements'
import RequirementDetailsPage from './pages/acn/Requirements/RequirementDetails'
import RequirementPropertiesSelectionPage from './pages/acn/Requirements/RequirementPropertiesSelection'
import Logout from './pages/auth/Logout'
import ForgotPassword from './pages/auth/ForgotPassword'

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
        path: '/canvas-homes/marketing',
        element: React.createElement(React.Suspense, null, React.createElement(Marketing, null)),
    },
    {
        path: '/canvas-homes/marketingdetails',
        element: React.createElement(React.Suspense, null, React.createElement(MarketingDetails, null)),
    },
    {
        path: '/canvas-homes/sales',
        element: React.createElement(React.Suspense, null, React.createElement(Sales, null)),
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
]

export const unprotectedRoutes: RouteObject[] = []
