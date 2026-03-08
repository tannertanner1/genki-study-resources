#!/usr/bin/env node
// Prepend BASE_URL to og:url/og:image in HTML files.
// Resolves: process.env.BASE_URL > .env.local > http://localhost:3000

const fs = require("fs")
const path = require("path")
const ROOT = path.resolve(__dirname, "..")
const envFile = path.join(ROOT, ".env.local")

if (fs.existsSync(envFile))
  for (const l of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = l.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/+$/, "")
const args = process.argv.slice(2)
const DRY = args.includes("--test")
const si = args.indexOf("--path")
const RE = /(<meta\s+property="og:(?:url|image)"\s+content=")(\/)/g
const SKIP = new Set(["node_modules", ".git", ".pnpm-store", "_private"])

function walk(dir) {
  let r = []
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP.has(e.name) || e.name.startsWith(".")) continue
      const p = path.join(dir, e.name)
      e.isDirectory() ? r.push(...walk(p)) : e.name.endsWith(".html") && r.push(p)
    }
  } catch {}
  return r
}

const dir = si !== -1 ? path.join(ROOT, args[si + 1]) : ROOT
if (!fs.existsSync(dir)) {
  console.error(`Not found: ${dir}`)
  process.exit(1)
}

const files = walk(dir)
let n = 0

for (const f of files) {
  const src = fs.readFileSync(f, "utf8")
  const out = src.replace(RE, `$1${BASE}$2`)
  if (out === src) continue
  n++
  const rel = path.relative(ROOT, f)
  DRY ? console.log(`[dry] ${rel}`) : (fs.writeFileSync(f, out, "utf8"), console.log(rel))
}

console.log(`\n${n}/${files.length} ${DRY ? "would change" : "updated"} (${BASE})`)
