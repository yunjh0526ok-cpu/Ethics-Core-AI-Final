import * as pdfjs from 'pdfjs-dist';
// Vite: worker 번들 URL 주입
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured) return;
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
  workerConfigured = true;
}

export async function extractPdfText(file: File, maxPages = 40): Promise<string> {
  ensurePdfWorker();
  const data = new Uint8Array(await file.arrayBuffer());
  const loading = pdfjs.getDocument({ data, stopAtErrors: true });
  const pdf = await loading.promise;
  const n = Math.min(pdf.numPages, maxPages);
  const parts: string[] = [];
  for (let p = 1; p <= n; p += 1) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const line = tc.items
      .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
      .join(' ');
    parts.push(line);
  }
  return parts.join('\n').replace(/\s+/g, ' ').trim();
}

export type ExtractedChunk = { name: string; text: string; error?: string };

/**
 * 리포트용 파일에서 클라이언트가 읽을 수 있는 텍스트를 모읍니다.
 * PDF는 pdf.js로, txt/md는 File.text()로 처리합니다.
 */
export async function extractTextFromReportFiles(files: File[]): Promise<{ corpus: string; chunks: ExtractedChunk[] }> {
  const chunks: ExtractedChunk[] = [];
  for (const f of files) {
    const lower = f.name.toLowerCase();
    if (lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.markdown')) {
      try {
        const text = (await f.text()).trim();
        chunks.push({ name: f.name, text: text.slice(0, 200_000) });
      } catch {
        chunks.push({ name: f.name, text: '', error: 'read_fail' });
      }
      continue;
    }
    if (lower.endsWith('.pdf') || f.type === 'application/pdf') {
      try {
        const text = await extractPdfText(f);
        chunks.push({ name: f.name, text: text.slice(0, 200_000) });
      } catch {
        chunks.push({ name: f.name, text: '', error: 'pdf_extract_fail' });
      }
      continue;
    }
    // 이미지 등: 텍스트 없음 (모델 멀티모달 경로에서만 해석)
    chunks.push({ name: f.name, text: '', error: 'no_client_text' });
  }
  const corpus = chunks
    .filter((c) => c.text.length > 0)
    .map((c) => `[${c.name}]\n${c.text}`)
    .join('\n\n');
  return { corpus, chunks };
}
