// The visitor's name and mobile, captured on the way in.
//
// Stored on THIS DEVICE ONLY. Nothing here talks to a server: the presentation runs on a
// site-office laptop, and the sales team pulls the day's list off it as a CSV with
// Ctrl/Cmd + Shift + L (see KeyboardNav). Every read and write is guarded — a private
// window or blocked storage must never stop the presentation from running.

const LEADS_KEY = 'w63.leads';
const SESSION_KEY = 'w63.visitor';

const read = (store, key, fallback) => {
  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (store, key, value) => {
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

// Indian mobile: ten digits starting 6–9, with or without +91 / 0 in front and any
// spaces or dashes a visitor types.
export function normalisePhone(input) {
  const digits = String(input ?? '').replace(/\D/g, '');
  const ten = digits.length > 10 ? digits.replace(/^(91|0)/, '') : digits;
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}

export const validName = (name) => String(name ?? '').trim().length >= 2;

/** The visitor for this browser session, or null. `skipped` visitors are remembered too,
 *  so the card is not shown a second time when they come back to the cover. */
export const sessionVisitor = () =>
  typeof window === 'undefined' ? null : read(sessionStorage, SESSION_KEY, null);

export function saveVisitor({ name, phone, consent }) {
  const lead = {
    name: String(name).trim(),
    phone: normalisePhone(phone),
    consent: Boolean(consent),
    at: new Date().toISOString(),
  };
  write(localStorage, LEADS_KEY, [...read(localStorage, LEADS_KEY, []), lead]);
  write(sessionStorage, SESSION_KEY, { name: lead.name });
  return lead;
}

export function skipVisitor() {
  write(sessionStorage, SESSION_KEY, { skipped: true });
}

export const allLeads = () => read(localStorage, LEADS_KEY, []);

/** Downloads every lead captured on this device as a CSV. */
export function exportLeads() {
  const leads = allLeads();
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['Name', 'Mobile', 'Consent', 'Captured at'],
    ...leads.map((l) => [l.name, l.phone ? `+91 ${l.phone}` : '', l.consent ? 'Yes' : 'No', l.at]),
  ];
  const csv = rows.map((r) => r.map(cell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `sixty3we-visitors-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return leads.length;
}
