import { promises as fs } from 'node:fs'
import path from 'node:path'

const ersSourceRoot = path.resolve('examples/ers-ai-workflow')
const oibSourceRoot = path.resolve('examples/oib-dotnet')
const odpSourceRoot = path.resolve('examples/odp-dotnet')
const outputDir = path.resolve('public/downloads')
const ignoredDirectories = new Set(['bin', 'obj', '.vs', 'TestResults'])

const lessonBundles = [
  {
    number: 5,
    fileName: 'vezba-5-integracija-modula.zip',
    archiveRoot: 'ers-vezba-5-integracija-modula',
    title: 'Integracija modula, ugovori i podaci',
    focus: [
      'EquipmentReservation.sln',
      'src/EquipmentReservation.Domain/',
      'src/EquipmentReservation.Application/',
      'src/EquipmentReservation.Infrastructure/',
      'src/EquipmentReservation.Api/',
      'src/EquipmentReservation.ConsoleUi/',
      'tests/EquipmentReservation.Tests/Application/CreateReservationHandlerTests.cs',
      'tests/EquipmentReservation.Tests/Integration/ReservationFlowTests.cs',
    ],
  },
  {
    number: 6,
    fileName: 'vezba-6-ai-workflow.zip',
    archiveRoot: 'ers-vezba-6-ai-workflow',
    title: 'Kontrolisan razvoj uz AI',
    focus: [
      'AGENTS.md',
      '.ai/AI_USAGE.md',
      '.kova/skills/architecture-review/SKILL.md',
      '.kova/skills/implement-approved-plan/SKILL.md',
      '.kova/skills/review-pull-request/SKILL.md',
    ],
  },
  {
    number: 7,
    fileName: 'vezba-7-mcp.zip',
    archiveRoot: 'ers-vezba-7-mcp',
    title: 'MCP: povezivanje agenata sa projektom',
    focus: [
      'src/EquipmentReservation.Mcp/Program.cs',
      'src/EquipmentReservation.Mcp/Resources/ProjectResources.cs',
      'src/EquipmentReservation.Mcp/Tools/ProjectTools.cs',
      'src/EquipmentReservation.Mcp/Workspace/ProjectPathPolicy.cs',
      'src/EquipmentReservation.Mcp/Processes/ProjectCommand.cs',
      '.kova/mcp.json',
    ],
  },
  {
    number: 8,
    fileName: 'vezba-8-guardrails-evals.zip',
    archiveRoot: 'ers-vezba-8-guardrails-evals',
    title: 'Hooks, guardrails i evaluacije',
    focus: [
      'src/EquipmentReservation.Guardrails/Policies/DangerousCommandGuardrail.cs',
      'src/EquipmentReservation.Guardrails/Policies/SensitiveFileGuardrail.cs',
      'src/EquipmentReservation.Guardrails/Services/GuardrailEvaluator.cs',
      'src/EquipmentReservation.Guardrails/Hosting/GuardrailHook.cs',
      '.vscode/settings.json',
      '.kova/hooks.json',
      'scripts/kova-audit.mjs',
      'evals/review-architecture.json',
      'evals/prompt-injection.json',
      'evals/missing-context.json',
      'evals/README.md',
      'tests/EquipmentReservation.Tests/Guardrails/GuardrailPolicyTests.cs',
      'tests/EquipmentReservation.Tests/AiWorkflow/AiWorkflowArtifactsTests.cs',
    ],
  },
]

const bundles = [
  { fileName: 'ers-ai-vezbe-5-8.zip', archiveRoot: 'ers-ai-vezbe-5-8' },
  ...lessonBundles.map((lesson) => ({
    fileName: lesson.fileName,
    archiveRoot: lesson.archiveRoot,
    lesson,
  })),
]

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index
  for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1)
  return value >>> 0
})

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function dosTimestamp(date) {
  const year = Math.max(1980, date.getFullYear())
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { time, day }
}

async function collectFiles(directory, prefix = '') {
  const result = []
  const entries = await fs.readdir(directory, { withFileTypes: true })
  entries.sort((a, b) => a.name.localeCompare(b.name))

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue
    if (entry.name === '.DS_Store') continue

    const absolute = path.join(directory, entry.name)
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name

    if (entry.isDirectory()) result.push(...await collectFiles(absolute, relative))
    else if (entry.isFile()) result.push({ absolute, relative })
  }

  return result
}

function lessonReadme(lesson) {
  return Buffer.from(`# Vežba ${lesson.number} — ${lesson.title}\n\nOvaj ZIP je samostalni paket za Vežbu ${lesson.number}. Sadrži ceo \`EquipmentReservation.sln\` da projekat može odmah da se otvori, builduje i testira.\n\n## Fajlovi na koje je fokus ove vežbe\n\n${lesson.focus.map((item) => `- \`${item}\``).join('\n')}\n\n## Pokretanje\n\n\`\`\`bash\ndotnet restore EquipmentReservation.sln\ndotnet build EquipmentReservation.sln\ndotnet test EquipmentReservation.sln --no-build\n\`\`\`\n`, 'utf8')
}

async function createZip(bundle, sourceFiles) {
  const files = [...sourceFiles]
  if (bundle.lesson) {
    files.push({
      relative: 'LEKCIJA.md',
      data: lessonReadme(bundle.lesson),
      modified: new Date(2026, 0, 1),
    })
  }

  const localParts = []
  const centralParts = []
  let offset = 0

  for (const file of files) {
    const data = file.data ?? await fs.readFile(file.absolute)
    const modified = file.modified ?? (await fs.stat(file.absolute)).mtime
    const name = Buffer.from(`${bundle.archiveRoot}/${file.relative.replaceAll('\\', '/')}`, 'utf8')
    const checksum = crc32(data)
    const { time, day } = dosTimestamp(modified)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6)
    local.writeUInt16LE(0, 8)
    local.writeUInt16LE(time, 10)
    local.writeUInt16LE(day, 12)
    local.writeUInt32LE(checksum, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)
    localParts.push(local, name, data)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(0, 10)
    central.writeUInt16LE(time, 12)
    central.writeUInt16LE(day, 14)
    central.writeUInt32LE(checksum, 16)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt16LE(0, 30)
    central.writeUInt16LE(0, 32)
    central.writeUInt16LE(0, 34)
    central.writeUInt16LE(0, 36)
    central.writeUInt32LE(0, 38)
    central.writeUInt32LE(offset, 42)
    centralParts.push(central, name)

    offset += local.length + name.length + data.length
  }

  const centralDirectory = Buffer.concat(centralParts)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(centralDirectory.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)

  const outputFile = path.join(outputDir, bundle.fileName)
  await fs.writeFile(outputFile, Buffer.concat([...localParts, centralDirectory, end]))
  console.log(`Generated ${path.relative(process.cwd(), outputFile)} (${files.length} files)`)
}

await fs.mkdir(outputDir, { recursive: true })
const sourceFiles = await collectFiles(ersSourceRoot)
for (const bundle of bundles) await createZip(bundle, sourceFiles)

const oibLessons = [
  ['01', 'identitet-rbac'],
  ['02', 'resurs-klasifikacija'],
  ['03', 'politike-konfiguracija'],
  ['04', 'threat-modeling'],
  ['05', 'mfa-sesije-tajne'],
  ['06', 'detekcija-incident'],
  ['07', 'abac-rizik-pregled'],
  ['08', 'korelacija-efektivnost'],
]

for (const [number, slug] of oibLessons) {
  const directoryName = `vezba-${number}-${slug}`
  const files = await collectFiles(path.join(oibSourceRoot, directoryName))
  await createZip({ fileName: `oib-${directoryName}.zip`, archiveRoot: `oib-${directoryName}` }, files)
}

await createZip({ fileName: 'oib-svi-primeri.zip', archiveRoot: 'oib-dotnet-primeri' }, await collectFiles(oibSourceRoot))

const odpLessons = [
  ['01', 'vlasnistvo-neizvesnost'],
  ['02', 'ugovori-simulator'],
  ['03', 'identitet-audit-konfiguracija'],
  ['04', 'verzionisanje-failure-first'],
  ['05', 'tok-podataka-read-model'],
  ['06', 'komande-idempotentnost'],
  ['07', 'rad-bez-veze-outbox'],
  ['08', 'koordinacija-protok'],
]

for (const [number, slug] of odpLessons) {
  const directoryName = `vezba-${number}-${slug}`
  const files = await collectFiles(path.join(odpSourceRoot, directoryName))
  await createZip({ fileName: `odp-${directoryName}.zip`, archiveRoot: `odp-${directoryName}` }, files)
}

await createZip({ fileName: 'odp-svi-primeri.zip', archiveRoot: 'odp-dotnet-primeri' }, await collectFiles(odpSourceRoot))

const presentationBundles = [
  { directory: 'ers-prezentacije', fileName: 'ERS_sve_prezentacije.zip', archiveRoot: 'ERS_prezentacije' },
  { directory: 'oib-prezentacije', fileName: 'OIB_sve_prezentacije.zip', archiveRoot: 'OIB_prezentacije' },
  { directory: 'odp-prezentacije', fileName: 'ODP_sve_prezentacije.zip', archiveRoot: 'ODP_prezentacije' },
]

for (const presentationBundle of presentationBundles) {
  try {
    const presentationRoot = path.resolve('public/downloads', presentationBundle.directory)
    const presentationFiles = (await collectFiles(presentationRoot)).filter((file) => file.relative.endsWith('.pdf'))
    if (presentationFiles.length > 0) {
      await createZip(presentationBundle, presentationFiles)
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}
