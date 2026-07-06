#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'presenter');

const DOCS = [
  { src: 'slides/DEMO-WALK.md', dest: 'DEMO-WALK.md' },
  { src: 'slides/TELCO-LANDSCAPE-2026-REFERENCE.md', dest: 'TELCO-LANDSCAPE-2026-REFERENCE.md' },
];

fs.mkdirSync(outDir, { recursive: true });

for (const { src, dest } of DOCS) {
  const from = path.join(root, src);
  if (!fs.existsSync(from)) {
    console.warn(`[presenter] skip missing ${src}`);
    continue;
  }
  let text = fs.readFileSync(from, 'utf8');
  text = text.replace(
    /\(\.\/TELCO-LANDSCAPE-2026-REFERENCE\.md\)/g,
    '(/presenter/view.html?doc=landscape)',
  );
  fs.writeFileSync(path.join(outDir, dest), text);
  console.log(`[presenter] ${dest}`);
}
