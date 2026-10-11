// The programme is in French, so dates are too. Local dates are built from their parts (never parsed as UTC).
const day = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const short = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const toDate = (value: string) => { const [year, month, date] = value.split('-').map(Number); return new Date(year!, month! - 1, date); };
export const formatDay = (value: string) => day.format(toDate(value));
export const formatShort = (value: string) => short.format(toDate(value));
export const formatTimestamp = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
