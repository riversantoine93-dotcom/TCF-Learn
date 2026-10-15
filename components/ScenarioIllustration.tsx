import {scenarioVisual} from '@/lib/learning/scenario-illustrations';
export default function ScenarioIllustration({slug,number}:{slug:string;number:number}){
 const visual=scenarioVisual(slug,number);if(!visual)return null;
 return <figure className="learn-scenario-figure"><img src={visual.src} alt={visual.alt} width={960} height={540} loading="lazy" decoding="async"/><figcaption><span>{visual.caption}</span><span className="scenario-figure-links"><a href={visual.src} target="_blank" rel="noreferrer">View full-size illustration ↗</a><a href="/illustrations/LICENSE.txt" target="_blank" rel="noreferrer">Original illustration · CC0</a></span></figcaption></figure>;
}
