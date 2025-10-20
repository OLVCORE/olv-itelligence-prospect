export async function hunterFind(domain:string, full_name?:string){
  const key=process.env.HUNTER_API_KEY; if(!key) throw new Error('HUNTER_API_KEY ausente');
  const u=new URL('https://api.hunter.io/v2/email-finder');
  u.searchParams.set('domain',domain); if(full_name) u.searchParams.set('full_name',full_name); u.searchParams.set('api_key',key);
  const r=await fetch(u.toString()); if(!r.ok) throw new Error(`Hunter find HTTP ${r.status}`); return r.json();
}
export async function hunterVerify(email:string){
  const key=process.env.HUNTER_API_KEY; if(!key) throw new Error('HUNTER_API_KEY ausente');
  const u=new URL('https://api.hunter.io/v2/email-verifier');
  u.searchParams.set('email',email); u.searchParams.set('api_key',key);
  const r=await fetch(u.toString()); if(!r.ok) throw new Error(`Hunter verify HTTP ${r.status}`); return r.json();
}
