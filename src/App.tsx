import { app } from './firebase'
import { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import Layout from './layout/Layout'
import { authRoutes, protectedRoutes, unprotectedRoutes } from './Routes'
import { Provider } from 'react-redux'
import store, { persistor } from './store' // Import your Redux store
import { PersistGate } from 'redux-persist/integration/react'

function App() {
    useEffect(() => {
        console.log('Firebase app initialized:', app)
    }, [])

    // console.log(persistor.)

    return (
        <Provider store={store}>
            {' '}
            {/* Wrap your app with Provider */}
            <Suspense fallback={<Layout loading={true} />}>
                <PersistGate loading={null} persistor={persistor}>
                    {/* <div>lakhan 2</div> */}
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
                </PersistGate>
            </Suspense>
        </Provider>
    )
}

export default App
