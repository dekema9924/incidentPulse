import { escapeHtml, singleLine } from "@/utils/string-concatenation"
import { transporter } from "./nodemailer"

type EscalationMailInput = {
    to: string[]            // owner and admin emails
    code: string            // "INC-2041"
    title: string
    orgName: string
    minutesOpen: number
    dashboardUrl: string
}

export const SendEscalationMail = async ({
    to,
    code,
    title,
    orgName,
    minutesOpen,
    dashboardUrl,
}: EscalationMailInput) => {
    const safeTitle = escapeHtml(title)
    const safeOrg = escapeHtml(orgName)
    const safeUrl = escapeHtml(dashboardUrl)

    // one email per person: one bad address can't block the rest, and nobody sees the others' addresses
    const results = await Promise.allSettled(
        to.map(email =>
            transporter.sendMail({
                from: `"Incident Report" <${process.env.GOOGLE_EMAIL}>`,
                to: email,
                subject: `[P1] ${code} needs a response: ${singleLine(title)}`,
                text: `${code} in ${singleLine(orgName)} has had no response for ${minutesOpen} minutes and was escalated.

${singleLine(title)}

Open the dashboard: ${dashboardUrl}`,
                html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${code} escalated</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif; color: #18181b;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7;">

                            <tr>
                                <td style="padding: 28px 32px; background-color: #18181b; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Incident Report</h1>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding: 36px 32px;">
                                    <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #dc2626;">
                                        P1 escalation
                                    </p>
                                    <h2 style="margin: 0 0 12px; font-size: 20px; color: #18181b;">
                                        ${code}: ${safeTitle}
                                    </h2>
                                    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #52525b;">
                                        Nobody in <strong style="color: #18181b;">${safeOrg}</strong> responded
                                        to this critical incident within ${minutesOpen} minutes,
                                        so it has been escalated to you.
                                    </p>

                                    <div style="margin: 0 0 28px; text-align: center;">
                                        <a href="${safeUrl}" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                                            Open dashboard
                                        </a>
                                    </div>

                                    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #71717a;">
                                        You're receiving this because you're an owner or admin of ${safeOrg}.
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding: 20px 32px; border-top: 1px solid #e4e4e7; text-align: center;">
                                    <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
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
        )
    )

    const failed = results.filter(r => r.status === 'rejected').length
    if (failed > 0) console.error(`Escalation mail: ${failed} of ${results.length} failed`)

    return { success: failed < results.length, sent: results.length - failed }
}