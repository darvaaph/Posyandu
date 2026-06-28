/**
 * Generate PWA icons (PNG) tanpa dependensi eksternal.
 * Jalankan: node scripts/generate-icons.mjs
 */
import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ── CRC32 ──────────────────────────────────────────────────────────────────
const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) | 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

// ── PNG generator ──────────────────────────────────────────────────────────
function createIcon(size) {
  const BG = [0x16, 0xa3, 0x4a]; // #16a34a hijau posyandu
  const FG = [0xff, 0xff, 0xff]; // putih
  const cx = size / 2;
  const cy = size / 2;
  const arm = size * 0.1;  // setengah lebar lengan palang
  const pad = size * 0.22; // jarak palang dari tepi

  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = [0]; // filter byte (None)
    for (let x = 0; x < size; x++) {
      const inV = Math.abs(x - cx) <= arm && y >= pad && y <= size - pad;
      const inH = Math.abs(y - cy) <= arm && x >= pad && x <= size - pad;
      const px = inV || inH ? FG : BG;
      row.push(px[0], px[1], px[2]);
    }
    rows.push(...row);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.from(rows), { level: 6 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Run ────────────────────────────────────────────────────────────────────
const out = join(ROOT, "public", "icons");
if (!existsSync(out)) mkdirSync(out, { recursive: true });

for (const size of [192, 512]) {
  writeFileSync(join(out, `icon-${size}.png`), createIcon(size));
  console.log(`✓ icon-${size}.png`);
}
console.log("Done.");
