// Win-back estimate used on the landing page calculator.
// Assumes 8% of lapsed clients return for about half a year.
export function calculateWinBack(clientList, avgTicket, lapsedPct, visitsPerYear, price = 49) {
  const lapsed = clientList * (lapsedPct / 100);
  const won = Math.round(lapsed * 0.08);
  const annual = won * avgTicket * visitsPerYear * 0.5;
  const monthly = annual / 12;
  return {
    clientsWonBack: won,
    monthlyRevenue: Math.round(monthly),
    annualRevenue: Math.round(annual),
    returnMultiple: (monthly / price).toFixed(1),
    visitsMonthly: Math.round((won * visitsPerYear * 0.5) / 12 * 10) / 10,
  };
}

export const fmtPhone = (v) => {
  const d = v.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

export const digits = (v) => v.replace(/\D/g, '').length;

export const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

export const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
