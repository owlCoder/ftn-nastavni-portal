import { assetUrl } from '../lib/assets'
import type { Course } from '../courses/types'

export type DownloadEntry={path:string;url?:string;text?:string}

const escapeText=(value:string)=>value.replace(/<[^>]*>/g,'').replaceAll('&nbsp;',' ').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>')
export function practicumMarkdown(course:Course,exercise?:number):string{
  const blocks=course.practicum.blocks
  let selected=false
  const out=[`# ${course.name} — Praktikum`,'','FTN · Nastavni materijali','']
  for(const block of blocks){
    if(block.type==='text' && block.variant!=='paragraph'){
      const heading=escapeText(block.html)
      const number=heading.match(/^Vežba\s+(\d+)\b/i)
      if(number)selected=!exercise || Number(number[1])===exercise
      if(exercise && !selected)continue
      out.push('#'.repeat(block.variant==='h1'?1:block.variant==='h2'?2:3)+' '+heading,'')
    }else{
      if(exercise && !selected)continue
      if(block.type==='text')out.push(escapeText(block.html),'')
      else if(block.type==='list')out.push(...block.items.map((item,i)=>(block.ordered?`${i+1}. `:'- ')+escapeText(item)),'')
      else if(block.type==='callout')out.push(`> ${block.title}: ${escapeText(block.html)}`,'')
      else if(block.type==='code')out.push('```'+block.language+'\n'+block.code+'\n```','')
      else if(block.type==='table')out.push('| '+block.headers.map(escapeText).join(' | ')+' |','| '+block.headers.map(()=> '---').join(' | ')+' |',...block.rows.map(row=>'| '+row.map(escapeText).join(' | ')+' |'),'')
      else if(block.type==='image')out.push(`![${block.alt}](${block.src})`,'',block.caption,'')
      else if(block.type==='diagram')out.push(`### ${block.title}`,'',...block.items.map(item=>`- ${item.title}: ${item.subtitle}`),'')
    }
  }
  return out.join('\n')
}
export function checkpointMarkdown(course:Course):string{
  return [
    `# ${course.name} — Kontrolne tačke`,'',
    ...course.checkpoints.flatMap(item=>[
      `## ${item.code} — ${item.title}`,'',
      `Datum: ${item.date}`,'',
      escapeText(item.summary),'',
      ...item.items.map(i=>'- '+escapeText(i)),''
    ])
  ].join('\n')
}

export function downloadText(name:string,text:string){
  const blob=new Blob([text],{type:'text/markdown;charset=utf-8'})
  triggerDownload(URL.createObjectURL(blob),name,true)
}
function triggerDownload(url:string,name:string,revoke=false){
  const anchor=document.createElement('a')
  anchor.href=url;anchor.download=name;anchor.rel='noopener'
  anchor.style.display='none';document.body.append(anchor);anchor.click();anchor.remove()
  if(revoke)window.setTimeout(()=>URL.revokeObjectURL(url),60_000)
}

const encoder=new TextEncoder()
const crcTable=Array.from({length:256},(_,i)=>{
  let crc=i
  for(let n=0;n<8;n++)crc=crc&1 ? (crc>>>1)^0xedb88320 : crc>>>1
  return crc>>>0
})
function crc32(bytes:Uint8Array){
  let crc=0xffffffff
  for(const byte of bytes)crc=crcTable[(crc^byte)&0xff]^(crc>>>8)
  return (crc^0xffffffff)>>>0
}
const u16=(view:DataView,offset:number,value:number)=>view.setUint16(offset,value,true)
const u32=(view:DataView,offset:number,value:number)=>view.setUint32(offset,value>>>0,true)

/** Build a portable ZIP with STORE entries, keeping nested folder paths intact. */
export async function downloadFolderZip(name:string,entries:DownloadEntry[],onProgress?:(value:string)=>void){
  const all:{name:Uint8Array;content:Uint8Array;crc:number}[]=[]
  const seen=new Set<string>()
  for(let i=0;i<entries.length;i++){
    const entry=entries[i]
    const path=entry.path.replaceAll('\\','/').replace(/^\/+/, '')
    if(!path || path.split('/').some(part=>part==='..') ||seen.has(path))continue
    seen.add(path)
    onProgress?.(`Preuzimanje ${i+1}/${entries.length}…`)
    let content:Uint8Array
    if(entry.text!==undefined)content=encoder.encode(entry.text)
    else if(entry.url){
      const response=await fetch(assetUrl(entry.url))
      if(!response.ok)throw Error(`Nije moguće preuzeti ${path} (HTTP ${response.status}).`)
      content=new Uint8Array(await response.arrayBuffer())
    }else continue
    if(content.byteLength>0xffffffff)throw Error('Jedan fajl premašuje ZIP ograničenje.')
    all.push({name:encoder.encode(path),content,crc:crc32(content)})
  }
  if(!all.length)throw Error('Folder nema dostupnih fajlova.')
  let total=22
  for(const entry of all){
    if(entry.name.byteLength>65535)throw Error('Naziv fajla je predugačak.')
    total+=30+entry.name.length+entry.content.length+46+entry.name.length
  }
  if(total>0xffffffff)throw Error('Folder je prevelik za ZIP preuzimanje u browseru.')
  if(all.length>65535)throw Error('Folder ima previše fajlova.')
  const data=new Uint8Array(total),view=new DataView(data.buffer)
  const directory:{entry:typeof all[number];offset:number}[]=[]
  let position=0
  for(const entry of all){
    const offset=position
    u32(view,position,0x04034b50)
    u16(view,position+4,20);u16(view,position+6,0x800);u16(view,position+8,0)
    u32(view,position+14,entry.crc);u32(view,position+18,entry.content.byteLength)
    u32(view,position+22,entry.content.byteLength);u16(view,position+26,entry.name.byteLength)
    position+=30
    data.set(entry.name,position);position+=entry.name.length
    data.set(entry.content,position);position+=entry.content.length
    directory.push({entry,offset})
  }
  const centralOffset=position
  for(const {entry,offset} of directory){
    u32(view,position,0x02014b50);u16(view,position+4,20);u16(view,position+6,20)
    u16(view,position+8,0x800);u16(view,position+10,0)
    u32(view,position+16,entry.crc);u32(view,position+20,entry.content.length)
    u32(view,position+24,entry.content.length);u16(view,position+28,entry.name.length)
    u32(view,position+42,offset)
    position+=46;data.set(entry.name,position);position+=entry.name.length
  }
  const centralLength=position-centralOffset
  u32(view,position,0x06054b50)
  u16(view,position+8,directory.length);u16(view,position+10,directory.length)
  u32(view,position+12,centralLength);u32(view,position+16,centralOffset)
  onProgress?.('Priprema ZIP arhive…')
  const blob=new Blob([data.buffer],{type:'application/zip'})
  triggerDownload(URL.createObjectURL(blob),name.endsWith('.zip')?name:name+'.zip',true)
}
