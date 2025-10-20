export async function sendSlack(text:string){
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return { ok:false, skipped:'no_webhook' };
  const res = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ text })
  });
  return { ok: res.ok, status: res.status };
}
