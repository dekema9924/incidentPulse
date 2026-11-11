'use client'

import MyIncidents from '@/components/layout/Dashboard/incident/MyIncidents';
import { useDashboardContext } from '@/context/DashboardContext'
import Calendar from '@/components/layout/Dashboard/Calendar';
import Settings from '@/components/layout/settings/General';
import IncidentsPage from '@/components/layout/Dashboard/incident/IncidentsPage';
import Inbox from '@/components/layout/Dashboard/Inbox';
import Dashboard from '@/components/layout/Dashboard/Dashboard';

export default function page() {
    const { isActiveId } = useDashboardContext()

    const renderPage = () => {
        switch (isActiveId) {
            case 1:
                return <Dashboard />;

            case 2:
                return <IncidentsPage />;

            case 3:
                return <MyIncidents />;

            case 4:
                return <Calendar />;

            case 5:
                return <Settings />;

            case 6:
                return <Inbox />

            default:
                return <Dashboard />;
        }
    };
    return (
        <>
            <main className='p-3'>
                {
                    renderPage()
                }

            </main>
        </>
    )
}
