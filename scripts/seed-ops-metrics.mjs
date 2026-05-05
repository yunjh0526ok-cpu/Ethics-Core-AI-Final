/**
 * ethics_ops DB에 샘플 users·logs 삽입 (대시보드 숫자 확인용).
 * 사용: .env에 MONGODB_URI 설정 후 `npm run seed:ops`
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadDotEnv() {
  const p = resolve(process.cwd(), '.env');
  if (!existsSync(p)) return;
  const raw = readFileSync(p, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env) || process.env[k] === '') process.env[k] = v;
  }
}

loadDotEnv();

const APPS = ['ethics_core_ai', 'lexguard', 'logos_web'];

async function main() {
  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) {
    console.error('[seed:ops] MONGODB_URI가 비어 있습니다. .env를 확인하세요.');
    process.exit(1);
  }
  const dbName = (process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || 'ethics_ops').trim();
  const { MongoClient } = await import('mongodb');

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const now = new Date();
  const recent = new Date(now.getTime() - 5 * 60 * 1000);

  try {
    for (const app of APPS) {
      await db.collection('users').deleteMany({ app, _seed: true });
      await db.collection('logs').deleteMany({ app, _seed: true });

      const users = [
        { app, email: `${app}_u1@seed.local`, lastSeenAt: now, updatedAt: now, _seed: true },
        { app, email: `${app}_u2@seed.local`, lastSeenAt: recent, updatedAt: recent, _seed: true },
        { app, email: `${app}_u3@seed.local`, _seed: true },
      ];
      await db.collection('users').insertMany(users);

      const logs = [
        { app, createdAt: now, level: 'info', msg: 'ok', _seed: true },
        { app, createdAt: now, level: 'error', msg: 'sample', _seed: true },
      ];
      await db.collection('logs').insertMany(logs);
    }
    console.log(`[seed:ops] 완료: db=${dbName}, 앱별 users·logs 샘플 3종 삽입`);
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error('[seed:ops]', e);
  process.exit(1);
});
