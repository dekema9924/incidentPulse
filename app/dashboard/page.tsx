'use client'

import Incidents from '@/components/layout/Dashboard/Incidents';
import MyIncidents from '@/components/layout/Dashboard/MyIncidents';
import { useDashboardContext } from '@/context/DashboardContext'
import Calendar from '@/components/layout/Dashboard/Calendar';
import Settings from '@/components/layout/Dashboard/Settings';
import DashboardPage from '../page';

export default function page() {
    const { isActiveId } = useDashboardContext()

    const renderPage = () => {
        switch (isActiveId) {
            case 1:
                return <DashboardPage />;

            case 2:
                return <Incidents />;

            case 3:
                return <MyIncidents />;

            case 4:
                return <Calendar />;

            case 5:
                return <Settings />;

            default:
                return <DashboardPage />;
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
