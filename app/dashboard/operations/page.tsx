import Link from 'next/link';

async function fetchJSON(path:string){
  const h:any={'Content-Type':'application/json'};
  if (process.env.OLV_ADMIN_KEY) h['x-olv-admin-key']=process.env.OLV_ADMIN_KEY!;
  const base = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const r=await fetch(`${base}${path}`,{ cache:'no-store', headers:h as any });
  if(!r.ok) return null; return r.json();
}

export default async function OperationsPage(){
  const [metrics, runs] = await Promise.all([
    fetchJSON('/api/ops/metrics'),
    fetchJSON('/api/ops/runs'),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">⚙️ Operações & Observabilidade</h1>
        <Link href="/dashboard" className="text-sm underline">← Voltar ao Dashboard</Link>
      </div>

      {/* Cards superiores */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {['companies','monitors','runs24','techsignals','firmographics','maturity'].map((k)=>(
          <div key={k} className="rounded-2xl shadow p-4 bg-white dark:bg-gray-800">
            <div className="text-sm opacity-70 capitalize">{k.replace(/([A-Z])/g, ' $1')}</div>
            <div className="text-2xl font-bold">{metrics?.counts?.[k] ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* Últimos scores */}
      <div className="rounded-2xl shadow p-4 bg-white dark:bg-gray-800">
        <div className="mb-3 text-lg font-semibold">Últimos Scores (vendor)</div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(metrics?.lastScores||[]).map((s:any,idx:number)=>(
            <div key={idx} className="rounded-xl border p-3 bg-gray-50 dark:bg-gray-700">
              <div className="text-sm opacity-70">{s.vendor}</div>
              <div className="text-2xl font-bold">{s?.scores?.overall ?? '—'}</div>
              <div className="text-xs mt-1 opacity-60">companyId: {s.companyId.substring(0,12)}...</div>
              <div className="text-xs opacity-60">atualizado: {new Date(s.updatedAt).toLocaleString()}</div>
            </div>
          ))}
          {(!metrics?.lastScores?.length) && <div className="opacity-60">Sem dados de maturidade ainda.</div>}
        </div>
      </div>

      {/* Execuções recentes */}
      <div className="rounded-2xl shadow p-4 bg-white dark:bg-gray-800">
        <div className="mb-3 text-lg font-semibold">Execuções Recentes</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2">Run</th>
                <th>Company</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Início</th>
                <th>Fim</th>
              </tr>
            </thead>
            <tbody>
              {(runs?.runs||[]).slice(0,50).map((r:any)=>(
                <tr key={r.id} className="border-t">
                  <td className="py-2 text-xs">{r.id.substring(0,8)}...</td>
                  <td className="text-xs">{r.companyId.substring(0,12)}...</td>
                  <td>{r.vendor}</td>
                  <td className={r.status==='ok'?'text-green-600':(r.status?.includes('error')?'text-red-600':'')}>
                    {r.status}
                  </td>
                  <td className="text-xs">{new Date(r.startedAt).toLocaleString()}</td>
                  <td className="text-xs">{r.finishedAt? new Date(r.finishedAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
              {(!runs?.runs?.length) && <tr><td className="py-3 opacity-60" colSpan={6}>Sem execuções registradas.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
