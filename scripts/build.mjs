import { cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const entry of ['index.html', 'src', 'docs', 'README.md']) {
  await cp(entry, `dist/${entry}`, { recursive: true });
}
console.log('Static WebXR app copied to dist/');
