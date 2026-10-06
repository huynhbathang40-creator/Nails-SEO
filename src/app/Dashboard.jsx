import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Check, Heart, Send, Star } from '../components/Icons.jsx';
import { money } from '../lib/calc.js';
import { firstName, weeksSince } from '../lib/messages.js';
import { clientStatus, useStore } from '../lib/store.jsx';
import { initials, SendSheet, useS } from './ui.jsx';

export function ClientLine({ client, action, onAction, onVisit }) {
  const s = useS();
  return (
    <div className="row" style={{ flexWrap: 'wrap' }}>
      <span className="avatar">{initials(client.name)}</span>
      <div className="grow" style={{ minWidth: 150 }}>
        <div className="truncate" style={{ fontWeight: 600 }}>{client.name}</div>
        <div className="muted small truncate">{s.services[client.service]} · {s.weeksAgo(weeksSince(client.lastVisit))} · {client.language === 'vi' ? 'VI' : 'EN'}</div>
      </div>
      <div className="hstack" style={{ gap: 6, marginLeft: 'auto' }}>
      {onVisit && <button type="button" className="btn btn-quiet btn-xs" onClick={onVisit} title={s.cameIn}><Check size={14} /><span className="hide-sm">{s.cameIn}</span></button>}
      <button type="button" className="btn btn-primary btn-xs" onClick={onAction}><Send size={14} />{action}</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const s = useS();
  const { toast } = useOutletContext();
  const { salon, clients, activity, recordVisit } = useStore();
  const [sending, setSending] = useState(null);

  const month = new Date().toISOString().slice(0, 7);
  const stats = useMemo(() => {
    const thisMonth = activity.filter((a) => a.at.startsWith(month));
    const returned = thisMonth.filter((a) => a.type === 'returned');
    return {
      asked: thisMonth.filter((a) => a.type === 'review_request').length,
      returned: returned.length,
      money: returned.reduce((sum, a) => sum + (a.amount || 0), 0),
    };
  }, [activity, month]);

  const reviewTodo = clients.filter((c) => clientStatus(c, salon) === 'review');
  const winbackTodo = clients
    .filter((c) => clientStatus(c, salon) === 'winback')
    .sort((a, b) => a.lastVisit.localeCompare(b.lastVisit));

  const visit = (c) => {
    const won = c.winbackSentAt && c.winbackSentAt >= c.lastVisit;
    recordVisit(c.id);
    toast(won ? s.wonToast(firstName(c.name)) : s.visitToast);
  };

  const todoPanel = (title, sub, list, kind, icon) => (
    <section className="panel">
      <div className="panel-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: kind === 'review' ? '#FFF6DC' : '#FFF0F3', display: 'grid', placeItems: 'center' }}>{icon}</span>
          <div>
            <h2>{title} <span className="tag" style={{ marginLeft: 4 }}>{list.length}</span></h2>
            <div className="muted small">{sub}</div>
          </div>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="empty" style={{ padding: 20 }}>{s.allDone}</div>
      ) : (
        list.slice(0, 6).map((c) => (
          <ClientLine key={c.id} client={c} action={kind === 'review' ? s.ask : s.winback} onAction={() => setSending({ client: c, kind })} onVisit={kind === 'winback' ? () => visit(c) : null} />
        ))
      )}
      {list.length > 6 && <Link to={`/app/clients?filter=${kind}`} className="link-btn" style={{ display: 'inline-block', marginTop: 8 }}>{s.seeAll} →</Link>}
    </section>
  );

  return (
    <>
      <div className="app-top">
        <div>
          <h1>{s.hello(firstName(salon.owner) || salon.name)}</h1>
          <p>{s.todaySub}</p>
        </div>
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>{s.thisMonth}</div>
        <div className="stat-grid">
          <div className="stat"><div className="lbl">{s.statAsked}</div><div className="num">{stats.asked}</div></div>
          <div className="stat"><div className="lbl">{s.statReturned}</div><div className="num">{stats.returned}</div></div>
          <div className="stat"><div className="lbl">{s.statMoney}</div><div className="num">{money(stats.money)}</div><div className="muted small">{s.moneyHint(salon.avgTicket)}</div></div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 20 }}>
        {todoPanel(s.todoReview, s.todoReviewSub, reviewTodo, 'review', <Star size={20} />)}
        {todoPanel(s.todoWinback, s.todoWinbackSub, winbackTodo, 'winback', <Heart size={20} color="#D63A7E" />)}
      </div>

      <section className="panel">
        <div className="panel-head"><h2>{s.recent}</h2></div>
        {activity.length === 0 ? (
          <div className="empty">{s.noActivity}</div>
        ) : (
          activity.slice(0, 8).map((a) => (
            <div key={a.id} className="row" style={{ padding: '10px 0' }}>
              <span className={`tag ${a.type === 'returned' ? 'green' : a.type === 'winback' ? 'pink' : a.type === 'visit' ? 'grey' : 'amber'}`}>
                {a.type === 'returned' ? '★' : a.type === 'winback' ? '♥' : a.type === 'visit' ? '✓' : '✉'}
              </span>
              <div className="grow truncate">{s.act[a.type]} <strong>{a.name}</strong>{a.amount ? ` · ${money(a.amount)}` : ''}</div>
              <span className="muted small">{new Date(a.at + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          ))
        )}
      </section>

      {sending && <SendSheet client={sending.client} kind={sending.kind} toast={toast} onClose={() => setSending(null)} />}
    </>
  );
}
