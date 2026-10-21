import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LEGENDS} from '../src/legends.js';
import {placeLegend,validateProject,csvExport,clone} from '../src/core.js';
import {exampleProject} from '../src/examples.js';
test('Original workbook catalog retains all 58 icons and numbered categories',async()=>{
 assert.equal(LEGENDS.length,58);assert.equal(new Set(LEGENDS.map(l=>l.id)).size,58);
 assert.deepEqual(Object.fromEntries(['roles','encounters','locations','emotions'].map(c=>[c,LEGENDS.filter(l=>l.category===c).length])),{roles:18,encounters:20,locations:10,emotions:10});
 for(const item of LEGENDS){const bytes=await readFile(new URL('../'+item.src.slice(2),import.meta.url));assert.equal(bytes.subarray(1,4).toString(),'PNG');}
 assert.deepEqual(LEGENDS.filter(l=>l.category==='emotions').map(l=>l.score),[1,2,3,4,5,6,7,8,9,10]);
});
test('Legends stay with their own flow and dimension, survive JSON, and export to CSV',()=>{
 const p=exampleProject(),f=p.sections[0].flows[0],other=clone(p.sections[1].flows[0]);const role=LEGENDS.find(l=>l.id==='role-nurse-01');
 placeLegend(p,f,'encounter',role);placeLegend(p,f,'encounter',role);
 assert.equal(f.values.encounter.stickers.filter(id=>id===role.id).length,1);
 const roundtrip=validateProject(JSON.parse(JSON.stringify(p)));
 assert.ok(roundtrip.sections[0].flows[0].values.encounter.stickers.includes(role.id));
 assert.deepEqual(p.sections[1].flows[0],other);assert.ok(csvExport(p).includes('role-nurse-01'));
});
test('Selecting an emotional mark replaces the old mark and sets the corresponding experience grade',()=>{
 const p=exampleProject(),f=p.sections[0].flows[0],item=LEGENDS.find(l=>l.score===8);
 placeLegend(p,f,'arrangement',item);assert.equal(f.values.arrangement.score,8);
 assert.deepEqual(f.values.arrangement.stickers,['emotion-08']);
 assert.throws(()=>placeLegend(p,f,'waiting',item));assert.throws(()=>placeLegend(p,f,'missing',item));
 const old=clone(p);delete old.sections[0].flows[0].values.arrangement.stickers;assert.doesNotThrow(()=>validateProject(old));
 const bad=clone(p);bad.sections[0].flows[0].values.arrangement.stickers=['__proto__'];assert.throws(()=>validateProject(bad));
});
