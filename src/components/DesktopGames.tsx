import { useCallback, useEffect, useRef, useState } from 'react'

export type GameId = 'sudoku' | 'tetris' | 'invaders'

const sudokuSolution = (offset: number) =>
  Array.from({ length: 81 }, (_, index) => ((Math.floor(index / 9) * 3 + Math.floor(Math.floor(index / 9) / 3) + index % 9 + offset) % 9) + 1)

function createSudoku(seed: number) {
  const solution = sudokuSolution(seed % 9)
  const given = solution.map((_, index) => ((index * 13 + Math.floor(index / 9) * 7 + seed * 11) % 17) < 8)
  return { solution, given, cells: solution.map((n, i) => given[i] ? n : 0) }
}

export function Sudoku({ active }: { active: boolean }) {
  const [seed, setSeed] = useState(0)
  const [game, setGame] = useState(() => createSudoku(0))
  const [selected, setSelected] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const won = game.cells.every((value, i) => value === game.solution[i])

  const input = useCallback((value: number) => {
    if (selected === null || game.given[selected]) return
    if (value !== 0 && value !== game.solution[selected] && game.cells[selected] !== value) setErrors(count => count + 1)
    setGame(previous => {
      const cells = [...previous.cells]
      cells[selected] = value
      return { ...previous, cells }
    })
  }, [selected, game])

  useEffect(() => {
    if (!active) return
    const handler = (event: KeyboardEvent) => {
      if (/^[1-9]$/.test(event.key)) input(Number(event.key))
      else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') input(0)
      else if (selected !== null && event.key.startsWith('Arrow')) {
        event.preventDefault()
        const row = Math.floor(selected / 9), col = selected % 9
        const dr = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0
        const dc = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
        setSelected(((row + dr + 9) % 9) * 9 + (col + dc + 9) % 9)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [active, input, selected])

  const restart = () => {
    const next = seed + 1
    setSeed(next)
    setGame(createSudoku(next))
    setSelected(null)
    setErrors(0)
  }

  return <div className="game-screen sudoku-screen">
    <div className="game-intro"><span className="game-kicker">01 / LOGIKA</span><h2>Sudoku<span className="game-accent">.</span></h2><p>Popuni mrežu brojevima od 1 do 9, bez ponavljanja u redovima, kolonama i kvadratima.</p></div>
    <div className="sudoku-layout">
      <div className="sudoku-board" role="grid" aria-label="Sudoku mreža">
        {game.cells.map((value, index) => {
          const same = selected !== null && (Math.floor(selected / 9) === Math.floor(index / 9) || selected % 9 === index % 9)
          const error = value !== 0 && value !== game.solution[index]
          return <button key={index} role="gridcell" aria-label={`Red ${Math.floor(index / 9) + 1}, kolona ${index % 9 + 1}: ${value || 'prazno'}`}
            className={['sudoku-cell', game.given[index] ? 'given' : '', selected === index ? 'selected' : '', same ? 'related' : '', error ? 'wrong' : '', index % 9 === 2 || index % 9 === 5 ? 'end-col' : '', Math.floor(index / 9) === 2 || Math.floor(index / 9) === 5 ? 'end-row' : ''].join(' ')}
            onClick={() => setSelected(index)}>{value || ''}</button>
        })}
      </div>
      <div className="sudoku-sidebar">
        <div className="game-stat"><span>GREŠKE</span><strong>{errors}</strong></div>
        <div className="game-stat"><span>POPUNJENO</span><strong>{game.cells.filter(Boolean).length}<small> / 81</small></strong></div>
        <div className="sudoku-numpad">{Array.from({ length: 9 }, (_, index) => <button key={index} onClick={() => input(index + 1)}>{index + 1}</button>)}</div>
        <button className="game-secondary" onClick={() => input(0)}>Obriši polje</button>
        <button className="game-primary" onClick={restart}>Nova igra ↗</button>
      </div>
    </div>
    <p className="game-footnote">{won ? 'Bravo! Sudoku je uspešno rešen.' : 'Tastatura: brojevi 1–9 · strelice za kretanje · Delete za brisanje'}</p>
  </div>
}

type Matrix = number[][]
type Piece = { shape: Matrix; x: number; y: number; color: number }
type TetrisState = { board: Matrix; piece: Piece; score: number; lines: number; over: boolean; paused: boolean }
const SHAPES: Matrix[] = [
  [[1,1,1,1]], [[2,0,0],[2,2,2]], [[0,0,3],[3,3,3]],
  [[4,4],[4,4]], [[0,5,5],[5,5,0]], [[0,6,0],[6,6,6]], [[7,7,0],[0,7,7]],
]
const emptyBoard = () => Array.from({ length: 18 }, () => Array(10).fill(0) as number[])
const spawn = (): Piece => {
  const color = Math.floor(Math.random() * SHAPES.length) + 1
  return { shape: SHAPES[color - 1].map(row => [...row]), x: 3, y: 0, color }
}
const collides = (board: Matrix, piece: Piece) => piece.shape.some((row, ry) => row.some((cell, rx) =>
  Boolean(cell) && (piece.x + rx < 0 || piece.x + rx >= 10 || piece.y + ry >= 18 ||
    (piece.y + ry >= 0 && board[piece.y + ry][piece.x + rx] !== 0))))
const beginTetris = (): TetrisState => ({ board: emptyBoard(), piece: spawn(), score: 0, lines: 0, over: false, paused: false })

function moveTetris(state: TetrisState, action: 'left' | 'right' | 'down' | 'rotate' | 'drop' | 'pause'): TetrisState {
  if (action === 'pause') return { ...state, paused: !state.paused }
  if (state.over || state.paused) return state
  const moved = { ...state.piece, shape: state.piece.shape.map(row => [...row]) }
  if (action === 'left') moved.x--
  if (action === 'right') moved.x++
  if (action === 'rotate') moved.shape = state.piece.shape[0].map((_, x) => state.piece.shape.map(row => row[x]).reverse())
  if (action === 'down') moved.y++
  if (action === 'drop') while (!collides(state.board, { ...moved, y: moved.y + 1 })) moved.y++
  if (action !== 'drop' && !collides(state.board, moved)) return { ...state, piece: moved }
  if (action !== 'down' && action !== 'drop') return state

  const landed = action === 'drop' ? moved : state.piece
  const board = state.board.map(row => [...row])
  landed.shape.forEach((row, y) => row.forEach((cell, x) => {
    if (cell && landed.y + y >= 0) board[landed.y + y][landed.x + x] = cell
  }))
  const kept = board.filter(row => row.some(cell => cell === 0))
  const cleared = 18 - kept.length
  while (kept.length < 18) kept.unshift(Array(10).fill(0))
  const next = spawn()
  return { ...state, board: kept, piece: next, score: state.score + cleared * cleared * 100 + (action === 'drop' ? 2 : 0), lines: state.lines + cleared, over: collides(kept, next) }
}

export function Tetris({ active }: { active: boolean }) {
  const [game, setGame] = useState<TetrisState>(beginTetris)
  const act = useCallback((action: Parameters<typeof moveTetris>[1]) => setGame(state => moveTetris(state, action)), [])
  useEffect(() => {
    if (!active || game.over || game.paused) return
    const timer = window.setInterval(() => act('down'), Math.max(130, 650 - game.lines * 18))
    return () => window.clearInterval(timer)
  }, [active, act, game.lines, game.over, game.paused])
  useEffect(() => {
    if (!active) return
    const handler = (event: KeyboardEvent) => {
      const actions: Record<string, Parameters<typeof moveTetris>[1]> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down', ArrowUp: 'rotate', ' ': 'drop', p: 'pause', P: 'pause' }
      if (actions[event.key]) { event.preventDefault(); act(actions[event.key]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [active, act])
  const cells = game.board.map(row => [...row])
  game.piece.shape.forEach((row, y) => row.forEach((cell, x) => {
    const cy = game.piece.y + y, cx = game.piece.x + x
    if (cell && cy >= 0 && cy < 18 && cx >= 0 && cx < 10) cells[cy][cx] = cell
  }))
  return <div className="game-screen tetris-screen">
    <div className="game-intro"><span className="game-kicker">02 / ARKADA</span><h2>Block stack<span className="game-accent">.</span></h2><p>Klasični Tetris. Rotiraj blokove, popunjavaj redove i obori rekord.</p></div>
    <div className="tetris-layout">
      <div className="tetris-board" aria-label="Tetris tabla">{cells.flat().map((color, i) => <span key={i} className={`tetris-cell tile-${color}`} />)}
        {(game.over || game.paused) && <div className="tetris-overlay">{game.over ? 'KRAJ IGRE' : 'PAUZA'}</div>}
      </div>
      <div className="tetris-sidebar">
        <div className="game-stat"><span>POENI</span><strong>{game.score}</strong></div>
        <div className="game-stat"><span>LINIJE</span><strong>{game.lines}</strong></div>
        <div className="tetris-buttons"><button onClick={() => act('rotate')}>↻</button><button onClick={() => act('left')}>←</button><button onClick={() => act('down')}>↓</button><button onClick={() => act('right')}>→</button><button className="wide" onClick={() => act('drop')}>SPUSTI ⤓</button></div>
        <button className="game-secondary" onClick={() => act('pause')}>{game.paused ? 'Nastavi' : 'Pauza'}</button>
        <button className="game-primary" onClick={() => setGame(beginTetris())}>Nova igra ↗</button>
      </div>
    </div>
    <p className="game-footnote">← → pomeranje · ↑ rotacija · ↓ spuštanje · Space pad · P pauza</p>
  </div>
}

type Invader = { x: number; y: number; alive: boolean }
type Shot = { x: number; y: number }
type InvadersState = { player: number; enemies: Invader[]; shots: Shot[]; enemyShots: Shot[]; direction: number; tick: number; lastShot: number; score: number; lives: number; level: number; over: boolean; victory: boolean }
const wave = (level: number) => Array.from({ length: 24 }, (_, i) => ({ x: 70 + (i % 8) * 65, y: 48 + Math.floor(i / 8) * 47 - Math.min(level, 4) * 3, alive: true }))
const newInvaders = (): InvadersState => ({ player: 340, enemies: wave(1), shots: [], enemyShots: [], direction: 1, tick: 0, lastShot: 0, score: 0, lives: 3, level: 1, over: false, victory: false })

export function SpaceInvaders({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<InvadersState>(newInvaders())
  const held = useRef({ left: false, right: false, fire: false })
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1, over: false })
  const reset = () => { stateRef.current = newInvaders(); setHud({ score: 0, lives: 3, level: 1, over: false }) }

  useEffect(() => {
    if (!active) { held.current = { left: false, right: false, fire: false }; return }
    const down = (event: KeyboardEvent) => {
      if (['ArrowLeft','ArrowRight',' ','a','d','A','D'].includes(event.key)) event.preventDefault()
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') held.current.left = true
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') held.current.right = true
      if (event.key === ' ') held.current.fire = true
    }
    const up = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') held.current.left = false
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') held.current.right = false
      if (event.key === ' ') held.current.fire = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [active])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    const timer = window.setInterval(() => {
      const g = stateRef.current
      g.tick++
      if (!g.over) {
        if (held.current.left) g.player = Math.max(22, g.player - 7)
        if (held.current.right) g.player = Math.min(658, g.player + 7)
        if (held.current.fire && g.tick - g.lastShot > 9) { g.shots.push({ x: g.player, y: 343 }); g.lastShot = g.tick }
        const speed = 1 + g.level * .25
        if (g.enemies.some(e => e.alive && ((g.direction > 0 && e.x >= 636) || (g.direction < 0 && e.x <= 25)))) {
          g.direction *= -1
          g.enemies.forEach(e => { e.y += 12 })
        }
        g.enemies.forEach(e => { if (e.alive) e.x += g.direction * speed })
        g.shots.forEach(b => { b.y -= 10 })
        g.enemyShots.forEach(b => { b.y += 5 + g.level * .5 })
        g.shots = g.shots.filter(b => b.y > 0)
        g.enemyShots = g.enemyShots.filter(b => b.y < 400)
        for (const b of g.shots) {
          const e = g.enemies.find(e => e.alive && Math.abs(e.x - b.x) < 21 && Math.abs(e.y - b.y) < 15)
          if (e) { e.alive = false; b.y = -20; g.score += 10 }
        }
        if (g.tick % Math.max(20, 60 - g.level * 5) === 0) {
          const shooters = g.enemies.filter(e => e.alive)
          if (shooters.length) {
            const e = shooters[Math.floor(Math.random() * shooters.length)]
            g.enemyShots.push({ x: e.x, y: e.y + 16 })
          }
        }
        for (const b of g.enemyShots) if (Math.abs(b.x - g.player) < 20 && b.y > 339 && b.y < 372) { b.y = 450; g.lives-- }
        if (g.lives <= 0 || g.enemies.some(e => e.alive && e.y > 325)) g.over = true
        if (g.enemies.every(e => !e.alive)) { g.level++; g.enemies = wave(g.level); g.direction = 1; g.shots = []; g.enemyShots = [] }
      }
      ctx.fillStyle = '#070e21'; ctx.fillRect(0, 0, 680, 400)
      ctx.fillStyle = '#1c3157'
      for (let i = 0; i < 40; i++) ctx.fillRect((i * 97 + 23) % 680, (i * 59 + 11) % 355, 2, 2)
      ctx.strokeStyle = '#274367'; ctx.beginPath(); ctx.moveTo(0, 375); ctx.lineTo(680, 375); ctx.stroke()
      ctx.fillStyle = '#68d8e0'
      ctx.beginPath(); ctx.moveTo(g.player, 339); ctx.lineTo(g.player - 20, 368); ctx.lineTo(g.player + 20, 368); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#ffdc80'
      g.shots.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 15))
      ctx.fillStyle = '#ff697c'
      g.enemyShots.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 12))
      g.enemies.forEach((e, i) => {
        if (!e.alive) return
        ctx.fillStyle = ['#b99cff', '#64d8e0', '#89e69e'][Math.floor(i / 8)]
        ctx.fillRect(e.x - 17, e.y - 9, 34, 16)
        ctx.fillRect(e.x - 22, e.y - 3, 44, 9)
        ctx.fillStyle = '#070e21'
        ctx.fillRect(e.x - 10, e.y - 3, 5, 5); ctx.fillRect(e.x + 6, e.y - 3, 5, 5)
      })
      if (g.over) {
        ctx.fillStyle = '#070e21cc'; ctx.fillRect(0, 0, 680, 400)
        ctx.fillStyle = '#f4f6ff'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('GAME OVER', 340, 193)
        ctx.font = '16px sans-serif'; ctx.fillText('Pokreni novu igru da nastaviš', 340, 223)
      }
      if (g.tick % 5 === 0) setHud({ score: g.score, lives: g.lives, level: g.level, over: g.over })
    }, 33)
    return () => window.clearInterval(timer)
  }, [active])

  const press = (key: 'left' | 'right' | 'fire', value: boolean) => { held.current[key] = value }
  return <div className="game-screen invaders-screen">
    <div className="game-intro"><span className="game-kicker">03 / RETRO ARKADA</span><h2>Space invaders<span className="game-accent">.</span></h2><p>Odbrani planetu! Izbegavaj projektile i obori sve talase neprijatelja.</p></div>
    <div className="invaders-hud"><span>POENI <strong>{hud.score}</strong></span><span>ŽIVOTI <strong>{'♥'.repeat(Math.max(0, hud.lives))}</strong></span><span>TALAS <strong>{hud.level}</strong></span></div>
    <canvas ref={canvasRef} width={680} height={400} className="invaders-canvas" aria-label="Space Invaders igra" />
    <div className="invaders-controls">
      {([{ key: 'left', text: '← LEVO' }, { key: 'fire', text: '● PUCANJE' }, { key: 'right', text: 'DESNO →' }] as const).map(item =>
        <button key={item.key} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); press(item.key, true) }} onPointerUp={() => press(item.key, false)} onPointerCancel={() => press(item.key, false)}>{item.text}</button>)}
      <button className="game-primary" onClick={reset}>{hud.over ? 'Ponovo ↗' : 'Restart ↗'}</button>
    </div>
    <p className="game-footnote">A / D ili ← → za kretanje · Space za pucanje · podržane i kontrole na dodir</p>
  </div>
}
