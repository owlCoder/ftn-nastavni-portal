import hljs from 'highlight.js/lib/core'
import csharp from 'highlight.js/lib/languages/csharp'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import xml from 'highlight.js/lib/languages/xml'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import yaml from 'highlight.js/lib/languages/yaml'

for (const [name, grammar] of Object.entries({ csharp, bash, json, markdown, xml, javascript, typescript, css, yaml })) {
  hljs.registerLanguage(name, grammar)
}

const escapeHtml = (value: string) => value.replace(/[&<>]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character]!))
const aliases: Record<string, string> = {
  cs: 'csharp', 'c#': 'csharp', sh: 'bash', shell: 'bash', md: 'markdown',
  csproj: 'xml', fsproj: 'xml', props: 'xml', targets: 'xml', config: 'xml', html: 'xml', htm: 'xml',
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', yml: 'yaml',
}

export function codeLanguageForFile(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase() ?? ''
  const language = aliases[extension] ?? extension
  return hljs.getLanguage(language) ? language : 'text'
}

export function codeLanguageLabel(language: string) {
  return ({ csharp: 'C#', bash: 'Shell', javascript: 'JavaScript', typescript: 'TypeScript', markdown: 'Markdown', text: 'Tekst' } as Record<string, string>)[language] ?? language.toUpperCase()
}

export function highlightCode(code: string, language: string) {
  const name = aliases[language.toLowerCase()] ?? language.toLowerCase()
  // Keep large archive files responsive and render unsupported formats as escaped text.
  if (code.length > 100_000 || !hljs.getLanguage(name)) return escapeHtml(code)
  return hljs.highlight(code, { language: name, ignoreIllegals: true }).value
}

export function highlightCodeLines(code: string, language: string): string[] {
  const lines: string[] = []
  const spans: string[] = []
  let line = ''
  // Reopen syntax spans at line boundaries so multiline strings/comments keep their colors.
  for (const token of highlightCode(code, language).split(/(<span\b[^>]*>|<\/span>|\n)/)) {
    if (token === '\n') {
      lines.push(line + '</span>'.repeat(spans.length))
      line = spans.join('')
      continue
    }
    if (token.startsWith('<span')) spans.push(token)
    else if (token === '</span>') spans.pop()
    line += token
  }
  lines.push(line)
  return lines
}
