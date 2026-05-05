import JSZip from 'jszip';

const MORPH_BLOCK = '<p:transition spd="med"><p:morph/></p:transition>';

function slidePaths(zip: JSZip): string[] {
  return Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/i.test(p))
    .sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, ''), 10);
      const nb = parseInt(b.replace(/\D/g, ''), 10);
      return na - nb;
    });
}

/**
 * PptxGenJS는 슬라이드 전환 API가 없어, OOXML에 Morph 블록을 삽입한다.
 * PowerPoint 2019/365에서 슬라이드 전환으로 Morph가 지정된다.
 */
export async function injectMorphIntoPptx(input: ArrayBuffer): Promise<ArrayBuffer> {
  const zip = await JSZip.loadAsync(input);
  for (const path of slidePaths(zip)) {
    const file = zip.file(path);
    if (!file) continue;
    let xml = await file.async('string');
    if (xml.includes('<p:transition') || xml.includes('<p:morph')) continue;
    if (!xml.includes('</p:sld>')) continue;
    xml = xml.replace(/<\/p:sld>/, `${MORPH_BLOCK}</p:sld>`);
    zip.file(path, xml);
  }
  return await zip.generateAsync({ type: 'arraybuffer' });
}
