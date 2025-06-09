import type { RouteObject } from 'react-router-dom'
import React from 'react'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/canvas-homes/Dashboard'
import LeadsPage from './pages/acn/Leads'

export const authRoutes: RouteObject[] = [
    {
        path: '/login',
        element: React.createElement(React.Suspense, null, React.createElement(Login, null)),
    },
    {
        path: '/register',
        element: React.createElement(React.Suspense, null, React.createElement(Register, null)),
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
]

export const unprotectedRoutes: RouteObject[] = []
