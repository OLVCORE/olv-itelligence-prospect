import Link from 'next/link';

async function fetchJSON(path:string){
  const h:any={'Content-Type':'application/json'};
  if (process.env.OLV_ADMIN_KEY) h['x-olv-admin-key']=process.env.OLV_ADMIN_KEY!;
  const base = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const r=await fetch(`${base}${path}`,{ cache:'no-store', headers:h as any });
  if(!r.ok) return null; return r.json();
}

export default async function OperationsPage(){
  const [mutes, alerts, metrics, runs] = await Promise.all([
    fetchJSON('/api/alerts/mute'),
    fetchJSON('/api/alerts/events'),
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
      
      {/* Últimos Alertas */}
      <div className="rounded-2xl shadow p-4 bg-white dark:bg-gray-800">
        <div className="mb-3 text-lg font-semibold">🔔 Últimos Alertas</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2">Quando</th>
                <th>Regra</th>
                <th>Sev</th>
                <th>Mensagem</th>
                <th>Empresa</th>
                <th>Vendor</th>
              </tr>
            </thead>
            <tbody>
              {(alerts?.events||[]).slice(0,20).map((e:any)=>(
                <tr key={e.id} className="border-t">
                  <td className="py-2 text-xs">{new Date(e.ts).toLocaleString()}</td>
                  <td className="text-xs">{e.ruleName}</td>
                  <td className={e.severity==='critical'?'text-red-600 font-bold':(e.severity==='high'?'text-orange-600':'text-gray-600')}>
                    {e.severity}
                  </td>
                  <td className="max-w-[420px] truncate" title={e.message}>{e.message}</td>
                  <td className="text-xs">{e.companyId ? e.companyId.substring(0,10)+'...' : '—'}</td>
                  <td className="text-xs">{e.vendor||'—'}</td>
                </tr>
              ))}
              {(!alerts?.events?.length) && <tr><td colSpan={6} className="py-3 opacity-60">Sem alertas até o momento.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mutes Ativos */}
      <div className="rounded-2xl shadow p-4 bg-white dark:bg-gray-800">
        <div className="mb-3 text-lg font-semibold">🔕 Mutes Ativos</div>
        <div className="text-sm mb-3 opacity-70">
          Regras/empresas silenciadas temporariamente (controlado via API segura).
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2">Regra</th>
                <th>Empresa</th>
                <th>Vendor</th>
                <th>Até</th>
                <th>Nota</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {(mutes?.mutes||[]).map((m:any)=>(
                <tr key={m.id} className="border-t">
                  <td className="py-2">{m.ruleName || '—'}</td>
                  <td className="text-xs">{m.companyId ? m.companyId.substring(0,12)+'...' : '—'}</td>
                  <td>{m.vendor || '—'}</td>
                  <td className="text-xs">{new Date(m.until).toLocaleString()}</td>
                  <td className="max-w-[360px] truncate text-xs" title={m.note || ''}>{m.note || '—'}</td>
                  <td className="opacity-60 text-xs">{m.id.substring(0,8)}...</td>
                </tr>
              ))}
              {(!mutes?.mutes?.length) && <tr><td colSpan={6} className="py-3 opacity-60">Nenhum mute ativo.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="text-xs mt-3 opacity-60">
          Para criar/remover mutes, use as APIs seguras com <code>x-olv-admin-key</code>.
        </div>
      </div>
</div>
    </div>
  )
}
