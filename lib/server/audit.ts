import { supabaseAdmin } from '@/lib/supabaseAdmin';
export async function audit({actor,action,target,meta,ip,route,level='info'}:any){
  try{ const sb=supabaseAdmin(); await sb.from('ApiAuditLog').insert({actor,action,target,meta,ip,route,level}); }catch{}
}
