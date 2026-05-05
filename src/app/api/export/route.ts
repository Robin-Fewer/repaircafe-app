import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { CATEGORY_LABELS, STATUS_LABELS, RepairCategory, RepairStatus } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const year = searchParams.get('year') || new Date().getFullYear().toString();

  let query = supabase.from('repairs').select('*').order('created_at', { ascending: true });

  if (type === 'daily') {
    query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`);
  } else if (type === 'yearly') {
    query = query.gte('created_at', `${year}-01-01T00:00:00`).lte('created_at', `${year}-12-31T23:59:59`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data || []).map((r) => ({
    'ID': r.id.substring(0, 8),
    'Datum': new Date(r.created_at).toLocaleDateString('de-DE'),
    'Uhrzeit': new Date(r.created_at).toLocaleTimeString('de-DE'),
    'Nachname': r.customer_lastname,
    'Vorname': r.customer_firstname,
    'E-Mail': r.customer_email,
    'Gegenstand': r.item,
    'Schaden': r.damage_description,
    'Kategorie': r.category ? CATEGORY_LABELS[r.category as RepairCategory] : '–',
    'Status': STATUS_LABELS[r.status as RepairStatus] || r.status,
    'Erfolgreich': r.repair_successful === true ? 'Ja' : r.repair_successful === false ? 'Nein' : '–',
    'Notizen': r.repair_notes || '–',
    'Abgeschlossen am': r.completed_at ? new Date(r.completed_at).toLocaleDateString('de-DE') : '–',
    'E-Mail gesendet': r.notification_sent ? 'Ja' : 'Nein',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
    { wch: 30 }, { wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 18 },
    { wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 15 },
  ];

  const title = type === 'daily' ? `Tagesabschluss_${date}` : type === 'yearly' ? `Jahresabschluss_${year}` : 'Alle_Reparaturen';
  XLSX.utils.book_append_sheet(wb, ws, title);

  if (type === 'yearly' || type === 'all') {
    const categories = ['E', 'M', 'F', 'N', 'S'] as RepairCategory[];
    const summaryData = categories.map((cat) => {
      const catRepairs = (data || []).filter((r) => r.category === cat);
      const completed = catRepairs.filter((r) => r.status === 'completed').length;
      const failed = catRepairs.filter((r) => r.status === 'failed').length;
      return {
        'Kategorie': CATEGORY_LABELS[cat],
        'Gesamt': catRepairs.length,
        'Abgeschlossen': completed,
        'Nicht reparierbar': failed,
        'In Bearbeitung': catRepairs.filter((r) => r.status === 'in_progress').length,
        'Erfolgsquote': catRepairs.length > 0 ? `${Math.round((completed / (completed + failed || 1)) * 100)}%` : '–',
      };
    });
    const totalRepairs = (data || []).length;
    const totalCompleted = (data || []).filter((r) => r.status === 'completed').length;
    const totalFailed = (data || []).filter((r) => r.status === 'failed').length;
    summaryData.push({
      'Kategorie': 'GESAMT',
      'Gesamt': totalRepairs,
      'Abgeschlossen': totalCompleted,
      'Nicht reparierbar': totalFailed,
      'In Bearbeitung': (data || []).filter((r) => r.status === 'in_progress').length,
      'Erfolgsquote': totalRepairs > 0 ? `${Math.round((totalCompleted / (totalCompleted + totalFailed || 1)) * 100)}%` : '–',
    });
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Zusammenfassung');
  }

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const filename = type === 'daily' ? `Tagesabschluss_${date}.xlsx` : type === 'yearly' ? `Jahresabschluss_${year}.xlsx` : 'Alle_Reparaturen.xlsx';

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
