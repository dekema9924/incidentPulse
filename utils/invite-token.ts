import crypto from 'node:crypto'

export const generateInviteToken = () => crypto.randomBytes(32).toString('base64url')

// the database only ever sees this hash
export const hashToken = (token: string) =>
    crypto.createHash('sha256').update(token).digest('hex')