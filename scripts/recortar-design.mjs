// Recorta banners, categorias, fotos e mascote das telas extraídas do PDF do design.
// Uso: node scripts/recortar-design.mjs <pasta-com-pngs-extraidos> <pasta-saida>
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const [srcDir, outDir] = process.argv.slice(2);
if (!srcDir || !outDir) {
  console.error('Uso: node scripts/recortar-design.mjs <pasta-com-pngs-extraidos> <pasta-saida>');
  process.exit(1);
}

const telas = {
  verao: 'obj20_776x731.png',
  home: 'obj17_810x1440.png',
  vitrine: 'obj22_766x1280.png',
  vmais: 'obj26_939x1599.png',
  chat: 'obj40_810x1440.png',
};

// [tela, arquivo de saída, left, top, width, height, áreas a pintar de branco (relativas ao recorte)]
const recortes = [
  ['verao', 'banners/verao-com-voce.jpg', 8, 8, 760, 490],
  ['home', 'banners/mais-amada-do-rio.jpg', 20, 136, 770, 288],
  ['home', 'banners/cuide-da-sua-pele.jpg', 20, 862, 770, 208],
  ['vmais', 'banners/venancio-mais.jpg', 28, 412, 883, 323],

  ['verao', 'categorias/protetor-solar.png', 35, 587, 86, 86],
  ['verao', 'categorias/skincare.png', 157, 587, 86, 86],
  ['verao', 'categorias/dermocosmeticos.png', 280, 587, 86, 86],
  ['verao', 'categorias/vitaminas.png', 403, 587, 86, 86],
  ['verao', 'categorias/cabelos.png', 525, 587, 86, 86],
  ['verao', 'categorias/cuidados-pessoais.png', 650, 587, 86, 86],
  ['home', 'categorias/medicamentos.png', 356, 550, 104, 104],
  ['home', 'categorias/bebe.png', 200, 700, 104, 104],

  ['home', 'produtos/vichy-liftactiv.jpg', 27, 1140, 182, 118, [[122, 0, 60, 36]]],
  ['home', 'produtos/anthelios-fps50.jpg', 223, 1140, 182, 118, [[124, 0, 58, 36]]],
  ['home', 'produtos/dorflex-36.jpg', 419, 1140, 182, 118, [[119, 0, 63, 36]]],
  ['home', 'produtos/centrum-mulher.jpg', 615, 1140, 182, 118, [[119, 0, 63, 36]]],
  ['vitrine', 'produtos/anthelios-uvmune.jpg', 20, 462, 356, 248],
  ['vitrine', 'produtos/kit-verao.jpg', 391, 462, 355, 248],
  ['vitrine', 'produtos/nivea-pos-sol.jpg', 20, 860, 356, 230],
  ['vitrine', 'produtos/kit-coreano.jpg', 391, 860, 355, 230],

  ['vmais', 'experiencias/consulta-dermatologica.jpg', 33, 823, 297, 155],
  ['vmais', 'experiencias/derm-scan.jpg', 349, 823, 292, 155],
  ['vmais', 'experiencias/dermoconsultoria.jpg', 659, 823, 266, 155],
  ['vmais', 'resgate/protetor-la-roche.jpg', 33, 1224, 205, 168],
  ['vmais', 'resgate/serum-neutrogena.jpg', 257, 1224, 204, 168],
  ['vmais', 'resgate/kit-anua.jpg', 480, 1224, 204, 168],
  ['vmais', 'resgate/pos-sol-nivea.jpg', 703, 1224, 205, 168],

  ['chat', 'vini/avatar.png', 34, 180, 132, 132],
  ['chat', 'vini/acenando.png', 54, 1058, 150, 136],
];

for (const [tela, saida, left, top, width, height, brancos = []] of recortes) {
  const destino = path.join(outDir, saida);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  let img = sharp(path.join(srcDir, telas[tela])).extract({ left, top, width, height });
  if (brancos.length) {
    const buf = await img.png().toBuffer();
    img = sharp(buf).composite(
      brancos.map(([x, y, w, h]) => ({
        input: { create: { width: w, height: h, channels: 3, background: '#ffffff' } },
        left: x,
        top: y,
      })),
    );
  }
  img = saida.endsWith('.png') ? img.png() : img.jpeg({ quality: 88 });
  await img.toFile(destino);
  console.log(destino);
}
