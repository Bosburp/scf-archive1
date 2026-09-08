import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
  .map(match => match[1])
  .join('\n');
const localScriptSources = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/g)]
  .map(match => match[1])
  .filter(src => !/^https?:\/\//i.test(src));
const localScripts = localScriptSources
  .map(src => fs.readFileSync(src, 'utf8'))
  .join('\n');

new Function(`${scripts}\n${localScripts}`);
console.log('application script syntax ok');
