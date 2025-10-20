export async function phantomRun(agentId: string, input: any) {
  const key = process.env.PHANTOM_BUSTER_API_KEY;
  if (!key) throw new Error('PHANTOM_BUSTER_API_KEY ausente');
  const resp = await fetch('https://api.phantombuster.com/api/v2/agents/launch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Phantombuster-Key-1': key },
    body: JSON.stringify({ id: agentId, argument: input })
  });
  if (!resp.ok) throw new Error(`Phantom launch HTTP ${resp.status}`);
  return resp.json();
}
