import nodemailer from "nodemailer";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});



export const SendMail = async (email: string, otp: string) => {
    try {
        const info = await transporter.sendMail({
            from: `'"Incident report" ${process.env.GOOGLE_EMAIL}'`, // sender address
            to: email, // list of recipients
            subject: "Verify your email", // subject line
            text: `Your Incident Report verification code is ${otp}. This code will expire soon.`,
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Verify your email</title>
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
                                        Verify your email
                                    </h2>

                                    <p style="
                                        margin: 0 0 24px;
                                        font-size: 15px;
                                        line-height: 1.6;
                                        color: #52525b;
                                    ">
                                        Thanks for creating an Incident Report account.
                                        Enter the verification code below to confirm
                                        your email address.
                                    </p>

                                    <!-- OTP -->
                                    <div style="
                                        margin: 28px 0;
                                        padding: 20px;
                                        background-color: #f4f4f5;
                                        border-radius: 10px;
                                        text-align: center;
                                    ">
                                        <p style="
                                            margin: 0 0 8px;
                                            font-size: 12px;
                                            font-weight: 600;
                                            letter-spacing: 1px;
                                            text-transform: uppercase;
                                            color: #71717a;
                                        ">
                                            Verification Code
                                        </p>

                                        <div style="
                                            font-size: 32px;
                                            font-weight: 700;
                                            letter-spacing: 8px;
                                            color: #18181b;
                                        ">
                                            ${otp}
                                        </div>
                                    </div>

                                    <p style="
                                        margin: 0;
                                        font-size: 14px;
                                        line-height: 1.6;
                                        color: #71717a;
                                    ">
                                        If you didn't create an Incident Report account,
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
        });

        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available when using an Ethereal test account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
}