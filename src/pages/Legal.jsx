import { Link } from 'react-router-dom';
import { Back, Logo } from '../components/Icons.jsx';

// Starter text only. Have these reviewed by a lawyer before launch.
const PAGES = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['Your clients belong to you', 'We never sell, rent or share your client list. Client names and phone numbers are used only to send the texts you ask GlowBack to send.'],
      ['What we collect', 'From salon owners: name, salon name, phone, email, city and booking app. From your clients: name, phone number, preferred language, and visit dates you provide.'],
      ['How we protect it', 'Data is encrypted in transit. Access is limited to your account. You can export or delete your data at any time by contacting us.'],
      ['Reviews', 'We ask every client for a review—never only the happy ones, and never in exchange for rewards—in line with Google’s review policies and the FTC rule on fake reviews.'],
      ['Contact', 'Questions? Call or text (561) 555-0123.'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      ['Free trial', 'Your 14-day trial needs no credit card. If you don’t choose a plan, your account pauses. We never charge you by surprise.'],
      ['Billing', 'Plans are billed monthly or yearly. Cancel anytime; you keep access until the end of the period you paid for. 30-day money-back guarantee on your first payment.'],
      ['Your responsibilities', 'Only add clients who gave you their number and expect to hear from your salon. Honor every STOP request.'],
      ['Results', 'Numbers shown on our website are examples and estimates, not guarantees.'],
    ],
  },
  sms: {
    title: 'SMS Terms & Opt-Out',
    sections: [
      ['What texts you’ll get', 'Clients receive at most one review request per visit and occasional reminders to rebook. Salon owners receive account and setup texts.'],
      ['Opt out anytime', 'Reply STOP to any message to stop receiving texts. Reply HELP for help.'],
      ['Costs', 'Message and data rates may apply. Message frequency varies.'],
      ['Carriers', 'Carriers are not liable for delayed or undelivered messages.'],
    ],
  },
};

export default function Legal({ page }) {
  const p = PAGES[page];
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ textDecoration: 'none' }}><Logo size={30} fontSize={22} /></Link>
          <Link to="/" className="btn btn-quiet btn-sm"><Back size={16} />Home</Link>
        </div>
      </header>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 20px 80px' }}>
        <h1 className="serif" style={{ margin: '0 0 8px', fontSize: 'clamp(34px,4vw,44px)', lineHeight: 1.15 }}>{p.title}</h1>
        <p className="tag amber" style={{ margin: '0 0 28px' }}>Draft — review with a lawyer before launch</p>
        <div className="panel stack" style={{ gap: 24 }}>
          {p.sections.map(([h, body]) => (
            <section key={h}>
              <h2 style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 600 }}>{h}</h2>
              <p style={{ margin: 0, color: 'var(--text-2)' }}>{body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
