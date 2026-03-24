/**
 * package.json의 production dependencies에서 라이선스 정보를 추출하여
 * src/assets/data/openSourceLicenses.json을 생성합니다.
 *
 * Usage: node scripts/generate-licenses.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT = join(ROOT, 'src/assets/data/openSourceLicenses.json');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const deps = Object.entries(pkg.dependencies || {});

const result = {};

for (const [name] of deps) {
  // pnpm의 symlink 구조를 통해 package.json 직접 읽기
  const pkgJsonPath = join(ROOT, 'node_modules', name, 'package.json');
  try {
    const depPkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    const version = depPkg.version;
    const license = depPkg.license || 'UNKNOWN';

    // repository URL 정규화
    let repo = depPkg.repository?.url || depPkg.repository || '';
    repo = repo.replace(/^git\+/, '').replace(/\.git$/, '');
    // GitHub shorthand ("user/repo") → full URL
    if (repo && !repo.startsWith('http')) {
      repo = `https://github.com/${repo}`;
    }

    result[`${name}@${version}`] = {
      licenses: license,
      repository: repo,
      name,
    };
  } catch (e) {
    console.warn(`⚠ ${name}: package.json 읽기 실패 — ${e.message}`);
  }
}

writeFileSync(OUTPUT, JSON.stringify(result, null, 2) + '\n');
console.log(`✔ ${Object.keys(result).length}개 패키지 → ${OUTPUT}`);
