#!/usr/bin/env node
/**
 * Minify source .js files to their .min.js counterparts.
 * Only updates a .min.js when its source is newer (or .min doesn't exist).
 *
 * Commands:
 *   pnpm run minified   — list each .min.js and report how many are up to date (X / Y files minified)
 *   pnpm run minify     — minify outdated sources, list each file updated, then total
 */

const fs = require("fs")
const path = require("path")
const { minify } = require("terser")

const ROOT = path.resolve(__dirname, "..")
const IS_STATUS = process.argv.includes("--status") || process.argv[2] === "status"

// Source .js → .min.js (paths relative to project root)
const PAIRS = [
  ["resources/javascript/all.js", "resources/javascript/all.min.js"],
  ["resources/javascript/genki.js", "resources/javascript/genki.min.js"],
  ["resources/javascript/head.js", "resources/javascript/head.min.js"],
  ["resources/javascript/homepage.js", "resources/javascript/homepage.min.js"],
  ["resources/javascript/grammar-index.js", "resources/javascript/grammar-index.min.js"],
  ["resources/javascript/exercises/exercises.js", "resources/javascript/exercises/exercises.min.js"],
]

function needsUpdate(srcPath, minPath) {
  if (!fs.existsSync(srcPath)) return false
  if (!fs.existsSync(minPath)) return true
  const srcMtime = fs.statSync(srcPath).mtimeMs
  const minMtime = fs.statSync(minPath).mtimeMs
  return srcMtime > minMtime
}

function statusReport() {
  const total = PAIRS.length
  let minifiedCount = 0
  for (const [srcRel, minRel] of PAIRS) {
    const srcPath = path.join(ROOT, srcRel)
    const minPath = path.join(ROOT, minRel)
    const upToDate = fs.existsSync(srcPath) && !needsUpdate(srcPath, minPath)
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
    if (!needsUpdate(srcPath, minPath)) continue
    const code = fs.readFileSync(srcPath, "utf8")
    const result = await minify(code, {
      compress: true,
      mangle: true,
      format: { comments: false },
    })
    if (result.error) {
      console.error("Terser error for", srcRel, result.error)
      process.exitCode = 1
      continue
    }
    fs.mkdirSync(path.dirname(minPath), { recursive: true })
    fs.writeFileSync(minPath, result.code, "utf8")
    console.log(minRel)
    updated++
  }
  console.log(`${updated} files minified`)
}

async function run() {
  if (IS_STATUS) {
    statusReport()
    return
  }
  await runMinify()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
