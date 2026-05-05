import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const date = searchParams.get('date');
  const year = searchParams.get('year');

  let query = supabase.from('repairs').select('*').order('created_at', { ascending: false });

  if (status) {
    const statuses = status.split(',');
    query = query.in('status', statuses);
  }
  if (category) {
    query = query.eq('category', category);
  }
  if (date) {
    query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`);
  }
  if (year) {
    query = query.gte('created_at', `${year}-01-01T00:00:00`).lte('created_at', `${year}-12-31T23:59:59`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customer_lastname, customer_firstname, customer_email, item, damage_description, signature_agreed } = body;

  if (!customer_lastname || !customer_firstname || !customer_email || !item || !damage_description || !signature_agreed) {
    return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('repairs')
    .insert([{ customer_lastname, customer_firstname, customer_email, item, damage_description, signature_agreed }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
