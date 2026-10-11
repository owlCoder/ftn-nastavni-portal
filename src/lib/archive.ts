export type ZipEntry={name:string;size:number;compressedSize:number;offset:number;method:number;isDirectory:boolean}
export const MAX_EDITABLE_SIZE=2_000_000
const TEXT_EXTENSIONS=/\.(cs|csproj|sln|md|txt|json|xml|yaml|yml|js|jsx|ts|tsx|css|html|htm|sh|ps1|props|targets|config|editorconfig|gitignore|sql|csv|py|java|c|cpp|h|hpp|fs|fsproj|razor|dockerfile|gitkeep)$/i
export const isTextEntry=(entry:ZipEntry)=>!entry.isDirectory&&entry.size<=MAX_EDITABLE_SIZE&&(TEXT_EXTENSIONS.test(entry.name)||/(?:^|\/)(?:Dockerfile|Makefile|LICENSE|\.gitignore|\.editorconfig)$/.test(entry.name))

export function parseZip(buffer:ArrayBuffer):ZipEntry[]{
  const dv=new DataView(buffer),decoder=new TextDecoder()
  let end=-1
  for(let i=buffer.byteLength-22;i>=Math.max(0,buffer.byteLength-65557);i--){if(dv.getUint32(i,true)===0x06054b50){end=i;break}}
  if(end<0)throw Error('Format arhive nije podržan.')
  const count=dv.getUint16(end+10,true),offset=dv.getUint32(end+16,true)
  if(count>6000)throw Error('Arhiva sadrži previše fajlova.')
  const entries:ZipEntry[]=[],seen=new Set<string>()
  let position=offset
  for(let i=0;i<count;i++){
    if(position+46>dv.byteLength||dv.getUint32(position,true)!==0x02014b50)throw Error('Arhiva nije ispravna.')
    if(dv.getUint16(position+8,true)&1)throw Error('Šifrovane ZIP arhive nisu podržane.')
    const method=dv.getUint16(position+10,true),compressedSize=dv.getUint32(position+20,true),size=dv.getUint32(position+24,true)
    const nameSize=dv.getUint16(position+28,true),extra=dv.getUint16(position+30,true),comment=dv.getUint16(position+32,true),localOffset=dv.getUint32(position+42,true)
    if(position+46+nameSize+extra+comment>dv.byteLength)throw Error('Oštećen spisak fajlova.')
    const name=decoder.decode(new Uint8Array(buffer,position+46,nameSize)).replaceAll('\\','/')
    if(name.startsWith('/')||name.split('/').includes('..')||name.includes('\0')||seen.has(name))throw Error('Arhiva sadrži neispravnu putanju fajla.')
    seen.add(name)
    entries.push({name,size,compressedSize,offset:localOffset,method,isDirectory:name.endsWith('/')})
    position+=46+nameSize+extra+comment
  }
  return entries.sort((a,b)=>a.name.localeCompare(b.name,'sr'))
}

export async function readZipBytes(buffer:ArrayBuffer,entry:ZipEntry,maxSize=128*1024*1024):Promise<Uint8Array>{
  if(entry.size>maxSize)throw Error('Fajl je prevelik za ovaj prikaz.')
  const dv=new DataView(buffer)
  if(entry.offset+30>dv.byteLength||dv.getUint32(entry.offset,true)!==0x04034b50)throw Error('Neispravan zapis u arhivi.')
  const begin=entry.offset+30+dv.getUint16(entry.offset+26,true)+dv.getUint16(entry.offset+28,true)
  if(begin+entry.compressedSize>buffer.byteLength)throw Error('Oštećen sadržaj fajla.')
  const bytes=new Uint8Array(buffer,begin,entry.compressedSize)
  let decoded:Uint8Array
  if(entry.method===0)decoded=bytes
  else if(entry.method===8&&typeof DecompressionStream!=='undefined'){
    const stream=new Blob([new Uint8Array(bytes).buffer]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
    decoded=new Uint8Array(await new Response(stream).arrayBuffer())
  }else throw Error('Kompresija ovog fajla nije podržana.')
  if(decoded.byteLength!==entry.size)throw Error('Veličina fajla u arhivi nije ispravna.')
  return decoded
}
export async function readZipFile(buffer:ArrayBuffer,entry:ZipEntry){
  return new TextDecoder().decode(await readZipBytes(buffer,entry,MAX_EDITABLE_SIZE))
}
