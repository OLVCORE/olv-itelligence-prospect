type K=string; const buckets=new Map<K,{tokens:number,ts:number}>();
const BURST=20, REFILL_PER_SEC=5;
export function rateLimit(ip:string, route:string){
  const key=`${ip}|${route}`; const now=Date.now();
  const b=buckets.get(key) || { tokens: BURST, ts: now };
  const elapsed=(now-b.ts)/1000; b.tokens=Math.min(BURST, b.tokens + elapsed*REFILL_PER_SEC); b.ts=now;
  if (b.tokens < 1) return false; b.tokens-=1; buckets.set(key,b); return true;
}
export function requireAdmin(reqHeaders:Headers){
  const want=reqHeaders.get('x-olv-admin-key');
  const have=process.env.OLV_ADMIN_KEY;
  if (!have) return true; // se não configurado, permite (evita travar ambiente dev)
  return want && want === have;
}
