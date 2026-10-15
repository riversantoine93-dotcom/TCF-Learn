import fs from 'node:fs';
import {scenarioSVG} from '../lib/learning/illustration-art';
import {artwork,type IllustrationKind} from '../lib/learning/scenario-illustrations';
export function writeScenarioArt(){
 fs.mkdirSync('public/illustrations',{recursive:true});
 for(const kind of Object.keys(artwork) as IllustrationKind[])fs.writeFileSync(`public/illustrations/${kind}.svg`,scenarioSVG(kind)+'\n');
 console.log(`${Object.keys(artwork).length} original CC0 scenario illustrations.`);
}
