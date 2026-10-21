import {createProject, createSection, createFlow} from './core.js';
export function exampleProject(){
 const p=createProject();p.id='acute-chest-pain-example';p.demo=true;
 p.title='Acute chest pain';p.goal='Improve patient experience across the pathway';p.period='March – July 2021';p.volume=100;p.team='Service design · Clinical care · Operations';
 p.context='Reconstruction of the 2021 thesis example. Only S-1 and S-2 contain example evidence from the supplied Excel. Other records are intentionally blank. This historical pathway is an illustration for discussing the tool, not a current clinical protocol.';
 const labels=['Initial assessment','First decision','CT investigation','Clinical suspicion','Further investigation','Follow-up assessment','Next steps'];
 const flowLabels=[['Flow 1'],['Flow 1 · Positive','Flow 2 · Negative / non-diagnostic'],['Flow 1'],['Flow 1 · Coronary','Flow 2 · Aortic','Flow 3 · Pulmonary'],['Flow 1 · Coronary CT','Flow 2 · Aortic CT'],['Flow 1 · Follow-up enzymes','Flow 2 · Wells / Geneva'],['Flow 1 · Discharge','Flow 2 · Reperfusion','Flow 3 · Other causes','Flow 4 · CT']];
 p.sections=labels.map((label,i)=>{const s=createSection(label);s.id='s'+(i+1);s.flows=flowLabels[i].map((label,j)=>{const f=createFlow(label);f.id=`s${i+1}-f${j+1}`;return f;});return s;});
 p.dimensions.find(d=>d.id==='target').weight=0;
 p.settings.weightRationale='The example workbook uses lead time 5, waiting time 4, cost 3 and effectiveness 5 (total 17). Target time is context only (weight 0). Experience weights 3, 4, 5 and 2 total 14. These totals are recomputed, correcting broken or mismatched spreadsheet references.';
 const set=(f,id,value,score,note)=>f.values[id]={value:String(value??''),score,note};
 const f=p.sections[0].flows[0];f.volume=100;f.source='Peng Lu – Pathway Redesign Tool Example.xlsx · Ranking Version – example · rows 5–9. Quoted material is illustrative workbook content.';
 set(f,'arrangement','Process arrangement',4,'“I am not so happy about how they arrange the process.”');
 set(f,'communication','Information from the team',5,'“I think they don’t tell everything to me very clearly, but I can figure it out.”');
 set(f,'encounter','Check and conversation with the doctor',6,'“Doctors here are nice, but I can still feel the sense of distance.”');
 set(f,'location','The cardiology exam room',4,'“The check room is not easy to be found.”');
 set(f,'lead',17.8,4,'Example value; the original workbook does not specify grading thresholds.');set(f,'target',15,null,'Context only; not included in the weighted grade.');set(f,'waiting',25.7,1,'Example value; agree on grading thresholds as a team.');set(f,'cost','',2,'The workbook supplies a grade, but no raw cost value.');set(f,'effectiveness','',1,'The workbook supplies a grade, but no operational definition.');
 f.insight='Waiting time, examination experience and finding the cardiology exam room deserve discussion.';
 f.experienceNotes='Consider process arrangement, information clarity and navigation. Discuss which changes matter most to the redesign goal.';
 f.managementNotes='Interpret the recorded waiting time with clinical staff; the example does not define its sampling method.';
 for(let i=0;i<2;i++){
  const f=p.sections[1].flows[i];f.volume=i===0?19:81;f.source='Example workbook · rows '+(i===0?'10–13':'14–17')+'. Illustrative, not clinical observations collected by this web app.';
  set(f,'arrangement','Process arrangement',6,'Interviewed patients mostly said that the arrangement is not bad.');set(f,'communication','Information at this stage',4,'“I need more information in this phase.”');set(f,'encounter','Conversation with the doctor',7,'The doctors are really nice.');set(f,'location','The cardiology exam room',4,'“The check room is not easy to be found.”');
  set(f,'lead',13.5,4,'Previous period: 12.9 minutes.');set(f,'target',15,null,'Context only.');set(f,'waiting',5,4,'Previous period: 6.7 minutes.');set(f,'cost','',9,'Raw cost was not supplied.');set(f,'effectiveness','',7,'The example does not state the measure.');f.insight='Information and navigation remain opportunities for improvement.';
 }
 const node=(id,sectionId,label,kind,x,y)=>({id,sectionId,label,kind,x,y});
 p.nodes=[node('n1','s1','Acute chest pain','terminal',340,50),node('n2','s1','ECG + initial cardiac enzymes','decision',340,150),node('n3','s2','Consider reperfusion / antithrombins','process',100,270),node('n4','s2','Negative or non-diagnostic','process',340,270),node('n5','s3','CT investigation','process',340,390),node('n6','s4','Acute coronary syndrome?','decision',100,520),node('n7','s4','Acute aortic syndrome?','decision',340,520),node('n8','s4','Pulmonary embolism?','decision',580,520),node('n9','s5','CT · coronary investigation','process',100,650),node('n10','s5','CT · aortic investigation','process',340,650),node('n11','s6','Follow-up cardiac enzymes','decision',100,780),node('n12','s6','Wells / Geneva + D-dimer','decision',580,780),node('n13','s7','Hospital discharge','terminal',40,950),node('n14','s7','Consider reperfusion / antithrombins','process',220,950),node('n15','s7','Consider chest X-ray / other causes','process',430,950),node('n16','s7','CT investigation','process',630,950)];
 p.edges=[['n1','n2',''],['n2','n3','Positive'],['n2','n4','Negative'],['n4','n5',''],['n5','n6','Flow 1'],['n5','n7','Flow 2'],['n5','n8','Flow 3'],['n6','n9',''],['n7','n10',''],['n9','n11',''],['n8','n12',''],['n11','n13','Negative'],['n11','n14','Positive'],['n12','n15','Negative'],['n12','n16','Positive']].map(([from,to,label],i)=>({id:'e'+i,from,to,label}));
 const associations=['s1-f1','s1-f1','s2-f1','s2-f2','s3-f1','s4-f1','s4-f2','s4-f3','s5-f1','s5-f2','s6-f1','s6-f2','s7-f1','s7-f2','s7-f3','s7-f4'];
 p.nodes.forEach((n,i)=>n.flowId=associations[i]);
 return p;
}
