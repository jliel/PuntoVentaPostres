import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function createPng(width, height, r, g, b) {
  // 8 bytes PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(2, 9); // color type 2 (RGB)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image scanlines (filter byte 0 + RGB pixels)
  // Let's create an attractive colorful gradient with a rounded badge aesthetic
  const rowLen = 1 + width * 3;
  const rawData = Buffer.alloc(rowLen * height);
  const cx = width / 2;
  const cy = height / 2;
  const maxR = width * 0.45;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Warm vibrant coral/tangerine to gold gradient background
      const t = (x + y) / (width + height);
      let pr = Math.round(255 * (1 - t * 0.2));
      let pg = Math.round(107 + t * 60);
      let pb = Math.round(53 + t * 30);

      // Center circle emblem
      if (dist < maxR * 0.7) {
        // Bright interior
        pr = 255;
        pg = 245;
        pb = 230;
      }
      if (dist < maxR * 0.55 && dist > maxR * 0.25 && dy > -maxR * 0.2) {
        // Shopping tote / smile shape in warm coral
        pr = 255;
        pg = 107;
        pb = 53;
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcTarget = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(crcTarget), 8 + len);
  return buf;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 255, 107, 53));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 255, 107, 53));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 255, 107, 53));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 255, 107, 53));
console.log('PNG icons created successfully in /public');
