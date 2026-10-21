export const SCHEMA = 'pathway-redesign/1';
export const uid = (prefix = 'id') => prefix + '-' + (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
export const clone = x => JSON.parse(JSON.stringify(x));
export const defaultDimensions = () => [
  {id:'arrangement',side:'experience',label:'Organizing / arrangement',labelZh:'流程组织与安排',weight:3,unit:'',kind:'text',rubric:'1 = very poor; 10 = very good. Agree on local criteria before grading.'},
  {id:'communication',side:'experience',label:'Communication / information',labelZh:'沟通与信息',weight:4,unit:'',kind:'text',rubric:'Consider clarity, accessibility and the information people need.'},
  {id:'encounter',side:'experience',label:'Main encounter / roles',labelZh:'主要接触与角色',weight:5,unit:'',kind:'text',rubric:'Consider the quality of interactions with people and interfaces.'},
  {id:'location',side:'experience',label:'Location / department',labelZh:'场所与科室',weight:2,unit:'',kind:'text',rubric:'Consider navigation, access and the experience of the setting.'},
  {id:'lead',side:'management',label:'Lead time',labelZh:'流程耗时',weight:5,unit:'min',kind:'number',rubric:'Elapsed time from the start to the end of this flow. Grade using team-agreed criteria; higher is better.'},
  {id:'target',side:'management',label:'Target time',labelZh:'目标时间',weight:3,unit:'min',kind:'number',rubric:'An agreed time benchmark. Weight 0 to use as context only; higher grades must always mean better performance.'},
  {id:'waiting',side:'management',label:'Waiting time',labelZh:'等候时间',weight:4,unit:'min',kind:'number',rubric:'Time spent waiting. Enter minutes as evidence, then assign a separate 1–10 performance grade.'},
  {id:'cost',side:'management',label:'Economic cost',labelZh:'经济成本',weight:3,unit:'EUR',kind:'number',rubric:'State the cost scope and period in the evidence note; agree on how to grade it.'},
  {id:'effectiveness',side:'management',label:'Effectiveness',labelZh:'有效性',weight:5,unit:'',kind:'text',rubric:'Define the outcome, measure and grading criteria together before assigning a grade.'}
];
export function createFlow(label='Flow 1') {return {id:uid('flow'),label,volume:null,values:{},insight:'',experienceNotes:'',managementNotes:'',source:'',discussion:[]};}
export function createSection(label='New sub-section') {return {id:uid('section'),label,summary:'',flows:[createFlow()]};}
export function createProject() {
  const section=createSection('First encounter');
  return {schema:SCHEMA,version:'0.1.0',id:uid('project'),title:'Untitled pathway',goal:'',period:'',volume:null,team:'',context:'',demo:false,
    dimensions:defaultDimensions(),settings:{combination:'sum',experienceWeight:1,managementWeight:1,weightRationale:''},sections:[section],
    nodes:[{id:uid('node'),sectionId:section.id,label:'Start here',kind:'process',x:300,y:70}],edges:[],updatedAt:new Date().toISOString()};
}
export function groupScore(project,flow,side) {
  const dims=project.dimensions.filter(d=>d.side===side&&d.weight>0);
  if(!dims.length) return {value:null,complete:false,disabled:true,filled:0,total:0,weight:0};
  const filled=dims.filter(d=>Number.isFinite(flow.values[d.id]?.score)&&flow.values[d.id].score>=1&&flow.values[d.id].score<=10);
  const complete=filled.length===dims.length;
  const weight=dims.reduce((s,d)=>s+d.weight,0);
  return {value:complete?dims.reduce((s,d)=>s+flow.values[d.id].score*d.weight,0)/weight:null,complete,disabled:false,filled:filled.length,total:dims.length,weight};
}
export function combinedScore(project,flow) {
  const e=groupScore(project,flow,'experience'),m=groupScore(project,flow,'management');
  if(project.settings.combination==='sum') return e.complete&&m.complete?e.value+m.value:null;
  const ew=project.settings.experienceWeight,mw=project.settings.managementWeight;
  if(ew+mw===0 || (ew>0&&!e.complete)||(mw>0&&!m.complete)) return null;
  return ((ew>0?ew*e.value:0)+(mw>0?mw*m.value:0))/(ew+mw);
}
export function rows(project) {return project.sections.flatMap(s=>s.flows.map(f=>({section:s,flow:f,experience:groupScore(project,f,'experience'),management:groupScore(project,f,'management'),combined:combinedScore(project,f)})));}
export function priorityRows(project) {return rows(project).filter(r=>r.combined!==null).sort((a,b)=>a.combined-b.combined);}
export function csvCell(v) {let s=v==null?'':String(v);if(/^[\s]*[=+@-]/.test(s)&&!/^-[\d.]+$/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function csvExport(project) {
  const header=['Sub-section','Flow','Patient volume','Experience grade','Managerial grade',project.settings.combination==='sum'?'Sum / 20':'Weighted combined / 10','Insight','Experience summary','Managerial summary','Evidence source',...project.dimensions.flatMap(d=>[d.label+' | weight',d.label+' | observed value',d.label+' | grade / 10',d.label+' | evidence / reason'])];
  return '\ufeff'+[header,...rows(project).map(r=>[r.section.label,r.flow.label,r.flow.volume,r.experience.value,r.management.value,r.combined,r.flow.insight,r.flow.experienceNotes,r.flow.managementNotes,r.flow.source,...project.dimensions.flatMap(d=>[d.weight,r.flow.values[d.id]?.value,r.flow.values[d.id]?.score,r.flow.values[d.id]?.note])])].map(row=>row.map(csvCell).join(',')).join('\r\n');
}
// Import only this app's portable format. Validate before replacing the current project.
export function validateProject(p) {
  const fail = message => {throw new Error(message);};
  if(!p||p.schema!==SCHEMA)fail('This is not a Pathway Redesign project (schema pathway-redesign/1).');
  const str=(v,max=20000)=>typeof v==='string'&&v.length<=max;
  const id=v=>str(v,100)&&/^[\w-]+$/.test(v)&&!['__proto__','constructor','prototype'].includes(v);
  const num=(v,max=1e9)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max;
  const optnum=(v,max=1e9)=>v===null||num(v,max);
  for(const key of ['title','goal','period','team','context'])if(!str(p[key]))fail('Invalid project field: '+key);
  if(!id(p.id)||!optnum(p.volume))fail('Invalid project identity or volume.');
  if(!Array.isArray(p.dimensions)||!p.dimensions.length||p.dimensions.length>40)fail('Use 1–40 dimensions.');
  const unique=(a,name)=>{if(new Set(a).size!==a.length)fail('Duplicate '+name+'.');};
  for(const d of p.dimensions)if(!id(d.id)||!['experience','management'].includes(d.side)||!str(d.label,160)||!str(d.labelZh??'',160)||!num(d.weight,100)||!str(d.unit,40)||!['text','number'].includes(d.kind)||!str(d.rubric))fail('Invalid dimension.');
  unique(p.dimensions.map(d=>d.id),'dimension IDs');
  if(!p.settings||!['sum','weighted'].includes(p.settings.combination)||!num(p.settings.experienceWeight,100)||!num(p.settings.managementWeight,100)||!str(p.settings.weightRationale))fail('Invalid scoring settings.');
  if(!Array.isArray(p.sections)||!p.sections.length||p.sections.length>100)fail('Use 1–100 sub-sections.');
  const flowIds=[];
  for(const s of p.sections){
    if(!id(s.id)||!str(s.label,300)||!str(s.summary)||!Array.isArray(s.flows)||!s.flows.length||s.flows.length>50)fail('Invalid sub-section.');
    for(const f of s.flows){
      flowIds.push(f.id);
      if(!id(f.id)||!str(f.label,300)||!optnum(f.volume)||!str(f.insight)||!str(f.experienceNotes)||!str(f.managementNotes)||!str(f.source)||!f.values||Array.isArray(f.values)||typeof f.values!=='object')fail('Invalid flow.');
      for(const [key,v]of Object.entries(f.values)){if(!id(key)||!v||!str(v.value??'',20000)||!str(v.note??'',20000)||!(v.score===null||(num(v.score,10)&&v.score>=1)))fail('Grades must be blank or between 1 and 10.');}
      if(!Array.isArray(f.discussion)||f.discussion.length>500)fail('Invalid discussion records.');
      for(const a of f.discussion)if(!id(a.id)||!str(a.text)||!str(a.owner,300)||!str(a.status,40)||!['open','agreed','testing','done'].includes(a.status))fail('Invalid discussion record.');
    }
  }
  unique(p.sections.map(s=>s.id),'section IDs');unique(flowIds,'flow IDs');
  if(!Array.isArray(p.nodes)||p.nodes.length>300||!Array.isArray(p.edges)||p.edges.length>600)fail('Graph limit: 300 nodes and 600 connections.');
  const sections=new Set(p.sections.map(s=>s.id));
  for(const n of p.nodes)if(!id(n.id)||!sections.has(n.sectionId)||!str(n.label,500)||!['process','decision','terminal'].includes(n.kind)||!num(n.x,10000)||!num(n.y,20000))fail('Invalid graph node.');
  for(const n of p.nodes)if(n.flowId&&!p.sections.find(s=>s.id===n.sectionId).flows.some(f=>f.id===n.flowId))fail('A node references a flow outside its sub-section.');
  unique(p.nodes.map(n=>n.id),'node IDs');
  const nodes=new Set(p.nodes.map(n=>n.id));
  for(const e of p.edges)if(!id(e.id)||!nodes.has(e.from)||!nodes.has(e.to)||!str(e.label,300))fail('A connection references a missing node.');
  unique(p.edges.map(e=>e.id),'connection IDs');
  return clone(p);
}
