export async function serperSearch(q:string, num=5){
  const key = process.env.SERPER_API_KEY; if(!key) throw new Error('SERPER_API_KEY ausente');
  const resp = await fetch('https://google.serper.dev/search',{ method:'POST', headers:{ 'Content-Type':'application/json','X-API-KEY':key }, body: JSON.stringify({ q, num })});
  if(!resp.ok) throw new Error(`Serper HTTP ${resp.status}`);
  return resp.json();
}
