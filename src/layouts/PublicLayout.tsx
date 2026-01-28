import { Outlet, useLocation } from 'react-router-dom'

export function PublicLayout() {
    const location = useLocation();
    const isAuthPage = location.pathname.startsWith('/auth');

    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <main className={`flex min-h-screen flex-col ${isAuthPage ? 'items-center justify-center' : ''}`}>
                <Outlet />
            </main>
        </div>
    )
}
