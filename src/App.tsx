import app from './firebase'
import { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import Layout from './layout/Layout'
import { authRoutes, protectedRoutes, unprotectedRoutes } from './Routes'

function App() {
    useEffect(() => {
        console.log('Firebase app initialized:', app)
    }, [])

    return (
        <Suspense fallback={<Layout loading={true} />}>
            <BrowserRouter>
                <Routes>
                    {authRoutes.map((route, index) => (
                        <Route key={index} path={route.path} element={route.element} />
                    ))}
                    {protectedRoutes.map((route, index) => (
                        <Route key={index} path={route.path} element={route.element} />
                    ))}
                    {unprotectedRoutes.map((route, index) => (
                        <Route key={index} path={route.path} element={route.element} />
                    ))}
                </Routes>
            </BrowserRouter>
        </Suspense>
    )
}

export default App
