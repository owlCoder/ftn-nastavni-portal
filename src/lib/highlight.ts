import type { CodeLanguage } from '../practicum/types'

const esc = (value: string) => value.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]!))

type TokenStash = { keep: (html: string) => string; restore: (value: string) => string }

function createTokenStash(): TokenStash {
  const values: string[] = []
  const keep = (html: string) => {
    const index = values.push(html) - 1
    return `\uE000${String.fromCodePoint(0xE100 + index)}\uE001`
  }
  const restore = (value: string) => value.replace(/\uE000([\uE100-\uF8FF])\uE001/g, (_, marker: string) => values[marker.codePointAt(0)! - 0xE100] ?? '')
  return { keep, restore }
}

function tokeniseCSharp(code: string) {
  let x = esc(code)
  const stash = createTokenStash()
  x = x.replace(/\/\/.*$/gm, (m) => stash.keep(`<span class="tok-comment">${m}</span>`))
  x = x.replace(/(&quot;|\")[^\n]*?(&quot;|\")/g, (m) => stash.keep(`<span class="tok-string">${m}</span>`))
  x = x.replace(/\b(public|private|protected|internal|sealed|static|readonly|class|record|interface|namespace|using|new|return|if|else|for|foreach|while|switch|case|break|continue|throw|try|catch|finally|async|await|var|void|bool|int|long|decimal|double|string|object|null|true|false|this|base|override|virtual|abstract|in|out|ref|where|get|set|init)\b/g, '<span class="tok-keyword">$1</span>')
  x = x.replace(/\b([A-Z][A-Za-z0-9_]*)\b/g, '<span class="tok-type">$1</span>')
  x = x.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-number">$1</span>')
  return stash.restore(x)
}

function tokeniseBash(code: string) {
  let x = esc(code)
  const stash = createTokenStash()
  x = x.replace(/#.*$/gm, (m) => stash.keep(`<span class="tok-comment">${m}</span>`))
  x = x.replace(/(&quot;|\")[^\n]*?(&quot;|\")/g, (m) => stash.keep(`<span class="tok-string">${m}</span>`))
  x = x.replace(/(^|\s)(--?[a-zA-Z0-9][a-zA-Z0-9-]*)/gm, (_, prefix: string, flag: string) => `${prefix}${stash.keep(`<span class="tok-attr">${flag}</span>`)}`)
  x = x.replace(/\b(git|dotnet|npm|npx|cd|mkdir|rm|cp|mv|echo|cat|grep|find|curl|export|set|docker|node)\b/g, (m) => stash.keep(`<span class="tok-keyword">${m}</span>`))
  return stash.restore(x)
}

function tokeniseJson(code: string) {
  let x = esc(code)
  x = x.replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="tok-property">$1</span>$2')
  x = x.replace(/(:\s*)(&quot;[^&]*?&quot;)/g, '$1<span class="tok-string">$2</span>')
  x = x.replace(/\b(true|false|null)\b/g, '<span class="tok-keyword">$1</span>')
  x = x.replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="tok-number">$1</span>')
  return x
}

function tokeniseMarkdown(code: string) {
  let x = esc(code)
  x = x.replace(/^(#{1,6}\s.*)$/gm, '<span class="tok-keyword">$1</span>')
  x = x.replace(/(`[^`]+`)/g, '<span class="tok-string">$1</span>')
  x = x.replace(/(\*\*[^*]+\*\*)/g, '<span class="tok-type">$1</span>')
  x = x.replace(/^(- |\d+\. )/gm, '<span class="tok-attr">$1</span>')
  return x
}

export function highlightCode(code: string, language: CodeLanguage) {
  switch (language) {
    case 'csharp': return tokeniseCSharp(code)
    case 'bash': return tokeniseBash(code)
    case 'json': return tokeniseJson(code)
    case 'markdown': return tokeniseMarkdown(code)
    default: return esc(code)
  }
}
