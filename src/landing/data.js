// Landing page copy and data. Strings marked [X] / [XX] are placeholders to replace with real numbers.

export const FEED = [
  { kind: 'review', app: 'Google', title: 'New Google review from Rachel M.', body: '"Best nails in Delray, hands down."' },
  { kind: 'booking', app: 'GlowBack', title: 'Mrs. Johnson booked Tuesday 2:00 PM', body: 'Came back from a win-back text' },
  { kind: 'review', app: 'Google', title: 'New Google review from Tina P.', body: '"So relaxing. My dip lasted three weeks!"' },
];

export const OTHERS = [
  { name: 'Polished Nail Bar', rating: '4.8', reviews: 412 },
  { name: 'Diamond Nails & Spa', rating: '4.6', reviews: 298 },
  { name: 'Crystal Nails', rating: '4.5', reviews: 241 },
  { name: 'Bella Nail Studio', rating: '4.4', reviews: 176 },
  { name: 'Nails 21', rating: '4.7', reviews: 133 },
];

export const COPY = {
  en: {
    badge: 'Built for nail salons • English & Tiếng Việt',
    signIn: 'Sign In',
    navCta: 'Start Free Trial',
    h1: 'Get More 5-Star Reviews and Bring Your Regulars Back—Automatically',
    sub: "GlowBack asks every happy client for a Google review and texts past clients when it's time for their next fill. You do the nails. We fill the chairs.",
    cta: 'Start My Free Trial',
    cta2: 'See How It Works',
    demoCta: 'Book a 15-Minute Demo',
    micro: '14-day free trial • No credit card • Cancel anytime',
    chips: ['No contract', 'Set up in 20 minutes', 'Works with the booking app you already use'],
    rot: ['More stars.', 'More regulars.', 'Fuller Tuesdays.'],
    finalH: 'Fill Your Chairs. Get Your Evenings Back.',
    finalSub: 'Start your 14-day free trial today. Set up in 20 minutes, no credit card, no contract. See your first new reviews this week.',
    finalTrust: ['14-day trial', 'No credit card', 'Cancel anytime', 'English & Tiếng Việt support'],
    nav: ['How It Works', 'Results', 'Pricing', 'FAQ'],
  },
  vi: {
    badge: 'Dành cho tiệm nail • English & Tiếng Việt',
    signIn: 'Đăng nhập',
    navCta: 'Dùng thử miễn phí',
    h1: 'Thêm đánh giá 5 sao, đưa khách quen quay lại—hoàn toàn tự động',
    sub: 'GlowBack nhắn tin xin đánh giá Google từ mỗi khách hài lòng và nhắc khách cũ khi đến lúc làm fill. Chị lo làm móng. Chúng tôi lo lấp đầy ghế.',
    cta: 'Dùng thử miễn phí',
    cta2: 'Xem cách hoạt động',
    demoCta: 'Đặt lịch demo 15 phút',
    micro: 'Dùng thử 14 ngày • Không cần thẻ • Hủy bất cứ lúc nào',
    chips: ['Không hợp đồng', 'Cài đặt trong 20 phút', 'Dùng với app đặt lịch chị đang có'],
    rot: ['Thêm sao.', 'Thêm khách quen.', 'Thứ Ba đông khách.'],
    finalH: 'Lấp đầy ghế. Có lại buổi tối.',
    finalSub: 'Bắt đầu dùng thử 14 ngày hôm nay. Cài đặt trong 20 phút, không cần thẻ, không hợp đồng. Thấy đánh giá mới ngay tuần này.',
    finalTrust: ['Dùng thử 14 ngày', 'Không cần thẻ', 'Hủy bất cứ lúc nào', 'Hỗ trợ English & Tiếng Việt'],
    nav: ['Cách hoạt động', 'Kết quả', 'Bảng giá', 'Hỏi đáp'],
  },
};

export const PROBLEMS = [
  { icon: 'phone', title: 'The Review Gap', body: 'Happy clients promise to leave a review, then forget before they reach their car. Meanwhile, the new salon nearby has 400 reviews and shows up first on Google Maps.', stat: '[XX]%', statText: 'of consumers read online reviews before choosing a local business', source: 'Placeholder · verify: BrightLocal Consumer Review Survey' },
  { icon: 'chair', title: 'The Silent Goodbye', body: "Regulars don't complain. They just stop coming. Nobody has time to call them, and you never find out why.", stat: '[X]×', statText: 'more to win a new client than to keep one', source: 'Placeholder · verify source' },
  { icon: 'cal', title: 'The Slow Tuesday', body: 'Weekday chairs sit empty while you still pay rent and your technicians. Discount sites fill seats with one-time bargain hunters who never return.', stat: '[XX]%', statText: 'of deal-site clients never book a second visit', source: 'Placeholder · research and verify' },
];

export const WINBACK = {
  en: { msg: "Hi Mrs. Johnson, it's Linda at Lux Nails & Spa! It's been 3 weeks since your fill. Want to book this week? Pick a time here:", reply: "Oh my goodness, Linda! I've been meaning to come in. Can I book Tuesday?", booked: 'Booked: Tuesday 2:00 PM' },
  vi: { msg: 'Chào cô Hạnh, Linda ở Lux Nails & Spa đây! Đã 3 tuần từ lần làm fill trước. Cô muốn đặt lịch tuần này không? Chọn giờ tại đây:', reply: 'Ôi, cảm ơn Linda! Cô định ghé lâu rồi. Thứ Ba được không con?', booked: 'Đã đặt: Thứ Ba 2:00 PM' },
};

export const DASH_LANGS = [
  { lang: 'en', code: 'EN', head: 'This week', rows: [['New reviews', '14'], ['Clients returned', '6'], ['Money brought in', '$330']] },
  { lang: 'vi', code: 'VI', head: 'Tuần này', rows: [['Đánh giá mới', '14'], ['Khách quay lại', '6'], ['Doanh thu mang về', '$330']] },
];

export const TIMELINE = [
  { w: 'Week 1', t: '6 new Google reviews in two days' },
  { w: 'Week 4', t: 'Lapsed regulars start booking again' },
  { w: 'Week 9', t: '203 reviews, 4.9 stars, #1 on the map' },
];

export const TESTIMONIALS = [
  { quote: 'I got 40 reviews in one month. I checked my Google page myself.', name: 'Lan N.', salon: 'Nail salon, Orlando, FL' },
  { quote: 'Setup took twenty minutes. Nobody asked me about any computer words.', name: '[Owner name]', salon: '[Salon], [City], FL' },
  { quote: 'My slow Tuesday is full now. The texts go out by themselves.', name: '[Owner name]', salon: '[Salon], [City], FL' },
];

export const PLANS = [
  { key: 'essentials', name: 'Essentials', for: 'For single-location salons getting started', m: '$49', y: '$490',
    features: ['Automatic Google review requests', 'Win-back texts for lapsed clients', 'Simple results dashboard', 'English & Vietnamese texts', 'Up to 500 texts/month', '1 location, 2 staff logins'], cta: 'Start Free Trial' },
  { key: 'growth', name: 'Growth', for: 'Everything in Essentials, plus:', m: '$79', y: '$790', popular: true,
    features: ['Up to 1,500 texts/month', 'AI-written review replies (approve with one tap)', 'Birthday and holiday texts', 'Slow-day fill-up texts ("We have openings this Tuesday!")', 'Instant alerts for new reviews', 'Unlimited staff logins', 'Priority support in English & Vietnamese'], cta: 'Start Free Trial' },
  { key: 'multi', name: 'Multi-Location', for: 'Everything in Growth, plus:', m: 'Custom', y: 'Custom',
    features: ['2+ locations with one combined dashboard', 'Location comparison reports', 'Dedicated setup specialist (in-person setup in South Florida)', 'Custom text volume'], cta: 'Talk to Us' },
];

export const PRICING_TRUST = ['No credit card for trial', 'Cancel anytime', '30-day money-back guarantee', 'Setup in 20 minutes'];

export const COMPARE = [
  ['Reviews'], ['Automatic review requests', '✓', '✓', '✓'], ['Instant new-review alerts', '—', '✓', '✓'], ['AI-written review replies', '—', '✓', '✓'],
  ['Win-Back & Rebooking'], ['Win-back texts', '✓', '✓', '✓'], ['Birthday & holiday texts', '—', '✓', '✓'], ['Slow-day fill-up texts', '—', '✓', '✓'],
  ['Texting'], ['Texts per month', '500', '1,500', 'Custom'], ['English & Vietnamese texts', '✓', '✓', '✓'],
  ['Dashboard & Reports'], ['Results dashboard', '✓', '✓', '✓'], ['Staff logins', '2', 'Unlimited', 'Unlimited'], ['Combined multi-location dashboard', '—', '—', '✓'], ['Location comparison reports', '—', '—', '✓'],
  ['Support'], ['English & Vietnamese support', 'Standard', 'Priority', 'Dedicated specialist'], ['In-person setup (South Florida)', '—', '—', '✓'],
];

export const FAQS = [
  ['Is there a contract?', 'No. Pay month to month and cancel anytime with one click.'],
  ['What happens after the 14-day trial?', "You choose a plan. If you don't, your account simply pauses. We never charge you by surprise."],
  ['Do I need to be good with computers?', 'No. If you can send a text, you can use GlowBack. We can also set it up for you over the phone.'],
  ['Will it annoy my clients?', 'No. Each client gets at most one review request per visit, and win-back texts are spaced out. Clients can reply STOP anytime.'],
];

export const INTEGRATIONS = ['Square Appointments', 'Vagaro', 'Fresha', 'Booksy', 'GlossGenius', 'Mangomint', 'Google Business Profile'];

export const TRUST = [
  { h: 'We never sell or share your client list.', d: 'Your clients belong to you.' },
  { h: 'Registered business texting (A2P 10DLC).', d: 'Clients can reply STOP anytime.' },
  { h: 'We ask every client for a review.', d: "Never only the happy ones, and never with rewards. That follows Google's review policies and the FTC rule on fake reviews." },
  { h: 'Encrypted data and secure logins.', d: 'Your account and client info stay protected.' },
];

export const CHAPTERS = [
  ['0:00', 'The problem: empty chairs and missing reviews'],
  ['0:30', 'Setup in 20 minutes'],
  ['1:10', 'A client gets a review request'],
  ['1:40', 'A lapsed client gets a win-back text and books'],
  ['2:15', 'Your results screen'],
];

export const FOOTER_COLS = [
  { h: 'Product', links: [['How It Works', '/#how'], ['Pricing', '/#pricing'], ['Integrations', '/#integrations'], ['Win-Back Calculator', '/#results'], ['Salon Dashboard', '/app']] },
  { h: 'Resources', links: [['Salon Growth Blog', '#'], ['Success Stories', '#'], ['Help Center', '#'], ['Free Guide: How to Get 50 Google Reviews in 30 Days', '#']] },
  { h: 'Company', links: [['About Us', '#'], ['Contact', 'tel:+15615550123'], ['Partner With Us', '#']] },
  { h: 'Legal', links: [['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['SMS Terms & Opt-Out', '/sms-terms'], ['Cookie Policy', '/privacy']] },
];

export const STATION_OPTS = ['1–3', '4–6', '7–10', '11+'];
export const APP_OPTS = ['Square', 'Vagaro', 'Fresha', 'Booksy', 'GlossGenius', 'Paper/None', 'Other'];
export const TIME_OPTS = ['Weekday morning', 'Weekday afternoon', 'Weekday evening (after closing)', 'Sunday'];
