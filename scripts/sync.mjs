#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../data/data.json')

const SOURCES = {
  ach: 'https://raw.githubusercontent.com/moov-io/fed/master/data/FedACHdir.txt',
  wire: 'https://raw.githubusercontent.com/moov-io/fed/master/data/fpddir.txt',
}

async function download(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${url} (${res.status})`)
  return res.text()
}

// FedACH fixed-width format:
//   0-8:   routing number
//   9-26:  office code + servicing FRB + record type + date
//   27-34: state + MSA + district/sub
//   35-70: institution name (36 chars)
function parseACH(text) {
  const map = {}
  for (const line of text.split('\n')) {
    if (line.length < 71) continue
    const rtn = line.slice(0, 9).trim()
    const name = line.slice(35, 71).trim()
    if (!rtn || !name) continue
    if (!map[rtn]) map[rtn] = { name: '', ach: false, wire: false }
    map[rtn].name = name
    map[rtn].ach = true
  }
  return map
}

// Fedwire fixed-width format:
//   0-8:   routing number
//   9-26:  telegraphic name
//   27-62: institution name (36 chars)
function parseWire(text, map) {
  for (const line of text.split('\n')) {
    if (line.length < 65) continue
    const rtn = line.slice(0, 9).trim()
    const name = line.slice(27, 63).trim()
    if (!rtn || !name) continue
    if (!map[rtn]) map[rtn] = { name: '', ach: false, wire: false }
    if (!map[rtn].name) map[rtn].name = name
    map[rtn].wire = true
  }
  return map
}

mkdirSync(dirname(OUT), { recursive: true })

console.log('fedsdk: syncing FedACH + Fedwire directories...')
const [achText, wireText] = await Promise.all([download(SOURCES.ach), download(SOURCES.wire)])
let map = parseACH(achText)
map = parseWire(wireText, map)

const compactMap = {}
for (const [rtn, entry] of Object.entries(map)) {
  let flags = 0
  if (entry.ach) flags |= 1
  if (entry.wire) flags |= 2
  compactMap[rtn] = [entry.name, flags]
}

writeFileSync(OUT, JSON.stringify(compactMap))
console.log(`fedsdk: wrote ${Object.keys(compactMap).length.toLocaleString()} routing numbers → data/data.json`)

