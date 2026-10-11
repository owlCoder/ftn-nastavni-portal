import {courses} from '../courses'
import {buildCourseFiles} from '../components/courseFileTree'

export type CodeProject={file:string;title:string;initialFile?:string}
const catalog=courses.flatMap(course=>buildCourseFiles(course).filter(item=>item.kind==='zip'&&item.source&&!item.id.includes('/prezentacije')).map(item=>({file:item.source!,title:item.name,course:course.code,label:(item.exercise?'Vežba '+String(item.exercise).padStart(2,'0')+' · ':'')+item.name})))
export const codeProjects=catalog.filter((item,index)=>catalog.findIndex(other=>other.file===item.file)===index)
export function initialCodeProject():CodeProject|null{
  try{const saved=JSON.parse(localStorage.getItem('ftn-code-last-project')??'null');return codeProjects.find(item=>item.file===saved?.file)??null}catch{return null}
}
