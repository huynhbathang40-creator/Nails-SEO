// Sends a form to Netlify Forms. The matching hidden <form> lives in index.html.
// Submissions show up in the Netlify dashboard under Forms.
export async function submitForm(name, data) {
  const fields = { 'form-name': name };
  for (const [k, v] of Object.entries(data)) fields[k] = typeof v === 'boolean' ? (v ? 'yes' : 'no') : String(v ?? '');
  if (import.meta.env.DEV) {
    // The Vite dev server has no Netlify Forms backend.
    console.info(`[dev] form "${name}" would be submitted:`, fields);
    await new Promise(r => setTimeout(r, 600));
    return;
  }
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });
  if (!res.ok) throw new Error(`Form "${name}" failed with ${res.status}`);
}
