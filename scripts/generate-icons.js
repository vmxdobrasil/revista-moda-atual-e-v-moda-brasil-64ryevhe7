import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

// Pure Node.js PNG encoder without external dependencies
function createPng(width, height, drawFn) {
  const bytesPerPixel = 4 // RGBA
  const rowSize = width * bytesPerPixel
  const rawData = Buffer.alloc(height * (rowSize + 1)) // 1 filter byte per row

  // Temporary buffer for drawing
  const pixels = Buffer.alloc(width * height * 4)

  const setPixel = (x, y, r, g, b, a = 255) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return
    const offset = (y * width + x) * 4
    pixels[offset] = r
    pixels[offset + 1] = g
    pixels[offset + 2] = b
    pixels[offset + 3] = a
  }

  // Draw
  drawFn({ width, height, setPixel })

  // Fill rawData with filter byte 0 (None)
  for (let y = 0; y < height; y++) {
    const rawRowOffset = y * (rowSize + 1)
    rawData[rawRowOffset] = 0 // Filter type: None
    const pixelRowOffset = y * rowSize
    pixels.copy(rawData, rawRowOffset + 1, pixelRowOffset, pixelRowOffset + rowSize)
  }

  // Deflate
  const compressed = zlib.deflateSync(rawData)

  // Build PNG chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  function createChunk(type, data) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    const typeBuf = Buffer.from(type, 'ascii')
    const typeAndData = Buffer.concat([typeBuf, data])

    const crcBuf = Buffer.alloc(4)
    crcBuf.writeInt32BE(crc32(typeAndData), 0)

    return Buffer.concat([len, typeAndData, crcBuf])
  }

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr.writeUInt8(8, 8) // bit depth: 8
  ihdr.writeUInt8(6, 9) // color type: 6 (RGBA)
  ihdr.writeUInt8(0, 10) // compression method: 0
  ihdr.writeUInt8(0, 11) // filter method: 0
  ihdr.writeUInt8(0, 12) // interlace: 0

  const ihdrChunk = createChunk('IHDR', ihdr)
  const idatChunk = createChunk('IDAT', compressed)
  const iendChunk = createChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

// CRC32 table
const crcTable = new Int32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1)
    } else {
      c = c >>> 1
    }
  }
  crcTable[n] = c
}

function crc32(buf) {
  let c = -1
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return c ^ -1
}

// Draw brand icon
// Orange brand: #EA580C (234, 88, 12)
// Dark background: #0B0F17 (11, 15, 23)
// Accent gradient: #F97316 (249, 115, 22)
function drawBrandIcon({ width, height, setPixel }, isMaskable = false) {
  const cx = width / 2
  const cy = height / 2

  // Background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isMaskable) {
        // Maskable icon fills entire canvas with dark/brand gradient
        const t = (x + y) / (width + height)
        const r = Math.round(11 + t * 15)
        const g = Math.round(15 + t * 15)
        const b = Math.round(23 + t * 25)
        setPixel(x, y, r, g, b, 255)
      } else {
        // Transparent default for 'any'
        setPixel(x, y, 0, 0, 0, 0)
      }
    }
  }

  // Draw main rounded square for icon
  const margin = isMaskable ? Math.round(width * 0.16) : Math.round(width * 0.04)
  const boxW = width - margin * 2
  const boxH = height - margin * 2
  const radius = Math.round(boxW * 0.22)
  const left = margin
  const top = margin
  const right = left + boxW
  const bottom = top + boxH

  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      // Check rounded corner
      let inBox = true
      let dist = 0

      if (x < left + radius && y < top + radius) {
        dist = Math.hypot(x - (left + radius), y - (top + radius))
        if (dist > radius) inBox = false
      } else if (x > right - radius && y < top + radius) {
        dist = Math.hypot(x - (right - radius), y - (top + radius))
        if (dist > radius) inBox = false
      } else if (x < left + radius && y > bottom - radius) {
        dist = Math.hypot(x - (left + radius), y - (bottom - radius))
        if (dist > radius) inBox = false
      } else if (x > right - radius && y > bottom - radius) {
        dist = Math.hypot(x - (right - radius), y - (bottom - radius))
        if (dist > radius) inBox = false
      }

      if (inBox) {
        // Gradient from orange #EA580C to bright orange #F97316
        const t = (x - left) / boxW
        const r = Math.round(234 + t * 15)
        const g = Math.round(88 + t * 25)
        const b = Math.round(12 + t * 10)
        setPixel(x, y, r, g, b, 255)
      }
    }
  }

  // Draw stylized letter "M" in white inside
  const mw = Math.round(boxW * 0.52)
  const mh = Math.round(boxH * 0.44)
  const mx1 = Math.round(cx - mw / 2)
  const my1 = Math.round(cy - mh / 2)
  const stroke = Math.max(2, Math.round(width * 0.055))

  // Vertical left bar
  for (let y = my1; y < my1 + mh; y++) {
    for (let x = mx1; x < mx1 + stroke; x++) {
      setPixel(x, y, 255, 255, 255, 255)
    }
  }
  // Vertical right bar
  for (let y = my1; y < my1 + mh; y++) {
    for (let x = mx1 + mw - stroke; x < mx1 + mw; x++) {
      setPixel(x, y, 255, 255, 255, 255)
    }
  }
  // Diagonal lines to center
  const midX = cx
  const midY = my1 + mh * 0.75
  const steps = 100
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    // Left diagonal
    const px1 = mx1 + stroke / 2 + t * (midX - (mx1 + stroke / 2))
    const py1 = my1 + t * (midY - my1)
    // Right diagonal
    const px2 = mx1 + mw - stroke / 2 - t * (mx1 + mw - stroke / 2 - midX)
    const py2 = my1 + t * (midY - my1)

    for (let dy = -Math.round(stroke / 2); dy <= Math.round(stroke / 2); dy++) {
      for (let dx = -Math.round(stroke / 2); dx <= Math.round(stroke / 2); dx++) {
        setPixel(Math.round(px1 + dx), Math.round(py1 + dy), 255, 255, 255, 255)
        setPixel(Math.round(px2 + dx), Math.round(py2 + dy), 255, 255, 255, 255)
      }
    }
  }

  // Draw small "A" accent bar / star on top or dot
  const dotR = Math.max(2, Math.round(stroke * 0.6))
  const dotY = Math.round(my1 + mh + boxH * 0.12)
  for (let dy = -dotR; dy <= dotR; dy++) {
    for (let dx = -Math.round(boxW * 0.15); dx <= Math.round(boxW * 0.15); dx++) {
      setPixel(Math.round(cx + dx), Math.round(dotY + dy), 255, 255, 255, 255)
    }
  }
}

// Generate all sizes
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const ICONS_DIR = path.resolve('public/icons')

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true })
}

console.log('Generating PWA icons...')

for (const size of SIZES) {
  // Standard any icon
  const pngAny = createPng(size, size, (ctx) => drawBrandIcon(ctx, false))
  fs.writeFileSync(path.join(ICONS_DIR, `icon-${size}x${size}.png`), pngAny)

  // Maskable version
  const pngMaskable = createPng(size, size, (ctx) => drawBrandIcon(ctx, true))
  fs.writeFileSync(path.join(ICONS_DIR, `icon-${size}x${size}-maskable.png`), pngMaskable)
}

// Shortcut icons
const SHORTCUTS = ['revista', 'top60', 'eventos', 'vmoda']
for (const sc of SHORTCUTS) {
  const png = createPng(96, 96, (ctx) => drawBrandIcon(ctx, false))
  fs.writeFileSync(path.join(ICONS_DIR, `shortcut-${sc}-96x96.png`), png)
}

console.log('All icons generated successfully!')
