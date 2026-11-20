// Extrai as imagens (FlateDecode) embutidas no PDF do design para PNG.
// Uso: node scripts/extrair-imagens-pdf.mjs <arquivo.pdf> <pasta-saida>
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import sharp from 'sharp';

const [pdfPath, outDir] = process.argv.slice(2);
if (!pdfPath || !outDir) {
  console.error('Uso: node scripts/extrair-imagens-pdf.mjs <arquivo.pdf> <pasta-saida>');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const buf = fs.readFileSync(pdfPath);
const bin = buf.toString('latin1');
const objRe = /(\d+) 0 obj\s*<<([\s\S]*?)>>\s*stream\r?\n/g;
let m;
let n = 0;
while ((m = objRe.exec(bin))) {
  const dict = m[2];
  if (!/\/Subtype\s*\/Image/.test(dict)) continue;
  const width = +dict.match(/\/Width\s+(\d+)/)[1];
  const height = +dict.match(/\/Height\s+(\d+)/)[1];
  const bpc = +(dict.match(/\/BitsPerComponent\s+(\d+)/)?.[1] ?? 8);
  const cs = dict.match(/\/ColorSpace\s*\/(\w+)/)?.[1] ?? 'DeviceRGB';
  const channels = cs === 'DeviceGray' ? 1 : cs === 'DeviceCMYK' ? 4 : 3;
  const start = m.index + m[0].length;
  const end = bin.indexOf('endstream', start);
  let data;
  try {
    data = zlib.inflateSync(buf.subarray(start, end));
  } catch {
    console.warn(`obj ${m[1]}: não foi possível descomprimir`);
    continue;
  }
  if (bpc !== 8) {
    console.warn(`obj ${m[1]}: ${bpc} bits por componente não suportado`);
    continue;
  }
  // Remove o preditor PNG por linha, se houver (1 byte de filtro + linha)
  const rowLen = width * channels;
  if (data.length === (rowLen + 1) * height) {
    const out = Buffer.alloc(rowLen * height);
    for (let y = 0; y < height; y++) {
      const f = data[y * (rowLen + 1)];
      for (let x = 0; x < rowLen; x++) {
        const raw = data[y * (rowLen + 1) + 1 + x];
        const a = x >= channels ? out[y * rowLen + x - channels] : 0;
        const b = y > 0 ? out[(y - 1) * rowLen + x] : 0;
        const c = x >= channels && y > 0 ? out[(y - 1) * rowLen + x - channels] : 0;
        let v;
        if (f === 0) v = raw;
        else if (f === 1) v = raw + a;
        else if (f === 2) v = raw + b;
        else if (f === 3) v = raw + ((a + b) >> 1);
        else {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = raw + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
        }
        out[y * rowLen + x] = v & 0xff;
      }
    }
    data = out;
  }
  if (data.length !== rowLen * height) {
    console.warn(`obj ${m[1]}: tamanho inesperado (${data.length})`);
    continue;
  }
  const file = path.join(outDir, `obj${m[1]}_${width}x${height}.png`);
  await sharp(data, { raw: { width, height, channels } }).png().toFile(file);
  console.log(file);
  n++;
}
console.log(`${n} imagens extraídas`);
