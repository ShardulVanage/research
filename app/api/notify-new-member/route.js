import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, phone, userId } = await request.json();

    if (!name || !email || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pocketbaseAdminUrl = `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/_/#/collections?collectionId=users&recordId=${userId}&collection=users&filter=${encodeURIComponent(email)}&record=${userId}`;

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `🎉 New Member Joined — ${name}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>New Member Notification</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:36px 40px;text-align:center;">
                      <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;letter-spacing:3px;text-transform:uppercase;font-weight:600;">ZEP Research</p>
                      <h1 style="margin:0;font-size:26px;color:#ffffff;font-weight:700;">New Member Joined</h1>
                      <p style="margin:10px 0 0;font-size:14px;color:#7dd3fc;">A new user has activated their free trial membership.</p>
                    </td>
                  </tr>

                  <!-- Badge -->
                  <tr>
                    <td align="center" style="padding:28px 40px 0;">
                      <span style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#ffffff;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 18px;border-radius:20px;">
                        🎉 New Membership Activation
                      </span>
                    </td>
                  </tr>

                  <!-- Member Details -->
                  <tr>
                    <td style="padding:28px 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom:16px;">
                            <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Full Name</p>
                            <p style="margin:0;font-size:17px;color:#0f172a;font-weight:600;">${name}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:16px;border-top:1px solid #f1f5f9;padding-top:16px;">
                            <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Email Address</p>
                            <p style="margin:0;font-size:16px;color:#3b82f6;">${email}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:16px;border-top:1px solid #f1f5f9;padding-top:16px;">
                            <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Phone Number</p>
                            <p style="margin:0;font-size:16px;color:#0f172a;">${phone || "—"}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-top:1px solid #f1f5f9;padding-top:16px;">
                            <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">User ID</p>
                            <p style="margin:0;font-size:13px;color:#64748b;font-family:monospace;">${userId}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- CTA Button -->
                  <tr>
                    <td align="center" style="padding:8px 40px 36px;">
                      <a href="${pocketbaseAdminUrl}"
                         style="display:inline-block;background:linear-gradient(135deg,#0f172a,#1e40af);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.5px;text-decoration:none;padding:14px 32px;border-radius:8px;">
                        View in PocketBase Admin →
                      </a>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#94a3b8;">This is an automated notification from <strong>ZEP Research</strong>. Do not reply to this email.</p>
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

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}