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

    // Validate all required environment variables
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

    // Build file URL if file exists
    const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://admin.zepresearch.com'
    const fileUrl = fileField 
      ? `${pocketbaseUrl}/api/files/paper_form_submission/${submissionId}/${fileField}`
      : null

    // Build admin panel URL
    const adminPanelUrl = `https://admin.zepresearch.com/_/#/collections?collection=paper_form_submission&record=${submissionId}`

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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">📄 New Paper Submission</h2>
          </div>
          
          <!-- Content -->
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #fff; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="color: #667eea; margin-top: 0;">Submission Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #555; width: 150px;">Submission ID:</td>
                  <td style="padding: 8px; color: #333;">${submissionId}</td>
                </tr>
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 8px; font-weight: bold; color: #555;">Author:</td>
                  <td style="padding: 8px; color: #333;">${author}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #555;">Email:</td>
                  <td style="padding: 8px; color: #333;"><a href="mailto:${email}" style="color: #667eea;">${email}</a></td>
                </tr>
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 8px; font-weight: bold; color: #555;">Paper Title:</td>
                  <td style="padding: 8px; color: #333;">${paper_title}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #555;">Journal:</td>
                  <td style="padding: 8px; color: #333;">${journal_name}</td>
                </tr>
                ${organization ? `
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 8px; font-weight: bold; color: #555;">Organization:</td>
                  <td style="padding: 8px; color: #333;">${organization}</td>
                </tr>
                ` : ''}
                ${department ? `
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #555;">Department:</td>
                  <td style="padding: 8px; color: #333;">${department}</td>
                </tr>
                ` : ''}
                ${country ? `
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 8px; font-weight: bold; color: #555;">Country:</td>
                  <td style="padding: 8px; color: #333;">${country}</td>
                </tr>
                ` : ''}
                ${phone_number ? `
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #555;">Phone:</td>
                  <td style="padding: 8px; color: #333;">${phone_number}</td>
                </tr>
                ` : ''}
                ${co_author ? `
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 8px; font-weight: bold; color: #555;">Co-Authors:</td>
                  <td style="padding: 8px; color: #333;">${co_author}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${message ? `
            <div style="background-color: #fff; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <h4 style="color: #667eea; margin-top: 0;">Author's Message</h4>
              <p style="margin: 0; color: #333; font-style: italic;">"${message}"</p>
            </div>
            ` : ''}

            ${fileUrl ? `
            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
              <h4 style="color: #2e7d32; margin-top: 0;">📎 Paper File</h4>
              <p style="margin: 0 0 12px 0; color: #333;">The submitted paper is available for download:</p>
              <a href="${fileUrl}" target="_blank" style="display: inline-block; background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">📥 Download Paper</a>
            </div>
            ` : ''}

            <!-- Action Buttons -->
            <div style="margin-top: 30px; text-align: center;">
              <a href="${adminPanelUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px; transition: transform 0.2s;">
                🔗 View in Admin Panel
              </a>
              ${fileUrl ? `
              <a href="${fileUrl}" target="_blank" style="display: inline-block; background-color: #4caf50; color: white; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px; transition: transform 0.2s;">
                📥 Download PDF
              </a>
              ` : ''}
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #ddd; margin-top: 20px;">
            <p style="margin: 5px 0;">© ZEP Research Platform - Automatic Email Notification</p>
            <p style="margin: 5px 0;">Please do not reply to this email.</p>
          </div>
        </div>
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
