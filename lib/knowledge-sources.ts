import type { KnowledgeSource } from './lesson-knowledge';
import depthSources from './lesson-depth-sources.json';
import pdfSources from './learning/pdf-sources.json';
const checked = '2026-10-14';
export const knowledgeSources: Record<string, KnowledgeSource> = Object.fromEntries(([
 ['osha-focus','OSHA: Construction Focus Four','https://www.osha.gov/training/outreach/construction/focus-four','Guidance'],
 ['osha-falls','OSHA 29 CFR 1926.501: Fall protection','https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.501','Regulation'],
 ['osha-hazcom','OSHA 29 CFR 1910.1200: Hazard Communication','https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.1200','Regulation'],
 ['osha-construction-hazcom','OSHA 29 CFR 1926.59: Construction hazard communication','https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.59','Regulation'],
 ['osha-electrical','OSHA 29 CFR 1910.333: Electrical work practices','https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.333','Regulation'],
 ['osha-energy','OSHA 29 CFR 1910.147: Hazardous energy control','https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.147','Regulation'],
 ['osha-silica','OSHA 29 CFR 1926.1153: Construction silica','https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1153','Regulation'],
 ['osha-welding','OSHA 29 CFR 1926.353: Welding ventilation','https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.353','Regulation'],
 ['epa-608','EPA: Section 608 technician certification','https://www.epa.gov/section608/section-608-technician-certification','Regulation'],
 ['epa-lead','EPA: Lead renovation, repair and painting','https://www.epa.gov/lead/lead-renovation-repair-and-painting-program','Regulation'],
 ['fmcsa-eldt','FMCSA: ELDT applicability','https://tpr.fmcsa.dot.gov/Drivers/Applicability','Regulation'],
 ['fmcsa-eldt-faq','FMCSA: Driver training requirements','https://tpr.fmcsa.dot.gov/FAQ/Topics/training-requirements','Guidance'],
 ['fmcsa-hos','FMCSA: Hours-of-service summary','https://www.fmcsa.dot.gov/regulations/hours-service/summary-hours-service-regulations','Regulation'],
 ['cisa-mfa','CISA: Require multifactor authentication','https://www.cisa.gov/audiences/small-and-medium-businesses/secure-your-business/require-multifactor-authentication','Guidance'],
 ['nist-security','NIST: Securing data and devices','https://www.nist.gov/itl/smallbusinesscyber/guidance-topic/securing-data-devices','Guidance'],
 ['mdn-core','MDN: Core web-development modules','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core','Technical reference'],
 ['mdn-web','MDN: Client-server overview','https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview','Technical reference'],
 ['mdn-js','MDN: Dynamic scripting with JavaScript','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting','Technical reference'],
 ['wcag-contrast','W3C: WCAG 2.2 minimum contrast','https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html','Technical reference'],
 ['excel-formulas','Microsoft: Overview of Excel formulas','https://support.microsoft.com/en-us/excel/get-started/overview-of-formulas-in-excel','Technical reference'],
 ['nist-ai','NIST: AI Risk Management Framework','https://www.nist.gov/itl/ai-risk-management-framework','Guidance'],
 ['va-mindfulness','VA: Mindful breathing exercise','https://www.ptsd.va.gov/gethelp/captions/Track02_MindfulBreathing.pdf','Guidance'],
 ['nccih-mindfulness','NCCIH: Meditation and mindfulness effectiveness and safety','https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety','Guidance'],
 ['cfpb-credit','CFPB: Credit reports and scores','https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/','Guidance'],
] as const).map(([id,title,url,kind]) => [id,{id,title,url,kind,checked}]));

for (const [id,title,url,kind] of depthSources) {
  if (knowledgeSources[id]) throw new Error(`Duplicate knowledge source: ${id}`);
  knowledgeSources[id]={id,title,url,kind:kind as KnowledgeSource['kind'],checked:'2026-10-15'};
}

for (const source of pdfSources) {
 if (knowledgeSources[source.id]) throw new Error(`Duplicate knowledge source: ${source.id}`);
 knowledgeSources[source.id]={...source,title:`${source.title} — ${source.author}`,kind:source.kind as KnowledgeSource['kind']};
}
