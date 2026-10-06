import { useRef, useState } from 'react';
import { Upload } from '../components/Icons.jsx';
import { authErrorMessage, useAuth } from '../lib/auth.jsx';
import { useLang } from '../lib/i18n.jsx';
import { initials } from './ui.jsx';

export function Avatar({ url, name, size = 40 }) {
  const [broken, setBroken] = useState(false);
  const style = { width: size, height: size, flex: 'none', borderRadius: '50%', overflow: 'hidden' };
  if (url && !broken) return <img src={url} alt="" onError={() => setBroken(true)} style={{ ...style, objectFit: 'cover', background: 'var(--lilac)' }} />;
  return (
    <span aria-hidden="true" style={{ ...style, display: 'grid', placeItems: 'center', background: 'var(--rainbow)', color: '#fff', fontWeight: 700, fontSize: Math.round(size * 0.36) }}>
      {initials(name)}
    </span>
  );
}

// Photo + "Upload photo" button. Uploads to Supabase Storage and calls onChange(url).
export function AvatarPicker({ url, name, onChange, labels }) {
  const { uploadAvatar } = useAuth();
  const { lang } = useLang();
  const input = useRef(null);
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setStatus('uploading');
    setErr('');
    try {
      onChange(await uploadAvatar(file));
    } catch (error) {
      setErr(authErrorMessage(error, lang));
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
      <Avatar url={url} name={name} size={88} />
      <div className="stack" style={{ gap: 6 }}>
        <div className="hstack">
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => input.current?.click()} disabled={status === 'uploading'}>
            <Upload size={16} />{status === 'uploading' ? labels.uploading : url ? labels.change : labels.upload}
          </button>
          {url && status !== 'uploading' && <button type="button" className="link-btn" onClick={() => onChange('')}>{labels.remove}</button>}
        </div>
        <span className="muted small">{labels.hint}</span>
        {err && <span className="err">{err}</span>}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={pick} />
    </div>
  );
}
