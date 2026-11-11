export type PlanName = 'FREE' | 'TEAM' | 'LIFETIME'

// organizations an account may OWN
export const ORG_LIMITS: Record<PlanName, number> = {
    FREE: 1,
    TEAM: 5,
    LIFETIME: Number.POSITIVE_INFINITY,
}

export const FREE_MEMBER_LIMIT = 3

// members per workspace, decided by the plan of the workspace's OWNER (not the person being invited)
export const memberLimitFor = (plan: PlanName, seats: number) =>
    plan === 'FREE'
        ? FREE_MEMBER_LIMIT
        : plan === 'TEAM'
            ? Math.max(seats, 1) // the seats they bought at checkout
            : Number.POSITIVE_INFINITY

export const orgLimitMessage = (plan: PlanName) =>
    plan === 'FREE'
        ? 'Free accounts can create one organization. Upgrade to create more.'
        : 'The Team plan includes up to 5 organizations. Upgrade to Lifetime for unlimited.'

export const memberLimitMessage = (plan: PlanName, limit: number, callerIsOwner: boolean) => {
    if (plan === 'FREE') {
        return callerIsOwner
            ? `Free workspaces hold up to ${limit} members, including you. Upgrade to invite more.`
            : `This workspace has reached its ${limit}-member limit. Ask the owner to upgrade.`
    }
    return callerIsOwner
        ? `Your Team plan covers ${limit} members. Add seats to invite more.`
        : 'This workspace has used all its seats. Ask the owner to add more.'
}