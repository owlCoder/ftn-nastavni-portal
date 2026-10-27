import assert from 'node:assert/strict'
import {existsSync,readFileSync,readdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {inflateRawSync} from 'node:zlib'
import {createServer} from 'vite'

const server=await createServer({server:{middlewareMode:true},appType:'custom'})
try{
 const {courses}=await server.ssrLoadModule('/src/courses/index.ts')
 const {buildCourseFiles,courseFolderEntries}=await server.ssrLoadModule('/src/components/courseFileTree.ts')
 const {parseZip}=await server.ssrLoadModule('/src/lib/archive.ts')
 const readPart=(bytes,part)=>{
  const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)
  const entry=parseZip(buffer).find(x=>x.name===part);assert.ok(entry,'Missing Office part '+part)
  const start=entry.offset+30+bytes.readUInt16LE(entry.offset+26)+bytes.readUInt16LE(entry.offset+28)
  const data=bytes.subarray(start,start+entry.compressedSize)
  return (entry.method===8?inflateRawSync(data):data).toString('utf8')
 }
 let word=0,pptx=0
 for(const course of courses){
  const files=buildCourseFiles(course),lookup=new Map(files.map(x=>[x.id,x]))
  assert.equal(lookup.size,files.length,'Unique directory IDs')
  assert.ok(!files.some(x=>/sve.prezentacije/i.test(x.name+' '+x.source)))
  for(const item of files){
   if(item.parent!=='root')assert.equal(lookup.get(item.parent)?.kind,'folder')
   if(item.kind==='folder')continue
   assert.ok(item.source,'Every file must be directly downloadable')
   assert.ok(!/\.(md|url)$/i.test(item.source),'Teaching files use editable Office sources')
   const path=resolve('public',item.source.slice(1));assert.ok(existsSync(path),'Missing asset '+item.source)
   const bytes=readFileSync(path)
   if(item.source.endsWith('.docx')){
    const xml=readPart(bytes,'word/document.xml');assert.ok(xml.includes('w:body'));assert.ok(/[А-Яа-яЉЊЂЋЏ]/.test(xml),'Cyrillic Word content');word++
    if(item.kind==='practicum')assert.ok(xml.includes('Практикум'),'Practicum title')
    if(item.id.endsWith('pravila-polaganja')){assert.ok(xml.includes('КТ1')&&xml.includes('КТ2'));assert.ok(!/КТ[34]/.test(xml),'Two checkpoints only')}
   }else if(item.source.endsWith('.pptx')){assert.ok(readPart(bytes,'ppt/presentation.xml').includes('p:sldIdLst'));pptx++}
  }
  const entries=courseFolderEntries(course,'root',files,true)
  assert.equal(new Set(entries.map(x=>x.path)).size,entries.length,'No archive collisions')
  assert.deepEqual(entries.map(x=>x.url).sort(),files.filter(x=>x.source).map(x=>x.source).sort(),'Every source once in root ZIP')
  assert.ok(entries.every(x=>!x.text&&!/\.(md|url)$/i.test(x.path)))
  if(course.id==='ers'){
   assert.deepEqual(files.filter(x=>x.parent==='root').map(x=>x.id),['opsti','nastavni','projekat'])
   assert.equal(files.find(x=>x.parent==='nastavni').id,'praktikum','Practicum first')
   assert.ok(lookup.get('projekat/teorijska-pitanja').source.endsWith('.docx'))
  }
  if(course.id!=='ibis'){
   const parent=course.id==='ers'?'nastavni':'vezbe';const topics=files.filter(x=>x.kind==='folder'&&x.parent===parent)
   assert.equal(topics.length,8)
   for(let n=1;n<=8;n++){
    const id=(course.id==='ers'?'teme/':'vezbe/')+String(n).padStart(2,'0'),folder=lookup.get(id)
    assert.ok(folder.name.startsWith(String(n).padStart(2,'0')+' '));assert.ok(!/^Tema|^Vežba/.test(folder.name))
    const children=files.filter(x=>x.parent===id)
    assert.equal(children.filter(x=>x.kind==='practicum-link'&&x.exercise===n&&x.source.endsWith('/Poglavlje_'+String(n).padStart(2,'0')+'.docx')).length,1)
    assert.equal(children.filter(x=>x.kind==='pptx').length,1)
   }
  }
  if(['ers','oib'].includes(course.id))assert.deepEqual(course.checkpoints.map(x=>[x.code,x.exercises]),[['KT1',[1,4]],['KT2',[5,8]]])
  console.log(course.code+': editable documents, numbered folders and recursive exports verified.')
 }
 assert.ok(!readdirSync('public/downloads').some(x=>/sve_prezentacije\.zip/i.test(x)))
 console.log(`Verified ${word} Word links and ${pptx} PowerPoint files.`)
}finally{await server.close()}
