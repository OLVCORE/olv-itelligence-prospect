import type { Scores } from './tech-maturity';
import type { DetectedStack } from '../stack/resolver';
export function suggestFit(input:{ vendor:'TOTVS'|'OLV'|'CUSTOM'; detectedStack:DetectedStack; scores:Scores }){
  const { vendor, detectedStack:ds } = input;
  const rec={ products:[] as string[], olv_packs:[] as string[], rationale:[] as string[] };
  if (vendor==='TOTVS'){
    if (ds.erp?.some(x=>/SAP|Oracle/i.test(x.product))) {
      rec.products.push('TOTVS Protheus','TOTVS Backoffice');
      rec.rationale.push('Substituição/migração com redução de TCO e integração nativa TOTVS');
    }
    if (!ds.integrations?.length){
      rec.products.push('Fluig (BPM/Workflow)');
      rec.rationale.push('Ausência de BPM detectada – automação de processos');
    }
    if (ds.bi?.some(x=>/Power BI|Tableau/i.test(x.product))){
      rec.products.push('TOTVS BI');
      rec.rationale.push('BI integrado ao ERP e relatórios financeiros');
    }
  } else if (vendor==='OLV'){
    rec.olv_packs.push('Diagnóstico 360 + Roadmap','Smart Import & Integrações');
    rec.rationale.push('Acelerar quick-wins com integrações padrão OLV');
  } else {
    rec.products.push('Pacote de Integração & Observabilidade');
    rec.rationale.push('Padrões de integração e monitoração para stack heterogênea');
  }
  return rec;
}
