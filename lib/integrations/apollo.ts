const APOLLO_BASE='https://api.apollo.io/v1';
export async function apolloCompanyEnrich(params:Record<string,any>){
  const key=process.env.APOLLO_API_KEY; if(!key) throw new Error('APOLLO_API_KEY ausente');
  const url=`${APOLLO_BASE}/mixed_companies/search`;
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:key,...params})});
  if(!r.ok) throw new Error(`Apollo HTTP ${r.status}`);
  return r.json();
}
export async function apolloPeopleSearch(params:Record<string,any>){
  const key=process.env.APOLLO_API_KEY; if(!key) throw new Error('APOLLO_API_KEY ausente');
  const url=`${APOLLO_BASE}/people/search`;
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:key,...params})});
  if(!r.ok) throw new Error(`Apollo HTTP ${r.status}`);
  return r.json();
}
