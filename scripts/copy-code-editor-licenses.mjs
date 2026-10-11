import {readdir,readFile,writeFile} from 'node:fs/promises'
const packages=['codemirror','crelt','style-mod','w3c-keyname']
for(const scope of ['@codemirror','@lezer'])for(const name of await readdir('node_modules/'+scope))packages.push(scope+'/'+name)
const parts=['Code editor — third-party licenses','']
for(const name of packages.sort()){
  const pkg=JSON.parse(await readFile('node_modules/'+name+'/package.json','utf8'))
  let license
  for(const filename of ['LICENSE','LICENSE.txt','LICENSE.md']){
    try{license=await readFile('node_modules/'+name+'/'+filename,'utf8');break}catch{/* Try alternate filename. */}
  }
  if(!license)throw Error('License missing for '+name)
  parts.push(name+' '+pkg.version,'',license.trim(),'')
}
await writeFile('public/licenses/code-editor.txt',parts.join('\n')+'\n')
console.log('Code editor licenses copied:',packages.length)
