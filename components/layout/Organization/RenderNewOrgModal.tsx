'use client'

import { useOrgModalContext } from '@/context/DashboardModals'
import NewOrgModal from './NewOrgModal'

export default function RenderNewOrgModal() {
    const { newOrgOpen, setNewOrgOpen } = useOrgModalContext()

    if (!newOrgOpen) return null

    return <NewOrgModal onClose={() => setNewOrgOpen(false)} />
}