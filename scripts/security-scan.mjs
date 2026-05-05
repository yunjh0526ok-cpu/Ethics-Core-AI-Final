import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const ALLOWED_EXT = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.env',
  '.example',
]);
const IGNORE_DIRS = new Set([
  '.git',
  '.vercel',
  'node_modules',
  'dist',
  'coverage',
]);

const SECRET_PATTERNS = [
  { name: 'google_api_key', regex: /AIza[0-9A-Za-z\-_]{20,}/g },
  { name: 'openai_like_key', regex: /sk-[A-Za-z0-9]{20,}/g },
  { name: 'aws_access_key', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'private_key_block', regex: /-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----/g },
  { name: 'generic_api_key_literal', regex: /\b(api[_-]?key|secret|token)\b\s*[:=]\s*['"`][^'"`\n]{8,}['"`]/gi },
];

const findings = [];

function shouldSkip(filePath) {
  if (filePath.includes('.env.example')) return true;
  if (filePath.includes('README')) return true;
  return false;
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = full.slice(ROOT.length + 1).replaceAll('\\', '/');
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!IGNORE_DIRS.has(name)) walk(full);
      continue;
    }
    const ext = extname(name);
    if (!ALLOWED_EXT.has(ext) && !name.startsWith('.env')) continue;
    if (shouldSkip(rel)) continue;
    scanFile(full, rel);
  }
}

function scanFile(full, rel) {
  const text = readFileSync(full, 'utf8');
  const lines = text.split(/\r?\n/);
  for (const { name, regex } of SECRET_PATTERNS) {
    for (const m of text.matchAll(regex)) {
      const idx = m.index ?? 0;
      const line = text.slice(0, idx).split(/\r?\n/).length;
      const preview = (lines[line - 1] || '').trim().slice(0, 160);
      findings.push({ rel, line, rule: name, preview });
    }
  }
}

walk(ROOT);

if (findings.length) {
  console.error('Secret scan failed. Potential hardcoded secrets found:\n');
  for (const f of findings) {
    console.error(`- ${f.rel}:${f.line} [${f.rule}] ${f.preview}`);
  }
  process.exit(1);
}

console.log('Secret scan passed: no hardcoded keys detected.');
