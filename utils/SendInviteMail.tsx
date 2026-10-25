import { transporter } from "@/src/lib/nodemailer"


type InviteMailInput = {
    email: string
    orgName: string
    inviterName: string
    role: 'ADMIN' | 'MEMBER' | 'VIEWER'
    inviteUrl: string       // full link, e.g. https://yourapp.com/invite/<token>
    expiresInDays?: number
}

const ROLE_INFO = {
    ADMIN: { label: 'Admin', description: 'manage members, incidents, and settings' },
    MEMBER: { label: 'Member', description: 'create and work on incidents' },
    VIEWER: { label: 'Viewer', description: 'view incidents and follow along, but not make changes' },
} as const

// org and inviter names are typed by users, so they must be escaped before going into HTML
const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

// for the subject line and plain-text body: no line breaks allowed
const singleLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim()

export const SendInviteMail = async ({
    email,
    orgName,
    inviterName,
    role,
    inviteUrl,
    expiresInDays = 7,
}: InviteMailInput) => {
    const { label, description } = ROLE_INFO[role]
    const safeOrg = escapeHtml(orgName)
    const safeInviter = escapeHtml(inviterName)
    const safeUrl = escapeHtml(inviteUrl)

    try {
        await transporter.sendMail({
            from: `"Incident Report" <${process.env.GOOGLE_EMAIL}>`,
            to: email,
            subject: `${singleLine(inviterName)} invited you to join ${singleLine(orgName)} on Incident Report`,
            text: `${singleLine(inviterName)} invited you to join ${singleLine(orgName)} on Incident Report as ${label}.

Accept the invitation: ${inviteUrl}

This link expires in ${expiresInDays} days. If you weren't expecting this invitation, you can safely ignore this email.`,
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>You're invited to ${safeOrg}</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
            font-family: Arial, Helvetica, sans-serif;
            color: #18181b;
        ">
            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="background-color: #f4f4f5; padding: 40px 20px;"
            >
                <tr>
                    <td align="center">

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            style="
                                max-width: 520px;
                                background-color: #ffffff;
                                border-radius: 12px;
                                overflow: hidden;
                                border: 1px solid #e4e4e7;
                            "
                        >

                            <!-- Header -->
                            <tr>
                                <td style="
                                    padding: 28px 32px;
                                    background-color: #18181b;
                                    text-align: center;
                                ">
                                    <h1 style="
                                        margin: 0;
                                        color: #ffffff;
                                        font-size: 24px;
                                        font-weight: 700;
                                    ">
                                        Incident Report
                                    </h1>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 36px 32px;">
                                    <h2 style="
                                        margin: 0 0 12px;
                                        font-size: 22px;
                                        color: #18181b;
                                    ">
                                        You're invited to join ${safeOrg}
                                    </h2>

                                    <p style="
                                        margin: 0 0 24px;
                                        font-size: 15px;
                                        line-height: 1.6;
                                        color: #52525b;
                                    ">
                                        <strong style="color: #18181b;">${safeInviter}</strong>
                                        invited you to join
                                        <strong style="color: #18181b;">${safeOrg}</strong>
                                        on Incident Report.
                                    </p>

                                    <!-- Role -->
                                    <div style="
                                        margin: 0 0 28px;
                                        padding: 16px 20px;
                                        background-color: #f4f4f5;
                                        border-radius: 10px;
                                    ">
                                        <p style="
                                            margin: 0 0 6px;
                                            font-size: 12px;
                                            font-weight: 600;
                                            letter-spacing: 1px;
                                            text-transform: uppercase;
                                            color: #71717a;
                                        ">
                                            Your role
                                        </p>
                                        <p style="
                                            margin: 0;
                                            font-size: 14px;
                                            line-height: 1.6;
                                            color: #52525b;
                                        ">
                                            As <strong style="color: #18181b;">${label}</strong>
                                            you can ${description}.
                                        </p>
                                    </div>

                                    <!-- Button -->
                                    <div style="margin: 0 0 28px; text-align: center;">
                                        <a href="${safeUrl}" style="
                                            display: inline-block;
                                            padding: 14px 32px;
                                            background-color: #18181b;
                                            color: #ffffff;
                                            font-size: 15px;
                                            font-weight: 600;
                                            text-decoration: none;
                                            border-radius: 8px;
                                        ">
                                            Accept invitation
                                        </a>
                                    </div>

                                    <p style="
                                        margin: 0 0 16px;
                                        font-size: 13px;
                                        line-height: 1.6;
                                        color: #71717a;
                                    ">
                                        This link expires in ${expiresInDays} days. If the button
                                        doesn't work, copy and paste this address into your browser:
                                    </p>
                                    <p style="
                                        margin: 0 0 24px;
                                        font-size: 12px;
                                        line-height: 1.5;
                                        color: #52525b;
                                        word-break: break-all;
                                    ">
                                        ${safeUrl}
                                    </p>

                                    <p style="
                                        margin: 0;
                                        font-size: 14px;
                                        line-height: 1.6;
                                        color: #71717a;
                                    ">
                                        If you weren't expecting this invitation,
                                        you can safely ignore this email.
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="
                                    padding: 20px 32px;
                                    border-top: 1px solid #e4e4e7;
                                    text-align: center;
                                ">
                                    <p style="
                                        margin: 0;
                                        font-size: 12px;
                                        color: #a1a1aa;
                                    ">
                                        © ${new Date().getFullYear()} Incident Report
                                    </p>
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>
        </body>
        </html>
    `,
        })

        return { success: true as const }
    } catch (err) {
        console.error('Error while sending invite mail:', err)
        return { success: false as const, error: 'Could not send the invitation email.' }
    }
}