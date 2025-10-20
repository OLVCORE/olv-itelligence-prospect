export type DetectedItem = { product:string; vendor?:string; confidence?:number };
export type DetectedStack = { erp?:DetectedItem[]; crm?:DetectedItem[]; cloud?:DetectedItem[]; bi?:DetectedItem[]; db?:DetectedItem[]; integrations?:DetectedItem[]; security?:DetectedItem[] };

const ADD = (arr:DetectedItem[]|undefined, item:DetectedItem) => {
  const a = arr ?? [];
  // evita duplicatas por nome de produto (case-insensitive)
  if (!a.some(x => x.product.toLowerCase() === item.product.toLowerCase())) a.push(item);
  return a;
};

const K = {
  ERP: [/TOTVS|Protheus|RM|Datasul/i, /SAP|S/4HANA|Business One|B1|R3/i, /Oracle E-Business|Oracle Cloud ERP/i, /Microsoft Dynamics 365 (?:FO|Finance|Operations|Business Central)/i],
  CRM: [/Salesforce|SFDC/i, /Dynamics 365 CRM|Dynamics CRM/i, /RD Station/i, /HubSpot/i, /Pipedrive/i],
  CLOUD: [/AWS|Amazon Web Services/i, /Azure/i, /Google Cloud|GCP/i, /Oracle Cloud Infrastructure|OCI/i],
  BI: [/Power BI/i, /Tableau/i, /Qlik/i, /Looker/i, /Data Studio/i],
  DB: [/PostgreSQL|Postgres/i, /MySQL/i, /SQL Server/i, /Oracle Database/i, /MongoDB/i],
  INTEG: [/Mulesoft/i, /Dell Boomi/i, /Fluig/i, /Kafka/i, /RabbitMQ/i, /N8N|Make.com|Zapier/i],
  SEC: [/Fortinet|FortiGate/i, /Palo Alto Networks/i, /Checkpoint/i, /CrowdStrike/i, /Okta/i, /Azure AD|Entra ID/i]
};

// heurística para inferir vendor/product de uma string
function inferProduct(str:string): {cat:keyof DetectedStack, product:string, vendor?:string} | null {
  const s = str || '';
  const checks = [
    ['erp','TOTVS Protheus','TOTVS',K.ERP[0]],
    ['erp','SAP S/4HANA','SAP',K.ERP[1]],
    ['erp','Oracle Cloud ERP','Oracle',K.ERP[2]],
    ['erp','Dynamics 365 Finance & Ops','Microsoft',K.ERP[3]],
    ['crm','Salesforce Sales Cloud','Salesforce',K.CRM[0]],
    ['crm','Dynamics 365 CRM','Microsoft',K.CRM[1]],
    ['crm','RD Station CRM','RD Station',K.CRM[2]],
    ['crm','HubSpot CRM','HubSpot',K.CRM[3]],
    ['crm','Pipedrive','Pipedrive',K.CRM[4]],
    ['cloud','AWS','Amazon',K.CLOUD[0]],
    ['cloud','Azure','Microsoft',K.CLOUD[1]],
    ['cloud','Google Cloud','Google',K.CLOUD[2]],
    ['cloud','OCI','Oracle',K.CLOUD[3]],
    ['bi','Power BI','Microsoft',K.BI[0]],
    ['bi','Tableau','Salesforce',K.BI[1]],
    ['bi','Qlik','Qlik',K.BI[2]],
    ['bi','Looker','Google',K.BI[3]],
    ['bi','Data Studio','Google',K.BI[4]],
    ['db','PostgreSQL','PostgreSQL',K.DB[0]],
    ['db','MySQL','MySQL',K.DB[1]],
    ['db','SQL Server','Microsoft',K.DB[2]],
    ['db','Oracle Database','Oracle',K.DB[3]],
    ['db','MongoDB','MongoDB',K.DB[4]],
    ['integrations','MuleSoft','Salesforce',K.INTEG[0]],
    ['integrations','Boomi','Boomi',K.INTEG[1]],
    ['integrations','Fluig','TOTVS',K.INTEG[2]],
    ['integrations','Apache Kafka','Apache',K.INTEG[3]],
    ['integrations','RabbitMQ','RabbitMQ',K.INTEG[4]],
    ['integrations','N8N/Make/Zapier','n8n/Make/Zapier',K.INTEG[5]],
    ['security','FortiGate','Fortinet',K.SEC[0]],
    ['security','Palo Alto NGFW','Palo Alto',K.SEC[1]],
    ['security','Check Point','Check Point',K.SEC[2]],
    ['security','CrowdStrike Falcon','CrowdStrike',K.SEC[3]],
    ['security','Okta','Okta',K.SEC[4]],
    ['security','Entra ID','Microsoft',K.SEC[5]],
  ];
  for(const [cat,product,vendor,regex] of checks){
    if (regex.test(s)) return { cat: cat as keyof DetectedStack, product: product as string, vendor: vendor as string|undefined };
  }
  return null;
}

// agrega evidências: headers, tags, descrições, títulos, snippets
export function buildDetectedStackFromEvidence(evidence: Array<{key?:string; value?:any; source?:string; kind?:string}>, techTags?: any): DetectedStack {
  let out:DetectedStack = {};
  const push = (cat:keyof DetectedStack, prod:string, vendor?:string, confidence=60) => {
    // @ts-ignore
    out[cat] = ADD(out[cat], { product: prod, vendor, confidence });
  };

  const consider = (s?:string, conf=60) => {
    if (!s) return;
    const inf = inferProduct(s);
    if (inf) push(inf.cat, inf.product, inf.vendor, conf);
  };

  // Firmographics techTags (texto simples ou array de strings)
  if (techTags) {
    const arr = Array.isArray(techTags) ? techTags : Object.values(techTags);
    for (const t of arr) consider(String(t), 65);
  }

  // Evidências diversas
  for (const ev of evidence || []) {
    // value pode ser string, objeto (headers), array…
    if (!ev) continue;
    const src = (ev.source || ev.kind || '').toLowerCase();

    // headers HTTP (objeto)
    if (src.includes('http')) {
      const v = ev.value || {};
      for (const [k, val] of Object.entries(v)) {
        consider(`${k}: ${val}`, 55);
      }
    }

    // linkedin_job / descrição
    if (src.includes('linkedin')) {
      const v = ev.value;
      if (typeof v === 'string') consider(v, 70);
      if (typeof v === 'object') {
        for (const [k, val] of Object.entries(v)) consider(`${k}: ${val}`, 70);
      }
    }

    // generic texts (serper/cse snippets, titles, bodies)
    if (typeof ev.value === 'string') consider(ev.value, 60);
    else if (Array.isArray(ev.value)) ev.value.forEach(x => consider(String(x), 60));
    else if (typeof ev.value === 'object' && ev.value) {
      for (const [k, val] of Object.entries(ev.value)) consider(`${k}: ${val}`, 60);
    }

    // key também ajuda
    if (ev.key) consider(ev.key, 55);
  }

  return out;
}
