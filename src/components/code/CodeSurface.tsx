import {useEffect,useLayoutEffect,useRef} from 'react'
import {basicSetup} from 'codemirror'
import {Compartment,EditorState} from '@codemirror/state'
import {EditorView,keymap} from '@codemirror/view'
import {HighlightStyle,StreamLanguage,syntaxHighlighting} from '@codemirror/language'
import {undo,redo,undoDepth,redoDepth,indentWithTab,indentMore,indentLess,selectAll} from '@codemirror/commands'
import {openSearchPanel} from '@codemirror/search'
import {csharp,java,cpp} from '@codemirror/legacy-modes/mode/clike'
import {shell} from '@codemirror/legacy-modes/mode/shell'
import {yaml} from '@codemirror/legacy-modes/mode/yaml'
import {javascript} from '@codemirror/lang-javascript'
import {json} from '@codemirror/lang-json'
import {xml} from '@codemirror/lang-xml'
import {css} from '@codemirror/lang-css'
import {markdown} from '@codemirror/lang-markdown'
import {tags} from '@lezer/highlight'

export type EditorPosition={line:number;column:number;lines:number;undo:number;redo:number}
export type CodeSurfaceApi={undo:()=>void;redo:()=>void;find:()=>void;indent:()=>void;outdent:()=>void;selectAll:()=>void;replace:(text:string)=>void}
type Props={fileKey:string;text:string;fontSize:number;wrap:boolean;dark:boolean;onChange:(text:string)=>void;onPosition:(position:EditorPosition)=>void;onApi:(api:CodeSurfaceApi|null)=>void}
const colors=HighlightStyle.define([
  {tag:tags.keyword,class:'ftn-code-keyword',color:'var(--code-keyword)'},
  {tag:[tags.string,tags.special(tags.string)],color:'var(--code-string)'},
  {tag:tags.comment,color:'var(--code-comment)',fontStyle:'italic'},
  {tag:[tags.number,tags.bool],color:'var(--code-number)'},
  {tag:[tags.typeName,tags.className],color:'var(--code-type)'},
  {tag:[tags.function(tags.variableName),tags.function(tags.propertyName)],color:'var(--code-function)'},
  {tag:[tags.variableName,tags.propertyName, tags.attributeName],color:'var(--code-variable)'},
  {tag:[tags.tagName,tags.meta],color:'var(--code-tag)'},
])
const themeStyles={
  '&':{height:'100%',color:'var(--code-text)',backgroundColor:'var(--code-background)'},
  '.cm-scroller':{fontFamily:'"SFMono-Regular",Consolas,"Liberation Mono",monospace',lineHeight:'1.65',overflow:'auto'},
  '.cm-content':{padding:'10px 0',caretColor:'var(--code-caret)'},
  '.cm-line':{padding:'0 12px 0 10px'},
  '.cm-gutters':{backgroundColor:'var(--code-background)',color:'var(--code-muted)',borderRight:'1px solid var(--code-separator)'},
  '.cm-lineNumbers .cm-gutterElement':{minWidth:'38px',padding:'0 9px 0 5px'},
  '.cm-activeLine':{backgroundColor:'var(--code-current-line)'},
  '.cm-activeLineGutter':{backgroundColor:'var(--code-current-gutter)',color:'var(--code-secondary)'},
  '.cm-cursor':{borderLeftColor:'var(--code-caret)'},
  '&.cm-focused .cm-selectionBackground,.cm-selectionBackground,::selection':{backgroundColor:'var(--code-selection)'},
  '.cm-searchMatch':{backgroundColor:'var(--code-search-match)',outline:'1px solid var(--code-search-border)'},
  '.cm-searchMatch.cm-searchMatch-selected':{backgroundColor:'var(--code-search-selected)'},
  '.cm-panels':{color:'var(--code-text)',backgroundColor:'var(--code-panel)'},
  '.cm-panel.cm-search':{padding:'8px',fontSize:'13px'},
  '.cm-textfield':{backgroundColor:'var(--code-input)',color:'var(--code-control-text)',border:'1px solid var(--code-border)'},
  '.cm-button':{backgroundImage:'none',backgroundColor:'var(--code-button)',color:'var(--code-control-text)',border:'1px solid var(--code-border)',borderRadius:'3px'},
}
const editorTheme=(dark:boolean)=>EditorView.theme(themeStyles,{dark})
function languageForPath(path:string){
  const extension=path.split('.').pop()?.toLowerCase()
  if(extension==='cs')return StreamLanguage.define(csharp)
  if(extension==='java')return StreamLanguage.define(java)
  if(['c','cpp','h','hpp'].includes(extension??''))return StreamLanguage.define(cpp)
  if(['js','jsx','ts','tsx'].includes(extension??''))return javascript({typescript:extension==='ts'||extension==='tsx',jsx:extension==='jsx'||extension==='tsx'})
  if(extension==='json')return json()
  if(['xml','html','htm','csproj','fsproj','props','targets','config','razor'].includes(extension??''))return xml()
  if(extension==='css')return css()
  if(extension==='md')return markdown()
  if(extension==='yaml'||extension==='yml')return StreamLanguage.define(yaml)
  if(extension==='sh'||extension==='ps1')return StreamLanguage.define(shell)
  return []
}

export function CodeSurface(props:Props){
  const parent=useRef<HTMLDivElement>(null),view=useRef<EditorView|null>(null)
  const cache=useRef(new Map<string,{state:EditorState;scrollTop:number;scrollLeft:number}>())
  const callbacks=useRef(props);callbacks.current=props
  const font=useRef(new Compartment()),wrapping=useRef(new Compartment()),appearance=useRef(new Compartment())
  useLayoutEffect(()=>{
    if(!parent.current)return
    const key=props.fileKey,saved=cache.current.get(key)
    const notify=(state:EditorState)=>{
      const cursor=state.selection.main.head,line=state.doc.lineAt(cursor)
      callbacks.current.onPosition({line:line.number,column:cursor-line.from+1,lines:state.doc.lines,undo:undoDepth(state),redo:redoDepth(state)})
    }
    const editor=new EditorView({parent:parent.current,state:saved?.state??EditorState.create({doc:props.text,extensions:[
      basicSetup,appearance.current.of(editorTheme(props.dark)),syntaxHighlighting(colors),languageForPath(key),keymap.of([indentWithTab]),
      EditorState.tabSize.of(4),EditorState.lineSeparator.of(props.text.includes('\r\n')?'\r\n':'\n'),
      EditorView.contentAttributes.of({'aria-label':'Kod: '+(key.split('::').pop()??key),'spellcheck':'false','autocapitalize':'off','autocorrect':'off'}),
      font.current.of(EditorView.theme({'&':{fontSize:props.fontSize+'px'}})),
      wrapping.current.of(props.wrap?EditorView.lineWrapping:[]),
      EditorView.updateListener.of(update=>{
        if(update.docChanged)callbacks.current.onChange(update.state.doc.toString())
        if(update.docChanged||update.selectionSet||update.transactions.length)notify(update.state)
      }),
    ]})})
    view.current=editor
    if(saved){editor.scrollDOM.scrollTop=saved.scrollTop;editor.scrollDOM.scrollLeft=saved.scrollLeft}
    notify(editor.state)
    const command=(fn:(view:EditorView)=>boolean)=>()=>{fn(editor);editor.focus()}
    callbacks.current.onApi({undo:command(undo),redo:command(redo),find:()=>{openSearchPanel(editor)},indent:command(indentMore),outdent:command(indentLess),selectAll:command(selectAll),replace:text=>editor.dispatch({changes:{from:0,to:editor.state.doc.length,insert:text}})})
    return()=>{
      cache.current.set(key,{state:editor.state,scrollTop:editor.scrollDOM.scrollTop,scrollLeft:editor.scrollDOM.scrollLeft})
      editor.destroy();view.current=null;callbacks.current.onApi(null)
    }
    // Each document owns its selection and undo history; text changes stay in CM.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[props.fileKey])
  useEffect(()=>{view.current?.dispatch({effects:[appearance.current.reconfigure(editorTheme(props.dark)),font.current.reconfigure(EditorView.theme({'&':{fontSize:props.fontSize+'px'}})),wrapping.current.reconfigure(props.wrap?EditorView.lineWrapping:[])]})},[props.fontSize,props.wrap,props.dark,props.fileKey])
  return <div className="ftn-code-surface" ref={parent}/>
}
