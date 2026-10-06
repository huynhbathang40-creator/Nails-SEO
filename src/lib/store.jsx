import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_TEMPLATES, weeksSince } from './messages.js';

// The salon app keeps each account's salon data in this browser (localStorage),
// under a key that includes the signed-in user's id.
export const storageKeyFor = (userId) => `glowback:v1:${userId || 'guest'}`;

const EMPTY = {
  salon: null,
  clients: [],
  activity: [],
  reviews: [],
  templates: DEFAULT_TEMPLATES,
};

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return EMPTY;
    const data = JSON.parse(raw);
    return { ...EMPTY, ...data, templates: { ...DEFAULT_TEMPLATES, ...(data.templates || {}) } };
  } catch {
    return EMPTY;
  }
}

export const DEFAULT_SALON = {
  name: '',
  owner: '',
  phone: '',
  email: '',
  city: '',
  googleReviewLink: '',
  bookingLink: '',
  textLanguage: 'en',
  fillWeeks: 3,
  pediWeeks: 6,
  otherWeeks: 8,
  avgTicket: 55,
};

export function sampleData() {
  const salon = {
    ...DEFAULT_SALON,
    name: 'Lux Nails & Spa',
    owner: 'Linda Tran',
    phone: '(561) 555-0123',
    email: 'linda@luxnails.example',
    city: 'Delray Beach, FL',
    googleReviewLink: 'https://g.page/r/luxnails/review',
    bookingLink: 'https://book.glowback.co/lux',
  };
  const c = (name, phone, language, service, last, visits) => ({ id: uid(), name, phone, language, service, lastVisit: daysAgo(last), visits, notes: '', reviewRequestedAt: null, winbackSentAt: null, createdAt: daysAgo(120) });
  const clients = [
    c('Rachel Moore', '(561) 555-0142', 'en', 'fill', 0, 9),
    c('Tina Pham', '(561) 555-0178', 'vi', 'manicure', 1, 14),
    c('Mrs. Johnson', '(561) 555-0110', 'en', 'fill', 24, 22),
    c('Hạnh Nguyễn', '(561) 555-0193', 'vi', 'pedicure', 47, 11),
    c('Ashley Diaz', '(561) 555-0125', 'en', 'pedicure', 52, 6),
    c('Kim Lê', '(561) 555-0166', 'vi', 'fill', 30, 17),
    c('Megan Brooks', '(561) 555-0187', 'en', 'other', 75, 3),
    c('Sofia Alvarez', '(561) 555-0151', 'en', 'fill', 9, 8),
  ];
  clients[7].reviewRequestedAt = daysAgo(9);
  const activity = [
    { id: uid(), type: 'review_request', clientId: clients[7].id, name: clients[7].name, at: daysAgo(9) },
    { id: uid(), type: 'returned', clientId: clients[0].id, name: clients[0].name, at: daysAgo(0), amount: 55 },
  ];
  const reviews = [
    { id: uid(), author: 'Tina P.', rating: 5, text: 'So relaxing, and my dip lasted three weeks!', date: daysAgo(1), reply: '', replied: false },
    { id: uid(), author: 'Rachel M.', rating: 5, text: 'Best nails in Delray, hands down. Linda is an artist.', date: daysAgo(3), reply: '', replied: false },
    { id: uid(), author: 'Dana K.', rating: 3, text: 'Nice staff but I waited 25 minutes past my appointment.', date: daysAgo(6), reply: '', replied: false },
  ];
  return { ...EMPTY, salon, clients, activity, reviews, sample: true };
}

// Salon settings built from the user's database profile (used the first time on each device).
export function salonFromProfile(p) {
  if (!p) return {};
  const pick = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v));
  return pick({
    name: p.salon_name || p.full_name,
    owner: p.full_name,
    phone: p.phone,
    city: p.city,
    email: p.email,
    googleReviewLink: p.google_review_link,
    bookingLink: p.booking_link,
    textLanguage: p.preferred_language === 'vi' ? 'vi' : 'en',
  });
}

// Which clients need something today.
export function clientStatus(client, salon) {
  const weeks = weeksSince(client.lastVisit);
  const interval = client.service === 'fill' ? salon.fillWeeks : client.service === 'pedicure' ? salon.pediWeeks : salon.otherWeeks;
  const askedSinceVisit = client.reviewRequestedAt && client.reviewRequestedAt >= client.lastVisit;
  const wonSinceVisit = client.winbackSentAt && client.winbackSentAt >= client.lastVisit;
  if (weeks < 1 && !askedSinceVisit) return 'review';
  if (weeks >= interval && !wonSinceVisit) return 'winback';
  if (wonSinceVisit) return 'waiting';
  return 'ok';
}

const StoreContext = createContext(null);

export function StoreProvider({ storageKey, children }) {
  const [data, setData] = useState(() => load(storageKey));

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch { /* storage full or blocked */ }
  }, [data, storageKey]);

  const update = useCallback((fn) => setData((d) => ({ ...d, ...fn(d) })), []);

  const actions = useMemo(() => ({
    setupSalon: (salon) => update((d) => ({ salon: { ...DEFAULT_SALON, ...d.salon, ...salon } })),
    updateSalon: (patch) => update((d) => ({ salon: { ...d.salon, ...patch } })),

    addClient: (client) => update((d) => ({
      clients: [{ id: uid(), language: d.salon?.textLanguage || 'en', service: 'fill', lastVisit: today(), visits: 1, notes: '', reviewRequestedAt: null, winbackSentAt: null, createdAt: today(), ...client }, ...d.clients],
    })),
    importClients: (list) => update((d) => {
      const known = new Set(d.clients.map((c) => c.phone.replace(/\D/g, '')));
      const fresh = list
        .filter((c) => !known.has(c.phone.replace(/\D/g, '')))
        .map((c) => ({ id: uid(), language: d.salon?.textLanguage || 'en', service: 'fill', visits: 1, notes: '', reviewRequestedAt: null, winbackSentAt: null, createdAt: today(), ...c }));
      return { clients: [...fresh, ...d.clients] };
    }),
    updateClient: (id, patch) => update((d) => ({ clients: d.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
    removeClient: (id) => update((d) => ({ clients: d.clients.filter((c) => c.id !== id) })),

    // A visit today. If a win-back went out since their last visit, it counts as a client won back.
    recordVisit: (id) => update((d) => {
      const client = d.clients.find((c) => c.id === id);
      if (!client) return {};
      const wonBack = client.winbackSentAt && client.winbackSentAt >= client.lastVisit;
      const activity = wonBack
        ? [{ id: uid(), type: 'returned', clientId: id, name: client.name, at: today(), amount: Number(d.salon?.avgTicket) || 0 }, ...d.activity]
        : [{ id: uid(), type: 'visit', clientId: id, name: client.name, at: today() }, ...d.activity];
      return {
        clients: d.clients.map((c) => (c.id === id ? { ...c, lastVisit: today(), visits: (c.visits || 0) + 1 } : c)),
        activity,
      };
    }),
    markSent: (id, kind) => update((d) => {
      const client = d.clients.find((c) => c.id === id);
      const field = kind === 'review' ? 'reviewRequestedAt' : 'winbackSentAt';
      return {
        clients: d.clients.map((c) => (c.id === id ? { ...c, [field]: today() } : c)),
        activity: [{ id: uid(), type: kind === 'review' ? 'review_request' : 'winback', clientId: id, name: client?.name, at: today() }, ...d.activity],
      };
    }),

    setTemplate: (kind, lang, text) => update((d) => ({ templates: { ...d.templates, [kind]: { ...d.templates[kind], [lang]: text } } })),
    resetTemplates: () => update(() => ({ templates: DEFAULT_TEMPLATES })),

    addReview: (review) => update((d) => ({ reviews: [{ id: uid(), date: today(), reply: '', replied: false, ...review }, ...d.reviews] })),
    updateReview: (id, patch) => update((d) => ({ reviews: d.reviews.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
    removeReview: (id) => update((d) => ({ reviews: d.reviews.filter((r) => r.id !== id) })),

    loadSample: () => setData(sampleData()),
    resetAll: () => setData(EMPTY),
  }), [update]);

  const value = useMemo(() => ({ ...data, ...actions, storageKey }), [data, actions, storageKey]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
