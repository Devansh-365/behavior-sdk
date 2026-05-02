// Zero-dependency EXIF / document metadata extraction.
// Reads the first 64 KB only — enough for all metadata headers without pulling
// entire files into memory.

import type { ExifSignals } from '../../types'

const MAX_READ_BYTES = 65536

const AI_PATTERNS = [
  'stable diffusion', 'midjourney', 'dall-e', 'dalle', 'firefly',
  'adobe firefly', 'canva ai', 'imagen', 'flux', 'bing image creator',
  'openai', 'sora', 'ideogram', 'leonardo',
]

export function analyzeFileExif(file: File): Promise<ExifSignals> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (): void => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer)
      resolve(parseMetadata(bytes, file.type))
    }
    reader.onerror = (): void => {
      resolve({ fileType: 'unknown', hasExif: false, software: null, aiGenerated: false, metadataEmpty: true })
    }
    reader.readAsArrayBuffer(file.slice(0, MAX_READ_BYTES))
  })
}

function parseMetadata(bytes: Uint8Array, mimeType: string): ExifSignals {
  const fileType = detectType(bytes, mimeType)
  if (fileType === 'jpeg') return parseJpeg(bytes)
  if (fileType === 'pdf')  return parsePdf(bytes)
  if (fileType === 'png')  return parsePng(bytes)
  return { fileType: 'unknown', hasExif: false, software: null, aiGenerated: false, metadataEmpty: true }
}

function detectType(bytes: Uint8Array, mimeType: string): ExifSignals['fileType'] {
  if (bytes.length < 4) return 'unknown'
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return 'jpeg'
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'pdf'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'png'
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpeg'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('png')) return 'png'
  return 'unknown'
}

function parseJpeg(bytes: Uint8Array): ExifSignals {
  let hasExif = false
  let software: string | null = null

  // Walk JPEG markers looking for APP1 (FF E1) with Exif magic "Exif\0\0"
  let i = 2
  while (i < bytes.length - 12) {
    if (bytes[i] !== 0xFF) break
    const marker = bytes[i + 1]!
    // APP1 marker
    if (marker === 0xE1) {
      const segLen = ((bytes[i + 2]! << 8) | bytes[i + 3]!)
      if (
        bytes[i + 4] === 0x45 && bytes[i + 5] === 0x78 &&
        bytes[i + 6] === 0x69 && bytes[i + 7] === 0x66 &&
        bytes[i + 8] === 0x00 && bytes[i + 9] === 0x00
      ) {
        hasExif = true
        const segEnd = Math.min(i + 2 + segLen, bytes.length)
        software = extractSoftwareFromExif(bytes, i + 10, segEnd)
        break
      }
      i += 2 + segLen
      continue
    }
    // Skip other markers that have a length field
    if (marker >= 0xE0 && marker <= 0xFE) {
      const segLen = ((bytes[i + 2]! << 8) | bytes[i + 3]!)
      i += 2 + segLen
    } else {
      i += 2
    }
  }

  const lower = (software ?? '').toLowerCase()
  return {
    fileType: 'jpeg',
    hasExif,
    software,
    aiGenerated: AI_PATTERNS.some(p => lower.includes(p)),
    metadataEmpty: !hasExif,
  }
}

function parsePdf(bytes: Uint8Array): ExifSignals {
  const text = bytesToAscii(bytes)
  const software = extractPdfField(text, 'Producer') ?? extractPdfField(text, 'Creator')
  const lower = (software ?? '').toLowerCase()
  return {
    fileType: 'pdf',
    hasExif: false,
    software,
    aiGenerated: AI_PATTERNS.some(p => lower.includes(p)),
    metadataEmpty: software === null,
  }
}

function parsePng(bytes: Uint8Array): ExifSignals {
  // Look for tEXt / iTXt chunk with "Software" keyword
  const text = bytesToAscii(bytes)
  const match = /Software\x00([^\x00]{1,100})/.exec(text) ??
                /Software\s+([^\n\r]{1,100})/.exec(text)
  const software = match?.[1]?.trim() ?? null
  const lower = (software ?? '').toLowerCase()
  return {
    fileType: 'png',
    hasExif: false,
    software,
    aiGenerated: AI_PATTERNS.some(p => lower.includes(p)),
    metadataEmpty: software === null,
  }
}

// Scan the EXIF segment for a Software tag value.
// TIFF tag 0x0131 = Software; its value is a plain ASCII string.
// We do a text-level scan rather than full TIFF IFD parsing.
function extractSoftwareFromExif(bytes: Uint8Array, start: number, end: number): string | null {
  const ascii = bytesToAscii(bytes.subarray(start, end))
  const match = /Software\x00([^\x00]{2,64})/.exec(ascii)
  if (match?.[1]) return match[1].trim()
  // Secondary check: any AI pattern name embedded in the EXIF block
  const lower = ascii.toLowerCase()
  for (const p of AI_PATTERNS) {
    const idx = lower.indexOf(p)
    if (idx >= 0) return ascii.slice(idx, Math.min(idx + p.length + 20, ascii.length)).trim()
  }
  return null
}

function extractPdfField(text: string, key: string): string | null {
  const re = new RegExp(`/${key}\\s*\\(([^)]{1,120})\\)`)
  return re.exec(text)?.[1]?.trim() ?? null
}

function bytesToAscii(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]!
    s += (b >= 0x20 && b < 0x7F) || b === 0x09 || b === 0x0A || b === 0x0D
      ? String.fromCharCode(b)
      : '\x00'
  }
  return s
}
