import {mkdir,readFile,writeFile,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
for(const name of ['index.html','styles.css','favicon.svg','.nojekyll'])await copyFile(name,'dist/'+name);
await cp('src','dist/src',{recursive:true});
// Portable offline version: no module requests, fonts, CDNs or runtime dependencies.
const css=await readFile('styles.css','utf8');
const icon=await readFile('favicon.svg','utf8');
const scripts=await Promise.all(['core','examples','app'].map(async name=>(await readFile('src/'+name+'.js','utf8')).replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'')));
let html=await readFile('index.html','utf8');
html=html.replace('<link rel="stylesheet" href="./styles.css">',()=>'<style>'+css+'</style>');
html=html.replace('<script type="module" src="./src/app.js"></script>',()=>'<script>(()=>{\n'+scripts.join('\n')+'\n})();</script>');
// Both the favicon link and the brand image inserted by app.js are self-contained.
html=html.replaceAll('./favicon.svg','data:image/svg+xml;base64,'+Buffer.from(icon).toString('base64'));
await writeFile('dist/Pathway_Redesign_Standalone.html',html);
await writeFile('Pathway_Redesign_Standalone.html',html);
console.log('Built dist/ and Pathway_Redesign_Standalone.html');
