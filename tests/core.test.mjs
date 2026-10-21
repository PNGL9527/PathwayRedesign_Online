import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject,groupScore,combinedScore,rows,priorityRows,validateProject,csvExport,clone} from '../src/core.js';
import {exampleProject} from '../src/examples.js';
test('Source example is reconstructed with correct weight totals, not stale spreadsheet formula references',()=>{
 const p=exampleProject(),f=p.sections[0].flows[0];
 assert.equal(groupScore(p,f,'experience').weight,14);
 assert.equal(groupScore(p,f,'experience').value,5);
 assert.equal(groupScore(p,f,'management').weight,17);
 assert.equal(groupScore(p,f,'management').value,35/17);
 assert.equal(combinedScore(p,f),5+35/17);
 assert.equal(rows(p).length,15);assert.equal(priorityRows(p).length,3);
 assert.equal(priorityRows(p)[0].flow.id,'s1-f1');
});
test('Missing grades are unknown; zero-weight context does not block complete grades',()=>{
 const p=exampleProject(),f=p.sections[0].flows[0];
 assert.equal(f.values.target.score,null);assert.equal(groupScore(p,f,'management').complete,true);
 f.values.waiting.score=null;assert.equal(groupScore(p,f,'management').value,null);assert.equal(combinedScore(p,f),null);assert.equal(priorityRows(p).length,2);
 p.dimensions.find(d=>d.id==='waiting').weight=0;assert.equal(groupScore(p,f,'management').complete,true);
});
test('All zero weights do not divide by zero or silently produce a reassuring grade',()=>{
 const p=exampleProject();p.dimensions.forEach(d=>d.weight=0);
 assert.equal(groupScore(p,p.sections[0].flows[0],'experience').disabled,true);
 assert.equal(combinedScore(p,p.sections[0].flows[0]),null);assert.equal(priorityRows(p).length,0);
});
test('Weighted combination permits deliberately excluding one side, with correct normalization',()=>{
 const p=exampleProject(),f=p.sections[0].flows[0];p.settings.combination='weighted';p.settings.experienceWeight=2;p.settings.managementWeight=1;
 assert.equal(combinedScore(p,f),(2*5+35/17)/3);
 p.settings.managementWeight=0;f.values.waiting.score=null;assert.equal(combinedScore(p,f),5);
 p.settings.experienceWeight=0;assert.equal(combinedScore(p,f),null);
});
test('Custom dimensions immediately affect completeness and weighted results',()=>{
 const p=exampleProject(),f=p.sections[0].flows[0];p.dimensions.push({id:'access',side:'experience',label:'Access',labelZh:'',weight:2,kind:'text',unit:'',rubric:''});
 assert.equal(combinedScore(p,f),null);f.values.access={value:'',score:10,note:''};assert.equal(groupScore(p,f,'experience').value,90/16);
});
test('Portable projects round-trip without losing evidence, discussion, branches or Unicode',()=>{
 const p=exampleProject();p.sections[0].flows[0].discussion.push({id:'note-1',text:'共同讨论 <script> & "quotes"',owner:'护理',status:'open'});
 assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);assert.deepEqual(validateProject(createProject()).schema,p.schema);
 assert.equal(p.nodes.find(n=>n.id==='n4').flowId,'s2-f2');
 const bad=clone(p);bad.nodes[0].flowId='s2-f1';assert.throws(()=>validateProject(bad));
});
test('Import rejects invalid references, unsafe keys, malformed fields and grades outside 1–10',()=>{
 const base=exampleProject();
 for(const mutate of [p=>p.edges[0].to='missing',p=>p.nodes[0].x=Infinity,p=>p.sections[0].flows[0].values.waiting.score=0,p=>p.sections[0].flows[0].values.waiting.score=11,p=>p.dimensions[0].weight=-1,p=>p.dimensions[0].id='__proto__',p=>p.nodes.push(clone(p.nodes[0])),p=>p.sections=[],p=>p.settings.combination='unknown']){
  const p=clone(base);mutate(p);assert.throws(()=>validateProject(p));
 }
});
test('CSV keeps missing distinct from zero, quotes Unicode text and neutralizes spreadsheet formula injection',()=>{
 const p=exampleProject();p.sections[0].flows[0].insight='=HYPERLINK("unsafe")';p.sections[0].flows[0].experienceNotes='a,"b"\n中文';
 const csv=csvExport(p);assert.ok(csv.startsWith('\ufeff'));assert.ok(csv.includes('"\'=HYPERLINK(""unsafe"")"'));assert.ok(csv.includes('"a,""b""\n中文"'));
 assert.ok(csv.includes('Target time | weight'));assert.ok(csv.includes('"0"'));
});
