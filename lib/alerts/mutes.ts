import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function isMuted(
  { ruleName, companyId, vendor }:
  { ruleName?:string|null; companyId?:string|null; vendor?:string|null }
){
  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  let q = sb.from('AlertMute')
            .select('*')
            .gte('until', now)
            .order('until', { ascending: false });

  if (ruleName) q = q.eq('ruleName', ruleName);
  if (companyId) q = q.eq('companyId', companyId);
  if (vendor) q = q.eq('vendor', vendor);

  const { data } = await q.limit(1);
  // Também consideramos mutes "globais" (todos), se existirem (campos nulos)
  if (data && data.length) return true;

  const { data: globalMute } = await sb
    .from('AlertMute')
    .select('*')
    .is('ruleName', null).is('companyId', null).is('vendor', null)
    .gte('until', now)
    .limit(1);
  return !!(globalMute && globalMute.length);
}
