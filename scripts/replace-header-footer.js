#!/usr/bin/env node
const fs = require("fs")
const path = require("path")

const OLD_HEADER = /    <header>\n      <h1><a href="\/" id="home-link" class="edition-icon third-ed">Genki Study Resources<\/a><\/h1>\n      <a id="fork-me" href="https:\/\/github\.com\/SethClydesdale\/studyresources">Fork Me<\/a>\n    <\/header>/g

const NEW_HEADER = `    <header class="site-header">
      <button type="button" class="icon-button" id="sidebar-nav-trigger" aria-label="Toggle navigation"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 21a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3zM18 5h-8v14h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1"/></svg></button>
      <a href="/" id="home-link" class="site-title">Genki Study Resources</a>
      <button type="button" class="icon-button" id="genki-site-settings" aria-label="Open settings"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></button>
    </header>`

const OLD_FOOTER = /    <footer class="clear">[\s\S]*?    <\/footer>/g

const NEW_FOOTER = `    <footer class="site-footer footer--minimal">
      <a href="https://github.com/tannertanner1/studyresources" target="_blank" rel="noopener noreferrer">/studyresources</a>
      <button type="button" class="icon-button" id="theme-btn" aria-label="Toggle theme"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34A10 10 0 1 1 2 12l.005-.324A10 10 0 0 1 17 3.34M8 5.072A8 8 0 0 0 12.001 20L12 4a8 8 0 0 0-4 1.072"/></svg></button>
    </footer>`

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const p = path.join(dir, file)
    if (fs.statSync(p).isDirectory()) walkDir(p, fileList)
    else if (file === "index.html") fileList.push(p)
  }
  return fileList
}

const lessonsDir = path.join(__dirname, "..", "lessons")
const helpDir = path.join(__dirname, "..", "help")
let files = []
if (fs.existsSync(lessonsDir)) files = files.concat(walkDir(lessonsDir))
if (fs.existsSync(helpDir)) files = files.concat(walkDir(helpDir))

let headerCount = 0
let footerCount = 0
for (const file of files) {
  let html = fs.readFileSync(file, "utf8")
  const beforeHeader = html
  html = html.replace(OLD_HEADER, NEW_HEADER)
  if (html !== beforeHeader) headerCount++
  const beforeFooter = html
  html = html.replace(OLD_FOOTER, NEW_FOOTER)
  if (html !== beforeFooter) footerCount++
  fs.writeFileSync(file, html)
}
console.log("Header replaced in", headerCount, "files. Footer replaced in", footerCount, "files.")
