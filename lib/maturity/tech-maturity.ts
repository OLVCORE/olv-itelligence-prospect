export type DetectedItem = { product: string; vendor?: string; confidence?: number };
export type DetectedStack = {
  erp?: DetectedItem[]; crm?: DetectedItem[]; cloud?: DetectedItem[]; bi?: DetectedItem[];
  db?: DetectedItem[]; integrations?: DetectedItem[]; security?: DetectedItem[];
};
export type Scores = { infra:number; systems:number; data:number; security:number; automation:number; culture:number; overall:number };
const clamp = (n:number)=>Math.max(0,Math.min(100,n));
export function computeMaturity(input: { detectedStack: DetectedStack; signals?: any }): Scores {
  const ds = input.detectedStack || {};
  const infra = clamp((ds.cloud?.length?60:20) + (ds.security?.length?20:0));
  const systems = clamp((ds.erp?.length?40:10) + (ds.crm?.length?20:0) + (ds.bi?.length?20:0));
  const data = clamp((ds.bi?.length?40:10) + (ds.db?.length?20:0));
  const security = clamp((ds.security?.length?60:20));
  const automation = clamp((ds.integrations?.length?50:15));
  const culture =  clamp(30);
  const overall = Math.round((infra+systems+data+security+automation+culture)/6);
  return { infra, systems, data, security, automation, culture, overall };
}
