#!/usr/bin/env node
/**
 * Minify source .js files to their .min.js counterparts.
 * A .min.js is updated when minified(source) !== existing .min.js (content-based, not mtime).
 *
 * Commands:
 * pnpm run minified — list each .min.js and report how many match regenerated output
 * pnpm run minify — write .min.js only where output would change (or file missing)
 */

const fs = require("fs")
const path = require("path")
const { minify } = require("terser")

const ROOT = path.resolve(__dirname, "..")
const IS_STATUS = process.argv.includes("--status") || process.argv[2] === "status"

const TERSER_OPTS = {
  compress: true,
  mangle: true,
  format: { comments: false },
}

// Source .js → .min.js (paths relative to project root)
const PAIRS = [
  ["resources/javascript/all.js", "resources/javascript/all.min.js"],
  ["resources/javascript/genki.js", "resources/javascript/genki.min.js"],
  ["resources/javascript/head.js", "resources/javascript/head.min.js"],
  ["resources/javascript/homepage.js", "resources/javascript/homepage.min.js"],
  ["resources/javascript/grammar-index.js", "resources/javascript/grammar-index.min.js"],
  ["resources/javascript/exercises/exercises.js", "resources/javascript/exercises/exercises.min.js"],
]

async function minifySource(srcPath) {
  if (!fs.existsSync(srcPath)) return { ok: false, reason: "missing" }
  const code = fs.readFileSync(srcPath, "utf8")
  const result = await minify(code, TERSER_OPTS)
  if (result.error) return { ok: false, reason: "terser", error: result.error }
  return { ok: true, code: result.code }
}

/** True when .min.js exists and equals minified source. */
async function minMatchesSource(srcPath, minPath) {
  const out = await minifySource(srcPath)
  if (!out.ok) return false
  if (!fs.existsSync(minPath)) return false
  return fs.readFileSync(minPath, "utf8") === out.code
}

async function statusReport() {
  const total = PAIRS.length
  let minifiedCount = 0
  for (const [srcRel, minRel] of PAIRS) {
    const srcPath = path.join(ROOT, srcRel)
    const minPath = path.join(ROOT, minRel)
    const upToDate = await minMatchesSource(srcPath, minPath)
    if (upToDate) minifiedCount++
    console.log(`${upToDate ? "✓" : "✗"} ${minRel}`)
  }
  console.log(`\n${minifiedCount} / ${total} files minified`)
}

async function runMinify() {
  let updated = 0
  for (const [srcRel, minRel] of PAIRS) {
    const srcPath = path.join(ROOT, srcRel)
    const minPath = path.join(ROOT, minRel)
    const out = await minifySource(srcPath)
    if (out.reason === "missing") continue
    if (!out.ok) {
      console.error("Terser error for", srcRel, out.error)
      process.exitCode = 1
      continue
    }
    const newCode = out.code
    const existing = fs.existsSync(minPath) ? fs.readFileSync(minPath, "utf8") : null
    if (existing === newCode) continue
    fs.mkdirSync(path.dirname(minPath), { recursive: true })
    fs.writeFileSync(minPath, newCode, "utf8")
    console.log(minRel)
    updated++
  }
  console.log(`${updated} files minified`)
}

async function run() {
  if (IS_STATUS) {
    await statusReport()
    return
  }
  await runMinify()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
