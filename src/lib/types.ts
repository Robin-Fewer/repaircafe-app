export type RepairStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'failed';
export type RepairCategory = 'E' | 'M' | 'F' | 'N' | 'S';

export interface Repair {
  id: string;
  created_at: string;
  customer_lastname: string;
  customer_firstname: string;
  customer_email: string;
  item: string;
  damage_description: string;
  signature_agreed: boolean;
  status: RepairStatus;
  category: RepairCategory | null;
  repair_notes: string | null;
  repair_successful: boolean | null;
  approved_at: string | null;
  completed_at: string | null;
  notification_sent: boolean;
}

export const CATEGORY_LABELS: Record<RepairCategory, string> = {
  E: 'Elektro',
  M: 'Mechanik',
  F: 'Fahrrad',
  N: 'Nähen',
  S: 'Schleifen',
};

export const CATEGORY_COLORS: Record<RepairCategory, string> = {
  E: '#f59e0b',
  M: '#3b82f6',
  F: '#10b981',
  N: '#ec4899',
  S: '#8b5cf6',
};

export const STATUS_LABELS: Record<RepairStatus, string> = {
  pending: 'Ausstehend',
  approved: 'Freigegeben',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  failed: 'Nicht reparierbar',
};
