// Text-message templates and helpers for review requests, win-backs and review replies.

export const DEFAULT_TEMPLATES = {
  review: {
    en: 'Hi {first}! Thank you for coming to {salon} today. Loved your nails? A quick Google review helps us a lot: {link}',
    vi: 'Chào {first}! Cảm ơn chị đã ghé {salon} hôm nay. Chị thích bộ móng không? Một đánh giá Google giúp tiệm rất nhiều: {link}',
  },
  winback: {
    en: "Hi {first}, it's {owner} at {salon}! It's been {weeks} since your {service}. Want to book this week? Pick a time here: {link}",
    vi: 'Chào {first}, {owner} ở {salon} đây! Đã {weeks} từ lần {service} trước. Chị muốn đặt lịch tuần này không? Chọn giờ tại đây: {link}',
  },
};

export const SERVICES = ['fill', 'pedicure', 'manicure', 'other'];

export const SERVICE_LABEL = {
  en: { fill: 'fill', pedicure: 'pedicure', manicure: 'manicure', other: 'last visit' },
  vi: { fill: 'làm fill', pedicure: 'làm chân', manicure: 'làm tay', other: 'ghé tiệm' },
};

export const firstName = (name = '') => name.trim().split(/\s+/)[0] || '';

export function fillTemplate(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== '' ? vars[k] : m));
}

export function weeksSince(dateStr, now = new Date()) {
  if (!dateStr) return 0;
  return Math.floor((now - new Date(dateStr + 'T12:00:00')) / (7 * 24 * 3600 * 1000));
}

export const weeksLabel = (n, lang) => (lang === 'vi' ? `${n} tuần` : n === 1 ? '1 week' : `${n} weeks`);

export function buildMessage(kind, client, salon, templates) {
  const lang = client.language === 'vi' ? 'vi' : 'en';
  const tpl = templates?.[kind]?.[lang] || DEFAULT_TEMPLATES[kind][lang];
  return fillTemplate(tpl, {
    first: firstName(client.name),
    name: client.name,
    salon: salon.name || 'our salon',
    owner: firstName(salon.owner) || salon.name || '',
    link: kind === 'review' ? salon.googleReviewLink || '' : salon.bookingLink || salon.phone || '',
    weeks: weeksLabel(Math.max(1, weeksSince(client.lastVisit)), lang),
    service: SERVICE_LABEL[lang][client.service] || SERVICE_LABEL[lang].other,
  });
}

// Opens the phone's Messages app with the text filled in. "?&body=" works on both iOS and Android.
export function smsHref(phone, body) {
  const to = (phone || '').replace(/[^\d+]/g, '');
  return `sms:${to}?&body=${encodeURIComponent(body)}`;
}

const KEYWORDS = [
  ['dip', { en: 'dip', vi: 'bộ dip' }],
  ['gel', { en: 'gel', vi: 'bộ gel' }],
  ['acrylic', { en: 'acrylics', vi: 'bộ bột' }],
  ['pedi', { en: 'pedicure', vi: 'làm chân' }],
  ['design', { en: 'nail design', vi: 'mẫu móng' }],
  ['art', { en: 'nail art', vi: 'mẫu vẽ' }],
];

// Polite, short reply suggestion the owner approves or edits before posting on Google.
export function suggestReply(review, salon, lang = 'en') {
  const first = firstName(review.author) || (lang === 'vi' ? 'bạn' : 'there');
  const text = (review.text || '').toLowerCase();
  const kw = KEYWORDS.find(([k]) => text.includes(k));
  const owner = firstName(salon.owner);
  const sign = owner ? ` — ${owner}, ${salon.name}` : '';
  const phone = salon.phone ? (lang === 'vi' ? ` qua số ${salon.phone}` : ` at ${salon.phone}`) : '';
  if (review.rating >= 4) {
    if (lang === 'vi') {
      return kw
        ? `Cảm ơn ${first} rất nhiều! Tiệm rất vui vì chị thích ${kw[1].vi}. Hẹn gặp lại chị lần tới ở ${salon.name}!${sign}`
        : `Cảm ơn ${first} rất nhiều! Tiệm rất vui vì chị hài lòng. Hẹn gặp lại chị lần tới ở ${salon.name}!${sign}`;
    }
    return kw
      ? `Thank you so much, ${first}! We're so happy you loved your ${kw[1].en}. See you at your next visit!${sign}`
      : `Thank you so much, ${first}! We're so happy you enjoyed your visit to ${salon.name}. See you next time!${sign}`;
  }
  if (review.rating === 3) {
    return lang === 'vi'
      ? `Cảm ơn ${first} đã góp ý. Tiệm muốn lần sau của chị thật hoàn hảo — chị liên hệ tiệm${phone} để tụi em phục vụ tốt hơn nhé.${sign}`
      : `Thank you for the feedback, ${first}. We want your next visit to be perfect — please reach out to us${phone} so we can make it even better.${sign}`;
  }
  return lang === 'vi'
    ? `${first} ơi, tiệm rất tiếc vì lần ghé vừa rồi chưa làm chị hài lòng. Chị vui lòng liên hệ tiệm${phone} để tụi em sửa lại cho chị.${sign}`
    : `Hi ${first}, we're truly sorry your visit wasn't what you expected. Please contact us${phone} so we can make it right.${sign}`;
}
