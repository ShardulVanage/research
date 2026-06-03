import { NextRequest, NextResponse } from 'next/server';
import pb from '@/lib/pocketbase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['fullname', 'email', 'phone_number', 'event_name', 'check_in', 'check_out'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Try to get current user from PocketBase
    let userId = null;
    if (pb.authStore.isValid && pb.authStore.model) {
      userId = pb.authStore.model.id;
    }

    // Create accommodation record in PocketBase
    const accommodationData = {
      fullname: body.fullname,
      email: body.email,
      phone_number: body.phone_number,
      event_name: body.event_name,
      check_in: body.check_in,
      check_out: body.check_out,
      guest: body.guest || '1',
      dietary_restrictions: body.dietary_restrictions || '',
      special_requirments: body.special_requirments || '',
    };

    // Add user if authenticated
    if (userId) {
      accommodationData.user = userId;
    }

    const record = await pb.collection('accomodation').create(accommodationData);

    // Format dates for email
    const checkInDate = new Date(body.check_in).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const checkOutDate = new Date(body.check_out).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Send email to admin
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL;
      
      if (!fromEmail) {
        console.error('FROM_EMAIL not configured in environment variables');
      }
      
      if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured in environment variables');
      }

      const emailResponse = await resend.emails.send({
        from: fromEmail,
        to: ADMIN_EMAIL,
        subject: `New Accommodation Request - ${body.event_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 30px; border-radius: 12px; color: white; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px;">New Accommodation Request</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Request ID: ${record.id}</p>
            </div>

            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px;">Guest Information</h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Full Name:</strong>
                <p style="margin: 5px 0 0 0; color: #64748b;">${body.fullname}</p>
              </div>

              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Email:</strong>
                <p style="margin: 5px 0 0 0; color: #64748b;"><a href="mailto:${body.email}" style="color: #06b6d4; text-decoration: none;">${body.email}</a></p>
              </div>

              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Phone Number:</strong>
                <p style="margin: 5px 0 0 0; color: #64748b;">${body.phone_number}</p>
              </div>

              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Number of Guests:</strong>
                <p style="margin: 5px 0 0 0; color: #64748b;">${body.guest}</p>
              </div>
            </div>

            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px;">Event Details</h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Event Name:</strong>
                <p style="margin: 5px 0 0 0; color: #64748b;">${body.event_name}</p>
              </div>

              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Check-In Date:</strong>
                <p style="margin: 5px 0 0 0; color: #64748b;">${checkInDate}</p>
              </div>

              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Check-Out Date:</strong>
                <p style="margin: 5px 0 0 0; color: #64748b;">${checkOutDate}</p>
              </div>

              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Dietary Restrictions:</strong>
                <p style="margin: 5px 0 0 0; color: #64748b;">${body.dietary_restrictions || 'None'}</p>
              </div>
            </div>

            ${body.special_requirments ? `
              <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px;">Special Requirements</h2>
                <p style="margin: 0; color: #64748b; line-height: 1.6;">${body.special_requirments}</p>
              </div>
            ` : ''}

            <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 4px;">
              <p style="margin: 0; color: #166534;">
                <strong>Status:</strong> Pending Review<br>
                <strong>Submitted:</strong> ${new Date().toLocaleString()}
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="text-align: center; color: #64748b; font-size: 12px; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        `,
      });
      
      if (emailResponse.error) {
        console.error('Resend email error:', emailResponse.error);
      } else {
        console.log('Email sent successfully to:', ADMIN_EMAIL, 'Response:', emailResponse);
      }
    } catch (emailError) {
      console.error('Failed to send email:', emailError.message);
      console.error('Full error details:', emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Accommodation request submitted successfully',
        data: record,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Accommodation request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process accommodation request' },
      { status: 500 }
    );
  }
}
