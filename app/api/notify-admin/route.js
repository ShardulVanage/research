import { Resend } from 'resend'

export async function POST(request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const adminEmail = process.env.ADMIN_EMAIL
    const fromEmail = process.env.FROM_EMAIL

    console.log('=== Email Notification Request Started ===')
    console.log('Configuration Check:', { 
      hasApiKey: !!resendApiKey,
      apiKeyPreview: resendApiKey ? resendApiKey.substring(0, 10) + '...' : 'NOT SET',
      adminEmail, 
      fromEmail 
    })

    const missingVars = []
    if (!resendApiKey) missingVars.push('RESEND_API_KEY')
    if (!adminEmail) missingVars.push('ADMIN_EMAIL')
    if (!fromEmail) missingVars.push('FROM_EMAIL')

    if (missingVars.length > 0) {
      console.error('❌ Missing environment variables:', missingVars)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Missing configuration: ${missingVars.join(', ')}` 
        }),
        { status: 500 }
      )
    }

    const resend = new Resend(resendApiKey)

    const body = await request.json()
    console.log('Request body received:', { 
      author: body.author,
      paper_title: body.paper_title,
      submissionId: body.submissionId
    })

    const {
      author,
      email,
      paper_title,
      journal_name,
      organization,
      department,
      country,
      co_author,
      phone_number,
      message,
      submissionId,
      fileField
    } = body

    const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://admin.zepresearch.com'
    const fileUrl = fileField 
      ? `${pocketbaseUrl}/api/files/paper_form_submission/${submissionId}/${fileField}`
      : null

    const adminPanelUrl = `https://admin.zepresearch.com/_/#/collections?collection=paper_form_submission&record=${submissionId}`

    // ─── Gmail Draft URLs ────────────────────────────────────────────────────────

    const approvalSubject = encodeURIComponent(`[APPROVED] Your Paper Submission: ${paper_title}`)
    const approvalBody = encodeURIComponent(
`Dear ${author},

We are pleased to inform you that your paper submission has been APPROVED for publication in ${journal_name}.

─────────────────────────────────────────
SUBMISSION DETAILS
─────────────────────────────────────────
Submission ID  : ${submissionId}
Paper Title    : ${paper_title}
Journal        : ${journal_name}
${organization ? `Organization   : ${organization}\n` : ''}${department ? `Department     : ${department}\n` : ''}${country ? `Country        : ${country}\n` : ''}${co_author ? `Co-Authors     : ${co_author}\n` : ''}
─────────────────────────────────────────

Congratulations! Your work meets the standards of our journal and we are excited to move forward with the publication process.

Next Steps:
  1. Our editorial team will contact you shortly with further instructions.
  2. Please review and confirm your submission details.
  3. Any required revisions will be communicated via email.

If you have any questions, feel free to reply to this email.

Warm regards,
ZEP Research Editorial Team
https://zepresearch.com`
    )

    const rejectionSubject = encodeURIComponent(`[DECISION] Your Paper Submission: ${paper_title}`)
    const rejectionBody = encodeURIComponent(
`Dear ${author},

Thank you for submitting your paper to ${journal_name}. After careful review by our editorial team, we regret to inform you that your submission has not been accepted for publication at this time.

─────────────────────────────────────────
SUBMISSION DETAILS
─────────────────────────────────────────
Submission ID  : ${submissionId}
Paper Title    : ${paper_title}
Journal        : ${journal_name}
${organization ? `Organization   : ${organization}\n` : ''}${department ? `Department     : ${department}\n` : ''}${country ? `Country        : ${country}\n` : ''}${co_author ? `Co-Authors     : ${co_author}\n` : ''}
─────────────────────────────────────────

Reason for Rejection:
[Please fill in the specific reason(s) here before sending]

We encourage you to consider the following suggestions for improvement:
  • [Add specific feedback or suggestions here]
  • [Add specific feedback or suggestions here]

We appreciate the effort you have put into your research and encourage you to revise and resubmit to a future issue, or consider submitting to one of our other journals.

Thank you again for considering ZEP Research for your work.

Sincerely,
ZEP Research Editorial Team
https://zepresearch.com`
    )

    const approvalGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${approvalSubject}&body=${approvalBody}`
    const rejectionGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${rejectionSubject}&body=${rejectionBody}`

    // ─── Email HTML ───────────────────────────────────────────────────────────────

    console.log('Preparing to send email:', {
      from: fromEmail,
      to: adminEmail,
      subject: `New Paper Submission: ${paper_title}`,
      fileUrl: fileUrl ? '✓ Attached' : 'No file'
    })

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `New Paper Submission: ${paper_title}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>New Paper Submission</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f0f4f8; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

          <div style="max-width:640px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.10);">

            <!-- ── Header ── -->
            <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2d6a9f 60%,#1abc9c 100%); padding:36px 32px; text-align:center; position:relative;">
              <div style="font-size:36px; margin-bottom:8px;">📄</div>
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px;">New Paper Submission</h1>
              <p style="margin:6px 0 0; color:rgba(255,255,255,0.75); font-size:13px; letter-spacing:1px; text-transform:uppercase;">ZEP Research Platform</p>
            </div>

            <!-- ── Submission ID Badge ── -->
            <div style="background:#f7f9fc; border-bottom:1px solid #e8edf3; padding:14px 32px; display:flex; align-items:center;">
              <span style="font-size:11px; font-weight:700; color:#7a8fa6; text-transform:uppercase; letter-spacing:1px; margin-right:10px;">Submission ID</span>
              <span style="background:#1e3a5f; color:#ffffff; font-family:monospace; font-size:12px; padding:4px 12px; border-radius:20px; letter-spacing:0.5px;">${submissionId}</span>
            </div>

            <!-- ── Details Table ── -->
            <div style="padding:28px 32px 10px;">
              <h3 style="margin:0 0 16px; font-size:14px; font-weight:700; color:#1e3a5f; text-transform:uppercase; letter-spacing:1px;">Submission Details</h3>
              <table style="width:100%; border-collapse:collapse; font-size:14px;">
                ${buildRow('Author', author, false)}
                ${buildRow('Email', `<a href="mailto:${email}" style="color:#2d6a9f; text-decoration:none;">${email}</a>`, true)}
                ${buildRow('Paper Title', `<strong>${paper_title}</strong>`, false)}
                ${buildRow('Journal', journal_name, true)}
                ${organization ? buildRow('Organization', organization, false) : ''}
                ${department ? buildRow('Department', department, true) : ''}
                ${country ? buildRow('Country', country, false) : ''}
                ${phone_number ? buildRow('Phone', phone_number, true) : ''}
                ${co_author ? buildRow('Co-Authors', co_author, false) : ''}
              </table>
            </div>

            <!-- ── Author Message ── -->
            ${message ? `
            <div style="margin:0 32px 20px; padding:18px 20px; background:#f0f7ff; border-left:4px solid #2d6a9f; border-radius:0 6px 6px 0;">
              <p style="margin:0 0 6px; font-size:11px; font-weight:700; color:#2d6a9f; text-transform:uppercase; letter-spacing:1px;">Author's Message</p>
              <p style="margin:0; color:#333; font-size:14px; line-height:1.6; font-style:italic;">"${message}"</p>
            </div>
            ` : ''}

            <!-- ── File Download ── -->
            ${fileUrl ? `
            <div style="margin:0 32px 20px; padding:18px 20px; background:#e8f8f2; border-left:4px solid #1abc9c; border-radius:0 6px 6px 0;">
              <p style="margin:0 0 10px; font-size:11px; font-weight:700; color:#0e8a6e; text-transform:uppercase; letter-spacing:1px;">📎 Paper File</p>
              <a href="${fileUrl}" target="_blank" style="display:inline-block; background:#1abc9c; color:#ffffff; padding:9px 20px; text-decoration:none; border-radius:6px; font-weight:700; font-size:13px;">📥 Download Paper</a>
            </div>
            ` : ''}

            <!-- ── Divider ── -->
            <div style="margin:0 32px; border-top:1px solid #e8edf3;"></div>

            <!-- ── Action Buttons ── -->
            <div style="padding:28px 32px;">
              <p style="margin:0 0 18px; font-size:12px; font-weight:700; color:#7a8fa6; text-transform:uppercase; letter-spacing:1px;">Quick Actions</p>

              <!-- Admin Panel Button -->
              <div style="margin-bottom:24px; text-align:center;">
                <a href="${adminPanelUrl}" target="_blank"
                  style="display:inline-block; background:linear-gradient(135deg,#1e3a5f,#2d6a9f); color:#ffffff; padding:13px 32px; text-decoration:none; border-radius:8px; font-weight:700; font-size:14px; letter-spacing:0.3px;">
                  🔗 View in Admin Panel
                </a>
              </div>

              <!-- Approve & Reject Buttons Row -->
              <div style="background:#f7f9fc; border:1px solid #e2e8f0; border-radius:10px; padding:22px 20px; text-align:center;">
                <p style="margin:0 0 6px; font-size:13px; font-weight:700; color:#2d3748;">Draft Response Email</p>
                <p style="margin:0 0 18px; font-size:12px; color:#718096;">Click a button below to open Gmail with a pre-filled response to the author.</p>

                <table style="margin:0 auto; border-collapse:collapse;">
                  <tr>
                    <!-- APPROVE -->
                    <td style="padding:0 8px 0 0;">
                      <a href="${approvalGmailUrl}" target="_blank"
                        style="
                          display:inline-block;
                          background:linear-gradient(135deg,#0a8754 0%,#1abc9c 100%);
                          color:#ffffff;
                          padding:14px 28px;
                          text-decoration:none;
                          border-radius:8px;
                          font-weight:700;
                          font-size:14px;
                          letter-spacing:0.3px;
                          box-shadow:0 4px 14px rgba(26,188,156,0.35);
                        ">
                        ✅ Approve Submission
                      </a>
                    </td>

                    <!-- REJECT -->
                    <td style="padding:0 0 0 8px;">
                      <a href="${rejectionGmailUrl}" target="_blank"
                        style="
                          display:inline-block;
                          background:linear-gradient(135deg,#c0392b 0%,#e74c3c 100%);
                          color:#ffffff;
                          padding:14px 28px;
                          text-decoration:none;
                          border-radius:8px;
                          font-weight:700;
                          font-size:14px;
                          letter-spacing:0.3px;
                          box-shadow:0 4px 14px rgba(231,76,60,0.35);
                        ">
                        ❌ Reject Submission
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:16px 0 0; font-size:11px; color:#a0aec0;">
                  Gmail will open with a pre-filled draft — review before sending.
                </p>
              </div>

              ${fileUrl ? `
              <div style="margin-top:16px; text-align:center;">
                <a href="${fileUrl}" target="_blank"
                  style="display:inline-block; background:#1abc9c; color:#ffffff; padding:11px 24px; text-decoration:none; border-radius:8px; font-weight:700; font-size:13px;">
                  📥 Download PDF
                </a>
              </div>
              ` : ''}
            </div>

            <!-- ── Footer ── -->
            <div style="background:#f7f9fc; border-top:1px solid #e8edf3; padding:20px 32px; text-align:center;">
              <p style="margin:0 0 4px; font-size:12px; color:#a0aec0; font-weight:600; letter-spacing:0.5px;">ZEP RESEARCH PLATFORM</p>
              <p style="margin:0; font-size:11px; color:#cbd5e0;">Automatic notification — please do not reply to this email.</p>
            </div>

          </div>
        </body>
        </html>
      `
    })

    console.log('✅ Email sent successfully:', { 
      id: emailResponse.id,
      from: fromEmail,
      to: adminEmail
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin notification sent successfully',
        emailId: emailResponse.id
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error sending admin notification:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email'
      }),
      { status: 500 }
    )
  }
}

// ── Helper: alternating row builder ──────────────────────────────────────────
function buildRow(label, value, shaded) {
  const bg = shaded ? 'background:#f7f9fc;' : ''
  return `
    <tr style="${bg}">
      <td style="padding:10px 12px 10px 0; font-size:12px; font-weight:700; color:#7a8fa6; text-transform:uppercase; letter-spacing:0.5px; width:130px; vertical-align:top;">${label}</td>
      <td style="padding:10px 0; font-size:14px; color:#2d3748; vertical-align:top;">${value}</td>
    </tr>
  `
}