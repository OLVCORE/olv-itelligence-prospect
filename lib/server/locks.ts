import { supabaseAdmin } from '@/lib/supabaseAdmin';
export async function tryLockCompany(companyId:string, holder='ops'){
  const sb=supabaseAdmin();
  try{
    const { data, error } = await sb.from('IngestLock').insert({ companyId, holder }).select('*').single();
    if (error) return false;
    return !!data;
  }catch{ return false; }
}
export async function releaseLock(companyId:string){
  const sb=supabaseAdmin(); try{ await sb.from('IngestLock').delete().eq('companyId', companyId);}catch{}
}
