export type CodeDraft={source:string;path:string;text:string;updatedAt:number}
let database:Promise<IDBDatabase>|undefined
function openDatabase(){
  return database??=new Promise<IDBDatabase>((resolve,reject)=>{
    const request=indexedDB.open('ftn-code-editor',1)
    request.onupgradeneeded=()=>request.result.createObjectStore('drafts',{keyPath:['source','path']}).createIndex('source','source')
    request.onsuccess=()=>resolve(request.result)
    request.onerror=()=>{database=undefined;reject(request.error??Error('Lokalno čuvanje nije dostupno.'))}
  })
}
export async function loadCodeDrafts(source:string):Promise<CodeDraft[]>{
  const db=await openDatabase()
  return new Promise((resolve,reject)=>{
    const transaction=db.transaction('drafts','readonly'),request=transaction.objectStore('drafts').index('source').getAll(source)
    request.onsuccess=()=>resolve(request.result as CodeDraft[])
    request.onerror=()=>reject(request.error)
  })
}
export async function storeCodeDraft(source:string,path:string,text:string|null){
  const db=await openDatabase()
  return new Promise<void>((resolve,reject)=>{
    const transaction=db.transaction('drafts','readwrite'),store=transaction.objectStore('drafts')
    if(text===null)store.delete([source,path])
    else store.put({source,path,text,updatedAt:Date.now()})
    transaction.oncomplete=()=>resolve()
    transaction.onabort=transaction.onerror=()=>reject(transaction.error??Error('Lokalno čuvanje nije uspelo.'))
  })
}
