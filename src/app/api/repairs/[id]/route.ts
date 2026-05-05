import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase.from('repairs').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = { ...body };

  if (body.status === 'approved') {
    updateData.approved_at = new Date().toISOString();
    updateData.status = 'approved';
  }

  if (body.status === 'in_progress') {
    updateData.status = 'in_progress';
  }

  if (body.status === 'completed' || body.status === 'failed') {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('repairs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if ((body.status === 'completed' || body.status === 'failed') && !data.notification_sent) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const successful = body.status === 'completed';
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: data.customer_email,
        subject: successful
          ? `Ihre Reparatur ist abgeschlossen – Repair Café Bad Säckingen`
          : `Reparatur-Ergebnis – Repair Café Bad Säckingen`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #3a7d44; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Repair Café Bad Säckingen</h1>
            </div>
            <div style="background-color: #f5f1eb; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px;">Guten Tag ${data.customer_firstname} ${data.customer_lastname},</p>
              ${successful ? `
                <p style="font-size: 16px;">Wir freuen uns, Ihnen mitteilen zu können, dass Ihr Gegenstand erfolgreich repariert wurde!</p>
                <div style="background-color: #e8f5e9; border-left: 4px solid #3a7d44; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-weight: bold; color: #3a7d44;">✓ Reparatur erfolgreich abgeschlossen</p>
                </div>
                <p style="font-size: 16px;">Sie können Ihren <strong>${data.item}</strong> ab sofort wieder beim Repair Café Bad Säckingen abholen.</p>
              ` : `
                <p style="font-size: 16px;">Leider müssen wir Ihnen mitteilen, dass Ihr Gegenstand nicht repariert werden konnte.</p>
                <div style="background-color: #fff3e0; border-left: 4px solid #e07b39; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-weight: bold; color: #e07b39;">✗ Reparatur nicht möglich</p>
                </div>
                <p style="font-size: 16px;">Ihr <strong>${data.item}</strong> kann leider beim Repair Café Bad Säckingen abgeholt werden.</p>
              `}
              ${data.repair_notes ? `
                <p style="font-size: 14px; color: #555;"><strong>Anmerkungen unserer Reparateur:innen:</strong><br>${data.repair_notes}</p>
              ` : ''}
              <hr style="border: none; border-top: 1px solid #d4cfc7; margin: 20px 0;" />
              <p style="font-size: 14px; color: #6b7280;">
                Bei Fragen wenden Sie sich gerne an uns:<br>
                <a href="mailto:info@repaircafe-saeckingen.de" style="color: #3a7d44;">info@repaircafe-saeckingen.de</a>
              </p>
              <p style="font-size: 14px; color: #6b7280;">Herzliche Grüße,<br>Ihr Team vom Repair Café Bad Säckingen</p>
            </div>
          </div>
        `,
      });
      await supabase.from('repairs').update({ notification_sent: true }).eq('id', id);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
  }

  return NextResponse.json(data);
}
